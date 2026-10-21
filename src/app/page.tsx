"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Header from "@/components/navigation/Header";
import Footer from "@/components/navigation/Footer";
import ListingCard from "@/components/marketplace/ListingCard";
import Reveal from "@/components/animations/Reveal";
import { apiGetListings } from "@/lib/apiClient";
import { CatalogListingItem } from "@/lib/catalogData";
import { SEED_LISTINGS, SEED_REVIEWS } from "@/lib/server/seedData";

const CATEGORY_ORDER = ["accounts", "keys", "currency", "gift-cards", "software", "social"] as const;

const CATEGORY_COPY: Record<
  string,
  { label: string; blurb: string }
> = {
  accounts: {
    label: "Gaming accounts",
    blurb: "Ranked, collector and original-email accounts, checked before release.",
  },
  keys: {
    label: "Game keys & CDNs",
    blurb: "Publisher codes for Steam, Epic and console storefronts.",
  },
  currency: {
    label: "Currency & gold",
    blurb: "In-game reserves delivered through quiet, low-risk handovers.",
  },
  "gift-cards": {
    label: "Gift cards",
    blurb: "Direct codes with no escrow surcharge and no region lock.",
  },
  software: {
    label: "Software licences",
    blurb: "Productivity and security licences with clean activation.",
  },
  social: {
    label: "Social & creator assets",
    blurb: "Monetised channels and handles with a managed transfer.",
  },
};

const money = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);

const pad = (value: number) => String(value).padStart(2, "0");

