# Mozart's Restaurant - AI Chatbot Worker

## Overview

The `workers.js` file provides a centralized, reusable chatbot control system for Mozart's Restaurant website. This modular approach allows the chatbot to be easily integrated across multiple pages and maintained from a single source.

## Features

✨ **Class-Based Architecture** - Object-oriented design for better code organization
🔄 **Auto-Initialization** - Automatically sets up when the DOM is ready
💬 **Conversation History** - Maintains context across messages
🎨 **Markdown Support** - Formats messages with bold, italic, and code
📊 **Analytics Integration** - Built-in event tracking
🚀 **Quick Suggestions** - Predefined message buttons for common queries
⚡ **Error Handling** - Graceful error management with user-friendly messages
📱 **Responsive Design** - Works seamlessly on all devices

## Installation

### 1. Include Required Files

Add these files to your HTML page in the correct order:

```html
<!-- In the <head> section -->
<link rel="stylesheet" href="chatbot.css">

<!-- Before closing </body> tag -->
<script src="workers.js"></script>
<script src="script.js"></script>
```

### 2. HTML Structure

Ensure your HTML includes the chatbot elements:

```html
<!-- AI Chatbot Container -->
<div class="chatbot-container" id="chatbotContainer">
    <div class="chatbot-header">
        <div class="chatbot-header-info">
            <div class="chatbot-avatar">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
            </div>
            <div>
                <h4>Mozart's AI Concierge</h4>
                <span class="chatbot-status">Online</span>
            </div>
        </div>
        <button class="chatbot-close" onclick="toggleChatbot()">&times;</button>
    </div>
    <div class="chatbot-messages" id="chatbotMessages">
        <!-- Welcome message -->
        <div class="message bot-message">
            <div class="message-avatar">AI</div>
            <div class="message-content">
                <p>Welcome to Mozart's Restaurant! 🎵</p>
                <p>How can I assist you today?</p>
            </div>
        </div>
    </div>
    <div class="chatbot-input">
        <input type="text" id="chatbotInput" placeholder="Ask about reservations, menu, events..."
            onkeypress="handleChatKeyPress(event)">
        <button onclick="sendMessage()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 2L11 13" />
                <path d="M22 2L15 22L11 13L2 9L22 2z" />
            </svg>
        </button>
    </div>
</div>

<!-- Chatbot Toggle Button -->
<button class="chatbot-toggle" id="chatbotToggle" onclick="toggleChatbot()">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
    <span class="chatbot-badge">AI</span>
</button>
```

## Usage

### Basic Usage

The chatbot auto-initializes when the page loads. Users can:

1. Click the floating chatbot button to open
2. Type messages and press Enter or click Send
3. Press Escape to close the chatbot

### Global Functions

For backward compatibility, these global functions are available:

```javascript
// Toggle chatbot open/close
toggleChatbot();

// Send a message
sendMessage();

// Handle Enter key press
handleChatKeyPress(event);
```

### Advanced Usage

Access the chatbot instance directly for advanced features:

```javascript
// Access the global chatbot instance
const chatbot = window.mozartChatbot;

// Send a programmatic message
chatbot.sendMessage("What are your hours?");

// Add quick suggestion buttons
chatbot.addQuickSuggestions([
    "Make a reservation",
    "View menu",
    "Contact us"
]);

// Get conversation history
const history = chatbot.getHistory();
console.log(history);

// Export conversation
const exportData = chatbot.exportConversation();

// Clear conversation
chatbot.clearConversation();

// Manually open/close
chatbot.open();
chatbot.close();
```

### Custom Configuration

Create a custom chatbot instance with your own configuration:

```javascript
const customChatbot = new MozartChatbot({
    apiEndpoint: '/api/custom-chat',
    containerId: 'myChatbot',
    toggleId: 'myToggle',
    messagesId: 'myMessages',
    inputId: 'myInput',
    autoInit: false, // Don't auto-initialize
    welcomeMessage: 'Custom welcome message',
    restaurantContext: {
        // Your custom context
    }
});

// Initialize manually
customChatbot.init();
```

## API Integration

### Request Format

