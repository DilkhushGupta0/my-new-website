'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, saveAuth, AuthRole } from "@/lib/auth";

type AuthGuardProps = {
  children: React.ReactNode;
  requiredRole?: AuthRole;
};

export default function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const [allowed, setAllowed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    if (auth) {
      if (requiredRole && auth.role !== requiredRole) {
        router.replace("/login");
        return;
      }
      setAllowed(true);
      return;
    }

    async function verifySession() {
      try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();
        if (!response.ok || !data.success) {
          router.replace('/login');
          return;
        }
        const session = {
          username: data.data.name || data.data.email,
          role: data.data.role as AuthRole,
          label: data.data.role === 'candidate' ? 'Job Seeker' : data.data.role === 'hr' ? 'HR' : 'Admin',
        };
        saveAuth(session);
        if (requiredRole && session.role !== requiredRole) {
          router.replace('/login');
          return;
        }
        setAllowed(true);
      } catch {
        router.replace('/login');
      }
    }

    verifySession();
  }, [requiredRole, router]);

  if (!allowed) {
    return null;
  }

  return <>{children}</>;
}
