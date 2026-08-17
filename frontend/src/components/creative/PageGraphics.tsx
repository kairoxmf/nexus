import { useEffect, useRef, useState, type ReactNode } from "react";

/* ─── Floating ambient orbs ─── */
export function FloatingOrbs({ count = 5 }: { count?: number }) {
  const colors = ["#4cc9f0", "#f4a100", "#a78bfa", "#33c17a", "#ff6b9d"];
  return (
    <div className="pg-orbs" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="pg-orb"
          style={{
            ["--orb-color" as string]: colors[i % colors.length],
            ["--orb-x" as string]: `${15 + (i * 17) % 70}%`,
            ["--orb-y" as string]: `${10 + (i * 23) % 60}%`,
            ["--orb-delay" as string]: `${i * 1.4}s`,
            ["--orb-size" as string]: `${80 + (i % 3) * 40}px`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Animated section divider ─── */
export function SectionDivider({ label }: { label?: string }) {
  return (
    <div className="pg-divider" aria-hidden>
      <span className="pg-divider-line" />
      <span className="pg-divider-gem" />
      {label && <span className="pg-divider-label">{label}</span>}
      <span className="pg-divider-gem" />
      <span className="pg-divider-line" />
    </div>
  );
}

/* ─── Feature icons for home cards ─── */
export function FeatureGraphic({ variant }: { variant: "city" | "ai" | "crisis" }) {
  if (variant === "city") {
    return (
      <svg className="pg-feature-icon" viewBox="0 0 64 64" aria-hidden>
        <defs>
          <linearGradient id="pg-city-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4cc9f0" />
            <stop offset="100%" stopColor="#4cc9f044" />
          </linearGradient>
        </defs>
        <rect x="8" y="28" width="12" height="28" rx="1" fill="url(#pg-city-grad)" opacity="0.9" />
        <rect x="24" y="16" width="16" height="40" rx="1" fill="url(#pg-city-grad)" />
        <rect x="44" y="22" width="12" height="34" rx="1" fill="url(#pg-city-grad)" opacity="0.7" />
        <rect x="26" y="20" width="4" height="4" fill="#030508" opacity="0.5" />
        <rect x="32" y="20" width="4" height="4" fill="#030508" opacity="0.5" />
        <rect x="26" y="28" width="4" height="4" fill="#030508" opacity="0.5" />
        <rect x="32" y="28" width="4" height="4" fill="#030508" opacity="0.5" />
        <circle cx="32" cy="10" r="3" fill="#4cc9f0" className="pg-pulse-dot" />
        <line x1="32" y1="13" x2="32" y2="16" stroke="#4cc9f0" strokeWidth="1" opacity="0.6" />
      </svg>
    );
  }
  if (variant === "ai") {
    return (
      <svg className="pg-feature-icon" viewBox="0 0 64 64" aria-hidden>
        <circle cx="32" cy="32" r="20" fill="none" stroke="#f4a100" strokeWidth="1" opacity="0.3" className="pg-spin-slow" />
        <circle cx="32" cy="32" r="14" fill="none" stroke="#f4a100" strokeWidth="1.5" opacity="0.5" />
        <circle cx="32" cy="32" r="6" fill="#f4a100" opacity="0.8" className="pg-pulse-dot" />
        {[0, 60, 120, 180, 240, 300].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const x2 = 32 + Math.cos(rad) * 20;
          const y2 = 32 + Math.sin(rad) * 20;
          return <line key={deg} x1="32" y1="32" x2={x2} y2={y2} stroke="#f4a100" strokeWidth="1" opacity="0.4" />;
        })}
        {[0, 72, 144, 216, 288].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const x = 32 + Math.cos(rad) * 20;
          const y = 32 + Math.sin(rad) * 20;
          return <circle key={deg} cx={x} cy={y} r="2.5" fill="#f4a100" opacity="0.7" />;
        })}
      </svg>
    );
  }
  return (
    <svg className="pg-feature-icon" viewBox="0 0 64 64" aria-hidden>
      <polygon points="32,8 56,52 8,52" fill="none" stroke="#ff4655" strokeWidth="1.5" opacity="0.5" />
      <polygon points="32,16 48,48 16,48" fill="#ff465522" stroke="#ff4655" strokeWidth="1" />
      <line x1="32" y1="24" x2="32" y2="38" stroke="#ff4655" strokeWidth="2" strokeLinecap="round" />
      <circle cx="32" cy="42" r="2" fill="#ff4655" className="pg-pulse-dot" />
      <path d="M20,52 Q32,58 44,52" fill="none" stroke="#ff4655" strokeWidth="1" opacity="0.4" className="pg-wave-line" />
    </svg>
  );
}

