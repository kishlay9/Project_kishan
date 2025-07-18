// =================================================================
// 1. FIREBASE CONFIGURATION
// =================================================================

// TODO: Replace this with your project's actual Firebase configuration!
// Find it in your Firebase project settings under "General".
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "project-kisan-finale",
    storageBucket: "project-kisan-finale.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);

const storage = firebase.storage();
const firestore = firebase.firestore();

// =================================================================
// 2. DOM ELEMENT REFERENCES
// =================================================================

const imageUploadInput = document.getElementById('image-upload-input');
const statusIndicator = document.getElementById('status-indicator');
const statusText = document.getElementById('status-text');
const resultsContainer = document.getElementById('results-container');
const diagnosisOutput = document.getElementById('diagnosis-output');
const speakButton = document.getElementById('speak-button');

// =================================================================
// 3. EVENT LISTENER FOR IMAGE UPLOAD
// =================================================================

imageUploadInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // --- UI Update: Start a new analysis ---
    resultsContainer.classList.add('hidden'); // Hide old results
    statusIndicator.classList.remove('hidden'); // Show loader
    statusText.textContent = `Uploading ${file.name}...`;

    const uniqueFileName = `image_${Date.now()}_${file.name}`;
    const storagePath = `uploads/${uniqueFileName}`;
    const storageRef = storage.ref(storagePath);
    
    // --- Upload Process ---
    const uploadTask = storageRef.put(file);

    uploadTask.on('state_changed', 
        (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            statusText.textContent = `Uploading... ${Math.round(progress)}%`;
        }, 
        (error) => {
            console.error("Upload failed:", error);
            statusText.textContent = "Upload failed. Please try again.";
        }, 
        () => {
            console.log('Upload complete! Waiting for analysis...');
            statusText.textContent = "Analyzing image with AI...";
            listenForDiagnosisResult(uniqueFileName);
        }
    );
});


// =================================================================
// 4. REAL-TIME LISTENER FOR DIAGNOSIS RESULTS
// =================================================================

function listenForDiagnosisResult(diagnosisId) {
    const docRef = firestore.collection("diagnoses").doc(diagnosisId);

    const unsubscribe = docRef.onSnapshot((doc) => {
        if (doc.exists) {
            console.log("Diagnosis data received:", doc.data());

            // --- UI Update: Show the results ---
            statusIndicator.classList.add('hidden');
            resultsContainer.classList.remove('hidden');

            const data = doc.data();
            displayDiagnosisResults(data);

            unsubscribe(); // Stop listening
        }
    }, (error) => {
        console.error("Error listening to Firestore:", error);
        statusText.textContent = "Error fetching diagnosis.";
        unsubscribe();
    });
}

// =================================================================
// 5. FUNCTION TO DISPLAY THE RESULTS
// =================================================================

function displayDiagnosisResults(data) {
    diagnosisOutput.innerHTML = `
        <p><strong>Disease</strong>${data.disease_name_english}</p>
        <p><strong>ರೋಗ (Kannada)</strong>${data.disease_name_kannada}</p>
        <p><strong>Description</strong>${data.description_kannada || 'No description available.'}</p>
        <p><strong>Remedy</strong>${data.remedy_kannada || 'No remedy suggested.'}</p>
    `;
    
    // TODO: Wire up the speak button to a Text-to-Speech function
    // speakButton.classList.remove('hidden'); 
}