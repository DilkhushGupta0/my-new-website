export type AuthRole = "candidate" | "hr" | "admin";

export type AuthSession = {
  username: string;
  role: AuthRole;
  label: string;
};

const users: Array<{ username: string; password: string; role: AuthRole; label: string }> = [
  { username: "candidate", password: "candidate123", role: "candidate", label: "Job Seeker" },
  { username: "hr", password: "hr123", role: "hr", label: "HR" },
  { username: "admin", password: "admin123", role: "admin", label: "Admin" },
];

export function validateLogin(username: string, password: string, selectedRole?: AuthRole): AuthSession | undefined {
  const normalizedUsername = username.trim().toLowerCase();
  const account = users.find((user) => user.username === normalizedUsername && user.password === password);
  if (!account) {
    return undefined;
  }
  if (selectedRole && account.role !== selectedRole) {
    return undefined;
  }
  return {
    username: account.username,
    role: account.role,
    label: account.label,
  };
}

export function saveAuth(session: AuthSession) {
  if (typeof window !== "undefined") {
    localStorage.setItem("zenziAuth", JSON.stringify(session));
  }
}

export function getAuth(): AuthSession | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = localStorage.getItem("zenziAuth");
    if (!raw) return undefined;
    return JSON.parse(raw) as AuthSession;
  } catch {
    return undefined;
  }
}

export function clearAuth() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("zenziAuth");
  }
}
