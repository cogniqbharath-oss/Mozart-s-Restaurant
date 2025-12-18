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
            autoInit: config.autoInit !== false,
            welcomeMessage: config.welcomeMessage || this.getDefaultWelcomeMessage(),
            restaurantContext: config.restaurantContext || this.getDefaultContext()
        };

        // State
        this.isOpen = false;
        this.conversationHistory = [];

        // DOM Elements (will be set on init)
        this.elements = {};

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
            console.log('🎵 Initializing Mozart\'s AI Chatbot...');

            // Get DOM elements
            this.elements = {
                container: document.getElementById(this.config.containerId),
                toggle: document.getElementById(this.config.toggleId),
                messages: document.getElementById(this.config.messagesId),
                input: document.getElementById(this.config.inputId)
            };

            // Validate elements exist
            if (!this.elements.container) {
                console.error(`Mozart Chatbot: Container element '#${this.config.containerId}' not found`);
                return false;
            }

            if (!this.elements.toggle) {
                console.error(`Mozart Chatbot: Toggle button '#${this.config.toggleId}' not found`);
                return false;
            }

            if (!this.elements.messages) {
                console.warn(`Mozart Chatbot: Messages container '#${this.config.messagesId}' not found`);
            }

            if (!this.elements.input) {
                console.warn(`Mozart Chatbot: Input field '#${this.config.inputId}' not found`);
            }

            // Attach event listeners
            this.attachEventListeners();

            // Set initial status
            this.updateStatus();

            console.log('✅ Mozart\'s AI Chatbot initialized successfully!');
            console.log('   - Container:', this.elements.container ? '✓' : '✗');
            console.log('   - Toggle:', this.elements.toggle ? '✓' : '✗');
            console.log('   - Messages:', this.elements.messages ? '✓' : '✗');
            console.log('   - Input:', this.elements.input ? '✓' : '✗');

            return true;
        } catch (error) {
            console.error('❌ Mozart Chatbot initialization error:', error);
            return false;
        }
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Toggle button click - only add listener if no onclick attribute
        if (this.elements.toggle && !this.elements.toggle.hasAttribute('onclick')) {
            this.elements.toggle.addEventListener('click', () => this.toggle());
        }

        // Input enter key - only add listener if no onkeypress attribute
        if (this.elements.input && !this.elements.input.hasAttribute('onkeypress')) {
            this.elements.input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
        }

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }

    /**
     * Toggle chatbot open/close
     */
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    /**
     * Open chatbot
     */
    open() {
        this.isOpen = true;
        this.elements.container?.classList.add('active');
        this.elements.input?.focus();
        this.trackEvent('Chatbot', 'Open', 'User Action');
    }

    /**
     * Close chatbot
     */
    close() {
        this.isOpen = false;
        this.elements.container?.classList.remove('active');
        this.trackEvent('Chatbot', 'Close', 'User Action');
    }

    /**
     * Send message to AI
     */
    async sendMessage(messageText = null) {
        const message = messageText || this.elements.input?.value.trim();

        if (!message) return;

        // Add user message to chat
        this.addMessage(message, 'user');

        // Clear input
        if (this.elements.input) {
            this.elements.input.value = '';
        }

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Call API
            const response = await fetch(this.config.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    context: this.config.restaurantContext,
                    conversationHistory: this.conversationHistory.slice(-5) // Last 5 messages for context
                })
            });

            // Handle response
            if (!response.ok) {
                if (response.status === 500) {
                    const text = await response.text();
                    try {
                        const data = JSON.parse(text);
                        this.addMessage(`Error: ${data.message} ${data.details || ''}`, 'bot', 'error');
                    } catch (e) {
                        this.addMessage('Server Error (500): The server encountered an error.', 'bot', 'error');
                        console.error('Server returned 500 (Non-JSON):', text);
                    }
                    this.removeTypingIndicator();
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Remove typing indicator
            this.removeTypingIndicator();

            if (data.success) {
                // Add bot response
                this.addMessage(data.response, 'bot');

                // Store in conversation history
                this.conversationHistory.push({
                    user: message,
                    bot: data.response,
                    timestamp: new Date().toISOString()
                });
            } else {
                this.addMessage(`Error: ${data.message} ${data.details || ''}`, 'bot', 'error');
            }

            // Track interaction
            this.trackEvent('Chatbot', 'Message Sent', message.substring(0, 50));

        } catch (error) {
            console.error('Chat error:', error);
            this.removeTypingIndicator();
            this.addMessage(
                'I apologize, but I\'m having trouble connecting right now. Please call us at (509) 548-0600 or email host@mozartsrestaurant.com to make a reservation.',
                'bot',
                'error'
            );
        }
    }

    /**
     * Add message to chat interface
     */
    addMessage(text, sender = 'bot', type = 'normal') {
        if (!this.elements.messages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;

        if (type === 'error') {
            messageDiv.classList.add('error-message');
        }

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = sender === 'user' ? 'You' : 'AI';

        const content = document.createElement('div');
        content.className = 'message-content';

        // Format text with simple markdown-like formatting
        const formattedText = this.formatMessage(text);
        content.innerHTML = `<p>${formattedText}</p>`;

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);

        this.elements.messages.appendChild(messageDiv);

        // Scroll to bottom
        this.scrollToBottom();
    }

    /**
     * Format message with markdown-like syntax
     */
    formatMessage(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>')
            .replace(/`(.*?)`/g, '<code>$1</code>');
    }

    /**
     * Show typing indicator
     */
    showTypingIndicator() {
        if (!this.elements.messages) return;

        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-message';
        typingDiv.id = 'typingIndicator';

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = 'AI';

        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        indicator.innerHTML = '<span></span><span></span><span></span>';

        typingDiv.appendChild(avatar);
        typingDiv.appendChild(indicator);

        this.elements.messages.appendChild(typingDiv);
        this.scrollToBottom();
    }

    /**
     * Remove typing indicator
     */
    removeTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) {
            indicator.remove();
        }
    }

    /**
     * Scroll messages to bottom
     */
    scrollToBottom() {
        if (this.elements.messages) {
            this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
        }
    }

    /**
     * Update chatbot status
     */
    updateStatus() {
        const status = this.getCurrentStatus();
        const statusElements = document.querySelectorAll('.chatbot-status');
        statusElements.forEach(el => {
            el.textContent = status;
        });
    }

    /**
     * Get current restaurant status
     */
    getCurrentStatus() {
        const hour = new Date().getHours();
        const day = new Date().getDay();

        // Friday live music notification
        if (day === 5 && hour >= 19 && hour < 22) {
            return 'Live Music Now Playing! 🎵';
        }

        // Peak hours warning
        if (hour >= 18 && hour <= 21) {
            return 'Peak Dining Hours - Reservations Recommended';
        }

        return 'Available for Reservations';
    }

    /**
     * Get default welcome message
     */
    getDefaultWelcomeMessage() {
        return `Welcome to Mozart's Restaurant! 🎵

I'm your AI Concierge, here to help with:
• Making reservations
• Menu questions & dietary options
• Live music schedule
• Wine recommendations
• Special events & group bookings

How can I assist you today?`;
    }

    /**
     * Get default restaurant context
     */
    getDefaultContext() {
        return {
            restaurant_name: "Mozart's Restaurant",
            location: "829 Front St, Upstairs, Leavenworth, WA 98826",
            phone: "+1 509-548-0600",
            email: "host@mozartsrestaurant.com",
            price_range: "$50-$100 per person",
            specialties: [
                "Oktoberfest Sampler",
                "Pacific Northwest Salmon",
                "Wiener Schnitzel",
                "Wild Mushroom Risotto"
            ],
            live_music: "Every Friday 7:00 PM - 10:00 PM",
            dietary_options: "Gluten-free and vegetarian options available",
            pain_points: [
                "Reservation system currently being updated",
                "High-value dining - reservations recommended",
                "Service may be slower during peak hours",
                "Large groups require advance notice"
            ]
        };
    }

    /**
     * Track events (analytics)
     */
    trackEvent(category, action, label) {
        console.log('Event tracked:', { category, action, label });

        // Add your analytics tracking here
        if (window.gtag) {
            window.gtag('event', action, {
                event_category: category,
                event_label: label
            });
        }

        if (window.dataLayer) {
            window.dataLayer.push({
                event: 'chatbot_interaction',
                category: category,
                action: action,
                label: label
            });
        }
    }

    /**
     * Add quick suggestion buttons
     */
    addQuickSuggestions(suggestions) {
        if (!this.elements.messages) return;

        const suggestionsContainer = document.createElement('div');
        suggestionsContainer.className = 'quick-suggestions';

        suggestions.forEach(suggestion => {
            const button = document.createElement('button');
            button.className = 'quick-suggestion-btn';
            button.textContent = suggestion;
            button.onclick = () => {
                this.sendMessage(suggestion);
                suggestionsContainer.remove();
            };
            suggestionsContainer.appendChild(button);
        });

        this.elements.messages.appendChild(suggestionsContainer);
        this.scrollToBottom();
    }

    /**
     * Clear conversation
     */
    clearConversation() {
        if (this.elements.messages) {
            this.elements.messages.innerHTML = '';
            this.conversationHistory = [];
        }
    }

    /**
     * Get conversation history
     */
    getHistory() {
        return this.conversationHistory;
    }

    /**
     * Export conversation
     */
    exportConversation() {
        return JSON.stringify(this.conversationHistory, null, 2);
    }
}

