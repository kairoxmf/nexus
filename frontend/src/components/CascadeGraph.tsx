import { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import { useI18n } from "../i18n";

const API = import.meta.env.VITE_API_URL ?? "";

interface GraphNode {
  id: string;
  label: string;
  status: string;
}

interface GraphEdge {
  source: string;
  target: string;
  type: string;
}

export function CascadeGraph() {
  const { t } = useI18n();
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);

  useEffect(() => {
    const load = () => {
      fetch(`${API}/api/v1/simulation/cascade-graph`)
        .then((r) => r.json())
        .then((d) => {
          setNodes(d.nodes ?? []);
          setEdges(d.edges ?? []);
        })
        .catch(() => {});
    };
    load();
    const timer = setInterval(load, 5000);
    return () => clearInterval(timer);
  }, []);

  const colorMap: Record<string, string> = {
    failed: "#ff4655",
    critical: "#ff4655",
    destroyed: "#ff4655",
    at_risk: "#f4a100",
    damaged: "#f4a100",
  };

  const option = {
    backgroundColor: "transparent",
    tooltip: {},
    series: [{
      type: "graph",
      layout: "force",
      roam: true,
      label: { show: true, color: "#e8edf2", fontSize: 9 },
      force: { repulsion: 120, edgeLength: 80 },
      data: nodes.map((n) => ({
        name: n.label,
        symbolSize: n.status === "failed" ? 28 : 20,
        itemStyle: { color: colorMap[n.status] ?? "#4cc9f0" },
      })),
      links: edges.map((e) => ({
        source: e.source,
        target: e.target,
        lineStyle: { color: e.type === "cascade" ? "#ff4655" : "#4cc9f0", width: e.type === "cascade" ? 2 : 1 },
      })),
    }],
  };

  if (nodes.length === 0) {
    return <div className="hint">{t("cascade_empty")}</div>;
  }

  return (
    <div className="lab-panel">
      <ReactECharts option={option} style={{ height: 200, width: "100%" }} opts={{ renderer: "svg" }} />
      <div className="hint">{nodes.length} {t("cascade_stats")} {edges.length}</div>
    </div>
  );
}
