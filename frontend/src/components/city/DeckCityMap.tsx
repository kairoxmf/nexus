import { useCallback, useEffect, useMemo, useState } from "react";
import DeckGL from "@deck.gl/react";
import { COORDINATE_SYSTEM } from "@deck.gl/core";
import type { MapViewState } from "@deck.gl/core";
import { GeoJsonLayer, PolygonLayer, ScatterplotLayer, TextLayer } from "@deck.gl/layers";
import { Map } from "react-map-gl/maplibre";
import type { PickingInfo } from "@deck.gl/core";
import type { Feature, FeatureCollection, Polygon } from "geojson";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { GridCitizen, GridPlacement, CityNode, SimulationState, Vehicle } from "../../types";
import { useGridCityOptional } from "../../context/GridCityContext";
import { useI18n } from "../../i18n";
import { DC_CENTER } from "../../lib/geo";
import { getCityPreset } from "../../lib/cityPresets";
import {
  buildLandmarkLayers,
  buildMetroLayers,
  buildRoadLayers,
  buildSatelliteScanLayer,
} from "../../lib/mapOverlayLayers";
import {
  BUILDING_I18N_KEYS,
  defaultBuildingColor,
  defaultBuildingHeight,
  featureCentroid,
  filterFeaturesInDcBounds,
  filterOsmAwayFromPlacements,
  INFRA_BLOCK_COLORS,
  infraNodesToGeoJSON,
  osmBuildingFillColor,
  placementsToGeoJSON,
  rgbaFill,
  shouldShowMapLabel,
  type MapBuildingFeatureProps,
} from "../../lib/gridMapVisuals";
import { useVisualWowOptional } from "../../context/VisualWowContext";
import { buildVisualWowLayers } from "../../lib/visualWowLayers";

const MAP_STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";
const BUILDINGS_URL = "/data/dc_buildings.geojson";

type BuildingProps = { height?: number; building?: string; name?: string | null };

type LabeledPlacement = GridPlacement & {
  labelText: string;
  labelAlt: number;
  color: [number, number, number, number];
  height: number;
};

type InfraBlockProps = { height: number; color: [number, number, number, number]; label: string };

function hexToRgba(hex: string, alpha = 220): [number, number, number, number] {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255, alpha];
}

function vehicleRadius(type: Vehicle["type"]): number {
  if (type === "helicopter") return 28;
  if (type === "fire_truck") return 22;
  return 18;
}

function vehicleColor(type: Vehicle["type"]): [number, number, number, number] {
  const map: Record<Vehicle["type"], string> = {
    ambulance: "#FF4655",
    fire_truck: "#FF7A45",
    helicopter: "#4CC9F0",
    police: "#6C7CE0",
  };
  return hexToRgba(map[type], 240);
}

function citizenColor(wealth: GridCitizen["wealth"]): [number, number, number, number] {
  const map: Record<GridCitizen["wealth"], string> = {
    poor: "#9CA3AF",
    standard: "#7FA8C9",
    rich: "#FFD166",
  };
  return hexToRgba(map[wealth], 235);
}

function disasterRing(center: { latitude: number; longitude: number }, radiusM: number, segments = 48): Polygon {
  const coords: [number, number][] = [];
  const latRad = (center.latitude * Math.PI) / 180;
  const mPerDegLat = 111_000;
  const mPerDegLng = 111_000 * Math.cos(latRad);
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    coords.push([
      center.longitude + (Math.cos(a) * radiusM) / mPerDegLng,
      center.latitude + (Math.sin(a) * radiusM) / mPerDegLat,
    ]);
  }
  return { type: "Polygon", coordinates: [coords] };
}

function parkCircle(lat: number, lng: number, radiusM: number, segments = 24): Polygon {
  return disasterRing({ latitude: lat, longitude: lng }, radiusM, segments);
}

