"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { toPng } from "html-to-image";
import {
  Search,
  Paperclip,
  X,
  User,
  ShieldCheck,
  AlertCircle,
  Mic,
  MicOff,
  AudioLines,
} from "lucide-react";
import { useTheme } from "next-themes";
import SiteHeader from "../components/SiteHeader";
import ExampleQueryCards from "../components/ExampleQueryCards";
import VerificationResultCard from "../components/VerificationResultCard";
import StreamingText from "../components/StreamingText";
import LoginCreditsGate from "../components/LoginCreditsGate";
import {
  GUEST_FREE_GENERATIONS,
  guestCreditsRemaining,
  incrementGuestUsage,
  isGuestLimitReached,
  readGuestUsage,
} from "../../lib/guestCredits";

interface TempHistoryItem {
  id: string;
  query: string;
  result: any;
  createdAt: string;
}

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text?: string;
  previewUrl?: string | null;
  audioLabel?: string | null;
  result?: any | null;
  streamingText?: string;
  phase?: string | null;
  loading?: boolean;
  error?: string | null;
  isSaved?: boolean;
  saveError?: string | null;
  viewMode?: "consensus" | "alternative";
};

const PHASE_LABELS: Record<string, string> = {
  planning: "Planning investigation…",
  searching: "Gathering trusted sources…",
  synthesizing: "Synthesizing audit…",
  complete: "Complete",
};

function buildFollowUpContext(messages: ChatMessage[]): string {
  const pairs: string[] = [];
  for (let i = 0; i < messages.length; i++) {
    const m = messages[i];
    if (m.role === "user") {
      const next = messages[i + 1];
      const q = (m.text || "").trim();
      const a =
        next?.role === "assistant"
          ? (next.result?.summary || next.streamingText || "").trim()
          : "";
      if (q) {
        pairs.push(`User: ${q}${a ? `\nTruthLens: ${a.slice(0, 400)}` : ""}`);
      }
    }
  }
  return pairs.slice(-4).join("\n\n").slice(0, 1800);
}

