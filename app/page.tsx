"use client"

import { motion, useScroll, useTransform, useMotionValue, useMotionTemplate } from "framer-motion"
import { 
  Brain, Users, GraduationCap, Zap, Shield, 
  TrendingUp, Star, Play, Menu, X, 
  Activity, ChevronRight, Terminal, ArrowUpRight
} from "lucide-react"
import Link from "next/link"
import { useAppStore } from "@/lib/store" 
import { useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"

// --- DATA CONSTANTS ---
const FEATURES = [
  { icon: Brain, title: "NEURAL_ANALYSIS", description: "Proprietary ML algorithms analyze resume semantics with 99.8% precision." },
  { icon: Users, title: "SMART_RANKING", description: "Automated candidate hierarchy based on multi-vector skill mapping." },
  { icon: GraduationCap, title: "SIM_INTERVIEWS", description: "Hyper-realistic AI interviewers that adapt to candidate stress levels." },
  { icon: Zap, title: "QUANTUM_SPEED", description: "Process 10,000+ resumes in the time it takes to brew a coffee." },
  { icon: Shield, title: "MILITARY_GRADE", description: "SOC2 Type II compliant security with end-to-end zero-knowledge encryption." },
  { icon: TrendingUp, title: "PREDICTIVE_DATA", description: "Forecast hiring success rates using historical performance data." }
]

const STATS = [
  { number: "50K+", label: "CANDIDATES_PROCESSED" },
  { number: "99.9%", label: "SYSTEM_UPTIME" },
  { number: "85%", label: "COST_REDUCTION" },
  { number: "500+", label: "ENTERPRISE_NODES" }
]

const TESTIMONIALS = [
  { name: "Sarah Chen", role: "VP Talent, TechCorp", content: "It’s not just software; it’s a paradigm shift. We hired our CTO using Mock'n-Hire.", rating: 5 },
  { name: "Alex Rodriguez", role: "Senior Dev", content: "The interview simulation was harder than the real thing. I was over-prepared.", rating: 5 },
  { name: "Michael Kim", role: "Founder, Zenith", content: "Enterprise power at a startup price point. The ROI was visible in week one.", rating: 5 }
]

// --- SPOTLIGHT COMPONENT ---
const SpotlightCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div className={`spotlight-card ${className}`} onMouseMove={handleMouseMove}>
      <motion.div
        className="spotlight-overlay"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              500px circle at ${mouseX}px ${mouseY}px,
              rgba(220, 38, 38, 0.08),
              transparent 80%
            )
          `
        }}
      />
      <motion.div
        className="card-border-glow"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              400px circle at ${mouseX}px ${mouseY}px,
              rgba(220, 38, 38, 0.4),
              transparent 80%
            )
          `
        }}
      />
      <div className="card-content">{children}</div>
      <div className="card-border" />
    </div>
  );
};

