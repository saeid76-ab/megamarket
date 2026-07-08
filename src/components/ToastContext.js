'use client';

import { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({ message: '', type: 'info', show: false });
  const timerRef = useRef(null);

  const showToast = useCallback((message, type = 'info') => {
    clearTimeout(timerRef.current);
    setToast({ message, type, show: true });
    timerRef.current = setTimeout(() => {
      setToast((t) => ({ ...t, show: false }));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className={`toast ${toast.show ? 'show' : ''} ${toast.type}`}>{toast.message}</div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast باید داخل ToastProvider استفاده شود');
  return ctx;
}
