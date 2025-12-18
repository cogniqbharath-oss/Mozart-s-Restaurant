
import requests
import json

API_KEY = "AIzaSyAVVDMr6_-jsFx7m6XrkJit27Lq7JxsH6A"
url = f"https://generativelanguage.googleapis.com/v1beta/models?key={API_KEY}"

response = requests.get(url)
models = response.json()

with open('models_full.json', 'w') as f:
    json.dump(models, f, indent=2)

print("Saved models to models_full.json")
