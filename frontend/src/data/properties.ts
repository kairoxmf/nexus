export interface PropertyAgent {
  name: string;
  role: string;
  phone: string;
  email: string;
  photo: string;
}

export interface Property {
  id: string;
  slug: string;
  name: string;
  location: string;
  city: string;
  state: string;
  country: string;
  price: number;
  priceFormatted: string;
  type: "Villa" | "House" | "Penthouse" | "Estate" | "Residence";
  bedrooms: number;
  bathrooms: number;
  area: number;
  areaFormatted: string;
  featured: boolean;
  description: string;
  features: string[];
  amenities: string[];
  images: string[];
  agent: PropertyAgent;
}

const img = (id: string, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const properties: Property[] = [
  {
    id: "1",
    slug: "lakeside-modern-villa",
    name: "Lakeside Modern Villa",
    location: "Austin, Texas, USA",
    city: "Austin",
    state: "Texas",
    country: "USA",
    price: 2350000,
    priceFormatted: "$2.35 Million",
    type: "Villa",
    bedrooms: 5,
    bathrooms: 4,
    area: 4200,
    areaFormatted: "4,200 sq ft",
    featured: true,
    description:
      "A stunning architectural masterpiece set on the shores of Lake Austin. This villa features floor-to-ceiling glass walls, an infinity pool that merges with the lake, and seamless indoor-outdoor living spaces designed for both grand entertaining and intimate relaxation.",
    features: [
      "Infinity pool overlooking the lake",
      "Floor-to-ceiling glass walls",
      "Smart home automation",
      "Chef's kitchen with island",
      "Private dock and boathouse",
      "Wine cellar",
    ],
    amenities: [
      "Home theater",
      "Gym and spa",
      "3-car garage",
      "Landscaped gardens",
      "Outdoor kitchen",
      "Solar panels",
    ],
    images: [
      img("1512917774080-9991f1c4c750"),
      img("1600596542815-ffad4c1539a9"),
      img("1600585154340-be6161a56a0c"),
      img("1706808849780-7a04fbac83ef"),
    ],
    agent: {
      name: "Daniel Morgan",
      role: "Managing Director",
      phone: "(555) 246-7890",
      email: "daniel@horizonproperties.com",
      photo: img("1507003211169-0a1dd7228f2d", 400),
    },
  },
  {
    id: "2",
    slug: "pacific-glass-house",
    name: "Pacific Glass House",
    location: "Malibu, California, USA",
    city: "Malibu",
    state: "California",
    country: "USA",
    price: 4800000,
    priceFormatted: "$4.8 Million",
    type: "House",
    bedrooms: 6,
    bathrooms: 5,
    area: 6800,
    areaFormatted: "6,800 sq ft",
    featured: true,
    description:
      "Perched on the Malibu cliffs with panoramic Pacific Ocean views, this architectural gem dissolves the boundary between interior and exterior. Expansive glass walls frame the horizon, while warm oak and stone interiors create a serene retreat above the sea.",
    features: [
      "Panoramic ocean views",
      "Cantilevered terrace",
      "Glass-walled living area",
      "Private beach access",
      "Heated infinity pool",
      "Home office with view",
    ],
    amenities: [
      "Wine room",
      "Media lounge",
      "2-car garage",
      "Outdoor shower",
      "Fire pit area",
      "Desalination system",
    ],
    images: [
      img("1600210492486-724fe5c67fb0"),
      img("1670589953882-b94c9cb380f5"),
      img("1605276374104-dee2a0ed3cd6"),
      img("1600596542815-ffad4c1539a9"),
    ],
    agent: {
      name: "Olivia Carter",
      role: "Luxury Property Advisor",
      phone: "(555) 246-7891",
      email: "olivia@horizonproperties.com",
      photo: img("1494790108377-be9c29b29330", 400),
    },
  },
  {
    id: "3",
    slug: "desert-horizon-estate",
    name: "Desert Horizon Estate",
    location: "Scottsdale, Arizona, USA",
    city: "Scottsdale",
    state: "Arizona",
    country: "USA",
    price: 3150000,
    priceFormatted: "$3.15 Million",
    type: "Estate",
    bedrooms: 5,
    bathrooms: 5,
    area: 5500,
    areaFormatted: "5,500 sq ft",
    featured: true,
    description:
      "A modern desert sanctuary that harmonizes raw concrete, warm wood, and the natural desert landscape. Clean lines and expansive glass capture the dramatic Arizona sky and mountain vistas from every room.",
    features: [
      "Desert landscape design",
      "Reflecting pool",
      "Open-plan living",
      "Mountain views",
      "Outdoor lounge area",
      "Natural stone walls",
    ],
    amenities: [
      "Pool and spa",
      "Casita guest house",
      "4-car garage",
      "Putting green",
      "Outdoor fireplace",
      "Rainwater harvesting",
    ],
    images: [
      img("1706808849780-7a04fbac83ef"),
      img("1600585154340-be6161a56a0c"),
      img("1600210492486-724fe5c67fb0"),
      img("1512917774080-9991f1c4c750"),
    ],
    agent: {
      name: "James Wilson",
      role: "Investment Consultant",
      phone: "(555) 246-7892",
      email: "james@horizonproperties.com",
      photo: img("1500648767791-00dcc994a43e", 400),
    },
  },
  {
    id: "4",
    slug: "oceanfront-residence",
    name: "Oceanfront Residence",
    location: "Miami, Florida, USA",
    city: "Miami",
    state: "Florida",
    country: "USA",
    price: 5200000,
    priceFormatted: "$5.2 Million",
    type: "Residence",
    bedrooms: 7,
    bathrooms: 6,
    area: 7800,
    areaFormatted: "7,800 sq ft",
    featured: true,
    description:
      "A bold oceanfront statement with uninterrupted Atlantic views. The residence features a dramatic double-height entry, a rooftop terrace with sunset lounge, and direct beach access through a private garden.",
    features: [
      "Direct beach access",
      "Rooftop sunset terrace",
      "Double-height entry",
      "Private garden",
      "Oceanfront pool",
      "Summer kitchen",
    ],
    amenities: [
      "Elevator",
      "Wine cellar",
      "Home theater",
      "Gym",
      "Staff quarters",
      "Smart security",
    ],
    images: [
      img("1670589953882-b94c9cb380f5"),
      img("1605276374104-dee2a0ed3cd6"),
      img("1600596542815-ffad4c1539a9"),
      img("1600210492486-724fe5c67fb0"),
    ],
    agent: {
      name: "Sophia Bennett",
      role: "Senior Property Specialist",
      phone: "(555) 246-7893",
      email: "sophia@horizonproperties.com",
      photo: img("1438761681033-6461ffad8d80", 400),
    },
  },
  {
    id: "5",
    slug: "modern-hillside-retreat",
    name: "Modern Hillside Retreat",
    location: "Los Angeles, California, USA",
    city: "Los Angeles",
    state: "California",
    country: "USA",
    price: 3750000,
    priceFormatted: "$3.75 Million",
    type: "House",
    bedrooms: 4,
    bathrooms: 4,
    area: 4800,
    areaFormatted: "4,800 sq ft",
    featured: false,
    description:
      "Nestled in the Hollywood Hills, this retreat offers sweeping city views through walls of glass. The design blends warm wood tones with polished concrete, creating a sophisticated yet welcoming atmosphere.",
    features: [
      "City light views",
      "Walls of glass",
      "Open living area",
      "Terraced garden",
      "Pool and deck",
      "Home office",
    ],
    amenities: [
      "Media room",
      "Bar area",
      "2-car garage",
      "Yoga deck",
      "Fire pit",
      "EV charging",
    ],
    images: [
      img("1600585154340-be6161a56a0c"),
      img("1706808849780-7a04fbac83ef"),
      img("1512917774080-9991f1c4c750"),
      img("1670589953882-b94c9cb380f5"),
    ],
    agent: {
      name: "Daniel Morgan",
      role: "Managing Director",
      phone: "(555) 246-7890",
      email: "daniel@horizonproperties.com",
      photo: img("1507003211169-0a1dd7228f2d", 400),
    },
  },
  {
    id: "6",
    slug: "palm-garden-residence",
    name: "Palm Garden Residence",
    location: "Beverly Hills, California, USA",
    city: "Beverly Hills",
    state: "California",
    country: "USA",
    price: 6400000,
    priceFormatted: "$6.4 Million",
    type: "Estate",
    bedrooms: 8,
    bathrooms: 7,
    area: 9200,
    areaFormatted: "9,200 sq ft",
    featured: false,
    description:
      "An iconic Beverly Hills estate surrounded by mature palms and manicured gardens. The residence exudes timeless luxury with grand proportions, a resort-style pool, and a primary suite that rivals a five-star suite.",
    features: [
      "Resort-style pool",
      "Mature palm gardens",
      "Grand primary suite",
      "Formal dining room",
      "Library",
      "Guest house",
    ],
    amenities: [
      "Home theater",
      "Wine cellar",
      "Gym and spa",
      "4-car garage",
      "Tennis court",
      "Smart home system",
    ],
    images: [
      img("1600596542815-ffad4c1539a9"),
      img("1600210492486-724fe5c67fb0"),
      img("1605276374104-dee2a0ed3cd6"),
      img("1706808849780-7a04fbac83ef"),
    ],
    agent: {
      name: "Olivia Carter",
      role: "Luxury Property Advisor",
      phone: "(555) 246-7891",
      email: "olivia@horizonproperties.com",
      photo: img("1494790108377-be9c29b29330", 400),
    },
  },
  {
    id: "7",
    slug: "contemporary-lake-house",
    name: "Contemporary Lake House",
    location: "Lake Tahoe, Nevada, USA",
    city: "Lake Tahoe",
    state: "Nevada",
    country: "USA",
    price: 2950000,
    priceFormatted: "$2.95 Million",
    type: "House",
    bedrooms: 4,
    bathrooms: 3,
    area: 3800,
    areaFormatted: "3,800 sq ft",
    featured: false,
    description:
      "A serene lakefront home where modern design meets natural beauty. Expansive windows frame the crystal-clear waters of Lake Tahoe, while warm interiors with stone fireplaces create a cozy year-round retreat.",
    features: [
      "Lakefront location",
      "Stone fireplaces",
      "Expansive windows",
      "Wraparound deck",
      "Private dock",
      "Hot tub",
    ],
    amenities: [
      "Sauna",
      "Boot room",
      "2-car garage",
      "Storage room",
      "Heated driveway",
      "Generator",
    ],
    images: [
      img("1706808849780-7a04fbac83ef"),
      img("1600585154340-be6161a56a0c"),
      img("1670589953882-b94c9cb380f5"),
      img("1512917774080-9991f1c4c750"),
    ],
    agent: {
      name: "James Wilson",
      role: "Investment Consultant",
      phone: "(555) 246-7892",
      email: "james@horizonproperties.com",
      photo: img("1500648767791-00dcc994a43e", 400),
    },
  },
  {
    id: "8",
    slug: "architectural-downtown-penthouse",
    name: "Architectural Downtown Penthouse",
    location: "Austin, Texas, USA",
    city: "Austin",
    state: "Texas",
    country: "USA",
    price: 1850000,
    priceFormatted: "$1.85 Million",
    type: "Penthouse",
    bedrooms: 3,
    bathrooms: 3,
    area: 2800,
    areaFormatted: "2,800 sq ft",
    featured: false,
    description:
      "A full-floor penthouse in the heart of downtown Austin with 360-degree city views. The interior features custom millwork, a designer kitchen, and a private rooftop terrace perfect for entertaining.",
    features: [
      "360-degree city views",
      "Private rooftop terrace",
      "Designer kitchen",
      "Custom millwork",
      "Floor-to-ceiling windows",
      "Primary suite with city view",
    ],
    amenities: [
      "Concierge service",
      "Fitness center",
      "Pool and spa",
      "Valet parking",
      "Wine storage",
      "Pet spa",
    ],
    images: [
      img("1600210492486-724fe5c67fb0"),
      img("1670589953882-b94c9cb380f5"),
      img("1600596542815-ffad4c1539a9"),
      img("1600585154340-be6161a56a0c"),
    ],
    agent: {
      name: "Sophia Bennett",
      role: "Senior Property Specialist",
      phone: "(555) 246-7893",
      email: "sophia@horizonproperties.com",
      photo: img("1438761681033-6461ffad8d80", 400),
    },
  },
];

export const getPropertyBySlug = (slug: string) =>
  properties.find((p) => p.slug === slug);

export const getPropertyById = (id: string) =>
  properties.find((p) => p.id === id);

export const getSimilarProperties = (property: Property, count = 3) =>
  properties.filter((p) => p.id !== property.id).slice(0, count);

export const propertyTypes = ["All", "Villa", "House", "Penthouse", "Estate", "Residence"];
export const locations = ["All", "Austin", "Malibu", "Scottsdale", "Miami", "Los Angeles", "Beverly Hills", "Lake Tahoe"];
export const priceRanges = [
  { label: "All Prices", min: 0, max: Infinity },
  { label: "Under $3M", min: 0, max: 2999999 },
  { label: "$3M – $5M", min: 3000000, max: 4999999 },
  { label: "$5M – $7M", min: 5000000, max: 6999999 },
  { label: "$7M+", min: 7000000, max: Infinity },
];
