'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, AuthRole } from "@/lib/auth";

type AuthGuardProps = {
  children: React.ReactNode;
  requiredRole?: AuthRole;
};

export default function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const [allowed, setAllowed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    if (!auth) {
      router.replace("/login");
      return;
    }
    if (requiredRole && auth.role !== requiredRole) {
      router.replace("/login");
      return;
    }
    setAllowed(true);
  }, [requiredRole, router]);

  if (!allowed) {
    return null;
  }

  return <>{children}</>;
}
