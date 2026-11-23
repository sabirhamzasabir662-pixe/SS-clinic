import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X, RotateCcw } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = useCallback(({ message, type = 'success', actionText, onAction, duration = 6500 }) => {
    setToast({
      id: Date.now(),
      message,
      type,
      actionText,
      onAction,
      duration
    });

    if (duration > 0) {
      setTimeout(() => {
        setToast((current) => (current?.message === message ? null : current));
      }, duration);
    }
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slideUp max-w-sm w-full select-none">
          <div className="bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-800 p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {toast.type === 'success' && (
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
                </div>
              )}
              {toast.type === 'error' && (
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5 stroke-[2.2]" />
                </div>
              )}
              {toast.type === 'info' && (
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <Info className="w-5 h-5 stroke-[2.2]" />
                </div>
              )}
              <div className="text-sm font-medium text-slate-100 truncate">
                {toast.message}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {toast.actionText && toast.onAction && (
                <button
                  onClick={async () => {
                    const action = toast.onAction;
                    hideToast();
                    if (action) await action();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{toast.actionText}</span>
                </button>
              )}
              <button
                onClick={hideToast}
                className="text-slate-400 hover:text-white p-1 transition"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
