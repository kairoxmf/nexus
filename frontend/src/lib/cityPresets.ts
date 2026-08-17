/** City presets for map re-centering and Persian crisis mode. */

export interface CityPreset {
  id: string;
  name: string;
  name_fa: string;
  lat: number;
  lng: number;
  zoom: number;
  bbox: { south: number; west: number; north: number; east: number };
}

export const CITY_PRESETS: CityPreset[] = [
  {
    id: "dc",
    name: "Washington D.C.",
    name_fa: "واشنگتن",
    lat: 38.9072,
    lng: -77.0369,
    zoom: 14.6,
    bbox: { south: 38.791, west: -77.119, north: 38.995, east: -76.909 },
  },
  {
    id: "teh",
    name: "Tehran",
    name_fa: "تهران",
    lat: 35.6892,
    lng: 51.389,
    zoom: 13.8,
    bbox: { south: 35.55, west: 51.15, north: 35.82, east: 51.62 },
  },
  {
    id: "nyc",
    name: "New York City",
    name_fa: "نیویورک",
    lat: 40.7128,
    lng: -74.006,
    zoom: 14.2,
    bbox: { south: 40.55, west: -74.15, north: 40.88, east: -73.85 },
  },
  {
    id: "tok",
    name: "Tokyo",
    name_fa: "توکیو",
    lat: 35.6762,
    lng: 139.6503,
    zoom: 14.0,
    bbox: { south: 35.52, west: 139.45, north: 35.82, east: 139.85 },
  },
];

export const DC_LANDMARKS = [
  { id: "white_house", name: "White House", name_fa: "کاخ سفید", lat: 38.8977, lng: -77.0365 },
  { id: "capitol", name: "Capitol", name_fa: "کاپیتول", lat: 38.8899, lng: -77.0091 },
  { id: "monument", name: "Washington Monument", name_fa: "یادبود واشنگتن", lat: 38.8895, lng: -77.0353 },
  { id: "lincoln", name: "Lincoln Memorial", name_fa: "یادبود لینکلن", lat: 38.8893, lng: -77.0502 },
  { id: "pentagon", name: "Pentagon", name_fa: "پنتاگون", lat: 38.8719, lng: -77.0563 },
];

export const TEHRAN_LANDMARKS = [
  { id: "azadi", name: "Azadi Tower", name_fa: "برج آزادی", lat: 35.6997, lng: 51.3381 },
  { id: "milad", name: "Milad Tower", name_fa: "برج میلاد", lat: 35.7448, lng: 51.3753 },
  { id: "golestan", name: "Golestan Palace", name_fa: "کاخ گلستان", lat: 35.679, lng: 51.4203 },
  { id: "bazaar", name: "Grand Bazaar", name_fa: "بازار بزرگ", lat: 35.673, lng: 51.423 },
];

export function getCityPreset(id: string): CityPreset {
  return CITY_PRESETS.find((c) => c.id === id) ?? CITY_PRESETS[0];
}
