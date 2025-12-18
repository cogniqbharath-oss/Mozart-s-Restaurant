
import requests
import json
import time

API_KEY = "AIzaSyAVVDMr6_-jsFx7m6XrkJit27Lq7JxsH6A"

def get_models():
    url = f"https://generativelanguage.googleapis.com/v1beta/models?key={API_KEY}"
    try:
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            # Filter for models that support generateContent
            models = [m['name'] for m in data.get('models', []) 
                     if 'generateContent' in m.get('supportedGenerationMethods', [])]
            return models
        else:
            print(f"Failed to list models: {response.text}")
            return []
    except Exception as e:
        print(f"Error listing models: {e}")
        return []

def test_model(model_name):
    # Remove 'models/' prefix if present for the URL, though some endpoints usually need it or not?
    # The API usually takes models/model-name or just model-name. 
    # Let's use the full name from the list which includes 'models/' usually.
    
    url = f"https://generativelanguage.googleapis.com/v1beta/{model_name}:generateContent?key={API_KEY}"
    
    payload = {
        "contents": [{
            "parts": [{"text": "Hello, just checking connection."}]
        }]
    }
    
    try:
        print(f"Testing {model_name}...", end="", flush=True)
        response = requests.post(url, json=payload, headers={"Content-Type": "application/json"})
        
        if response.status_code == 200:
            print(" SUCCESS! [OK]")
            return True
        else:
            if "quota" in response.text.lower():
                print(f" FAILS (Quota/Limit)")
            else:
                print(f" FAILED ({response.status_code})")
            return False
            
    except Exception as e:
        print(f" ERROR: {e}")
        return False

print("Fetching available models...")
models = get_models()
print(f"Found {len(models)} models capable of content generation.")

working_models = []

# Prioritize flash models, then lite, then others
priority_order = lambda name: (
    0 if 'flash' in name and 'lite' in name else
    1 if 'flash' in name else
    2 if 'pro' in name else
    3
)

models.sort(key=lambda x: priority_order(x))

for model in models:
    if test_model(model):
        working_models.append(model)
        # We can stop at the first working one or collect all.
        # Let's collect a few to be sure.
        if len(working_models) >= 1:
            break
    time.sleep(1) # Be nice to the API

print("\n--- RESULTS ---")
if working_models:
    print(f"Recommended Model: {working_models[0].replace('models/', '')}")
else:
    print("No working models found capable of generation with this key/quota.")
