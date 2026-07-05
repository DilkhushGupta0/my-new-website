"use client";

import { useEffect, useState } from "react";

type HealthData = {
  smtp: { enabled: boolean; missing: string[] };
  twilio: { enabled: boolean; missing: string[] };
};

export default function AuthHealthPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHealth() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/auth/health");
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.error || "Unable to fetch auth health.");
        }
        setHealth(data.data);
      } catch (err: any) {
        setError(err?.message || "Health check failed.");
      } finally {
        setLoading(false);
      }
    }

    fetchHealth();
  }, []);

  return (
    <main className="app-shell">
      <div className="page-inner">
        <section className="hero-card">
          <p className="eyebrow">Auth Health Check</p>
          <h1>Server-side OTP delivery health</h1>
          <p className="hero-copy">
            This page verifies whether your SMTP and Twilio settings are available for production email and SMS delivery.
          </p>

          {loading && <p>Loading health status...</p>}
          {error && <p className="error-message">{error}</p>}
          {health && (
            <div className="health-grid">
              <div className="health-card">
                <h2>SMTP</h2>
                <p>Status: <strong>{health.smtp.enabled ? "Configured" : "Not configured"}</strong></p>
                {health.smtp.missing.length > 0 && (
                  <div>
                    <p>Missing:</p>
                    <ul>
                      {health.smtp.missing.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="health-card">
                <h2>Twilio</h2>
                <p>Status: <strong>{health.twilio.enabled ? "Configured" : "Not configured"}</strong></p>
                {health.twilio.missing.length > 0 && (
                  <div>
                    <p>Missing:</p>
                    <ul>
                      {health.twilio.missing.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          <style jsx global>{`
            .health-grid {
              display: grid;
              gap: 18px;
              grid-template-columns: repeat(2, minmax(0, 1fr));
              margin-top: 24px;
            }
            .health-card {
              border: 1px solid #cbd5e1;
              border-radius: 20px;
              padding: 24px;
              background: #ffffff;
            }
            .health-card h2 {
              margin-top: 0;
            }
            .error-message {
              color: #dc2626;
            }
            @media (max-width: 900px) {
              .health-grid {
                grid-template-columns: 1fr;
              }
            }
          `}</style>
        </section>
      </div>
    </main>
  );
}
