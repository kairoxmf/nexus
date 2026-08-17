/** Distinct mini-icons for each grid building type — not the impact matrix table. */

export type GridBuildingSymbol =
  | "W"
  | "E"
  | "="
  | "h"
  | "$"
  | "S"
  | "F"
  | "M"
  | "I"
  | "L"
  | "D"
  | "R"
  | "P"
  | "T"
  | "G"
  | "C"
  | ".";

interface Props {
  symbol: GridBuildingSymbol | string;
  size?: number;
  color?: string;
  className?: string;
}

function SvgRoot({
  size,
  color,
  className,
  children,
}: {
  size: number;
  color: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      aria-hidden
      fill="none"
      stroke={color}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

function iconPaths(symbol: string, fill: string): React.ReactNode {
  switch (symbol) {
    case "W":
      return (
        <>
          <rect x="5" y="10" width="14" height="9" rx="1.5" fill={fill} fillOpacity={0.25} stroke={fill} />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
          <path d="M12 14v3" />
          <path d="M10 16h4" />
          <path d="M9 6c0-1.5 1.5-3 3-3s3 1.5 3 3" />
        </>
      );
    case "E":
      return (
        <>
          <rect x="6" y="8" width="12" height="11" rx="1" fill={fill} fillOpacity={0.2} stroke={fill} />
          <path d="M9 8V5h6v3" />
          <path d="M12 5V3" />
          <path d="M10 13h4M10 16h4" />
          <path d="M18 4l2-1v4l-2-1" fill={fill} fillOpacity={0.4} stroke={fill} />
        </>
      );
    case "=":
      return (
        <>
          <path d="M4 12L12 5l8 7v7H4z" fill={fill} fillOpacity={0.3} stroke={fill} />
          <rect x="10" y="14" width="4" height="5" fill={fill} fillOpacity={0.5} stroke={fill} />
        </>
      );
    case "h":
      return (
        <>
          <path d="M5 18V11l4-4 4 4v7" fill={fill} fillOpacity={0.25} stroke={fill} />
          <path d="M5 18h14" />
          <rect x="10" y="14" width="3" height="4" fill={fill} fillOpacity={0.4} stroke={fill} />
        </>
      );
    case "$":
      return (
        <>
          <path d="M6 18V8l6-4 6 4v10" fill={fill} fillOpacity={0.2} stroke={fill} />
          <path d="M3 18h18" />
          <path d="M9 8h6M9 12h6M9 16h6" />
          <path d="M12 4v2" />
        </>
      );
    case "S":
      return (
        <>
          <rect x="4" y="6" width="16" height="14" rx="2" fill={fill} fillOpacity={0.2} stroke={fill} />
          <path d="M12 9v6M9 12h6" strokeWidth={2.2} />
        </>
      );
    case "F":
      return (
        <>
          <path d="M4 18h16" />
          <path d="M6 18V10l6-5 6 5v8" fill={fill} fillOpacity={0.2} stroke={fill} />
          <path d="M9 13c1.5-2 4.5-2 6 0M9 16c1.5-2 4.5-2 6 0" />
        </>
      );
    case "M":
      return (
        <>
          <path d="M4 18V10l8-4 8 4v8" fill={fill} fillOpacity={0.15} stroke={fill} />
          <path d="M4 10h16" />
          <path d="M8 14h8M8 17h5" />
        </>
      );
    case "I":
      return (
        <>
          <rect x="5" y="10" width="14" height="8" rx="1" fill={fill} fillOpacity={0.25} stroke={fill} />
          <path d="M8 10V6h8v4" />
          <path d="M10 6V4h4v2" />
          <path d="M12 4V2" />
          <path d="M12 13v2" strokeWidth={2} />
        </>
      );
    case "L":
      return (
        <>
          <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" fill={fill} fillOpacity={0.25} stroke={fill} />
          <path d="M9 11h6M12 8v6" strokeWidth={2} />
        </>
      );
    case "D":
      return (
        <>
          <rect x="5" y="7" width="14" height="11" rx="1.5" fill={fill} fillOpacity={0.2} stroke={fill} />
          <path d="M9 7V5h6v2" />
          <path d="M8 12h8M8 15h5" />
          <path d="M12 3v2" />
        </>
      );
    case "R":
      return (
        <>
          <rect x="3" y="9" width="18" height="6" rx="1" fill={fill} fillOpacity={0.35} stroke={fill} />
          <path d="M3 12h18" strokeDasharray="3 2" />
          <path d="M7 9v6M12 9v6M17 9v6" strokeOpacity={0.5} />
        </>
      );
    case "P":
      return (
        <>
          <ellipse cx="12" cy="18" rx="5" ry="1.5" fill={fill} fillOpacity={0.2} stroke={fill} />
          <path d="M12 17V10" />
          <circle cx="12" cy="8" r="4" fill={fill} fillOpacity={0.35} stroke={fill} />
        </>
      );
    case "T":
      return (
        <>
          <rect x="5" y="9" width="14" height="9" rx="1" fill={fill} fillOpacity={0.2} stroke={fill} />
          <path d="M8 9V6h8v3" />
          <path d="M12 13c1.5 0 2.5 1 2.5 2.5S13.5 18 12 18s-2.5-1-2.5-2.5S10.5 13 12 13z" fill={fill} fillOpacity={0.5} stroke={fill} />
        </>
      );
    case "G":
      return (
        <>
          <rect x="4" y="10" width="16" height="8" rx="1" fill={fill} fillOpacity={0.3} stroke={fill} />
          <path d="M7 10V8M12 10V8M17 10V8" />
          <path d="M7 14h10M7 16h10" strokeOpacity={0.6} />
          <circle cx="18" cy="5" r="2.5" fill={fill} fillOpacity={0.5} stroke={fill} />
          <path d="M18 2v1M18 7v1M20.5 5h1M14.5 5h1" strokeWidth={1.2} />
        </>
      );
    case "C":
      return (
        <>
          <rect x="4" y="5" width="16" height="14" rx="2" fill={fill} fillOpacity={0.3} stroke={fill} />
          <path d="M12 8l2 3h-4l2-3z" fill={fill} stroke={fill} />
          <path d="M8 14h8M9 17h6" />
        </>
      );
    default:
      return null;
  }
}

export function GridBuildingIcon({ symbol, size = 16, color = "#e8f4ff", className }: Props) {
  if (symbol === ".") return null;
  return (
    <SvgRoot size={size} color={color} className={className}>
      {iconPaths(symbol, color)}
    </SvgRoot>
  );
}

export function GridBuildingCellContent({
  symbol,
  large,
}: {
  symbol: string;
  large?: boolean;
}) {
  if (symbol === ".") return null;
  const iconSize = large ? 14 : 10;
  return (
    <span className="grid-cell-building" style={{ color: "#04141c" }}>
      <GridBuildingIcon symbol={symbol} size={iconSize} color="#04141c" />
    </span>
  );
}
