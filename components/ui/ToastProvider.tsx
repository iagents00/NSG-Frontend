"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import { CheckCircle, Bell, AlertCircle, X } from "lucide-react";
import clsx from "clsx";

type ToastType = "success" | "info" | "error";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto remove after 4 seconds (from your legacy code)
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Container (Fixed Position) */}
      <div id="toast-container" className="fixed bottom-6 right-6 z-[10000] flex flex-col gap-3 items-end pointer-events-none">
        {toasts.map((toast) => (
          <div 
            key={toast.id}
            className="toast pointer-events-auto bg-navy-950/95 text-white px-5 py-3.5 rounded-2xl shadow-sovereign border border-white/10 backdrop-blur-md flex items-center gap-3 animate-slide-up-toast min-w-[300px]"
          >
            {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400" />}
            {toast.type === 'info' && <Bell className="w-5 h-5 text-blue-400" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400" />}
            <span className="text-sm font-semibold flex-1">{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} className="text-slate-500 hover:text-white transition cursor-pointer">
                <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
};
