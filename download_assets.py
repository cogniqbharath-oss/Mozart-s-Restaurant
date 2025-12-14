import os
import requests

# Ensure assets directory exists
assets_dir = r"e:\Mozart's Restaurant\assets"
os.makedirs(assets_dir, exist_ok=True)

# Map of filename to Unsplash Image ID
images = {
    "salmon.jpg": "0N3kI4P9M3c",
    "schnitzel.jpg": "MaE-4_3Q5hU", # Fried food placeholder
    "oktoberfest.jpg": "cR4z4j489bE",
    "risotto.jpg": "sZ9Qk_W2R7U",
    "music.jpg": "C_L0M59dC0c",
    "wine.jpg": "m_wz44L-M4c",
    "interior.jpg": "fIq0VsJvF3c",
    "favicon.png": "C_L0M59dC0c" # Using violin image for favicon
}

def download_image(filename, unsplash_id):
    url = f"https://unsplash.com/photos/{unsplash_id}/download"
    print(f"Downloading {filename} from {url}...")
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, allow_redirects=True, headers=headers)
        if response.status_code == 200:
            with open(os.path.join(assets_dir, filename), 'wb') as f:
                f.write(response.content)
            print(f"Successfully saved {filename}")
        else:
            print(f"Failed to download {filename}: Status {response.status_code}")
    except Exception as e:
        print(f"Error downloading {filename}: {e}")

if __name__ == "__main__":
    print("Starting asset download...")
    for filename, unsplash_id in images.items():
        download_image(filename, unsplash_id)
    print("Download complete.")
