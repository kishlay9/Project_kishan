// =================================================================
// SETUP (WITH NEW v2 IMPORTS)
// =================================================================
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
        if (!filePath || !filePath.startsWith("uploads/")) { return; }

        try {
            const tokenResponse = await fetch("http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token", { headers: { "Metadata-Flavor": "Google" } });
            const tokenData = await tokenResponse.json();
            const accessToken = tokenData.access_token;
            const apiEndpoint = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/gemini-1.5-pro-002:generateContent`;

            const diagnosisPrompt = `
            You are a world-class AI agronomist for Indian farmers...`; // Full prompt remains the same
            
           
            const requestBody = { 
                contents: [{ 
                    parts: [
                        { file_data: { mime_type: contentType, file_uri: `gs://${bucketName}/${filePath}` } }, 
                        { text: diagnosisPrompt }
                    ] 
                }] 
            };
            const geminiResponse = await fetch(apiEndpoint, { method: "POST", headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }, body: JSON.stringify(requestBody) });
            const responseData = await geminiResponse.json();
            logger.info("Full Diagnosis Response:", JSON.stringify(responseData, null, 2));

            const modelResponseText = responseData?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!modelResponseText) { throw new Error("Did not receive a valid diagnosis from the AI."); }
            const diagnosisData = JSON.parse(modelResponseText.replace(/^```json\s*|```\s*$/g, ""));
            logger.info("Diagnosis received:", diagnosisData);

            const textToSpeak = `ರೋಗ: ${diagnosisData.disease_name_kannada}. ವಿವರಣೆ: ${diagnosisData.description_kannada}. ಸಾವಯವ ಪರಿಹಾರ: ${diagnosisData.organic_remedy_kannada}.`;
            const ttsRequest = { input: { text: textToSpeak }, voice: { languageCode: 'kn-IN', name: 'kn-IN-Wavenet-A' }, audioConfig: { audioEncoding: 'MP3' } };
            const [ttsResponse] = await ttsClient.synthesizeSpeech(ttsRequest);
            const audioFileName = `${filePath.split('/').pop()}.mp3`;
            const audioFile = admin.storage().bucket(bucketName).file(`audio-output/${audioFileName}`);
            await audioFile.save(ttsResponse.audioContent);
            await audioFile.makePublic();
            const audioUrl = audioFile.publicUrl();
            logger.info(`Audio file created: ${audioUrl}`);

            diagnosisData.audio_remedy_url = audioUrl;
            const diagnosisId = filePath.split("/").pop();
            await firestore.collection("diagnoses").doc(diagnosisId).set(diagnosisData);
            logger.info(`Successfully wrote complete diagnosis with audio to Firestore.`);
        } catch (error) {
            logger.error("!!! CRITICAL ERROR in analysis:", error, { structuredData: true });
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
            const prompt = `Analyze the price trend for ${CROP_NAME}...`; // Full prompt remains the same
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