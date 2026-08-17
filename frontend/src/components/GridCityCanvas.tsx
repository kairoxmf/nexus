import type { GridSimulationState } from "../types";
import { cellColor, isSolarCell } from "../lib/gridSimApi";
import { GridBuildingCellContent } from "./GridBuildingIcon";

interface Props {
  state: GridSimulationState;
  selected: string;
  onCellClick: (x: number, y: number) => void;
  large?: boolean;
}

export function GridCityCanvas({ state, selected, onCellClick, large }: Props) {
  return (
    <div className={`grid-canvas-wrap${large ? " is-large" : ""}`}>
      <div
        className={`grid-canvas${large ? " is-large" : ""}`}
        style={{ gridTemplateColumns: `repeat(${state.grid_size}, 1fr)` }}
      >
        {state.grid.map((row, x) =>
          row.map((cell, y) => {
            const solarHint = cell === "." && isSolarCell(x, y);
            return (
              <button
                key={`${x}-${y}`}
                type="button"
                className={`grid-cell ${cell === "." ? "empty" : "built"}${solarHint ? " solar-zone" : ""}`}
                style={{ background: cellColor(cell) }}
                title={`(${x},${y}) ${cell}`}
                onClick={() => onCellClick(x, y)}
              >
                {cell !== "." ? (
                  <GridBuildingCellContent symbol={cell} large={large} />
                ) : solarHint && selected === "G" ? (
                  <GridBuildingCellContent symbol="G" large={large} />
                ) : null}
              </button>
            );
          }),
        )}
      </div>
    </div>
  );
}
