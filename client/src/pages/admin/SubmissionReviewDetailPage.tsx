import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { PageHero } from "../../components/ui/PageHero";
import { SectionCard } from "../../components/ui/SectionCard";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { getApiErrorMessage } from "../../utils/errors";
import { approveAdminSubmission, fetchAdminSubmission, rejectAdminSubmission } from "../../api/admin.api";
import type { CreatorSubmission } from "../../api/creator.types";

export function SubmissionReviewDetailPage() {
  const { submissionId } = useParams();
  const [submission, setSubmission] = useState<CreatorSubmission | null>(null);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const currentSubmissionId = submissionId ?? "";
    if (!currentSubmissionId) return;
    async function loadSubmission() {
      try {
        setSubmission(await fetchAdminSubmission(currentSubmissionId));
      } catch (requestError) {
        setError(getApiErrorMessage(requestError, "Unable to load submission"));
      }
    }
    void loadSubmission();
  }, [submissionId]);

  async function handleDecision(decision: "approve" | "reject") {
    if (!submission) return;
    setIsSaving(true);
    setError("");
    try {
      const updated =
        decision === "approve"
          ? await approveAdminSubmission(submission.id, notes)
          : await rejectAdminSubmission(submission.id, notes);
      setSubmission(updated);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, `Unable to ${decision} submission`));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Submission Review"
        title={submission ? `Review ${submission.game.title}` : `Review ${submissionId ?? ""}`}
        description="This admin detail page will host submission metadata, build preview, review notes, and approve/reject actions."
      />
      {error ? <p className="text-sm text-[var(--color-error)]">{error}</p> : null}
      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <SectionCard title="Preview area" description="Uploaded game preview will render here in the review phase.">
          {submission ? (
            <div className="space-y-3 text-sm text-[var(--color-muted)]">
              <p>Game: <span className="text-[var(--color-text)]">{submission.game.title}</span></p>
              <p>Creator: <span className="text-[var(--color-text)]">{submission.creator?.name ?? submission.creatorId}</span></p>
              <p>ZIP: <span className="text-[var(--color-text)]">{submission.zipFileUrl}</span></p>
              <p>Entry file: <span className="text-[var(--color-text)]">{String(submission.manifestData.entryFile ?? "n/a")}</span></p>
              <p>Preview path: <span className="text-[var(--color-text)]">{submission.game.buildPath ?? "Not extracted in MVP"}</span></p>
            </div>
          ) : (
            <div className="flex min-h-[280px] items-center justify-center rounded-3xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface-strong)] text-[var(--color-muted)]">
              Preview placeholder
            </div>
          )}
        </SectionCard>
        <SectionCard title="Decision panel" description="Approve/reject controls land here in Phase 6.">
          {submission ? (
            <div className="space-y-4">
              <StatusBadge label={submission.status} tone={submission.status === "APPROVED" ? "success" : submission.status === "REJECTED" ? "error" : "warning"} />
              <textarea
                className="min-h-28 w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-3"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Review notes"
              />
              <div className="flex gap-3">
                <button
                  className="rounded-2xl bg-[var(--color-success)] px-4 py-3 font-semibold text-black disabled:opacity-60"
                  disabled={isSaving}
                  onClick={() => handleDecision("approve")}
                  type="button"
                >
                  Approve & Publish
                </button>
                <button
                  className="rounded-2xl bg-[var(--color-error)] px-4 py-3 font-semibold text-white disabled:opacity-60"
                  disabled={isSaving}
                  onClick={() => handleDecision("reject")}
                  type="button"
                >
                  Reject
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-[var(--color-muted)]">Review notes, decision buttons, and moderation metadata will appear here.</p>
          )}
        </SectionCard>
      </div>
    </div>
  );
}