/* ─── Home pipeline visualization ─── */
export function PipelineViz({ labels }: { labels: [string, string, string] }) {
  const steps = [
    { color: "#4cc9f0", icon: "M12,20 L20,12 L28,20 L24,20 L24,32 L16,32 L16,20 Z" },
    { color: "#f4a100", icon: "M16,16 L32,8 L48,16 L48,40 L32,48 L16,40 Z" },
    { color: "#33c17a", icon: "M32,8 L52,20 L52,44 L32,56 L12,44 L12,20 Z" },
  ];
  return (
    <div className="pg-pipeline" aria-hidden>
      {steps.map((s, i) => (
        <div key={i} className="pg-pipeline-step">
          <div className="pg-pipeline-node" style={{ ["--node-color" as string]: s.color }}>
            <svg viewBox="0 0 64 64" width="36" height="36">
              <path d={s.icon} fill={s.color} opacity="0.85" />
            </svg>
            <span className="pg-pipeline-ring" />
          </div>
          <span className="pg-pipeline-label">{labels[i]}</span>
          {i < 2 && <span className="pg-pipeline-connector" />}
        </div>
      ))}
    </div>
  );
}

/* ─── Neural mesh background for Intel ─── */
export function NeuralMesh() {
  const nodes = [
    [10, 20], [30, 10], [55, 18], [75, 12], [90, 30],
    [15, 50], [35, 42], [60, 48], [82, 55], [50, 70], [25, 75], [70, 78],
  ];
  const edges: [number, number][] = [
    [0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [1, 6], [2, 6], [2, 7], [3, 7], [4, 7],
    [5, 6], [6, 7], [7, 8], [5, 9], [6, 9], [7, 9], [7, 10], [9, 10], [7, 11], [8, 11],
  ];
  return (
    <svg className="pg-neural-mesh" viewBox="0 0 100 85" preserveAspectRatio="xMidYMid slice" aria-hidden>
      {edges.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a][0]}
          y1={nodes[a][1]}
          x2={nodes[b][0]}
          y2={nodes[b][1]}
          stroke="#4cc9f0"
          strokeWidth="0.3"
          opacity="0.25"
          className="pg-neural-edge"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
      {nodes.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.8" fill="#4cc9f0" opacity="0.6" className="pg-neural-node" style={{ animationDelay: `${i * 0.2}s` }} />
      ))}
    </svg>
  );
}

