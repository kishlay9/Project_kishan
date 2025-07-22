document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENT REFERENCES ---
    const priceForm = document.getElementById('price-form');
    const statusIndicator = document.getElementById('status-indicator');
    const analysisResultsContainer = document.getElementById('analysis-results-container');
    const priceTableBody = document.getElementById('price-table-body');

    // --- 1. LOAD LIVE PRICE TABLE ON PAGE LOAD ---
    function loadInitialPriceTable() {
        const marketPriceListData = [
            { commodity: 'Onion', variety: 'Onion', minPrice: 1000, maxPrice: 1300, avgPrice: 1200, date: '21/07/2025' },
            { commodity: 'Plum', variety: 'Other', minPrice: 5000, maxPrice: 7000, avgPrice: 6000, date: '21/07/2025' },
            { commodity: 'Tomato', variety: 'Tomato', minPrice: 1500, maxPrice: 2500, avgPrice: 2000, date: '21/07/2025' },
            { commodity: 'Tomato', variety: 'Other', minPrice: 1800, maxPrice: 2200, avgPrice: 2000, date: '21/07/2025' },
            { commodity: 'Cauliflower', variety: 'Other', minPrice: 3000, maxPrice: 3500, avgPrice: 3200, date: '21/07/2025' },
            { commodity: 'Cucumber (Kheera)', variety: 'Cucumber', minPrice: 1800, maxPrice: 2500, avgPrice: 2000, date: '21/07/2025' }
        ];
        displayPriceTable(marketPriceListData);
    }

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
    
    loadInitialPriceTable();

    // --- 2. HANDLE FORM SUBMISSION FOR ANALYSIS ---
    priceForm.addEventListener('submit', (event) => {
        event.preventDefault(); 
        analysisResultsContainer.classList.add('hidden');
        statusIndicator.classList.remove('hidden');
        statusIndicator.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        setTimeout(() => {
            // Updated mock data with new fields
            const marketAnalysisData = {
                "crop_name": "Tomato", "market_name": "Sangrur", "state_name": "Punjab",
                "analysis_date": "2025-07-21",
                "current_price_inr": 2200,
                "price_trend_description": "The price is stable over the past 30 days based on the limited available data.",
                "comparison_to_last_year": "No year-over-year comparison possible due to lack of historical data.",
                "influencing_factors": ["Monsoon rainfall patterns", "Local market demand", "Transportation costs"],
                "farmer_opinion_and_advice": "With current prices offering a reasonable margin, selling now is a prudent option, especially if storage facilities are limited. Monitor local intelligence for potential price shifts.",
                "price_outlook_short_term": "Prices may fluctuate due to weather and demand. Monitor local conditions closely.",
                "data_completeness": "Partial Data"
            };

            statusIndicator.classList.add('hidden');
            displayMarketAnalysis(marketAnalysisData);
            analysisResultsContainer.classList.remove('hidden');
            analysisResultsContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 1500); 
    });

    // Updated function to display all data
    function displayMarketAnalysis(data) {
        document.getElementById('res-title').textContent = `${data.crop_name} Analysis in ${data.market_name}`;
        document.getElementById('res-analysis-date').textContent = `Date: ${data.analysis_date}`;
        document.getElementById('res-completeness').textContent = data.data_completeness;
        document.getElementById('res-price').textContent = `₹ ${data.current_price_inr} / Quintal`;
        
        // Populate new fields
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