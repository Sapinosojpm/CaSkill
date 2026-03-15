import type { ReactNode } from "react";
import { useAuth } from "../../context/AuthContext";
import type { AppRole } from "../../context/auth.types";
import { RequireAuth } from "./RequireAuth";

export function RequireRole({
  allowedRoles,
  children,
}: {
  allowedRoles: AppRole[];
  children: ReactNode;
}) {
  const { user } = useAuth();

  return (
    <RequireAuth>
      {user && allowedRoles.includes(user.role) ? (
        children
      ) : (
        <div className="rounded-3xl border border-[rgba(255,77,77,0.2)] bg-[rgba(255,77,77,0.08)] p-8 text-[var(--color-error)]">
          You do not have permission to view this area.
        </div>
      )}
    </RequireAuth>
  );
}