/* ─── Brain core for Intel assistant ─── */
export function BrainCore({ active }: { active?: boolean }) {
  return (
    <div className={`pg-brain-core${active ? " is-active" : ""}`} aria-hidden>
      <svg viewBox="0 0 120 120" width="120" height="120">
        <defs>
          <radialGradient id="pg-brain-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#4cc9f0" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#4cc9f0" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="60" cy="60" r="50" fill="url(#pg-brain-glow)" className="pg-brain-glow-ring" />
        <ellipse cx="60" cy="58" rx="28" ry="32" fill="none" stroke="#4cc9f0" strokeWidth="1.5" opacity="0.6" />
        <path
          d="M38,50 Q32,58 38,68 Q42,72 48,68 Q52,62 48,54 Q44,48 38,50 M72,50 Q78,58 72,68 Q68,72 62,68 Q58,62 62,54 Q66,48 72,50"
          fill="none"
          stroke="#4cc9f0"
          strokeWidth="1.5"
          opacity="0.8"
        />
        <line x1="60" y1="26" x2="60" y2="38" stroke="#4cc9f0" strokeWidth="1" opacity="0.5" />
        <circle cx="60" cy="22" r="3" fill="#4cc9f0" className="pg-pulse-dot" />
        {[0, 1, 2, 3].map((i) => (
          <circle
            key={i}
            cx="60"
            cy="60"
            r={18 + i * 10}
            fill="none"
            stroke="#4cc9f0"
            strokeWidth="0.5"
            opacity={0.3 - i * 0.06}
            className="pg-brain-ring"
            style={{ animationDelay: `${i * 0.5}s` }}
          />
        ))}
      </svg>
    </div>
  );
}

