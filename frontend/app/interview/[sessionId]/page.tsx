"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getInterviewSession, submitAnswer, submitAudioAnswer, stopInterview, deleteInterview } from "@/lib/api";
import { Send, Bot, User, Mic, Square, LogOut, Sparkles, CameraOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import ProctoringSystem from "@/components/ProctoringSystem";

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
  const [proctoringError, setProctoringError] = useState(false);

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
    try {
      const data = await getInterviewSession(params.sessionId, token || undefined);
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

    const currentAnswer = answer;
    setAnswer("");
    setSubmitting(true);

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
    setConfirmType(null);
    setLoading(true);
    try {
      await stopInterview(params.sessionId, token || "");
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
    setConfirmType(null);
    setLoading(true);
    try {
      await deleteInterview(params.sessionId, token || "");
      router.push("/");
    } catch (err) {
      console.error("Delete interview error:", err);
      alert("ಸಂದರ್ಶನ ಅಳಿಸಿ ಹಾಕಲು ವಿಫಲವಾಗಿದೆ (Failed to delete interview).");
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-accent"></div>
        <p className="text-foreground-muted text-xs font-semibold">ಸಂದರ್ಶನ ಕೊಠಡಿ ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತಿದೆ...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden flex flex-col font-sans">
      {/* Proctoring System */}
      <ProctoringSystem 
        sessionId={params.sessionId} 
        isPractice={session?.is_practice} 
        onError={(err) => setProctoringError(err)}
      />

      {/* Camera/Mic Required Modal */}
      {proctoringError && !session?.is_practice && (
        <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-surface rounded-2xl p-8 shadow-2xl border border-border space-y-6 animate-fade-in">
            <div className="w-14 h-14 bg-red-50 text-red-600 border border-red-200 rounded-xl flex items-center justify-center mx-auto">
              <CameraOff size={28} />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black text-foreground">
                ಕ್ಯಾಮೆರಾ ಮತ್ತು ಮೈಕ್ರೊಫೋನ್ ಅಗತ್ಯವಿದೆ
              </h2>
              <p className="text-foreground-muted text-xs font-medium leading-relaxed">
                ಸಂದರ್ಶನಕ್ಕೆ ಹಾಜರಾಗಲು ಕ್ಯಾಮೆರಾ ಮತ್ತು ಮೈಕ್ರೊಫೋನ್ ಕಡ್ಡಾಯವಾಗಿದೆ.<br/>
                (Camera and microphone permissions are required.)
              </p>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-2.5 bg-primary text-white rounded-xl font-semibold text-xs shadow-sm hover:bg-[#131F37] transition-colors"
            >
              ಅನುಮತಿ ಪರಿಶೀಲಿಸಿ (Check Permissions)
            </button>
          </div>
        </div>
      )}

      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-surface/90 backdrop-blur-md border-b border-border z-50 px-6 md:px-12 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-accent inline-block"></span>
          <h1 className="text-base font-black text-foreground tracking-tight">{session?.job_role}</h1>
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-accent-subtle text-accent-subtle-foreground font-bold uppercase tracking-wider">
            {session?.difficulty}
          </span>
        </div>

        <button 
          onClick={handleStop}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors flex items-center gap-2 text-xs font-semibold shadow-sm"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>ಸಂದರ್ಶನ ಮುಗಿಸಿ (Finish)</span>
        </button>
      </nav>

      {session?.is_practice && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-accent text-white py-1.5 px-6 text-center text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>ಅಭ್ಯಾಸ ವಿಧಾನ (Practice Mode) — ಈ ಅಧಿವೇಶನವು ನೇಮಕಾತಿದಾರರಿಗೆ ಗೋಚರಿಸುವುದಿಲ್ಲ</span>
        </div>
      )}

      <main className="flex-1 pt-24 pb-6 px-4 md:px-10 flex flex-col items-center h-[calc(100vh-4rem)] overflow-hidden">
        <div className="w-full max-w-4xl flex-1 bg-surface rounded-2xl shadow-sm border border-border flex flex-col relative z-10 overflow-hidden animate-fade-in">
          
          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 scroll-smooth">
            {session?.messages.map((msg: any, idx: number) => (
              <div
                key={idx}
                className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
              >
                <div
                  className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-5 flex gap-3.5 ${
                    msg.role === "user"
                      ? "bg-primary text-white rounded-tr-sm shadow-sm"
                      : "bg-surface-raised text-foreground rounded-tl-sm border border-border"
                  }`}
                >
                  {msg.role !== "user" && (
                    <div className="mt-0.5 flex-shrink-0">
                      <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-accent shadow-xs">
                        <Bot className="w-4 h-4" />
                      </div>
                    </div>
                  )}
                  <div className="space-y-2 text-sm leading-relaxed">
                    {msg.content.includes('|||') ? (
                      msg.content.split('|||').map((text: string, tIdx: number) => (
                        <p key={tIdx} className={`leading-relaxed ${tIdx === 0 ? 'font-semibold' : 'font-normal opacity-90 border-t border-border/40 pt-1.5'}`}>
                          {text.trim()}
                        </p>
                      ))
                    ) : (
                      <p className="leading-relaxed font-medium">{msg.content}</p>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="mt-0.5 flex-shrink-0">
                      <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white">
                        <User className="w-4 h-4" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {submitting && (
              <div className="flex justify-start animate-fade-in">
                <div className="rounded-2xl p-4 bg-surface-raised border border-border flex items-center gap-3">
                  <Bot className="w-4 h-4 text-accent animate-spin" />
                  <span className="text-xs text-foreground-muted font-medium">AI ಪ್ರತಿಕ್ರಿಯೆಯನ್ನು ಮೌಲ್ಯಮಾಪನ ಮಾಡುತ್ತಿದೆ...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-2" />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-border bg-surface">
            <form onSubmit={handleSubmit} className="flex gap-2.5 items-center">
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={submitting}
                className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
                  isRecording 
                    ? "bg-red-600 text-white animate-pulse" 
                    : "bg-accent-subtle text-accent hover:bg-amber-100 border border-amber-200/50"
                } disabled:opacity-50`}
              >
                {isRecording ? <Square className="w-5 h-5 fill-current" /> : <Mic className="w-5 h-5" />}
              </button>
              
              <div className="flex-1">
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  placeholder={isRecording ? "ರೆಕಾರ್ಡಿಂಗ್ ನಡೆಯುತ್ತಿದೆ..." : "ನಿಮ್ಮ ಉತ್ತರವನ್ನು ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ ಅಥವಾ ಧ್ವನಿ ಬಳಸಿ..."}
                  className="w-full resize-none h-11 bg-background border border-border rounded-xl px-3.5 py-2.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-xs text-foreground font-medium placeholder:text-foreground-muted"
                  disabled={submitting || isRecording}
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !answer.trim() || isRecording}
                className="flex-shrink-0 w-11 h-11 rounded-xl bg-primary hover:bg-[#131F37] text-white flex items-center justify-center shadow-sm transition-colors disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Confirmation Modals */}
      {confirmType && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-surface rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-border space-y-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-red-50 text-red-600 border border-red-200">
              <LogOut className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-foreground">
                ಸಂದರ್ಶನ ಮುಗಿಸಬೇಕೇ?
              </h3>
              <p className="text-foreground-muted text-xs leading-relaxed">
                ನಿಮ್ಮ ಉತ್ತರಗಳನ್ನು ಉಳಿಸಿ AI ಮೌಲ್ಯಮಾಪನ ವರದಿಯನ್ನು ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತದೆ.
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button 
                onClick={() => setConfirmType(null)}
                className="flex-1 py-2 px-4 rounded-xl border border-border text-foreground text-xs font-semibold hover:bg-surface-raised transition-colors"
              >
                ರದ್ದುಮಾಡಿ (Cancel)
              </button>
              <button 
                onClick={confirmType === 'stop' ? executeStop : executeDelete}
                className="flex-1 py-2 px-4 rounded-xl text-white text-xs font-semibold bg-red-600 hover:bg-red-700 transition-colors shadow-sm"
              >
                ಮುಕ್ತಾಯಗೊಳಿಸಿ (Finish)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
