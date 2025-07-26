const firebaseConfig = {
  apiKey: "AIzaSyC4Aeebs6yLYHq-ZlDDMpUcTwvCYX48KRg",
  authDomain: "project-kisan-new.firebaseapp.com",
  projectId: "project-kisan-new",
  storageBucket: "project-kisan-new.firebasestorage.app",
  messagingSenderId: "176046173818",
  appId: "1:176046173818:web:de8fb0e50752c8f62195c3",
  measurementId: "G-GDJE785E2N"
};
// translations.js

// In app.js
// Add the new keys to your existing translations object

const translations = {
  en: {
    // ... your existing keys (description, organicRemedy, etc.) ...
    marketTrend: "Market Trend:",
    sellStatus: "Sell Status:",
    priceOutlook: "Price Outlook:",
    farmerOpinion: "Farmer Opinion & Advice",
    influencingFactors: "Influencing Factors",
    currentAvgPrice: "Current Avg Price",
    analysisTitle: "Analysis in {market}, {state}"
  },
  hi: {
    // ... your existing keys ...
    marketTrend: "बाजार की प्रवृत्ति:",
    sellStatus: "बिक्री की स्थिति:",
    priceOutlook: "मूल्य का दृष्टिकोण:",
    farmerOpinion: "किसान की राय और सलाह",
    influencingFactors: "प्रभावित करने वाले कारक",
    currentAvgPrice: "वर्तमान औसत मूल्य",
     analysisTitle: "{market}, {state} में विश्लेषण"
  },
  kn: {
    // ... your existing keys ...
    marketTrend: "ಮಾರುಕಟ್ಟೆ ಪ್ರವೃತ್ತಿ:",
    sellStatus: "ಮಾರಾಟ ಸ್ಥಿತಿ:",
    priceOutlook: "ಬೆಲೆ ದೃಷ್ಟಿಕೋನ:",
    farmerOpinion: "ರೈತರ ಅಭಿಪ್ರಾಯ ಮತ್ತು ಸಲಹೆ",
    influencingFactors: "ಪ್ರಭಾವ ಬೀರುವ ಅಂಶಗಳು",
    currentAvgPrice: "ಪ್ರಸ್ತುತ ಸರಾಸರಿ ಬೆಲೆ",
    analysisTitle: "{market}, {state} ನಲ್ಲಿ ವಿಶ್ಲೇಷಣೆ"
  }
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
// ==========================================================
// ROBUST UPLOAD FUNCTION (REPLACE YOUR OLD ONE WITH THIS)
// ==========================================================
imageUploadInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const lang = localStorage.getItem('project-kisan-lang') || 'en';
    alert(`DEBUG: Preparing to upload for language: ${lang}. If you don't see this alert, the old code is still running.`);

    hideResults();
    showStatus(`Uploading ${file.name}...`);
    statusIndicator.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // --- Step 1: Prepare all data beforehand ---
    
    const uniqueFileName = `image_${Date.now()}_${file.name}`;
    const storagePath = `uploads/${uniqueFileName}`;
    const storageRef = storage.ref(storagePath);
    
    // Create the full, correct metadata object
    const metadata = {
        contentType: file.type,
        customMetadata: {
            'language': lang
        }
    };
    
   
    // --- Step 2: Start the upload ---
    const uploadTask = storageRef.put(file, metadata);

    // --- Step 3: Set up listeners for the upload process ---
    uploadTask.on(
        'state_changed', 
        (snapshot) => {
            // Progress monitoring
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            showStatus(`Uploading... ${Math.round(progress)}%`);
        }, 
        (error) => {
            // Error handling
            console.error("!!! UPLOAD FAILED:", error);
            let errorMessage = `Upload failed: ${error.code}.`;
            // Add more specific error messages if needed
            if (error.code === 'storage/unauthorized') {
                errorMessage += " Please check your Storage Security Rules.";
            }
            showStatus(errorMessage, true);
        },
        () => {
            // Success handling (this function runs when the upload is complete)
            console.log('SUCCESS: Upload is complete. Now starting to listen for results.');
            showStatus("Analyzing image with AI...");
            
            // This is the function that listens to Firestore for the result
            listenForDiagnosisResult(uniqueFileName);
        }
    );
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

    // Step 1: Get the user's chosen language from local storage.
    const lang = localStorage.getItem('project-kisan-lang') || 'en';

    // Step 2: Create a NEW, simpler helper function to get the right text.
    // It first tries to get the selected language, then falls back to English, then to a default message.
    const getTranslated = (fieldName) => {
        if (data[fieldName]) { // Check if the main field (e.g., 'description') exists
            return data[fieldName][lang] || data[fieldName].en || 'No information available.';
        }
        return 'No information available.';
    };

    // --- Update the Main Title and Plant Type ---
    // The main title will now show in the selected language.
    document.getElementById('result-title-english').textContent = getTranslated('disease_name');
    document.getElementById('result-plant-type').textContent = `(${getTranslated('plant_type') || data.object_category || 'Object'})`;

    // --- Confidence and Severity (This code was correct) ---
    const confidenceSpan = document.getElementById('result-confidence');
    const confidencePercent = (data.confidence_score * 100).toFixed(0);
    confidenceSpan.textContent = `${confidencePercent}% Confident`;
    
    // Your styling logic for the confidence badge... (This was correct)
    if (confidencePercent >= 75) { /* ... */ } else if (confidencePercent >= 50) { /* ... */ } else { /* ... */ }

    document.getElementById('result-severity').textContent = data.severity || 'N/A';
    document.getElementById('result-risk').textContent = data.contagion_risk || 'N/A';
    
    // --- Update the Description and Remedy sections in the selected language ---
    // We will now only show the text for the selected language, making the UI cleaner.
    document.getElementById('result-description-english').textContent = getTranslated('description');
    document.getElementById('result-organic-english').textContent = getTranslated('organic_remedy');
    document.getElementById('result-chemical-english').textContent = getTranslated('chemical_remedy');

    // --- Hide the extra language blocks you might have in your HTML ---
    // This simplifies the display to show only one language at a time.
    document.querySelectorAll('.kannada-text, .hindi-text').forEach(el => el.classList.add('hidden'));

    // --- Update Prevention Tips ---
    const preventionDiv = document.getElementById('result-prevention');
    // Get the tips array for the selected language, or fall back to English's array.
    const tipsArray = data.prevention_tips?.[lang] || data.prevention_tips?.en || [];
    if (tipsArray.length > 0) {
        preventionDiv.innerHTML = '<ul>' + tipsArray.map(tip => `<li>${tip.trim()}</li>`).join('') + '</ul>';
    } else {
        const fallbackText = translations[lang]?.preventionTips || translations['en'].preventionTips;
        preventionDiv.innerHTML = `<p>No prevention tips available.</p>`;
    }

    // --- Update Audio Player ---
    // Get the audio URL for the selected language, or fall back to the English URL.
    const audioUrl = data.audio_remedy_url?.[lang] || data.audio_remedy_url?.en;
    const speakButton = document.getElementById('speak-button'); // Make sure you have this ID on your button
    const remedyAudio = document.getElementById('remedy-audio');

    if (audioUrl) {
        speakButton.classList.remove('hidden');
        remedyAudio.src = audioUrl;
        speakButton.onclick = () => {
            if (remedyAudio.paused) { remedyAudio.play(); } 
            else { remedyAudio.pause(); }
        };
        // Your onplay/onpause/onended logic was correct and can remain.
        remedyAudio.onplay = () => { speakButton.textContent = 'Playing... (Click to Pause)'; };
        remedyAudio.onpause = () => { speakButton.textContent = 'Listen to Summary'; };
        remedyAudio.onended = () => { speakButton.textContent = 'Listen to Summary'; };
    } else {
        speakButton.classList.add('hidden');
    }
}