/* ─── Agent pulse chips ─── */
export function AgentPulseGrid({ agents, connected }: { agents: string[]; connected: boolean }) {
  const colors = ["#4cc9f0", "#f4a100", "#33c17a", "#a78bfa", "#ff6b9d", "#fbbf24"];
  return (
    <div className="pg-agent-grid">
      {(agents.length > 0 ? agents.slice(0, 8) : ["—", "—", "—"]).map((agent, i) => (
        <div
          key={`${agent}-${i}`}
          className={`pg-agent-chip${connected ? " is-live" : ""}`}
          style={{ ["--chip-color" as string]: colors[i % colors.length], animationDelay: `${i * 0.08}s` }}
        >
          <span className="pg-agent-dot" />
          <span className="pg-agent-name">{agent}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Signal radar for Contact ─── */
export function SignalRadar() {
  return (
    <div className="pg-radar" aria-hidden>
      <svg viewBox="0 0 200 200" width="200" height="200">
        {[90, 70, 50, 30].map((r) => (
          <circle key={r} cx="100" cy="100" r={r} fill="none" stroke="#4cc9f0" strokeWidth="0.5" opacity={0.15 + (90 - r) * 0.005} />
        ))}
        <line x1="100" y1="10" x2="100" y2="190" stroke="#4cc9f0" strokeWidth="0.3" opacity="0.2" />
        <line x1="10" y1="100" x2="190" y2="100" stroke="#4cc9f0" strokeWidth="0.3" opacity="0.2" />
        <line x1="30" y1="30" x2="170" y2="170" stroke="#4cc9f0" strokeWidth="0.3" opacity="0.15" />
        <line x1="170" y1="30" x2="30" y2="170" stroke="#4cc9f0" strokeWidth="0.3" opacity="0.15" />
        <path d="M100,100 L100,10 A90,90 0 0,1 170,45 Z" fill="#4cc9f0" opacity="0.12" className="pg-radar-sweep" />
        <circle cx="100" cy="100" r="4" fill="#4cc9f0" className="pg-pulse-dot" />
        <circle cx="130" cy="60" r="3" fill="#f4a100" opacity="0.8" className="pg-radar-blip" style={{ animationDelay: "0.5s" }} />
        <circle cx="70" cy="130" r="2.5" fill="#33c17a" opacity="0.8" className="pg-radar-blip" style={{ animationDelay: "1.2s" }} />
        <circle cx="145" cy="110" r="2" fill="#4cc9f0" opacity="0.8" className="pg-radar-blip" style={{ animationDelay: "2s" }} />
      </svg>
    </div>
  );
}

/* ─── Transmission success animation ─── */
export function TransmitSuccess() {
  return (
    <div className="pg-transmit-success" aria-hidden>
      <svg viewBox="0 0 80 80" width="80" height="80">
        <circle cx="40" cy="40" r="36" fill="none" stroke="#33c17a" strokeWidth="2" opacity="0.3" className="pg-success-ring" />
        <circle cx="40" cy="40" r="28" fill="#33c17a22" stroke="#33c17a" strokeWidth="1.5" />
        <path d="M26,40 L36,50 L56,28" fill="none" stroke="#33c17a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="pg-success-check" />
      </svg>
      {[0, 1, 2].map((i) => (
        <span key={i} className="pg-success-pulse" style={{ animationDelay: `${i * 0.4}s` }} />
      ))}
    </div>
  );
}

/* ─── Profile constellation ─── */
export function ProfileConstellation() {
  const stars = [
    [12, 18, 1.5], [28, 8, 1], [45, 22, 2], [62, 12, 1.2], [78, 28, 1.8],
    [8, 45, 1], [22, 55, 1.5], [55, 48, 1], [70, 60, 2], [88, 42, 1.2],
    [35, 70, 1.8], [60, 75, 1], [82, 68, 1.5],
  ];
  return (
    <svg className="pg-constellation" viewBox="0 0 100 80" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <line x1="12" y1="18" x2="28" y2="8" stroke="#4cc9f0" strokeWidth="0.3" opacity="0.2" />
      <line x1="28" y1="8" x2="45" y2="22" stroke="#4cc9f0" strokeWidth="0.3" opacity="0.2" />
      <line x1="45" y1="22" x2="62" y2="12" stroke="#4cc9f0" strokeWidth="0.3" opacity="0.2" />
      <line x1="22" y1="55" x2="35" y2="70" stroke="#f4a100" strokeWidth="0.3" opacity="0.15" />
      <line x1="55" y1="48" x2="70" y2="60" stroke="#f4a100" strokeWidth="0.3" opacity="0.15" />
      {stars.map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="#fff" opacity="0.5" className="pg-star" style={{ animationDelay: `${i * 0.3}s` }} />
      ))}
    </svg>
  );
}

/* ─── Hex grid overlay ─── */
export function HexGridOverlay() {
  return <div className="pg-hex-grid" aria-hidden />;
}

/* ─── Stat ring (Apple Watch style) ─── */
export function StatRing({ value, color, label }: { value: number; color: string; label: string }) {
  const pct = Math.min(100, Math.max(0, value));
  const dash = (pct / 100) * 88;
  return (
    <div className="pg-stat-ring" style={{ ["--ring-color" as string]: color }}>
      <svg viewBox="0 0 40 40" width="48" height="48">
        <circle cx="20" cy="20" r="14" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
        <circle
          cx="20"
          cy="20"
          r="14"
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeDasharray={`${dash} 88`}
          strokeLinecap="round"
          transform="rotate(-90 20 20)"
        />
      </svg>
      <span className="pg-stat-ring-val">{Math.round(pct)}</span>
      <span className="pg-stat-ring-label">{label}</span>
    </div>
  );
}

/* ─── Canvas particle field (lightweight) ─── */
export function ParticleField({ color = "#4cc9f0" }: { color?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId = 0;
    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0004,
      vy: (Math.random() - 0.5) * 0.0004,
      size: Math.random() * 2 + 0.5,
    }));

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > 1) p.vx *= -1;
        if (p.y < 0 || p.y > 1) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x * canvas.width, p.y * canvas.height, p.size, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.35;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [color]);

  return <canvas ref={canvasRef} className="pg-particle-canvas" aria-hidden />;
}

