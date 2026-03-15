import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageHero } from "../../components/ui/PageHero";
import { SectionCard } from "../../components/ui/SectionCard";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { getApiErrorMessage } from "../../utils/errors";
import { fetchAdminSubmissions } from "../../api/admin.api";
import type { CreatorSubmission } from "../../api/creator.types";

export function SubmissionReviewListPage() {
  const [submissions, setSubmissions] = useState<CreatorSubmission[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSubmissions() {
      try {
        setSubmissions(await fetchAdminSubmissions());
      } catch (requestError) {
        setError(getApiErrorMessage(requestError, "Unable to load admin submissions"));
      }
    }
    void loadSubmissions();
  }, []);

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Review Queue"
        title="Moderate creator submissions."
        description="Admins will review manifests, ZIP contents, preview builds, and approve or reject submissions from here."
      />
      {error ? <p className="text-sm text-[var(--color-error)]">{error}</p> : null}
      <SectionCard title="Submission list" description="Scaffold for admin moderation.">
        <div className="space-y-3">
          {submissions.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-3"
            >
              <div>
                <p className="font-semibold">{item.game.title}</p>
                <Link className="text-sm text-[var(--color-primary)]" to={`/admin/submissions/${item.id}`}>
                  Open review
                </Link>
              </div>
              <StatusBadge label={item.status} tone={item.status === "APPROVED" ? "success" : item.status === "REJECTED" ? "error" : "warning"} />
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}


