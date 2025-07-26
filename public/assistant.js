// assistant.js

document.addEventListener('DOMContentLoaded', () => {
    const chatHistory = document.getElementById('chat-history');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');

    // This map connects the 'tool' name from your backend to the correct page URL
    const toolUrlMap = {
        "Market Prices": "market.html",
        "Crop Diagnosis": "index.html#diagnose-tool",
        "Pest Guardian": "guardian.html",
        "Yield Maximizer": "yield.html",
        "Crop Planner": "cropplanner.html",
        "Govt. Schemes": "schemes.html",
        "Fertilizer Calculator": "fertilizer.html"
    };

    // --- EVENT LISTENERS ---

    // Handle form submission
    chatForm.addEventListener('submit', handleFormSubmit);

    // Auto-resize textarea and handle Enter key submission
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

    // --- CORE FUNCTIONS ---

    async function handleFormSubmit(event) {
        event.preventDefault();
        const userQuery = chatInput.value.trim();
        if (!userQuery) return;

        addUserMessage(userQuery);
        chatInput.value = '';
        chatInput.style.height = 'auto'; // Reset height
        
        showTypingIndicator();

        try {
            const apiUrl = 'https://asia-south1-project-kisan-new.cloudfunctions.net/askAiAssistant';
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: userQuery })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API Error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            
            hideTypingIndicator();

            // *** THIS IS THE LOGIC YOU REQUESTED ***
            // It checks the 'type' from the API response.
            if (data.result && data.result.type) {
                if (data.result.type === 'navigation') {
                    // If it's a 'navigation' type, we call the function to show the AI's message AND the redirect button.
                    addAiNavigationMessage(data.result);
                } else if (data.result.type === 'answer') {
                    // If it's just an 'answer', we show the text only.
                    addAiMessage(data.result.content);
                }
            } else {
                 throw new Error("Invalid response structure from API.");
            }

        } catch (error) {
            console.error("Failed to get AI response:", error);
            hideTypingIndicator();
            addAiMessage("I'm sorry, I'm having some trouble connecting right now. Please try again in a moment.");
        }
    }

    // --- UI HELPER FUNCTIONS ---

    const addUserMessage = (text) => {
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message user-message';
        messageElement.innerHTML = `
            <div class="message-content">
                <p>${text.replace(/\n/g, '<br>')}</p>
            </div>
        `;
        chatHistory.appendChild(messageElement);
        scrollToBottom();
    };

    const addAiMessage = (htmlContent) => {
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message ai-message';
        const formattedContent = htmlContent.replace(/\n/g, '<br>').replace(/\\n/g, '<br>');
        messageElement.innerHTML = `
            <img src="images/LOGO.png" alt="AI Avatar" class="avatar">
            <div class="message-content">
                <p>${formattedContent}</p>
            </div>
        `;
        chatHistory.appendChild(messageElement);
        scrollToBottom();
    };
    
    // ▼▼▼ MODIFIED FUNCTION ▼▼▼
    // This function is called when the AI detects a navigation request.
    // It displays the AI's message AND the redirect button.
    const addAiNavigationMessage = (data) => {
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message ai-message';

        const toolUrl = toolUrlMap[data.tool];
        let navigationButton = '';

        // Create a helpful redirect message. Using <strong> for bold text.
        const redirectMessage = `That's a great question! For the most accurate information on <strong>${data.tool}</strong>, our dedicated tool is the best place to look. I can take you there now.`;

        // Only create the button if a valid URL exists for the tool.
        if (toolUrl) {
            navigationButton = `
                <div class="nav-button-container">
                    <a href="${toolUrl}" class="nav-button">Open ${data.tool} Tool</a>
                </div>
            `;
        } else {
            // Log a warning if the backend suggests a tool we don't have a URL for.
            console.warn(`[Navigation] No URL found in toolUrlMap for tool: "${data.tool}"`);
        }

        messageElement.innerHTML = `
            <img src="images/LOGO.png" alt="AI Avatar" class="avatar">
            <div class="message-content">
                <p>${redirectMessage}</p>
                ${navigationButton}
            </div>
        `;
        chatHistory.appendChild(messageElement);
        scrollToBottom();
    };
    // ▲▲▲ END OF MODIFICATION ▲▲▲

    const showTypingIndicator = () => {
        const typingElement = document.createElement('div');
        typingElement.id = 'typing-indicator';
        typingElement.className = 'chat-message ai-message typing-indicator';
        typingElement.innerHTML = `
            <img src="images/LOGO.png" alt="AI Avatar" class="avatar">
            <div class="message-content">
                <span></span><span></span><span></span>
            </div>
        `;
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
    
    // Display an initial welcome message from the AI
    setTimeout(() => {
        addAiMessage("Hello! I'm your Project Kisan farming assistant. How can I help you today? You can ask me about soil preparation, market prices, or specific crop problems.");
    }, 500);
});