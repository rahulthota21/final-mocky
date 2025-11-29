"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Download, Brain, Clock, Star, 
  Shield, Activity, Zap, Loader2, AlertCircle 
} from "lucide-react";
import { toast } from "sonner";

// API URL (must match your Python Backend port)
const API_URL = "http://127.0.0.1:8000";

export default function SummaryPage({ params }: { params: { sessionId: string } }) {
  const router = useRouter();
  
  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<any>(null);

  // --- 1. FETCH & GENERATE REPORT ---
  useEffect(() => {
    async function generateAndFetchReport() {
      try {
        console.log(`⚡ Triggering Report Generation for ${params.sessionId}...`);
        
        // Direct call to Backend to generate/fetch report
        const res = await fetch(`${API_URL}/interview/final-report/${params.sessionId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.detail || "Report generation failed");
        }

        const data = await res.json();
        console.log("✅ Report Received:", data);

        // Transform API data to UI format
        const formattedQuestions = data.questions.map((q: any) => ({
            id: q.question_number,
            question: q.question_text,
            category: q.category,
            answer: q.answer_text || "No answer recorded",
            feedback: q.feedback || "No feedback generated",
            score: q.score || 0,
            stressScore: q.stress_score ? Math.round(q.stress_score) : 0,
            stressLevel: q.stress_level || "N/A"
        }));

        setReport({
            overallScore: Math.round(data.final_score ?? 0),
            averageStress: Math.round(data.average_stress ?? 0),
            duration: "Completed", // Placeholder, can be calculated from session timestamps if needed
            questions: formattedQuestions,
            overallSummary: data.overall_summary,
            recommendation: data.recommendation
        });
        
        setLoading(false);

      } catch (err: any) {
        console.error("❌ Report Error:", err);
        setError(err.message || "Failed to generate report.");
        setLoading(false);
      }
    }

    generateAndFetchReport();
  }, [params.sessionId]);

  // --- UI HELPERS ---
  const getScoreColor = (s: number) => {
    if (s >= 8) return "high";
    if (s >= 5) return "mid";
    return "low";
  };

  const getStressColor = (s: number) => {
    if (s > 60) return "high-stress";
    if (s > 30) return "mid-stress";
    return "low-stress";
  };

  // --- UI: LOADING STATE ---
  if (loading) {
    return (
      <div className="singularity-loader">
        <div className="loader-core">
           <Loader2 className="spin" size={48} />
           <div className="core-pulse" />
        </div>
        <div className="loader-text">
            <h2>Compiling Analysis</h2>
            <p>Neural engine is processing interview telemetry...</p>
        </div>
        <style jsx>{`
            .singularity-loader { min-height: 100vh; background: #020202; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 32px; }
            .loader-core { position: relative; display: flex; align-items: center; justify-content: center; }
            .spin { animation: spin 1s linear infinite; color: #3b82f6; }
            .core-pulse { position: absolute; width: 100px; height: 100px; background: radial-gradient(circle, rgba(59,130,246,0.2), transparent 70%); animation: pulse 2s infinite; }
            .loader-text { text-align: center; }
            h2 { font-size: 24px; font-weight: 600; margin-bottom: 8px; }
            p { color: #888; font-size: 14px; }
            @keyframes spin { to { transform: rotate(360deg); } }
            @keyframes pulse { 0%, 100% { transform: scale(0.8); opacity: 0.5; } 50% { transform: scale(1.2); opacity: 0.2; } }
        `}</style>
      </div>
    );
  }

  // --- UI: ERROR STATE ---
  if (error || !report) {
    return (
      <div className="error-state">
         <AlertCircle size={48} className="text-red" />
         <h2>Report Generation Failed</h2>
         <p>{error}</p>
         <button onClick={() => router.push('/dashboard/student')} className="retry-btn">
            Return to Dashboard
         </button>
         <style jsx>{`
            .error-state { min-height: 100vh; background: #020202; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; }
            .text-red { color: #ef4444; }
            h2 { font-size: 20px; font-weight: 600; }
            p { color: #888; font-size: 14px; }
            .retry-btn { padding: 12px 24px; background: #fff; color: #000; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 16px; }
         `}</style>
      </div>
    );
  }

  // --- UI: MAIN REPORT ---
  return (
    <div className="cosmos-container">
      <div className="void-texture" />
      <div className="nebula-bg" />

      <div className="report-grid">
        {/* HEADER NAVIGATION */}
        <div className="nav-header">
            <button onClick={() => router.push('/dashboard/student')} className="back-link">
                <ArrowLeft size={16} /> <span>Dashboard</span>
            </button>
            <div className="session-meta">
                <span className="meta-label">SESSION ID</span>
                <span className="meta-val">{params.sessionId.slice(0,8)}</span>
            </div>
            <button className="action-btn" onClick={() => toast.success("PDF Export Initialized")}>
                <Download size={16} /> <span>EXPORT</span>
            </button>
        </div>

        {/* HERO STATS */}
        <div className="hero-stats">
            <div className="stat-glass">
                <div className="stat-icon blue"><Star size={20} /></div>
                <div>
                    <div className="stat-value">{report.overallScore}%</div>
                    <div className="stat-label">Overall Proficiency</div>
                </div>
                <div className="stat-chart">
                    <div className="bar-track"><div className="bar-fill blue" style={{ width: `${report.overallScore}%` }} /></div>
                </div>
            </div>

            <div className="stat-glass">
                <div className="stat-icon purple"><Activity size={20} /></div>
                <div>
                    <div className="stat-value">{report.averageStress}</div>
                    <div className="stat-label">Avg. Stress Level</div>
                </div>
                <div className="stat-chart">
                    <div className="bar-track"><div className="bar-fill purple" style={{ width: `${report.averageStress}%` }} /></div>
                </div>
            </div>

            <div className="stat-glass">
                <div className="stat-icon emerald"><Clock size={20} /></div>
                <div>
                    <div className="stat-value">{report.duration}</div>
                    <div className="stat-label">Session Status</div>
                </div>
            </div>

            <div className="stat-glass">
                <div className="stat-icon amber"><Brain size={20} /></div>
                <div>
                    <div className="stat-value">{report.questions.length}</div>
                    <div className="stat-label">Questions Analyzed</div>
                </div>
            </div>
        </div>

        {/* CONTENT SPLIT */}
        <div className="analysis-layout">
            
            {/* LEFT: EXECUTIVE SUMMARY */}
            <div className="summary-panel">
                <div className="obsidian-panel">
                    <div className="panel-head">
                        <Shield size={18} className="text-blue" />
                        <h3>Executive Analysis</h3>
                    </div>
                    <div className="panel-body">
                        <p className="summary-text">{report.overallSummary}</p>
                        <div className="recommendation-box">
                            <div className="rec-header">
                                <Zap size={16} /> SYSTEM RECOMMENDATION
                            </div>
                            <p>{report.recommendation}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT: QUESTION BREAKDOWN */}
            <div className="breakdown-panel">
                <h3 className="section-label">Detailed Question Log</h3>
                <div className="questions-stream">
                    {report.questions.map((q: any, idx: number) => (
                        <motion.div 
                            key={idx} 
                            className="q-card"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <div className="q-meta">
                                <span className="q-idx">0{idx + 1}</span>
                                <span className="q-cat">{q.category}</span>
                                <div className={`score-pill ${getScoreColor(q.score)}`}>
                                    {q.score}/10
                                </div>
                            </div>
                            
                            <h4 className="q-text">{q.question}</h4>
                            
                            <div className="feedback-block">
                                <span className="feedback-label">AI FEEDBACK:</span>
                                <p>{q.feedback}</p>
                            </div>

                            <div className="q-footer">
                                <div className="stress-meter">
                                    <span>Stress Analysis:</span>
                                    <span className={`stress-val ${getStressColor(q.stressScore)}`}>
                                        {q.stressScore}% // {q.stressLevel}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* --- STYLES --- */}
      <style jsx global>{`
        :root {
            --bg: #020202;
            --panel: rgba(15, 15, 15, 0.6);
            --border: rgba(255, 255, 255, 0.08);
            --text-main: #ededed;
            --text-muted: #888;
            --blue: #3b82f6;
            --purple: #a855f7;
            --emerald: #10b981;
            --amber: #f59e0b;
            --red: #ef4444;
        }
        body { background: var(--bg); color: var(--text-main); font-family: 'Inter', sans-serif; }
        .cosmos-container { min-height: 100vh; padding: 40px 20px; position: relative; display: flex; justify-content: center; }
        .void-texture { position: fixed; inset: 0; opacity: 0.03; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E"); pointer-events: none; }
        .nebula-bg { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: radial-gradient(circle at 50% 0%, rgba(59,130,246,0.05), transparent 60%); pointer-events: none; }
        .report-grid { width: 100%; max-width: 1200px; position: relative; z-index: 10; display: flex; flex-direction: column; gap: 40px; }
        .nav-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 20px; }
        .back-link { display: flex; align-items: center; gap: 8px; color: var(--text-muted); background: none; border: none; cursor: pointer; font-size: 14px; transition: color 0.2s; }
        .back-link:hover { color: #fff; }
        .session-meta { display: flex; gap: 12px; align-items: center; font-family: 'JetBrains Mono', monospace; font-size: 12px; }
        .meta-label { color: var(--text-muted); }
        .meta-val { color: #fff; background: rgba(255,255,255,0.05); padding: 4px 8px; border-radius: 4px; }
        .action-btn { display: flex; align-items: center; gap: 8px; background: #fff; color: #000; border: none; padding: 8px 16px; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer; letter-spacing: 0.5px; transition: transform 0.2s; }
        .action-btn:hover { transform: translateY(-1px); }
        .hero-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .stat-glass { background: var(--panel); border: 1px solid var(--border); padding: 24px; border-radius: 16px; display: flex; flex-direction: column; justify-content: space-between; height: 140px; backdrop-filter: blur(12px); transition: border-color 0.2s; position: relative; overflow: hidden; }
        .stat-glass:hover { border-color: rgba(255,255,255,0.15); }
        .stat-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; }
        .stat-icon.blue { background: rgba(59,130,246,0.1); color: var(--blue); }
        .stat-icon.purple { background: rgba(168,85,247,0.1); color: var(--purple); }
        .stat-icon.emerald { background: rgba(16,185,129,0.1); color: var(--emerald); }
        .stat-icon.amber { background: rgba(245,158,11,0.1); color: var(--amber); }
        .stat-value { font-size: 28px; font-weight: 700; color: #fff; line-height: 1; margin-bottom: 4px; }
        .stat-label { font-size: 12px; color: var(--text-muted); }
        .stat-chart { margin-top: 12px; width: 100%; }
        .bar-track { width: 100%; height: 4px; background: rgba(255,255,255,0.05); border-radius: 2px; overflow: hidden; }
        .bar-fill { height: 100%; border-radius: 2px; }
        .bar-fill.blue { background: var(--blue); }
        .bar-fill.purple { background: var(--purple); }
        .analysis-layout { display: grid; grid-template-columns: 1fr 1.5fr; gap: 32px; align-items: start; }
        .obsidian-panel { background: var(--panel); border: 1px solid var(--border); border-radius: 20px; overflow: hidden; backdrop-filter: blur(12px); }
        .panel-head { padding: 24px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.01); }
        .panel-head h3 { font-size: 15px; font-weight: 600; color: #fff; margin: 0; }
        .text-blue { color: var(--blue); }
        .panel-body { padding: 32px; }
        .summary-text { font-size: 14px; line-height: 1.7; color: #ccc; margin-bottom: 32px; }
        .recommendation-box { background: rgba(245,158,11,0.05); border: 1px solid rgba(245,158,11,0.2); padding: 24px; border-radius: 12px; }
        .rec-header { display: flex; align-items: center; gap: 8px; color: var(--amber); font-size: 11px; font-weight: 700; letter-spacing: 1px; margin-bottom: 12px; }
        .recommendation-box p { color: #ddd; font-size: 13px; line-height: 1.6; margin: 0; }
        .section-label { font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; display: block; }
        .questions-stream { display: flex; flex-direction: column; gap: 16px; }
        .q-card { background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: 16px; padding: 24px; transition: background 0.2s; }
        .q-card:hover { background: rgba(255,255,255,0.03); border-color: rgba(255,255,255,0.1); }
        .q-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .q-idx { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--text-muted); }
        .q-cat { font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 4px 8px; background: rgba(255,255,255,0.05); border-radius: 4px; color: #fff; }
        .score-pill { font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; padding: 4px 8px; border-radius: 4px; }
        .score-pill.high { color: var(--emerald); background: rgba(16,185,129,0.1); }
        .score-pill.mid { color: var(--amber); background: rgba(245,158,11,0.1); }
        .score-pill.low { color: var(--red); background: rgba(239,68,68,0.1); }
        .q-text { font-size: 16px; font-weight: 500; color: #fff; line-height: 1.5; margin: 0 0 20px 0; }
        .feedback-block { background: rgba(0,0,0,0.3); border-left: 2px solid var(--border); padding: 16px; border-radius: 0 8px 8px 0; margin-bottom: 16px; }
        .feedback-label { font-size: 10px; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 6px; letter-spacing: 0.5px; }
        .feedback-block p { font-size: 13px; color: #bbb; line-height: 1.6; margin: 0; }
        .q-footer { display: flex; justify-content: flex-end; border-top: 1px solid rgba(255,255,255,0.03); padding-top: 12px; }
        .stress-meter { font-size: 11px; color: var(--text-muted); display: flex; gap: 8px; font-family: 'JetBrains Mono', monospace; }
        .stress-val { font-weight: 600; }
        .stress-val.high-stress { color: var(--red); }
        .stress-val.mid-stress { color: var(--amber); }
        .stress-val.low-stress { color: var(--emerald); }
        @media (max-width: 1024px) {
            .hero-stats { grid-template-columns: 1fr 1fr; }
            .analysis-layout { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}