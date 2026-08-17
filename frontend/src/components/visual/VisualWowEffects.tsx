import { useEffect, useMemo, useRef } from "react";
import type { SimulationState } from "../../types";
import { useVisualWow } from "../../context/VisualWowContext";
import { useI18n } from "../../i18n";
import { useSoundscapeEngine } from "../../hooks/useSoundscapeEngine";
import { Icon3D } from "@shared/icons";

/* ─── EKG heartbeat line for header ─── */
export function EKGHeaderLine({ bpm, tier }: { bpm: number; tier: string }) {
  const pathRef = useRef<SVGPathElement>(null);
  const color =
    tier === "green" ? "#33c17a"
    : tier === "amber" ? "#f4a100"
    : tier === "red" ? "#ff4655"
    : "#ff0044";

  return (
    <div className="wow-ekg-header" style={{ "--ekg-color": color, "--ekg-bpm": bpm } as React.CSSProperties}>
      <svg viewBox="0 0 200 24" preserveAspectRatio="none" aria-hidden>
        <path
          ref={pathRef}
          className="wow-ekg-path"
          d="M0,12 L30,12 L38,4 L46,20 L54,12 L80,12 L88,8 L96,16 L104,12 L130,12 L138,2 L146,22 L154,12 L200,12"
          fill="none"
          stroke={color}
          strokeWidth="1.5"
        />
      </svg>
      <span className="wow-ekg-bpm">{bpm}</span>
    </div>
  );
}

