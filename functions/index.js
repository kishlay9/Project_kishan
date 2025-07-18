// =================================================================
// SETUP
// =================================================================
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { logger } = require("firebase-functions");
const fetch = require("node-fetch");

admin.initializeApp();
const firestore = admin.firestore();

// =================================================================
// CONFIGURATION
// =================================================================
const PROJECT_ID = "project-kisan-new";
const BUCKET_NAME = "project-kisan-new.firebasestorage.app";
const LOCATION = "asia-south1";

// =================================================================
// FUNCTION 1: CROP DOCTOR (ANALYZE PLANT IMAGE)
// =================================================================
exports.analyzePlantImage = functions
    .region(LOCATION)
    .runWith({ timeoutSeconds: 300, memory: "1GB" })
    .storage.object()
    .onFinalize(async (object) => {
        const { name: filePath, bucket: bucketName, contentType } = object;
        if (!filePath || !filePath.startsWith("uploads/")) { return; }

        try {
            const tokenResponse = await fetch("http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token", { headers: { "Metadata-Flavor": "Google" } });
            const tokenData = await tokenResponse.json();
            const accessToken = tokenData.access_token;

            // --- START OF THE NEW, IMPROVED PROMPT ---
            const prompt = `You are a world-class AI agronomist, acting as a cautious and diligent personal assistant for small-scale Indian farmers. Your goal is to provide a comprehensive, accurate, and actionable diagnosis from a plant leaf image.

A CRITICAL part of your task is to correctly identify when a plant is HEALTHY. Do not guess a disease if the visual evidence is not clear.

Analyze the provided image and respond ONLY with a single, valid JSON object. Do not include any text, notes, or markdown formatting before or after the JSON.

Your JSON response MUST follow this exact structure:
{
  "disease_name_english": "The common English name of the disease. If healthy, MUST be 'Healthy'.",
  "disease_name_kannada": "The name in Kannada. If healthy, MUST be 'ಆರೋಗ್ಯಕರ'.",
  "confidence_score": "A numerical score from 0.0 to 1.0. If healthy, this MUST be 1.0.",
  "severity": "Rate the severity as 'Low', 'Medium', or 'High'. If healthy, this MUST be 'None'.",
  "contagion_risk": "Rate the risk of spreading to other plants as 'Low', 'Medium', or 'High'. If not contagious (e.g., nutrient deficiency), use 'Low'. If healthy, use 'None'.",
  "description_kannada": "A brief, one-sentence description of the issue in simple Kannada. If healthy, provide a positive message like 'ಎಲೆ ಆರೋಗ್ಯಕರವಾಗಿ ಮತ್ತು ರೋಗದ ಯಾವುದೇ ಲಕ್ಷಣಗಳಿಲ್ಲದೆ ಕಾಣುತ್ತಿದೆ.'",
  "organic_remedy_kannada": "A step-by-step remedy using organic methods (e.g., neem oil, compost tea). If healthy, suggest continued good care.",
  "chemical_remedy_kannada": "A step-by-step remedy suggesting a common type of chemical treatment (e.g., copper-based fungicide). Always include the advice 'ಪ್ಯಾಕೇಜ್‌ನಲ್ಲಿನ ಸೂಚನೆಗಳನ್ನು ಎಚ್ಚರಿಕೆಯಿಂದ ಅನುಸರಿಸಿ' (Follow package instructions carefully). If healthy, state 'ಅಗತ್ಯವಿಲ್ಲ' (Not required).",
  "prevention_tips_kannada": "A list of 2-3 bullet points starting with '*' detailing how to prevent this issue in the future (e.g., *ಬೆಳೆ ತಿರುಗುವಿಕೆ, *ಸರಿಯಾದ ನೀರು ನಿರ್ವಹಣೆ). If healthy, provide tips for maintaining good health."
}

Always be cautious. If you are not confident, use a low confidence_score. Your purpose is to help, not to guess.
`;
            // --- END OF THE NEW, IMPROVED PROMPT ---

            const requestBody = { contents: [{ role: "user", parts: [{ file_data: { mime_type: contentType, file_uri: `gs://${bucketName}/${filePath}` } }, { text: prompt }] }] };
            const apiEndpoint = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/gemini-1.5-pro-002:generateContent`;
            
            const geminiResponse = await fetch(apiEndpoint, { method: "POST", headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }, body: JSON.stringify(requestBody) });
            const responseData = await geminiResponse.json();
            logger.info("Full Gemini API Response:", JSON.stringify(responseData, null, 2));

            const modelResponseText = responseData?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!modelResponseText) { logger.error("Could not find text in Gemini's response.", responseData); return; }

            const cleanedJsonString = modelResponseText.replace(/^```json\s*|```\s*$/g, "");
            const diagnosisData = JSON.parse(cleanedJsonString);
            
            const diagnosisId = filePath.split("/").pop();
            await firestore.collection("diagnoses").doc(diagnosisId).set(diagnosisData);
            logger.info(`Successfully wrote diagnosis to Firestore.`);
        } catch (error) {
            logger.error("!!! CRITICAL ERROR inside analyzePlantImage function:", error, { structuredData: true });
        }
    });



// =================================================================
// FUNCTION 2: MARKET ANALYST (SCHEDULED)
// =================================================================
exports.proactiveMarketAnalyst = functions
    .region(LOCATION)
    .pubsub.schedule("every day 08:00").timeZone("Asia/Kolkata").onRun(async (context) => {
        const CROP_NAME = "Tomato";
        try {
            // CORRECTED: Fixed the syntax error here
            const todayPrice = 1350;
            const historicalPrices = [1100, 1150, 1250, 1220, 1300];

            const tokenResponse = await fetch('http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token', { headers: { 'Metadata-Flavor': 'Google' } });
            const tokenData = await tokenResponse.json();
            const accessToken = tokenData.access_token;
            const prompt = `Analyze the price trend for ${CROP_NAME}. Today's price is ${todayPrice} INR per quintal. The prices for the last 5 days were: ${historicalPrices.join(', ')}. Respond ONLY with a valid JSON object with two keys: {"recommendation": "Sell or Wait", "justification": "A very simple one-sentence justification in plain English."}`;
            const requestBody = { contents: [{ parts: [{ text: prompt }] }] };
            
            // Using the non-streaming endpoint
            const apiEndpoint = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/gemini-1.0-pro:generateContent`;
            
            const geminiResponse = await fetch(apiEndpoint, { method: 'POST', headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify(requestBody) });
            const responseData = await geminiResponse.json();
            
            // CORRECTED: Reading the non-streaming response structure
            const modelResponseText = responseData?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!modelResponseText) { logger.error("Could not find text in Market Analyst response.", responseData); return; }
            
            const analysisData = JSON.parse(modelResponseText);
            const today = new Date().toISOString().slice(0, 10);
            const documentId = `${CROP_NAME}-${today}`;
            await firestore.collection("market_analysis").doc(documentId).set(analysisData);
            logger.info(`Successfully wrote market analysis for ${documentId} to Firestore.`);
        } catch (error) { logger.error("!!! CRITICAL ERROR inside Market Analyst function:", error); }
    });

// =================================================================
// FUNCTION 3: KNOWLEDGE BASE UPDATER (THE LIBRARIAN)
// =================================================================
const cheerio = require("cheerio");
exports.updateKnowledgeBase = functions
    .region(LOCATION)
    .pubsub.schedule("every 24 hours").onRun(async (context) => {
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
    });