import { useCallback, useEffect, useRef, useState } from "react";
import type { DisasterOption, SimulationState } from "../types";

const API = import.meta.env.VITE_API_URL ?? "";
const API_TIMEOUT_MS = 12_000;

function buildWsUrl(): string {
  if (import.meta.env.VITE_WS_URL) return import.meta.env.VITE_WS_URL;
  const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${proto}//${window.location.host}/ws`;
}

async function parseApiError(res: Response): Promise<string> {
  const text = await res.text();
  try {
    const data = JSON.parse(text) as { detail?: unknown };
    if (typeof data.detail === "string") return data.detail;
    if (Array.isArray(data.detail)) {
      return data.detail
        .map((d: { msg?: string; loc?: string[] }) => {
          const field = d.loc?.slice(-1)[0] ?? "field";
          return `${field}: ${d.msg ?? "invalid"}`;
        })
        .join("; ");
    }
  } catch {
    /* not json */
  }
  return text || `Request failed (${res.status})`;
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem("nexus_token");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { ...headers, ...(init?.headers as Record<string, string> | undefined) },
    signal: AbortSignal.timeout(API_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(await parseApiError(res));
  return res.json();
}

export function useSimulation() {
  const [state, setState] = useState<SimulationState | null>(null);
  const [connected, setConnected] = useState(false);
  const [disasters, setDisasters] = useState<DisasterOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);

  const connectWs = useCallback(() => {
    wsRef.current?.close();
    const ws = new WebSocket(buildWsUrl());
    wsRef.current = ws;
    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);
    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.type === "state") setState(msg.data);
      if (msg.type === "sos" && msg.data?.report) {
        setState((prev) => {
          if (!prev) return prev;
          const creative = prev.creative ?? {};
          const sos = creative.sos_sync ?? { reports: [], active_count: 0, intel_reports: [] };
          return {
            ...prev,
            creative: {
              ...creative,
              sos_sync: {
                ...sos,
                reports: [msg.data.report, ...sos.reports].slice(0, 15),
                active_count: sos.active_count + 1,
              },
            },
          };
        });
      }
    };
  }, []);

  const runAction = useCallback(async <T,>(fn: () => Promise<T>): Promise<T | null> => {
    setActionError(null);
    setActionBusy(true);
    try {
      return await fn();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Action failed";
      setActionError(msg);
      console.error("NEXUS action failed:", msg);
      return null;
    } finally {
      setActionBusy(false);
    }
  }, []);

  const loadInitial = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await api<{ status: string }>("/health");
      const [st, dis] = await Promise.all([
        api<SimulationState>("/api/v1/state"),
        api<{ disasters: DisasterOption[] }>("/api/v1/disasters"),
      ]);
      setState(st);
      setDisasters(dis.disasters);
      connectWs();
      return true;
    } catch (e) {
      const raw = e instanceof Error ? e.message : "Connection failed";
      const timedOut = e instanceof DOMException && e.name === "TimeoutError";
      const msg = timedOut
        ? "Backend did not respond in time (is uvicorn running on port 8000?)"
        : raw;
      setError(`Backend is not running on port 8000 (${msg}). Run: .\\scripts\\start.ps1`);
      setConnected(false);
      return false;
    } finally {
      setLoading(false);
    }
  }, [connectWs]);

  useEffect(() => {
    loadInitial();
    return () => wsRef.current?.close();
  }, [loadInitial]);

  useEffect(() => {
    if (!error || state) return;
    const timer = setInterval(() => loadInitial(), 4000);
    return () => clearInterval(timer);
  }, [error, state, loadInitial]);

  const triggerDisaster = async (params: {
    disaster_type: string;
    latitude: number;
    longitude: number;
    magnitude: number;
    radius: number;
  }) => {
    const data = await runAction(() =>
      api<SimulationState>("/api/v1/disaster/trigger", {
        method: "POST",
        body: JSON.stringify(params),
      })
    );
    if (data) setState(data);
    return !!data;
  };

  const toggleRecovery = async (enabled: boolean) => {
    const data = await runAction(() =>
      api<SimulationState>(`/api/v1/recovery/toggle?enabled=${enabled}`, { method: "POST" })
    );
    if (data) setState(data);
    return !!data;
  };

  const godMode = async (action: string, nodeId?: string) => {
    const data = await runAction(() =>
      api<SimulationState>("/api/v1/god-mode", {
        method: "POST",
        body: JSON.stringify({ action, node_id: nodeId }),
      })
    );
    if (data) setState(data);
    return !!data;
  };

  const reset = async () => {
    const data = await runAction(() =>
      api<SimulationState>("/api/v1/state/reset", { method: "POST" })
    );
    if (data) setState(data);
    return !!data;
  };

  const applyState = useCallback((next: SimulationState) => {
    setState(next);
  }, []);

  const immersivePost = useCallback(async (path: string, body?: object) => {
    setActionError(null);
    setActionBusy(true);
    try {
      const token = localStorage.getItem("nexus_token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(`${API}/api/v1/immersive/${path}`, {
        method: "POST",
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(API_TIMEOUT_MS),
      });
      if (!res.ok) throw new Error(await parseApiError(res));
      const data = (await res.json()) as { state?: SimulationState };
      if (data.state) setState(data.state);
      return data;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Action failed";
      setActionError(msg);
      console.error("NEXUS immersive action failed:", msg);
      return null;
    } finally {
      setActionBusy(false);
    }
  }, []);

  return {
    state,
    connected,
    disasters,
    error,
    actionError,
    actionBusy,
    clearActionError: () => setActionError(null),
    loading,
    retry: loadInitial,
    triggerDisaster,
    toggleRecovery,
    godMode,
    reset,
    applyState,
    immersivePost,
  };
}
