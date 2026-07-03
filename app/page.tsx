'use client';

import Link from "next/link";
import { useMemo, useState } from "react";

type Slide = {
  title: string;
  subtitle: string;
  description: string;
  buttonLabel: string;
  accent: string;
};

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

const slides: Slide[] = [
  {
    title: "Job Search",
    subtitle: "Find your next opportunity",
    description:
      "Explore thousands of open roles, upload your resume, and connect with top employers.",
    buttonLabel: "Login as Job Seeker",
    accent: "blue",
  },
  {
    title: "HR Portal",
    subtitle: "Manage your talent pipeline",
    description:
      "Post jobs, review applicants, and collaborate with hiring teams in one place.",
    buttonLabel: "Login as HR",
    accent: "green",
  },
  {
    title: "Admin Dashboard",
    subtitle: "Control your organization",
    description:
      "Configure access, monitor activity, and keep your operations running smoothly.",
    buttonLabel: "Login as Admin",
    accent: "purple",
  },
];

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

export default function Home() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [searchTitle, setSearchTitle] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [activeJobIndex, setActiveJobIndex] = useState(0);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [selectedJobForLogin, setSelectedJobForLogin] = useState<JobPosting | null>(null);

  const filteredJobs = useMemo(
    () =>
      jobs.filter((job) => {
        const titleMatch = job.title.toLowerCase().includes(searchTitle.toLowerCase());
        const locationMatch = job.location.toLowerCase().includes(searchLocation.toLowerCase());
        return titleMatch && locationMatch;
      }),
    [searchTitle, searchLocation]
  );

  const activeSlide = slides[activeIndex];
  const selectedJob = filteredJobs.length > 0 ? filteredJobs[Math.min(activeJobIndex, filteredJobs.length - 1)] : jobs[0];

  const handleJobCardClick = (job: JobPosting) => {
    setSelectedJobForLogin(job);
    setShowLoginPrompt(true);
  };

  return (
    <>
      <main className="app-shell">
        <div className="page-inner">
          <section className="company-hero">
            <div className="company-content">
              <h1 className="company-name">Zenzi Consultancy</h1>
              <p className="company-tagline">Your Gateway to Career Success</p>
            </div>
          </section>

          <section className="home-section">
            <div className="home-grid">
              <div className="search-column">
                <p className="eyebrow">Find Your Perfect Job</p>
                <h1>Search jobs and apply instantly</h1>

                <div className="search-card-inline">
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
                      <div className="job-empty">No jobs match your filter yet.</div>
                    ) : (
                      filteredJobs.map((job) => (
                        <button
                          key={job.id}
                          type="button"
                          className="job-card"
                          onClick={() => handleJobCardClick(job)}
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
              </div>

              <div className="login-column">
                <p className="eyebrow">Access Your Account</p>
                <h2>Login by role</h2>
                <p className="column-copy">
                  Choose your role to access the right dashboard, tools, and support designed for you.
                </p>

                <div className="login-cards">
                  <Link href="/login?role=candidate" className="login-card">
                    <div className="login-badge role-accent-blue" />
                    <p className="login-role">Job Search Panel</p>
                    <p className="login-subtitle">Find and review job openings with ease.</p>
                    <span className="login-arrow">→</span>
                  </Link>
                  <Link href="/login?role=hr" className="login-card">
                    <div className="login-badge role-accent-green" />
                    <p className="login-role">HR Portal</p>
                    <p className="login-subtitle">Manage candidates, post jobs, and track hiring.</p>
                    <span className="login-arrow">→</span>
                  </Link>
                  <Link href="/login?role=admin" className="login-card">
                    <div className="login-badge role-accent-purple" />
                    <p className="login-role">Admin Panel</p>
                    <p className="login-subtitle">Control website content, access, and reports.</p>
                    <span className="login-arrow">→</span>
                  </Link>
                </div>
                <div style={{ marginTop: 24 }}>
                  <Link href="/register" className="primary-button">
                    Create an account
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <section className="about-section">
            <div className="about-frame">
              <article className="about-block">
                <strong>About Zenzi Consultancy</strong>
                <p>
                  Zenzi Consultancy is a trusted hiring platform for job seekers, HR professionals, and administrators. We simplify recruitment with real-time matching, secure profile management, and transparent workflows.
                </p>
                <ul>
                  <li>Support for candidates, HR teams, and company administrators</li>
                  <li>Secure job applications and role-based dashboards</li>
                  <li>Automated candidate tracking and employer collaboration</li>
                </ul>
              </article>
              <article className="about-block">
                <strong>Terms & Conditions</strong>
                <p>
                  By using Zenzi Consultancy, you accept these terms. The service is provided for lawful recruitment and career development only.
                </p>
                <ul>
                  <li>All users must provide accurate and up-to-date information.</li>
                  <li>Accounts are for personal and authorized business use only.</li>
                  <li>Zenzi Consultancy may suspend access for misuse or policy violations.</li>
                  <li>Your data is handled securely according to our privacy practices.</li>
                </ul>
              </article>
            </div>
          </section>

          <section className="social-section">
            <div className="social-card">
              <strong>Connect with Zenzi</strong>
              <p>Follow us and reach out on social media for updates, support, and recruitment news.</p>
              <div className="social-links">
                <a href="https://x.com" target="_blank" rel="noreferrer" className="social-link">🐦 X</a>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-link">📸 Instagram</a>
                <a href="https://wa.me/1234567890" target="_blank" rel="noreferrer" className="social-link">💬 WhatsApp</a>
                <a href="mailto:support@zenziconsultancy.com" className="social-link">✉️ Email</a>
              </div>
            </div>
          </section>
        </div>
      </main>

      {showLoginPrompt && selectedJobForLogin && (
        <div className="modal-overlay" onClick={() => setShowLoginPrompt(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <p className="eyebrow">Next step</p>
            <h2>Login to apply</h2>
            <p className="modal-text">
              To apply for <strong>{selectedJobForLogin.title}</strong> at{" "}
              <strong>{selectedJobForLogin.company}</strong>, please login or create an account.
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setShowLoginPrompt(false)}
              >
                Back
              </button>
              <Link
                href="/login?role=candidate"
                className="primary-button"
              >
                Login as Candidate
              </Link>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .app-shell { background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 60%); color: #0f172a; min-height: 100vh; }
        .page-inner { margin: 0 auto; max-width: 1400px; padding: 32px 20px 48px; }
        .company-hero { background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%); border-radius: 32px; padding: 60px 40px; text-align: center; margin-bottom: 48px; position: relative; overflow: hidden; }
        .company-content { position: relative; z-index: 2; }
        .company-name { font-size: clamp(3.2rem, 6vw, 5.5rem); font-weight: 900; color: #ffffff; margin: 0; line-height: 1.1; letter-spacing: -0.02em; animation: slideInName 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .company-tagline { font-size: clamp(1.1rem, 1.8vw, 1.5rem); color: #e0e7ff; margin: 16px 0 0; letter-spacing: 0.05em; animation: slideInTagline 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s forwards; opacity: 0; }
        @keyframes slideInName { from { opacity: 0; transform: translateX(-80px) rotateY(40deg); } to { opacity: 1; transform: translateX(0) rotateY(0deg); } }
        @keyframes slideInTagline { from { opacity: 0; transform: translateX(-60px); } to { opacity: 1; transform: translateX(0); } }
        .home-section { background: #ffffff; border-radius: 32px; box-shadow: 0 24px 80px rgba(15,23,42,.08); padding: 40px; }
        .home-grid { display: grid; gap: 40px; grid-template-columns: 1.3fr 1fr; }
        .search-column, .login-column { }
        .search-column h1 { font-size: clamp(1.8rem, 2.5vw, 2.8rem); margin: 12px 0 24px; line-height: 1.1; }
        .login-column h2 { font-size: clamp(1.6rem, 2vw, 2.2rem); margin: 12px 0 16px; line-height: 1.1; }
        .company-hero { padding: 48px 28px; }
        .about-frame { width: min(100%, 980px); }
        .search-card-inline { padding: 20px; }
        .about-block { padding: 24px; }
        .social-card { padding: 24px; }
        .eyebrow { color: #2563eb; font-size: 12px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; margin-bottom: 8px; }
        .column-copy { color: #475569; line-height: 1.7; margin-bottom: 24px; }
        .search-card-inline { background: #f8fafc; border-radius: 24px; padding: 24px; }
        .form-field { display: flex; flex-direction: column; gap: 10px; margin-bottom: 18px; }
        .form-field label { font-weight: 600; color: #0f172a; font-size: 0.95rem; }
        .form-field input { border: 1px solid #cbd5e1; border-radius: 18px; padding: 14px 16px; font-size: 1rem; width: 100%; }
        .job-list { display: flex; flex-direction: column; gap: 14px; margin-top: 18px; }
        .job-card { border: 1px solid #cbd5e1; border-radius: 24px; background: #ffffff; padding: 18px; text-align: left; width: 100%; cursor: pointer; transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .job-card:hover { transform: translateY(-2px); box-shadow: 0 14px 30px rgba(15,23,42,0.08); }
        .job-card-heading { display: flex; justify-content: space-between; gap: 15px; align-items: start; }
        .job-card-heading strong { display: block; font-size: 1rem; margin-bottom: 6px; }
        .job-company { color: #64748b; font-size: 0.94rem; margin-top: 4px; }
        .job-type { background: #e2e8f0; border-radius: 999px; color: #334155; font-size: 0.78rem; font-weight: 700; padding: 6px 10px; }
        .job-meta { display: flex; flex-wrap: wrap; gap: 12px; color: #64748b; font-size: 0.9rem; margin-top: 14px; }
        .job-empty { color: #334155; padding: 18px; border-radius: 18px; background: #f1f5f9; }
        .login-cards { display: flex; flex-direction: column; gap: 16px; }
        .login-card { display: grid; gap: 10px; background: linear-gradient(135deg, rgba(255,255,255,0.6), rgba(255,255,255,0.3)); border-radius: 22px; padding: 20px; position: relative; text-decoration: none; color: #0f172a; transition: transform 0.22s ease, box-shadow 0.22s ease; overflow: hidden; }
        .login-card::after { content: ''; position: absolute; right: -40px; top: -40px; width: 160px; height: 160px; border-radius: 50%; opacity: 0.08; transform: rotate(15deg); }
        .login-card:hover { transform: translateY(-6px); box-shadow: 0 26px 70px rgba(15, 23, 42, 0.12); }
        .login-badge { width: 48px; height: 6px; border-radius: 999px; }
        .role-accent-blue { background: linear-gradient(90deg, #3b82f6, #06b6d4); }
        .role-accent-green { background: linear-gradient(90deg, #10b981, #34d399); }
        .role-accent-purple { background: linear-gradient(90deg, #8b5cf6, #ec4899); }
        .login-card:nth-child(1)::after { background: radial-gradient(circle at 30% 20%, rgba(59,130,246,0.12), transparent 40%); }
        .login-card:nth-child(2)::after { background: radial-gradient(circle at 30% 20%, rgba(16,185,129,0.12), transparent 40%); }
        .login-card:nth-child(3)::after { background: radial-gradient(circle at 30% 20%, rgba(139,92,246,0.12), transparent 40%); }
        .login-role { font-weight: 700; font-size: 1.05rem; margin: 0; }
        .login-subtitle { color: #475569; font-size: 0.9rem; margin: 4px 0 0; }
        .login-arrow { position: absolute; top: 20px; right: 20px; font-size: 1.4rem; }
        .about-section { margin-top: 60px; display: flex; justify-content: center; }
        .about-frame { width: min(100%, 980px); background: #ffffff; border-radius: 32px; box-shadow: 0 30px 80px rgba(15, 23, 42, 0.08); padding: 32px; display: grid; gap: 24px; }
        .about-block { background: #f8fafc; border-radius: 24px; padding: 28px; border: 1px solid rgba(148, 163, 184, 0.16); }
        .about-block strong { display: block; font-size: 1.2rem; margin-bottom: 16px; color: #0f172a; }
        .about-block p { color: #475569; line-height: 1.8; margin: 0 0 18px; }
        .about-block ul { margin: 0; padding-left: 18px; color: #475569; line-height: 1.7; }
        .about-block li { margin-bottom: 10px; }
        .social-section { margin-top: 30px; }
        .social-card { background: #eff6ff; border-radius: 24px; padding: 28px; box-shadow: inset 0 0 0 1px rgba(59, 130, 246, 0.12); }
        .social-card strong { display: block; font-size: 1.1rem; margin-bottom: 10px; }
        .social-card p { margin: 0 0 18px; color: #475569; line-height: 1.7; }
        .social-links { display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap; }
        .social-link { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 18px; border-radius: 999px; background: #ffffff; border: 1px solid #cbd5e1; color: #0f172a; text-decoration: none; font-weight: 700; transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .social-link:hover { transform: translateY(-1px); box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08); }
        .primary-button, .secondary-button { border: none; border-radius: 18px; cursor: pointer; font-weight: 700; padding: 14px 18px; transition: transform 0.2s ease, opacity 0.2s ease; text-decoration: none; display: inline-block; }
        .primary-button { background: #0f172a; color: #ffffff; }
        .secondary-button { background: #e2e8f0; color: #0f172a; }
        .primary-button:hover, .secondary-button:hover { opacity: 0.9; transform: translateY(-1px); }
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.4); display: grid; place-items: center; z-index: 999; }
        .modal-content { background: #ffffff; border-radius: 28px; padding: 32px; max-width: 480px; box-shadow: 0 40px 100px rgba(15, 23, 42, 0.2); }
        .modal-content h2 { margin: 12px 0 16px; font-size: 1.8rem; }
        .modal-text { color: #475569; line-height: 1.7; margin-bottom: 28px; }
        .modal-actions { display: flex; gap: 12px; flex-wrap: wrap; }
        @media (max-width: 1000px) {
          .home-grid { grid-template-columns: 1fr; }
          .about-frame { width: 100%; padding: 24px; }
          .company-hero { padding: 36px 20px; }
          .home-section { padding: 28px; }
          .job-card { padding: 16px; }
          .search-card-inline { padding: 18px; }
          .form-field { margin-bottom: 16px; }
          .login-card { min-height: auto; }
          .login-arrow { top: 16px; right: 16px; }
          .about-block { padding: 22px; }
          .social-card { padding: 22px; }
        }
        @media (max-width: 640px) {
          .page-inner { padding: 22px 16px 30px; }
          .company-hero { border-radius: 24px; }
          .home-section { border-radius: 24px; padding: 22px; }
          .about-frame { padding: 20px; }
          .about-block { padding: 18px; }
          .social-card { padding: 20px; }
          .primary-button, .secondary-button { width: 100%; text-align: center; padding: 14px 16px; }
          .login-cards { gap: 14px; }
          .job-grid { grid-template-columns: 1fr; }
          .form-field input, .form-field select { padding: 12px 14px; }
          .job-card-heading { flex-direction: column; align-items: stretch; }
        }
      `}</style>
    </>
  );
}