The chatbot sends POST requests to `/api/chat` with this structure:

```json
{
    "message": "User's message",
    "context": {
        "restaurant_name": "Mozart's Restaurant",
        "location": "829 Front St, Upstairs, Leavenworth, WA 98826",
        "phone": "+1 509-548-0600",
        "email": "host@mozartsrestaurant.com",
        "price_range": "$50-$100 per person",
        "specialties": [...],
        "live_music": "Every Friday 7:00 PM - 10:00 PM",
        "dietary_options": "Gluten-free and vegetarian options available",
        "pain_points": [...]
    },
    "conversationHistory": [...]
}
```

### Expected Response Format

```json
{
    "success": true,
    "response": "AI response text",
    "timestamp": "2024-12-18T10:00:00.000Z"
}
```

### Error Response Format

```json
{
    "success": false,
    "error": "Error type",
    "message": "Error message",
    "details": "Additional details"
}
```

## Analytics Integration

The chatbot automatically tracks events. It supports:

### Google Analytics (gtag.js)

```javascript
// Events are automatically sent if gtag is available
window.gtag('event', 'action', {
    event_category: 'category',
    event_label: 'label'
});
```

### Google Tag Manager (dataLayer)

```javascript
// Events are automatically pushed to dataLayer
window.dataLayer.push({
    event: 'chatbot_interaction',
    category: 'category',
    action: 'action',
    label: 'label'
});
```

## Customization

### Styling

The chatbot uses CSS variables for easy theming. Override these in your `styles.css`:

```css
:root {
    --chatbot-primary: #8b4513;
    --chatbot-secondary: #a0522d;
    --chatbot-bg: rgba(20, 20, 30, 0.95);
    --chatbot-text: #f5f5f5;
}
```

### Message Formatting

The chatbot supports markdown-like formatting:

- `**bold text**` → **bold text**
- `*italic text*` → *italic text*
- `` `code` `` → `code`
- Line breaks with `\n`

## Methods Reference

### MozartChatbot Class

| Method | Description |
|--------|-------------|
| `init()` | Initialize the chatbot |
| `toggle()` | Toggle chatbot open/close |
| `open()` | Open the chatbot |
| `close()` | Close the chatbot |
| `sendMessage(text)` | Send a message |
| `addMessage(text, sender, type)` | Add a message to the chat |
| `showTypingIndicator()` | Show typing animation |
| `removeTypingIndicator()` | Remove typing animation |
| `addQuickSuggestions(array)` | Add suggestion buttons |
| `clearConversation()` | Clear all messages |
| `getHistory()` | Get conversation history |
| `exportConversation()` | Export conversation as JSON |
| `updateStatus()` | Update chatbot status |
| `getCurrentStatus()` | Get current restaurant status |

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Chatbot doesn't appear

1. Check that all required files are loaded
2. Verify HTML elements have correct IDs
3. Check browser console for errors
4. Ensure `workers.js` loads before `script.js`

### Messages not sending

1. Verify API endpoint is correct
2. Check network tab for failed requests
3. Ensure backend is running
4. Check CORS settings if on different domain

### Styling issues

1. Ensure `chatbot.css` is loaded
2. Check for CSS conflicts
3. Verify CSS variables are defined
4. Clear browser cache

## Performance

- **Initial Load**: ~15KB (minified)
- **Memory Usage**: ~2-5MB
- **API Calls**: Debounced, max 1 per message
- **Conversation History**: Stores last 5 messages for context

## Security

- Input sanitization for XSS prevention
- HTTPS required for production
- API key stored server-side only
- No sensitive data in localStorage

## Future Enhancements

- [ ] Voice input support
- [ ] Multi-language support
- [ ] File upload capability
- [ ] Emoji picker
- [ ] Message reactions
- [ ] Conversation export to PDF
- [ ] Offline mode with service worker

## License

© 2024 Mozart's Restaurant. All rights reserved.

## Support

For issues or questions:
- Email: dev@mozartsrestaurant.com
- GitHub: [Repository URL]

---

**Version**: 1.0.0  
**Last Updated**: December 18, 2024  
**Author**: Mozart's Restaurant Development Team
