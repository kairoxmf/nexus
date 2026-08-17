import { useCallback, useEffect, useState } from "react";
import { useI18n } from "../i18n";
import {
  AGENT_KEYS,
  exportTrainingJson,
  fetchTrainStatus,
  runTrainCycle,
  setAutoTrain,
  type AgentKey,
  type AutoTrainStatus,
} from "../lib/aiTrainApi";

const AGENT_I18N: Record<AgentKey, string> = {
  q_learning: "auto_train_q",
  ppo: "auto_train_ppo",
  optimizer: "auto_train_optimizer",
  chatbot: "auto_train_chatbot",
};

function statusLabel(status: string, t: (k: string) => string): string {
  if (status === "running") return t("auto_train_running");
  if (status === "done") return t("auto_train_done");
  if (status === "error") return t("auto_train_error");
  return t("auto_train_idle");
}

export function AutoTrainPanel() {
  const { t } = useI18n();
  const [status, setStatus] = useState<AutoTrainStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setStatus(await fetchTrainStatus());
    } catch {
      /* offline */
    }
  }, []);

  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => void refresh(), 3000);
    return () => window.clearInterval(id);
  }, [refresh]);

  const handleRun = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await runTrainCycle(8);
      if (!res.ok) setError(res.msg ?? t("auto_train_failed"));
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("auto_train_failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAuto = async () => {
    setError(null);
    try {
      const next = !status?.auto_enabled;
      setStatus(await setAutoTrain(next, 60, 5));
    } catch (e) {
      setError(e instanceof Error ? e.message : t("auto_train_failed"));
    }
  };

  return (
    <div className="auto-train-panel">
      <p className="hint">{t("auto_train_desc")}</p>

      <div className="auto-train-actions">
        <button type="button" className="btn-primary" disabled={loading || status?.running} onClick={() => void handleRun()}>
          {loading || status?.running ? t("auto_train_running") : t("auto_train_run")}
        </button>
        <button
          type="button"
          className={`btn-ghost${status?.auto_enabled ? " active" : ""}`}
          onClick={() => void handleToggleAuto()}
        >
          {status?.auto_enabled ? t("auto_train_stop") : t("auto_train_start")}
        </button>
        <button type="button" className="btn-ghost" onClick={exportTrainingJson}>
          {t("grid_export_json")}
        </button>
      </div>

      {status?.auto_enabled && (
        <div className="auto-train-badge">{t("auto_train_active")} · {t("auto_train_cycles")}: {status.cycle_count}</div>
      )}

      {error && <div className="grid-panel-error">{error}</div>}

      <div className="auto-train-agents">
        {AGENT_KEYS.map((key) => {
          const agent = status?.agents[key];
          const progress = agent?.progress ?? 0;
          return (
            <div key={key} className={`auto-train-agent status-${agent?.status ?? "idle"}`}>
              <div className="auto-train-agent-head">
                <span>{t(AGENT_I18N[key])}</span>
                <strong>{statusLabel(agent?.status ?? "idle", t)}</strong>
              </div>
              <div className="auto-train-bar">
                <div className="auto-train-bar-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {status && status.knowledge_version > 0 && (
        <div className="auto-train-knowledge">
          <div className="auto-train-knowledge-title">
            {t("auto_train_knowledge")} v{status.knowledge_version}
          </div>
          <ul>
            {status.knowledge_preview.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <p className="hint">{t("auto_train_chat_hint")}</p>
        </div>
      )}

      {status && status.logs.length > 0 && (
        <div className="auto-train-logs">
          <div className="auto-train-knowledge-title">{t("auto_train_logs")}</div>
          {status.logs.slice().reverse().map((log) => (
            <div key={`${log.timestamp}-${log.message}`} className={`auto-train-log level-${log.level}`}>
              {log.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