/* ─── Infrastructure health rings (Apple Watch style) ─── */
export function InfrastructureRings({ state }: { state: SimulationState }) {
  const rings = [
    { label: "PWR", value: state.metrics.power_grid, color: "#f4a100" },
    { label: "H₂O", value: state.metrics.water_network, color: "#4cc9f0" },
    { label: "COM", value: state.metrics.transport, color: "#33c17a" },
  ];

  return (
    <div className="wow-infra-rings">
      {rings.map((r) => (
        <div key={r.label} className="wow-infra-ring" title={`${r.label} ${r.value}%`}>
          <svg viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
            <circle
              cx="18"
              cy="18"
              r="15"
              fill="none"
              stroke={r.color}
              strokeWidth="3"
              strokeDasharray={`${(r.value / 100) * 94} 94`}
              strokeLinecap="round"
              transform="rotate(-90 18 18)"
            />
          </svg>
          <span>{r.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Canvas particle system ─── */
function ParticleCanvas({ type }: { type: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (type === "none") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId = 0;
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      size: number;
      color: string;
    }> = [];
    const count = type === "rain" ? 120 : type === "dust" ? 80 : 60;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * (type === "rain" ? 0.5 : 2),
        vy: type === "rain" ? 4 + Math.random() * 6 : type === "fire" ? -1 - Math.random() * 3 : (Math.random() - 0.5) * 2,
        life: Math.random(),
        size: type === "rain" ? 1.5 : 2 + Math.random() * 4,
        color:
          type === "fire" ? `rgba(255,${100 + Math.random() * 100},40,`
          : type === "rain" ? "rgba(150,180,255,"
          : type === "lightning" ? "rgba(200,220,255,"
          : type === "dust" ? "rgba(180,160,120,"
          : "rgba(120,120,120,",
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.008;
        if (p.life <= 0 || p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height) {
          p.x = Math.random() * canvas.width;
          p.y = type === "fire" ? canvas.height : 0;
          p.life = 1;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${0.3 + p.life * 0.5})`;
        ctx.fill();
      }
      if (type === "lightning" && Math.random() > 0.97) {
        ctx.strokeStyle = "rgba(255,255,255,0.9)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        let lx = Math.random() * canvas.width;
        let ly = 0;
        ctx.moveTo(lx, ly);
        for (let s = 0; s < 6; s++) {
          lx += (Math.random() - 0.5) * 40;
          ly += canvas.height / 6;
          ctx.lineTo(lx, ly);
        }
        ctx.stroke();
      }
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [type]);

  if (type === "none") return null;
  return <canvas ref={canvasRef} className="wow-particles-canvas" aria-hidden />;
}

/* ─── Constellation timeline overlay ─── */
function ConstellationOverlay({ state }: { state: SimulationState }) {
  const events = useMemo(() => {
    const items: Array<{ x: number; y: number; label: string }> = [];
    state.log.slice(-8).forEach((entry, i) => {
      items.push({
        x: 10 + (i / 7) * 80,
        y: 15 + Math.sin(i * 1.2) * 30 + 30,
        label: entry.text.slice(0, 20),
      });
    });
    return items;
  }, [state.log]);

  if (events.length < 2) return null;

  return (
    <div className="wow-constellation" aria-hidden>
      <svg viewBox="0 0 100 60" preserveAspectRatio="none">
        {events.slice(0, -1).map((e, i) => {
          const next = events[i + 1]!;
          return (
            <line key={i} x1={e.x} y1={e.y} x2={next.x} y2={next.y} stroke="rgba(180,200,255,0.25)" strokeWidth="0.3" />
          );
        })}
        {events.map((e, i) => (
          <g key={i}>
            <circle cx={e.x} cy={e.y} r="1.2" fill="#fff" opacity={0.6 + i * 0.05} />
          </g>
        ))}
      </svg>
    </div>
  );
}

/* ─── Neural network AI visualization ─── */
function NeuralNetOverlay({ log }: { log: SimulationState["log"] }) {
  const aiEntries = log.filter((e) => e.agent).slice(-5);
  if (!aiEntries.length) return null;

  const nodes = aiEntries.map((e, i) => ({
    id: e.agent ?? "AI",
    x: 20 + i * 18,
    y: 30 + Math.sin(i) * 15,
    active: i === aiEntries.length - 1,
  }));

  return (
    <div className="wow-neural-net">
      <div className="wow-hud-label">NEURAL PATH</div>
      <svg viewBox="0 0 100 50">
        {nodes.slice(0, -1).map((n, i) => {
          const next = nodes[i + 1]!;
          return (
            <line
              key={i}
              x1={n.x}
              y1={n.y}
              x2={next.x}
              y2={next.y}
              stroke={next.active ? "#4cc9f0" : "rgba(76,201,240,0.3)"}
              strokeWidth="0.5"
            />
          );
        })}
        {nodes.map((n, i) => (
          <circle key={i} cx={n.x} cy={n.y} r={n.active ? 2.5 : 1.8} fill={n.active ? "#4cc9f0" : "#6b7688"} />
        ))}
      </svg>
    </div>
  );
}

/* ─── Crisis DNA fingerprint badge ─── */
function CrisisDNABadge({ fingerprint, disaster }: { fingerprint: string; disaster?: string }) {
  const hash = fingerprint.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const hue = hash % 360;
  const pattern = hash % 4;

  return (
    <div className="wow-crisis-dna" style={{ "--dna-hue": hue } as React.CSSProperties}>
      <div className={`wow-dna-pattern pat-${pattern}`} />
      <div className="wow-dna-label">
        <span>CRISIS DNA</span>
        <code>{fingerprint.slice(0, 16)}</code>
        {disaster && <small>{disaster.replace(/_/g, " ")}</small>}
      </div>
    </div>
  );
}

/* ─── 3D CSS Achievement Trophy ─── */
function Trophy3D({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="wow-trophy-3d" onClick={onDismiss} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && onDismiss()}>
      <div className="wow-trophy-cup">🏆</div>
      <div className="wow-trophy-glow" />
      <span>CERTIFIED</span>
    </div>
  );
}

/* ─── Wax seal stamp animation ─── */
function WaxSealOverlay({ decision }: { decision: string }) {
  return (
    <div className="wow-wax-seal" key={decision}>
      <div className="wow-seal-inner">
        <span className="wow-seal-text">APPROVED</span>
        <span className="wow-seal-decision">{decision.slice(0, 40)}</span>
      </div>
    </div>
  );
}

/* ─── Crisis Tarot card flip ─── */
function TarotCard({ card, onClose }: { card: { title: string; titleFa: string; emoji: string; severity: string; description: string }; onClose: () => void }) {
  const { locale } = useI18n();
  return (
    <div className="wow-tarot-overlay" onClick={onClose}>
      <div className={`wow-tarot-card sev-${card.severity}`} onClick={(e) => e.stopPropagation()}>
        <div className="wow-tarot-back">✦ NEXUS ✦</div>
        <div className="wow-tarot-front">
          <span className="wow-tarot-emoji">{card.emoji}</span>
          <h3>{locale === "fa" ? card.titleFa : card.title}</h3>
          <p>{card.description}</p>
          <button type="button" className="btn-ghost btn-xs" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Memorial wall post-crisis ─── */
function MemorialWall({ names }: { names: string[] }) {
  return (
    <div className="wow-memorial-wall">
      <div className="wow-memorial-title">In Memory</div>
      <div className="wow-memorial-plaques">
        {names.map((n) => (
          <div key={n} className="wow-memorial-plaque">{n}</div>
        ))}
      </div>
    </div>
  );
}

/* ─── Dual timeline scrubber ─── */
function DualTimelineScrubber({
  maxTick,
  alt,
  now,
  onAlt,
  onNow,
}: {
  maxTick: number;
  alt: number;
  now: number;
  onAlt: (v: number) => void;
  onNow: (v: number) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="wow-dual-timeline">
      <label>
        <span>{t("wow_timeline_alt")}</span>
        <input type="range" min={0} max={maxTick} value={alt} onChange={(e) => onAlt(Number(e.target.value))} />
        <span>T+{alt}</span>
      </label>
      <label>
        <span>{t("wow_timeline_now")}</span>
        <input type="range" min={0} max={maxTick} value={now} onChange={(e) => onNow(Number(e.target.value))} />
        <span>T+{now}</span>
      </label>
    </div>
  );
}

/* ─── Soundscape mixer ─── */
function SoundscapeMixer({
  mix,
  onChange,
}: {
  mix: { siren: number; crowd: number; rain: number; heartbeat: number; radio: number };
  onChange: (k: keyof typeof mix, v: number) => void;
}) {
  const { t } = useI18n();
  const channels = [
    { key: "siren" as const, label: t("wow_sound_siren") },
    { key: "crowd" as const, label: t("wow_sound_crowd") },
    { key: "rain" as const, label: t("wow_sound_rain") },
    { key: "heartbeat" as const, label: t("wow_sound_heartbeat") },
    { key: "radio" as const, label: t("wow_sound_radio") },
  ];

  return (
    <div className="wow-soundscape">
      <div className="wow-hud-label">{t("wow_soundscape")}</div>
      {channels.map((ch) => (
        <label key={ch.key} className="wow-sound-channel">
          <span>{ch.label}</span>
          <input type="range" min={0} max={1} step={0.05} value={mix[ch.key]} onChange={(e) => onChange(ch.key, Number(e.target.value))} />
        </label>
      ))}
    </div>
  );
}

/* ─── EBS Emergency Broadcast takeover ─── */
function EBSTakeoverOverlay({ active, message }: { active: boolean; message: string }) {
  if (!active) return null;
  return (
    <div className="wow-ebs-overlay" role="alert" aria-live="assertive">
      <div className="wow-ebs-bars" aria-hidden />
      <div className="wow-ebs-content">
        <div className="wow-ebs-badge">EMERGENCY ALERT SYSTEM</div>
        <div className="wow-ebs-message">{message}</div>
        <div className="wow-ebs-scan" aria-hidden />
      </div>
    </div>
  );
}

/* ─── Crisis Wrapped end-of-session card ─── */
function CrisisWrappedModal({
  data,
  onClose,
  onShare,
}: {
  data: { grade: string; headline: string; stats: Array<{ label: string; value: string; emoji: string }>; cityId: string; disaster: string };
  onClose: () => void;
  onShare: () => void;
}) {
  const { t } = useI18n();
  return (
    <div className="wow-wrapped-overlay" onClick={onClose}>
      <div className="wow-wrapped-card" onClick={(e) => e.stopPropagation()}>
        <div className="wow-wrapped-grade">{data.grade}</div>
        <h2>{data.headline}</h2>
        <p className="wow-wrapped-sub">{data.cityId.toUpperCase()} · {data.disaster}</p>
        <div className="wow-wrapped-stats">
          {data.stats.map((s) => (
            <div key={s.label} className="wow-wrapped-stat">
              <span>{s.emoji}</span>
              <strong>{s.value}</strong>
              <small>{s.label}</small>
            </div>
          ))}
        </div>
        <div className="wow-wrapped-actions">
          <button type="button" className="btn-primary" onClick={onShare}>{t("wow_wrapped_share")}</button>
          <button type="button" className="btn-ghost" onClick={onClose}>{t("wow_wrapped_close")}</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Before / After recovery slider ─── */
function BeforeAfterSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const { t } = useI18n();
  return (
    <div className="wow-before-after">
      <span className="wow-ba-label">{t("wow_ba_crisis")}</span>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={t("wow_before_after")}
      />
      <span className="wow-ba-label">{t("wow_ba_recovery")}</span>
    </div>
  );
}

/* ─── Map annotation toolbar (War Room) ─── */
function MapAnnotationToolbar({ compact }: { compact?: boolean }) {
  const { t } = useI18n();
  const wow = useVisualWow();

  if (!wow.toggles.mapAnnotation) return null;
  if (compact && !wow.annotationMode && wow.mapAnnotations.length === 0) return null;

  return (
    <div className="wow-annotation-toolbar wow-interactive">
      <button
        type="button"
        className={`wow-toolbar-btn${wow.annotationMode ? " active" : ""}`}
        onClick={() => wow.setAnnotationMode(!wow.annotationMode)}
      >
        ✏️ {t("wow_annotation_draw")}
      </button>
      {wow.annotationMode && (
        <>
          <select
            value={wow.annotationRole}
            onChange={(e) => wow.setAnnotationRole(e.target.value)}
            className="wow-annotation-role"
          >
            <option value="mayor">{t("warroom_mayor")}</option>
            <option value="fema">{t("warroom_fema")}</option>
            <option value="media">{t("warroom_media")}</option>
          </select>
          <button type="button" className="wow-toolbar-btn" onClick={() => wow.finishAnnotation()}>
            {t("wow_annotation_finish")}
          </button>
          <button type="button" className="wow-toolbar-btn" onClick={() => wow.cancelDraftAnnotation()}>
            {t("wow_annotation_cancel")}
          </button>
        </>
      )}
      {wow.mapAnnotations.length > 0 && (
        <button type="button" className="wow-toolbar-btn" onClick={() => wow.clearAnnotations()}>
          {t("wow_annotation_clear")} ({wow.mapAnnotations.length})
        </button>
      )}
    </div>
  );
}

/* ─── Compact HUD (command page) ─── */
function CompactMapHud({ state }: { state: SimulationState }) {
  return (
    <div className="wow-compact-hud wow-interactive">
      <span>N {state.nodes.length}</span>
      <span>U {(state.vehicles ?? []).length}</span>
      <span>M {state.disaster_magnitude?.toFixed(1) ?? "—"}</span>
      <span>R {state.disaster_radius}m</span>
    </div>
  );
}

/* ─── Holographic HUD panels ─── */
function HolographicHUD({ state, compact }: { state: SimulationState; compact?: boolean }) {
  if (compact) return <CompactMapHud state={state} />;
  return (
    <>
      <div className="wow-hud-panel wow-hud-tl">
        <div className="wow-hud-scanline" />
        <div className="wow-hud-label">SECTOR SCAN</div>
        <div className="wow-hud-stat">NODES {state.nodes.length}</div>
        <div className="wow-hud-stat">UNITS {(state.vehicles ?? []).length}</div>
      </div>
      <div className="wow-hud-panel wow-hud-br">
        <div className="wow-hud-scanline" />
        <div className="wow-hud-label">THREAT MATRIX</div>
        <div className="wow-hud-stat">MAG {state.disaster_magnitude?.toFixed(1) ?? "—"}</div>
        <div className="wow-hud-stat">RAD {state.disaster_radius}m</div>
      </div>
    </>
  );
}

/* ─── Main overlay container ─── */
type Props = {
  state: SimulationState;
  compact?: boolean;
};

export function VisualWowOverlay({ state, compact = false }: Props) {
  const wow = useVisualWow();
  const { toggles, derived, cityId, soundscape } = wow;
  useSoundscapeEngine(soundscape, toggles.soundscape);
  const tehranMini = toggles.tehranMiniature && cityId === "teh";
  const cityClass = cityId === "teh" ? " city-teh" : " city-dc";
  const showBeforeAfter = toggles.beforeAfterSlider && (Boolean(state.active_disaster) || state.recovery_mode);

  const nightClass = toggles.dayNight && derived.isNight ? " is-night" : "";
  const ghostClass = toggles.ghostCity && derived.showGhostCity ? " is-ghost-city" : "";
  const photoClass = toggles.photoMode && wow.photoModeLocked ? " is-photo-mode" : "";
  const tehranClass = tehranMini ? " is-tehran-miniature" : "";
  const moodClass = toggles.moodRing ? ` mood-${derived.moodTier}` : "";
  const vhsClass = wow.vhsActive && toggles.vhsRewind ? " is-vhs-rewind" : "";
  const glassClass = toggles.brokenGlass && derived.showBrokenGlass ? " is-broken-glass" : "";

  return (
    <div
      className={`wow-overlay-root${compact ? " is-compact" : ""}${nightClass}${ghostClass}${photoClass}${tehranClass}${moodClass}${vhsClass}${glassClass}${cityClass}`}
      style={
        toggles.dayNight
          ? ({
              "--day-phase": derived.dayPhase,
              "--night-opacity": derived.isNight ? 0.65 : 0,
            } as React.CSSProperties)
          : undefined
      }
    >
      {toggles.dayNight && <div className="wow-skybox" aria-hidden />}

      {toggles.particles && derived.particleType !== "none" && (
        <ParticleCanvas type={derived.particleType} />
      )}

      {toggles.holographicHud && <HolographicHUD state={state} compact={compact} />}

      {!compact && toggles.infraRings && <InfrastructureRings state={state} />}

      {!compact && toggles.neuralNet && <NeuralNetOverlay log={state.log} />}

      {!compact && toggles.crisisDna && (
        <CrisisDNABadge fingerprint={derived.crisisFingerprint} disaster={state.active_disaster} />
      )}

      {!compact && toggles.constellation && <ConstellationOverlay state={state} />}

      {!compact && toggles.soundscape && (
        <SoundscapeMixer
          mix={wow.soundscape}
          onChange={(k, v) => wow.setSoundscape({ [k]: v })}
        />
      )}

      {!compact && toggles.dualTimeline && (
        <DualTimelineScrubber
          maxTick={Math.max(state.tick, 1)}
          alt={wow.dualTimelineAlt}
          now={wow.dualTimelineNow}
          onAlt={wow.setDualTimelineAlt}
          onNow={wow.setDualTimelineNow}
        />
      )}

      {toggles.memorialWall && derived.showMemorial && (
        <MemorialWall names={wow.memorialNames} />
      )}

      {toggles.trophy && wow.showTrophy && (
        <Trophy3D onDismiss={wow.dismissTrophy} />
      )}

      {toggles.waxSeal && wow.waxSealFlash && (
        <WaxSealOverlay decision={wow.waxSealFlash.decision} />
      )}

      {toggles.crisisTarot && wow.tarotCard && (
        <TarotCard card={wow.tarotCard} onClose={wow.clearTarot} />
      )}

      {toggles.photoMode && wow.photoModeLocked && (
        <div className="wow-photo-watermark">NEXUS · CINEMATIC</div>
      )}

      {toggles.brokenGlass && derived.showBrokenGlass && (
        <div className="wow-glass-cracks" aria-hidden />
      )}

      {toggles.moodRing && derived.moodTier === "glitch" && (
        <div className="wow-chromatic-glitch" aria-hidden />
      )}

      {!compact && toggles.holographicHud && (
        <div className="wow-scan-beam" aria-hidden />
      )}

      {toggles.ebsTakeover && (
        <EBSTakeoverOverlay
          active={wow.ebsActive}
          message={state.active_disaster?.replace(/_/g, " ").toUpperCase() ?? "CIVIL EMERGENCY"}
        />
      )}

      {toggles.crisisWrapped && wow.showCrisisWrapped && wow.crisisWrapped && (
        <CrisisWrappedModal
          data={wow.crisisWrapped}
          onClose={wow.dismissCrisisWrapped}
          onShare={() => {
            const text = `NEXUS Crisis Wrapped — Grade ${wow.crisisWrapped!.grade}\n${wow.crisisWrapped!.headline}\n${wow.crisisWrapped!.stats.map((s) => `${s.emoji} ${s.label}: ${s.value}`).join("\n")}`;
            if (navigator.share) {
              void navigator.share({ title: "NEXUS Crisis Wrapped", text });
            } else {
              void navigator.clipboard.writeText(text);
            }
          }}
        />
      )}

      {(showBeforeAfter || (toggles.mapAnnotation && (wow.annotationMode || wow.mapAnnotations.length > 0))) && (
        <div className="wow-map-dock wow-interactive">
          {showBeforeAfter && (
            <BeforeAfterSlider value={wow.beforeAfterPos} onChange={wow.setBeforeAfterPos} />
          )}
          <MapAnnotationToolbar compact={compact} />
        </div>
      )}
    </div>
  );
}

/* ─── Compact toolbar for map corner ─── */
export function VisualWowToolbar({ onOpenPanel, compact }: { onOpenPanel: () => void; compact?: boolean }) {
  const { t } = useI18n();
  const wow = useVisualWow();

  return (
    <div className="wow-toolbar wow-interactive">
      <button type="button" className="wow-toolbar-btn" onClick={onOpenPanel} title={t("wow_open_panel")}>
        <Icon3D name="vr" size={14} animated />
        {!compact && <span>{t("wow_visual")}</span>}
      </button>
      {wow.toggles.mapAnnotation && compact && !wow.annotationMode && (
        <button
          type="button"
          className="wow-toolbar-btn"
          onClick={() => wow.setAnnotationMode(true)}
          title={t("wow_annotation_draw")}
        >
          ✏️
        </button>
      )}
      <button
        type="button"
        className={`wow-toolbar-btn${wow.photoModeLocked ? " active" : ""}`}
        onClick={() => wow.toggleFeature("photoMode")}
        title={t("wow_photo_mode")}
      >
        📷
      </button>
      {wow.toggles.crisisTarot && (
        <button
          type="button"
          className="wow-toolbar-btn"
          onClick={() => wow.drawTarot()}
          title={t("wow_tarot")}
        >
          🃏
        </button>
      )}
      <button
        type="button"
        className={`wow-toolbar-btn${wow.toggles.xrayUnderground ? " active" : ""}`}
        onClick={() => wow.toggleFeature("xrayUnderground")}
        title={t("wow_xray")}
      >
        ◉
      </button>
    </div>
  );
}
