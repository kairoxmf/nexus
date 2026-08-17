import type {
  GridMetrics,
  GridOptimizeResult,
  GridSimulationState,
  ImpactMatrixRow,
  RLTrainResult,
} from "../types";
import { BUILDING_I18N_KEYS } from "./gridMapVisuals";

const API_BASE = import.meta.env.VITE_API_URL ?? "";
const API = `${API_BASE}/api/v1/grid-sim`;

async function post<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`Grid API ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`);
  if (!res.ok) throw new Error(`Grid API ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export async function fetchGridState(): Promise<GridSimulationState> {
  return get<GridSimulationState>("/state");
}

export async function resetGrid(): Promise<GridSimulationState> {
  const data = await post<{ state: GridSimulationState }>("/reset");
  return data.state;
}

export async function buildOnGrid(x: number, y: number, building: string): Promise<GridSimulationState> {
  const data = await post<{ state: GridSimulationState }>("/build", { x, y, building });
  return data.state;
}

export async function stepGrid(
  action?: { x: number; y: number; building: string },
): Promise<{ state: GridSimulationState; reward: number; done: boolean; events?: string[] }> {
  return post("/step", action ?? {});
}

export async function fetchImpactMatrix(): Promise<{
  rows: ImpactMatrixRow[];
  buildings: Record<string, string>;
  costs: Record<string, number>;
}> {
  return get("/impact-matrix");
}

export async function runOptimization(params?: {
  population_size?: number;
  generations?: number;
}): Promise<GridOptimizeResult> {
  return post<GridOptimizeResult>("/optimize", params ?? {});
}

export async function applyPlan(plan: Record<string, number>): Promise<GridSimulationState> {
  const data = await post<{ state: GridSimulationState }>("/apply-plan", { plan });
  return data.state;
}

export async function trainRL(
  algorithm: "q_learning" | "ppo" | "both" = "both",
  episodes = 5,
): Promise<{ q_learning?: RLTrainResult; ppo?: RLTrainResult }> {
  return post("/rl/train", { algorithm, episodes, steps_per_episode: 20 });
}

export async function rlStep(algorithm: "q_learning" | "ppo"): Promise<GridSimulationState> {
  const data = await post<{ state: GridSimulationState }>(`/rl/step?algorithm=${algorithm}`);
  return data.state;
}

export const METRIC_KEYS: (keyof GridMetrics)[] = [
  "money",
  "survival",
  "security",
  "accessibility",
  "food",
  "satisfaction",
];

export const BUILDING_PALETTE: { symbol: string; color: string; i18nKey: string }[] = [
  { symbol: "=", color: "#7fa8c9", i18nKey: BUILDING_I18N_KEYS["="] },
  { symbol: "h", color: "#6b7280", i18nKey: BUILDING_I18N_KEYS.h },
  { symbol: "$", color: "#ffd166", i18nKey: BUILDING_I18N_KEYS.$ },
  { symbol: "R", color: "#4a5568", i18nKey: BUILDING_I18N_KEYS.R },
  { symbol: "F", color: "#33c17a", i18nKey: BUILDING_I18N_KEYS.F },
  { symbol: "S", color: "#ff4655", i18nKey: BUILDING_I18N_KEYS.S },
  { symbol: "P", color: "#6fdc8c", i18nKey: BUILDING_I18N_KEYS.P },
  { symbol: "I", color: "#c9a24c", i18nKey: BUILDING_I18N_KEYS.I },
  { symbol: "W", color: "#4cc9f0", i18nKey: BUILDING_I18N_KEYS.W },
  { symbol: "E", color: "#f4a100", i18nKey: BUILDING_I18N_KEYS.E },
  { symbol: "M", color: "#ff9f43", i18nKey: BUILDING_I18N_KEYS.M },
  { symbol: "L", color: "#6c7ce0", i18nKey: BUILDING_I18N_KEYS.L },
  { symbol: "D", color: "#b885f0", i18nKey: BUILDING_I18N_KEYS.D },
  { symbol: "T", color: "#ff7a45", i18nKey: BUILDING_I18N_KEYS.T },
  { symbol: "G", color: "#ffe66d", i18nKey: BUILDING_I18N_KEYS.G },
];

export function cellColor(symbol: string): string {
  if (symbol === "C") return "#ffd166";
  if (symbol === ".") return "#0a1828";
  return BUILDING_PALETTE.find((b) => b.symbol === symbol)?.color ?? "#243858";
}

export function isSolarCell(x: number, y: number): boolean {
  return x < 3 && y < 3;
}

export function buildingLabelKey(symbol: string): string {
  return BUILDING_I18N_KEYS[symbol] ?? "bld_unknown";
}

export function exportGridJson(): void {
  window.open(`${API}/export`, "_blank");
}
