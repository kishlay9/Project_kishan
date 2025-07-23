document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENT REFERENCES ---
    const priceForm = document.getElementById('price-form');
    const cropSelect = document.getElementById('crop-select');
    const stateSelect = document.getElementById('state-select');
    const marketSelect = document.getElementById('market-select');
    const statusIndicator = document.getElementById('status-indicator');
    const analysisResultsContainer = document.getElementById('analysis-results-container');
    const priceTableContainer = document.getElementById('price-table-container');
    const priceTableBody = document.getElementById('price-table-body');
    const historyTableTitle = document.getElementById('history-table-title');

    // --- HANDLE FORM SUBMISSION FOR ANALYSIS (NOW DYNAMIC) ---
    priceForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Get all selected values
        const cropName = cropSelect.value;
        const stateName = stateSelect.value;
        const marketName = marketSelect.value;

        // Validate all three inputs are selected
        if (!cropName || !stateName || !marketName) {
            alert('Please select a State, Market, and Crop to analyze.');
            return;
        }

        // Hide previous results and show loading indicator
        analysisResultsContainer.classList.add('hidden');
        priceTableContainer.classList.add('hidden');
        statusIndicator.classList.remove('hidden');
        statusIndicator.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // --- DYNAMIC API CALL ---
        try {
            const apiUrl = 'https://asia-south1-project-kisan-new.cloudfunctions.net/getMarketAnalysis';
            const requestUrl = `${apiUrl}?cropName=${encodeURIComponent(cropName)}&stateName=${encodeURIComponent(stateName)}&marketName=${encodeURIComponent(marketName)}`;

            console.log("🚀 [DEBUG] Fetching market analysis from:", requestUrl);

            const response = await fetch(requestUrl);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API Error ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            console.log("✅ [DEBUG] Successfully received and parsed data:", data);

            // --- Display Both Results ---
            statusIndicator.classList.add('hidden');

            // 1. Display AI analysis card
            displayMarketAnalysis(data);
            analysisResultsContainer.classList.remove('hidden');

            // 2. Map and display historical price table
            if (data.chart_data && data.chart_data.length > 0) {
                // Map the chart_data from the API to the format the table function expects
                const tableData = data.chart_data.map(item => ({
                    commodity: data.crop_name, // Use the top-level crop name
                    minPrice: item.price_min || 'N/A',
                    maxPrice: item.price_max || 'N/A',
                    avgPrice: item.price_modal || 'N/A', // 'price_modal' is the best fit for 'avgPrice'
                    date: item.date
                }));

                historyTableTitle.textContent = data.crop_name; // Update the table title
                displayPriceTable(tableData);
                priceTableContainer.classList.remove('hidden');
            }

            analysisResultsContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });

        } catch (error) {
            console.error("❌ [CRITICAL ERROR] Failed to fetch market analysis:", error);
            statusIndicator.classList.add('hidden');
            // Provide feedback to the user on the page
            alert(`An error occurred while fetching data. Please try again. \nDetails: ${error.message}`);
        }
    });

    function displayMarketAnalysis(data) {
        // This function now maps the live data keys to the UI elements
        document.getElementById('res-title').textContent = `${data.crop_name} Analysis in ${data.market_name}, ${data.state_name}`;
        document.getElementById('res-analysis-date').textContent = `Date: ${data.analysis_date || 'N/A'}`;
        document.getElementById('res-completeness').textContent = data.data_completeness || 'Info';
        document.getElementById('res-price').textContent = `₹ ${data.current_price_inr || 'N/A'} / Quintal`;
        document.getElementById('res-trend').textContent = data.price_trend_description || 'No trend data available.';
        
        // The API response doesn't have 'comparison_to_last_year', so we use another relevant field or a default message.
        // Let's use the 'buy_sell_hold_recommendation' for the outlook.
        document.getElementById('res-comparison').textContent = data.buy_sell_hold_recommendation || 'No yearly comparison data.';
        document.getElementById('res-outlook').textContent = data.price_outlook_short_term || 'Outlook not available.';
        document.getElementById('res-advice').textContent = data.farmer_opinion_and_advice || 'No specific advice available.';

        const factorsList = document.getElementById('res-factors');
        factorsList.innerHTML = '';
        if (data.influencing_factors && data.influencing_factors.length > 0) {
            data.influencing_factors.forEach(factor => {
                const li = document.createElement('li');
                li.textContent = factor;
                factorsList.appendChild(li);
            });
        } else {
            factorsList.innerHTML = '<li>No specific factors identified.</li>';
        }
    }
    
    function displayPriceTable(priceData) {
        priceTableBody.innerHTML = ''; // Clear previous results
        priceData.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.commodity}</td>
                <td>Rs ${item.minPrice} / Q</td>
                <td>Rs ${item.maxPrice} / Q</td>
                <td><strong>Rs ${item.avgPrice} / Q</strong></td>
                <td>${item.date}</td>
            `;
            priceTableBody.appendChild(row);
        });
    }
});