// =================================================================
// SETUP (WITH NEW v2 IMPORTS)
// =================================================================
// NOTE: Removed duplicate SETUP block comment.
// IMPORTANT: If you are still getting local deployment errors (ReferenceError or ERR_PACKAGE_PATH_NOT_EXPORTED),
// you might need to manually apply the symlink or direct copy workaround as discussed.
// The import paths below are the officially correct v2 paths.
const { onObjectFinalized } = require("firebase-functions/v2/storage");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { logger } = require("firebase-functions");
const fetch = require("node-fetch");
const cheerio = require("cheerio"); // Still needed for Knowledge Base Updater
const { TextToSpeechClient } = require('@google-cloud/text-to-speech');
const csv = require('csv-parser');
const { Storage } = require('@google-cloud/storage');

admin.initializeApp();
const firestore = admin.firestore();
const ttsClient = new TextToSpeechClient();
const gcsClient = new Storage();

// =================================================================
// CONFIGURATION
// =================================================================
const PROJECT_ID = "project-kisan-new";
const BUCKET_NAME = "project-kisan-new.firebasestorage.app";
const LOCATION = "asia-south1";

// =================================================================
// KAGGLE DATASET CONFIGURATION
// =================================================================
const KAGGLE_CSV_CONFIG = {
    gcsFolder: "kaggle-mandi-data", // Folder in your GCS bucket where you uploaded the CSVs
    csvColumnMapping: {
        // EXACT COLUMN HEADERS FROM YOUR CSV FILES (based on image provided)
        stateName: "State Name",
        districtName: "District Name",
        marketName: "Market Name",
        variety: "Variety",
        group: "Group", // This is the commodity/crop name in the CSV data
        arrivals: "Arrivals (Tonnes)",
        minPrice: "Min Price (Rs./Quintal)",
        maxPrice: "Max Price (Rs./Quintal)",
        modalPrice: "Modal Price (Rs./Quintal)",
        reportedDate: "Reported Date", // The date column
    },
    // The exact date format from your CSV files for parsing: "DD Mon YYYY"
    csvDateFormat: "DD Mon YYYY", 
};

