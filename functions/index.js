// =================================================================
// SETUP (CORRECTED AND UNIFIED)
// =================================================================
const { onObjectFinalized } = require("firebase-functions/v2/storage");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onRequest } = require("firebase-functions/v2/https");
// --- HIGHLIGHTED FIX: Use the main functions object consistently ---
const functions = require("firebase-functions");
// At the top of your functions/index.js
const { onCall, HttpsError } = require("firebase-functions/v2/https");
// ... other imports ...
// Common libraries
const admin = require("firebase-admin");
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const { TextToSpeechClient } = require('@google-cloud/text-to-speech');
const Busboy = require('busboy');
const { SpeechClient } = require('@google-cloud/speech');
const { Client } = require("@googlemaps/google-maps-services-js");
const multer = require('multer')
const busboyBodyParser = require('busboy-body-parser');
const contentType = require('content-type');
// --- HIGHLIGHTED FIX: Added missing imports for your new functions ---
const axios = require("axios");
const { VertexAI } = require("@google-cloud/vertexai");
const cors = require('cors')({origin: true});
// NEW, ROBUST IMPORT LINE


// Initialize all clients ONCE
admin.initializeApp();
const firestore = admin.firestore();
const storage = admin.storage();
const ttsClient = new TextToSpeechClient();
const speechClient = new SpeechClient();
const mapsClient = new Client({});


// =================================================================
// CONFIGURATION
// =================================================================
const PROJECT_ID = "project-kisan-new";
// --- HIGHLIGHTED FIX: Corrected bucket name format ---
const BUCKET_NAME = "project-kisan-new.appspot.com";
const LOCATION = "asia-south1";

// --- HIGHLIGHTED FIX: Initialize the VertexAI client for the whole file ---
const vertex_ai = new VertexAI({ project: PROJECT_ID, location: LOCATION });

// OGD API Base URL
const OGD_RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070";
const OGD_API_BASE_URL = `https://api.data.gov.in/resource/${OGD_RESOURCE_ID}`;
const POTENTIAL_CROPS = [
    "Tomato", "Marigold", "Okra", "Millet (Bajra)", "Onion", "Cotton", "Sugarcane"
];


// =================================================================
// FUNCTION 1: CROP DOCTOR (ANALYZE PLANT IMAGE) - v2 SYNTAX
// =================================================================
exports.analyzePlantImage = onObjectFinalized(
    {
        region: LOCATION,
        timeoutSeconds: 300,
        memory: "2GiB"
    },
    async (event) => {
        const { name: filePath, bucket: bucketName, contentType } = event.data;

        functions.logger.info(`[Function Start] Received object event. FilePath: "${filePath}", ContentType: "${contentType}", Bucket: "${bucketName}"`);

        if (!filePath || !filePath.startsWith("uploads/")) { 
            functions.logger.warn(`[Function Skip] File "${filePath}" ignored: not in "uploads/" directory or no name.`);
            return;
        }

        let apiEndpoint; 
        
        // --- START: NEW HYBRID AUTHENTICATION BLOCK ---
try {
    let accessToken;

    // Check if we are running in the emulator
    if (process.env.FUNCTIONS_EMULATOR === 'true') {
        functions.logger.info("[Auth] Emulator detected. Fetching token from local gcloud CLI...");
        
        // This command asks your local gcloud setup for an auth token
        const { exec } = require('child_process');
        accessToken = await new Promise((resolve, reject) => {
            exec('gcloud auth print-access-token', (error, stdout, stderr) => {
                if (error) {
                    console.error(`gcloud auth error: ${stderr}`);
                    reject(new Error('Failed to get gcloud auth token. Make sure you are logged in (`gcloud auth login`).'));
                } else {
                    resolve(stdout.trim());
                }
            });
        });
        functions.logger.info("[Auth] Successfully fetched local gcloud token.");

    } else {
        // This is the original code that will run when deployed to the cloud
        functions.logger.info("[Auth] Production environment detected. Fetching token from metadata server...");
        const tokenResponse = await fetch("http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token", { headers: { "Metadata-Flavor": "Google" } });
        
        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            functions.logger.error(`[Auth Error] Failed to fetch token from metadata server. Status: ${tokenResponse.status}, Response: ${errorText}`);
            throw new Error(`Failed to fetch access token: ${tokenResponse.statusText}`);
        }

        const tokenData = await tokenResponse.json();
        accessToken = tokenData.access_token;
        functions.logger.info(`[Auth] Metadata server token fetched. Expires in: ${tokenData.expires_in}s`);
    }

    // Now, the rest of your function uses the `accessToken` variable, which is now correctly populated in both environments
    
    apiEndpoint = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/gemini-1.5-pro-002:generateContent`;
    // ... the rest of your function continues here ...

// --- END: NEW HYBRID AUTHENTICATION BLOCK ---

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
            
           
                        // --- START OF THE ONLY CHANGE ---

            // 1. Read the uploaded image file from storage into a buffer.
            functions.logger.info(`[File Read] Reading gs://${bucketName}/${filePath} into memory...`);
            const file = storage.bucket(bucketName).file(filePath);
            const [imageBuffer] = await file.download();
            
            // 2. Convert the image buffer to a Base64 string for the API request.
            const imageBase64 = imageBuffer.toString('base64');
            functions.logger.info(`[File Read] File successfully read. Size: ${imageBuffer.length} bytes.`);
            
            // 3. Build the NEW request body with inline_data instead of file_data.
            const requestBody = { 
                contents: [{ 
                    role: "user",
                    parts: [
                        { 
                            inline_data: {
                                mime_type: contentType,
                                data: imageBase64
                            } 
                        }, 
                        { text: diagnosisPrompt } // Your prompt is used here, unchanged.
                    ] 
                }] 
            };
            
            functions.logger.info("[AI] Sending request to Gemini API with inline image data...");

            // --- END OF THE ONLY CHANGE ---
            const geminiResponse = await fetch(apiEndpoint, { method: "POST", headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }, body: JSON.stringify(requestBody) });
            const responseData = await geminiResponse.json();
            functions.logger.info("Full Diagnosis Response:", JSON.stringify(responseData, null, 2));

            const modelResponseText = responseData?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!modelResponseText) { 
                functions.logger.error("[Gemini Error] Did not receive a valid diagnosis from the AI. Full Response:", JSON.stringify(responseData, null, 2));
                throw new Error("Did not receive a valid diagnosis from the AI."); 
            }
            const diagnosisData = JSON.parse(modelResponseText.replace(/^```json\s*|```\s*$/g, ""));
            functions.logger.info("Diagnosis received:", diagnosisData);

            let textToSpeak = "";
            if (diagnosisData.object_category === "Plant") {
                textToSpeak = `Plant Type: ${diagnosisData.plant_type}. Description: ${diagnosisData.description_english}. For prevention: ${diagnosisData.prevention_tips_english?.join(', ') || 'No specific prevention tips available.'}.`;
            } else if (diagnosisData.object_category === "Non-Plant Object") {
                textToSpeak = `This appears to be a non-plant object. Description: ${diagnosisData.description_english}. Please upload an image of a plant for diagnosis.`;
            } else { 
                textToSpeak = `The object in the image is ambiguous or unclear. Description: ${diagnosisData.description_english}. Please ensure the image clearly shows a plant.`;
            }
            
                        const ttsRequest = { 
                input: { text: textToSpeak }, 
                voice: { languageCode: 'en-IN', name: 'en-IN-Wavenet-D' }, // HIGHLIGHTED CHANGE: Indian English Female Voice
                audioConfig: { audioEncoding: 'MP3' } 
            };
            
            functions.logger.info(`[TTS] Synthesizing speech for: "${textToSpeak.substring(0, Math.min(textToSpeak.length, 100))}..."`);
            const [ttsResponse] = await ttsClient.synthesizeSpeech(ttsRequest);
            functions.logger.info(`[TTS] Speech synthesis successful. Audio content length: ${ttsResponse.audioContent.length} bytes.`);


            const diagnosisId = filePath.split('/').pop();
            if (!diagnosisId) {
                functions.logger.error(`Could not extract filename (diagnosisId) from path: ${filePath}. Aborting.`);
                return;
            }

            const baseFileNameForAudio = diagnosisId.replace(/\.[^/.]+$/, "");
            const audioFileName = `${baseFileNameForAudio}.mp3`;

            functions.logger.info(`[AudioFile] Attempting to save audio to: audio-output/${audioFileName}`);
            const audioFile = admin.storage().bucket(bucketName).file(`audio-output/${audioFileName}`);
            await audioFile.save(ttsResponse.audioContent);
            await audioFile.makePublic();
            const audioUrl = audioFile.publicUrl();
            functions.logger.info(`[AudioFile] Audio file created: ${audioUrl}`);

            diagnosisData.audio_remedy_url = audioUrl;
            
            await firestore.collection("diagnoses").doc(diagnosisId).set(diagnosisData); 
            functions.logger.info(`[Firestore] Successfully wrote complete diagnosis with audio to Firestore (ID: ${diagnosisId}).`);
        } catch (error) {
            functions.logger.error(`!!! CRITICAL ERROR in analysis for file "${filePath}":`, error, { structuredData: true });
        }
    }
);


