"use client";

import { useAppStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Plus, FileText, Clock, CheckCircle, Eye, Users, TrendingUp,
  Activity, Terminal, Database, Search, ArrowRight, Sparkles
} from "lucide-react";
import { useEffect, useState } from "react";
import { NewScreeningModal } from "./components/new-screening-modal";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/lib/database.types";

// --- LOGIC (STRICTLY PRESERVED) ---
type Row = {
  job_id   : string;
  job_title: string;
  created_at: string;
};

type Stat = { completed: number; total: number; };

async function fetchSummary() {
  const supabase = createClientComponentClient<Database>();
  // Logic preserved as requested
  return { completed: 0, total: 0 }; 
}
// --- END LOGIC ---

export default function RecruiterDashboard() {
  const { showNewScreeningModal, setShowNewScreeningModal } = useAppStore();
  const router = useRouter();

  const [list, setList] = useState<Row[]>([]);
  const [stat, setStat] = useState<Stat>({ completed: 0, total: 0 });

  useEffect(() => { (async () => {
    const { data: jobs } = await supabase
      .from("job_descriptions")
      .select("job_id,job_title,created_at")
      .order("created_at",{ ascending:false });

    setList(jobs as Row[]);

    try {
      const agg = await fetchSummary();
      if (agg) setStat(agg as Stat);
    } catch (err) {
      console.error("Failed to fetch summary:", err);
      setStat({ completed: 0, total: 0 });
    }
  })(); }, []);

  // Helpers preserved
  const color = (s: string) =>
    s === "completed" ? "text-green-400 bg-green-500/10"
    : s === "in-progress" ? "text-yellow-400 bg-yellow-500/10"
    : "text-gray-400 bg-gray-500/10";
  const icon = (s: string) =>
    s === "completed" ? <CheckCircle className="w-4 h-4" />
    : s === "in-progress" ? <Clock className="w-4 h-4" />
    : <FileText className="w-4 h-4" />;

  return (
    <div className="horixa-page">
      {/* --- GLOBAL STYLES (HORIXA THEME) --- */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        :root {
          --bg-void: #020202;
          --bg-deep-red: #1a0505;
          --accent-red: #ff2e2e;
          --accent-red-dim: rgba(255, 46, 46, 0.2);
          --glass-panel: rgba(10, 10, 10, 0.7);
          --glass-border: rgba(255, 255, 255, 0.1);
          --glass-border-hover: rgba(255, 46, 46, 0.5);
          --text-primary: #ffffff;
          --text-secondary: #888888;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; outline: none; }
        
        body {
          background-color: var(--bg-void);
          color: var(--text-primary);
          font-family: 'Inter', sans-serif;
          overflow-x: hidden;
        }

        .horixa-page {
          position: relative;
          width: 100%;
          min-height: 100vh;
          padding-top: 120px; /* Adjusted for tighter feel vs navbar */
          padding-bottom: 60px;
          /* Deeper, darker radial gradient inspired by the reference image */
          background: radial-gradient(ellipse at top center, var(--bg-deep-red) 0%, var(--bg-void) 70%);
        }
        
        /* Subtle noise texture for cinematic feel */
        .horixa-page::before {
          content: ""; position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          opacity: 0.03;
        }

        /* CONTENT WRAPPER - TIGHTER */
        .content-grid {
          position: relative; z-index: 1;
          max-width: 1100px; /* Slightly narrower for tightness */
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          flex-direction: column;
          gap: 40px; /* Reduced gap between sections */
        }

        /* TYPOGRAPHY */
        h1 { 
          font-size: 36px; font-weight: 700; letter-spacing: -0.04em; color: var(--text-primary); 
          line-height: 1; margin-bottom: 12px;
          text-shadow: 0 0 20px rgba(255, 46, 46, 0.2); /* Subtle red glow on text */
        }
        h2 { font-family: 'Inter', sans-serif; font-size: 16px; font-weight: 600; letter-spacing: -0.02em; color: var(--text-primary); }
        .sub-text { color: var(--text-secondary); font-size: 15px; font-weight: 400; line-height: 1.4; max-width: 600px; }
        .mono-label { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-secondary); }

        /* SHARP GLASS CARDS (HORIXA STYLE) */
        .sharp-glass {
          background: var(--glass-panel);
          border: 1px solid var(--glass-border);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-radius: 4px; /* Sharp corners */
          position: relative;
          transition: all 0.3s ease;
        }
        .sharp-glass:hover {
          border-color: var(--glass-border-hover);
          box-shadow: 0 0 30px rgba(255, 46, 46, 0.1); /* Red ambient glow on hover */
        }

        /* STATS ROW - TIGHTER */
        .stats-row {
          display: grid;
          grid-template-columns: repeat(1, 1fr);
          gap: 16px; /* Tighter gaps */
        }
        @media (min-width: 768px) { .stats-row { grid-template-columns: repeat(3, 1fr); } }

        .stat-item {
          padding: 20px 24px; /* Tighter padding */
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 140px; /* Reduced height */
          overflow: hidden;
        }
        
        .stat-icon { color: var(--accent-red); margin-bottom: auto; opacity: 0.8; }
        .stat-value { font-size: 36px; font-weight: 700; letter-spacing: -0.03em; line-height: 1; margin-bottom: 8px; }
        
        /* CTA SECTION - HERO STYLE */
        .cta-hero {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 32px 40px; /* Tighter padding */
          /* Red glow gradient background */
          background: linear-gradient(135deg, rgba(255, 46, 46, 0.08) 0%, rgba(10,10,10,0.8) 100%);
          border: 1px solid var(--accent-red-dim);
        }
        .cta-hero:hover { border-color: var(--accent-red); }
        
        .cta-content { max-width: 480px; }
        
        .horixa-btn {
          height: 48px;
          padding: 0 28px;
          background: var(--text-primary); /* High contrast white button like reference */
          color: #000;
          border: none;
          border-radius: 2px; /* Sharp corners */
          font-weight: 600;
          font-size: 13px;
          font-family: 'Inter', sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: all 0.3s ease;
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
        }
        .horixa-btn:hover { 
          transform: translateY(-2px); 
          box-shadow: 0 0 30px rgba(255, 255, 255, 0.3);
          background: #ffffff;
        }

        /* LIST SECTION - TIGHTER */
        .list-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--glass-border);
          margin-bottom: 0px;
        }

        .data-row-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px; /* Tighter padding */
          border-bottom: 1px solid rgba(255,255,255,0.03);
          transition: all 0.2s;
          background: rgba(255,255,255,0.01);
          margin-bottom: 8px; /* Spacing between "glass" rows */
          border-radius: 4px;
          border: 1px solid transparent;
        }
        .data-row-item:hover { 
          background: var(--glass-panel); 
          border-color: var(--glass-border-hover);
        }

        .row-main { display: flex; flex-direction: column; gap: 4px; }
        .row-title { font-size: 15px; color: var(--text-primary); font-weight: 500; }
        .row-meta { display: flex; align-items: center; gap: 8px; color: var(--text-secondary); font-size: 11px; font-family: 'JetBrains Mono', monospace; }

        .action-link {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 2px;
          border: 1px solid var(--glass-border);
          background: transparent;
          transition: all 0.2s;
        }
        .action-link:hover { 
          background: var(--accent-red-dim); 
          border-color: var(--accent-red); 
        }
      `}</style>

      <div className="content-grid">
        
        {/* HEADER SECTION (Badge Removed, Tighter) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>Recruiter Dashboard</h1>
          <p className="sub-text">Orchestrate AI-powered screening campaigns and analyze candidate telemetry.</p>
        </motion.div>

        {/* STATS HUD (Tighter, Sharper Glass) */}
        <motion.div 
          className="stats-row"
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          {/* Total Screenings */}
          <div className="sharp-glass stat-item">
            <div className="stat-icon"><Database size={18} strokeWidth={1.5} /></div>
            <div>
              <p className="stat-value">{stat.total ?? "00"}</p>
              <p className="mono-label">Total Screenings</p>
            </div>
          </div>

          {/* Candidates (Placeholder) */}
          <div className="sharp-glass stat-item">
            <div className="stat-icon"><Users size={18} strokeWidth={1.5} /></div>
            <div>
              <p className="stat-value">--</p>
              <p className="mono-label">Active Candidates</p>
            </div>
          </div>

          {/* Completed */}
          <div className="sharp-glass stat-item">
            <div className="stat-icon"><TrendingUp size={18} strokeWidth={1.5} /></div>
            <div>
              <p className="stat-value">{stat.completed ?? "00"}</p>
              <p className="mono-label">Completed Cycles</p>
            </div>
          </div>
        </motion.div>

        {/* MAIN CTA (Hero Style, High Contrast Button) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.99 }} 
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="sharp-glass cta-hero">
            <div className="cta-content">
              <h2>Initialize New Compute Engine</h2>
              <p className="sub-text" style={{ marginTop: '8px' }}>
                Deploy next-generation AI agents to process and rank candidate vectors.
              </p>
            </div>
            <button 
              onClick={() => setShowNewScreeningModal(true)}
              className="horixa-btn"
            >
              <Sparkles size={14} />
              Create Campaign
            </button>
          </div>
        </motion.div>

        {/* RECENT LIST (Tighter rows, sharp glass look) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div className="list-header">
            <span className="mono-label" style={{ color: 'var(--text-primary)', fontSize: '12px' }}>Recent Operations</span>
            <span className="mono-label">LIVE</span>
          </div>
          
          <div className="list-container" style={{ marginTop: '16px' }}>
            {list.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-white/10 rounded-sm">
                 <p className="mono-label">No data signatures found in this sector.</p>
              </div>
            ) : (
              list.map((j, i) => (
                <motion.div 
                  key={j.job_id} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: 0.3 + i * 0.05 }}
                >
                  <div className="data-row-item">
                    <div className="row-main">
                      <h3 className="row-title">{j.job_title}</h3>
                      <div className="row-meta">
                        <Terminal size={10} />
                        <span>INIT: {new Date(j.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => router.push(`/dashboard/recruiter/results/${j.job_id}`)}
                      className="action-link"
                    >
                      ACCESS DATA
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      <NewScreeningModal
        open={showNewScreeningModal}
        onClose={() => setShowNewScreeningModal(false)}
      />
    </div>
  );
}