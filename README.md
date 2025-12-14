# Mozart's Restaurant Website

A premium, modern website for Mozart's Restaurant featuring an AI-powered concierge chatbot using Google's Gemini 1.5 Flash.

## 🎵 Features

- **Premium Design**: Dark theme with glassmorphism effects and smooth animations
- **AI Concierge**: Gemini-powered chatbot for reservations and customer inquiries
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile devices
- **Dynamic Content**: Interactive menu, events calendar, and wine cellar showcase
- **SEO Optimized**: Proper meta tags, semantic HTML, and accessibility features

## 🚀 Quick Start

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set your Gemini API key:**
   
   **Option A: Environment Variable (Recommended)**
   ```bash
   # Windows (PowerShell)
   $env:GEMINI_API_KEY="your_api_key_here"
   
   # Windows (Command Prompt)
   set GEMINI_API_KEY=your_api_key_here
   
   # Linux/Mac
   export GEMINI_API_KEY=your_api_key_here
   ```
   
   **Option B: Edit server.py**
   Open `server.py` and replace `YOUR_API_KEY_HERE` with your actual API key on line 13.

3. **Start the server:**
   ```bash
   python server.py
   ```

4. **Open the website:**
   - Open `index.html` in your web browser
   - Or use a local server: `python -m http.server 8000`
   - Navigate to: `http://localhost:8000`

## 📂 Project Structure

```
mozarts-restaurant/
├── index.html          # Main HTML file
├── styles.css          # Premium CSS with glassmorphism
├── script.js           # Frontend JavaScript & chatbot logic
├── server.py           # Flask backend with Gemini API
├── requirements.txt    # Python dependencies
├── README.md           # This file
└── assets/             # Images and media (add your images here)
```

## 🤖 AI Chatbot Features

The AI Concierge helps customers with:
- Making reservations
- Menu questions and dietary options
- Live music schedule
- Wine recommendations
- Special events and group bookings
- Answering FAQs

The chatbot is trained with restaurant-specific context including:
- Menu items and pricing
- Dietary accommodations (GF, vegetarian)
- Live music schedule (Friday nights)
- Peak hours and service timing
- Reservation policies

## 🎨 Customization

### Adding Images

Replace placeholder images in the `assets` folder:
- `hero-background.jpg` - Main hero section background
- `restaurant-interior.jpg` - About section image
- `signature-dish.jpg` - Menu highlight image
- `wine-cellar.jpg` - Wine section image
- `live-music.jpg` - Events section image

Update image paths in `index.html` and `styles.css`.

### Changing Colors

Edit CSS variables in `styles.css` (lines 1-25):
```css
--color-primary: hsl(340, 82%, 52%);    /* Main brand color */
--color-secondary: hsl(45, 100%, 51%);  /* Accent color */
--color-accent: hsl(280, 70%, 60%);     /* Secondary accent */
```

### Modifying Restaurant Information

Update restaurant details in:
- `index.html` - Contact info, menu items, sections
- `server.py` - `RESTAURANT_CONTEXT` variable for AI responses

## 📡 API Endpoints

The backend server provides these endpoints:

- `POST /api/chat` - AI chatbot conversation
- `GET /api/menu` - Menu information
- `GET /api/events` - Events and live music schedule
- `GET /api/contact` - Contact information
- `GET /api/health` - Health check

## 🔒 Security Notes

- Never commit your API key to version control
- Use environment variables for production
- Enable HTTPS in production
- Add rate limiting for the chat endpoint
- Validate and sanitize all user inputs

## 🌐 Deployment

### Frontend Deployment (Netlify/Vercel)
1. Upload `index.html`, `styles.css`, `script.js`, and `assets/`
2. Update API endpoint in `script.js` to your backend URL

### Backend Deployment (Heroku/Railway/Render)
1. Add `Procfile`: `web: python server.py`
2. Set `GEMINI_API_KEY` environment variable
3. Deploy with Git

## 🎯 Pain Points Addressed

1. **Reservation System**: AI chatbot handles reservation requests 24/7
2. **High-Value No-Shows**: Automated confirmation reminders
3. **Information Overload**: AI answers FAQs instantly
4. **Service Speed**: Sets expectations about peak hours

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📝 License

© 2024 Mozart's Restaurant. All rights reserved.

## 🆘 Support

For issues or questions:
- Restaurant: (509) 548-0600
- Email: host@mozartsrestaurant.com
- Website: mozartsrestaurant.com

## 🙏 Credits

- Design: Modern premium web design with glassmorphism
- AI: Google Gemini 1.5 Flash
- Fonts: Google Fonts (Playfair Display, Inter)
- Icons: Custom SVG icons

---

**Built with ❤️ for Mozart's Restaurant**
