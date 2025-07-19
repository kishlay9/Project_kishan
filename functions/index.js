// =================================================================
// SETUP (WITH NEW v2 IMPORTS)
// =================================================================
// NOTE: Removed duplicate SETUP block comment.
// IMPORTANT: If you are still getting local deployment errors (ReferenceError or ERR_PACKAGE_PATH_NOT_EXPORTED),
// you might need to manually apply the symlink or direct copy workaround as discussed.
// The import paths below are the officially correct v2 paths.
const { onObjectFinalized } = require("firebase-functions/v2/storage");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");
const { logger } = require("firebase-functions");
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const { TextToSpeechClient } = require('@google-cloud/text-to-speech');

admin.initializeApp();
const firestore = admin.firestore();
const ttsClient = new TextToSpeechClient();

// =================================================================
// CONFIGURATION
// =================================================================
const PROJECT_ID = "project-kisan-new";
const BUCKET_NAME = "project-kisan-new.firebasestorage.app";
const LOCATION = "asia-south1";

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


            // --- More robust audioFileName creation (already there, just part of the final structure) ---
            let baseFileName = "analysis-output";
            if (filePath && typeof filePath === 'string') {
                const parts = filePath.split('/');
                const lastPart = parts[parts.length - 1];
                if (lastPart) {
                    baseFileName = lastPart.replace(/\.[^/.]+$/, "");
                }
            } else {
                logger.warn(`[AudioFile] filePath was not a valid string: ${filePath}. Using default name.`);
            }
            const audioFileName = `${baseFileName}.mp3`;

            logger.info(`[AudioFile] Attempting to save audio to: audio-output/${audioFileName}`);

            const audioFile = admin.storage().bucket(bucketName).file(`audio-output/${audioFileName}`);
            await audioFile.save(ttsResponse.audioContent);
            await audioFile.makePublic();
            const audioUrl = audioFile.publicUrl();
            logger.info(`[AudioFile] Audio file created: ${audioUrl}`);

            diagnosisData.audio_remedy_url = audioUrl;
            
            // --- More robust diagnosisId creation and Firestore path (already there, just part of the final structure) ---
            let diagnosisId = baseFileName;
            if (!diagnosisId || diagnosisId.trim() === '') {
                diagnosisId = `diagnosis-${new Date().getTime()}`;
                logger.warn(`[Firestore] diagnosisId was empty/invalid. Using timestamp as fallback: ${diagnosisId}`);
            }
            await firestore.collection("diagnoses").doc(diagnosisId).set(diagnosisData); 
            logger.info(`[Firestore] Successfully wrote complete diagnosis with audio to Firestore (ID: ${diagnosisId}).`);
        } catch (error) {
            logger.error(`!!! CRITICAL ERROR in analysis for file "${filePath}":`, error, { structuredData: true });
        }
    }
);

// =================================================================
// FUNCTION 2: MARKET ANALYST (SCHEDULED) - v2 SYNTAX
// =================================================================
exports.proactiveMarketAnalyst = onSchedule(
    {
        schedule: "every day 08:00",
        timeZone: "Asia/Kolkata",
        region: LOCATION
    },
    async (event) => {
        const CROP_NAME = "Tomato";
        try {
            const todayPrice = 1350;
            const historicalPrices = [1100, 1150, 1250, 1220, 1300];
            const tokenResponse = await fetch('http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token', { headers: { 'Metadata-Flavor': 'Google' } });
            const tokenData = await tokenResponse.json();
            const accessToken = tokenData.access_token;
            // Current model for Market Analyst remains Gemini 1.0 Pro
            const prompt = `Analyze the price trend for ${CROP_NAME} based on today's price of ${todayPrice} INR and historical prices from the last 5 days: ${historicalPrices.join(", ")} INR. Provide an analysis for Indian farmers, including price trend (e.g., "rising", "falling", "stable"), key factors influencing the trend, and actionable advice. Respond ONLY with a single, valid JSON object using the exact structure and keys below.

            {
              "crop_name": "Tomato",
              "date": "YYYY-MM-DD",
              "current_price_inr": 1350,
              "price_trend": "Rising/Falling/Stable",
              "factors_influencing_trend": ["Factor 1", "Factor 2"],
              "actionable_advice": ["Advice 1", "Advice 2"]
            }`;
            const requestBody = { contents: [{ parts: [{ text: prompt }] }] };
            const apiEndpoint = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/gemini-1.0-pro:generateContent`;
            const geminiResponse = await fetch(apiEndpoint, { method: 'POST', headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify(requestBody) });
            const responseData = await geminiResponse.json();
            const modelResponseText = responseData?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!modelResponseText) { logger.error("Could not find text in Market Analyst response.", responseData); return; }
            const analysisData = JSON.parse(modelResponseText);
            const today = new Date().toISOString().slice(0, 10);
            const documentId = `${CROP_NAME}-${today}`;
            await firestore.collection("market_analysis").doc(documentId).set(analysisData);
            logger.info(`Successfully wrote market analysis for ${documentId} to Firestore.`);
        } catch (error) { logger.error("!!! CRITICAL ERROR inside Market Analyst function:", error); }
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