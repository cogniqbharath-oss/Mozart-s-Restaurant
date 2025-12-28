
import requests
import json

keys = [
    "AIzaSyDW7cMPZMJH-TfyqlZxqJYeui0vinuw1v8", # Old?
    "AIzaSyAVVDMr6_-jsFx7m6XrkJit27Lq7JxsH6A", # Debug
    "AIzaSyAKZvre8qWjNrKnXraAyznjcMw-y-cl2Y8"  # New?
]

# Adding 2.5 models
models = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash", 
    "gemma-3-1b-it"
]

versions = ["v1", "v1beta"]

for key in keys:
    print(f"\nTesting Key: {key[:15]}...")
    for model in models:
        for v in versions:
            url = f"https://generativelanguage.googleapis.com/{v}/models/{model}:generateContent?key={key}"
            payload = {"contents": [{"parts": [{"text": "hi"}]}]}
            try:
                resp = requests.post(url, json=payload, timeout=5)
                if resp.status_code == 200:
                    print(f"  [OK] {v} {model}")
                else:
                    status = resp.status_code
                    try:
                        msg = resp.json().get('error', {}).get('message', '')
                        if not msg: msg = resp.text[:50]
                    except:
                        msg = resp.text[:50]
                    print(f"  [FAIL] {v} {model}: {status} - {msg[:100]}")
            except Exception as e:
                print(f"  [ERROR] {v} {model}: {e}")
