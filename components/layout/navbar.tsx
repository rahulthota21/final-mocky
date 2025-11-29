"use client"

import { useAppStore } from "@/lib/store"
import { signOut } from "@/lib/auth"
import { motion } from "framer-motion"
import { Brain, LogOut, Settings, User } from "lucide-react" 
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { toast } from "sonner"

export function Navbar() {
  const { user, setUser } = useAppStore()
  const router = useRouter()
  const pathname = usePathname()

  // --- LOGIC (STRICTLY PRESERVED) ---
  if (!user || pathname === '/' || pathname.startsWith('/auth/')) {
    return null
  }

  const handleLogout = async () => {
    try {
      await signOut()
      setUser(null)
      toast.success('Signed out successfully')
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Failed to sign out')
    }
  }
  // --- END LOGIC ---

  return (
    <>
      <motion.header
        initial={{ y: -120 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="fixed-header"
      >
        {/* Ambient Light Glow on Top Edge */}
        <div className="edge-highlight" />

        <div className="header-content">
          
          {/* LEFT: PURE BRAND */}
          <Link href={`/dashboard/${user.role}`} className="brand-group">
            <div className="logo-box">
              <Brain size={22} strokeWidth={1.5} />
            </div>
            <span className="company-name">Mock'n-Hire</span>
          </Link>

          {/* RIGHT: HUD CONTROLS */}
          <div className="hud-controls">
            
            {/* User Identity Module */}
            <div className="identity-module">
              <div className="role-indicator">
                {user.role === 'recruiter' ? (
                  <div className="pulsing-dot red">
                    <div className="ring" />
                    <div className="dot" />
                  </div>
                ) : (
                  <div className="pulsing-dot green">
                    <div className="ring" />
                    <div className="dot" />
                  </div>
                )}
                <span className="role-text">
                  {user.role === 'recruiter' ? 'Recruiter' : 'Student'}
                </span>
              </div>
              
              <div className="separator" />
              
              <div className="user-info">
                <span className="user-name">{user.name}</span>
                <div className="avatar-circle">
                   <User size={14} />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="actions-group">
              <Link href="/settings">
                <motion.button 
                  className="icon-btn"
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.08)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Settings size={20} strokeWidth={1.2} />
                </motion.button>
              </Link>

              <motion.button 
                onClick={handleLogout}
                className="logout-btn"
                whileHover={{ scale: 1.02, backgroundColor: "#ffffff", color: "#000000" }}
                whileTap={{ scale: 0.98 }}
              >
                <LogOut size={18} strokeWidth={1.5} />
              </motion.button>
            </div>
          </div>
        </div>
        
        {/* Cinematic Bottom Line (Faded Edges) */}
        <div className="horizon-line" />
      </motion.header>

      {/* --- STYLES --- */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');

        :root {
          --glass-bg: rgba(5, 5, 5, 0.6);
          --glass-border: rgba(255, 255, 255, 0.06);
          --highlight: rgba(255, 255, 255, 0.15);
          --text-primary: #ffffff;
          --text-secondary: #9CA3AF;
          --accent-red: #F87171;
          --accent-green: #34D399;
        }

        /* MAIN CONTAINER */
        .fixed-header {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 92px; /* INCREASED HEIGHT */
          z-index: 9999;
          background: var(--glass-bg);
          backdrop-filter: blur(50px) saturate(120%); /* EXPENSIVE GLASS LOOK */
          -webkit-backdrop-filter: blur(50px) saturate(120%);
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        /* Top subtle glow line to catch light */
        .edge-highlight {
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent 0%, var(--highlight) 50%, transparent 100%);
          opacity: 0.5;
        }

        .header-content {
          max-width: 1600px;
          width: 100%;
          margin: 0 auto;
          padding: 0 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 100%;
        }

        /* BRAND STYLES */
        .brand-group {
          display: flex;
          align-items: center;
          gap: 18px;
          text-decoration: none;
          color: var(--text-primary);
          transition: opacity 0.3s ease;
          margin-left: 90px;
        }
        .brand-group:hover { opacity: 0.85; }

        .logo-box {
          width: 42px; /* Slightly larger icon box */
          height: 42px;
          background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-primary);
          box-shadow: 0 4px 20px -5px rgba(0,0,0,0.5);
        }

        .company-name {
          font-family: 'Inter', sans-serif;
          font-size: 18px;
          font-weight: 500;
          letter-spacing: -0.03em; /* Tighter tracking for luxury feel */
          color: var(--text-primary);
        }

        /* RIGHT SIDE CONTROLS */
        .hud-controls {
          display: flex;
          align-items: center;
          gap: 32px; /* More breathing room */
        }

        /* IDENTITY MODULE */
        .identity-module {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 8px 24px;
          height: 50px; /* Taller pill */
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--glass-border);
          border-radius: 100px;
          box-shadow: inset 0 1px 1px rgba(255,255,255,0.03);
        }

        .role-indicator {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        /* PULSING DOTS */
        .pulsing-dot { position: relative; width: 8px; height: 8px; display: flex; align-items: center; justify-content: center; }
        .pulsing-dot .dot { width: 6px; height: 6px; border-radius: 50%; position: relative; z-index: 2; }
        .pulsing-dot .ring { 
          position: absolute; width: 100%; height: 100%; border-radius: 50%; 
          animation: pulse 2s infinite; opacity: 0.5;
        }
        
        .pulsing-dot.red .dot { background: var(--accent-red); box-shadow: 0 0 10px rgba(248, 113, 113, 0.4); }
        .pulsing-dot.red .ring { background: var(--accent-red); }
        
        .pulsing-dot.green .dot { background: var(--accent-green); box-shadow: 0 0 10px rgba(52, 211, 153, 0.4); }
        .pulsing-dot.green .ring { background: var(--accent-green); }

        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(2.5); opacity: 0; }
        }

        .role-text {
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          color: var(--text-secondary);
          font-weight: 400;
          letter-spacing: 0.02em;
        }

        .separator {
          width: 1px;
          height: 16px;
          background: var(--glass-border);
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-name {
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          color: var(--text-primary);
          font-weight: 500;
        }

        .avatar-circle {
          width: 28px; height: 28px;
          border-radius: 50%;
          background: rgba(255,255,255,0.05);
          display: flex; align-items: center; justify-content: center;
          color: var(--text-secondary);
        }

        /* ACTIONS */
        .actions-group {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .icon-btn {
          width: 48px; /* Larger touch target */
          height: 48px;
          border-radius: 50%;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }
        .icon-btn:hover { color: var(--text-primary); }

        .logout-btn {
          width: 48px;
          height: 48px;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--glass-border);
          border-radius: 14px; /* Squircle shape */
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        /* HORIZON LINE AT BOTTOM */
        .horizon-line {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 1px;
          background: linear-gradient(
            90deg, 
            transparent 0%, 
            rgba(255,255,255,0.08) 20%, 
            rgba(255,255,255,0.08) 80%, 
            transparent 100%
          );
        }
      `}</style>
    </>
  )
}