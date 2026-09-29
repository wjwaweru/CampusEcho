import React, { createContext, useContext, useState } from 'react';

export interface Toast {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  message: string;
}

interface NotificationContextType {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newToast: Toast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      {/* Toast Render Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => {
          let bg = 'bg-slate-900 text-white border-slate-700';
          let icon = 'ℹ️';

          if (t.type === 'success') {
            bg = 'bg-emerald-900/95 text-emerald-100 border-emerald-500/50 shadow-emerald-950/40';
            icon = '✓';
          } else if (t.type === 'warning') {
            bg = 'bg-amber-950/95 text-amber-100 border-amber-500/60 shadow-amber-950/40';
            icon = '⚠️';
          } else if (t.type === 'error') {
            bg = 'bg-rose-950/95 text-rose-100 border-rose-500/60 shadow-rose-950/40';
            icon = '✕';
          }

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-5 ${bg}`}
            >
              <div className="shrink-0 text-base font-bold select-none">{icon}</div>
              <div className="flex-1 min-w-0">
                {t.title && <div className="text-xs font-bold uppercase tracking-wider mb-0.5">{t.title}</div>}
                <div className="text-xs font-medium leading-relaxed opacity-95">{t.message}</div>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="shrink-0 text-xs opacity-60 hover:opacity-100 px-1"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
