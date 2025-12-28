from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
from datetime import datetime
import json
import urllib.request
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize Flask with static folder configuration to serve files from root
app = Flask(__name__, static_url_path='', static_folder='.')
CORS(app)  # Enable CORS for frontend communication

# Configure Gemini API
# It's recommended to set this in a .env file
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if not GEMINI_API_KEY:
    # Fallback to hardcoded key only if .env is missing (NOT RECOMMENDED)
    GEMINI_API_KEY = 'AIzaSyDW7cMPZMJH-TfyqlZxqJYeui0vinuw1v8'

genai.configure(api_key=GEMINI_API_KEY)

# Initialize Gemini models to try (in order of preference)
# Using models that are confirmed to work with this API key
MODELS_TO_TRY = [
    'models/gemini-2.0-flash-lite',
    'models/gemini-1.5-flash',
    'models/gemini-1.5-flash-8b',
    'models/gemini-flash-lite-latest',
    'models/gemini-2.5-flash-lite',
    'models/gemini-2.0-flash',
    'models/gemini-flash-latest'
]

# Restaurant context for AI responses
RESTAURANT_CONTEXT = """
You are the "Mozart's AI Concierge", a sophisticated and helpful AI assistant for Mozart's Restaurant in Leavenworth, WA.
You are powered by Google Gemini 1.5 Flash technology.

STRICT INSTRUCTIONS:
1. ONLY provide information about Mozart's Restaurant. If asked about other topics, politely redirect to restaurant services.
2. NEVER guess or hallucinate. If you don't know something, offer to have a human staff member contact them.
3. PREVENT HALLUCINATION: Accuracy is paramount for high-value dining. If asked for specific recipes or internal secrets, politely decline and offer menu descriptions.
4. LEAD CAPTURE: If the user expresses interest in booking, events, or catering, encourage them to provide their contact details. Note: The frontend handles some state, but you should be proactive in asking if the flow feels natural.

RESTAURANT KNOWLEDGE BASE:
- Name: Mozart's Restaurant
- Ownership: Woman-owned since 1980.
- Location: 829 Front St, Upstairs, Leavenworth, WA 98826.
- Atmosphere: Romantic, European Elegance, Fine Dining.
- Cuisine: Modern European, Austrian specialties, and Pacific Northwest fusion.
- Price Point: $50-$100 per person.

KEY SERVICES & FEATURES:
- Live Music: Every Friday night (7:00 PM - 10:00 PM).
- Wine Cellar: Extensive, temperature-controlled, 200+ selections.
- Dietary: High focus on Gluten-Free (GF) and Vegetarian (V) options.
- Signature Dish: Oktoberfest Sampler (Bratwurst, schnitzel, sauerkraut, spätzle).
- Other Dishes: PNW Salmon ($42), Wiener Schnitzel ($38), Wild Mushroom Risotto ($32).

OPERATIONAL NOTES:
- Reservations: SYSTEM IS CURRENTLY BEING UPDATED. Customers MUST call +1 509-548-0600 or email host@mozartsrestaurant.com.
- Peak Hours: 6:00 PM - 9:00 PM. Service may be slower; off-peak visits recommended for speed.
- Groups: Large groups require advance notice.

RESPONSE TONE:
Warm, professional, sophisticated, and human-like. Reflect the high-value fine dining experience.
"""

def get_current_day_info():
    """Get current day and time information for context"""
    now = datetime.now()
    day_name = now.strftime("%A")
    current_hour = now.hour
    
    info = f"Current day: {day_name}, Current time: {now.strftime('%I:%M %p')}\n"
    
    # Add live music notification if Friday evening
    if day_name == "Friday" and 19 <= current_hour < 22:
        info += "SPECIAL: Live music is currently playing! 🎵\n"
    elif day_name == "Friday":
        info += "REMINDER: Live music tonight from 7:00 PM - 10:00 PM!\n"
    
    # Peak hours warning
    if 18 <= current_hour <= 21:
        info += "NOTE: Currently peak dining hours - service may be slower. Reservations recommended.\n"
    
    return info

