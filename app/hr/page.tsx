'use client';

import AuthGuard from "@/app/components/AuthGuard";
import ProtectedHeader from "@/app/components/ProtectedHeader";
import Link from "next/link";

export default function HRPortal() {
  return (
    <AuthGuard requiredRole="hr">
      <main className="app-shell">
        <div className="page-inner">
          <ProtectedHeader />
        <section className="hero-card">
          <p className="eyebrow">HR Portal</p>
          <h1>Hire faster, track candidates, and manage your team</h1>
          <p className="hero-copy">
            The HR portal gives recruiters a centralized place to post jobs, review applications, and manage talent pipelines.
          </p>

          <div className="dashboard-grid">
            <article className="preview-block">
              <strong>Post new roles</strong>
              <p>Create job postings with detailed descriptions, locations, skills, and interview notes.</p>
            </article>
            <article className="preview-block">
              <strong>Application review</strong>
              <p>Track candidate status, shortlist top applicants, and leave feedback for every submission.</p>
            </article>
            <article className="preview-block">
              <strong>Team workflow</strong>
              <p>Collaborate with hiring managers, assign tasks, and approve offers from one dashboard.</p>
            </article>
            <article className="preview-block">
              <strong>Reporting</strong>
              <p>See open positions, interview pipeline, and hiring velocity at a glance.</p>
            </article>
          </div>

          <div className="dashboard-actions">
            <Link href="/" className="secondary-button">
              Back to Home
            </Link>
            <Link href="/search" className="primary-button">
              Go to Job Search Panel
            </Link>
          </div>
        </section>
      </div>
      <style jsx global>{`
        .dashboard-grid { display: grid; gap: 18px; grid-template-columns: repeat(2, minmax(0, 1fr)); margin-top: 24px; }
        .dashboard-actions { display: flex; flex-wrap: wrap; gap: 14px; margin-top: 28px; }
        @media (max-width: 780px) { .dashboard-grid { grid-template-columns: 1fr; } }
      `}</style>
    </main>
  </AuthGuard>
  );
}