// =================================================================
// FUNCTION 1: CROP DOCTOR (ANALYZE PLANT IMAGE) - v2 SYNTAX
// =================================================================
exports.analyzePlantImage = onObjectFinalized(
    {
        region: LOCATION,
        timeoutSeconds: 300,
        memory: "2GiB" // v2 syntax for memory
    },
    async (event) => {
        const { name: filePath, bucket: bucketName, contentType } = event.data;

        logger.info(`[Function Start] Received object event. FilePath: "${filePath}", ContentType: "${contentType}", Bucket: "${bucketName}"`);

        if (!filePath || !filePath.startsWith("uploads/")) { 
            logger.warn(`[Function Skip] File "${filePath}" ignored: not in "uploads/" directory or no name.`);
            return;
        }

        let apiEndpoint; // Declare here for broader scope
        
        try {
            logger.info("[Auth] Fetching service account token from metadata server...");
            const tokenResponse = await fetch("http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token", { headers: { "Metadata-Flavor": "Google" } });
            
            if (!tokenResponse.ok) { 
                const errorText = await tokenResponse.text();
                logger.error(`[Auth Error] Failed to fetch token. Status: ${tokenResponse.status}, Response: ${errorText}`);
                throw new Error(`Failed to fetch access token: ${tokenResponse.statusText}`);
            }

            const tokenData = await tokenResponse.json();
            const accessToken = tokenData.access_token;
            logger.info(`[Auth] Access token fetched. Token expires in: ${tokenData.expires_in}s`);

            // --- HIGHLIGHTED CHANGE: Update to Gemini 2.5 Pro model ---
            apiEndpoint = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/gemini-1.5-pro-002:generateContent`;

            // --- HIGHLIGHTED CHANGE: Advanced Prompt for Object Category and English-Only Output ---
            const diagnosisPrompt = `You are a world-class AI agronomist for Indian farmers. Your primary task is to determine if the image contains a plant or plant part. If it does, then proceed with plant identification and diagnosis.

A CRITICAL part of your task is to correctly identify when a plant is HEALTHY. Do not guess a disease if the visual evidence is not clear.

If the image clearly DOES NOT contain a plant (e.g., it's a household item, animal, human, or unrelated object), you MUST classify it as 'Non-Plant Object'.

Respond ONLY with a single, valid JSON object using the exact structure and keys below. All responses must be in English.

{
  "object_category": "Your classification: 'Plant' if it's clearly a plant or plant part, 'Non-Plant Object' if it's not a plant, 'Ambiguous/Unclear' if you cannot determine.",
  "plant_type": "If object_category is 'Plant', provide your best guess for the plant's common English name. If you cannot identify it, MUST be 'Unknown Plant'. If object_category is 'Non-Plant Object' or 'Ambiguous/Unclear', MUST be 'N/A'.",
  "diagnosis_status": "If object_category is 'Plant', then 'Healthy' or 'Diseased'. If object_category is 'Non-Plant Object' or 'Ambiguous/Unclear', MUST be 'N/A'.",
  "disease_name_english": "If diagnosis_status is 'Diseased' and object_category is 'Plant', provide the common English name of the disease. Otherwise, MUST be 'N/A'.",
  "confidence_score": "A numerical score from 0.0 to 1.0 for the overall assessment. If healthy, MUST be 1.0. If object_category is 'Non-Plant Object' or 'Ambiguous/Unclear', use a score that reflects your certainty of that classification (e.g., 1.0 for clear non-plant).",
  "severity": "If object_category is 'Plant' and diagnosis_status is 'Diseased', rate as 'Low', 'Medium', or 'High'. If 'Healthy' or not 'Plant', MUST be 'None'.",
  "contagion_risk": "If object_category is 'Plant' and diagnosis_status is 'Diseased', rate as 'Low', 'Medium', or 'High'. If 'Healthy' or not 'Plant', MUST be 'None'.",
  "description_english": "If object_category is 'Plant', a brief, one-sentence description of its state. If healthy, provide a positive message. If not 'Plant', provide a brief description of what the object is. If 'Ambiguous/Unclear', state why. All in English.",
  "organic_remedy_english": "If object_category is 'Plant' and diagnosis_status is 'Diseased', a step-by-step organic remedy in English. If 'Healthy' or not 'Plant', MUST be 'N/A'.",
  "chemical_remedy_english": "If object_category is 'Plant' and diagnosis_status is 'Diseased', a step-by-step chemical remedy in English. If 'Healthy' or not 'Plant', MUST be 'N/A'.",
  "prevention_tips_english": ["If object_category is 'Plant', an array of strings with 2-3 bullet points on how to prevent this issue. If 'Healthy', suggest continued good care. If not 'Plant', MUST be an empty array []."]
}`;
            
           
            const requestBody = { 
                contents: [{ 
                    role: "user",
                    parts: [
                        { file_data: { mime_type: contentType, file_uri: `gs://${bucketName}/${filePath}` } }, 
                        { text: diagnosisPrompt }
                    ] 
                }] 
            };
            logger.info("[AI] Sending request to Gemini API...");
            const geminiResponse = await fetch(apiEndpoint, { method: "POST", headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }, body: JSON.stringify(requestBody) });
            const responseData = await geminiResponse.json();
            logger.info("Full Diagnosis Response:", JSON.stringify(responseData, null, 2));

            const modelResponseText = responseData?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!modelResponseText) { 
                logger.error("[Gemini Error] Did not receive a valid diagnosis from the AI. Full Response:", JSON.stringify(responseData, null, 2));
                throw new Error("Did not receive a valid diagnosis from the AI."); 
            }
            const diagnosisData = JSON.parse(modelResponseText.replace(/^```json\s*|```\s*$/g, ""));
            logger.info("Diagnosis received:", diagnosisData);

            // --- HIGHLIGHTED CHANGE: Text-to-Speech Generation adapted for Object Category and English ---
            let textToSpeak = "";
            if (diagnosisData.object_category === "Plant") {
                textToSpeak = `Plant Type: ${diagnosisData.plant_type}. Diagnosis: ${diagnosisData.diagnosis_status}. Disease: ${diagnosisData.disease_name_english}. Description: ${diagnosisData.description_english}. Organic Remedy: ${diagnosisData.organic_remedy_english}.`;
            } else if (diagnosisData.object_category === "Non-Plant Object") {
                textToSpeak = `This appears to be a non-plant object. Description: ${diagnosisData.description_english}. Please upload an image of a plant for diagnosis.`;
            } else { // Ambiguous/Unclear
                textToSpeak = `The object in the image is ambiguous or unclear. Description: ${diagnosisData.description_english}. Please ensure the image clearly shows a plant.`;
            }
            
            // Change the TTS voice to an English one
            const ttsRequest = { 
                input: { text: textToSpeak }, 
                voice: { languageCode: 'en-US', name: 'en-US-Wavenet-A' }, // Example: US English Wavenet voice
                audioConfig: { audioEncoding: 'MP3' } 
            };
            
            logger.info(`[TTS] Synthesizing speech for: "${textToSpeak.substring(0, Math.min(textToSpeak.length, 100))}..."`);
            const [ttsResponse] = await ttsClient.synthesizeSpeech(ttsRequest);
            logger.info(`[TTS] Speech synthesis successful. Audio content length: ${ttsResponse.audioContent.length} bytes.`);


            // --- THIS IS THE NEW, CORRECTED BLOCK ---

        // 1. Get the full filename from the path. This is what the frontend uses as the document ID.
        const diagnosisId = filePath.split('/').pop();
        if (!diagnosisId) {
            logger.error(`Could not extract filename (diagnosisId) from path: ${filePath}. Aborting.`);
            return;
        }

        // 2. Create a base name for the AUDIO file by removing the original image extension.
        const baseFileNameForAudio = diagnosisId.replace(/\.[^/.]+$/, "");
        const audioFileName = `${baseFileNameForAudio}.mp3`;

        logger.info(`[AudioFile] Attempting to save audio to: audio-output/${audioFileName}`);
        const audioFile = admin.storage().bucket(bucketName).file(`audio-output/${audioFileName}`);
        await audioFile.save(ttsResponse.audioContent);
        await audioFile.makePublic();
        const audioUrl = audioFile.publicUrl();
        logger.info(`[AudioFile] Audio file created: ${audioUrl}`);

        // 3. Add the audio URL to the data payload.
        diagnosisData.audio_remedy_url = audioUrl;

        // 4. Use the CORRECT diagnosisId (with the file extension) to write to Firestore.
        await firestore.collection("diagnoses").doc(diagnosisId).set(diagnosisData);
        logger.info(`[Firestore] Successfully wrote complete diagnosis with audio to Firestore (ID: ${diagnosisId}).`);
        } catch (error) {
            logger.error(`!!! CRITICAL ERROR in analysis for file "${filePath}":`, error, { structuredData: true });
        }
    }
);

