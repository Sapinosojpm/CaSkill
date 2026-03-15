import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ButtonLink } from "../../components/ui/Button";
import { PageHero } from "../../components/ui/PageHero";
import { SectionCard } from "../../components/ui/SectionCard";
import { getApiErrorMessage } from "../../utils/errors";
import { fetchGame } from "../../api/games.api";
import type { GameItem } from "../../api/games.types";

export function GameDetailPage() {
  const { gameId } = useParams();
  const [game, setGame] = useState<GameItem | null>(null);
  const [error, setError] = useState("");

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

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Game Detail"
        title={game?.title ?? `Game: ${gameId ?? "unknown"}`}
        description={game?.description ?? "This page renders backend game metadata, creator information, controls, scoring rules, preview image, and launch links."}
        actions={
          <>
            <ButtonLink to="play">
              Play Game
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
    </div>
  );
}


