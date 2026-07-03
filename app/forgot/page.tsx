"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ForgotPage() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(0);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const sendReset = async () => {
    setMessage('');
    try {
      const response = await fetch('/api/auth/forgot', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, phone }) });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Failed to send');
      setMessage('Reset instructions sent. Check your email or phone for the code.');
      setStep(1);
    } catch (e: any) {
      setMessage(e?.message || 'Error');
    }
  };

  const doReset = async () => {
    setMessage('');
    try {
      const response = await fetch('/api/auth/reset', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, token, otp, newPassword }) });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Reset failed');
      setMessage('Password reset successful. Redirecting to login...');
      setTimeout(() => router.push('/login'), 1200);
    } catch (e: any) {
      setMessage(e?.message || 'Error');
    }
  };

  return (
    <main className="app-shell">
      <div className="page-inner">
        <section className="hero-card">
          <p className="eyebrow">Password Reset</p>
          <h1>Forgot your password?</h1>
          <p className="hero-copy">Enter your email or phone to receive a reset code.</p>

          {step === 0 && (
            <div className="form-grid">
              <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <div style={{ marginTop: 12 }}>
                <button className="primary-button" onClick={sendReset}>Send reset</button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="form-grid">
              <input placeholder="OTP (from SMS)" value={otp} onChange={(e) => setOtp(e.target.value)} />
              <input placeholder="Token (from email)" value={token} onChange={(e) => setToken(e.target.value)} />
              <input placeholder="New password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              <div style={{ marginTop: 12 }}>
                <button className="primary-button" onClick={doReset}>Reset password</button>
              </div>
            </div>
          )}

          {message && <p style={{ marginTop: 12 }}>{message}</p>}
        </section>
      </div>
    </main>
  );
}