/* ─── Contact channel cards ─── */
export function ContactChannel({ icon, title, value }: { icon: "mail" | "location" | "clock"; title: string; value: string }) {
  const paths = {
    mail: "M4,8 L20,8 L20,18 L4,18 Z M4,8 L12,13 L20,8",
    location: "M12,4 C8,4 5,7 5,11 C5,16 12,22 12,22 C12,22 19,16 19,11 C19,7 16,4 12,4 M12,13 C10.3,13 9,11.7 9,10 C9,8.3 10.3,7 12,7 C13.7,7 15,8.3 15,10 C15,11.7 13.7,13 12,13",
    clock: "M12,4 C7.6,4 4,7.6 4,12 C4,16.4 7.6,20 12,20 C16.4,20 20,16.4 20,12 C20,7.6 16.4,4 12,4 M12,7 L12,12 L16,14",
  };
  return (
    <div className="pg-contact-channel">
      <div className="pg-contact-channel-icon">
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path d={paths[icon]} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div>
        <p className="pg-contact-channel-title">{title}</p>
        <p className="pg-contact-channel-value">{value}</p>
      </div>
    </div>
  );
}

/* ─── Operator rank badge ─── */
export function OperatorRankBadge({ role, label }: { role?: string; label: string }) {
  const colors: Record<string, string> = {
    admin: "#f4a100",
    analyst: "#4cc9f0",
    citizen: "#33c17a",
  };
  const color = colors[role ?? ""] ?? "#4cc9f0";
  return (
    <div className="pg-rank-badge" style={{ ["--rank-color" as string]: color }}>
      <svg viewBox="0 0 48 48" width="40" height="40" aria-hidden>
        <polygon points="24,4 44,16 44,36 24,44 4,36 4,16" fill="none" stroke={color} strokeWidth="1.5" opacity="0.7" />
        <polygon points="24,10 38,18 38,34 24,40 10,34 10,18" fill={`${color}22`} stroke={color} strokeWidth="1" />
        <circle cx="24" cy="24" r="6" fill={color} opacity="0.8" className="pg-pulse-dot" />
      </svg>
      <span>{label}</span>
    </div>
  );
}

/* ─── Cyber glitch text ─── */
export function GlitchText({ children, className = "" }: { children: string; className?: string }) {
  return (
    <span className={`pg-glitch-text${className ? ` ${className}` : ""}`} data-text={children} aria-label={children}>
      {children}
    </span>
  );
}

/* ─── Aurora gradient background ─── */
export function AuroraBackground() {
  return (
    <div className="pg-aurora" aria-hidden>
      <div className="pg-aurora-layer pg-aurora-1" />
      <div className="pg-aurora-layer pg-aurora-2" />
      <div className="pg-aurora-layer pg-aurora-3" />
    </div>
  );
}

/* ─── Falling data stream canvas ─── */
export function DataStreamCanvas({ density = 28 }: { density?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId = 0;
    const chars = "01アイウエオNEXUS█▓░";
    const streams: Array<{ x: number; y: number; speed: number; len: number; hue: number }> = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < density; i++) {
      streams.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: 1 + Math.random() * 3,
        len: 8 + Math.floor(Math.random() * 16),
        hue: 180 + Math.random() * 60,
      });
    }

    const draw = () => {
      ctx.fillStyle = "rgba(3, 5, 8, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (const s of streams) {
        for (let j = 0; j < s.len; j++) {
          const y = s.y - j * 14;
          if (y < 0 || y > canvas.height) continue;
          const alpha = 1 - j / s.len;
          ctx.font = "11px monospace";
          ctx.fillStyle = `hsla(${s.hue}, 80%, 65%, ${alpha * 0.7})`;
          ctx.fillText(chars[Math.floor(Math.random() * chars.length)]!, s.x, y);
        }
        s.y += s.speed;
        if (s.y - s.len * 14 > canvas.height) {
          s.y = -s.len * 14;
          s.x = Math.random() * canvas.width;
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [density]);

  return <canvas ref={canvasRef} className="pg-data-stream" aria-hidden />;
}

