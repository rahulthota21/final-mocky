"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import {
  Upload, File, X, Briefcase, Award, Code, Zap, Activity, Check, Sparkles
} from "lucide-react";

// Robust API URL (Use 127.0.0.1 to avoid IPv6 localhost issues)
const API_URL = "http://127.0.0.1:4000";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function NewScreeningModal({ open, onClose }: Props) {
  /* ─────────── Supabase ─────────── */
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
  }, []);

  /* ─────────── local state ───────── */
  const [form, setForm] = useState({
    title: "",
    description: "",
    exp: [30],
    proj: [25],
    cert: [20],
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  /* ─────────── drop-zone ─────────── */
  const onDrop = useCallback((accepted: File[]) => {
    const f = accepted[0];
    if (!f) return;
    if (!f.name.toLowerCase().endsWith(".zip")) {
      toast.error("Only .zip files are supported");
      return;
    }
    setFile(f);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: { "application/zip": [".zip"] },
  });

  const removeFile = () => setFile(null);

  /* ─────────── submit ────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !file) {
      toast.error("Fill required fields and attach a ZIP");
      return;
    }
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("job_title", form.title);
      formData.append("job_description", form.description);
      // Ensure numbers are sent as strings
      formData.append("weight_experience", form.exp[0].toString());
      formData.append("weight_projects", form.proj[0].toString());
      formData.append("weight_certifications", form.cert[0].toString());

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      console.log("Access token found:", !!token); // Debug log
      
      if (!token) {
        toast.error("Session expired. Please login again.");
        setLoading(false);
        return;
      }

      // Use the robust 127.0.0.1 URL
      const res = await fetch(`${API_URL}/upload-resumes/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const detail = await res.text();
        throw new Error(`HTTP ${res.status}: ${detail}`);
      }

      const { job_id } = await res.json();
      toast.success("Screening started successfully!");
      router.push(`/dashboard/recruiter/animation?job=${job_id}`);
      onClose();
    } catch (err) {
      console.error("Upload Error:", err);
      // Friendly error message for connection refused
      if (err instanceof TypeError && err.message === "Failed to fetch") {
        toast.error("Cannot connect to AI Server. Is the backend running on Port 4000?");
      } else {
        toast.error("Upload failed. Check console for details.");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ─────────── ui ─────────────────── */
  return (
    <AnimatePresence>
      {open && (
        <div className="horixa-overlay">
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="horixa-modal"
          >
            {/* Header */}
            <div className="modal-header">
              <div>
                <h2 className="header-title">Initialize Screening</h2>
                <p className="header-subtitle">Configure neural weights and ingest candidate data.</p>
              </div>
              <button onClick={onClose} className="close-btn">
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>

            <div className="scrollable-content">
              <form onSubmit={handleSubmit} className="modal-form">
                
                {/* Input: Job Title */}
                <div className="input-group">
                  <label className="input-label">Job Title</label>
                  <input
                    type="text"
                    className="horixa-input"
                    placeholder="e.g. Senior Systems Architect"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>

                {/* Input: Description */}
                <div className="input-group">
                  <label className="input-label">Mission Parameters (Description)</label>
                  <textarea
                    className="horixa-input textarea"
                    placeholder="Paste technical requirements vector here..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>

                {/* Sliders / Weights */}
                <div className="weights-section">
                  <div className="section-header">
                    <h3>Neural Weights</h3>
                    <div className="section-line" />
                  </div>
                  
                  <div className="sliders-grid">
                    <CustomSlider
                      label="Experience Vector"
                      icon={<Briefcase size={14} />}
                      value={form.exp[0]}
                      onChange={(val) => setForm({ ...form, exp: [val] })}
                    />
                    <CustomSlider
                      label="Project Complexity"
                      icon={<Code size={14} />}
                      value={form.proj[0]}
                      onChange={(val) => setForm({ ...form, proj: [val] })}
                    />
                    <CustomSlider
                      label="Certification Index"
                      icon={<Award size={14} />}
                      value={form.cert[0]}
                      onChange={(val) => setForm({ ...form, cert: [val] })}
                    />
                  </div>
                </div>

                {/* Upload Zone */}
                <div className="upload-section">
                  <div className="section-header">
                    <h3>Data Ingestion</h3>
                    <div className="section-line" />
                  </div>
                  
                  <div 
                    {...getRootProps()} 
                    className={`horixa-dropzone ${isDragActive ? 'active' : ''}`}
                  >
                    <input {...getInputProps()} />
                    <div className="dropzone-content">
                      <div className="icon-wrapper">
                        <Upload size={24} strokeWidth={1.5} />
                      </div>
                      <div className="text-wrapper">
                        <p className="drop-main">
                          {isDragActive ? "Release Data Packet" : "Initiate Upload Sequence"}
                        </p>
                        <p className="drop-sub">Target Format: .ZIP Archive Only</p>
                      </div>
                    </div>
                    {/* Animated scanning line */}
                    <div className="scan-line" />
                  </div>

                  <AnimatePresence>
                    {file && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="file-preview"
                      >
                        <div className="file-info">
                          <File size={16} className="text-red" />
                          <div className="file-details">
                            <span className="file-name">{file.name}</span>
                            <span className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                          </div>
                        </div>
                        <button type="button" onClick={removeFile} className="remove-file-btn">
                          <X size={14} />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Footer Actions */}
                <div className="modal-actions">
                  <button type="button" onClick={onClose} className="horixa-btn secondary">
                    Abort
                  </button>
                  <button type="submit" disabled={loading} className="horixa-btn primary">
                    {loading ? (
                      <span>Processing...</span>
                    ) : (
                      <>
                        <Sparkles size={14} />
                        <span>Execute</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* ─────────── STYLES (HORIXA THEME) ─────────── */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

        :root {
          --bg-void: #020202;
          --bg-panel: #0a0a0a;
          --glass-border: rgba(255, 255, 255, 0.1);
          --accent-red: #ff2e2e;
          --accent-red-dim: rgba(255, 46, 46, 0.15);
          --text-primary: #ffffff;
          --text-secondary: #888888;
        }

        /* OVERLAY */
        .horixa-overlay {
          position: fixed; inset: 0; z-index: 9999;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center;
          padding: 24px;
        }

        /* MODAL */
        .horixa-modal {
          width: 100%; max-width: 650px;
          max-height: 90vh;
          background: var(--bg-panel);
          border: 1px solid var(--glass-border);
          box-shadow: 0 40px 80px -20px rgba(0,0,0,1);
          border-radius: 2px; /* Sharp corners per theme */
          display: flex; flex-direction: column;
          position: relative; overflow: hidden;
        }
        /* Top red accent line */
        .horixa-modal::before {
          content: ""; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, var(--accent-red), transparent);
          opacity: 0.8;
        }

        /* HEADER */
        .modal-header {
          padding: 24px 32px;
          border-bottom: 1px solid var(--glass-border);
          display: flex; align-items: flex-start; justify-content: space-between;
          background: linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0) 100%);
        }
        .header-title {
          font-family: 'Inter', sans-serif; font-size: 18px; font-weight: 600;
          color: var(--text-primary); margin-bottom: 4px; letter-spacing: -0.01em;
        }
        .header-subtitle { font-size: 13px; color: var(--text-secondary); font-weight: 400; }
        
        .close-btn {
          background: transparent; border: none; color: var(--text-secondary);
          cursor: pointer; transition: color 0.2s; padding: 4px;
        }
        .close-btn:hover { color: var(--text-primary); }

        /* CONTENT */
        .scrollable-content { overflow-y: auto; padding: 32px; }
        .modal-form { display: flex; flex-direction: column; gap: 32px; }

        /* INPUTS */
        .input-group { display: flex; flex-direction: column; gap: 8px; }
        .input-label {
          font-family: 'JetBrains Mono', monospace; font-size: 11px; text-transform: uppercase;
          color: var(--text-secondary); letter-spacing: 0.05em;
        }
        .horixa-input {
          width: 100%; background: rgba(255,255,255,0.02);
          border: 1px solid var(--glass-border);
          padding: 12px 16px;
          color: var(--text-primary);
          font-family: 'Inter', sans-serif; font-size: 14px;
          border-radius: 2px;
          transition: all 0.2s;
        }
        .horixa-input.textarea { min-height: 100px; resize: none; line-height: 1.5; }
        .horixa-input:focus {
          outline: none; border-color: var(--text-primary);
          background: rgba(255,255,255,0.05);
        }

        /* SECTION HEADERS */
        .section-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
        .section-header h3 {
          font-family: 'JetBrains Mono', monospace; font-size: 11px; text-transform: uppercase;
          color: var(--accent-red); font-weight: 500; letter-spacing: 0.05em;
        }
        .section-line { flex: 1; height: 1px; background: var(--glass-border); }

        /* SLIDERS */
        .sliders-grid { display: flex; flex-direction: column; gap: 20px; }
        .custom-slider { display: flex; flex-direction: column; gap: 10px; }
        .slider-header { display: flex; justify-content: space-between; align-items: center; font-size: 12px; }
        .slider-label { display: flex; align-items: center; gap: 8px; color: var(--text-secondary); }
        .slider-value { font-family: 'JetBrains Mono', monospace; color: var(--text-primary); font-weight: 600; }

        input[type=range] { -webkit-appearance: none; width: 100%; background: transparent; }
        input[type=range]::-webkit-slider-runnable-track {
          width: 100%; height: 2px; background: var(--glass-border); cursor: pointer;
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none; height: 12px; width: 12px;
          background: var(--text-primary); border-radius: 50%;
          cursor: pointer; margin-top: -5px; box-shadow: 0 0 10px rgba(255,255,255,0.5);
          transition: transform 0.1s;
        }
        input[type=range]:hover::-webkit-slider-thumb { transform: scale(1.2); }

        /* DROPZONE */
        .horixa-dropzone {
          position: relative;
          border: 1px dashed var(--glass-border);
          background: rgba(255,255,255,0.01);
          border-radius: 2px;
          padding: 40px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s;
          overflow: hidden;
        }
        .horixa-dropzone:hover, .horixa-dropzone.active {
          border-color: var(--accent-red);
          background: var(--accent-red-dim);
        }
        
        .dropzone-content { display: flex; flex-direction: column; align-items: center; gap: 12px; position: relative; z-index: 2; }
        .icon-wrapper { color: var(--text-secondary); transition: color 0.3s; }
        .horixa-dropzone:hover .icon-wrapper { color: var(--accent-red); }
        
        .drop-main { font-size: 13px; font-weight: 500; color: var(--text-primary); letter-spacing: 0.02em; }
        .drop-sub { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--text-secondary); text-transform: uppercase; }

        /* Scanning Animation */
        .scan-line {
          position: absolute; top: 0; left: 0; width: 100%; height: 2px;
          background: var(--accent-red); opacity: 0; pointer-events: none;
          box-shadow: 0 0 15px var(--accent-red);
        }
        .horixa-dropzone:hover .scan-line { opacity: 0.6; animation: scan 1.5s linear infinite; }
        @keyframes scan { 0% { top: -10%; } 100% { top: 110%; } }

        /* FILE PREVIEW */
        .file-preview {
          background: rgba(255, 46, 46, 0.05); border: 1px solid rgba(255, 46, 46, 0.2);
          padding: 12px 16px; border-radius: 2px;
          display: flex; align-items: center; justify-content: space-between;
          overflow: hidden;
        }
        .file-info { display: flex; align-items: center; gap: 12px; }
        .text-red { color: var(--accent-red); }
        .file-details { display: flex; flex-direction: column; gap: 2px; }
        .file-name { font-size: 13px; color: var(--text-primary); font-weight: 500; }
        .file-size { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--text-secondary); }
        .remove-file-btn { background: transparent; border: none; color: var(--text-secondary); cursor: pointer; }
        .remove-file-btn:hover { color: var(--accent-red); }

        /* BUTTONS */
        .modal-actions { display: flex; justify-content: flex-end; gap: 12px; padding-top: 16px; border-top: 1px solid var(--glass-border); }
        
        .horixa-btn {
          height: 40px; padding: 0 24px;
          border-radius: 2px;
          font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.05em;
          cursor: pointer; transition: all 0.2s;
          display: flex; align-items: center; gap: 8px;
        }
        
        .horixa-btn.secondary {
          background: transparent; border: 1px solid var(--glass-border); color: var(--text-secondary);
        }
        .horixa-btn.secondary:hover { border-color: var(--text-primary); color: var(--text-primary); }

        .horixa-btn.primary {
          background: var(--text-primary); border: none; color: #000;
        }
        .horixa-btn.primary:hover {
          background: #ffffff; box-shadow: 0 0 20px rgba(255,255,255,0.25); transform: translateY(-1px);
        }
        .horixa-btn.primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: none; }

      `}</style>
    </AnimatePresence>
  );
}

/* ─────────── HELPER COMPONENTS ─────────── */

function CustomSlider({
  label,
  icon,
  value,
  onChange,
}: {
  label: string;
  icon: React.ReactNode;
  value: number;
  onChange: (val: number) => void;
}) {
  return (
    <div className="custom-slider">
      <div className="slider-header">
        <div className="slider-label">
          {icon}
          <span>{label}</span>
        </div>
        <span className="slider-value">{value}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={50}
        step={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}