import { useMemo, useState } from "react";
import type { GameFinishHandler } from "./types";

const questions = [
  { prompt: "What stack powers this MVP backend?", options: ["MERN", "PERN", "LAMP", "JAMstack"], answer: "PERN" },
  { prompt: "Which role approves games?", options: ["Player", "Creator", "Admin", "Guest"], answer: "Admin" },
  { prompt: "What upload format do creators submit?", options: ["RAR", "ZIP", "7z", "tar"], answer: "ZIP" },
];

export function QuizGame({
  onFinish,
}: {
  onFinish: GameFinishHandler;
}) {
  const [startedAt] = useState(() => Date.now());
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  const question = questions[index];
  const progress = useMemo(() => `${index + 1}/${questions.length}`, [index]);

  function answer(option: string) {
    const nextCorrect = question.answer === option ? correct + 1 : correct;
    const nextAnswers = [...answers, option];
    setCorrect(nextCorrect);
    setAnswers(nextAnswers);

    if (index === questions.length - 1) {
      const durationSeconds = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
      onFinish({
        score: nextCorrect * 50,
        durationSeconds,
        clientMeta: { correctAnswers: nextCorrect, answers: nextAnswers },
      });
      return;
    }

    setIndex((current) => current + 1);
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--color-muted)]">Question {progress}</p>
      <h3 className="text-xl font-semibold">{question.prompt}</h3>
      <div className="grid gap-3">
        {question.options.map((option) => (
          <button
            key={option}
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-3 text-left"
            onClick={() => answer(option)}
            type="button"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}


