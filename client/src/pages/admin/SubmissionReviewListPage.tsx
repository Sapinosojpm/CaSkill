import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ButtonLink } from "../../components/ui/Button";
import { PageHero } from "../../components/ui/PageHero";
import { SectionCard } from "../../components/ui/SectionCard";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { getApiErrorMessage } from "../../utils/errors";
import { fetchAdminSubmissions } from "../../api/admin.api";
import type { CreatorSubmission } from "../../api/creator.types";

function formatSubmissionTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

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
        actions={<StatusBadge label={`${submissions.length} total`} tone="primary" />}
      />
      {error ? <p className="text-sm text-[var(--color-error)]">{error}</p> : null}
      <SectionCard title="Submission list" description="All creator submissions currently stored in the platform.">
        <div className="space-y-3">
          {submissions.map((item) => (
            <div
              key={item.id}
              className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-4"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-[var(--color-text)]">{item.game.title}</p>
                    <StatusBadge
                      label={item.status.replaceAll("_", " ")}
                      tone={
                        item.status === "APPROVED"
                          ? "success"
                          : item.status === "REJECTED"
                            ? "error"
                            : "warning"
                      }
                    />
                  </div>
                  <p className="text-sm text-[var(--color-muted)]">
                    Creator: {item.creator?.name ?? item.creatorId} • {item.creator?.email ?? "No email"} • Version{" "}
                    {item.game.version ?? "n/a"}
                  </p>
                  <p className="text-sm text-[var(--color-muted)]">
                    Submitted {formatSubmissionTime(item.submittedAt)} • Category {item.game.category}
                  </p>
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">Submission ID: {item.id}</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Link className="text-sm font-semibold text-[var(--color-primary)]" to={`/admin/submissions/${item.id}`}>
                    Open review
                  </Link>
                  <ButtonLink className="!text-black" size="sm" to={`/admin/submissions/${item.id}`}>
                    Review Submission
                  </ButtonLink>
                </div>
              </div>
            </div>
          ))}
          {!submissions.length ? (
            <p className="text-sm text-[var(--color-muted)]">No creator submissions found yet.</p>
          ) : null}
        </div>
      </SectionCard>
    </div>
  );
}


