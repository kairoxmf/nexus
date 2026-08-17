import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const API = import.meta.env.VITE_API_URL ?? "";
const LOCAL_USERS_KEY = "nexus_local_users";
const LOCAL_TOKEN_PREFIX = "local:";

export interface SereneProfile {
  name: string;
  email: string;
  phone?: string;
  goals?: string;
  createdAt: string;
}

export interface AuthUser {
  authenticated: boolean;
  username?: string;
  role?: string;
  tenant?: string;
  profile?: SereneProfile;
}

interface LocalUserRecord {
  username: string;
  password: string;
  role: string;
  tenant: string;
  profile: SereneProfile;
}

interface RegisterInput {
  username: string;
  password: string;
  name: string;
  email: string;
  phone?: string;
  goals?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  register: (input: RegisterInput) => Promise<void>;
  isUsernameTaken: (username: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const RESERVED_USERNAMES = new Set(["commander", "analyst", "citizen"]);

function loadProfile(): SereneProfile | undefined {
  try {
    const raw = localStorage.getItem("serene_profile");
    return raw ? (JSON.parse(raw) as SereneProfile) : undefined;
  } catch {
    return undefined;
  }
}

function loadLocalUsers(): Record<string, LocalUserRecord> {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, LocalUserRecord>) : {};
  } catch {
    return {};
  }
}

function saveLocalUsers(users: Record<string, LocalUserRecord>) {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

function saveProfile(profile: SereneProfile) {
  localStorage.setItem("serene_profile", JSON.stringify(profile));
}

function isLocalToken(token: string | null): boolean {
  return Boolean(token?.startsWith(LOCAL_TOKEN_PREFIX));
}

function localUsernameFromToken(token: string): string {
  return token.slice(LOCAL_TOKEN_PREFIX.length);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const restoreLocalUser = useCallback((username: string): AuthUser | null => {
    const record = loadLocalUsers()[username.toLowerCase()];
    if (!record) return null;
    return {
      authenticated: true,
      username: record.username,
      role: record.role,
      tenant: record.tenant,
      profile: record.profile,
    };
  }, []);

  const fetchMe = useCallback(async () => {
    const token = localStorage.getItem("nexus_token");
    const profile = loadProfile();

    if (!token) {
      setUser(profile ? { authenticated: false, profile } : null);
      setLoading(false);
      return;
    }

    if (isLocalToken(token)) {
      const localUser = restoreLocalUser(localUsernameFromToken(token));
      if (localUser) {
        setUser(localUser);
        localStorage.setItem("nexus_role", localUser.role ?? "citizen");
      } else {
        localStorage.removeItem("nexus_token");
        localStorage.removeItem("nexus_role");
        setUser(profile ? { authenticated: false, profile } : null);
      }
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API}/api/v1/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await res.json()) as AuthUser;
      if (data.authenticated) {
        const localUsers = loadLocalUsers();
        const localMatch = Object.values(localUsers).find(
          (u) => u.username.toLowerCase() === data.username?.toLowerCase(),
        );
        setUser({
          ...data,
          profile: localMatch?.profile ?? profile ?? undefined,
        });
        if (data.role) localStorage.setItem("nexus_role", data.role);
      } else {
        localStorage.removeItem("nexus_token");
        localStorage.removeItem("nexus_role");
        setUser(profile ? { authenticated: false, profile } : null);
      }
    } catch {
      setUser(profile ? { authenticated: false, profile } : null);
    } finally {
      setLoading(false);
    }
  }, [restoreLocalUser]);

  useEffect(() => {
    void fetchMe();
  }, [fetchMe]);

  const isUsernameTaken = useCallback((username: string) => {
    const key = username.trim().toLowerCase();
    if (!key) return false;
    if (RESERVED_USERNAMES.has(key)) return true;
    return Boolean(loadLocalUsers()[key]);
  }, []);

  const login = useCallback(
    async (username: string, password: string) => {
      const trimmed = username.trim();
      const key = trimmed.toLowerCase();

      try {
        const res = await fetch(`${API}/api/v1/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: trimmed, password }),
        });
        if (res.ok) {
          const data = (await res.json()) as {
            access_token: string;
            role: string;
            tenant: string;
          };
          localStorage.setItem("nexus_token", data.access_token);
          localStorage.setItem("nexus_role", data.role);
          await fetchMe();
          return;
        }
      } catch {
        /* fall through to local auth */
      }

      const localUser = loadLocalUsers()[key];
      if (localUser && localUser.password === password) {
        localStorage.setItem("nexus_token", `${LOCAL_TOKEN_PREFIX}${key}`);
        localStorage.setItem("nexus_role", localUser.role);
        setUser({
          authenticated: true,
          username: localUser.username,
          role: localUser.role,
          tenant: localUser.tenant,
          profile: localUser.profile,
        });
        return;
      }

      throw new Error("Invalid credentials");
    },
    [fetchMe],
  );

  const logout = useCallback(() => {
    localStorage.removeItem("nexus_token");
    localStorage.removeItem("nexus_role");
    const profile = loadProfile();
    setUser(profile ? { authenticated: false, profile } : null);
  }, []);

  const register = useCallback(
    async (input: RegisterInput) => {
      const username = input.username.trim();
      const key = username.toLowerCase();

      if (!username || !input.password || !input.name.trim() || !input.email.trim()) {
        throw new Error("Missing required fields");
      }
      if (input.password.length < 6) {
        throw new Error("Password too short");
      }
      if (isUsernameTaken(username)) {
        throw new Error("Username taken");
      }

      const profile: SereneProfile = {
        name: input.name.trim(),
        email: input.email.trim(),
        phone: input.phone?.trim() || undefined,
        goals: input.goals?.trim() || undefined,
        createdAt: new Date().toISOString(),
      };

      const users = loadLocalUsers();
      users[key] = {
        username,
        password: input.password,
        role: "citizen",
        tenant: "dc-metro",
        profile,
      };
      saveLocalUsers(users);
      saveProfile(profile);

      setUser({
        authenticated: false,
        profile,
      });
    },
    [isUsernameTaken],
  );

  const value = useMemo(
    () => ({ user, loading, login, logout, register, isUsernameTaken }),
    [user, loading, login, logout, register, isUsernameTaken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
