# File: rank_candidates.py
import os
import json
import pandas as pd
from pathlib import Path
from sklearn.preprocessing import MinMaxScaler
from supabase import create_client
from dotenv import load_dotenv

# --- FIX: Force load the local .env file ---
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path, override=True)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Supabase credentials not found.")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

PROCESSED_DATA_FOLDER = "processed_data"
DEFAULT_STATUS = "unreviewed"

def compute_relative_ranking(job_id: str) -> None:
    in_path = os.path.join(PROCESSED_DATA_FOLDER, f"{job_id}_analysis.json")
    if not os.path.exists(in_path):
        print(f"❌ analysis file not found: {in_path}")
        return

    with open(in_path) as f:
        raw = json.load(f)
    if not raw:
        print("❌ analysis JSON is empty.")
        return

    scores = [
        row["analysis"].get("Final Score", 0.0) or 0.0 for row in raw
    ]
    if not scores or all(s == 0 for s in scores):
        normed = [[0.0] for _ in scores]
    else:
        scaler = MinMaxScaler()
        normed = scaler.fit_transform([[s] for s in scores])

    for idx, row in enumerate(raw):
        pct = round(float(normed[idx][0]) * 100, 2)
        row["analysis"]["Relative Ranking Score"] = pct

    ranked = sorted(
        raw,
        key=lambda r: r["analysis"]["Relative Ranking Score"],
        reverse=True,
    )

    out_json = os.path.join(PROCESSED_DATA_FOLDER, f"{job_id}_ranked.json")
    out_csv  = os.path.join(PROCESSED_DATA_FOLDER, f"{job_id}_ranked.csv")

    with open(out_json, "w") as f:
        json.dump(ranked, f, indent=4)

    pd.DataFrame(
        [{"filename": r["filename"], **r["analysis"]} for r in ranked]
    ).to_csv(out_csv, index=False)

    print(f"✅ Ranked output saved:\n   • {out_json}\n   • {out_csv}")

    _upsert_rankings(ranked, job_id)

def _upsert_rankings(ranked_list: list, job_id: str) -> None:
    records = []
    for idx, cand in enumerate(ranked_list, start=1):
        file_name = cand["filename"]

        resp = (
            supabase.table("resume_uploads")
            .select("resume_id, candidate_name")
            .eq("file_name", file_name)
            .eq("job_id", job_id)
            .single()
            .execute()
        )
        
        data = resp.data or {}
        resume_id = data.get("resume_id")
        candidate_name = data.get("candidate_name") or file_name.replace(".pdf", "")

        if not resume_id:
            print(f"⚠️  No resume_uploads row for {file_name}; skipping.")
            continue

        records.append(
            {
                "resume_id": resume_id,
                "job_id": job_id,
                "rank": idx,
                "total_score": cand["analysis"]["Relative Ranking Score"],
                "candidate_name": candidate_name,
                "status": DEFAULT_STATUS,
            }
        )

    if not records:
        print("⚠️  No valid records to insert.")
        return

    try:
        supabase.table("resume_rankings").delete().eq("job_id", job_id).execute()
        print(f"✅ Deleted existing rankings for job {job_id}")
    except Exception as e:
        print(f"⚠️  Delete failed (might be empty): {e}")

    try:
        supabase.table("resume_rankings").insert(records).execute()
        print(f"✅ Supabase: inserted {len(records)} rows into resume_rankings")
    except Exception as e:
        print(f"🚨 Insert failed: {e}")

if __name__ == "__main__":
    import sys
    if len(sys.argv) != 2:
        print("Usage: python rank_candidates.py <job_id>")
        sys.exit(1)
    compute_relative_ranking(sys.argv[1])