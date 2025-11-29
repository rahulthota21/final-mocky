"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { 
  Upload, Brain, Calendar, TrendingUp, FileText, 
  Play, Eye, CheckCircle, Clock, AlertCircle, X, Loader2, 
  Zap, Activity, Terminal, ChevronRight
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { useAppStore } from "@/lib/store";

// Robust API URL (Points to Student Backend)
const API_URL = "http://127.0.0.1:8000";

type SessionView = {
  id: string;
  role: string;
  date: string;
  score: number | null;
  status: string;
};

export default function StudentDashboard() {
  const router = useRouter();
  const { user, setUser } = useAppStore();
  
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobRole, setJobRole] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [sessions, setSessions] = useState<SessionView[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // 1. Auth & Data Fetching
  useEffect(() => {
    let isMounted = true;

    const initDashboard = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please log in to access the dashboard");
        router.push("/auth/login");
        return;
      }

      // Sync global store if needed
      if (!user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
          
        if (profile) {
            setUser({
                id: profile.user_id,
                email: profile.email,
                name: profile.name,
                role: profile.role
            });
        }
      }
      
      const userId = session.user.id;

      // Fetch Sessions
      const { data: sessionData, error: sessionError } = await supabase
        .from("mock_interview_sessions")
        .select("id, status, start_time, resume_id")
        .eq("user_id", userId)
        .order("start_time", { ascending: false });

      if (sessionError) {
        console.error("Error fetching sessions:", sessionError);
        if (isMounted) setIsLoadingHistory(false);
        return;
      }

      if (!sessionData || sessionData.length === 0) {
        if (isMounted) {
            setSessions([]);
            setIsLoadingHistory(false);
        }
        return;
      }

      // Fetch Reports to get scores
      const sessionIds = sessionData.map(s => s.id);
      const { data: reportData } = await supabase
        .from("mock_interview_reports")
        .select("session_id, final_score")
        .in("session_id", sessionIds);

      const scoreMap = Object.fromEntries(
        (reportData || []).map(r => [r.session_id, r.final_score])
      );

      const formattedSessions: SessionView[] = sessionData.map(s => ({
        id: s.id,
        // Default role as it's not stored in session table yet
        role: "Software Engineer", 
        date: new Date(s.start_time).toLocaleDateString(),
        score: scoreMap[s.id] !== undefined ? Math.round(scoreMap[s.id]) : null,
        status: s.status || "completed"
      }));

      if (isMounted) {
        setSessions(formattedSessions);
        setIsLoadingHistory(false);
      }
    };

    initDashboard();
    return () => { isMounted = false; };
  }, [router, setUser, user]);

  // 2. File Handling
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setResumeFile(acceptedFiles[0]);
      toast.success("Resume attached");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1
  });

  // 3. Generate Interview
  const handleGenerateInterview = async () => {
    if (!resumeFile || !jobRole) {
      toast.error("Please upload a resume and set a job role");
      return;
    }

    setIsGenerating(true);
    const toastId = toast.loading("Initializing AI Interviewer...");

    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("Not authenticated");
        
        const userId = session.user.id;

        // A. Upload Resume
        const formData = new FormData();
        formData.append("file", resumeFile);
        
        // Call Student API (Port 8000)
        const uploadRes = await fetch(`${API_URL}/interview/upload-resume/${userId}`, {
            method: "POST",
            body: formData,
        });

        if (!uploadRes.ok) {
            const err = await uploadRes.json();
            throw new Error(err.detail || "Upload failed");
        }

        const { resume_id } = await uploadRes.json();

        // B. Generate Questions
        toast.loading("Analyzing resume & generating questions...", { id: toastId });
        
        const genRes = await fetch(`${API_URL}/interview/generate-questions/${userId}/${resume_id}`, {
            method: "POST"
        });

        if (!genRes.ok) {
            const err = await genRes.json();
            throw new Error(err.detail || "Question generation failed");
        }

        const { session_id } = await genRes.json();

        toast.success("Interview Ready!", { id: toastId });
        router.push(`/interview/${session_id}`);

    } catch (err: any) {
        console.error(err);
        const msg = err.message === "Failed to fetch" 
            ? "Cannot connect to Student Server (Port 8000). Is it running?" 
            : (err.message || "Failed to start interview");
        toast.error(msg, { id: toastId });
        setIsGenerating(false);
    }
  };

  /* --- UI (LIQUID OBSIDIAN THEME) --- */
  return (
    <div className="cosmos-container">
      <div className="ambient-light" />
      <div className="scanlines" />
      
      <div className="dashboard-wrapper">
        
        {/* HEADER MODULE */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="header-module"
        >
          <div className="header-titles">
            <h1>Student Command</h1>
            <p>Simulate. Analyze. Optimize.</p>
          </div>
          {user && (
            <div className="user-chip">
              <div className="status-dot" />
              <span>{user.email}</span>
            </div>
          )}
        </motion.div>

        {/* STATS ORBIT */}
        <motion.div 
          className="stats-orbit"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          <GlassStat 
            icon={Brain} label="Total Sessions" value={sessions.length} 
            trend="+2 this week" color="blue" 
          />
          <GlassStat 
            icon={TrendingUp} label="Avg. Performance" 
            value={
              sessions.filter(s => s.score !== null).length > 0
              ? Math.round(sessions.reduce((acc, s) => acc + (s.score || 0), 0) / sessions.filter(s => s.score !== null).length) + "%"
              : "--"
            } 
            trend="Based on history" color="emerald" 
          />
          <GlassStat 
            icon={Calendar} label="Last Active" 
            value={sessions.length > 0 ? sessions[0].date : "--"} 
            trend="System Synced" color="purple" 
          />
        </motion.div>

        {/* MAIN SPLIT LAYOUT */}
        <div className="control-grid">
          
          {/* LEFT: INITIATE SIMULATION */}
          <motion.div 
            className="control-panel"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="panel-header">
              <Zap size={18} className="text-white" />
              <h3>Initialize Simulation</h3>
            </div>

            <div className="panel-body">
              {/* Drop Zone */}
              <div 
                {...getRootProps()} 
                className={`data-ingest ${isDragActive ? 'active' : ''} ${resumeFile ? 'has-data' : ''}`}
              >
                <input {...getInputProps()} />
                {resumeFile ? (
                  <div className="file-loaded">
                    <FileText size={32} className="text-emerald-400" />
                    <div>
                      <span className="filename">{resumeFile.name}</span>
                      <span className="filesize">{(resumeFile.size / 1024).toFixed(1)} KB // READY</span>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setResumeFile(null); }}
                      className="remove-btn"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="upload-prompt">
                    <div className="icon-ring"><Upload size={20} /></div>
                    <span>Ingest Resume Vector (PDF)</span>
                  </div>
                )}
                {/* Scanning Line Animation */}
                <div className="scan-bar" />
              </div>

              {/* Role Input */}
              <div className="input-block">
                <label>Target Designation</label>
                <input 
                  type="text" 
                  placeholder="e.g. Senior React Engineer"
                  value={jobRole}
                  onChange={(e) => setJobRole(e.target.value)}
                  className="liquid-input"
                />
              </div>

              {/* Action Button */}
              <button 
                className="photon-btn"
                onClick={handleGenerateInterview}
                disabled={isGenerating || !resumeFile || !jobRole}
              >
                {isGenerating ? (
                  <span className="flex-center"><Loader2 className="spin" size={16} /> INITIALIZING...</span>
                ) : (
                  <span className="flex-center"><Play size={16} fill="currentColor" /> START SIMULATION</span>
                )}
                <div className="photon-glow" />
              </button>
            </div>
          </motion.div>

          {/* RIGHT: SESSION LOGS */}
          <motion.div 
            className="history-panel"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="panel-header">
              <Activity size={18} className="text-zinc-400" />
              <h3>Session Log</h3>
            </div>

            <div className="log-stream">
              {isLoadingHistory ? (
                <div className="log-message">Retrieving data stream...</div>
              ) : sessions.length === 0 ? (
                <div className="log-message">No session signatures found.</div>
              ) : (
                sessions.map((session) => (
                  <div key={session.id} className="log-entry">
                    <div className="log-left">
                      <div className={`status-indicator ${session.status}`} />
                      <div>
                        <h4>{session.role}</h4>
                        <span className="log-date">{session.date}</span>
                      </div>
                    </div>
                    <div className="log-right">
                      {session.score !== null ? (
                        <div className={`score-readout ${getScoreClass(session.score)}`}>
                          {session.score}%
                        </div>
                      ) : (
                        <span className="pending-text">Pending</span>
                      )}
                      <button 
                        onClick={() => router.push(`/interview/${session.id}/summary`)}
                        className="view-link"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>

        </div>
      </div>

      {/* --- STYLES --- */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

        :root {
          --bg-void: #050505;
          --bg-panel: rgba(20, 20, 20, 0.4);
          --border: rgba(255, 255, 255, 0.08);
          --primary: #ffffff;
          --accent-blue: #3b82f6;
          --accent-emerald: #10b981;
          --text-main: #ededed;
          --text-muted: #888888;
        }

        body { background: var(--bg-void); color: var(--text-main); font-family: 'Inter', sans-serif; }

        .cosmos-container {
          min-height: 100vh; width: 100%; position: relative; overflow-x: hidden;
          padding-top: 120px; /* Space for Navbar */
          display: flex; justify-content: center;
        }

        .ambient-light {
          position: fixed; top: -20%; left: 50%; transform: translateX(-50%);
          width: 1000px; height: 800px;
          background: radial-gradient(circle, rgba(59,130,246,0.05), transparent 70%);
          pointer-events: none; z-index: 0;
        }
        
        .scanlines {
          position: fixed; inset: 0; pointer-events: none; z-index: 1; opacity: 0.3;
          background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.1));
          background-size: 100% 4px;
        }

        .dashboard-wrapper {
          position: relative; z-index: 10; width: 100%; max-width: 1200px; padding: 0 24px 60px;
        }

        /* HEADER */
        .header-module {
          display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 48px;
        }
        .header-titles h1 {
          font-size: 36px; font-weight: 600; letter-spacing: -0.03em; margin-bottom: 4px;
          background: linear-gradient(180deg, #fff, #888); -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .header-titles p { color: var(--text-muted); font-family: 'JetBrains Mono', monospace; font-size: 13px; }
        
        .user-chip {
          display: flex; align-items: center; gap: 10px; padding: 8px 16px;
          background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 100px;
          font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--text-muted);
        }
        .status-dot { width: 6px; height: 6px; background: var(--accent-emerald); border-radius: 50%; box-shadow: 0 0 8px var(--accent-emerald); }

        /* STATS */
        .stats-orbit {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 48px;
        }
        .glass-stat {
          background: rgba(10,10,10,0.6); border: 1px solid var(--border); padding: 24px;
          border-radius: 16px; display: flex; align-items: center; gap: 20px;
          backdrop-filter: blur(10px); transition: transform 0.2s;
        }
        .glass-stat:hover { transform: translateY(-2px); border-color: rgba(255,255,255,0.15); }
        .stat-icon {
          width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center;
        }
        .stat-value { font-size: 28px; font-weight: 600; color: #fff; line-height: 1; margin-bottom: 4px; }
        .stat-label { font-size: 13px; color: var(--text-muted); }
        .stat-trend { font-size: 11px; font-family: 'JetBrains Mono', monospace; opacity: 0.6; margin-top: 4px; display: block; }

        /* MAIN GRID */
        .control-grid {
          display: grid; grid-template-columns: 1.2fr 1fr; gap: 32px;
        }

        /* PANELS */
        .control-panel, .history-panel {
          background: rgba(10,10,10,0.6); border: 1px solid var(--border); border-radius: 20px;
          overflow: hidden; backdrop-filter: blur(12px); display: flex; flex-direction: column;
        }
        .control-panel { min-height: 450px; }
        .history-panel { min-height: 450px; }

        .panel-header {
          padding: 20px 24px; border-bottom: 1px solid var(--border);
          display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,0.01);
        }
        .panel-header h3 { font-size: 14px; font-weight: 600; color: #fff; letter-spacing: 0.02em; text-transform: uppercase; }

        .panel-body { padding: 32px; flex: 1; display: flex; flex-direction: column; gap: 24px; }

        /* DROPZONE */
        .data-ingest {
          border: 1px dashed var(--border); border-radius: 12px; padding: 40px;
          position: relative; overflow: hidden; cursor: pointer; transition: all 0.3s;
          background: rgba(0,0,0,0.2); text-align: center;
        }
        .data-ingest:hover { border-color: var(--primary); background: rgba(255,255,255,0.02); }
        .data-ingest.active { border-color: var(--accent-emerald); background: rgba(16,185,129,0.05); }
        .data-ingest.has-data { border-style: solid; border-color: var(--accent-emerald); }

        .upload-prompt { display: flex; flex-direction: column; align-items: center; gap: 16px; }
        .icon-ring {
          width: 48px; height: 48px; border-radius: 50%; border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center; color: var(--text-muted);
        }
        .upload-prompt span { font-size: 13px; color: var(--text-muted); }

        .file-loaded { display: flex; align-items: center; gap: 16px; text-align: left; width: 100%; justify-content: center; }
        .filename { display: block; color: #fff; font-weight: 500; font-size: 14px; }
        .filesize { display: block; color: var(--accent-emerald); font-family: 'JetBrains Mono', monospace; font-size: 11px; }
        .remove-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 8px; }
        .remove-btn:hover { color: #ef4444; }

        .scan-bar {
          position: absolute; top: 0; left: 0; width: 100%; height: 2px;
          background: var(--accent-emerald); opacity: 0; pointer-events: none;
        }
        .data-ingest:hover .scan-bar { animation: scan 2s linear infinite; opacity: 0.5; }
        @keyframes scan { 0% { top: 0; } 100% { top: 100%; } }

        /* INPUTS */
        .input-block label { display: block; font-size: 12px; color: var(--text-muted); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
        .liquid-input {
          width: 100%; background: rgba(255,255,255,0.03); border: 1px solid var(--border);
          border-radius: 8px; padding: 14px 16px; color: #fff; font-size: 14px; outline: none;
          transition: all 0.2s;
        }
        .liquid-input:focus { border-color: var(--primary); background: rgba(255,255,255,0.05); }

        /* PHOTON BUTTON */
        .photon-btn {
          margin-top: auto; width: 100%; height: 48px; background: #fff; border: none;
          border-radius: 8px; color: #000; font-weight: 600; font-size: 13px;
          cursor: pointer; position: relative; overflow: hidden; transition: transform 0.1s;
        }
        .photon-btn:hover:not(:disabled) { transform: translateY(-1px); }
        .photon-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .photon-glow {
          position: absolute; inset: 0; background: radial-gradient(circle, rgba(255,255,255,1) 0%, transparent 70%);
          opacity: 0; transition: opacity 0.3s; mix-blend-mode: overlay; pointer-events: none;
        }
        .photon-btn:hover .photon-glow { opacity: 0.5; }
        .flex-center { display: flex; align-items: center; justify-content: center; gap: 8px; }
        .spin { animation: spin 1s linear infinite; }

        /* LOG STREAM */
        .log-stream { padding: 0; overflow-y: auto; max-height: 500px; }
        .log-message { padding: 32px; text-align: center; color: var(--text-muted); font-size: 13px; font-style: italic; }
        
        .log-entry {
          display: flex; align-items: center; justify-content: space-between; padding: 16px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.03); transition: background 0.2s;
        }
        .log-entry:last-child { border-bottom: none; }
        .log-entry:hover { background: rgba(255,255,255,0.02); }

        .log-left { display: flex; align-items: center; gap: 16px; }
        .status-indicator { width: 8px; height: 8px; border-radius: 50%; }
        .status-indicator.completed { background: var(--accent-emerald); box-shadow: 0 0 5px var(--accent-emerald); }
        .status-indicator.pending { background: #fbbf24; }
        
        .log-left h4 { font-size: 14px; font-weight: 500; color: #fff; margin: 0 0 2px 0; }
        .log-date { font-size: 11px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }

        .log-right { display: flex; align-items: center; gap: 16px; }
        .score-readout { font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 700; }
        .score-readout.high { color: var(--accent-emerald); }
        .score-readout.mid { color: #fbbf24; }
        .score-readout.low { color: #ef4444; }
        .pending-text { font-size: 11px; color: var(--text-muted); font-style: italic; }

        .view-link { background: none; border: none; color: var(--text-muted); cursor: pointer; transition: color 0.2s; }
        .view-link:hover { color: #fff; }

        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 1024px) { .control-grid, .stats-orbit { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}

// --- SUBCOMPONENTS ---
function GlassStat({ icon: Icon, label, value, trend, color }: any) {
  const colors: any = {
    blue: { bg: 'rgba(59,130,246,0.1)', text: '#3b82f6' },
    emerald: { bg: 'rgba(16,185,129,0.1)', text: '#10b981' },
    purple: { bg: 'rgba(168,85,247,0.1)', text: '#a855f7' }
  };
  const theme = colors[color];

  return (
    <div className="glass-stat">
      <div className="stat-icon" style={{ background: theme.bg, color: theme.text }}>
        <Icon size={20} />
      </div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        <span className="stat-trend" style={{ color: theme.text }}>{trend}</span>
      </div>
    </div>
  );
}

function getScoreClass(score: number) {
  if (score >= 80) return 'high';
  if (score >= 50) return 'mid';
  return 'low';
}