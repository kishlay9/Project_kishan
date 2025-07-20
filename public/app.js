// =================================================================
// 1. FIREBASE CONFIGURATION
// =================================================================

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "project-kisan-new",
    storageBucket: "project-kisan-new.firebasestorage.app",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);

const storage = firebase.storage();
const firestore = firebase.firestore();

// --- ADD THIS ENTIRE BLOCK ---
if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    console.log("LOCALHOST DETECTED: Forcing connection to local emulators...");
    firestore.useEmulator("localhost", 8080);
    storage.useEmulator("localhost", 9199);
}
// --- END OF BLOCK ---
// =================================================================
// 2. DOM ELEMENT REFERENCES
// =================================================================

const imageUploadInput = document.getElementById('image-upload-input');
const statusIndicator = document.getElementById('status-indicator');
const statusText = document.getElementById('status-text');
const resultsContainer = document.getElementById('results-container');
const speakButton = document.getElementById('speak-button');
const actionPanel = document.querySelector('.action-panel');
const featuresGrid = document.querySelector('.features-grid');

// =================================================================
// 3. EVENT LISTENER FOR IMAGE UPLOAD
// =================================================================

imageUploadInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    hideResults();
    showStatus(`Uploading ${file.name}...`);

    const uniqueFileName = `image_${Date.now()}_${file.name}`;
    const storagePath = `uploads/${uniqueFileName}`;
    const storageRef = storage.ref(storagePath);
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
            unsubscribe();
        }
    }, (error) => {
        console.error("Error listening to Firestore:", error);
        showStatus("Error fetching diagnosis.", true);
        unsubscribe();
    });
}

// =================================================================
// 5. UI HELPER FUNCTIONS
// =================================================================

function showStatus(message, isError = false) {
    statusText.textContent = message;
    const spinner = statusIndicator.querySelector('.spinner');
    if (spinner) {
        spinner.style.borderColor = isError ? '#dc3545' : '#e5e5e5';
        spinner.style.borderTopColor = isError ? '#dc3545' : '#007AFF';
    }
    statusIndicator.classList.remove('hidden');
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
    // Stop any currently playing audio
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
    }
}

// =================================================================
// 6. FUNCTION TO DISPLAY THE RESULTS (UPGRADED FOR NEW BACKEND)
// =================================================================

function displayDiagnosisResults(data) {
    hideStatus();
    resultsContainer.classList.remove('hidden');

    // --- Populate Header ---
    document.getElementById('result-title-english').textContent = data.disease_name_english || 'N/A';
    document.getElementById('result-plant-type').textContent = `(${data.plant_type || data.object_category || 'Object'})`;
    
    const confidenceSpan = document.getElementById('result-confidence');
    const confidencePercent = (data.confidence_score * 100).toFixed(0);
    confidenceSpan.textContent = `${confidencePercent}% Confident`;
    
    // Confidence Colors (0-51 red, 52-74 yellow, 75+ green)
    if (confidencePercent >= 75) {
        confidenceSpan.style.backgroundColor = '#d4edda';
        confidenceSpan.style.color = '#155724';
    } else if (confidencePercent >= 52) {
        confidenceSpan.style.backgroundColor = '#fff3cd';
        confidenceSpan.style.color = '#856404';
    } else {
        confidenceSpan.style.backgroundColor = '#f8d7da';
        confidenceSpan.style.color = '#721c24';
    }

    // --- Populate Detail Cards ---
    document.getElementById('result-severity').textContent = data.severity || 'N/A';
    document.getElementById('result-risk').textContent = data.contagion_risk || 'N/A';
    
    // --- Populate Text Sections using the ENGLISH fields from the new backend ---
    document.getElementById('result-description-english').textContent = data.description_english || 'No description available.';
    document.getElementById('result-description-kannada').textContent = ""; // Clear Kannada field as it's not provided now
    
    document.getElementById('result-organic-english').textContent = data.organic_remedy_english || 'No organic remedy suggested.';
    document.getElementById('result-organic-kannada').textContent = "";

    document.getElementById('result-chemical-english').textContent = data.chemical_remedy_english || 'No chemical remedy suggested.';
    document.getElementById('result-chemical-kannada').textContent = "";

    // --- Populate Prevention Tips ---
    const preventionDiv = document.getElementById('result-prevention');
    const tipsArray = data.prevention_tips_english || [];
    if (tipsArray.length > 0) {
        let tipsHtml = '<ul>';
        tipsArray.forEach(tip => {
            tipsHtml += `<li>${tip.trim()}</li>`;
        });
        tipsHtml += '</ul>';
        preventionDiv.innerHTML = tipsHtml;
    } else {
        preventionDiv.innerHTML = `<p>No prevention tips available.</p>`;
    }

    // --- Automatically play the pre-generated audio ---
    if (data.audio_remedy_url) {
        speakAudioFromUrl(data.audio_remedy_url);
        speakButton.classList.remove('hidden');
        speakButton.onclick = () => speakAudioFromUrl(data.audio_remedy_url);
    }
}

// =================================================================
// 7. FUNCTION TO PLAY AUDIO FROM A URL
// =================================================================

function speakAudioFromUrl(url) {
    if (!url) {
        console.error("No audio URL provided.");
        return;
    }

    const remedyAudio = document.getElementById('remedy-audio');
    const speakButton = document.getElementById('speak-button');

    // Set the source of the audio player to the URL from Firebase
    remedyAudio.src = url;

    // --- Manage Button State ---
    remedyAudio.onplay = () => {
        speakButton.textContent = 'Playing...';
        speakButton.disabled = true;
    };

    remedyAudio.onended = () => {
        speakButton.textContent = 'Listen to Summary';
        speakButton.disabled = false;
    };

    remedyAudio.onerror = (e) => {
        console.error("Error playing audio from URL:", url, e);
        speakButton.textContent = 'Audio Error';
        speakButton.disabled = false; 
    };

    // --- Play the audio ---
    const playPromise = remedyAudio.play();

    // In modern browsers, play() returns a promise.
    // This helps catch errors if the browser blocks autoplay.
    if (playPromise !== undefined) {
        playPromise.catch(error => {
            console.error("Audio playback failed:", error);
            // Autoplay was likely prevented. The user may need to click the button.
            speakButton.textContent = 'Listen to Summary';
            speakButton.disabled = false;
        });
    }
}