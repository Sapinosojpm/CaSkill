import clsx from "clsx";

type StatusTone = "primary" | "success" | "warning" | "error" | "muted";

const toneClassMap: Record<StatusTone, string> = {
  primary: "border-[rgba(232,255,71,0.25)] bg-[rgba(232,255,71,0.08)] text-[var(--color-primary)]",
  success: "border-[rgba(168,224,99,0.24)] bg-[rgba(168,224,99,0.08)] text-[var(--color-success)]",
  warning: "border-[rgba(255,159,67,0.24)] bg-[rgba(255,159,67,0.08)] text-[var(--color-warning)]",
  error: "border-[rgba(255,77,77,0.24)] bg-[rgba(255,77,77,0.08)] text-[var(--color-error)]",
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


