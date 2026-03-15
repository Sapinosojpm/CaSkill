import type { PropsWithChildren, ReactNode } from "react";

export function SectionCard({
  title,
  description,
  action,
  children,
}: PropsWithChildren<{
  title: string;
  description?: string;
  action?: ReactNode;
}>) {
  return (
    <section className="rounded-[28px] border border-[var(--color-border)] bg-[linear-gradient(180deg,rgba(17,17,16,0.98),rgba(12,12,10,0.98))] p-5 shadow-[0_14px_40px_rgba(0,0,0,0.22)]">
      <div className="flex flex-col gap-3 border-b border-[var(--color-border)] pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-[1.7rem] leading-none tracking-[0.02em] text-[var(--color-text)] [font-family:var(--font-bebas)]">{title}</h2>
          {description ? <p className="mt-1 text-sm leading-7 text-[var(--color-muted)]">{description}</p> : null}
        </div>
        {action}
      </div>
      <div className="pt-4">{children}</div>
    </section>
  );
}


