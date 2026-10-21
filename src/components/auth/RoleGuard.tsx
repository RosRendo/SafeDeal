"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getCurrentUser,
  onAuthChanged,
  hasRoleAccess,
  AuthUser,
} from "@/lib/auth";
import LoginModal from "@/components/modals/LoginModal";

export interface RoleGuardProps {
  allowedRoles: ("admin" | "seller" | "buyer")[];
  resourceName?: string;
  description?: string;
  children: React.ReactNode;
}

export default function RoleGuard({
  allowedRoles,
  children,
}: RoleGuardProps) {
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();

    if (!hasRoleAccess(user, allowedRoles)) {
      setShowLogin(true);
    }

    const unsub = onAuthChanged((u) => {
      const latest = u !== undefined ? u : getCurrentUser();
      setShowLogin(!hasRoleAccess(latest, allowedRoles));
    });
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The gated content always renders so the route has a prerenderable shell;
  // unauthenticated visitors get the login modal overlaid on top of it.
  const redirectTarget = typeof window !== "undefined" ? window.location.pathname : "/";

  return (
    <>
      {children}
      {showLogin && (
        <LoginModal
          isOpen={true}
          onClose={() => router.push("/")}
          initialMode="signin"
          redirectAfterLogin={redirectTarget}
        />
      )}
    </>
  );
}
