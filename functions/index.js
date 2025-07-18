// =================================================================
// SETUP - This runs only ONCE at the top.
// =================================================================
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { logger } = require("firebase-functions");

// We need to require 'node-fetch' because the old Node.js 18 runtime
// of 1st Gen functions doesn't have 'fetch' built-in.
const fetch = require("node-fetch");

// Initialize the Firebase Admin SDK and Firestore ONCE.
admin.initializeApp();
const firestore = admin.firestore();

// =================================================================
// FUNCTION 1: CROP DOCTOR (ANALYZE PLANT IMAGE)
// Triggered by a file upload to Cloud Storage.
// =================================================================
exports.analyzePlantImage = functions
    .region("asia-south1") // Keep all resources in the same region
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
        const LOCATION = "asia-south1";

        if (!filePath || !filePath.startsWith("uploads/")) {
            logger.log("File is not in the 'uploads/' folder. Skipping.");
            return;
        }

        try {
            // Get an access token to authenticate the API call
            const tokenResponse = await fetch(
                "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token",
                {
                    headers: { "Metadata-Flavor": "Google" },
                }
            );
            const tokenData = await tokenResponse.json();
            const accessToken = tokenData.access_token;

            // Define the instructions for the AI
            const prompt =
                `You are an expert agronomist AI for Indian farmers. ` +
                `Respond ONLY with a valid JSON object. ` +
                `{"disease_name_english": "Name", "disease_name_kannada": "Name", ` +
                `"confidence_score": "Score", "description_kannada": "Desc", ` +
                `"remedy_kannada": "Remedy"}`;

            // Prepare the request body for the Gemini API
            const requestBody = {
                contents: [
                    {
                        role: "user",
                        parts: [
                            { file_data: { mime_type: contentType, file_uri: `gs://${bucketName}/${filePath}` } },
                            { text: prompt },
                        ],
                    },
                ],
            };

            // Call the Gemini Vision model
            const apiEndpoint = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/gemini-1.0-pro-vision:streamGenerateContent`;
            const geminiResponse = await fetch(apiEndpoint, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            const responseData = await geminiResponse.json();
            logger.info("Full Gemini API Response:", JSON.stringify(responseData, null, 2));

            // Safely extract the text from the AI's response
            const modelResponseText = responseData?.[0]?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!modelResponseText) {
                logger.error("Could not find text in Gemini's response. This might be a permission or billing issue.", responseData);
                return;
            }

            // Clean up and parse the JSON response
            const cleanedJsonString = modelResponseText.replace(/^```json\s*|```\s*$/g, "");
            const diagnosisData = JSON.parse(cleanedJsonString);

            // Save the result to the database
            const diagnosisId = filePath.split("/").pop();
            await firestore.collection("diagnoses").doc(diagnosisId).set(diagnosisData);
            logger.info(`Successfully wrote diagnosis to Firestore.`);

        } catch (error) {
            logger.error("!!! CRITICAL ERROR inside analyzePlantImage function:", error, { structuredData: true });
        }
    });

// =================================================================
// FUNCTION 2: MARKET ANALYST (SCHEDULED)
// Runs every day at 8 AM.
// =================================================================
exports.proactiveMarketAnalyst = functions
    .region("asia-south1")
    .pubsub.schedule("every day 08:00")
    .timeZone("Asia/Kolkata")
    .onRun(async (context) => {
        logger.info("Executing Proactive Market Analyst function.");

        const CROP_NAME = "Tomato";
        const LOCATION = "asia-south1";
        const PROJECT_ID = "project-kisan-finale";

        try {
            // For the prototype, we use fake price data.
            const todayPrice = 1350;
            const historicalPrices = [1100, 1150, 1250, 1220, 1300];

            // Get an access token
            const tokenResponse = await fetch('http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token', {
                headers: { 'Metadata-Flavor': 'Google' }
            });
            const tokenData = await tokenResponse.json();
            const accessToken = tokenData.access_token;
            
            // Define the instructions for the AI
            const prompt = `Analyze the price trend for ${CROP_NAME}. Today's price is ${todayPrice} INR per quintal. The prices for the last 5 days were: ${historicalPrices.join(', ')}. Respond ONLY with a valid JSON object with two keys: {"recommendation": "Sell or Wait", "justification": "A very simple one-sentence justification in plain English."}`;
            const requestBody = { contents: [{ parts: [{ text: prompt }] }] };
            
            // Call the Gemini Pro (text-only) model
            const apiEndpoint = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/gemini-1.0-pro:streamGenerateContent`;
            const geminiResponse = await fetch(apiEndpoint, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            const responseData = await geminiResponse.json();
            logger.info("Full Gemini Response for Market Analyst:", JSON.stringify(responseData, null, 2));

            // Safely extract text and parse the JSON
            const modelResponseText = responseData?.[0]?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!modelResponseText) {
                logger.error("Could not find text in Market Analyst response. This might be a permission or billing issue.", responseData);
                return;
            }
            const analysisData = JSON.parse(modelResponseText);

            // Save the result to the database
            const today = new Date().toISOString().slice(0, 10);
            const documentId = `${CROP_NAME}-${today}`;

            await firestore.collection("market_analysis").doc(documentId).set(analysisData);
            logger.info(`Successfully wrote market analysis for ${documentId} to Firestore.`);

        } catch (error) {
            logger.error("!!! CRITICAL ERROR inside Market Analyst function:", error);
        }
    });


// =================================================================
// FUNCTION 3: KNOWLEDGE BASE UPDATER (THE LIBRARIAN)
// Scheduled to run daily to scrape and update our knowledge base.
// =================================================================
const cheerio = require("cheerio"); // The web scraping library we just installed

exports.updateKnowledgeBase = functions
    .region("asia-south1")
    .pubsub.schedule("every 24 hours")
    .onRun(async (context) => {
        logger.info("Starting knowledge base update process.");

        // For this prototype, we will scrape one specific, reliable page.
        // The Press Information Bureau (PIB) is a great source for scheme updates.
        const URL_TO_SCRAPE = "https://pib.gov.in/PressReleasePage.aspx?PRID=1945323";
        const BUCKET_NAME = "project-kisan-finale.appspot.com"; // Your default bucket name
        const FILE_PATH = "knowledge-base/pib_agri_schemes.txt";

        try {
            logger.info(`Fetching content from: ${URL_TO_SCRAPE}`);
            const response = await fetch(URL_TO_SCRAPE);
            if (!response.ok) {
                logger.error(`Failed to fetch URL with status: ${response.status}`);
                return null;
            }
            const html = await response.text();

            // Use cheerio to load the HTML, like loading a webpage in a browser
            const $ = cheerio.load(html);

            // Extract text from a specific part of the page.
            // We use a CSS selector. You find this by using "Inspect Element" in your browser.
            // For this PIB page, the main content is inside a 'div' with the class 'PrintRelease'.
            const scrapedText = $('.PrintRelease').text();

            if (!scrapedText || scrapedText.trim() === "") {
                logger.warn("Scraped text is empty. Aborting update.");
                return null;
            }

            // Clean up the text: remove extra whitespace and newlines
            const cleanedText = scrapedText.replace(/\s+/g, ' ').trim();
            logger.info(`Successfully scraped and cleaned ${cleanedText.length} characters of text.`);

            // Get a reference to our Cloud Storage file
            const storage = admin.storage();
            const file = storage.bucket(BUCKET_NAME).file(FILE_PATH);

            // Save the new text to the file in Cloud Storage.
            // This will create the file if it doesn't exist or overwrite it if it does.
            await file.save(cleanedText);
            logger.info(`Successfully saved updated knowledge to gs://${BUCKET_NAME}/${FILE_PATH}`);

        } catch (error) {
            logger.error("!!! CRITICAL ERROR inside updateKnowledgeBase function:", error);
        }

        return null;
    });