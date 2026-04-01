"use client";

import { useState, useCallback, createContext, useContext, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertTriangle, Info } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => removeToast(id), 5000);
  }, [removeToast]);

  const value = {
    success: (title: string, message?: string) => addToast("success", title, message),
    error: (title: string, message?: string) => addToast("error", title, message),
    warning: (title: string, message?: string) => addToast("warning", title, message),
    info: (title: string, message?: string) => addToast("info", title, message),
  };

  const icons = {
    success: <CheckCircle size={20} color="#10b981" />,
    error: <AlertTriangle size={20} color="#ef4444" />,
    warning: <AlertTriangle size={20} color="#f59e0b" />,
    info: <Info size={20} color="#3b82f6" />,
  };

  const backgrounds = {
    success: "rgba(16, 185, 129, 0.1)",
    error: "rgba(239, 68, 68, 0.1)",
    warning: "rgba(245, 158, 11, 0.1)",
    info: "rgba(59, 130, 246, 0.1)",
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div style={{ position: "fixed", top: "1rem", right: "1rem", zIndex: 9999, display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: "400px" }}>
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              style={{ background: backgrounds[toast.type], border: `1px solid var(--border)`, borderRadius: "0.75rem", padding: "1rem", display: "flex", alignItems: "flex-start", gap: "0.75rem" }}
            >
              {icons[toast.type]}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{toast.title}</div>
                {toast.message && <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>{toast.message}</div>}
              </div>
              <button onClick={() => removeToast(toast.id)} style={{ background: "transparent", border: "none", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}
