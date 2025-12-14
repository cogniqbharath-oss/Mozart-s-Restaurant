from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
from datetime import datetime

# Initialize Flask with static folder configuration to serve files from root
app = Flask(__name__, static_url_path='', static_folder='.')
CORS(app)  # Enable CORS for frontend communication

# Configure Gemini API
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', 'AIzaSyC8caaVnjDzywAnTNR_Nwbs64zW95DgdE8')
genai.configure(api_key=GEMINI_API_KEY)

# Initialize Gemini model
model = genai.GenerativeModel('gemini-1.5-flash')

# Restaurant context for AI responses
RESTAURANT_CONTEXT = """
You are an AI Concierge for Mozart's Restaurant, a fine dining establishment in Leavenworth, WA.

RESTAURANT INFORMATION:
- Name: Mozart's Restaurant
- Location: 829 Front St, Upstairs, Leavenworth, WA 98826, United States
- Phone: +1 (509) 548-0600
- Email: host@mozartsrestaurant.com, info@mozartsrestaurant.com
- Website: mozartsrestaurant.com
- Type: Woman-owned fine European/Austrian and Pacific Northwest cuisine
- Price Range: $50-$100 per person
- Atmosphere: Romantic, upscale fine dining

MENU HIGHLIGHTS:
- Oktoberfest Sampler (seasonal specialty)
- Pacific Northwest Salmon ($42)
- Wiener Schnitzel ($38)
- Wild Mushroom Risotto ($32)
- Extensive wine cellar with 200+ selections from 15+ countries
- Gluten-free and vegetarian options available

SPECIAL FEATURES:
- Live music every Friday night (7:00 PM - 10:00 PM)
- Extensive temperature-controlled wine cellar
- Seasonal specialties and chef-driven menu
- Special dietary accommodations (gluten-free, vegetarian)

IMPORTANT POLICIES & PAIN POINTS:
1. RESERVATION SYSTEM: Currently being updated. Customers should call (509) 548-0600 or email for reservations.
2. HIGH-VALUE DINING: $50-$100 per person - advanced reservations strongly recommended
3. NO-SHOW PREVENTION: Due to high-value dining, we encourage confirmation calls 24 hours before
4. SERVICE TIMING: Peak hours (6pm-9pm) may have slower service. Off-peak dining recommended for faster service.
5. LARGE GROUPS: Require advance notice and coordination

YOUR ROLE:
- Help customers make reservations (collect: name, date, time, party size, special requests)
- Answer questions about menu, dietary options, pricing
- Provide information about live music schedule and special events
- Recommend dishes and wine pairings
- Address the restaurant's pain points proactively
- Be warm, professional, and reflect the upscale European dining experience
- If unable to complete a reservation online, direct them to call or email

IMPORTANT: Always be helpful, professional, and convey the premium nature of Mozart's dining experience.
When helping with reservations, collect all necessary details and inform them you'll have the restaurant confirm via phone or email.
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

@app.route('/api/chat', methods=['POST'])
def chat():
    """
    Main chat endpoint for Gemini AI integration
    Receives messages from frontend and returns AI responses
    """
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
        
        # Build the complete prompt
        current_info = get_current_day_info()
        
        prompt = f"""{RESTAURANT_CONTEXT}

{current_info}

CUSTOMER QUESTION/REQUEST:
{user_message}

Provide a helpful, professional response that addresses their needs while maintaining the upscale, European fine dining atmosphere of Mozart's Restaurant. Be warm and engaging.
"""
        
        # Generate response using Gemini
        response = model.generate_content(prompt)
        
        # Extract the response text
        ai_response = response.text
        
        return jsonify({
            'success': True,
            'response': ai_response,
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'message': 'Unable to process request. Please try again or call us directly at (509) 548-0600.'
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
