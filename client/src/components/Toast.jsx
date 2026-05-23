import { createContext, useCallback, useContext, useState } from "react";
import { CheckIcon } from "./Icons";

const ToastContext = createContext(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}

let counter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((message) => {
    const id = ++counter;
    setToasts((t) => [...t, { id, message }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 2000);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="bg-white text-black text-sm font-medium px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2 toast-in"
          >
            <CheckIcon width={14} height={14} />
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