function solidBlockLayer<T extends { height: number; color: [number, number, number, number] }>(
  id: string,
  data: FeatureCollection,
  elevationScale = 1,
) {
  return new GeoJsonLayer<T>({
    id,
    data,
    extruded: true,
    wireframe: false,
    filled: true,
    stroked: true,
    pickable: true,
    opacity: 1,
    elevationScale,
    getElevation: (f) => f.properties?.height ?? 24,
    getFillColor: (f) => {
      const c = f.properties?.color;
      if (!c) return [180, 180, 180, 255];
      return rgbaFill(c);
    },
    getLineColor: (f) => {
      const c = f.properties?.color ?? [120, 120, 120, 255];
      return [Math.round(c[0] * 0.5), Math.round(c[1] * 0.5), Math.round(c[2] * 0.5), 255];
    },
    getLineWidth: 2,
    lineWidthUnits: "pixels",
    material: {
      ambient: 0.32,
      diffuse: 0.88,
      shininess: 24,
      specularColor: [255, 255, 255],
    },
  });
}

interface Props {
  state: SimulationState;
  armed: boolean;
  onMapClick: (lat: number, lng: number) => void;
  cityId?: string;
  onNodeClick?: (node: CityNode) => void;
  onSosClick?: (sosId: string) => void;
  showMapLayers?: boolean;
  mapLayerToggles?: {
    metro: boolean;
    roads: boolean;
    landmarks: boolean;
    satellite: boolean;
  };
}

