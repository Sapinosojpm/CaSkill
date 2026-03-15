import clsx from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link, type LinkProps } from "react-router-dom";

type ButtonTone = "primary" | "ghost" | "danger" | "success";
type ButtonSize = "sm" | "md" | "lg";

const toneClassMap: Record<ButtonTone, string> = {
  primary:
    "border border-[rgba(232,255,71,0.55)] bg-[var(--color-primary)] text-black shadow-[0_0_32px_rgba(232,255,71,0.16)] hover:brightness-[1.03]",
  ghost:
    "border border-[rgba(255,255,255,0.08)] bg-transparent text-[var(--color-text)] hover:border-[rgba(232,255,71,0.25)] hover:text-[var(--color-primary)]",
  danger:
    "border border-[rgba(255,77,77,0.35)] bg-[var(--color-error)] text-white hover:brightness-[1.02]",
  success:
    "border border-[rgba(168,224,99,0.35)] bg-[var(--color-success)] text-black hover:brightness-[1.02]",
};

const sizeClassMap: Record<ButtonSize, string> = {
  sm: "px-5 py-2.5 text-[12px]",
  md: "px-6 py-3 text-[12px]",
  lg: "px-8 py-4 text-[13px]",
};

type BaseProps = {
  tone?: ButtonTone;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
};

export function Button({
  tone = "primary",
  size = "md",
  className,
  children,
  ...props
}: BaseProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={clsx(
        "rounded-none font-black uppercase tracking-[0.24em] [font-family:var(--font-accent)] transition disabled:cursor-not-allowed disabled:opacity-60",
        toneClassMap[tone],
        sizeClassMap[size],
        tone === "primary" && "[clip-path:polygon(0_0,calc(100%-14px)_0,100%_14px,100%_100%,14px_100%,0_calc(100%-14px))]",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  tone = "primary",
  size = "md",
  className,
  children,
  ...props
}: BaseProps & LinkProps) {
  return (
    <Link
      className={clsx(
        "inline-flex items-center justify-center rounded-none font-black uppercase tracking-[0.24em] [font-family:var(--font-accent)] transition",
        toneClassMap[tone],
        sizeClassMap[size],
        tone === "primary" && "[clip-path:polygon(0_0,calc(100%-14px)_0,100%_14px,100%_100%,14px_100%,0_calc(100%-14px))]",
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}


