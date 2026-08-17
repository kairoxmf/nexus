/** WMATA Metro — lines, stations, and underground routing for DC digital twin. */

export type MetroLineId = "red" | "blue" | "orange" | "green" | "yellow" | "silver";

export interface MetroStation {
  id: string;
  name: string;
  name_fa: string;
  lat: number;
  lng: number;
  lines: MetroLineId[];
  depth_m: number;
  daily_riders_k: number;
}

export interface MetroLine {
  id: MetroLineId;
  name: string;
  color: string;
  points: [number, number][];
}

export const METRO_LINES: MetroLine[] = [
  {
    id: "red",
    name: "Red Line",
    color: "#E4142C",
    points: [
      [38.984, -77.095],
      [38.962, -77.084],
      [38.948, -77.079],
      [38.928, -77.032],
      [38.904, -77.043],
      [38.898, -77.028],
      [38.884, -77.021],
      [38.862, -76.975],
    ],
  },
  {
    id: "blue",
    name: "Blue Line",
    color: "#009CDE",
    points: [
      [38.852, -77.043],
      [38.862, -77.028],
      [38.876, -77.022],
      [38.896, -77.028],
      [38.904, -77.043],
      [38.918, -77.043],
      [38.928, -77.032],
    ],
  },
  {
    id: "orange",
    name: "Orange Line",
    color: "#F7941D",
    points: [
      [38.928, -77.032],
      [38.918, -77.043],
      [38.904, -77.043],
      [38.896, -77.028],
      [38.876, -77.022],
      [38.862, -77.028],
      [38.852, -77.043],
    ],
  },
  {
    id: "green",
    name: "Green Line",
    color: "#00B04F",
    points: [
      [38.928, -76.995],
      [38.918, -77.002],
      [38.904, -77.022],
      [38.896, -77.028],
      [38.884, -77.021],
      [38.862, -76.975],
    ],
  },
  {
    id: "yellow",
    name: "Yellow Line",
    color: "#FFD100",
    points: [
      [38.852, -77.043],
      [38.862, -77.028],
      [38.876, -77.022],
      [38.896, -77.028],
      [38.904, -77.043],
      [38.918, -77.043],
    ],
  },
  {
    id: "silver",
    name: "Silver Line",
    color: "#A0A0A0",
    points: [
      [38.948, -77.079],
      [38.928, -77.032],
      [38.918, -77.043],
      [38.904, -77.043],
      [38.896, -77.028],
    ],
  },
];

export const METRO_STATIONS: MetroStation[] = [
  { id: "metro-center", name: "Metro Center", name_fa: "مترو سنتر", lat: 38.898, lng: -77.028, lines: ["red", "blue", "orange", "silver"], depth_m: 24, daily_riders_k: 78 },
  { id: "farragut-n", name: "Farragut North", name_fa: "فاراگات شمال", lat: 38.904, lng: -77.039, lines: ["red"], depth_m: 18, daily_riders_k: 22 },
  { id: "farragut-w", name: "Farragut West", name_fa: "فاراگات غرب", lat: 38.901, lng: -77.039, lines: ["blue", "orange", "silver"], depth_m: 20, daily_riders_k: 28 },
  { id: "l-enfant", name: "L'Enfant Plaza", name_fa: "لانفانت پلازا", lat: 38.884, lng: -77.021, lines: ["green", "yellow", "blue", "orange", "silver"], depth_m: 22, daily_riders_k: 45 },
  { id: "union-station", name: "Union Station", name_fa: "ایستگاه اتحادیه", lat: 38.897, lng: -77.006, lines: ["red"], depth_m: 16, daily_riders_k: 35 },
  { id: "capitol-s", name: "Capitol South", name_fa: "کاپیتول جنوب", lat: 38.886, lng: -77.005, lines: ["blue", "orange", "silver"], depth_m: 20, daily_riders_k: 18 },
  { id: "archives", name: "Archives", name_fa: "آرشیو", lat: 38.893, lng: -77.022, lines: ["green", "yellow"], depth_m: 19, daily_riders_k: 12 },
  { id: "smithsonian", name: "Smithsonian", name_fa: "اسمیتسونی", lat: 38.888, lng: -77.028, lines: ["blue", "orange", "silver"], depth_m: 17, daily_riders_k: 25 },
  { id: "foggy-bottom", name: "Foggy Bottom", name_fa: "فوگی باتم", lat: 38.901, lng: -77.051, lines: ["blue", "orange", "silver"], depth_m: 21, daily_riders_k: 20 },
  { id: "rosslyn", name: "Rosslyn", name_fa: "راسلین", lat: 38.896, lng: -77.071, lines: ["blue", "orange", "silver"], depth_m: 28, daily_riders_k: 32 },
  { id: "pentagon", name: "Pentagon", name_fa: "پنتاگون", lat: 38.869, lng: -77.054, lines: ["blue", "yellow"], depth_m: 26, daily_riders_k: 15 },
  { id: "noma", name: "NoMa-Gallaudet", name_fa: "نوما", lat: 38.907, lng: -77.003, lines: ["red"], depth_m: 15, daily_riders_k: 14 },
  { id: "judiciary", name: "Judiciary Square", name_fa: "میدان قضایی", lat: 38.897, lng: -77.017, lines: ["red"], depth_m: 18, daily_riders_k: 8 },
  { id: "waterfront", name: "Waterfront", name_fa: "واترفرانت", lat: 38.876, lng: -77.017, lines: ["green"], depth_m: 22, daily_riders_k: 6 },
  { id: "shady-grove", name: "Shady Grove", name_fa: "شیدی گروو", lat: 39.119, lng: -77.165, lines: ["red"], depth_m: 12, daily_riders_k: 10 },
];
