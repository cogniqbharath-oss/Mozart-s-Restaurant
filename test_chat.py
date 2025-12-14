import requests
import json

url = 'http://localhost:5000/api/chat'
headers = {'Content-Type': 'application/json'}
data = {'message': 'Hello, do you have vegan options?'}

try:
    response = requests.post(url, headers=headers, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
