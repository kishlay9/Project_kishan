document.addEventListener('DOMContentLoaded', () => {
    // --- STATE & DATA ---
    const INDIAN_LOCATIONS = [
        "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh",
        "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana",
        "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep",
        "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry",
        "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
        "West Bengal"
    ];
    let selectedLocation = null;

    // --- DOM ELEMENTS ---
    const plannerForm = document.getElementById('planner-form');
    const statusIndicator = document.getElementById('planner-status');
    const resultsSection = document.getElementById('planner-results-section');
    const resultsGrid = document.getElementById('planner-results-grid');
    
    // Searchable Dropdown Elements
    const locationDropdown = document.getElementById('location-dropdown');
    const searchInput = document.getElementById('location-search-input');
    const dropdownPanel = document.getElementById('location-dropdown-panel');
    const locationList = document.getElementById('location-list');

    // --- SEARCHABLE DROPDOWN LOGIC (Adapted from schemes.js) ---
    const openDropdown = () => dropdownPanel.classList.add('open');
    const closeDropdown = () => dropdownPanel.classList.remove('open');

    const populateLocationList = (filter = '') => {
        locationList.innerHTML = '';
        const filtered = INDIAN_LOCATIONS.filter(loc => loc.toLowerCase().includes(filter.toLowerCase()));
        if (filtered.length === 0) {
            locationList.innerHTML = '<li class="no-results">No states found</li>';
            return;
        }
        filtered.forEach(locationName => {
            const li = document.createElement('li');
            li.textContent = locationName;
            li.addEventListener('click', () => {
                searchInput.value = locationName;
                selectedLocation = locationName;
                closeDropdown();
            });
            locationList.appendChild(li);
        });
    };

    searchInput.addEventListener('input', () => {
        openDropdown();
        populateLocationList(searchInput.value);
    });
    searchInput.addEventListener('focus', () => {
        openDropdown();
        populateLocationList(searchInput.value);
    });
    document.addEventListener('click', (e) => {
        if (!locationDropdown.contains(e.target)) {
            closeDropdown();
        }
    });

    // --- FORM SUBMISSION LOGIC ---
    plannerForm.addEventListener('submit', (event) => {
        event.preventDefault();
        
        if (!selectedLocation) {
            alert('Please select a state from the dropdown list.');
            return;
        }

        resultsSection.classList.add('hidden');
        statusIndicator.classList.remove('hidden');
        statusIndicator.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Simulate AI analysis delay
        setTimeout(() => {
            displayResults();
            statusIndicator.classList.add('hidden');
            resultsSection.classList.remove('hidden');
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 2500);
    });

    // --- DISPLAY RESULTS FUNCTION ---
    const displayResults = () => {
        // Clear previous results
        resultsGrid.innerHTML = '';

        // Mock data for demonstration
        const recommendations = [
            {
                cropName: 'jatin ',
                profit: 50000,
                cost: 8500,
                pros: ['High market demand in your area', 'Good profit margin', 'Multiple harvests possible'],
                cons: ['Needs consistent watering', 'Higher risk of pests like fruit borer', 'Sensitive to extreme weather']
            },
            {
                cropName: 'Drought-Tolerant Millet',
                profit: 22000,
                cost: 4000,
                pros: ['Excellent for low water access', 'Low input costs', 'Improves soil health'],
                cons: ['Lower market price than cash crops', 'Risk of bird damage during grain filling']
            },
            {
                cropName: 'Quick-Turnaround Spinach',

                profit: 15000,
                cost: 3500,
                pros: ['Very short growth cycle (40-50 days)', 'Can be planted between main crops', 'Consistent local demand'],
                cons: ['Highly perishable, needs quick sale', 'Sensitive to high temperatures']
            }
        ];
        
        recommendations.forEach(rec => {
            const card = document.createElement('div');
            card.className = 'plan-recommendation-card';

            const prosList = rec.pros.map(pro => `<li>${pro}</li>`).join('');
            const consList = rec.cons.map(con => `<li>${con}</li>`).join('');

            card.innerHTML = `
                <div class="plan-card-header">
                    <h3>${rec.cropName}</h3>
                </div>
                <div class="plan-card-metrics">
                    <div class="metric-item">
                        <span>Estimated Profit</span>
                        <p>₹${rec.profit.toLocaleString('en-IN')}</p>
                    </div>
                    <div class="metric-item">
                        <span>Estimated Cost</span>
                        <p>₹${rec.cost.toLocaleString('en-IN')}</p>
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

    // --- INITIALIZE ---
    populateLocationList();
});