"""Fetch Washington D.C. building footprints from Overpass and save as GeoJSON."""

from __future__ import annotations

import json
import math
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "frontend" / "public" / "data"
OUT_FILE = OUT_DIR / "dc_buildings.geojson"

# National Mall + downtown core
BBOX = (38.885, -77.055, 38.915, -77.015)


def parse_height(tags: dict) -> float:
    raw = tags.get("height") or tags.get("building:height")
    if raw:
        try:
            return float(str(raw).replace("m", "").strip())
        except ValueError:
            pass
    levels = tags.get("building:levels") or tags.get("levels")
    if levels:
        try:
            return float(str(levels).split(";")[0]) * 3.2
        except ValueError:
            pass
    kind = tags.get("building", "yes")
    if kind in {"house", "residential", "detached"}:
        return 8.0
    if kind in {"commercial", "retail", "office"}:
        return 18.0
    if kind in {"public", "government", "civic"}:
        return 24.0
    if kind in {"industrial", "warehouse"}:
        return 12.0
    return 12.0


def overpass_to_geojson(payload: dict) -> dict:
    features: list[dict] = []
    for el in payload.get("elements", []):
        if el.get("type") != "way" or "geometry" not in el:
            continue
        coords = [[pt["lon"], pt["lat"]] for pt in el["geometry"]]
        if len(coords) < 4:
            continue
        if coords[0] != coords[-1]:
            coords.append(coords[0])
        tags = el.get("tags", {})
        features.append(
            {
                "type": "Feature",
                "id": el.get("id"),
                "properties": {
                    "height": parse_height(tags),
                    "building": tags.get("building", "yes"),
                    "name": tags.get("name"),
                },
                "geometry": {"type": "Polygon", "coordinates": [coords]},
            }
        )
    return {"type": "FeatureCollection", "features": features}


def main() -> None:
    south, west, north, east = BBOX
    query = f'[out:json][timeout:120];(way["building"]({south},{west},{north},{east}););out geom;'
    url = "https://overpass-api.de/api/interpreter"
    req = urllib.request.Request(
        url,
        data=urllib.parse.urlencode({"data": query}).encode(),
        headers={"User-Agent": "NEXUS-DC-Map/1.0"},
    )
    print("Querying Overpass API…")
    with urllib.request.urlopen(req, timeout=180) as resp:
        payload = json.load(resp)

    geojson = overpass_to_geojson(payload)
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    OUT_FILE.write_text(json.dumps(geojson), encoding="utf-8")
    print(f"Saved {len(geojson['features'])} buildings -> {OUT_FILE}")
    heights = [f["properties"]["height"] for f in geojson["features"]]
    if heights:
        print(f"Height range: {min(heights):.1f}m – {max(heights):.1f}m, avg {sum(heights)/len(heights):.1f}m")


if __name__ == "__main__":
    main()
