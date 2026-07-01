'use client';

import AuthGuard from "@/app/components/AuthGuard";
import ProtectedHeader from "@/app/components/ProtectedHeader";
import Link from "next/link";
import { useMemo, useState } from "react";

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

export default function SearchPage() {
  const [searchTitle, setSearchTitle] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [activeJobIndex, setActiveJobIndex] = useState(0);

  const filteredJobs = useMemo(
    () =>
      jobs.filter((job) => {
        const titleMatch = job.title.toLowerCase().includes(searchTitle.toLowerCase());
        const locationMatch = job.location.toLowerCase().includes(searchLocation.toLowerCase());
        return titleMatch && locationMatch;
      }),
    [searchTitle, searchLocation]
  );

  const selectedJob = filteredJobs.length > 0 ? filteredJobs[activeJobIndex] : jobs[0];

  return (
    <AuthGuard>
      <main className="app-shell">
        <div className="page-inner">
          <ProtectedHeader />
        <section className="hero-card">
          <p className="eyebrow">Job Search Panel</p>
          <h1>Search roles, preview details, and get ready to apply</h1>
          <p className="hero-copy">
            This dedicated search panel helps candidates find the right openings and start the application process quickly.
          </p>

          <div className="search-grid">
            <div className="search-panel">
              <div className="form-field">
                <label>Job title / keyword</label>
                <input
                  value={searchTitle}
                  onChange={(event) => {
                    setSearchTitle(event.target.value);
                    setActiveJobIndex(0);
                  }}
                  placeholder="e.g. Product Designer"
                />
              </div>
              <div className="form-field">
                <label>Location</label>
                <input
                  value={searchLocation}
                  onChange={(event) => {
                    setSearchLocation(event.target.value);
                    setActiveJobIndex(0);
                  }}
                  placeholder="e.g. Mumbai"
                />
              </div>

              <div className="job-list">
                {filteredJobs.length === 0 ? (
                  <div className="job-empty">No jobs match your filter.</div>
                ) : (
                  filteredJobs.map((job, index) => (
                    <button
                      key={job.id}
                      type="button"
                      className={`job-card ${index === activeJobIndex ? "job-card-active" : ""}`}
                      onClick={() => setActiveJobIndex(index)}
                    >
                      <div className="job-card-heading">
                        <div>
                          <strong>{job.title}</strong>
                          <div className="job-company">{job.company}</div>
                        </div>
                        <span className="job-type">{job.type}</span>
                      </div>
                      <div className="job-meta">
                        <span>{job.location}</span>
                        <span>{job.salary}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="preview-panel">
              <div className="preview-header">
                <p className="eyebrow">Selected role</p>
                <h3>{selectedJob.title}</h3>
                <p className="job-company">{selectedJob.company} · {selectedJob.location}</p>
              </div>
              <div className="preview-body">
                <div className="preview-block">
                  <strong>About the role</strong>
                  <p>{selectedJob.description}</p>
                </div>
                <div className="preview-grid">
                  <div className="preview-block">
                    <strong>Salary</strong>
                    <p>{selectedJob.salary}</p>
                  </div>
                  <div className="preview-block">
                    <strong>Type</strong>
                    <p>{selectedJob.type}</p>
                  </div>
                </div>
                <div className="preview-block">
                  <strong>Tags</strong>
                  <div className="tag-list">
                    {selectedJob.tags.map((tag) => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                </div>
                <p className="section-copy">
                  To apply for this role, please login or create a candidate account.
                </p>
                <Link href="/candidate" className="primary-button">
                  Login as Candidate
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
      <style jsx global>{`
        .search-grid { display: grid; gap: 24px; grid-template-columns: 1.2fr 1fr; }
        .search-panel, .preview-panel { background: #f8fafc; border-radius: 24px; padding: 24px; }
        .form-field { display: flex; flex-direction: column; gap: 10px; margin-bottom: 18px; }
        .form-field label { font-weight: 600; color: #0f172a; }
        .form-field input { border: 1px solid #cbd5e1; border-radius: 18px; padding: 14px 16px; font-size: 1rem; width: 100%; }
        .job-list { display: flex; flex-direction: column; gap: 14px; margin-top: 18px; }
        .job-card { border: 1px solid #cbd5e1; border-radius: 24px; background: #ffffff; padding: 18px; text-align: left; cursor: pointer; transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .job-card:hover { transform: translateY(-2px); box-shadow: 0 14px 30px rgba(15,23,42,0.08); }
        .job-card-active { border-color: #0f172a; background: #eff6ff; }
        .job-card-heading { display: flex; justify-content: space-between; gap: 15px; align-items: start; }
        .job-card-heading strong { display: block; font-size: 1rem; margin-bottom: 6px; }
        .job-company { color: #64748b; font-size: 0.94rem; margin-top: 4px; }
        .job-type { background: #e2e8f0; border-radius: 999px; color: #334155; font-size: 0.78rem; font-weight: 700; padding: 6px 10px; }
        .job-meta { display: flex; flex-wrap: wrap; gap: 12px; color: #64748b; font-size: 0.9rem; margin-top: 14px; }
        .preview-header { background: #0f172a; border-radius: 24px; color: #ffffff; padding: 22px; margin-bottom: 22px; }
        .preview-body { display: grid; gap: 16px; }
        .preview-block { background: #ffffff; border-radius: 20px; padding: 18px; box-shadow: 0 18px 50px rgba(15,23,42,0.06); }
        .preview-grid { display: grid; gap: 16px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .tag-list { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 12px; }
        .tag { background: #e2e8f0; border-radius: 100px; color: #334155; font-size: 0.78rem; font-weight: 700; padding: 8px 12px; }
        .section-copy { color: #475569; line-height: 1.7; }
        .primary-button { background: #0f172a; color: #ffffff; border: none; border-radius: 18px; cursor: pointer; font-weight: 700; padding: 14px 18px; text-decoration: none; display: inline-block; }
        .primary-button:hover { opacity: 0.9; transform: translateY(-1px); transition: transform 0.2s ease, opacity 0.2s ease; }
        @media (max-width: 900px) { .search-grid { grid-template-columns: 1fr; } }
      `}</style>
      </main>
    </AuthGuard>
  );
}
