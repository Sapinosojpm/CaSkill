import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ButtonLink } from "../../components/ui/Button";
import { SectionCard } from "../../components/ui/SectionCard";
import { StatusBadge } from "../../components/ui/StatusBadge";

const featureCards = [
  {
    title: "Public catalog",
    description:
      "Players browse approved games only. Admin-approved builds become visible to everyone.",
    tone: "primary" as const,
  },
  {
    title: "Creator uploads",
    description:
      "Creators upload ZIP packages built in their own IDEs with manifest, thumbnail, and production build files.",
    tone: "warning" as const,
  },
  {
    title: "Review workflow",
    description:
      "Admins inspect submissions, preview builds, review cheat flags, and control publishing status.",
    tone: "success" as const,
  },
];

const challenges = [
  { label: "Memory Match", pot: "120 pts", tone: "primary" as const },
  { label: "Quiz Duel", pot: "80 pts", tone: "warning" as const },
  { label: "Reaction Rush", pot: "64 pts", tone: "success" as const },
];

export function LandingPage() {
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const cardsRowOneRef = useRef<HTMLDivElement>(null);
  const cardsRowTwoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // ── Hero entrance timeline ──────────────────────────────────────────
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Eyebrow slides in from left
      tl.fromTo(
        eyebrowRef.current,
        { x: -28, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.7 },
      );

      // Headline lines stagger up
      const lines = headlineRef.current?.querySelectorAll("span");
      if (lines) {
        tl.fromTo(
          lines,
          { y: 56, opacity: 0, skewY: 3 },
          {
            y: 0,
            opacity: 1,
            skewY: 0,
            duration: 0.75,
            stagger: 0.1,
          },
          "-=0.3",
        );
      }

      // Body copy fades in
      tl.fromTo(
        bodyRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.65 },
        "-=0.4",
      );

      // CTAs scale in
      tl.fromTo(
        ctaRef.current?.children ?? [],
        { scale: 0.88, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: "back.out(1.4)",
        },
        "-=0.35",
      );

      // Phone card slides up with slight overshoot
      tl.fromTo(
        phoneRef.current,
        { y: 60, opacity: 0, rotateX: 8 },
        { y: 0, opacity: 1, rotateX: 0, duration: 0.9, ease: "power4.out" },
        "-=0.7",
      );

      // ── Scroll-triggered card rows ──────────────────────────────────────
      [cardsRowOneRef, cardsRowTwoRef].forEach((rowRef) => {
        const cards = rowRef.current?.children;
        if (!cards) return;
        gsap.fromTo(
          cards,
          { y: 44, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: rowRef.current,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          },
        );
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="space-y-20">
      {/* ── HERO ── */}
      <section className="grid min-h-[78vh] items-center gap-16 xl:grid-cols-[0.9fr_1.1fr]">
        {/* Left column */}
        <div className="max-w-3xl space-y-9 pl-0 xl:pl-6">
          {/* Eyebrow */}
          <div
            ref={eyebrowRef}
            className="inline-flex items-center gap-3 opacity-0"
          >
            <span className="h-px w-8 bg-[var(--color-success)]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--color-success)] font-mono">
              Skill-based browser competition
            </span>
          </div>

          {/* Headline */}
          <h1
            ref={headlineRef}
            className="overflow-hidden [font-family:var(--font-bebas)] text-[5.4rem] uppercase leading-[0.86] tracking-[-0.02em] text-[var(--color-text)] sm:text-[7.2rem] xl:text-[8rem]"
          >
            <span className="block translate-y-14 opacity-0">Bet</span>
            <span className="mt-1 block translate-y-14 opacity-0 text-[var(--color-success)] drop-shadow-[0_0_48px_rgba(168,224,99,0.22)]">
              On
            </span>
            <span className="mt-2 block translate-y-14 opacity-0 text-transparent [-webkit-text-stroke:2px_#f0efe8]">
              Yourself
            </span>
          </h1>

          {/* Body */}
          <div
            ref={bodyRef}
            className="max-w-md space-y-3 text-[0.975rem] leading-[1.85] tracking-[0.01em] text-[rgba(240,239,232,0.44)] opacity-0"
          >
            <p>Challenge players in memory, quiz, and reaction games.</p>
            <p>
              Creators upload builds, admins review them, and anti-cheat keeps
              every run accountable.
            </p>
          </div>

          {/* CTAs */}
          <div ref={ctaRef} className="flex flex-wrap gap-3.5">
            <ButtonLink
              className="min-w-[160px] !text-black"
              size="lg"
              to="/register"
            >
              Join Now
            </ButtonLink>
            <ButtonLink
              className="min-w-[174px]"
              size="lg"
              to="/games"
              tone="ghost"
            >
              See The Games
            </ButtonLink>
          </div>
        </div>

        {/* Right column — phone mockup */}
        <div className="flex justify-center xl:justify-end">
          <div className="relative pr-0 xl:pr-16">
            {/* Ambient glow */}
            <div className="pointer-events-none absolute inset-6 rounded-full bg-[rgba(168,224,99,0.06)] blur-[120px]" />

            <div
              ref={phoneRef}
              className="relative w-[308px] rounded-[38px] border border-[rgba(255,255,255,0.07)] bg-[linear-gradient(180deg,rgba(24,24,22,0.97),rgba(10,10,8,0.97))] p-5 opacity-0 shadow-[0_48px_130px_rgba(0,0,0,0.65)]"
              style={{ transform: "perspective(900px)" }}
            >
              {/* Notch */}
              <div className="mx-auto mb-7 h-[5px] w-16 rounded-full bg-black/70" />

              <div className="space-y-4">
                {/* Section label */}
                <p className="text-[9.5px] uppercase tracking-[0.36em] text-[var(--color-muted)] font-mono">
                  Active Challenges
                </p>

                {/* Challenge cards */}
                <div className="space-y-2.5">
                  {challenges.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-[20px] border border-[rgba(255,255,255,0.05)] bg-black/30 px-3.5 py-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[1.35rem] leading-none tracking-[0.01em] text-[var(--color-text)] [font-family:var(--font-bebas)]">
                            {item.label}
                          </p>
                          <p className="mt-[5px] text-[9px] uppercase tracking-[0.2em] text-[var(--color-muted)] font-mono">
                            Live lobby · waiting for players
                          </p>
                        </div>
                        <StatusBadge label={item.pot} tone={item.tone} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Platform flow */}
                <div className="rounded-[20px] border border-[rgba(255,255,255,0.05)] bg-black/30 px-3.5 py-4">
                  <p className="text-[9.5px] uppercase tracking-[0.32em] text-[var(--color-muted)] font-mono">
                    Platform Flow
                  </p>
                  <ol className="mt-3.5 space-y-2 text-[0.78rem] leading-snug text-[var(--color-text)]">
                    <li className="flex items-start gap-2">
                      <span className="mt-px text-[9px] font-bold text-[var(--color-success)] font-mono">
                        01
                      </span>
                      Creator uploads ZIP build
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-px text-[9px] font-bold text-[var(--color-success)] font-mono">
                        02
                      </span>
                      Admin reviews and publishes
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-px text-[9px] font-bold text-[var(--color-success)] font-mono">
                        03
                      </span>
                      Players compete and submit scores
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ROLE CARDS ── */}
      <div ref={cardsRowOneRef} className="grid gap-4 md:grid-cols-3">
        <SectionCard
          title="For players"
          description="Browse approved games, start sessions, submit scores, and climb leaderboards."
        >
          <StatusBadge label="Catalog + Leaderboards" tone="success" />
        </SectionCard>
        <SectionCard
          title="For creators"
          description="Upload ZIP builds from your own IDE, track review state, and publish to the catalog."
        >
          <StatusBadge label="ZIP Upload Workflow" tone="warning" />
        </SectionCard>
        <SectionCard
          title="For admins"
          description="Review submissions, moderate cheat flags, and approve or reject releases."
        >
          <StatusBadge label="Review + Moderation" tone="primary" />
        </SectionCard>
      </div>

      {/* ── FEATURE CARDS ── */}
      <div ref={cardsRowTwoRef} className="grid gap-4 lg:grid-cols-3">
        {featureCards.map((card) => (
          <SectionCard
            key={card.title}
            title={card.title}
            description={card.description}
          >
            <StatusBadge label="Ready for next phases" tone={card.tone} />
          </SectionCard>
        ))}
      </div>
    </div>
  );
}
