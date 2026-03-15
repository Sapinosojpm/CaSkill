import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchGame, fetchLeaderboard } from "../../api/games.api";
import type { GameItem, LeaderboardEntry } from "../../api/games.types";
import { ButtonLink } from "../../components/ui/Button";
import { PageHero } from "../../components/ui/PageHero";
import { SectionCard } from "../../components/ui/SectionCard";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import { getApiErrorMessage } from "../../utils/errors";

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (!minutes) {
    return `${remainingSeconds}s`;
  }

  return `${minutes}m ${remainingSeconds}s`;
}

function formatSubmittedAt(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function LeaderboardPage() {
  const { gameId } = useParams();
  const { user } = useAuth();
  const [game, setGame] = useState<GameItem | null>(null);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentGameId = gameId ?? "";

    if (!currentGameId) {
      setIsLoading(false);
      return;
    }

    async function loadLeaderboardData() {
      try {
        setIsLoading(true);
        setError("");

        const [gameResult, leaderboardResult] = await Promise.all([
          fetchGame(currentGameId),
          fetchLeaderboard(currentGameId),
        ]);

        setGame(gameResult);
        setEntries(leaderboardResult);
      } catch (requestError) {
        setError(getApiErrorMessage(requestError, "Unable to load leaderboard"));
      } finally {
        setIsLoading(false);
      }
    }

    void loadLeaderboardData();
  }, [gameId]);

  const topThree = entries.slice(0, 3);
  const restOfEntries = entries.slice(3);

  const currentPlayerEntry = useMemo(() => {
    if (!user) {
      return null;
    }

    const index = entries.findIndex((entry) => entry.user.id === user.id);

    if (index === -1) {
      return null;
    }

    return {
      rank: index + 1,
      entry: entries[index],
    };
  }, [entries, user]);

  const averageScore = useMemo(() => {
    if (!entries.length) {
      return 0;
    }

    return Math.round(entries.reduce((total, entry) => total + entry.value, 0) / entries.length);
  }, [entries]);

  const fastestRun = useMemo(() => {
    if (!entries.length) {
      return null;
    }

    return entries.reduce((fastest, entry) =>
      entry.durationSeconds < fastest.durationSeconds ? entry : fastest,
    );
  }, [entries]);

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Leaderboard"
        title={game ? `${game.title} standings` : "Player leaderboard"}
        description={
          game
            ? `Track the best accepted runs, fastest finishes, and current player placements for ${game.title}.`
            : "Track the best accepted runs, fastest finishes, and current player placements."
        }
        actions={
          gameId ? (
            <>
              <ButtonLink to={`/games/${gameId}`} tone="ghost">
                Back To Game
              </ButtonLink>
              <ButtonLink to={`/games/${gameId}/play`}>
                Play Now
              </ButtonLink>
            </>
          ) : undefined
        }
      />

      {error ? <p className="text-sm text-[var(--color-error)]">{error}</p> : null}

      <div className="grid gap-5 lg:grid-cols-3">
        <SectionCard title="Live queue" description="Accepted scores shown on the public board.">
          <div className="space-y-3">
            <p className="text-4xl font-semibold text-[var(--color-text)]">{entries.length}</p>
            <StatusBadge label="Public ranking" tone="success" />
          </div>
        </SectionCard>

        <SectionCard title="Average score" description="Current benchmark across accepted runs.">
          <div className="space-y-3">
            <p className="text-4xl font-semibold text-[var(--color-text)]">{averageScore || "--"}</p>
            <p className="text-sm text-[var(--color-muted)]">Points earned per accepted leaderboard entry.</p>
          </div>
        </SectionCard>

        <SectionCard title="Fastest finish" description="Quickest accepted completion on the board.">
          {fastestRun ? (
            <div className="space-y-3">
              <p className="text-4xl font-semibold text-[var(--color-text)]">{formatDuration(fastestRun.durationSeconds)}</p>
              <p className="text-sm text-[var(--color-muted)]">{fastestRun.user.name} owns the fastest posted run.</p>
            </div>
          ) : (
            <p className="text-sm text-[var(--color-muted)]">No accepted runs yet.</p>
          )}
        </SectionCard>
      </div>

      {user ? (
        <SectionCard
          title="Your placement"
          description="Your highest accepted placement for this game appears here once you post a score."
          action={<StatusBadge label={user.role} tone="primary" />}
        >
          {currentPlayerEntry ? (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-[rgba(168,224,99,0.22)] bg-[rgba(168,224,99,0.08)] px-4 py-4">
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-success)]">Rank</p>
                <p className="mt-2 text-3xl font-semibold text-[var(--color-text)]">#{currentPlayerEntry.rank}</p>
              </div>
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-4">
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-muted)]">Score</p>
                <p className="mt-2 text-3xl font-semibold text-[var(--color-text)]">{currentPlayerEntry.entry.value}</p>
              </div>
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-4">
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-muted)]">Run time</p>
                <p className="mt-2 text-3xl font-semibold text-[var(--color-text)]">
                  {formatDuration(currentPlayerEntry.entry.durationSeconds)}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[var(--color-muted)]">
                You do not have an accepted score on this leaderboard yet. Start a session and post a run to appear here.
              </p>
              {gameId ? <ButtonLink to={`/games/${gameId}/play`}>Set Your First Score</ButtonLink> : null}
            </div>
          )}
        </SectionCard>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard title="Top players" description="Highest accepted scores ranked from best to lowest.">
          {isLoading ? (
            <p className="text-sm text-[var(--color-muted)]">Loading leaderboard...</p>
          ) : !entries.length ? (
            <div className="space-y-4">
              <p className="text-sm text-[var(--color-muted)]">No accepted scores yet. Be the first player to claim the top spot.</p>
              {gameId ? <ButtonLink to={`/games/${gameId}/play`}>Play For First Place</ButtonLink> : null}
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry, index) => {
                const isCurrentUser = entry.user.id === user?.id;
                const rank = index + 1;

                return (
                  <div
                    key={entry.id}
                    className={[
                      "flex flex-col gap-4 rounded-[24px] border px-4 py-4 sm:flex-row sm:items-center sm:justify-between",
                      isCurrentUser
                        ? "border-[rgba(168,224,99,0.22)] bg-[rgba(168,224,99,0.08)]"
                        : "border-[var(--color-border)] bg-[var(--color-surface-strong)]",
                    ].join(" ")}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] text-lg font-semibold text-[var(--color-text)]">
                        #{rank}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-[var(--color-text)]">{entry.user.name}</p>
                          {rank <= 3 ? (
                            <StatusBadge
                              label={rank === 1 ? "Champion" : rank === 2 ? "Runner-up" : "Top 3"}
                              tone={rank === 1 ? "primary" : "success"}
                            />
                          ) : null}
                          {isCurrentUser ? <StatusBadge label="You" tone="warning" /> : null}
                        </div>
                        <p className="mt-2 text-sm text-[var(--color-muted)]">
                          Submitted {formatSubmittedAt(entry.submittedAt)} • {formatDuration(entry.durationSeconds)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-muted)]">Score</p>
                        <p className="text-2xl font-semibold text-[var(--color-text)]">{entry.value}</p>
                      </div>
                      <StatusBadge label={entry.status} tone={entry.status === "ACCEPTED" ? "success" : "warning"} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

        <div className="space-y-5">
          <SectionCard title="Podium watch" description="Quick read on the current top three performers.">
            {topThree.length ? (
              <div className="space-y-3">
                {topThree.map((entry, index) => (
                  <div
                    key={entry.id}
                    className="rounded-2xl border border-[var(--color-border)] bg-[linear-gradient(135deg,rgba(232,255,71,0.08),rgba(17,17,16,0.98)_32%,rgba(17,17,16,1))] px-4 py-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-primary)]">
                          #{index + 1} {index === 0 ? "Leader" : index === 1 ? "Chaser" : "Contender"}
                        </p>
                        <p className="mt-2 text-xl font-semibold text-[var(--color-text)]">{entry.user.name}</p>
                        <p className="mt-1 text-sm text-[var(--color-muted)]">
                          {entry.value} pts • {formatDuration(entry.durationSeconds)}
                        </p>
                      </div>
                      <StatusBadge label={entry.status} tone="success" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--color-muted)]">The podium will populate after the first accepted scores arrive.</p>
            )}
          </SectionCard>

          <SectionCard title="What it takes" description="Use the current board to judge what kind of run you need.">
            <div className="space-y-3 text-sm text-[var(--color-muted)]">
              <p>
                The board ranks accepted scores only, so clean runs matter as much as raw points.
              </p>
              <p>
                Higher scores win, and faster completions help you stand out when players are clustered.
              </p>
              <p>
                If you are chasing top spots, focus on consistency, pace, and anti-cheat-safe sessions.
              </p>
            </div>
          </SectionCard>

          {restOfEntries.length ? (
            <SectionCard title="Depth of field" description="Players currently sitting just outside the podium.">
              <div className="space-y-2">
                {restOfEntries.slice(0, 5).map((entry, index) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-3"
                  >
                    <div>
                      <p className="font-semibold text-[var(--color-text)]">#{index + 4} {entry.user.name}</p>
                      <p className="text-sm text-[var(--color-muted)]">{formatDuration(entry.durationSeconds)}</p>
                    </div>
                    <p className="text-lg font-semibold text-[var(--color-text)]">{entry.value}</p>
                  </div>
                ))}
              </div>
            </SectionCard>
          ) : null}
        </div>
      </div>
    </div>
  );
}