export default function LandingPage() {
  const { user } = useAppStore()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const containerRef = useRef(null)
  
  // Parallax Effects
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] })
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  
  useEffect(() => {
    if (user) router.push(`/dashboard/${user.role}`)
  }, [user, router])

  if (user) return (
    <div className="loading-screen">
      <div className="loader-core">
        <div className="loader-ring" />
        <Brain size={24} className="loader-icon" />
      </div>
      <p>INITIALIZING_SYSTEM...</p>
      {/* Styles for loader inline for immediate render */}
      <style jsx>{`
        .loading-screen { height: 100vh; display: flex; flex-direction: column; gap: 24px; align-items: center; justify-content: center; background: #020202; color: #dc2626; font-family: 'JetBrains Mono', monospace; font-size: 12px; letter-spacing: 2px; }
        .loader-core { position: relative; width: 64px; height: 64px; display: flex; align-items: center; justify-content: center; }
        .loader-ring { position: absolute; inset: 0; border: 1px solid rgba(220,38,38,0.2); border-top-color: #dc2626; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )

  return (
    <div className="singularity-container">
      {/* --- GLOBAL STYLES --- */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&family=JetBrains+Mono:wght@300;400;500;700&display=swap');

        :root {
          --void: #020202;
          --obsidian: #0a0a0a;
          --glass: rgba(255, 255, 255, 0.02);
          --glass-border: rgba(255, 255, 255, 0.08);
          --crimson: #dc2626;
          --crimson-dim: rgba(220, 38, 38, 0.1);
          --text-main: #ededed;
          --text-muted: #666666;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; outline: none; }
        
        body {
          background-color: var(--void);
          color: var(--text-main);
          font-family: 'Inter', sans-serif;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }

        /* ATMOSPHERE */
        .singularity-container { position: relative; width: 100%; overflow: hidden; }
        
        .void-texture {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          opacity: 0.04; mix-blend-mode: overlay;
        }

        .nebula {
          position: fixed; border-radius: 50%; filter: blur(120px); z-index: 0; pointer-events: none;
          animation: breathe 10s infinite alternate ease-in-out;
        }
        .nebula-1 { width: 1000px; height: 1000px; background: radial-gradient(circle, rgba(220, 38, 38, 0.06), transparent 60%); top: -30%; left: -10%; }
        .nebula-2 { width: 800px; height: 800px; background: radial-gradient(circle, rgba(255, 255, 255, 0.03), transparent 60%); bottom: -20%; right: -10%; animation-delay: -5s; }

        .scanlines {
          position: fixed; inset: 0; pointer-events: none; z-index: 1;
          background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.1));
          background-size: 100% 3px; opacity: 0.3;
        }

        @keyframes breathe { 0% { opacity: 0.4; transform: scale(1); } 100% { opacity: 0.6; transform: scale(1.05); } }

        /* LAYOUT */
        .container { max-width: 1400px; margin: 0 auto; padding: 0 32px; position: relative; z-index: 10; }
        .grid-3 { display: grid; grid-template-columns: 1fr; gap: 24px; }
        .grid-2 { display: grid; grid-template-columns: 1fr; gap: 64px; }
        
        @media (min-width: 1024px) {
          .grid-3 { grid-template-columns: repeat(3, 1fr); }
          .grid-2 { grid-template-columns: 1fr 1fr; }
        }

        /* NAVIGATION */
        nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          background: rgba(2, 2, 2, 0.8); backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--glass-border); height: 80px; display: flex; align-items: center;
        }
        .nav-content { display: flex; justify-content: space-between; align-items: center; width: 100%; }
        
        .brand { display: flex; align-items: center; gap: 14px; }
        .brand-icon { 
          width: 36px; height: 36px; background: rgba(220, 38, 38, 0.1); border: 1px solid rgba(220, 38, 38, 0.3);
          border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--crimson);
          box-shadow: 0 0 30px rgba(220, 38, 38, 0.2);
        }
        .brand-text { font-family: 'JetBrains Mono', monospace; font-weight: 700; letter-spacing: -0.02em; font-size: 15px; color: #fff; }
        
        .nav-links { display: none; gap: 40px; align-items: center; }
        .nav-links a { 
          font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500; color: var(--text-muted); 
          text-decoration: none; transition: color 0.3s; 
        }
        .nav-links a:hover { color: var(--text-main); }
        
        .action-btn {
          background: #fff; color: #000; padding: 12px 28px; border-radius: 2px;
          font-weight: 600; font-size: 12px; font-family: 'Inter', sans-serif; text-transform: uppercase;
          text-decoration: none; transition: all 0.3s; border: none; cursor: pointer; letter-spacing: 0.05em;
        }
        .action-btn:hover { background: #e5e5e5; box-shadow: 0 0 30px rgba(255, 255, 255, 0.3); transform: translateY(-1px); }
        
        @media (min-width: 768px) { .nav-links { display: flex; } }

        /* HERO */
        .hero { min-height: 100vh; display: flex; align-items: center; position: relative; padding-top: 100px; overflow: hidden; }
        
        .hero-content { width: 100%; text-align: center; position: relative; z-index: 10; }
        
        .sys-badge {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 14px; background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border);
          border-radius: 100px; margin-bottom: 40px;
          font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--text-main); letter-spacing: 1px;
        }
        .sys-dot { width: 6px; height: 6px; background: #10b981; border-radius: 50%; box-shadow: 0 0 10px #10b981; }

        h1 {
          font-size: 4rem; line-height: 1.0; font-weight: 800; letter-spacing: -0.05em; margin-bottom: 32px;
          background: linear-gradient(180deg, #ffffff 0%, #666666 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        @media (min-width: 1024px) { h1 { font-size: 8rem; } }

        .hero-desc { 
          font-size: 1.25rem; color: var(--text-muted); margin: 0 auto 56px; max-width: 700px; 
          line-height: 1.6; font-weight: 300; letter-spacing: -0.01em;
        }

        .btn-group { display: flex; gap: 20px; justify-content: center; margin-bottom: 120px; flex-wrap: wrap; }
        
        /* REACTOR BUTTON */
        .reactor-btn {
          position: relative; padding: 20px 40px; background: #0a0a0a;
          border: 1px solid rgba(255,255,255,0.1); color: #fff; font-weight: 600;
          display: flex; align-items: center; gap: 12px; overflow: hidden; cursor: pointer;
          transition: all 0.3s; font-family: 'JetBrains Mono', monospace; font-size: 13px;
          border-radius: 4px;
        }
        .reactor-btn:hover { border-color: var(--crimson); transform: translateY(-2px); }
        .reactor-glow {
          position: absolute; inset: 0; background: radial-gradient(circle at center, rgba(220, 38, 38, 0.4) 0%, transparent 70%);
          opacity: 0; transition: opacity 0.4s; pointer-events: none;
        }
        .reactor-btn:hover .reactor-glow { opacity: 1; }
        
        .secondary-btn {
          padding: 20px 40px; background: transparent; border: 1px solid var(--glass-border);
          color: var(--text-muted); font-weight: 600; display: flex; align-items: center; gap: 12px;
          cursor: pointer; transition: all 0.3s; font-family: 'JetBrains Mono', monospace; font-size: 13px;
          border-radius: 4px;
        }
        .secondary-btn:hover { border-color: #fff; color: #fff; background: rgba(255,255,255,0.02); }

        /* HUD STATS BAR */
        .hud-stats {
          display: grid; grid-template-columns: repeat(2, 1fr); gap: 1px;
          background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border);
          max-width: 1100px; margin: 0 auto; backdrop-filter: blur(10px);
        }
        @media (min-width: 768px) { .hud-stats { grid-template-columns: repeat(4, 1fr); } }
        
        .hud-item {
          background: rgba(2,2,2,0.6); padding: 40px 24px; text-align: center;
          position: relative; overflow: hidden; transition: background 0.3s;
        }
        .hud-item:hover { background: rgba(10,10,10,0.8); }
        .hud-item::before {
          content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 2px;
          background: var(--crimson); transform: scaleX(0); transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .hud-item:hover::before { transform: scaleX(1); }
        
        .stat-num { 
          font-family: 'JetBrains Mono', monospace; font-size: 32px; font-weight: 700; color: #fff; 
          margin-bottom: 8px; letter-spacing: -1px; line-height: 1; 
        }
        .stat-label { font-size: 10px; text-transform: uppercase; color: var(--text-muted); letter-spacing: 1px; font-weight: 500; }

        /* SECTIONS */
        section { padding: 180px 0; position: relative; border-top: 1px solid var(--glass-border); }
        .section-head { margin-bottom: 100px; }
        .section-tag { color: var(--crimson); font-family: 'JetBrains Mono', monospace; font-size: 11px; margin-bottom: 24px; display: block; letter-spacing: 2px; }
        .section-title { font-size: 4rem; font-weight: 700; margin-bottom: 24px; letter-spacing: -0.03em; line-height: 1; color: #fff; }
        .section-desc { font-size: 1.15rem; color: var(--text-muted); max-width: 600px; line-height: 1.6; }

        /* SPOTLIGHT CARDS */
        .spotlight-card {
          position: relative; background: rgba(5,5,5,0.4); border: 1px solid var(--glass-border);
          padding: 48px 36px; height: 100%; overflow: hidden;
        }
        .spotlight-overlay { position: absolute; inset: 0; pointer-events: none; transition: opacity 0.5s; opacity: 1; }
        .card-border-glow {
          position: absolute; inset: 0; pointer-events: none; opacity: 1;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude;
          padding: 1px; /* border width */
        }
        
        .card-content { position: relative; z-index: 2; }
        .card-border {
          position: absolute; inset: 0; border: 1px solid transparent;
          pointer-events: none; z-index: 1;
        }

        .card-icon {
          width: 56px; height: 56px; background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border);
          display: flex; align-items: center; justify-content: center; margin-bottom: 32px; color: #fff;
          border-radius: 4px;
        }
        .card-title { font-family: 'JetBrains Mono', monospace; font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 16px; letter-spacing: -0.5px; }
        .card-desc { font-size: 15px; color: var(--text-muted); line-height: 1.6; font-weight: 300; }

        /* PLATFORM / DUAL CORE */
        .platform-visual {
          height: 600px; background: rgba(5,5,5,0.3); border: 1px solid var(--glass-border);
          position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center;
          border-radius: 2px;
        }
        .core-circle {
          position: absolute; border-radius: 50%; border: 1px solid rgba(255,255,255,0.03);
        }
        .spin-1 { width: 450px; height: 450px; border-top-color: var(--crimson); animation: spin 20s linear infinite; opacity: 0.6; }
        .spin-2 { width: 300px; height: 300px; border-bottom-color: #fff; animation: spin 12s linear infinite reverse; opacity: 0.2; }
        
        .wf-item { 
          display: flex; align-items: center; gap: 16px; margin-bottom: 24px; padding: 16px; 
          border: 1px solid transparent; transition: all 0.3s; cursor: default;
        }
        .wf-item:hover { border-color: var(--glass-border); background: rgba(255,255,255,0.01); }
        .wf-icon { color: var(--crimson); opacity: 0.8; }
        .wf-text { font-family: 'JetBrains Mono', monospace; font-size: 13px; color: var(--text-main); }
        
        .node-header {
          color: #fff; margin-bottom: 32px; font-family: 'JetBrains Mono', monospace; 
          font-size: 12px; border-bottom: 1px solid rgba(255,255,255,0.1); 
          padding-bottom: 12px; display: flex; justify-content: space-between;
        }

        /* TESTIMONIALS */
        .quote-card {
          background: rgba(255,255,255,0.01); border-left: 2px solid var(--glass-border);
          padding: 48px 40px; transition: all 0.4s;
        }
        .quote-card:hover { border-left-color: var(--crimson); background: rgba(255,255,255,0.02); transform: translateX(10px); }
        .quote-text { font-size: 18px; color: #ededed; margin-bottom: 32px; line-height: 1.6; font-weight: 300; font-style: italic; }
        .quote-author h4 { font-weight: 700; font-size: 15px; color: #fff; margin-bottom: 4px; }
        .quote-author p { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--text-muted); text-transform: uppercase; }

        /* CTA */
        .cta-box {
          text-align: center; max-width: 1000px; margin: 0 auto;
          background: radial-gradient(circle at center, rgba(220, 38, 38, 0.05), transparent 70%);
          padding: 100px 20px; border: 1px solid var(--glass-border);
          position: relative; overflow: hidden;
        }
        .cta-box::before {
          content: ""; position: absolute; inset: 0; background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.828-1.415 1.415-.828-.828-.828.828-1.415-1.415.828-.828-.828-.828 1.415-1.415.828.828.828-.828 1.415 1.415-.828.828zM22.485 22.485l.83.828-1.415 1.415-.828-.828-.828.828-1.415-1.415.828-.828-.828-.828 1.415-1.415.828.828.828-.828 1.415 1.415-.828.828zM0 22.485l.828.828-1.415 1.415-.828-.828-.828.828L-3.659 22.485l.828-.828-.828-.828 1.415-1.415.828.828.828-.828 1.415 1.415-.828.828zM0 54.627l.828.828-1.415 1.415-.828-.828-.828.828L-3.659 54.627l.828-.828-.828-.828 1.415-1.415.828.828.828-.828 1.415 1.415-.828.828zM54.627 54.627l.83.828-1.415 1.415-.828-.828-.828.828-1.415-1.415.828-.828-.828-.828 1.415-1.415.828.828.828-.828 1.415 1.415-.828.828zM22.485 54.627l.83.828-1.415 1.415-.828-.828-.828.828-1.415-1.415.828-.828-.828-.828 1.415-1.415.828.828.828-.828 1.415 1.415-.828.828z' fill='%23ffffff' fill-opacity='0.02' fill-rule='evenodd'/%3E%3C/svg%3E");
          opacity: 0.5;
        }

        /* FOOTER */
        footer { background: #000; padding: 120px 0 60px; border-top: 1px solid #1a1a1a; }
        .footer-col h5 { color: #fff; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; margin-bottom: 32px; letter-spacing: 1px; }
        .footer-col a { display: block; color: #666; text-decoration: none; margin-bottom: 16px; font-size: 14px; transition: color 0.2s; font-weight: 400; }
        .footer-col a:hover { color: var(--crimson); }
        .copyright { text-align: center; margin-top: 100px; color: #333; font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.5px; }

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>

      <div className="void-texture" />
      <div className="scanlines" />
      <div className="nebula nebula-1" />
      <div className="nebula nebula-2" />

      {/* --- NAVIGATION --- */}
      <nav>
        <div className="container nav-content">
          <div className="brand">
            <div className="brand-icon"><Brain size={18} strokeWidth={2} /></div>
            <span className="brand-text">MOCK'N-HIRE</span>
          </div>
          
          <div className="nav-links">
            <Link href="#features">Technology</Link>
            <Link href="#platform">Capabilities</Link>
            <Link href="#security">Security</Link>
            <Link href="/auth/login" className="action-btn">
              Deploy System
            </Link>
          </div>

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-white">
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* --- HERO --- */}
      <header className="hero" ref={containerRef}>
        <div className="container hero-content">
          <motion.div style={{ y, opacity }}>
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="sys-badge">
                <div className="sys-dot" />
                SYSTEM V2.0 // OPERATIONAL
              </div>
              
              <h1>
                THE EVENT HORIZON<br />
                OF RECRUITMENT
              </h1>
              
              <p className="hero-desc">
                Deploy large-scale candidate simulations on a military-grade compute architecture. 
                Predict hiring outcomes with 99.8% precision.
              </p>

              <div className="btn-group">
                <Link href="/auth/login">
                  <button className="reactor-btn">
                    <div className="reactor-glow" />
                    <Zap size={16} fill="currentColor" />
                    <span>INITIALIZE SEQUENCE</span>
                    <ArrowUpRight size={16} className="text-zinc-500" />
                  </button>
                </Link>
                <button className="secondary-btn">
                  <Play size={16} /> SYSTEM DEMO
                </button>
              </div>

              {/* HUD STATS */}
              <motion.div 
                className="hud-stats"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                {STATS.map((s, i) => (
                  <div key={i} className="hud-item">
                    <div className="stat-num">{s.number}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </header>

      {/* --- FEATURES --- */}
      <section id="features">
        <div className="container">
          <div className="section-head">
            <span className="section-tag">:: CORE MODULES</span>
            <h2 className="section-title">Tactical Capabilities</h2>
            <p className="section-desc">Engineered for high-volume data processing and zero-latency analysis.</p>
          </div>

          <div className="grid-3">
            {FEATURES.map((f, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
              >
                <SpotlightCard>
                  <div className="card-icon"><f.icon size={28} strokeWidth={1.5} /></div>
                  <div className="card-title">{f.title}</div>
                  <p className="card-desc">{f.description}</p>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- PLATFORM --- */}
      <section id="platform">
        <div className="container">
          <div className="grid-2">
            <div>
              <div className="section-head">
                <span className="section-tag">:: WORKFLOW ARCHITECTURE</span>
                <h2 className="section-title">Dual-Core Processing</h2>
                <p className="section-desc" style={{ marginBottom: '48px' }}>
                  A unified environment for both Talent Acquisition and Candidate Assessment, operating in real-time.
                </p>
              </div>

              <div className="grid-2" style={{ gap: '40px' }}>
                <div>
                  <div className="node-header">
                    <span>[ RECRUITER_NODE ]</span>
                    <Terminal size={14} className="text-zinc-500" />
                  </div>
                  {["Batch Ingestion", "Semantic Parsing", "Auto-Ranking", "Bias Elimination"].map((item, i) => (
                    <div key={i} className="wf-item">
                      <Terminal size={14} className="wf-icon" />
                      <span className="wf-text">{item}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="node-header">
                    <span>[ CANDIDATE_NODE ]</span>
                    <Activity size={14} className="text-zinc-500" />
                  </div>
                  {["Identity Verification", "Simulated Interview", "Stress Testing", "Feedback Loop"].map((item, i) => (
                    <div key={i} className="wf-item">
                      <Activity size={14} className="wf-icon" />
                      <span className="wf-text">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="platform-visual">
              <div className="core-circle spin-1" />
              <div className="core-circle spin-2" />
              <div style={{ position: 'relative', zIndex: 10, background: '#020202', padding: '24px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)' }}>
                <Brain size={56} className="text-red-600" strokeWidth={1} />
              </div>
              
              {/* Data Stream Lines */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent 49%, rgba(220,38,38,0.1) 50%, transparent 51%)', backgroundSize: '60px 100%' }} />
            </div>
          </div>
        </div>
      </section>

      {/* --- TESTIMONIALS --- */}
      <section id="testimonials">
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '80px' }}>Verified Transmissions</h2>
          <div className="grid-3">
            {TESTIMONIALS.map((t, i) => (
              <motion.div 
                key={i} 
                className="quote-card"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
              >
                <div className="flex text-amber-500 mb-8 gap-1">
                  {[...Array(5)].map((_, k) => <Star key={k} size={14} fill="currentColor" />)}
                </div>
                <p className="quote-text">"{t.content}"</p>
                <div className="quote-author">
                  <h4>{t.name}</h4>
                  <p>{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA --- */}
      <section style={{ borderBottom: 'none' }}>
        <div className="container">
          <div className="cta-box">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="section-title" style={{ fontSize: '3.5rem' }}>Ready to Deploy?</h2>
              <p className="section-desc" style={{ margin: '0 auto 56px' }}>
                Join the elite organizations using Mock'n-Hire to secure top-tier talent.
              </p>
              <div className="flex justify-center gap-4">
                <Link href="/auth/login">
                  <button className="reactor-btn" style={{ padding: '24px 48px', fontSize: '15px' }}>
                    <div className="reactor-glow" />
                    INITIATE FREE TRIAL
                    <ArrowUpRight size={18} />
                  </button>
                </Link>
              </div>
              <p style={{ marginTop: '32px', fontSize: '11px', color: '#444', fontFamily: 'JetBrains Mono', letterSpacing: '1px' }}>
                NO_CREDIT_CARD_REQUIRED // 14_DAY_ACCESS // ENCRYPTED
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer>
        <div className="container">
          <div className="grid-2" style={{ alignItems: 'start' }}>
            <div>
              <div className="brand" style={{ marginBottom: '24px' }}>
                <Brain size={20} color="#555" />
                <span style={{ color: '#888', fontSize: '15px', fontFamily: 'JetBrains Mono', fontWeight: 700 }}>MOCK'N-HIRE</span>
              </div>
              <p style={{ color: '#555', fontSize: '14px', maxWidth: '320px', lineHeight: '1.6' }}>
                Advanced heuristics and machine learning for the modern recruitment battlefield.
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '80px', flexWrap: 'wrap' }}>
              <div className="footer-col">
                <h5>PROTOCOL</h5>
                <a href="#">Technology</a>
                <a href="#">Security</a>
                <a href="#">API Access</a>
              </div>
              <div className="footer-col">
                <h5>LEGAL</h5>
                <a href="#">Privacy Data</a>
                <a href="#">Terms of Use</a>
                <a href="#">Compliance</a>
              </div>
            </div>
          </div>
          <div className="copyright">
            &copy; 2025 MOCK'N-HIRE SYSTEMS INC. // ALL RIGHTS RESERVED.
          </div>
        </div>
      </footer>
    </div>
  )
}