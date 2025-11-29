import requests
import sys
import time

# Colors for output
GREEN = "\033[92m"
RED = "\033[91m"
RESET = "\033[0m"

def check_service(name, url, expected_code=200):
    print(f"🔍 Checking {name} at {url}...", end=" ")
    try:
        response = requests.get(url, timeout=5)
        if response.status_code == expected_code:
            print(f"{GREEN}ONLINE ✅{RESET}")
            return True
        else:
            print(f"{RED}ERROR (Status {response.status_code}) ❌{RESET}")
            return False
    except requests.exceptions.ConnectionError:
        print(f"{RED}OFFLINE (Connection Refused) ❌{RESET}")
        return False
    except Exception as e:
        print(f"{RED}FAILED ({str(e)}) ❌{RESET}")
        return False

def run_health_check():
    print("\n🚀 --- SYSTEM HEALTH DIAGNOSTIC --- 🚀\n")
    
    all_systems_go = True

    # 1. Check Frontend
    frontend_ok = check_service("Frontend (Next.js)", "http://localhost:3000")
    if not frontend_ok:
        print("   ⚠️  Is your Next.js server running? (npm run dev)")
        all_systems_go = False

    # 2. Check Backend Root
    backend_ok = check_service("Backend (FastAPI)", "http://127.0.0.1:8000/interview/")
    if not backend_ok:
        print("   ⚠️  Is your Python server running? (uvicorn main:app ...)")
        all_systems_go = False

    # 3. Check Database Connection via Backend
    if backend_ok:
        # Note: We use the test endpoint to verify Supabase connectivity
        # Using a known valid ID from your previous tests
        print(f"🔍 Checking Database Link...", end=" ")
        try:
            res = requests.get("http://127.0.0.1:8000/interview/test-supabase")
            if res.status_code == 200:
                print(f"{GREEN}CONNECTED ✅{RESET}")
            else:
                print(f"{RED}DB ERROR ❌{RESET}")
                print(f"   Details: {res.text}")
                all_systems_go = False
        except:
             print(f"{RED}TIMEOUT ❌{RESET}")
             all_systems_go = False

    print("\n" + "="*40)
    if all_systems_go:
        print(f"{GREEN}✅ SYSTEM READY FOR TESTING{RESET}")
        print("Go to: http://localhost:3000/dashboard/student")
    else:
        print(f"{RED}❌ SYSTEM ISSUES DETECTED{RESET}")
        print("Fix the offline services before starting.")
    print("="*40 + "\n")

if __name__ == "__main__":
    run_health_check()