document.addEventListener('DOMContentLoaded', () => {
    // --- FIREBASE SDK INITIALIZATION ---
    // IMPORTANT: Replace this with your actual Firebase project configuration.
    const firebaseConfig = {
    apiKey: "AIzaSyC4Aeebs6yLYHq-ZlDDMpUcTwvCYX48KRg",
    authDomain: "project-kisan-new.firebaseapp.com",
    projectId: "project-kisan-new",
    storageBucket: "project-kisan-new.firebasestorage.app",
    messagingSenderId: "176046173818",
    appId: "1:176046173818:web:de8fb0e50752c8f62195c3",
    measurementId: "G-GDJE785E2N"
    };

    // Initialize Firebase
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }

    // --- CRUCIAL FIX: Specify the correct region for your functions ---
    const functions = firebase.app().functions('asia-south1');
    console.log("✅ [Firebase Init] SDK initialized and pointed to 'asia-south1' region.");
    
    // To use local emulators for testing, uncomment the line below
    // functions.useEmulator("localhost", 5001);

    // --- DOM ELEMENTS ---
    const plannerForm = document.getElementById('planner-form');
    const statusIndicator = document.getElementById('planner-status');
    const resultsSection = document.getElementById('planner-results-section');
    const resultsGrid = document.getElementById('planner-results-grid');
    
    // --- FORM SUBMISSION LOGIC WITH DEBUGGING ---
    plannerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        console.log("🚀 [Event] Form submitted.");

        // 1. Get user input from the form
        const waterAccess = document.getElementById('water-access').value;
        const landSize = parseFloat(document.getElementById('land-size').value);
        const budget = parseInt(document.getElementById('budget').value, 10);
        
        console.log(`📝 [Input] Form data collected: water='${waterAccess}', land=${landSize}, budget=${budget}`);

        if (!waterAccess || isNaN(landSize) || isNaN(budget)) {
            alert('Please fill out all fields correctly.');
            console.error("❌ [Validation] Form validation failed.");
            return;
        }

        resultsSection.classList.add('hidden');
        statusIndicator.classList.remove('hidden');
        statusIndicator.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        try {
            // 2. Get the user's browser location
            console.log("🌎 [Geolocation] Requesting user's location...");
            const userLocation = await getUserCoordinates();
            console.log("✅ [Geolocation] Location acquired:", userLocation);

            // 3. Prepare the data payload
            const requestData = {
                location: userLocation,
                landSize: landSize,
                budget: budget,
                waterAccess: waterAccess
            };

            // 4. Call the 'generateOpportunity' Callable Function
            console.log("☁️ [Firebase] Getting reference to 'generateOpportunity' callable function.");
            const generateOpportunity = functions.httpsCallable('generateOpportunity');
            
            console.log("📡 [Firebase] Executing callable function with data:", requestData);
            const result = await generateOpportunity(requestData);
            console.log("✅ [Firebase] Successfully received response from function:", result);

            // 5. Check if the response data is as expected
            if (!result.data || !result.data.crop_plans) {
                throw new Error("The function response was successful but did not contain the expected 'crop_plans' data.");
            }
            console.log("📊 [Data Check] 'crop_plans' data is present in the response.");

            // 6. Display the results
            displayResults(result.data.crop_plans);
            statusIndicator.classList.add('hidden');
            resultsSection.classList.remove('hidden');
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

        } catch (error) {
            console.error("❌ [CRITICAL ERROR] Failed to generate opportunity:", error);
            statusIndicator.classList.add('hidden');
            // Provide a more detailed error for the user
            alert(`An error occurred while generating your plan. \n\nType: ${error.code || 'N/A'} \nMessage: ${error.message}`);
        }
    });

    // --- HELPER FUNCTION to get user's coordinates (Unchanged) ---
    function getUserCoordinates() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error("Geolocation is not supported by your browser."));
            }
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                (error) => {
                    let errorMessage = "An unknown error occurred while getting location.";
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = "Permission to access location was denied. Please enable it in your browser settings.";
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = "Location information is unavailable.";
                            break;
                        case error.TIMEOUT:
                            errorMessage = "The request to get user location timed out.";
                            break;
                    }
                    reject(new Error(errorMessage));
                }
            );
        });
    }

    // --- DISPLAY RESULTS FUNCTION (Unchanged) ---
    const displayResults = (recommendations) => {
        resultsGrid.innerHTML = '';
        if (!recommendations || recommendations.length === 0) {
            resultsGrid.innerHTML = '<p>Sorry, we could not find any suitable crop recommendations for your specific constraints. Please try adjusting your budget or other parameters.</p>';
            return;
        }
        recommendations.forEach(rec => {
            const card = document.createElement('div');
            card.className = 'plan-recommendation-card';
            const prosList = Array.isArray(rec.pros) ? rec.pros.map(pro => `<li>${pro}</li>`).join('') : '<li>N/A</li>';
            const consList = Array.isArray(rec.cons) ? rec.cons.map(con => `<li>${con}</li>`).join('') : '<li>N/A</li>';
            card.innerHTML = `
                <div class="plan-card-header">
                    <h3>${rec.crop_name}</h3>
                </div>
                <div class="plan-card-metrics">
                    <div class="metric-item">
                        <span>Estimated Profit</span>
                        <p>₹${(rec.estimated_profit_inr || 0).toLocaleString('en-IN')}</p>
                    </div>
                    <div class="metric-item">
                        <span>Estimated Cost</span>
                        <p>₹${(rec.estimated_cost_inr || 0).toLocaleString('en-IN')}</p>
                    </div>
                </div>
                <div class="plan-card-pros">
                    <h4><img src="images/up-arrow.png" alt="Pros"> Pros:</h4>
                    <ul>${prosList}</ul>
                </div>
                <div class="plan-card-cons">
                    <h4><img src="images/down-arrow.png" alt="Cons"> Cons:</h4>
                    <ul>${consList}</ul>
                </div>
            `;
            resultsGrid.appendChild(card);
        });
    };
});