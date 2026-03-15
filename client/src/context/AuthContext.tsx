import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { api, clearStoredToken, setStoredToken } from "../api/api";
import type { AuthResponse, AuthUser, LoginInput, RegisterInput } from "./auth.types";

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    async function bootstrap() {
      try {
        const response = await api.get<{ user: AuthUser }>("/auth/me");
        setUser(response.data.user);
      } catch {
        clearStoredToken();
        setUser(null);
      } finally {
        setIsBootstrapping(false);
      }
    }

    void bootstrap();
  }, []);

  async function handleAuthResponse(request: Promise<{ data: AuthResponse }>) {
    const response = await request;
    setStoredToken(response.data.token);
    setUser(response.data.user);
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isBootstrapping,
      login: async (input) => {
        await handleAuthResponse(api.post<AuthResponse>("/auth/login", input));
      },
      register: async (input) => {
        await handleAuthResponse(api.post<AuthResponse>("/auth/register", input));
      },
      logout: () => {
        clearStoredToken();
        setUser(null);
      },
    }),
    [isBootstrapping, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}


