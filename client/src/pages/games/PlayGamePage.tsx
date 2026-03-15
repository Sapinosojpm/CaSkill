import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/Button";
import { PageHero } from "../../components/ui/PageHero";
import { SectionCard } from "../../components/ui/SectionCard";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { getApiErrorMessage } from "../../utils/errors";
import { MemoryMatchGame } from "../../components/games/MemoryMatchGame";
import { QuizGame } from "../../components/games/QuizGame";
import { ReactionClickerGame } from "../../components/games/ReactionClickerGame";
import { useAttentionMonitor } from "../../utils/useAttentionMonitor";
import { endGameSession, fetchPlayableGame, startGameSession, submitGameScore } from "../../api/games.api";
import type { PlayableGame, StartSessionResponse, SubmitScoreResponse } from "../../api/games.types";

export function PlayGamePage() {
  const { gameId } = useParams();
  const { isAuthenticated } = useAuth();
  const [game, setGame] = useState<PlayableGame | null>(null);
  const [session, setSession] = useState<StartSessionResponse | null>(null);
  const [result, setResult] = useState<SubmitScoreResponse["score"] | null>(null);
  const [error, setError] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);
  const attention = useAttentionMonitor(Boolean(session));

  useEffect(() => {
    const currentGameId = gameId ?? "";
    if (!currentGameId) return;
    async function loadGame() {
      try {
        setGame(await fetchPlayableGame(currentGameId));
      } catch (requestError) {
        setError(getApiErrorMessage(requestError, "Unable to load playable game"));
      }
    }
    void loadGame();
  }, [gameId]);

  async function handleStartSession() {
    const currentGameId = gameId ?? "";
    if (!currentGameId) return;
    setIsStarting(true);
    setError("");
    try {
      setSession(await startGameSession(currentGameId));
      setResult(null);
      setHasFinished(false);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to start play session"));
    } finally {
      setIsStarting(false);
    }
  }

  async function handleFinish(resultInput: {
    score: number;
    durationSeconds: number;
    clientMeta: Record<string, unknown>;
  }) {
    const currentGameId = gameId ?? "";
    if (!session || !currentGameId || hasFinished) return;

    setHasFinished(true);

    try {
      const score = await submitGameScore({
        gameId: currentGameId,
        value: resultInput.score,
        durationSeconds: resultInput.durationSeconds,
        sessionToken: session.session.sessionToken,
        lookAwayCount: attention.lookAwayCount,
        faceVisibleRatio: attention.faceVisibleRatio,
        clientMeta: {
          ...resultInput.clientMeta,
          mediapipeReady: attention.isReady,
          lastWarning: attention.lastWarning,
        },
      });

      await endGameSession({
        sessionToken: session.session.sessionToken,
        lookAwayEvents: attention.lookAwayCount,
        faceDetectedRatio: attention.faceVisibleRatio,
      });

      setResult(score);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to submit score"));
    }
  }

  function renderGame() {
    switch (game?.playConfig.builtInGameKey) {
      case "memory-match":
        return <MemoryMatchGame onFinish={handleFinish} />;
      case "quiz-game":
        return <QuizGame onFinish={handleFinish} />;
      case "reaction-clicker":
        return <ReactionClickerGame onFinish={handleFinish} />;
      default:
        return <p className="text-sm text-[var(--color-muted)]">Uploaded game preview support will be expanded in a later hardening pass.</p>;
    }
  }

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Play Session"
        title={game?.title ?? `Launch ${gameId ?? "game"} in the browser`}
        description="This page manages playable builds, session tokens, score submission, and MediaPipe-backed attention monitoring."
      />
      {error ? <p className="text-sm text-[var(--color-error)]">{error}</p> : null}
      <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
        <SectionCard title="Game viewport" description="Uploaded or bundled game content will render here.">
          {!isAuthenticated ? (
            <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] p-6 text-sm text-[var(--color-muted)]">
              Login to start a protected play session and submit scores.
            </div>
          ) : !session ? (
            <div className="space-y-4">
              <p className="text-sm text-[var(--color-muted)]">Start a play session to unlock score submission and anti-cheat tracking.</p>
              <Button className="rounded-2xl" disabled={isStarting} onClick={handleStartSession} type="button">
                {isStarting ? "Starting..." : "Start Session"}
              </Button>
            </div>
          ) : (
            renderGame()
          )}
        </SectionCard>
        <SectionCard title="Anti-cheat HUD" description="Client-side signals will be sent alongside score submissions.">
          <div className="space-y-3">
            <StatusBadge label={attention.isReady ? "MediaPipe ready" : "Camera monitor pending"} tone={attention.isReady ? "success" : "warning"} />
            <StatusBadge label={`Look-away warnings: ${attention.lookAwayCount}`} tone="warning" />
            <StatusBadge label={`Face visible: ${Math.round(attention.faceVisibleRatio * 100)}%`} tone="primary" />
            {result ? (
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] p-4 text-sm">
                <p className="font-semibold text-[var(--color-text)]">Score submitted</p>
                <p className="mt-1 text-[var(--color-muted)]">
                  {result.value} points • {result.durationSeconds}s • status {result.status}
                </p>
                {result.cheatFlags.length ? (
                  <p className="mt-1 text-[var(--color-warning)]">Flags: {result.cheatFlags.map((item) => item.reason).join(" | ")}</p>
                ) : null}
              </div>
            ) : null}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}


