import { useEffect, useState } from "react";
import { useI18n } from "../i18n";

const API = import.meta.env.VITE_API_URL ?? "";

interface ReportSection {
  title: string;
  body: string;
  items?: string[];
}

interface Report {
  summary: string;
  generated_at: string;
  tick_range: number[];
  health_delta: number;
  sections: ReportSection[];
}

export function ReplayReport() {
  const { t } = useI18n();
  const [report, setReport] = useState<Report | null>(null);

  const load = () => {
    fetch(`${API}/api/v1/simulation/replay-report`)
      .then((r) => r.json())
      .then(setReport)
      .catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const exportPdf = async () => {
    const r = await fetch(`${API}/api/v1/ai/briefing/export`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ format: "pdf" }),
    });
    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "nexus-briefing.pdf";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!report) return <div className="hint">{t("report_generating")}</div>;

  return (
    <div className="lab-panel replay-report">
      <div className="hint" style={{ marginBottom: 8 }}>{report.summary}</div>
      <div style={{ fontSize: 9, color: "var(--muted)", marginBottom: 8 }}>
        T+{report.tick_range?.[0] ?? 0} → T+{report.tick_range?.[1] ?? 0}
        {" · "}{t("report_health_delta")} {report.health_delta > 0 ? "+" : ""}{report.health_delta ?? 0}%
      </div>
      {report.sections?.slice(0, 3).map((sec) => (
        <div key={sec.title} style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 10, color: "var(--cyan)", marginBottom: 2 }}>{sec.title}</div>
          <div className="hint">{sec.body}</div>
        </div>
      ))}
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button className="btn-ghost" onClick={load}>{t("report_refresh")}</button>
        <button className="btn-ghost" onClick={exportPdf}>{t("report_export_pdf")}</button>
      </div>
    </div>
  );
}
