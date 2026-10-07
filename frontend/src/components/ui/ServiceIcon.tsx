import type { ComponentType } from "react";
import {
  Award,
  BadgeCheck,
  Briefcase,
  Building2,
  ClipboardList,
  Clock,
  Factory,
  FileSignature,
  GraduationCap,
  HeartHandshake,
  Home,
  Hotel,
  Landmark,
  Medal,
  PencilRuler,
  ShoppingBag,
  ShieldCheck,
  Stethoscope,
  Users,
  Wrench,
} from "lucide-react";

const MAP: Record<string, ComponentType<{ className?: string; strokeWidth?: number }>> = {
  building: Building2,
  home: Home,
  factory: Factory,
  wrench: Wrench,
  clipboard: ClipboardList,
  contract: FileSignature,
  design: PencilRuler,
  landmark: Landmark,
  award: Award,
  briefcase: Briefcase,
  users: Users,
  shield: ShieldCheck,
  check: BadgeCheck,
  clock: Clock,
  badge: Medal,
  heart: HeartHandshake,
  health: Stethoscope,
  hotel: Hotel,
  retail: ShoppingBag,
  school: GraduationCap,
};

interface ServiceIconProps {
  name: string;
  className?: string;
  strokeWidth?: number;
}

/** Minimal line icon resolved from a data-layer key. */
export default function ServiceIcon({ name, className = "", strokeWidth = 1.6 }: ServiceIconProps) {
  const Icon = MAP[name] ?? Building2;
  return <Icon className={className} strokeWidth={strokeWidth} aria-hidden="true" />;
}
