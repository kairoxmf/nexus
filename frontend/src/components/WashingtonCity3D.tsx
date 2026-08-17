import { useState } from "react";
import { useI18n } from "../i18n";
import { Icon3D } from "@shared/icons";
import type { CityNode, SimulationState } from "../types";
import { getCityPreset } from "../lib/cityPresets";
import { MAP_LEGEND_ITEMS } from "../lib/gridMapVisuals";
import { AdvancedMapOverlay } from "./AdvancedMapOverlay";
import { DeckCityMap } from "./city/DeckCityMap";
import { MapEventPopup } from "./command/MapEventPopup";
import { VisualWowOverlay, VisualWowToolbar } from "./visual/VisualWowEffects";
import { useVisualWowOptional } from "../context/VisualWowContext";

export type MapLayerToggles = {
  metro: boolean;
  roads: boolean;
  landmarks: boolean;
  satellite: boolean;
};

interface Props {
  state: SimulationState;
  armed: boolean;
  onMapClick: (lat: number, lng: number) => void;
  cityId?: string;
  onSosClick?: (sosId: string) => void;
  onOpenWowPanel?: () => void;
  onNodeRepair?: (node: CityNode) => void;
  mapLayers?: MapLayerToggles;
  onMapLayersChange?: (layers: MapLayerToggles) => void;
  compactOverlays?: boolean;
}

const DEFAULT_LAYERS: MapLayerToggles = {
  metro: true,
  roads: true,
  landmarks: true,
  satellite: true,
};

export function WashingtonCity3D({
  state,
  armed,
  onMapClick,
  cityId = "dc",
  onSosClick,
  onOpenWowPanel,
  onNodeRepair,
  mapLayers: mapLayersProp,
  onMapLayersChange,
  compactOverlays = false,
}: Props) {
  const { t } = useI18n();
  const city = getCityPreset(cityId);
  const [selectedNode, setSelectedNode] = useState<CityNode | null>(null);
  const [localLayers, setLocalLayers] = useState<MapLayerToggles>(DEFAULT_LAYERS);
  const mapLayers = mapLayersProp ?? localLayers;
  const wow = useVisualWowOptional();
  const tehranMini = wow?.toggles.tehranMiniature && cityId === "teh";

  const toggleLayer = (key: keyof MapLayerToggles) => {
    const next = { ...mapLayers, [key]: !mapLayers[key] };
    if (onMapLayersChange) onMapLayersChange(next);
    else setLocalLayers(next);
  };

  const handleRepair = (node: CityNode) => {
    onNodeRepair?.(node);
    setSelectedNode(null);
  };

  return (
    <div
      className={`map-container city-3d deck-city-map${tehranMini ? " is-tehran-miniature" : ""}`}
      style={{ cursor: armed ? "crosshair" : "grab" }}
    >
      <DeckCityMap
        state={state}
        armed={armed}
        onMapClick={onMapClick}
        cityId={cityId}
        onNodeClick={setSelectedNode}
        onSosClick={onSosClick}
        mapLayerToggles={mapLayers}
      />

      <div className="cmd-map-layers">
        {(
          [
            ["metro", "map_layer_metro"],
            ["roads", "map_layer_roads"],
            ["landmarks", "map_layer_landmarks"],
            ["satellite", "map_layer_satellite"],
          ] as const
        ).map(([key, labelKey]) => (
          <button
            key={key}
            type="button"
            className={`cmd-map-layer-chip${mapLayers[key] ? " is-on" : ""}`}
            onClick={() => toggleLayer(key)}
          >
            {t(labelKey)}
          </button>
        ))}
      </div>

      {wow && <VisualWowOverlay state={state} compact={compactOverlays} />}
      {wow && onOpenWowPanel && <VisualWowToolbar onOpenPanel={onOpenWowPanel} compact={compactOverlays} />}

      {selectedNode && (
        <MapEventPopup node={selectedNode} onClose={() => setSelectedNode(null)} onDispatch={handleRepair} />
      )}

      <div className="map-hud">
        <div className="map-hud-title">
          {cityId === "teh" ? t("map_title_tehran") : t("map_title")}
        </div>
        <div className="map-hud-coords">
          {city.lat.toFixed(4)}°N · {Math.abs(city.lng).toFixed(4)}{city.lng < 0 ? "°W" : "°E"} · T+{state.tick}
        </div>
        {!armed && <div className="map-hud-hint">{t("map_drag_hint")}</div>}
      </div>

      {armed && <div className="map-armed-badge">{t("map_armed")}</div>}

      <AdvancedMapOverlay data={state.advanced} />

      <div className="map-legend map-legend-grid">
        <div className="map-legend-section">{t("grid_your_city")}</div>
        {MAP_LEGEND_ITEMS.map(({ hex, i18nKey }) => (
          <span key={i18nKey}>
            <i style={{ background: hex }} />
            {t(i18nKey)}
          </span>
        ))}
        <div className="map-legend-section">{t("map_infra")}</div>
        <span><i style={{ background: "#33C17A" }} />{t("operational")}</span>
        <span><i style={{ background: "#F4A100" }} />{t("damaged")}</span>
        <span><i style={{ background: "#FF4655" }} />{t("critical")}</span>
        <span style={{ color: "#4cc9f0", display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Icon3D name="dot" size={10} animated color="#4cc9f0" /> {t("live_traffic")}
        </span>
      </div>
    </div>
  );
}
