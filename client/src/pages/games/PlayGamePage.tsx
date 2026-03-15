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
import { ReactionDuelGame } from "../../components/games/ReactionDuelGame";
import { useAttentionMonitor } from "../../utils/useAttentionMonitor";
import { endGameSession, fetchPlayableGame, startGameSession, submitGameScore } from "../../api/games.api";
import { API_BASE_URL } from "../../api/api";
import type { PlayableGame, StartSessionResponse, SubmitScoreResponse } from "../../api/games.types";

const stakeOptions = [10, 25, 50];

export function PlayGamePage() {
  const { gameId } = useParams();
  const { isAuthenticated } = useAuth();
  const [game, setGame] = useState<PlayableGame | null>(null);
  const [session, setSession] = useState<StartSessionResponse | null>(null);
  const [result, setResult] = useState<SubmitScoreResponse["score"] | null>(null);
  const [error, setError] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);
  const [selectedStake, setSelectedStake] = useState<number | null>(null);
  const [cameraRequested, setCameraRequested] = useState(false);
  const attention = useAttentionMonitor(cameraRequested);

  const uploadOrigin = new URL(API_BASE_URL).origin;
  const estimatedPrizePool = selectedStake ? selectedStake * 2 : 0;
  const estimatedCreatorShare = Math.round(estimatedPrizePool * 0.05);
  const estimatedPlatformFee = Math.round(estimatedPrizePool * 0.1);
  const estimatedWinnerPayout = Math.max(0, estimatedPrizePool - estimatedCreatorShare - estimatedPlatformFee);
  const isReadyToStart = Boolean(selectedStake) && attention.isReady;

  function getCameraStatusLabel() {
    if (!cameraRequested) return "Camera required";
    if (attention.isReady) return "Anti-cheat ready";
    if (attention.lastWarning) return "Camera check failed";
    if (attention.isRunning) return "Camera active";
    return "Requesting camera access";
  }

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
    if (!selectedStake) {
      setError("Select a point stake before starting the match.");
      return;
    }
    if (!attention.isReady) {
      setError("Open your camera and wait for anti-cheat readiness before starting.");
      return;
    }
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
          stakePoints: selectedStake,
          projectedPrizePool: estimatedPrizePool,
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

  useEffect(() => {
    function handleUploadedGameMessage(event: MessageEvent) {
      if (event.origin !== uploadOrigin) {
        return;
      }

      const payload = event.data as
        | {
            type?: string;
            score?: number;
            durationSeconds?: number;
            clientMeta?: Record<string, unknown>;
          }
        | undefined;

      if (payload?.type !== "caskill:finish") {
        return;
      }

      if (typeof payload.score !== "number" || typeof payload.durationSeconds !== "number") {
        return;
      }

      void handleFinish({
        score: payload.score,
        durationSeconds: payload.durationSeconds,
        clientMeta: payload.clientMeta ?? {},
      });
    }

    window.addEventListener("message", handleUploadedGameMessage);
    return () => window.removeEventListener("message", handleUploadedGameMessage);
  }, [uploadOrigin, session, gameId, hasFinished, attention.lookAwayCount, attention.faceVisibleRatio, attention.isReady, attention.lastWarning]);

  function renderGame() {
    switch (game?.playConfig.builtInGameKey) {
      case "memory-match":
        return <MemoryMatchGame onFinish={handleFinish} />;
      case "quiz-game":
        return <QuizGame onFinish={handleFinish} />;
      case "reaction-clicker":
        return <ReactionClickerGame onFinish={handleFinish} />;
      case "reaction-duel":
        return <ReactionDuelGame onFinish={handleFinish} />;
      default:
        if (game?.buildPath && game.entryFile) {
          const normalizedEntryFile = game.entryFile.replace(/^\.?\//, "");
          const iframeSrc = `${uploadOrigin}${game.buildPath}/${normalizedEntryFile.replace(/^(dist|build)\//, "")}`;

          return (
            <div className="space-y-4">
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-3 text-sm text-[var(--color-muted)]">
                Uploaded game loaded from creator package. If the game posts a `caskill:finish` message, the score will be submitted automatically.
              </div>
              <iframe
                className="min-h-[720px] w-full rounded-3xl border border-[var(--color-border)] bg-white"
                src={iframeSrc}
                title={game.title}
              />
            </div>
          );
        }

        return <p className="text-sm text-[var(--color-muted)]">This uploaded game does not have a playable build path yet.</p>;
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
            <div className="space-y-5">
              <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-primary)]">Pre-match setup</p>
                <h3 className="mt-3 text-2xl font-semibold text-[var(--color-text)]">Choose your stake and verify your camera</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
                  Pick a point entry amount, open your camera for anti-cheat checks, then start the match when everything is ready.
                </p>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">Point stake</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {stakeOptions.map((stake) => (
                      <button
                        key={stake}
                        className={[
                          "rounded-2xl border px-4 py-3 text-sm font-semibold transition",
                          selectedStake === stake
                            ? "border-[rgba(232,255,71,0.45)] bg-[rgba(232,255,71,0.12)] text-[var(--color-primary)]"
                            : "border-[var(--color-border)] bg-[rgba(255,255,255,0.02)] text-[var(--color-text)]",
                        ].join(" ")}
                        onClick={() => {
                          setError("");
                          setSelectedStake(stake);
                        }}
                        type="button"
                      >
                        {stake} points
                      </button>
                    ))}
                  </div>
                  <div className="mt-5 space-y-2 text-sm text-[var(--color-muted)]">
                    <p>Prize pool: <span className="text-[var(--color-text)]">{estimatedPrizePool || "--"} points</span></p>
                    <p>Creator share: <span className="text-[var(--color-text)]">{selectedStake ? estimatedCreatorShare : "--"} points</span></p>
                    <p>Platform fee: <span className="text-[var(--color-text)]">{selectedStake ? estimatedPlatformFee : "--"} points</span></p>
                    <p>Projected winner payout: <span className="text-[var(--color-success)]">{selectedStake ? estimatedWinnerPayout : "--"} points</span></p>
                  </div>
                </div>

                <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">Camera verification</p>
                  <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
                    Anti-cheat needs camera access before the session starts. We check for face visibility and look-away events during play.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button
                      className="rounded-2xl !text-black"
                      onClick={() => {
                        setError("");
                        setCameraRequested(true);
                      }}
                      type="button"
                    >
                      {cameraRequested ? "Retry Camera" : "Open Camera"}
                    </Button>
                    <StatusBadge
                      label={getCameraStatusLabel()}
                      tone={attention.isReady ? "success" : attention.lastWarning ? "error" : "warning"}
                    />
                  </div>
                  {attention.lastWarning ? (
                    <p className="mt-3 text-sm text-[var(--color-warning)]">{attention.lastWarning}</p>
                  ) : null}
                </div>
              </div>

              <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">Ready checklist</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <StatusBadge label={selectedStake ? "Stake selected" : "Pick stake"} tone={selectedStake ? "success" : "warning"} />
                  <StatusBadge label={cameraRequested ? "Camera requested" : "Open camera"} tone={cameraRequested ? "success" : "warning"} />
                  <StatusBadge label={attention.isReady ? "Anti-cheat ready" : "Awaiting readiness"} tone={attention.isReady ? "success" : "warning"} />
                </div>
                <div className="mt-5">
                  <Button className="rounded-2xl !text-black" disabled={!isReadyToStart || isStarting} onClick={handleStartSession} type="button">
                    {isStarting ? "Starting..." : "Start Match"}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            renderGame()
          )}
        </SectionCard>
        <SectionCard title="Anti-cheat HUD" description="Client-side signals will be sent alongside score submissions.">
          <div className="space-y-3">
            <StatusBadge
              label={getCameraStatusLabel()}
              tone={attention.isReady ? "success" : attention.lastWarning ? "error" : "warning"}
            />
            <StatusBadge label={`Look-away warnings: ${attention.lookAwayCount}`} tone="warning" />
            <StatusBadge label={`Face visible: ${Math.round(attention.faceVisibleRatio * 100)}%`} tone="primary" />
            {selectedStake ? <StatusBadge label={`Stake: ${selectedStake} points`} tone="success" /> : null}
            {attention.lastWarning ? (
              <div className="rounded-2xl border border-[rgba(255,159,67,0.24)] bg-[rgba(255,159,67,0.08)] p-4 text-sm text-[var(--color-text)]">
                {attention.lastWarning}
              </div>
            ) : null}
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


