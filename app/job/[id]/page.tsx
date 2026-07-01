'use client';

import AuthGuard from "@/app/components/AuthGuard";
import ProtectedHeader from "@/app/components/ProtectedHeader";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type JobPosting = {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  tags: string[];
};

const jobs: JobPosting[] = [
  {
    id: "job-1",
    title: "Senior Product Designer",
    company: "Zenzi Works",
    location: "Mumbai, India",
    type: "Full-time",
    salary: "₹16L - ₹20L",
    description:
      "Design compelling user experiences for web and mobile products. Work closely with product, research, and engineering teams.",
    tags: ["Design", "Product", "Remote"],
  },
  {
    id: "job-2",
    title: "HR Business Partner",
    company: "TalentBridge",
    location: "Bengaluru, India",
    type: "Full-time",
    salary: "₹10L - ₹13L",
    description:
      "Partner with business leaders to hire talent, manage performance, and drive employee engagement across functions.",
    tags: ["HR", "People Ops", "Hybrid"],
  },
  {
    id: "job-3",
    title: "Admin Operations Lead",
    company: "OfficePulse",
    location: "Delhi, India",
    type: "Contract",
    salary: "₹8L - ₹10L",
    description:
      "Oversee office operations, vendor management, and administration activities while improving process efficiency.",
    tags: ["Admin", "Operations", "On-site"],
  },
  {
    id: "job-4",
    title: "Talent Acquisition Specialist",
    company: "HireSmart",
    location: "Pune, India",
    type: "Full-time",
    salary: "₹9L - ₹12L",
    description:
      "Manage end-to-end recruiting for multiple business units, including sourcing, interviewing, and offer negotiation.",
    tags: ["Recruiting", "HR", "Remote"],
  },
];

export default async function JobDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = jobs.find((item) => item.id === id) ?? jobs[0];

  return (
    <AuthGuard>
      <JobDetailClient job={job} />
    </AuthGuard>
  );
}

function JobDetailClient({ job }: { job: JobPosting }) {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [trackingStatus, setTrackingStatus] = useState("Resume not uploaded yet");
  const [priorityStatus, setPriorityStatus] = useState("Standard review process");

  useEffect(() => {
    if (resumeFile) {
      setTrackingStatus("Resume received — waiting for employer review");
    }
  }, [resumeFile]);

  return (
    <main className="app-shell">
      <div className="page-inner">
        <ProtectedHeader />
        <section className="hero-card">
          <p className="eyebrow">Job application</p>
          <h1>{job.title}</h1>
          <p className="hero-copy">Apply for this role and track your resume submission from one page.</p>

          <div className="job-detail-grid">
            <div className="preview-panel">
              <div className="preview-header">
                <p className="eyebrow">Job summary</p>
                <h3>{job.company}</h3>
                <p className="job-company">{job.location} · {job.type}</p>
              </div>
              <div className="preview-block">
                <strong>About the role</strong>
                <p>{job.description}</p>
              </div>
              <div className="preview-grid">
                <div className="preview-block">
                  <strong>Salary</strong>
                  <p>{job.salary}</p>
                </div>
                <div className="preview-block">
                  <strong>Tags</strong>
                  <div className="tag-list">
                    {job.tags.map((tag) => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="preview-panel">
              <div className="preview-header">
                <p className="eyebrow">Resume upload</p>
                <h3>Upload your CV</h3>
              </div>
              <div className="preview-body">
                <div className="preview-block">
                  <strong>Current status</strong>
                  <p>{trackingStatus}</p>
                </div>
                <div className="preview-block">
                  <strong>Fast track</strong>
                  <p>{priorityStatus}</p>
                </div>
                <div className="form-field">
                  <label htmlFor="resume">Choose your resume file</label>
                  <input
                    id="resume"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(event) => setResumeFile(event.target.files?.[0] ?? null)}
                  />
                </div>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setPriorityStatus("Premium fast track requested — complete payment on the next page")}
                >
                  Upgrade to Premium Fast Track
                </button>
                <Link href={`/payment?jobId=${job.id}`} className="primary-button">
                  Open payment details
                </Link>
              </div>
            </div>
          </div>

          <div className="dashboard-actions">
            <Link href="/" className="secondary-button">Back to Home</Link>
            <Link href="/dashboard?role=candidate" className="primary-button">Go to Dashboard</Link>
          </div>
        </section>
      </div>
      <style jsx global>{`
        .job-detail-grid { display: grid; gap: 24px; grid-template-columns: 1.2fr 1fr; }
        .preview-panel { background: #f8fafc; border-radius: 24px; padding: 24px; }
        .preview-header { background: #0f172a; border-radius: 24px; color: #ffffff; padding: 22px; margin-bottom: 22px; }
        .preview-header h3 { margin: 12px 0 8px; font-size: 1.4rem; }
        .preview-body { display: grid; gap: 16px; }
        .form-field { display: flex; flex-direction: column; gap: 10px; margin-bottom: 18px; }
        .form-field label { font-weight: 600; color: #0f172a; }
        .form-field input { border: 1px solid #cbd5e1; border-radius: 18px; padding: 12px 14px; font-size: 1rem; }
        .dashboard-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 24px; }
        @media (max-width: 900px) { .job-detail-grid { grid-template-columns: 1fr; } }
      `}</style>
    </main>
  );
}

