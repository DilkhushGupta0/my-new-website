'use client';

import AuthGuard from "@/app/components/AuthGuard";
import ProtectedHeader from "@/app/components/ProtectedHeader";
import Link from "next/link";
import { useEffect, useState } from "react";

type JobFormState = {
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  tags: string;
};

export default function HRPortal() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState<JobFormState>({
    title: "",
    company: "",
    location: "",
    type: "Full-time",
    salary: "",
    description: "",
    tags: "",
  });

  const loadJobs = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/jobs");
      const data = await response.json();
      if (data.success) setJobs(data.data || []);
    } catch {
      setMessage("Unable to load jobs right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage("");
    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
          postedBy: "hr",
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Failed to create job");
      setForm({ title: "", company: "", location: "", type: "Full-time", salary: "", description: "", tags: "" });
      setMessage("Job posted successfully.");
      loadJobs();
    } catch (error: any) {
      setMessage(error.message || "Could not post job.");
    }
  };

  return (
    <AuthGuard requiredRole="hr">
      <main className="app-shell">
        <div className="page-inner">
          <ProtectedHeader />
          <section className="hero-card">
            <p className="eyebrow">HR Portal</p>
            <h1>Hire faster, track candidates, and manage your team</h1>
            <p className="hero-copy">
              Post jobs, review openings, and keep your recruiting pipeline active from one dashboard.
            </p>

            <form className="dashboard-card" onSubmit={handleSubmit}>
              <h2>Post a new role</h2>
              <div className="form-grid">
                <input placeholder="Job title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
                <input placeholder="Company" value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} required />
                <input placeholder="Location" value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} required />
                <input placeholder="Salary" value={form.salary} onChange={(event) => setForm({ ...form, salary: event.target.value })} required />
                <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Contract</option>
                </select>
                <input placeholder="Tags (comma separated)" value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} />
              </div>
              <textarea placeholder="Job description" rows={4} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required />
              <div className="dashboard-actions">
                <button type="submit" className="primary-button">Publish job</button>
                <Link href="/search" className="secondary-button">Open job search</Link>
              </div>
              {message ? <p className="status-message">{message}</p> : null}
            </form>

            <div className="dashboard-grid">
              {loading ? <p>Loading jobs...</p> : jobs.map((job) => (
                <article key={job._id} className="preview-block">
                  <strong>{job.title}</strong>
                  <p>{job.company} • {job.location}</p>
                  <p>{job.description}</p>
                </article>
              ))}
            </div>

            <div className="dashboard-actions">
              <Link href="/" className="secondary-button">Back to Home</Link>
            </div>
          </section>
        </div>
        <style jsx global>{`
          .dashboard-grid { display: grid; gap: 18px; grid-template-columns: repeat(2, minmax(0, 1fr)); margin-top: 24px; }
          .dashboard-card { background: #ffffff; border-radius: 24px; padding: 24px; margin-top: 24px; box-shadow: 0 20px 50px rgba(15, 23, 42, 0.08); }
          .dashboard-card h2 { margin-top: 0; }
          .form-grid { display: grid; gap: 12px; grid-template-columns: repeat(2, minmax(0, 1fr)); margin-bottom: 12px; }
          .dashboard-card input, .dashboard-card select, .dashboard-card textarea { border: 1px solid #cbd5e1; border-radius: 14px; padding: 12px 14px; font: inherit; }
          .dashboard-card textarea { width: 100%; margin-bottom: 12px; }
          .dashboard-actions { display: flex; flex-wrap: wrap; gap: 14px; margin-top: 28px; }
          .status-message { color: #0f766e; margin-top: 12px; }
          @media (max-width: 780px) { .dashboard-grid, .form-grid { grid-template-columns: 1fr; } }
        `}</style>
      </main>
    </AuthGuard>
  );
}
