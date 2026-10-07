import {
  Home,
  TrendingUp,
  Camera,
  Compass,
  Calculator,
  MapPin,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  home: Home,
  "trending-up": TrendingUp,
  camera: Camera,
  compass: Compass,
  calculator: Calculator,
  "map-pin": MapPin,
};

export function ServiceIcon({
  name,
  size = 28,
  className = "",
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const Icon = iconMap[name] ?? Home;
  return <Icon size={size} className={className} strokeWidth={1.5} />;
}
