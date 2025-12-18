# Mozart's Restaurant - Chatbot Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER'S BROWSER                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐         ┌──────────────┐                      │
│  │  index.html  │         │  other.html  │  (Any page)          │
│  │              │         │              │                       │
│  │  ┌────────┐  │         │  ┌────────┐  │                      │
│  │  │Chatbot │  │         │  │Chatbot │  │                      │
│  │  │  HTML  │  │         │  │  HTML  │  │                      │
│  │  └────────┘  │         │  └────────┘  │                      │
│  └──────┬───────┘         └──────┬───────┘                      │
│         │                        │                               │
│         └────────────┬───────────┘                               │
│                      │                                           │
│         ┌────────────▼────────────┐                              │
│         │    chatbot.css          │  ← Styling                   │
│         │  (Modular Styles)       │                              │
│         └─────────────────────────┘                              │
│                      │                                           │
│         ┌────────────▼────────────┐                              │
│         │    workers.js           │  ← Controller                │
│         │  (MozartChatbot Class)  │                              │
│         │                         │                              │
│         │  • Auto-init            │                              │
│         │  • Message handling     │                              │
│         │  • API calls            │                              │
│         │  • History tracking     │                              │
│         │  • Quick suggestions    │                              │
│         │  • Analytics            │                              │
│         └────────────┬────────────┘                              │
│                      │                                           │
│         ┌────────────▼────────────┐                              │
│         │    script.js            │  ← General Website           │
│         │  (Website Functions)    │                              │
│         │                         │                              │
│         │  • Navigation           │                              │
│         │  • Animations           │                              │
│         │  • Menu interactions    │                              │
│         │  • Analytics            │                              │
│         └─────────────────────────┘                              │
│                                                                   │
└───────────────────────────┬───────────────────────────────────────┘
                            │
                            │ HTTP POST
                            │ /api/chat
                            │
┌───────────────────────────▼───────────────────────────────────────┐
│                        SERVER SIDE                                 │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  functions/api/chat.js (Cloudflare Function)             │    │
│  │                                                           │    │
│  │  • Receives user message                                 │    │
│  │  • Adds restaurant context                               │    │
│  │  • Calls Gemini API                                      │    │
│  │  • Returns formatted response                            │    │
│  └────────────────────────┬─────────────────────────────────┘    │
│                            │                                       │
│                            │ API Call                              │
│                            │                                       │
│  ┌────────────────────────▼─────────────────────────────────┐    │
│  │  Google Gemini API                                       │    │
│  │  (gemini-flash-lite-latest)                              │    │
│  │                                                           │    │
│  │  • Processes request                                     │    │
│  │  • Generates AI response                                 │    │
│  │  • Returns to chat.js                                    │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

## Data Flow

```
1. USER INTERACTION
   ↓
   User clicks chatbot button or types message
   ↓
2. WORKERS.JS (Client-side)
   ↓
   • Captures user input
   • Adds to conversation history
   • Shows typing indicator
   ↓
3. API REQUEST
   ↓
   POST /api/chat
   {
     message: "User's question",
     context: { restaurant info },
     conversationHistory: [...]
   }
   ↓
4. CHAT.JS (Server-side)
   ↓
   • Receives request
   • Adds current time/day context
   • Formats prompt with restaurant info
   ↓
5. GEMINI API
   ↓
   • Processes prompt
   • Generates response
   ↓
6. RESPONSE BACK
   ↓
   {
     success: true,
     response: "AI answer",
     timestamp: "..."
   }
   ↓
7. WORKERS.JS (Client-side)
   ↓
   • Removes typing indicator
   • Displays AI response
   • Updates conversation history
   • Scrolls to bottom
   ↓
8. USER SEES RESPONSE
```

## Component Relationships

```
┌─────────────────────────────────────────────────────────┐
│                    CHATBOT SYSTEM                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐                                       │
│  │ workers.js   │  ← Core Controller                    │
│  │              │                                        │
│  │  Contains:   │                                        │
│  │  • MozartChatbot class                               │
│  │  • Global helper functions                           │
│  │  • Event handlers                                    │
│  │  • API integration                                   │
│  └──────┬───────┘                                       │
│         │                                                │
│         ├─── Uses ───→ chatbot.css (Styling)            │
│         │                                                │
│         ├─── Calls ──→ /api/chat (Backend)              │
│         │                                                │
│         ├─── Tracks ─→ Analytics (gtag/dataLayer)       │
│         │                                                │
│         └─── Stores ─→ Conversation History (Memory)    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## File Dependencies

```
index.html
  ├── Requires: chatbot.css
  ├── Requires: workers.js
  └── Requires: script.js

workers.js
  ├── Requires: DOM elements (chatbotContainer, etc.)
  ├── Calls: /api/chat endpoint
  └── Optional: Analytics (gtag, dataLayer)

chatbot.css
  └── Standalone (no dependencies)

chat.js (Backend)
  ├── Requires: Gemini API key
  └── Calls: Gemini API
```

## Integration Points

### 1. HTML Integration
```html
<!-- Include in any page -->
<link rel="stylesheet" href="chatbot.css">
<script src="workers.js"></script>
```

### 2. JavaScript Integration
```javascript
// Access global instance
window.mozartChatbot

// Use global functions
toggleChatbot()
sendMessage()
```

### 3. CSS Integration
```css
/* Override in your styles.css */
:root {
  --chatbot-primary: #8b4513;
}
```

### 4. API Integration
```javascript
// Backend endpoint
POST /api/chat

// Request format
{ message, context, conversationHistory }

// Response format
{ success, response, timestamp }
```

## Scalability

### Adding to New Pages
```
1. Copy chatbot HTML structure
2. Include chatbot.css
3. Include workers.js
4. Done! ✅
```

### Customizing Behavior
```
1. Create new MozartChatbot instance
2. Pass custom configuration
3. Call init() manually
```

### Extending Features
```
1. Extend MozartChatbot class
2. Add new methods
3. Override existing methods
```

## Security Flow

```
CLIENT (Browser)
  ↓
  User input sanitized by workers.js
  ↓
  HTTPS POST to /api/chat
  ↓
SERVER (Cloudflare Function)
  ↓
  Validates request
  ↓
  API key stored server-side only
  ↓
  Calls Gemini API securely
  ↓
  Returns sanitized response
  ↓
CLIENT (Browser)
  ↓
  Displays formatted response
```

## Performance Optimization

```
┌─────────────────────────────────────────┐
│  OPTIMIZATION STRATEGIES                 │
├─────────────────────────────────────────┤
│                                          │
│  1. Lazy Loading                         │
│     • Chatbot loads on page ready        │
│     • API called only when needed        │
│                                          │
│  2. Conversation History                 │
│     • Stores only last 5 messages        │
│     • Reduces payload size               │
│                                          │
│  3. Debouncing                           │
│     • One API call per message           │
│     • No duplicate requests              │
│                                          │
│  4. Caching                              │
│     • Conversation stored in memory      │
│     • No repeated API calls              │
│                                          │
│  5. Minification (Production)            │
│     • Minify workers.js                  │
│     • Minify chatbot.css                 │
│     • Compress assets                    │
│                                          │
└─────────────────────────────────────────┘
```

---

**Architecture Version**: 1.0.0  
**Last Updated**: December 18, 2024  
**Status**: Production Ready ✨
