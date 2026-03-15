import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { PageHero } from "../../components/ui/PageHero";
import { SectionCard } from "../../components/ui/SectionCard";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { getApiErrorMessage } from "../../utils/errors";
import { fetchLeaderboard } from "../../api/games.api";
import type { LeaderboardEntry } from "../../api/games.types";

export function LeaderboardPage() {
  const { gameId } = useParams();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const currentGameId = gameId ?? "";
    if (!currentGameId) return;

    async function loadLeaderboard() {
      try {
        setEntries(await fetchLeaderboard(currentGameId));
      } catch (requestError) {
        setError(getApiErrorMessage(requestError, "Unable to load leaderboard"));
      }
    }

    void loadLeaderboard();
  }, [gameId]);

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Leaderboard"
        title={`Top scores for ${gameId ?? "game"}`}
        description="Only accepted scores should appear in the public leaderboard. Flagged and rejected items remain visible to admins in later phases."
      />
      {error ? <p className="text-sm text-[var(--color-error)]">{error}</p> : null}
      <SectionCard title="Top scores" description="Sample data for the scaffold UI.">
        <div className="space-y-3">
          {entries.map((entry, index) => (
            <div
              key={entry.id}
              className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-3"
            >
              <div>
                <p className="font-semibold">
                  #{index + 1} {entry.user.name}
                </p>
                <p className="text-sm text-[var(--color-muted)]">
                  {entry.value} points • {entry.durationSeconds}s
                </p>
              </div>
              <StatusBadge label={entry.status} tone={entry.status === "ACCEPTED" ? "success" : "warning"} />
            </div>
          ))}
          {!entries.length ? <p className="text-sm text-[var(--color-muted)]">No accepted scores yet.</p> : null}
        </div>
      </SectionCard>
    </div>
  );
}


