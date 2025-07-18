// =================================================================
// 1. FIREBASE CONFIGURATION
// =================================================================

// TODO: Replace this with your project's actual Firebase configuration!
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
const actionPanel = document.querySelector('.action-panel');
const featuresGrid = document.querySelector('.features-grid');


// =================================================================
// 3. EVENT LISTENER FOR IMAGE UPLOAD
// =================================================================

imageUploadInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // --- UI Update: Start a new analysis ---
    hideResults(); // Clear any previous results and hide the container
    showStatus(`Uploading ${file.name}...`);

    const uniqueFileName = `image_${Date.now()}_${file.name}`;
    const storagePath = `uploads/${uniqueFileName}`;
    const storageRef = storage.ref(storagePath);
    
    // --- Upload Process with Progress ---
    const uploadTask = storageRef.put(file);

    uploadTask.on('state_changed', 
        (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            showStatus(`Uploading... ${Math.round(progress)}%`);
        }, 
        (error) => {
            console.error("Upload failed:", error);
            showStatus("Upload failed. Please try again.", true);
        }, 
        () => {
            console.log('Upload complete! Waiting for analysis...');
            showStatus("Analyzing image with AI...");
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
            
            const data = doc.data();
            displayDiagnosisResults(data);

            unsubscribe(); // Stop listening to this document
        }
    }, (error) => {
        console.error("Error listening to Firestore:", error);
        showStatus("Error fetching diagnosis.", true);
        unsubscribe();
    });
}

// =================================================================
// 5. UI HELPER FUNCTIONS FOR A CLEANER EXPERIENCE
// =================================================================

function showStatus(message, isError = false) {
    statusText.textContent = message;
    statusIndicator.style.borderColor = isError ? '#dc3545' : '#e5e5e5';
    statusIndicator.style.borderTopColor = isError ? '#dc3545' : '#007AFF';
    statusIndicator.classList.remove('hidden');
    
    // Animate the main content to focus on the status
    actionPanel.style.opacity = '0.5';
    featuresGrid.style.opacity = '0.5';
}

function hideStatus() {
    statusIndicator.classList.add('hidden');
    actionPanel.style.opacity = '1';
    featuresGrid.style.opacity = '1';
}

function displayDiagnosisResults(data) {
    hideStatus();
    resultsContainer.classList.remove('hidden');

    diagnosisOutput.innerHTML = `
        <p><strong>Disease</strong>${data.disease_name_english}</p>
        <p><strong>ರೋಗ (Kannada)</strong>${data.disease_name_kannada}</p>
        <p><strong>Description</strong>${data.description_kannada || 'No description available.'}</p>
        <p><strong>Remedy</strong>${data.remedy_kannada || 'No remedy suggested.'}</p>
    `;

    // Make the speak button functional and visible if there's text to speak
    const textToSpeak = data.remedy_kannada || data.description_kannada;
    if (textToSpeak) {
        speakButton.classList.remove('hidden');
        speakButton.onclick = () => speakText(textToSpeak);
    }
}

function hideResults() {
    resultsContainer.classList.add('hidden');
    speakButton.classList.add('hidden');
}


// =================================================================
// 6. TEXT-TO-SPEECH FUNCTIONALITY
// =================================================================

async function speakText(textToSpeak) {
    if (!textToSpeak) return;

    // TODO: This part will be replaced with a call to a new Cloud Function
    // For now, we use the browser's built-in speech synthesis for a quick demo.
    
    speakButton.textContent = 'Speaking...';
    speakButton.disabled = true;

    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        // We'll need to find the correct voice for Kannada.
        // For the demo, the default might work, or it might be in English.
        utterance.lang = 'kn-IN'; 
        
        utterance.onend = () => {
            speakButton.textContent = 'Listen to Remedy';
            speakButton.disabled = false;
        };

        window.speechSynthesis.speak(utterance);
    } else {
        alert("Sorry, your browser doesn't support Text-to-Speech.");
        speakButton.textContent = 'Listen to Remedy';
        speakButton.disabled = false;
    }
}