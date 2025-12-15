
import requests
import json
import os

API_KEY = "AIzaSyAiZobQ9Ra1cZkFdKeG5aXeDcOZGDq6i60"
url = f"https://generativelanguage.googleapis.com/v1beta/models?key={API_KEY}"

try:
    response = requests.get(url)
    if response.status_code == 200:
        models = response.json()
        print(json.dumps(models, indent=2))
        
        # Filter for generateContent supported models
        print("\n\nSupported Models for generation:")
        for model in models.get('models', []):
            if 'generateContent' in model.get('supportedGenerationMethods', []):
                print(f"- {model['name']}")
    else:
        print(f"Error: {response.status_code}")
        print(response.text)
except Exception as e:
    print(f"Exception: {e}")
