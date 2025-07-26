// Add these new keys to your existing translations object

const translations = {
  en: {
    // ... all your existing keys for Crop Doctor and Market Analysis labels ...
    analysisTitle: "{crop} Analysis in {market}, {state}",
    dateLabel: "Date: {date}",
    priceLabel: "₹ {price} / Quintal",
    noTrendData: "No trend data available.",
    noComparisonData: "No comparison data available.",
    noOutlookData: "Outlook not available.",
    noAdviceData: "No specific advice available.",
    noFactorsData: "No specific factors identified."
  },
  hi: {
    // ... all your existing keys ...
    analysisTitle: "{market}, {state} में {crop} का विश्लेषण",
    dateLabel: "दिनांक: {date}",
    priceLabel: "₹ {price} / क्विंटल",
    noTrendData: "कोई प्रवृत्ति डेटा उपलब्ध नहीं है।",
    noComparisonData: "कोई तुलना डेटा उपलब्ध नहीं है।",
    noOutlookData: "दृष्टिकोण उपलब्ध नहीं है।",
    noAdviceData: "कोई विशेष सलाह उपलब्ध नहीं है।",
    noFactorsData: "कोई विशेष कारक पहचाना नहीं गया।"
  },
  kn: {
    // ... all your existing keys ...
   analysisTitle: "{market}, {state} ನಲ್ಲಿ {crop} ವಿಶ್ಲೇಷಣೆ", 
    dateLabel: "ದಿನಾಂಕ: {date}",
    priceLabel: "₹ {price} / ಕ್ವಿಂಟಲ್",
    noTrendData: "ಯಾವುದೇ ಪ್ರವೃತ್ತಿ ಡೇಟಾ ಲಭ್ಯವಿಲ್ಲ.",
    noComparisonData: "ಯಾವುದೇ ಹೋಲಿಕೆ ಡೇಟಾ ಲಭ್ಯವಿಲ್ಲ.",
    noOutlookData: "ದೃಷ್ಟಿಕೋನ ಲಭ್ಯವಿಲ್ಲ.",
    noAdviceData: "ಯಾವುದೇ ನಿರ್ದಿಷ್ಟ ಸಲಹೆ ಲಭ್ಯವಿಲ್ಲ.",
    noFactorsData: "ಯಾವುದೇ ನಿರ್ದಿಷ್ಟ ಅಂಶಗಳನ್ನು ಗುರುತಿಸಲಾಗಿಲ್ಲ."
  }
};