// =================================================================
// HIGHLIGHTED CHANGE: FUNCTION 2: PROACTIVE MARKET ANALYST (with Sanitized Slugs)
// =================================================================
exports.proactiveMarketAnalyst = onSchedule(
    {
        schedule: "every day 20:00", // Daily at 8 PM IST
        timeZone: "Asia/Kolkata",
        region: LOCATION,
        timeoutSeconds: 3600,
        memory: "1GiB",
        secrets: ["OGD_API_KEY"]
    },
    async (event) => {
        const OGD_API_KEY = process.env.OGD_API_KEY;
        functions.logger.info("[Market Analyst - Ingestion] Starting daily market data collection from OGD API.");

        if (!OGD_API_KEY) {
            functions.logger.error("[Market Analyst - Ingestion] OGD_API_KEY is not available in environment. Cannot fetch market data.");
            return;
        }

        const today = new Date();
        const todayStrForAPI = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
        
        let offset = 0;
        const limit = 300; 
        let totalRecords = 0;
        let recordsProcessed = 0;
        
        try {
            functions.logger.info(`[Market Analyst - Ingestion] Fetching initial page from OGD API for ${todayStrForAPI} with limit=${limit}...`);
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
                functions.logger.error(`[Market Analyst - Ingestion Error] Failed initial fetch from OGD API. Status: ${response.status}, Details: ${errorDetails}`);
                throw new Error("Failed initial OGD API data fetch.");
            }
            
            totalRecords = parseInt(responseData.total || '0', 10);
            functions.logger.info(`[Market Analyst - Ingestion] Total records for ${todayStrForAPI}: ${totalRecords}`);

            if (totalRecords === 0) {
                functions.logger.warn(`[Market Analyst - Ingestion Warning] No records found for ${todayStrForAPI} from OGD API.`);
                return;
            }

            while (recordsProcessed < totalRecords) {
                const batch = firestore.batch();
                let batchCount = 0;
                
                if (recordsProcessed > 0) {
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
                        functions.logger.error(`[Market Analyst - Ingestion Error] Failed to fetch page at offset ${offset}. Status: ${response.status}, Details: ${errorDetails}`);
                        break;
                    }
                }

                if (!responseData.records || responseData.records.length === 0) {
                    functions.logger.warn(`[Market Analyst - Ingestion Warning] No more records received from OGD API at offset ${offset}. Expected ${totalRecords}, processed ${recordsProcessed}. Exiting loop.`);
                    break;
                }

                for (const record of responseData.records) {
                    const commodity = record.commodity;
                    const market = record.market;
                    const state = record.state;
                    const district = record.district;
                    const variety = record.variety;
                    const grade = record.grade;
                    const priceModal = parseFloat(record.modal_price || 0); 
                    const priceMin = parseFloat(record.min_price || 0);
                    const priceMax = parseFloat(record.max_price || 0);
                    const arrivalDateApi = record.arrival_date; 

                    if (!commodity || !state || !market || !arrivalDateApi || isNaN(priceModal) || priceModal <= 0) {
                        functions.logger.warn(`[Market Analyst - Ingestion Warning] Skipping incomplete/invalid record: ${JSON.stringify(record)}`);
                        continue; 
                    }

                    let firestoreDate = new Date().toISOString().slice(0, 10); 
                    try {
                        const parts = arrivalDateApi.split('/'); 
                        if (parts.length === 3) {
                            const parsedDate = new Date(`${parts[1]}/${parts[0]}/${parts[2]}`); 
                            if (!isNaN(parsedDate.getTime())) {
                                firestoreDate = parsedDate.toISOString().slice(0, 10); 
                            }
                        }
                    } catch (e) {
                        functions.logger.warn(`[Market Analyst - Ingestion Warning] Error parsing API date "${arrivalDateApi}": ${e.message}. Using today's date for record: ${JSON.stringify(record)}.`);
                    }

                    // --- HIGHLIGHTED CHANGE: Slug sanitization to remove invalid characters ---
                    // This function will convert to lowercase, replace spaces with '-', and remove any character
                    // that is not a letter, number, or hyphen. This is crucial for Firestore doc IDs.
                    const sanitizeForId = (str) => {
                        if (!str) return '';
                        return String(str).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                    };

                    const cropSlug = sanitizeForId(commodity);
                    const stateSlug = sanitizeForId(state);
                    const marketSlug = sanitizeForId(market);
                    // --- END HIGHLIGHTED CHANGE ---

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
                    functions.logger.info(`[Market Analyst - Ingestion] Batch committed. Processed ${batchCount} records. Total processed: ${recordsProcessed} of ${totalRecords}.`);
                }
                
                offset += limit;
            }

        } catch (error) {
            functions.logger.error(`[CRITICAL Market Analyst - Ingestion Error] Failed to complete OGD API ingestion:`, error, { structuredData: true });
        }
        functions.logger.info(`[Market Analyst - Ingestion] Daily OGD API data ingestion completed. Total records processed: ${recordsProcessed}.`);
    }
);
// Add this to your functions/index.js file

// =================================================================
// FUNCTION 2.1: GET MARKET DROPDOWNS
// =================================================================
exports.getMarketDropdowns = onCall({ region: LOCATION }, async (request) => {
    try {
        const snapshot = await firestore.collection("market_prices").get();
        if (snapshot.empty) {
            throw new HttpsError('not-found', 'No market data available to build dropdowns.');
        }

        const states = new Set();
        const markets = new Set();
        const crops = new Set();

        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.state_name) states.add(data.state_name);
            if (data.market_name) markets.add(data.market_name);
            if (data.crop_name) crops.add(data.crop_name);
        });

        return {
            states: Array.from(states).sort(),
            markets: Array.from(markets).sort(),
            crops: Array.from(crops).sort()
        };
    } catch (error) {
        functions.logger.error("Error fetching market dropdown data:", error);
        throw new HttpsError('internal', 'Could not fetch data for market dropdowns.');
    }
});


// =================================================================
// FUNCTION 2.2: GET LIVE MARKET PRICES (FOR TABLE)
// =================================================================
exports.getLiveMarketPrices = onCall({ region: LOCATION }, async (request) => {
    try {
        const snapshot = await firestore.collection("market_prices")
            .orderBy("ingested_at", "desc")
            .limit(30) // Let's fetch 30 for a nice full table
            .get();

        if (snapshot.empty) {
            return []; // Return an empty array if no data
        }

        const priceData = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                commodity: data.crop_name,
                variety: data.variety,
                minPrice: data.price_min,
                maxPrice: data.price_max,
                avgPrice: data.price_modal,
                date: new Date(data.date).toLocaleDateString('en-GB')
            };
        });

        return priceData;
    } catch (error) {
        functions.logger.error("Error fetching live market prices for table:", error);
        throw new HttpsError('internal', 'Could not fetch live market prices.');
    }
});
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
            if (!response.ok) { functions.logger.error(`Failed to fetch URL with status: ${response.status}`); return; }
            const html = await response.text();
            const $ = cheerio.load(html);
            const scrapedText = $('.PrintRelease').text();
            if (!scrapedText || scrapedText.trim() === "") { functions.logger.warn("Scraped text is empty. Aborting update."); return; }
            const cleanedText = scrapedText.replace(/\s+/g, ' ').trim();
            const storage = admin.storage();
            const file = storage.bucket(BUCKET_NAME).file(FILE_PATH);
            await file.save(cleanedText);
            functions.logger.info(`Successfully saved updated knowledge to gs://${BUCKET_NAME}/${FILE_PATH}`);
        } catch (error) { functions.logger.error("!!! CRITICAL ERROR inside updateKnowledgeBase function:", error); }
    }
);

// =================================================================
// FUNCTION 4: PROACTIVE GUARDIAN ENGINE (WEATHER-BASED ALERTS)
// =================================================================
exports.proactiveGuardianEngine = onSchedule(
    {
        schedule: "every day 07:00",
        timeZone: "Asia/Kolkata",
        region: LOCATION,
        timeoutSeconds: 540,
        memory: "1GiB",
        // --- HIGHLIGHTED CHANGE: Add secret for Weather API Key ---
        secrets: ["WEATHER_API_KEY"]
    },
    async (event) => {
        functions.logger.info("[Proactive Guardian] Engine started.");
        const farmsSnapshot = await firestore.collection('userFarms').get();

        if (farmsSnapshot.empty) {
            functions.logger.info("[Proactive Guardian] No farms found to analyze. Exiting.");
            return null;
        }

        const analysisPromises = farmsSnapshot.docs.map(doc => {
            return analyzeSingleFarmForRisks(doc.data(), doc.id);
        });

        await Promise.all(analysisPromises);
        functions.logger.info("[Proactive Guardian] Finished processing all farms.");
        return null;
    }
);

