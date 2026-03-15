import { useEffect, useState } from "react";

export function ReactionClickerGame({
  onFinish,
}: {
  onFinish: (result: { score: number; durationSeconds: number; clientMeta: Record<string, unknown> }) => void;
}) {
  const [startedAt] = useState(() => Date.now());
  const [secondsLeft, setSecondsLeft] = useState(10);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (secondsLeft <= 0) {
      const durationSeconds = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
      onFinish({
        score,
        durationSeconds,
        clientMeta: { clicks: score },
      });
      return;
    }

    const timer = window.setTimeout(() => setSecondsLeft((current) => current - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [onFinish, score, secondsLeft, startedAt]);

  return (
    <div className="space-y-4 text-center">
      <p className="text-sm text-[var(--color-muted)]">Click fast before the timer ends.</p>
      <p className="text-4xl font-black text-[var(--color-primary)]">{secondsLeft}s</p>
      <button
        className="mx-auto flex h-44 w-44 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-primary)] text-2xl font-black text-black"
        onClick={() => setScore((current) => current + 1)}
        type="button"
      >
        {score}
      </button>
    </div>
  );
}


