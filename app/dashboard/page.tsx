'use client';

import { useEffect, useState } from "react";
import AuthGuard from "@/app/components/AuthGuard";
import ProtectedHeader from "@/app/components/ProtectedHeader";
import Link from "next/link";
import { getAuth, AuthSession } from "@/lib/auth";

export default function Dashboard() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    setSession(auth ?? null);
    setLoaded(true);
  }, []);

  if (!loaded) {
    return null;
  }

  const isCandidate = session?.role === "candidate";
  const isAdmin = session?.role === "admin";
  const roleLabel = isCandidate ? "Job Seeker" : isAdmin ? "Admin" : "User";

  return (
    <AuthGuard>
      <main className="app-shell">
        <div className="page-inner">
          <ProtectedHeader />
          <section className="hero-card">
            <p className="eyebrow">Dashboard</p>
            <h1>Welcome back, {roleLabel}!</h1>
            <p className="hero-copy">
              This is your post-login page. From here you can access your role-specific tools,
              review tasks, and explore new opportunities.
            </p>
            <div className="dashboard-grid">
              <article className="preview-block">
                <strong>Your quick actions</strong>
                <p>Review applicants, open job posts, and manage approvals in one place.</p>
              </article>
              <article className="preview-block">
                <strong>Recent updates</strong>
                <p>Stay on top of hiring activity, interview schedules, and candidate progress.</p>
              </article>
            </div>
            <div className="dashboard-actions">
              <Link href="/" className="secondary-button">
                Back to Home
              </Link>
              {isCandidate ? (
                <Link href="/candidate" className="primary-button">
                  Open Candidate Form
                </Link>
              ) : isAdmin ? (
                <Link href="/admin" className="primary-button">
                  Open Admin Panel
                </Link>
              ) : (
                <Link href="/" className="primary-button">
                  Back to Home
                </Link>
              )}
            </div>
          </section>
        </div>
      </main>
    </AuthGuard>
  );
}