// --- HELPER FUNCTION FOR THE GUARDIAN ENGINE (WITH CORRECT GOOGLE WEATHER API FIELD) ---
async function analyzeSingleFarmForRisks(farmData, farmId) {
    functions.logger.info(`[Proactive Guardian] Analyzing farm: ${farmId}`);

    const { location, currentCrop, userId } = farmData;
    if (!location || typeof location.latitude !== 'number' || typeof location.longitude !== 'number' || !currentCrop || !userId) {
        functions.logger.warn(`[Proactive Guardian] Skipping farm ${farmId}: missing or invalid essential data.`, { farmData });
        return;
    }

    const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
    if (!WEATHER_API_KEY) {
        functions.logger.error(`[Proactive Guardian] WEATHER_API_KEY is not available in environment for farm ${farmId}. Skipping.`);
        return;
    }

    try {
        const tokenResponse = await fetch('http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token', { headers: { 'Metadata-Flavor': 'Google' } });
        if (!tokenResponse.ok) {
            throw new Error('Failed to get authentication token for Google APIs.');
        }
        const { access_token: accessToken } = await tokenResponse.json();

        const lat = location.latitude;
        const lon = location.longitude;
        const weatherApiUrl = `https://weather.googleapis.com/v1/forecast/days:lookup?key=${WEATHER_API_KEY}&location.latitude=${lat}&location.longitude=${lon}&days=7`;
        
        functions.logger.info(`[Proactive Guardian] Fetching weather data for farm ${farmId} from Google Weather API.`);
        const weatherResponse = await axios.get(weatherApiUrl);
        
        // --- HIGHLIGHTED CHANGE: Use the correct 'forecastDays' field name from the API documentation ---
        if (!weatherResponse.data || !Array.isArray(weatherResponse.data.forecastDays) || weatherResponse.data.forecastDays.length === 0) {
            functions.logger.warn(`[Proactive Guardian] Weather data for farm ${farmId} was invalid or empty.`, { response: weatherResponse.data });
            return; // Skip this farm if weather data is not valid
        }
        const dailyWeather = weatherResponse.data.forecastDays;
        // --- END HIGHLIGHTED CHANGE ---

        functions.logger.info(`[Proactive Guardian] Weather data received for farm ${farmId}:`, { dailyWeatherSample: dailyWeather.slice(0, 2) });

        const generativeModel = vertex_ai.getGenerativeModel({ model: "gemini-1.5-pro-002" });
        const prompt = `Based on the following 7-day weather forecast for a farm growing ${currentCrop}, identify potential high-risk threats like pests or diseases.
        Weather Data: ${JSON.stringify(dailyWeather)}
        
        Analyze the data for patterns conducive to specific threats (e.g., high humidity and moderate temps for fungal diseases, specific wind patterns for pest migration).

        Respond ONLY with a single, valid JSON object containing an array named "threats". Each object in the array should have these exact keys: "threat_name", "threat_type" (e.g., "Pest", "Fungal Disease", "Bacterial Disease"), "risk_level" ("Low", "Medium", or "High"), and "reasoning". If no significant risks are found, return an empty array.`;
        
        functions.logger.info(`[Proactive Guardian] Sending prompt to Vertex AI for farm ${farmId}.`);
        const resp = await generativeModel.generateContent(prompt);
        
        if (!resp || !resp.response || !resp.response.candidates || !resp.response.candidates[0] || 
            !resp.response.candidates[0].content || !resp.response.candidates[0].content.parts || 
            !resp.response.candidates[0].content.parts[0] || typeof resp.response.candidates[0].content.parts[0].text !== 'string') {
            throw new Error('Invalid Vertex AI response structure: Missing candidates, content, parts, or text.');
        }
        const content = resp.response.candidates[0].content.parts[0].text;
        
        functions.logger.info(`[Proactive Guardian] Raw Gemini response for farm ${farmId}:`, { content });

        let jsonString = content;
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
            jsonString = jsonMatch[1];
        }
        
        const firstBrace = jsonString.indexOf('{');
        const lastBrace = jsonString.lastIndexOf('}');
        if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
            throw new Error("AI response did not contain a valid JSON object.");
        }
        const finalJsonString = jsonString.substring(firstBrace, lastBrace + 1).trim();
        const threatsObject = JSON.parse(finalJsonString);
        const threats = threatsObject.threats || [];

        functions.logger.info(`[Proactive Guardian] Parsed threats for farm ${farmId}:`, { threats });

        for (const threat of threats) {
            if (threat.risk_level === 'High' || threat.risk_level === 'Medium') {
                const today = new Date().toISOString().split('T')[0];
                const alertId = `${farmId}_${threat.threat_name.replace(/\s+/g, '')}_${today}`;
                const alertData = {
                    userId, farmId, crop: currentCrop,
                    threatName: threat.threat_name, threatType: threat.threat_type,
                    riskLevel: threat.risk_level, reasoning: threat.reasoning,
                    timestamp: admin.firestore.FieldValue.serverTimestamp()
                };
                await firestore.collection('pestAlerts').doc(alertId).set(alertData);
                functions.logger.info(`[Proactive Guardian] High-risk alert created for farm ${farmId}: ${threat.threat_name}`);
            }
        }
    } catch (error) {
        if (error.response) {
            functions.logger.error(`[Proactive Guardian] API Error for farm ${farmId}: Status ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`, error);
        } else {
            functions.logger.error(`[Proactive Guardian] Failed to analyze farm ${farmId}. Error:`, error.message, { structuredData: true });
        }
    }
}
// =================================================================
// New HTTP-triggered function for On-Demand Market Analysis (Function 5)
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

        let cropName = request.query.cropName || request.body.cropName;
        let stateName = request.query.stateName || request.body.stateName;
        let marketName = request.query.marketName || request.body.marketName; 

        try { 
            let accessToken;
            try {
                const tokenResponse = await fetch("http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token", { headers: { "Metadata-Flavor": "Google" } });
                if (!tokenResponse.ok) {
                    throw new Error("Failed to fetch access token");
                }
                const tokenData = await tokenResponse.json();
                accessToken = tokenData.access_token;
            } catch (error) {
                functions.logger.error("[Auth Error] Could not fetch access token for Gemini API call.", error);
                response.status(500).json({ error: "Internal server error: could not authenticate." });
                return;
            }

            functions.logger.info(`[Market Analysis - OnDemand] Received request for Crop: "${cropName}", State: "${stateName}", Market: "${marketName}"`);

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

            functions.logger.info(`[Market Analysis - OnDemand] Fetched ${allRelevantData.length} relevant records for ${cropName} in ${marketName} (${stateName}) from Firestore.`);

            if (allRelevantData.length === 0) {
                dataCompleteness = "Missing (No data found in Firestore for this crop/market/state combination)";
                functions.logger.warn(`[Market Analysis - OnDemand] No data found in Firestore for ${cropName} at ${marketName} (${stateName}).`);
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
2. Identify potential general factors (e.g., weather, supply, demand, local events, government policies) that might be influencing any significant price changes or trends you observe.
3. Provide clear, actionable advice and an opinion for farmers regarding selling or holding their crop.
4. Provide a qualitative outlook for price movement in the next 7-15 days based on historical patterns and trends (e.g., 'Prices are likely to rise', 'Expect stabilization', 'Possible slight dip').
5. Based STRICTLY on the provided 'Current Price' and 'Recent Prices' data, provide a direct recommendation to 'Buy', 'Sell', or 'Hold' the crop. If insufficient data or unclear trend, state 'Monitor' and briefly explain why. This recommendation MUST be derived SOLELY from the provided numbers and trends, and MUST NOT hallucinate external market conditions not mentioned in the data.
6. If data for a specific period is stated as "No data available" above, clearly mention this limitation in your analysis and provide a general outlook based on general agricultural market knowledge for this crop/region if possible.

Respond ONLY with a single, valid JSON object with the exact structure and keys below. All responses must be in English. The 'chart_data' array should be populated directly from the raw data provided to the AI, maintaining the 'date', 'price_modal', 'price_min', 'price_max', and 'year' fields for all relevant data points.

{
  "crop_name": "${cropName}",
  "market_name": "${marketName}",
  "state_name": "${stateName}",
  "analysis_date": "${todayStr}",
  "current_price_inr": ${currentPriceForAI},
  "price_trend_description": "A concise description of the current trend (e.g., 'Prices are moderately rising, up 5% in the last 7 days.').",
  "influencing_factors": ["An array of strings. Each string is a potential influencing factor, presented as a complete sentence."],
  "farmer_opinion_and_advice": "A string containing actionable advice for farmers. Format this advice as a single paragraph or as a few concise bullet points using markdown like '* Point 1' or '- Point 1'. The advice must be practical.",
  "price_outlook_short_term": "A qualitative outlook for price movement in the next 7-15 days (e.g., 'Prices are likely to rise', 'Expect stabilization', 'Possible slight dip'). If the data is insufficient to form a strong opinion, provide a cautious but definitive-sounding outlook based on general market principles for this crop, for example, 'Prices may see some volatility due to seasonal shifts' instead of stating 'Insufficient data'or 'limited data' .",
  "buy_sell_hold_recommendation": "Direct recommendation: 'Buy', 'Sell', 'Hold', or 'Monitor'. ",
  "chart_data": ${JSON.stringify(chartDataArray)}, 
  "data_completeness": "${dataCompleteness}"
}`;
            const geminiApiEndpoint = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/gemini-1.5-pro-002:generateContent`;
            const geminiRequestBody = { contents: [{ parts: [{ text: analysisPrompt }], role: "user" }] };
            
            functions.logger.info("[AI] Sending analysis request to Gemini API...");
            const geminiResponse = await fetch(geminiApiEndpoint, { 
                method: "POST", 
                headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }, 
                body: JSON.stringify(geminiRequestBody) 
            });
            const geminiResponseData = await geminiResponse.json();
            functions.logger.info("Full Gemini Analysis Response:", JSON.stringify(geminiResponseData, null, 2));

            // --- HIGHLIGHTED FIX: Corrected syntax and added robust JSON parsing logic ---
            const modelResponseText = geminiResponseData?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!modelResponseText) { 
                functions.logger.error("[Gemini Error] Did not receive valid analysis from AI.", { response: geminiResponseData });
                response.status(500).json({ error: "Could not generate market analysis from AI." });
                return;
            }

            let jsonString = modelResponseText;
            
            // Step 1: Try to extract content from a markdown block like ```json ... ```
            const jsonMatch = modelResponseText.match(/```json\s*([\s\S]*?)\s*```/);
            if (jsonMatch && jsonMatch[1]) {
                // If found, use the captured group, which is the clean JSON content
                jsonString = jsonMatch[1];
            } else {
                // Fallback if no markdown block is found
                jsonString = modelResponseText;
            }

            // Step 2: For extra safety, find the first '{' and last '}' to trim any potential extra text
            const firstBrace = jsonString.indexOf('{');
            const lastBrace = jsonString.lastIndexOf('}');
            
            if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
                functions.logger.error("[JSON Parse Error] Could not find a valid JSON object within Gemini's response.", { rawResponse: modelResponseText });
                response.status(500).json({ error: "AI response did not contain a valid JSON object." });
                return;
            }
            
            // Step 3: Get the final, clean JSON string and trim it
            const finalJsonString = jsonString.substring(firstBrace, lastBrace + 1).trim();

            try {
                // Step 4: Parse the cleaned string
                const analysisData = JSON.parse(finalJsonString);
                functions.logger.info("Market Analysis received:", analysisData);
                response.status(200).json(analysisData);
                return; // Explicitly return after sending successful response
            } catch (parseError) {
                functions.logger.error("[JSON Parse Error] Failed to parse Gemini's response as JSON after cleaning.", { rawResponse: modelResponseText, cleanedString: finalJsonString, error: parseError });
                response.status(500).json({ error: "Failed to parse AI response.", details: parseError.message });
                return; // Explicitly return after sending error response
            }

        } catch (error) {
            functions.logger.error(`[CRITICAL Market Analysis - OnDemand] Error processing request for ${cropName} in ${marketName} (${stateName}):`, error, { structuredData: true });
            // Check if headers have already been sent before sending another response
            if (!response.headersSent) {
                response.status(500).json({ error: "Failed to generate market analysis.", details: error.message });
            }
        }
    }
);
// =================================================================
// FUNCTION 6: YIELD MAXIMIZER - GENERATE MASTER PLAN (CORRECTED)
// =================================================================
exports.generateMasterPlan = onCall(
    {
        region: LOCATION,
        memory: "1GiB",
        timeoutSeconds: 120,
    },
    async (request) => {
        // 1. Validate Input from the Frontend
        const { farmId, crop, variety, sowingDate, location } = request.data;

        if (!farmId || !crop || !sowingDate || !location) {
            throw new HttpsError('invalid-argument', 'Missing required data: farmId, crop, sowingDate, and location are all required.');
        }
        functions.logger.info(`[Master Plan] Request for farm: ${farmId}, crop: ${crop}, variety: ${variety || 'N/A'}`);

        try {
            // 2. The AI's Job: Create the comprehensive plan
            const generativeModel = vertex_ai.getGenerativeModel({ model: "gemini-1.5-pro-002" });
            
            // CORRECTED PROMPT: Asks for both masterPlan and dailyTasks
            const prompt = `
                You are a master agronomist for the Indian subcontinent. Your task is to create a complete cultivation content package.

                **Farmer's Details:**
                - Crop: ${crop}
                - Variety: ${variety || 'General'}
                - Location: Latitude ${location.latitude}, Longitude ${location.longitude}
                - Sowing Date: ${sowingDate}

                **Task:**
                Generate a single, valid JSON object that contains TWO main parts: "masterPlan" and "recommendedDailyTasks".

                1.  **masterPlan**: A week-by-week plan for the crop's lifecycle. This MUST be an array of objects. Each object must have "weekNumber" (integer) and "activities" (string).
                
                2.  **recommendedDailyTasks**: A list of 3 generic, essential daily tasks. This MUST be an array of 3 objects. Each object must have "title" (string), "icon" (string: "diagnose-crop", "ai-guardian", or "marketshop"), and "description" (string).

                Respond ONLY with the single, valid JSON object and nothing else.
            `;

            const resp = await generativeModel.generateContent(prompt);
            const content = resp.response.candidates[0].content.parts[0].text;
            
            // Robustly parse the JSON response from the AI
            let jsonString = content.replace(/```json/g, '').replace(/```/g, '').trim();
            const firstBrace = jsonString.indexOf('{');
            const lastBrace = jsonString.lastIndexOf('}');
            if (firstBrace === -1 || lastBrace === -1) throw new Error("AI response was not valid JSON.");
            const finalJsonString = jsonString.substring(firstBrace, lastBrace + 1);
            const fullPlanData = JSON.parse(finalJsonString);

            // Validate the structure of the AI's response
            if (!fullPlanData.masterPlan || !fullPlanData.recommendedDailyTasks) {
                throw new Error("AI did not return the data in the expected format (masterPlan and recommendedDailyTasks).");
            }

            // 3. Save the specific Master Plan to the farm's document in Firestore
            await firestore.collection('userFarms').doc(farmId).set({
                activePlan: {
                    crop: crop,
                    variety: variety || 'General',
                    sowingDate: sowingDate,
                    masterPlan: fullPlanData.masterPlan // Only the master plan is saved
                }
            }, { merge: true });

            functions.logger.info(`[Master Plan] Successfully generated and saved plan for farm ${farmId}.`);
            
            // 4. Return the farmId and the generic daily tasks to the client
            return {
                success: true,
                message: "Plan saved successfully.",
                farmId: farmId,
                dailyTasks: fullPlanData.recommendedDailyTasks
            };

        } catch (error) {
            functions.logger.error(`[Master Plan] Failed to generate plan for farm ${farmId}:`, error);
            throw new HttpsError('internal', 'An error occurred while generating the master crop plan.', error.message);
        }
    }
);

