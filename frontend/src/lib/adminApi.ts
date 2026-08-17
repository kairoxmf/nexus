const API = import.meta.env.VITE_API_URL ?? "";

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("nexus_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function adminFetch<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${API}/api/v1/admin${path}`, {
      ...init,
      headers: {
        ...authHeaders(),
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export interface AdminOverview {
  tick: number;
  city_health: number;
  metrics: Record<string, number>;
  active_disaster: string | null;
  recovery_enabled: boolean;
  vehicles: number;
  agents: string[];
  sos_count: number;
  intel_count: number;
  inbox_count: number;
  platform: Record<string, unknown>;
  nodes: Array<{ id: string; name: string; type: string; health: number; status: string }>;
}

export interface AdminSosReport {
  id: string;
  latitude?: number;
  longitude?: number;
  message?: string;
  contact?: string;
  status?: string;
  response_status?: string;
  eta_minutes?: number;
  created_at?: string | null;
  timestamp?: string;
  vehicle_id?: string;
}

export interface AdminIntelReport {
  id: string;
  message?: string;
  category?: string;
  latitude?: number;
  longitude?: number;
  credibility?: number;
  timestamp?: string;
}

export async function fetchAdminOverview() {
  return adminFetch<AdminOverview>("/overview");
}

export async function fetchAdminSos() {
  return adminFetch<{ reports: AdminSosReport[]; total: number }>("/sos");
}

export async function updateSosStatus(id: string, status: string, note = "") {
  return adminFetch<{ ok: boolean; report: AdminSosReport }>(`/sos/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status, note }),
  });
}

export async function fetchAdminIntel() {
  return adminFetch<{ reports: AdminIntelReport[]; total: number }>("/intel");
}

export async function adminGodMode(action: string, nodeId?: string) {
  return adminFetch<{ ok: boolean }>("/god-mode", {
    method: "POST",
    body: JSON.stringify({ action, node_id: nodeId ?? null }),
  });
}

export async function adminResetCity() {
  return adminFetch<{ ok: boolean }>("/reset", { method: "POST" });
}
