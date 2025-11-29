"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Brain, Server, Zap, Globe, Hash, ShieldCheck, 
  Activity, Terminal, Database, Cpu 
} from "lucide-react";

/* ──────────────────────────────────────────────────────────────── */

const LABELS = ["UPLOADING_DATA", "PARSING_SEMANTICS", "NEURAL_ANALYSIS", "RANKING_VECTORS", "SEQUENCE_COMPLETE"];
const API_URL = "http://127.0.0.1:4000";

export default function Animation() {
  const qs     = useSearchParams();
  const jobId  = qs.get("job");
  const router = useRouter();

  const [pct , setPct ] = useState(0);
  const [step, setStep] = useState(0);

  const tries   = useRef(0);
  const timer   = useRef<NodeJS.Timeout | null>(null);

  // --- LOGIC PRESERVED ---
  useEffect(() => {
    if (!jobId) return;

    timer.current = setInterval(async () => {
      tries.current += 1;
      setPct(p => Math.min(p + 2, 95));
      setStep(s => (pct > 80 ? Math.min(s + 1, 3) : s));

      try {
        const res = await fetch(`${API_URL}/status?job_id=${jobId}`);
        if (res.ok) {
            const { status } = await res.json();
            if (status && status.toLowerCase() === "complete") {
                if (timer.current) clearInterval(timer.current);
                setPct(100);
                setStep(4);
                setTimeout(() => {
                    router.push(`/dashboard/recruiter/results/${jobId}`);
                }, 800); 
                return;
            }
        }
      } catch (error) {
        console.warn("Polling hiccup:", error);
      }

      if (tries.current >= 120) { 
        if (timer.current) clearInterval(timer.current);
        router.push(`/dashboard/recruiter/results/${jobId}`);
      }
    }, 5000);

    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [jobId, router, pct]);

  /* ──────────────────────────────────────────────────────────────── */
  /* 100 TRILLION DOLLAR LAYOUT */
  /* ──────────────────────────────────────────────────────────────── */

  return (
    <div className="trillion-page">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&family=JetBrains+Mono:wght@300;400;500;700&display=swap');

        :root {
          --bg-void: #000000;
          --bg-panel: rgba(20, 20, 20, 0.4);
          --accent-red: #ff2e2e;
          --accent-dim: rgba(255, 46, 46, 0.1);
          --text-main: #ffffff;
          --text-muted: #666666;
          --grid-line: rgba(255, 255, 255, 0.04);
        }

        body { 
          margin: 0; padding: 0; background: var(--bg-void); overflow: hidden; 
        }

        .trillion-page {
          position: relative; width: 100vw; height: 100vh;
          /* FIX: Explicit padding to clear the Navbar */
          padding-top: 120px; 
          padding-bottom: 40px;
          display: flex; flex-direction: column;
          background: radial-gradient(circle at 50% 50%, #1a0505 0%, #000000 70%);
          overflow: hidden;
          font-family: 'Inter', sans-serif;
        }

        /* AMBIENT NOISE & GRID */
        .trillion-page::before {
          content: ""; position: absolute; inset: 0; pointer-events: none; z-index: 0;
          background-image: linear-gradient(var(--grid-line) 1px, transparent 1px),
                            linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
          background-size: 80px 80px;
          mask-image: radial-gradient(circle at center, black 40%, transparent 100%);
        }

        /* LAYOUT GRID: Left Panel | Center Core | Right Panel */
        .command-deck {
          position: relative; z-index: 10;
          display: grid; grid-template-columns: 350px 1fr 350px;
          height: 100%; width: 100%; max-width: 1800px; margin: 0 auto;
          padding: 0 40px;
          gap: 40px;
        }

        /* SIDE PANELS */
        .panel {
          display: flex; flex-direction: column; justify-content: center; gap: 32px;
        }
        
        .panel-box {
          background: var(--bg-panel);
          border: 1px solid rgba(255,255,255,0.08);
          border-left: 2px solid var(--accent-red);
          padding: 24px;
          backdrop-filter: blur(10px);
          position: relative;
        }

        .box-header {
          font-family: 'JetBrains Mono', monospace; font-size: 10px; 
          color: var(--accent-red); letter-spacing: 0.2em; text-transform: uppercase;
          margin-bottom: 16px; display: flex; align-items: center; gap: 8px;
        }

        /* LEFT: TERMINAL LOGS */
        .log-stack { display: flex; flex-direction: column; gap: 12px; }
        .log-item {
          display: flex; align-items: center; gap: 12px;
          font-family: 'JetBrains Mono', monospace; font-size: 12px;
          color: #444; transition: all 0.3s;
        }
        .log-item.active { color: #fff; text-shadow: 0 0 10px rgba(255,255,255,0.5); }
        .log-item.done { color: var(--accent-red); opacity: 0.8; }
        
        /* RIGHT: METRICS */
        .metric-row { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px; margin-bottom: 16px; }
        .metric-label { font-size: 12px; color: var(--text-muted); }
        .metric-val { font-family: 'JetBrains Mono', monospace; font-size: 16px; color: #fff; }

        .big-pct {
          font-size: 80px; font-weight: 800; line-height: 0.9;
          letter-spacing: -0.05em; color: #fff;
          background: linear-gradient(180deg, #fff 0%, #666 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }

        /* CENTER: THE SINGULARITY */
        .center-stage {
          display: flex; align-items: center; justify-content: center;
          position: relative;
        }

        /* The Rings */
        .singularity-ring {
          position: absolute; border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.05);
          box-shadow: 0 0 50px rgba(255, 46, 46, 0.05);
        }
        .ring-1 { width: 400px; height: 400px; border-top: 1px solid var(--accent-red); animation: spin 10s linear infinite; }
        .ring-2 { width: 550px; height: 550px; border-bottom: 1px solid #fff; opacity: 0.3; animation: spin 20s linear infinite reverse; }
        .ring-3 { width: 700px; height: 700px; border: 1px dashed rgba(255,255,255,0.1); animation: spin 60s linear infinite; }

        /* The Brain Core */
        .core-container {
          position: relative; z-index: 20;
          width: 120px; height: 120px;
          background: radial-gradient(circle, rgba(255,46,46,0.2) 0%, transparent 70%);
          display: flex; align-items: center; justify-content: center;
          border-radius: 50%;
        }
        .core-icon {
          color: var(--accent-red);
          filter: drop-shadow(0 0 20px var(--accent-red));
          animation: pulse 2s ease-in-out infinite;
        }

        /* LASER SCANNER */
        .scanner-line {
          position: absolute; top: 0; left: 50%; bottom: 0; width: 2px;
          background: linear-gradient(to bottom, transparent, var(--accent-red), transparent);
          opacity: 0.3;
          animation: scan 4s ease-in-out infinite;
        }

        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(0.9); opacity: 0.7; } }
        @keyframes scan { 0%, 100% { transform: translateX(-150px); opacity: 0; } 50% { transform: translateX(150px); opacity: 1; } }

      `}</style>

      {/* MAIN LAYOUT */}
      <div className="command-deck">
        
        {/* LEFT PANEL: SYSTEM LOGS */}
        <div className="panel">
          <motion.div 
            className="panel-box"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="box-header">
              <Terminal size={12} /> Execution Sequence
            </div>
            <div className="log-stack">
              {LABELS.map((label, i) => (
                <div key={label} className={`log-item ${step === i ? 'active' : step > i ? 'done' : ''}`}>
                  <span style={{ width: 16 }}>{step === i ? ">" : step > i ? "✓" : ""}</span>
                  <span>{label.replace(/_/g, " ")}</span>
                </div>
              ))}
              <div className="log-item active" style={{ marginTop: 8, opacity: 0.5 }}>
                 <span className="animate-pulse">_</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="panel-box"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
             <div className="box-header">
              <Server size={12} /> Connection Secure
            </div>
            <div className="metric-row" style={{ border: 'none', margin: 0 }}>
              <span className="metric-label">Node Endpoint</span>
              <span className="metric-val" style={{ fontSize: 12 }}>{API_URL}</span>
            </div>
          </motion.div>
        </div>

        {/* CENTER PANEL: THE CORE */}
        <div className="center-stage">
          <div className="singularity-ring ring-3" />
          <div className="singularity-ring ring-2" />
          <div className="singularity-ring ring-1" />
          
          <div className="scanner-line" />

          <motion.div 
            className="core-container"
            animate={{ rotateY: 180 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          >
            <Brain size={64} className="core-icon" strokeWidth={1} />
          </motion.div>
        </div>

        {/* RIGHT PANEL: METRICS */}
        <div className="panel">
          <motion.div 
            className="panel-box"
            style={{ borderLeft: 'none', borderRight: '2px solid var(--accent-red)', textAlign: 'right' }}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="box-header" style={{ justifyContent: 'flex-end' }}>
              Completion Status <Activity size={12} />
            </div>
            <div className="big-pct">
              {pct}%
            </div>
            <span className="metric-label">NEURAL NETWORK CONFIDENCE</span>
          </motion.div>

          <motion.div 
            className="panel-box"
            style={{ borderLeft: 'none', borderRight: '2px solid #fff' }}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="box-header" style={{ justifyContent: 'flex-end', color: '#fff' }}>
              Operation Details <Database size={12} />
            </div>
            <div className="metric-row">
              <span className="metric-label">JOB HASH</span>
              <span className="metric-val">{jobId?.slice(0, 8) ?? "---"}</span>
            </div>
            <div className="metric-row">
              <span className="metric-label">ELAPSED TIME</span>
              <span className="metric-val">T+{tries.current * 5}s</span>
            </div>
            <div className="metric-row" style={{ border: 'none', margin: 0 }}>
              <span className="metric-label">COMPUTE UNITS</span>
              <span className="metric-val">ALLOCATING...</span>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}