import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { PageHero } from "../../components/ui/PageHero";
import { SectionCard } from "../../components/ui/SectionCard";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { getApiErrorMessage } from "../../utils/errors";
import { fetchCreatorSubmission, submitCreatorSubmission } from "../../api/creator.api";
import type { CreatorSubmission } from "../../api/creator.types";

export function CreatorSubmissionDetailPage() {
  const { submissionId } = useParams();
  const [submission, setSubmission] = useState<CreatorSubmission | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const currentSubmissionId = submissionId ?? "";

    if (!currentSubmissionId) {
      return;
    }

    async function loadSubmission() {
      try {
        const data = await fetchCreatorSubmission(currentSubmissionId);
        setSubmission(data);
      } catch (requestError) {
        setError(getApiErrorMessage(requestError, "Unable to load submission"));
      }
    }

    void loadSubmission();
  }, [submissionId]);

  async function handleSendForReview() {
    if (!submission) {
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const updated = await submitCreatorSubmission(submission.id);
      setSubmission(updated);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to submit for review"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Submission Detail"
        title={`Submission ${submissionId ?? ""}`}
        description="This page will show manifest data, upload artifacts, reviewer notes, and publish state for creators."
      />
      {error ? <p className="text-sm text-[var(--color-error)]">{error}</p> : null}
      <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <SectionCard
          title={submission?.game.title ?? "Submission"}
          description={submission?.game.category ?? "Creator package"}
          action={
            submission ? (
              <StatusBadge
                label={submission.status.replaceAll("_", " ")}
                tone={submission.status === "APPROVED" ? "success" : submission.status === "REJECTED" ? "error" : "warning"}
              />
            ) : null
          }
        >
          {submission ? (
            <div className="space-y-3 text-sm text-[var(--color-muted)]">
              <p>Version: <span className="text-[var(--color-text)]">{submission.game.version ?? "n/a"}</span></p>
              <p>ZIP: <span className="text-[var(--color-text)]">{submission.zipFileUrl}</span></p>
              <p>Submitted: <span className="text-[var(--color-text)]">{new Date(submission.submittedAt).toLocaleString()}</span></p>
              <p>Manifest title: <span className="text-[var(--color-text)]">{String(submission.manifestData.title ?? "n/a")}</span></p>
              <p>Entry file: <span className="text-[var(--color-text)]">{String(submission.manifestData.entryFile ?? "n/a")}</span></p>
            </div>
          ) : (
            <p className="text-sm text-[var(--color-muted)]">Loading submission...</p>
          )}
        </SectionCard>
        <SectionCard title="Review timeline" description="Creator visibility into moderation.">
          {submission ? (
            <div className="space-y-3">
              <p className="text-sm text-[var(--color-muted)]">
                Review notes: <span className="text-[var(--color-text)]">{submission.reviewNotes ?? "No admin notes yet."}</span>
              </p>
              <p className="text-sm text-[var(--color-muted)]">
                Reviewed at: <span className="text-[var(--color-text)]">{submission.reviewedAt ? new Date(submission.reviewedAt).toLocaleString() : "Not reviewed yet"}</span>
              </p>
              {submission.status === "UPLOADED" ? (
                <Button className="rounded-2xl" disabled={isSubmitting} onClick={handleSendForReview} type="button">
                  {isSubmitting ? "Submitting..." : "Send for Review"}
                </Button>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-[var(--color-muted)]">Loading review data...</p>
          )}
        </SectionCard>
      </div>
      <SectionCard title="Decision history" description="Latest review records for this submission.">
        <div className="space-y-3">
          {(submission?.reviews ?? []).map((review) => (
            <div key={review.id} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-3">
              <p className="font-semibold">{review.decision}</p>
              <p className="mt-1 text-sm text-[var(--color-muted)]">{review.notes ?? "No notes provided."}</p>
            </div>
          ))}
          {!submission?.reviews?.length ? (
            <p className="text-sm text-[var(--color-muted)]">No review decisions recorded yet.</p>
          ) : null}
        </div>
      </SectionCard>
    </div>
  );
}