// =================================================================
// FUNCTION 10: GEOCODE ADDRESS HELPER (CORRECTED to onCall)
// =================================================================
exports.geocodeAddress = onCall(
    {
        region: LOCATION,
        secrets: ["GOOGLE_MAPS_API_KEY"]
    },
    async (request) => {
        const address = request.data.address;
        if (!address) {
            throw new HttpsError('invalid-argument', 'The function must be called with an "address" argument.');
        }

        const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
        if (!GOOGLE_MAPS_API_KEY) {
            functions.logger.error("FATAL: GOOGLE_MAPS_API_KEY secret not loaded.");
            throw new HttpsError('internal', 'Server configuration error for geocoding.');
        }
        
        const geocodingApiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`;
        
        try {
            const response = await axios.get(geocodingApiUrl);
            const data = response.data;

            if (data.status !== 'OK' || !data.results || data.results.length === 0) {
                throw new HttpsError('not-found', `Could not find coordinates for the location: "${address}".`);
            }

            const location = data.results[0].geometry.location;
            return { latitude: location.lat, longitude: location.lng };

        } catch (error) {
            if (error instanceof HttpsError) throw error;
            functions.logger.error(`Error during geocoding for address: ${address}`, error);
            throw new HttpsError('internal', 'Failed to geocode address.');
        }
    }
);

// Your other functions...

// =================================================================
// FUNCTION 7: YIELD MAXIMIZER - GENERATE DAILY TASKS (CORRECTED)
// =================================================================
exports.generateDailyTasks = onSchedule(
    {
        schedule: "every day 06:00",
        timeZone: "Asia/Kolkata",
        region: LOCATION,
        timeoutSeconds: 540,
        memory: "1GiB",
        concurrency: 1,
        // --- HIGHLIGHTED CHANGE: Add the secret for the Weather API Key ---
        secrets: ["WEATHER_API_KEY"] 
    },
    async (event) => {
        functions.logger.info("[Daily Tasks] Starting daily task generation for all active farms.");
        const farmsWithActivePlans = await firestore.collection('userFarms').where('activePlan', '!=', null).get();

        if (farmsWithActivePlans.empty) {
            functions.logger.info("[Daily Tasks] No active farm plans found. Exiting.");
            return null;
        }

        const taskPromises = farmsWithActivePlans.docs.map(doc => 
            processSingleFarmDailyTasks(doc.id, doc.data())
        );
        
        await Promise.all(taskPromises);
        functions.logger.info(`[Daily Tasks] Finished task generation for ${farmsWithActivePlans.size} farms.`);
        return null;
    }
);

// --- HELPER FUNCTION (CORRECTED) ---
// --- HELPER FUNCTION (CORRECTED) ---
async function processSingleFarmDailyTasks(farmId, farmData) {
    const { location, activePlan } = farmData;
    const { crop, sowingDate, masterPlan } = activePlan;

    const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
    if (!WEATHER_API_KEY) {
        functions.logger.error(`[Daily Tasks] WEATHER_API_KEY secret is not configured. Skipping farm ${farmId}.`);
        return;
    }

    try {
        // A. Calculate the Crop's Age (in weeks)
        const today = new Date();
        const sowDate = new Date(sowingDate);
        const timeDifference = today.getTime() - sowDate.getTime();
        const daysSinceSowing = Math.floor(timeDifference / (1000 * 3600 * 24));
        const currentWeek = Math.floor(daysSinceSowing / 7) + 1;

        // B. Get the Current Week's Goals
        const currentWeekPlan = masterPlan.find(week => week.weekNumber === currentWeek);
        if (!currentWeekPlan) {
            functions.logger.info(`[Daily Tasks] Farm ${farmId} is outside its plan's schedule. No tasks generated.`);
            return;
        }

        // C. Get Hyperlocal Context (Weather Forecast)
        const weatherApiUrl = `https://weather.googleapis.com/v1/forecast/days:lookup?key=${WEATHER_API_KEY}&location.latitude=${location.latitude}&location.longitude=${location.longitude}&days=2`;
        const weatherResponse = await axios.get(weatherApiUrl);
        const weatherForecast = weatherResponse.data.forecastDays;

        if (!weatherForecast || !Array.isArray(weatherForecast) || weatherForecast.length < 2) {
            throw new Error("Received invalid or insufficient (less than 2 days) weather forecast data.");
        }
        
        // D. Consult the AI Expert
        const generativeModel = vertex_ai.getGenerativeModel({ model: "gemini-1.5-pro-002" }); 
        const prompt = `
            You are a hyper-practical AI Agronomist providing a daily to-do list for an Indian farmer. Be extremely direct, simple, and actionable.
            
            **Context:**
            - Farmer's Crop: ${crop}
            - Current Week of Cultivation: ${currentWeek}
            - This Week's Overall Goal (from Master Plan): "${currentWeekPlan.activities}"
            - Today's Weather Forecast: "Max Temp: ${(weatherForecast[0]?.maxTemperature?.degrees || 'N/A')}°C, Min Temp: ${(weatherForecast[0]?.minTemperature?.degrees || 'N/A')}°C, Humidity: ${(weatherForecast[0]?.daytimeForecast?.relativeHumidity || 'N/A')}%, Precipitation: ${(weatherForecast[0]?.daytimeForecast?.precipitation?.qpf?.quantity || 0)}mm"
            - Tomorrow's Weather Forecast: "Max Temp: ${(weatherForecast[1]?.maxTemperature?.degrees || 'N/A')}°C, Min Temp: ${(weatherForecast[1]?.minTemperature?.degrees || 'N/A')}°C, Humidity: ${(weatherForecast[1]?.daytimeForecast?.relativeHumidity || 'N/A')}%, Precipitation: ${(weatherForecast[1]?.daytimeForecast?.precipitation?.qpf?.quantity || 0)}mm"

            **Task:**
            Based on ALL the context above, generate a prioritized checklist of 2-4 tasks for the farmer to complete TODAY. Adapt the master plan's goals to the specific daily weather. Your advice should be proactive.

            Respond ONLY with a valid JSON object with a single key "daily_tasks". The value should be an array of strings. Each string is a simple, actionable task.
        `;

        const resp = await generativeModel.generateContent(prompt);
        
        if (!resp || !resp.response || !resp.response.candidates || !resp.response.candidates[0] || 
            !resp.response.candidates[0].content || !resp.response.candidates[0].content.parts || 
            !resp.response.candidates[0].content.parts[0] || typeof resp.response.candidates[0].content.parts[0].text !== 'string') {
            throw new Error('Invalid Vertex AI response structure.');
        }
        const content = resp.response.candidates[0].content.parts[0].text;

        // --- HIGHLIGHTED FIX: Corrected and robust JSON parsing logic ---
        let jsonString = content;
        
        // Step 1: Try to extract content from a markdown block like ```json ... ```
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
            // If found, use the captured group, which is the clean JSON content
            jsonString = jsonMatch[1];
        }
        
        // Step 2: For extra safety, find the first '{' and last '}' to trim any potential extra text
        const firstBrace = jsonString.indexOf('{');
        const lastBrace = jsonString.lastIndexOf('}');
        if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
            throw new Error("AI response did not contain a valid JSON object.");
        }
        const finalJsonString = jsonString.substring(firstBrace, lastBrace + 1).trim();
        const tasksData = JSON.parse(finalJsonString);
        // --- END HIGHLIGHTED FIX ---

        if (!tasksData.daily_tasks) {
            throw new Error("AI response did not contain a 'daily_tasks' array.");
        }

        // E. Save the Daily Tasks
        const todayStr = today.toISOString().split('T')[0];
        await firestore.collection('userFarms').doc(farmId).collection('dailyTasks').doc(todayStr).set({
            tasks: tasksData.daily_tasks,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });

        functions.logger.info(`[Daily Tasks] Successfully generated ${tasksData.daily_tasks.length} tasks for farm ${farmId}.`);

    } catch (error) {
        functions.logger.error(`[Daily Tasks] Failed to generate tasks for farm ${farmId}:`, { message: error.message, stack: error.stack, structuredData: true });
    }
}

