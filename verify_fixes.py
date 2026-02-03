import requests
import json

BASE_URL = "http://localhost:3000/api"

def test_cart_quantity_set():
    print("Testing cart quantity set...")
    # This assumes there's a user session or we use the backend service key
    # For simplicity, we'll try to use the NLP action endpoint which is what the AI uses
    url = f"{BASE_URL}/actions/execute-nlp-action"
    
    # We need a watch ID and user ID. 
    # From schema.prisma, we know they exist. In a real test we'd fetch them.
    # We'll use dummy IDs that might fail if not found, but we can check the logs/response.
    payload = {
        "userMessage": "make the quantity 5",
        "userId": "clvpiz3o700003b6qmq8zf08p", # Example user ID from previous sessions likely
        "retrievedProducts": [{"id": "clvpiz3o700023b6qmq8zf08p", "name": "Test Watch"}]
    }
    
    try:
        response = requests.post(url, json=payload)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_cart_quantity_set()
