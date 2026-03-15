import { useEffect, useMemo, useState } from "react";

type DuelRound = {
  id: number;
  target: "LEFT" | "RIGHT";
  resolved: boolean;
  winner: "LEFT" | "RIGHT" | "TIE" | null;
  leftMs: number | null;
  rightMs: number | null;
};

const TOTAL_ROUNDS = 5;
const LEFT_KEY = "q";
const RIGHT_KEY = "p";

function createRounds(): DuelRound[] {
  return Array.from({ length: TOTAL_ROUNDS }, (_, index) => ({
    id: index + 1,
    target: Math.random() > 0.5 ? "LEFT" : "RIGHT",
    resolved: false,
    winner: null,
    leftMs: null,
    rightMs: null,
  }));
}

export function ReactionDuelGame({
  onFinish,
}: {
  onFinish: (result: { score: number; durationSeconds: number; clientMeta: Record<string, unknown> }) => void;
}) {
  const [startedAt] = useState(() => Date.now());
  const [rounds, setRounds] = useState<DuelRound[]>(() => createRounds());
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [roundStartedAt, setRoundStartedAt] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [isLive, setIsLive] = useState(false);

  const currentRound = rounds[currentRoundIndex];

  const leftWins = useMemo(
    () => rounds.filter((round) => round.winner === "LEFT").length,
    [rounds],
  );
  const rightWins = useMemo(
    () => rounds.filter((round) => round.winner === "RIGHT").length,
    [rounds],
  );

  useEffect(() => {
    if (!currentRound || currentRound.resolved) {
      return;
    }

    setCountdown(3);
    setIsLive(false);
    setRoundStartedAt(null);

    const countdownTimers = [1, 2, 3].map((step) =>
      window.setTimeout(() => {
        setCountdown(3 - step);
      }, step * 700),
    );

    const goTimer = window.setTimeout(() => {
      setIsLive(true);
      setRoundStartedAt(Date.now());
    }, 2800);

    return () => {
      countdownTimers.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(goTimer);
    };
  }, [currentRound?.id, currentRound?.resolved]);

  useEffect(() => {
    if (!currentRound || !isLive || !roundStartedAt) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      const key = event.key.toLowerCase();
      if (key !== LEFT_KEY && key !== RIGHT_KEY) {
        return;
      }

      const activeStartedAt = roundStartedAt;
      if (!activeStartedAt) {
        return;
      }

      setRounds((current) => {
        const next = [...current];
        const activeRound = next[currentRoundIndex];

        if (!activeRound || activeRound.resolved) {
          return current;
        }

        const reactionMs = Date.now() - activeStartedAt;

        if (key === LEFT_KEY && activeRound.leftMs === null) {
          activeRound.leftMs = reactionMs;
        }

        if (key === RIGHT_KEY && activeRound.rightMs === null) {
          activeRound.rightMs = reactionMs;
        }

        const hasBothInputs = activeRound.leftMs !== null && activeRound.rightMs !== null;

        if (hasBothInputs) {
          activeRound.resolved = true;

          const leftCorrect = activeRound.target === "LEFT";
          const rightCorrect = activeRound.target === "RIGHT";

          const leftScore = leftCorrect ? activeRound.leftMs ?? Number.MAX_SAFE_INTEGER : Number.MAX_SAFE_INTEGER;
          const rightScore = rightCorrect ? activeRound.rightMs ?? Number.MAX_SAFE_INTEGER : Number.MAX_SAFE_INTEGER;

          if (leftScore === rightScore) {
            activeRound.winner = "TIE";
          } else if (leftScore < rightScore) {
            activeRound.winner = "LEFT";
          } else if (rightScore < leftScore) {
            activeRound.winner = "RIGHT";
          } else {
            activeRound.winner = "TIE";
          }
        }

        return next;
      });
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentRound, currentRoundIndex, isLive, roundStartedAt]);

  useEffect(() => {
    if (!currentRound?.resolved) {
      return;
    }

    if (currentRoundIndex === rounds.length - 1) {
      const durationSeconds = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
      const score = leftWins * 100 + Math.max(0, 300 - rounds.reduce((total, round) => total + (round.leftMs ?? 300), 0));

      onFinish({
        score,
        durationSeconds,
        clientMeta: {
          mode: "local-1v1",
          leftWins,
          rightWins,
          rounds: rounds.map((round) => ({
            round: round.id,
            target: round.target,
            winner: round.winner,
            leftMs: round.leftMs,
            rightMs: round.rightMs,
          })),
        },
      });

      return;
    }

    const timer = window.setTimeout(() => {
      setCurrentRoundIndex((value) => value + 1);
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [currentRound?.resolved, currentRoundIndex, leftWins, onFinish, rightWins, rounds, startedAt]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-muted)]">1v1 duel</p>
          <p className="mt-1 text-lg font-semibold text-[var(--color-text)]">
            Round {Math.min(currentRoundIndex + 1, TOTAL_ROUNDS)} of {TOTAL_ROUNDS}
          </p>
        </div>
        <div className="flex gap-3">
          <div className="rounded-2xl border border-[rgba(168,224,99,0.22)] bg-[rgba(168,224,99,0.08)] px-4 py-3 text-center">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-success)]">Left</p>
            <p className="mt-1 text-2xl font-semibold text-[var(--color-text)]">{leftWins}</p>
          </div>
          <div className="rounded-2xl border border-[rgba(255,159,67,0.22)] bg-[rgba(255,159,67,0.08)] px-4 py-3 text-center">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-warning)]">Right</p>
            <p className="mt-1 text-2xl font-semibold text-[var(--color-text)]">{rightWins}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[28px] border border-[var(--color-border)] bg-[linear-gradient(180deg,rgba(17,17,16,0.98),rgba(10,10,8,0.98))] p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-muted)]">Player 1</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--color-text)]">Left Side</p>
          <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
            Press <span className="text-[var(--color-success)]">Q</span> when the target points LEFT.
          </p>
        </div>
        <div className="rounded-[28px] border border-[var(--color-border)] bg-[linear-gradient(180deg,rgba(17,17,16,0.98),rgba(10,10,8,0.98))] p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-muted)]">Player 2</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--color-text)]">Right Side</p>
          <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
            Press <span className="text-[var(--color-warning)]">P</span> when the target points RIGHT.
          </p>
        </div>
      </div>

      <div className="rounded-[32px] border border-[var(--color-border)] bg-[linear-gradient(135deg,rgba(232,255,71,0.1),rgba(17,17,16,0.92)_36%,rgba(17,17,16,1))] px-6 py-8 text-center">
        <p className="text-xs uppercase tracking-[0.28em] text-[var(--color-muted)]">Target direction</p>
        <p className="mt-5 text-7xl font-black text-[var(--color-text)]">
          {currentRound?.target === "LEFT" ? "←" : "→"}
        </p>
        <p className="mt-5 text-sm leading-7 text-[var(--color-muted)]">
          Both players react at the same time. Correct side plus faster reaction wins the round.
        </p>
        <div className="mt-6">
          {!isLive ? (
            <p className="text-2xl font-semibold text-[var(--color-primary)]">{countdown === 0 ? "READY" : countdown}</p>
          ) : currentRound?.resolved ? (
            <p className="text-2xl font-semibold text-[var(--color-success)]">
              {currentRound.winner === "LEFT"
                ? "Left player wins the round"
                : currentRound.winner === "RIGHT"
                  ? "Right player wins the round"
                  : "Round tied"}
            </p>
          ) : (
            <p className="text-2xl font-semibold text-[var(--color-success)]">GO</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {rounds.map((round) => (
          <div
            key={round.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-3"
          >
            <div>
              <p className="font-semibold text-[var(--color-text)]">Round {round.id}</p>
              <p className="text-sm text-[var(--color-muted)]">Target {round.target === "LEFT" ? "left" : "right"}</p>
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="rounded-full border border-[rgba(168,224,99,0.22)] px-3 py-1 text-[var(--color-success)]">
                L {round.leftMs !== null ? `${round.leftMs}ms` : "--"}
              </span>
              <span className="rounded-full border border-[rgba(255,159,67,0.22)] px-3 py-1 text-[var(--color-warning)]">
                R {round.rightMs !== null ? `${round.rightMs}ms` : "--"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
