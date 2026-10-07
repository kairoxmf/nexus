export interface Property {
  slug: string;
  name: string;
  location: string;
  region: string;
  price: number;
  type: string;
  beds: number;
  baths: number;
  sqft: number;
  year: number;
  featured: boolean;
  tagline: string;
  description: string[];
  features: string[];
  amenities: string[];
  images: string[];
  agentId: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  linkedin: string;
  photo: string;
}

export interface Service {
  title: string;
  description: string;
}

export interface Stat {
  value: string;
  label: string;
}

const img = (id: string, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const HERO_IMAGE = img("1613490493576-7fde63acd811", 2000);

export const ABOUT_IMAGES = {
  main: img("1600596542815-ffad4c1539a9", 1200),
  side: img("1580587771525-78b9dba3b914", 800),
};

export const ABOUT_PAGE_IMAGES = {
  main: img("1600585154340-be6161a56a0c", 1400),
  side: img("1600607687920-4e2a09cf159d", 800),
};

export const PHONE = "(555) 246-7890";
export const PHONE_HREF = "tel:+15552467890";
export const EMAIL = "hello@horizonproperties.com";
export const ADDRESS = "1200 Congress Avenue, Suite 400, Austin, TX 78701";

export const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Properties", to: "/properties" },
  { label: "About Us", to: "/about" },
  { label: "Services", to: "/services" },
  { label: "Team", to: "/team" },
  { label: "Contact", to: "/contact" },
];

export const TEAM: TeamMember[] = [
  {
    id: "daniel-morgan",
    name: "Daniel Morgan",
    role: "Managing Director",
    email: "daniel@horizonproperties.com",
    phone: "(555) 246-7891",
    linkedin: "https://www.linkedin.com",
    photo: img("1560250097-0b93528c311a", 700),
  },
  {
    id: "olivia-carter",
    name: "Olivia Carter",
    role: "Luxury Property Advisor",
    email: "olivia@horizonproperties.com",
    phone: "(555) 246-7892",
    linkedin: "https://www.linkedin.com",
    photo: img("1573496359142-b8d87734a5a2", 700),
  },
  {
    id: "james-wilson",
    name: "James Wilson",
    role: "Investment Consultant",
    email: "james@horizonproperties.com",
    phone: "(555) 246-7893",
    linkedin: "https://www.linkedin.com",
    photo: img("1507003211169-0a1dd7228f2d", 700),
  },
  {
    id: "sophia-bennett",
    name: "Sophia Bennett",
    role: "Senior Property Specialist",
    email: "sophia@horizonproperties.com",
    phone: "(555) 246-7894",
    linkedin: "https://www.linkedin.com",
    photo: img("1573497019940-1c28c88b4f3e", 700),
  },
];

export const SERVICES: Service[] = [
  {
    title: "Luxury Home Sales",
    description:
      "Private, end-to-end representation for buyers and sellers of architecturally significant homes — from first viewing to final signature.",
  },
  {
    title: "Property Investment",
    description:
      "Data-driven acquisition strategies across residential and income-producing assets, tailored to your risk profile and horizon.",
  },
  {
    title: "Property Marketing",
    description:
      "Cinematic photography, film, staging and targeted placement that position every listing to its most qualified audience.",
  },
  {
    title: "Real Estate Advisory",
    description:
      "Independent, conflict-free counsel on market timing, portfolio balance and long-term value for discerning clients.",
  },
  {
    title: "Property Valuation",
    description:
      "Precise, defensible valuations built on comparable analysis, local insight and years of transaction data.",
  },
  {
    title: "Relocation Services",
    description:
      "Concierge relocation for executives and families — schools, neighborhoods, logistics and settling-in handled end to end.",
  },
];

export const STATS: Stat[] = [
  { value: "$2.4B+", label: "Total sales volume" },
  { value: "480+", label: "Properties sold" },
  { value: "98%", label: "Client satisfaction" },
  { value: "18", label: "Industry awards" },
];

export const WHY_POINTS = [
  {
    title: "Off-market access",
    description: "A private network of listings that never reach the open market.",
  },
  {
    title: "Investment-grade insight",
    description: "Every recommendation is backed by data, not intuition.",
  },
  {
    title: "White-glove service",
    description: "One dedicated advisor from first call to beyond closing day.",
  },
];

