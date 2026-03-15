import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ButtonLink } from "../components/ui/Button";

const publicLinks = [
  { to: "/", label: "Home" },
  { to: "/games", label: "Catalog" },
];

const creatorLinks = [
  { to: "/creator", label: "Creator" },
  { to: "/creator/upload", label: "Upload" },
  { to: "/creator/submissions", label: "Submissions" },
];

const adminLinks = [
  { to: "/admin", label: "Admin" },
  { to: "/admin/submissions", label: "Reviews" },
  { to: "/admin/cheat-flags", label: "Cheat Flags" },
];

function navClassName(isActive: boolean) {
  return [
    "rounded-full border px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.24em] [font-family:var(--font-accent)] transition",
    isActive
      ? "border-[rgba(168,224,99,0.28)] bg-[rgba(168,224,99,0.12)] text-[var(--color-success)]"
      : "border-[rgba(255,255,255,0.06)] bg-[rgba(17,17,16,0.78)] text-[var(--color-muted)] hover:text-[var(--color-text)]",
  ].join(" ");
}

export function AppShell() {
  const { user, isAuthenticated, logout } = useAuth();

  const roleLinks = user?.role === "ADMIN" ? adminLinks : user?.role === "CREATOR" ? creatorLinks : [];

  return (
    <div className="grid-fade min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <header className="sticky top-0 z-20 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(10,10,8,0.72)] backdrop-blur-xl">
        <div className="relative mx-auto flex max-w-[1600px] flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-4">
              <div className="text-[2.2rem] font-black uppercase leading-none tracking-[0.03em] [font-family:var(--font-display)]">
                <span className="text-[var(--color-text)]">CA</span>
                <span className="text-[var(--color-success)]">SKILL</span>
              </div>
            </Link>
          </div>

          <nav className="no-scrollbar flex overflow-x-auto whitespace-nowrap gap-2 lg:absolute lg:left-1/2 lg:-translate-x-1/2 lg:justify-center">
            {[...publicLinks, ...roleLinks].map((link) => (
              <NavLink key={link.to} to={link.to} className={({ isActive }) => navClassName(isActive)}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex flex-wrap items-center gap-3 lg:justify-end">
            {isAuthenticated && user ? (
              <>
                <ButtonLink size="sm" to="/profile" tone="ghost">
                  Profile
                </ButtonLink>
                <div className="rounded-2xl border border-[var(--color-border)] bg-[rgba(17,17,16,0.82)] px-4 py-3">
                  <p className="text-sm font-semibold">{user.name}</p>
                  <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-muted)]">{user.role}</p>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-full border border-[var(--color-border)] bg-transparent px-4 py-2 text-sm font-semibold text-[var(--color-text)] transition hover:border-[var(--color-error)] hover:text-[var(--color-error)]"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <ButtonLink size="sm" to="/login" tone="ghost">
                  Login
                </ButtonLink>
                <ButtonLink className="!text-black" size="sm" to="/register">
                  Join Now
                </ButtonLink>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-[1600px] px-6 py-10 lg:px-10 lg:py-14">
        <Outlet />
      </main>
    </div>
  );
}


