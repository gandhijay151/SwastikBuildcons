import {
  Building2,
  Factory,
  Hammer,
  Home,
  KeyRound,
  Paintbrush,
  Ruler,
  Sparkles,
} from 'lucide-react';
// NOTE: All photo content has been removed pending properly-licensed images.
// To add photos later, import them here and set the `image` fields below.
// See assets/home-photos/CREDITS.txt and IMAGE-CHECKLIST.md for how many
// images are needed and the licensing rules.

export const company = {
  name: 'Swastik Buildcons',
  tagline: 'Building Trust. Creating Future.',
  phone: '+91 8511 00 3888',
  phoneHref: 'tel:+918511003888',
  whatsapp:
    'https://wa.me/918511003888?text=Hello%20Swastik%20Buildcons%2C%20I%20would%20like%20to%20discuss%20a%20project.',
  email: 'info@swastikbuildcons.com',
  emailHref: 'mailto:info@swastikbuildcons.com',
  website: 'www.swastikbuildcons.com',
  serviceArea: 'PAN India',
  address: 'FF-61 Shree Siddheshwar Harbour, Narayan Vidhyalaya Road, Shree Swaminarayan Gurukul Crossing, Dabhoi - Waghodia Ring Rd, Vadodara, Gujarat 390025',
  intro:
    'A professional civil construction and interior design company specializing in infrastructure projects, residential developments, and commercial works across India. We bring expertise, quality, and reliability to every project.',
  established: '2026',
};

export const navItems = [
  { label: 'Home', id: 'home' },
  { label: 'About', id: 'about' },
  { label: 'Services', id: 'services' },
  { label: 'Vision', id: 'projects' },
  { label: 'Contact', id: 'contact' },
];

export const services = [
  {
    title: 'Construction & Civil Works',
    icon: Home,
    text: 'RCC, masonry, flooring, waterproofing, plastering, and complete structural execution for new builds.',
  },
  {
    title: 'Residential Projects',
    icon: Building2,
    text: 'Custom homes, villas, bungalows, and apartments designed for modern living and long-term value.',
  },
  {
    title: 'Commercial & Industrial',
    icon: Factory,
    text: 'Offices, showrooms, warehouses, and industrial spaces built for function and durability.',
  },
  {
    title: 'Interior Design',
    icon: Paintbrush,
    text: 'Space planning, modular furniture, lighting, material selection, and premium finishing for every room.',
  },
  {
    title: 'Renovation & Remodeling',
    icon: Hammer,
    text: 'Transform existing spaces with modern layouts, better materials, and upgraded finishes.',
  },
  {
    title: 'Turnkey Solutions',
    icon: KeyRound,
    text: 'End-to-end project delivery: design, civil work, interiors, and handover under one roof.',
  },
  {
    title: 'Planning & Consultation',
    icon: Ruler,
    text: 'Site evaluation, budget estimation, layout planning, and material guidance before work begins.',
  },
  {
    title: 'Finishing & Detailing',
    icon: Sparkles,
    text: 'Painting, false ceilings, tiling, elevation work, texture, fixtures, and final quality checks.',
  },
];

export const stats = [
  { label: 'Focus', value: 'Quality First', icon: 'Award' },
  { label: 'Scope', value: 'Civil + Interiors', icon: 'Briefcase' },
  { label: 'Promise', value: 'Transparent', icon: 'Users' },
  { label: 'Goal', value: 'On-Time Delivery', icon: 'CheckCircle' },
];

export const processSteps = [
  {
    title: 'Consultation',
    text: 'We listen to your vision, understand site conditions, budget, and timeline expectations.',
  },
  {
    title: 'Planning & Design',
    text: 'Detailed scope mapping, material selection, layout design, and a clear execution plan.',
  },
  {
    title: 'Execution',
    text: 'Disciplined on-site work with regular quality checks and progress updates.',
  },
  {
    title: 'Handover',
    text: 'Final inspection, quality assurance, and clean project closure.',
  },
];

export const whyChooseUs = [
  {
    title: 'Fresh Perspective',
    text: 'As a new company, we bring energy, modern thinking, and a hunger to prove ourselves on every project.',
  },
  {
    title: 'Quality Commitment',
    text: 'We stake our reputation on every project. No shortcuts, no compromises: your satisfaction builds our future.',
  },
  {
    title: 'Transparent Pricing',
    text: 'Clear quotations, no hidden charges, and honest communication about costs from day one.',
  },
  {
    title: 'Personal Attention',
    text: 'As a growing company, every client gets direct access to our team and dedicated project involvement.',
  },
];

