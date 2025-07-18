const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { logger } = require("firebase-functions");

admin.initializeApp();
const firestore = admin.firestore();

exports.analyzePlantImage = functions
    .region("us-central1")
    .runWith({
        timeoutSeconds: 300,
        memory: "1GB",
    })
    .storage.object()
    .onFinalize(async (object) => {
        logger.info("Function triggered for file:", object.name);

        const filePath = object.name;
        const bucketName = object.bucket;
        const contentType = object.contentType;
        const PROJECT_ID = "project-kisan-finale";
        const LOCATION = "us-central1";

        if (!filePath || !filePath.startsWith("uploads/")) {
            logger.log("Not an uploads file. Skipping.");
            return;
        }

        try {
            const tokenResponse = await fetch(
                "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token",
                {
                    headers: { "Metadata-Flavor": "Google" },
                }
            );
            const tokenData = await tokenResponse.json();
            const accessToken = tokenData.access_token;

            const prompt =
                `You are an expert agronomist AI for Indian farmers. ` +
                `Respond ONLY with a valid JSON object. ` +
                `{"disease_name_english": "Name", "disease_name_kannada": "Name", ` +
                `"confidence_score": "Score", "description_kannada": "Desc", ` +
                `"remedy_kannada": "Remedy"}`;

            const requestBody = {
                contents: [
                    {
                        role: "user",
                        parts: [
                            {
                                file_data: {
                                    mime_type: contentType,
                                    file_uri: `gs://${bucketName}/${filePath}`,
                                },
                            },
                            { text: prompt },
                        ],
                    },
                ],
            };

            const apiEndpoint = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/gemini-1.5-pro-vision:streamGenerateContent`;

            logger.info("Sending request to Gemini REST API...");
            const geminiResponse = await fetch(apiEndpoint, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            // 🔍 Extra Error Logging
            if (!geminiResponse.ok) {
                const errorText = await geminiResponse.text();
                logger.error("Gemini API request failed with status", geminiResponse.status, errorText);
                return;
            }

            const responseData = await geminiResponse.json();
            logger.info("Full Gemini API Response:", JSON.stringify(responseData, null, 2));

            const modelResponseText =
                responseData?.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!modelResponseText) {
                logger.error("Could not find text in Gemini's response.", responseData);
                return;
            }

            logger.info("Successfully extracted text from Gemini:", modelResponseText);

            const cleanedJsonString = modelResponseText
                .trim()
                .replace(/^```json\s*/i, "")
                .replace(/```$/, "")
                .trim();

            let diagnosisData;
            try {
                diagnosisData = JSON.parse(cleanedJsonString);
            } catch (e) {
                logger.error("Failed to parse JSON. Raw response:", modelResponseText);
                throw e;
            }

            // Sanity check
            if (
                !diagnosisData.disease_name_kannada ||
                !diagnosisData.remedy_kannada
            ) {
                logger.error("Incomplete response from Gemini:", diagnosisData);
                return;
            }

            const diagnosisId = filePath.split("/").pop();
            await firestore
                .collection("diagnoses")
                .doc(diagnosisId)
                .set(diagnosisData);

            logger.info(`Successfully wrote diagnosis to Firestore.`);
        } catch (error) {
            logger.error("!!! CRITICAL ERROR inside function execution:", error, {
                structuredData: true,
            });
        }
    });



    // PROACTIVE MARKET ANALYST (FEATURE -2)

    // This is our new scheduled function.
// It will run automatically every day at 8 AM.
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { logger } = require("firebase-functions");

admin.initializeApp();
const firestore = admin.firestore();

// --- FUNCTION 1: CROP DOCTOR (on File Upload) ---
exports.analyzePlantImage = functions
    .region("asia-south1")
    .runWith({
        timeoutSeconds: 300,
        memory: "1GB",
    }).storage.object().onFinalize(async (object) => {
        logger.info("Function triggered for file:", object.name);

        const filePath = object.name;
        const bucketName = object.bucket;
        const contentType = object.contentType;
        const PROJECT_ID = "project-kisan-finale";
        const LOCATION = "asia-south1";

        if (!filePath || !filePath.startsWith("uploads/")) {
            logger.log("Not an uploads file. Skipping.");
            return;
        }

        try {
            const tokenResponse = await fetch('http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token', {
                headers: { 'Metadata-Flavor': 'Google' }
            });
            const tokenData = await tokenResponse.json();
            const accessToken = tokenData.access_token;
            
            const prompt = `You are an expert agronomist AI for Indian farmers. Respond ONLY with a valid JSON object. {"disease_name_english": "Name", "disease_name_kannada": "Name", "confidence_score": "Score", "description_kannada": "Desc", "remedy_kannada": "Remedy"}`;
            const requestBody = {
                contents: [{
                    role: "user",
                    parts: [
                        { file_data: { mime_type: contentType, file_uri: `gs://${bucketName}/${filePath}` } },
                        { text: prompt }
                    ]
                }]
            };
            
            const apiEndpoint = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/gemini-1.0-pro-vision:streamGenerateContent`;
            const geminiResponse = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            const responseData = await geminiResponse.json();
            logger.info("Full Gemini API Response:", JSON.stringify(responseData, null, 2));

            const modelResponseText = responseData?.[0]?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!modelResponseText) {
                logger.error("Could not find text in Gemini's response.", responseData);
                return;
            }
            
            const cleanedJsonString = modelResponseText.replace(/^```json\s*|```\s*$/g, "");
            const diagnosisData = JSON.parse(cleanedJsonString);
            
            const diagnosisId = filePath.split("/").pop();
            await firestore.collection("diagnoses").doc(diagnosisId).set(diagnosisData);
            logger.info(`Successfully wrote diagnosis to Firestore.`);

        } catch (error) {
            logger.error("!!! CRITICAL ERROR inside analyzePlantImage function:", error, { structuredData: true });
        }
    }); // <-- End of analyzePlantImage function

// --- FUNCTION 2: MARKET ANALYST (Scheduled) ---
exports.proactiveMarketAnalyst = functions
    .region("asia-south1")
    .pubsub.schedule("every day 08:00")
    .timeZone("Asia/Kolkata")
    .runWith({ memory: '512MB' })
    .onRun(async (context) => {
        logger.info("Executing Proactive Market Analyst function.");

        const CROP_NAME = "Tomato";
        const LOCATION = "asia-south1";
        const PROJECT_ID = "project-kisan-finale";

        try {
            const todayPrice = 1350;
            const historicalPrices = [1100, 1150, 1250, 1220, 1300];

            logger.info(`Analyzing ${CROP_NAME}: Today's Price=${todayPrice}, History=${historicalPrices.join(', ')}`);

            const tokenResponse = await fetch('http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token', {
                headers: { 'Metadata-Flavor': 'Google' }
            });
            const tokenData = await tokenResponse.json();
            const accessToken = tokenData.access_token;
            
            const prompt = `Analyze the price trend for ${CROP_NAME}. Today's price is ${todayPrice} INR per quintal. The prices for the last 5 days were: ${historicalPrices.join(', ')}. Based on this trend, provide a simple recommendation. Respond ONLY with a valid JSON object with two keys: {"recommendation": "Sell or Wait", "justification": "A very simple one-sentence justification in plain English."}`;
            const requestBody = {
                contents: [{ parts: [{ text: prompt }] }]
            };
            
            const apiEndpoint = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/gemini-1.0-pro:streamGenerateContent`;
            
            const geminiResponse = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            const responseData = await geminiResponse.json();
            logger.info("Full Gemini Response for Market Analyst:", JSON.stringify(responseData, null, 2));

            const modelResponseText = responseData?.[0]?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!modelResponseText) {
                logger.error("Could not find text in Market Analyst response.", responseData);
                return;
            }
            
            const analysisData = JSON.parse(modelResponseText);

            const today = new Date().toISOString().slice(0, 10);
            const documentId = `${CROP_NAME}-${today}`;

            await firestore.collection("market_analysis").doc(documentId).set(analysisData);
            logger.info(`Successfully wrote market analysis for ${documentId} to Firestore.`);

        } catch (error) {
            logger.error("!!! CRITICAL ERROR inside Market Analyst function:", error);
        }
        
        return null;
    }); // <-- End of proactiveMarketAnalyst function