/* ─── 3D holographic tilt wrapper ─── */
export function HolographicTilt({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.setProperty("--tilt-x", `${y * -12}deg`);
    el.style.setProperty("--tilt-y", `${x * 12}deg`);
    el.style.setProperty("--shine-x", `${(x + 0.5) * 100}%`);
    el.style.setProperty("--shine-y", `${(y + 0.5) * 100}%`);
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--tilt-x", "0deg");
    el.style.setProperty("--tilt-y", "0deg");
  };

  return (
    <div
      ref={ref}
      className={`pg-holo-tilt${className ? ` ${className}` : ""}`}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <div className="pg-holo-tilt-inner">{children}</div>
      <div className="pg-holo-tilt-shine" aria-hidden />
    </div>
  );
}

/* ─── Typewriter text reveal ─── */
export function TypewriterText({ text, speed = 40, className = "" }: { text: string; speed?: number; className?: string }) {
  const [display, setDisplay] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplay("");
    setDone(false);
    let i = 0;
    const id = window.setInterval(() => {
      i++;
      setDisplay(text.slice(0, i));
      if (i >= text.length) {
        window.clearInterval(id);
        setDone(true);
      }
    }, speed);
    return () => window.clearInterval(id);
  }, [text, speed]);

  return (
    <span className={`pg-typewriter${done ? " is-done" : ""}${className ? ` ${className}` : ""}`}>
      {display}
      {!done && <span className="pg-typewriter-cursor" />}
    </span>
  );
}

/* ─── Live status ticker ─── */
export function LivePulseTicker({ items }: { items: string[] }) {
  const doubled = [...items, ...items];
  return (
    <div className="pg-live-ticker" aria-hidden>
      <div className="pg-live-ticker-track">
        {doubled.map((item, i) => (
          <span key={i} className="pg-live-ticker-item">
            <span className="pg-live-ticker-dot" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Morphing blob accent ─── */
export function MorphBlob({ color = "#4cc9f0" }: { color?: string }) {
  return (
    <div className="pg-morph-blob" style={{ ["--blob-color" as string]: color }} aria-hidden>
      <svg viewBox="0 0 200 200" width="200" height="200">
        <path className="pg-blob-path" d="M100,20 C140,20 180,60 170,100 C160,140 120,180 80,170 C40,160 20,120 30,80 C40,40 60,20 100,20" fill={color} opacity="0.15" />
      </svg>
    </div>
  );
}

/* ─── Cyber scanline sweep ─── */
export function CyberScanline() {
  return (
    <div className="pg-cyber-scanline" aria-hidden>
      <div className="pg-scanline-bar" />
    </div>
  );
}

/* ─── Hex pulse ring (profile / contact) ─── */
export function HexPulseRing({ color = "#4cc9f0", size = 120 }: { color?: string; size?: number }) {
  return (
    <svg
      className="pg-hex-pulse"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      style={{ ["--hex-color" as string]: color }}
      aria-hidden
    >
      <polygon points="50,5 93,27.5 93,72.5 50,95 7,72.5 7,27.5" fill="none" stroke={color} strokeWidth="1" opacity="0.3" />
      <polygon points="50,15 83,32.5 83,67.5 50,85 17,67.5 17,32.5" fill="none" stroke={color} strokeWidth="0.5" opacity="0.15" className="pg-hex-pulse-inner" />
      <circle cx="50" cy="50" r="4" fill={color} className="pg-pulse-dot" />
    </svg>
  );
}

/* ─── Achievement unlock burst ─── */
export function AchievementBurst({ label, icon = "★" }: { label: string; icon?: string }) {
  return (
    <div className="pg-achievement-burst">
      <span className="pg-achievement-rays" aria-hidden />
      <span className="pg-achievement-icon">{icon}</span>
      <span className="pg-achievement-label">{label}</span>
    </div>
  );
}

/* ─── Interactive ripple button glow ─── */
export function RippleGlow({ active }: { active?: boolean }) {
  return (
    <div className={`pg-ripple-glow${active ? " is-active" : ""}`} aria-hidden>
      {[0, 1, 2].map((i) => (
        <span key={i} className="pg-ripple-ring" style={{ animationDelay: `${i * 0.6}s` }} />
      ))}
    </div>
  );
}
