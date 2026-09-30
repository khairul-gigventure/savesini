import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export interface ToastState {
  show: boolean;
  message: string;
  type?: 'success' | 'info' | 'error';
}

interface ToastProps {
  toast: ToastState;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3200);
      return () => clearTimeout(timer);
    }
  }, [toast.show, onClose]);

  if (!toast.show) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-900 text-zinc-100 shadow-xl transition-all duration-300 transform translate-y-0 opacity-100 max-w-md border border-zinc-800 font-['Inter']"
    >
      {toast.type === 'error' ? (
        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
      ) : toast.type === 'info' ? (
        <Info className="w-4 h-4 text-zinc-300 shrink-0" />
      ) : (
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
      )}
      <span className="text-xs font-medium leading-snug">{toast.message}</span>
    </div>
  );
};
