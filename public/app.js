// =================================================================
// 1. FIREBASE CONFIGURATION
// =================================================================

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
        firestore.useEmulator("localhost", 8080);
        storage.useEmulator("localhost", 9199);
    } catch (e) {
        console.error("Error setting up emulators. Have you started them with 'firebase emulators:start'?", e);
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
// 3. EVENT LISTENER FOR IMAGE UPLOAD
// =================================================================

imageUploadInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    hideResults();
    showStatus(`Uploading ${file.name}...`);
    statusIndicator.scrollIntoView({ behavior: 'smooth', block: 'center' });

    


    // --- ORIGINAL FIREBASE LOGIC (KEEP FOR LATER) ---
    
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
// 4. REAL-TIME LISTENER FOR DIAGNOSIS RESULTS (No change needed)
// =================================================================

function listenForDiagnosisResult(diagnosisId) {
    const docRef = firestore.collection("diagnoses").doc(diagnosisId);
    
    const timeout = setTimeout(() => {
        console.error("Firestore listener timed out.");
        showStatus("Analysis is taking longer than expected. Please try again.", true);
        unsubscribe();
    }, 60000);

    const unsubscribe = docRef.onSnapshot((doc) => {
        if (doc.exists) {
            clearTimeout(timeout);
            console.log("Diagnosis data received:", doc.data());
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
// 5. UI HELPER FUNCTIONS (No change needed)
// =================================================================

function showStatus(message, isError = false) {
    statusText.textContent = message;
    const spinner = statusIndicator.querySelector('.spinner');
    if (spinner) {
        spinner.style.borderTopColor = isError ? '#dc3545' : 'var(--primary-color)';
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
// 6. FUNCTION TO DISPLAY THE RESULTS (No change needed)
// =================================================================

function displayDiagnosisResults(data) {
    hideStatus();
    resultsContainer.classList.remove('hidden');

    document.getElementById('result-title-english').textContent = data.disease_name_english || 'Analysis Result';
    document.getElementById('result-plant-type').textContent = `(${data.plant_type || data.object_category || 'Object'})`;
    
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
    document.getElementById('result-description-english').textContent = data.description_english || 'No description available.';
    document.getElementById('result-description-kannada').textContent = data.description_kannada || '';
    document.getElementById('result-organic-english').textContent = data.organic_remedy_english || 'No organic remedy suggested.';
    document.getElementById('result-organic-kannada').textContent = data.organic_remedy_kannada || '';
    document.getElementById('result-chemical-english').textContent = data.chemical_remedy_english || 'No chemical remedy suggested.';
    document.getElementById('result-chemical-kannada').textContent = data.chemical_remedy_kannada || '';

    const preventionDiv = document.getElementById('result-prevention');
    const tipsArray = data.prevention_tips_english || [];
    if (tipsArray.length > 0 && tipsArray.some(tip => tip.trim() !== '')) {
        preventionDiv.innerHTML = '<ul>' + tipsArray.map(tip => `<li>${tip.trim()}</li>`).join('') + '</ul>';
    } else {
        preventionDiv.innerHTML = `<p>No prevention tips available.</p>`;
    }

    if (data.audio_remedy_url) {
        speakButton.classList.remove('hidden');
        const remedyAudio = document.getElementById('remedy-audio');
        remedyAudio.src = data.audio_remedy_url;
        speakButton.onclick = () => {
            if (remedyAudio.paused) { remedyAudio.play(); } 
            else { remedyAudio.pause(); remedyAudio.currentTime = 0; }
        };
        remedyAudio.onplay = () => { speakButton.textContent = 'Playing... (Click to Stop)'; };
        remedyAudio.onpause = () => { speakButton.textContent = 'Listen to Summary'; };
        remedyAudio.onended = () => { speakButton.textContent = 'Listen to Summary'; };
    } else {
        speakButton.classList.add('hidden');
    }
}

// =================================================================
// 7. PAGE LOAD EVENT LISTENERS & ANIMATIONS (No change needed)
// =================================================================

document.addEventListener('DOMContentLoaded', () => {

    // --- SMOOTH SCROLL FOR ANCHOR LINKS ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
        });
    });

    // --- SCROLL-BASED FADE-IN ANIMATIONS ---
    const fadeInObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-in').forEach(element => { fadeInObserver.observe(element); });

    // --- DYNAMIC HEADER ON SCROLL ---
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
    });

    // --- NEW: NUMBER COUNT-UP ANIMATION ---
    const animateValue = (obj, start, end, duration) => {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const value = Math.floor(progress * (end - start) + start);
            obj.innerHTML = `${value.toLocaleString()}+`; // Use toLocaleString for commas
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    };

    const statsObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumbers = entry.target.querySelectorAll('.stat-item h3');
                statNumbers.forEach(num => {
                    const goal = parseInt(num.dataset.goal, 10);
                    animateValue(num, 0, goal, 2000); // Animate over 2 seconds
                });
                observer.unobserve(entry.target); // Animate only once
            }
        });
    }, { threshold: 0.5 }); // Trigger when 50% of the section is visible

    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
        statsObserver.observe(statsSection);
    }
});