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

if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    console.log("LOCALHOST DETECTED: Forcing connection to local emulators...");
    try {
        firestore.useEmulator("127.0.0.1", 8080); // Using IP for robustness
        storage.useEmulator("127.0.0.1", 9199);   // Using IP for robustness
    } catch (e) {
        console.error("Error setting up emulators.", e);
    }
}

// =================================================================
// 2. DOM ELEMENT REFERENCES
// =================================================================
const imageUploadInput = document.getElementById('image-upload-input');
const statusIndicator = document.getElementById('status-indicator');
const statusText = document.getElementById('status-text');
const resultsContainer = document.getElementById('results-container');
const speakButton = document.getElementById('speak-button');
const actionPanel = document.querySelector('.action-panel');

// =================================================================
// 3. CORE LOGIC: IMAGE UPLOAD (WITH ROBUST PROMISE-BASED FIX)
// =================================================================
imageUploadInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    hideResults();
    showStatus(`Uploading ${file.name}...`);
    statusIndicator.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Get the selected language to pass to the backend function
    const lang = localStorage.getItem('project-kisan-lang') || 'en';
    
    const uniqueFileName = `image_${Date.now()}_${file.name}`;
    const storagePath = `uploads/${uniqueFileName}`;
    const storageRef = storage.ref(storagePath);
    
    // Pass language in metadata
    const metadata = {
        customMetadata: {
            'language': lang
        }
    };
    const uploadTask = storageRef.put(file, metadata);

    // Attach a listener for progress updates
    uploadTask.on('state_changed', (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        showStatus(`Uploading... ${Math.round(progress)}%`);
    });

    // Use .then() for success and .catch() for failure
    uploadTask
        .then(snapshot => {
            console.log('SUCCESS: Upload is confirmed complete by the server.');
            showStatus("Analyzing image with AI...");
            listenForDiagnosisResult(uniqueFileName);
        })
        .catch(error => {
            console.error("!!! UPLOAD FAILED:", error);
            let errorMessage = `Upload failed: ${error.code}.`;
            if (error.code === 'storage/unauthorized') {
                errorMessage += " Check your storage.rules.";
            } else if (error.code === 'storage/unknown') {
                errorMessage += " Network error. Is the emulator running?";
            }
            showStatus(errorMessage, true);
        });
});