function clock(total: number) {
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export default function Home() {
  const [listings, setListings] = useState<CatalogListingItem[]>(SEED_LISTINGS);
  const [activeCategory, setActiveCategory] = useState("all");
  const [openFaq, setOpenFaq] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(37 * 3600 + 11 * 60 + 37);

  useEffect(() => {
    let mounted = true;
    apiGetListings().then((data) => {
      if (mounted && data.length > 0) setListings(data);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsLeft((value) => (value > 0 ? value - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const hero = listings[0];

  const categories = useMemo(() => {
    return CATEGORY_ORDER.map((key) => {
      const items = listings.filter((listing) => listing.category === key);
      return {
        key,
        ...CATEGORY_COPY[key],
        count: items.length,
        from: items.length ? Math.min(...items.map((item) => item.price)) : 0,
        image: items[0]?.image ?? "",
        imageAlt: items[0]?.imageAlt ?? "",
      };
    }).filter((category) => category.count > 0);
  }, [listings]);

  const shelfCategories = [
    { key: "all", label: "All listings" },
    ...categories.map((category) => ({ key: category.key, label: category.label })),
  ];

  const shelf = useMemo(() => {
    if (activeCategory === "all") return listings;
    return listings.filter((listing) => listing.category === activeCategory);
  }, [activeCategory, listings]);

  const lead = shelf[0];
  const cluster = shelf.slice(1, 5);
  const rest = shelf.slice(5, 9);

  const reviews = SEED_REVIEWS;
  const reviewsAverage = (
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
  ).toFixed(1);

  const [reviewPos, setReviewPos] = useState(reviews.length);
  const [reviewInstant, setReviewInstant] = useState(false);
  const [reviewPaused, setReviewPaused] = useState(false);
  const reviewTrackRef = useRef<HTMLDivElement | null>(null);
  const [reviewStep, setReviewStep] = useState(400);

  useEffect(() => {
    const container = reviewTrackRef.current;
    if (!container) return;
    const measure = () => {
      const card = container.querySelector<HTMLElement>("figure");
      if (card) setReviewStep(card.offsetWidth + 20);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    if (reviewPaused) return;
    const timer = window.setInterval(() => {
      setReviewPos((value) => value + 1);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [reviewPaused]);

  useEffect(() => {
    if (!reviewInstant) return;
    const raf = requestAnimationFrame(() => setReviewInstant(false));
    return () => cancelAnimationFrame(raf);
  }, [reviewInstant]);

  const stepReview = (delta: number) => {
    if (delta < 0 && reviewPos + delta < 1) return;
    if (delta > 0 && reviewPos + delta > reviews.length * 3) return;
    if (delta > 0 && reviewPos + delta >= reviews.length * 2) {
      setReviewInstant(true);
      setReviewPos((value) => value - reviews.length + delta);
      return;
    }
    setReviewInstant(false);
    setReviewPos((value) => value + delta);
  };

  const handleReviewTransitionEnd = (
    event: React.TransitionEvent<HTMLDivElement>
  ) => {
    if (event.target !== reviewTrackRef.current) return;
    if (event.propertyName !== "transform") return;
    if (reviewPos >= reviews.length * 2) {
      setReviewInstant(true);
      setReviewPos((value) => value - reviews.length);
    } else if (reviewPos < 1) {
      setReviewInstant(true);
      setReviewPos((value) => value + reviews.length);
    }
  };

  const pulse = useMemo(
    () =>
      listings.slice(0, 9).map((listing) => ({
        title: listing.title.split(" | ")[0],
        meta: `Escrow hold · ${money(listing.price)} · ${listing.seller?.name ?? "verified seller"}`,
      })),
    [listings]
  );

  return (
    <div className="min-h-screen bg-paper text-ink">
      <Header />

      <main className="pt-[76px]">
        {/* Hero */}
        <section className="sd-container grid items-start gap-12 pb-20 pt-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-14 lg:pb-24 lg:pt-16">
          <div className="sd-enter">
            <h1 className="sd-display text-[clamp(3.1rem,5.1vw,4.7rem)]">
              No payment until it works.
            </h1>
            <p className="mt-7 max-w-[46ch] text-[16px] leading-[1.65] text-ink-2">
              Buy verified gaming accounts, keys and in-game currency with your
              money held in escrow. You get 48 hours to inspect the handover
              before the seller sees a cent.
            </p>

            <dl className="mt-10 grid max-w-[520px] grid-cols-3 gap-6">
              <div>
                <dt className="sd-display text-[32px] leading-none">48h</dt>
                <dd className="mt-2 text-[13px] leading-snug text-ink-2">
                  Inspection window on every order
                </dd>
              </div>
              <div>
                <dt className="sd-display text-[32px] leading-none">0%</dt>
                <dd className="mt-2 text-[13px] leading-snug text-ink-2">
                  Buyer fee, on every listing
                </dd>
              </div>
              <div>
                <dt className="sd-display text-[32px] leading-none">24/7</dt>
                <dd className="mt-2 text-[13px] leading-snug text-ink-2">
                  Human arbitration if it goes wrong
                </dd>
              </div>
            </dl>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/browse" className="sd-btn sd-btn-primary">
                Browse verified listings
              </Link>
              <Link href="/protection" className="sd-btn sd-btn-quiet">
                How escrow works
              </Link>
            </div>
          </div>

          {hero && (
            <div className="sd-enter" style={{ animationDelay: "120ms" }}>
              <div className="grid h-[410px] grid-cols-12 gap-3 sm:h-[520px]">
                <Link
                  href={`/listing/${hero.id}`}
                  className="group relative col-span-7 overflow-hidden bg-paper-2"
                >
                  <img
                    src={hero.image}
                    alt={hero.imageAlt || hero.title}
                    className="sd-drift h-full w-full object-cover transition-transform duration-[900ms] group-hover:scale-[1.03]"
                  />
                  <span className="absolute left-3 top-3 bg-paper px-2 py-1 text-[13px] font-semibold leading-none">
                    Featured listing
                  </span>
                </Link>

                <div className="col-span-5 grid grid-rows-2 gap-3">
                  {listings.slice(1, 3).map((listing) => (
                    <Link
                      key={listing.id}
                      href={`/listing/${listing.id}`}
                      className="group relative overflow-hidden bg-paper-2"
                    >
                      <img
                        src={listing.image}
                        alt={listing.imageAlt || listing.title}
                        className="sd-drift h-full w-full object-cover transition-transform duration-[900ms] group-hover:scale-[1.03]"
                      />
                    </Link>
                  ))}
                </div>
              </div>

              <div className="mt-3 flex flex-col gap-5 bg-ink p-5 text-paper sm:grid sm:grid-cols-[1.5fr_auto] sm:items-end sm:p-6">
                <div className="order-2 sm:order-none sm:text-left">
                  <p className="line-clamp-2 text-[16px] font-medium leading-snug">
                    {hero.title}
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-[13px] text-paper/60">
                    <span className="sd-pulse h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Escrow hold active · {hero.seller?.name} · {money(hero.price)} held
                  </p>
                </div>
                <div className="order-1 sm:order-none sm:text-right">
                  <p className="sd-display text-[32px] leading-none tabular-nums">
                    {clock(secondsLeft)}
                  </p>
                  <p className="mt-1.5 text-[13px] font-normal tracking-normal text-paper/60">
                    left in inspection
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Deal pulse */}
        <section aria-label="Live escrow activity" className="bg-ink text-paper">
          <div className="sd-marquee py-3.5">
            <div className="sd-marquee-track">
              {[0, 1].map((copy) =>
                pulse.map((item, index) => (
                  <span
                    key={`${copy}-${index}`}
                    className="flex flex-none items-center gap-3 pr-12 text-[13px] tracking-wide text-paper/55"
                  >
                    <span className="sd-pulse h-1.5 w-1.5 flex-none rounded-full bg-emerald-400" />
                    <span className="font-medium text-paper">{item.title}</span>
                    <span>{item.meta}</span>
                  </span>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Escrow promise band */}
        <section className="bg-ink text-paper">
          <div className="sd-container grid gap-12 py-20 lg:grid-cols-[0.95fr_1.05fr] lg:py-24">
            <Reveal>
              <h2 className="sd-display text-[clamp(2.5rem,4.2vw,3.8rem)]">
                The seller is paid last.
              </h2>
              <p className="mt-6 max-w-[38ch] text-[16px] leading-relaxed text-paper/65">
                Your payment sits with Safedeal, not with the seller. The hold
                releases only when the asset is in your hands and behaves as
                listed.
              </p>
              <Link href="/protection" className="mt-8 inline-block border-b border-paper/40 pb-1 text-[16px] font-medium text-paper transition-colors hover:border-paper">
                Walk through the process
              </Link>
            </Reveal>
              <Reveal delay={80}>
                <div className="grid gap-8 sm:grid-cols-3">
                  <div>
                    <p className="sd-display text-[22px]">48 hours to look</p>
                    <p className="mt-3 text-[16px] leading-relaxed text-paper/65">
                      Log in, bind your own email and 2FA, test the inventory and
                      the original ownership. The clock is yours.
                    </p>
                  </div>
                  <div>
                    <p className="sd-display text-[22px]">A vault, not a chat</p>
                    <p className="mt-3 text-[16px] leading-relaxed text-paper/65">
                      Credentials are delivered into a private vault. Only the
                      buyer can reveal them, and every access is recorded.
                    </p>
                  </div>
                  <div>
                    <p className="sd-display text-[22px]">A person decides</p>
                    <p className="mt-3 text-[16px] leading-relaxed text-paper/65">
                      If the listing was not as described, an escrow officer
                      reviews the evidence and can refund the hold.
                    </p>
                  </div>
                </div>
              </Reveal>
          </div>
        </section>

        {/* Catalogue */}
        <section className="sd-container py-20 sm:py-28">
          <Reveal>
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <h2 className="sd-display text-[clamp(2.4rem,4vw,3.4rem)]">
                  On the shelf, verified.
                </h2>
                <p className="mt-4 max-w-[54ch] text-[16px] leading-relaxed text-ink-2">
                  Each listing is a single digital good with its own inspection
                  record. Nothing here is bundled, re-listed or sold twice.
                </p>
              </div>
              <Link href="/browse" className="sd-btn sd-btn-quiet flex-none">
                Browse all listings
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2">
              {shelfCategories.map((category) => (
                <button
                  key={category.key}
                  type="button"
                  onClick={() => setActiveCategory(category.key)}
                  className={`border-b-2 pb-1 text-[13px] font-medium transition-colors ${
                    activeCategory === category.key
                      ? "border-ink text-ink"
                      : "border-transparent text-ink-2 hover:text-ink"
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </Reveal>

          <Reveal delay={90}>
            {shelf.length === 0 ? (
              <div className="sd-enter mt-12 bg-paper-2 p-10">
                <p className="sd-display text-[28px]">Nothing on this shelf yet.</p>
                <p className="mt-3 text-[16px] text-ink-2">
                  New verified listings arrive daily. Browse the full catalogue
                  in the meantime.
                </p>
                <Link href="/browse" className="sd-btn sd-btn-primary mt-6">
                  Browse the catalogue
                </Link>
              </div>
            ) : (
              <div
                key={activeCategory}
                className="sd-enter mt-12 grid grid-cols-1 gap-x-6 gap-y-12 md:grid-cols-12"
              >
                {lead && (
                  <ListingCard
                    listing={lead}
                    variant="feature"
                    className="md:col-span-7"
                  />
                )}

                {cluster.length > 0 && (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:col-span-5">
                    {cluster.map((listing) => (
                      <ListingCard
                        key={listing.id}
                        listing={listing}
                        variant="compact"
                        showSeller={false}
                      />
                    ))}
                  </div>
                )}

                {rest.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    className="md:col-span-3"
                    showSeller={false}
                  />
                ))}
              </div>
            )}
          </Reveal>
        </section>

        {/* How escrow works */}
        <section className="bg-paper-2">
          <div className="sd-container py-20 sm:py-28">
            <Reveal>
              <div className="grid gap-8 lg:grid-cols-12">
                <h2 className="sd-display text-[clamp(2.4rem,4vw,3.4rem)] lg:col-span-5">
                  What happens to your money.
                </h2>
                <p className="max-w-[48ch] text-[16px] leading-relaxed text-ink-2 lg:col-span-6 lg:col-start-7 lg:pt-2">
                  Three states, one principle: the funds move only when the
                  handover is complete. No release on a promise, no release on a
                  timer the seller controls.
                </p>
              </div>
            </Reveal>

            <div className="mt-14 grid items-end gap-10 md:grid-cols-3 md:gap-3">
              <Reveal delay={0}>
                <div className="flex min-h-[280px] flex-col justify-between bg-cobalt p-6 text-white md:min-h-[330px]">
                  <p className="text-[13px] text-white/70">Minute 0</p>
                  <div data-ui className="w-full max-w-[270px] bg-paper p-4 text-ink">
                    <div className="flex items-center justify-between text-[13px]">
                      <span>Escrow hold</span>
                      <span className="text-verified">Active</span>
                    </div>
                    <p className="sd-display mt-3 text-[34px] leading-none">
                      {money(hero?.price ?? 195)}
                    </p>
                    <p className="mt-2 text-[13px] text-ink-2">
                      Held by Safedeal · 48h inspection
                    </p>
                    <div className="mt-4 h-[6px] bg-paper-2">
                      <div className="h-full w-[18%] bg-verified" />
                    </div>
                  </div>
                </div>
                <div className="mt-5">
                  <p className="sd-display text-[22px]">Held</p>
                  <p className="mt-2 max-w-[34ch] text-[16px] leading-relaxed text-ink-2">
                    The payment leaves your account and stops with us. The seller
                    can see the order but cannot touch the money.
                  </p>
                </div>
              </Reveal>

              <Reveal delay={90}>
                <div className="flex min-h-[320px] flex-col justify-between bg-ink p-6 text-paper md:min-h-[390px]">
                  <p className="text-[13px] text-paper/60">Within minutes</p>
                  <div data-ui className="w-full max-w-[280px] bg-paper p-4 text-ink">
                    <div className="flex items-center justify-between text-[13px]">
                      <span>Vault handover</span>
                      <span className="text-verified">Locked to you</span>
                    </div>
                    <div className="mt-3 space-y-2 text-[13px]">
                      <div className="flex justify-between">
                        <span className="text-ink-2">Login</span>
                        <span>revealed</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ink-2">Original email</span>
                        <span>included</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ink-2">2FA</span>
                        <span>unbound</span>
                      </div>
                    </div>
                    <div className="mt-4 bg-paper-2 px-3 py-2 text-[13px] text-ink-2">
                      One view · every access logged
                    </div>
                  </div>
                </div>
                <div className="mt-5">
                  <p className="sd-display text-[22px]">Handed over</p>
                  <p className="mt-2 max-w-[34ch] text-[16px] leading-relaxed text-ink-2">
                    The seller delivers access into your vault. You inspect it
                    with the original credentials, not a screenshot.
                  </p>
                </div>
              </Reveal>

              <Reveal delay={180}>
                <div className="flex min-h-[360px] flex-col justify-between bg-paper-3 p-6 text-ink md:min-h-[450px]">
                  <p className="text-[13px] text-ink-2">After your check</p>
                  <div data-ui className="w-full max-w-[290px] bg-ink p-4 text-paper">
                    <div className="flex items-center justify-between text-[13px]">
                      <span>Release summary</span>
                      <span className="text-emerald-300">Ready</span>
                    </div>
                    <p className="mt-3 text-[13px] text-paper/70">
                      Ownership confirmed by buyer
                    </p>
                    <p className="sd-display mt-4 text-[34px] leading-none">
                      {money(hero?.price ?? 195)}
                    </p>
                    <p className="mt-2 text-[13px] text-paper/60">
                      Released to {hero?.seller?.name || "verified seller"}
                    </p>
                    <div className="mt-4 bg-paper/10 px-3 py-2 text-[13px] text-paper/80">
                      Confirmation recorded · receipt issued
                    </div>
                  </div>
                </div>
                <div className="mt-5">
                  <p className="sd-display text-[22px]">Released</p>
                  <p className="mt-2 max-w-[34ch] text-[16px] leading-relaxed text-ink-2">
                    You confirm custody and the seller is paid. If anything is
                    wrong, you open a dispute instead.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Verification / proof */}
        <section className="sd-container py-20 sm:py-28">
          <div className="grid gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <Reveal>
              <h2 className="sd-display text-[clamp(2.4rem,4vw,3.4rem)]">
                Every listing carries its provenance.
              </h2>
              <p className="mt-6 max-w-[44ch] text-[16px] leading-relaxed text-ink-2">
                Before a listing goes live, the seller proves custody of the
                asset. The inspection record shows exactly what was checked, so
                you can compare the listing to the thing itself.
              </p>
              <Link href="/protection" className="sd-btn sd-btn-quiet mt-8">
                How verification works
              </Link>
            </Reveal>

            <Reveal delay={100}>
              <div className="bg-paper-2 p-6 sm:p-9 lg:-rotate-1">
                <p className="sd-display line-clamp-2 text-[28px] leading-[1.12]">
                  {hero?.title?.split(" | ")[0]}
                </p>

                <dl className="mt-7 space-y-3.5 text-[13px]">
                  <div className="flex justify-between gap-6">
                    <dt className="text-ink-2">Seller</dt>
                    <dd className="text-right font-medium">
                      {hero?.seller?.name}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-6">
                    <dt className="text-ink-2">Completed orders</dt>
                    <dd className="text-right font-medium">
                      {hero?.seller?.dealCount?.toLocaleString("en-US")}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-6">
                    <dt className="text-ink-2">Seller rating</dt>
                    <dd className="text-right font-medium">
                      {hero?.seller?.rating} / 5
                    </dd>
                  </div>
                  <div className="flex justify-between gap-6">
                    <dt className="text-ink-2">Original email</dt>
                    <dd className="text-right font-medium">
                      {hero?.isEmailIncluded === false ? "Not included" : "Included"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-6">
                    <dt className="text-ink-2">Region</dt>
                    <dd className="text-right font-medium">{hero?.region}</dd>
                  </div>
                  <div className="flex justify-between gap-6">
                    <dt className="text-ink-2">Handover</dt>
                    <dd className="text-right font-medium">
                      {hero?.deliveryTimeText}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-6">
                    <dt className="text-ink-2">Inspection window</dt>
                    <dd className="text-right font-medium">48 hours</dd>
                  </div>
                </dl>

              <p className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-2 text-[13px] leading-relaxed">
                  <span className="bg-verified-soft px-2 py-1 font-semibold text-verified">
                    Verified
                  </span>
                  <span className="text-ink-2">
                    Inspection record · generated when the listing was approved.
                  </span>
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Buyer reviews carousel */}
        <section className="sd-container pb-20 sm:pb-28">
          <Reveal>
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <h2 className="sd-display text-[clamp(2.4rem,4vw,3.4rem)]">
                  Buyers, on the record.
                </h2>
                <p className="mt-2 text-[13px] tabular-nums text-ink-2">
                  {reviewsAverage} / 5 average · {reviews.length} verified
                  reviews · every one tied to a released escrow order
                </p>
              </div>
              <div className="flex flex-none items-center gap-2">
                <button
                  type="button"
                  aria-label="Previous review"
                  onClick={() => stepReview(-1)}
                  className="flex h-10 w-10 flex-none items-center justify-center border border-ink/20 transition-colors hover:border-ink"
                >
                  <ArrowRight className="h-4 w-4 rotate-180" strokeWidth={1.8} />
                </button>
                <button
                  type="button"
                  aria-label="Next review"
                  onClick={() => stepReview(1)}
                  className="flex h-10 w-10 flex-none items-center justify-center border border-ink/20 transition-colors hover:border-ink"
                >
                  <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
                </button>
              </div>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div
              className="mt-10"
              onMouseEnter={() => setReviewPaused(true)}
              onMouseLeave={() => setReviewPaused(false)}
              onFocus={() => setReviewPaused(true)}
              onBlur={() => setReviewPaused(false)}
            >
              <div
                ref={reviewTrackRef}
                className="flex overflow-hidden"
                role="group"
                aria-roledescription="carousel"
                aria-label="Buyer reviews"
                onTransitionEnd={handleReviewTransitionEnd}
              >
                <div
                  className="flex transition-transform duration-500 ease-out"
                  style={{
                    transform: `translate3d(${-reviewPos * reviewStep}px, 0, 0)`,
                    transitionDuration: reviewInstant ? "0ms" : undefined,
                  }}
                >
                  {[...reviews, ...reviews, ...reviews, ...reviews].map(
                    (review, index) => (
                      <figure
                        key={index}
                        className={`mr-5 w-[300px] flex-none bg-paper-2 p-6 sm:w-[380px] ${
                          index % 3 === 0
                            ? "sm:-rotate-[0.6deg]"
                            : index % 3 === 1
                              ? "sm:rotate-[0.5deg] sm:translate-y-1"
                              : "sm:-translate-y-0.5"
                        }`}
                      >
                        <p className="flex items-baseline justify-between text-[13px] text-ink-2">
                          <span className="font-medium text-ink">
                            {review.author}
                          </span>
                          <span className="sd-display text-[18px] text-ink">
                            {review.rating}.0
                          </span>
                        </p>
                        <blockquote className="mt-3 line-clamp-4 text-[16px] leading-relaxed text-ink">
                          {review.reviewText}
                        </blockquote>
                        <figcaption className="mt-4 border-t border-ink/10 pt-3 text-[13px] text-ink-2">
                          {review.verifiedPurchase} · {review.date}
                        </figcaption>
                      </figure>
                    )
                  )}
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        {/* Category index */}
        <section className="bg-paper-2">
          <div className="sd-container py-20 sm:py-24">
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-6">
                <h2 className="sd-display text-[clamp(2.4rem,4vw,3.4rem)]">
                  Browse by shelf.
                </h2>
                <Link href="/browse" className="sd-btn sd-btn-quiet">
                  See the full catalogue
                </Link>
              </div>
            </Reveal>

            <div className="mt-10">
              {categories.map((category, index) => (
                <Reveal key={category.key} delay={index * 50}>
                  <Link
                    href={`/browse?cat=${category.key}`}
                    className="group grid grid-cols-[56px_1fr_auto] items-center gap-4 px-3 py-5 transition-colors hover:bg-paper-3 sm:grid-cols-[56px_1.15fr_1.7fr_120px_110px_20px] sm:px-5"
                  >
                    <span className="h-14 w-14 overflow-hidden bg-paper-3">
                      {category.image && (
                        <img
                          src={category.image}
                          alt={category.imageAlt || category.label}
                          loading="lazy"
                          className="h-14 w-14 object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      )}
                    </span>
                    <span className="sd-display text-[clamp(1.7rem,3vw,2.6rem)] leading-none">
                      {category.label}
                    </span>
                    <span className="hidden text-[13px] text-ink-2 sm:block">
                      {category.blurb}
                    </span>
                    <span className="text-right text-[13px] tabular-nums text-ink-2 sm:text-left">
                      {category.count} live
                    </span>
                    <span className="hidden text-[13px] tabular-nums text-ink-2 sm:block">
                      From {money(category.from)}
                    </span>
                    <span className="hidden text-[16px] transition-transform group-hover:translate-x-1 sm:block">
                      <ArrowRight className="h-5 w-5 text-ink" strokeWidth={1.8} />
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="sd-container py-20 sm:py-28">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <Reveal>
              <h2 className="sd-display text-[clamp(2.4rem,4vw,3.4rem)]">
                Questions worth asking.
              </h2>
            </Reveal>

            <Reveal delay={80}>
              <div className="space-y-2">
                {faqs.map((faq, index) => {
                  const open = openFaq === index;
                  return (
                    <div key={faq.question} className={open ? "bg-paper-2" : ""}>
                      <button
                        type="button"
                        onClick={() => setOpenFaq(open ? -1 : index)}
                        aria-expanded={open}
                        className="flex w-full items-start justify-between gap-6 px-4 py-5 text-left sm:px-6"
                      >
                        <span className="text-[16px] font-medium leading-snug sm:text-[22px]">
                          {faq.question}
                        </span>
                        <span
                          aria-hidden
                          className={`mt-0.5 flex-none text-[22px] leading-none transition-transform duration-200 ${
                            open ? "rotate-45" : ""
                          }`}
                        >
                          +
                        </span>
                      </button>
                      {open && (
                        <p className="max-w-[62ch] px-4 pb-6 text-[16px] leading-relaxed text-ink-2 sm:px-6">
                          {faq.answer}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </Reveal>
          </div>
        </section>

        {/* Closing */}
        <section>
          <div className="grid h-[240px] grid-cols-3 sm:h-[300px]">
            {listings.slice(3, 6).map((listing) => (
              <div key={listing.id} className="overflow-hidden bg-paper-2">
                <img
                  src={listing.image}
                  alt={listing.imageAlt || listing.title}
                  loading="lazy"
                  className="sd-drift h-full w-full object-cover"
                />
              </div>
            ))}
          </div>

          <div className="bg-cobalt text-white">
            <div className="sd-container flex flex-col items-start justify-between gap-8 py-16 sm:flex-row sm:items-end sm:py-20">
              <div>
                <h2 className="sd-display max-w-[18ch] text-[clamp(2.3rem,4.2vw,3.5rem)]">
                  Sell your first asset this week.
                </h2>
                <p className="mt-4 max-w-[46ch] text-[16px] leading-relaxed text-white/80">
                  Keep 95% of every settled order. We hold the payment, verify
                  the buyer and handle the awkward parts.
                </p>
              </div>
              <Link href="/seller" className="sd-btn sd-btn-paper flex-none">
                Open a seller account
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

const faqs = [
  {
    question: "What stops the seller from taking the money and disappearing?",
    answer:
      "The money never reaches the seller at purchase. Safedeal holds the full amount in escrow until you either confirm the handover or the 48-hour inspection window ends without a dispute. A seller cannot withdraw a held order.",
  },
  {
    question: "What exactly do I get during the inspection window?",
    answer:
      "The credentials the seller committed to the listing, delivered into your private vault: the login, the original email where included, the recovery details and any security notes. You can bind your own 2FA and test the asset before releasing funds.",
  },
  {
    question: "What happens if the account is not as described?",
    answer:
      "Open a dispute from the order page before the inspection window closes. The escrow clock pauses, the funds stay held, and an escrow officer reviews the listing, the delivery record and the evidence from both sides. They can release, refund or split the hold.",
  },
  {
    question: "When does the seller get paid?",
    answer:
      "Only after you confirm custody, or after the inspection window expires with no dispute. Payouts settle to the seller's balance, and a 5% fee is deducted from the sale. Buyers pay no platform fee.",
  },
  {
    question: "Can I sell digital goods here?",
    answer:
      "Yes. Open a seller account, complete verification, and publish a listing with proof of custody. Every new listing is reviewed before it goes live, and payouts are held to the same escrow rules buyers see.",
  },
];




