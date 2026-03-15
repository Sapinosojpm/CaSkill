import { useEffect, useState } from "react";
import { PageHero } from "../../components/ui/PageHero";
import { SectionCard } from "../../components/ui/SectionCard";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { getApiErrorMessage } from "../../utils/errors";
import { fetchCheatFlags } from "../../api/admin.api";
import type { CheatFlagItem } from "../../api/admin.types";

export function CheatFlagsPage() {
  const [flags, setFlags] = useState<CheatFlagItem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadFlags() {
      try {
        setFlags(await fetchCheatFlags());
      } catch (requestError) {
        setError(getApiErrorMessage(requestError, "Unable to load cheat flags"));
      }
    }
    void loadFlags();
  }, []);

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Cheat Flags"
        title="Moderate suspicious sessions and scores."
        description="Admins will inspect flagged and rejected scores here, including look-away counts, face visibility ratios, and suspicious score patterns."
      />
      {error ? <p className="text-sm text-[var(--color-error)]">{error}</p> : null}
      <SectionCard title="Flag queue" description="MVP moderation scaffold.">
        <div className="space-y-3">
          {flags.map((flag) => (
            <div
              key={flag.id}
              className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-3"
            >
              <div>
                <p className="font-medium">{flag.reason}</p>
                <p className="text-sm text-[var(--color-muted)]">
                  {flag.user.name} • {flag.game.title} • score {flag.score.value}
                </p>
              </div>
              <StatusBadge label={flag.severity} tone={flag.severity === "HIGH" ? "error" : "warning"} />
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}


