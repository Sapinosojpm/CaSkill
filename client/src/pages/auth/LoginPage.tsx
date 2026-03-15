import { useState } from "react";
import { AxiosError } from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/Button";
import { PageHero } from "../../components/ui/PageHero";
import { SectionCard } from "../../components/ui/SectionCard";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(form);
      const nextPath = (location.state as { from?: string } | null)?.from ?? "/profile";
      navigate(nextPath);
    } catch (requestError) {
      if (requestError instanceof AxiosError) {
        setError(requestError.response?.data?.message ?? "Login failed");
      } else {
        setError("Login failed");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <PageHero
        eyebrow="Welcome Back"
        title="Sign in to play, create, review, and climb the leaderboard."
        description="Players can jump into published games, creators can upload ZIP builds, and admins can review submissions and cheat flags."
      />
      <SectionCard title="Login" description="Use one of the seeded accounts or your own registered account.">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm text-[var(--color-muted)]">Email</span>
            <input
              className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-3 outline-none transition focus:border-[var(--color-primary)]"
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              required
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-[var(--color-muted)]">Password</span>
            <input
              className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-3 outline-none transition focus:border-[var(--color-primary)]"
              type="password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              required
            />
          </label>
          {error ? <p className="text-sm text-[var(--color-error)]">{error}</p> : null}
          <Button className="w-full rounded-2xl" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Signing in..." : "Login"}
          </Button>
          <p className="text-sm text-[var(--color-muted)]">
            Need an account?{" "}
            <Link className="text-[var(--color-primary)]" to="/register">
              Register here
            </Link>
          </p>
        </form>
      </SectionCard>
    </div>
  );
}


