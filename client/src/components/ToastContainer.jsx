import React from 'react';
import { CheckCircle2, AlertCircle, Info, X, RotateCcw } from 'lucide-react';
import { useUIStore } from '../store/uiStore';

export const ToastContainer = () => {
  const { toasts, removeToast } = useUIStore();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none select-none">
      {toasts.map((toast) => {
        const isError = toast.type === 'error';
        const isInfo = toast.type === 'info';

        return (
          <div
            key={toast.id}
            className="pointer-events-auto bg-surface border border-border rounded-lg shadow-card p-3.5 flex items-start gap-3 transition-all animate-in fade-in slide-in-from-bottom-2 duration-200"
          >
            <div className="shrink-0 mt-0.5">
              {isError ? (
                <AlertCircle className="w-4 h-4 text-rose-600" />
              ) : isInfo ? (
                <Info className="w-4 h-4 text-blue-600" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              {toast.title && (
                <h4 className="text-xs font-semibold text-slate-900 leading-tight">
                  {toast.title}
                </h4>
              )}
              <p className="text-xs text-slate-600 mt-0.5 leading-snug">
                {toast.message}
              </p>

              {/* Undo action button (e.g. for archive) */}
              {toast.onUndo && (
                <button
                  onClick={() => {
                    toast.onUndo();
                    removeToast(toast.id);
                  }}
                  className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-accent hover:underline"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Undo</span>
                </button>
              )}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