export function DeckCityMap({
  state,
  armed,
  onMapClick,
  cityId = "dc",
  onNodeClick,
  onSosClick,
  showMapLayers = true,
  mapLayerToggles,
}: Props) {
  const { t } = useI18n();
  const city = getCityPreset(cityId);
  const mapCenter = { lat: city.lat, lng: city.lng };
  const mapBounds: [[number, number], [number, number]] = [
    [city.bbox.west, city.bbox.south],
    [city.bbox.east, city.bbox.north],
  ];
  const initialView: MapViewState = {
    latitude: mapCenter.lat,
    longitude: mapCenter.lng,
    zoom: city.zoom,
    pitch: 52,
    bearing: -22,
    minZoom: 11,
    maxZoom: 18,
  };
  const gridCtx = useGridCityOptional();
  const gridState = gridCtx?.gridState;
  const wow = useVisualWowOptional();
  const [buildings, setBuildings] = useState<FeatureCollection | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [dcBuildingsOnly, setDcBuildingsOnly] = useState(true);
  const [viewState, setViewState] = useState<MapViewState>(initialView);

  useEffect(() => {
    setViewState((prev) => ({
      ...prev,
      latitude: mapCenter.lat,
      longitude: mapCenter.lng,
      zoom: city.zoom,
    }));
  }, [cityId, mapCenter.lat, mapCenter.lng, city.zoom]);

  useEffect(() => {
    if (!wow?.toggles.heliCam || !wow.derived.heliTarget) return;
    const target = wow.derived.heliTarget;
    setViewState((prev) => ({
      ...prev,
      latitude: target.lat,
      longitude: target.lng,
      zoom: Math.max(prev.zoom ?? city.zoom, 15),
      pitch: 65,
      bearing: prev.bearing ?? -22,
    }));
  }, [wow?.toggles.heliCam, wow?.derived.heliTarget?.lat, wow?.derived.heliTarget?.lng, city.zoom]);

  useEffect(() => {
    const onGesture = (ev: Event) => {
      const g = (ev as CustomEvent<{ type: string; dx?: number; dy?: number; delta?: number }>).detail;
      if (!g) return;
      setViewState((prev) => {
        if (g.type === "pan" && g.dx != null && g.dy != null) {
          return {
            ...prev,
            longitude: (prev.longitude ?? DC_CENTER.lng) - g.dx,
            latitude: (prev.latitude ?? DC_CENTER.lat) + g.dy,
          };
        }
        if (g.type === "zoom" && g.delta != null) {
          const z = prev.zoom ?? 14.6;
          return { ...prev, zoom: Math.min(18, Math.max(12, z + g.delta * 0.35)) };
        }
        return prev;
      });
    };
    window.addEventListener("nexus-map-gesture", onGesture);
    return () => window.removeEventListener("nexus-map-gesture", onGesture);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch(BUILDINGS_URL)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<FeatureCollection>;
      })
      .then((data) => {
        if (!cancelled) setBuildings(data);
      })
      .catch((err: Error) => {
        if (!cancelled) setLoadError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const crisisMode = Boolean(state.active_disaster) || state.metrics.city_health < 60;
  const envScore = gridState?.environment_score ?? 50;

  const userPlacements = useMemo(
    () => (gridState?.placements ?? []).filter((p) => p.building !== "C" && p.building !== "."),
    [gridState?.placements],
  );

  const enrichedPlacements = useMemo<LabeledPlacement[]>(
    () =>
      userPlacements.map((p) => {
        const height = defaultBuildingHeight(p.building);
        return {
          ...p,
          height,
          color: defaultBuildingColor(p.building),
          labelText: t(BUILDING_I18N_KEYS[p.building] ?? "bld_unknown"),
          labelAlt: height + 18,
        };
      }),
    [userPlacements, t],
  );

  const labeledPlacements = useMemo(
    () => enrichedPlacements.filter((p) => shouldShowMapLabel(p.building)),
    [enrichedPlacements],
  );

  const userBuildingGeo = useMemo(
    () => (enrichedPlacements.length ? placementsToGeoJSON(enrichedPlacements) : null),
    [enrichedPlacements],
  );

  const infraBuildingGeo = useMemo(
    () => (state.nodes.length ? infraNodesToGeoJSON(state.nodes) : null),
    [state.nodes],
  );

  const visibleOsm = useMemo(() => {
    if (!buildings || !dcBuildingsOnly) return null;
    const inDc = filterFeaturesInDcBounds(buildings);
    return filterOsmAwayFromPlacements(inDc, enrichedPlacements);
  }, [buildings, enrichedPlacements, dcBuildingsOnly]);

  const osmFill = useCallback(
    (feature: Feature): [number, number, number, number] => {
      const centroid = featureCentroid(feature);
      if (centroid) {
        const [lng, lat] = centroid;
        for (const node of state.nodes) {
          if (Math.abs(lat - node.latitude) < 0.00038 && Math.abs(lng - node.longitude) < 0.00038) {
            const col = INFRA_BLOCK_COLORS[node.type];
            if (col) {
              const dim = node.health < 40 ? 0.6 : node.health < 70 ? 0.82 : 1;
              return [
                Math.round(col[0] * dim),
                Math.round(col[1] * dim),
                Math.round(col[2] * dim),
                255,
              ];
            }
          }
        }
      }
      const props = feature.properties as BuildingProps | undefined;
      const height = props?.height ?? 12;
      return osmBuildingFillColor(props?.building, height, crisisMode);
    },
    [crisisMode, state.nodes],
  );

  const layers = useMemo(() => {
    const result = [];

    if (visibleOsm) {
      result.push(
        new GeoJsonLayer<BuildingProps>({
          id: "dc-buildings",
          data: visibleOsm,
          extruded: true,
          wireframe: false,
          filled: true,
          stroked: true,
          pickable: false,
          opacity: 1,
          getElevation: (f) => (f.properties?.height ?? 12) * (crisisMode ? 1.02 : 1),
          getFillColor: (f) => osmFill(f),
          getLineColor: (f) => {
            const fill = osmFill(f);
            return [Math.round(fill[0] * 0.45), Math.round(fill[1] * 0.45), Math.round(fill[2] * 0.45), 255];
          },
          getLineWidth: 1,
          lineWidthUnits: "pixels",
          material: { ambient: 0.45, diffuse: 0.82, shininess: 18, specularColor: [80, 90, 110] },
          updateTriggers: {
            getFillColor: [crisisMode, dcBuildingsOnly, state.nodes.map((n) => `${n.id}:${n.health}`).join(",")],
          },
        }),
      );
    }

    const parkZones = gridState?.park_zones ?? [];
    if (parkZones.length) {
      result.push(
        new PolygonLayer({
          id: "park-environment",
          data: parkZones.map((z) => ({ polygon: parkCircle(z.latitude, z.longitude, z.radius_m) })),
          getPolygon: (d) => d.polygon.coordinates,
          getFillColor: [80, 220, 120, 55 + Math.min(50, envScore / 2)],
          getLineColor: [120, 255, 160, 160],
          getLineWidth: 2,
          lineWidthUnits: "pixels",
          stroked: true,
          filled: true,
        }),
      );
    }

    if (infraBuildingGeo?.features.length) {
      result.push(solidBlockLayer<InfraBlockProps>("infra-city-blocks", infraBuildingGeo, 1.05));
    }

    if (showMapLayers) {
      const layers = mapLayerToggles ?? { metro: true, roads: true, landmarks: true, satellite: true };
      if (layers.roads) result.push(...buildRoadLayers(crisisMode));
      if (layers.metro) result.push(...buildMetroLayers(state, crisisMode));
      if (layers.landmarks) result.push(...buildLandmarkLayers(cityId, crisisMode));
      if (layers.satellite) {
        const scanLayer = buildSatelliteScanLayer(state);
        if (scanLayer) result.push(scanLayer);
      }
    }

    if (userBuildingGeo?.features.length) {
      result.push(solidBlockLayer<MapBuildingFeatureProps>("user-city-blocks", userBuildingGeo, 1.08));
    }

    const citizens = gridState?.citizens ?? [];
    if (citizens.length) {
      result.push(
        new ScatterplotLayer<GridCitizen>({
          id: "grid-citizens",
          data: citizens,
          getPosition: (d) => [d.longitude, d.latitude],
          getRadius: (d) => (d.wealth === "rich" ? 5 : d.wealth === "poor" ? 3.5 : 4),
          radiusUnits: "meters",
          getFillColor: (d) => citizenColor(d.wealth),
          getLineColor: [255, 255, 255, 180],
          lineWidthUnits: "pixels",
          getLineWidth: 1,
          stroked: true,
          pickable: false,
        }),
      );
    }

    const labelData = [
      ...labeledPlacements.map((p) => ({
        longitude: p.longitude,
        latitude: p.latitude,
        alt: p.labelAlt,
        text: p.labelText,
        color: p.color,
      })),
      ...(infraBuildingGeo?.features ?? []).slice(0, 16).map((f) => ({
        longitude: featureCentroid(f)?.[0] ?? 0,
        latitude: featureCentroid(f)?.[1] ?? 0,
        alt: (f.properties?.height ?? 30) + 16,
        text: f.properties?.label ?? "",
        color: f.properties?.color ?? ([200, 200, 200, 255] as [number, number, number, number]),
      })),
    ].filter((d) => d.text);

    if (labelData.length) {
      result.push(
        new TextLayer({
          id: "building-labels",
          data: labelData,
          coordinateSystem: COORDINATE_SYSTEM.LNGLAT,
          getPosition: (d) => [d.longitude, d.latitude, d.alt],
          getText: (d) => d.text,
          getColor: [255, 255, 255, 255],
          getTextAnchor: "middle",
          getAlignmentBaseline: "bottom",
          billboard: true,
          background: true,
          getBackgroundColor: (d) => [d.color[0], d.color[1], d.color[2], 235],
          getSize: 18,
          sizeMaxPixels: 24,
          sizeMinPixels: 14,
          fontFamily: "system-ui, Segoe UI, sans-serif",
          fontWeight: "bold",
          padding: [5, 10, 5, 10],
        }),
      );
    }

    if (state.epicenter) {
      const radius = Math.min(state.disaster_radius, 12000);
      result.push(
        new PolygonLayer({
          id: "disaster-zone",
          data: [{ polygon: disasterRing(state.epicenter, radius) }],
          getPolygon: (d) => d.polygon.coordinates,
          getFillColor: [255, 70, 85, 35],
          getLineColor: [244, 161, 0, 180],
          getLineWidth: 2,
          lineWidthUnits: "pixels",
          stroked: true,
          filled: true,
        }),
      );
    }

    const vehicles = state.vehicles ?? [];
    if (vehicles.length) {
      result.push(
        new ScatterplotLayer<Vehicle>({
          id: "live-units",
          data: vehicles,
          getPosition: (d) => [d.longitude, d.latitude],
          getRadius: (d) => vehicleRadius(d.type),
          radiusUnits: "meters",
          getFillColor: (d) => vehicleColor(d.type),
          getLineColor: [255, 255, 255, 200],
          lineWidthUnits: "pixels",
          getLineWidth: 1,
          stroked: true,
        }),
      );
    }

    const sos = state.creative?.sos_sync?.reports ?? [];
    if (sos.length) {
      result.push(
        new ScatterplotLayer({
          id: "sos-markers",
          data: sos,
          getPosition: (d) => [d.longitude, d.latitude],
          getRadius: 35,
          radiusUnits: "meters",
          getFillColor: [255, 40, 60, 220],
          getLineColor: [255, 200, 80, 255],
          lineWidthUnits: "pixels",
          getLineWidth: 3,
          stroked: true,
          pickable: true,
        }),
      );
    }

    if (wow) {
      const draftAnn =
        wow.draftAnnotation.length > 0
          ? [
              {
                id: "draft",
                points: wow.draftAnnotation,
                color: [255, 255, 100, 200] as [number, number, number, number],
                role: wow.annotationRole,
              },
            ]
          : [];
      result.push(...buildVisualWowLayers(state, wow.toggles, wow.derived, [...wow.mapAnnotations, ...draftAnn]));
    }

    return result;
  }, [
    visibleOsm,
    osmFill,
    crisisMode,
    dcBuildingsOnly,
    envScore,
    gridState,
    infraBuildingGeo,
    userBuildingGeo,
    labeledPlacements,
    enrichedPlacements,
    state,
    cityId,
    showMapLayers,
    mapLayerToggles,
    wow,
  ]);

  const handleClick = useCallback(
    (info: PickingInfo) => {
      if (wow?.annotationMode && wow.toggles.mapAnnotation && info.coordinate) {
        wow.addAnnotationPoint(info.coordinate[0], info.coordinate[1]);
        return;
      }
      if (armed && info.coordinate) {
        onMapClick(info.coordinate[1], info.coordinate[0]);
        return;
      }
      if (info.layer?.id === "sos-markers" && info.object) {
        const sos = info.object as { id?: string };
        if (sos.id) onSosClick?.(sos.id);
        return;
      }
      if (info.layer?.id === "infra-city-blocks" && info.object && onNodeClick) {
        const feat = info.object as Feature;
        const label = (feat.properties as InfraBlockProps | undefined)?.label;
        const node = state.nodes.find((n) => n.name === label || n.id === label);
        if (node) onNodeClick(node);
      }
    },
    [armed, onMapClick, onNodeClick, onSosClick, state.nodes, wow],
  );

  const beforeAfterBlend = wow?.toggles.beforeAfterSlider ? wow.beforeAfterPos / 100 : 1;
  const crisisFilter = 1 - beforeAfterBlend;
  const weatherOverlay = state.weather?.overlay ?? "none";

  return (
    <div
      className={`deck-map-root${wow?.toggles.ghostCity && wow.derived.showGhostCity ? " is-ghost-city" : ""}${wow?.toggles.fogOfWar ? " has-fog-of-war" : ""}${wow?.annotationMode ? " is-annotating" : ""}`}
      style={
        wow?.toggles.beforeAfterSlider
          ? ({
              "--recovery-blend": beforeAfterBlend,
              "--crisis-filter": crisisFilter,
            } as React.CSSProperties)
          : undefined
      }
    >
      <DeckGL
        viewState={viewState}
        onViewStateChange={({ viewState: next }) => {
          if ("latitude" in next && "longitude" in next && !wow?.photoModeLocked) {
            setViewState(next);
          }
        }}
        controller={!armed && !wow?.photoModeLocked && !wow?.annotationMode}
        layers={layers}
        onClick={handleClick}
        getCursor={({ isDragging }) => (armed ? "crosshair" : isDragging ? "grabbing" : "grab")}
        style={{ width: "100%", height: "100%" }}
      >
        <Map
          mapLib={maplibregl}
          mapStyle={MAP_STYLE}
          attributionControl={false}
          maxBounds={mapBounds}
        />
      </DeckGL>

      {weatherOverlay !== "none" && (
        <div className={`cmd-weather-overlay is-${weatherOverlay}`} aria-hidden />
      )}

      {wow?.toggles.fogOfWar && <div className="wow-fog-vignette" aria-hidden />}

      {state.satellite_scan?.active && (
        <div className="cmd-satellite-hud">{t("map_satellite_scan")}</div>
      )}

      <label className="deck-map-dc-toggle">
        <input
          type="checkbox"
          checked={dcBuildingsOnly}
          onChange={(e) => setDcBuildingsOnly(e.target.checked)}
        />
        <span>{t("map_dc_buildings_only")}</span>
      </label>

      {gridState && userPlacements.length > 0 && (
        <div className="deck-grid-sync-badge">
          🏗 {userPlacements.length} · 👥 {gridState.population} · 🌿 {Math.round(gridState.environment_score)}%
          {gridState.solar_output > 0 && ` · ☀ ${gridState.solar_output}kW`}
        </div>
      )}

      {!buildings && !loadError && <div className="deck-map-loading">Loading OSM buildings…</div>}
      {loadError && <div className="deck-map-error">Building data unavailable: {loadError}</div>}
    </div>
  );
}
