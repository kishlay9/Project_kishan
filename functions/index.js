// =================================================================
// SETUP (WITH NEW v2 IMPORTS)
// =================================================================
const { onObjectFinalized } = require("firebase-functions/v2/storage");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { logger, config } = require("firebase-functions");
const fetch = require("node-fetch");
const cheerio = require("cheerio"); // Still needed for Knowledge Base Updater (Function 3)
const { TextToSpeechClient } = require('@google-cloud/text-to-speech');
// HIGHLIGHTED CHANGE: csv and Storage client imports are removed as Kaggle CSV ingestion is removed.
// const csv = require('csv-parser'); 
// const { Storage } = require('@google-cloud/storage');

admin.initializeApp();
const firestore = admin.firestore();
const ttsClient = new TextToSpeechClient();
// HIGHLIGHTED CHANGE: gcsClient initialization is removed as Kaggle CSV ingestion is removed.
// const gcsClient = new Storage(); 

// =================================================================
// CONFIGURATION
// =================================================================
const PROJECT_ID = "project-kisan-new";
const BUCKET_NAME = "project-kisan-new.firebasestorage.app";
const LOCATION = "asia-south1";

// --- HIGHLIGHTED CHANGE: OGD API Key (Accessed from Firebase Functions Config) ---
// YOU MUST SET THIS VIA: firebase functions:config:set ogd.api_key="579b464db66ec23bdd000001c495c37445694fce75e978eb67a15b4f"


// --- HIGHLIGHTED CHANGE: OGD API Base URL with specific RESOURCE_ID ---
const OGD_RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070";
const OGD_API_BASE_URL = `https://api.data.gov.in/resource/${OGD_RESOURCE_ID}`;

// --- HIGHLIGHTED CHANGE: Removed KAGGLE_CSV_CONFIG as Kaggle CSV ingestion is removed ---

