import type { ReactNode } from "react";

export function PageHero({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden rounded-[34px] border border-[var(--color-border)] bg-[linear-gradient(135deg,rgba(232,255,71,0.12),rgba(17,17,16,0.94)_34%,rgba(17,17,16,1))] px-6 py-7 shadow-[0_18px_70px_rgba(0,0,0,0.32)] sm:px-8 sm:py-8">
      <div className="pointer-events-none absolute -right-16 top-0 h-44 w-44 rounded-full bg-[rgba(232,255,71,0.08)] blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-32 rounded-full bg-[rgba(255,159,67,0.06)] blur-3xl" />
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--color-primary)]">{eyebrow}</p>
      <div className="relative mt-5 grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div className="max-w-3xl">
          <h1 className="max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-8 text-[var(--color-muted)] sm:text-base">{description}</p>
        </div>
        {actions ? <div className="flex flex-wrap gap-3 lg:justify-end">{actions}</div> : null}
      </div>
    </section>
  );
}


