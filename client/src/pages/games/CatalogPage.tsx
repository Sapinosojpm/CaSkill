import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageHero } from "../../components/ui/PageHero";
import { SectionCard } from "../../components/ui/SectionCard";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { getApiErrorMessage } from "../../utils/errors";
import { fetchGames } from "../../api/games.api";
import type { GameItem } from "../../api/games.types";

export function CatalogPage() {
  const [games, setGames] = useState<GameItem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadGames() {
      try {
        setGames(await fetchGames());
      } catch (requestError) {
        setError(getApiErrorMessage(requestError, "Unable to load games"));
      }
    }

    void loadGames();
  }, []);

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Catalog"
        title="Approved browser games live here."
        description="Published games are loaded from the backend. Approved submissions become available here for all players."
      />
      {error ? <p className="text-sm text-[var(--color-error)]">{error}</p> : null}
      <div className="grid gap-5 lg:grid-cols-3">
        {games.map((game) => (
          <SectionCard
            key={game.id}
            title={game.title}
            description={`${game.category} • ${game.description}`}
            action={<StatusBadge label={game.status} tone={game.status === "PUBLISHED" ? "success" : "warning"} />}
          >
            <Link className="text-sm font-semibold text-[var(--color-primary)]" to={`/games/${game.id}`}>
              View game details
            </Link>
          </SectionCard>
        ))}
        {!games.length ? <p className="text-sm text-[var(--color-muted)]">No published games found.</p> : null}
      </div>
    </div>
  );
}


