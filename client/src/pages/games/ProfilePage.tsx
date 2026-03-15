import { useAuth } from "../../context/AuthContext";
import { ButtonLink } from "../../components/ui/Button";
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
        description="This page is already wired to auth state. Later phases will add recent scores, creator submissions, admin quick links, and full wallet history."
        actions={user?.role === "PLAYER" ? <ButtonLink className="!text-black" to="/store">Open Point Store</ButtonLink> : undefined}
      />
      <div className="grid gap-5 lg:grid-cols-3">
        <SectionCard title="Account" description={user?.email}>
          {user ? <StatusBadge label={user.role} tone="primary" /> : <p className="text-sm text-[var(--color-muted)]">No user loaded.</p>}
        </SectionCard>
        <SectionCard title="Wallet" description="Available point balance for entries and store purchases.">
          {user ? (
            <div className="space-y-2">
              <p className="text-4xl font-black text-[var(--color-success)]">{user.pointsBalance}</p>
              <p className="text-sm text-[var(--color-muted)]">Points are credited after successful Stripe checkout confirmation.</p>
            </div>
          ) : (
            <p className="text-sm text-[var(--color-muted)]">No wallet loaded.</p>
          )}
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


