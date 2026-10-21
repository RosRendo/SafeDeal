import React from "react";
import RoleGuard from "@/components/auth/RoleGuard";
import { AdminShell } from "@/components/navigation/AdminShell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard
      allowedRoles={["admin"]}
      resourceName="Institutional Ops Admin Console"
      description="Only verified Safedeal Operations Administrators have clearance to arbitrate disputes, monitor anti-fraud telemetry, and access financial settlements."
    >
      <AdminShell>{children}</AdminShell>
    </RoleGuard>
  );
}
