"""Crisis replay report and executive briefing generation."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from app.engine.simulator import simulator


def generate_replay_report() -> dict[str, Any]:
    replay = simulator._replay  # noqa: SLF001 — internal buffer access for reporting
    if not replay:
        return {
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "tick_range": [0, simulator.state.tick],
            "summary": "No replay data yet. Trigger a disaster and run the simulation.",
            "sections": [],
        }

    first = replay[0]
    last = replay[-1]
    health_start = first.get("metrics", {}).get("city_health", 100)
    health_end = last.get("metrics", {}).get("city_health", simulator.state.metrics.city_health)
    delta = round(health_end - health_start, 1)

    critical_events = [
        e for snap in replay for e in snap.get("log", []) if e.get("level") in ("critical", "warning")
    ][-20:]

    chains = simulator.get_cascade_chain()
    nodes_destroyed = [n.name for n in simulator.state.nodes if n.status.value == "destroyed"]

    sections = [
        {
            "title": "Executive Summary",
            "body": (
                f"Simulation T+0 to T+{simulator.state.tick}: city health moved from {health_start}% to {health_end}% "
                f"({delta:+}%). Active disaster: {simulator.state.active_disaster or 'none'}."
            ),
        },
        {
            "title": "Infrastructure Impact",
            "body": f"{len(nodes_destroyed)} nodes destroyed. Cascade chains detected: {len(chains)}.",
            "items": nodes_destroyed[:8],
        },
        {
            "title": "Cascade Analysis",
            "body": "Dependency failures propagated as follows:",
            "items": [f"{c['node']} ← {', '.join(c['caused_by'])}" for c in chains[:6]],
        },
        {
            "title": "AI Agent Actions",
            "body": f"Active agents: {', '.join(simulator.state.active_agents) or 'none'}.",
            "items": [e.get("text", "") for e in critical_events[-6:]],
        },
        {
            "title": "Recovery Outlook",
            "body": (
                f"Recovery mode {'ON' if simulator.state.recovery_mode else 'OFF'}. "
                f"Projected recovery {simulator.state.metrics.recovery_percentage:.0f}%."
            ),
        },
    ]

    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "tick_range": [first.get("tick", 0), last.get("tick", simulator.state.tick)],
        "health_delta": delta,
        "disaster": simulator.state.active_disaster.value if simulator.state.active_disaster else None,
        "summary": sections[0]["body"],
        "sections": sections,
        "metrics": simulator.state.metrics.model_dump(),
        "city_dna": simulator.state.city_dna,
    }


def generate_briefing_pdf_bytes(report: dict[str, Any]) -> bytes:
    """Minimal PDF (text lines) — no external dependency required."""
    lines = [
        "NEXUS Executive Briefing",
        f"Generated: {report.get('generated_at', '')}",
        "",
        report.get("summary", ""),
        "",
    ]
    for sec in report.get("sections", []):
        lines.append(sec.get("title", ""))
        lines.append(sec.get("body", ""))
        for item in sec.get("items", []) or []:
            lines.append(f"  - {item}")
        lines.append("")

    content = "\n".join(lines)
    # Simple PDF structure
    objects = []
    objects.append("1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj")
    objects.append("2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj")
    stream = f"BT /F1 10 Tf 50 750 Td ({content.replace('(', '[').replace(')', ']')[:3500]}) Tj ET"
    objects.append(f"3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources<< /Font<< /F1 5 0 R >> >> >>endobj")
    objects.append(f"4 0 obj<< /Length {len(stream)} >>stream\n{stream}\nendstream endobj")
    objects.append("5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj")

    pdf = "%PDF-1.4\n"
    offsets = [0]
    for i, obj in enumerate(objects, start=1):
        offsets.append(len(pdf))
        pdf += obj + "\n"
    xref_pos = len(pdf)
    pdf += f"xref\n0 {len(objects)+1}\n"
    pdf += "0000000000 65535 f \n"
    for off in offsets[1:]:
        pdf += f"{off:010d} 00000 n \n"
    pdf += f"trailer<< /Size {len(objects)+1} /Root 1 0 R >>\nstartxref\n{xref_pos}\n%%EOF"
    return pdf.encode("latin-1", errors="replace")
