"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase"; 
import {
  CheckCircle, Clock, X,
  Briefcase, Code, Award, FileText, Activity, ChevronRight, Brain, Shield
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const scoreColor = (s: number) =>
  s >= 90 ? "score-emerald" :
  s >= 80 ? "score-amber" :
  s >= 70 ? "score-orange" :
            "score-red";

const SUPABASE_BUCKET_BASE = "https://pzqodlqmyfylolspvgxl.supabase.co/storage/v1/object/public/resumes";

export default function ResultsPage({ params }: { params: { jobId: string } }) {
  const router = useRouter();

  const [rows, setRows] = useState<any[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [loadingError, setLoadingError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      console.log("--- FETCHING RESULTS (Unified Client) ---");
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn("No active session found in supabase-js client!");
        setLoadingError("Please log in again.");
        return;
      }

      const { data: rankings, error: err1 } = await supabase
        .from("resume_rankings")
        .select("resume_id,total_score,rank,status,candidate_name")
        .eq("job_id", params.jobId)
        .order("total_score", { ascending: false });
      
      if (err1) {
        console.error("Error fetching rankings:", err1);
        if (isMounted) setLoadingError("Failed to load rankings.");
        return;
      }

      if (!rankings || rankings.length === 0) {
        if (isMounted) setLoadingError("No candidates found yet. If you just uploaded, wait a moment and refresh.");
        return;
      }

      const ids = rankings.map(r => r.resume_id);
      const { data: analyses, error: err2 } = await supabase
        .from("resume_analysis")
        .select("resume_id,key_skills,relevant_projects,certifications_courses,projects_relevance_score,experience_relevance_score,overall_analysis")
        .in("resume_id", ids);

      if (err2) console.error("Error fetching analysis:", err2);
      
      const analysisMap = Object.fromEntries((analyses ?? []).map(a => [a.resume_id, a]));

      const { data: uploads, error: err3 } = await supabase
        .from("resume_uploads")
        .select("resume_id, file_name")
        .in("resume_id", ids);
        
      if (err3) console.error("Error fetching filenames:", err3);
      const fileMap = Object.fromEntries((uploads ?? []).map(u => [u.resume_id, u.file_name]));

      const finalRows = rankings.map(r => ({
          ...r,
          candidate_name: r.candidate_name || "Unknown",
          file_name: fileMap[r.resume_id] || "",
          ...analysisMap[r.resume_id],
        }));
      
      if (isMounted) setRows(finalRows);
    };

    fetchData();

    return () => { isMounted = false; };
  }, [params.jobId]);

  const selected = rows[selectedIdx];

  async function updateStatus(newStatus: string) {
    if (!selected) return;
    
    const updatedRows = rows.map((r, i) => i === selectedIdx ? { ...r, status: newStatus } : r);
    setRows(updatedRows);
    
    const { error } = await supabase
      .from("resume_rankings")
      .update({ status: newStatus })
      .eq("resume_id", selected.resume_id)
      .eq("job_id", params.jobId);
      
    if (error) {
        toast.error("Failed to update status");
        console.error(error);
    } else {
        toast.success(`Candidate marked as ${newStatus}`);
    }
  }

  if (loadingError) {
    return (
        <div className="error-container">
            <p className="error-text">System Error: {loadingError}</p>
            <div className="flex-row">
              <button className="tac-btn primary" onClick={() => window.location.reload()}>Retry Connection</button>
              <button className="tac-btn secondary" onClick={() => router.back()}>Return</button>
            </div>
            <style jsx>{`
              .error-container { min-height: 100vh; background: #020202; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; }
              .error-text { color: #ef4444; font-family: 'Inter', sans-serif; }
              .flex-row { display: flex; gap: 16px; }
            `}</style>
        </div>
    );
  }

  if (!rows.length)
    return (
      <div className="loading-container">
        <div className="loader-core">
           <div className="loader-ring" />
           <Shield className="loader-icon" size={24} />
        </div>
        <p>Retrieving Intelligence...</p>
        <style jsx>{`
          .loading-container { min-height: 100vh; background: #020202; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #fff; font-family: 'Inter', sans-serif; letter-spacing: 1px; font-size: 12px; gap: 24px; }
          .loader-core { position: relative; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; }
          .loader-ring { position: absolute; inset: 0; border: 1px solid rgba(255,255,255,0.1); border-top-color: #dc2626; border-radius: 50%; animation: spin 1s linear infinite; }
          .loader-icon { color: #dc2626; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );

  return (
    <div className="singularity-wrapper">
      <div className="void-texture" />
      <div className="nebula" />
      
      <div className="main-grid">
        {/* Header - CLEANED UP */}
        <div className="header-row">
          <div className="title-block">
            <h1 className="page-title">Screening Results</h1>
          </div>
        </div>

        <div className="content-split">
          {/* Left Column: Candidate List */}
          <div className="list-column">
            <div className="column-header">Candidate Index</div>
            <div className="list-scroll">
              {rows.map((c, i) => (
                <div
                  key={c.resume_id}
                  className={`candidate-card ${i === selectedIdx ? "active" : ""}`}
                  onClick={() => setSelectedIdx(i)}
                >
                  <div className="card-rank">#{c.rank}</div>
                  <div className="card-info">
                    <p className="card-name">{c.candidate_name}</p>
                    <div className={`status-pill ${c.status}`}>
                      {c.status}
                    </div>
                  </div>
                  <div className={`card-score ${scoreColor(c.total_score)}`}>
                    {Math.round(c.total_score)}%
                  </div>
                  {i === selectedIdx && <div className="active-glow" />}
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Detailed Analysis */}
          <div className="detail-column">
            {selected && (
            <AnimatePresence mode="wait">
              <motion.div 
                key={selected.resume_id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="detail-stack"
              >
                {/* Top Card: Identity & Actions */}
                <div className="obsidian-panel hero-panel">
                  <div className="panel-top">
                    <div>
                      <h3 className="candidate-hero-name">{selected.candidate_name}</h3>
                      {selected.file_name && (
                        <a
                          href={`${SUPABASE_BUCKET_BASE}/${params.jobId}/${selected.file_name}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="pdf-link"
                        >
                          <FileText size={12} /> View Source PDF
                        </a>
                      )}
                    </div>
                    <div className="score-display">
                      <span className="score-label">Match Probability</span>
                      <span className={`score-val ${scoreColor(selected.total_score)}`}>
                        {Math.round(selected.total_score)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="action-deck">
                    <button
                      onClick={() => updateStatus("shortlisted")}
                      className={`tac-btn success ${selected.status === "shortlisted" ? "active" : ""}`}
                    >
                      <CheckCircle size={14} /> Shortlist
                    </button>
                    <button
                      onClick={() => updateStatus("waitlisted")}
                      className={`tac-btn warning ${selected.status === "waitlisted" ? "active" : ""}`}
                    >
                      <Clock size={14} /> Waitlist
                    </button>
                    <button
                      onClick={() => updateStatus("declined")}
                      className={`tac-btn danger ${selected.status === "declined" ? "active" : ""}`}
                    >
                      <X size={14} /> Decline
                    </button>
                  </div>
                </div>

                {/* Grid: Breakdown & Skills */}
                <div className="sub-grid">
                  <div className="obsidian-panel">
                    <h4 className="panel-title"><Activity size={14} /> Vector Breakdown</h4>
                    <div className="breakdown-list">
                      <BreakdownRow
                        icon={Briefcase} label="Experience"
                        score={selected.experience_relevance_score ?? 0}
                      />
                      <BreakdownRow
                        icon={Code} label="Technical Stack"
                        score={selected.projects_relevance_score ?? 0}
                      />
                      <BreakdownRow
                        icon={Award} label="Accreditation"
                        score={selected.certifications_courses?.length > 0 ? 8 : 2} 
                      />
                    </div>
                  </div>

                  <div className="obsidian-panel">
                    <h4 className="panel-title"><Code size={14} /> Skills Detected</h4>
                    <div className="tags-cloud">
                      {Array.isArray(selected.key_skills) ? selected.key_skills.map((s: string, i: number) => (
                          <span key={i} className="tech-tag">{s.trim()}</span>
                      )) : (
                          String(selected.key_skills || "No Data").split(",").filter(Boolean).map((s: string, i: number) => (
                          <span key={i} className="tech-tag">{s.trim()}</span>
                          ))
                      )}
                    </div>
                  </div>
                </div>

                {/* AI Analysis */}
                <div className="obsidian-panel full-width">
                  <h4 className="panel-title"><Brain size={14} /> AI Assessment</h4>
                  
                  <div className="analysis-content">
                    <div className="analysis-section">
                      <p className="section-label">Executive Summary</p>
                      <p className="analysis-text">
                        {selected.overall_analysis || "Pending analysis..."}
                      </p>
                    </div>
                    
                    <div className="analysis-section">
                      <p className="section-label">Key Projects</p>
                      <div className="projects-list">
                        {Array.isArray(selected.relevant_projects) 
                            ? selected.relevant_projects.map((p: any, i: number) => (
                                <div key={i} className="project-item">
                                   <ChevronRight size={12} className="proj-icon" />
                                   {typeof p === 'string' ? p : (p.name || JSON.stringify(p))}
                                </div>
                            )) 
                            : (selected.relevant_projects || "No significant projects identified.")}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      {/* ──────────────── STYLES ──────────────── */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');

        :root {
          --bg-void: #020202;
          --panel-bg: rgba(10, 10, 10, 0.6);
          --border: rgba(255, 255, 255, 0.08);
          --crimson: #dc2626;
          --emerald: #10b981;
          --amber: #d97706;
          --blue: #3b82f6;
          --text-main: #ededed;
          --text-muted: #888888;
        }

        body {
          background-color: var(--bg-void);
          color: var(--text-main);
          font-family: 'Inter', sans-serif;
          overflow-x: hidden;
        }

        /* WRAPPER & BACKGROUND */
        .singularity-wrapper {
          min-height: 100vh; width: 100%; position: relative;
          padding-top: 120px; 
          padding-bottom: 60px;
        }
        
        .void-texture {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          opacity: 0.04;
        }
        .nebula {
          position: fixed; top: -20%; right: -10%; width: 800px; height: 800px;
          background: radial-gradient(circle, rgba(220,38,38,0.08), transparent 70%);
          border-radius: 50%; filter: blur(100px); z-index: 0; pointer-events: none;
        }

        /* LAYOUT */
        .main-grid {
          max-width: 1400px; margin: 0 auto; padding: 0 24px; position: relative; z-index: 10;
        }

        /* HEADER */
        .header-row { margin-bottom: 40px; display: flex; align-items: flex-end; }
        
        .page-title { font-size: 32px; font-weight: 700; letter-spacing: -0.02em; color: #fff; }

        /* CONTENT SPLIT */
        .content-split { display: grid; grid-template-columns: 360px 1fr; gap: 32px; align-items: start; }
        @media (max-width: 1024px) { .content-split { grid-template-columns: 1fr; } }

        /* LEFT COLUMN (LIST) */
        .column-header {
          font-size: 12px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;
          margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid var(--border);
        }
        .list-scroll { max-height: calc(100vh - 250px); overflow-y: auto; padding-right: 8px; }
        .list-scroll::-webkit-scrollbar { width: 4px; }
        .list-scroll::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }

        .candidate-card {
          background: rgba(255,255,255,0.02); border: 1px solid var(--border);
          padding: 16px 20px; margin-bottom: 8px; cursor: pointer; position: relative; overflow: hidden;
          display: flex; align-items: center; gap: 16px; transition: all 0.2s; border-radius: 8px;
        }
        .candidate-card:hover { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.15); }
        .candidate-card.active { background: rgba(255,255,255,0.06); border-color: var(--crimson); }
        
        .card-rank {
          font-family: 'JetBrains Mono', monospace; font-size: 13px; color: var(--text-muted);
          width: 32px; font-weight: 500;
        }
        .card-info { flex: 1; overflow: hidden; }
        .card-name { font-weight: 600; font-size: 14px; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 4px; }
        .status-pill {
          display: inline-block; font-size: 10px; font-weight: 600; text-transform: capitalize;
          padding: 2px 8px; border-radius: 100px;
        }
        .status-pill.shortlisted { color: var(--emerald); background: rgba(16,185,129,0.1); }
        .status-pill.waitlisted { color: var(--amber); background: rgba(217,119,6,0.1); }
        .status-pill.declined { color: var(--crimson); background: rgba(220,38,38,0.1); }
        .status-pill.pending { color: var(--blue); background: rgba(59,130,246,0.1); }

        .card-score { font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 14px; }
        .active-glow {
          position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: var(--crimson);
        }

        /* RIGHT COLUMN (DETAIL) */
        .detail-stack { display: flex; flex-direction: column; gap: 24px; }
        
        .obsidian-panel {
          background: var(--panel-bg); border: 1px solid var(--border); backdrop-filter: blur(12px);
          padding: 32px; border-radius: 16px; position: relative; overflow: hidden;
        }
        
        /* Top Panel */
        .hero-panel { display: flex; flex-direction: column; gap: 24px; }
        .panel-top { display: flex; justify-content: space-between; align-items: flex-start; }
        .candidate-hero-name { font-size: 24px; font-weight: 700; color: #fff; margin-bottom: 8px; letter-spacing: -0.02em; }
        .pdf-link {
          display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-muted);
          text-decoration: none; border: 1px solid var(--border); background: rgba(255,255,255,0.02);
          padding: 6px 12px; border-radius: 6px; transition: all 0.2s; font-weight: 500;
        }
        .pdf-link:hover { background: rgba(255,255,255,0.05); color: #fff; border-color: rgba(255,255,255,0.2); }
        
        .score-display { text-align: right; }
        .score-label { display: block; font-size: 11px; font-weight: 600; color: var(--text-muted); margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
        .score-val { font-family: 'JetBrains Mono', monospace; font-size: 42px; font-weight: 700; line-height: 1; }

        .action-deck { display: flex; gap: 12px; border-top: 1px solid var(--border); padding-top: 24px; }
        .tac-btn {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 12px; border-radius: 8px; font-size: 13px; font-weight: 600;
          cursor: pointer; transition: all 0.2s; background: transparent; border: 1px solid var(--border); color: var(--text-muted);
        }
        .tac-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
        
        .tac-btn.success:hover, .tac-btn.success.active { background: rgba(16,185,129,0.1); border-color: var(--emerald); color: var(--emerald); }
        .tac-btn.warning:hover, .tac-btn.warning.active { background: rgba(217,119,6,0.1); border-color: var(--amber); color: var(--amber); }
        .tac-btn.danger:hover, .tac-btn.danger.active { background: rgba(220,38,38,0.1); border-color: var(--crimson); color: var(--crimson); }

        /* Sub Grid */
        .sub-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .panel-title {
          font-size: 13px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;
          margin-bottom: 24px; display: flex; align-items: center; gap: 8px;
        }

        .breakdown-list { display: flex; flex-direction: column; gap: 16px; }
        .bd-row { display: flex; flex-direction: column; gap: 8px; }
        .bd-label-row { display: flex; justify-content: space-between; font-size: 13px; font-weight: 500; color: #ccc; }
        .bd-left { display: flex; align-items: center; gap: 8px; }
        .bd-score { font-family: 'JetBrains Mono', monospace; color: #fff; font-weight: 600; }
        .bd-bar { height: 6px; background: #222; width: 100%; border-radius: 3px; overflow: hidden; }
        .bd-fill { height: 100%; background: var(--crimson); }

        .tags-cloud { display: flex; flex-wrap: wrap; gap: 8px; }
        .tech-tag {
          font-size: 12px; font-weight: 500; color: #fff;
          background: rgba(255,255,255,0.05); border: 1px solid var(--border); padding: 6px 10px; border-radius: 6px;
        }

        /* Analysis */
        .analysis-content { display: flex; flex-direction: column; gap: 32px; }
        .section-label { font-size: 12px; font-weight: 600; color: var(--crimson); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
        .analysis-text { font-size: 15px; line-height: 1.7; color: #ccc; font-weight: 400; }
        .projects-list { display: flex; flex-direction: column; gap: 12px; }
        .project-item {
          background: rgba(255,255,255,0.02); border: 1px solid var(--border); padding: 16px; border-radius: 8px;
          font-size: 14px; color: #ddd; display: flex; gap: 12px; align-items: flex-start;
        }
        .proj-icon { margin-top: 3px; color: var(--crimson); flex-shrink: 0; }

        /* SCORE COLORS */
        .score-val.score-emerald, .card-score.score-emerald { color: var(--emerald); }
        .score-val.score-amber, .card-score.score-amber { color: var(--amber); }
        .score-val.score-orange, .card-score.score-orange { color: #f97316; }
        .score-val.score-red, .card-score.score-red { color: var(--crimson); }

      `}</style>
    </div>
  );
}

function BreakdownRow({ icon: Icon, label, score }: { icon: any, label: string, score: number }) {
  return (
    <div className="bd-row">
      <div className="bd-label-row">
        <div className="bd-left">
          <Icon size={16} className="text-gray-500" />
          <span>{label}</span>
        </div>
        <span className="bd-score">{score}/10</span>
      </div>
      <div className="bd-bar">
        <div className="bd-fill" style={{ width: `${score * 10}%` }} />
      </div>
    </div>
  );
}