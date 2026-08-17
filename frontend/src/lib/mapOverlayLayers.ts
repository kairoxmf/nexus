import { PathLayer, ScatterplotLayer, PolygonLayer } from "@deck.gl/layers";
import { METRO_LINES, METRO_STATIONS } from "./dcMetro";
import { DC_ROADS, roadStyle } from "./dcRoads";
import { DC_LANDMARKS, TEHRAN_LANDMARKS } from "./cityPresets";
import type { SimulationState } from "../types";

function hexToRgba(hex: string, alpha = 220): [number, number, number, number] {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255, alpha];
}

function latLngPath(points: [number, number][]): [number, number][] {
  return points.map(([lat, lng]) => [lng, lat]);
}

export function buildMetroLayers(state: SimulationState, crisisMode: boolean) {
  const powerOutage = (state.metrics?.power_grid ?? 100) < 40;
  const opacity = powerOutage ? 90 : crisisMode ? 160 : 230;

  const lineLayers = METRO_LINES.map(
    (line) =>
      new PathLayer({
        id: `metro-line-${line.id}`,
        data: [{ path: latLngPath(line.points) }],
        getPath: (d) => d.path,
        getColor: hexToRgba(line.color, opacity),
        getWidth: crisisMode ? 4 : 6,
        widthUnits: "meters",
        widthMinPixels: 2,
        pickable: false,
      }),
  );

  const stationLayer = new ScatterplotLayer({
    id: "metro-stations",
    data: METRO_STATIONS,
    getPosition: (d) => [d.lng, d.lat],
    getRadius: 22,
    radiusUnits: "meters",
    getFillColor: powerOutage ? [80, 80, 80, 180] : [255, 255, 255, 200],
    getLineColor: [76, 201, 240, 220],
    lineWidthUnits: "pixels",
    getLineWidth: 2,
    stroked: true,
    pickable: false,
  });

  return [...lineLayers, stationLayer];
}

export function buildRoadLayers(crisisMode: boolean) {
  return [
    new PathLayer({
      id: "dc-roads",
      data: DC_ROADS.map((r) => ({
        path: latLngPath(r.points),
        kind: r.kind,
      })),
      getPath: (d) => d.path,
      getColor: (d) => {
        const s = roadStyle(d.kind);
        const base = hexToRgba(s.color, crisisMode ? Math.round(s.opacity * 160) : Math.round(s.opacity * 255));
        return base;
      },
      getWidth: (d) => (d.kind === "highway" ? 8 : d.kind === "avenue" ? 5 : 3),
      widthUnits: "meters",
      widthMinPixels: 1,
      pickable: false,
    }),
  ];
}

export function buildLandmarkLayers(cityId: string, crisisMode: boolean) {
  const landmarks = cityId === "teh" ? TEHRAN_LANDMARKS : DC_LANDMARKS;
  return [
    new ScatterplotLayer({
      id: "landmarks",
      data: landmarks,
      getPosition: (d) => [d.lng, d.lat],
      getRadius: 45,
      radiusUnits: "meters",
      getFillColor: crisisMode ? [244, 161, 0, 200] : [76, 201, 240, 210],
      getLineColor: [255, 255, 255, 240],
      lineWidthUnits: "pixels",
      getLineWidth: 2,
      stroked: true,
      pickable: true,
    }),
  ];
}

export function buildSatelliteScanLayer(state: SimulationState) {
  const scan = state.satellite_scan;
  if (!scan?.active) return null;

  const center = state.epicenter ?? { latitude: 38.9072, longitude: -77.0369 };
  const angle = ((scan.sweep_angle_deg ?? 0) * Math.PI) / 180;
  const radiusM = 900;
  const latRad = (center.latitude * Math.PI) / 180;
  const mPerDegLat = 111_000;
  const mPerDegLng = 111_000 * Math.cos(latRad);

  const wedge: [number, number][] = [[center.longitude, center.latitude]];
  for (let i = 0; i <= 24; i++) {
    const a = angle - 0.35 + (i / 24) * 0.7;
    wedge.push([
      center.longitude + (Math.cos(a) * radiusM) / mPerDegLng,
      center.latitude + (Math.sin(a) * radiusM) / mPerDegLat,
    ]);
  }
  wedge.push([center.longitude, center.latitude]);

  return new PolygonLayer({
    id: "satellite-scan",
    data: [{ polygon: wedge }],
    getPolygon: (d) => d.polygon,
    getFillColor: [76, 201, 240, 35],
    getLineColor: [76, 201, 240, 180],
    getLineWidth: 2,
    lineWidthUnits: "pixels",
    stroked: true,
    filled: true,
    pickable: false,
  });
}
