export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  photo: string;
  phone: string;
  email: string;
}

export interface WhyChooseItem {
  id: string;
  title: string;
  description: string;
  stat: string;
  statLabel: string;
}

const img = (id: string, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const services: Service[] = [
  {
    id: "luxury-sales",
    title: "Luxury Home Sales",
    description: "Curated sales of exceptional properties, marketed to qualified buyers worldwide.",
    icon: "home",
  },
  {
    id: "investment",
    title: "Property Investment",
    description: "Strategic investment guidance backed by deep market analysis and trend forecasting.",
    icon: "trending-up",
  },
  {
    id: "marketing",
    title: "Property Marketing",
    description: "Editorial-grade photography, film, and digital campaigns that elevate every listing.",
    icon: "camera",
  },
  {
    id: "advisory",
    title: "Real Estate Advisory",
    description: "Personalized advisory for buying, selling, and portfolio building with full transparency.",
    icon: "compass",
  },
  {
    id: "valuation",
    title: "Property Valuation",
    description: "Precise, market-driven valuations grounded in comparable data and local expertise.",
    icon: "calculator",
  },
  {
    id: "relocation",
    title: "Relocation Services",
    description: "Seamless relocation support, from neighborhood discovery to move-in day.",
    icon: "map-pin",
  },
];

export const team: TeamMember[] = [
  {
    id: "1",
    name: "Daniel Morgan",
    role: "Managing Director",
    photo: img("1507003211169-0a1dd7228f2d", 600),
    phone: "(555) 246-7890",
    email: "daniel@horizonproperties.com",
  },
  {
    id: "2",
    name: "Olivia Carter",
    role: "Luxury Property Advisor",
    photo: img("1494790108377-be9c29b29330", 600),
    phone: "(555) 246-7891",
    email: "olivia@horizonproperties.com",
  },
  {
    id: "3",
    name: "James Wilson",
    role: "Investment Consultant",
    photo: img("1500648767791-00dcc994a43e", 600),
    phone: "(555) 246-7892",
    email: "james@horizonproperties.com",
  },
  {
    id: "4",
    name: "Sophia Bennett",
    role: "Senior Property Specialist",
    photo: img("1438761681033-6461ffad8d80", 600),
    phone: "(555) 246-7893",
    email: "sophia@horizonproperties.com",
  },
];

export const whyChoose: WhyChooseItem[] = [
  {
    id: "experience",
    title: "Decades of Expertise",
    description: "Over 20 years guiding clients through the most significant real estate decisions of their lives.",
    stat: "20+",
    statLabel: "Years of Experience",
  },
  {
    id: "portfolio",
    title: "Curated Portfolio",
    description: "Every property in our portfolio is hand-selected for architectural merit and investment value.",
    stat: "500+",
    statLabel: "Properties Sold",
  },
  {
    id: "global",
    title: "Global Network",
    description: "Our reach connects qualified buyers and sellers across international markets and time zones.",
    stat: "30+",
    statLabel: "Countries Served",
  },
  {
    id: "client",
    title: "Client-First Philosophy",
    description: "We measure success by client satisfaction, not transactions. Integrity is non-negotiable.",
    stat: "98%",
    statLabel: "Client Satisfaction",
  },
];

export const heroImage = img("1722421492323-eaf9c401befe", 2400);
export const aboutMainImage = img("1706808849780-7a04fbac83ef", 1200);
export const aboutSecondaryImage = img("1600585154340-be6161a56a0c", 800);
