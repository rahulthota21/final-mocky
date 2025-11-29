"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mic, Square, ChevronRight, Video, 
  Loader2, AlertCircle, Volume2, RefreshCw, CheckCircle2 
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

// Pointing to your Python Student Backend
const API_URL = "http://127.0.0.1:8000";

export default function InterviewSession({ params }: { params: { sessionId: string } }) {
  const router = useRouter();
  
  // --- STATE ---
  const [questionData, setQuestionData] = useState<any>(null);
  const [qIndex, setQIndex] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  // --- REFS ---
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // --- 1. INITIALIZATION ---
  useEffect(() => {
    // A. Start Camera
    async function setupStream() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 1280, height: 720 }, 
            audio: true 
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        toast.error("Camera access denied. Please allow permissions.");
      }
    }

    // B. Fetch First Question
    fetchQuestion(1);
    setupStream();

    // Cleanup on unmount
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // --- 2. FETCH QUESTION LOGIC ---
  async function fetchQuestion(num: number) {
    setLoading(true);
    setAudioBlob(null); // Reset previous answer
    setAudioUrl(null);

    try {
      // Call Backend: GET /interview/next-question/{session_id}/{num}
      const res = await fetch(`${API_URL}/interview/next-question/${params.sessionId}/${num}`);
      
      if (res.status === 404) {
        // If 404, we are out of questions. Go to Summary.
        toast.success("Interview Complete! Generating Report...");
        router.push(`/interview/${params.sessionId}/summary`);
        return;
      }
      
      if (!res.ok) throw new Error("Failed to fetch question");
      
      const data = await res.json();
      setQuestionData(data);
      setQIndex(num);
    } catch (err) {
      console.error(err);
      toast.error("Connection Error: Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  // --- 3. RECORDING LOGIC ---
  const startRecording = () => {
    if (!streamRef.current) return;
    
    const mediaRecorder = new MediaRecorder(streamRef.current);
    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      setAudioBlob(blob);
      setAudioUrl(URL.createObjectURL(blob));
    };

    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
    }
  };

  // --- 4. SUBMIT LOGIC ---
  const handleSubmit = async () => {
    if (!audioBlob) return;
    setIsSubmitting(true);
    
    try {
      // Step A: Upload Audio to Supabase Storage
      // Path: answers/{session_id}/{question_number}/audio.webm
      const filePath = `answers/${params.sessionId}/${qIndex}/audio.webm`;
      
      const { error: uploadError } = await supabase.storage
        .from('mock.interview.answers')
        .upload(filePath, audioBlob, { upsert: true });

      if (uploadError) throw uploadError;

      // Step B: Notify Backend to Process Answer
      const res = await fetch(`${API_URL}/interview/submit-answer/${params.sessionId}/${qIndex}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer_text: "Audio submitted" }) 
      });

      if (!res.ok) throw new Error("AI Processing Failed");

      toast.success("Answer analyzed successfully");
      
      // Step C: Move to Next Question
      fetchQuestion(qIndex + 1);

    } catch (err: any) {
      console.error(err);
      toast.error("Submission Failed: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- UI: LOADING SCREEN ---
  if (loading && !questionData) {
    return (
      <div className="singularity-loader">
        <Loader2 className="animate-spin text-blue-500" size={48} />
        <p className="mt-4 text-zinc-500 font-mono text-sm">LOADING NEURAL CONTEXT...</p>
        <style jsx>{`
            .singularity-loader { height: 100vh; background: #020202; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; }
        `}</style>
      </div>
    );
  }

  // --- UI: MAIN INTERFACE ---
  return (
    <div className="cosmos-container">
      <div className="void-texture" />
      
      <div className="interview-grid">
        
        {/* LEFT COLUMN: QUESTION & CONTROLS */}
        <div className="control-column">
            
            {/* Question Card */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="question-card"
            >
                <div className="meta-tag">
                    <span className="q-badge">QUESTION 0{qIndex}</span>
                    <span className="cat-badge">{questionData?.category || "GENERAL"}</span>
                </div>
                
                <h1 className="q-text">
                    {questionData?.question}
                </h1>
            </motion.div>

            {/* Audio Visualizer / Status Area */}
            <div className={`audio-viz ${isRecording ? 'recording' : ''}`}>
                {isRecording ? (
                    <div className="viz-bars">
                        {[...Array(8)].map((_, i) => (
                            <motion.div 
                                key={i}
                                className="bar"
                                animate={{ height: [10, 40, 15, 50, 10] }}
                                transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                            />
                        ))}
                        <span className="rec-text">REC</span>
                    </div>
                ) : audioBlob ? (
                    <div className="audio-ready">
                        <CheckCircle2 size={24} className="text-emerald-500" />
                        <div>
                            <span className="text-white font-medium">Answer Captured</span>
                            <span className="text-zinc-500 text-xs block">{(audioBlob.size / 1024).toFixed(1)} KB // Ready to transmit</span>
                        </div>
                    </div>
                ) : (
                    <div className="idle-state">
                        <Volume2 size={20} />
                        <span>Waiting for audio input...</span>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="actions-row">
                {!isRecording && !audioBlob && (
                    <button onClick={startRecording} className="btn-primary">
                        <Mic size={18} /> START RECORDING
                    </button>
                )}

                {isRecording && (
                    <button onClick={stopRecording} className="btn-danger">
                        <Square size={18} fill="currentColor" /> STOP
                    </button>
                )}

                {audioBlob && !isSubmitting && (
                    <>
                        <button onClick={() => setAudioBlob(null)} className="btn-secondary">
                            <RefreshCw size={18} /> RETAKE
                        </button>
                        <button onClick={handleSubmit} className="btn-submit">
                            SUBMIT ANSWER <ChevronRight size={18} />
                        </button>
                    </>
                )}

                {isSubmitting && (
                    <button disabled className="btn-disabled">
                        <Loader2 className="animate-spin" size={18} /> UPLOADING...
                    </button>
                )}
            </div>

        </div>

        {/* RIGHT COLUMN: CAMERA FEED */}
        <div className="camera-column">
            <div className="cam-wrapper">
                <video 
                    ref={videoRef} 
                    autoPlay 
                    muted 
                    playsInline 
                    className="video-feed" 
                />
                <div className="cam-overlay">
                    <div className="live-badge">
                        <div className="red-dot" /> LIVE FEED
                    </div>
                </div>
            </div>
        </div>

      </div>

      {/* --- STYLES --- */}
      <style jsx global>{`
        :root {
            --bg: #020202;
            --panel: rgba(20, 20, 20, 0.6);
            --border: rgba(255, 255, 255, 0.1);
            --emerald: #10b981;
            --blue: #3b82f6;
            --red: #ef4444;
        }
        
        body { background: var(--bg); color: white; font-family: 'Inter', sans-serif; overflow: hidden; }

        .cosmos-container { height: 100vh; width: 100vw; display: flex; align-items: center; justify-content: center; position: relative; }
        .void-texture { position: absolute; inset: 0; background: radial-gradient(circle at 50% 10%, rgba(59,130,246,0.1), transparent 60%); pointer-events: none; }

        .interview-grid { 
            display: grid; grid-template-columns: 1fr 480px; gap: 40px; 
            width: 100%; max-width: 1400px; padding: 40px; z-index: 10;
        }

        /* LEFT COLUMN */
        .control-column { display: flex; flex-direction: column; justify-content: center; gap: 32px; }

        .meta-tag { display: flex; gap: 12px; margin-bottom: 16px; font-family: 'JetBrains Mono', monospace; font-size: 11px; }
        .q-badge { color: var(--emerald); background: rgba(16,185,129,0.1); padding: 4px 8px; border-radius: 4px; }
        .cat-badge { color: var(--blue); background: rgba(59,130,246,0.1); padding: 4px 8px; border-radius: 4px; }

        .q-text { font-size: 32px; font-weight: 500; line-height: 1.3; color: #fff; margin: 0; }

        .audio-viz { 
            height: 120px; background: var(--panel); border: 1px solid var(--border); 
            border-radius: 16px; display: flex; align-items: center; justify-content: center; 
            transition: border-color 0.3s;
        }
        .audio-viz.recording { border-color: var(--red); background: rgba(239,68,68,0.05); }

        .viz-bars { display: flex; align-items: flex-end; gap: 4px; height: 40px; }
        .bar { width: 6px; background: var(--red); border-radius: 4px; }
        .rec-text { color: var(--red); font-weight: 700; font-size: 12px; margin-left: 12px; animation: pulse 1s infinite; align-self: center; }

        .audio-ready { display: flex; align-items: center; gap: 16px; }
        .idle-state { color: #555; display: flex; align-items: center; gap: 10px; font-size: 14px; }

        .actions-row { display: flex; gap: 16px; margin-top: 16px; }
        
        button { 
            height: 56px; border-radius: 100px; font-weight: 600; font-size: 13px; 
            cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; 
            transition: transform 0.1s; padding: 0 32px; letter-spacing: 0.5px;
        }
        button:hover { transform: translateY(-1px); }

        .btn-primary { background: #fff; color: #000; border: none; }
        .btn-danger { background: var(--red); color: #fff; border: none; width: 100%; }
        .btn-secondary { background: transparent; color: #888; border: 1px solid var(--border); }
        .btn-secondary:hover { color: #fff; border-color: #fff; }
        .btn-submit { background: var(--emerald); color: #fff; border: none; flex: 1; }
        .btn-disabled { background: #222; color: #555; border: none; width: 100%; cursor: not-allowed; }

        /* RIGHT COLUMN */
        .camera-column { display: flex; align-items: center; }
        .cam-wrapper { 
            width: 100%; aspect-ratio: 4/3; background: #000; border-radius: 24px; 
            overflow: hidden; border: 1px solid var(--border); position: relative; 
            box-shadow: 0 20px 50px -10px rgba(0,0,0,0.5);
        }
        .video-feed { width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1); }
        
        .cam-overlay { position: absolute; top: 16px; right: 16px; }
        .live-badge { 
            background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); 
            padding: 6px 12px; border-radius: 100px; display: flex; align-items: center; gap: 8px; 
            font-size: 11px; font-weight: 700; font-family: 'JetBrains Mono', monospace; 
        }
        .red-dot { width: 6px; height: 6px; background: var(--red); border-radius: 50%; animation: pulse 1s infinite; }

        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  );
}