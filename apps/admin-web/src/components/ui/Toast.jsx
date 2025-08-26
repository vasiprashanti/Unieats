import React, { createContext, useContext, useMemo, useRef, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]); // { id, type, title, message }
  const idRef = useRef(1);

  const remove = (id) => setToasts((t) => t.filter((x) => x.id !== id));

  const push = ({ type = 'info', title, message, duration = 2500 } = {}) => {
    const id = idRef.current++;
    setToasts((t) => [...t, { id, type, title, message }]);
    if (duration) setTimeout(() => remove(id), duration);
    return id;
  };

  const value = useMemo(() => ({ push, remove }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast viewport */}
      <div className="fixed top-4 right-4 z-[100] space-y-2">
        {toasts.map((t) => (
          <div key={t.id} className={`min-w-[240px] max-w-[360px] rounded border border-base p-3 shadow bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))]`}> 
            <div className="flex items-start justify-between gap-3">
              <div>
                {t.title && <div className="text-sm font-semibold mb-0.5">{t.title}</div>}
                {t.message && <div className="text-sm text-muted">{t.message}</div>}
              </div>
              <button className="text-xs text-muted hover:underline" onClick={() => remove(t.id)}>Close</button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}