'use client';

import AuthGuard from "@/app/components/AuthGuard";
import ProtectedHeader from "@/app/components/ProtectedHeader";
import Link from "next/link";

export default function AdminPanel() {
  return (
    <AuthGuard requiredRole="admin">
      <main className="app-shell">
        <div className="page-inner">
          <ProtectedHeader />
        <section className="hero-card">
          <p className="eyebrow">Admin Panel</p>
          <h1>Full website access for administrators</h1>
          <p className="hero-copy">
            Manage users, job postings, homepage content, and system settings from one secure place.
          </p>

          <div className="dashboard-grid">
            <article className="preview-block">
              <strong>Manage Users</strong>
              <p>View and approve new user registrations, assign roles, and control access permissions.</p>
            </article>
            <article className="preview-block">
              <strong>Manage Jobs</strong>
              <p>Edit, create, or remove job postings, set status, and review applications in real-time.</p>
            </article>
            <article className="preview-block">
              <strong>Homepage Content</strong>
              <p>Update banners, announcements, slide content, and marketing copy instantly.</p>
            </article>
            <article className="preview-block">
              <strong>System Settings</strong>
              <p>Configure sitewide preferences, branding, and feature toggles with one click.</p>
            </article>
          </div>

          <div className="dashboard-actions">
            <Link href="/dashboard?role=admin" className="secondary-button">
              Return to Admin Dashboard
            </Link>
            <Link href="/" className="primary-button">
              Back to Homepage
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
