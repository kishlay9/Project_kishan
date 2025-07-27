document.addEventListener('DOMContentLoaded', () => {
    // Check if Firebase was initialized correctly in the HTML
    if (typeof firebase === 'undefined' || !firebase.apps.length) {
        const errorMsg = "❌ [CRITICAL] Firebase is not initialized. Make sure the Firebase SDK scripts and your app's config are loaded correctly in yield.html *before* this script.";
        console.error(errorMsg);
        alert("A critical error occurred with the application setup. Please contact support.");
        document.getElementById('yield-form').querySelector('button').disabled = true;
        return;
    }
    
    // --- FIREBASE SDK INITIALIZATION FOR PRODUCTION ---
    const functions = firebase.app().functions('asia-south1');
    const firestore = firebase.firestore();
    console.log("✅ [DEBUG] Firebase services ready. Functions region: 'asia-south1'.");

    // Data for dropdowns
    const cropData = {
        "Ajwan": ["Ajwan", "Other"],
        "Amaranthus": ["Amaranthus", "Other"],
        "Amphophalus": ["Amphophalus", "Other"],
        "Apple": ["American", "Apple", "Delicious", "Golden", "Hajratbali", "Kasmir/Shimla - II", "Kullu Royal Delicious", "Other", "Royal Delicious", "Simla"],
        "Arecanut(Betelnut/Supari)": ["Bette", "Bilegotu", "Chali", "Chippu", "Cqca", "Factory", "Kempugotu", "New Variety", "Other", "Rashi", "Raw", "Red", "Ripe", "Sippegotu", "Supari", "Tattibettee"],
        "Arhar (Tur/Red Gram)(Whole)": ["777 New Ind", "Arhar (Whole)", "Arhar Dal(Tur)", "Hybrid", "Other"],
        "Arhar Dal(Tur Dal)": ["Arhar Dal(Tur)"],
        "Asalia": ["Asalia"],
        "Asgand": ["Asgand"],
        "Ashgourd": ["Ashgourd", "Gouard", "Other"],
        "Asparagus": ["Asparagus"],
        "Bajra(Pearl Millet/Cumbu)": ["Bold", "Deshi", "Hybrid", "Local", "Millet", "Other"],
        "Banana": ["Amruthapani", "Besrai", "Bhushavali(Pacha)", "Chakkarakeli(Red)", "Chakkarakeli(White)", "Champa", "Desi(Bontha)", "Elakki Bale", "Khandesh", "Karpura", "Medium", "Nauti Bale", "Nendra Bale", "Other", "Pachha Bale", "Palayamthodan", "Poovan", "Rasakathai", "Red Banana", "Robusta"],
        "Banana - Green": ["Banana - Green", "Other"],
        "Barley (Jau)": ["Barley", "Dara", "Other"],
        "Beans": ["Beans (Whole)", "Other"],
        "Beetroot": ["Beetroot", "Other"],
        "Bengal Gram Dal (Chana Dal)": ["Bengal Gram (Split)", "Bengal Gram Dal"],
        "Bengal Gram(Gram)(Whole)": ["999", "Average (Whole)", "Chana Kabuli", "Chana Kanta", "Chana mausami", "Desi (F.A.Q. Split)", "Desi (Whole)", "Gram", "Jawari/Local", "Kabul", "Kabul Small", "Medium", "Other"],
        "Betal Leaves": ["Local", "Mysore", "Other"],
        "Bhindi(Ladies Finger)": ["Bhindi", "Other"],
        "Bitter gourd": ["Bitter Gourd", "Other"],
        "Black Gram (Urd Beans)(Whole)": ["Black Gram (Whole)", "Black Gram Dal", "Desi", "Hybrid", "Other", "Urda/Urd"],
        "Black Gram Dal (Urd Dal)": ["Black Gram Dal"],
        "Black pepper": ["Garbled", "Malabar", "Other", "Ungrabled"],
        "Bottle gourd": ["Bottle Gourd", "Other"],
        "Brinjal": ["Arkasheela Mattigulla", "Brinjal", "Other", "Round", "Round/Long"],
        "Bunch Beans": ["Bunch Beans"],
        "Cabbage": ["Cabbage", "Other"],
        "Capsicum": ["Capsicum", "Other"],
        "Carrot": ["Carrot", "Other", "Pusakesar"],
        "Cashewnuts": ["Other"],
        "Castor Seed": ["Caster", "Castor seed", "Other"],
        "Cauliflower": ["African Sarson", "Cauliflower", "Local", "Other", "Ranchi"],
        "Chapparad Avare": ["Chapparada Avarekai"],
        "Chikoos(Sapota)": ["Other", "Sapota"],
        "Chili Red": ["Bold", "Red"],
        "Chilly Capsicum": ["Chilly Capsicum", "Other"],
        "Chow Chow": ["Chow Chow"],
        "Cinamon(Dalchini)": ["Other"],
        "Cluster beans": ["Cluster Beans", "Other"],
        "Cock": ["Boiler/Firm(White)"],
        "Coconut": ["Big", "Coconut", "Medium", "Other"],
        "Coconut Oil": ["Copra Oil", "Other"],
        "Coconut Seed": ["Coconut Seed", "Other"],
        "Coffee": ["Other"],
        "Colacasia": ["Arabi", "Colacasia", "Other"],
        "Copra": ["other"],
        "Coriander(Leaves)": ["A-1, Green", "Coriander", "Coriander-Organic", "I Sort", "Other"],
        "Corriander seed": ["A-1, Green", "Coriander Seed", "Other"],
        "Cotton": ["Bunny", "Local", "Narma BT Cotton", "Other", "Shanker 6 (B) 30mm FIne"],
        "Cowpea (Lobia/Karamani)": ["Cowpea (Whole)", "Other"],
        "Cowpea(Veg)": ["Bean Barbati", "Cowpea (Veg)", "Other"],
        "Cucumbar(Kheera)": ["Cucumbar", "Other"],
        "Cummin Seed(Jeera)": ["Cummin Seed(Jeera)", "Medium", "Other"],
        "Custard Apple (Sharifa)": ["Custard Apple(Sharifa)"],
        "Drumstick": ["Drumstick", "Other"],
        "Dry Chillies": ["1st Sort", "Byadgi", "Dry Chillies", "Guntur", "Local", "Other", "Red", "Red New", "Red Top", "White"],
        "Dry Fodder": ["Dry Fodder"],
        "Duster Beans": ["Other"],
        "Elephant Yam (Suran)": ["Elephant Yam (Suran)", "Other"],
        "Field Pea": ["Field Pea"],
        "Fig(Anjura/Anjeer)": ["Anjura"],
        "Firewood": ["Firewood", "Other"],
        "Fish": ["Bata Putti", "Black Dom", "Chilwa", "Fish", "Halwa", "Hilsa", "Katla (Small)", "Katla(Big)", "Malli(Big)", "Malli(Small)", "Other", "Pangass", "Rahu(Andhra)", "Rahu(Local)", "Singhra(Big)", "Singhra(Small)", "Sol", "Soli", "Surmai(Big)", "Surmali(Small)", "White Dom", "Zinga(Zambo-A)", "Zinga(Zambo-B)", "Zinga(Zambo-C)"],
        "Foxtail Millet(Navane)": ["Other"],
        "French Beans (Frasbean)": ["French Beans (Frasbean)", "Other"],
        "Garlic": ["Average", "China", "Desi", "Garlic", "Garlic-Organic", "Other", "UP"],
        "Ghee": ["Ghee"],
        "Ginger(Dry)": ["Big/Thick", "Dry", "Other", "Vegitable-fresh"],
        "Ginger(Green)": ["Green Ginger", "Other"],
        "Grapes": ["Annabesahai", "Black", "Green", "Other", "White"],
        "Green Avare (W)": ["Avare (W)", "Green Avare (W)"],
        "Green Chilli": ["Green Chilly", "Other"],
        "Green Fodder": ["Green Fodder"],
        "Green Gram (Moong)(Whole)": ["Ankola", "Green (Whole)", "Green Gram Dhall-I", "Hybrid", "Local (Whole)", "Other"],
        "Green Gram Dal (Moong Dal)": ["Green Gram Dal"],
        "Green Peas": ["Green Peas", "Pea"],
        "Ground Nut Seed": ["Ground Nut Seed", "Other"],
        "Groundnut": ["Balli/Habbu", "Big (With Shell)", "Bold", "G20", "Gejje", "Hybrid", "Local", "M-37", "Other", "Seed", "TMV-2"],
        "Groundnut (Split)": ["Groundnut(Split)"],
        "Groundnut pods (raw)": ["Other"],
        "Guar": ["Guaar", "Guar", "Gwar", "Other"],
        "Guar Seed(Cluster Beans Seed)": ["Other", "Split", "Whole"],
        "Guava": ["Guava", "Guava Alahabad", "Other"],
        "Gur(Jaggery)": ["Achhu", "Jaggery", "Kurikatu", "NO 2", "NO 3", "Other", "Pathari", "Red", "Unde", "Yellow"],
        "Indian Beans (Seam)": ["Indian Beans (Seam)", "Other"],
        "Isabgul (Psyllium)": ["Isabgul (Psyllium)"],
        "Jack Fruit": ["Jack Fruit", "Other"],
        "Jasmine": ["Jasmine"],
        "Javi": ["Javi"],
        "Jowar(Sorghum)": ["Jowar ( White)", "Jowar (Yellow)", "Local", "Other", "Red"],
        "Jute": ["TD-5"],
        "Kabuli Chana(Chickpeas-White)": ["Bitkey", "Dollar Gram", "Double Dollar Chana", "Kabul", "Kabuli Chana(Chickpeas-white)", "Russian"],
        "Kakada": ["Kakada"],
        "Karbuja(Musk Melon)": ["Karbhuja"],
        "Kartali (Kantola)": ["Kartali (Kantola)", "Other"],
        "Knool Khol": ["Knool Khol"],
        "Kodo Millet(Varagu)": ["Kondo"],
        "Kulthi(Horse Gram)": ["Horse gram (Whole)", "Other"],
        "Kutki": ["Kutki"],
        "Lak(Teora)": ["Tiwada"],
        "Leafy Vegetable": ["Leafy Vegetables", "Other"],
        "Lemon": ["Lemon", "Other"],
        "Lentil (Masur)(Whole)": ["Kala Masoor New", "Local", "Masoor Gola", "Masur Dal", "Organic", "Other"],
        "Lime": ["Lime", "Other"],
        "Linseed": ["Flaxseed", "Linseed", "Other"],
        "Little gourd (Kundru)": ["Little gourd (Kundru)", "Other"],
        "Long Melon(Kakri)": ["Long Melon (Kakri)", "Other"],
        "Mahua": ["Gulli", "Mahua", "Mahua Seed / Bunch"],
        "Mahua Seed(Hippe seed)": ["Mahua Seed"],
        "Maize": ["Deshi Red", "Hybrid", "Hybrid/Local", "Local", "Medium", "Other", "White (SAFED)", "Yellow"],
        "Mango": ["Badami", "Chausa", "Dusheri", "Fazli", "Langra", "Neelam", "Other", "Safeda", "Totapuri"],
        "Mango (Raw-Ripe)": ["Mango - Raw-Ripe", "Other"],
        "Marigold(Calcutta)": ["Marigold(Calcutta)"],
        "Mashrooms": ["Mashrooms", "Other"],
        "Masur Dal": ["Kala Masoor New", "Masur Dal"],
        "Mataki": ["Other"],
        "Methi Seeds": ["Best", "Medium", "Methiseeds"],
        "Methi(Leaves)": ["Methi", "Other"],
        "Millets": ["Millets"],
        "Mint(Pudina)": ["Mint(Pudina)"],
        "Moath Dal": ["Moath Dal"],
        "Mousambi(Sweet Lime)": ["Mosambi-Organic", "Mousambi", "Other"],
        "Mustard": ["Big 100 Kg", "Lohi Black", "Mustard", "Mustard-Organic", "Other", "Rai UP", "Rajasthan Tukdi", "Sarson(Black)", "Yellow (Black)"],
        "Mustard Oil": ["Mustard Oil", "Other"],
        "Neem Seed": ["Neem Seed"],
        "Niger Seed (Ramtil)": ["Ramatilli"],
        "Onion": ["1st Sort", "2nd Sort", "Bellary", "Big", "Dry F.A.Q.", "Local", "Medium", "Nasik", "Onion", "Onion-Organic", "Other", "Pusa-Red", "Red", "Small", "White"],
        "Onion Green": ["Onion Green", "Other"],
        "Orange": ["Darjeeling", "Orange", "Other"],
        "Other green and fresh vegetables": ["Other"],
        "Paddy(Dhan)(Basmati)": ["Basmati 1509"],
        "Paddy(Dhan)(Common)": ["1001", "1009 Kar", "1121", "ADT 37", "B P T", "Basmati 1509", "Basumathi", "Common", "D.B.", "Dhan", "Fine", "I.R. 36", "I.R. 64", "Kranti", "Kshatriya", "MTU-1008", "MTU-1010", "Other", "Paddy", "Paddy Coarse", "Paddy fine", "Paddy Medium", "Puspa (MR 301)", "Samba Masuri", "Sona", "Sugandha", "Swarna Masuri (New)"],
        "Papaya": ["Other", "Papaya"],
        "Papaya (Raw)": ["Other"],
        "Peach": ["Other", "Peach"],
        "Pear(Marasebu)": ["Other", "Pears"],
        "Peas(Dry)": ["Other", "Peas(Dry)"],
        "Peas cod": ["Other", "Peas cod"],
        "Peas Wet": ["Other", "Peas Wet"],
        "Pepper ungarbled": ["Other"],
        "Pigs": ["Pigs"],
        "Pineapple": ["Pine Apple", "Other"],
        "Plum": ["Other", "Plum"],
        "Pointed gourd (Parval)": ["Other", "Pointed gourd (Parval)"],
        "Pomegranate": ["Other", "Pomogranate"],
        "Potato": ["(Red Nanital)", "Badshah", "Chandermukhi", "Chips", "Desi", "F.A.Q.", "Haldwani", "Jalander", "Jyoti", "Kufri Megha", "Local", "Other", "Potato", "Red"],
        "Pumpkin": ["Other", "Pumpkin"],
        "Raddish": ["Other", "Raddish"],
        "Ragi (Finger Millet)": ["Local", "Other"],
        "Rajgir": ["Other", "Rajgir"],
        "Rat Tail Radish (Mogari)": ["Other"],
        "Rayee": ["Raee"],
        "Rice": ["1009 Kar", "Broken Rice", "Coarse", "Common", "Fine", "Fine(Basmati)", "III", "Masuri", "Medium", "Other", "Sona", "Sona Mansoori Non Basmati", "Super Fine"],
        "Ridgeguard(Tori)": ["Other", "Ridgeguard(Tori)"],
        "Rose(Local)": ["Rose (Local)"],
        "Rose(Loose))": ["Rose(Loose)"],
        "Round gourd": ["Other", "Round gourd"],
        "Rubber": ["RSS-4", "Other"],
        "Safflower": ["Other", "Safflower"],
        "Seemebadnekai": ["Seemebadanekai"],
        "Seetapal": ["Other"],
        "Sesamum(Sesame,Gingelly,Til)": ["Black", "Gajjar", "Other", "Sesame", "White"],
        "Snakeguard": ["Other", "Snakeguard"],
        "Soanf": ["Other", "Soanf"],
        "Soyabean": ["Black", "Local", "Other", "Soyabeen", "Soybean-Organic", "Yellow"],
        "Spinach": ["Organic", "Other", "Spinach"],
        "Sponge gourd": ["Other", "Sponge gourd"],
        "Squash(Chappal Kadoo)": ["Other", "Squash(Chappal Kadoo)"],
        "Sugar": ["Chini", "Medium", "Other"],
        "Suva (Dill Seed)": ["Other", "Suva (Dill Seed)"],
        "Suvarna Gadde": ["Suvarnagadde"],
        "Sweet Potato": ["Hosur Green", "Hosur Red", "Other", "Sweet Potato"],
        "Sweet Pumpkin": ["Other", "Sweet Pumpkin"],
        "Tamarind Fruit": ["Non A/c Fine", "Tamarind Fruit"],
        "Tamarind Seed": ["Other"],
        "Tapioca": ["Other", "Tapioca"],
        "Taramira": ["Other"],
        "Tender Coconut": ["Other", "Tender Coconut"],
        "Thondekai": ["Thondekai"],
        "Tinda": ["Organic", "Other", "Tinda"],
        "Tomato": ["Deshi", "Hybrid", "Local", "Other", "Sankar", "Tomato"],
        "Tube Flower": ["Tube Flower"],
        "Tube Rose(Loose)": ["Tube Rose (Loose)"],
        "Turmeric": ["Bulb", "Finger"],
        "Turnip": ["Turnip"],
        "Water Melon": ["Water Melon"],
        "Water chestnut": ["Water chestnut"],
        "Wheat": ["147 Average", "147 Best", "2189 No. 1", "2189 No. 2", "Bansi", "Dara", "Deshi", "Farmi", "Hybrid", "Kalyan", "Local", "Lok-1", "Lokwan", "Lokwan Gujrat", "Maharashtra 2189", "Malwa Shakti", "Medium Fine", "Mill Quality", "Other", "PISSI", "Rajasthan Tukdi", "Sharbati", "Sonalika", "Sujata", "Super Fine", "Wheat", "Wheat Mix", "Wheat-Organic"],
        "White Peas": ["White Peas"],
        "White Pumpkin": ["White Pumpkin"],
        "Wood": ["Eucalyptus", "Other"],
        "Yam": ["Other"],
        "Yam (Ratalu)": ["Other", "Yam (Ratalu)"],
        "buttery": ["Buttery", "Buttery-Organic"],
        "gulli": ["Gulli"]
    };

    // --- DOM ELEMENT REFERENCES ---
    const yieldForm = document.getElementById('yield-form');
    const statusIndicator = document.getElementById('yield-status');
    const yieldOutput = document.getElementById('yield-output');
    const cropSelect = document.getElementById('crop-select');
    const varietySelect = document.getElementById('variety-select');
    const masterPlanGrid = document.querySelector('.week-plan-grid');
    const dailyTasksGrid = document.querySelector('.daily-tasks-grid');

    // --- DYNAMICALLY POPULATE DROPDOWNS ---
    const crops = Object.keys(cropData).sort();
    crops.forEach(crop => { const option = document.createElement('option'); option.value = crop; option.textContent = crop; cropSelect.appendChild(option); });
    cropSelect.addEventListener('change', () => { const selectedCrop = cropSelect.value; varietySelect.innerHTML = ''; if (selectedCrop && cropData[selectedCrop]) { varietySelect.disabled = false; let defaultOption = document.createElement('option'); defaultOption.value = ""; defaultOption.textContent = "Select a Variety"; varietySelect.appendChild(defaultOption); cropData[selectedCrop].forEach(variety => { const option = document.createElement('option'); option.value = variety; option.textContent = variety; varietySelect.appendChild(option); }); } else { varietySelect.disabled = true; let placeholderOption = document.createElement('option'); placeholderOption.value = ""; placeholderOption.textContent = "Select Crop First"; varietySelect.appendChild(placeholderOption); } });

    // --- FORM SUBMISSION LOGIC ---
    yieldForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    console.log("📝 [DEBUG] Form submitted.");
    
    const crop = cropSelect.value;
    const variety = varietySelect.value;
    const sowingDate = document.getElementById('sowing-date').value;
    const locationText = document.getElementById('location').value;

    if (!crop || !variety || !sowingDate || !locationText) {
        alert('Please fill out all fields to generate a plan.');
        return;
    }

    yieldOutput.classList.add('hidden');
    statusIndicator.classList.remove('hidden');
    statusIndicator.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    const farmId = 'testFarm01';

    try {
        // --- START OF THE FIX ---

        // 1. Get the current language from localStorage to send to the backend.
        const lang = localStorage.getItem('project-kisan-lang') || 'en';

        // 2. Add the 'language' property to the data payload.
        const dataToSend = {
            farmId: farmId,
            crop: crop,
            variety: variety,
            sowingDate: sowingDate,
            location: { latitude: 28.6139, longitude: 77.2090 }, // Note: This location is hardcoded
            language: lang // <-- THIS IS THE CRITICAL ADDITION
        };
        
        // --- END OF THE FIX ---
        
        const generateMasterPlanCallable = functions.httpsCallable('generateMasterPlan');
        console.log("🚀 [DEBUG] Calling 'generateMasterPlan' with payload:", dataToSend);
        
        const result = await generateMasterPlanCallable(dataToSend);
        console.log("✅ [DEBUG] Received response from callable function:", result.data);
        
        if (!result.data || !result.data.dailyTasks) {
            throw new Error("The function response from the server was incomplete.");
        }
        
        // The data received from the function is already translated.
        const dailyTasks = result.data.dailyTasks;
        
        // Fetch the master plan which was saved to Firestore by the function.
        const masterPlan = await fetchMasterPlanFromFirestore(farmId);

        // Display the translated data.
        displayMasterPlan(masterPlan);
        displayDailyTasks(dailyTasks);

        statusIndicator.classList.add('hidden');
        yieldOutput.classList.remove('hidden');
        yieldOutput.scrollIntoView({ behavior: 'smooth', block: 'start' });

    } catch (error) {
        console.error("❌ [CRITICAL ERROR] Failed to generate plan:", error);
        statusIndicator.classList.add('hidden');
        alert(`Failed to generate your plan. Please try again. \nError: ${error.message}`);
    }
});


    async function fetchMasterPlanFromFirestore(farmId) {
        console.log(`[DEBUG] Fetching master plan for farm '${farmId}' from Firestore...`);
        try {
            const farmDocRef = firestore.collection('userFarms').doc(farmId);
            const docSnap = await farmDocRef.get();

            // --- THIS IS THE FIX ---
            // Changed from docSnap.exists() to docSnap.exists
            if (docSnap.exists && docSnap.data().activePlan && docSnap.data().activePlan.masterPlan) {
                console.log("✅ [DEBUG] Found master plan in Firestore.");
                return docSnap.data().activePlan.masterPlan;
            } else {
                throw new Error("Could not find the generated master plan in the database.");
            }
        } catch (error) {
            console.error("Firestore read failed:", error);
            throw error;
        }
    }

    function displayMasterPlan(plan) {
        masterPlanGrid.innerHTML = '';
        if (!plan || !Array.isArray(plan)) {
            masterPlanGrid.innerHTML = '<p>Could not load master plan.</p>';
            return;
        }
        plan.forEach(week => {
            const weekCard = document.createElement('div');
            weekCard.className = 'week-card';
            weekCard.innerHTML = `<h4>Week ${week.weekNumber}</h4><p>${week.activities}</p>`;
            masterPlanGrid.appendChild(weekCard);
        });
    }

    function displayDailyTasks(tasks) {
        dailyTasksGrid.innerHTML = '';
        if (!tasks || !Array.isArray(tasks)) {
            dailyTasksGrid.innerHTML = '<p>Could not load daily tasks.</p>';
            return;
        }
        tasks.forEach(task => {
            const taskCard = document.createElement('div');
            taskCard.className = 'daily-task-card';
            taskCard.innerHTML = `<img src="images/${task.icon}.svg" alt="${task.title} Icon"><h4>${task.title}</h4><p>${task.description}</p>`;
            dailyTasksGrid.appendChild(taskCard);
        });
    }
});