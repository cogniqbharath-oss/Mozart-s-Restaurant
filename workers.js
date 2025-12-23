/**
 * Mozart's Restaurant - AI Chatbot Worker
 * Centralized chatbot control system for the entire website
 */

class MozartChatbot {
    constructor(config = {}) {
        // Configuration
        this.config = {
            apiEndpoint: config.apiEndpoint || '/api/chat',
            containerId: config.containerId || 'chatbotContainer',
            toggleId: config.toggleId || 'chatbotToggle',
            messagesId: config.messagesId || 'chatbotMessages',
            inputId: config.inputId || 'chatbotInput',
            suggestionsId: config.suggestionsId || 'chatbotSuggestions',
            autoInit: config.autoInit !== false,
            restaurantContext: config.restaurantContext || this.getDefaultContext()
        };

        // State
        this.isOpen = false;
        this.conversationHistory = [];
        this.leadCaptureState = 'none'; // none, asking_name, asking_contact, completed
        this.userData = { name: '', contact: '' };

        // DOM Elements (will be set on init)
        this.elements = {};

        // Food Images mapping
        this.foodImages = {
            breakfast: [
                'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&h=400&fit=crop',
                'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&h=400&fit=crop'
            ],
            brunch: [
                'https://images.unsplash.com/photo-1513442542250-854d436a73f2?w=400&h=400&fit=crop',
                'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&h=400&fit=crop'
            ],
            lunch: [
                'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop',
                'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop'
            ],
            coffee: [
                'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop',
                'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop'
            ],
            baked_goods: [
                'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop',
                'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=400&h=400&fit=crop'
            ]
        };

        // Auto-initialize if enabled
        if (this.config.autoInit) {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.init());
            } else {
                this.init();
            }
        }
    }

    /**
     * Initialize the chatbot
     */
    init() {
        try {
            console.log('🎵 Initializing Mozart\'s AI Chatbot (Gemini 2.5 Flash Enchanced)...');

            // Get DOM elements
            this.elements = {
                container: document.getElementById(this.config.containerId),
                toggle: document.getElementById(this.config.toggleId),
                messages: document.getElementById(this.config.messagesId),
                input: document.getElementById(this.config.inputId),
                suggestions: document.getElementById(this.config.suggestionsId)
            };

            if (!this.elements.container || !this.elements.toggle) return false;

            // Attach event listeners
            this.attachEventListeners();

            // Set initial status
            this.updateStatus();

            // Initial Greeting
            this.sendInitialGreeting();

            // Load Suggestions
            this.loadSuggestions();

            console.log('✅ Mozart\'s AI Chatbot initialized successfully!');
            return true;
        } catch (error) {
            console.error('❌ Mozart Chatbot initialization error:', error);
            return false;
        }
    }

    attachEventListeners() {
        if (this.elements.toggle && !this.elements.toggle.hasAttribute('onclick')) {
            this.elements.toggle.addEventListener('click', () => this.toggle());
        }

        if (this.elements.input && !this.elements.input.hasAttribute('onkeypress')) {
            this.elements.input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
        }
    }

    toggle() {
        this.isOpen ? this.close() : this.open();
    }

    open() {
        this.isOpen = true;
        this.elements.container?.classList.add('active');
        this.elements.toggle?.classList.add('hidden');
        this.elements.input?.focus();
        this.trackEvent('Chatbot', 'Open', 'User Action');
    }

    close() {
        this.isOpen = false;
        this.elements.container?.classList.remove('active');
        this.elements.toggle?.classList.remove('hidden');
        this.trackEvent('Chatbot', 'Close', 'User Action');
    }

    sendInitialGreeting() {
        const hour = new Date().getHours();
        let greeting = "Welcome to Mozart's Restaurant! 🎵";

        if (hour < 12) {
            greeting = "Good morning! Looking for a perfect breakfast or brunch to start your day? ☕ Mozart's AI Concierge is here to help!";
        } else if (hour < 17) {
            greeting = "Good afternoon! Time for lunch or a quick coffee break? 🍰 How can I assist you at Mozart's today?";
        } else {
            greeting = "Good evening! Ready for a romantic fine dining experience? 🍷 Let me help you with your evening plans at Mozart's.";
        }

        this.addMessage(greeting, 'bot');
        this.addMessage("I'm powered by Gemini 1.5 Flash and can help with reservations, our menu, or even show you photos of our specialties!", 'bot');
    }

    loadSuggestions() {
        if (!this.elements.suggestions) return;

        const suggestions = [
            { text: '📖 View Menu', query: 'Show me the menu' },
            { text: '⏰ Opening Hours', query: 'What are your hours?' },
            { text: '📍 Location', query: 'Where are you located?' },
            { text: '🥘 Today\'s Specials', query: 'What are today\'s specials?' },
            { text: '📸 Show Food', query: 'Show me some food images' }
        ];

        this.elements.suggestions.innerHTML = '';
        suggestions.forEach(item => {
            const chip = document.createElement('div');
            chip.className = 'suggestion-chip';
            chip.textContent = item.text;
            chip.onclick = () => this.sendMessage(item.query);
            this.elements.suggestions.appendChild(chip);
        });
    }

    async sendMessage(messageText = null) {
        const message = messageText || this.elements.input?.value.trim();
        if (!message) return;

        // User Message
        this.addMessage(message, 'user');
        if (this.elements.input) this.elements.input.value = '';

        // Lead Capture Logic
        if (this.handleLeadCapture(message)) return;

        // Show typing indicator
        this.showTypingIndicator();

        try {
            const response = await fetch(this.config.apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: message,
                    context: this.config.restaurantContext,
                    conversationHistory: this.conversationHistory.slice(-5)
                })
            });

            if (!response.ok) throw new Error('API Error');

            const data = await response.json();
            this.removeTypingIndicator();

            if (data.success) {
                this.addMessage(data.response, 'bot');
                this.conversationHistory.push({ user: message, bot: data.response });

                // Detection logic
                this.detectVisualRequests(message, data.response);
                this.detectLeadCaptureOpportunity(message, data.response);
            }
        } catch (error) {
            console.error('Chat error:', error);
            this.removeTypingIndicator();
            this.addMessage("I'm sorry, I'm having trouble connecting to my brain right now. Please call us at (509) 548-0600!", 'bot', 'error');
        }
    }

    handleLeadCapture(message) {
        if (this.leadCaptureState === 'asking_name') {
            this.userData.name = message;
            this.leadCaptureState = 'asking_contact';
            this.addMessage(`Nice to meet you, ${message}! Could you please share your phone number or email so we can follow up?`, 'bot');
            return true;
        }
        if (this.leadCaptureState === 'asking_contact') {
            this.userData.contact = message;
            this.leadCaptureState = 'completed';
            this.addMessage(`Thank you! I've noted your details. Our team will reach out if needed. Enjoy your time at Mozart's!`, 'bot');
            // Here you would typically send this to your backend
            console.log('Lead Captured:', this.userData);
            return true;
        }
        return false;
    }

    detectLeadCaptureOpportunity(message, response) {
        const bookingKeywords = ['reserve', 'book', 'reservation', 'table', 'event', 'party', 'catering'];
        const matches = bookingKeywords.some(kw => message.toLowerCase().includes(kw));

        if (matches && this.leadCaptureState === 'none' && this.conversationHistory.length > 2) {
            setTimeout(() => {
                this.leadCaptureState = 'asking_name';
                this.addMessage("By the way, I can pass your interest to our manager. What is your name?", 'bot');
            }, 2000);
        }
    }

    detectVisualRequests(message, response) {
        const m = message.toLowerCase();
        let cat = null;

        if (m.includes('breakfast')) cat = 'breakfast';
        else if (m.includes('brunch')) cat = 'brunch';
        else if (m.includes('lunch')) cat = 'lunch';
        else if (m.includes('coffee')) cat = 'coffee';
        else if (m.includes('baked') || m.includes('cake') || m.includes('dessert')) cat = 'baked_goods';
        else if (m.includes('food') || m.includes('dish') || m.includes('image') || m.includes('photo')) cat = 'lunch';

        if (cat) {
            this.addFoodImages(cat);
        }

        // Detect CTA requests
        if (m.includes('contact') || m.includes('call') || m.includes('location') || m.includes('maps') || m.includes('catering')) {
            this.addCTAButtons();
        }
    }

    addFoodImages(category) {
        const images = this.foodImages[category] || [];
        if (images.length === 0) return;

        const grid = document.createElement('div');
        grid.className = 'chat-image-grid';

        images.forEach(src => {
            const img = document.createElement('img');
            img.src = src;
            img.className = 'chat-image-thumb';
            img.onclick = () => window.open(src, '_blank');
            grid.appendChild(img);
        });

        const msgDiv = document.createElement('div');
        msgDiv.className = 'message bot-message';
        const content = document.createElement('div');
        content.className = 'message-content';
        content.appendChild(grid);
        msgDiv.appendChild(content);

        this.elements.messages.appendChild(msgDiv);
        this.scrollToBottom();
    }

    addCTAButtons() {
        const container = document.createElement('div');
        container.className = 'chat-actions';

        const actions = [
            { text: '📞 Call Restaurant', link: 'tel:+15095480600' },
            { text: '📍 Open in Google Maps', link: 'https://maps.google.com/?q=829+Front+St,+Leavenworth,+WA+98826' },
            { text: '🍽️ Catering Services', link: '#contact' }
        ];

        actions.forEach(act => {
            const btn = document.createElement('a');
            btn.className = 'chat-btn';
            btn.href = act.link;
            btn.textContent = act.text;
            if (act.link.startsWith('http')) btn.target = '_blank';
            container.appendChild(btn);
        });

        const msgDiv = document.createElement('div');
        msgDiv.className = 'message bot-message';
        const content = document.createElement('div');
        content.className = 'message-content';
        content.appendChild(container);
        msgDiv.appendChild(content);

        this.elements.messages.appendChild(msgDiv);
        this.scrollToBottom();
    }

    addMessage(text, sender = 'bot', type = 'normal') {
        if (!this.elements.messages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        if (type === 'error') messageDiv.classList.add('error-message');

        const content = document.createElement('div');
        content.className = 'message-content';
        content.innerHTML = `<p>${this.formatMessage(text)}</p>`;

        const time = document.createElement('div');
        time.className = 'message-timestamp';
        time.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        messageDiv.appendChild(content);
        messageDiv.appendChild(time);
        this.elements.messages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    formatMessage(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
    }

    showTypingIndicator() {
        const tid = document.createElement('div');
        tid.className = 'message bot-message typing-indicator-msg';
        tid.id = 'typingIndicator';
        tid.innerHTML = '<div class="message-content"><div class="typing-indicator"><span></span><span></span><span></span></div></div>';
        this.elements.messages.appendChild(tid);
        this.scrollToBottom();
    }

    removeTypingIndicator() {
        document.getElementById('typingIndicator')?.remove();
    }

    scrollToBottom() {
        this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
    }

    clearChat() {
        this.elements.messages.innerHTML = '';
        this.conversationHistory = [];
        this.leadCaptureState = 'none';
        this.sendInitialGreeting();
        this.loadSuggestions();
    }

    getCurrentStatus() {
        const hour = new Date().getHours();
        return (hour >= 18 && hour <= 21) ? 'Peak Dining Hours' : 'Online & Ready';
    }

    updateStatus() {
        const status = this.getCurrentStatus();
        document.querySelectorAll('.chatbot-status').forEach(el => el.textContent = status);
    }

    getDefaultContext() {
        return {
            restaurant: "Mozart's Restaurant",
            location: "829 Front St, Leavenworth",
            phone: "+1 509-548-0600",
            menu: "Austrian / Modern European"
        };
    }

    trackEvent(category, action, label) {
        console.log(`Track: ${category} | ${action} | ${label}`);
    }
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
    window.mozartChatbot = new MozartChatbot();
});

function toggleChatbot() { window.mozartChatbot.toggle(); }
function sendMessage() { window.mozartChatbot.sendMessage(); }
function handleChatKeyPress(e) { if (e.key === 'Enter') window.mozartChatbot.sendMessage(); }
function clearChat() { window.mozartChatbot.clearChat(); }

