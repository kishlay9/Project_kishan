// =================================================================
// 1. FIREBASE CONFIGURATION & SETUP (COMPLETE DYNAMIC VERSION)
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
const functions = firebase.functions();

if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    console.log("LOCALHOST (Market Page): Connecting to Functions Emulator...");
    functions.useEmulator("localhost", 5001);
}

// =================================================================
// 2. MAIN PAGE LOGIC (FULLY DYNAMIC)
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENT REFERENCES ---
    const priceForm = document.getElementById('price-form');
    const statusIndicator = document.getElementById('status-indicator');
    const analysisResultsContainer = document.getElementById('analysis-results-container');
    const priceTableBody = document.getElementById('price-table-body');
    const stateSelect = document.getElementById('state-select');
    const marketSelect = document.getElementById('market-select');
    const cropSelect = document.getElementById('crop-select');

    // --- NEW: FUNCTION TO POPULATE DROPDOWNS DYNAMICALLY ---
    function populateDropdowns() {
        const getMarketDropdowns = functions.httpsCallable('getMarketDropdowns');
        getMarketDropdowns().then(result => {
            const { states, markets, crops } = result.data;

            // Populate States
            states.forEach(state => {
                const option = new Option(state, state);
                stateSelect.add(option);
            });
            // Populate Markets
            markets.forEach(market => {
                const option = new Option(market, market);
                marketSelect.add(option);
            });
            // Populate Crops
            crops.forEach(crop => {
                const option = new Option(crop, crop);
                cropSelect.add(option);
            });
        }).catch(error => {
            console.error("Failed to populate dropdowns:", error);
            alert("Could not load filter options from the database.");
        });
    }

    // --- NEW: FUNCTION TO FETCH AND DISPLAY LIVE DATA IN THE TABLE ---
    function loadLivePriceTable() {
        priceTableBody.innerHTML = '<tr><td colspan="6">Loading live market data...</td></tr>';
        const getLiveMarketPrices = functions.httpsCallable('getLiveMarketPrices');
        
        getLiveMarketPrices().then(result => {
            const priceData = result.data;
            if (!priceData || priceData.length === 0) {
                priceTableBody.innerHTML = '<tr><td colspan="6">No recent market data available.</td></tr>';
                return;
            }
            displayPriceTable(priceData);
        }).catch(error => {
            console.error("Error fetching live market prices:", error);
            priceTableBody.innerHTML = '<tr><td colspan="6">Error loading market data.</td></tr>';
        });
    }

    // --- FUNCTION TO RENDER DATA INTO THE HTML TABLE (NO CHANGE) ---
    function displayPriceTable(priceData) {
        priceTableBody.innerHTML = '';
        priceData.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.commodity}</td>
                <td>${item.variety}</td>
                <td>Rs ${item.minPrice} / Q</td>
                <td>Rs ${item.maxPrice} / Q</td>
                <td><strong>Rs ${item.avgPrice} / Q</strong></td>
                <td>${item.date}</td>
            `;
            priceTableBody.appendChild(row);
        });
    }

    // --- EVENT LISTENER FOR ANALYSIS FORM (NO CHANGE) ---
    priceForm.addEventListener('submit', (event) => {
        event.preventDefault();
        analysisResultsContainer.classList.add('hidden');
        statusIndicator.classList.remove('hidden');
        statusIndicator.scrollIntoView({ behavior: 'smooth', block: 'center' });

        const cropName = cropSelect.value;
        const stateName = stateSelect.value;
        const marketName = marketSelect.value;

        if (!cropName || !stateName || !marketName) {
            alert("Please select a State, Market, and Crop to continue.");
            statusIndicator.classList.add('hidden');
            return;
        }

        const getMarketAnalysis = functions.httpsCallable('getMarketAnalysis');
        
        getMarketAnalysis({ cropName, stateName, marketName })
            .then(result => {
                displayMarketAnalysis(result.data);
            })
            .catch(error => {
                console.error("Error calling getMarketAnalysis function:", error);
                alert(`Error fetching analysis: ${error.message}.`);
            })
            .finally(() => {
                statusIndicator.classList.add('hidden');
                analysisResultsContainer.classList.remove('hidden');
                analysisResultsContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
    });

    // --- FUNCTION TO RENDER AI ANALYSIS CARD (NO CHANGE) ---
    function displayMarketAnalysis(data) {
        document.getElementById('res-title').textContent = `${data.crop_name} Analysis in ${data.market_name}`;
        document.getElementById('res-analysis-date').textContent = `Analysis Date: ${data.analysis_date}`;
        document.getElementById('res-completeness').textContent = data.data_completeness;
        document.getElementById('res-price').textContent = `₹ ${data.current_price_inr} / Quintal`;
        document.getElementById('res-trend').textContent = data.price_trend_description;
        document.getElementById('res-comparison').textContent = data.comparison_to_last_year;
        document.getElementById('res-outlook').textContent = data.price_outlook_short_term;
        document.getElementById('res-advice').textContent = data.farmer_opinion_and_advice;

        const factorsList = document.getElementById('res-factors');
        factorsList.innerHTML = '';
        if (data.influencing_factors && Array.isArray(data.influencing_factors)) {
            data.influencing_factors.forEach(factor => {
                const li = document.createElement('li');
                li.textContent = factor;
                factorsList.appendChild(li);
            });
        }
    }

    // --- INITIALIZE THE PAGE DYNAMICALLY ---
    populateDropdowns();
    loadLivePriceTable();
});