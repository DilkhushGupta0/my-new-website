'use client';

import AuthGuard from "@/app/components/AuthGuard";
import ProtectedHeader from "@/app/components/ProtectedHeader";
import Link from "next/link";
import { useEffect, useState } from "react";

type UserFormState = {
  name: string;
  email: string;
  password: string;
  role: "candidate" | "hr" | "admin";
};

export default function AdminPanel() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState<UserFormState>({ name: "", email: "", password: "", role: "candidate" });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/users");
      const data = await response.json();
      if (data.success) setUsers(data.data || []);
    } catch {
      setMessage("Unable to load users right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage("");
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Failed to create user");
      setForm({ name: "", email: "", password: "", role: "candidate" });
      setMessage("User created successfully.");
      loadUsers();
    } catch (error: any) {
      setMessage(error.message || "Could not create user.");
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Unable to approve');
      loadUsers();
    } catch (e: any) {
      setMessage(e?.message || 'Approve failed');
    }
  };

  return (
    <AuthGuard requiredRole="admin">
      <main className="app-shell">
        <div className="page-inner">
          <ProtectedHeader />
          <section className="hero-card">
            <p className="eyebrow">Admin Panel</p>
            <h1>Full website access for administrators</h1>
            <p className="hero-copy">
              Manage user accounts and control access from one secure place.
            </p>

            <form className="dashboard-card" onSubmit={handleSubmit}>
              <h2>Create a user</h2>
              <div className="form-grid">
                <input placeholder="Full name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
                <input placeholder="Email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
                <input placeholder="Password" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
                <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as any })}>
                  <option value="candidate">Candidate</option>
                  <option value="hr">HR</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="dashboard-actions">
                <button type="submit" className="primary-button">Create user</button>
              </div>
              {message ? <p className="status-message">{message}</p> : null}
            </form>

            <div className="dashboard-grid">
              {loading ? <p>Loading users...</p> : users.map((user) => (
                <article key={user._id} className="preview-block">
                  <strong>{user.name}</strong>
                  <p>{user.email}</p>
                  <p>Role: {user.role}</p>
                  <p>Status: {user.status || 'active'}</p>
                  {user.status === 'pending' && (
                    <div style={{ marginTop: 8 }}>
                      <button className="primary-button" onClick={() => handleApprove(user._id)}>Approve</button>
                    </div>
                  )}
                </article>
              ))}
            </div>

            <div className="dashboard-actions">
              <Link href="/dashboard?role=admin" className="secondary-button">Return to Admin Dashboard</Link>
              <Link href="/" className="primary-button">Back to Homepage</Link>
            </div>
          </section>
        </div>
        <style jsx global>{`
          .dashboard-grid { display: grid; gap: 18px; grid-template-columns: repeat(2, minmax(0, 1fr)); margin-top: 24px; }
          .dashboard-card { background: #ffffff; border-radius: 24px; padding: 24px; margin-top: 24px; box-shadow: 0 20px 50px rgba(15, 23, 42, 0.08); }
          .dashboard-card h2 { margin-top: 0; }
          .form-grid { display: grid; gap: 12px; grid-template-columns: repeat(2, minmax(0, 1fr)); margin-bottom: 12px; }
          .dashboard-card input, .dashboard-card select { border: 1px solid #cbd5e1; border-radius: 14px; padding: 12px 14px; font: inherit; }
          .dashboard-actions { display: flex; flex-wrap: wrap; gap: 14px; margin-top: 28px; }
          .status-message { color: #0f766e; margin-top: 12px; }
          @media (max-width: 780px) { .dashboard-grid, .form-grid { grid-template-columns: 1fr; } }
        `}</style>
      </main>
    </AuthGuard>
  );
}
