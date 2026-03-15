import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { ButtonLink } from "../../components/ui/Button";
import { PageHero } from "../../components/ui/PageHero";
import { SectionCard } from "../../components/ui/SectionCard";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import { getApiErrorMessage } from "../../utils/errors";
import { cancelMatchmaking, fetchGame, fetchMatchmakingStatus, findMatchmaking } from "../../api/games.api";
import type { GameItem, MatchmakingStatus } from "../../api/games.types";

const stakeOptions = [10, 25, 50];

export function GameDetailPage() {
  const { gameId } = useParams();
  const { isAuthenticated, user } = useAuth();
  const [game, setGame] = useState<GameItem | null>(null);
  const [error, setError] = useState("");
  const [matchError, setMatchError] = useState("");
  const [isFindingMatch, setIsFindingMatch] = useState(false);
  const [selectedStake, setSelectedStake] = useState(10);
  const [matchmaking, setMatchmaking] = useState<MatchmakingStatus["match"]>(null);

  useEffect(() => {
    const currentGameId = gameId ?? "";
    if (!currentGameId) return;

    async function loadGame() {
      try {
        setGame(await fetchGame(currentGameId));
      } catch (requestError) {
        setError(getApiErrorMessage(requestError, "Unable to load game"));
      }
    }

    void loadGame();
  }, [gameId]);

  useEffect(() => {
    if (!gameId || !isAuthenticated || user?.role !== "PLAYER" || !matchmaking || matchmaking.status !== "WAITING") {
      return;
    }

    const interval = window.setInterval(async () => {
      try {
        const response = await fetchMatchmakingStatus(gameId, matchmaking.stakePoints);
        setMatchmaking(response.match);
      } catch {
        // keep quiet during polling
      }
    }, 3000);

    return () => window.clearInterval(interval);
  }, [gameId, isAuthenticated, matchmaking, user?.role]);

  async function handleFindMatch() {
    if (!gameId) return;
    setIsFindingMatch(true);
    setMatchError("");
    try {
      const response = await findMatchmaking(gameId, selectedStake);
      setMatchmaking(response.match);
    } catch (requestError) {
      setMatchError(getApiErrorMessage(requestError, "Unable to join matchmaking"));
    } finally {
      setIsFindingMatch(false);
    }
  }

  async function handleCancelMatch() {
    if (!matchmaking?.queueEntryId) return;
    setMatchError("");
    try {
      await cancelMatchmaking(matchmaking.queueEntryId);
      setMatchmaking(null);
    } catch (requestError) {
      setMatchError(getApiErrorMessage(requestError, "Unable to cancel matchmaking"));
    }
  }

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Game Detail"
        title={game?.title ?? `Game: ${gameId ?? "unknown"}`}
        description={game?.description ?? "This page renders backend game metadata, creator information, controls, scoring rules, preview image, and launch links."}
        actions={
          <>
            <ButtonLink className="!text-black" to="play">
              Practice / Solo Play
            </ButtonLink>
            <ButtonLink to={`/leaderboards/${gameId}`} tone="ghost">
              View Leaderboard
            </ButtonLink>
          </>
        }
      />
      {error ? <p className="text-sm text-[var(--color-error)]">{error}</p> : null}
      <SectionCard title="MVP detail structure" description="Backend integration comes in the games phase.">
        {game ? (
          <div className="space-y-3 text-sm text-[var(--color-muted)]">
            <p>Category: <span className="text-[var(--color-text)]">{game.category}</span></p>
            <p>Version: <span className="text-[var(--color-text)]">{game.version}</span></p>
            <p>Creator: <span className="text-[var(--color-text)]">{game.creator.name}</span></p>
            <p>Controls: <span className="text-[var(--color-text)]">{game.controls ?? "n/a"}</span></p>
            <p>Scoring: <span className="text-[var(--color-text)]">{game.scoringRules ?? "n/a"}</span></p>
            <p>Built-in key: <span className="text-[var(--color-text)]">{game.builtInGameKey}</span></p>
          </div>
        ) : (
          <p className="text-sm text-[var(--color-muted)]">Loading game details...</p>
        )}
      </SectionCard>
      {isAuthenticated && user?.role === "PLAYER" ? (
        <SectionCard title="Find opponent" description="Queue for another player on this game and stake size.">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              {stakeOptions.map((stake) => (
                <button
                  key={stake}
                  className={[
                    "rounded-2xl border px-4 py-3 text-sm font-semibold transition",
                    selectedStake === stake
                      ? "border-[rgba(232,255,71,0.45)] bg-[rgba(232,255,71,0.12)] text-[var(--color-primary)]"
                      : "border-[var(--color-border)] bg-[var(--color-surface-strong)] text-[var(--color-text)]",
                  ].join(" ")}
                  onClick={() => setSelectedStake(stake)}
                  type="button"
                >
                  {stake} points
                </button>
              ))}
            </div>
            {matchmaking ? (
              <div className="space-y-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge
                    label={matchmaking.status === "MATCHED" ? "Match Found" : "In Queue"}
                    tone={matchmaking.status === "MATCHED" ? "success" : "warning"}
                  />
                  <StatusBadge label={`${matchmaking.stakePoints} points`} tone="primary" />
                </div>
                <p className="text-sm text-[var(--color-muted)]">
                  {matchmaking.status === "MATCHED"
                    ? `Opponent found: ${matchmaking.opponent?.name ?? "Player"}`
                    : "Waiting for another player on the same game and stake size."}
                </p>
                <div className="flex flex-wrap gap-3">
                  {matchmaking.status === "MATCHED" ? (
                    <ButtonLink to="play">Enter Match</ButtonLink>
                  ) : (
                    <Button className="rounded-2xl" onClick={handleCancelMatch} tone="ghost" type="button">
                      Leave Queue
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                <Button className="rounded-2xl !text-black" disabled={isFindingMatch} onClick={handleFindMatch} type="button">
                  {isFindingMatch ? "Finding..." : "Find Opponent"}
                </Button>
              </div>
            )}
            {matchError ? <p className="text-sm text-[var(--color-error)]">{matchError}</p> : null}
          </div>
        </SectionCard>
      ) : null}
    </div>
  );
}


