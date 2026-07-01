'use client';

import { useEffect, useState } from "react";
import AuthGuard from "@/app/components/AuthGuard";
import ProtectedHeader from "@/app/components/ProtectedHeader";
import Link from "next/link";

export default function PaymentPage() {
  const [jobId, setJobId] = useState("job-1");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("jobId");
    if (id) setJobId(id);
  }, []);

  return (
    <AuthGuard>
      <main className="app-shell">
        <div className="page-inner">
          <ProtectedHeader />
        <section className="hero-card">
          <p className="eyebrow">Premium Payment</p>
          <h1>Premium fast-track confirmation</h1>
          <p className="hero-copy">
            Use the details below to complete the premium upgrade. There is no live payment gateway; scan the QR or use the bank/UPI details manually.
          </p>

          <div className="payment-panel">
            <div className="preview-block">
              <strong>Amount</strong>
              <p>₹299</p>
            </div>
            <div className="preview-block payment-qr">
              <strong>Scan here</strong>
              <div className="qr-box">QR CODE</div>
            </div>
            <div className="preview-block">
              <strong>UPI ID</strong>
              <p>zenzi.pay@upi</p>
            </div>
            <div className="preview-block">
              <strong>Bank account</strong>
              <p>Bank: Zenzi Bank</p>
              <p>A/C: 1234567890</p>
              <p>IFSC: ZENZ0001234</p>
            </div>
          </div>

          <div className="dashboard-actions">
            <Link href={`/job/${jobId}`} className="secondary-button">
              Back to Job details
            </Link>
            <Link href="/" className="primary-button">
              Back to Home
            </Link>
          </div>
        </section>
      </div>
      <style jsx global>{`
        .payment-panel { display: grid; gap: 18px; grid-template-columns: repeat(2, minmax(0, 1fr)); margin-top: 24px; }
        .payment-qr .qr-box { min-height: 180px; display: grid; place-items: center; border-radius: 22px; background: #e2e8f0; color: #0f172a; font-weight: 700; letter-spacing: 0.08em; }
        .dashboard-actions { display: flex; flex-wrap: wrap; gap: 14px; margin-top: 28px; }
        @media (max-width: 780px) { .payment-panel { grid-template-columns: 1fr; } }
      `}</style>
      </main>
    </AuthGuard>
  );
}