// Global helper functions for backward compatibility
let mozartChatbot = null;

function toggleChatbot() {
    if (mozartChatbot) {
        mozartChatbot.toggle();
    } else {
        console.warn('Mozart Chatbot: Chatbot not initialized yet. Attempting to initialize...');
        // Try to initialize if not already done
        if (!mozartChatbot) {
            mozartChatbot = new MozartChatbot();
            // Give it a moment to initialize, then try again
            setTimeout(() => {
                if (mozartChatbot) {
                    mozartChatbot.toggle();
                }
            }, 100);
        }
    }
}

function sendMessage() {
    if (mozartChatbot) {
        mozartChatbot.sendMessage();
    } else {
        console.warn('Mozart Chatbot: Chatbot not initialized yet.');
    }
}

function handleChatKeyPress(event) {
    if (event.key === 'Enter' && mozartChatbot) {
        mozartChatbot.sendMessage();
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('📄 DOM loaded, initializing chatbot...');
        mozartChatbot = new MozartChatbot();
        window.mozartChatbot = mozartChatbot;
    });
} else {
    console.log('📄 DOM already loaded, initializing chatbot immediately...');
    mozartChatbot = new MozartChatbot();
    window.mozartChatbot = mozartChatbot;
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MozartChatbot;
}

// Export class and functions to window immediately
if (typeof window !== 'undefined') {
    window.MozartChatbot = MozartChatbot;
    window.toggleChatbot = toggleChatbot;
    window.sendMessage = sendMessage;
    window.handleChatKeyPress = handleChatKeyPress;

    console.log('🌐 Mozart Chatbot functions exported to window object');
}
