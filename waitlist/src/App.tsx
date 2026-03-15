import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

type WaitlistRole = "PLAYER" | "CREATOR";

type WaitlistForm = {
  name: string;
  email: string;
  role: WaitlistRole;
  note: string;
  wantsUpdates: boolean;
};

const initialForm: WaitlistForm = {
  name: "",
  email: "",
  role: "PLAYER",
  note: "",
  wantsUpdates: true,
};

const highlights = [
  {
    title: "Fair competition",
    description: "Multi-layer anti-cheat combines liveness checks, eye-tracking, pose estimation, and background scanning.",
  },
  {
    title: "Points, not luck",
    description: "Players purchase points to join matches, compete in challenges, and win through skill alone.",
  },
  {
    title: "Creator economy",
    description: "Users can build custom games and earn 5% every time other players jump into their experiences.",
  },
];

const launchSteps = [
  "Join the early access list",
  "Get invited by release wave",
  "Create your profile and start competing",
];

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

function App() {
  const [form, setForm] = useState<WaitlistForm>(initialForm);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    playerCount: 0,
    creatorCount: 0,
  });

  const roleCopy = useMemo(
    () =>
      form.role === "CREATOR"
        ? "You will be first in line for creator tools, game publishing access, and 5% creator-earn onboarding."
        : "You will be first in line for point-based matches, competitive game drops, and early player access.",
    [form.role],
  );

  async function loadStats() {
    const response = await fetch(`${API_BASE_URL}/waitlist/stats`);

    if (!response.ok) {
      throw new Error("Unable to load waitlist stats");
    }

    const data = (await response.json()) as typeof stats;
    setStats(data);
  }

  useEffect(() => {
    void loadStats();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setStatus("loading");
      setMessage("");

      const response = await fetch(`${API_BASE_URL}/waitlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const errorPayload = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(errorPayload?.message ?? "Unable to join the waitlist");
      }

      const data = (await response.json()) as {
        stats: typeof stats;
      };

      setStats(data.stats);
      setStatus("success");
      setMessage("You are in. Your waitlist entry has been saved to the backend.");
      setForm(initialForm);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to join the waitlist");
    }
  }

  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(232,255,71,0.16),transparent_26%),radial-gradient(circle_at_85%_18%,rgba(168,224,99,0.12),transparent_18%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-[1600px] flex-col px-6 py-6 lg:px-10">
        <header className="flex items-center justify-between border-b border-[rgba(255,255,255,0.06)] pb-5">
          <div className="text-[2.2rem] font-black uppercase leading-none tracking-[0.03em] [font-family:var(--font-display)]">
            <span className="text-[var(--color-text)]">CA</span>
            <span className="text-[var(--color-success)]">SKILL</span>
          </div>
          <div className="rounded-full border border-[rgba(168,224,99,0.24)] bg-[rgba(168,224,99,0.08)] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.32em] text-[var(--color-success)]">
            Waitlist Open
          </div>
        </header>

        <section className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3">
              <span className="h-px w-10 bg-[var(--color-success)]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--color-success)] [font-family:var(--font-mono)]">
                Skill-based point competition
              </span>
            </div>

            <div className="space-y-5">
              <h1 className="[font-family:var(--font-bebas)] text-[4.4rem] uppercase leading-[0.86] tracking-[-0.02em] text-[var(--color-text)] sm:text-[5.8rem] xl:text-[7rem]">
                Be early.
                <br />
                Play for points.
                <br />
                <span className="text-[var(--color-success)] drop-shadow-[0_0_48px_rgba(168,224,99,0.22)]">
                  Win by skill.
                </span>
              </h1>
              <p className="max-w-xl text-[1rem] leading-8 text-[rgba(240,239,232,0.58)]">
                CaSkill is a skill-based competitive gaming platform where players go head-to-head in point-based
                challenges. Users purchase points to enter games like Chess, Quiz, or Push-ups, and the stronger
                player takes the win.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {highlights.map((item) => (
                <article
                  key={item.title}
                  className="rounded-[24px] border border-[rgba(255,255,255,0.06)] bg-[linear-gradient(180deg,rgba(17,17,16,0.96),rgba(12,12,10,0.96))] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.24)]"
                >
                  <p className="text-[0.95rem] font-black uppercase tracking-[0.18em] text-[var(--color-text)] [font-family:var(--font-accent)]">
                    {item.title}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">{item.description}</p>
                </article>
              ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-[0.75fr_1.25fr]">
              <div className="rounded-[28px] border border-[rgba(255,255,255,0.06)] bg-[rgba(9,9,8,0.88)] p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-[var(--color-success)] [font-family:var(--font-mono)]">
                  Release flow
                </p>
                <ol className="mt-4 space-y-4">
                  {launchSteps.map((step, index) => (
                    <li key={step} className="flex items-start gap-3">
                      <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full border border-[rgba(168,224,99,0.24)] bg-[rgba(168,224,99,0.1)] text-[11px] font-bold text-[var(--color-success)]">
                        {index + 1}
                      </span>
                      <span className="text-sm leading-7 text-[var(--color-text)]">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="relative overflow-hidden rounded-[28px] border border-[rgba(255,255,255,0.06)] bg-[linear-gradient(135deg,rgba(232,255,71,0.12),rgba(17,17,16,0.88)_35%,rgba(12,12,10,0.95))] p-5">
                <div className="absolute right-5 top-5 rounded-full border border-[rgba(255,255,255,0.08)] px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-[var(--color-muted)]">
                  {stats.total} waiting
                </div>
                <p className="max-w-[20rem] text-[1.8rem] leading-tight text-[var(--color-text)] [font-family:var(--font-bebas)]">
                  Built for players who want fair competition and creators who want a real earning model.
                </p>
                <div className="mt-8 grid grid-cols-3 gap-3">
                  <div className="rounded-[22px] border border-[rgba(255,255,255,0.06)] bg-black/20 p-4">
                    <p className="text-2xl font-black text-[var(--color-success)]">{stats.playerCount}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">Players waiting</p>
                  </div>
                  <div className="rounded-[22px] border border-[rgba(255,255,255,0.06)] bg-black/20 p-4">
                    <p className="text-2xl font-black text-[var(--color-warning)]">{stats.creatorCount}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">Creators waiting</p>
                  </div>
                  <div className="rounded-[22px] border border-[rgba(255,255,255,0.06)] bg-black/20 p-4">
                    <p className="text-2xl font-black text-[var(--color-text)]">{stats.total}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">Total queued</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:pl-8">
            <section className="rounded-[32px] border border-[rgba(255,255,255,0.07)] bg-[linear-gradient(180deg,rgba(17,17,16,0.98),rgba(10,10,8,0.98))] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.32)] sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--color-border)] pb-5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.34em] text-[var(--color-success)] [font-family:var(--font-mono)]">
                    Join the queue
                  </p>
                  <h2 className="mt-3 text-[2.3rem] leading-none text-[var(--color-text)] [font-family:var(--font-bebas)]">
                    Reserve your spot
                  </h2>
                  <p className="mt-2 max-w-sm text-sm leading-7 text-[var(--color-muted)]">
                    Join the early queue for point-based competition, custom games, and real-time matches. Every
                    signup is saved in your backend database, and the live total updates from the API.
                  </p>
                </div>
                <div className="rounded-full border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-[var(--color-muted)]">
                  Beta intake
                </div>
              </div>

              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                <label className="block">
                  <span className="mb-2 block text-sm text-[var(--color-muted)]">Name</span>
                  <input
                    className="w-full rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-3.5 text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)]"
                    value={form.name}
                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                    placeholder="Your name"
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm text-[var(--color-muted)]">Email</span>
                  <input
                    className="w-full rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-3.5 text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)]"
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                    placeholder="you@example.com"
                    required
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm text-[var(--color-muted)]">Joining as</span>
                    <select
                      className="w-full rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-3.5 text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)]"
                      value={form.role}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          role: event.target.value as WaitlistRole,
                        }))
                      }
                    >
                      <option value="PLAYER">Player</option>
                      <option value="CREATOR">Creator</option>
                    </select>
                  </label>

                  <div className="rounded-[20px] border border-[rgba(168,224,99,0.18)] bg-[rgba(168,224,99,0.08)] px-4 py-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--color-success)] [font-family:var(--font-mono)]">
                      Queue note
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[var(--color-text)]">{roleCopy}</p>
                  </div>
                </div>

                <label className="block">
                  <span className="mb-2 block text-sm text-[var(--color-muted)]">What are you most interested in?</span>
                  <textarea
                    className="min-h-32 w-full resize-y rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-3.5 text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)]"
                    value={form.note}
                    onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
                    placeholder="Chess, quiz battles, push-up challenges, creator tools, anti-cheat, live matches..."
                  />
                </label>

                <label className="flex items-start gap-3 rounded-[20px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-4 py-4">
                  <input
                    className="mt-1 h-4 w-4 accent-[var(--color-primary)]"
                    type="checkbox"
                    checked={form.wantsUpdates}
                    onChange={(event) => setForm((current) => ({ ...current, wantsUpdates: event.target.checked }))}
                  />
                  <span className="text-sm leading-7 text-[var(--color-muted)]">
                    Send me launch updates, new challenge drops, creator program news, and player onboarding notices.
                  </span>
                </label>

                <button
                  className="w-full rounded-none border border-[rgba(232,255,71,0.55)] bg-[var(--color-primary)] px-6 py-4 text-[13px] font-black uppercase tracking-[0.24em] text-black transition hover:brightness-[1.03] [clip-path:polygon(0_0,calc(100%-14px)_0,100%_14px,100%_100%,14px_100%,0_calc(100%-14px))] [font-family:var(--font-accent)]"
                  disabled={status === "loading"}
                  type="submit"
                >
                  {status === "loading" ? "Joining..." : "Join Waitlist"}
                </button>

                {message ? (
                  <div
                    className={[
                      "rounded-[20px] px-4 py-4 text-sm leading-7",
                      status === "error"
                        ? "border border-[rgba(255,77,77,0.24)] bg-[rgba(255,77,77,0.08)] text-[var(--color-text)]"
                        : "border border-[rgba(168,224,99,0.24)] bg-[rgba(168,224,99,0.08)] text-[var(--color-text)]",
                    ].join(" ")}
                  >
                    {message}
                  </div>
                ) : null}
              </form>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

export default App;
