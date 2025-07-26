// assistant.js

// --- 1. INITIALIZE FIREBASE (REQUIRED FOR 'onCall' FUNCTIONS) ---
const firebaseConfig = {
  apiKey: "AIzaSyC4Aeebs6yLYHq-ZlDDMpUcTwvCYX48KRg",
  authDomain: "project-kisan-new.firebaseapp.com",
  projectId: "project-kisan-new",
  storageBucket: "project-kisan-new.firebasestorage.app",
  messagingSenderId: "176046173818",
  appId: "1:176046173818:web:de8fb0e50752c8f62195c3",
  measurementId: "G-GDJE785E2N"
};

firebase.initializeApp(firebaseConfig);
const functions = firebase.app().functions('asia-south1');
const askAiAssistant = functions.httpsCallable('askAiAssistant');


// --- 2. THE REST OF YOUR CODE, WITH THE 'fetch' CALL REPLACED ---
document.addEventListener('DOMContentLoaded', () => {
    const chatHistory = document.getElementById('chat-history');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');

    const toolUrlMap = {
        "Market Prices": "market.html",
        "Crop Diagnosis": "index.html#diagnose-tool",
        "Pest Guardian": "guardian.html",
        "Yield Maximizer": "yield.html",
        "Govt. Schemes": "schemes.html"
    };

    // --- EVENT LISTENERS (Unchanged) ---
    chatForm.addEventListener('submit', handleFormSubmit);
    chatInput.addEventListener('input', () => {
        chatInput.style.height = 'auto';
        chatInput.style.height = `${Math.min(chatInput.scrollHeight, 150)}px`;
    });
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleFormSubmit(e);
        }
    });

    // --- CORE FUNCTIONS (handleFormSubmit is updated) ---
    async function handleFormSubmit(event) {
        event.preventDefault();
        const userQuery = chatInput.value.trim();
        if (!userQuery) return;

        addUserMessage(userQuery);
        chatInput.value = '';
        chatInput.style.height = 'auto';
        
        showTypingIndicator();

        try {
            // Get the current language from browser storage
            const currentLang = localStorage.getItem('project-kisan-lang') || 'en';

            // Pass the user's query and selected language to the Cloud Function
            const result = await askAiAssistant({ 
                query: userQuery,
                language: currentLang
            });
            
            const data = result.data;
            console.log("✅ [DEBUG] Received from AI Assistant:", data);

            hideTypingIndicator();

            if (data && data.type) {
                if (data.type === 'navigation') {
                    addAiNavigationMessage(data);
                } else if (data.type === 'answer') {
                    addAiMessage(data.content);
                } else {
                     throw new Error("API returned an unknown response type.");
                }
            } else {
                 throw new Error("Invalid response structure from API.");
            }

        } catch (error) {
            console.error("❌ [CRITICAL ERROR] Failed to get AI response:", error);
            hideTypingIndicator();
            addAiMessage("I'm sorry, I'm having some trouble connecting right now. Please try again in a moment.");
        }
    }

    // --- UI HELPER FUNCTIONS (Unchanged) ---
    const addUserMessage = (text) => {
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message user-message';
        messageElement.innerHTML = `<div class="message-content"><p>${text.replace(/\n/g, '<br>')}</p></div>`;
        chatHistory.appendChild(messageElement);
        scrollToBottom();
    };

    const addAiMessage = (htmlContent) => {
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message ai-message';
        const formattedContent = htmlContent.replace(/\n/g, '<br>').replace(/\\n/g, '<br>');
        messageElement.innerHTML = `<img src="images/LOGO.png" alt="AI Avatar" class="avatar"><div class="message-content"><p>${formattedContent}</p></div>`;
        chatHistory.appendChild(messageElement);
        scrollToBottom();
    };
    
    const addAiNavigationMessage = (data) => {
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message ai-message';
        const toolUrl = toolUrlMap[data.tool];
        let navigationButton = '';

        const redirectMessage = data.message || `I have a special tool for <strong>${data.tool}</strong>. Would you like to go there?`;

        if (toolUrl) {
            navigationButton = `<div class="nav-button-container"><a href="${toolUrl}" class="nav-button">Open ${data.tool} Tool</a></div>`;
        } else {
            console.warn(`[Navigation] No URL found in toolUrlMap for tool: "${data.tool}"`);
        }

        messageElement.innerHTML = `<img src="images/LOGO.png" alt="AI Avatar" class="avatar"><div class="message-content"><p>${redirectMessage}</p>${navigationButton}</div>`;
        chatHistory.appendChild(messageElement);
        scrollToBottom();
    };

    const showTypingIndicator = () => {
        const typingElement = document.createElement('div');
        typingElement.id = 'typing-indicator';
        typingElement.className = 'chat-message ai-message typing-indicator';
        typingElement.innerHTML = `<img src="images/LOGO.png" alt="AI Avatar" class="avatar"><div class="message-content"><span></span><span></span><span></span></div>`;
        chatHistory.appendChild(typingElement);
        scrollToBottom();
    };

    const hideTypingIndicator = () => {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    };

    const scrollToBottom = () => {
        chatHistory.scrollTop = chatHistory.scrollHeight;
    };

    // --- INITIALIZATION ---
    setTimeout(() => {
        addAiMessage("Hello! I'm your Project Kisan farming assistant. How can I help you today? You can ask me about soil preparation, market prices, or specific crop problems.");
    }, 500);
});