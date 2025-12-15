// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile Navigation Toggle
const navToggle = document.getElementById('navToggle');
const navMenu = document.querySelector('.nav-menu');

if (navToggle) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
}

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                // Close mobile menu if open
                navMenu?.classList.remove('active');
            }
        }
    });
});

// Chatbot functionality
let isChatbotOpen = false;
const chatbotContainer = document.getElementById('chatbotContainer');
const chatbotToggle = document.getElementById('chatbotToggle');
const chatbotMessages = document.getElementById('chatbotMessages');
const chatbotInput = document.getElementById('chatbotInput');

function toggleChatbot() {
    isChatbotOpen = !isChatbotOpen;
    chatbotContainer.classList.toggle('active', isChatbotOpen);

    if (isChatbotOpen) {
        chatbotInput.focus();
    }
}

// Handle Enter key in chat input
function handleChatKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Send message to chatbot
async function sendMessage() {
    const message = chatbotInput.value.trim();

    if (!message) return;

    // Add user message to chat
    addMessageToChat(message, 'user');

    // Clear input
    chatbotInput.value = '';

    // Show typing indicator
    showTypingIndicator();

    try {
        // Call API
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                context: {
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
                }
            })
        });

        const data = await response.json();

        // Remove typing indicator
        removeTypingIndicator();

        if (data.success) {
            // Add bot response to chat
            addMessageToChat(data.response, 'bot');
        } else {
            addMessageToChat('I apologize, but I encountered an error. Please try calling us at (509) 548-0600 or emailing host@mozartsrestaurant.com for assistance.', 'bot');
        }
    } catch (error) {
        console.error('Chat error:', error);
        removeTypingIndicator();
        addMessageToChat('I apologize, but I\'m having trouble connecting right now. Please call us at (509) 548-0600 or email host@mozartsrestaurant.com to make a reservation.', 'bot');
    }
}

// Add message to chat interface
function addMessageToChat(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = sender === 'user' ? 'You' : 'AI';

    const content = document.createElement('div');
    content.className = 'message-content';

    // Simple markdown-like formatting
    const formattedText = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');

    content.innerHTML = `<p>${formattedText}</p>`;

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);

    chatbotMessages.appendChild(messageDiv);

    // Scroll to bottom
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

// Show typing indicator
function showTypingIndicator() {
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

    chatbotMessages.appendChild(typingDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

// Remove typing indicator
function removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.remove();
    }
}

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe sections for animation
document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });

    // Animate menu cards on hover
    const menuCards = document.querySelectorAll('.menu-card');
    menuCards.forEach(card => {
        card.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });

        card.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Parallax effect for hero
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero-content');
        if (hero) {
            hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });
});

// Restaurant-specific helper functions
function formatPhoneNumber(phone) {
    return phone.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, '+$1 ($2) $3-$4');
}

function getCurrentStatus() {
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

// Update status badge if exists
const statusElements = document.querySelectorAll('.chatbot-status');
statusElements.forEach(el => {
    el.textContent = getCurrentStatus();
});

// Analytics tracking (placeholder)
function trackEvent(category, action, label) {
    console.log('Event tracked:', { category, action, label });
    // Add your analytics tracking here (Google Analytics, etc.)
}

// Track chatbot interactions
chatbotToggle?.addEventListener('click', () => {
    trackEvent('Chatbot', isChatbotOpen ? 'Close' : 'Open', 'Toggle');
});

// Track menu card clicks
document.querySelectorAll('.menu-card').forEach(card => {
    card.addEventListener('click', function () {
        const dishName = this.querySelector('h3')?.textContent;
        trackEvent('Menu', 'View', dishName);
    });
});

// Handle form submissions (if any are added)
function handleReservationSubmit(formData) {
    trackEvent('Reservation', 'Submit', 'Contact Form');
    // Add reservation handling logic
}

// Error handling for images
document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', function () {
        this.style.display = 'none';
        console.warn('Image failed to load:', this.src);
    });
});

// Quick suggestions for chatbot
const quickSuggestions = [
    "Make a reservation for tonight",
    "What's the Oktoberfest Sampler?",
    "Do you have gluten-free options?",
    "When is live music?",
    "What's your wine selection like?",
    "Can you accommodate large groups?"
];

// Add quick suggestions to chatbot (optional enhancement)
function addQuickSuggestions() {
    const suggestionsHTML = quickSuggestions.map(suggestion =>
        `<button class="quick-suggestion" onclick="selectSuggestion('${suggestion}')">${suggestion}</button>`
    ).join('');

    // You can add this to the chatbot interface if desired
    console.log('Quick suggestions available:', quickSuggestions);
}

function selectSuggestion(suggestion) {
    chatbotInput.value = suggestion;
    sendMessage();
}

// Initialize
console.log('Mozart\'s Restaurant website loaded successfully! 🎵');
console.log('AI Concierge ready to assist with reservations and inquiries.');
