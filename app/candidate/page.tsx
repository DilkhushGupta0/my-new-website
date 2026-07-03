"use client";

import AuthGuard from "@/app/components/AuthGuard";
import ProtectedHeader from "@/app/components/ProtectedHeader";
import { useEffect, useState } from "react";
import Link from "next/link";
import { saveCandidateProfile, getCandidateProfile } from "@/lib/profile";
import { getAuth } from "@/lib/auth";

export default function CandidateForm() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    dob: "",
    highestQualification: "",
    institute: "",
    passingYear: "",
    percentage: "",
    totalExperience: "",
    currentCompany: "",
    currentDesignation: "",
    skills: "",
    expectedSalary: "",
    noticePeriod: "",
    additionalNotes: "",
    resumeFile: null as File | null,
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const savedProfile = getCandidateProfile(auth?.username);
    if (savedProfile) {
      setForm((current) => ({ ...current, ...savedProfile }));
    }
  }, []);

  const handleChange = (key: string, value: string | File | null) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const profileData = {
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      address: form.address,
      dob: form.dob,
      highestQualification: form.highestQualification,
      institute: form.institute,
      passingYear: form.passingYear,
      percentage: form.percentage,
      totalExperience: form.totalExperience,
      currentCompany: form.currentCompany,
      currentDesignation: form.currentDesignation,
      skills: form.skills,
      expectedSalary: form.expectedSalary,
      noticePeriod: form.noticePeriod,
      additionalNotes: form.additionalNotes,
      resumeName: form.resumeFile?.name || "",
    };

    const auth = getAuth();
    saveCandidateProfile(profileData, auth?.username);
    setSubmitted(true);
  };

  return (
    <AuthGuard requiredRole="candidate">
      <main className="app-shell">
        <div className="page-inner">
          <ProtectedHeader />
        <section className="hero-card">
          <p className="eyebrow">Candidate Registration</p>
          <h1>Complete your candidate profile</h1>
          <p className="hero-copy">
            Fill in your personal, academic, and experience details so employers can review your profile quickly.
          </p>

          <form className="candidate-form" onSubmit={handleSubmit}>
            <div className="section-block">
              <h2>Personal details</h2>
              <div className="field-grid">
                <div className="form-field">
                  <label htmlFor="fullName">Full name</label>
                  <input
                    id="fullName"
                    value={form.fullName}
                    onChange={(event) => handleChange("fullName", event.target.value)}
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(event) => handleChange("email", event.target.value)}
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="phone">Phone</label>
                  <input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(event) => handleChange("phone", event.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="address">Address</label>
                  <input
                    id="address"
                    value={form.address}
                    onChange={(event) => handleChange("address", event.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="dob">Date of birth</label>
                  <input
                    id="dob"
                    type="date"
                    value={form.dob}
                    onChange={(event) => handleChange("dob", event.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="section-block">
              <h2>Academic details</h2>
              <div className="field-grid">
                <div className="form-field">
                  <label htmlFor="highestQualification">Highest qualification</label>
                  <input
                    id="highestQualification"
                    value={form.highestQualification}
                    onChange={(event) => handleChange("highestQualification", event.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="institute">Institute / university</label>
                  <input
                    id="institute"
                    value={form.institute}
                    onChange={(event) => handleChange("institute", event.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="passingYear">Year of passing</label>
                  <input
                    id="passingYear"
                    value={form.passingYear}
                    onChange={(event) => handleChange("passingYear", event.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="percentage">Percentage / CGPA</label>
                  <input
                    id="percentage"
                    value={form.percentage}
                    onChange={(event) => handleChange("percentage", event.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="section-block">
              <h2>Job experience</h2>
              <div className="field-grid">
                <div className="form-field">
                  <label htmlFor="totalExperience">Total experience</label>
                  <input
                    id="totalExperience"
                    value={form.totalExperience}
                    onChange={(event) => handleChange("totalExperience", event.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="currentCompany">Current / last company</label>
                  <input
                    id="currentCompany"
                    value={form.currentCompany}
                    onChange={(event) => handleChange("currentCompany", event.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="currentDesignation">Current designation</label>
                  <input
                    id="currentDesignation"
                    value={form.currentDesignation}
                    onChange={(event) => handleChange("currentDesignation", event.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="skills">Key skills</label>
                  <input
                    id="skills"
                    value={form.skills}
                    onChange={(event) => handleChange("skills", event.target.value)}
                    placeholder="e.g. React, Figma, Excel"
                  />
                </div>
              </div>
            </div>

            <div className="section-block">
              <h2>Additional details</h2>
              <div className="field-grid">
                <div className="form-field">
                  <label htmlFor="expectedSalary">Expected salary</label>
                  <input
                    id="expectedSalary"
                    value={form.expectedSalary}
                    onChange={(event) => handleChange("expectedSalary", event.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="noticePeriod">Notice period</label>
                  <input
                    id="noticePeriod"
                    value={form.noticePeriod}
                    onChange={(event) => handleChange("noticePeriod", event.target.value)}
                  />
                </div>
                <div className="form-field full-width">
                  <label htmlFor="additionalNotes">Additional notes</label>
                  <textarea
                    id="additionalNotes"
                    value={form.additionalNotes}
                    onChange={(event) => handleChange("additionalNotes", event.target.value)}
                    rows={4}
                  />
                </div>
              </div>
            </div>

            <div className="section-block">
              <h2>Resume upload</h2>
              <div className="form-field">
                <label htmlFor="resumeUpload">Upload your resume</label>
                <input
                  id="resumeUpload"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(event) => handleChange("resumeFile", event.target.files?.[0] ?? null)}
                />
              </div>
              {form.resumeFile && <p className="resume-note">Selected file: {form.resumeFile.name}</p>}
            </div>

            <div className="form-actions">
              <button type="submit" className="primary-button">
                Save profile
              </button>
              <Link href="/profile" className="secondary-button">
                View profile
              </Link>
            </div>
            {submitted && (
              <div className="success-message">
                Candidate profile details saved locally. You can now move to your profile or job search.
              </div>
            )}
          </form>
        </section>
      </div>

      <style jsx global>{`
        .candidate-form { display: grid; gap: 28px; }
        .section-block { background: #f8fafc; border-radius: 24px; padding: 24px; }
        .section-block h2 { margin: 0 0 18px; font-size: 1.2rem; color: #0f172a; }
        .field-grid { display: grid; gap: 18px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .form-field { display: flex; flex-direction: column; gap: 10px; }
        .form-field.full-width { grid-column: 1 / -1; }
        .form-field label { font-weight: 600; color: #0f172a; }
        .form-field input,
        .form-field textarea { border: 1px solid #cbd5e1; border-radius: 18px; padding: 14px 16px; font-size: 1rem; }
        .form-field textarea { resize: vertical; }
        .resume-note { color: #1d4ed8; margin-top: 8px; }
        .form-actions { display: flex; flex-wrap: wrap; gap: 14px; align-items: center; }
        .success-message { background: #d1fae5; border: 1px solid #10b981; border-radius: 18px; padding: 16px; color: #065f46; }
        @media (max-width: 900px) { .field-grid { grid-template-columns: 1fr; } }
      `}</style>
      </main>
    </AuthGuard>
  );
}
