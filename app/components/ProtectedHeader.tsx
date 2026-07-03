'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearAuth, getAuth, AuthSession } from "@/lib/auth";

export default function ProtectedHeader() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const router = useRouter();

  useEffect(() => {
    setSession(getAuth() ?? null);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore logout errors
    }
    clearAuth();
    router.push("/login");
  };

  return (
    <header className="protected-header">
      <div className="protected-header-left">
        <span className="protected-badge">Logged in as</span>
        <strong>{session?.label ?? "User"}</strong>
      </div>
      <button type="button" className="secondary-button" onClick={handleLogout}>
        Logout
      </button>
      <style jsx>{`
        .protected-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          padding: 18px 24px;
          margin-bottom: 20px;
          border-radius: 24px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
        }
        .protected-header-left { display: flex; flex-direction: column; gap: 4px; }
        .protected-badge { color: #475569; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.08em; }
      `}</style>
    </header>
  );
}