// In app.js

function translateUI(lang) {
  // Find all elements that need to be translated
  const elementsToTranslate = document.querySelectorAll('[data-i18n-key]');
  
  elementsToTranslate.forEach(element => {
    const key = element.getAttribute('data-i18n-key');
    
    // Get the translation from our object
    const translation = translations[lang]?.[key] || translations['en'][key];
    
    // Update the element's text
    if (translation) {
      element.textContent = translation;
    }
  });
}

// =================================================================
// 7. PAGE LOAD ANIMATIONS & HELPERS (FROM NEW FRONTEND)
// =================================================================

// ==========================================================
// COMBINED DOMCONTENTLOADED EVENT LISTENER
// ==========================================================
document.addEventListener('DOMContentLoaded', () => {
    // --- Your preexisting code (remains unchanged) ---
    
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

    // --- START: NEW TRANSLATION LOGIC TO BE ADDED ---

    // 1. Get the language dropdown element
    const languageSelector = document.getElementById('language-selector'); // Use the ID of your <select> element

    // 2. Set the initial UI language when the page loads
    const currentLang = localStorage.getItem('project-kisan-lang') || 'en';
    if (languageSelector) {
        languageSelector.value = currentLang; // Sync dropdown with saved language
    }
    translateUI(currentLang); // Translate all static text on the page

    // 3. Add the event listener for when the user changes the language
    if (languageSelector) {
        languageSelector.addEventListener('change', (event) => {
            const selectedLang = event.target.value;
            
            // Save the new choice to be remembered across page loads
            localStorage.setItem('project-kisan-lang', selectedLang);
            
            // Immediately translate the UI to the new language
            translateUI(selectedLang);
        });
    }
    // --- END: NEW TRANSLATION LOGIC TO BE ADDED ---
});