import Link from "next/link";

type Tone = "ink" | "paper";

interface WordmarkProps {
  href?: string;
  tone?: Tone;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: { mark: "h-7 w-7 text-[17px]", word: "text-[22px]" },
  md: { mark: "h-8 w-8 text-[24px]", word: "text-[28px]" },
  lg: { mark: "h-11 w-11 text-[28px]", word: "text-[38px]" },
};

export function Seal({ tone = "ink", className = "" }: { tone?: Tone; className?: string }) {
  const mark =
    tone === "ink" ? "bg-ink text-paper" : "bg-paper text-ink";
  return (
    <span
      aria-hidden
      className={`inline-flex items-center justify-center rounded-[2px] sd-display leading-none ${mark} ${className}`}
    >
      S
    </span>
  );
}

export default function Wordmark({
  href = "/",
  tone = "ink",
  className = "",
  size = "md",
}: WordmarkProps) {
  const s = sizes[size];
  const text = tone === "ink" ? "text-ink" : "text-paper";

  return (
    <Link
      href={href}
      aria-label="Safedeal home"
      className={`inline-flex items-center gap-2.5 ${text} ${className}`}
    >
      <Seal tone={tone} className={s.mark} />
      <span className={`sd-display ${s.word} tracking-[-0.03em]`}>Safedeal</span>
    </Link>
  );
}


