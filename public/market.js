document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENT REFERENCES ---
    const priceForm = document.getElementById('price-form');
    const cropSelect = document.getElementById('crop-select');
    const statusIndicator = document.getElementById('status-indicator');
    const analysisResultsContainer = document.getElementById('analysis-results-container');
    const priceTableContainer = document.getElementById('price-table-container'); // New reference
    const priceTableBody = document.getElementById('price-table-body');
    const historyTableTitle = document.getElementById('history-table-title'); // New reference

    // This is our mock historical database.
    const fullPriceHistory = [
        { commodity: 'Tomato', minPrice: 1500, maxPrice: 2500, avgPrice: 2000, date: '21/07/2025' },
        { commodity: 'Tomato', minPrice: 1450, maxPrice: 2550, avgPrice: 1950, date: '20/07/2025' },
        { commodity: 'Tomato', minPrice: 1550, maxPrice: 2400, avgPrice: 2020, date: '19/07/2025' },
        { commodity: 'Tomato', minPrice: 1600, maxPrice: 2600, avgPrice: 2100, date: '18/07/2025' },
        { commodity: 'Tomato', minPrice: 1500, maxPrice: 2500, avgPrice: 2050, date: '17/07/2025' },
        { commodity: 'Tomato', minPrice: 1400, maxPrice: 2450, avgPrice: 1980, date: '16/07/2025' },
        { commodity: 'Onion', minPrice: 1000, maxPrice: 1300, avgPrice: 1200, date: '21/07/2025' },
        { commodity: 'Onion', minPrice: 1100, maxPrice: 1250, avgPrice: 1150, date: '20/07/2025' },
        { commodity: 'Onion', minPrice: 950, maxPrice: 1350, avgPrice: 1220, date: '19/07/2025' },
        { commodity: 'Onion', minPrice: 1000, maxPrice: 1400, avgPrice: 1250, date: '18/07/2025' },
        { commodity: 'Onion', minPrice: 1050, maxPrice: 1300, avgPrice: 1210, date: '17/07/2025' },
        { commodity: 'Plum', minPrice: 5000, maxPrice: 7000, avgPrice: 6000, date: '21/07/2025' },
        { commodity: 'Plum', minPrice: 5200, maxPrice: 6800, avgPrice: 6100, date: '20/07/2025' },
        { commodity: 'Plum', minPrice: 4900, maxPrice: 7100, avgPrice: 5950, date: '19/07/2025' },
        { commodity: 'Plum', minPrice: 5100, maxPrice: 7000, avgPrice: 6050, date: '18/07/2025' },
        { commodity: 'Plum', minPrice: 5300, maxPrice: 6900, avgPrice: 6150, date: '17/07/2025' }
    ];

    function displayPriceTable(priceData) {
        priceTableBody.innerHTML = ''; // Clear previous results
        priceData.forEach(item => {
            const row = document.createElement('tr');
            // UPDATED to remove 'variety'
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
    
    // NOTE: We no longer load the table on page start.

    // --- HANDLE FORM SUBMISSION FOR ANALYSIS ---
    priceForm.addEventListener('submit', (event) => {
        event.preventDefault(); 

        if (!cropSelect.value) {
            alert('Please select a crop to analyze.');
            return;
        }

        // Hide previous results
        analysisResultsContainer.classList.add('hidden');
        priceTableContainer.classList.add('hidden');

        // Show loading indicator
        statusIndicator.classList.remove('hidden');
        statusIndicator.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Simulate API call and analysis
        setTimeout(() => {
            const selectedCrop = cropSelect.value;
            
            // --- 1. Generate AI Analysis Card Data ---
            const marketAnalysisData = {
                "crop_name": selectedCrop, "market_name": "Sangrur", "state_name": "Punjab",
                "analysis_date": "2025-07-21",
                "current_price_inr": 2200,
                "price_trend_description": "The price is stable over the past 30 days based on the limited available data.",
                "comparison_to_last_year": "No year-over-year comparison possible due to lack of historical data.",
                "influencing_factors": ["Monsoon rainfall patterns", "Local market demand", "Transportation costs"],
                "farmer_opinion_and_advice": "With current prices offering a reasonable margin, selling now is a prudent option, especially if storage facilities are limited. Monitor local intelligence for potential price shifts.",
                "price_outlook_short_term": "Prices may fluctuate due to weather and demand. Monitor local conditions closely.",
                "data_completeness": "Partial Data"
            };

            // --- 2. Generate Historical Price Table Data ---
            const filteredHistory = fullPriceHistory.filter(item => item.commodity === selectedCrop);
            const limitedHistory = filteredHistory.slice(0, 5); // Get a maximum of 5 rows

            // --- 3. Display Both Results ---
            statusIndicator.classList.add('hidden');
            
            // Display AI analysis
            displayMarketAnalysis(marketAnalysisData);
            analysisResultsContainer.classList.remove('hidden');

            // Display historical price table
            historyTableTitle.textContent = selectedCrop; // Update the table title
            displayPriceTable(limitedHistory);
            priceTableContainer.classList.remove('hidden');

            analysisResultsContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 1500); 
    });

    function displayMarketAnalysis(data) {
        document.getElementById('res-title').textContent = `${data.crop_name} Analysis in ${data.market_name}`;
        document.getElementById('res-analysis-date').textContent = `Date: ${data.analysis_date}`;
        document.getElementById('res-completeness').textContent = data.data_completeness;
        document.getElementById('res-price').textContent = `₹ ${data.current_price_inr} / Quintal`;
        document.getElementById('res-trend').textContent = data.price_trend_description;
        document.getElementById('res-comparison').textContent = data.comparison_to_last_year;
        document.getElementById('res-outlook').textContent = data.price_outlook_short_term;
        document.getElementById('res-advice').textContent = data.farmer_opinion_and_advice;

        const factorsList = document.getElementById('res-factors');
        factorsList.innerHTML = '';
        data.influencing_factors.forEach(factor => {
            const li = document.createElement('li');
            li.textContent = factor;
            factorsList.appendChild(li);
        });
    }
});