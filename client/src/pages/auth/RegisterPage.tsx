import { useState } from "react";
import { AxiosError } from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/Button";
import { PageHero } from "../../components/ui/PageHero";
import { SectionCard } from "../../components/ui/SectionCard";
import type { RegisterInput } from "../../context/auth.types";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterInput>({
    name: "",
    email: "",
    password: "",
    role: "PLAYER",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await register(form);
      navigate("/profile");
    } catch (requestError) {
      if (requestError instanceof AxiosError) {
        setError(requestError.response?.data?.message ?? "Registration failed");
      } else {
        setError("Registration failed");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <PageHero
        eyebrow="Get Started"
        title="Create a player or creator account for the MVP platform."
        description="Admins remain seed-only. Creators get upload and submission access; players get the public catalog, sessions, and leaderboards."
      />
      <SectionCard title="Register" description="The MVP allows public signup for players and creators.">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm text-[var(--color-muted)]">Name</span>
            <input
              className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-3 outline-none transition focus:border-[var(--color-primary)]"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              required
            />
          </label>
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
          <label className="block">
            <span className="mb-2 block text-sm text-[var(--color-muted)]">Role</span>
            <select
              className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-3 outline-none transition focus:border-[var(--color-primary)]"
              value={form.role}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  role: event.target.value as RegisterInput["role"],
                }))
              }
            >
              <option value="PLAYER">Player</option>
              <option value="CREATOR">Creator</option>
            </select>
          </label>
          {error ? <p className="text-sm text-[var(--color-error)]">{error}</p> : null}
          <Button className="w-full rounded-2xl" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Creating account..." : "Create account"}
          </Button>
          <p className="text-sm text-[var(--color-muted)]">
            Already registered?{" "}
            <Link className="text-[var(--color-primary)]" to="/login">
              Login here
            </Link>
          </p>
        </form>
      </SectionCard>
    </div>
  );
}


