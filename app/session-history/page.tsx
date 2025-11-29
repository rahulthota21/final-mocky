"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Download, TrendingUp, TrendingDown, Minus, 
  Brain, Calendar, Eye, Filter, Search, FileText
} from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase";
import { useAppStore } from "@/lib/store";

// Robust API URL (if needed for exports)
const API_URL = "http://127.0.0.1:8000";

type SessionHistory = {
  id: string;
  date: string;
  role: string;
  company: string;
  duration: string;
  overallScore: number;
  stressLevel: number;
  questionsCount: number;
  status: string;
};

export default function SessionHistoryPage() {
  const router = useRouter();
  const { user } = useAppStore();
  
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [sessions, setSessions] = useState<SessionHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch Real Data
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            router.push("/auth/login");
            return;
        }
        const userId = session.user.id;

        // A. Fetch Sessions
        const { data: sessionData, error: sessionErr } = await supabase
            .from("mock_interview_sessions")
            .select("id, start_time, end_time, status")
            .eq("user_id", userId)
            .order("start_time", { ascending: false });
            
        if (sessionErr) throw sessionErr;

        if (!sessionData || sessionData.length === 0) {
            setSessions([]);
            setIsLoading(false);
            return;
        }

        // B. Fetch Reports for Scores & Stats
        const sessionIds = sessionData.map(s => s.id);
        const { data: reportData, error: reportErr } = await supabase
            .from("mock_interview_reports")
            .select("session_id, final_score, average_stress_score")
            .in("session_id", sessionIds);

        if (reportErr) throw reportErr;

        // C. Fetch Question Counts
        const { data: questionData } = await supabase
            .from("mock_interview_questions")
            .select("session_id")
            .in("session_id", sessionIds);

        // Helpers for mapping
        const scoreMap: Record<string, any> = {};
        (reportData || []).forEach(r => {
            scoreMap[r.session_id] = { 
                score: r.final_score, 
                stress: r.average_stress_score 
            };
        });

        const countMap: Record<string, number> = {};
        (questionData || []).forEach(q => {
            countMap[q.session_id] = (countMap[q.session_id] || 0) + 1;
        });

        // D. Format Data
        const formatted: SessionHistory[] = sessionData.map(s => {
            const report = scoreMap[s.id] || {};
            
            // Duration Calc
            let duration = "--";
            if (s.start_time && s.end_time) {
                const diff = (new Date(s.end_time).getTime() - new Date(s.start_time).getTime()) / 60000;
                duration = `${Math.floor(diff)}m`;
            }

            return {
                id: s.id,
                date: new Date(s.start_time).toLocaleDateString(),
                role: "Software Engineer", // Placeholder as per schema constraint
                company: "Mock Interview", // Placeholder
                duration: duration,
                overallScore: report.score ? Math.round(report.score) : 0,
                stressLevel: report.stress ? Math.round(report.stress) : 0,
                questionsCount: countMap[s.id] || 0,
                status: s.status || "completed"
            };
        });

        setSessions(formatted);
      } catch (err: any) {
        console.error("History fetch error:", err);
        toast.error("Failed to load session history");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [router]);

  // 2. Filtering Logic
  const filteredSessions = sessions.filter(session => {
    if (filter === 'all') return true;
    if (filter === 'high') return session.overallScore >= 85;
    if (filter === 'medium') return session.overallScore >= 70 && session.overallScore < 85;
    if (filter === 'low') return session.overallScore < 70;
    return true;
  });

  const averageScore = sessions.length > 0
    ? Math.round(sessions.reduce((acc, s) => acc + s.overallScore, 0) / sessions.length)
    : 0;

  const averageStress = sessions.length > 0
    ? Math.round(sessions.reduce((acc, s) => acc + s.stressLevel, 0) / sessions.length)
    : 0;

  // 3. UI Helpers
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'score-emerald';
    if (score >= 70) return 'score-amber';
    return 'score-red';
  };

  const getStressIcon = (stress: number) => {
    if (stress <= 30) return <TrendingDown className="w-4 h-4 text-emerald-400" />;
    if (stress <= 50) return <Minus className="w-4 h-4 text-yellow-400" />;
    return <TrendingUp className="w-4 h-4 text-red-400" />;
  };

  return (
    <div className="singularity-wrapper">
      <div className="void-texture" />
      <div className="nebula-side" />
      
      <div className="main-grid">
        {/* Header */}
        <div className="header-row">
            <button onClick={() => router.back()} className="back-btn">
                <ArrowLeft size={16} /> <span>Back</span>
            </button>
            <div className="header-info">
                <h1 className="page-title">Interview Archives</h1>
                <p className="page-sub">Complete history of your training simulations.</p>
            </div>
            <button className="export-btn" onClick={() => toast.success("History exported to CSV")}>
                <Download size={16} /> <span>Export Data</span>
            </button>
        </div>

        {/* Stats Overview */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="stats-grid"
        >
            <div className="stat-card">
                <div className="stat-icon blue"><Brain size={20} /></div>
                <div>
                    <div className="stat-val">{sessions.length}</div>
                    <div className="stat-label">Total Sessions</div>
                </div>
            </div>
            <div className="stat-card">
                <div className="stat-icon purple"><TrendingUp size={20} /></div>
                <div>
                    <div className="stat-val">{averageScore}%</div>
                    <div className="stat-label">Avg. Score</div>
                </div>
            </div>
            <div className="stat-card">
                <div className="stat-icon amber"><Calendar size={20} /></div>
                <div>
                    <div className="stat-val">{sessions.filter(s => s.overallScore >= 80).length}</div>
                    <div className="stat-label">High Scores</div>
                </div>
            </div>
        </motion.div>

        {/* Filter Bar */}
        <div className="filter-bar">
            <div className="filter-label">
                <Filter size={14} /> <span>Filter Performance:</span>
            </div>
            <div className="filter-opts">
                {['all', 'high', 'medium', 'low'].map((f) => (
                    <button 
                        key={f}
                        onClick={() => setFilter(f as any)}
                        className={`filter-btn ${filter === f ? 'active' : ''}`}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>
        </div>

        {/* Sessions List */}
        <div className="sessions-list">
            {isLoading ? (
                <div className="loading-state">Syncing archives...</div>
            ) : filteredSessions.length === 0 ? (
                <div className="empty-state">No sessions found matching criteria.</div>
            ) : (
                filteredSessions.map((session, i) => (
                    <motion.div
                        key={session.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="session-card"
                    >
                        <div className="s-left">
                            <div className="s-icon-box"><FileText size={18} /></div>
                            <div>
                                <h3 className="s-role">{session.role}</h3>
                                <p className="s-meta">{session.date} • {session.duration}</p>
                            </div>
                        </div>

                        <div className="s-stats">
                            <div className="s-metric">
                                <span className="m-label">Questions</span>
                                <span className="m-val">{session.questionsCount}</span>
                            </div>
                            <div className="s-metric">
                                <span className="m-label">Stress</span>
                                <div className="m-flex">
                                    {getStressIcon(session.stressLevel)}
                                    <span className="m-val">{session.stressLevel}%</span>
                                </div>
                            </div>
                        </div>

                        <div className="s-right">
                            <div className={`s-score ${getScoreColor(session.overallScore)}`}>
                                {session.overallScore}%
                            </div>
                            <button 
                                onClick={() => router.push(`/interview/${session.id}/summary`)}
                                className="s-view-btn"
                            >
                                <Eye size={16} />
                            </button>
                        </div>
                    </motion.div>
                ))
            )}
        </div>
      </div>

      <style jsx global>{`
        :root {
            --bg: #020202;
            --obsidian: #0a0a0a;
            --border: rgba(255, 255, 255, 0.08);
            --primary: #3b82f6;
            --text: #ededed;
            --muted: #888;
        }
        
        .singularity-wrapper { min-height: 100vh; padding: 40px 20px; position: relative; }
        .void-texture { position: fixed; inset: 0; opacity: 0.03; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E"); pointer-events: none; }
        .nebula-side { position: fixed; top: 20%; left: -10%; width: 600px; height: 600px; background: radial-gradient(circle, rgba(168,85,247,0.05), transparent 70%); filter: blur(100px); pointer-events: none; }
        
        .main-grid { max-width: 1000px; margin: 0 auto; position: relative; z-index: 10; }

        /* Header */
        .header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
        .back-btn { display: flex; align-items: center; gap: 8px; background: none; border: 1px solid var(--border); color: var(--muted); padding: 8px 16px; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
        .back-btn:hover { border-color: #fff; color: #fff; }
        .header-info { text-align: center; }
        .page-title { font-size: 28px; font-weight: 700; letter-spacing: -0.5px; color: #fff; }
        .page-sub { font-size: 13px; color: var(--muted); }
        .export-btn { display: flex; align-items: center; gap: 8px; background: #fff; color: #000; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; }

        /* Stats */
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 32px; }
        .stat-card { background: var(--obsidian); border: 1px solid var(--border); padding: 24px; border-radius: 16px; display: flex; align-items: center; gap: 16px; }
        .stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .stat-icon.blue { background: rgba(59,130,246,0.1); color: #3b82f6; }
        .stat-icon.purple { background: rgba(168,85,247,0.1); color: #a855f7; }
        .stat-icon.amber { background: rgba(245,158,11,0.1); color: #f59e0b; }
        .stat-val { font-size: 24px; font-weight: 700; color: #fff; line-height: 1; }
        .stat-label { font-size: 12px; color: var(--muted); margin-top: 4px; }

        /* Filter */
        .filter-bar { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid var(--border); }
        .filter-label { display: flex; align-items: center; gap: 8px; color: var(--muted); font-size: 13px; font-weight: 500; }
        .filter-opts { display: flex; gap: 8px; }
        .filter-btn { background: transparent; border: 1px solid var(--border); color: var(--muted); padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; transition: all 0.2s; }
        .filter-btn:hover { border-color: #fff; color: #fff; }
        .filter-btn.active { background: rgba(59,130,246,0.1); border-color: var(--primary); color: var(--primary); }

        /* Sessions List */
        .sessions-list { display: flex; flex-direction: column; gap: 12px; }
        .session-card { background: rgba(255,255,255,0.02); border: 1px solid var(--border); padding: 20px; border-radius: 16px; display: flex; align-items: center; justify-content: space-between; transition: all 0.2s; }
        .session-card:hover { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.1); }
        
        .s-left { display: flex; align-items: center; gap: 16px; flex: 2; }
        .s-icon-box { width: 40px; height: 40px; background: rgba(255,255,255,0.05); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: var(--muted); }
        .s-role { font-size: 15px; font-weight: 600; color: #fff; }
        .s-meta { font-size: 12px; color: var(--muted); margin-top: 2px; }

        .s-stats { display: flex; gap: 32px; flex: 1; justify-content: center; }
        .s-metric { display: flex; flex-direction: column; align-items: center; }
        .m-label { font-size: 10px; text-transform: uppercase; color: var(--muted); margin-bottom: 4px; }
        .m-val { font-size: 14px; font-weight: 600; color: #ddd; }
        .m-flex { display: flex; align-items: center; gap: 6px; }

        .s-right { display: flex; align-items: center; gap: 20px; flex: 1; justify-content: flex-end; }
        .s-score { font-family: 'JetBrains Mono', monospace; font-size: 16px; font-weight: 700; padding: 4px 12px; border-radius: 6px; background: rgba(255,255,255,0.03); border: 1px solid var(--border); }
        .s-score.score-emerald { color: #10b981; border-color: rgba(16,185,129,0.3); background: rgba(16,185,129,0.05); }
        .s-score.score-amber { color: #f59e0b; border-color: rgba(245,158,11,0.3); background: rgba(245,158,11,0.05); }
        .s-score.score-red { color: #ef4444; border-color: rgba(239,68,68,0.3); background: rgba(239,68,68,0.05); }
        
        .s-view-btn { width: 36px; height: 36px; border-radius: 8px; border: 1px solid var(--border); background: transparent; color: var(--muted); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
        .s-view-btn:hover { background: #fff; color: #000; border-color: #fff; }

        .loading-state, .empty-state { text-align: center; padding: 60px; color: var(--muted); font-size: 14px; border: 1px dashed var(--border); border-radius: 16px; }
      `}</style>
    </div>
  );
}