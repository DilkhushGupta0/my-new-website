'use client';

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveAuth, AuthRole } from "@/lib/auth";

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

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<AuthRole>("candidate");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone, name, password, role }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Registration failed.");
      }

      if (data.data?.status === 'pending') {
        setMessage('Your HR account has been created and is pending admin approval. You will be notified when approved.');
        setStep(0);
        setLoading(false);
        return;
      }

      setMessage('A verification code has been sent to your email or phone. Enter it below to activate your account.');
      setStep(1);
      setLoading(false);
    } catch (error: any) {
      setError(error?.message || "Unable to create account.");
      setLoading(false);
    }
  };

  const handleVerify = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone, otp }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "OTP verification failed.");
      }

      if (data.data?.status === 'pending') {
        setMessage('Verification successful. Your HR account is now pending admin approval.');
        setStep(0);
      } else {
        setMessage('Your account is verified and active. You may now sign in.');
        setStep(0);
      }
    } catch (error: any) {
      setError(error?.message || "Unable to verify OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="app-shell">
      <div className="page-inner">
        <section className="hero-card">
          <p className="eyebrow">Create Account</p>
          <h1>Register a new Zenzi Consultancy account</h1>
          <p className="hero-copy">
            Create your account to access candidate, HR, or admin tools.
          </p>

          {step === 0 ? (
            <form className="login-form" onSubmit={handleSubmit}>
              <div className="form-field">
                <label htmlFor="name">Full name</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="phone">Phone (optional)</label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="form-field">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Create a password"
                  required
                />
              </div>

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

              <button type="submit" className="primary-button">
                {loading ? "Creating account..." : "Create account"}
              </button>
              {error && <p className="error-message">{error}</p>}
            </form>
          ) : (
            <form className="login-form" onSubmit={handleVerify}>
              <div className="form-field">
                <label htmlFor="otp">Verification code</label>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(event) => setOtp(event.target.value)}
                  placeholder="Enter OTP sent to email or phone"
                  required
                />
              </div>

              <button type="submit" className="primary-button">
                {loading ? "Verifying code..." : "Verify OTP"}
              </button>
              {error && <p className="error-message">{error}</p>}
            </form>
          )}

          {message && <p className="status-message">{message}</p>}

          <div className="example-credentials">
            <p>
              Already have an account? <Link href="/login">Sign in here</Link>.
            </p>
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
        .example-credentials p { margin: 0; }
      `}</style>
    </main>
  );
}
