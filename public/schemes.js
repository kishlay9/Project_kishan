document.addEventListener('DOMContentLoaded', () => {
    // --- 1. FIREBASE INITIALIZATION & FUNCTION REFERENCE ---
    const firebaseConfig = {
      apiKey: "AIzaSyC4Aeebs6yLYHq-ZlDDMpUcTwvCYX48KRg",
      authDomain: "project-kisan-new.firebaseapp.com",
      projectId: "project-kisan-new",
      storageBucket: "project-kisan-new.firebasestorage.app",
      messagingSenderId: "176046173818",
      appId: "1:176046173818:web:de8fb0e50752c8f62195c3",
      measurementId: "G-GDJE785E2N"
    };

    // Initialize Firebase if it hasn't been already
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }

    // Get a reference to the functions service, specifying the correct region
    const functions = firebase.app().functions('asia-south1');
    
    // Create a callable reference to your cloud function
    const getSchemeAnswer = functions.httpsCallable('getSchemeAnswer');
    console.log("✅ [Firebase] Callable function 'getSchemeAnswer' is ready.");


    // --- 2. STATE & DATA (Unchanged) ---
    const INDIAN_LOCATIONS = [
        "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh",
        "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana",
        "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep",
        "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry",
        "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
        "West Bengal"
    ];

    let state = {
        location: null,
        isFirstMessage: true
    };

    // --- 3. DOM ELEMENTS (Unchanged) ---
    const chatContainer = document.getElementById('chat-container');
    const chatLog = document.getElementById('chat-log');
    const initialView = document.getElementById('initial-view');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const locationDropdown = document.getElementById('location-dropdown');
    const searchInput = document.getElementById('location-search-input');
    const dropdownPanel = document.getElementById('location-dropdown-panel');
    const locationList = document.getElementById('location-list');

    // --- 4. EVENT LISTENERS (Unchanged) ---
    chatForm.addEventListener('submit', handleFormSubmit);
    searchInput.addEventListener('input', () => {
        openDropdown();
        filterLocations();
    });
    searchInput.addEventListener('focus', () => {
        openDropdown();
        filterLocations();
    });
    document.addEventListener('click', (event) => {
        if (!locationDropdown.contains(event.target)) {
            closeDropdown();
        }
    });

    // --- 5. CORE FUNCTIONS (getAiResponse is now corrected) ---
    async function handleFormSubmit(event) {
        event.preventDefault();
        const userQuery = chatInput.value.trim();
        if (!userQuery) return;

        if (state.isFirstMessage) {
            if (!state.location) {
                alert('Please select your location to get relevant schemes.');
                return;
            }
            transitionToActiveChat();
            state.isFirstMessage = false;
        }

        addUserMessage(userQuery);
        chatInput.value = '';
        await getAiResponse(userQuery, state.location);
    }
    
    // ▼▼▼ THIS IS THE CORRECTED FUNCTION ▼▼▼
    // ▼▼▼ REPLACE THE ENTIRE OLD getAiResponse FUNCTION WITH THIS FINAL VERSION ▼▼▼
async function getAiResponse(query, location) {
    showTypingIndicator();

    const currentLang = localStorage.getItem('project-kisan-lang') || 'en';
    const apiUrl = 'https://asia-south1-project-kisan-new.cloudfunctions.net/getSchemeAnswer';

    // This is the data object we will send in the request body.
    const requestData = {
        question: query,
        stateName: location,
        language: currentLang
    };

    console.log("🚀 [HTTP POST] Calling URL:", apiUrl, "with body:", requestData);

    try {
        // This is the crucial change: using 'POST' and sending the data in the 'body'.
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData), // Convert the data to a JSON string
        });

        // We try to parse the JSON response even if the request failed, as it might contain an error message.
        const data = await response.json();

        if (!response.ok) {
            // If the server sent an error message in the JSON, use it. Otherwise, use the status text.
            throw new Error(`Server Error: ${data.error || response.statusText}`);
        }

        console.log("✅ [HTTP POST] Successfully received and parsed JSON:", data);
        
        let formattedMessage = '';
        if (data.schemes && data.schemes.length > 0) {
             formattedMessage = `Based on your query, here are some schemes I found for <strong>${location}</strong>:<br><br>`;
             data.schemes.forEach(scheme => {
                 formattedMessage += `
                     <div class="scheme-card">
                         <h4>${scheme.scheme_name || 'N/A'} (${scheme.government_level || 'N/A'})</h4>
                         <p><strong>Description:</strong> ${scheme.brief_description || 'No description available.'}</p>
                         <p><strong>Key Benefits:</strong> ${scheme.key_benefits || 'No benefits listed.'}</p>
                         <p><strong>How to Apply:</strong> ${scheme.how_to_apply || 'Application details not specified.'}</p>
                     </div>
                 `;
             });
        } else {
            formattedMessage = data.message || `I couldn't find any specific schemes for "${query}" in ${location}. You can try rephrasing your query or checking official government portals.`;
        }
        
        hideTypingIndicator();
        addAiMessage(formattedMessage);

    } catch (error) {
        console.error("❌ [CRITICAL ERROR] An error occurred during the POST request:", error);
        hideTypingIndicator();
        addAiMessage(`I'm sorry, something went wrong. Please check the developer console (F12) for technical details. <br><br><strong>Error:</strong> ${error.message}`);
    }
}
    // ▲▲▲ END OF CORRECTION ▲▲▲

    // --- 6. Other UI functions (Unchanged) ---
    function openDropdown() { dropdownPanel.classList.add('open'); }
    function closeDropdown() { dropdownPanel.classList.remove('open'); }
    function populateLocationList(filter = '') { locationList.innerHTML = ''; const filteredLocations = INDIAN_LOCATIONS.filter(loc => loc.toLowerCase().includes(filter.toLowerCase())); if (filteredLocations.length === 0) { locationList.innerHTML = '<li class="no-results">No locations found</li>'; return; } filteredLocations.forEach(locationName => { const listItem = document.createElement('li'); listItem.textContent = locationName; listItem.addEventListener('click', () => selectLocation(locationName)); locationList.appendChild(listItem); }); }
    function filterLocations() { populateLocationList(searchInput.value); }
    function selectLocation(locationName) { state.location = locationName; searchInput.value = locationName; closeDropdown(); }
    function transitionToActiveChat() { initialView.style.display = 'none'; chatContainer.classList.add('chat-active'); }
    function addUserMessage(message) { const messageElement = document.createElement('div'); messageElement.className = 'chat-message user'; messageElement.innerHTML = `<div class="message-bubble">${message}</div>`; chatLog.appendChild(messageElement); scrollToBottom(); }
    function addAiMessage(message) { const messageElement = document.createElement('div'); messageElement.className = 'chat-message ai'; messageElement.innerHTML = `<img src="images/LOGO.png" class="ai-avatar" alt="AI Avatar"><div class="message-bubble">${message}</div>`; chatLog.appendChild(messageElement); scrollToBottom(); }
    function showTypingIndicator() { const typingElement = document.createElement('div'); typingElement.className = 'chat-message ai typing-indicator'; typingElement.id = 'typing-indicator'; typingElement.innerHTML = `<img src="images/LOGO.png" class="ai-avatar" alt="AI Avatar"><div class="message-bubble"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>`; chatLog.appendChild(typingElement); scrollToBottom(); }
    function hideTypingIndicator() { const typingIndicator = document.getElementById('typing-indicator'); if (typingIndicator) typingIndicator.remove(); }
    function scrollToBottom() { chatLog.scrollTop = chatLog.scrollHeight; }

    // --- 7. INITIALIZATION ---
    populateLocationList();
});