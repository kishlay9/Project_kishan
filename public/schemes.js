document.addEventListener('DOMContentLoaded', () => {
    // --- STATE & DATA ---
    // ▼▼▼ UPDATED WITH UNION TERRITORIES & ALPHABETICALLY SORTED ▼▼▼
    const INDIAN_LOCATIONS = [
        "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh",
        "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana",
        "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep",
        "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry",
        "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
        "West Bengal"
    ];
    // ▲▲▲ END OF UPDATE ▲▲▲

    let state = {
        location: null,
        isFirstMessage: true
    };

    // --- DOM ELEMENTS ---
    const chatContainer = document.getElementById('chat-container');
    const chatLog = document.getElementById('chat-log');
    const initialView = document.getElementById('initial-view');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    
    // Custom Dropdown Elements
    const locationDropdown = document.getElementById('location-dropdown');
    const searchInput = document.getElementById('location-search-input');
    const dropdownPanel = document.getElementById('location-dropdown-panel');
    const locationList = document.getElementById('location-list');

    // --- EVENT LISTENERS ---
    chatForm.addEventListener('submit', handleFormSubmit);
    searchInput.addEventListener('input', () => {
        openDropdown();
        filterLocations();
    });
    searchInput.addEventListener('focus', () => {
        openDropdown();
        filterLocations();
    });

    // Close dropdown if clicked outside
    document.addEventListener('click', (event) => {
        if (!locationDropdown.contains(event.target)) {
            closeDropdown();
        }
    });

    // --- FUNCTIONS ---
    function handleFormSubmit(event) {
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
        simulateAiResponse(userQuery, state.location);
    }

    // Dropdown Logic
    function openDropdown() {
        dropdownPanel.classList.add('open');
    }

    function closeDropdown() {
        dropdownPanel.classList.remove('open');
    }

    function populateLocationList(filter = '') {
        locationList.innerHTML = '';
        const filteredLocations = INDIAN_LOCATIONS.filter(loc => loc.toLowerCase().includes(filter.toLowerCase()));

        if (filteredLocations.length === 0) {
            locationList.innerHTML = '<li class="no-results">No locations found</li>';
            return;
        }

        filteredLocations.forEach(locationName => {
            const listItem = document.createElement('li');
            listItem.textContent = locationName;
            listItem.addEventListener('click', () => selectLocation(locationName));
            locationList.appendChild(listItem);
        });
    }
    
    function filterLocations() {
        populateLocationList(searchInput.value);
    }

    function selectLocation(locationName) {
        state.location = locationName;
        searchInput.value = locationName; // Set the input value to the selected location
        closeDropdown();
    }

    // Chat UI Logic (Unchanged)
    function transitionToActiveChat() {
        initialView.style.display = 'none';
        chatContainer.classList.add('chat-active');
    }

    function addUserMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message user';
        messageElement.innerHTML = `<div class="message-bubble">${message}</div>`;
        chatLog.appendChild(messageElement);
        scrollToBottom();
    }

    function addAiMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message ai';
        messageElement.innerHTML = `
            <img src="images/LOGO.png" class="ai-avatar" alt="AI Avatar">
            <div class="message-bubble">${message}</div>
        `;
        chatLog.appendChild(messageElement);
        scrollToBottom();
    }

    function showTypingIndicator() {
        const typingElement = document.createElement('div');
        typingElement.className = 'chat-message ai typing-indicator';
        typingElement.id = 'typing-indicator';
        typingElement.innerHTML = `
            <img src="images/LOGO.png" class="ai-avatar" alt="AI Avatar">
            <div class="message-bubble">
                <div class="dot"></div><div class="dot"></div><div class="dot"></div>
            </div>
        `;
        chatLog.appendChild(typingElement);
        scrollToBottom();
    }

    function hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) typingIndicator.remove();
    }

    function simulateAiResponse(query, location) {
        showTypingIndicator();
        setTimeout(() => {
            hideTypingIndicator();
            const response = `Based on your query about "${query}" in **${location}**, here are a few potential schemes:
                             <br><br>1. <strong>Pradhan Mantri Kisan Samman Nidhi (PM-KISAN):</strong> Provides income support of ₹6,000 per year.
                             <br>2. <strong>Pradhan Mantri Fasal Bima Yojana (PMFBY):</strong> Crop insurance against failure.
                             <br>3. <strong>Kisan Credit Card (KCC):</strong> Provides farmers with timely access to credit.
                             <br><br><em>Disclaimer: This is a simulated AI response. Please verify with official government portals.</em>`;
            addAiMessage(response);
        }, 2000);
    }

    function scrollToBottom() {
        chatLog.scrollTop = chatLog.scrollHeight;
    }

    // --- INITIALIZATION ---
    populateLocationList();
});