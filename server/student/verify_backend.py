import requests
import json
import os
import time

# Configuration
BASE_URL = "http://127.0.0.1:8000"
# Updated User ID provided by you
USER_ID = "a5a16985-a0a4-47c7-9970-804b70827523"

def print_step(name):
    print(f"\n🔹 --- {name} ---")

def create_dummy_pdf():
    """Creates a minimal valid PDF for testing upload"""
    filename = "test_resume.pdf"
    with open(filename, "wb") as f:
        # Minimal PDF header
        f.write(b"%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/Resources <<\n/Font <<\n/F1 <<\n/Type /Font\n/Subtype /Type1\n/BaseFont /Helvetica\n>>\n>>\n>>\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 24 Tf\n100 700 Td\n(Test Resume Content) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000010 00000 n\n0000000060 00000 n\n0000000157 00000 n\n0000000304 00000 n\ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n400\n%%EOF")
    return filename

def run_tests():
    # 1. Health Check
    print_step("1. Health Check")
    try:
        res = requests.get(f"{BASE_URL}/interview/")
        print(f"✅ Server Status: {res.status_code}")
        print(f"   Response: {res.json()}")
    except Exception as e:
        print(f"❌ Server not reachable at {BASE_URL}. Is it running on port 8000?")
        return

    # 2. Upload Resume
    print_step("2. Upload Resume")
    pdf_name = create_dummy_pdf()
    try:
        files = {'file': (pdf_name, open(pdf_name, 'rb'), 'application/pdf')}
        res = requests.post(f"{BASE_URL}/interview/upload-resume/{USER_ID}", files=files)
        
        if res.status_code == 200:
            data = res.json()
            resume_id = data['resume_id']
            print(f"✅ Resume Uploaded. ID: {resume_id}")
        else:
            print(f"❌ Upload Failed: {res.text}")
            return
    except Exception as e:
        print(f"❌ Error during upload: {e}")
        return

    # 3. Generate Questions (AI Test)
    print_step("3. Generate Questions (Calls Groq)")
    print("   ⏳ Waiting for AI generation...")
    res = requests.post(f"{BASE_URL}/interview/generate-questions/{USER_ID}/{resume_id}")
    
    if res.status_code == 200:
        data = res.json()
        session_id = data['session_id']
        questions = data['questions']
        print(f"✅ Questions Generated. Session ID: {session_id}")
        print(f"   Generated {len(questions)} questions.")
        print(f"   Sample: {questions[0]}")
    else:
        print(f"❌ Generation Failed: {res.text}")
        # Cannot proceed without session_id
        return

    # 4. Get Next Question
    print_step("4. Fetch Question #1")
    res = requests.get(f"{BASE_URL}/interview/next-question/{session_id}/1")
    if res.status_code == 200:
        print(f"✅ Question 1 Fetched: {res.json()['question']}")
    else:
        print(f"❌ Fetch Failed: {res.text}")

    # 5. Submit Answer (Expect Partial Failure)
    # Note: This endpoint tries to download audio from Supabase. 
    # Since we haven't uploaded audio to Supabase Storage in this script, it should 404.
    # A 404 here PROVES the endpoint is reachable and logic is running.
    print_step("5. Submit Answer (Expect 404 - Audio Missing)")
    res = requests.post(f"{BASE_URL}/interview/submit-answer/{session_id}/1", json={"answer_text": "Test answer"})
    
    if res.status_code == 200:
        print("✅ Answer Submitted (Unexpectedly found audio!)")
    elif res.status_code == 404:
        print("✅ Endpoint Reachable! (Returned 404 as expected because audio file isn't in Supabase)")
    else:
        print(f"❌ Unexpected Error: {res.status_code} - {res.text}")

    # 6. Stress Analysis (Expect Partial Failure)
    print_step("6. Analyze Stress (Expect 404 - Audio Missing)")
    res = requests.post(f"{BASE_URL}/stress/analyze-stress/{session_id}/1?duration=60")
    
    if res.status_code == 404:
        print("✅ Endpoint Reachable! (Returned 404 as expected)")
    else:
        print(f"⚠️ Status: {res.status_code} - {res.text}")

    # 7. Final Report
    print_step("7. Generate Final Report")
    res = requests.get(f"{BASE_URL}/interview/final-report/{session_id}")
    if res.status_code == 200:
        print("✅ Final Report Generated successfully")
    else:
        print(f"❌ Report Failed: {res.text}")

    # 8. User Summary
    print_step("8. User Summary")
    res = requests.get(f"{BASE_URL}/interview/user-summary/{USER_ID}")
    if res.status_code == 200:
        print("✅ User Summary Retrieved")
    else:
        print(f"❌ Summary Failed: {res.text}")

    # 9. Admin Check
    print_step("9. Admin: List Sessions")
    res = requests.get(f"{BASE_URL}/admin/sessions")
    if res.status_code == 200:
        sessions = res.json()
        print(f"✅ Admin Sessions Retrieved: Found {len(sessions)}")
        found = any(s['id'] == session_id for s in sessions)
        print(f"   Current Session Found in List: {found}")
    else:
        print(f"❌ Admin List Failed: {res.text}")

    # Cleanup
    try:
        if os.path.exists(pdf_name):
            os.remove(pdf_name)
    except:
        pass
    print("\n✅ Test Sequence Complete.")

if __name__ == "__main__":
    run_tests()