'use client';

import AuthGuard from "@/app/components/AuthGuard";
import ProtectedHeader from "@/app/components/ProtectedHeader";
import Link from "next/link";

export default function CandidateProfile() {
  return (
    <AuthGuard>
      <main className="app-shell">
        <div className="page-inner">
          <ProtectedHeader />
        <section className="hero-card">
          <p className="eyebrow">Candidate Profile</p>
          <h1>Your profile dashboard</h1>
          <p className="hero-copy">
            Manage your resume, track applications, and upgrade to premium fast-track from one profile page.
          </p>

          <div className="profile-grid">
            <article className="preview-block">
              <strong>Profile summary</strong>
              <p>Name: Aisha Sharma</p>
              <p>Email: aisha.sharma@example.com</p>
              <p>Role: Job Seeker</p>
            </article>
            <article className="preview-block">
              <strong>Resume upload</strong>
              <p>Resume: latest_cv.pdf</p>
              <p>Status: Uploaded and ready to apply</p>
            </article>
            <article className="preview-block">
              <strong>Application tracking</strong>
              <p>Senior Product Designer — Pending review</p>
              <p>HR Business Partner — Interview scheduled</p>
            </article>
            <article className="preview-block">
              <strong>Premium fast-track</strong>
              <p>Upgrade your profile for priority resume review and faster replies.</p>
            </article>
          </div>

          <div className="dashboard-actions">
            <Link href="/search" className="secondary-button">
              Go to Job Search
            </Link>
            <Link href="/payment" className="primary-button">
              Premium payment info
            </Link>
          </div>
        </section>
      </div>
      <style jsx global>{`
        .profile-grid { display: grid; gap: 20px; grid-template-columns: repeat(2, minmax(0, 1fr)); margin-top: 24px; }
        .preview-block { background: #f8fafc; border-radius: 24px; padding: 20px; box-shadow: 0 18px 50px rgba(15,23,42,0.06); }
        .dashboard-actions { display: flex; flex-wrap: wrap; gap: 14px; margin-top: 28px; }
        @media (max-width: 800px) { .profile-grid { grid-template-columns: 1fr; } }
      `}</style>
      </main>
    </AuthGuard>
  );
}