@app.route('/api/chat', methods=['POST', 'OPTIONS'])
def chat():
    """
    Main chat endpoint for Gemini AI integration
    Receives messages from frontend and returns AI responses
    """
    # Handle CORS preflight
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    
    try:
        # Get request data
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({
                'success': False,
                'error': 'No message provided'
            }), 400
        
        user_message = data['message']
        context = data.get('context', {})
        
        # Ping check for debugging
        if user_message.lower() == 'ping':
            return jsonify({
                'success': True,
                'response': 'Pong! API is working. 🏓',
                'timestamp': datetime.now().isoformat()
            })
        
        # Build the complete prompt
        current_info = get_current_day_info()
        
        prompt = f"""{RESTAURANT_CONTEXT}

{current_info}

CUSTOMER QUESTION/REQUEST:
{user_message}

Provide a helpful, professional response that addresses their needs while maintaining the upscale, European fine dining atmosphere of Mozart's Restaurant. Be warm and engaging.
"""
        
        # Try multiple models
        last_error = None
        for model_name in MODELS_TO_TRY:
            try:
                print(f"Trying model: {model_name}")
                model = genai.GenerativeModel(model_name)
                
                # Generate response using Gemini
                response = model.generate_content(
                    prompt,
                    generation_config={
                        'temperature': 0.7,
                        'max_output_tokens': 1024,
                    }
                )
                
                # Extract the response text
                ai_response = response.text
                
                print(f"Success with model: {model_name}")
                
                return jsonify({
                    'success': True,
                    'response': ai_response,
                    'model': model_name,
                    'timestamp': datetime.now().isoformat()
                })
                
            except Exception as model_error:
                print(f"Model {model_name} failed: {str(model_error)}")
                last_error = model_error
                continue  # Try next model
        
        # If all models failed
        raise Exception(f"All models failed. Last error: {str(last_error)}")
    
    except Exception as e:
        import traceback
        error_msg = f"Error in chat endpoint: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        with open("error_log.txt", "a") as f:
            f.write(f"[{datetime.now().isoformat()}] {error_msg}\n")
            
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'message': str(e),
            'details': 'Unable to process request. Please try again or call us directly at (509) 548-0600.',
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Mozart\'s Restaurant AI Concierge',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/menu', methods=['GET'])
def get_menu():
    """Return menu information"""
    menu = {
        'specialties': [
            {
                'name': 'Oktoberfest Sampler',
                'description': 'A celebration of Austrian flavors featuring bratwurst, schnitzel, sauerkraut, and spätzle',
                'price': 'Market Price',
                'category': 'Signature'
            },
            {
                'name': 'Pacific Northwest Salmon',
                'description': 'Wild-caught salmon with seasonal vegetables and citrus beurre blanc',
                'price': '$42',
                'category': 'Seasonal'
            },
            {
                'name': 'Wiener Schnitzel',
                'description': 'Traditional Austrian veal cutlet with potato salad and lingonberry sauce',
                'price': '$38',
                'category': 'Classic'
            },
            {
                'name': 'Wild Mushroom Risotto',
                'description': 'Creamy Arborio rice with seasonal mushrooms, truffle oil, and aged parmesan',
                'price': '$32',
                'category': 'Vegetarian'
            }
        ],
        'dietary_options': {
            'gluten_free': True,
            'vegetarian': True,
            'vegan': 'Limited options - please inquire'
        },
        'price_range': '$50-$100 per person'
    }
    return jsonify(menu)

@app.route('/api/events', methods=['GET'])
def get_events():
    """Return events and live music schedule"""
    events = {
        'recurring': [
            {
                'name': 'Friday Night Live Music',
                'schedule': 'Every Friday 7:00 PM - 10:00 PM',
                'description': 'Elegant live music performances',
                'type': 'live_music'
            }
        ],
        'seasonal': [
            {
                'name': 'Oktoberfest Celebration',
                'period': 'September - October',
                'description': 'Special Oktoberfest menu featuring authentic German and Austrian specialties',
                'type': 'seasonal_menu'
            }
        ],
        'wine_events': {
            'frequency': 'Monthly',
            'note': 'Contact restaurant for specific dates'
        }
    }
    return jsonify(events)

@app.route('/api/contact', methods=['GET'])
def get_contact():
    """Return contact information"""
    contact = {
        'restaurant': 'Mozart\'s Restaurant',
        'address': {
            'street': '829 Front St, Upstairs',
            'city': 'Leavenworth',
            'state': 'WA',
            'zip': '98826',
            'country': 'United States'
        },
        'phone': '+1 (509) 548-0600',
        'email': {
            'reservations': 'host@mozartsrestaurant.com',
            'general': 'info@mozartsrestaurant.com'
        },
        'website': 'mozartsrestaurant.com',
        'features': [
            'Woman-owned business',
            'Fine European/Austrian cuisine',
            'Pacific Northwest specialties',
            'Extensive wine cellar',
            'Live music on Fridays'
        ]
    }
    return jsonify(contact)

@app.route('/')
def home():
    """Root endpoint to serve the website"""
    return app.send_static_file('index.html')

if __name__ == '__main__':
    # Check if API key is set
    if GEMINI_API_KEY == 'YOUR_API_KEY_HERE':
        print("\n" + "="*70)
        print("WARNING: Gemini API key not set!")
        print("="*70)
        print("Please set your Gemini API key in one of the following ways:")
        print("1. Set environment variable: GEMINI_API_KEY=your_api_key_here")
        print("2. Edit server.py and replace 'YOUR_API_KEY_HERE' with your actual key")
        print("\nGet your API key at: https://makersuite.google.com/app/apikey")
        print("="*70 + "\n")
    
    print("\nMozart's Restaurant Server Starting...")
    print("Server running on: http://localhost:5000")
    print("AI Concierge endpoint: http://localhost:5000/api/chat")
    print("Menu endpoint: http://localhost:5000/api/menu")
    print("Events endpoint: http://localhost:5000/api/events")
    print("Contact endpoint: http://localhost:5000/api/contact")
    print("\nPress CTRL+C to stop the server\n")
    
    # Run the Flask app
    app.run(debug=True, host='0.0.0.0', port=5000)
