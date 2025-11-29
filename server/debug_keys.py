import os
from dotenv import load_dotenv

# 1. Force load the specific .env file in the current directory
env_path = os.path.join(os.path.dirname(__file__), '.env')
print(f"📂 Looking for .env at: {env_path}")
loaded = load_dotenv(env_path, override=True) 
print(f"📄 .env Loaded? {loaded}")

# 2. Read the specific keys
groq_key = os.getenv("GROQ_API_KEY")
openai_key = os.getenv("OPENAI_API_KEY")

# 3. Analyze GROQ_API_KEY
print("\n--- CHECKING GROQ_API_KEY ---")
if not groq_key:
    print("❌ GROQ_API_KEY is EMPTY or NONE.")
else:
    print(f"✅ Found Key: {groq_key[:4]}...{groq_key[-4:]}")
    print(f"📏 Length: {len(groq_key)} characters")
    if " " in groq_key:
        print("❌ ERROR: Key contains spaces! Check your .env file.")
    else:
        print("✅ No spaces found.")

# 4. Analyze OPENAI_API_KEY (Which your code actually uses!)
print("\n--- CHECKING OPENAI_API_KEY (Used by Script) ---")
if not openai_key:
    print("❌ OPENAI_API_KEY is EMPTY. (This is likely your bug!)")
else:
    print(f"✅ Found Key: {openai_key[:4]}...{openai_key[-4:]}")
    if openai_key != groq_key:
        print("⚠️ WARNING: OPENAI_API_KEY does not match GROQ_API_KEY.")
        print("   Your process_resumes.py reads OPENAI_API_KEY, so ensure this one is correct!")
    else:
        print("✅ Matches GROQ_API_KEY.")

# 5. Live Connection Test with Hardcoded Logic
print("\n--- LIVE CONNECTION TEST ---")
import requests
# Use the key that the script actually uses
active_key = openai_key if openai_key else groq_key

if not active_key:
    print("❌ Cannot test connection: No key found.")
else:
    headers = {
        "Authorization": f"Bearer {active_key}",
        "Content-Type": "application/json"
    }
    data = {
        "model": "llama-3.3-70b-versatile",
        "messages": [{"role": "user", "content": "Ping"}]
    }
    try:
        resp = requests.post("https://api.groq.com/openai/v1/chat/completions", json=data, headers=headers)
        if resp.status_code == 200:
            print("✅ SUCCESS! The key works perfectly.")
        else:
            print(f"❌ FAILED. Status: {resp.status_code}")
            print(f"   Response: {resp.text}")
    except Exception as e:
        print(f"❌ Connection Error: {e}")