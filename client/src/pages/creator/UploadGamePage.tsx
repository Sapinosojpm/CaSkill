import { useState } from "react";
import { Button, ButtonLink } from "../../components/ui/Button";
import { PageHero } from "../../components/ui/PageHero";
import { SectionCard } from "../../components/ui/SectionCard";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { getApiErrorMessage } from "../../utils/errors";
import { uploadCreatorGame } from "../../api/creator.api";
import type { UploadCreatorGameResponse } from "../../api/creator.types";

export function UploadGamePage() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    version: "",
  });
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [banner, setBanner] = useState<File | null>(null);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<UploadCreatorGameResponse | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!thumbnail || !zipFile) {
      setError("Thumbnail and ZIP package are required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const uploadResult = await uploadCreatorGame({
        ...form,
        thumbnail,
        banner,
        zipFile,
      });
      setResult(uploadResult);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Upload failed"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Upload"
        title="Submit a new game package."
        description="Upload a creator ZIP package built in your own IDE. The backend validates the ZIP structure, reads manifest.json, stores the assets, and creates an upload record."
      />
      <SectionCard title="Upload game" description="Builder space for MVP ZIP submissions.">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm text-[var(--color-muted)]">Title</span>
              <input
                className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-3"
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                required
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-[var(--color-muted)]">Version</span>
              <input
                className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-3"
                value={form.version}
                onChange={(event) => setForm((current) => ({ ...current, version: event.target.value }))}
                required
              />
            </label>
          </div>
          <label className="block">
            <span className="mb-2 block text-sm text-[var(--color-muted)]">Description</span>
            <textarea
              className="min-h-28 w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-3"
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              required
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-[var(--color-muted)]">Category</span>
            <input
              className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-3"
              value={form.category}
              onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
              required
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block">
              <span className="mb-2 block text-sm text-[var(--color-muted)]">Thumbnail icon (Square)</span>
              <input
                className="block w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-3"
                type="file"
                accept="image/*"
                onChange={(event) => setThumbnail(event.target.files?.[0] ?? null)}
                required
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-[var(--color-muted)]">Banner art (Optional)</span>
              <input
                className="block w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-3"
                type="file"
                accept="image/*"
                onChange={(event) => setBanner(event.target.files?.[0] ?? null)}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-[var(--color-muted)]">ZIP package (.zip)</span>
              <input
                className="block w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-3"
                type="file"
                accept=".zip"
                onChange={(event) => setZipFile(event.target.files?.[0] ?? null)}
                required
              />
            </label>
          </div>
          {error ? <p className="text-sm text-[var(--color-error)]">{error}</p> : null}
          <Button className="rounded-2xl" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Uploading..." : "Upload Game"}
          </Button>
        </form>
      </SectionCard>

      {result ? (
        <SectionCard title="Upload complete" description="Your game package has been stored as an uploaded submission.">
          <div className="space-y-3">
            <StatusBadge label={result.submission.status.replaceAll("_", " ")} tone="primary" />
            <p className="text-sm text-[var(--color-muted)]">
              Parsed manifest entry: <span className="text-[var(--color-text)]">{result.manifest.entryFile}</span>
            </p>
            <p className="text-sm text-[var(--color-muted)]">
              Next step: open the submission detail page and send it for admin review.
            </p>
            <ButtonLink size="sm" to={`/creator/submissions/${result.submission.id}`}>
              View submission
            </ButtonLink>
          </div>
        </SectionCard>
      ) : null}
      <SectionCard title="Required ZIP structure" description="Server-side validation rules for MVP uploads.">
        <div className="space-y-2 text-sm text-[var(--color-muted)]">
          <p>`manifest.json` with title, version, entryFile, description, category, controls, scoringRules</p>
          <p>`README.md` at the ZIP root</p>
          <p>`dist/` or `build/` folder containing the entry file defined in the manifest</p>
        </div>
      </SectionCard>
    </div>
  );
}


