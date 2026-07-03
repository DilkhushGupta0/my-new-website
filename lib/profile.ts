export type CandidateProfile = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  dob: string;
  highestQualification: string;
  institute: string;
  passingYear: string;
  percentage: string;
  totalExperience: string;
  currentCompany: string;
  currentDesignation: string;
  skills: string;
  expectedSalary: string;
  noticePeriod: string;
  additionalNotes: string;
  resumeName?: string;
};

const BASE_PROFILE_KEY = "zenziCandidateProfile";

function profileKeyFor(username?: string) {
  if (!username) return BASE_PROFILE_KEY;
  return `${BASE_PROFILE_KEY}:${String(username).trim().toLowerCase()}`;
}

export function saveCandidateProfile(profile: CandidateProfile, username?: string) {
  if (typeof window === "undefined") return;
  try {
    const key = profileKeyFor(username);
    window.localStorage.setItem(key, JSON.stringify(profile));
  } catch {
    // ignore
  }
}

export function getCandidateProfile(username?: string): CandidateProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const key = profileKeyFor(username);
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as CandidateProfile;
  } catch {
    return null;
  }
}

export function clearCandidateProfile(username?: string) {
  if (typeof window === "undefined") return;
  const key = profileKeyFor(username);
  window.localStorage.removeItem(key);
}
