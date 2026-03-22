import clsx from "clsx";

type StatusTone = "primary" | "success" | "warning" | "error" | "muted";

const toneClassMap: Record<StatusTone, string> = {
  primary: "border-[var(--color-primary)]/30 bg-[var(--color-primary)] !text-black shadow-[0_4px_12px_rgba(232,255,71,0.1)]",
  success: "border-[var(--color-success)]/30 bg-[var(--color-success)]/15 text-[var(--color-success)]",
  warning: "border-[var(--color-warning)]/30 bg-[var(--color-warning)] !text-black shadow-[0_4px_12px_rgba(255,159,67,0.1)]",
  error: "border-[var(--color-error)]/30 bg-[var(--color-error)]/15 text-[var(--color-error)]",
  muted: "border-[var(--color-border)] bg-[var(--color-surface-strong)] text-[var(--color-muted)]",
};

export function StatusBadge({
  label,
  tone = "muted",
  className,
}: {
  label: string;
  tone?: StatusTone;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] font-mono",
        toneClassMap[tone],
        className,
      )}
    >
      {label}
    </span>
  );
}