// =================================================================
// 4. REAL-TIME LISTENER FOR DIAGNOSIS RESULTS
// =================================================================
function listenForDiagnosisResult(diagnosisId) {
    const docRef = firestore.collection("diagnoses").doc(diagnosisId);
    
    const timeout = setTimeout(() => {
        console.error("Firestore listener timed out.");
        showStatus("Analysis is taking longer than expected. Please check function logs.", true);
        unsubscribe();
    }, 60000);

    const unsubscribe = docRef.onSnapshot((doc) => {
        if (doc.exists) {
            clearTimeout(timeout);
            console.log("SUCCESS: Diagnosis data received from Firestore:", doc.data());
            const data = doc.data();
            displayDiagnosisResults(data);
            unsubscribe();
            resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, (error) => {
        clearTimeout(timeout);
        console.error("Error listening to Firestore:", error);
        showStatus("Error fetching diagnosis results.", true);
        unsubscribe();
    });
}

// =================================================================
// 5. UI HELPER FUNCTIONS TO MANAGE PAGE STATE
// =================================================================

function showStatus(message, isError = false) {
    statusText.textContent = message;
    const spinner = statusIndicator.querySelector('.spinner');
    if (spinner) {
        spinner.style.borderTopColor = isError ? '#ef4444' : 'var(--primary-color)';
    }
    statusIndicator.classList.remove('hidden');
    actionPanel.style.opacity = '0.5';
}

function hideStatus() {
    statusIndicator.classList.add('hidden');
    actionPanel.style.opacity = '1';
}

function hideResults() {
    resultsContainer.classList.add('hidden');
    const remedyAudio = document.getElementById('remedy-audio');
    if (remedyAudio && !remedyAudio.paused) {
        remedyAudio.pause();
        remedyAudio.currentTime = 0;
    }
}

// =================================================================
// 6. FUNCTION TO DISPLAY THE FINAL RESULTS ON THE PAGE (LANGUAGE AWARE)
// =================================================================

function displayDiagnosisResults(data) {
    hideStatus();
    resultsContainer.classList.remove('hidden');

    const lang = localStorage.getItem('project-kisan-lang') || 'en';

    // Helper to get translated field or fallback to English
    const getTranslated = (field) => {
        if (lang === 'hi' && data[`${field}_hindi`]) return data[`${field}_hindi`];
        if (lang === 'kn' && data[`${field}_kannada`]) return data[`${field}_kannada`];
        return data[`${field}_english`] || 'No information available.';
    };

    document.getElementById('result-title-english').textContent = getTranslated('disease_name');
    document.getElementById('result-plant-type').textContent = `(${getTranslated('plant_type') || data.object_category || 'Object'})`;
    
    const confidenceSpan = document.getElementById('result-confidence');
    const confidencePercent = (data.confidence_score * 100).toFixed(0);
    confidenceSpan.textContent = `${confidencePercent}% Confident`;
    
    if (confidencePercent >= 75) {
        confidenceSpan.style.backgroundColor = 'rgba(132, 204, 22, 0.2)';
        confidenceSpan.style.color = '#3f6212';
    } else if (confidencePercent >= 50) {
        confidenceSpan.style.backgroundColor = 'rgba(234, 179, 8, 0.2)';
        confidenceSpan.style.color = '#854d0e';
    } else {
        confidenceSpan.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
        confidenceSpan.style.color = '#991b1b';
    }

    document.getElementById('result-severity').textContent = data.severity || 'N/A';
    document.getElementById('result-risk').textContent = data.contagion_risk || 'N/A';
    document.getElementById('result-description-english').textContent = getTranslated('description');
    document.getElementById('result-organic-english').textContent = getTranslated('organic_remedy');
    document.getElementById('result-chemical-english').textContent = getTranslated('chemical_remedy');
    
    // Hide all language-specific text blocks first
    document.querySelectorAll('.kannada-text, .hindi-text').forEach(el => el.classList.add('hidden'));

    // Show the specific language block if not English
    if (lang === 'kn') {
        const knDesc = document.getElementById('result-description-kannada');
        const knOrg = document.getElementById('result-organic-kannada');
        const knChem = document.getElementById('result-chemical-kannada');
        knDesc.textContent = data.description_kannada || '';
        knOrg.textContent = data.organic_remedy_kannada || '';
        knChem.textContent = data.chemical_remedy_kannada || '';
        if (knDesc.textContent) knDesc.classList.remove('hidden');
        if (knOrg.textContent) knOrg.classList.remove('hidden');
        if (knChem.textContent) knChem.classList.remove('hidden');
    } else if (lang === 'hi') {
        // Similar logic for Hindi, assuming backend provides '..._hindi' fields
        const hiDesc = document.getElementById('result-description-hindi');
        const hiOrg = document.getElementById('result-organic-hindi');
        const hiChem = document.getElementById('result-chemical-hindi');
        hiDesc.textContent = data.description_hindi || '';
        hiOrg.textContent = data.organic_remedy_hindi || '';
        hiChem.textContent = data.chemical_remedy_hindi || '';
        if (hiDesc.textContent) hiDesc.classList.remove('hidden');
        if (hiOrg.textContent) hiOrg.classList.remove('hidden');
        if (hiChem.textContent) hiChem.classList.remove('hidden');
    }

    const preventionDiv = document.getElementById('result-prevention');
    const tipsArray = data[`prevention_tips_${lang}`] || data.prevention_tips_english || [];
    if (tipsArray.length > 0 && tipsArray.some(tip => tip.trim() !== '')) {
        preventionDiv.innerHTML = '<ul>' + tipsArray.map(tip => `<li>${tip.trim()}</li>`).join('') + '</ul>';
    } else {
        preventionDiv.innerHTML = `<p>No prevention tips available.</p>`;
    }

    const audioUrl = data[`audio_remedy_url_${lang}`] || data.audio_remedy_url;
    if (audioUrl) {
        speakButton.classList.remove('hidden');
        const remedyAudio = document.getElementById('remedy-audio');
        remedyAudio.src = audioUrl;
        speakButton.onclick = () => {
            if (remedyAudio.paused) { remedyAudio.play(); } 
            else { remedyAudio.pause(); }
        };
        remedyAudio.onplay = () => { speakButton.textContent = 'Playing... (Click to Pause)'; };
        remedyAudio.onpause = () => { speakButton.textContent = 'Listen to Summary'; };
        remedyAudio.onended = () => { speakButton.textContent = 'Listen to Summary'; };
    } else {
        speakButton.classList.add('hidden');
    }
}


// =================================================================
// 7. PAGE LOAD ANIMATIONS & HELPERS (FROM NEW FRONTEND)
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Scroll-based fade-in animations
    const fadeInObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-in').forEach(element => { fadeInObserver.observe(element); });

    // Dynamic header on scroll
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
    });
});
