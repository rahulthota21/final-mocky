"use client"

import { useAppStore } from "@/lib/store"
import { motion } from "framer-motion"
import { Palette, User, Trash2, Save, Moon, Sun, Zap } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export default function SettingsPage() {
  const { user, theme, accentColor, setTheme, setAccentColor, setUser } = useAppStore()
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  })

  const handleSave = () => {
    // Mock save
    toast.success("Settings saved successfully!")
  }

  const handleDeleteAccount = () => {
    // Mock account deletion
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      setUser(null)
      toast.success("Account deleted successfully")
    }
  }

  return (
    <div className="horixa-page">
      {/* --- GLOBAL STYLES (HORIXA THEME) --- */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        :root {
          --bg-void: #020202;
          --bg-deep-red: #1a0505;
          --accent-red: #ff2e2e;
          --accent-red-dim: rgba(255, 46, 46, 0.1);
          --glass-panel: rgba(10, 10, 10, 0.7);
          --glass-border: rgba(255, 255, 255, 0.1);
          --glass-border-hover: rgba(255, 46, 46, 0.5);
          --text-primary: #ffffff;
          --text-secondary: #888888;
          --input-bg: rgba(255, 255, 255, 0.02);
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
          padding-top: 120px;
          padding-bottom: 60px;
          background: radial-gradient(ellipse at top center, var(--bg-deep-red) 0%, var(--bg-void) 70%);
        }

        .horixa-page::before {
          content: ""; position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          opacity: 0.03;
        }

        .settings-container {
          position: relative; z-index: 1;
          max-width: 700px; /* Tight width */
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        /* HEADINGS */
        h1 { font-size: 32px; font-weight: 700; letter-spacing: -0.03em; color: var(--text-primary); line-height: 1; margin-bottom: 8px; }
        h2 { font-size: 16px; font-weight: 500; letter-spacing: -0.01em; color: var(--text-primary); }
        .sub-text { color: var(--text-secondary); font-size: 14px; font-weight: 400; }

        /* SHARP CARD */
        .horixa-card {
          background: var(--glass-panel);
          border: 1px solid var(--glass-border);
          backdrop-filter: blur(24px);
          padding: 32px;
          border-radius: 2px; /* Sharp corners */
          transition: border-color 0.3s ease;
        }
        .horixa-card:hover { border-color: var(--glass-border-hover); }
        .horixa-card.danger { border-color: rgba(255, 46, 46, 0.3); background: linear-gradient(180deg, rgba(255,46,46,0.02) 0%, rgba(0,0,0,0) 100%); }

        /* SECTION HEADER */
        .card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid var(--glass-border); }
        .header-icon { color: var(--accent-red); opacity: 0.8; }

        /* INPUTS */
        .input-group { margin-bottom: 20px; }
        .input-label { display: block; font-size: 12px; color: var(--text-secondary); margin-bottom: 8px; font-family: 'JetBrains Mono', monospace; text-transform: uppercase; letter-spacing: 0.05em; }
        .horixa-input {
          width: 100%;
          background: var(--input-bg);
          border: 1px solid var(--glass-border);
          padding: 12px 16px;
          color: var(--text-primary);
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          border-radius: 2px;
          transition: all 0.2s;
        }
        .horixa-input:focus { border-color: var(--accent-primary); background: rgba(255,255,255,0.05); }

        /* BUTTONS */
        .horixa-btn {
          width: 100%;
          height: 44px;
          background: #ffffff;
          color: #000;
          border: none;
          border-radius: 2px;
          font-weight: 600;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: all 0.2s;
        }
        .horixa-btn:hover { transform: translateY(-1px); box-shadow: 0 0 20px rgba(255,255,255,0.2); }

        .danger-btn {
          background: transparent;
          color: var(--accent-red);
          border: 1px solid var(--accent-red);
        }
        .danger-btn:hover { background: var(--accent-red); color: #fff; box-shadow: 0 0 20px rgba(255, 46, 46, 0.4); }

        /* TOGGLES & SELECTORS */
        .setting-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
        .color-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        
        .color-option {
          background: var(--input-bg);
          border: 1px solid var(--glass-border);
          padding: 16px;
          border-radius: 2px;
          cursor: pointer;
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          transition: all 0.2s;
        }
        .color-option:hover { border-color: #fff; }
        .color-option.active { background: #fff; color: #000; border-color: #fff; }
        .color-dot { width: 12px; height: 12px; border-radius: 50%; }

        /* Custom Switch */
        .switch-track {
          width: 40px; height: 20px; background: var(--glass-border);
          border-radius: 20px; position: relative; cursor: pointer; transition: 0.3s;
        }
        .switch-track.active { background: #fff; }
        .switch-thumb {
          width: 16px; height: 16px; background: #fff; border-radius: 50%;
          position: absolute; top: 2px; left: 2px; transition: 0.3s;
        }
        .switch-track.active .switch-thumb { transform: translateX(20px); background: #000; }

      `}</style>

      <div className="settings-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1>Settings</h1>
          <p className="sub-text">Configure system parameters and user preferences.</p>
        </motion.div>

        {/* Appearance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="horixa-card">
            <div className="card-header">
              <Palette size={18} className="header-icon" />
              <h2>Appearance</h2>
            </div>

            <div className="setting-row">
              <div>
                <p style={{ fontSize: '14px', color: '#fff', marginBottom: '4px' }}>Interface Theme</p>
                <p className="sub-text" style={{ fontSize: '12px' }}>Toggle light/dark rendering engine.</p>
              </div>
              <div 
                className={`switch-track ${theme === 'dark' ? 'active' : ''}`} 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                <div className="switch-thumb" />
              </div>
            </div>

            <div className="input-label" style={{ marginBottom: '12px' }}>System Accent</div>
            <div className="color-grid">
              <button
                onClick={() => setAccentColor('ice-blue')}
                className={`color-option ${accentColor === 'ice-blue' ? 'active' : ''}`}
              >
                <div className="color-dot" style={{ background: '#06b6d4' }}></div>
                <span style={{ fontSize: '12px', fontWeight: 600 }}>Ice Blue</span>
              </button>
              <button
                onClick={() => setAccentColor('aqua-green')}
                className={`color-option ${accentColor === 'aqua-green' ? 'active' : ''}`}
              >
                <div className="color-dot" style={{ background: '#10b981' }}></div>
                <span style={{ fontSize: '12px', fontWeight: 600 }}>Aqua Green</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Profile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="horixa-card">
            <div className="card-header">
              <User size={18} className="header-icon" />
              <h2>Profile Information</h2>
            </div>

            <div className="input-group">
              <label className="input-label">Full Name</label>
              <input
                className="horixa-input"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <input
                type="email"
                className="horixa-input"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            
            <button onClick={handleSave} className="horixa-btn">
              <Save size={14} />
              Save Changes
            </button>
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="horixa-card danger">
            <div className="card-header" style={{ borderColor: 'rgba(255,46,46,0.2)' }}>
              <Trash2 size={18} className="header-icon" style={{ color: '#ff2e2e' }} />
              <h2 style={{ color: '#ff2e2e' }}>Danger Zone</h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
              <div>
                <p style={{ fontSize: '14px', color: '#ff2e2e', marginBottom: '4px', fontWeight: 500 }}>Delete Account</p>
                <p className="sub-text" style={{ fontSize: '12px' }}>
                  Permanently remove all data. Irreversible.
                </p>
              </div>
              <button 
                onClick={handleDeleteAccount}
                className="horixa-btn danger-btn"
                style={{ width: 'auto', padding: '0 24px' }}
              >
                Delete
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}