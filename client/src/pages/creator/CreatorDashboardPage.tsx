import { useEffect, useState } from "react";
import { ButtonLink } from "../../components/ui/Button";
import { PageHero } from "../../components/ui/PageHero";
import { SectionCard } from "../../components/ui/SectionCard";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { getApiErrorMessage } from "../../utils/errors";
import { fetchCreatorDashboard } from "../../api/creator.api";
import type { CreatorDashboard } from "../../api/creator.types";

export function CreatorDashboardPage() {
  const [dashboard, setDashboard] = useState<CreatorDashboard | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const data = await fetchCreatorDashboard();
        setDashboard(data);
      } catch (requestError) {
        setError(getApiErrorMessage(requestError, "Unable to load creator dashboard"));
      }
    }

    void loadDashboard();
  }, []);

  const pendingCount = dashboard?.submissionCounts.PENDING_REVIEW ?? 0;
  const uploadedCount = dashboard?.submissionCounts.UPLOADED ?? 0;

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Creator"
        title="Manage uploads and track review status."
        description="This creator dashboard shell is ready for the upload flow, manifest parsing, submission history, and review state badges."
        actions={
          <ButtonLink to="/creator/upload">
            Upload Game
          </ButtonLink>
        }
      />
      {error ? <p className="text-sm text-[var(--color-error)]">{error}</p> : null}
      <div className="grid gap-5 lg:grid-cols-3">
        <SectionCard title="Submission health" description="Overview card">
          <div className="space-y-2">
            <StatusBadge label={`${pendingCount} pending review`} tone="warning" />
            <StatusBadge label={`${uploadedCount} uploaded`} tone="primary" />
          </div>
        </SectionCard>
        <SectionCard title="Published games" description="Overview card">
          <StatusBadge label={`${dashboard?.publishedGames ?? 0} live`} tone="success" />
        </SectionCard>
        <SectionCard title="Builder reminders" description="Overview card">
          <p className="text-sm text-[var(--color-muted)]">ZIP must include build/dist, manifest, README, and thumbnail.</p>
        </SectionCard>
      </div>
      <SectionCard title="Recent submissions" description="Latest creator activity.">
        <div className="space-y-3">
          {(dashboard?.recentSubmissions ?? []).map((submission) => (
            <div
              key={submission.id}
              className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-3"
            >
              <div>
                <p className="font-semibold">{submission.game.title}</p>
                <p className="text-sm text-[var(--color-muted)]">
                  {submission.game.category} • {new Date(submission.submittedAt).toLocaleString()}
                </p>
              </div>
              <StatusBadge label={submission.status.replaceAll("_", " ")} tone={submission.status === "APPROVED" ? "success" : "warning"} />
            </div>
          ))}
          {!dashboard?.recentSubmissions.length ? (
            <p className="text-sm text-[var(--color-muted)]">No creator submissions yet.</p>
          ) : null}
        </div>
      </SectionCard>
    </div>
  );
}


