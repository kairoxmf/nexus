/**
 * Central content layer for Built Right Construction.
 * Plain typed data — swap for an API/DB later without touching the UI.
 */

export interface Project {
  slug: string;
  title: string;
  category: string;
  industry: string;
  location: string;
  year: number;
  sqft: string;
  sizeValue: number; // numeric sqft for sorting/filtering
  image: string;
  gallery: string[];
  featured: boolean;
  description: string;
  scope: string[];
  challenges: string;
  solutions: string;
  client: string;
  architect: string;
  duration: string;
}

export interface Service {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  long: string;
  image: string;
  icon: string;
  features: string[];
}

export interface Industry {
  slug: string;
  name: string;
  description: string;
  image: string;
  icon: string;
  capabilities: string[];
}

export interface TeamMember {
  name: string;
  role: string;
  image: string;
  linkedin: string;
}

export interface Post {
  slug: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  excerpt: string;
  image: string;
  body: string[];
}

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
}

export interface Stat {
  value: number;
  suffix: string;
  label: string;
  icon: string;
}

const img = (id: string, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

/* ------------------------------------------------------------------ */
/* Brand & contact                                                     */
/* ------------------------------------------------------------------ */

export const BRAND = {
  name: "BUILT RIGHT",
  sub: "CONSTRUCTION",
  phone: "(800) 123-4567",
  phoneHref: "tel:+18001234567",
  email: "info@builtright.com",
  address1: "123 Construction Way",
  address2: "New York, NY 10001",
};

export const TOPBAR = {
  highlights: ["30+ Years of Excellence", "500+ Projects Completed", "Safety First, Always"],
};

export const PARTNERS = ["AECOM", "Turner", "DPR", "CLARK", "SKANSKA"];

export const STATS: Stat[] = [
  { value: 30, suffix: "+", label: "Years Experience", icon: "award" },
  { value: 500, suffix: "+", label: "Projects Completed", icon: "briefcase" },
  { value: 250, suffix: "+", label: "Skilled Professionals", icon: "users" },
  { value: 100, suffix: "%", label: "Safety Commitment", icon: "shield" },
];

/* ------------------------------------------------------------------ */
/* Navigation                                                          */
/* ------------------------------------------------------------------ */

export interface NavLink {
  label: string;
  to: string;
  children?: { label: string; to: string }[];
}

/* ------------------------------------------------------------------ */
/* Projects                                                            */
/* ------------------------------------------------------------------ */

export const PROJECTS: Project[] = [
  {
    slug: "metro-office-complex",
    title: "Metro Office Complex",
    category: "Commercial",
    industry: "Commercial",
    location: "New York, USA",
    year: 2024,
    sqft: "50,000 Sq Ft",
    sizeValue: 50000,
    image: img("1486406146926-c627a92ad1ab", 1400),
    gallery: [
      img("1486406146926-c627a92ad1ab", 1600),
      img("1431540015161-0bf868a2d407", 1600),
      img("1449157291145-7efd050a4d0e", 1600),
      img("1527576539890-dfa815648363", 1600),
    ],
    featured: true,
    description:
      "A 14-storey Class-A office complex in the heart of Manhattan, engineered for the next generation of workspace. The tower pairs a high-performance glass curtain wall with an efficient steel structure, delivering open, daylit floors with LEED Gold certification.",
    scope: [
      "Full structural steel erection and concrete core construction",
      "High-performance curtain wall design-assist and installation",
      "MEP systems coordination and vertical transportation",
      "LEED Gold sustainability strategy and commissioning",
      "Tenant fit-out for six anchor occupants",
    ],
    challenges:
      "The site sits on a tight urban block with zero lay-down area, directly above active transit infrastructure. Concrete pours had to be scheduled around transit authority curfews while maintaining a 26-month schedule.",
    solutions:
      "We implemented a just-in-time delivery logistics plan with off-site prefabrication of mechanical racks and facade units. Night-time hoisting windows and a real-time logistics dashboard kept every trade moving without violating curfews.",
    client: "Metro Development Partners",
    architect: "Studio Meridian Architects",
    duration: "26 months",
  },
  {
    slug: "luxury-villa-bel-air",
    title: "Luxury Villa",
    category: "Residential",
    industry: "Residential",
    location: "Los Angeles, USA",
    year: 2024,
    sqft: "8,200 Sq Ft",
    sizeValue: 8200,
    image: img("1613490493576-7fde63acd811", 1400),
    gallery: [
      img("1613490493576-7fde63acd811", 1600),
      img("1600585154340-be6161a56a0c", 1600),
      img("1600607687939-ce8a6c25118c", 1600),
      img("1600566753190-17f0baa2a6c3", 1600),
    ],
    featured: true,
    description:
      "A private hillside residence with cantilevered living spaces, a floating infinity pool and panoramic glass walls framing the canyon. Craft-level detailing in stone, oak and architectural steel throughout.",
    scope: [
      "Hillside grading, shoring and foundation engineering",
      "Custom structural steel and cantilever fabrication",
      "Full interior build with bespoke millwork",
      "Infinity pool, landscape and outdoor living construction",
      "Smart-home integration and energy systems",
    ],
    challenges:
      "A 30-degree slope, restricted access for large deliveries and a design that demanded 6-metre unsupported glass spans pushed both engineering and logistics.",
    solutions:
      "Helicopter-assisted placement for the pool shell, phased road closures negotiated with the city, and a concealed steel moment frame engineered specifically for the glass spans.",
    client: "Private Client",
    architect: "Atelier Nord Design",
    duration: "18 months",
  },
  {
    slug: "global-logistics-warehouse",
    title: "Global Logistics Warehouse",
    category: "Industrial",
    industry: "Industrial",
    location: "Houston, USA",
    year: 2023,
    sqft: "120,000 Sq Ft",
    sizeValue: 120000,
    image: img("1586528116311-ad8dd3c8310d", 1400),
    gallery: [
      img("1586528116311-ad8dd3c8310d", 1600),
      img("1553413077-190dd305871c", 1600),
      img("1481253127861-534498168948", 1600),
      img("1503174971373-b1f69850bded", 1600),
    ],
    featured: true,
    description:
      "A tilt-wall distribution hub with 40-ft clear heights, 45 dock doors and full automation-ready infrastructure. Delivered two weeks ahead of schedule to meet the client's peak-season go-live.",
    scope: [
      "Site development, utilities and heavy-duty paving",
      "Tilt-wall panel casting, lifting and bracing",
      "Structural steel and TPO roofing systems",
      "ESFR sprinkler, high-bay lighting and power infrastructure",
      "Automation conduit and mezzanine preparation",
    ],
    challenges:
      "A record-wet spring turned the 20-acre site into a logistics problem of its own, threatening both the tilt-casting window and the client's fixed go-live date.",
    solutions:
      "We re-sequenced earthwork into a rolling dewatering plan, cast panels on a raised platform and compressed the erection schedule with a second crew — recovering two full weeks.",
    client: "Meridian Freight Group",
    architect: "Corpus Industrial Design",
    duration: "11 months",
  },
  {
    slug: "heritage-building-renovation",
    title: "Heritage Building Renovation",
    category: "Renovation",
    industry: "Commercial",
    location: "Chicago, USA",
    year: 2023,
    sqft: "35,000 Sq Ft",
    sizeValue: 35000,
    image: img("1622021142947-da7dedc7c39a", 1400),
    gallery: [
      img("1622021142947-da7dedc7c39a", 1600),
      img("1600210492486-724fe5c67fb0", 1600),
      img("1600566752355-35792bedcfea", 1600),
      img("1600585154526-990dced4db0d", 1600),
    ],
    featured: true,
    description:
      "A 1920s landmark reborn as a boutique workspace. Every restoration decision balanced preservation mandates with modern life-safety, accessibility and mechanical requirements.",
    scope: [
      "Historic facade restoration and terra-cotta repair",
      "Full interior demolition and structural reinforcement",
      "New MEP, fire protection and vertical circulation",
      "Custom millwork and period-accurate detailing",
      "Accessibility upgrades throughout",
    ],
    challenges:
      "Concealed deterioration in the original terra-cotta and a structural grid that fought the new open-floor program were discovered mid-demolition.",
    solutions:
      "A dedicated preservation engineering team documented and repaired the facade in situ, while a micro-pile solution carried new loads without altering historic finishes.",
    client: "Lakeshore Heritage Trust",
    architect: "Field & Verne Architects",
    duration: "14 months",
  },
  {
    slug: "summit-medical-center",
    title: "Summit Medical Center Expansion",
    category: "Commercial",
    industry: "Healthcare",
    location: "Boston, USA",
    year: 2024,
    sqft: "85,000 Sq Ft",
    sizeValue: 85000,
    image: img("1487958449943-2429e8be8625", 1400),
    gallery: [
      img("1487958449943-2429e8be8625", 1600),
      img("1508450859948-4e04fabaa4ea", 1600),
      img("1554995207-c18c203602cb", 1600),
      img("1497366216548-37526070297c", 1600),
    ],
    featured: false,
    description:
      "A four-storey surgical and outpatient expansion built on a fully operating hospital campus, with zero unplanned interruptions to clinical operations.",
    scope: [
      "Structural steel framework on an occupied campus",
      "Med-gas, isolation rooms and imaging shielding",
      "Central utility plant tie-ins",
      "Infection-control construction protocol management",
      "Wayfinding, interiors and medical equipment coordination",
    ],
    challenges:
      "Tie-ins to live medical gas and HVAC systems could only happen in two-hour overnight windows approved by the hospital's clinical board.",
    solutions:
      "Every tie-in was rehearsed in a full-scale mock-up and executed with a checklist-driven rapid-response protocol — all 34 tie-ins completed on the first attempt.",
    client: "Summit Health Systems",
    architect: "Halstead Medical Design",
    duration: "22 months",
  },
  {
    slug: "harborview-hotel",
    title: "Harborview Hotel & Residences",
    category: "Commercial",
    industry: "Hospitality",
    location: "Miami, USA",
    year: 2022,
    sqft: "60,000 Sq Ft",
    sizeValue: 60000,
    image: img("1512453979798-5ea266f8880c", 1400),
    gallery: [
      img("1512453979798-5ea266f8880c", 1600),
      img("1600607688969-a5bfcd646154", 1600),
      img("1600573472592-401b489a3cdc", 1600),
      img("1512917774080-9991f1c4c750", 1600),
    ],
    featured: false,
    description:
      "A coastal mixed-use tower combining a 180-key hotel with private residences, delivered with hurricane-rated envelope systems and resort-level interior quality.",
    scope: [
      "Cast-in-place concrete structure with post-tensioned slabs",
      "Hurricane-rated glazing and cladding systems",
      "Waterproofing, balcony assemblies and pool deck",
      "Hotel interiors, F&B fit-out and back-of-house",
      "Rooftop amenity and landscape construction",
    ],
    challenges:
      "A salt-air environment, a demanding coastal inspection regime and three successive storm evacuations compressed the schedule by nine working weeks.",
    solutions:
      "A pre-storm protection protocol, corrosion-specified materials and a recovered night-shift program brought the tower back on schedule without compromising quality.",
    client: "Harborview Hospitality Group",
    architect: "Soline Design Collective",
    duration: "24 months",
  },
  {
    slug: "northgate-retail-plaza",
    title: "Northgate Retail Plaza",
    category: "Commercial",
    industry: "Retail",
    location: "Dallas, USA",
    year: 2022,
    sqft: "45,000 Sq Ft",
    sizeValue: 45000,
    image: img("1494145904049-0dca59b4bbad", 1400),
    gallery: [
      img("1494145904049-0dca59b4bbad", 1600),
      img("1524758631624-e2822e304c36", 1600),
      img("1497366754035-f200968a6e72", 1600),
      img("1554774853-aae0a22c8aa4", 1600),
    ],
    featured: false,
    description:
      "A 12-unit retail plaza with anchor grocery tenant, designed around a pedestrian promenade and delivered tenant-ready with shared parking and utilities infrastructure.",
    scope: [
      "Site civil work, parking and streetscape",
      "Tilt-wall and steel structure across 12 units",
      "Anchor tenant coolers, freezers and utility infrastructure",
      "Facade systems and signage coordination",
      "Tenant improvement build-outs for nine suites",
    ],
    challenges:
      "Nine separate tenant improvement packages ran concurrently, each with its own brand standards, contractors and move-in deadlines.",
    solutions:
      "A single master schedule with per-suite commissioning gates kept every tenant on track — all nine opened within two weeks of each other as planned.",
    client: "Northgate Ventures",
    architect: "Bramwell & Rowe",
    duration: "13 months",
  },
  {
    slug: "riverside-stem-campus",
    title: "Riverside STEM Campus",
    category: "Commercial",
    industry: "Education",
    location: "Seattle, USA",
    year: 2021,
    sqft: "70,000 Sq Ft",
    sizeValue: 70000,
    image: img("1493397212122-2b85dda8106b", 1400),
    gallery: [
      img("1493397212122-2b85dda8106b", 1600),
      img("1486325212027-8081e485255e", 1600),
      img("1486718448742-163732cd1544", 1600),
      img("1518005020951-eccb494ad742", 1600),
    ],
    featured: false,
    description:
      "A mass-timber academic building with exposed CLT ceilings, maker labs and a central atrium — one of the region's first large-scale mass-timber education projects.",
    scope: [
      "Mass timber supply, sequencing and erection",
      "Hybrid steel-and-CLT structural system",
      "Acoustic and fire engineering coordination",
      "High-services labs, maker spaces and atrium build",
      "Native landscape and rainwater garden construction",
    ],
    challenges:
      "Mass timber trades are scarce in the region, and the exposed structure demanded fabrication tolerances far tighter than conventional construction.",
    solutions:
      "We brought the erector on board during design-assist, pre-assembled mock-ups for every connection type, and locked the supply chain nine months ahead of erection.",
    client: "Riverside School District",
    architect: "Larch Studio Architecture",
    duration: "20 months",
  },
];

/* ------------------------------------------------------------------ */
/* Services                                                            */
/* ------------------------------------------------------------------ */

export const SERVICES: Service[] = [
  {
    slug: "commercial-construction",
    title: "Commercial Construction",
    tagline: "Modern, functional and sustainable spaces.",
    description:
      "Office towers, retail centers and mixed-use developments built with precision, from foundation to final fit-out.",
    long: "From urban office towers to neighborhood retail, we deliver commercial environments that work as hard as the businesses inside them. Our teams coordinate complex stakeholder groups, aggressive schedules and occupied-site logistics while holding an uncompromising quality line.",
    image: img("1449157291145-7efd050a4d0e", 1200),
    icon: "building",
    features: [
      "Office and mixed-use developments",
      "Retail centers and plazas",
      "Pre-construction and cost planning",
      "Occupied-site phasing and logistics",
      "Post-occupancy support",
    ],
  },
  {
    slug: "residential-construction",
    title: "Residential Construction",
    tagline: "Custom homes built with care and quality.",
    description:
      "Custom homes and residential communities crafted with architectural sensitivity and uncompromising craftsmanship.",
    long: "A home is the most personal project we build. We pair fine-grained craftsmanship with rigorous engineering — from hillside foundations to bespoke millwork — and keep clients close to the process with transparent schedules and budgets.",
    image: img("1600585154340-be6161a56a0c", 1200),
    icon: "home",
    features: [
      "Custom estate homes",
      "Multi-family communities",
      "Structural engineering for complex sites",
      "Bespoke millwork and finishes",
      "Landscape and outdoor living",
    ],
  },
  {
    slug: "industrial-construction",
    title: "Industrial Construction",
    tagline: "Durable solutions for complex industries.",
    description:
      "Warehouses, manufacturing facilities and logistics hubs engineered for heavy use and long service life.",
    long: "Industrial facilities live or die on clear heights, dock counts and uptime. We build tilt-wall and steel structures with the power, fire protection and automation infrastructure modern operations demand — on schedules measured in months, not years.",
    image: img("1553413077-190dd305871c", 1200),
    icon: "factory",
    features: [
      "Distribution and logistics centers",
      "Manufacturing plants",
      "Cold storage facilities",
      "Heavy-duty paving and utilities",
      "Automation-ready infrastructure",
    ],
  },
  {
    slug: "renovation-remodeling",
    title: "Renovation & Remodeling",
    tagline: "Transforming spaces with precision.",
    description:
      "Full-scale renovations and adaptive reuse that honor a building's character while upgrading every system.",
    long: "Existing buildings hold value — structural, cultural and sentimental. Our renovation teams survey, document and modernize them with surgical care: structural reinforcement, new MEP systems, life-safety upgrades and interiors that respect the original architecture.",
    image: img("1600585154526-990dced4db0d", 1200),
    icon: "wrench",
    features: [
      "Historic restoration and adaptive reuse",
      "Interior and exterior remodeling",
      "Structural repair and reinforcement",
      "System replacements and upgrades",
      "Occupied-space renovation programs",
    ],
  },
  {
    slug: "construction-management",
    title: "Construction Management",
    tagline: "Expert oversight from day one.",
    description:
      "Owner's-rep management that controls cost, schedule and quality across every phase of your project.",
    long: "As your construction manager, we run pre-construction, procurement, scheduling and field supervision as one integrated system. Transparent reporting, value engineering and a single accountable team keep complex projects moving.",
    image: img("1454165804606-c3d57bc86b40", 1200),
    icon: "clipboard",
    features: [
      "Pre-construction and budgeting",
      "Master scheduling and phasing",
      "Procurement and trade management",
      "Quality and safety supervision",
      "Cost control and reporting",
    ],
  },
  {
    slug: "general-contracting",
    title: "General Contracting",
    tagline: "One accountable team, start to finish.",
    description:
      "Complete delivery under a single contract — self-performed concrete, carpentry and management expertise.",
    long: "We self-perform concrete, rough carpentry and drywall, giving us direct control over the trades that drive schedule and quality. The rest is managed through long-term trade partners under one accountable contract.",
    image: img("1541123437800-1bb1317badc2", 1200),
    icon: "contract",
    features: [
      "Self-performed concrete and carpentry",
      "Competitively bid delivery",
      "Permitting and code compliance",
      "Long-term trade partnerships",
      "Single-point accountability",
    ],
  },
  {
    slug: "design-build",
    title: "Design & Build",
    tagline: "One contract. One team. One vision.",
    description:
      "Integrated design and construction under one roof, compressing schedules and eliminating finger-pointing.",
    long: "Design-build aligns architects, engineers and builders around a single contract and a single goal. Early contractor involvement sharpens budgets, shortens schedules and removes the adversarial dynamics that derail traditional delivery.",
    image: img("1555848962-6e79363ec58f", 1200),
    icon: "design",
    features: [
      "Integrated design partnerships",
      "Early cost certainty",
      "Fast-track delivery options",
      "Single-source accountability",
      "Streamlined change management",
    ],
  },
  {
    slug: "infrastructure-development",
    title: "Infrastructure Development",
    tagline: "The groundwork everything else stands on.",
    description:
      "Civil and site infrastructure — utilities, roads and heavy foundations — built to outlast generations.",
    long: "Every landmark project begins below grade. Our civil teams deliver sitework, deep foundations, utility corridors and heavy paving with the surveying precision and geotechnical rigor that infrastructure demands.",
    image: img("1590725140246-20acdee442be", 1200),
    icon: "landmark",
    features: [
      "Sitework and earthmoving",
      "Deep foundations and shoring",
      "Utility corridors and stormwater",
      "Roads and heavy paving",
      "Surveying and geotechnical coordination",
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Industries                                                          */
/* ------------------------------------------------------------------ */

export const INDUSTRIES: Industry[] = [
  {
    slug: "commercial",
    name: "Commercial",
    description:
      "Office towers, corporate campuses and mixed-use developments engineered for the long term.",
    image: img("1486406146926-c627a92ad1ab", 1200),
    icon: "building",
    capabilities: ["Class-A office towers", "Corporate campuses", "Mixed-use developments", "Tenant improvements"],
  },
  {
    slug: "residential",
    name: "Residential",
    description:
      "Custom homes and multi-family communities built with craft-level attention to detail.",
    image: img("1564013799919-ab600027ffc6", 1200),
    icon: "home",
    capabilities: ["Custom estates", "Multi-family housing", "Gated communities", "Residential towers"],
  },
  {
    slug: "industrial",
    name: "Industrial",
    description:
      "Manufacturing, logistics and cold-storage facilities built for heavy use and uptime.",
    image: img("1553413077-190dd305871c", 1200),
    icon: "factory",
    capabilities: ["Logistics hubs", "Manufacturing plants", "Cold storage", "Flex industrial space"],
  },
  {
    slug: "healthcare",
    name: "Healthcare",
    description:
      "Hospitals, clinics and medical offices built to strict clinical and infection-control standards.",
    image: img("1554995207-c18c203602cb", 1200),
    icon: "health",
    capabilities: ["Hospitals and expansions", "Outpatient clinics", "Imaging suites", "Medical office buildings"],
  },
  {
    slug: "hospitality",
    name: "Hospitality",
    description:
      "Hotels and resorts where guest experience, acoustics and schedule discipline define quality.",
    image: img("1600607688969-a5bfcd646154", 1200),
    icon: "hotel",
    capabilities: ["Full-service hotels", "Boutique and resort", "Restaurant fit-out", "Amenity construction"],
  },
  {
    slug: "retail",
    name: "Retail",
    description:
      "Shopping centers and flagship stores built around foot traffic, visibility and speed to open.",
    image: img("1524758631624-e2822e304c36", 1200),
    icon: "retail",
    capabilities: ["Shopping centers", "Flagship stores", "Grocery anchors", "Pop-up and fit-out programs"],
  },
  {
    slug: "education",
    name: "Education",
    description:
      "Schools and university buildings designed for durability, safety and inspired learning.",
    image: img("1493397212122-2b85dda8106b", 1200),
    icon: "school",
    capabilities: ["K-12 campuses", "University buildings", "Labs and maker spaces", "Athletic facilities"],
  },
  {
    slug: "infrastructure",
    name: "Infrastructure",
    description:
      "Civil works, utilities and public projects that communities depend on every day.",
    image: img("1590725140246-20acdee442be", 1200),
    icon: "landmark",
    capabilities: ["Roadways and bridges", "Utility corridors", "Public facilities", "Site development"],
  },
];

/* ------------------------------------------------------------------ */
/* Team                                                                */
/* ------------------------------------------------------------------ */

export const TEAM: TeamMember[] = [
  {
    name: "Michael Anderson",
    role: "Chief Executive Officer",
    image: img("1560250097-0b93528c311a", 800),
    linkedin: "#",
  },
  {
    name: "David Carter",
    role: "Project Director",
    image: img("1500648767791-00dcc994a43e", 800),
    linkedin: "#",
  },
  {
    name: "James Wilson",
    role: "Senior Construction Manager",
    image: img("1472099645785-5658abf4ff4e", 800),
    linkedin: "#",
  },
  {
    name: "Sophia Bennett",
    role: "Architectural Project Manager",
    image: img("1494790108377-be9c29b29330", 800),
    linkedin: "#",
  },
];

/* ------------------------------------------------------------------ */
/* Why choose us                                                       */
/* ------------------------------------------------------------------ */

export const WHY_CHOOSE = [
  { title: "30+ Years Experience", text: "Three decades of projects delivered across every major construction sector.", icon: "award" },
  { title: "Safety First", text: "An industry-leading record built on daily discipline, not slogans.", icon: "shield" },
  { title: "Experienced Professionals", text: "250+ engineers, managers and craftspeople — average tenure of 9 years.", icon: "users" },
  { title: "Quality Materials", text: "Specified, sourced and inspected materials from vetted suppliers only.", icon: "check" },
  { title: "Transparent Process", text: "Open budgets, live schedules and one point of accountability.", icon: "clipboard" },
  { title: "On-Time Delivery", text: "94% of projects completed on or ahead of schedule over the last decade.", icon: "clock" },
  { title: "Certified Professionals", text: "Licensed engineers, certified inspectors and OSHA 30 supervisors on every site.", icon: "badge" },
  { title: "Client-Focused Approach", text: "Decisions made with you, communicated clearly, documented always.", icon: "heart" },
];

/* ------------------------------------------------------------------ */
/* Careers                                                             */
/* ------------------------------------------------------------------ */

export const BENEFITS = [
  "Competitive salary and profit sharing",
  "Full health, dental and vision coverage",
  "401(k) with company match",
  "Paid training and certification support",
  "Company retreats and team events",
  "Wellness program and gym allowance",
  "Tool and equipment allowances",
  "Paid time off and parental leave",
];

export const JOBS: Job[] = [
  {
    id: "senior-project-manager",
    title: "Senior Project Manager",
    department: "Management",
    location: "New York, NY",
    type: "Full-time",
    description:
      "Lead commercial projects from pre-construction through closeout, owning budget, schedule and client relationships.",
  },
  {
    id: "site-superintendent",
    title: "Site Superintendent",
    department: "Field Operations",
    location: "Houston, TX",
    type: "Full-time",
    description:
      "Run day-to-day field operations on industrial projects, coordinating trades and enforcing our safety standards.",
  },
  {
    id: "structural-engineer",
    title: "Structural Engineer",
    department: "Engineering",
    location: "Chicago, IL",
    type: "Full-time",
    description:
      "Design and review structural systems for commercial and industrial buildings in close collaboration with our pre-construction team.",
  },
  {
    id: "estimator",
    title: "Cost Estimator",
    department: "Pre-Construction",
    location: "New York, NY",
    type: "Full-time",
    description:
      "Prepare conceptual and detailed estimates across sectors, supporting pursuit strategy and value engineering.",
  },
  {
    id: "safety-officer",
    title: "Safety Officer",
    department: "Safety",
    location: "Dallas, TX",
    type: "Full-time",
    description:
      "Champion our zero-injury culture across multiple active sites through training, inspection and incident prevention.",
  },
];

/* ------------------------------------------------------------------ */
/* Blog                                                                */
/* ------------------------------------------------------------------ */

export const POSTS: Post[] = [
  {
    slug: "rise-of-sustainable-steel",
    title: "The Rise of Sustainable Steel in Modern Construction",
    category: "Construction",
    date: "Sep 18, 2026",
    readTime: "6 min read",
    excerpt:
      "Electric-arc furnaces and hydrogen trials are rewriting steel's carbon story — here is what it means for your next project.",
    image: img("1481253127861-534498168948", 1200),
    body: [
      "Steel has always been the backbone of commercial construction, but its environmental record has lagged its structural one. That is changing faster than most clients realize.",
      "Electric-arc furnace production — which now accounts for over 70% of domestic structural steel — runs on recycled scrap and increasingly on renewable power. Leading mills report embodied-carbon reductions of more than 60% versus traditional blast-furnace routes.",
      "For project teams, the practical consequence is simple: structural steel framing can now be specified as a low-carbon choice, not a compromise. Environmental Product Declarations are arriving with mill paperwork as standard, and LEED and most municipal codes now reward them.",
      "The next frontier is hydrogen direct reduction, with the first commercial-scale plants expected online within the decade. Early adopters are already reserving capacity through green-steel purchase agreements.",
      "Our advice to developers: engage your fabricator early, ask for EPDs by default, and treat steel selection as a sustainability decision — because your reviewers, investors and tenants already do.",
    ],
  },
  {
    slug: "how-bim-changing-project-delivery",
    title: "How BIM Is Changing the Way Projects Are Delivered",
    category: "Engineering",
    date: "Sep 4, 2026",
    readTime: "5 min read",
    excerpt:
      "Clash detection used to be the headline. Today BIM drives prefabrication, logistics and even facility handover.",
    image: img("1450101499163-c8848c66ca85", 1200),
    body: [
      "A decade ago, building information modeling was sold as a way to catch ducts running through beams. It caught plenty — but the real value turned out to lie downstream.",
      "On our current projects, the model drives prefabrication of mechanical racks, facade units and rebar assemblies. Factory-built components arrive sequenced to the master schedule, compressing on-site labor by double-digit percentages.",
      "Logistics is the quieter revolution. On dense urban sites, four-dimensional models now plan crane picks, lay-down windows and just-in-time deliveries weeks in advance.",
      "Handover completes the loop: clients receive a data-rich model that doubles as their facilities-management system, with every valve, panel and access door documented.",
      "The lesson we share with clients: BIM is not a drawing technology. It is a delivery strategy — and the projects that treat it that way are the ones that finish early.",
    ],
  },
  {
    slug: "zero-injury-culture-safety",
    title: "Zero-Injury Culture: Safety Beyond the Checklist",
    category: "Safety",
    date: "Aug 21, 2026",
    readTime: "4 min read",
    excerpt:
      "Signage doesn't prevent injuries. Ownership, daily habits and empowered crews do. Here's how we build it.",
    image: img("1582268611958-ebfd161ef9cf", 1200),
    body: [
      "Every construction company has a safety program. Far fewer have a safety culture — and the difference shows up in the incident statistics.",
      "Our approach starts with a simple principle: every worker on site has the authority and the obligation to stop unsafe work, no questions asked and no consequences attached.",
      "Daily pre-task planning turns that principle into habit. Each crew reviews the day's hazards in a five-minute huddle, and those huddles feed a living risk register that supervisors review weekly.",
      "Near-miss reporting is treated as a gift, not a black mark. Every report is analyzed for systemic causes, and findings are shared across all active sites within 48 hours.",
      "The results compound quietly: more than 2 million work-hours without a lost-time incident across our active portfolio. Culture, not compliance, did that.",
    ],
  },
  {
    slug: "adaptive-reuse-heritage-buildings",
    title: "Adaptive Reuse: Giving Heritage Buildings a Second Life",
    category: "Architecture",
    date: "Aug 7, 2026",
    readTime: "7 min read",
    excerpt:
      "The greenest building is the one already standing. How modern engineering unlocks century-old structures.",
    image: img("1429497419816-9ca5cfb4571a", 1200),
    body: [
      "Cities are full of handsome, structurally sound buildings waiting for a reason to work again. Adaptive reuse is that reason — and it is having a moment.",
      "The engineering appeal is obvious: the frame, the foundations and the embodied carbon already exist. The challenge is everything hidden behind plaster and terra cotta.",
      "Successful reuse projects begin with exhaustive existing-conditions documentation — laser scanning, selective demolition probes and materials testing — before design decisions are made.",
      "Structural reinforcement has become remarkably elegant: micro-piles, carbon-fiber wrapping and hidden steel allow new loads without erasing historic character.",
      "The reward, for developers and cities alike, is irreplaceable architecture with modern performance — and projects that lease faster than anything newly built nearby.",
    ],
  },
  {
    slug: "inside-our-prefab-workflow",
    title: "Inside Our Prefabrication Workflow",
    category: "Project Insights",
    date: "Jul 24, 2026",
    readTime: "5 min read",
    excerpt:
      "From the model to the factory floor to the crane hook — a look at how prefab actually runs on our projects.",
    image: img("1541123437800-1bb1317badc2", 1200),
    body: [
      "Prefabrication is often described as a technology. On our sites, it is better understood as a scheduling discipline.",
      "It starts in the model: fabrication-ready drawings are extracted at a level of detail conventional design never reaches, with every hanger, sleeve and weld mapped.",
      "The factory takes over. Mechanical racks, facade units and rebar mats are built in parallel with site work, completely removing weather from their critical path.",
      "Delivery is choreographed to the hour. Units arrive tagged to their install sequence, hoisted into place the same day, and signed off by the field crew before the next shipment is triggered.",
      "The measurable results: 30% fewer site labor hours on prefab-heavy systems, dramatically less waste, and — most valuable of all — a schedule with far fewer ways to go wrong.",
    ],
  },
  {
    slug: "construction-industry-outlook-2027",
    title: "Construction Industry Outlook: What 2027 Holds",
    category: "Industry News",
    date: "Jul 10, 2026",
    readTime: "6 min read",
    excerpt:
      "Labor, interest rates, reshoring and mass timber — our take on the forces shaping next year's project pipeline.",
    image: img("1522071820081-009f0129c71c", 1200),
    body: [
      "Every year we sit down with clients, engineers and trade partners to read the road ahead. This year's consensus: change is coming from four directions at once.",
      "Labor remains the defining constraint. The skilled-trades gap is widening, which keeps pushing the industry toward prefabrication, robotics and better retention economics.",
      "Reshoring is redrawing the industrial map. Manufacturing and logistics starts are climbing steadily, driven by supply-chain strategy and incentive programs.",
      "Mass timber is graduating from novelty to mainstream for mid-rise commercial and education work, with codes and supply chains finally catching up.",
      "Our planning advice is consistent: lock trade partners early, design for prefab where the repetition allows it, and treat schedule risk as a design problem — not just a field problem.",
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Navigation (built after content so dropdowns mirror the data)       */
/* ------------------------------------------------------------------ */

const SERVICES_NAV = SERVICES.slice(0, 5).map((s) => ({ label: s.title, to: `/services/${s.slug}` }));
const INDUSTRIES_NAV = INDUSTRIES.slice(0, 5).map((i) => ({ label: i.name, to: `/industries/${i.slug}` }));

export const NAV_LINKS: NavLink[] = [
  { label: "Home", to: "/" },
  { label: "About Us", to: "/about" },
  {
    label: "Services",
    to: "/services",
    children: SERVICES_NAV,
  },
  { label: "Projects", to: "/projects" },
  {
    label: "Industries",
    to: "/industries",
    children: INDUSTRIES_NAV,
  },
  { label: "Careers", to: "/careers" },
  { label: "Blog", to: "/blog" },
  { label: "Contact", to: "/contact" },
];

/* ------------------------------------------------------------------ */
/* Testimonials                                                        */
/* ------------------------------------------------------------------ */

export const TESTIMONIALS = [
  {
    quote:
      "Built Right delivered our headquarters two months early — with zero change-order surprises. Their pre-construction process is the best I've worked with in 20 years.",
    name: "Rachel Torres",
    role: "VP Development, Metro Development Partners",
  },
  {
    quote:
      "They treated our hospital as if their own family were being treated there. Every tie-in, every inspection — flawless coordination with our clinical teams.",
    name: "Dr. Alan Pierce",
    role: "Facilities Director, Summit Health Systems",
  },
  {
    quote:
      "From the first survey to the final walkthrough, communication was proactive and precise. The craftsmanship in our home exceeds every expectation.",
    name: "Private Client",
    role: "Luxury Villa, Bel Air",
  },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

export const getProject = (slug: string) => PROJECTS.find((p) => p.slug === slug);
export const getService = (slug: string) => SERVICES.find((s) => s.slug === slug);
export const getIndustry = (slug: string) => INDUSTRIES.find((i) => i.slug === slug);
export const getPost = (slug: string) => POSTS.find((p) => p.slug === slug);

export const PROJECT_CATEGORIES = ["All", ...Array.from(new Set(PROJECTS.map((p) => p.category)))];
export const PROJECT_INDUSTRIES = ["All", ...Array.from(new Set(PROJECTS.map((p) => p.industry)))];
export const PROJECT_LOCATIONS = ["All", ...Array.from(new Set(PROJECTS.map((p) => p.location.split(", ")[1])))];
export const PROJECT_YEARS = ["All", ...Array.from(new Set(PROJECTS.map((p) => String(p.year)))).sort().reverse()];
export const PROJECT_SIZES = ["All", "Under 25,000", "25,000 – 60,000", "60,000 – 100,000", "100,000+"];
export const BLOG_CATEGORIES = ["All", ...Array.from(new Set(POSTS.map((p) => p.category)))];
