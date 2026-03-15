import { useEffect, useState } from "react";
import type { GameFinishHandler } from "./types";

const symbols = ["A", "A", "B", "B", "C", "C", "D", "D"];

function shuffle<T>(items: T[]) {
  return [...items]
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
}

export function MemoryMatchGame({
  onFinish,
}: {
  onFinish: GameFinishHandler;
}) {
  const [deck] = useState(() => shuffle(symbols));
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [startedAt] = useState(() => Date.now());

  useEffect(() => {
    if (flipped.length !== 2) return;
    const [a, b] = flipped;

    if (deck[a] === deck[b]) {
      setMatched((current) => [...current, a, b]);
      setFlipped([]);
      return;
    }

    const timer = window.setTimeout(() => setFlipped([]), 700);
    return () => window.clearTimeout(timer);
  }, [deck, flipped]);

  useEffect(() => {
    if (matched.length === deck.length) {
      const durationSeconds = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
      const score = Math.max(100, 1000 - moves * 20 - durationSeconds * 5);
      onFinish({
        score,
        durationSeconds,
        clientMeta: { moves, matchedPairs: matched.length / 2 },
      });
    }
  }, [deck.length, matched.length, moves, onFinish, startedAt]);

  function flipCard(index: number) {
    if (flipped.includes(index) || matched.includes(index) || flipped.length === 2) return;
    setFlipped((current) => [...current, index]);
    setMoves((current) => current + 1);
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--color-muted)]">Match all pairs as quickly as possible.</p>
      <div className="grid grid-cols-4 gap-3">
        {deck.map((symbol, index) => {
          const revealed = flipped.includes(index) || matched.includes(index);
          return (
            <button
              key={`${symbol}-${index}`}
              className="aspect-square rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] text-xl font-bold"
              onClick={() => flipCard(index)}
              type="button"
            >
              {revealed ? symbol : "?"}
            </button>
          );
        })}
      </div>
      <p className="text-sm text-[var(--color-muted)]">Moves: {moves}</p>
    </div>
  );
}


