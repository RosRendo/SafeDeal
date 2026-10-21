import Link from "next/link";
import { CatalogListingItem } from "@/lib/catalogData";

const money = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);

interface ListingCardProps {
  listing: CatalogListingItem;
  variant?: "feature" | "default" | "compact";
  className?: string;
  showSeller?: boolean;
}

export default function ListingCard({
  listing,
  variant = "default",
  className = "",
  showSeller = true,
}: ListingCardProps) {
  const aspect =
    variant === "feature"
      ? "aspect-[16/10]"
      : variant === "compact"
      ? "aspect-[4/5]"
      : "aspect-[4/3]";

  const titleSize =
    variant === "feature"
      ? "text-[24px] sm:text-[30px] sd-display leading-[1.12]"
      : variant === "compact"
      ? "text-[16px] leading-snug font-medium"
      : "text-[16px] leading-snug font-medium";

  const fact =
    listing.deliveryType === "instant"
      ? "Instant, automated handover"
      : listing.deliveryTimeText || "Human-assisted handover";

  const meta =
    variant === "feature" && listing.rank
      ? `${listing.rank} · ${listing.region}`
      : listing.platform && listing.region
      ? `${listing.platform} · ${listing.region}`
      : listing.platform || listing.region;

  return (
    <article className={`group ${className}`}>
      <Link
        href={`/listing/${listing.id}`}
        className="block focus-visible:outline-offset-4"
      >
        <div className={`relative overflow-hidden bg-paper-2 ${aspect}`}>
          <img
            src={listing.image}
            alt={listing.imageAlt || listing.title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.035]"
          />
          <span className="absolute left-3 top-3 bg-paper px-2 py-1 text-[13px] font-semibold leading-none text-ink">
            {listing.deliveryType === "instant" ? "Instant vault" : "Escrow handover"}
          </span>
        </div>

        <div className="pt-4">
          <div className="flex items-start justify-between gap-4">
            <p className={titleSize}>
              {variant === "feature"
                ? listing.title.split(" | ")[0]
                : listing.title}
            </p>
            <span className="whitespace-nowrap text-[16px] font-semibold tabular-nums">
              {money(listing.price)}
            </span>
          </div>

          {variant === "feature" && (
            <p className="mt-3 max-w-[52ch] text-[16px] leading-relaxed text-ink-2">
              {listing.description ||
                "Verified by Safedeal and protected by a 48-hour escrow inspection window."}
            </p>
          )}

          <p className="mt-2 text-[13px] text-ink-2">{meta}</p>

          <div className="mt-3 flex items-center justify-between gap-3 text-[13px]">
            {showSeller ? (
              <span className="text-ink-2">
                {listing.seller?.name || "Verified seller"}
              </span>
            ) : (
              <span className="text-ink-2">{fact}</span>
            )}
            <span className="font-medium text-cobalt">View listing →</span>
          </div>
        </div>
      </Link>
    </article>
  );
}


