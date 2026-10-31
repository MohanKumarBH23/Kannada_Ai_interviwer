"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Mic, AlertTriangle, Shield, UserCheck, Maximize2, Minimize2 } from 'lucide-react';

interface ProctoringSystemProps {
  sessionId: string;
  isPractice?: boolean;
  onError?: (error: boolean) => void;
}

export default function ProctoringSystem({ sessionId, isPractice = false, onError }: ProctoringSystemProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState<'initializing' | 'active' | 'error'>('initializing');
  const [violations, setViolations] = useState<{ type: string; count: number }[]>([]);
  const [showWarning, setShowWarning] = useState(false);
  const [lastViolation, setLastViolation] = useState("");
  const [audioLevel, setAudioLevel] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    startProctoring();
    
    // Tab visibility detection
    const handleVisibilityChange = () => {
      if (document.hidden) {
        logViolation("Tab Switch");
      }
    };

    // Window focus detection
    const handleBlur = () => {
      logViolation("Window Unfocused");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);

    return () => {
      stopProctoring();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  const startProctoring = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      // Audio analysis
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(mediaStream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkAudio = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        setAudioLevel(average);

        // Simple noise detection (threshold > 50 could be a loud voice)
        if (average > 70) {
          // This might be triggered too often, so we could throttle it
          // logViolation("Loud Noise Detected");
        }

        animationFrameRef.current = requestAnimationFrame(checkAudio);
      };

      checkAudio();
      setStatus('active');
      if (onError) onError(false);
    } catch (err) {
      console.error("Proctoring error:", err);
      setStatus('error');
      if (onError) onError(true);
    }
  };

  const stopProctoring = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const logViolation = (type: string) => {
    setLastViolation(type);
    setShowWarning(true);
    setViolations(prev => {
      const existing = prev.find(v => v.type === type);
      if (existing) {
        return prev.map(v => v.type === type ? { ...v, count: v.count + 1 } : v);
      }
      return [...prev, { type, count: 1 }];
    });

    // Auto-hide warning after 3 seconds
    setTimeout(() => setShowWarning(false), 3000);

    // In a real app, you would send this to the backend
    console.warn(`[Proctoring] Violation detected: ${type}`);
  };

  if (status === 'error') {
    if (isPractice) return null; // Don't show error box in practice mode
    return (
      <div className="fixed bottom-6 right-6 z-[60] bg-rose-50 border border-rose-200 p-4 rounded-2xl shadow-xl max-w-xs animate-in slide-in-from-right-4">
        <div className="flex gap-3">
          <AlertTriangle className="text-rose-500 shrink-0" size={20} />
          <div className="space-y-1">
            <p className="text-sm font-black text-rose-900">Proctoring Offline</p>
            <p className="text-xs font-medium text-rose-600">Please enable camera and microphone access to continue with the interview.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Warning Overlay */}
      {showWarning && (
        <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center">
          <div className="bg-rose-600 text-white px-8 py-4 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 border-4 border-white/20">
            <div className="flex items-center gap-3">
              <AlertTriangle className="animate-bounce" />
              <div className="text-center">
                <p className="text-xl font-black uppercase tracking-widest">Malpractice Warning</p>
                <p className="text-sm font-bold opacity-90">{lastViolation} Detected</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Proctoring Widget */}
      <div className={`fixed bottom-6 right-6 z-[60] transition-all duration-500 ease-out ${isExpanded ? 'w-80' : 'w-48'} group`}>
        <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden relative">
          {/* Header */}
          <div className="bg-slate-900 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Proctoring Active</span>
            </div>
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
          </div>

          {/* Video Preview */}
          <div className="relative aspect-video bg-slate-100 group">
            <video 
              ref={videoRef} 
              autoPlay 
              muted 
              playsInline 
              className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-500"
            />
            
            {/* Audio Indicator Overlay */}
            <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
               <Mic size={10} className={audioLevel > 20 ? "text-emerald-400" : "text-white"} />
               <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-1 h-3 rounded-full transition-all duration-100 ${
                        audioLevel > (i * 20) ? 'bg-emerald-400' : 'bg-white/20'
                      }`}
                      style={{ height: `${Math.max(4, Math.min(12, (audioLevel / 10) * (i + 1)))}px` }}
                    />
                  ))}
               </div>
            </div>

            {/* Shield Icon Overlay */}
            <div className="absolute top-2 right-2">
               <Shield size={16} className="text-emerald-500 drop-shadow-lg" />
            </div>
          </div>

          {/* Stats / Info */}
          <div className={`p-4 space-y-4 ${isExpanded ? 'block' : 'hidden'}`}>
             <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                   <div className="flex items-center gap-1.5">
                      <UserCheck size={14} className="text-emerald-500" />
                      <span className="text-xs font-bold text-slate-700">Verified</span>
                   </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Violations</p>
                   <span className={`text-xs font-black ${violations.length > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {violations.reduce((acc, v) => acc + v.count, 0)} Recorded
                   </span>
                </div>
             </div>

             {violations.length > 0 && (
               <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Log Summary</p>
                  <div className="space-y-1">
                     {violations.map((v, i) => (
                       <div key={i} className="flex justify-between items-center text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-lg">
                          <span>{v.type}</span>
                          <span className="text-rose-500">x{v.count}</span>
                       </div>
                     ))}
                  </div>
               </div>
             )}
          </div>
        </div>
      </div>
    </>
  );
}
