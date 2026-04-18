"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type Tone = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  tone: Tone;
}

interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const push = useCallback((message: string, tone: Tone) => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const api: ToastApi = {
    success: useCallback((m) => push(m, "success"), [push]),
    error: useCallback((m) => push(m, "error"), [push]),
    info: useCallback((m) => push(m, "info"), [push]),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport toasts={toasts} />
    </ToastContext.Provider>
  );
}

function ToastViewport({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}

function ToastItem({ toast }: { toast: Toast }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setVisible(true), 10);
    return () => window.clearTimeout(t);
  }, []);

  const toneColor =
    toast.tone === "success"
      ? "#4A7A3E"
      : toast.tone === "error"
      ? "#A6352C"
      : "#6B1F2B";
  const toneLabel =
    toast.tone === "success" ? "Listo" : toast.tone === "error" ? "Error" : "Aviso";

  return (
    <div
      className={`pointer-events-auto bg-surface border border-border-2 rounded-[8px] shadow-[0_10px_30px_rgba(33,25,20,0.15)] px-4 py-3 min-w-[260px] max-w-[380px] transition-all ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className="inline-block w-[7px] h-[7px] rounded-full mt-1.5 shrink-0"
          style={{ background: toneColor }}
        />
        <div className="flex-1 min-w-0">
          <div
            className="mono text-[9px] uppercase tracking-[0.2em] mb-0.5"
            style={{ color: toneColor }}
          >
            {toneLabel}
          </div>
          <div className="text-[13px] text-text-soft leading-snug break-words">
            {toast.message}
          </div>
        </div>
      </div>
    </div>
  );
}
