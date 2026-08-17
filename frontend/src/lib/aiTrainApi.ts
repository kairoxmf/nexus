export interface AgentTrainStatus {
  status: "idle" | "running" | "done" | "error";
  progress: number;
  last_result?: unknown;
}

export interface AutoTrainStatus {
  auto_enabled: boolean;
  running: boolean;
  cycle_count: number;
  last_run_at: string | null;
  knowledge_version: number;
  agents: Record<string, AgentTrainStatus>;
  logs: { timestamp: string; level: string; message: string }[];
  knowledge_preview: string[];
}

const API_BASE = import.meta.env.VITE_API_URL ?? "";
const API = `${API_BASE}/api/v1/ai/training`;

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`);
  if (!res.ok) throw new Error(`Training API ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

async function post<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`Training API ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export async function fetchTrainStatus(): Promise<AutoTrainStatus> {
  return get<AutoTrainStatus>("/status");
}

export async function runTrainCycle(episodes = 8): Promise<{ ok: boolean; cycle?: number; msg?: string }> {
  return post("/run", { episodes });
}

export async function setAutoTrain(enabled: boolean, intervalSec = 60, episodes = 5): Promise<AutoTrainStatus> {
  return post<AutoTrainStatus>("/auto", { enabled, interval_sec: intervalSec, episodes });
}

export function exportTrainingJson(): void {
  window.open(`${API}/export`, "_blank");
}

export const AGENT_KEYS = ["q_learning", "ppo", "optimizer", "chatbot"] as const;
export type AgentKey = (typeof AGENT_KEYS)[number];
