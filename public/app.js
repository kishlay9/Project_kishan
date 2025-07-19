// =================================================================
// 1. FIREBASE CONFIGURATION
// =================================================================

// TODO: Replace this with your project's actual Firebase configuration!
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC4Aeebs6yLYHq-ZlDDMpUcTwvCYX48KRg",
  authDomain: "project-kisan-new.firebaseapp.com",
  projectId: "project-kisan-new",
  storageBucket: "project-kisan-new.firebasestorage.app",
  messagingSenderId: "176046173818",
  appId: "1:176046173818:web:de8fb0e50752c8f62195c3",
  measurementId: "G-GDJE785E2N"
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
    // Safely select the spinner to avoid errors
    const spinner = statusIndicator.querySelector('.spinner');
    if (spinner) {
        spinner.style.borderColor = isError ? '#dc3545' : '#e5e5e5';
        spinner.style.borderTopColor = isError ? '#dc3545' : '#007AFF';
    }
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

function hideResults() {
    resultsContainer.classList.add('hidden');
    speakButton.classList.add('hidden');
}
// =================================================================
// 6. FUNCTION TO DISPLAY THE RESULTS (NEW & IMPROVED)
// =================================================================

function displayDiagnosisResults(data) {
    // Hide the main status loader
    hideStatus();
    // Make the results container visible
    resultsContainer.classList.remove('hidden');

    // --- Populate Header ---
    document.getElementById('result-title').textContent = data.disease_name_english;
    const confidenceSpan = document.getElementById('result-confidence');
    const confidencePercent = (data.confidence_score * 100).toFixed(0);
    confidenceSpan.textContent = `${confidencePercent}% Confident`;
    
    // Set color based on confidence
    if (data.confidence_score > 0.8) {
        confidenceSpan.style.backgroundColor = '#d4edda'; // green
        confidenceSpan.style.color = '#155724';
    } else if (data.confidence_score > 0.5) {
        confidenceSpan.style.backgroundColor = '#fff3cd'; // yellow
        confidenceSpan.style.color = '#856404';
    } else {
        confidenceSpan.style.backgroundColor = '#f8d7da'; // red
        confidenceSpan.style.color = '#721c24';
    }

    // --- Populate Detail Cards ---
    document.getElementById('result-severity').textContent = data.severity;
    document.getElementById('result-risk').textContent = data.contagion_risk;
    
    // --- Populate Text Sections ---
    document.getElementById('result-description').textContent = data.description_kannada;
    document.getElementById('result-organic').textContent = data.organic_remedy_kannada;
    document.getElementById('result-chemical').textContent = data.chemical_remedy_kannada;

    // --- Populate Prevention Tips (handle bullet points) ---
    const preventionDiv = document.getElementById('result-prevention');
    const tips = data.prevention_tips_kannada.split('*').filter(tip => tip.trim() !== '');
    if (tips.length > 0) {
        let tipsHtml = '<ul>';
        tips.forEach(tip => {
            tipsHtml += `<li>${tip.trim()}</li>`;
        });
        tipsHtml += '</ul>';
        preventionDiv.innerHTML = tipsHtml;
    } else {
        preventionDiv.innerHTML = `<p>${data.prevention_tips_kannada}</p>`;
    }


    // Make the speak button functional and visible
    const textToSpeak = `The diagnosis is ${data.disease_name_english}. The recommended organic remedy is: ${data.organic_remedy_kannada}`;
    if (textToSpeak) {
        speakButton.classList.remove('hidden');
        speakButton.onclick = () => speakText(textToSpeak);
    }
}


// =================================================================
// 7. TEXT-TO-SPEECH FUNCTIONALITY
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