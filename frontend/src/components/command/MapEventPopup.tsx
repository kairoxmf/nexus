import { Icon3D } from "@shared/icons";
import { useI18n } from "../../i18n";
import { TYPE_COLORS } from "../../lib/geo";
import type { CityNode } from "../../types";

type Props = {
  node: CityNode;
  onClose: () => void;
  onDispatch?: (node: CityNode) => void;
};

export function MapEventPopup({ node, onClose, onDispatch }: Props) {
  const { t } = useI18n();
  const color = TYPE_COLORS[node.type] ?? "#4cc9f0";

  return (
    <div className="cmd-map-popup" role="dialog">
      <button type="button" className="cmd-map-popup-close" onClick={onClose} aria-label={t("close")}>
        <Icon3D name="close" size={14} />
      </button>
      <div className="cmd-map-popup-head">
        <Icon3D name="dot" size={14} color={color} animated={node.health < 50} />
        <div>
          <div className="cmd-map-popup-title">{node.name}</div>
          <div className="hint">{node.type.toUpperCase()} · {node.status}</div>
        </div>
      </div>
      <div className="cmd-map-popup-stats">
        <div>
          <span>{t("map_health")}</span>
          <strong style={{ color: node.health >= 70 ? "var(--green)" : node.health >= 40 ? "var(--amber)" : "var(--red)" }}>
            {Math.round(node.health)}%
          </strong>
        </div>
        <div>
          <span>{t("map_capacity")}</span>
          <strong>{Math.round(node.capacity)}%</strong>
        </div>
        <div>
          <span>{t("map_coords")}</span>
          <strong>{node.latitude.toFixed(4)}, {node.longitude.toFixed(4)}</strong>
        </div>
      </div>
      {node.deps.length > 0 && (
        <div className="hint">{t("map_deps")}: {node.deps.length}</div>
      )}
      {onDispatch && node.health < 70 && (
        <button type="button" className="btn-primary" style={{ marginTop: 8 }} onClick={() => onDispatch(node)}>
          {t("map_dispatch_repair")}
        </button>
      )}
    </div>
  );
}