// =================================================================
// HIGHLIGHTED CHANGE: FUNCTION 2: PROACTIVE MARKET ANALYST (Kaggle CSV Ingestion)
// =================================================================
// This function will iterate through all CSVs in the specified GCS folder
// and ingest them into Firestore. It's intended for a bulk, one-time operation
// to populate historical data.
exports.proactiveMarketAnalyst = onSchedule(
    {
        schedule: "every day 08:00",
        timeZone: "Asia/Kolkata",
        region: LOCATION,
        // --- THESE ARE THE INCREASED LIMITS ---
        timeoutSeconds: 3600, // 1 hour
        memory: "4GiB"       // 4 Gigabytes
    },
    async (event) => {
        logger.info("[Market Analyst - Ingestion] Starting Kaggle CSV data ingestion.");

        const bucket = gcsClient.bucket(BUCKET_NAME);
        // List all files in the configured GCS folder
        const [files] = await bucket.getFiles({ prefix: `${KAGGLE_CSV_CONFIG.gcsFolder}/` });

        if (files.length === 0) {
            logger.warn(`[Market Analyst - Ingestion] No CSV files found in gs://${BUCKET_NAME}/${KAGGLE_CSV_CONFIG.gcsFolder}/. Skipping ingestion.`);
            return;
        }

        let ingestedCount = 0;
        let errorCount = 0;

        for (const file of files) {
            // Only process CSV files
            if (!file.name.endsWith('.csv')) {
                logger.info(`[Market Analyst - Ingestion] Skipping non-CSV file: ${file.name}`);
                continue;
            }

            // --- HIGHLIGHTED CHANGE: Derive cropName from filename ---
            // Example: "kaggle-mandi-data/Dry Chillies.csv" -> "Dry Chillies"
            const fileNameWithoutExtension = file.name.split('/').pop().replace(/\.csv$/, '');
            const cropName = fileNameWithoutExtension.trim(); // This is the commodity/crop name for Firestore

            logger.info(`[Market Analyst - Ingestion] Processing file: ${file.name} for crop: "${cropName}"`);
            
            try {
                const stream = file.createReadStream();
                const records = [];

                // Using Promise to await the stream processing
                await new Promise((resolve, reject) => {
                    stream
                        .pipe(csv()) // Use csv-parser to parse CSV data
                        .on('data', (data) => records.push(data))
                        .on('end', async () => {
                            logger.info(`[Market Analyst - Ingestion] Found ${records.length} records in ${file.name}.`);
                            
                            // Process records in batches for Firestore
                            const batchSize = 400; // Max 500 writes per batch for Firestore batches
                            for (let i = 0; i < records.length; i += batchSize) {
                                const batch = firestore.batch();
                                const currentBatchRecords = records.slice(i, i + batchSize);

                                for (const record of currentBatchRecords) {
                                    // HIGHLIGHTED CHANGE: Map CSV columns to standardized Firestore fields
                                    // Using KAGGLE_CSV_CONFIG.csvColumnMapping for exact header names
                                    const stateName = record[KAGGLE_CSV_CONFIG.csvColumnMapping.stateName];
                                    const districtName = record[KAGGLE_CSV_CONFIG.csvColumnMapping.districtName];
                                    const marketName = record[KAGGLE_CSV_CONFIG.csvColumnMapping.marketName];
                                    const dateRaw = record[KAGGLE_CSV_CONFIG.csvColumnMapping.reportedDate]; 
                                    const modalPriceRaw = record[KAGGLE_CSV_CONFIG.csvColumnMapping.modalPrice];
                                    const minPriceRaw = record[KAGGLE_CSV_CONFIG.csvColumnMapping.minPrice];
                                    const maxPriceRaw = record[KAGGLE_CSV_CONFIG.csvColumnMapping.maxPrice];
                                    const arrivalsRaw = record[KAGGLE_CSV_CONFIG.csvColumnMapping.arrivals];
                                    const varietyName = record[KAGGLE_CSV_CONFIG.csvColumnMapping.variety];
                                    const groupInCsv = record[KAGGLE_CSV_CONFIG.csvColumnMapping.group]; 

                                    // --- HIGHLIGHTED CHANGE: Date Parsing for "DD Mon YYYY" ---
                                    let dateFormatted = null;
                                    try {
                                        // JavaScript's Date constructor can often parse "DD Mon YYYY" (e.g., "09 Feb 2006")
                                        const parsedDate = new Date(dateRaw);
                                        if (!isNaN(parsedDate.getTime())) { // Check if the parsed date is valid
                                            dateFormatted = parsedDate.toISOString().slice(0, 10); // Convert to YYYY-MM-DD format
                                        } else {
                                            logger.warn(`[Market Analyst - Ingestion Warning] Invalid date format "${dateRaw}" in file ${file.name}. Skipping record: ${JSON.stringify(record)}`);
                                            continue; // Skip record if date is invalid
                                        }
                                    } catch (e) {
                                        logger.warn(`[Market Analyst - Ingestion Warning] Error parsing date "${dateRaw}" in file ${file.name}: ${e.message}. Skipping record: ${JSON.stringify(record)}`);
                                        continue;
                                    }

                                    // Parse price and arrivals data, defaulting to 0 if null/empty/invalid
                                    const modalPrice = parseFloat(modalPriceRaw || 0); 
                                    const minPrice = parseFloat(minPriceRaw || 0);
                                    const maxPrice = parseFloat(maxPriceRaw || 0);
                                    const arrivals = parseFloat(arrivalsRaw || 0);

                                    // Basic validation for critical fields before writing to Firestore
                                    if (!cropName || !stateName || !marketName || !dateFormatted || isNaN(modalPrice) || modalPrice <= 0) {
                                        logger.warn(`[Market Analyst - Ingestion Warning] Skipping incomplete/invalid record for "${cropName}" in ${file.name}: ${JSON.stringify(record)}`);
                                        continue;
                                    }

                                    // Create slugs for Firestore document IDs
                                    const cropSlug = String(cropName).toLowerCase().replace(/\s+/g, '-');
                                    const stateSlug = String(stateName).toLowerCase().replace(/\s+/g, '-');
                                    const marketSlug = String(marketName).toLowerCase().replace(/\s+/g, '-');

                                    // --- HIGHLIGHTED CHANGE: Firestore Document ID uses crop_market_state for uniqueness ---
                                    const firestoreDocId = `${cropSlug}_${marketSlug}_${stateSlug}`; 
                                    
                                    const marketData = {
                                        crop_name: cropName, // Derived from filename
                                        market_name: marketName,
                                        district_name: districtName, 
                                        state_name: stateName,
                                        variety: varietyName, // Store variety
                                        group_in_csv: groupInCsv, // Store the 'Group' field from CSV (e.g., "Spices")
                                        date: dateFormatted, // Standardized date (YYYY-MM-DD)
                                        price_modal: modalPrice,
                                        price_min: minPrice,
                                        price_max: maxPrice,
                                        arrival_quantity_tonnes: arrivals,
                                        price_unit: "Rs./Quintal", // Explicitly state unit
                                        source_file: file.name, // Track source CSV file
                                        ingested_at: admin.firestore.FieldValue.serverTimestamp(),
                                    };

                                    // Reference to the main document for this crop/market/state
                                    const docRef = firestore.collection("market_prices").doc(firestoreDocId);
                                    // Reference to the daily historical record within the subcollection
                                    const historicalDocRef = docRef.collection("historical_prices").doc(dateFormatted); 

                                    // Add the daily record to the batch
                                    batch.set(historicalDocRef, marketData);
                                    
                                    // IMPORTANT for bulk ingestion:
                                    // We are NOT updating a `latest_summary` in the parent document inside this loop.
                                    // Doing so for every record in a batch would be inefficient and might cause contention.
                                    // The `getMarketAnalysis` function will find the latest price by querying `historical_prices`.
                                }
                                // Commit the batch of writes to Firestore
                                await batch.commit();
                                ingestedCount += currentBatchRecords.length;
                                logger.info(`[Market Analyst - Ingestion] Batch committed for ${file.name}, records processed: ${ingestedCount}.`);
                            }
                            resolve(); // Resolve the promise once all data from the file is processed
                        })
                        .on('error', (err) => {
                            logger.error(`[Market Analyst - Ingestion Error] Error reading CSV file ${file.name}:`, err);
                            errorCount++;
                            reject(err); // Reject the promise on stream error
                        });
                });
            } catch (err) {
                logger.error(`[Market Analyst - Ingestion Error] Failed to process CSV file ${file.name}:`, err, { structuredData: true });
                errorCount++;
            }
        }
        logger.info(`[Market Analyst - Ingestion] Kaggle CSV data ingestion completed. Total ingested: ${ingestedCount}, Errors: ${errorCount}.`);
    }
);