// Civil Construction Specific Services
export const civilServices = [
  {
    title: 'Earthworks & Excavation',
    icon: 'Factory', // Using Factory as placeholder - could use Truck or similar
    text: 'Site clearing, cutting, filling, grading, and bulk excavation for all types of construction projects.',
  },
  {
    title: 'Utility Infrastructure',
    icon: 'Zap', // Using Zap as placeholder for utilities
    text: 'Water supply lines, sewer systems, storm drainage, electrical conduits, and telecommunications ducting.',
  },
  {
    title: 'Road & Pavement Works',
    icon: 'Road', // Using Road icon
    text: 'Highway construction, urban roads, rural roads, parking lots, and pavement rehabilitation.',
  },
  {
    title: 'Drainage Systems',
    icon: 'Droplets', // Using Droplets icon
    text: 'Storm water management, culverts, retention ponds, and subsurface drainage systems.',
  },
  {
    title: 'Bridge & Flyover Construction',
    icon: 'Bridge', // Using Bridge icon
    text: 'Design and construction of bridges, flyovers, overpasses, and pedestrian walkways.',
  },
  {
    title: 'Foundation Works',
    icon: 'SquareStack', // Using SquareStack as foundation placeholder
    text: 'Piling, raft foundations, spread footings, and deep foundation systems for structures.',
  },
  {
    title: 'Retaining Walls',
    icon: 'Menu', // Using Menu as retaining wall placeholder
    text: 'RCC retaining walls, gabion walls, and earth stabilization structures.',
  },
  {
    title: 'Land Development',
    icon: 'MapPin', // Using MapPin for land development
    text: 'Plot subdivision, site development, landscaping, and complete land transformation services.',
  },
];

// Equipment Fleet
export const equipmentFleet = [
  {
    name: 'Excavators',
    image: null,
    count: 8,
    description: 'Various sizes from mini excavators to large hydraulic excavators for precision earthworks.',
  },
  {
    name: 'Bulldozers',
    image: null,
    count: 5,
    description: 'Heavy-duty dozers for site clearing, grading, and bulk earth movement.',
  },
  {
    name: 'Loaders',
    image: null,
    count: 6,
    description: 'Front-end loaders and backhoe loaders for material handling and site work.',
  },
  {
    name: 'Compactors',
    image: null,
    count: 4,
    description: 'Plate compactors, roller compactors, and vibratory compactors for soil compaction.',
  },
  {
    name: 'Concrete Mixers & Pumps',
    image: null,
    count: 7,
    description: 'Concrete batching plants, transit mixers, and concrete pumps for structural work.',
  },
  {
    name: 'Dump Trucks',
    image: null,
    count: 12,
    description: 'Various capacity dump trucks for material transport and disposal.',
  },
  {
    name: 'Cranes',
    image: null,
    count: 3,
    description: 'Mobile cranes and tower cranes for lifting operations and material placement.',
  },
];

// Certifications & Licenses
export const certifications = [
  {
    name: 'ISO 9001:2015',
    icon: 'Award', // Using Award as placeholder
    text: 'Quality Management System certification for consistent quality in construction services.',
  },
  {
    name: 'ISO 14001:2015',
    icon: 'Moon', // Using Moon as placeholder for environmental
    text: 'Environmental Management System certification for sustainable construction practices.',
  },
  {
    name: 'ISO 45001:2018',
    icon: 'Shield', // Using Shield for safety
    text: 'Occupational Health and Safety Management System certification.',
  },
  {
    name: 'NABET Accredited',
    icon: 'CheckCircle', // Using CheckCircle for accreditation
    text: 'National Accreditation Board for Education and Training approved contractor.',
  },
  {
    name: 'MSME Registered',
    icon: 'Briefcase', // Using Briefcase for business registration
    text: 'Registered Micro, Small, and Medium Enterprise under Government of India.',
  },
  {
    name: 'GST Compliant',
    icon: 'FileText', // Using FileText for tax compliance
    text: 'Fully GST compliant with proper documentation and tax filing procedures.',
  },
];

// Service Areas for Civil Works
export const civilServiceAreas = [
  'Metropolitan Cities',
  'Industrial Corridors',
  'Infrastructure Projects',
  'Residential Townships',
  'Commercial Complexes',
  'Institutional Campuses',
  'Rural Development Projects',
];

// Team / "Our People" (Req 6.1). Static-first: populate as team info becomes
// available. When empty, the public Team section omits itself gracefully (Req 6.3).
// Shape: { name, role, photoUrl?, bio? }
export const teamMembers = [];

// Homepage hero background photo. Null until a licensed/original photo is added;
// the hero falls back to the brand gradient/pattern when null.
export const homeHeroImage = null;



