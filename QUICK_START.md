# 🚀 Quick Start Guide - Mozart's Chatbot Worker

## Get Started in 3 Minutes!

### ⚡ Super Quick Setup

Want to add the chatbot to a new page? Follow these 3 simple steps:

#### Step 1: Add CSS to `<head>`
```html
<link rel="stylesheet" href="chatbot.css">
```

#### Step 2: Add JavaScript before `</body>`
```html
<script src="workers.js"></script>
```

#### Step 3: Copy the Chatbot HTML

Copy this entire block and paste it before your closing `</body>` tag:

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
        <div class="message bot-message">
            <div class="message-avatar">AI</div>
            <div class="message-content">
                <p>Welcome to Mozart's Restaurant! 🎵</p>
                <p>I'm your AI Concierge. How can I assist you today?</p>
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

### ✅ That's It!

Your chatbot is now fully functional! It will:
- ✅ Auto-initialize when the page loads
- ✅ Connect to your `/api/chat` endpoint
- ✅ Track conversation history
- ✅ Handle errors gracefully
- ✅ Work on all devices

---

## 🎮 Common Use Cases

### 1. Open Chatbot from a Button
```html
<button onclick="toggleChatbot()">Chat with Us</button>
```

### 2. Send a Pre-filled Message
```javascript
function askAboutMenu() {
    window.mozartChatbot.open();
    setTimeout(() => {
        window.mozartChatbot.sendMessage("Tell me about your menu");
    }, 300);
}
```

### 3. Add Quick Suggestions
```javascript
window.mozartChatbot.addQuickSuggestions([
    "Make a reservation",
    "View menu",
    "Contact us"
]);
```

### 4. Get Conversation History
```javascript
const history = window.mozartChatbot.getHistory();
console.log(history);
```

---

## 🎨 Quick Customization

### Change Colors
Add this to your CSS:
```css
:root {
    --chatbot-primary: #8b4513;      /* Main color */
    --chatbot-secondary: #a0522d;    /* Secondary color */
    --chatbot-bg: rgba(20, 20, 30, 0.95); /* Background */
}
```

### Change Welcome Message
Edit the HTML in the chatbot container:
```html
<div class="message bot-message">
    <div class="message-avatar">AI</div>
    <div class="message-content">
        <p>Your custom welcome message here!</p>
    </div>
</div>
```

---

## 🔍 Testing

### Test the Chatbot
1. Open your page in a browser
2. Click the chatbot button (bottom-right corner)
3. Type a message and press Enter
4. You should see a response from the AI

### Test Quick Suggestions
Open browser console and run:
```javascript
window.mozartChatbot.addQuickSuggestions([
    "Test message 1",
    "Test message 2"
]);
```

### Check if Chatbot is Loaded
Open browser console and run:
```javascript
console.log(window.mozartChatbot);
```
You should see the `MozartChatbot` object.

---

## 🐛 Troubleshooting

### Chatbot Button Doesn't Appear?
- ✅ Check that `chatbot.css` is loaded
- ✅ Check that `workers.js` is loaded
- ✅ Look for errors in browser console

### Chatbot Opens but No Messages Send?
- ✅ Check that `/api/chat` endpoint is working
- ✅ Open Network tab in DevTools
- ✅ Look for failed API requests

### Styling Looks Wrong?
- ✅ Clear browser cache
- ✅ Check for CSS conflicts
- ✅ Ensure `chatbot.css` loads after your main CSS

---

## 📚 Learn More

- **Full Documentation**: See `CHATBOT_README.md`
- **Architecture**: See `ARCHITECTURE.md`
- **Example Page**: Open `chatbot-example.html`
- **Implementation Details**: See `IMPLEMENTATION_SUMMARY.md`

---

## 💡 Pro Tips

### Tip 1: Keyboard Shortcuts
- Press **Escape** to close the chatbot
- Press **Enter** to send a message

### Tip 2: Mobile Friendly
The chatbot automatically adapts to mobile screens!

### Tip 3: Analytics
If you have Google Analytics or GTM, events are automatically tracked!

### Tip 4: Error Messages
The chatbot shows user-friendly error messages if something goes wrong.

### Tip 5: Conversation Context
The chatbot remembers the last 5 messages for better context.

---

## 🎯 Next Steps

### For Beginners
1. ✅ Copy the 3-step setup above
2. ✅ Test on your page
3. ✅ Customize the colors
4. ✅ Done!

### For Advanced Users
1. ✅ Read `CHATBOT_README.md` for all features
2. ✅ Customize the `MozartChatbot` class
3. ✅ Add custom analytics
4. ✅ Extend with new features

---

## 🆘 Need Help?

### Quick Checks
1. Is `workers.js` loaded? Check browser console
2. Is the API endpoint working? Check Network tab
3. Are there any errors? Check Console tab

### Common Issues
- **404 Error**: Check file paths are correct
- **CORS Error**: Ensure API is on same domain or CORS is enabled
- **No Response**: Check backend is running

### Still Stuck?
- Check the example page: `chatbot-example.html`
- Review the documentation: `CHATBOT_README.md`
- Look at the architecture: `ARCHITECTURE.md`

---

## ✨ Success Checklist

Before you finish, make sure:
- [ ] Chatbot button appears on your page
- [ ] Clicking the button opens the chatbot
- [ ] You can send a message
- [ ] You receive a response
- [ ] The chatbot looks good on mobile
- [ ] No errors in the console

If all boxes are checked, you're done! 🎉

---

**Quick Start Version**: 1.0.0  
**Last Updated**: December 18, 2024  
**Estimated Setup Time**: 3 minutes ⚡
