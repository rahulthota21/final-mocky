"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, Users, GraduationCap, ArrowRight, 
  Loader2, Mail, Lock, User as UserIcon, Zap, Check
} from "lucide-react";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";
import { signIn, signUp } from "@/lib/auth";

export default function AuthPage() {
  // --- LOGIC (STRICTLY PRESERVED) ---
  const [isSignup, setIsSignup] = useState(false);
  const [role, setRole] = useState<'recruiter' | 'student'>('recruiter');
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });

  const { setUser } = useAppStore();
  const router = useRouter();

  const handleSwitch = (mode: boolean) => {
    setIsSignup(mode);
    setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignup) {
        if (formData.password !== formData.confirmPassword) {
          toast.error("Passwords do not match");
          setIsLoading(false);
          return;
        }

        const { data, error } = await signUp(
          formData.email, 
          formData.password, 
          formData.name, 
          role
        );

        if (error) {
          toast.error(error.message || "Failed to create account");
          setIsLoading(false);
          return;
        }

        if (data?.profile) {
          setUser({
            id: data.profile.user_id,
            email: data.profile.email,
            name: data.profile.name,
            role: data.profile.role
          });
          toast.success("Account created successfully!");
          router.push(`/dashboard/${data.profile.role}`);
        }
      } else {
        const { data, error } = await signIn(formData.email, formData.password);

        if (error) {
          toast.error("Invalid email or password");
          setIsLoading(false);
          return;
        }

        if (data?.profile) {
          setUser({
            id: data.profile.user_id,
            email: data.profile.email,
            name: data.profile.name,
            role: data.profile.role
          });
          toast.success("Welcome back!");
          router.push(`/dashboard/${data.profile.role}`);
        }
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
      setIsLoading(false);
    }
  };
  // --- END LOGIC ---

  return (
    <div className="cosmos-container">
      {/* --- BACKGROUND: PURE VOID --- */}
      <div className="ambient-light" />
      
      {/* --- MAIN INTERFACE: LIQUID OBSIDIAN --- */}
      <motion.div 
        layout
        transition={{ type: "spring", stiffness: 140, damping: 30 }}
        className={`glass-monolith ${isSignup ? 'expanded' : 'compact'}`}
      >
        {/* LEFT PANEL: IDENTITY & CONTROL */}
        <motion.div layout className="panel-identity">
          <div className="brand-lockup">
            <div className="brand-mark">
              <Brain size={24} strokeWidth={1.5} />
            </div>
            <span className="brand-name">MOCK'N-HIRE</span>
          </div>

          <div className="text-block">
            <motion.h1 
              key={isSignup ? "signup" : "signin"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {isSignup ? "Initialize Access." : "Welcome Back."}
            </motion.h1>
            <motion.p
              key={isSignup ? "signup-p" : "signin-p"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              {isSignup 
                ? "Create your neural profile to access the recruitment grid." 
                : "Enter your credentials to resume operations."}
            </motion.p>
          </div>

          {/* PREMIUM SEGMENTED CONTROL */}
          <div className="liquid-toggle">
            <motion.div 
              className="active-pill"
              animate={{ x: isSignup ? '100%' : '0%' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            <button 
              className={!isSignup ? 'active' : ''} 
              onClick={() => handleSwitch(false)}
            >
              Sign In
            </button>
            <button 
              className={isSignup ? 'active' : ''} 
              onClick={() => handleSwitch(true)}
            >
              Sign Up
            </button>
          </div>

          <div className="footer-legal">
            © 2025 Mock'n-Hire Systems Inc.
          </div>
        </motion.div>

        {/* RIGHT PANEL: THE FORM CORE */}
        <motion.div layout className="panel-form">
          <form onSubmit={handleSubmit} className="form-content">
            
            <AnimatePresence mode="wait">
              {isSignup ? (
                /* --- EXPANDED GRID LAYOUT (SIGN UP) --- */
                <motion.div 
                  key="signup-grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="signup-grid"
                >
                  {/* ROLE SELECTOR */}
                  <div className="grid-col-span-2">
                    <label className="pure-label">Account Designation</label>
                    <div className="role-group">
                      <div 
                        onClick={() => setRole('recruiter')}
                        className={`role-option ${role === 'recruiter' ? 'selected' : ''}`}
                      >
                        <div className="role-icon"><Users size={16} /></div>
                        <div className="role-info">
                          <span>Recruiter</span>
                          <small>Admin Access</small>
                        </div>
                        {role === 'recruiter' && <Check size={14} className="check-mark" />}
                      </div>
                      <div 
                        onClick={() => setRole('student')}
                        className={`role-option ${role === 'student' ? 'selected' : ''}`}
                      >
                        <div className="role-icon"><GraduationCap size={16} /></div>
                        <div className="role-info">
                          <span>Student</span>
                          <small>Candidate Access</small>
                        </div>
                        {role === 'student' && <Check size={14} className="check-mark" />}
                      </div>
                    </div>
                  </div>

                  {/* INPUTS */}
                  <div className="input-block">
                    <label className="pure-label">Full Name</label>
                    <div className="pure-input-wrap">
                      <UserIcon size={16} />
                      <input 
                        type="text" required placeholder="John Doe"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="input-block">
                    <label className="pure-label">Email Address</label>
                    <div className="pure-input-wrap">
                      <Mail size={16} />
                      <input 
                        type="email" required placeholder="name@company.com"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="input-block">
                    <label className="pure-label">Password</label>
                    <div className="pure-input-wrap">
                      <Lock size={16} />
                      <input 
                        type="password" required placeholder="••••••••"
                        value={formData.password}
                        onChange={e => setFormData({...formData, password: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="input-block">
                    <label className="pure-label">Confirm Password</label>
                    <div className="pure-input-wrap">
                      <Lock size={16} />
                      <input 
                        type="password" required placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                      />
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* --- COMPACT STACK LAYOUT (SIGN IN) --- */
                <motion.div 
                  key="signin-stack"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="signin-stack"
                >
                  <div className="input-block">
                    <label className="pure-label">Email Address</label>
                    <div className="pure-input-wrap">
                      <Mail size={16} />
                      <input 
                        type="email" required placeholder="name@company.com"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="input-block">
                    <label className="pure-label">Password</label>
                    <div className="pure-input-wrap">
                      <Lock size={16} />
                      <input 
                        type="password" required placeholder="••••••••"
                        value={formData.password}
                        onChange={e => setFormData({...formData, password: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="forgot-row">
                    <a href="#">Forgot Password?</a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* PRIMARY ACTION */}
            <motion.button 
              layout
              type="submit" 
              disabled={isLoading} 
              className="photon-btn"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? <Loader2 className="spin" size={18} /> : <Zap size={18} fill="currentColor" />}
              <span>{isSignup ? "Create Account" : "Sign In"}</span>
              <div className="photon-glow" />
            </motion.button>

          </form>
        </motion.div>
      </motion.div>

      {/* --- STYLES --- */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');

        :root {
          --bg-void: #050505;
          --surface: #0f0f0f;
          --border: rgba(255, 255, 255, 0.08);
          --border-hover: rgba(255, 255, 255, 0.15);
          --accent-red: #ff2e2e;
          --text-primary: #ffffff;
          --text-secondary: #888888;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; outline: none; }

        body {
          background: var(--bg-void);
          color: var(--text-primary);
          font-family: 'Inter', sans-serif;
          overflow: hidden;
        }

        .cosmos-container {
          position: relative; width: 100vw; height: 100vh;
          display: flex; align-items: center; justify-content: center;
          background: radial-gradient(circle at center, #0a0a0a 0%, #000000 100%);
        }

        /* SUBTLE AMBIENT GLOW */
        .ambient-light {
          position: absolute; width: 1200px; height: 1200px;
          background: radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 60%);
          top: 50%; left: 50%; transform: translate(-50%, -50%);
          pointer-events: none;
        }

        /* MAIN CARD: THE MONOLITH */
        .glass-monolith {
          background: rgba(15, 15, 15, 0.6);
          backdrop-filter: blur(40px);
          border: 1px solid var(--border);
          border-radius: 24px;
          box-shadow: 
            0 40px 80px -20px rgba(0,0,0,0.8),
            inset 0 1px 0 rgba(255,255,255,0.05);
          display: flex;
          overflow: hidden;
          position: relative;
        }

        /* DYNAMIC SIZING */
        .glass-monolith.compact { width: 420px; flex-direction: column; }
        .glass-monolith.expanded { width: 900px; flex-direction: row; }

        /* --- LEFT PANEL --- */
        .panel-identity {
          padding: 48px;
          display: flex; flex-direction: column; justify-content: space-between;
          background: linear-gradient(180deg, rgba(255,255,255,0.01) 0%, transparent 100%);
          transition: all 0.5s ease;
        }
        .glass-monolith.compact .panel-identity { border-bottom: 1px solid var(--border); gap: 32px; }
        .glass-monolith.expanded .panel-identity { width: 380px; border-right: 1px solid var(--border); }

        .brand-lockup { display: flex; align-items: center; gap: 12px; }
        .brand-mark {
          width: 32px; height: 32px; background: #fff; border-radius: 8px;
          display: flex; align-items: center; justify-content: center; color: #000;
        }
        .brand-name { font-weight: 600; font-size: 14px; letter-spacing: -0.02em; }

        .text-block h1 { font-size: 28px; font-weight: 600; margin: 0 0 8px 0; letter-spacing: -0.03em; line-height: 1.1; }
        .text-block p { font-size: 14px; color: var(--text-secondary); line-height: 1.5; margin: 0; }

        /* LIQUID TOGGLE */
        .liquid-toggle {
          position: relative; display: flex; background: #000; padding: 4px; border-radius: 12px;
          border: 1px solid var(--border); height: 48px;
        }
        .active-pill {
          position: absolute; top: 4px; left: 4px; width: calc(50% - 4px); height: calc(100% - 8px);
          background: #1a1a1a; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        }
        .liquid-toggle button {
          flex: 1; position: relative; z-index: 2; background: none; border: none;
          font-size: 13px; font-weight: 500; color: var(--text-secondary); cursor: pointer;
          transition: color 0.3s;
        }
        .liquid-toggle button.active { color: #fff; font-weight: 600; }

        .footer-legal { font-size: 11px; color: var(--text-secondary); opacity: 0.5; }

        /* --- RIGHT PANEL --- */
        .panel-form {
          flex: 1; padding: 48px; background: var(--bg-void);
          display: flex; align-items: center; justify-content: center;
        }
        .form-content { width: 100%; }

        /* GRID & STACK LAYOUTS */
        .signup-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; width: 100%; }
        .signin-stack { display: flex; flex-direction: column; gap: 24px; width: 100%; }
        .grid-col-span-2 { grid-column: span 2; }

        /* ROLES */
        .role-group { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 8px; }
        .role-option {
          background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
          padding: 12px; cursor: pointer; display: flex; align-items: center; gap: 12px;
          transition: all 0.2s; position: relative;
        }
        .role-option:hover { border-color: var(--border-hover); background: #151515; }
        .role-option.selected { background: #fff; border-color: #fff; color: #000; }
        
        .role-icon { 
          width: 32px; height: 32px; background: rgba(255,255,255,0.05); border-radius: 8px; 
          display: flex; align-items: center; justify-content: center;
        }
        .role-option.selected .role-icon { background: rgba(0,0,0,0.1); color: #000; }
        
        .role-info { display: flex; flex-direction: column; line-height: 1.2; }
        .role-info span { font-size: 13px; font-weight: 600; }
        .role-info small { font-size: 10px; opacity: 0.6; }
        .check-mark { position: absolute; top: 12px; right: 12px; opacity: 0.5; }

        /* PURE INPUTS */
        .input-block { display: flex; flex-direction: column; gap: 8px; }
        .pure-label { font-size: 12px; font-weight: 500; color: var(--text-secondary); }
        
        .pure-input-wrap {
          position: relative; height: 48px; background: var(--surface);
          border: 1px solid var(--border); border-radius: 8px;
          transition: all 0.2s; display: flex; align-items: center; padding: 0 16px;
          color: var(--text-secondary);
        }
        .pure-input-wrap:focus-within { border-color: #fff; color: #fff; background: #000; }
        
        .pure-input-wrap input {
          width: 100%; height: 100%; background: transparent; border: none;
          padding-left: 12px; font-size: 14px; color: #fff; font-weight: 500;
        }
        .pure-input-wrap input::placeholder { color: #333; }

        .forgot-row { display: flex; justify-content: flex-end; margin-top: -8px; }
        .forgot-row a { font-size: 12px; color: var(--text-secondary); text-decoration: none; transition: color 0.2s; }
        .forgot-row a:hover { color: #fff; }

        /* PHOTON BUTTON */
        .photon-btn {
          position: relative; width: 100%; height: 52px; margin-top: 24px;
          background: #fff; border: none; border-radius: 8px; color: #000;
          font-size: 14px; font-weight: 600; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          overflow: hidden; transition: transform 0.1s;
        }
        .photon-glow {
          position: absolute; inset: 0; 
          background: radial-gradient(circle at center, rgba(255,255,255,1) 0%, rgba(200,200,200,0) 70%);
          opacity: 0; transition: opacity 0.3s; mix-blend-mode: overlay;
        }
        .photon-btn:hover .photon-glow { opacity: 0.5; }
        .photon-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

      `}</style>
    </div>
  );
}