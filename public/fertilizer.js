document.addEventListener('DOMContentLoaded', () => {
    // --- DATA STORE ---
    // Central database for all crop-specific information
    const cropData = {
        cabbage: { name: 'Cabbage', icon: 'images/cabbage.png', inputType: 'plot', nutrientsPerAcre: { n: 80, p: 40, k: 40 } },
        tomato: { name: 'Tomato', icon: 'images/tomato.png', inputType: 'plot', nutrientsPerAcre: { n: 100, p: 60, k: 60 } },
        apple: { name: 'Apple', icon: 'images/apple.png', inputType: 'trees', nutrientsPerTree: { n: 0.6, p: 0.3, k: 0.7 } },
        banana: { name: 'Banana', icon: 'images/banana.png', inputType: 'plot', nutrientsPerAcre: { n: 200, p: 60, k: 250 } },
        brinjal: { name: 'Brinjal', icon: 'images/brinjal.png', inputType: 'plot', nutrientsPerAcre: { n: 100, p: 50, k: 50 } },
        bean: { name: 'Bean', icon: 'images/red-beans.png', inputType: 'plot', nutrientsPerAcre: { n: 20, p: 60, k: 40 } },
        chickpea: { name: 'Chickpea', icon: 'images/chickpea.png', inputType: 'plot', nutrientsPerAcre: { n: 20, p: 60, k: 20 } },
        cotton: { name: 'Cotton', icon: 'images/cotton.png', inputType: 'plot', nutrientsPerAcre: { n: 120, p: 60, k: 60 } },
        cucumber: { name: 'Cucumber', icon: 'images/cucumber.png', inputType: 'plot', nutrientsPerAcre: { n: 90, p: 50, k: 100 } },
        maize: { name: 'Maize', icon: 'images/maize.png', inputType: 'plot', nutrientsPerAcre: { n: 120, p: 60, k: 40 } },
        mango: { name: 'Mango', icon: 'images/mango.png', inputType: 'trees', nutrientsPerTree: { n: 0.5, p: 0.2, k: 0.5 } },
        onion: { name: 'Onion', icon: 'images/onion.png', inputType: 'plot', nutrientsPerAcre: { n: 100, p: 50, k: 80 } },
        potato: { name: 'Potato', icon: 'images/potato.png', inputType: 'plot', nutrientsPerAcre: { n: 150, p: 80, k: 100 } },
        rice: { name: 'Rice', icon: 'images/rice.png', inputType: 'plot', nutrientsPerAcre: { n: 100, p: 50, k: 50 } },
        sugarcane: { name: 'Sugarcane', icon: 'images/sugarcane.png', inputType: 'plot', nutrientsPerAcre: { n: 250, p: 80, k: 150 } },
        wheat: { name: 'Wheat', icon: 'images/wheat.png', inputType: 'plot', nutrientsPerAcre: { n: 120, p: 60, k: 40 } }
    };

    // --- FERTILIZER CONFIG ---
    const fertilizers = {
        urea: { n: 0.46, p: 0, k: 0 },
        dap: { n: 0.18, p: 0.46, k: 0 },
        mop: { n: 0, p: 0, k: 0.60 },
        tsp: { n: 0, p: 0.46, k: 0 }
    };
    const bagWeightKg = 50;
    const conversionFactors = { acre: 1, hectare: 2.47105, gunta: 0.025 };

    // --- STATE MANAGEMENT ---
    let state = { currentCrop: 'cabbage', unit: 'acre' };

    // --- ELEMENT SELECTORS ---
    const cropSelectorBtn = document.getElementById('crop-selector-btn');
    const cropModal = document.getElementById('crop-modal');
    const closeModalButton = document.getElementById('modal-close-button');
    const cropGrid = document.getElementById('crop-grid');
    const searchInput = document.getElementById('crop-search-input');

    const plotSizeCalculator = document.getElementById('plot-size-input-control');
    const treeCountCalculator = document.getElementById('tree-input-control');
    
    const unitRadios = document.querySelectorAll('input[name="unit"]');
    
    const plotSizeInput = document.getElementById('plot-size-input');
    const minusPlotBtn = document.getElementById('plot-minus-btn');
    const plusPlotBtn = document.getElementById('plot-plus-btn');
    
    const treeCountInput = document.getElementById('tree-count-input');
    const minusTreeBtn = document.getElementById('tree-minus-btn');
    const plusTreeBtn = document.getElementById('tree-plus-btn');
    
    const calculateBtn = document.getElementById('calculate-btn');
    const resultsContainer = document.getElementById('results-section');
    const resultsGrid = document.getElementById('results-grid');

    const nDisplay = document.getElementById('n-per-unit');
    const pDisplay = document.getElementById('p-per-unit');
    const kDisplay = document.getElementById('k-per-unit');
    
    // NPK total display elements (from the previous version, may need to be re-added to HTML if desired)
    const nTotalEl = document.getElementById('n-total');
    const pTotalEl = document.getElementById('p-total');
    const kTotalEl = document.getElementById('k-total');


    // --- FUNCTIONS ---

    function populateCropModal(filter = '') {
        cropGrid.innerHTML = '';
        Object.keys(cropData).forEach(cropId => {
            const crop = cropData[cropId];
            if (crop.name.toLowerCase().includes(filter.toLowerCase())) {
                const item = document.createElement('div');
                item.className = 'crop-item';
                item.dataset.crop = cropId; // Use the key as the data-crop value
                item.innerHTML = `
                    <div class="crop-item-icon"><img src="${crop.icon}" alt="${crop.name}"></div>
                    <span class="crop-item-name">${crop.name}</span>
                `;
                item.addEventListener('click', () => {
                    state.currentCrop = cropId;
                    updateUI();
                    closeModal();
                });
                cropGrid.appendChild(item);
            }
        });
    }
    
    const openModal = () => cropModal.classList.remove('hidden');
    const closeModal = () => cropModal.classList.add('hidden');

    function updateUI() {
        const crop = cropData[state.currentCrop];
        const selectedCropText = cropSelectorBtn.querySelector('#selected-crop-text');
        
        // Update the button text and icon
        selectedCropText.innerHTML = `<img src="${crop.icon}" class="button-crop-icon" alt=""> ${crop.name}`;

        if (crop.inputType === 'plot') {
            plotSizeCalculator.classList.remove('hidden');
            treeCountCalculator.classList.add('hidden');
            const factor = conversionFactors[state.unit];
            nDisplay.textContent = `${(crop.nutrientsPerAcre.n / factor).toFixed(0)} kg/${state.unit}`;
            pDisplay.textContent = `${(crop.nutrientsPerAcre.p / factor).toFixed(0)} kg/${state.unit}`;
            kDisplay.textContent = `${(crop.nutrientsPerAcre.k / factor).toFixed(0)} kg/${state.unit}`;
        } else { // 'trees'
            plotSizeCalculator.classList.add('hidden');
            treeCountCalculator.classList.remove('hidden');
            nDisplay.textContent = `${crop.nutrientsPerTree.n} kg/tree`;
            pDisplay.textContent = `${crop.nutrientsPerTree.p} kg/tree`;
            kDisplay.textContent = `${crop.nutrientsPerTree.k} kg/tree`;
        }
        
        // Trigger a calculation to update total NPK values shown in the top card
        updateTotalNutrientDisplay();
        resultsContainer.classList.add('hidden');
    }

    function updateTotalNutrientDisplay() {
        const crop = cropData[state.currentCrop];
        let totalRequiredN, totalRequiredP, totalRequiredK;

        if (crop.inputType === 'plot') {
            const plotSize = parseFloat(plotSizeInput.value) || 0;
            const sizeInAcres = plotSize * conversionFactors[state.unit];
            totalRequiredN = crop.nutrientsPerAcre.n * sizeInAcres;
            totalRequiredP = crop.nutrientsPerAcre.p * sizeInAcres;
            totalRequiredK = crop.nutrientsPerAcre.k * sizeInAcres;
        } else { // 'trees'
            const treeCount = parseInt(treeCountInput.value, 10) || 0;
            totalRequiredN = crop.nutrientsPerTree.n * treeCount;
            totalRequiredP = crop.nutrientsPerTree.p * treeCount;
            totalRequiredK = crop.nutrientsPerTree.k * treeCount;
        }
        
        nTotalEl.textContent = `${totalRequiredN.toFixed(0)} kg`;
        pTotalEl.textContent = `${totalRequiredP.toFixed(0)} kg`;
        kTotalEl.textContent = `${totalRequiredK.toFixed(0)} kg`;
    }

    function calculateFertilizers() {
        const crop = cropData[state.currentCrop];
        let totalRequiredN, totalRequiredP, totalRequiredK;

        if (crop.inputType === 'plot') {
            const plotSize = parseFloat(plotSizeInput.value) || 0;
            const sizeInAcres = plotSize * conversionFactors[state.unit];
            totalRequiredN = crop.nutrientsPerAcre.n * sizeInAcres;
            totalRequiredP = crop.nutrientsPerAcre.p * sizeInAcres;
            totalRequiredK = crop.nutrientsPerAcre.k * sizeInAcres;
        } else { // 'trees'
            const treeCount = parseInt(treeCountInput.value, 10) || 0;
            totalRequiredN = crop.nutrientsPerTree.n * treeCount;
            totalRequiredP = crop.nutrientsPerTree.p * treeCount;
            totalRequiredK = crop.nutrientsPerTree.k * treeCount;
        }

        const combinations = [];

        // Combination 1: MOP/TSP/Urea
        const tspForP = totalRequiredP / fertilizers.tsp.p;
        const ureaForN1 = totalRequiredN / fertilizers.urea.n;
        const mopForK1 = totalRequiredK / fertilizers.mop.k;
        combinations.push({
            title: 'MOP / TSP / Urea',
            fertilizers: [
                { name: 'MOP', kg: mopForK1 },
                { name: 'TSP', kg: tspForP },
                { name: 'Urea', kg: ureaForN1 },
            ]
        });

        // Combination 2: DAP/MOP/Urea
        const dapForP = totalRequiredP / fertilizers.dap.p;
        const nFromDap = dapForP * fertilizers.dap.n;
        const ureaForN2 = Math.max(0, (totalRequiredN - nFromDap) / fertilizers.urea.n);
        const mopForK2 = totalRequiredK / fertilizers.mop.k;
        combinations.push({
            title: 'DAP / MOP / Urea',
            fertilizers: [
                { name: 'DAP', kg: dapForP },
                { name: 'MOP', kg: mopForK2 },
                { name: 'Urea', kg: ureaForN2 },
            ]
        });
        
        displayCombinationResults(combinations);
        resultsContainer.classList.remove('hidden');
        resultsContainer.scrollIntoView({ behavior: 'smooth' });
    }

    function displayCombinationResults(combinations) {
        resultsGrid.innerHTML = '';
        combinations.forEach(combo => {
            const card = document.createElement('div');
            card.className = 'fertilizer-combo-card';
            
            let detailsHTML = '';
            combo.fertilizers.forEach(f => {
                const bags = f.kg / bagWeightKg;
                detailsHTML += `
                    <div class="combo-item">
                        <span class="combo-name">${f.name}</span>
                        <h4 class="combo-kg">${f.kg.toFixed(0)} kg</h4>
                        <span class="combo-bags">${bags.toFixed(2)} Bags</span>
                    </div>
                `;
            });

            card.innerHTML = `
                <h5>${combo.title}</h5>
                <div class="combo-details-grid">${detailsHTML}</div>
                
            `;
            resultsGrid.appendChild(card);
        });
    }

    // --- EVENT LISTENERS ---
    cropSelectorBtn.addEventListener('click', openModal);
    closeModalButton.addEventListener('click', closeModal);
    cropModal.addEventListener('click', e => (e.target === cropModal) && closeModal());
    searchInput.addEventListener('input', e => populateCropModal(e.target.value));

    unitRadios.forEach(radio => radio.addEventListener('change', (e) => {
        state.unit = e.target.value;
        updateUI();
    }));

    // Listeners for input changes to update total NPK in real-time
    plotSizeInput.addEventListener('input', updateTotalNutrientDisplay);
    treeCountInput.addEventListener('input', updateTotalNutrientDisplay);

    minusPlotBtn.addEventListener('click', () => {
        let currentValue = parseFloat(plotSizeInput.value) || 0;
        if (currentValue > 0.1) {
            plotSizeInput.value = (currentValue - 0.1).toFixed(1);
            updateTotalNutrientDisplay();
        }
    });
    plusPlotBtn.addEventListener('click', () => {
        let currentValue = parseFloat(plotSizeInput.value) || 0;
        plotSizeInput.value = (currentValue + 0.1).toFixed(1);
        updateTotalNutrientDisplay();
    });

    minusTreeBtn.addEventListener('click', () => {
        let currentValue = parseInt(treeCountInput.value, 10) || 0;
        if (currentValue > 1) {
            treeCountInput.value = currentValue - 1;
            updateTotalNutrientDisplay();
        }
    });
    plusTreeBtn.addEventListener('click', () => {
        let currentValue = parseInt(treeCountInput.value, 10) || 0;
        treeCountInput.value = currentValue + 1;
        updateTotalNutrientDisplay();
    });

    calculateBtn.addEventListener('click', calculateFertilizers);

    // --- INITIAL RENDER ---
    populateCropModal();
    updateUI();
});