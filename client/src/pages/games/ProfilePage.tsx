import { useAuth } from "../../context/AuthContext";
import { PageHero } from "../../components/ui/PageHero";
import { SectionCard } from "../../components/ui/SectionCard";
import { StatusBadge } from "../../components/ui/StatusBadge";

export function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Profile"
        title={user ? `${user.name}'s dashboard` : "Profile"}
        description="This page is already wired to auth state. Later phases will add recent scores, creator submissions, and admin quick links depending on role."
      />
      <div className="grid gap-5 lg:grid-cols-3">
        <SectionCard title="Account" description={user?.email}>
          {user ? <StatusBadge label={user.role} tone="primary" /> : <p className="text-sm text-[var(--color-muted)]">No user loaded.</p>}
        </SectionCard>
        <SectionCard title="Recent activity" description="Placeholder for scores, sessions, and leaderboard placements.">
          <p className="text-sm text-[var(--color-muted)]">Use the catalog to start a session and submit real scores to the leaderboard.</p>
        </SectionCard>
        <SectionCard title="Role tools" description="Context-aware shortcuts will appear here.">
          <p className="text-sm text-[var(--color-muted)]">
            Players get game history, creators get upload status, and admins get moderation summaries.
          </p>
        </SectionCard>
      </div>
    </div>
  );
}


