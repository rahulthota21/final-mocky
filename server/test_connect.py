import requests
import os

# 1. Basic Internet Check
try:
    print("1. Testing Google...")
    requests.get("https://www.google.com", timeout=5)
    print("✅ Internet is reachable.")
except Exception as e:
    print(f"❌ Internet Unreachable: {e}")

# 2. DNS/SSL Check to Groq
try:
    print("\n2. Testing Groq API Endpoint (Ping)...")
    # Just checking if we can handshake, not auth
    requests.get("https://api.groq.com", timeout=5)
    print("✅ Reachable (404/403 is expected, connection is good).")
except Exception as e:
    print(f"❌ Connection Failed: {e}")
    import ssl
    print(f"   SSL Context: {ssl.get_default_verify_paths()}")

# 3. Auth Check (If step 2 passed)
api_key = "gsk_PASTE_YOUR_ACTUAL_KEY_HERE" # <--- PUT YOUR KEY HERE FOR TEST
if api_key:
    print("\n3. Testing Actual API Call...")
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    data = {
        "model": "llama-3.3-70b-versatile",
        "messages": [{"role": "user", "content": "Hello"}]
    }
    try:
        resp = requests.post("https://api.groq.com/openai/v1/chat/completions", json=data, headers=headers)
        print(f"Status Code: {resp.status_code}")
        print(f"Response: {resp.text[:100]}...")
    except Exception as e:
        print(f"❌ API Call Failed: {e}")