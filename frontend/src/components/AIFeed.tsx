import { translateAgent, useI18n } from "../i18n";
import type { LogEntry } from "../types";

interface Props {
  log: LogEntry[];
  activeAgents: string[];
}

const ALL_AGENTS = [
  "Commander AI", "Emergency AI", "Medical AI", "Transportation AI",
  "Power AI", "Water AI", "Fire AI", "Police AI", "Food AI",
  "Construction AI", "Economic AI", "Communication AI",
];

export function AIFeed({ log, activeAgents }: Props) {
  const { t, locale } = useI18n();

  return (
    <>
      <div className="section-title">{t("ai_decision_feed")}</div>
      {log.length === 0 ? (
        <div className="hint">{t("ai_feed_empty")}</div>
      ) : (
        <div className="log-list">
          {log.slice(0, 25).map((e, i) => (
            <div key={`${e.tick}-${i}`} className={`log-entry ${e.level}`}>
              <span className="t">T+{e.tick}</span>
              {e.agent && (
                <strong style={{ color: "#F4A100" }}>{translateAgent(locale, e.agent)}: </strong>
              )}
              <span dangerouslySetInnerHTML={{ __html: e.text.replace(/<span class="agent">/g, '<strong style="color:#F4A100">').replace(/<\/span>/g, "</strong>") }} />
              {e.explanation && (
                <div className="hint" style={{ marginTop: 4 }}>
                  {t("confidence")}: {String((e.explanation.confidence as number) * 100 || "—")}% ·{" "}
                  {String(e.explanation.reason ?? "")}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="section" style={{ marginTop: 18 }}>
        <div className="section-title">{t("agent_status")}</div>
        <div className="agent-strip">
          {ALL_AGENTS.map((a) => (
            <span key={a} className={`agent-chip ${activeAgents.includes(a) ? "active" : ""}`}>
              {translateAgent(locale, a)}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
