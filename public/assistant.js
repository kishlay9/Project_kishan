// assistant.js - CORRECTED VERSION

// --- 1. INITIALIZE FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyC4Aeebs6yLYHq-ZlDDMpUcTwvCYX48KRg", // Replace with your actual key if needed
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

// --- 2. CORE CHAT LOGIC ---
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENTS ---
    const chatHistory = document.getElementById('chat-history');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
    const voiceBtn = document.getElementById('voice-btn');

    // --- STATE & DATA ---
    let mediaRecorder;
    let audioChunks = [];
    let isRecording = false;
    const apiUrl = 'https://asia-south1-project-kisan-new.cloudfunctions.net/askAiAssistant';

    const toolUrlMap = {
        "Market Prices": "market.html",
        "Crop Diagnosis": "index.html#diagnose-tool",
        "Pest Guardian": "guardian.html",
        "Yield Maximizer": "yield.html",
        "Profit Planner": "cropplanner.html",
        "Govt. Schemes": "schemes.html",
        "Fertilizer Calculator": "fertilizer.html"
    };

    // --- EVENT LISTENERS ---
    chatForm.addEventListener('submit', handleTextSubmit);
    voiceBtn.addEventListener('click', handleVoiceClick);
    chatInput.addEventListener('input', () => {
        chatInput.style.height = 'auto';
        chatInput.style.height = `${Math.min(chatInput.scrollHeight, 150)}px`;
    });
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleTextSubmit(e);
        }
    });

    // --- CORE SUBMISSION LOGIC ---
    async function handleTextSubmit(event) {
        event.preventDefault();
        const userQuery = chatInput.value.trim();
        if (!userQuery) return;

        addUserMessage(userQuery);
        chatInput.value = '';
        chatInput.style.height = 'auto';
        showTypingIndicator();

        try {
            // ▼▼▼ THIS IS THE FIX ▼▼▼
            // Text submissions should send a JSON body with the correct Content-Type header.
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query: userQuery }) // Backend expects 'query' field
            });
            // ▲▲▲ END OF FIX ▲▲▲

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || `Server error: ${response.status}`);
            
            hideTypingIndicator();
            handleAiResponse(data);
        } catch (error)  {
            console.error("❌ [CRITICAL ERROR] Failed to get text AI response:", error);
            hideTypingIndicator();
            addAiMessage("I'm sorry, I'm having some trouble connecting right now. Please try again in a moment.");
        }
    }

    async function sendAudioToServer(audioBlob) {
        addUserMessage("[Recording sent for analysis...]");
        showTypingIndicator();
        
        try {
            const formData = new FormData();
            formData.append('audio', audioBlob, 'user_recording.webm');
            
            // Audio submissions correctly use FormData. No headers needed, browser sets them.
            const response = await fetch(apiUrl, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || `Server error: ${response.status}`);
            
            hideTypingIndicator();
            handleAiResponse(data);

        } catch (error) {
            console.error("❌ [CRITICAL ERROR] Failed to get audio AI response:", error);
            hideTypingIndicator();
            addAiMessage("I'm sorry, I had trouble understanding the audio. Please try again.");
        }
    }
    
    // --- UNIFIED AI RESPONSE HANDLER ---
    function handleAiResponse(data) {
        console.log("✅ [DEBUG] Received from AI Assistant:", data);
        if (data.type === 'navigation') {
            addAiNavigationMessage(data);
        } else if (data.content) {
            addAiMessage(data.content);
        } else {
            console.warn("[API Response] Parsed JSON lacks 'type' or 'content' keys. Displaying raw data.");
            addAiMessage(JSON.stringify(data, null, 2));
        }
    }
    
    // --- VOICE RECORDING LOGIC ---
    function handleVoiceClick() {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    }

    async function startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const options = { mimeType: 'audio/webm;codecs=opus' }; // Correct format for backend
            mediaRecorder = new MediaRecorder(stream, options);

            mediaRecorder.ondataavailable = (event) => audioChunks.push(event.data);
            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                sendAudioToServer(audioBlob);
                audioChunks = [];
                stream.getTracks().forEach(track => track.stop()); // Turn off mic indicator
            };
            
            mediaRecorder.start();
            isRecording = true;
            voiceBtn.style.backgroundColor = '#ef4444'; // Red to indicate recording
            console.log("Recording started...");
        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Could not access microphone. Please check your browser permissions.");
        }
    }

    function stopRecording() {
        if (mediaRecorder && mediaRecorder.state === "recording") {
            mediaRecorder.stop();
            isRecording = false;
            voiceBtn.style.backgroundColor = ''; // Revert to default style
            console.log("Recording stopped.");
        }
    }
    
    // --- UI HELPER FUNCTIONS (Corrected with backticks for template literals) ---
    const addUserMessage = (text) => {
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message user-message';
        // FIX: Use backticks ``
        messageElement.innerHTML = `<div class="message-content"><p>${text.replace(/\n/g, '<br>')}</p></div>`;
        chatHistory.appendChild(messageElement);
        scrollToBottom();
    };

    const addAiMessage = (htmlContent) => {
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message ai-message';
        const formattedContent = String(htmlContent).replace(/\n/g, '<br>').replace(/\\n/g, '<br>');
        // FIX: Use backticks ``
        messageElement.innerHTML = `<img src="images/LOGO.png" alt="AI Avatar" class="avatar"><div class="message-content"><p>${formattedContent}</p></div>`;
        chatHistory.appendChild(messageElement);
        scrollToBottom();
    };
    
    const addAiNavigationMessage = (data) => {
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message ai-message';
        const toolUrl = toolUrlMap[data.tool];
        let navigationButton = '';
        // FIX: Use backticks ``
        const redirectMessage = data.message || `That's a great question! For the most accurate information on <strong>${data.tool}</strong>, our dedicated tool is the best place to look. I can take you there now.`;

        if (toolUrl) {
            // FIX: Use backticks ``
            navigationButton = `<div class="nav-button-container"><a href="${toolUrl}" class="nav-button">Open ${data.tool} Tool</a></div>`;
        } else {
            console.warn(`[Navigation] No URL found in toolUrlMap for tool: "${data.tool}"`);
        }
        // FIX: Use backticks ``
        messageElement.innerHTML = `<img src="images/LOGO.png" alt="AI Avatar" class="avatar"><div class="message-content"><p>${redirectMessage}</p>${navigationButton}</div>`;
        chatHistory.appendChild(messageElement);
        scrollToBottom();
    };

    const showTypingIndicator = () => {
        const typingElement = document.createElement('div');
        typingElement.id = 'typing-indicator';
        typingElement.className = 'chat-message ai-message typing-indicator';
        // FIX: Use backticks ``
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