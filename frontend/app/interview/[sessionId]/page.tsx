"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getInterviewSession, submitAnswer, submitAudioAnswer, stopInterview, deleteInterview } from "@/lib/api";
import { Send, Bot, User, Loader2, Mic, Square, Trash2, LogOut, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function InterviewPage({ params }: { params: { sessionId: string } }) {
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [confirmType, setConfirmType] = useState<"stop" | "delete" | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await handleAudioSubmit(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("ಮೈಕ್ರೊಫೋನ್ ಪ್ರವೇಶವನ್ನು ನಿರಾಕರಿಸಲಾಗಿದೆ (Microphone access denied).");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleAudioSubmit = async (audioBlob: Blob) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const response = await submitAudioAnswer(params.sessionId, audioBlob, token || undefined);
      if (response.is_completed) {
        router.push(`/results/${params.sessionId}`);
      } else {
        await fetchSession();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, [params.sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [session?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchSession = async () => {
    if (!token) return;
    try {
      const data = await getInterviewSession(params.sessionId, token);
      if (data.status === "completed") {
        router.push(`/results/${params.sessionId}`);
      } else {
        setSession(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || submitting) return;

    setSubmitting(true);
    const currentAnswer = answer;
    setAnswer("");
    
    setSession((prev: any) => ({
      ...prev,
      messages: [...prev.messages, { role: "user", content: currentAnswer }]
    }));

    try {
      const response = await submitAnswer(params.sessionId, currentAnswer, token || undefined);
      if (response.is_completed) {
        router.push(`/results/${params.sessionId}`);
      } else {
        await fetchSession(); 
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStop = () => {
    setConfirmType("stop");
  };

  const executeStop = async () => {
    if (!token) return;
    setConfirmType(null);
    setLoading(true);
    try {
      await stopInterview(params.sessionId, token);
      router.push(`/results/${params.sessionId}`);
    } catch (err) {
      console.error("Stop interview error:", err);
      alert("ಸಂದರ್ಶನ ನಿಲ್ಲಿಸಲು ವಿಫಲವಾಗಿದೆ (Failed to stop interview).");
      setLoading(false);
    }
  };

  const handleDelete = () => {
    setConfirmType("delete");
  };

  const executeDelete = async () => {
    if (!token) return;
    setConfirmType(null);
    setLoading(true);
    try {
      await deleteInterview(params.sessionId, token);
      router.push("/");
    } catch (err) {
      console.error("Delete interview error:", err);
      alert("ಸಂದರ್ಶನ ಅಳಿಸಿ ಹಾಕಲು ವಿಫಲವಾಗಿದೆ (Failed to delete interview).");
      setLoading(false);
    }
  };

  if (authLoading || loading || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-t-2 border-amazon-green animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-r-2 border-amazon-orange animate-spin animation-delay-150"></div>
          <div className="absolute inset-4 rounded-full border-b-2 border-amazon-dark animate-spin animation-delay-300"></div>
        </div>
        <p className="text-slate-500 font-medium animate-pulse">Loading workspace...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-x-hidden flex flex-col bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.08),transparent),radial-gradient(circle_at_bottom_left,rgba(255,255,255,1),transparent)]">
      {/* Decorative background elements */}
      <div className="fixed top-[-10%] left-[-5%] w-[600px] h-[600px] bg-teal-400/5 rounded-full blur-[120px] mix-blend-multiply pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-400/5 rounded-full blur-[120px] mix-blend-multiply pointer-events-none z-0"></div>

      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 h-24 bg-white/60 backdrop-blur-xl border-b border-white/40 z-50 px-8 md:px-16 flex justify-between items-center shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">{session?.job_role}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className={`h-1.5 w-8 rounded-full ${i <= 1 ? 'bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.4)]' : 'bg-slate-200'}`}></div>
              ))}
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 rounded-full border border-emerald-100">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></div>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{session?.difficulty}</span>
            </div>
          </div>
        </div>

        <button 
          onClick={handleStop}
          className="px-6 py-3 bg-gradient-to-r from-red-600 to-[#C53030] hover:from-red-700 hover:to-[#B91C1C] text-white rounded-2xl transition-all flex items-center gap-2 text-sm font-bold shadow-xl shadow-red-600/25 hover:scale-[1.02] active:scale-[0.98]"
        >
          <LogOut className="w-4 h-4" />
          <span>Finish Interview</span>
        </button>
      </nav>

      <main className="flex-1 pt-28 pb-8 px-4 md:px-12 flex flex-col items-center h-[calc(100vh-6rem)] overflow-hidden">
        <div className="w-full max-w-6xl flex-1 bg-white rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)] overflow-hidden border border-white/60 flex flex-col relative z-10 backdrop-blur-sm animate-fade-in">
          
          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 scroll-smooth">
            {session?.messages.map((msg: any, idx: number) => (
              <div
                key={idx}
                className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-4 fade-in duration-500`}
                style={{ animationFillMode: 'both', animationDelay: `${idx * 100}ms` }}
              >
                <div
                  className={`max-w-[85%] md:max-w-[70%] rounded-[1.5rem] p-6 flex gap-5 ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-teal-600 to-emerald-700 text-white shadow-xl shadow-teal-600/20 rounded-tr-none"
                      : "bg-[#F8FAFC] text-slate-800 shadow-sm border border-slate-100 rounded-tl-none"
                  }`}
                >
                  {msg.role !== "user" && (
                    <div className="mt-1 flex-shrink-0">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                        <Bot className="w-6 h-6 text-teal-600" />
                      </div>
                    </div>
                  )}
                  <div className="space-y-3">
                    {msg.content.includes('|||') ? (
                      msg.content.split('|||').map((text: string, tIdx: number) => (
                        <p key={tIdx} className={`text-[15px] md:text-base leading-relaxed tracking-wide ${tIdx === 0 ? 'font-semibold' : 'font-medium opacity-80 border-t border-slate-200/50 pt-2'}`}>
                          {text.trim()}
                        </p>
                      ))
                    ) : (
                      <p className="text-[15px] md:text-base leading-relaxed tracking-wide font-medium">{msg.content}</p>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="mt-1 flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-inner">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {submitting && (
              <div className="flex justify-start animate-in fade-in">
                 <div className="max-w-[85%] rounded-3xl p-5 bg-slate-50 text-slate-800 shadow-sm border border-slate-100 rounded-tl-sm flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-white border border-teal-100 flex items-center justify-center shadow-sm">
                     <Bot className="w-5 h-5 text-amazon-green" />
                   </div>
                   <div className="flex gap-1.5 items-center">
                     <div className="w-2 h-2 rounded-full bg-amazon-green/60 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                     <div className="w-2 h-2 rounded-full bg-amazon-green/60 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                     <div className="w-2 h-2 rounded-full bg-amazon-green/60 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                   </div>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-4" />
          </div>

        </div>

        {/* Repositioned Input Area (Now outside and below the main card) */}
        <div className="mt-8 w-full max-w-4xl z-20">
          <form onSubmit={handleSubmit} className="flex gap-4 p-3 bg-white/80 backdrop-blur-2xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/50 items-center">
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={submitting}
              className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                isRecording 
                  ? "bg-red-50 text-red-500 shadow-lg shadow-red-500/20 animate-pulse" 
                  : "bg-teal-50 text-teal-600 hover:bg-teal-100 shadow-sm"
              } disabled:opacity-50`}
            >
              {isRecording ? <Square className="w-6 h-6 fill-current" /> : <Mic className="w-6 h-6" />}
            </button>
            
            <div className="flex-1 relative group">
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder={isRecording ? "Recording..." : "Type your response here..."}
                className="w-full resize-none h-14 bg-transparent px-2 py-4 focus:outline-none text-slate-800 font-medium placeholder:text-slate-400"
                disabled={submitting || isRecording}
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !answer.trim() || isRecording}
              className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-600 text-white flex items-center justify-center hover:shadow-lg hover:shadow-teal-600/20 transition-all shadow-md active:scale-95 disabled:opacity-30"
            >
              <Send className="w-6 h-6" />
            </button>
          </form>
        </div>
      </main>

      {/* Confirmation Modals */}
      {confirmType && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] p-10 max-w-md w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-300">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 ${confirmType === 'stop' ? 'bg-red-50 text-red-600' : 'bg-red-100 text-red-600'}`}>
              {confirmType === 'stop' ? <LogOut className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-3">
              {confirmType === 'stop' ? 'End Interview Session?' : 'Discard Interview?'}
            </h3>
            <p className="text-slate-500 mb-10 text-lg leading-relaxed font-medium">
              {confirmType === 'stop' 
                ? 'Are you sure you want to end the interview session? Your responses will be saved and evaluated.' 
                : 'Are you sure you want to discard this session? All progress will be lost forever.'}
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setConfirmType(null)}
                className="flex-1 py-4 px-6 rounded-2xl border-2 border-slate-100 text-slate-600 font-bold hover:bg-slate-50 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button 
                onClick={confirmType === 'stop' ? executeStop : executeDelete}
                className={`flex-1 py-4 px-6 rounded-2xl text-white font-bold transition-all active:scale-95 shadow-xl ${
                  confirmType === 'stop' ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20' : 'bg-red-500 hover:bg-red-600 shadow-red-500/20'
                }`}
              >
                {confirmType === 'stop' ? 'Finish' : 'Discard'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