// =================================================================
// FUNCTION 8: GET WEATHER AND AQI (with Reverse Geocoding & Spraying Analysis)
// =================================================================
exports.getWeatherAndAqi = onRequest(
    {
        region: LOCATION,
        timeoutSeconds: 60,
        memory: "1GiB",
        // --- HIGHLIGHTED CHANGE: Add secrets for BOTH weather and air quality API keys ---
        // For simplicity, we'll assume one key has access to Weather, AQI, and Geocoding APIs.
        // You can create separate secrets if you use different keys.
        secrets: ["GOOGLE_MAPS_API_KEY"] 
    },
    async (request, response) => {
        // --- CORS handling for frontend requests ---
        response.set('Access-Control-Allow-Origin', '*'); 
        if (request.method === 'OPTIONS') {
            response.set('Access-Control-Allow-Methods', 'GET, POST');
            response.set('Access-Control-Allow-Headers', 'Content-Type');
            response.status(204).send('');
            return;
        }

        const lat = request.query.lat || request.body.lat;
        const lon = request.query.lon || request.body.lon;

        functions.logger.info(`[Weather & AQI] Received request for Lat: "${lat}", Lon: "${lon}"`);

        if (!lat || !lon) {
            response.status(400).json({ error: "Missing 'lat' or 'lon' in request." });
            return;
        }

        const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
        if (!GOOGLE_MAPS_API_KEY) {
            functions.logger.error("[Weather & AQI] GOOGLE_MAPS_API_KEY is not available in environment.");
            response.status(500).json({ error: "Internal server configuration error." });
            return;
        }

        try {
            // --- 1. Define API Call Promises for Parallel Execution ---
            const weatherApiUrl = `https://weather.googleapis.com/v1/forecast/days:lookup?key=${GOOGLE_MAPS_API_KEY}&location.latitude=${lat}&location.longitude=${lon}&days=1`;
            const airQualityApiUrl = `https://airquality.googleapis.com/v1/currentConditions:lookup?key=${GOOGLE_MAPS_API_KEY}`;
            const geocodingApiUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${GOOGLE_MAPS_API_KEY}`;

            const weatherPromise = axios.get(weatherApiUrl);
            const airQualityPromise = axios.post(airQualityApiUrl, {
                location: {
                    latitude: parseFloat(lat),
                    longitude: parseFloat(lon)
                }
            });
            const geocodingPromise = axios.get(geocodingApiUrl);

            // --- 2. Execute API Calls in Parallel ---
            const [weatherResponse, airQualityResponse, geocodingResponse] = await Promise.all([weatherPromise, airQualityPromise, geocodingPromise]);

            const weatherData = weatherResponse.data.forecastDays[0];
            const aqiData = airQualityResponse.data;
            const cityName = parseCityFromGeocodingResponse(geocodingResponse.data);

            // --- 3. Prepare Data for Gemini (Spraying Conditions Analysis) ---
            const todayWeatherForAI = {
                windSpeed: weatherData.daytimeForecast?.wind?.speed?.value,
                windUnit: weatherData.daytimeForecast?.wind?.speed?.unit,
                precipitationProbability: weatherData.daytimeForecast?.precipitation?.probability?.percent,
                humidity: weatherData.daytimeForecast?.relativeHumidity
            };

            const generativeModel = vertex_ai.getGenerativeModel({ model: "gemini-1.5-pro-002" });
            const sprayingPrompt = `You are an agricultural advisor. Based on the following weather data, determine if conditions are 'Favourable' or 'Unfavourable' for spraying pesticides. High wind speed (over 15 km/h) is unfavourable. A high probability of rain (over 40%) is unfavourable.
            
            Weather Data: ${JSON.stringify(todayWeatherForAI)}

            Respond ONLY with a valid JSON object with two keys: "condition" (the single word verdict, either "Favourable" or "Unfavourable") and "reason" (a very brief explanation, like "High winds" or "Clear and calm").`;

            const geminiResp = await generativeModel.generateContent(sprayingPrompt);
            const geminiContent = geminiResp.response.candidates[0].content.parts[0].text;
            
            let sprayingConditions = { condition: "Unknown", reason: "AI analysis failed." }; // Default value
            try {
                const firstBrace = geminiContent.indexOf('{');
                const lastBrace = geminiContent.lastIndexOf('}');
                if (firstBrace !== -1 && lastBrace !== -1) {
                    const jsonString = geminiContent.substring(firstBrace, lastBrace + 1);
                    sprayingConditions = JSON.parse(jsonString);
                }
            } catch (e) {
                functions.logger.error("[Weather & AQI] Failed to parse Gemini response for spraying conditions.", e);
            }


                        // --- 4. Assemble the Final JSON Response for the Frontend ---
            const finalResponse = {
                location: {
                    city: cityName, 
                    date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                },
                weather: {
                    currentTemp: weatherData.daytimeForecast?.temperature?.degrees,
                    condition: weatherData.daytimeForecast?.weatherCondition?.description?.text,
                    minTemp: weatherData.minTemperature?.degrees,
                    maxTemp: weatherData.maxTemperature?.degrees,
                    iconUri: weatherData.daytimeForecast?.weatherCondition?.iconBaseUri,
                    // --- HIGHLIGHTED CHANGE: Add windSpeed and humidity ---
                    windSpeed: weatherData.daytimeForecast?.wind?.speed?.value,
                    humidity: weatherData.daytimeForecast?.relativeHumidity
                },
                aqi: {
                    value: aqiData.indexes[0]?.aqi,
                    category: aqiData.indexes[0]?.category,
                    dominantPollutant: aqiData.indexes[0]?.dominantPollutant
                },
                sprayingConditions: sprayingConditions
            };

            response.status(200).json(finalResponse);

        } catch (error) {
            if (error.response) {
                functions.logger.error(`[Weather & AQI] API Error: Status ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`, error);
            } else {
                functions.logger.error(`[Weather & AQI] Failed to process request. Error:`, error.message, { structuredData: true });
            }
            response.status(500).json({ error: "Failed to fetch weather and AQI data." });
        }
    }
);

// --- HELPER FUNCTION FOR GEOCODING (add this at the end of the file) ---
function parseCityFromGeocodingResponse(geocodingData) {
    if (!geocodingData || !geocodingData.results || geocodingData.results.length === 0) {
        return "Unknown Location";
    }

    // Find the component that represents the city/town (locality) or district
    const firstResult = geocodingData.results[0];
    const localityComponent = firstResult.address_components.find(comp => 
        comp.types.includes("locality") || 
        comp.types.includes("administrative_area_level_2") // Fallback for district
    );
    
    return localityComponent ? localityComponent.long_name : "Unknown Location";
}

// =================================================================
// FUNCTION 9: GOVERNMENT SCHEME NAVIGATOR (Handles Text and Voice Input - FINAL CORRECTED)
// =================================================================
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB limit
    },
});

exports.getSchemeAnswer = onRequest(
    {
        region: LOCATION,
        timeoutSeconds: 120,
        memory: "1GiB"
    },
    (request, response) => {
        // --- CORS handling for frontend requests ---
        response.set('Access-Control-Allow-Origin', '*'); 
        if (request.method === 'OPTIONS') {
            response.set('Access-Control-Allow-Methods', 'GET, POST');
            response.set('Access-Control-Allow-Headers', 'Content-Type');
            response.status(204).send('');
            return;
        }

        // --- Use multer middleware directly and process the request ---
        upload.single('audio')(request, response, async (err) => {
            if (err) {
                functions.logger.error('[Multer Error]', err);
                response.status(400).json({ error: "File upload error: " + err.message });
                return;
            }

            let question, stateName;
            
            try {
                // Determine if it's an audio upload or plain text/JSON request
                if (request.file) { // If multer successfully parsed an 'audio' file
                    stateName = request.body.stateName; // Access text fields from request.body
                    
                    // --- Validation for audio requests ---
                    if (!stateName || !request.file.buffer) {
                        functions.logger.error("Missing 'stateName' field or 'audio' file after parsing multipart data.", { body: request.body, fileExists: !!request.file, bufferSize: request.file ? request.file.buffer.length : 0 });
                        response.status(400).json({ error: "Missing 'stateName' field or 'audio' file in form data." });
                        return;
                    }

                    // --- Transcribe Audio ---
                    question = await transcribeAudio(request.file.buffer);
                    if (!question) {
                        functions.logger.error("[Scheme Q&A Error] Transcription returned empty text.");
                        response.status(500).json({ error: "Could not understand the audio. Please try speaking clearly." });
                        return;
                    }

                } else { // It's a plain text/JSON request (no file uploaded with 'audio' fieldname)
                    question = request.query.question || request.body.question; // For GET or JSON POST
                    stateName = request.query.stateName || request.body.stateName; // For GET or JSON POST
                }

                // --- Final Input Validation (applies to both text and audio paths) ---
                if (!question || !stateName) {
                    functions.logger.error(`[Scheme Q&A] Missing required input after final parsing. Question: "${question}", State: "${stateName}"`);
                    response.status(400).json({ error: "Missing 'question' or 'stateName' in request. All are now required." });
                    return;
                }
                
                // --- Call Gemini Analysis ---
                const result = await getGeminiAnalysisForScheme(question, stateName);
                response.status(200).json(result);

            } catch (error) {
                functions.logger.error(`[CRITICAL Scheme Q&A Error]`, { message: error.message, stack: error.stack, errorObject: JSON.stringify(error) });
                if (!response.headersSent) {
                    response.status(500).json({ error: "Failed to get an answer.", details: error.message });
                }
            }
        });
    }
);

// --- HELPER FUNCTION TO TRANSCRIBE AUDIO ---
async function transcribeAudio(audioBuffer) {
    functions.logger.info("[Scheme Q&A] Transcribing audio with Speech-to-Text API...");
    const audio = { content: audioBuffer.toString('base64') };
    
    // --- HIGHLIGHTED CHANGE: Speech-to-Text configuration for .m4a files ---
    const speechConfig = {
        encoding: 'MP4A',         // Use MP4A encoding for .m4a files
        sampleRateHertz: 44100,   // Common sample rate for .m4a. Adjust if your file is different (e.g., 16000, 48000).
        languageCode: 'en-IN',    // Indian English
    };
    // --- END HIGHLIGHTED CHANGE ---

    const sttRequest = { audio: audio, config: speechConfig };

    const [sttResponse] = await speechClient.recognize(sttRequest);
    const transcription = sttResponse.results
        .map(result => result.alternatives[0].transcript)
        .join('\n');
    
    if (transcription) {
        functions.logger.info(`[Scheme Q&A] Transcription successful: "${transcription}"`);
    } else {
        functions.logger.error("[Scheme Q&A Error] Speech-to-Text returned empty transcription.");
    }
    return transcription;
}

// --- HELPER FUNCTION FOR GEMINI ANALYSIS ---
async function getGeminiAnalysisForScheme(question, stateName) {
    if (!question || !stateName) {
        throw new Error("Missing 'question' or 'stateName' for analysis.");
    }

    let accessToken;
    try {
        const tokenResponse = await fetch("http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token", { headers: { "Metadata-Flavor": "Google" } });
        if (!tokenResponse.ok) throw new Error("Failed to fetch access token");
        const tokenData = await tokenResponse.json();
        accessToken = tokenData.access_token;
    } catch (error) {
        functions.logger.error("[Scheme Q&A Auth Error] Could not fetch access token for Gemini API call.", error);
        throw new Error("Internal server error: could not authenticate.");
    }

    const analysisPrompt = `You are a helpful and knowledgeable assistant for Indian farmers. Your goal is to find relevant government schemes based on a farmer's question and state, and return the information in a structured JSON format.

    **IMPORTANT CONTEXT:**
    - The user is asking about the state of: **${stateName}**
    - The user's question is: **"${question}"**

    **YOUR TASK:**
    1.  Based on your knowledge, search for relevant agricultural schemes. You must consider BOTH **Central Government schemes** (applicable nationwide, like PM-KISAN) AND specific **State Government schemes** for **${stateName}**.
    2.  Analyze the schemes you find and determine if they are relevant to the user's question.
    3.  Format your findings into a single, valid JSON object with the exact structure below.

    **JSON OUTPUT STRUCTURE:**
    {
      "schemes_found": true,
      "schemes": [
        {
          "scheme_name": "Name of the first scheme found",
          "government_level": "Central" or "State",
          "brief_description": "A simple, one-sentence summary of the scheme's purpose.",
          "key_benefits": [
            "Benefit 1 (e.g., 'Financial assistance of Rs. 6000 per year').",
            "Benefit 2 (e.g., 'Subsidy on seeds and fertilizers')."
          ],
          "how_to_apply": "A simple, step-by-step guide on how to apply. If you don't know the exact steps, advise the user to visit the official government portal for that scheme."
        }
      ],
      "message_if_no_schemes": ""
    }

    **IMPORTANT RULES:**
    - If you find one or more relevant schemes, populate the "schemes" array and set "schemes_found" to true. The "message_if_no_schemes" should be an empty string.
    - If you find NO relevant schemes, the "schemes" array MUST be empty (\`[]\`), "schemes_found" MUST be false, and you must provide a helpful message in "message_if_no_schemes", like "I could not find a specific scheme for your query in ${stateName}. You can check the official state agricultural portal for more information."
    - Do not make up facts, scheme names, or URLs. If you are unsure, it's better to state that in the "how_to_apply" section.`;
    
    const geminiApiEndpoint = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/gemini-1.5-pro-002:generateContent`;
    const geminiRequestBody = { 
        contents: [{ 
            parts: [{ text: analysisPrompt }], 
            role: "user" 
        }] 
    };
    
    const geminiResponse = await fetch(geminiApiEndpoint, { 
        method: "POST", 
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }, 
        body: JSON.stringify(geminiRequestBody) 
    });
    const geminiResponseData = await geminiResponse.json();
    
    const modelResponseText = geminiResponseData?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!modelResponseText) {
        functions.logger.error("[Scheme Q&A Error] Gemini response was empty or invalid.", { response: geminiResponseData });
        throw new Error("Could not get a valid answer from the AI.");
    }
    
    // Robust JSON Parsing
    let jsonString = modelResponseText;
    const jsonMatch = modelResponseText.match(/``````/);
    if (jsonMatch && jsonMatch[1]) jsonString = jsonMatch[1];
    
    const firstBrace = jsonString.indexOf('{');
    const lastBrace = jsonString.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1) {
        throw new Error("AI response did not contain a valid JSON object.");
    }
    const finalJsonString = jsonString.substring(firstBrace, lastBrace + 1).trim();

    try {
        return JSON.parse(finalJsonString);
    } catch (parseError) {
        functions.logger.error("[Scheme Q&A Parse Error] Failed to parse Gemini's response as JSON after cleaning.", { rawResponse: modelResponseText, cleanedString: finalJsonString, error: parseError });
        throw new Error("Failed to parse AI response.");
    }
}



// =================================================================
// FUNCTION 10: Generate Opportunity (V2) - FINAL CORRECTED
// =================================================================




exports.generateOpportunity = onCall(
    {
        region: LOCATION,
        memory: "2GiB",
        timeoutSeconds: 180,
        concurrency: 5,
        secrets: ["GOOGLE_MAPS_API_KEY"]
    },
    async (request) => {
        const { location, landSize, budget, waterAccess } = request.data;
        if (!location || !landSize || !budget || !waterAccess) {
            throw new HttpsError('invalid-argument', 'Missing required constraints.');
        }
        // CORRECTED: Added backticks for template literal string
        functions.logger.info(`[Opportunity Engine V2] Request for land: ${landSize} acres, budget: ₹${budget}`);

        try {
            // STEP 1: Determine Location (State & District)
            const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
            if (!GOOGLE_MAPS_API_KEY) {
                functions.logger.error("[Opportunity Engine V2] GOOGLE_MAPS_API_KEY secret not found.");
                throw new HttpsError('internal', 'Server configuration error: Missing API key.');
            }
            functions.logger.info(`[Opportunity Engine V2] Geocoding location...`);
            const geocodeResponse = await mapsClient.reverseGeocode({
                params: { latlng: { latitude: location.latitude, longitude: location.longitude }, key: GOOGLE_MAPS_API_KEY }
            });

            let state = null;
            let district = null;
            const addressComponents = geocodeResponse.data.results[0]?.address_components;
            if (addressComponents) {
                state = addressComponents.find(c => c.types.includes('administrative_area_level_1'))?.long_name;
                district = addressComponents.find(c => c.types.includes('administrative_area_level_2'))?.long_name;
                if (!district) {
                    district = addressComponents.find(c => c.types.includes('locality'))?.long_name;
                    functions.logger.warn(`[Opportunity Engine V2] Falling back to Locality: ${district}`);
                }
            }
            if (!state) {
                functions.logger.error("[Opportunity Engine V2] Could not determine a State from geocoding response.", { response: geocodeResponse.data });
                throw new HttpsError('not-found', "Could not determine a valid State from the provided location.");
            }
            // CORRECTED: Added backticks
            functions.logger.info(`[Opportunity Engine V2] Location identified: ${district || 'N/A'}, ${state}`);

            // STEP 2: Generate Foundational Agronomic Data
            functions.logger.info(`[Opportunity Engine V2] Generating agronomic data with AI...`);
            const agronomicModel = vertex_ai.getGenerativeModel({ model: "gemini-1.5-pro-002" });
            
            // CORRECTED: Added backticks to the entire multi-line string
            const agronomicPrompt = `
                You are an expert Indian agronomist. For the following list of crops, provide their general agronomic and financial data.
                Crops: ${POTENTIAL_CROPS.join(", ")}
                Respond ONLY with a single valid JSON object. The top-level keys should be the crop names. Each crop object must have these exact keys:
                - "water_need": A string ('Low', 'Medium', 'High', 'Very High').
                - "risk_profile": A string ('Low', 'Medium', 'High').
                - "typical_cost_per_acre_inr": An integer representing the average seed and preparation cost per acre.
                - "typical_yield_quintal_per_acre": An integer for the average yield in quintals per acre.
                - "avg_market_price_inr_per_quintal": An integer for the typical national average market price per quintal.
            `;
            const agronomicResp = await agronomicModel.generateContent(agronomicPrompt);
            const agronomicContent = agronomicResp.response.candidates[0].content.parts[0].text;
            let CROP_KNOWLEDGE_BASE;
            try {
                // CORRECTED: Fixed regex to look for ```json
                let jsonString = agronomicContent.match(/```json\s*([\s\S]*?)\s*```/)?.[1] || agronomicContent;
                const firstBrace = jsonString.indexOf('{');
                const lastBrace = jsonString.lastIndexOf('}');
                jsonString = jsonString.substring(firstBrace, lastBrace + 1);
                CROP_KNOWLEDGE_BASE = JSON.parse(jsonString.trim());
                if (!CROP_KNOWLEDGE_BASE || Object.keys(CROP_KNOWLEDGE_BASE).length === 0) {
                   throw new Error("Parsed JSON from agronomic prompt is empty or invalid.");
                }
            } catch (e) {
                functions.logger.error("[Opportunity Engine V2] CRITICAL: Failed to parse agronomic data from AI.", { rawResponse: agronomicContent, error: e.message });
                throw new HttpsError('internal', 'Failed to generate the required internal crop knowledge base.');
            }

            // STEP 3: Gather Supporting Context Data
            // CORRECTED: Added backticks
            const climateSummary = `The region of ${district || state} typically experiences a hot, dry summer followed by a moderate to heavy monsoon season from July to September.`;
            let marketDataSummary = "Recent Market Data Summary for your specific district:\n";
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];
            const marketDataPromises = Object.keys(CROP_KNOWLEDGE_BASE).map(async (crop) => {
                let query = firestore.collectionGroup("historical_prices").where("crop_name", "==", crop).where("state_name", "==", state).where("date", ">=", sevenDaysAgoStr);
                if (district) {
                    query = query.where("district_name", "==", district);
                }
                const querySnapshot = await query.get();
                if (!querySnapshot.empty) {
                    let total = 0;
                    querySnapshot.forEach(doc => { total += doc.data().price_modal; });
                    const averagePrice = Math.round(total / querySnapshot.size);
                    // CORRECTED: Added backticks
                    return `- ${crop}: The average price in your district over the last week was ₹${averagePrice} per quintal.`;
                }
                // CORRECTED: Added backticks
                return `- ${crop}: No recent price data found for your specific district in the last week. The national average is around ₹${CROP_KNOWLEDGE_BASE[crop].avg_market_price_inr_per_quintal}.`;
            });
            const results = await Promise.all(marketDataPromises);
            marketDataSummary += results.join("\n");

            // STEP 4: Consult the AI Strategist
            functions.logger.info(`[Opportunity Engine V2] Generating final prompt for Gemini...`);
            const strategyModel = vertex_ai.getGenerativeModel({ model: "gemini-1.5-pro-002" });
            // CORRECTED: Added backticks
            const prompt = `
                You are an expert agricultural business strategist for small-scale Indian farmers. Your goal is to generate profitable, hyper-personalized, and realistic business plans.
                
                **Farmer's Constraints:**
                - Location: District of ${district}, State of ${state}
                - Land Size: ${landSize} acres
                - Total Investment Budget: ₹${budget}
                - Water Access: ${waterAccess}

                **External and Generated Data:**
                - **Climate Outlook:** ${climateSummary}
                - **Recent Market Prices (Specific to Farmer's District):**
                ${marketDataSummary}
                - **General Agronomic & Financial Data (AI Generated):**
                ${JSON.stringify(CROP_KNOWLEDGE_BASE, null, 2)}

                **Your Task:**
                Based on ALL the data above, act as a business consultant. Generate a list of the **Top 3 most profitable and suitable crop plans** for this specific farmer.
                1. The total cost for each plan must be within the farmer's budget.
                2. The water needs of the crop must match the farmer's water access.
                3. For each plan, calculate an estimated total upfront cost and a potential total profit for their land size. Use the AI-generated typical costs and yields, but adjust your profit expectation based on the more current, local market prices if available.
                4. For each plan, provide a short, bulleted list of "Pros" and "Cons".
                5. Your reasoning must be sound and based on all the data provided.

                **Output Format:**
                Respond ONLY with a single, valid JSON object with a single key, "crop_plans". The value should be an array of exactly three plan objects. Each plan object must have these keys: "crop_name" (string), "estimated_profit_inr" (integer), "estimated_cost_inr" (integer), "pros" (an array of strings), and "cons" (an array of strings).
            `;
            
            const resp = await strategyModel.generateContent(prompt);
            const content = resp.response.candidates[0].content.parts[0].text;
            let analysis;
            try {
                // CORRECTED: Fixed regex
                let jsonString = content.match(/```json\s*([\s\S]*?)\s*```/)?.[1] || content;
                const firstBrace = jsonString.indexOf('{');
                const lastBrace = jsonString.lastIndexOf('}');
                jsonString = jsonString.substring(firstBrace, lastBrace + 1);
                analysis = JSON.parse(jsonString.trim());
            } catch (parsingError) {
                functions.logger.error("[Opportunity Engine V2] Failed to parse final plans from Gemini.", { rawResponse: content });
                throw new HttpsError('internal', 'The AI returned a response in an unexpected format.');
            }
            return analysis;

        } catch (error) {
            functions.logger.error("[Opportunity Engine V2] Critical error:", error);
            if (error instanceof HttpsError) throw error;
            throw new HttpsError('internal', 'An error occurred while generating opportunities.');
        }
    }
);

