import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageHero } from "../../components/ui/PageHero";
import { SectionCard } from "../../components/ui/SectionCard";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { getApiErrorMessage } from "../../utils/errors";
import { fetchCreatorSubmissions } from "../../api/creator.api";
import type { CreatorSubmission } from "../../api/creator.types";

export function MySubmissionsPage() {
  const [submissions, setSubmissions] = useState<CreatorSubmission[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSubmissions() {
      try {
        const data = await fetchCreatorSubmissions();
        setSubmissions(data);
      } catch (requestError) {
        setError(getApiErrorMessage(requestError, "Unable to load submissions"));
      }
    }

    void loadSubmissions();
  }, []);

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Submissions"
        title="Review your uploaded builds."
        description="Creators will see upload history, admin notes, manifest summaries, and publication state here."
      />
      {error ? <p className="text-sm text-[var(--color-error)]">{error}</p> : null}
      <SectionCard title="My submissions" description="Sample creator submission list.">
        <div className="space-y-3">
          {submissions.map((submission) => (
            <div
              key={submission.id}
              className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-3"
            >
              <div>
                <p className="font-semibold">{submission.game.title}</p>
                <p className="text-sm text-[var(--color-muted)]">{submission.game.category}</p>
                <Link className="text-sm text-[var(--color-primary)]" to={`/creator/submissions/${submission.id}`}>
                  View submission
                </Link>
              </div>
              <StatusBadge
                label={submission.status.replaceAll("_", " ")}
                tone={submission.status === "APPROVED" ? "success" : submission.status === "REJECTED" ? "error" : "warning"}
              />
            </div>
          ))}
          {!submissions.length ? <p className="text-sm text-[var(--color-muted)]">No submissions found yet.</p> : null}
        </div>
      </SectionCard>
    </div>
  );
}