document.addEventListener('DOMContentLoaded', () => {
    // --- DATABASE: Pre-processed data from the provided CSV file ---
    const marketData = {
        "Andhra Pradesh": {
            "Adoni": ["Cotton", "Groundnut"],
            "Ambajipeta": ["Banana"],
            "Anakapally": ["Gur(Jaggery)"],
            "Anantapur": ["Mousambi(Sweet Lime)"],
            "Chintalapudi": ["Lemon"],
            "Chittoor": ["Gur(Jaggery)"],
            "Cuddapah": ["Groundnut", "Turmeric"],
            "Denduluru": ["Lime"],
            "Eluru": ["Lemon"],
            "Guntur": ["Dry Chillies"],
            "Hindupur": ["Dry Chillies", "Tamarind Fruit"],
            "Kalikiri": ["Tomato"],
            "Kurnool": ["Arhar (Tur/Red Gram)(Whole)", "Black Gram (Urd Beans)(Whole)", "Dry Chillies", "Foxtail Millet(Navane)", "Groundnut", "Onion"],
            "Madanapalli": ["Tomato"],
            "Mulakalacheruvu": ["Tomato"],
            "Palamaner": ["Brinjal", "Cabbage", "Cauliflower", "Cluster beans", "Green Chilli", "Potato", "Ridgeguard(Tori)", "Tomato"],
            "Pidugurala(Palnadu)": ["Dry Chillies"],
            "Rapur": ["Wood"],
            "Ravulapelem": ["Banana"],
            "Tirupati": ["Banana"],
            "Tiruvuru": ["Dry Chillies", "Maize", "Paddy(Dhan)(Common)", "Rice"],
            "Vayalapadu": ["Tomato"],
            "Yemmiganur": ["Castor Seed", "Groundnut"]
        },
        "Assam": {
            "Anand Bazar": ["Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Capsicum", "Ginger(Green)", "Green Chilli", "Lemon", "Pumpkin", "Tomato"],
            "Balugaon": ["Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Capsicum", "Ginger(Green)", "Green Chilli", "Lemon", "Pumpkin", "Tomato"],
            "Barpeta Road": ["Banana", "Beetroot", "Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Capsicum", "Ginger(Green)", "Green Chilli", "Lemon", "Pumpkin", "Tomato"],
            "Chapar": ["Bhindi(Ladies Finger)", "Bitter gourd", "Brinjal", "Cabbage", "Capsicum", "Ginger(Green)", "Green Chilli", "Lemon", "Pumpkin", "Tomato"],
            "Darangiri Banana Market": ["Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Cabbage", "Capsicum", "Ginger(Green)", "Green Chilli", "Lemon", "Pumpkin", "Tomato"],
            "Dhekiajuli": ["Bhindi(Ladies Finger)", "Bottle gourd", "Brinjal", "Cabbage", "Capsicum", "Green Chilli", "Lemon", "Pumpkin", "Tomato"],
            "Golaghat": ["Bhindi(Ladies Finger)", "Bitter gourd", "Cabbage", "Capsicum", "Ginger(Green)", "Green Chilli", "Lemon", "Pumpkin", "Tomato"],
            "Haibargaon": ["Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Cabbage", "Capsicum", "Ginger(Green)", "Green Chilli", "Lemon", "Pumpkin", "Tomato"],
            "Jagiroad Dry Fish Market": ["Beans", "Bhindi(Ladies Finger)", "Cabbage", "Capsicum", "Ginger(Green)", "Green Chilli", "Lemon", "Pumpkin", "Tomato"],
            "Jorhat": ["Bhindi(Ladies Finger)", "Bottle gourd", "Brinjal", "Cabbage", "Capsicum", "Green Chilli", "Lemon", "Pumpkin", "Tomato"],
            "Nalbari": ["Banana", "Bhindi(Ladies Finger)", "Bitter gourd", "Brinjal", "Cabbage", "Capsicum", "Ginger(Green)", "Green Chilli", "Lemon", "Pumpkin", "Tomato"],
            "Pamohi(Garchuk)": ["Beans", "Beetroot", "Bhindi(Ladies Finger)", "Cabbage", "Capsicum", "Ginger(Green)", "Green Chilli", "Lemon", "Pumpkin", "Tomato"],
            "Serfanguri": ["Bhindi(Ladies Finger)", "Bottle gourd", "Cabbage", "Capsicum", "Green Chilli", "Lemon", "Pumpkin", "Tomato"],
            "Sariahjan": ["Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Cabbage", "Capsicum", "Ginger(Green)", "Green Chilli", "Lemon", "Tomato"],
            "Sibsagar": ["Bhindi(Ladies Finger)", "Bitter gourd", "Cabbage", "Capsicum", "Ginger(Green)", "Green Chilli", "Lemon", "Pumpkin", "Tomato"],
            "Sonabarighat": ["Cabbage", "Capsicum", "Green Chilli", "Pumpkin", "Tomato"]
        },
        "Bihar": {
            "Barahat": ["Onion"],
            "Jainagar": ["Onion"],
            "Natwar": ["Potato"]
        },
        "Chattisgarh": {
            "Abhanpur": ["Paddy(Dhan)(Common)"],
            "Bagbahra": ["Paddy(Dhan)(Common)"],
            "Bededonger": ["Maize"],
            "Bheemkhoj": ["Paddy(Dhan)(Common)"],
            "Bilaspur": ["Methi(Leaves)", "Wheat"],
            "Champa": ["Paddy(Dhan)(Common)"],
            "Charama": ["Paddy(Dhan)(Common)"],
            "Chhinari": ["Maize"],
            "Gandai": ["Green Gram (Moong)(Whole)"],
            "Jairamnagar": ["Paddy(Dhan)(Common)"],
            "Jhalap": ["Paddy(Dhan)(Common)"],
            "Kasdol": ["Paddy(Dhan)(Common)"],
            "Katghora": ["Mahua", "Paddy(Dhan)(Common)"],
            "Kawardha": ["Soyabean"],
            "Keshkal": ["Maize"],
            "Kheragarh": ["Soyabean"],
            "Kondagoan": ["Maize"],
            "Lakhanpuri": ["Paddy(Dhan)(Common)"],
            "Mahasamund": ["Paddy(Dhan)(Common)"],
            "Nagari": ["Paddy(Dhan)(Common)"],
            "Naila": ["Paddy(Dhan)(Common)"],
            "Narharpur": ["Paddy(Dhan)(Common)"],
            "Pathalgaon": ["Paddy(Dhan)(Common)"],
            "Pendraroad": ["Mahua Seed(Hippe seed)"],
            "Pharasgaon": ["Maize"],
            "Pithoura": ["Paddy(Dhan)(Common)"],
            "Raipur": ["Maize"],
            "Rajim": ["Paddy(Dhan)(Common)"],
            "Ramanujganj": ["Maize"],
            "Salihabhata": ["Paddy(Dhan)(Common)"],
            "Shivrinarayanpur": ["Paddy(Dhan)(Common)"],
            "Surajpur": ["Wheat"],
            "Tendukona": ["Paddy(Dhan)(Common)"]
        },
        "Goa": {
            "Mapusa": ["Banana", "Brinjal", "Green Chilli", "Onion", "Papaya", "Pineapple", "Potato", "Rose(Loose))", "Water Melon"]
        },
        "Gujarat": {
            "Ahmedabad": ["Ajwan", "Banana - Green", "Beetroot", "Bitter gourd", "Bottle gourd", "Brinjal", "Cabbage", "Capsicum", "Carrot", "Colacasia", "Cucumbar(Kheera)", "Drumstick", "Elephant Yam (Suran)", "French Beans (Frasbean)", "Ginger(Green)", "Green Chilli", "Groundnut pods (raw)", "Guar", "Lemon", "Mango (Raw-Ripe)", "Onion Green", "Papaya (Raw)", "Peas Wet", "Pointed gourd (Parval)", "Pumpkin", "Sweet Potato", "Tinda", "Tomato"],
            "Ahmedabad(Chimanbhai Patal Market Vasana)": ["Onion", "Potato"],
            "Amreli": ["Ajwan", "Arhar (Tur/Red Gram)(Whole)", "Bajra(Pearl Millet/Cumbu)", "Bengal Gram(Gram)(Whole)", "Black Gram (Urd Beans)(Whole)", "Castor Seed", "Corriander seed", "Cotton", "Cummin Seed(Jeera)", "Green Gram (Moong)(Whole)", "Ground Nut Seed", "Groundnut", "Groundnut (Split)", "Jowar(Sorghum)", "Methi Seeds", "Sesamum(Sesame,Gingelly,Til)", "Soyabean", "Wheat"],
            "Ankleshwar": ["Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Cabbage", "Carrot", "Cauliflower", "Coriander(Leaves)", "Ginger(Green)", "Green Chilli", "Lemon", "Tomato"],
            "Babra": ["Cotton", "Cummin Seed(Jeera)", "Wheat"],
            "Bachau": ["Cummin Seed(Jeera)"],
            "Bagasara": ["Arhar (Tur/Red Gram)(Whole)", "Bajra(Pearl Millet/Cumbu)", "Bengal Gram(Gram)(Whole)", "Corriander seed", "Cotton", "Green Gram (Moong)(Whole)", "Groundnut", "Maize", "Sesamum(Sesame,Gingelly,Til)", "Soyabean", "Wheat"],
            "Bardoli(Katod)": ["Bhindi(Ladies Finger)", "Brinjal"],
            "Bayad(Sadamba)": ["Wheat"],
            "Bhabhar": ["Castor Seed"],
            "Bhanvad": ["Corriander seed", "Cummin Seed(Jeera)", "Green Gram (Moong)(Whole)", "Groundnut", "Sesamum(Sesame,Gingelly,Til)", "Soyabean", "Wheat"],
            "Bharuch": ["Banana - Green", "Bhindi(Ladies Finger)", "Brinjal", "Cabbage", "Capsicum", "Cauliflower", "Coriander(Leaves)", "Ginger(Green)", "Green Chilli", "Lemon", "Mango", "Onion", "Papaya", "Potato", "Tomato"],
            "Bhavnagar": ["Bajra(Pearl Millet/Cumbu)", "Bengal Gram(Gram)(Whole)", "Cummin Seed(Jeera)", "Groundnut", "Onion", "Sesamum(Sesame,Gingelly,Til)", "Wheat"],
            "Bhesan": ["Bengal Gram(Gram)(Whole)", "Cotton", "Sesamum(Sesame,Gingelly,Til)", "Soyabean", "Wheat"],
            "Bhiloda": ["Castor Seed", "Maize", "Wheat"],
            "Bilimora": ["Bhindi(Ladies Finger)", "Bottle gourd", "Brinjal", "Cabbage", "Cauliflower", "Green Chilli", "Onion", "Potato", "Tomato"],
            "Bodeliu": ["Cotton", "Groundnut", "Maize"],
            "Borsad": ["Wheat"],
            "Botad": ["Arhar (Tur/Red Gram)(Whole)", "Bajra(Pearl Millet/Cumbu)", "Castor Seed", "Cummin Seed(Jeera)", "Green Gram (Moong)(Whole)", "Groundnut", "Jowar(Sorghum)", "Kulthi(Horse Gram)", "Mustard", "Sesamum(Sesame,Gingelly,Til)", "Soanf", "Wheat"],
            "Botad(Haddad)": ["Cotton"],
            "Chansama": ["Ajwan"],
            "Chikli(Khorgam)": ["Bitter gourd", "Bottle gourd", "Pointed gourd (Parval)", "Tinda"],
            "Chotila": ["Jowar(Sorghum)", "Wheat"],
            "Dahod": ["Arhar (Tur/Red Gram)(Whole)", "Bajra(Pearl Millet/Cumbu)", "Bengal Gram(Gram)(Whole)", "Castor Seed", "Green Gram (Moong)(Whole)", "Maize", "Paddy(Dhan)(Common)", "Rice", "Sesamum(Sesame,Gingelly,Til)", "Soyabean", "Wheat"],
            "Dahod(Veg. Market)": ["Pointed gourd (Parval)", "Potato", "Pumpkin", "Tomato"],
            "Damnagar": ["Bhindi(Ladies Finger)", "Brinjal", "Cabbage", "Cauliflower", "Coriander(Leaves)", "Ginger(Green)", "Green Chilli", "Guar", "Lemon", "Tomato"],
            "Dasada Patadi": ["Ajwan", "Castor Seed", "Cummin Seed(Jeera)", "Soanf"],
            "Deesa": ["Bajra(Pearl Millet/Cumbu)", "Castor Seed", "Groundnut", "Mustard", "Rajgir", "Wheat"],
            "Dehgam": ["Bajra(Pearl Millet/Cumbu)", "Castor Seed", "Guar", "Paddy(Dhan)(Common)", "Wheat"],
            "Dehgam(Rekhiyal)": ["Bajra(Pearl Millet/Cumbu)", "Castor Seed", "Guar", "Paddy(Dhan)(Common)", "Wheat"],
            "Devgadhbaria": ["Paddy(Dhan)(Common)"],
            "Dhanera": ["Bajra(Pearl Millet/Cumbu)", "Castor Seed", "Guar Seed(Cluster Beans Seed)", "Mustard", "Rajgir", "Soanf", "Suva (Dill Seed)", "Wheat"],
            "Dhari": ["Arhar (Tur/Red Gram)(Whole)", "Bengal Gram(Gram)(Whole)", "Corriander seed", "Ground Nut Seed", "Groundnut", "Sesamum(Sesame,Gingelly,Til)", "Soyabean", "Wheat"],
            "Dhoraji": ["Bajra(Pearl Millet/Cumbu)", "Ground Nut Seed", "Groundnut", "Sesamum(Sesame,Gingelly,Til)", "Soyabean", "Wheat"],
            "Dhrol": ["Bengal Gram(Gram)(Whole)", "Cotton", "Cummin Seed(Jeera)", "Groundnut", "Sesamum(Sesame,Gingelly,Til)", "Wheat"],
            "Dhragradhra": ["Ajwan", "Castor Seed", "Corriander seed", "Cummin Seed(Jeera)", "Guar Seed(Cluster Beans Seed)", "Sesamum(Sesame,Gingelly,Til)", "Soanf", "Suva (Dill Seed)", "Wheat"],
            "Gangapur": ["Bajra(Pearl Millet/Cumbu)", "Bengal Gram(Gram)(Whole)", "Jowar(Sorghum)", "Onion", "Safflower", "Wheat"],
            "Godhra": ["Paddy(Dhan)(Common)"],
            "Godhra(Kakanpur)": ["Paddy(Dhan)(Common)"],
            "Gondal(Veg.market Gondal)": ["Bhindi(Ladies Finger)", "Cauliflower", "Cucumbar(Kheera)", "Green Chilli", "Guar", "Lemon", "Papaya", "Potato", "Tomato"],
            "Hadad    ": ["Cotton"],
            "Halvad": ["Ajwan", "Bajra(Pearl Millet/Cumbu)", "Bengal Gram(Gram)(Whole)", "Castor Seed", "Corriander seed", "Cummin Seed(Jeera)", "Green Gram (Moong)(Whole)", "Groundnut", "Guar Seed(Cluster Beans Seed)", "Mustard", "Sesamum(Sesame,Gingelly,Til)", "Soanf", "Wheat"],
            "Harij": ["Bajra(Pearl Millet/Cumbu)", "Castor Seed", "Cummin Seed(Jeera)", "Wheat"],
            "Himatnagar": ["Bajra(Pearl Millet/Cumbu)", "Castor Seed", "Groundnut", "Maize", "Wheat"],
            "Jam Jodhpur": ["Arhar (Tur/Red Gram)(Whole)", "Bajra(Pearl Millet/Cumbu)", "Beans", "Bengal Gram(Gram)(Whole)", "Castor Seed", "Corriander seed", "Cotton", "Green Gram (Moong)(Whole)", "Ground Nut Seed", "Groundnut", "Jowar(Sorghum)", "Methi Seeds", "Sesamum(Sesame,Gingelly,Til)", "Soyabean", "Wheat"],
            "Jam Khambalia": ["Bajra(Pearl Millet/Cumbu)", "Bengal Gram(Gram)(Whole)", "Corriander seed", "Cummin Seed(Jeera)", "Green Gram (Moong)(Whole)", "Ground Nut Seed", "Groundnut", "Methi Seeds", "Sesamum(Sesame,Gingelly,Til)", "Wheat"],
            "Jambusar": ["Arhar (Tur/Red Gram)(Whole)", "Bajra(Pearl Millet/Cumbu)", "Castor Seed", "Cotton", "Jowar(Sorghum)", "Maize", "Wheat"],
            "Jambusar(Kaavi)": ["Arhar (Tur/Red Gram)(Whole)", "Bajra(Pearl Millet/Cumbu)", "Castor Seed", "Cotton", "Jowar(Sorghum)", "Maize"],
            "Jasdan": ["Arhar (Tur/Red Gram)(Whole)", "Bajra(Pearl Millet/Cumbu)", "Beans", "Black Gram (Urd Beans)(Whole)", "Castor Seed", "Cotton", "Cummin Seed(Jeera)", "Green Gram (Moong)(Whole)", "Ground Nut Seed", "Groundnut", "Jowar(Sorghum)", "Maize", "Methi Seeds", "Mustard", "Sesamum(Sesame,Gingelly,Til)", "Soyabean", "Wheat"],
            "Kadi": ["Bajra(Pearl Millet/Cumbu)", "Guar Seed(Cluster Beans Seed)", "Wheat"],
            "Kalol": ["Bajra(Pearl Millet/Cumbu)", "Castor Seed", "Guar Seed(Cluster Beans Seed)", "Jowar(Sorghum)", "Wheat"],
            "Kapadvanj": ["Bottle gourd", "Brinjal", "Cabbage", "Cauliflower", "Onion", "Potato", "Tomato"],
            "Kalediya": ["Cotton"],
            "Khambhat(Grain Market)": ["Bajra(Pearl Millet/Cumbu)", "Paddy(Dhan)(Common)", "Wheat"],
            "Khambhat(Veg Yard Khambhat)": ["Bhindi(Ladies Finger)", "Bottle gourd", "Brinjal", "Cabbage", "Cauliflower", "Drumstick", "Green Chilli", "Guar", "Mango (Raw-Ripe)", "Onion", "Potato", "Tinda", "Tomato"],
            "Lakhani": ["Bajra(Pearl Millet/Cumbu)", "Castor Seed", "Mustard"],
            "Limkheda": ["Maize", "Wheat"],
            "Mandal": ["Arhar (Tur/Red Gram)(Whole)", "Ajwan", "Cummin Seed(Jeera)"],
            "Mandvi": ["Green Gram (Moong)(Whole)", "Paddy(Dhan)(Common)", "Sesamum(Sesame,Gingelly,Til)"],
            "Mansa(Manas Veg Yard)": ["Bhindi(Ladies Finger)", "Bottle gourd", "Brinjal", "Cucumbar(Kheera)", "Green Chilli", "Lemon", "Tomato"],
            "Meghraj": ["Wheat"],
            "Mehsana": ["Bajra(Pearl Millet/Cumbu)", "Castor Seed", "Mustard", "Wheat"],
            "Mehsana(Jornang)": ["Bajra(Pearl Millet/Cumbu)", "Castor Seed", "Wheat"],
            "Mehsana(Mehsana Veg)": ["Banana", "Bhindi(Ladies Finger)", "Cabbage", "Cauliflower", "Green Chilli", "Lemon", "Potato", "Tomato"],
            "Modasar        ": ["Cotton"],
            "Morbi": ["Arhar Dal(Tur Dal)", "Bajra(Pearl Millet/Cumbu)", "Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Cabbage", "Cucumbar(Kheera)", "Cummin Seed(Jeera)", "Green Chilli", "Groundnut", "Guar", "Lemon", "Onion", "Sesamum(Sesame,Gingelly,Til)", "Tomato", "Wheat"],
            "Morva Hafad": ["Bajra(Pearl Millet/Cumbu)", "Paddy(Dhan)(Common)", "Wheat"],
            "Nadiad": ["Potato", "Tomato"],
            "Nadiyad(Chaklasi)": ["Bhindi(Ladies Finger)", "Bottle gourd", "Brinjal", "Cauliflower", "Coriander(Leaves)", "Potato", "Tomato"],
            "Nadiyad(Piplag)": ["Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Cabbage", "Cauliflower", "Coriander(Leaves)", "Cowpea(Veg)", "Ginger(Green)", "Guar", "Lemon", "Onion", "Peas cod", "Pegeon Pea (Arhar Fali)", "Potato", "Sponge gourd", "Tinda", "Tomato"],
            "Navsari": ["Banana", "Bhindi(Ladies Finger)", "Bottle gourd", "Brinjal", "Cabbage", "Capsicum", "Cauliflower", "Cluster beans", "Coriander(Leaves)", "Cowpea(Veg)", "Green Chilli", "Lemon", "Methi(Leaves)", "Pointed gourd (Parval)", "Potato", "Tomato"],
            "Nizar": ["Maize"],
            "Nizar(Kukarmuda)": ["Jowar(Sorghum)"],
            "Padra": ["Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Cabbage", "Cauliflower", "Cluster beans", "Coriander(Leaves)", "Cowpea(Veg)", "Cucumbar(Kheera)", "Drumstick", "Ginger(Green)", "Green Chilli", "Kartali (Kantola)", "Lemon", "Little gourd (Kundru)", "Onion", "Pointed gourd (Parval)", "Potato", "Pumpkin", "Spinach", "Sponge gourd", "Tomato"],
            "Palanpur": ["Bajra(Pearl Millet/Cumbu)", "Castor Seed", "Rajgir", "Wheat"],
            "Palitana": ["Bajra(Pearl Millet/Cumbu)", "Bengal Gram(Gram)(Whole)", "Green Gram (Moong)(Whole)", "Groundnut", "Jowar(Sorghum)", "Lemon", "Potato", "Sesamum(Sesame,Gingelly,Til)", "Tomato"],
            "Panthawada": ["Bajra(Pearl Millet/Cumbu)", "Groundnut", "Mustard", "Rajgir", "Wheat"],
            "Radhanpur": ["Ajwan", "Corriander seed", "Mustard", "Wheat"],
            "Rajpipla": ["Banana"],
            "Rajkot": ["Arhar (Tur/Red Gram)(Whole)", "Bajra(Pearl Millet/Cumbu)", "Black Gram (Urd Beans)(Whole)", "Castor Seed", "Corriander seed", "Cotton", "Cummin Seed(Jeera)", "Garlic", "Green Gram (Moong)(Whole)", "Ground Nut Seed", "Groundnut", "Jowar(Sorghum)", "Maize", "Methi Seeds", "Mustard", "Sesamum(Sesame,Gingelly,Til)", "Wheat"],
            "Rajkot(Veg.Sub Yard)": ["Bhindi(Ladies Finger)", "Bottle gourd", "Brinjal", "Cluster beans", "Coriander(Leaves)", "Green Chilli", "Lemon", "Potato", "Tomato"],
            "Rajula": ["Arhar (Tur/Red Gram)(Whole)", "Bajra(Pearl Millet/Cumbu)", "Cotton", "Cummin Seed(Jeera)", "Green Gram (Moong)(Whole)", "Ground Nut Seed", "Groundnut", "Jowar(Sorghum)", "Kabuli Chana(Chickpeas-White)", "Methi Seeds", "Mustard", "Rajgir", "Sesamum(Sesame,Gingelly,Til)"],
            "Rapar": ["Castor Seed", "Cummin Seed(Jeera)"],
            "Sanad": ["Paddy(Dhan)(Common)", "Wheat"],
            "Savarkundla": ["Bajra(Pearl Millet/Cumbu)", "Bengal Gram(Gram)(Whole)", "Cotton", "Cummin Seed(Jeera)", "Green Gram (Moong)(Whole)", "Groundnut", "Sesamum(Sesame,Gingelly,Til)", "Wheat"],
            "Siddhpur": ["Bajra(Pearl Millet/Cumbu)", "Castor Seed", "Guar Seed(Cluster Beans Seed)", "Mustard", "Rajgir", "Wheat"],
            "Songadh": ["Bhindi(Ladies Finger)", "Guar"],
            "Songadh(Badarpada)": ["Bhindi(Ladies Finger)", "Guar"],
            "Songadh(Umrada)": ["Bhindi(Ladies Finger)", "Guar"],
            "Thara": ["Bajra(Pearl Millet/Cumbu)", "Castor Seed", "Cummin Seed(Jeera)", "Jowar(Sorghum)", "Mustard", "Sesamum(Sesame,Gingelly,Til)", "Wheat"],
            "Thara(Shihori)": ["Bajra(Pearl Millet/Cumbu)", "Castor Seed", "Wheat"],
            "Umreth": ["Bajra(Pearl Millet/Cumbu)"],
            "Unava": ["Castor Seed"],
            "Unjha": ["Ajwan", "Cummin Seed(Jeera)", "Isabgul (Psyllium)", "Mustard", "Sesamum(Sesame,Gingelly,Til)", "Soanf", "Suva (Dill Seed)"],
            "Vadali": ["Bajra(Pearl Millet/Cumbu)", "Maize"],
            "Vadgam": ["Bajra(Pearl Millet/Cumbu)", "Wheat"],
            "Vadhvan": ["Amaranthus", "Banana", "Banana - Green", "Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Cabbage", "Carrot", "Cauliflower", "Coriander(Leaves)", "Drumstick", "Elephant Yam (Suran)", "Garlic", "Green Chilli", "Guar", "Lemon", "Methi(Leaves)", "Onion Green", "Peas Wet", "Potato", "Raddish", "Ridgeguard(Tori)", "Spinach", "Tinda", "Tomato"],
            "Vankaner": ["Bajra(Pearl Millet/Cumbu)", "Bengal Gram(Gram)(Whole)", "Cummin Seed(Jeera)", "Jowar(Sorghum)", "Sesamum(Sesame,Gingelly,Til)", "Soanf", "Wheat"],
            "Veraval": ["Black Gram (Urd Beans)(Whole)", "Green Gram (Moong)(Whole)", "Groundnut", "Millets", "Sesamum(Sesame,Gingelly,Til)", "Soyabean", "Wheat"],
            "Vijapur": ["Castor Seed", "Wheat"],
            "Vijapur(Gojjariya)": ["Castor Seed"],
            "Vijapur(veg)": ["Bitter gourd", "Green Chilli"],
            "Viramgam": ["Castor Seed", "Mustard", "Paddy(Dhan)(Common)", "Sesamum(Sesame,Gingelly,Til)", "Wheat"],
            "Visnagar": ["Bajra(Pearl Millet/Cumbu)", "Castor Seed", "Jowar(Sorghum)", "Mustard"],
            "Vyra": ["Bengal Gram(Gram)(Whole)", "Black Gram (Urd Beans)(Whole)", "Green Gram (Moong)(Whole)", "Groundnut", "Sesamum(Sesame,Gingelly,Til)"],
            "Zalod(Sanjeli)": ["Bajra(Pearl Millet/Cumbu)", "Paddy(Dhan)(Common)", "Wheat"],
            "Zalod(Zalod)": ["Bengal Gram(Gram)(Whole)", "Maize", "Paddy(Dhan)(Common)", "Soyabean", "Wheat"]
        },
        "Haryana": {
            "Ambala Cantt.": ["Dry Fodder", "Green Fodder"],
            "Bahadurgarh": ["Apple", "Bitter gourd", "Bottle gourd", "Brinjal", "Cabbage", "Capsicum", "Cauliflower", "Cucumbar(Kheera)", "Garlic", "Ginger(Green)", "Jamun(Narale Hannu)", "Lemon", "Mango", "Mousambi(Sweet Lime)", "Onion", "Peas cod", "Plum", "Pomegranate", "Potato", "Tomato"],
            "Ballabhgarh": ["Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Cabbage", "Cauliflower", "Cucumbar(Kheera)", "Garlic", "Green Chilli", "Onion", "Potato", "Pumpkin", "Ridgeguard(Tori)", "Tomato"],
            "Barwala": ["Brinjal", "Potato", "Tomato"],
            "Barwala(Hisar)": ["Banana", "Bitter gourd", "Bottle gourd", "Brinjal", "Cauliflower", "Cucumbar(Kheera)", "Garlic", "Leafy Vegetable", "Long Melon(Kakri)", "Mango", "Mousambi(Sweet Lime)", "Peas Wet", "Plum", "Pomegranate", "Potato", "Round gourd", "Tomato"],
            "Cheeka": ["Potato"],
            "Chhachrauli": ["Banana", "Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Green Chilli", "Mango", "Onion", "Potato", "Pumpkin", "Ridgeguard(Tori)", "Tomato"],
            "Dhand": ["Banana", "Onion", "Potato", "Tomato"],
            "Fatehabad": ["Apple", "Capsicum", "Cucumbar(Kheera)", "Lemon"],
            "Gharaunda": ["Onion", "Potato", "Tomato"],
            "Gohana": ["Apple", "Banana - Green", "Brinjal", "Cucumbar(Kheera)", "Green Chilli", "Guava", "Mango", "Mousambi(Sweet Lime)", "Onion", "Potato", "Tomato"],
            "Gurgaon": ["Apple", "Banana", "Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Cabbage", "Carrot", "Cauliflower", "Mango", "Onion", "Pomegranate", "Potato", "Tomato"],
            "Hansi": ["Apple", "Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Cabbage", "Capsicum", "Cauliflower", "Cucumbar(Kheera)", "Guava", "Lemon", "Mango", "Onion", "Peas Wet", "Potato", "Pomegranate", "Pumpkin", "Raddish", "Ridgeguard(Tori)", "Spinach", "Tomato"],
            "Hassanpur": ["Bottle gourd", "Onion", "Potato", "Pumpkin", "Tomato"],
            "Hodal": ["Green Chilli", "Jamun(Narale Hannu)", "Onion", "Potato", "Ridgeguard(Tori)", "Tomato"],
            "Iamailabad": ["Apple", "Potato"],
            "Indri": ["Apple", "Banana", "Garlic", "Onion", "Paddy(Dhan)(Basmati)", "Pomegranate", "Tomato"],
            "Jagadhri": ["Apple", "Banana", "Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Cabbage", "Cauliflower", "Cucumbar(Kheera)", "Green Chilli", "Lemon", "Mango", "Mousambi(Sweet Lime)", "Onion", "Potato", "Pumpkin", "Tomato"],
            "Khanina": ["Bajra(Pearl Millet/Cumbu)", "Mustard"],
            "Ladwa": ["Apple", "Banana", "Chikoos(Sapota)", "Cucumbar(Kheera)", "Mango", "Mousambi(Sweet Lime)", "Peach", "Pear(Marasebu)", "Pomegranate", "Potato"],
            "Madlauda": ["Onion", "Potato", "Tomato"],
            "Meham": ["Banana", "Mango", "Mousambi(Sweet Lime)", "Tomato"],
            "Mustafabad": ["Bhindi(Ladies Finger)", "Bottle gourd", "Cucumbar(Kheera)", "Onion", "Potato", "Ridgeguard(Tori)", "Tomato"],
            "Naraingarh": ["Apple", "Banana - Green", "Bitter gourd", "Bottle gourd", "Brinjal", "Cabbage", "Capsicum", "Carrot", "Cauliflower", "Chikoos(Sapota)", "Colacasia", "Coriander(Leaves)", "Cucumbar(Kheera)", "Ginger(Dry)", "Green Chilli", "Guava", "Jack Fruit", "Lemon", "Mango", "Mousambi(Sweet Lime)", "Onion", "Pear(Marasebu)", "Peas Wet", "Plum", "Pomegranate", "Pointed gourd (Parval)", "Potato", "Pumpkin", "Raddish", "Ridgeguard(Tori)", "Spinach", "Tomato"],
            "Narnaul": ["Apple", "Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Cabbage", "Capsicum", "Cauliflower", "Cucumbar(Kheera)", "Ginger(Green)", "Green Chilli", "Lemon", "Mango", "Mango (Raw-Ripe)", "Mousambi(Sweet Lime)", "Onion", "Pear(Marasebu)", "Pineapple", "Pointed gourd (Parval)", "Pomegranate", "Potato", "Pumpkin", "Spinach", "Sponge gourd", "Tender Coconut", "Tomato"],
            "Narwana": ["Apple", "Banana", "Bottle gourd", "Cauliflower", "Cucumbar(Kheera)", "Mango", "Sponge gourd", "Tomato"],
            "New Grain Market , Panchkula": ["Apple"],
            "Panipat": ["Apple", "Banana", "Bottle gourd", "Brinjal", "Cabbage", "Cucumbar(Kheera)", "Mango", "Onion", "Pomegranate", "Potato", "Tomato"],
            "Pehowa": ["Onion", "Potato", "Tomato"],
            "Pundri": ["Onion", "Potato", "Tomato"],
            "Punhana": ["Green Chilli", "Onion", "Potato", "Tomato"],
            "Ratia": ["Apple", "Banana", "Mango", "Onion", "Potato", "Tomato"],
            "Rewari": ["Banana", "Onion", "Potato", "Tomato"],
            "Rohtak": ["Apple", "Banana", "Mango", "Onion", "Pineapple", "Pomegranate", "Potato", "Tomato"],
            "Sadhaura": ["Apple", "Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Capsicum", "Cucumbar(Kheera)", "Green Chilli", "Mango", "Onion", "Pomegranate", "Potato", "Sponge gourd", "Tinda", "Tomato"],
            "Safidon": ["Banana", "Bottle gourd", "Lemon", "Mango", "Potato", "Tomato"],
            "Samalkha": ["Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Capsicum", "Cauliflower", "Colacasia", "Cucumbar(Kheera)", "Garlic", "Ginger(Dry)", "Green Chilli", "Mango", "Onion", "Pumpkin", "Raddish", "Ridgeguard(Tori)", "Spinach", "Tomato"],
            "Sampla": ["Apple", "Banana"],
            "Shahabad": ["Apple", "Banana", "Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Cabbage", "Carrot", "Cauliflower", "Cluster beans", "Colacasia", "Cucumbar(Kheera)", "Garlic", "Ginger(Dry)", "Green Chilli", "Guava", "Lemon", "Mango", "Mousambi(Sweet Lime)", "Onion", "Peas Wet", "Plum", "Pomegranate", "Potato", "Pumpkin", "Raddish", "Spinach", "Sponge gourd", "Tomato", "Water Melon"],
            "Shahzadpur": ["Bhindi(Ladies Finger)", "Bottle gourd", "Brinjal", "Cauliflower", "Colacasia", "Cucumbar(Kheera)", "Green Chilli", "Green Peas", "Mango", "Potato", "Tomato"],
            "Siwani": ["Guar Seed(Cluster Beans Seed)"],
            "Sohna": ["Bhindi(Ladies Finger)", "Bottle gourd", "Brinjal", "Cucumbar(Kheera)", "Ginger(Green)", "Green Chilli", "Lemon", "Onion", "Potato", "Pumpkin", "Ridgeguard(Tori)", "Tomato"],
            "Sonepat": ["Apple", "Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Capsicum", "Cauliflower", "Cucumbar(Kheera)", "Green Chilli", "Mango", "Onion", "Potato", "Tomato"],
            "Sonepat(Kharkhoda)": ["Apple", "Onion", "Tomato"],
            "Uklana": ["Bhindi(Ladies Finger)", "Bottle gourd", "Brinjal", "Cucumbar(Kheera)", "Lemon", "Mango", "Mousambi(Sweet Lime)", "Onion", "Potato", "Tomato"],
            "kalanwali": ["Bhindi(Ladies Finger)", "Bottle gourd", "Brinjal", "Cucumbar(Kheera)", "Mango"]
        },
        "Himachal Pradesh": {
            "Bilaspur": ["Banana", "Cabbage", "Cauliflower", "Mango", "Papaya", "Pomegranate", "Potato", "Tomato"],
            "Bhuntar": ["Apple", "Banana", "Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Cabbage", "Capsicum", "Carrot", "Cauliflower", "Coriander(Leaves)", "Cucumbar(Kheera)", "French Beans (Frasbean)", "Garlic", "Ginger(Dry)", "Grapes", "Green Chilli", "Lemon", "Mango (Raw-Ripe)", "Onion", "Papaya", "Peach", "Pear(Marasebu)", "Peas Wet", "Plum", "Potato", "Pumpkin", "Raddish", "Spinach", "Squash(Chappal Kadoo)", "Tomato", "Water Melon"],
            "Chamba": ["Banana", "Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Capsicum", "Colacasia", "Cucumbar(Kheera)", "Ginger(Green)", "Green Chilli", "Lemon", "Mango", "Mashrooms", "Onion", "Papaya", "Pomegranate", "Potato"],
            "Dharamshala": ["Apple", "Banana", "Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Cabbage", "Capsicum", "Carrot", "Cauliflower", "Coriander(Leaves)", "Cucumbar(Kheera)", "French Beans (Frasbean)", "Garlic", "Green Chilli", "Mousambi(Sweet Lime)", "Onion", "Papaya", "Pomegranate", "Potato", "Tomato"],
            "Dhanotu (Mandi)": ["Apple", "Banana", "Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Cabbage", "Capsicum", "Cauliflower", "Coriander(Leaves)", "Cucumbar(Kheera)", "Garlic", "Ginger(Dry)", "Green Chilli", "Lemon", "Mango", "Mousambi(Sweet Lime)", "Onion", "Papaya", "Pomegranate", "Potato", "Pumpkin", "Spinach", "Tomato"],
            "Hamirpur": ["Apple", "Banana", "Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Cabbage", "Capsicum", "Cauliflower", "Colacasia", "Cucumbar(Kheera)", "French Beans (Frasbean)", "Garlic", "Ginger(Green)", "Green Chilli", "Lemon", "Mango", "Onion", "Papaya", "Pear(Marasebu)", "Peas Wet", "Pineapple", "Pomegranate", "Potato", "Spinach", "Sponge gourd", "Squash(Chappal Kadoo)", "Tomato"],
            "Hamirpur(Nadaun)": ["Apple", "Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Cabbage", "Capsicum", "Cauliflower", "Colacasia"],
            "Kangra": ["Apple", "Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Cabbage", "Capsicum", "Carrot", "Cauliflower", "Colacasia", "Coriander(Leaves)", "Cucumbar(Kheera)", "French Beans (Frasbean)", "Garlic", "Ginger(Green)", "Green Chilli", "Guava", "Lemon", "Mango", "Mousambi(Sweet Lime)", "Onion", "Papaya", "Pear(Marasebu)", "Peas cod", "Pineapple", "Plum", "Pomegranate", "Potato", "Pumpkin", "Raddish", "Spinach", "Sponge gourd", "Tomato"],
            "Kangra(Baijnath)": ["Apple", "Banana", "Bhindi(Ladies Finger)", "Brinjal", "Cabbage", "Capsicum", "Cauliflower", "Colacasia", "Coriander(Leaves)", "Cucumbar(Kheera)", "Ginger(Green)", "Green Chilli", "Guava", "Lemon", "Mango", "Mousambi(Sweet Lime)", "Onion", "Papaya", "Peas Wet", "Pineapple", "Pomegranate", "Potato", "Pumpkin", "Raddish", "Spinach", "Sponge gourd", "Tomato"],
            "Kangra(Jaisinghpur)": ["Apple", "Banana", "Beetroot", "Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Cabbage", "Capsicum", "Carrot", "Cauliflower", "Cucumbar(Kheera)", "French Beans (Frasbean)", "Garlic", "Ginger(Green)", "Lemon", "Mango", "Mousambi(Sweet Lime)", "Onion", "Papaya", "Pear(Marasebu)", "Pineapple", "Potato", "Raddish", "Tomato"],
            "Kangra(Nagrota Bagwan)": ["Apple", "Banana", "Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Cabbage", "Capsicum", "Cauliflower", "Colacasia", "Cucumbar(Kheera)", "Ginger(Green)", "Green Chilli", "Lemon", "Mango", "Mousambi(Sweet Lime)", "Onion", "Papaya", "Pear(Marasebu)", "Pineapple", "Pomegranate", "Potato", "Pumpkin", "Raddish", "Spinach", "Tomato"],
            "Kullu": ["Banana", "Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Cabbage", "Capsicum", "Carrot", "Cauliflower", "Coriander(Leaves)", "Cucumbar(Kheera)", "French Beans (Frasbean)", "Garlic", "Ginger(Dry)", "Grapes", "Green Chilli", "Lemon", "Mango", "Onion", "Orange", "Papaya", "Peas Wet", "Potato", "Pumpkin", "Raddish", "Spinach", "Squash(Chappal Kadoo)", "Tomato", "Water Melon"],
            "Kullu(Chauri Bihal)": ["Cabbage", "Cauliflower", "Cucumbar(Kheera)", "Peas Wet", "Pear(Marasebu)", "Squash(Chappal Kadoo)"],
            "Kullu(Patli Kuhal)": ["Apple", "Pear(Marasebu)", "Plum"],
            "Palampur": ["Apple", "Banana", "Beetroot", "Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Cabbage", "Capsicum", "Carrot", "Cauliflower", "Colacasia", "Coriander(Leaves)", "Cucumbar(Kheera)", "French Beans (Frasbean)", "Garlic", "Ginger(Green)", "Green Chilli", "Guava", "Lemon", "Mango", "Mashrooms", "Mousambi(Sweet Lime)", "Onion", "Papaya", "Pear(Marasebu)", "Peas Wet", "Pineapple", "Pomegranate", "Potato", "Raddish", "Spinach", "Sponge gourd", "Tomato"],
            "Paonta Sahib": ["Apple", "Banana", "Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Cabbage", "Capsicum", "Carrot", "Cauliflower", "Colacasia", "Coriander(Leaves)", "Cucumbar(Kheera)", "French Beans (Frasbean)", "Ginger(Green)", "Green Chilli", "Jack Fruit", "Lemon", "Mango", "Onion", "Papaya", "Pear(Marasebu)", "Potato", "Pumpkin", "Spinach", "Tomato"],
            "Shimla and Kinnaur(Theog)": ["Cabbage", "Capsicum", "Cauliflower", "French Beans (Frasbean)", "Peas Wet"],
            "Solan": ["Apple", "Banana", "Cabbage", "Capsicum", "Cauliflower", "Colacasia", "Coriander(Leaves)", "Cucumbar(Kheera)", "French Beans (Frasbean)", "Garlic", "Ginger(Green)", "Green Chilli", "Lemon", "Mango", "Mashrooms", "Mousambi(Sweet Lime)", "Onion", "Papaya", "Peach", "Pear(Marasebu)", "Pineapple", "Pomegranate", "Potato", "Pumpkin", "Raddish", "Tomato"],
            "Solan(Nalagarh)": ["Banana", "Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Cabbage", "Capsicum", "Cauliflower", "Cucumbar(Kheera)", "French Beans (Frasbean)", "Garlic", "Green Chilli", "Lemon", "Mango", "Onion", "Peas cod", "Potato", "Pumpkin", "Sponge gourd", "Tomato"],
            "Una": ["Apple", "Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Cabbage", "Capsicum", "Carrot", "Cauliflower", "Colacasia", "Cucumbar(Kheera)", "French Beans (Frasbean)", "Garlic", "Ginger(Green)", "Green Chilli", "Guava", "Lemon", "Mango", "Mousambi(Sweet Lime)", "Onion", "Papaya", "Pear(Marasebu)", "Peas Wet", "Plum", "Pomegranate", "Potato", "Pumpkin", "Spinach", "Tomato"]
        },
        "Jammu and Kashmir": {
            "Batote": ["Apple", "Banana", "Cabbage", "Cucumbar(Kheera)", "Green Chilli", "Knool Khol", "Onion", "Pomegranate", "Potato", "Raddish", "Tomato"],
            "Ganderbal": ["Apple", "Peach", "Plum"],
            "Kathua": ["Apple", "Banana", "Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Cabbage", "Capsicum", "Carrot", "Cauliflower", "Coriander(Leaves)", "Cucumbar(Kheera)", "Garlic", "Ginger(Green)", "Green Chilli", "Indian Beans (Seam)", "Knool Khol", "Lemon", "Mashrooms", "Mousambi(Sweet Lime)", "Onion", "Papaya", "Peas Wet", "Pineapple", "Plum", "Pomegranate", "Potato", "Pumpkin", "Raddish", "Round gourd", "Spinach", "Tomato"],
            "Kulgam": ["Banana", "Onion", "Potato"],
            "Narwal Jammu (F&V)": ["Apple", "Banana", "Beetroot", "Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Cabbage", "Capsicum", "Cauliflower", "Colacasia", "Cucumbar(Kheera)", "Field Pea", "French Beans (Frasbean)", "Garlic", "Ginger(Green)", "Green Chilli", "Knool Khol", "Lemon", "Little gourd (Kundru)", "Mango", "Mousambi(Sweet Lime)", "Onion", "Papaya", "Pear(Marasebu)", "Pineapple", "Plum", "Pomegranate", "Potato", "Pumpkin", "Raddish", "Ridgeguard(Tori)", "Round gourd", "Tender Coconut", "Tomato"],
            "Nowpora": ["Apple", "Plum"],
            "Parimpore": ["Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Cabbage", "Capsicum", "Carrot", "Cauliflower", "Coriander(Leaves)", "Cucumbar(Kheera)", "French Beans (Frasbean)", "Garlic", "Ginger(Dry)", "Knool Khol", "Onion", "Potato"],
            "Rajouri (F&V)": ["Apple", "Banana", "Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Cabbage", "Capsicum", "Carrot", "Cauliflower", "Knool Khol", "Mango", "Onion", "Pineapple", "Potato", "Round gourd", "Tomato"]
        },
        "Karnataka": {
            "Bailahongal": ["Bengal Gram(Gram)(Whole)"],
            "Bangarpet": ["Lime"],
            "Binny Mill (F&V), Bangalore": ["Alsandikai", "Apple", "Banana", "Banana - Green", "Beans", "Beetroot", "Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Bunch Beans", "Cabbage", "Capsicum", "Carrot", "Chapparad Avare", "Chikoos(Sapota)", "Cucumbar(Kheera)", "Drumstick", "Ginger(Green)", "Grapes", "Green Avare (W)", "Green Chilli", "Karbuja(Musk Melon)", "Knool Khol", "Lime", "Mango", "Mousambi(Sweet Lime)", "Orange", "Papaya", "Peas Wet", "Pineapple", "Pomegranate", "Raddish", "Ridgeguard(Tori)", "Seemebadnekai", "Snakeguard", "Suvarna Gadde", "Sweet Potato", "Sweet Pumpkin", "Thondekai", "Tomato", "Water Melon", "White Pumpkin"],
            "Chamaraj Nagar": ["Beans", "Beetroot", "Brinjal", "Cabbage", "Coconut", "Cucumbar(Kheera)", "Green Chilli", "Gur(Jaggery)", "Knool Khol", "Raddish", "Ridgeguard(Tori)", "Tender Coconut", "Tomato"],
            "Chikkamagalore": ["Beans", "Cabbage", "Carrot", "Cauliflower", "Cucumbar(Kheera)", "Green Chilli", "Knool Khol", "Onion", "Potato", "Ridgeguard(Tori)", "Tomato"],
            "Chintamani": ["Beans", "Beetroot", "Brinjal", "Capsicum", "Carrot", "Cucumbar(Kheera)", "Green Chilli", "Knool Khol", "Kulthi(Horse Gram)", "Mango", "Onion", "Potato", "Raddish", "Ridgeguard(Tori)", "Tomato"],
            "Davangere": ["Apple", "Arecanut(Betelnut/Supari)", "Banana", "Beans", "Beetroot", "Bengal Gram Dal (Chana Dal)", "Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Bunch Beans", "Cabbage", "Capsicum", "Carrot", "Cauliflower", "Drumstick", "Garlic", "Green Chilli", "Jowar(Sorghum)", "Knool Khol", "Kulthi(Horse Gram)", "Lime", "Maize", "Mousambi(Sweet Lime)", "Onion", "Paddy(Dhan)(Common)", "Papaya", "Pineapple", "Pomegranate", "Potato", "Raddish", "Ragi (Finger Millet)", "Rice", "Ridgeguard(Tori)", "Seemebadnekai", "Suvarna Gadde", "Sweet Potato", "Sweet Pumpkin", "Thondekai", "Tomato", "Water Melon"],
            "Gangavathi": ["Rice"],
            "Gonikappal": ["Black pepper"],
            "Gowribidanoor": ["Beans", "Beetroot", "Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Cabbage", "Carrot", "Cauliflower", "Chapparad Avare", "Cucumbar(Kheera)", "Green Chilli", "Knool Khol", "Lime", "Onion", "Potato", "Raddish", "Ridgeguard(Tori)", "Thondekai", "Tomato"],
            "Haliyala": ["Paddy(Dhan)(Common)"],
            "Kalagategi": ["Kulthi(Horse Gram)", "Maize", "Paddy(Dhan)(Common)", "Soyabean"],
            "Kalburgi": ["Apple", "Beans", "Brinjal", "Capsicum", "Green Chilli", "Gur(Jaggery)", "Lime", "Orange", "Papaya", "Pineapple", "Pomegranate", "Potato", "Rice", "Safflower", "Tomato"],
            "Kudchi": ["Maize"],
            "Kumta": ["Arecanut(Betelnut/Supari)"],
            "Madikeri": ["Arecanut(Betelnut/Supari)", "Black pepper"],
            "Malur": ["Beans"],
            "Piriya Pattana": ["Ginger(Green)"],
            "Puttur": ["Arecanut(Betelnut/Supari)", "Black pepper", "Copra"],
            "Ramanagara": ["Alsandikai", "Ashgourd", "Beans", "Beetroot", "Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Cabbage", "Capsicum", "Carrot", "Cauliflower", "Chilly Capsicum", "Drumstick", "Ginger(Green)", "Green Avare (W)", "Green Chilli", "Knool Khol", "Raddish", "Ridgeguard(Tori)", "Seemebadnekai", "Snakeguard", "Sweet Pumpkin", "Thondekai", "Tomato"],
            "Ramdurga": ["Groundnut"],
            "Sagar": ["Arecanut(Betelnut/Supari)", "Black pepper"],
            "Shimoga": ["Arhar Dal(Tur Dal)", "Arecanut(Betelnut/Supari)", "Beans", "Beetroot", "Bengal Gram(Gram)(Whole)", "Bhindi(Ladies Finger)", "Bitter gourd", "Black Gram Dal (Urd Dal)", "Brinjal", "Cabbage", "Carrot", "Cauliflower", "Corriander seed", "Cucumbar(Kheera)", "Drumstick", "Ginger(Green)", "Green Gram Dal (Moong Dal)", "Green Chilli", "Gur(Jaggery)", "Methi Seeds", "Onion", "Potato", "Raddish", "Rice", "Ridgeguard(Tori)", "Thondekai", "Tomato", "Wheat"],
            "Sirsi": ["Arecanut(Betelnut/Supari)", "Black pepper"],
            "Sorabha": ["Ginger(Dry)", "Paddy(Dhan)(Common)"],
            "Yellapur": ["Arecanut(Betelnut/Supari)", "Black pepper"]
        },
        "Kerala": {
            "AGALI VFPCK": ["Banana"],
            "Adimali": ["Amphophalus", "Apple", "Banana", "Banana - Green", "Beetroot", "Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Cabbage", "Carrot", "Cluster beans", "Colacasia", "Cowpea(Veg)", "Ginger(Green)", "Grapes", "Green Chilli", "Mango", "Orange", "Pineapple", "Pumpkin", "Snakeguard"],
            "Aluva": ["Amaranthus", "Amphophalus", "Ashgourd", "Banana", "Banana - Green", "Bhindi(Ladies Finger)", "Bitter gourd", "Brinjal", "Cabbage", "Carrot", "Cauliflower", "Coconut Seed", "Colacasia", "Cowpea(Veg)", "Cucumbar(Kheera)", "Drumstick", "Elephant Yam (Suran)", "Ginger(Green)", "Green Chilli", "Little gourd (Kundru)", "Mango (Raw-Ripe)", "Onion", "Pineapple", "Potato", "Pumpkin", "Snakeguard", "Tapioca", "Tomato"],
            "Amalapuram  VFPCK": ["Banana"],
            "Amballur  VFPCK": ["Banana"],
            "Anchal": ["Amaranthus", "Ashgourd", "Banana", "Beetroot", "Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Cabbage", "Capsicum", "Carrot", "Coconut", "Colacasia", "Elephant Yam (Suran)", "Onion", "Potato", "Pumpkin", "Snakeguard", "Tapioca", "Tomato"],
            "Annamanada  VFPCK": ["Banana"],
            "Aroor": ["Amphophalus", "Ashgourd", "Banana", "Banana - Green", "Beetroot", "Bhindi(Ladies Finger)", "Bitter gourd", "Brinjal", "Cabbage", "Capsicum", "Carrot", "Cowpea(Veg)", "Cucumbar(Kheera)", "Drumstick", "French Beans (Frasbean)"],
            "Athirampuzha": ["Ashgourd", "Banana", "Banana - Green", "Beetroot", "Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Cabbage", "Capsicum", "Carrot", "Cauliflower", "Coconut", "Cowpea(Veg)", "Cucumbar(Kheera)", "Drumstick", "Green Chilli", "Lemon", "Little gourd (Kundru)", "Mango (Raw-Ripe)", "Onion", "Pineapple", "Potato", "Pumpkin", "Snakeguard", "Tomato"],
            "ATHIRAMPUZHA VFPCK": ["Little gourd (Kundru)"],
            "CHANNAPETTA VFPCK": ["Banana - Green"],
            "CHATHANNOORE VFPCK": ["Banana - Green"],
            "CHEERAL VFPCK": ["Banana"],
            "CHENNITHALA VFPCK": ["Coconut Seed"],
            "Chavakkad": ["Ashgourd", "Banana", "Beetroot", "Bhindi(Ladies Finger)", "Bitter gourd", "Brinjal", "Cabbage", "Carrot", "Cluster beans", "Cowpea(Veg)", "Cucumbar(Kheera)", "Elephant Yam (Suran)", "Ginger(Green)", "Green Chilli", "Onion", "Pineapple", "Potato", "Pumpkin", "Snakeguard", "Tomato"],
            "Chengannur": ["Amphophalus", "Ashgourd", "Banana - Green", "Beetroot", "Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Cabbage", "Capsicum", "Carrot", "Coconut", "Colacasia", "Cowpea(Veg)", "Drumstick", "Garlic", "Ginger(Green)", "Green Chilli", "Mango (Raw-Ripe)", "Onion", "Potato"],
            "Cherthala": ["Amaranthus", "Ashgourd", "Banana - Green", "Beetroot", "Bitter gourd", "Brinjal", "Cabbage", "Carrot", "Cauliflower", "Cowpea(Veg)", "Cucumbar(Kheera)", "Green Chilli", "Little gourd (Kundru)", "Long Melon(Kakri)", "Onion", "Potato", "Ridgeguard(Tori)", "Snakeguard"],
            "Elamad  VFPCK": ["Banana"],
            "Elevancheri VFPCK": ["Snakeguard"],
            "Erath  VFPCK": ["Banana"],
            "Ettumanoor": ["Ashgourd", "Banana", "Banana - Green", "Beetroot", "Bitter gourd", "Brinjal", "Cabbage", "Carrot", "Cluster beans", "Coconut", "Colacasia", "Cucumbar(Kheera)", "Drumstick", "Elephant Yam (Suran)", "Ginger(Green)", "Green Chilli", "Little gourd (Kundru)", "Mango (Raw-Ripe)", "Onion", "Potato", "Pumpkin", "Snakeguard", "Tomato"],
            "Ezhamkulam": ["Amaranthus"],
            "Harippad": ["Amaranthus", "Amphophalus", "Ashgourd", "Banana", "Banana - Green", "Beetroot", "Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Cabbage", "Capsicum", "Carrot", "Cauliflower", "Colacasia", "Cowpea(Veg)", "Cucumbar(Kheera)", "Ginger(Green)", "Green Chilli", "Mango", "Onion", "Pineapple"],
            "Kadungallur  VFPCK": ["Banana"],
            "Kalanjoor  VFPCK": ["Banana"],
            "Kallachi": ["Amaranthus", "Amphophalus", "Ashgourd", "Banana", "Beetroot", "Bitter gourd", "Bottle gourd", "Brinjal", "Cabbage", "Carrot", "Cluster beans", "Cowpea(Veg)", "Drumstick", "Ginger(Green)", "Green Chilli", "Onion", "Potato", "Pumpkin", "Snakeguard", "Tomato"],
            "Kallara  VFPCK": ["Banana"],
            "Kalpetta": ["Ashgourd", "Banana - Green", "Bhindi(Ladies Finger)", "Bitter gourd", "Brinjal", "Coffee", "Cowpea(Veg)", "Ginger(Green)", "Green Chilli", "Pumpkin", "Rubber", "Snakeguard", "Yam (Ratalu)"],
            "KANTHALOOR VFPCK": ["Cabbage"],
            "KARIMPUZHA VFPCK": ["Banana"],
            "KARUMALOOR VFPCK": ["Banana"],
            "Kanjangadu": ["Arecanut(Betelnut/Supari)", "Ashgourd", "Banana", "Banana - Green", "Bhindi(Ladies Finger)", "Bitter gourd", "Black pepper", "Brinjal", "Cabbage", "Cauliflower", "Coconut Oil", "Coconut Seed", "Copra", "Cowpea(Veg)", "Cucumbar(Kheera)", "Drumstick", "Elephant Yam (Suran)", "Ginger(Green)", "Green Chilli", "Little gourd (Kundru)", "Onion", "Potato", "Pumpkin", "Ridgeguard(Tori)", "Snakeguard", "Tapioca", "Tomato"],
            "Kannur": ["Banana - Green", "Black pepper", "Coconut Oil", "Cowpea(Veg)"],
            "Kayamkulam": ["Amaranthus", "Ashgourd", "Banana", "Beetroot", "Bhindi(Ladies Finger)", "Bitter gourd", "Brinjal", "Cabbage", "Carrot", "Cauliflower", "Cowpea(Veg)", "Cucumbar(Kheera)", "Drumstick", "French Beans (Frasbean)", "Ginger(Green)", "Green Chilli", "Onion", "Potato", "Pumpkin", "Snakeguard", "Tomato"],
            "Kodungalloor": ["Ashgourd", "Beetroot", "Bhindi(Ladies Finger)", "Bitter gourd", "Brinjal", "Cabbage", "Carrot", "Drumstick", "Elephant Yam (Suran)", "French Beans (Frasbean)", "Ginger(Green)", "Green Chilli", "Mango (Raw-Ripe)", "Onion", "Potato", "Pumpkin", "Sweet Potato", "Tapioca", "Tomato"],
            "KOLAYAD VFPCK": ["Banana"],
            "KOLLENGODE VFPCK": ["Bhindi(Ladies Finger)", "Bitter gourd"],
            "KOTTAYI VFPCK": ["Bhindi(Ladies Finger)"],
            "Kondotty": ["Amaranthus", "Amphophalus", "Apple", "Ashgourd", "Banana - Green", "Beetroot", "Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Cabbage", "Carrot", "Cauliflower", "Cluster beans", "Colacasia", "Cowpea (Lobia/Karamani)", "Cowpea(Veg)", "Cucumbar(Kheera)", "Drumstick", "French Beans (Frasbean)", "Garlic", "Ginger(Green)", "Green Chilli", "Lemon", "Onion", "Potato", "Pumpkin", "Raddish", "Snakeguard", "Tapioca", "Tomato"],
            "Kothamangalam": ["Amaranthus", "Ashgourd", "Banana", "Banana - Green", "Bhindi(Ladies Finger)", "Bitter gourd", "Brinjal", "Cabbage", "Carrot", "Cauliflower", "Colacasia", "Cucumbar(Kheera)", "Drumstick", "Elephant Yam (Suran)", "Field Pea", "Ginger(Green)", "Green Chilli", "Little gourd (Kundru)", "Mango (Raw-Ripe)", "Onion", "Pineapple", "Potato", "Pumpkin", "Snakeguard", "Tapioca", "Tomato"],
            "Kottarakkara": ["Banana", "Beetroot", "Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Cabbage", "Carrot", "Coconut", "Colacasia", "Cowpea(Veg)", "Cucumbar(Kheera)", "Drumstick", "Elephant Yam (Suran)", "Ginger(Green)", "Green Chilli", "Little gourd (Kundru)", "Mango", "Onion", "Potato", "Pumpkin", "Snakeguard", "Tapioca", "Tomato"],
            "KULATHOOPUZHA VFPCK": ["Amphophalus", "Ashgourd", "Bitter gourd", "Cowpea(Veg)"],
            "KURICHY VFPCK": ["Banana"],
            "KURUMASSERY VFPCK": ["Banana"],
            "Kuriem  VFPCK": ["Cucumbar(Kheera)", "Little gourd (Kundru)"],
            "Kuruppanthura": ["Amphophalus", "Banana", "Banana - Green", "Beetroot", "Bhindi(Ladies Finger)", "Bitter gourd", "Brinjal", "Cabbage", "Carrot", "Cauliflower", "Coconut", "Cowpea(Veg)", "Drumstick", "Ginger(Green)", "Green Chilli", "Little gourd (Kundru)", "Onion", "Pineapple", "Potato", "Pumpkin", "Snakeguard", "Tapioca", "Tomato"],
            "Kuttoor": ["Amaranthus", "Ashgourd", "Banana", "Bhindi(Ladies Finger)", "Bitter gourd", "Brinjal", "Coconut Oil", "Cowpea(Veg)", "Elephant Yam (Suran)", "Ginger(Green)", "Pepper ungarbled"],
            "Madikai  VFPCK": ["Ashgourd", "Banana", "Bhindi(Ladies Finger)", "Bitter gourd", "Brinjal", "Carrot", "Cucumbar(Kheera)", "Elephant Yam (Suran)", "Green Chilli", "Long Melon(Kakri)", "Ridgeguard(Tori)", "Snakeguard", "Tomato"],
            "Mallappally  VFPCK": ["Banana"],
            "MANKADA VFPCK": ["Banana"],
            "Mannar": ["Amphophalus", "Ashgourd", "Banana - Green", "Beetroot", "Bhindi(Ladies Finger)", "Bitter gourd", "Brinjal", "Cabbage", "Capsicum", "Carrot", "Colacasia", "Cowpea(Veg)", "Cucumbar(Kheera)", "Drumstick", "Ginger(Green)", "Green Chilli", "Onion", "Potato", "Pumpkin", "Tomato"],
            "Marottichal  VFPCK": ["Banana"],
            "Mattannur  VFPCK": ["Banana"],
            "MELECHINNAR VFPCK": ["Ginger(Green)"],
            "Mezhuveli  VFPCK": ["Banana", "Coconut"],
            "Mookkannur  VFPCK": ["Banana"],
            "Mukkom": ["Amphophalus", "Apple", "Ashgourd", "Banana", "Banana - Green", "Beetroot", "Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Cabbage", "Carrot", "Coconut Seed", "Cowpea(Veg)", "Cucumbar(Kheera)", "Drumstick", "Ginger(Green)", "Grapes", "Green Chilli", "Onion", "Orange", "Pineapple", "Potato", "Pumpkin", "Snakeguard", "Tomato"],
            "Neeleswaram": ["Amaranthus", "Amphophalus", "Arecanut(Betelnut/Supari)", "Banana", "Banana - Green", "Beetroot", "Bhindi(Ladies Finger)", "Bitter gourd", "Black Gram (Urd Beans)(Whole)", "Brinjal", "Cabbage", "Carrot", "Coconut", "Coconut Oil", "Copra", "Cowpea(Veg)", "Cucumbar(Kheera)", "Drumstick", "Lemon", "Onion", "Potato", "Pumpkin", "Ridgeguard(Tori)", "Snakeguard"],
            "Neyyatinkara": ["Amaranthus", "Amphophalus", "Beetroot", "Bhindi(Ladies Finger)", "Bitter gourd", "Brinjal", "Cabbage", "Carrot", "Cluster beans", "Colacasia", "Cucumbar(Kheera)", "Duster Beans", "Ginger(Green)", "Green Chilli", "Pumpkin", "Snakeguard", "Tapioca", "Tomato"],
            "Nooluvally  VFPCK": ["Banana"],
            "North Paravur": ["Alsandikai", "Amaranthus", "Amla(Nelli Kai)", "Amphophalus", "Ashgourd", "Banana - Green", "Beetroot", "Bhindi(Ladies Finger)", "Bitter gourd", "Black pepper", "Bottle gourd", "Brinjal", "Cabbage", "Capsicum", "Carrot", "Cauliflower", "Coconut", "Colacasia", "Coriander(Leaves)", "Cowpea(Veg)", "Cucumbar(Kheera)", "Drumstick", "French Beans (Frasbean)", "Garlic", "Ginger(Green)", "Green Chilli", "Indian Beans (Seam)", "Lemon", "Little gourd (Kundru)", "Mango (Raw-Ripe)", "Mint(Pudina)", "Onion", "Pineapple", "Potato", "Pumpkin", "Ridgeguard(Tori)", "Snakeguard", "Sweet Potato", "Tapioca", "Tomato"],
            "PAPPANCHANI VFPCK": ["Amranthas Red", "Cucumbar(Kheera)"],
            "Pariyaram VFPCK": ["Bhindi(Ladies Finger)", "Brinjal"],
            "Palakkad": ["Amaranthus", "Arhar (Tur/Red Gram)(Whole)", "Banana", "Bengal Gram(Gram)(Whole)", "Bhindi(Ladies Finger)", "Bitter gourd", "Black Gram (Urd Beans)(Whole)", "Bottle gourd", "Brinjal", "Cabbage", "Capsicum", "Carrot", "Cauliflower", "Chili Red", "Cluster beans", "Coconut", "Colacasia", "Cowpea (Lobia/Karamani)", "Cowpea(Veg)", "Drumstick", "Elephant Yam (Suran)", "French Beans (Frasbean)", "Garlic", "Ginger(Green)", "Green Avare (W)", "Green Chilli", "Green Peas", "Kabuli Chana(Chickpeas-White)", "Lemon", "Lime", "Little gourd (Kundru)", "Mango (Raw-Ripe)", "Onion", "Pineapple", "Potato", "Pumpkin", "Snakeguard", "Sweet Potato", "Tapioca", "Tomato"],
            "Paliyamangalam  VFPCK": ["Cowpea(Veg)"],
            "Pala": ["Banana", "Banana - Green", "Beetroot", "Bhindi(Ladies Finger)", "Bitter gourd", "Cabbage", "Carrot", "Cluster beans", "Cowpea(Veg)", "Cucumbar(Kheera)", "Green Chilli", "Little gourd (Kundru)", "Onion", "Potato", "Snakeguard", "Tomato"],
            "Palayam": ["Amaranthus", "Amphophalus", "Ashgourd", "Beetroot", "Bitter gourd", "Bottle gourd", "Brinjal", "Cabbage", "Carrot", "Cauliflower", "Cluster beans", "Coconut Seed", "Cowpea(Veg)", "Cucumbar(Kheera)", "Drumstick", "French Beans (Frasbean)", "Ginger(Green)", "Green Chilli", "Onion", "Potato", "Pumpkin", "Raddish", "Snakeguard", "Tomato"],
            "Pampady": ["Amaranthus", "Ashgourd", "Banana", "Banana - Green", "Bhindi(Ladies Finger)", "Bitter gourd", "Brinjal", "Cabbage", "Cauliflower", "Coconut", "Colacasia", "Cowpea(Veg)", "Cucumbar(Kheera)", "Drumstick", "Elephant Yam (Suran)", "Ginger(Green)", "Green Chilli", "Indian Beans (Seam)", "Little gourd (Kundru)", "Mango (Raw-Ripe)", "Onion", "Potato", "Pumpkin", "Snakeguard", "Tapioca", "Tomato"],
            "Parappanangadi": ["Elephant Yam (Suran)", "Garlic", "Green Chilli", "Little gourd (Kundru)", "Lemon", "Mango (Raw-Ripe)", "Mint(Pudina)", "Onion", "Potato", "Pumpkin", "Snakeguard", "Sweet Potato", "Tapioca", "Tomato"],
            "Pattambi": ["Amaranthus", "Ashgourd", "Banana", "Beetroot", "Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Colacasia", "Elephant Yam (Suran)", "French Beans (Frasbean)", "Ginger(Green)", "Green Avare (W)", "Green Chilli", "Lime", "Little gourd (Kundru)", "Mango", "Onion", "Potato", "Pumpkin", "Snakeguard", "Sweet Potato", "Tapioca", "Tomato"],
            "Pattiyam  VFPCK": ["Banana - Green"],
            "Payyannur": ["Amaranthus", "Arecanut(Betelnut/Supari)", "Ashgourd", "Banana", "Black pepper", "Coconut Seed", "Copra", "Cucumbar(Kheera)", "Pumpkin", "Tapioca"],
            "Perambra": ["Amaranthus", "Amphophalus", "Ashgourd", "Beetroot", "Bitter gourd", "Brinjal", "Cabbage", "Capsicum", "Carrot", "Cauliflower", "Cluster beans", "Cowpea(Veg)", "Cucumbar(Kheera)", "Drumstick", "French Beans (Frasbean)", "Ginger(Green)", "Green Chilli", "Onion", "Potato", "Pumpkin", "Snakeguard", "Tomato"],
            "Perumbavoor": ["Amaranthus", "Amphophalus", "Arecanut(Betelnut/Supari)", "Ashgourd", "Banana", "Beetroot", "Bhindi(Ladies Finger)", "Bitter gourd", "Black pepper", "Bottle gourd", "Brinjal", "Cabbage", "Carrot", "Cauliflower", "Coconut Seed", "Colacasia", "Cowpea(Veg)", "Cucumbar(Kheera)", "Drumstick", "Elephant Yam (Suran)", "Field Pea", "Ginger(Dry)", "Ginger(Green)", "Green Chilli", "Indian Beans (Seam)", "Lemon", "Little gourd (Kundru)", "Mango (Raw-Ripe)", "Onion", "Pineapple", "Potato", "Pumpkin", "Snakeguard", "Tapioca", "Tomato"],
            "Piravam": ["Amphophalus", "Amaranthus", "Ashgourd", "Banana - Green", "Beetroot", "Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Cabbage", "Capsicum", "Carrot", "Cauliflower", "Colacasia", "Coriander(Leaves)", "Cowpea(Veg)", "Cucumbar(Kheera)", "Drumstick", "Ginger(Green)", "Green Chilli", "Indian Beans (Seam)", "Lemon", "Little gourd (Kundru)", "Long Melon(Kakri)", "Mango", "Mango (Raw-Ripe)", "Onion", "Orange", "Papaya", "Papaya (Raw)", "Pineapple", "Potato", "Pumpkin", "Snakeguard", "Sweet Potato", "Tapioca", "Tomato", "Water Melon"],
            "POOTHADI VFPCK": ["Banana"],
            "Pullur Periya  VFPCK": ["Banana", "Bhindi(Ladies Finger)", "Cowpea(Veg)", "Cucumbar(Kheera)", "Ridgeguard(Tori)", "Thondekai"],
            "Pulpally": ["Amaranthus", "Banana", "Bitter gourd", "Coffee", "Cowpea(Veg)", "Cucumbar(Kheera)", "Ginger(Dry)", "Green Chilli", "Paddy(Dhan)(Common)", "Pepper ungarbled", "Pumpkin", "Rubber"],
            "Puthupariyaram  VFPCK": ["Cowpea(Veg)"],
            "Puthenvelikkara  VFPCK": ["Banana - Green"],
            "Quilandy": ["Amphophalus", "Ashgourd", "Banana - Green", "Beetroot", "Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Cabbage", "Carrot", "Cauliflower", "Cluster beans", "Coriander(Leaves)", "Cowpea(Veg)", "Cucumbar(Kheera)", "Drumstick", "French Beans (Frasbean)", "Ginger(Green)", "Green Chilli", "Raddish", "Snakeguard", "Tomato"],
            "RANNI VFPCK": ["Banana"],
            "Sasthamkotta": ["Amphophalus", "Ashgourd", "Banana", "Bhindi(Ladies Finger)", "Bitter gourd", "Brinjal", "Colacasia", "Cowpea(Veg)", "Cucumbar(Kheera)", "Green Chilli", "Snakeguard", "Tapioca", "Tomato", "Yam"],
            "Sulthanbathery  VFPCK": ["Banana"],
            "Sultan bathery": ["Banana - Green", "Black pepper", "Coconut", "Coffee", "Ginger(Green)"],
            "Taliparamba": ["Banana", "Brinjal", "Cucumbar(Kheera)", "Green Chilli", "Onion", "Potato", "Tomato"],
            "Thalasserry": ["Banana", "Bhindi(Ladies Finger)", "Black pepper", "Carrot", "Cowpea(Veg)", "Onion", "Potato", "Snakeguard", "Tomato"],
            "Thalayolaparambu": ["Amaranthus", "Ashgourd", "Banana", "Beetroot", "Bhindi(Ladies Finger)", "Bitter gourd", "Brinjal", "Cabbage", "Carrot", "Cauliflower", "Cluster beans", "Colacasia", "Cowpea(Veg)", "Cucumbar(Kheera)", "Drumstick", "Elephant Yam (Suran)", "Ginger(Green)", "Green Chilli", "Lemon", "Little gourd (Kundru)", "Mango", "Onion", "Pineapple", "Potato", "Pumpkin", "Snakeguard", "Tapioca", "Tomato"],
            "Thamarassery": ["Amaranthus", "Amphophalus", "Ashgourd", "Banana - Green", "Beetroot", "Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Cabbage", "Carrot", "Cowpea(Veg)", "Cucumbar(Kheera)", "Drumstick", "French Beans (Frasbean)", "Ginger(Green)", "Green Chilli", "Onion", "Potato", "Pumpkin", "Snakeguard", "Tomato"],
            "Thiruvaniyoor  VFPCK": ["Banana"],
            "Thirurrangadi": ["Amaranthus", "Ashgourd", "Beans", "Beetroot", "Bhindi(Ladies Finger)", "Bottle gourd"],
            "Thottuva  VFPCK": ["Snakeguard"],
            "Thrissur": ["Amaranthus", "Ashgourd", "Banana", "Beetroot", "Bhindi(Ladies Finger)", "Brinjal", "Cabbage", "Carrot", "Cauliflower", "Cluster beans", "Coconut Seed", "Cowpea(Veg)", "Cucumbar(Kheera)", "Drumstick", "Elephant Yam (Suran)", "Ginger(Green)", "Green Chilli", "Lemon", "Little gourd (Kundru)", "Mango (Raw-Ripe)", "Onion", "Pineapple", "Potato", "Pumpkin", "Snakeguard", "Tapioca", "Tomato"],
            "Thrippunithura": ["Amphophalus", "Ashgourd", "Banana", "Banana - Green", "Beetroot", "Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Cabbage", "Capsicum", "Carrot", "Cauliflower", "Cluster beans", "Colacasia", "Cowpea(Veg)", "Cucumbar(Kheera)", "Drumstick", "Green Chilli", "Indian Beans (Seam)", "Leafy Vegetable", "Lemon", "Little gourd (Kundru)", "Mango (Raw-Ripe)", "Onion", "Pineapple", "Potato", "Pumpkin", "Snakeguard", "Tapioca", "Tomato"],
            "Udumbannoor  VFPCK": ["Banana"],
            "Vadakkenchery": ["Ashgourd", "Banana", "Beetroot", "Bhindi(Ladies Finger)", "Bitter gourd", "Brinjal", "Cabbage", "Carrot", "Cauliflower"],
            "Vandiperiyar": ["Ashgourd", "Banana", "Bhindi(Ladies Finger)", "Bitter gourd", "Brinjal", "Cabbage", "Capsicum", "Carrot", "Cauliflower", "Cucumbar(Kheera)", "Elephant Yam (Suran)", "Green Chilli", "Onion", "Potato", "Pumpkin", "Snakeguard", "Tapioca", "Tomato"],
            "Vaniyamkulam  VFPCK": ["Banana", "Banana - Green", "Bhindi(Ladies Finger)", "Tapioca"],
            "Vayala  VFPCK": ["Banana"],
            "Veliyam  VFPCK": ["Amphophalus", "Ashgourd", "Banana", "Colacasia", "Ginger(Green)"],
            "Vengeri(Kozhikode)": ["Amaranthus", "Ashgourd", "Bhindi(Ladies Finger)", "Bitter gourd", "Brinjal", "Carrot", "Cowpea(Veg)", "Cucumbar(Kheera)", "Drumstick", "French Beans (Frasbean)", "Pumpkin", "Snakeguard", "Tomato"]
        },
        "Manipur": {
            "Bishenpur": ["Arhar Dal(Tur Dal)", "Banana", "Bengal Gram Dal (Chana Dal)", "Bengal Gram(Gram)(Whole)", "Black Gram Dal (Urd Dal)", "Dry Chillies", "Ginger(Green)", "Green Gram Dal (Moong Dal)", "Masur Dal", "Onion", "Paddy(Dhan)(Common)", "Pineapple", "Potato", "Rice"],
            "Imphal": ["Arhar Dal(Tur Dal)", "Banana", "Bengal Gram Dal (Chana Dal)", "Bengal Gram(Gram)(Whole)", "Black Gram (Urd Beans)(Whole)", "Cabbage", "Dry Chillies", "Ginger(Green)", "Green Gram Dal (Moong Dal)", "Maize", "Masur Dal", "Onion", "Paddy(Dhan)(Common)", "Pineapple", "Potato", "Rice"],
            "Lamlong Bazaar": ["Arhar Dal(Tur Dal)", "Banana", "Bengal Gram(Gram)(Whole)", "Black Gram Dal (Urd Dal)", "Dry Chillies", "Ginger(Green)", "Green Gram Dal (Moong Dal)", "Masur Dal", "Onion", "Paddy(Dhan)(Common)", "Pineapple", "Potato", "Rice"],
            "Thoubal": ["Arhar Dal(Tur Dal)", "Banana", "Bengal Gram Dal (Chana Dal)", "Bengal Gram(Gram)(Whole)", "Black Gram Dal (Urd Dal)", "Dry Chillies", "Ginger(Green)", "Green Gram Dal (Moong Dal)", "Masur Dal", "Onion", "Paddy(Dhan)(Common)", "Pineapple", "Potato", "Rice"]
        },
        "Meghalaya": {
            "Shillong": ["Arecanut(Betelnut/Supari)", "Betal Leaves", "Brinjal", "Cauliflower", "Green Chilli", "Potato", "Pumpkin", "Raddish", "Squash(Chappal Kadoo)", "Turnip"],
            "Tura": ["Arecanut(Betelnut/Supari)", "Betal Leaves", "Brinjal", "Green Chilli"]
        },
        "Nagaland": {
            "Dimapur": ["Beans", "Bitter gourd", "Bhindi(Ladies Finger)", "Green Chilli", "Leafy Vegetable", "Pumpkin"],
            "Kohima": ["Beans", "Cabbage", "Carrot", "Ginger(Green)", "Green Chilli", "Potato"],
            "Nuiland": ["Arecanut(Betelnut/Supari)", "Banana - Green", "Brinjal", "Green Chilli", "Leafy Vegetable"]
        },
        "NCT of Delhi": {
            "Fish,Poultry & Egg Market, Gazipur": ["Fish"],
            "Keshopur": ["Bitter gourd", "Bottle gourd", "Brinjal", "Cabbage", "Capsicum", "Cauliflower", "Coriander(Leaves)", "Cucumbar(Kheera)", "Onion", "Peas Wet", "Potato", "Pumpkin", "Raddish", "Tomato"]
        },
        "Odisha": {
            "Anandapur": ["Pumpkin"],
            "Attabira": ["Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Drumstick", "Green Chilli", "Lemon", "Little gourd (Kundru)", "Onion", "Papaya (Raw)", "Pointed gourd (Parval)", "Potato", "Pumpkin", "Ridgeguard(Tori)", "Tomato"],
            "Balugaon": ["Bitter gourd", "Brinjal", "Cauliflower", "Fish", "Garlic", "Ginger(Dry)", "Onion", "Pointed gourd (Parval)", "Potato", "Tomato"],
            "Banki": ["Bhindi(Ladies Finger)", "Bitter gourd", "Cucumbar(Kheera)", "Green Chilli", "Onion", "Potato", "Pumpkin", "Ridgeguard(Tori)", "Tomato"],
            "Bargarh": ["Bhindi(Ladies Finger)", "Brinjal", "Onion", "Potato", "Tomato"],
            "Bargarh(Barapalli)": ["Brinjal", "Cabbage", "Onion", "Potato"],
            "Betnoti": ["Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Papaya (Raw)", "Pointed gourd (Parval)", "Pumpkin"],
            "Bhanjanagar": ["Banana - Green", "Cucumbar(Kheera)", "Drumstick", "Little gourd (Kundru)", "Pumpkin", "Ridgeguard(Tori)"],
            "Boudh": ["Banana - Green", "Bhindi(Ladies Finger)", "Bitter gourd", "Brinjal", "Carrot", "Cauliflower", "Cucumbar(Kheera)", "Pointed gourd (Parval)", "Potato", "Pumpkin", "Raddish", "Tomato"],
            "Chatta Krushak Bazar": ["Bitter gourd", "Brinjal", "Pumpkin", "Tomato"],
            "Gopa": ["Bhindi(Ladies Finger)", "Brinjal", "Pumpkin", "Tomato"],
            "Godabhaga": ["Paddy(Dhan)(Common)"],
            "Gunpur": ["Beetroot", "Brinjal", "Cabbage", "Carrot", "Cashewnuts", "Tamarind Fruit"],
            "Hindol": ["Banana - Green", "Bhindi(Ladies Finger)", "Bitter gourd", "Brinjal", "Cucumbar(Kheera)", "Drumstick", "Onion", "Pointed gourd (Parval)", "Potato", "Pumpkin", "Tomato"],
            "Jagatsinghpur": ["Brinjal", "Potato"],
            "Jaleswar": ["Brinjal", "Cucumbar(Kheera)", "Garlic", "Ginger(Dry)", "Little gourd (Kundru)", "Onion", "Potato", "Pumpkin", "Tomato"],
            "Jharsuguda": ["Onion", "Potato"],
            "Karanjia": ["Bhindi(Ladies Finger)", "Fish", "Paddy(Dhan)(Common)", "Rice"],
            "Kasinagar": ["Brinjal"],
            "Kendrapara": ["Bitter gourd", "Pointed gourd (Parval)", "Tomato"],
            "Kendrapara(Marshaghai)": ["Bitter gourd", "Brinjal", "Pointed gourd (Parval)", "Pumpkin", "Tomato"],
            "Keonjhar": ["Bhindi(Ladies Finger)", "Bitter gourd", "Brinjal", "Cabbage", "Onion", "Potato", "Rice", "Tomato"],
            "Kesinga": ["Banana - Green", "Beans", "Garlic", "Ginger(Dry)", "Little gourd (Kundru)"],
            "Khariar": ["Bhindi(Ladies Finger)", "Bitter gourd", "Brinjal", "Cabbage", "Cauliflower", "Cucumbar(Kheera)", "Onion", "Pointed gourd (Parval)", "Potato", "Tomato"],
            "Khariar Road": ["Bhindi(Ladies Finger)", "Bitter gourd", "Brinjal", "Cabbage", "Cauliflower", "Cucumbar(Kheera)", "Onion", "Tomato"],
            "Khunthabandha": ["Bhindi(Ladies Finger)", "Bitter gourd", "Brinjal", "Cauliflower", "Cucumbar(Kheera)", "Onion", "Potato", "Tomato"],
            "Koraput": ["Banana - Green", "Beans", "Bhindi(Ladies Finger)", "Bitter gourd", "Brinjal", "Cabbage", "Carrot", "Cauliflower", "Coriander(Leaves)", "Cucumbar(Kheera)", "Ginger(Green)", "Green Chilli", "Little gourd (Kundru)", "Papaya (Raw)", "Pumpkin", "Raddish", "Ridgeguard(Tori)", "Sweet Potato", "Tomato"],
            "Koraput(Semilguda)": ["Banana - Green", "Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Cabbage", "Carrot", "Cauliflower", "Coriander(Leaves)", "Cucumbar(Kheera)", "Ginger(Green)", "Green Chilli", "Little gourd (Kundru)", "Papaya (Raw)", "Pumpkin", "Raddish", "Ridgeguard(Tori)", "Sweet Potato", "Tomato"],
            "Mukhiguda": ["Bhindi(Ladies Finger)", "Brinjal", "Cabbage", "Cauliflower", "Green Chilli"],
            "Nilagiri": ["Bhindi(Ladies Finger)", "Cucumbar(Kheera)", "Pumpkin", "Tomato"],
            "Panposh": ["Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Cucumbar(Kheera)", "Pumpkin", "Tomato"],
            "Parlakhemundi": ["Bhindi(Ladies Finger)", "Brinjal", "Cabbage", "Pineapple", "Ridgeguard(Tori)", "Tomato"],
            "Pattamundai": ["Bitter gourd", "Brinjal", "Pointed gourd (Parval)", "Pumpkin", "Tomato"],
            "Rahama": ["Brinjal", "Fish", "Pumpkin", "Rice"],
            "Rayagada": ["Bhindi(Ladies Finger)", "Brinjal", "Cabbage", "Green Chilli", "Onion", "Potato", "Tomato"],
            "Rayagada(Muniguda)": ["Beetroot", "Bhindi(Ladies Finger)", "Bitter gourd", "Cucumbar(Kheera)", "Pumpkin"],
            "Sargipali": ["Bhindi(Ladies Finger)", "Brinjal", "Cabbage", "Carrot", "Green Chilli", "Onion", "Pointed gourd (Parval)", "Potato", "Pumpkin", "Tomato"]
        },
        "Pondicherry": {
            "Madagadipet": ["Paddy(Dhan)(Common)"]
        },
        "Punjab": {
            "Ahmedgarh": ["Banana", "Bhindi(Ladies Finger)", "Peas Wet", "Potato", "Ridgeguard(Tori)", "Tomato"],
            "Amloh": ["Maize"],
            "Amloh(Gobind Garh Mandi)": ["Maize"],
            "Amritsar(Amritsar Mewa Mandi)": ["Apple", "Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Cabbage", "Capsicum", "Carrot", "Cucumbar(Kheera)", "French Beans (Frasbean)", "Garlic", "Ginger(Dry)", "Green Chilli", "Jamun(Narale Hannu)", "Lemon", "Mango", "Mousambi(Sweet Lime)", "Onion", "Pear(Marasebu)", "Peas cod", "Plum", "Pomegranate", "Potato", "Pumpkin", "Raddish", "Sponge gourd", "Tinda"],
            "Baghapurana": ["Apple", "Banana", "Brinjal", "Cabbage", "Cucumbar(Kheera)", "Green Chilli", "Onion", "Potato", "Pumpkin", "Sweet Pumpkin", "Tomato"],
            "Bariwala": ["Bhindi(Ladies Finger)", "Brinjal", "Cabbage", "Cauliflower", "Cucumbar(Kheera)", "Onion", "Pumpkin", "Sweet Pumpkin", "Tomato"],
            "Bassi Pathana": ["Banana", "Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Cabbage", "Capsicum", "Cauliflower", "Coriander(Leaves)", "Cucumbar(Kheera)", "Garlic", "Ginger(Green)", "Green Chilli", "Lemon", "Mousambi(Sweet Lime)", "Onion", "Papaya", "Peas Wet", "Plum", "Potato", "Pumpkin", "Spinach", "Tomato"],
            "Bhagta Bhai Ka": ["Banana", "Brinjal", "Green Chilli", "Onion", "Potato", "Pumpkin", "Ridgeguard(Tori)", "Tomato"],
            "Chamkaur Sahib": ["Banana", "Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Capsicum", "Cauliflower", "Cucumbar(Kheera)", "Garlic", "Ginger(Green)", "Green Chilli", "Mango", "Onion", "Papaya", "Peas Wet", "Pomegranate", "Potato", "Pumpkin", "Tomato"],
            "Cheeka": ["Potato"],
            "Dera Bassi": ["Onion", "Potato", "Pumpkin", "Tomato"],
            "Dhuri": ["Banana", "Onion", "Papaya", "Pear(Marasebu)", "Potato", "Tomato"],
            "Doraha": ["Capsicum", "Cucumbar(Kheera)", "Ridgeguard(Tori)", "Tomato"],
            "F.G.Churian": ["Bhindi(Ladies Finger)", "Bitter gourd", "Brinjal", "Capsicum", "Cucumbar(Kheera)", "Green Chilli", "Onion", "Potato", "Ridgeguard(Tori)", "Squash(Chappal Kadoo)", "Tinda", "Tomato"],
            "Fazilka": ["Apple", "Banana", "Bhindi(Ladies Finger)", "Bitter gourd", "Brinjal", "Cucumbar(Kheera)", "Garlic", "Ginger(Green)", "Green Chilli", "Jamun(Narale Hannu)", "Karbuja(Musk Melon)", "Mango", "Onion", "Potato", "Pumpkin", "Tomato"],
            "Garh Shankar": ["Apple", "Banana", "Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Cabbage", "Capsicum", "Cucumbar(Kheera)", "Field Pea", "Garlic", "Ginger(Green)", "Green Chilli", "Mango", "Onion", "Papaya", "Plum", "Pumpkin", "Tomato"],
            "GarhShankar (Kotfatuhi)": ["Apple", "Banana", "Green Chilli", "Onion", "Potato", "Tomato"],
            "Ghanaur": ["Potato", "Tomato"],
            "Gurdaspur": ["Apple", "Banana", "Bhindi(Ladies Finger)", "Bitter gourd", "Brinjal", "Cabbage", "Capsicum", "Carrot", "Cauliflower", "Coriander(Leaves)", "Cucumbar(Kheera)", "Garlic", "Ginger(Dry)", "Green Chilli", "Lemon", "Mango", "Onion", "Papaya", "Pomegranate", "Potato", "Tomato"],
            "Hoshiarpur(Sham Churasi)": ["Bhindi(Ladies Finger)", "Brinjal", "Pumpkin", "Round gourd"],
            "Jalalabad": ["Apple", "Banana", "Bhindi(Ladies Finger)", "Bitter gourd", "Brinjal", "Cabbage", "Capsicum", "Carrot", "Cauliflower", "Coriander(Leaves)", "Cucumbar(Kheera)", "Garlic", "Ginger(Green)", "Grapes", "Green Chilli", "Lemon", "Mango", "Mousambi(Sweet Lime)", "Peas Wet", "Pineapple", "Plum", "Pomegranate", "Potato", "Pumpkin", "Sweet Pumpkin", "Tomato", "Water Melon"],
            "Jalandhar City": ["Maize"],
            "Jalandhar City(Jalandhar)": ["Apple", "Bhindi(Ladies Finger)", "Bottle gourd", "Carrot", "Cauliflower", "Colacasia", "Coriander(Leaves)", "Cucumbar(Kheera)", "French Beans (Frasbean)", "Garlic", "Ginger(Green)", "Grapes", "Green Chilli", "Guava", "Jamun(Narale Hannu)", "Lemon", "Mango", "Mashrooms", "Mousambi(Sweet Lime)", "Onion", "Papaya", "Peas Wet", "Pineapple", "Plum", "Potato", "Pumpkin", "Raddish", "Spinach", "Tender Coconut", "Tomato", "Water Melon"],
            "Kalanaur": ["Bhindi(Ladies Finger)", "Bottle gourd", "Green Chilli", "Pumpkin"],
            "Kapurthala": ["Bitter gourd", "Brinjal"],
            "Kot ise Khan": ["Bhindi(Ladies Finger)", "Bitter gourd", "Brinjal", "Cucumbar(Kheera)", "Green Chilli", "Potato", "Rat Tail Radish (Mogari)", "Squash(Chappal Kadoo)"],
            "Lalru": ["Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Capsicum", "Cauliflower", "Colacasia", "Cucumbar(Kheera)", "Garlic", "Ginger(Green)", "Green Chilli", "Mango (Raw-Ripe)", "Onion", "Peas Wet", "Potato", "Ridgeguard(Tori)", "Tomato"],
            "Ludhiana": ["Apple", "Ashgourd", "Beetroot", "Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Cabbage", "Capsicum", "Carrot", "Cauliflower", "Colacasia", "Coriander(Leaves)", "Cucumbar(Kheera)", "Ginger(Dry)", "Green Chilli", "Guava", "Jamun(Narale Hannu)", "Lemon", "Mango", "Mousambi(Sweet Lime)", "Onion", "Pear(Marasebu)", "Peas Wet", "Plum", "Pomegranate", "Potato", "Pumpkin", "Raddish", "Ridgeguard(Tori)", "Tomato"],
            "Majitha": ["Bhindi(Ladies Finger)", "Bitter gourd", "Maize"],
            "Moga": ["Apple", "Banana", "Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Capsicum", "Cucumbar(Kheera)", "Garlic", "Ginger(Dry)", "Green Chilli", "Lemon", "Mango", "Onion", "Peas Wet", "Tomato"],
            "Mukerian": ["Apple", "Banana", "Bhindi(Ladies Finger)", "Bitter gourd", "Brinjal", "Cabbage", "Capsicum", "Cauliflower", "Cucumbar(Kheera)", "Ginger(Dry)", "Green Chilli", "Onion", "Raddish", "Tomato"],
            "Mukerian(Talwara)": ["Apple", "Banana", "Bhindi(Ladies Finger)", "Brinjal", "Capsicum", "Cucumbar(Kheera)", "Field Pea", "Green Chilli", "Mango", "Onion", "Potato", "Pumpkin", "Round gourd", "Tomato"],
            "Muktsar": ["Beetroot", "Bhindi(Ladies Finger)", "Bitter gourd", "Brinjal", "Cabbage", "Capsicum", "Cauliflower", "Coriander(Leaves)", "Cucumbar(Kheera)", "French Beans (Frasbean)", "Garlic", "Ginger(Green)", "Green Chilli", "Guar", "Onion", "Peas Wet", "Potato", "Pumpkin", "Spinach", "Tomato"],
            "Nawanshahar": ["Maize"],
            "Nihal Singh Wala": ["Bhindi(Ladies Finger)", "Bottle gourd", "Cabbage", "Capsicum", "Cucumbar(Kheera)", "Green Chilli", "Onion", "Potato", "Tomato"],
            "Patti": ["Bitter gourd", "Ginger(Dry)", "Green Chilli", "Onion", "Potato", "Ridgeguard(Tori)", "Tomato"],
            "Panchkul(Kalka)": ["Apple"],
            "Phillaur": ["Bottle gourd"],
            "Phillaur(Apra Mandi)": ["Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Green Chilli", "Onion", "Potato", "Tomato"],
            "Pundri": ["Onion", "Potato", "Tomato"],
            "Rampuraphul(Nabha Mandi)": ["Apple", "Bhindi(Ladies Finger)", "Cucumbar(Kheera)", "Green Chilli", "Mango", "Onion", "Papaya", "Potato", "Ridgeguard(Tori)", "Tomato"],
            "Rayya": ["Bhindi(Ladies Finger)", "Brinjal", "Cauliflower", "Green Chilli", "Onion", "Potato", "Raddish", "Tomato"],
            "Ropar": ["Apple", "Banana", "Brinjal", "Cauliflower", "French Beans (Frasbean)", "Garlic", "Ginger(Green)", "Green Peas", "Green Chilli", "Mango", "Onion", "Pineapple", "Potato"],
            "Sahnewal": ["Bhindi(Ladies Finger)", "Cucumbar(Kheera)", "Potato"],
            "Sangrur": ["Apple", "Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Cabbage", "Capsicum", "Carrot", "Cauliflower", "Colacasia", "Coriander(Leaves)", "Cucumbar(Kheera)", "Garlic", "Ginger(Green)", "Green Chilli", "Guava", "Jamun(Narale Hannu)", "Lemon", "Mousambi(Sweet Lime)", "Onion", "Plum", "Pomegranate", "Potato", "Pumpkin", "Ridgeguard(Tori)", "Spinach", "Tomato"],
            "Tapa(Tapa Mandi)": ["Green Gram (Moong)(Whole)"],
            "Tarantaran": ["Brinjal", "Cauliflower", "Cucumbar(Kheera)", "Garlic", "Ginger(Dry)", "Green Chilli", "Onion", "Potato", "Pumpkin", "Tomato"],
            "Zira": ["Banana - Green", "Colacasia", "Green Chilli", "Guar", "Potato", "Pumpkin", "Tomato"]
        },
        "Rajasthan": {
            "Ajmer(F&V)": ["Apple", "Banana", "Bhindi(Ladies Finger)", "Brinjal", "Cabbage", "Carrot", "Cauliflower", "Ginger(Dry)", "Grapes", "Green Chilli", "Guava", "Lime", "Long Melon(Kakri)", "Mango", "Mango (Raw-Ripe)", "Mousambi(Sweet Lime)", "Onion", "Papaya", "Pineapple", "Pomegranate", "Potato", "Pumpkin", "Tinda", "Tomato", "Water Melon"],
            "Anupgarh": ["Mustard"],
            "Atru": ["Bengal Gram(Gram)(Whole)", "Corriander seed", "Green Gram (Moong)(Whole)", "Mustard", "Soyabean", "Wheat"],
            "Baran": ["Bengal Gram(Gram)(Whole)", "Black Gram (Urd Beans)(Whole)", "Corriander seed", "Garlic", "Green Gram (Moong)(Whole)", "Maize", "Methi Seeds", "Mustard", "Paddy(Dhan)(Common)", "Peas(Dry)", "Soyabean", "Wheat"],
            "Barmer": ["Guar Seed(Cluster Beans Seed)"],
            "Bassi": ["Bajra(Pearl Millet/Cumbu)", "Barley (Jau)", "Bengal Gram(Gram)(Whole)", "Guar Seed(Cluster Beans Seed)", "Mustard", "Onion", "Potato", "Tomato", "Wheat"],
            "Beawar": ["Guar"],
            "Begu": ["Maize"],
            "Bhinmal": ["Tomato"],
            "Bundi": ["Barley (Jau)", "Bengal Gram(Gram)(Whole)", "Black Gram (Urd Beans)(Whole)", "Green Gram (Moong)(Whole)", "Lentil (Masur)(Whole)", "Mustard", "Paddy(Dhan)(Common)", "Soyabean", "Wheat"],
            "Chhabra": ["Bengal Gram(Gram)(Whole)", "Corriander seed", "Garlic", "Mustard", "Soyabean", "Wheat"],
            "Dausa": ["Bajra(Pearl Millet/Cumbu)", "Barley (Jau)", "Bengal Gram(Gram)(Whole)", "Guar", "Mustard", "Wheat"],
            "Dei": ["Black Gram (Urd Beans)(Whole)", "Mustard", "Soyabean", "Wheat"],
            "Dooni": ["Bajra(Pearl Millet/Cumbu)", "Barley (Jau)", "Bengal Gram(Gram)(Whole)", "Black Gram (Urd Beans)(Whole)", "Guar Seed(Cluster Beans Seed)", "Mustard", "Wheat"],
            "Dudu": ["Barley (Jau)", "Green Gram (Moong)(Whole)", "Mustard", "Wheat"],
            "Dungarpur": ["Onion"],
            "Fatehnagar": ["Barley (Jau)", "Bengal Gram(Gram)(Whole)", "Maize", "Mustard", "Wheat"],
            "Gajsinghpur": ["Bengal Gram(Gram)(Whole)", "Guar", "Javi", "Mustard", "Wheat"],
            "Hindoun": ["Bajra(Pearl Millet/Cumbu)", "Bengal Gram(Gram)(Whole)", "Mustard", "Wheat"],
            "Jaipur (F&V)": ["Banana", "Beetroot", "Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Cabbage", "Capsicum", "Cauliflower", "Cluster beans", "Colacasia", "Coriander(Leaves)", "Cucumbar(Kheera)", "Garlic", "Ginger(Green)", "Green Chilli", "Lemon", "Mango", "Mint(Pudina)", "Mousambi(Sweet Lime)", "Onion", "Papaya", "Pear(Marasebu)", "Pineapple", "Pointed gourd (Parval)", "Pomegranate", "Potato", "Pumpkin", "Ridgeguard(Tori)", "Spinach", "Tender Coconut", "Tinda", "Tomato"],
            "Jaipur (Grain)": ["Gur(Jaggery)", "Sugar"],
            "Jalore": ["Banana", "Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Cabbage", "Capsicum", "Coriander(Leaves)", "Cucumbar(Kheera)", "Ginger(Green)", "Green Chilli", "Lemon", "Onion Green", "Potato", "Tinda", "Tomato"],
            "Jhalarapatan": ["Corriander seed", "Lentil (Masur)(Whole)", "Methi Seeds", "Mustard", "Soyabean", "Wheat"],
            "Jodhpur (F&V)": ["Apple", "Coconut", "Garlic", "Mango", "Mousambi(Sweet Lime)", "Onion", "Papaya", "Pear(Marasebu)", "Pineapple", "Plum", "Pomegranate", "Potato"],
            "Jodhpur (Grain)": ["Garlic", "Taramira"],
            "Kawai Salpura (Atru)": ["Bengal Gram(Gram)(Whole)", "Corriander seed", "Maize", "Mustard", "Soyabean", "Wheat"],
            "Khatauli": ["Mustard"],
            "Khanpur": ["Bengal Gram(Gram)(Whole)", "Corriander seed", "Garlic", "Green Gram (Moong)(Whole)", "Linseed", "Soyabean", "Wheat"],
            "Kota (F&V)": ["Apple", "Banana", "Bhindi(Ladies Finger)", "Cabbage", "Cauliflower", "Cucumbar(Kheera)", "Garlic", "Ginger(Dry)", "Green Chilli", "Mango", "Mousambi(Sweet Lime)", "Papaya", "Pineapple", "Pomegranate", "Potato", "Pumpkin", "Tomato"],
            "Mandawari": ["Mustard", "Wheat"],
            "Nawalgarh": ["Onion"],
            "Pratapgarh": ["Ajwan", "Garlic", "Lentil (Masur)(Whole)", "Maize", "Mataki", "Mustard", "Onion", "Soyabean", "Wheat"],
            "Ramganjmandi": ["Bengal Gram(Gram)(Whole)", "Black Gram (Urd Beans)(Whole)", "Corriander seed", "Green Gram (Moong)(Whole)", "Lentil (Masur)(Whole)", "Maize", "Methi Seeds", "Mustard", "Soyabean", "Wheat"],
            "Raniwara": ["Castor Seed"],
            "Rawla": ["Guar", "Mustard"],
            "Rawatsar": ["Onion", "Potato", "Tomato"],
            "Sadulpur": ["Bajra(Pearl Millet/Cumbu)"],
            "Samraniyan": ["Green Gram (Moong)(Whole)", "Maize", "Peas(Dry)", "Soyabean", "Wheat"],
            "Sanchore": ["Onion"],
            "Sangriya": ["Bengal Gram(Gram)(Whole)", "Guar Seed(Cluster Beans Seed)", "Mustard", "Onion", "Potato", "Wheat"],
            "Sikri": ["Mustard"],
            "Sriganganagar (F&V)": ["Apple", "Banana", "Bhindi(Ladies Finger)", "Bitter gourd", "Brinjal", "Cabbage", "Capsicum", "Cauliflower", "Chikoos(Sapota)", "Cucumbar(Kheera)", "Garlic", "Ginger(Green)", "Green Chilli", "Green Peas", "Lime", "Mango", "Mousambi(Sweet Lime)", "Onion", "Papaya", "Pineapple", "Pomegranate", "Potato", "Pumpkin", "Sponge gourd", "Tinda", "Tomato"],
            "Surajgarh": ["Mustard"],
            "Suratgarh": ["Garlic", "Mustard", "Onion", "Potato", "Tomato"],
            "Udaipur (Grain)": ["Bajra(Pearl Millet/Cumbu)", "Chili Red", "Ghee", "Gur(Jaggery)", "Maize", "Soyabean", "Sugar", "Wheat"]
        },
        "Telangana": {
            "Aler": ["Arhar (Tur/Red Gram)(Whole)"],
            "Chevella": ["Brinjal", "Cabbage", "Cauliflower", "Green Chilli", "Tomato"],
            "Choppadandi": ["Paddy(Dhan)(Common)"],
            "Husnabad": ["Maize"],
            "Huzzurabad": ["Paddy(Dhan)(Common)"],
            "Jangaon": ["Maize"],
            "Kodad": ["Paddy(Dhan)(Common)"],
            "Kukatpally(Rythu Bazar)": ["Banana - Green", "Beetroot", "Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Cabbage", "Capsicum", "Carrot", "Cauliflower", "Cluster beans", "Colacasia", "Cucumbar(Kheera)", "Drumstick", "Field Pea", "French Beans (Frasbean)", "Green Chilli", "Leafy Vegetable", "Onion", "Potato", "Pumpkin", "Ridgeguard(Tori)", "Snakeguard", "Sweet Potato", "Tomato", "Yam (Ratalu)"],
            "Mehndipatnam(Rythu Bazar)": ["Banana - Green", "Beetroot", "Bhindi(Ladies Finger)", "Bitter gourd", "Bottle gourd", "Brinjal", "Cabbage", "Carrot", "Cauliflower", "Cluster beans", "Colacasia", "Cucumbar(Kheera)", "Drumstick", "Field Pea", "French Beans (Frasbean)", "Green Chilli", "Leafy Vegetable", "Onion", "Potato", "Ridgeguard(Tori)", "Tomato", "Yam (Ratalu)"],
            "Sattupalli": ["Paddy(Dhan)(Common)"],
            "Shadnagar": ["Bitter gourd", "Brinjal", "Cabbage", "Carrot", "Cluster beans", "Green Chilli", "Ridgeguard(Tori)", "Tomato"],
            "Thungathurthy": ["Paddy(Dhan)(Common)"],
            "Tirumalagiri": ["Paddy(Dhan)(Common)"],
            "Warangal": ["Beetroot", "Bhindi(Ladies Finger)", "Bitter gourd", "Brinjal", "Cabbage", "Capsicum", "Carrot", "Cauliflower", "Cluster beans", "Colacasia", "Cucumbar(Kheera)", "Field Pea", "French Beans (Frasbean)", "Green Chilli", "Potato", "Ridgeguard(Tori)", "Tomato"]
        },
        "Tripura": {
            "Barpathari": ["Bhindi(Ladies Finger)", "Bitter gourd", "Brinjal", "Cowpea(Veg)", "Cucumbar(Kheera)", "Ginger(Green)", "Green Chilli", "Kartali (Kantola)", "Onion", "Pointed gourd (Parval)", "Potato", "Rice", "Ridgeguard(Tori)", "Sweet Pumpkin", "Tomato"],
            "Boxonagar": ["Banana - Green", "Bhindi(Ladies Finger)", "Bitter gourd", "Brinjal", "Cock", "Cucumbar(Kheera)", "Fish", "Pointed gourd (Parval)", "Potato"],
            "Champaknagar": ["Bhindi(Ladies Finger)", "Bitter gourd", "Brinjal", "Cowpea(Veg)", "Cucumbar(Kheera)", "Green Chilli", "Kartali (Kantola)", "Pointed gourd (Parval)", "Potato", "Ridgeguard(Tori)", "Sweet Pumpkin", "Tomato"],
            "Dasda": ["Bhindi(Ladies Finger)", "Brinjal", "Onion", "Potato", "Rice"],
            "Kalyanpur": ["Bhindi(Ladies Finger)", "Brinjal", "Cucumbar(Kheera)", "Pointed gourd (Parval)", "Potato", "Ridgeguard(Tori)"],
            "Kamalghat": ["Bhindi(Ladies Finger)", "Bitter gourd", "Brinjal", "Cucumbar(Kheera)", "Green Chilli"],
            "Mohanpur": ["Bhindi(Ladies Finger)", "Bitter gourd", "Brinjal", "Cucumbar(Kheera)", "Green Chilli", "Ridgeguard(Tori)"],
            "Nutanbazar": ["Brinjal", "Potato", "Rice"],
            "Pabiacherra": ["Bhindi(Ladies Finger)", "Bitter gourd", "Brinjal", "Carrot", "Cowpea(Veg)", "Cucumbar(Kheera)", "Fish", "Onion", "Pointed gourd (Parval)", "Tomato"],
            "Panisagar": ["Brinjal", "Carrot", "Cowpea(Veg)", "Cucumbar(Kheera)", "Onion", "Potato", "Ridgeguard(Tori)", "Sweet Pumpkin"],
            "Sonamura": ["Bhindi(Ladies Finger)", "Bitter gourd", "Brinjal", "Cock", "Cucumbar(Kheera)", "Fish", "Ginger(Green)", "Green Chilli", "Pointed gourd (Parval)", "Potato", "Ridgeguard(Tori)", "Tomato"],
            "Teliamura": ["Banana", "Bhindi(Ladies Finger)", "Bitter gourd", "Brinjal", "Cowpea(Veg)", "Fish", "Garlic", "Ginger(Green)", "Green Chilli", "Kartali (Kantola)", "Onion", "Pigs", "Potato", "Rice", "Ridgeguard(Tori)", "Sweet Pumpkin", "Tomato"]
        },
        "West Bengal": {
            "Alipurduar": ["Bitter gourd", "Brinjal", "Green Chilli", "Onion", "Potato", "Tomato"],
            "Asansol": ["Arhar Dal(Tur Dal)", "Brinjal", "Green Gram Dal (Moong Dal)", "Masur Dal", "Mustard", "Mustard Oil", "Onion", "Peas(Dry)", "Potato", "Rice", "Sweet Pumpkin", "Tomato", "Wheat"],
            "Balurghat": ["Bitter gourd", "Brinjal", "Green Chilli", "Paddy(Dhan)(Common)", "Pointed gourd (Parval)", "Potato", "Rice", "Sweet Pumpkin"],
            "Bankura Sadar": ["Brinjal", "Masur Dal", "Mustard", "Onion", "Paddy(Dhan)(Common)", "Potato", "Rice", "Sweet Pumpkin"],
            "Barasat": ["Bitter gourd", "Brinjal", "Green Chilli", "Onion", "Potato", "Pumpkin", "Tomato"],
            "Bara Bazar (Posta Bazar)": ["Garlic", "Ginger(Dry)", "Onion", "Potato"],
            "Baruipur(Canning)": ["Bitter gourd", "Brinjal", "Cucumbar(Kheera)", "Green Chilli", "Guava", "Onion", "Rice"],
            "Baxirhat": ["Brinjal", "Green Chilli", "Pointed gourd (Parval)", "Potato"],
            "Beldanga": ["Jute", "Mustard", "Potato", "Rice"],
            "Bethuadahari": ["Green Chilli", "Jute", "Potato", "Rice", "Ridgeguard(Tori)"],
            "Birbhum": ["Brinjal", "Green Chilli", "Mustard Oil", "Onion", "Paddy(Dhan)(Common)", "Potato", "Rice", "Tomato"],
            "Bishnupur(Bankura)": ["Bottle gourd", "Brinjal", "Mustard", "Onion", "Potato", "Rice", "Wheat"],
            "Bolpur": ["Brinjal", "Ginger(Dry)", "Green Chilli", "Onion", "Paddy(Dhan)(Common)", "Potato", "Rice", "Tomato", "Wheat"],
            "Burdwan": ["Cucumbar(Kheera)", "Green Chilli", "Gur(Jaggery)", "Onion", "Potato", "Rice", "Sweet Pumpkin", "Tomato"],
            "Chakdah": ["Green Chilli", "Masur Dal", "Onion", "Potato", "Sweet Pumpkin"],
            "Diamond Harbour(South 24-pgs)": ["Brinjal", "Cucumbar(Kheera)", "Fish", "Green Chilli", "Onion", "Potato", "Rice", "Tomato"],
            "Dinhata": ["Brinjal", "Jute", "Potato", "Rice"],
            "Dhupguri": ["Bitter gourd", "Brinjal", "Cucumbar(Kheera)", "Green Chilli", "Onion", "Pointed gourd (Parval)", "Potato"],
            "Durgapur": ["Brinjal", "Cabbage", "Masur Dal", "Mustard", "Mustard Oil", "Onion", "Potato", "Rice", "Tomato", "Wheat"],
            "Egra/contai": ["Bhindi(Ladies Finger)", "Bitter gourd", "Brinjal", "Green Chilli", "Onion", "Potato", "Rice", "Sweet Pumpkin", "Tomato"],
            "English Bazar": ["Green Gram Dal (Moong Dal)", "Lentil (Masur)(Whole)", "Onion", "Potato", "Rice"],
            "Gangarampur(Dakshin Dinajpur)": ["Bhindi(Ladies Finger)", "Bitter gourd", "Brinjal", "Carrot", "Cucumbar(Kheera)", "Green Chilli", "Onion", "Pointed gourd (Parval)", "Potato", "Raddish", "Ridgeguard(Tori)", "Squash(Chappal Kadoo)", "Sweet Pumpkin", "Tomato"],
            "Garbeta(Medinipur)": ["Brinjal", "Green Chilli", "Onion", "Pointed gourd (Parval)", "Potato", "Rice", "Sweet Pumpkin", "Tomato"],
            "Guskara": ["Brinjal", "Mustard", "Paddy(Dhan)(Common)", "Potato", "Rice", "Sesamum(Sesame,Gingelly,Til)"],
            "Habra": ["Bhindi(Ladies Finger)", "Bitter gourd", "Brinjal", "Green Chilli", "Onion", "Papaya (Raw)", "Potato", "Pumpkin", "Tomato"],
            "Haldibari": ["Bitter gourd", "Brinjal", "Green Chilli", "Pointed gourd (Parval)", "Potato"],
            "Indus(Bankura Sadar)": ["Brinjal", "Green Chilli", "Mustard", "Paddy(Dhan)(Common)", "Potato", "Rice", "Sweet Pumpkin"],
            "Islampur": ["Jute", "Potato", "Rice"],
            "Jalpaiguri Sadar": ["Bitter gourd", "Brinjal", "Green Chilli", "Onion", "Pointed gourd (Parval)", "Potato", "Red"],
            "Jangipur": ["Jute", "Onion", "Paddy(Dhan)(Common)", "Potato", "Rice", "Turmeric"],
            "Jhargram": ["Brinjal", "Fish", "Mustard Oil", "Potato", "Rice"],
            "Kalyani": ["Brinjal", "Cabbage", "Green Chilli", "Onion", "Potato", "Rice", "Sweet Pumpkin"],
            "Kandi": ["Mustard", "Paddy(Dhan)(Common)", "Potato", "Rice", "Wheat"],
            "Karimpur": ["Brinjal", "Green Chilli", "Jute", "Mustard", "Onion", "Potato", "Rice", "Wheat"],
            "Karsiyang(Matigara)": ["Cabbage", "Carrot", "French Beans (Frasbean)", "Onion", "Potato", "Squash(Chappal Kadoo)", "Tomato"],
            "Kasimbazar": ["Jute", "Rice"],
            "Katwa": ["Ginger(Dry)", "Jute", "Mustard", "Mustard Oil", "Onion", "Paddy(Dhan)(Common)", "Potato", "Rice", "Sesamum(Sesame,Gingelly,Til)"],
            "Kalna": ["Brinjal", "Cucumbar(Kheera)", "Green Chilli", "Jute", "Onion", "Potato", "Rice", "Sweet Pumpkin", "Tomato"],
            "Khatra": ["Bottle gourd", "Brinjal", "Cucumbar(Kheera)", "Mustard", "Paddy(Dhan)(Common)", "Potato", "Rice", "Sweet Pumpkin", "Tomato", "Wheat"],
            "Kolaghat": ["Marigold(loose)", "Potato", "Rice", "Rose(Local)", "Tube Rose(Loose)"],
            "Lalbagh": ["Green Chilli", "Jute", "Rice"],
            "Mathabhanga": ["Bitter gourd", "Brinjal", "Green Chilli", "Pointed gourd (Parval)", "Potato"],
            "Mechua": ["Apple", "Mango", "Mousambi(Sweet Lime)", "Pomegranate"],
            "Medinipur(West)": ["Bhindi(Ladies Finger)", "Bitter gourd", "Brinjal", "Garlic", "Green Chilli", "Onion", "Pointed gourd (Parval)", "Potato", "Ridgeguard(Tori)", "Sweet Pumpkin", "Tomato"],
            "Memari": ["Bitter gourd", "Cucumbar(Kheera)", "Green Chilli", "Potato", "Rice", "Sweet Pumpkin", "Tomato"],
            "Nadia": ["Bhindi(Ladies Finger)", "Bitter gourd", "Brinjal", "Green Chilli", "Jute", "Mustard", "Onion", "Potato", "Rice", "Ridgeguard(Tori)", "Sweet Pumpkin"],
            "Pandua": ["Bhindi(Ladies Finger)", "Bitter gourd", "Brinjal", "Onion", "Potato", "Rice", "Tomato"],
            "Purulia": ["Brinjal", "Gur(Jaggery)", "Masur Dal", "Moath Dal", "Mustard Oil", "Onion", "Potato", "Pumpkin", "Rice"],
            "Raiganj": ["Jute", "Wheat"],
            "Ramkrishanpur(Howrah)": ["Arhar Dal(Tur Dal)", "Bengal Gram Dal (Chana Dal)", "Bhindi(Ladies Finger)", "Brinjal", "Green Chilli", "Green Gram Dal (Moong Dal)", "Masur Dal", "Onion", "Potato", "Rice", "Tomato"],
            "Rampurhat": ["Mustard", "Onion", "Paddy(Dhan)(Common)", "Potato", "Rice", "Wheat"],
            "Ranaghat": ["Brinjal", "Cabbage", "Green Chilli", "Onion", "Potato", "Pumpkin", "Rice", "Tomato"],
            "Sainthia": ["Arhar Dal(Tur Dal)", "Brinjal", "Green Chilli", "Mustard Oil", "Onion", "Potato", "Rice", "Tomato", "Wheat"],
            "Samsi": ["Onion", "Potato", "Rice"],
            "Sealdah Koley Market": ["Bhindi(Ladies Finger)", "Bitter gourd", "Brinjal", "Cabbage", "Capsicum", "Carrot", "Cucumbar(Kheera)", "Green Chilli", "Pointed gourd (Parval)", "Ridgeguard(Tori)", "Sweet Pumpkin", "Tomato"],
            "Sheoraphuly": ["Bhindi(Ladies Finger)", "Bitter gourd", "Brinjal", "Cucumbar(Kheera)", "Garlic", "Ginger(Dry)", "Green Chilli", "Onion", "Pointed gourd (Parval)", "Potato", "Rice", "Ridgeguard(Tori)", "Tomato"],
            "Siliguri": ["Arhar Dal(Tur Dal)", "Banana", "Black Gram Dal (Urd Dal)", "Ginger(Green)", "Green Chilli", "Green Gram Dal (Moong Dal)", "Masur Dal", "Onion", "Potato", "Rice", "Squash(Chappal Kadoo)", "Tomato"],
            "Tamluk (Medinipur E)": ["Betal Leaves", "Bitter gourd", "Brinjal", "Cabbage", "Onion", "Potato", "Rice", "Sweet Pumpkin"],
            "Uluberia": ["Bhindi(Ladies Finger)", "Brinjal", "Green Chilli", "Onion", "Pointed gourd (Parval)", "Potato", "Rice", "Ridgeguard(Tori)", "Tomato"]
        }
    };
    

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

    // --- POPULATE INITIAL STATE DROPDOWN ---
    const states = Object.keys(marketData).sort();
    states.forEach(state => {
        const option = document.createElement('option');
        option.value = state;
        option.textContent = state;
        stateSelect.appendChild(option);
    });

    // --- DYNAMICALLY UPDATE MARKETS BASED ON STATE ---
    stateSelect.addEventListener('change', () => {
        const selectedState = stateSelect.value;
        
        // Reset and disable market & crop selects
        marketSelect.innerHTML = '<option value="">Select State First</option>';
        marketSelect.disabled = true;
        cropSelect.innerHTML = '<option value="">Select Market First</option>';
        cropSelect.disabled = true;
        
        if (selectedState) {
            marketSelect.innerHTML = '<option value="">Select Market</option>';
            marketSelect.disabled = false;
            const markets = Object.keys(marketData[selectedState]).sort();
            markets.forEach(market => {
                const option = document.createElement('option');
                option.value = market;
                option.textContent = market;
                marketSelect.appendChild(option);
            });
        }
    });

    // --- DYNAMICALLY UPDATE CROPS BASED ON MARKET ---
    marketSelect.addEventListener('change', () => {
        const selectedState = stateSelect.value;
        const selectedMarket = marketSelect.value;

        // Reset and disable crop select
        cropSelect.innerHTML = '<option value="">Select Market First</option>';
        cropSelect.disabled = true;

        if (selectedState && selectedMarket) {
            cropSelect.innerHTML = '<option value="">Select Crop</option>';
            cropSelect.disabled = false;
            const crops = marketData[selectedState][selectedMarket].sort();
            crops.forEach(crop => {
                const option = document.createElement('option');
                option.value = crop;
                option.textContent = crop;
                cropSelect.appendChild(option);
            });
        }
    });


    // --- HANDLE FORM SUBMISSION FOR ANALYSIS (NOW DYNAMIC) ---
    priceForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const cropName = cropSelect.value;
        const stateName = stateSelect.value;
        const marketName = marketSelect.value;

        if (!cropName || !stateName || !marketName) {
            alert('Please select a State, Market, and Crop to analyze.');
            return;
        }

        analysisResultsContainer.classList.add('hidden');
        priceTableContainer.classList.add('hidden');
        statusIndicator.classList.remove('hidden');
        statusIndicator.scrollIntoView({ behavior: 'smooth', block: 'center' });

        try {
            // --- MERGED CHANGE: Get selected language ---
            const lang = localStorage.getItem('project-kisan-lang') || 'en';
            
            const apiUrl = 'https://asia-south1-project-kisan-new.cloudfunctions.net/getMarketAnalysis';
            // --- MERGED CHANGE: Add language to API call ---
            const requestUrl = `${apiUrl}?cropName=${encodeURIComponent(cropName)}&stateName=${encodeURIComponent(stateName)}&marketName=${encodeURIComponent(marketName)}&language=${lang}`;

            console.log("🚀 [DEBUG] Fetching market analysis from:", requestUrl);
            const response = await fetch(requestUrl);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API Error ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            console.log("✅ [DEBUG] Successfully received and parsed data:", data);

            statusIndicator.classList.add('hidden');
            displayMarketAnalysis(data);
            analysisResultsContainer.classList.remove('hidden');

            if (data.chart_data && data.chart_data.length > 0) {
                const tableData = data.chart_data.map(item => ({
                    commodity: data.crop_name,
                    minPrice: item.price_min || 'N/A',
                    maxPrice: item.price_max || 'N/A',
                    avgPrice: item.price_modal || 'N/A',
                    date: item.date
                }));
                historyTableTitle.textContent = data.crop_name;
                displayPriceTable(tableData);
                priceTableContainer.classList.remove('hidden');
            }
            analysisResultsContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } catch (error) {
            console.error("❌ [CRITICAL ERROR] Failed to fetch market analysis:", error);
            statusIndicator.classList.add('hidden');
            alert(`An error occurred while fetching data. Please try again. \nDetails: ${error.message}`);
        }
    });

    // --- YOUR ORIGINAL DISPLAY FUNCTIONS (PRESERVED) ---
    function displayMarketAnalysis(data) {
        const lang = localStorage.getItem('project-kisan-lang') || 'en';

        // --- Title ---
        // Get the translated title "template" from your translations object
        let titleTemplate = translations[lang]?.analysisTitle || translations.en.analysisTitle;
        // Replace placeholders with the (already translated) data from the AI
        const finalTitle = titleTemplate
            .replace('{crop}', data.crop_name)
            .replace('{market}', data.market_name)
            .replace('{state}', data.state_name);
        document.getElementById('res-title').textContent = finalTitle;

        // --- Date ---
        let dateTemplate = translations[lang]?.dateLabel || translations.en.dateLabel;
        const finalDate = dateTemplate.replace('{date}', data.analysis_date || 'N/A');
        document.getElementById('res-analysis-date').textContent = finalDate;

        // --- Price ---
        let priceTemplate = translations[lang]?.priceLabel || translations.en.priceLabel;
        const finalPrice = priceTemplate.replace('{price}', data.current_price_inr || 'N/A');
        document.getElementById('res-price').textContent = finalPrice;

        // --- Trend, Status, and Outlook (These are simple text replacements) ---
        document.getElementById('res-trend').textContent = data.price_trend_description || (translations[lang]?.noTrendData || translations.en.noTrendData);
        document.getElementById('res-comparison').textContent = data.buy_sell_hold_recommendation || (translations[lang]?.noComparisonData || translations.en.noComparisonData);
        document.getElementById('res-outlook').textContent = data.price_outlook_short_term || (translations[lang]?.noOutlookData || translations.en.noOutlookData);

        const adviceContainer = document.getElementById('res-advice');
        const adviceText = data.farmer_opinion_and_advice;

        if (adviceText && adviceText.trim() !== '') {
            // Split the text by the asterisk, filter out empty strings, and map to list items
            const advicePoints = adviceText.split('*')
                .map(point => point.trim())
                .filter(point => point.length > 0);
            
            // Create a <ul> element and populate it
            adviceContainer.innerHTML = '<ul>' + advicePoints.map(point => `<li>${point}</li>`).join('') + '</ul>';
        } else {
            adviceContainer.innerHTML = '<p>No specific advice available.</p>';
        }

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
        priceTableBody.innerHTML = '';
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