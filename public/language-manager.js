document.addEventListener('DOMContentLoaded', () => {
    const languageToggleBtn = document.getElementById('language-toggle-btn');
    if (!languageToggleBtn) return; // Exit if the button is not on the page

    const languageOptions = document.getElementById('language-options');
    const currentLangText = document.getElementById('current-lang-text');

    // 1. Expanded Translation Dictionary for ALL pages
    const translations = {
        en: {
            // --- Global (Header/Footer) ---
            'nav-home': 'Home', 'nav-market': 'Market Prices', 'nav-guardian': 'Guardian AI', 'nav-login': 'Login', 'nav-get-app': 'Get App', 'footer-team-title': 'Our Team: Algo Agni',

            // --- Home Page (index.html) ---
            'home-nav-ai-tool': 'AI Tool', 'home-nav-features': 'Features',
            'hero-title': 'AI-Powered Guidance For Your Farm',
            'hero-subtitle': 'From diagnosis to remedy, get instant, intelligent support to protect your crops and increase your yield.',
            'hero-cta-diagnose': 'Diagnose Your Crop', 'hero-cta-learn-more': 'Learn More',
            'action-panel-title': 'Your AI Farming Assistant',
            'action-panel-subtitle': 'Upload a photo for diagnosis, or ask a question in your language.',
            'ask-question-btn-text': 'Ask a Question', 'diagnose-crop-btn-text': 'Diagnose Crop',
            'features-title': 'A Complete Toolkit for the Modern Farmer',
            'features-subtitle': 'Beyond diagnostics, Project Kisan offers a suite of tools to manage and grow your farming business.',
            'feature-market-prices': 'Market Prices', 'feature-fertilizer-calculator': 'Fertilizer Calculator',
            'feature-yield-maximizer': 'Yield Maximizer', 'feature-crop-planner': 'Crop Planner',
            'feature-govt-schemes': 'Govt. Schemes', 'feature-guardian-ai': 'Guardian AI',
            'empowering-title': 'Empowering Farmers With <span class="underline">Technology</span>',
            'empowering-diag-title': 'Accurate Diagnosis', 'empowering-diag-text': 'Our AI is trained on millions of images to provide a precise identification of crop diseases and pests.',
            'empowering-remedy-title': 'Instant Remedies', 'empowering-remedy-text': 'Receive immediate, actionable advice with both organic and chemical treatment options.',
            'empowering-easy-title': 'Easy to Use', 'empowering-easy-text': 'No complex setup. Just upload a photo from your phone to get the help you need, when you need it.',
            'process-title': 'We Take Complete Control of the Analysis',
            'process-subtitle': 'Project Kisan connects your crop photo directly to our powerful AI analysis engine. Each step is captured and monitored by our tech to give you the most accurate results. Our integrated service includes:',
            'process-step-1': 'Upload', 'process-step-2': 'AI Analysis', 'process-step-3': 'Identification', 'process-step-4': 'Remedy', 'process-step-5': 'Audio Summary',

            // --- Assistant Page (assistant.html) ---
            'assistant-placeholder': 'Ask about crop diseases, soil preparation, market prices...',

            // --- Crop Planner Page (cropplanner.html) ---
            'planner-title': 'AI Crop Planner',
            'planner-subtitle': 'Get intelligent crop recommendations based on your unique farming conditions.',
            'planner-label-location': 'Location', 'planner-placeholder-location': 'Search & Select your State...',
            'planner-label-water': 'Water Access', 'planner-select-water': 'Select Water Availability',
            'planner-label-land': 'Land Size (in acres)', 'planner-label-budget': 'Budget (in ₹)',
            'planner-button': 'Prepare Plan',

             // --- Fertilizer Page (fertilizer.html) ---
            'fert-title': 'Fertilizer Calculator',
            'fert-label-crop': 'See relevant information on', 'fert-button-crop': 'Select a Crop',
            'fert-card1-title': 'Nutrient quantities', 'fert-card1-subtitle': "Based on your field size and crop, we've selected a nutrient ratio for you.",
            'fert-card2-plot-title': 'Unit & Plot size', 'fert-card2-plot-subtitle': 'Sizes smaller than one unit are expressed as 0.',
            'fert-card2-tree-title': 'Number of trees', 'fert-card2-tree-subtitle': 'Enter the total number of trees in your orchard.',
            'fert-button-calculate': 'Calculate',
            'fert-results-title': 'Choose your fertilizer combination', 'fert-results-subtitle': 'Recommended amount for one season based on your inputs.',

            // --- Guardian AI Page (guardian.html) ---
            'guardian-weather-title': "Today's Weather Outlook", 'guardian-weather-location': 'Based on your location:',
            'guardian-temp': 'Temperature', 'guardian-humidity': 'Humidity', 'guardian-rain': 'Chance of Rain', 'guardian-wind': 'Wind Speed',
            'guardian-engine-title': 'Your Proactive Guardian Engine', 'guardian-engine-subtitle': 'Our Guardian AI uses your crop, sowing date, and local weather helping you prevent threats before they happen.',
            'guardian-label-crop': 'Select Your Crop', 'guardian-label-sowing': 'Sowing Date', 'guardian-label-location': 'Your Location (State/UT)',
            'guardian-placeholder-location': 'Click to select a State/UT', 'guardian-button-activate': 'Activate Proactive Guardian',
            'guardian-threat-title': 'Threat Assessment', 'guardian-threat-primary': 'Primary Threat', 'guardian-threat-risk': 'Risk Level',
            'guardian-library-title': 'Proactive Disease & Pest Library', 'guardian-library-crop-label': 'See information for:',

            // --- Market Page (market.html) ---
            'market-title': "Find Your Crop's Value",
            'market-subtitle': "Select your crop and market to get a detailed price analysis and recent price history.",
            'market-label-state': 'State', 'market-label-market': 'Market', 'market-label-crop': 'Crop',
            'market-button-analyze': 'Analyze Market Price',
            'market-table-title': 'Recent Mandi Prices for',
            'th-commodity': 'Commodity', 'th-min-price': 'Min Price', 'th-max-price': 'Max Price', 'th-avg-price': 'Avg Price', 'th-date': 'Date',

            // --- Schemes Page (schemes.html) ---
            'schemes-title': 'AI Scheme Assistant', 'schemes-subtitle': 'Ask about government schemes for farmers in your area.',
            'schemes-label-location': 'First, please select your state', 'schemes-placeholder-location': 'Search & Select your State...',
            'schemes-placeholder-chat': 'Ask about schemes for irrigation, seeds, loans...',

            // --- Login/Signup Pages ---
            'login-title': 'Login to Your Account', 'login-subtitle': 'Welcome back! Access your personalized dashboard and tools.',
            'label-email': 'Email Address', 'label-password': 'Password', 'button-login': 'Login',
            'login-signup-prompt': "Don't have an account?", 'login-signup-link': 'Sign Up',
            'signup-title': 'Create Your Account', 'signup-subtitle': 'Join our community to unlock powerful farming tools.',
            'label-fname': 'First Name', 'label-lname': 'Last Name', 'label-mobile': 'Mobile Number',
            'button-create': 'Create Account', 'signup-login-prompt': 'Already have an account?', 'signup-login-link': 'Login',
             // --- Yield Maximizer Page (yield.html) ---
            'yield-title': 'Yield Maximizer Plan',
            'yield-subtitle': 'Enter your crop details to generate a customized 14-week growth and protection plan.',
            'yield-label-crop': 'Your Crop', 'yield-label-variety': 'Variety', 'yield-label-sowing': 'Sowing Date', 'yield-label-location': 'Your Location',
            'yield-button-generate': 'Generate Plan',
            'yield-master-plan-title': 'Your Weekly Master Plan', 'yield-master-plan-subtitle': "A strategic overview for your crop's entire lifecycle, from seed to harvest.",
            'yield-daily-tasks-title': 'Recommended Daily Tasks', 'yield-daily-tasks-subtitle': "Simple, actionable steps to take every day to ensure your plan's success.",

        },
        hi: {
            'nav-home': 'होम', 'nav-market': 'बाजार मूल्य', 'nav-guardian': 'गार्जियन एआई', 'nav-login': 'लॉगिन', 'nav-get-app': 'ऐप पाएं', 'footer-team-title': 'हमारी टीम: एल्गो अग्नि',
            'home-nav-ai-tool': 'एआई टूल', 'home-nav-features': 'विशेषताएँ',
            'hero-title': 'आपके खेत के लिए एआई-संचालित मार्गदर्शन',
            'hero-subtitle': 'रोग निदान से लेकर उपचार तक, अपनी फसलों की रक्षा करने और अपनी उपज बढ़ाने के लिए तुरंत, बुद्धिमान समर्थन प्राप्त करें।',
            'hero-cta-diagnose': 'अपनी फसल का निदान करें', 'hero-cta-learn-more': 'और जानें',
            'action-panel-title': 'आपका एआई खेती सहायक',
            'action-panel-subtitle': 'निदान के लिए एक फोटो अपलोड करें, या अपनी भाषा में एक प्रश्न पूछें।',
            'ask-question-btn-text': 'प्रश्न पूछें', 'diagnose-crop-btn-text': 'फसल का निदान',
            'features-title': 'आधुनिक किसान के लिए एक संपूर्ण टूलकिट',
            'features-subtitle': 'निदान से परे, प्रोजेक्ट किसान आपके खेती व्यवसाय को प्रबंधित करने और विकसित करने के लिए उपकरणों का एक सूट प्रदान करता है।',
            'feature-market-prices': 'बाजार मूल्य', 'feature-fertilizer-calculator': 'उर्वरक कैलकुलेटर',
            'feature-yield-maximizer': 'उपज मैक्सिमाइज़र', 'feature-crop-planner': 'फसल योजनाकार',
            'feature-govt-schemes': 'सरकारी योजनाएं', 'feature-guardian-ai': 'गार्जियन एआई',
            'empowering-title': '<span class="underline">प्रौद्योगिकी</span> के साथ किसानों को सशक्त बनाना',
            'empowering-diag-title': 'सटीक निदान', 'empowering-diag-text': 'हमारा एआई फसल रोगों और कीटों की सटीक पहचान प्रदान करने के लिए लाखों छवियों पर प्रशिक्षित है।',
            'empowering-remedy-title': 'तुरंत उपचार', 'empowering-remedy-text': 'जैविक और रासायनिक दोनों उपचार विकल्पों के साथ तत्काल, कार्रवाई योग्य सलाह प्राप्त करें।',
            'empowering-easy-title': 'प्रयोग करने में आसान', 'empowering-easy-text': 'कोई जटिल सेटअप नहीं। बस अपने फोन से एक फोटो अपलोड करें ताकि आपको जरूरत पड़ने पर मदद मिल सके।',
            'process-title': 'हम विश्लेषण का पूरा नियंत्रण लेते हैं',
            'process-subtitle': 'प्रोजेक्ट किसान आपके फसल के फोटो को सीधे हमारे शक्तिशाली एआई विश्लेषण इंजन से जोड़ता है। आपको सबसे सटीक परिणाम देने के लिए प्रत्येक चरण को हमारी तकनीक द्वारा कैप्चर और मॉनिटर किया जाता है। हमारी एकीकृत सेवा में शामिल हैं:',
            'process-step-1': 'अपलोड', 'process-step-2': 'एआई विश्लेषण', 'process-step-3': 'पहचान', 'process-step-4': 'उपचार', 'process-step-5': 'ऑडियो सारांश',
            'assistant-placeholder': 'फसल रोग, मिट्टी की तैयारी, बाजार मूल्य के बारे में पूछें...',
            'planner-title': 'एआई फसल योजनाकार', 'planner-subtitle': 'अपनी अनूठी खेती की स्थितियों के आधार पर बुद्धिमान फसल सिफारिशें प्राप्त करें।',
            'planner-label-location': 'स्थान', 'planner-placeholder-location': 'अपना राज्य खोजें और चुनें...',
            'planner-label-water': 'पानी की उपलब्धता', 'planner-select-water': 'पानी की उपलब्धता चुनें',
            'planner-label-land': 'भूमि का आकार (एकड़ में)', 'planner-label-budget': 'बजट (₹ में)', 'planner-button': 'योजना तैयार करें',
            'fert-title': 'उर्वरक कैलकुलेटर', 'fert-label-crop': 'इस पर प्रासंगिक जानकारी देखें', 'fert-button-crop': 'एक फसल चुनें',
            'fert-card1-title': 'पोषक तत्वों की मात्रा', 'fert-card1-subtitle': 'आपके खेत के आकार और फसल के आधार पर, हमने आपके लिए एक पोषक तत्व अनुपात चुना है।',
            'fert-card2-plot-title': 'इकाई और भूखंड का आकार', 'fert-card2-plot-subtitle': 'एक इकाई से छोटे आकार 0 के रूप में व्यक्त किए जाते हैं।',
            'fert-card2-tree-title': 'पेड़ों की संख्या', 'fert-card2-tree-subtitle': 'अपने बाग में पेड़ों की कुल संख्या दर्ज करें।',
            'fert-button-calculate': 'गणना करें', 'fert-results-title': 'अपना उर्वरक संयोजन चुनें', 'fert-results-subtitle': 'आपके इनपुट के आधार पर एक मौसम के लिए अनुशंसित राशि।',
            'guardian-weather-title': 'आज का मौसम पूर्वानुमान', 'guardian-weather-location': 'आपके स्थान के आधार पर:',
            'guardian-temp': 'तापमान', 'guardian-humidity': 'आर्द्रता', 'guardian-rain': 'बारिश की संभावना', 'guardian-wind': 'हवा की गति',
            'guardian-engine-title': 'आपका सक्रिय गार्जियन इंजन', 'guardian-engine-subtitle': 'हमारा गार्जियन एआई आपकी फसल, बुवाई की तारीख और स्थानीय मौसम का उपयोग करके खतरों को होने से पहले रोकने में आपकी मदद करता है।',
            'guardian-label-crop': 'अपनी फसल चुनें', 'guardian-label-sowing': 'बुवाई की तारीख', 'guardian-label-location': 'आपका स्थान (राज्य/केंद्र शासित प्रदेश)',
            'guardian-placeholder-location': 'एक राज्य/केंद्र शासित प्रदेश चुनने के लिए क्लिक करें', 'guardian-button-activate': 'सक्रिय गार्जियन को सक्रिय करें',
            'guardian-threat-title': 'खतरे का आकलन', 'guardian-threat-primary': 'प्राथमिक खतरा', 'guardian-threat-risk': 'जोखिम स्तर',
            'guardian-library-title': 'सक्रिय रोग और कीट पुस्तकालय', 'guardian-library-crop-label': 'इसके लिए जानकारी देखें:',
            'market-title': 'अपनी फसल का मूल्य जानें', 'market-subtitle': 'विस्तृत मूल्य विश्लेषण और हालिया मूल्य इतिहास प्राप्त करने के लिए अपनी फसल और बाजार का चयन करें।',
            'market-label-state': 'राज्य', 'market-label-market': 'बाजार', 'market-label-crop': 'फसल',
            'market-button-analyze': 'बाजार मूल्य का विश्लेषण करें', 'market-table-title': 'के लिए हाल के मंडी मूल्य',
            'th-commodity': 'वस्तु', 'th-min-price': 'न्यूनतम मूल्य', 'th-max-price': 'अधिकतम मूल्य', 'th-avg-price': 'औसत मूल्य', 'th-date': 'तारीख',
            'schemes-title': 'एआई योजना सहायक', 'schemes-subtitle': 'अपने क्षेत्र में किसानों के लिए सरकारी योजनाओं के बारे में पूछें।',
            'schemes-label-location': 'सबसे पहले, कृपया अपना राज्य चुनें', 'schemes-placeholder-location': 'अपना राज्य खोजें और चुनें...',
            'schemes-placeholder-chat': 'सिंचाई, बीज, ऋण के लिए योजनाओं के बारे में पूछें...',
            'login-title': 'अपने खाते में પ્રવેશ करें', 'login-subtitle': 'वापसी पर स्वागत है! अपने व्यक्तिगत डैशबोर्ड और उपकरणों तक पहुंचें।',
            'label-email': 'ईमेल पता', 'label-password': 'पासवर्ड', 'button-login': 'लॉगिन',
            'login-signup-prompt': 'खाता नहीं है?', 'login-signup-link': 'साइन अप करें',
            'signup-title': 'अपना खाता बनाएं', 'signup-subtitle': 'शक्तिशाली खेती उपकरणों को अनलॉक करने के लिए हमारे समुदाय में शामिल हों।',
            'label-fname': 'पहला नाम', 'label-lname': 'अंतिम नाम', 'label-mobile': 'मोबाइल नंबर',
            'button-create': 'खाता बनाएं', 'signup-login-prompt': 'पहले से ही एक खाता है?', 'signup-login-link': 'लॉगिन',
            'yield-title': 'उपज मैक्सिमाइज़र योजना', 'yield-subtitle': 'एक अनुकूलित 14-सप्ताह की वृद्धि और सुरक्षा योजना बनाने के लिए अपनी फसल का विवरण दर्ज करें।',
            'yield-label-crop': 'आपकी फसल', 'yield-label-variety': 'किस्म', 'yield-label-sowing': 'बुवाई की तारीख', 'yield-label-location': 'आपका स्थान',
            'yield-button-generate': 'योजना बनाएं', 'yield-master-plan-title': 'आपकी साप्ताहिक मास्टर योजना', 'yield-master-plan-subtitle': 'बीज से फसल तक, आपकी फसल के पूरे जीवनचक्र के लिए एक रणनीतिक अवलोकन।',
            'yield-daily-tasks-title': 'अनुशंसित दैनिक कार्य', 'yield-daily-tasks-subtitle': 'आपकी योजना की सफलता सुनिश्चित करने के लिए हर दिन उठाए जाने वाले सरल, कार्रवाई योग्य कदम।',
        },
        kn: {
            'nav-home': 'ಮುಖಪುಟ', 'nav-market': 'ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು', 'nav-guardian': 'ಗಾರ್ಡಿಯನ್ ಎಐ', 'nav-login': 'ಲಾಗಿನ್', 'nav-get-app': 'ಆಪ್ ಪಡೆಯಿರಿ', 'footer-team-title': 'ನಮ್ಮ ತಂಡ: ಅಲ್ಗೋ ಅಗ್ನಿ',
            'home-nav-ai-tool': 'ಎಐ ಸಾಧನ', 'home-nav-features': 'ವೈಶಿಷ್ಟ್ಯಗಳು',
            'hero-title': 'ನಿಮ್ಮ ಫಾರ್ಮ್‌ಗೆ ಎಐ-ಚಾಲಿತ ಮಾರ್ಗದರ್ಶನ',
            'hero-subtitle': 'ರೋಗನಿರ್ಣಯದಿಂದ ಪರಿಹಾರದವರೆಗೆ, ನಿಮ್ಮ ಬೆಳೆಗಳನ್ನು ರಕ್ಷಿಸಲು ಮತ್ತು ನಿಮ್ಮ ಇಳುವರಿಯನ್ನು ಹೆಚ್ಚಿಸಲು ತ್ವರಿತ, ಬುದ್ಧಿವಂತ ಬೆಂಬಲವನ್ನು ಪಡೆಯಿರಿ.',
            'hero-cta-diagnose': 'ನಿಮ್ಮ ಬೆಳೆಯನ್ನು ಪರೀಕ್ಷಿಸಿ', 'hero-cta-learn-more': 'ಇನ್ನಷ್ಟು ತಿಳಿಯಿರಿ',
            'action-panel-title': 'ನಿಮ್ಮ ಎಐ ಕೃಷಿ ಸಹಾಯಕ',
            'action-panel-subtitle': 'ರೋಗನಿರ್ಣಯಕ್ಕಾಗಿ ಫೋಟೋವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ, ಅಥವಾ ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಪ್ರಶ್ನೆಯನ್ನು ಕೇಳಿ.',
            'ask-question-btn-text': 'ಪ್ರಶ್ನೆ ಕೇಳಿ', 'diagnose-crop-btn-text': 'ಬೆಳೆ ಪರೀಕ್ಷೆ',
            'features-title': 'ಆಧುನಿಕ ರೈತರಿಗಾಗಿ ಸಂಪೂರ್ಣ ಟೂಲ್‌ಕಿಟ್',
            'features-subtitle': 'ರೋಗನಿರ್ಣಯವನ್ನು ಮೀರಿ, ಪ್ರಾಜೆಕ್ಟ್ ಕಿಸಾನ್ ನಿಮ್ಮ ಕೃಷಿ ವ್ಯವಹಾರವನ್ನು ನಿರ್ವಹಿಸಲು ಮತ್ತು ಬೆಳೆಸಲು ಉಪಕರಣಗಳ ಸೂಟ್ ಅನ್ನು ನೀಡುತ್ತದೆ.',
            'feature-market-prices': 'ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು', 'feature-fertilizer-calculator': 'ಗೊಬ್ಬರ ಕ್ಯಾಲ್ಕುಲೇಟರ್',
            'feature-yield-maximizer': 'ಇಳುವರಿ ಗರಿಷ್ಠಗೊಳಿಸುವಿಕೆ', 'feature-crop-planner': 'ಬೆಳೆ ಯೋಜಕ',
            'feature-govt-schemes': 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು', 'feature-guardian-ai': 'ಗಾರ್ಡಿಯನ್ ಎಐ',
            'empowering-title': '<span class="underline">ತಂತ್ರಜ್ಞಾನ</span>ದೊಂದಿಗೆ ರೈತರನ್ನು ಸಬಲೀಕರಣಗೊಳಿಸುವುದು',
            'empowering-diag-title': 'ನಿಖರವಾದ ರೋಗನಿರ್ಣಯ', 'empowering-diag-text': 'ನಮ್ಮ ಎಐ ಬೆಳೆ ರೋಗಗಳು ಮತ್ತು ಕೀಟಗಳ ನಿಖರವಾದ ಗುರುತನ್ನು ಒದಗಿಸಲು ಲಕ್ಷಾಂತರ ಚಿತ್ರಗಳ ಮೇಲೆ ತರಬೇತಿ ಪಡೆದಿದೆ.',
            'empowering-remedy-title': 'ತ್ವರಿತ ಪರಿಹಾರಗಳು', 'empowering-remedy-text': 'ಸಾವಯವ ಮತ್ತು ರಾಸಾಯನಿಕ ಚಿಕಿತ್ಸಾ ಆಯ್ಕೆಗಳೊಂದಿಗೆ ತಕ್ಷಣದ, ಕಾರ್ಯಸಾಧ್ಯವಾದ ಸಲಹೆಯನ್ನು ಪಡೆಯಿರಿ.',
            'empowering-easy-title': 'ಬಳಸಲು ಸುಲಭ', 'empowering-easy-text': 'ಯಾವುದೇ ಸಂಕೀರ್ಣ ಸೆಟಪ್ ಇಲ್ಲ. ನಿಮಗೆ ಸಹಾಯ ಬೇಕಾದಾಗ, ನಿಮ್ಮ ಫೋನ್‌ನಿಂದ ಫೋಟೋವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.',
            'process-title': 'ನಾವು ವಿಶ್ಲೇಷಣೆಯ ಸಂಪೂರ್ಣ ನಿಯಂತ್ರಣವನ್ನು ತೆಗೆದುಕೊಳ್ಳುತ್ತೇವೆ',
            'process-subtitle': 'ಪ್ರಾಜೆಕ್ಟ್ ಕಿಸಾನ್ ನಿಮ್ಮ ಬೆಳೆ ಫೋಟೋವನ್ನು ನೇರವಾಗಿ ನಮ್ಮ ಶಕ್ತಿಯುತ ಎಐ ವಿಶ್ಲೇಷಣಾ ಇಂಜಿನ್‌ಗೆ ಸಂಪರ್ಕಿಸುತ್ತದೆ. ನಿಮಗೆ ಅತ್ಯಂತ ನಿಖರವಾದ ಫಲಿತಾಂಶಗಳನ್ನು ನೀಡಲು ಪ್ರತಿಯೊಂದು ಹಂತವನ್ನು ನಮ್ಮ ತಂತ್ರಜ್ಞಾನದಿಂದ ಸೆರೆಹಿಡಿಯಲಾಗುತ್ತದೆ ಮತ್ತು ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಲಾಗುತ್ತದೆ. ನಮ್ಮ ಸಮಗ್ರ ಸೇವೆಯು ಒಳಗೊಂಡಿದೆ:',
            'process-step-1': 'ಅಪ್ಲೋಡ್', 'process-step-2': 'ಎಐ ವಿಶ್ಲೇಷಣೆ', 'process-step-3': 'ಗುರುತಿಸುವಿಕೆ', 'process-step-4': 'ಪರಿಹಾರ', 'process-step-5': 'ಆಡಿಯೋ ಸಾರಾಂಶ',
            'assistant-placeholder': 'ಬೆಳೆ ರೋಗಗಳು, ಮಣ್ಣಿನ ಸಿದ್ಧತೆ, ಮಾರುಕಟ್ಟೆ ದರಗಳ ಬಗ್ಗೆ ಕೇಳಿ...',
            'planner-title': 'ಎಐ ಬೆಳೆ ಯೋಜಕ', 'planner-subtitle': 'ನಿಮ್ಮ ವಿಶಿಷ್ಟ ಕೃಷಿ ಪರಿಸ್ಥಿತಿಗಳ ಆಧಾರದ ಮೇಲೆ ಬುದ್ಧಿವಂತ ಬೆಳೆ ಶಿಫಾರಸುಗಳನ್ನು ಪಡೆಯಿರಿ.',
            'planner-label-location': 'ಸ್ಥಳ', 'planner-placeholder-location': 'ನಿಮ್ಮ ರಾಜ್ಯವನ್ನು ಹುಡುಕಿ ಮತ್ತು ಆಯ್ಕೆಮಾಡಿ...',
            'planner-label-water': 'ನೀರಿನ ಲಭ್ಯತೆ', 'planner-select-water': 'ನೀರಿನ ಲಭ್ಯತೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
            'planner-label-land': 'ಭೂಮಿಯ ಗಾತ್ರ (ಎಕರೆಗಳಲ್ಲಿ)', 'planner-label-budget': 'ಬಜೆಟ್ (₹ ಯಲ್ಲಿ)', 'planner-button': 'ಯೋಜನೆ ಸಿದ್ಧಪಡಿಸಿ',
            'fert-title': 'ಗೊಬ್ಬರ ಕ್ಯಾಲ್ಕುಲೇಟರ್', 'fert-label-crop': 'ಸಂಬಂಧಿತ ಮಾಹಿತಿಯನ್ನು ನೋಡಿ', 'fert-button-crop': 'ಬೆಳೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
            'fert-card1-title': 'ಪೋಷಕಾಂಶಗಳ ಪ್ರಮಾಣಗಳು', 'fert-card1-subtitle': 'ನಿಮ್ಮ ಕ್ಷೇತ್ರದ ಗಾತ್ರ ಮತ್ತು ಬೆಳೆಯನ್ನು ಆಧರಿಸಿ, ನಾವು ನಿಮಗಾಗಿ ಪೋಷಕಾಂಶದ ಅನುಪಾತವನ್ನು ಆಯ್ಕೆ ಮಾಡಿದ್ದೇವೆ.',
            'fert-card2-plot-title': 'ಘಟಕ ಮತ್ತು ಪ್ಲಾಟ್ ಗಾತ್ರ', 'fert-card2-plot-subtitle': 'ಒಂದು ಘಟಕಕ್ಕಿಂತ ಚಿಕ್ಕದಾದ ಗಾತ್ರಗಳನ್ನು 0 ಎಂದು ವ್ಯಕ್ತಪಡಿಸಲಾಗುತ್ತದೆ.',
            'fert-card2-tree-title': 'ಮರಗಳ ಸಂಖ್ಯೆ', 'fert-card2-tree-subtitle': 'ನಿಮ್ಮ ತೋಟದಲ್ಲಿರುವ ಒಟ್ಟು ಮರಗಳ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.',
            'fert-button-calculate': 'ಲೆಕ್ಕಾಚಾರ ಮಾಡಿ', 'fert-results-title': 'ನಿಮ್ಮ ಗೊಬ್ಬರ ಸಂಯೋಜನೆಯನ್ನು ಆರಿಸಿ', 'fert-results-subtitle': 'ನಿಮ್ಮ ಇನ್‌ಪುಟ್‌ಗಳ ಆಧಾರದ ಮೇಲೆ ಒಂದು ಋತುವಿಗೆ ಶಿಫಾರಸು ಮಾಡಲಾದ ಮೊತ್ತ.',
            'guardian-weather-title': 'ಇಂದಿನ ಹವಾಮಾನ ದೃಷ್ಟಿಕೋನ', 'guardian-weather-location': 'ನಿಮ್ಮ ಸ್ಥಳವನ್ನು ಆಧರಿಸಿ:',
            'guardian-temp': 'ತಾಪಮಾನ', 'guardian-humidity': 'ಆರ್ದ್ರತೆ', 'guardian-rain': 'ಮಳೆಯ ಸಾಧ್ಯತೆ', 'guardian-wind': 'ಗಾಳಿಯ ವೇಗ',
            'guardian-engine-title': 'ನಿಮ್ಮ ಪೂರ್ವಭಾವಿ ಗಾರ್ಡಿಯನ್ ಇಂಜಿನ್', 'guardian-engine-subtitle': 'ನಮ್ಮ ಗಾರ್ಡಿಯನ್ ಎಐ ನಿಮ್ಮ ಬೆಳೆ, ಬಿತ್ತನೆ ದಿನಾಂಕ ಮತ್ತು ಸ್ಥಳೀಯ ಹವಾಮಾನವನ್ನು ಬಳಸಿಕೊಂಡು ಬೆದರಿಕೆಗಳು ಸಂಭವಿಸುವ ಮೊದಲು ಅವುಗಳನ್ನು ತಡೆಯಲು ನಿಮಗೆ ಸಹಾಯ ಮಾಡುತ್ತದೆ.',
            'guardian-label-crop': 'ನಿಮ್ಮ ಬೆಳೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ', 'guardian-label-sowing': 'ಬಿತ್ತನೆ ದಿನಾಂಕ', 'guardian-label-location': 'ನಿಮ್ಮ ಸ್ಥಳ (ರಾಜ್ಯ/ಕೇಂದ್ರಾಡಳಿತ ಪ್ರದೇಶ)',
            'guardian-placeholder-location': 'ರಾಜ್ಯ/ಕೇಂದ್ರಾಡಳಿತ ಪ್ರದೇಶವನ್ನು ಆಯ್ಕೆ ಮಾಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ', 'guardian-button-activate': 'ಪೂರ್ವಭಾವಿ ಗಾರ್ಡಿಯನ್ ಅನ್ನು ಸಕ್ರಿಯಗೊಳಿಸಿ',
            'guardian-threat-title': 'ಬೆದರಿಕೆ ಮೌಲ್ಯಮಾಪನ', 'guardian-threat-primary': 'ಪ್ರಾಥಮಿಕ ಬೆದರಿಕೆ', 'guardian-threat-risk': 'ಅಪಾಯದ ಮಟ್ಟ',
            'guardian-library-title': 'ಪೂರ್ವಭಾವಿ ರೋಗ ಮತ್ತು ಕೀಟ ಗ್ರಂಥಾಲಯ', 'guardian-library-crop-label': 'ಇದಕ್ಕಾಗಿ ಮಾಹಿತಿಯನ್ನು ನೋಡಿ:',
            'market-title': 'ನಿಮ್ಮ ಬೆಳೆಯ ಮೌಲ್ಯವನ್ನು ಕಂಡುಹಿಡಿಯಿರಿ', 'market-subtitle': 'ವಿವರವಾದ ಬೆಲೆ ವಿಶ್ಲೇಷಣೆ ಮತ್ತು ಇತ್ತೀಚಿನ ಬೆಲೆ ಇತಿಹಾಸವನ್ನು ಪಡೆಯಲು ನಿಮ್ಮ ಬೆಳೆ ಮತ್ತು ಮಾರುಕಟ್ಟೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
            'market-label-state': 'ರಾಜ್ಯ', 'market-label-market': 'ಮಾರುಕಟ್ಟೆ', 'market-label-crop': 'ಬೆಳೆ',
            'market-button-analyze': 'ಮಾರುಕಟ್ಟೆ ಬೆಲೆಯನ್ನು ವಿಶ್ಲೇಷಿಸಿ', 'market-table-title': 'ಗಾಗಿ ಇತ್ತೀಚಿನ ಮಂಡಿ ಬೆಲೆಗಳು',
            'th-commodity': 'ಸರಕು', 'th-min-price': 'ಕನಿಷ್ಠ ಬೆಲೆ', 'th-max-price': 'ಗರಿಷ್ಠ ಬೆಲೆ', 'th-avg-price': 'ಸರಾಸರಿ ಬೆಲೆ', 'th-date': 'ದಿನಾಂಕ',
            'schemes-title': 'ಎಐ ಯೋಜನೆ ಸಹಾಯಕ', 'schemes-subtitle': 'ನಿಮ್ಮ ಪ್ರದೇಶದ ರೈತರಿಗಾಗಿ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ಬಗ್ಗೆ ಕೇಳಿ.',
            'schemes-label-location': 'ಮೊದಲು, ದಯವಿಟ್ಟು ನಿಮ್ಮ ರಾಜ್ಯವನ್ನು ಆಯ್ಕೆಮಾಡಿ', 'schemes-placeholder-location': 'ನಿಮ್ಮ ರಾಜ್ಯವನ್ನು ಹುಡುಕಿ ಮತ್ತು ಆಯ್ಕೆಮಾಡಿ...',
            'schemes-placeholder-chat': 'ನೀರಾವರಿ, ಬೀಜಗಳು, ಸಾಲಗಳ ಯೋಜನೆಗಳ ಬಗ್ಗೆ ಕೇಳಿ...',
            'login-title': 'ನಿಮ್ಮ ಖಾತೆಗೆ ಲಾಗಿನ್ ಮಾಡಿ', 'login-subtitle': 'ಮತ್ತೆ ಸ್ವಾಗತ! ನಿಮ್ಮ ವೈಯಕ್ತಿಕಗೊಳಿಸಿದ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಮತ್ತು ಪರಿಕರಗಳನ್ನು ಪ್ರವೇಶಿಸಿ.',
            'label-email': 'ಇಮೇಲ್ ವಿಳಾಸ', 'label-password': 'ಗುಪ್ತಪದ', 'button-login': 'ಲಾಗಿನ್',
            'login-signup-prompt': 'ಖಾತೆ ಇಲ್ಲವೆ?', 'login-signup-link': 'ಸೈನ್ ಅಪ್ ಮಾಡಿ',
            'signup-title': 'ನಿಮ್ಮ ಖಾತೆಯನ್ನು ರಚಿಸಿ', 'signup-subtitle': 'ಶಕ್ತಿಯುತ ಕೃಷಿ ಪರಿಕರಗಳನ್ನು ಅನ್ಲಾಕ್ ಮಾಡಲು ನಮ್ಮ ಸಮುದಾಯಕ್ಕೆ ಸೇರಿ.',
            'label-fname': 'ಮೊದಲ ಹೆಸರು', 'label-lname': 'ಕೊನೆಯ ಹೆಸರು', 'label-mobile': 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ',
            'button-create': 'ಖಾತೆ ತೆರೆಯಿರಿ', 'signup-login-prompt': 'ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೆ?', 'signup-login-link': 'ಲಾಗಿನ್',
            'yield-title': 'ಇಳುವರಿ ಗರಿಷ್ಠಗೊಳಿಸುವ ಯೋಜನೆ', 'yield-subtitle': 'ಕಸ್ಟಮೈಸ್ ಮಾಡಿದ 14-ವಾರಗಳ ಬೆಳವಣಿಗೆ ಮತ್ತು ಸಂರಕ್ಷಣಾ ಯೋಜನೆಯನ್ನು ರಚಿಸಲು ನಿಮ್ಮ ಬೆಳೆ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ.',
            'yield-label-crop': 'ನಿಮ್ಮ ಬೆಳೆ', 'yield-label-variety': 'ತಳಿ', 'yield-label-sowing': 'ಬಿತ್ತನೆ ದಿನಾಂಕ', 'yield-label-location': 'ನಿಮ್ಮ ಸ್ಥಳ',
            'yield-button-generate': 'ಯೋಜನೆಯನ್ನು ರಚಿಸಿ', 'yield-master-plan-title': 'ನಿಮ್ಮ ಸಾಪ್ತಾಹಿಕ ಮಾಸ್ಟರ್ ಪ್ಲಾನ್', 'yield-master-plan-subtitle': 'ಬೀಜದಿಂದ ಸುಗ್ಗಿಯವರೆಗೆ ನಿಮ್ಮ ಬೆಳೆಯ ಸಂಪೂರ್ಣ ಜೀವನಚಕ್ರಕ್ಕಾಗಿ ಒಂದು ಕಾರ್ಯತಂತ್ರದ ಅವಲೋಕನ.',
            'yield-daily-tasks-title': 'ಶಿಫಾರಸು ಮಾಡಲಾದ ದೈನಂದಿನ ಕಾರ್ಯಗಳು', 'yield-daily-tasks-subtitle': 'ನಿಮ್ಮ ಯೋಜನೆಯ ಯಶಸ್ಸನ್ನು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಲು ಪ್ರತಿದಿನ ತೆಗೆದುಕೊಳ್ಳಬೇಕಾದ ಸರಳ, ಕ್ರಿಯಾತ್ಮಕ ಕ್ರಮಗಳು.',
        }
    };

    // 2. Function to set the language
    const setLanguage = (lang) => {
        const langTranslations = translations[lang];
        if (!langTranslations) {
            console.error(`Language '${lang}' not found in translations.`);
            return;
        }

        Object.keys(langTranslations).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                if (element.placeholder !== undefined) {
                    element.placeholder = langTranslations[key];
                } 
                else if (key.startsWith('planner-select-')) {
                     element.textContent = langTranslations[key];
                }
                else if (key === 'empowering-title') {
                     element.innerHTML = langTranslations[key];
                } else {
                     element.textContent = langTranslations[key];
                }
            }
        });
        
        currentLangText.textContent = languageOptions.querySelector(`[data-lang="${lang}"]`).textContent.split(' ')[0];

        document.querySelectorAll('.language-option').forEach(opt => {
            opt.classList.remove('active');
            if(opt.getAttribute('data-lang') === lang) {
                opt.classList.add('active');
            }
        });

        localStorage.setItem('project-kisan-lang', lang);
    };

    // 3. Dropdown Toggle Logic
    languageToggleBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        languageOptions.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
        if (!languageToggleBtn.contains(e.target) && !languageOptions.classList.contains('hidden')) {
            languageOptions.classList.add('hidden');
        }
    });
    
    // 4. Set language when an option is clicked
    languageOptions.addEventListener('click', (event) => {
        const option = event.target.closest('.language-option');
        if (option) {
            event.preventDefault();
            const lang = option.getAttribute('data-lang');
            setLanguage(lang);
            languageOptions.classList.add('hidden');
        }
    });

    // 5. Load language from storage on page load
    const savedLang = localStorage.getItem('project-kisan-lang') || 'en';
    setLanguage(savedLang);
});