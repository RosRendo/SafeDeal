"use client";

import React from "react";
import Link from "next/link";
import Wordmark from "@/components/brand/Wordmark";

interface FooterProps {
  onSelectCategory?: (cat: string) => void;
  onOpenProtectionModal?: () => void;
}

const columns = [
  {
    title: "Marketplace",
    links: [
      { label: "All listings", href: "/browse" },
      { label: "Gaming accounts", href: "/browse?cat=accounts" },
      { label: "Game keys & CDNs", href: "/browse?cat=keys" },
      { label: "Currency & gold", href: "/browse?cat=currency" },
      { label: "Gift cards", href: "/browse?cat=gift-cards" },
    ],
  },
  {
    title: "Trust",
    links: [
      { label: "How escrow works", href: "/protection" },
      { label: "Buyer protection", href: "/protection" },
      { label: "Verification standards", href: "/protection" },
      { label: "Terms of service", href: "/terms" },
      { label: "Privacy", href: "/privacy" },
    ],
  },
  {
    title: "Sell",
    links: [
      { label: "Open a seller account", href: "/seller" },
      { label: "Seller dashboard", href: "/seller" },
      { label: "Listings", href: "/seller/listings" },
      { label: "Earnings & payouts", href: "/seller/earnings" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help centre", href: "/help" },
      { label: "Messages", href: "/messages" },
      { label: "Orders", href: "/orders" },
      { label: "Dispute guidelines", href: "/help" },
    ],
  },
];

export default function Footer(_props: FooterProps = {}) {
  return (
    <footer className="mt-24">
      <div className="bg-paper-2">
        <div className="sd-container grid gap-12 py-16 lg:grid-cols-[1.15fr_1.85fr]">
          <div>
            <Wordmark size="lg" />
            <p className="mt-6 max-w-[34ch] text-[16px] leading-relaxed text-ink-2">
              A marketplace for verified digital goods, with a 48-hour escrow
              inspection window on every purchase.
            </p>
            <div className="mt-8 space-y-1 text-[13px] text-ink-2">
              <p>Buyer fees: 0%</p>
              <p>Seller fee: 5% on settled orders</p>
              <p>Arbitration: human, 24/7</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
            {columns.map((column) => (
              <div key={column.title}>
                <h2 className="sd-display text-[22px] text-ink">{column.title}</h2>
                <ul className="mt-4 space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-[13px] leading-snug text-ink-2 transition-colors hover:text-ink"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-ink text-paper">
        <div className="sd-container pt-14">
          <div className="flex items-end justify-between gap-6 pb-10">
            <p className="max-w-[30ch] text-[16px] leading-relaxed text-paper/70">
              The seller is paid when you confirm. Not before.
            </p>
            <Link
              href="/protection"
              className="sd-btn sd-btn-paper flex-none"
            >
              Read the escrow terms
            </Link>
          </div>

          <div className="sd-display select-none overflow-hidden pb-1 text-[clamp(4.5rem,15.5vw,13.5rem)] leading-[0.78] tracking-[-0.045em]">
            Safedeal
          </div>
        </div>

        <div className="sd-container flex flex-col gap-3 py-6 text-[13px] text-paper/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Safedeal. All rights reserved.</p>
          <p>Demo marketplace — listings, sellers and reviews are sample data.</p>
        </div>
      </div>
    </footer>
  );
}


