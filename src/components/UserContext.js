'use client';

import { createContext, useContext, useState, useCallback } from 'react';

const UserContext = createContext(null);

export function UserProvider({ initialUser, children }) {
  const [user, setUser] = useState(initialUser || null);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user || null);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, []);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, refreshUser, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser باید داخل UserProvider استفاده شود');
  return ctx;
}
