'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearAuth, getAuth, saveAuth, AuthRole } from "@/lib/auth";

const roleOptions: Array<{ value: AuthRole; label: string }> = [
  { value: "candidate", label: "Job Seeker" },
  { value: "hr", label: "HR" },
  { value: "admin", label: "Admin" },
];

const redirectForRole = (role: AuthRole) => {
  if (role === "candidate") return "/candidate";
  if (role === "hr") return "/hr";
  return "/admin";
};

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<AuthRole>("candidate");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryRole = params.get("role")?.toLowerCase();
    if (queryRole === "candidate" || queryRole === "job seeker" || queryRole === "jobseeker") {
      setRole("candidate");
    } else if (queryRole === "hr") {
      setRole("hr");
    } else if (queryRole === "admin") {
      setRole("admin");
    }
  }, []);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const session = getAuth();
    if (session) {
      router.replace(redirectForRole(session.role));
    } else {
      clearAuth();
    }
  }, [router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Login failed.");
      }

      const session = {
        username: data.data.name || data.data.email,
        role: data.data.role as AuthRole,
        label: data.data.role === "candidate" ? "Job Seeker" : data.data.role === "hr" ? "HR" : "Admin",
      };
      saveAuth(session);
      router.push(redirectForRole(session.role));
    } catch (error: any) {
      setError(error?.message || "Invalid login ID or password for the selected role.");
      setLoading(false);
    }
  };

  const quickFill = (u: string, p: string, r: AuthRole) => {
    setUsername(u);
    setPassword(p);
    setRole(r);
  };

  return (
    <main className="app-shell">
      <div className="page-inner">
        <section className="hero-card">
          <p className="eyebrow">Secure Login</p>
          <h1>Access the Zenzi Consultancy platform</h1>
          <p className="hero-copy">
            Enter your login credentials to continue. Admin, HR and candidate access is protected with a working username and password.
          </p>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="role">Role</label>
              <select id="role" value={role} onChange={(event) => setRole(event.target.value as AuthRole)}>
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="username">Login ID</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Enter your login ID"
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            <button type="submit" className="primary-button">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button type="button" className="secondary-button" onClick={() => quickFill('candidate', 'candidate123', 'candidate')}>Use Candidate</button>
              <button type="button" className="secondary-button" onClick={() => quickFill('hr', 'hr123', 'hr')}>Use HR</button>
              <button type="button" className="secondary-button" onClick={() => quickFill('admin', 'admin123', 'admin')}>Use Admin</button>
            </div>
            {error && <p className="error-message">{error}</p>}
          </form>

          <div className="example-credentials">
            <h2>Sample access IDs</h2>
            <ul>
              <li>Candidate: <strong>candidate / candidate123</strong></li>
              <li>HR: <strong>hr / hr123</strong></li>
              <li>Admin: <strong>admin / admin123</strong></li>
            </ul>
            <div style={{ marginTop: 16 }}>
              <Link href="/register" className="secondary-button">
                Create a new account
              </Link>
            </div>
          </div>
        </section>
      </div>

      <style jsx global>{`
        .login-form { display: grid; gap: 18px; max-width: 540px; margin-top: 24px; }
        .form-field { display: flex; flex-direction: column; gap: 10px; }
        .form-field label { font-weight: 600; color: #0f172a; }
        .form-field input,
        .form-field select { border: 1px solid #cbd5e1; border-radius: 18px; padding: 14px 16px; font-size: 1rem; }
        .primary-button { border: none; border-radius: 18px; background: #0f172a; color: #ffffff; cursor: pointer; font-weight: 700; padding: 14px 18px; width: fit-content; }
        .error-message { color: #dc2626; margin: 0; }
        .example-credentials { margin-top: 26px; padding: 20px; background: #eff6ff; border-radius: 22px; }
        .example-credentials h2 { margin: 0 0 12px; }
        .example-credentials ul { margin: 0; padding-left: 18px; color: #334155; }
        .example-credentials li { margin-bottom: 10px; }
      `}</style>
    </main>
  );
}