export default function TruthLensDashboard() {
  const { data: session } = useSession();
  const { theme } = useTheme();
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [tempHistory, setTempHistory] = useState<TempHistoryItem[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [attachmentKind, setAttachmentKind] = useState<"image" | "audio" | null>(
    null,
  );
  const [language, setLanguage] = useState("English");
  const [showCreditsGate, setShowCreditsGate] = useState(false);
  const [guestRemaining, setGuestRemaining] = useState(GUEST_FREE_GENERATIONS);
  const [listening, setListening] = useState(false);
  const [recording, setRecording] = useState(false);
  const threadRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("fairgpt_temp_history");
      if (saved) setTempHistory(JSON.parse(saved));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!session) {
      setGuestRemaining(guestCreditsRemaining());
      if (isGuestLimitReached()) setShowCreditsGate(true);
    } else {
      setShowCreditsGate(false);
    }
  }, [session]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!threadRef.current) return;
    threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [messages, loading]);

  const updateMessage = useCallback(
    (id: string, patch: Partial<ChatMessage>) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ...patch } : m)),
      );
    },
    [],
  );

  const resetThread = () => {
    abortRef.current?.abort();
    stopListening();
    stopRecording(false);
    setMessages([]);
    setQuery("");
    setError(null);
    setLoading(false);
    setSelectedFile(null);
    setAttachmentKind(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const handleFileSelection = (file: File) => {
    if (!file) return;
    const imageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    const audioTypes = [
      "audio/mpeg",
      "audio/mp3",
      "audio/mp4",
      "audio/m4a",
      "audio/wav",
      "audio/x-wav",
      "audio/webm",
      "audio/ogg",
      "audio/flac",
      "video/webm",
    ];
    const isImage = imageTypes.includes(file.type);
    const isAudio =
      audioTypes.includes(file.type) ||
      /\.(mp3|wav|m4a|ogg|flac|webm)$/i.test(file.name);

    if (!isImage && !isAudio) {
      setError(
        "Please upload an image (JPEG/PNG/WebP/GIF) or audio (MP3/WAV/M4A/WEBM).",
      );
      return;
    }
    if (isImage && file.size > 5 * 1024 * 1024) {
      setError("Image must be 5MB or smaller.");
      return;
    }
    if (isAudio && file.size > 10 * 1024 * 1024) {
      setError("Audio must be 10MB or smaller.");
      return;
    }
    setError(null);
    setSelectedFile(file);
    setAttachmentKind(isImage ? "image" : "audio");
    if (isImage) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const stopListening = () => {
    try {
      recognitionRef.current?.stop?.();
    } catch {
      /* ignore */
    }
    recognitionRef.current = null;
    setListening(false);
  };

  const toggleListening = () => {
    if (listening) {
      stopListening();
      return;
    }
    const SpeechRecognition =
      typeof window !== "undefined"
        ? (window as any).SpeechRecognition ||
          (window as any).webkitSpeechRecognition
        : null;
    if (!SpeechRecognition) {
      setError(
        "Voice dictation is not supported in this browser. Try Chrome, or upload an audio file.",
      );
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = language === "Hindi" ? "hi-IN" : "en-IN";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      if (transcript.trim()) {
        setQuery((prev) =>
          prev ? `${prev.trim()} ${transcript.trim()}` : transcript.trim(),
        );
      }
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  };

  const stopRecording = (keepBlob: boolean) => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      try {
        if (!keepBlob) {
          recorder.ondataavailable = null;
        }
        recorder.stop();
      } catch {
        /* ignore */
      }
    }
    mediaRecorderRef.current = null;
    setRecording(false);
  };

  const toggleRecording = async () => {
    if (recording) {
      stopRecording(true);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";
      const recorder = new MediaRecorder(stream, { mimeType: mime });
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: mime });
        if (blob.size < 500) {
          setError("Recording was too short. Hold a moment longer and try again.");
          return;
        }
        const file = new File([blob], `recording-${Date.now()}.webm`, {
          type: mime,
        });
        handleFileSelection(file);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
      setError(null);
    } catch {
      setError("Microphone permission is required to record audio.");
    }
  };

  const ensureGuestAllowance = () => {
    if (session?.user) return true;
    if (isGuestLimitReached() || readGuestUsage() >= GUEST_FREE_GENERATIONS) {
      setShowCreditsGate(true);
      return false;
    }
    return true;
  };

  const markGuestCreditUsed = () => {
    if (session?.user) return;
    const next = incrementGuestUsage();
    setGuestRemaining(Math.max(0, GUEST_FREE_GENERATIONS - next));
    if (next >= GUEST_FREE_GENERATIONS) setShowCreditsGate(true);
  };

  const exportMessageCard = async (cardId: string) => {
    const element = document.getElementById(cardId);
    if (!element) return;
    try {
      const dataUrl = await toPng(element, {
        cacheBust: true,
        backgroundColor: theme === "dark" ? "#111318" : "#f7f6f2",
        style: { padding: "20px", borderRadius: "40px" },
      });
      const link = document.createElement("a");
      link.download = `TruthLens-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
      setError("Could not export the result card. Please try again.");
    }
  };

  const saveToHistory = async (
    messageId: string,
    searchQuery: string,
    searchResult: any,
  ) => {
    updateMessage(messageId, { saveError: null });
    if (session?.user) {
      try {
        const res = await fetch("/api/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: searchQuery, result: searchResult }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.saved) {
          updateMessage(messageId, { isSaved: true });
          return;
        }
        updateMessage(messageId, {
          saveError: data.error || "Could not save to history.",
        });
      } catch {
        updateMessage(messageId, {
          saveError: "Could not save to history. Please try again.",
        });
      }
      return;
    }

    try {
      const tempItem: TempHistoryItem = {
        id: `temp_${Date.now()}`,
        query: searchQuery,
        result: searchResult,
        createdAt: new Date().toISOString(),
      };
      const updated = [tempItem, ...tempHistory].slice(0, 20);
      setTempHistory(updated);
      localStorage.setItem("fairgpt_temp_history", JSON.stringify(updated));
      updateMessage(messageId, { isSaved: true });
    } catch {
      updateMessage(messageId, {
        saveError: "Could not save locally. Browser storage may be full.",
      });
    }
  };

  const consumeSearchStream = async (
    assistantId: string,
    q: string,
    context: string,
  ) => {
    const controller = new AbortController();
    abortRef.current = controller;

    const res = await fetch("/api/verify/search/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: q, language, context }),
      signal: controller.signal,
    });

    if (res.status === 402) {
      setShowCreditsGate(true);
      throw new Error(
        "Free guest credits are used up. Log in or sign up to continue verifying claims.",
      );
    }

    if (!res.ok || !res.body) {
      const fallback = await res.json().catch(() => null);
      if (fallback?.code === "GUEST_LIMIT") {
        setShowCreditsGate(true);
      }
      throw new Error(
        fallback?.summary ||
          fallback?.detail ||
          "Verification stream failed. Please try again.",
      );
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let streamed = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n\n");
      buffer = parts.pop() || "";

      for (const part of parts) {
        const line = part
          .split("\n")
          .find((l) => l.startsWith("data: "));
        if (!line) continue;
        let evt: any;
        try {
          evt = JSON.parse(line.slice(6));
        } catch {
          continue;
        }

        if (evt.event === "phase") {
          updateMessage(assistantId, {
            phase: evt.phase,
            loading: true,
          });
        } else if (evt.event === "token" && typeof evt.text === "string") {
          streamed += evt.text;
          // Prefer showing SUMMARY region as it arrives
          const summaryMatch = streamed.match(
            /\[SUMMARY\]([\s\S]*?)(?=\[[A-Z_]+\]|$)/i,
          );
          const display = summaryMatch
            ? summaryMatch[1].trim()
            : streamed.slice(-800);
          updateMessage(assistantId, {
            streamingText: display,
            phase: "synthesizing",
            loading: true,
          });
        } else if (evt.event === "result") {
          const data = evt.data;
          if (!data || data.status === "FAIL") {
            if (data?.code === "GUEST_LIMIT") setShowCreditsGate(true);
            updateMessage(assistantId, {
              loading: false,
              phase: null,
              streamingText: "",
              error: data?.summary || "Verification failed. Please try again.",
              result: null,
            });
            setError(data?.summary || "Verification failed. Please try again.");
            return;
          }
          markGuestCreditUsed();
          updateMessage(assistantId, {
            loading: false,
            phase: "complete",
            streamingText: "",
            result: data,
            error: null,
            viewMode: "consensus",
            isSaved: false,
          });
        }
      }
    }
  };

  const verifyMediaFile = async (
    assistantId: string,
    file: File,
    userText: string,
    kind: "image" | "audio",
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    if (userText) formData.append("query", userText);
    formData.append("language", language);

    updateMessage(assistantId, {
      loading: true,
      phase: kind === "audio" ? "planning" : "planning",
      streamingText: "",
    });

    const endpoint =
      kind === "audio" ? "/api/verify/audio" : "/api/verify/media";
    const res = await fetch(endpoint, {
      method: "POST",
      body: formData,
      signal: AbortSignal.timeout(120000),
    });
    const data = await res.json().catch(() => null);

    if (res.status === 402 || data?.code === "GUEST_LIMIT") {
      setShowCreditsGate(true);
      throw new Error(
        data?.summary ||
          "Free guest credits are used up. Log in or sign up to continue.",
      );
    }
    if (res.status === 429) {
      throw new Error("Rate limit reached. Please wait a minute and try again.");
    }
    if (!res.ok && (!data || typeof data !== "object")) {
      throw new Error(
        typeof data?.detail === "string"
          ? data.detail
          : kind === "audio"
            ? "Audio verification failed. Please try again."
            : "Media verification failed. Please try again.",
      );
    }
    if (!data || data.status === "FAIL") {
      throw new Error(
        data?.summary ||
          (kind === "audio"
            ? "Audio verification failed."
            : "Media verification failed."),
      );
    }

    markGuestCreditUsed();
    updateMessage(assistantId, {
      loading: false,
      phase: "complete",
      result: data,
      text: data.extractedQuery || userText,
      streamingText: "",
      viewMode: "consensus",
      isSaved: false,
    });
  };

  const handleSearch = async (forcedQuery?: string) => {
    const q = (forcedQuery ?? query).trim();
    if (!q && !selectedFile) return;
    if (loading) return;

    if (!ensureGuestAllowance()) return;

    setError(null);
    setLoading(true);
    stopListening();

    const userId = `u_${Date.now()}`;
    const assistantId = `a_${Date.now()}`;
    const userPreview = previewUrl;
    const file = selectedFile;
    const kind = attachmentKind;
    const context = buildFollowUpContext(messages);

    setMessages((prev) => [
      ...prev,
      {
        id: userId,
        role: "user",
        text:
          q ||
          (kind === "audio"
            ? "Verify attached audio"
            : file
              ? "Verify attached image"
              : ""),
        previewUrl: userPreview,
        audioLabel: kind === "audio" ? file?.name || "Audio clip" : null,
      },
      {
        id: assistantId,
        role: "assistant",
        loading: true,
        phase: "planning",
        streamingText: "",
        viewMode: "consensus",
      },
    ]);

    setQuery("");
    setSelectedFile(null);
    setAttachmentKind(null);
    setPreviewUrl(null);

    try {
      if (file && kind === "audio") {
        await verifyMediaFile(assistantId, file, q, "audio");
      } else if (file) {
        await verifyMediaFile(assistantId, file, q, "image");
      } else {
        await consumeSearchStream(assistantId, q, context);
      }
    } catch (e: any) {
      if (e?.name === "AbortError") return;
      const msg =
        e?.name === "TimeoutError"
          ? "Verification timed out. Please try again."
          : e?.message || "Could not reach the verification service.";
      setError(msg);
      updateMessage(assistantId, {
        loading: false,
        phase: null,
        error: msg,
        result: null,
      });
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };

  const handlePaste = async (event: React.ClipboardEvent) => {
    const items = event.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) handleFileSelection(file);
      }
    }
  };

  if (!mounted) {
    return (
      <main className="min-h-screen bg-[var(--bg-base)]">
        <div className="max-w-3xl mx-auto px-6 pt-28 space-y-4 animate-pulse">
          <div className="h-10 w-48 rounded-xl bg-[var(--bg-elevated)]" />
          <div className="h-6 w-72 rounded-lg bg-[var(--bg-elevated)]" />
        </div>
      </main>
    );
  }

  const hasThread = messages.length > 0;

  return (
    <main className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] flex flex-col">
      <SiteHeader onBrandClick={resetThread} />
      <LoginCreditsGate
        open={showCreditsGate && !session?.user}
        onClose={() => setShowCreditsGate(false)}
      />

      <div
        ref={threadRef}
        className={`flex-1 overflow-y-auto px-3 sm:px-6 ${
          hasThread ? "pt-24 pb-44" : "pt-28 pb-40 flex flex-col"
        }`}
      >
        {!hasThread && (
          <header className="text-center mb-6 tl-fade-in max-w-3xl mx-auto w-full">
            <p
              className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Verification workspace
            </p>
            <h1 className="text-lg sm:text-xl font-semibold mb-3 text-[var(--text-secondary)]">
              Ask a claim, attach a screenshot or audio, then follow up in-thread
            </h1>
            <p className="text-[var(--text-muted)] mb-4 max-w-lg mx-auto text-sm">
              Streaming audits keep prior replies scrollable so you can counter-ask
              without losing context.
            </p>
            {!session?.user && (
              <p className="text-[var(--text-muted)] text-sm mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent-blue-dim)] text-[var(--accent-blue)] text-xs font-bold mr-2">
                  {guestRemaining} / {GUEST_FREE_GENERATIONS} free credits
                </span>
                <Link
                  href="/signup?next=/dashboard"
                  className="text-[var(--accent-blue)] hover:underline font-medium"
                >
                  Sign up
                </Link>{" "}
                for unlimited credits &amp; synced history.
              </p>
            )}
            <ExampleQueryCards
              onSelect={(q) => {
                if (!ensureGuestAllowance()) return;
                setQuery(q);
                void handleSearch(q);
              }}
            />
          </header>
        )}

        {error && (
          <div
            role="alert"
            className="w-full max-w-3xl mx-auto mb-6 flex items-start gap-3 rounded-2xl border border-[var(--fake-border)] bg-[var(--fake-bg)] px-4 py-3 text-sm text-[var(--fake)]"
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-medium">{error}</p>
              <button
                type="button"
                className="mt-2 text-xs font-semibold underline"
                onClick={() => setError(null)}
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <div className="w-full max-w-4xl mx-auto flex flex-col gap-10">
          {messages.map((msg) =>
            msg.role === "user" ? (
              <div key={msg.id} className="flex gap-4 tl-fade-in">
                <div className="w-10 h-10 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center shrink-0 shadow-sm">
                  <User size={20} className="text-[var(--text-muted)]" />
                </div>
                <div className="flex flex-col max-w-[85%] pt-1">
                  <span className="font-bold text-sm text-[var(--text-secondary)] mb-2">
                    You
                  </span>
                  <div className="space-y-3">
                    {msg.previewUrl && (
                      <img
                        src={msg.previewUrl}
                        alt="Uploaded media"
                        className="max-w-xs md:max-w-md rounded-2xl border border-[var(--border-dim)] shadow-md object-contain"
                      />
                    )}
                    {msg.audioLabel && (
                      <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--border-dim)] bg-[var(--bg-elevated)] text-sm text-[var(--text-secondary)]">
                        <AudioLines size={16} className="text-[var(--accent-blue)]" />
                        {msg.audioLabel}
                      </div>
                    )}
                    {msg.text && (
                      <p className="text-[var(--text-primary)] text-lg leading-relaxed whitespace-pre-wrap">
                        {msg.text}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div key={msg.id} className="flex gap-4 tl-fade-in">
                <div className="w-10 h-10 rounded-full bg-[var(--accent-blue)] flex items-center justify-center shrink-0 shadow-md">
                  <ShieldCheck size={20} className="text-white" />
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <span className="font-bold text-sm text-[var(--accent-blue)] mb-3 block">
                    TruthLens
                    {msg.phase && msg.loading && (
                      <span className="ml-2 font-medium text-[var(--text-muted)]">
                        · {PHASE_LABELS[msg.phase] || msg.phase}
                      </span>
                    )}
                  </span>

                  {msg.error && (
                    <p className="text-sm text-[var(--fake)] mb-3">{msg.error}</p>
                  )}

                  {msg.loading && !msg.streamingText && (
                    <div className="flex items-center gap-3 text-[var(--text-secondary)] font-medium bg-[var(--bg-elevated)] w-fit px-5 py-3 rounded-2xl border border-[var(--border-dim)] mb-4">
                      <div className="w-4 h-4 border-2 border-[var(--accent-blue)] border-t-transparent rounded-full animate-spin" />
                      {PHASE_LABELS[msg.phase || ""] || "Auditing trusted sources…"}
                    </div>
                  )}

                  {msg.loading && !!msg.streamingText && (
                    <div className="mb-4 rounded-2xl border border-[var(--border-dim)] bg-[var(--bg-elevated)] p-5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">
                        Live synthesis
                      </p>
                      <StreamingText
                        text={msg.streamingText}
                        active
                        className="text-base leading-relaxed text-[var(--text-primary)]"
                      />
                    </div>
                  )}

                  {msg.result && (
                    <>
                      {(msg.result.extractedText || msg.result.primaryClaim) && (
                        <div className="mb-4 rounded-2xl border border-[var(--border-dim)] bg-[var(--bg-surface)] p-4 text-sm text-[var(--text-secondary)]">
                          {msg.result.primaryClaim && (
                            <p className="mb-1">
                              <span className="font-bold text-[var(--text-muted)] text-[10px] uppercase tracking-widest mr-2">
                                Claim
                              </span>
                              {msg.result.primaryClaim}
                            </p>
                          )}
                          {msg.result.extractedText && (
                            <p className="whitespace-pre-wrap opacity-90">
                              <span className="font-bold text-[var(--text-muted)] text-[10px] uppercase tracking-widest mr-2">
                                {msg.result.inputType === "audio" ? "Transcript" : "OCR"}
                              </span>
                              {msg.result.extractedText.slice(0, 600)}
                              {msg.result.extractedText.length > 600 ? "…" : ""}
                            </p>
                          )}
                        </div>
                      )}
                      <VerificationResultCard
                      result={msg.result}
                      viewMode={msg.viewMode || "consensus"}
                      onViewModeChange={(mode) =>
                        updateMessage(msg.id, { viewMode: mode })
                      }
                      isSaved={msg.isSaved}
                      saveError={msg.saveError}
                      cardId={`truth-card-${msg.id}`}
                      onExport={() => exportMessageCard(`truth-card-${msg.id}`)}
                      onSave={() =>
                        saveToHistory(
                          msg.id,
                          msg.result?.extractedQuery ||
                            messages.find(
                              (m, idx, arr) =>
                                arr[idx + 1]?.id === msg.id && m.role === "user",
                            )?.text ||
                            "Search Result",
                          msg.result,
                        )
                      }
                    />
                    </>
                  )}
                </div>
              </div>
            ),
          )}
        </div>
      </div>

      <div className="fixed bottom-0 inset-x-0 p-2 sm:p-6 z-50 bg-gradient-to-t from-[var(--bg-base)] via-[var(--bg-base)] to-transparent pt-10">
        <div className="max-w-3xl mx-auto relative">
          {!session?.user && (
            <div className="mb-2 flex justify-end">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-dim)] text-[var(--text-muted)]">
                {guestRemaining} free credit{guestRemaining === 1 ? "" : "s"} left
              </span>
            </div>
          )}
          {previewUrl && (
            <div className="absolute -top-20 sm:-top-24 left-2 sm:left-4 tl-fade-in">
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-2xl border-2 border-[var(--bg-elevated)] shadow-xl"
                />
                <button
                  type="button"
                  aria-label="Remove attached image"
                  onClick={() => {
                    setPreviewUrl(null);
                    setSelectedFile(null);
                    setAttachmentKind(null);
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          )}
          {selectedFile && attachmentKind === "audio" && !previewUrl && (
            <div className="absolute -top-14 left-2 sm:left-4 tl-fade-in">
              <div className="relative inline-flex items-center gap-2 px-3 py-2 rounded-2xl border border-[var(--border-dim)] bg-[var(--bg-elevated)] shadow-md text-xs font-semibold text-[var(--text-secondary)]">
                <AudioLines size={14} className="text-[var(--accent-blue)]" />
                {selectedFile.name}
                <button
                  type="button"
                  aria-label="Remove audio"
                  onClick={() => {
                    setSelectedFile(null);
                    setAttachmentKind(null);
                  }}
                  className="ml-1 text-red-500"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          )}

          <div className="relative flex flex-col sm:flex-row items-center bg-[var(--bg-elevated)] rounded-[20px] sm:rounded-[28px] border border-[var(--border-mid)] p-2 shadow-[var(--shadow-card)] focus-within:ring-2 focus-within:ring-[var(--accent-blue-glow)] gap-2 sm:gap-0">
            <div className="flex items-center w-full flex-1">
              <label className="ml-1 p-2 cursor-pointer hover:bg-[var(--bg-surface)] rounded-full group transition-all shrink-0" title="Attach image">
                <Paperclip
                  size={18}
                  className="text-[var(--text-muted)] group-hover:text-[var(--accent-blue)]"
                />
                <span className="sr-only">Attach image</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileSelection(f);
                  }}
                />
              </label>
              <label className="p-2 cursor-pointer hover:bg-[var(--bg-surface)] rounded-full group transition-all shrink-0" title="Attach audio">
                <AudioLines
                  size={18}
                  className="text-[var(--text-muted)] group-hover:text-[var(--accent-blue)]"
                />
                <span className="sr-only">Attach audio</span>
                <input
                  type="file"
                  className="hidden"
                  accept="audio/*,.mp3,.wav,.m4a,.ogg,.flac,.webm"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileSelection(f);
                  }}
                />
              </label>
              <button
                type="button"
                aria-label={listening ? "Stop dictation" : "Dictate claim"}
                onClick={toggleListening}
                disabled={loading}
                className={`p-2 rounded-full transition-all shrink-0 ${
                  listening
                    ? "bg-red-500/15 text-red-500"
                    : "hover:bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--accent-blue)]"
                }`}
                title="Dictate with microphone"
              >
                {listening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
              <button
                type="button"
                aria-label={recording ? "Stop recording" : "Record audio clip"}
                onClick={() => void toggleRecording()}
                disabled={loading}
                className={`p-2 rounded-full transition-all shrink-0 mr-1 ${
                  recording
                    ? "bg-red-500 text-white animate-pulse"
                    : "hover:bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--accent-blue)]"
                }`}
                title="Record audio to verify"
              >
                <span className="relative flex h-3.5 w-3.5 items-center justify-center">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      recording ? "bg-white" : "bg-current"
                    }`}
                  />
                </span>
              </button>
              <Search
                className="hidden sm:block ml-1 text-[var(--text-muted)] shrink-0"
                size={20}
                aria-hidden
              />
              <input
                type="text"
                aria-label="Claim to verify"
                className="flex-1 w-full p-2 sm:p-3 ml-1 sm:ml-2 outline-none text-[14px] sm:text-[15px] bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-muted)] min-w-0"
                placeholder={
                  selectedFile
                    ? attachmentKind === "audio"
                      ? "Add context for the audio (optional)…"
                      : "Add text context (optional)…"
                    : listening
                      ? "Listening…"
                      : hasThread
                        ? "Ask a follow-up or verify another claim…"
                        : "Enter a claim, speak, or attach media…"
                }
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && void handleSearch()}
                onPaste={handlePaste}
                maxLength={500}
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-[var(--border-dim)] pt-2 sm:pt-0 sm:pl-2 px-1 sm:px-0">
              <label htmlFor="language-select" className="sr-only">
                Response language
              </label>
              <select
                id="language-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="appearance-none bg-transparent py-1.5 sm:py-2 pl-2 sm:pl-3 pr-6 text-xs sm:text-sm font-semibold text-[var(--text-secondary)] outline-none cursor-pointer mr-2"
              >
                <option value="English">English</option>
                <option value="Hindi">हिंदी</option>
                <option value="Tamil">தமிழ்</option>
                <option value="Telugu">తెలుగు</option>
                <option value="Bengali">বাংলা</option>
                <option value="Marathi">मराठी</option>
                <option value="Gujarati">ગુજરાતી</option>
              </select>

              <button
                type="button"
                onClick={() => void handleSearch()}
                disabled={loading || (!query.trim() && !selectedFile)}
                className="bg-[var(--accent-blue)] hover:opacity-90 text-white px-5 py-2 sm:px-8 sm:py-3.5 rounded-[12px] sm:rounded-[20px] font-bold text-xs sm:text-sm transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center min-w-[80px] sm:min-w-[100px]"
              >
                {loading ? (
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Verify"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