// =================================================================
// FUNCTION 1: CROP DOCTOR (ANALYZE PLANT IMAGE) - v2 SYNTAX
// (This function remains UNCHANGED - as per your request, it continues to use gemini-1.5-pro-002)
// =================================================================
exports.analyzePlantImage = onObjectFinalized(
    {
        region: LOCATION,
        timeoutSeconds: 300,
        memory: "2GiB"
    },
    async (event) => {
        const { name: filePath, bucket: bucketName, contentType } = event.data;

        logger.info(`[Function Start] Received object event. FilePath: "${filePath}", ContentType: "${contentType}", Bucket: "${bucketName}"`);

        if (!filePath || !filePath.startsWith("uploads/")) { 
            logger.warn(`[Function Skip] File "${filePath}" ignored: not in "uploads/" directory or no name.`);
            return;
        }

        let apiEndpoint; 
        
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

            apiEndpoint = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/gemini-1.5-pro-002:generateContent`;
            logger.info(`[AI] Using API endpoint: ${apiEndpoint}`);

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

            let textToSpeak = "";
            if (diagnosisData.object_category === "Plant") {
                textToSpeak = `Plant Type: ${diagnosisData.plant_type}. Diagnosis: ${diagnosisData.diagnosis_status}. Disease: ${diagnosisData.disease_name_english}. Description: ${diagnosisData.description_english}. Organic Remedy: ${diagnosisData.organic_remedy_english}.`;
            } else if (diagnosisData.object_category === "Non-Plant Object") {
                textToSpeak = `This appears to be a non-plant object. Description: ${diagnosisData.description_english}. Please upload an image of a plant for diagnosis.`;
            } else { 
                textToSpeak = `The object in the image is ambiguous or unclear. Description: ${diagnosisData.description_english}. Please ensure the image clearly shows a plant.`;
            }
            
            const ttsRequest = { 
                input: { text: textToSpeak }, 
                voice: { languageCode: 'en-US', name: 'en-US-Wavenet-A' }, 
                audioConfig: { audioEncoding: 'MP3' } 
            };
            
            logger.info(`[TTS] Synthesizing speech for: "${textToSpeak.substring(0, Math.min(textToSpeak.length, 100))}..."`);
            const [ttsResponse] = await ttsClient.synthesizeSpeech(ttsRequest);
            logger.info(`[TTS] Speech synthesis successful. Audio content length: ${ttsResponse.audioContent.length} bytes.`);


            const diagnosisId = filePath.split('/').pop();
            if (!diagnosisId) {
                logger.error(`Could not extract filename (diagnosisId) from path: ${filePath}. Aborting.`);
                return;
            }

            const baseFileNameForAudio = diagnosisId.replace(/\.[^/.]+$/, "");
            const audioFileName = `${baseFileNameForAudio}.mp3`;

            logger.info(`[AudioFile] Attempting to save audio to: audio-output/${audioFileName}`);
            const audioFile = admin.storage().bucket(bucketName).file(`audio-output/${audioFileName}`);
            await audioFile.save(ttsResponse.audioContent);
            await audioFile.makePublic();
            const audioUrl = audioFile.publicUrl();
            logger.info(`[AudioFile] Audio file created: ${audioUrl}`);

            diagnosisData.audio_remedy_url = audioUrl;
            
            await firestore.collection("diagnoses").doc(diagnosisId).set(diagnosisData); 
            logger.info(`[Firestore] Successfully wrote complete diagnosis with audio to Firestore (ID: ${diagnosisId}).`);
        } catch (error) {
            logger.error(`!!! CRITICAL ERROR in analysis for file "${filePath}":`, error, { structuredData: true });
        }
    }
);

// =================================================================
// HIGHLIGHTED CHANGE: FUNCTION 2: PROACTIVE MARKET ANALYST (Daily OGD API Ingestion for ALL Records)
// =================================================================
exports.proactiveMarketAnalyst = onSchedule(
    {
        schedule: "every day 08:00", // Daily at 8 AM IST
        timeZone: "Asia/Kolkata",
        region: LOCATION,
        timeoutSeconds: 3600, // 1 hour for potentially large ingestion from API
        memory: "4GiB"       // 1 GB should be sufficient for API response and batching
    },
    async (event) => {
        // --- HIGHLIGHTED CHANGE: Move config loading inside the function ---
        const OGD_API_KEY = functions.config().ogd?.api_key;

        logger.info("[Market Analyst - Ingestion] Starting daily market data collection from OGD API.");

        if (!OGD_API_KEY) {
            logger.error("[Market Analyst - Ingestion] OGD_API_KEY is not configured. Cannot fetch market data.");
            return; // Exit the function gracefully
        }

        const today = new Date();
        // The API uses DD/MM/YYYY for arrival_date in its records, so format the query date as such.
        const todayStrForAPI = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
        const todayStrForFirestore = today.toISOString().slice(0, 10); // YYYY-MM-DD for Firestore document ID

        let offset = 0;
        const limit = 100; // HIGHLIGHTED CHANGE: Using limit of 100 as per your test
        let totalRecords = 0;
        let recordsProcessed = 0;
        
        try {
            // --- HIGHLIGHTED CHANGE: Initial API call to get total records and first batch ---
            logger.info(`[Market Analyst - Ingestion] Fetching initial page from OGD API for ${todayStrForAPI}...`);
            let queryParams = new URLSearchParams({
                'api-key': OGD_API_KEY,
                'format': 'json',
                'filters[arrival_date]': todayStrForAPI,
                'limit': limit.toString(),
                'offset': offset.toString()
            });
            let ogdApiUrl = `${OGD_API_BASE_URL}?${queryParams.toString()}`;
            
            let response = await fetch(ogdApiUrl);
            let responseData = await response.json();

            if (!response.ok || responseData.status !== "ok") {
                const errorDetails = response.ok ? JSON.stringify(responseData) : await response.text();
                logger.error(`[Market Analyst - Ingestion Error] Failed initial fetch from OGD API. Status: ${response.status}, Details: ${errorDetails}`);
                throw new Error("Failed initial OGD API data fetch.");
            }
            
            totalRecords = parseInt(responseData.total || '0', 10);
            logger.info(`[Market Analyst - Ingestion] Total records for ${todayStrForAPI}: ${totalRecords}`);

            if (totalRecords === 0) {
                logger.warn(`[Market Analyst - Ingestion Warning] No records found for ${todayStrForAPI} from OGD API.`);
                return; // Exit if no records for today
            }

            // --- HIGHLIGHTED CHANGE: Pagination Loop ---
            while (recordsProcessed < totalRecords) {
                const batch = firestore.batch();
                let batchCount = 0;
                
                if (recordsProcessed > 0) { // Fetch next page if not the first one
                    queryParams = new URLSearchParams({
                        'api-key': OGD_API_KEY,
                        'format': 'json',
                        'filters[arrival_date]': todayStrForAPI,
                        'limit': limit.toString(),
                        'offset': offset.toString()
                    });
                    ogdApiUrl = `${OGD_API_BASE_URL}?${queryParams.toString()}`;
                    
                    response = await fetch(ogdApiUrl);
                    responseData = await response.json();

                    if (!response.ok || responseData.status !== "ok") {
                        const errorDetails = response.ok ? JSON.stringify(responseData) : await response.text();
                        logger.error(`[Market Analyst - Ingestion Error] Failed to fetch page at offset ${offset}. Status: ${response.status}, Details: ${errorDetails}`);
                        break; // Exit loop if page fetch fails
                    }
                }

                if (!responseData.records || responseData.records.length === 0) {
                    logger.warn(`[Market Analyst - Ingestion Warning] No more records received from OGD API at offset ${offset}. Expected ${totalRecords}, processed ${recordsProcessed}. Exiting loop.`);
                    break; // No more records to process
                }

                for (const record of responseData.records) {
                    // --- HIGHLIGHTED CHANGE: Extract data using actual OGD API response field names ---
                    const commodity = record.commodity;
                    const market = record.market;
                    const state = record.state;
                    const district = record.district; // From API record
                    const variety = record.variety; // From API record
                    const grade = record.grade;     // From API record

                    const priceModal = parseFloat(record.modal_price || 0); 
                    const priceMin = parseFloat(record.min_price || 0);
                    const priceMax = parseFloat(record.max_price || 0);
                    const arrivalDateApi = record.arrival_date; 

                    // Validate extracted data before adding to batch
                    if (!commodity || !state || !market || !arrivalDateApi || isNaN(priceModal) || priceModal <= 0) {
                        logger.warn(`[Market Analyst - Ingestion Warning] Skipping incomplete/invalid record: ${JSON.stringify(record)}`);
                        continue; 
                    }

                    // Convert API date (DD/MM/YYYY) to YYYY-MM-DD for Firestore
                    let firestoreDate = todayStrForFirestore; 
                    try {
                        const parts = arrivalDateApi.split('/'); 
                        if (parts.length === 3) {
                            const parsedDate = new Date(`${parts[1]}/${parts[0]}/${parts[2]}`); 
                            if (!isNaN(parsedDate.getTime())) {
                                firestoreDate = parsedDate.toISOString().slice(0, 10); 
                            }
                        }
                    } catch (e) {
                        logger.warn(`[Market Analyst - Ingestion Warning] Error parsing API date "${arrivalDateApi}": ${e.message}. Using today's date for record: ${JSON.stringify(record)}.`);
                    }

                    const cropSlug = String(commodity).toLowerCase().replace(/\s+/g, '-');
                    const stateSlug = String(state).toLowerCase().replace(/\s+/g, '-');
                    const marketSlug = String(market).toLowerCase().replace(/\s+/g, '-');
                    const firestoreDocId = `${cropSlug}_${marketSlug}_${stateSlug}`; 
                    
                    const marketData = {
                        crop_name: commodity, 
                        market_name: market,
                        district_name: district, 
                        state_name: state,
                        variety: variety, 
                        grade: grade, 
                        date: firestoreDate, 
                        price_modal: priceModal,
                        price_min: priceMin,
                        price_max: priceMax,
                        // arrival_quantity_tonnes: ?, // Not in API response, remove or add if you find it
                        price_unit: "Rs./Quintal", 
                        source_api: `data.gov.in (Resource ID: ${OGD_RESOURCE_ID})`, 
                        ingested_at: admin.firestore.FieldValue.serverTimestamp(),
                    };

                    const docRef = firestore.collection("market_prices").doc(firestoreDocId);
                    const historicalDocRef = docRef.collection("historical_prices").doc(firestoreDate); 

                    batch.set(historicalDocRef, marketData);
                    batchCount++;
                    recordsProcessed++;
                }

                if (batchCount > 0) {
                    await batch.commit();
                    logger.info(`[Market Analyst - Ingestion] Batch committed. Processed ${batchCount} records. Total processed: ${recordsProcessed} of ${totalRecords}.`);
                }
                
                offset += limit; // Move to the next offset for the next API call
            } // End while loop

        } catch (error) {
            logger.error(`[CRITICAL Market Analyst - Ingestion Error] Failed to complete OGD API ingestion for ${todayStrForAPI}:`, error, { structuredData: true });
        }
        logger.info(`[Market Analyst - Ingestion] Daily OGD API data ingestion completed. Total records processed: ${recordsProcessed}.`);
    }
);

// =================================================================
// New HTTP-triggered function for On-Demand Market Analysis (Function 4)
// (This function queries standardized Firestore data and uses Gemini 1.5 Pro)
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

        try { // Start of the main try block
            // --- HIGHLIGHTED CHANGE: Access token needs to be fetched inside this function as well ---
            let accessToken;
            try {
                const tokenResponse = await fetch("http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token", { headers: { "Metadata-Flavor": "Google" } });
                if (!tokenResponse.ok) {
                    throw new Error("Failed to fetch access token");
                }
                const tokenData = await tokenResponse.json();
                accessToken = tokenData.access_token;
            } catch (error) {
                logger.error("[Auth Error] Could not fetch access token for Gemini API call.", error);
                response.status(500).json({ error: "Internal server error: could not authenticate." });
                return;
            }

            const cropName = request.query.cropName || request.body.cropName;
            const stateName = request.query.stateName || request.body.stateName;
            const marketName = request.query.marketName || request.body.marketName; 

            logger.info(`[Market Analysis - OnDemand] Received request for Crop: "${cropName}", State: "${stateName}", Market: "${marketName}"`);

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
            const analysisData = JSON.parse(modelResponseText.replace(/^```json\s*|```s*$/g, ""));
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