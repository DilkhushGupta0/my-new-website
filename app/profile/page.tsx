'use client';

import { useEffect, useState } from "react";
import AuthGuard from "@/app/components/AuthGuard";
import ProtectedHeader from "@/app/components/ProtectedHeader";
import Link from "next/link";
import { getCandidateProfile, type CandidateProfile } from "@/lib/profile";
import { getAuth } from "@/lib/auth";

export default function CandidateProfile() {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);

  useEffect(() => {
    const auth = getAuth();
    setProfile(getCandidateProfile(auth?.username));
  }, []);

  return (
    <AuthGuard requiredRole="candidate">
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
              {profile ? (
                <>
                  <p>Name: {profile.fullName || "Not provided"}</p>
                  <p>Email: {profile.email || "Not provided"}</p>
                  <p>Role: Job Seeker</p>
                </>
              ) : (
                <p>No profile data found yet. Please complete your candidate profile.</p>
              )}
            </article>
            <article className="preview-block">
              <strong>Resume upload</strong>
              {profile ? (
                <>
                  <p>Resume: {profile.resumeName || "No resume uploaded"}</p>
                  <p>Status: {profile.resumeName ? "Uploaded and ready to apply" : "Pending upload"}</p>
                </>
              ) : (
                <p>Upload your resume in the candidate profile page.</p>
              )}
            </article>
            <article className="preview-block">
              <strong>Academic & experience</strong>
              {profile ? (
                <>
                  <p>{profile.highestQualification || "Qualification not added"} from {profile.institute || "Institute not added"}</p>
                  <p>{profile.totalExperience || "Experience not added"} experience, current role: {profile.currentDesignation || "Not added"}</p>
                </>
              ) : (
                <p>Fill in your education and experience details.</p>
              )}
            </article>
            <article className="preview-block">
              <strong>Additional notes</strong>
              {profile ? (
                <>
                  <p>{profile.skills ? `Skills: ${profile.skills}` : "Skills not provided"}</p>
                  <p>{profile.additionalNotes || "No additional notes."}</p>
                </>
              ) : (
                <p>Add your profile details for better job matches.</p>
              )}
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
