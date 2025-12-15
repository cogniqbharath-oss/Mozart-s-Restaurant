
import requests
import json

API_KEY = "AIzaSyBXGvwIWvxXh6ZlIHeInxPMi5m4CkIjIfA"
url = f"https://generativelanguage.googleapis.com/v1beta/models?key={API_KEY}"

response = requests.get(url)
models = response.json()

with open('models_full.json', 'w') as f:
    json.dump(models, f, indent=2)

print("Saved models to models_full.json")
