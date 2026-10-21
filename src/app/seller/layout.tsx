import React from "react";
import RoleGuard from "@/components/auth/RoleGuard";

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard
      allowedRoles={["seller", "admin"]}
      resourceName="Merchant OS & Seller Hub"
      description="Merchant verification required. Only registered sellers and platform admins have access to listing creation, credential deposit vaults, and payout balances."
    >
      {children}
    </RoleGuard>
  );
}
