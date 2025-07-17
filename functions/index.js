const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { VertexAI } = require("@google-cloud/aiplatform");
const { logger } = require("firebase-functions");

admin.initializeApp();
const firestore = admin.firestore();

exports.analyzePlantImage = functions.runWith({
    timeoutSeconds: 300,
    memory: "1GB",
}).storage.object().onFinalize(async (object) => {
    logger.info("Function triggered for file:", object.name);

    const filePath = object.name;
    const bucketName = object.bucket;
    const contentType = object.contentType;

    if (!filePath || !filePath.startsWith("uploads/")) {
        logger.log("Not an uploads file. Skipping.");
        return;
    }

    try {
        // THE RUNTIME ERROR HAPPENS HERE. WE WILL FIX IT WITH PERMISSIONS.
        const vertex_ai = new VertexAI({
            project: "project-kisan-finale",
            location: "asia-south1",
        });

        const generativeModel = vertex_ai.getGenerativeModel({
            model: "gemini-1.0-pro-vision-001",
        });

        const prompt = `
          You are an expert agronomist AI for Indian farmers. Respond ONLY with a valid JSON object.
          {
            "disease_name_english": "Name of the disease",
            "disease_name_kannada": "Name in Kannada",
            "confidence_score": "Score from 0.0 to 1.0",
            "description_kannada": "Simple description in Kannada.",
            "remedy_kannada": "Simple remedy in Kannada."
          }
        `;

        const request = {
            contents: [{ 
                role: "user", 
                parts: [
                    { file_data: { mime_type: contentType, file_uri: `gs://${bucketName}/${filePath}` } },
                    { text: prompt }
                ]
            }],
        };

        logger.info("Sending request to Gemini...");
        const streamingResp = await generativeModel.generateContentStream(request);
        const aggregateResponse = await streamingResp.response;
        const modelResponseText = aggregateResponse.candidates[0].content.parts[0].text;
        
        logger.info("Received response from Gemini:", modelResponseText);

        const cleanedJsonString = modelResponseText.replace(/^```json\s*|```\s*$/g, "");
        const diagnosisData = JSON.parse(cleanedJsonString);
        
        const diagnosisId = filePath.split("/").pop();
        await firestore.collection("diagnoses").doc(diagnosisId).set(diagnosisData);
        logger.info(`Successfully wrote diagnosis to Firestore.`);

    } catch (error) {
        logger.error("!!! CRITICAL ERROR inside function execution:", error);
    }
});