import { useEffect, useState } from "react";
import { PageHero } from "../../components/ui/PageHero";
import { SectionCard } from "../../components/ui/SectionCard";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { getApiErrorMessage } from "../../utils/errors";
import { fetchAdminDashboard } from "../../api/admin.api";
import type { AdminDashboard } from "../../api/admin.types";

export function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setDashboard(await fetchAdminDashboard());
      } catch (requestError) {
        setError(getApiErrorMessage(requestError, "Unable to load admin dashboard"));
      }
    }
    void loadDashboard();
  }, []);

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Admin"
        title="Review submissions, moderation signals, and platform status."
        description="This dashboard is the base for approval decisions, cheat flag review, and publishing workflows."
      />
      {error ? <p className="text-sm text-[var(--color-error)]">{error}</p> : null}
      <div className="grid gap-5 lg:grid-cols-3">
        <SectionCard title="Pending submissions" description="Review queue">
          <StatusBadge label={`${dashboard?.pendingSubmissions ?? 0} pending`} tone="warning" />
        </SectionCard>
        <SectionCard title="Cheat flags" description="Moderation queue">
          <StatusBadge label={`${dashboard?.cheatFlags ?? 0} flagged`} tone="error" />
        </SectionCard>
        <SectionCard title="Published games" description="Catalog health">
          <StatusBadge label={`${dashboard?.publishedGames ?? 0} live`} tone="success" />
        </SectionCard>
      </div>
      <SectionCard title="Recent submissions" description="Latest moderation candidates.">
        <div className="space-y-3">
          {(dashboard?.recentSubmissions ?? []).map((submission) => (
            <div key={submission.id} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-3">
              <p className="font-semibold">{submission.game.title}</p>
              <p className="text-sm text-[var(--color-muted)]">
                {submission.status} • {new Date(submission.submittedAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}