// =================================================================
// HIGHLIGHTED CHANGE: New HTTP-triggered function for On-Demand Market Analysis (Function 4)
// =================================================================
exports.getMarketAnalysis = onRequest(
    {
        region: LOCATION,
        timeoutSeconds: 60, 
        memory: "1GiB" 
    },
    async (request, response) => {
        response.set('Access-Control-Allow-Origin', '*'); 
        if (request.method === 'OPTIONS') {
            response.set('Access-Control-Allow-Methods', 'GET, POST');
            response.set('Access-Control-Allow-Headers', 'Content-Type');
            response.status(204).send('');
            return;
        }

        const cropName = request.query.cropName || request.body.cropName;
        const stateName = request.query.stateName || request.body.stateName;
        const marketName = request.query.marketName || request.body.marketName; 

        logger.info(`[Market Analysis - OnDemand] Received request for Crop: "${cropName}", State: "${stateName}", Market: "${marketName || 'any'}"`);

        if (!cropName || !stateName || !marketName) {
            response.status(400).json({ error: "Missing 'cropName', 'stateName', or 'marketName' in request. All are now required for specific lookup." });
            return;
        }

        const cropSlug = String(cropName).toLowerCase().replace(/\s+/g, '-');
        const stateSlug = String(stateName).toLowerCase().replace(/\s+/g, '-');
        const marketSlug = String(marketName).toLowerCase().replace(/\s+/g, '-');
        
        const firestoreDocId = `${cropSlug}_${marketSlug}_${stateSlug}`;

        const today = new Date();
        const todayStr = today.toISOString().slice(0, 10);
        
        const ninetyDaysAgo = new Date(today);
        ninetyDaysAgo.setDate(today.getDate() - 90); 
        const ninetyDaysAgoStr = ninetyDaysAgo.toISOString().slice(0, 10);

        const lastYearStart = new Date(today);
        lastYearStart.setFullYear(today.getFullYear() - 1);
        lastYearStart.setDate(today.getDate() - 90); 
        const lastYearStartStr = lastYearStart.toISOString().slice(0, 10);

        const lastYearEnd = new Date(today);
        lastYearEnd.setFullYear(today.getFullYear() - 1);
        const lastYearEndStr = lastYearEnd.toISOString().slice(0, 10);

        let allRelevantData = []; 
        let dataCompleteness = "Complete"; 

        try {
            const historicalPricesRef = firestore.collection("market_prices").doc(firestoreDocId).collection("historical_prices");
            
            const currentPeriodSnapshot = await historicalPricesRef
                .where('date', '>=', ninetyDaysAgoStr) 
                .orderBy('date', 'asc')
                .get();
            allRelevantData = currentPeriodSnapshot.docs.map(doc => doc.data());
            
            if (allRelevantData.length === 0 || new Date(allRelevantData[0].date).getFullYear() > today.getFullYear() - 1) {
                 const lastYearSnapshot = await historicalPricesRef
                    .where('date', '>=', lastYearStartStr)
                    .where('date', '<=', lastYearEndStr)
                    .orderBy('date', 'asc')
                    .get();
                 allRelevantData = allRelevantData.concat(lastYearSnapshot.docs.map(doc => doc.data()));
            }

            logger.info(`[Market Analysis - OnDemand] Fetched ${allRelevantData.length} relevant records for ${cropName} in ${marketName} (${stateName}) from Firestore.`);

            if (allRelevantData.length === 0) {
                dataCompleteness = "Missing (No data found in Firestore for this crop/market/state combination)";
                logger.warn(`[Market Analysis - OnDemand] No data found in Firestore for ${cropName} at ${marketName} (${stateName}).`);
            } else if (allRelevantData.length < 60) {
                 dataCompleteness = "Partial (Limited historical data)";
            }

            let currentYearRecentDataStr = "";
            let previousYearComparativeDataStr = "";
            let chartDataArray = []; 

            const thirtyDaysAgo = new Date(today); 
            thirtyDaysAgo.setDate(today.getDate() - 30); 

            // HIGHLIGHTED CHANGE: Get district name from fetched data for prompt
            const districtNameForPrompt = allRelevantData.length > 0 ? allRelevantData[0].district_name : 'N/A';

            allRelevantData.forEach(item => {
                const itemDate = new Date(item.date);
                
                chartDataArray.push({
                    date: item.date,
                    price_modal: item.price_modal,
                    price_min: item.price_min,
                    price_max: item.price_max,
                    year: itemDate.getFullYear()
                });

                if (itemDate.getFullYear() === today.getFullYear() && itemDate >= thirtyDaysAgo) {
                    currentYearRecentDataStr += `${item.date}: ${item.price_modal} INR\n`;
                }
                
                const comparableDateLastYear = new Date(item.date);
                comparableDateLastYear.setFullYear(today.getFullYear()); 
                
                if (itemDate.getFullYear() === today.getFullYear() - 1 &&
                    comparableDateLastYear >= thirtyDaysAgo && 
                    comparableDateLastYear <= today) {
                        previousYearComparativeDataStr += `${item.date}: ${item.price_modal} INR\n`;
                }
            });

            chartDataArray.sort((a, b) => new Date(a.date) - new Date(b.date));

            const currentPriceForAI = chartDataArray.length > 0 ? 
                                      chartDataArray[chartDataArray.length - 1].price_modal : 'N/A'; 

            const analysisPrompt = `You are a world-class AI market analyst for Indian farmers. Analyze the provided crop price data and offer actionable advice.

Crop: ${cropName}
Market: ${marketName} (District: ${districtNameForPrompt}, State: ${stateName})
Analysis Date: ${todayStr}

Current Price (latest available from provided data): ${currentPriceForAI} INR

Recent Prices (last 30 days of current year from provided data):
${currentYearRecentDataStr || "No recent data available from Firestore for current year."}

Prices Same Period Last Year (data from corresponding period last year):
${previousYearComparativeDataStr || "No data available from Firestore for the same period last year."}

Based on this data:
1. Describe the current price trend (rising, falling, stable) compared to the last 30 days of available data.
2. Compare the current price and recent trend to prices in the same period last year. Is it significantly higher, lower, or similar? By what percentage approximately?
3. Identify potential general factors (e.g., weather, supply, demand, local events, government policies) that might be influencing any significant price changes or trends you observe.
4. Provide clear, actionable advice and an opinion for farmers regarding selling or holding their crop.
5. Provide a qualitative outlook for price movement in the next 7-15 days based on historical patterns and trends (e.g., 'Prices are likely to rise', 'Expect stabilization', 'Possible slight dip').
6. If data for a specific period is stated as "No data available" above, clearly mention this limitation in your analysis and provide a general outlook based on general agricultural market knowledge for this crop/region if possible.

Respond ONLY with a single, valid JSON object with the exact structure and keys below. All responses must be in English. The 'chart_data' array should be populated directly from the raw data provided to the AI, maintaining the 'date', 'price_modal', 'price_min', 'price_max', and 'year' fields for all relevant data points.

{
  "crop_name": "${cropName}",
  "market_name": "${marketName}",
  "state_name": "${stateName}",
  "analysis_date": "${todayStr}",
  "current_price_inr": ${currentPriceForAI},
  "price_trend_description": "A concise description of the current trend (e.g., 'Prices are moderately rising, up 5% in the last 7 days.').",
  "comparison_to_last_year": "A comparison with last year (e.g., 'Current prices are 15% higher than the same period last year, which averaged 1150 INR.').",
  "influencing_factors": ["Factor 1 (e.g., 'Monsoon rains improving yield expectation.')", "Factor 2 (e.g., 'Increased demand for local festivals.')"],
  "farmer_opinion_and_advice": "Actionable advice for farmers (e.g., 'Consider holding stock as prices are expected to rise further due to...').",
  "price_outlook_short_term": "A qualitative outlook for price movement in the next 7-15 days (e.g., 'Prices are likely to rise', 'Expect stabilization', 'Possible slight dip').",
  "chart_data": ${JSON.stringify(chartDataArray)}, 
  "data_completeness": "${dataCompleteness}"
}`;
            
            const geminiApiEndpoint = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/gemini-1.5-pro-002:generateContent`;
            const geminiRequestBody = { contents: [{ parts: [{ text: analysisPrompt }], role: "user" }] };
            
            logger.info("[AI] Sending analysis request to Gemini API...");
            const geminiResponse = await fetch(geminiApiEndpoint, { 
                method: "POST", 
                headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }, 
                body: JSON.stringify(geminiRequestBody) 
            });
            const geminiResponseData = await geminiResponse.json();
            logger.info("Full Gemini Analysis Response:", JSON.stringify(geminiResponseData, null, 2));

            const modelResponseText = geminiResponseData?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!modelResponseText) { 
                logger.error("[Gemini Error] Did not receive valid analysis from AI.", { response: geminiResponseData });
                response.status(500).json({ error: "Could not generate market analysis from AI." });
                return;
            }
            const analysisData = JSON.parse(modelResponseText.replace(/^```json\s*|```\s*$/g, ""));
            logger.info("Market Analysis received:", analysisData);
            
            response.status(200).json(analysisData);

        } catch (error) {
            logger.error(`[CRITICAL Market Analysis - OnDemand] Error processing request for ${cropName} in ${marketName} (${stateName}):`, error, { structuredData: true });
            response.status(500).json({ error: "Failed to generate market analysis.", details: error.message });
        }
    }
);

// =================================================================
// FUNCTION 3: KNOWLEDGE BASE UPDATER (THE LIBRARIAN) - v2 SYNTAX
// =================================================================
exports.updateKnowledgeBase = onSchedule(
    {
        schedule: "every 24 hours",
        region: LOCATION
    },
    async (event) => {
        const URL_TO_SCRAPE = "https://pib.gov.in/PressReleasePage.aspx?PRID=1945323";
        const FILE_PATH = "knowledge-base/pib_agri_schemes.txt";
        try {
            const response = await fetch(URL_TO_SCRAPE);
            if (!response.ok) { logger.error(`Failed to fetch URL with status: ${response.status}`); return; }
            const html = await response.text();
            const $ = cheerio.load(html);
            const scrapedText = $('.PrintRelease').text();
            if (!scrapedText || scrapedText.trim() === "") { logger.warn("Scraped text is empty. Aborting update."); return; }
            const cleanedText = scrapedText.replace(/\s+/g, ' ').trim();
            const storage = admin.storage();
            const file = storage.bucket(BUCKET_NAME).file(FILE_PATH);
            await file.save(cleanedText);
            logger.info(`Successfully saved updated knowledge to gs://${BUCKET_NAME}/${FILE_PATH}`);
        } catch (error) { logger.error("!!! CRITICAL ERROR inside updateKnowledgeBase function:", error); }
    }
);