/** Washington D.C. center — National Mall */
export const DC_CENTER = { lat: 38.9072, lng: -77.0369 };

/** Approximate D.C. city limits — used to filter OSM building footprints */
export const DC_BBOX = {
  south: 38.791,
  west: -77.119,
  north: 38.995,
  east: -76.909,
} as const;

export function isInDcBounds(lat: number, lng: number): boolean {
  return (
    lat >= DC_BBOX.south &&
    lat <= DC_BBOX.north &&
    lng >= DC_BBOX.west &&
    lng <= DC_BBOX.east
  );
}

/** Convert WGS84 to Three.js scene coordinates (meters, Y-up). */
export function geoToScene(lat: number, lng: number): [number, number, number] {
  const x = (lng - DC_CENTER.lng) * 85000 * Math.cos((DC_CENTER.lat * Math.PI) / 180);
  const z = -(lat - DC_CENTER.lat) * 111000;
  return [x, 0, z];
}

export function sceneToGeo(x: number, z: number): { lat: number; lng: number } {
  const lat = DC_CENTER.lat - z / 111000;
  const lng = DC_CENTER.lng + x / (85000 * Math.cos((DC_CENTER.lat * Math.PI) / 180));
  return { lat, lng };
}

export function healthColor(h: number): string {
  if (h >= 70) return "#33C17A";
  if (h >= 40) return "#F4A100";
  return "#FF4655";
}

export const TYPE_COLORS: Record<string, string> = {
  power: "#F4A100",
  water: "#4CC9F0",
  hospital: "#FF4655",
  fire: "#FF7A45",
  police: "#6C7CE0",
  comm: "#33C17A",
  shelter: "#B885F0",
  warehouse: "#C9A24C",
  bridge: "#9AA5B1",
  airport: "#4CC9F0",
  residential: "#7FA8C9",
  port: "#4C9FF0",
};