export const PROPERTIES: Property[] = [
  {
    slug: "lakeside-modern-villa",
    name: "Lakeside Modern Villa",
    location: "Austin, Texas, USA",
    region: "Austin",
    price: 2350000,
    type: "Villa",
    beds: 5,
    baths: 6,
    sqft: 6800,
    year: 2021,
    featured: true,
    tagline: "Glass-wrapped lakefront living with resort-grade amenities.",
    description: [
      "Set on a private lakeside promontory, this modern villa dissolves the boundary between architecture and landscape. Full-height sliding glass walls open the main living spaces to an infinity pool that appears to pour directly into the water beyond.",
      "The interior is finished in warm oak, honed limestone and bronze detailing, with a chef's kitchen, wine room and a primary suite positioned to capture sunrise over the lake. A guest wing, home office and four-car gallery garage complete the plan.",
    ],
    features: [
      "Infinity-edge pool with lake views",
      "Floor-to-ceiling glass walls",
      "Chef's kitchen with butler's pantry",
      "Temperature-controlled wine room",
      "Private dock and boathouse",
      "Whole-home smart automation",
    ],
    amenities: ["Infinity pool", "Home theater", "Wine cellar", "Gym & spa", "Private dock", "3-car garage", "Smart home", "Outdoor kitchen"],
    images: [
      img("1613490493576-7fde63acd811"),
      img("1600596542815-ffad4c1539a9"),
      img("1600607687939-ce8a6c25118c"),
      img("1600566753190-17f0baa2a6c3"),
      img("1560448204-e02f11c3d0e2"),
    ],
    agentId: "daniel-morgan",
  },
  {
    slug: "pacific-glass-house",
    name: "Pacific Glass House",
    location: "Malibu, California, USA",
    region: "Malibu",
    price: 4800000,
    type: "Villa",
    beds: 6,
    baths: 7,
    sqft: 9200,
    year: 2022,
    featured: true,
    tagline: "A cliffside composition of glass, steel and Pacific light.",
    description: [
      "Perched above the Pacific, the Glass House is a study in restraint: a single horizontal volume of glass and steel that frames the ocean from every room. Retracting walls of glass merge the great room with a limestone terrace and heated saltwater pool.",
      "Interiors by a celebrated design studio pair bleached oak with architectural concrete, while the lower level hosts a screening room, wellness suite and direct beach path.",
    ],
    features: [
      "Uninterrupted ocean panoramas",
      "Retractable glass wall system",
      "Heated saltwater pool",
      "Private beach access",
      "Screening room & wellness suite",
      "Architect-designed interiors",
    ],
    amenities: ["Ocean views", "Saltwater pool", "Home theater", "Spa & sauna", "Beach access", "Outdoor lounge", "Smart home", "Guest suite"],
    images: [
      img("1512917774080-9991f1c4c750"),
      img("1600585154340-be6161a56a0c"),
      img("1600607687920-4e2a09cf159d"),
      img("1600566753086-00f18fb6b3ea"),
      img("1600121848594-d8644e57abab"),
    ],
    agentId: "olivia-carter",
  },
  {
    slug: "desert-horizon-estate",
    name: "Desert Horizon Estate",
    location: "Scottsdale, Arizona, USA",
    region: "Scottsdale",
    price: 3150000,
    type: "Estate",
    beds: 5,
    baths: 5,
    sqft: 7400,
    year: 2020,
    featured: true,
    tagline: "Desert modernism framed by mountains and endless sky.",
    description: [
      "Inspired by the desert modernists, this estate stretches low and long across its parcel, anchoring itself in the terrain with rammed-earth walls and deep overhangs. The west-facing great room captures the full theatre of Arizona sunsets.",
      "Outside, a negative-edge pool mirrors the mountains, framed by mature cacti and a sculptural fire pit court. The estate includes a casita, glass-walled fitness studio and solar array.",
    ],
    features: [
      "Negative-edge pool with mountain views",
      "Rammed-earth architectural walls",
      "Detached guest casita",
      "Glass-walled fitness studio",
      "Solar array & energy storage",
      "Sculptural fire pit court",
    ],
    amenities: ["Mountain views", "Pool & spa", "Casita", "Fitness studio", "Solar power", "Fire pit", "Outdoor dining", "Gated entry"],
    images: [
      img("1580587771525-78b9dba3b914"),
      img("1613977257592-4871e5fcd7c4"),
      img("1600047509807-ba8f99d2cdde"),
      img("1600585154084-4e5fe7c39198"),
      img("1600607686527-6fb886090705"),
    ],
    agentId: "james-wilson",
  },
  {
    slug: "oceanfront-residence",
    name: "Oceanfront Residence",
    location: "Miami, Florida, USA",
    region: "Miami",
    price: 5200000,
    type: "Estate",
    beds: 6,
    baths: 7,
    sqft: 10500,
    year: 2023,
    featured: true,
    tagline: "A grand coastal estate steps from the Atlantic.",
    description: [
      "This newly completed oceanfront residence pairs resort-scale living with contemporary coastal design. A double-height entry gallery opens to symmetrical living spaces, each oriented toward the water through walls of hurricane-rated glass.",
      "The second level is devoted to the primary wing with a private ocean terrace, while amenities include a resort pool, summer kitchen, elevator and a rooftop deck with 360-degree views.",
    ],
    features: [
      "Direct ocean frontage",
      "Hurricane-rated glass walls",
      "Resort pool with sun shelf",
      "Private elevator",
      "Rooftop deck with 360° views",
      "Summer kitchen & loggia",
    ],
    amenities: ["Ocean frontage", "Resort pool", "Elevator", "Rooftop deck", "Summer kitchen", "Home theater", "Gym", "Smart home"],
    images: [
      img("1564013799919-ab600027ffc6"),
      img("1600566753376-12c8ab7fb75b"),
      img("1613977257363-707ba9348227"),
      img("1600585152915-d208bec867a1"),
      img("1567767292278-a4f21aa2d36e"),
    ],
    agentId: "sophia-bennett",
  },
  {
    slug: "modern-hillside-retreat",
    name: "Modern Hillside Retreat",
    location: "Los Angeles, California, USA",
    region: "Los Angeles",
    price: 3750000,
    type: "House",
    beds: 4,
    baths: 4,
    sqft: 5600,
    year: 2019,
    featured: true,
    tagline: "Cantilevered calm above the canyon, minutes from the city.",
    description: [
      "Cantilevered over its canyon setting, this retreat offers total privacy without sacrificing proximity. Its layered volumes step down the hillside, ending in a glass-edged pool deck that floats above the tree line.",
      "Warm plaster, smoked oak and blackened steel give the interiors a quiet gallery feel. A detached studio is ideal for work, media or guests.",
    ],
    features: [
      "Cantilevered pool deck",
      "Canyon and city-light views",
      "Detached creative studio",
      "Gallery-style interiors",
      "Outdoor shower & sauna",
      "Fully automated lighting scenes",
    ],
    amenities: ["Canyon views", "Floating pool", "Studio", "Sauna", "Smart lighting", "Outdoor dining", "2-car garage", "Gated entry"],
    images: [
      img("1600585152915-d208bec867a1"),
      img("1600047509358-9dc75507daeb"),
      img("1600607686527-6fb886090705"),
      img("1600585154526-990dced4db0d"),
      img("1522708323590-d24dbb6b0267"),
    ],
    agentId: "olivia-carter",
  },
  {
    slug: "palm-garden-residence",
    name: "Palm Garden Residence",
    location: "Beverly Hills, California, USA",
    region: "Beverly Hills",
    price: 6400000,
    type: "Estate",
    beds: 7,
    baths: 9,
    sqft: 12800,
    year: 2024,
    featured: false,
    tagline: "A gated estate of palms, pools and quiet grandeur.",
    description: [
      "Behind private gates, this residence balances classical proportion with modern ease. Mature palms line the motor court, and the grand living spaces flow onto a colonnaded terrace overlooking the pool and lawns.",
      "The residence offers a double-island kitchen, screening room, wine gallery, wellness floor and staff quarters, all finished to an uncompromising standard.",
    ],
    features: [
      "Gated motor court",
      "Colonnaded pool terrace",
      "Double-island chef's kitchen",
      "Screening room & wine gallery",
      "Wellness floor & spa",
      "Staff quarters",
    ],
    amenities: ["Gated estate", "Pool & spa", "Home theater", "Wine gallery", "Gym", "Elevator", "Motor court", "Staff quarters"],
    images: [
      img("1600566752355-35792bedcfea"),
      img("1567767292278-a4f21aa2d36e"),
      img("1600607688969-a5bfcd646154"),
      img("1600566753086-00f18fb6b3ea"),
      img("1600607687644-c7171b42498f"),
    ],
    agentId: "daniel-morgan",
  },
  {
    slug: "contemporary-lake-house",
    name: "Contemporary Lake House",
    location: "Lake Tahoe, Nevada, USA",
    region: "Lake Tahoe",
    price: 2950000,
    type: "House",
    beds: 4,
    baths: 3,
    sqft: 4900,
    year: 2018,
    featured: false,
    tagline: "Timber, stone and glass tuned to four-season living.",
    description: [
      "A contemporary take on the lake house: douglas-fir beams, fieldstone chimneys and walls of glass that frame the water and surrounding pines. Ski-in access in winter, dock life in summer.",
      "The open-plan great room centers on a two-sided stone fireplace, and the primary suite occupies its own wing with a private lake-view balcony.",
    ],
    features: [
      "Lake views from every level",
      "Two-sided stone fireplace",
      "Private dock & ski access",
      "Primary suite with balcony",
      "Bunk room for guests",
      "Mudroom & gear storage",
    ],
    amenities: ["Lake views", "Private dock", "Fireplace", "Hot tub", "Ski access", "Bunk room", "Outdoor fire pit", "Heated drive"],
    images: [
      img("1600585154084-4e5fe7c39198"),
      img("1600047509807-ba8f99d2cdde"),
      img("1600121848594-d8644e57abab"),
      img("1600585154526-990dced4db0d"),
      img("1600210491369-e753d80a41f3"),
    ],
    agentId: "james-wilson",
  },
  {
    slug: "architectural-downtown-penthouse",
    name: "Architectural Downtown Penthouse",
    location: "Austin, Texas, USA",
    region: "Austin",
    price: 1850000,
    type: "Penthouse",
    beds: 3,
    baths: 3,
    sqft: 3800,
    year: 2022,
    featured: false,
    tagline: "Full-floor penthouse living above the city skyline.",
    description: [
      "Occupying an entire floor, this penthouse wraps its occupants in skyline views through wraparound glass. The plan is efficient and elegant: a great room with a sculptural kitchen, three suites and a terrace designed for evening entertaining.",
      "Building amenities include concierge, a rooftop residents' lounge and a 24-hour fitness floor, all steps from the city's best dining.",
    ],
    features: [
      "Full-floor, wraparound glass",
      "Panoramic skyline views",
      "Sculptural open kitchen",
      "Private entertainer's terrace",
      "Concierge & residents' lounge",
      "Two deeded parking suites",
    ],
    amenities: ["Skyline views", "Private terrace", "Concierge", "Residents' lounge", "Fitness floor", "Smart home", "2 parking suites", "Storage"],
    images: [
      img("1522708323590-d24dbb6b0267"),
      img("1600607687644-c7171b42498f"),
      img("1600210491369-e753d80a41f3"),
      img("1600607688066-890987f18a86"),
      img("1560448204-e02f11c3d0e2"),
    ],
    agentId: "sophia-bennett",
  },
];

export const PROPERTY_TYPES = [...new Set(PROPERTIES.map((p) => p.type))];

export function formatPrice(price: number): string {
  const m = price / 1_000_000;
  return `$${parseFloat(m.toFixed(2))} Million`;
}

export function formatPriceShort(price: number): string {
  return `$${parseFloat((price / 1_000_000).toFixed(2))}M`;
}

export function getPropertyAgent(property: Property): TeamMember {
  return TEAM.find((t) => t.id === property.agentId) ?? TEAM[0];
}

export function getSimilarProperties(property: Property, count = 3): Property[] {
  return PROPERTIES.filter((p) => p.slug !== property.slug)
    .sort((a, b) => {
      const score = (q: Property) =>
        (q.type === property.type ? 2 : 0) + (q.region === property.region ? 1 : 0);
      return score(b) - score(a) || Math.abs(a.price - property.price) - Math.abs(b.price - property.price);
    })
    .slice(0, count);
}