// At the top of your index.js file, make sure you have this line


// =================================================================
// FUNCTION: ACTIVATE PROACTIVE GUARDIAN (CORRECTED onRequest VERSION FOR TESTING)
// =================================================================
exports.activateGuardian = onRequest(
    {
        region: LOCATION,
        memory: "1GiB",
        timeoutSeconds: 120,
        secrets: ["GOOGLE_MAPS_API_KEY", "WEATHER_API_KEY"],
        concurrency: 5
    },
    (request, response) => {
        // Use the cors middleware to handle all CORS preflight requests
        cors(request, response, async () => {
            try {
                // For a standard HTTPS request, data comes from the request body
                const { currentCrop, sowingDate, locationCity, farmId, userId } = request.body;
                
                // Validate the input from the request body
                if (!currentCrop || !sowingDate || !locationCity || !farmId || !userId) {
                    response.status(400).json({ error: 'Missing required data. All fields are required.' });
                    return;
                }
                functions.logger.info(`[Activate Guardian] Request for farm: ${farmId}, Crop: ${currentCrop}, City: ${locationCity}`);

                // Load secrets from environment
                const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
                const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

                if (!GOOGLE_MAPS_API_KEY || !WEATHER_API_KEY) {
                    functions.logger.error("[Activate Guardian] Server configuration error: Missing API keys.");
                    response.status(500).json({ error: 'Server configuration error.' });
                    return;
                }

                // --- STEP A: GEOCODE THE CITY NAME TO GET COORDINATES ---
                const geocodeResponse = await mapsClient.geocode({
                    params: {
                        address: locationCity,
                        key: GOOGLE_MAPS_API_KEY,
                    }
                });

                if (geocodeResponse.data.status !== 'OK' || geocodeResponse.data.results.length === 0) {
                    response.status(404).json({ error: `Could not find geographic coordinates for the location: "${locationCity}".` });
                    return;
                }
                const locationCoords = geocodeResponse.data.results[0].geometry.location;
                const firestoreGeopoint = new admin.firestore.GeoPoint(locationCoords.lat, locationCoords.lng);

                // --- STEP B: SAVE/ENROLL THE FARM DATA IN FIRESTORE ---
                const farmData = {
                    userId: userId,
                    currentCrop: currentCrop,
                    sowingDate: sowingDate,
                    location: firestoreGeopoint,
                    guardianIsActive: true,
                    lastUpdated: admin.firestore.FieldValue.serverTimestamp()
                };
                await firestore.collection('userFarms').doc(farmId).set(farmData, { merge: true });
                functions.logger.info(`[Activate Guardian] Successfully enrolled farm ${farmId}.`);
                
                // --- STEP C: RUN AN IMMEDIATE, INITIAL RISK ANALYSIS ---
                functions.logger.info(`[Activate Guardian] Running initial risk analysis for farm ${farmId}.`);
                
                // 1. Fetch Weather Data using the new coordinates
                const weatherApiUrl = `https://weather.googleapis.com/v1/forecast/days:lookup?key=${WEATHER_API_KEY}&location.latitude=${locationCoords.lat}&location.longitude=${locationCoords.lng}&days=7`;
                const weatherResponse = await axios.get(weatherApiUrl);
    
                if (!weatherResponse.data || !Array.isArray(weatherResponse.data.forecastDays) || weatherResponse.data.forecastDays.length === 0) {
                    response.status(503).json({ error: 'Could not retrieve valid weather data for the location.' });
                    return;
                }
                const dailyWeather = weatherResponse.data.forecastDays;

                // 2. Call Gemini for the risk assessment
                const generativeModel = vertex_ai.getGenerativeModel({ model: "gemini-1.5-pro-002" });
                const prompt = `
                    You are an expert agricultural entomologist for Indian farming conditions.
                    **Context:**
                    - Crop: ${currentCrop}
                    - Weather Forecast (next 7 days): ${JSON.stringify(dailyWeather.map(d => ({maxTemp: d.maxTemperature?.degrees, minTemp: d.minTemperature?.degrees, humidity: d.daytimeForecast?.relativeHumidity, precipitation: d.daytimeForecast?.precipitation?.qpf?.quantity})))}
                    **Task:**
                    Predict the risk of common pests and diseases for this crop based on the weather. Respond ONLY with a valid JSON array of objects. Each object must have these keys: "threatName" (descriptive name with examples), "threatType" (general category), "riskLevel" ('Low', 'Medium', or 'High'), and "reasoning".
                `;
                const resp = await generativeModel.generateContent(prompt);
                const content = resp.response.candidates[0].content.parts[0].text;
                let threats;
                try {
                    let jsonString = content.match(/```json\s*([\s\S]*?)\s*```/)?.[1] || content;
                    const firstBrace = jsonString.indexOf('[');
                    const lastBrace = jsonString.lastIndexOf(']');
                    jsonString = jsonString.substring(firstBrace, lastBrace + 1);
                    threats = JSON.parse(jsonString.trim());
                } catch(e) {
                    functions.logger.error(`[Activate Guardian] Failed to parse JSON from Gemini`, {rawResponse: content});
                    response.status(500).json({ error: 'AI returned an invalid response.' });
                    return;
                }

                // --- STEP D: SAVE ANY HIGH/MEDIUM RISK ALERTS TO FIRESTORE ---
                const highRiskAlerts = [];
                for (const threat of threats) {
                    if (threat.riskLevel === 'High' || threat.riskLevel === 'Medium') {
                        const today = new Date().toISOString().split('T')[0];
                        const sanitizedThreatName = threat.threatName.replace(/\s+/g, '').replace(/[.,()]/g, '-');
                        const alertId = `${farmId}_${sanitizedThreatName}_${today}`;
                        const alertData = {
                            userId, farmId, crop: currentCrop,
                            threatName: threat.threatName, threatType: threat.threatType,
                            riskLevel: threat.riskLevel, reasoning: threat.reasoning,
                            timestamp: admin.firestore.FieldValue.serverTimestamp()
                        };
                        await firestore.collection('pestAlerts').doc(alertId).set(alertData);
                        highRiskAlerts.push(alertData);
                        functions.logger.info(`[Activate Guardian] Saved high-risk alert: ${threat.threatName}`);
                    }
                }
                
                functions.logger.info(`[Activate Guardian] Completed activation and initial analysis for farm ${farmId}. Found ${highRiskAlerts.length} risks.`);
                
                // --- STEP E: RETURN THE INITIAL THREATS TO THE APP ---
                response.status(200).json({ success: true, initialThreats: highRiskAlerts });

            } catch (error) {
                functions.logger.error(`[Activate Guardian] An error occurred:`, error);
                if (!response.headersSent) {
                    response.status(500).json({ error: 'An unexpected error occurred while activating the Guardian Engine.' });
                }
            }
        });
    }
);
// =================================================================
// FUNCTION: AI ASSISTANT ("Smart Navigator") - UPGRADED VERSION
// =================================================================
exports.askAiAssistant = onCall(
    {
        region: LOCATION,
        memory: "1GiB",
        timeoutSeconds: 60,
        concurrency: 10
    },
    async (request) => {
        const query = request.data.query;
        const userId = request.auth?.uid;

        if (!query) {
            throw new HttpsError('invalid-argument', 'A query string is required.');
        }
        functions.logger.info(`[AI Assistant] Received query from user ${userId || 'anonymous'}: "${query}"`);

        try {
            // --- STEP 1: THE "ROUTING" AI CALL ---
            // First, we ask a specialized AI to classify the user's intent.
            const routerModel = vertex_ai.getGenerativeModel({ model: "gemini-1.5-pro-002" });
            const routingPrompt = `
                You are a classification AI. Your only job is to determine which category a user's question falls into.
                The available categories are:
                - "Market Prices": For questions about crop prices, when to sell, market trends, etc.
                - "Crop Diagnosis": For questions describing a sick plant, like "yellow leaves", "spots on my crop", etc.
                - "Pest Guardian": For questions about future risks, pests, diseases, or weather-related threats.
                - "Profit Planner": For questions about planning a new crop, profitability, costs, or business strategy.
                - "General Question": For any other farming-related question.

                User's Question: "${query}"

                Respond ONLY with a single, valid JSON object with one key: "tool". The value must be one of the exact category names above.
            `;
            
            const routerResp = await routerModel.generateContent(routingPrompt);
            const routerContent = routerResp.response.candidates[0].content.parts[0].text;
            const classification = JSON.parse(routerContent.replace(/```json/g, '').replace(/```/g, '').trim());

            functions.logger.info(`[AI Assistant] Intent classified as: ${classification.tool}`);

            // --- STEP 2: THE LOGIC SWITCH ---
            // Now, we decide what to do based on the classification.
            if (classification.tool !== "General Question") {
                // The question matches a special tool. Send a navigation command to the frontend.
                const navigationMessages = {
                    "Market Prices": "It looks like you're asking about market prices. I have a special tool for that. Would you like to go there?",
                    "Crop Diagnosis": "It sounds like you need to diagnose a crop. My Crop Doctor tool can help with that. Shall I take you there?",
                    "Pest Guardian": "For predicting future risks like pests, my Guardian AI is the best tool. Would you like to check your farm's status?",
                    "Profit Planner": "That sounds like a strategic question. My Profit Planner can help you create a business plan. Would you like to start?"
                };

                const response = {
                    type: "navigation",
                    tool: classification.tool, // e.g., "Market Prices"
                    message: navigationMessages[classification.tool] || `I have a special tool for that called ${classification.tool}. Would you like to go there?`
                };
                
                // We don't save navigations to chat history, but we could if we wanted to.
                functions.logger.info(`[AI Assistant] Responding with navigation command to tool: ${classification.tool}`);
                return response;
            }

            // --- STEP 3: THE "ANSWERING" AI CALL (Only for General Questions) ---
            functions.logger.info(`[AI Assistant] Answering as a general question.`);
            const answerModel = vertex_ai.getGenerativeModel({ model: "gemini-1.5-pro-002" });
            const answerPrompt = `
                You are "KisanAI", a friendly and highly knowledgeable AI assistant for Indian farmers. Your goal is to provide helpful, practical, and safe advice in simple language.
                **Rules:**
                1. Safety First: If advising on chemicals, ALWAYS include a strong safety warning.
                2. Practicality: Suggest low-cost or organic solutions first.
                3. Stay on Topic: Only answer about farming. Politely decline other topics.
                4. Be Concise: Use simple language and lists.
                ---
                Now, please answer the following farmer's question:
                **Question:** "${query}"
            `;

            const answerResp = await answerModel.generateContent(answerPrompt);
            const answerText = answerResp.response.candidates[0].content.parts[0].text;

            // Save the general conversation to Firestore
            if (userId) {
                await firestore.collection('users').doc(userId).collection('aiAssistantHistory').add({
                    query: query,
                    answer: answerText,
                    timestamp: admin.firestore.FieldValue.serverTimestamp()
                });
            }
            
            const response = {
                type: "answer",
                content: answerText
            };

            functions.logger.info(`[AI Assistant] Successfully generated and saved general answer for user ${userId || 'anonymous'}.`);
            return response;

        } catch (error) {
            functions.logger.error(`[AI Assistant] Critical error for user ${userId || 'anonymous'}:`, error);
            throw new HttpsError('internal', 'An error occurred while getting an answer from the AI assistant.');
        }
    }
);