import { CheckCircle2, Target, Eye, Heart, Rocket } from 'lucide-react';
import AnimatedSection from '../components/AnimatedSection';
import SectionHeading from '../components/SectionHeading';
import Team from '../components/Team';
import Credentials from '../components/Credentials';
import Seo from '../components/Seo';
import visitingLogo from '../../assets/brand/SWASTIK.svg';
import terracottaPattern from '../../assets/brand/Background.jpeg';

const values = [
  {
    icon: Target,
    title: 'Precision',
    text: 'Every measurement, material choice, and finishing detail will be executed with exacting standards.',
  },
  {
    icon: Eye,
    title: 'Transparency',
    text: 'Clear communication on costs, timelines, and progress. What we quote is what you pay.',
  },
  {
    icon: Heart,
    title: 'Dedication',
    text: 'As a new company, we pour extra effort into every project because your success is our reputation.',
  },
  {
    icon: Rocket,
    title: 'Modern Thinking',
    text: 'Contemporary designs, latest materials, and efficient methods. We bring fresh ideas to every project.',
  },
];

const capabilities = [
  'Residential Construction',
  'Commercial Build-Outs',
  'Industrial Civil Works',
  'Interior Design & Execution',
  'Renovation & Remodeling',
  'Turnkey Project Delivery',
];

export default function About({ showSeo = true }) {
  return (
    <AnimatedSection id="about" className="bg-white section-pad">
      {showSeo && (
        <Seo
          title="About Us"
          description="Swastik Buildcons is a construction and interior design firm committed to quality, transparency, and modern methods on every project across India."
          path="/about"
        />
      )}
      <div className="container-shell">
        {/* Intro */}
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading
              eyebrow="About Us"
              title="A new construction company with a serious mission"
              text="Swastik Buildcons is a newly launched construction and interior design firm. We don't have a portfolio of past projects yet, but we have the skills, the commitment, and the drive to deliver exceptional work."
            />
            <p className="mt-6 text-sm leading-7 text-coal/65">
              We believe the best way to build a reputation is one project at a time.
              Our founding team brings knowledge of modern construction practices, interior
              design, and project management. What we offer our early clients is simple:
              undivided attention, competitive pricing, and a genuine desire to exceed expectations.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-3">
              {capabilities.map((item) => (
                <span key={item} className="flex items-start gap-2 text-sm text-coal/75">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-brass" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="overflow-hidden rounded-lg border border-coal/8 shadow-soft">
              <div className="relative aspect-[4/3] bg-rust">
                <img
                  src={terracottaPattern}
                  alt="Swastik Buildcons brand identity"
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
                {/* Soft light halo behind the logo: keeps the terracotta bright
                    at the edges while giving the dark logo a lighter center to
                    sit on so it stays clearly legible without looking washed. */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'radial-gradient(circle at center, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0.12) 45%, transparent 72%)',
                  }}
                />
                <div className="relative flex h-full w-full items-center justify-center">
                  <img src={visitingLogo} alt="Swastik Buildcons" className="w-64 drop-shadow-lg" loading="lazy" decoding="async" />
                </div>
              </div>
            </div>
            <div className="mt-4 rounded-lg border border-brass/20 bg-brass/5 px-5 py-4">
              <p className="text-sm font-semibold text-ink">Now accepting projects across PAN India</p>
              <p className="mt-1 text-xs text-coal/60">
                Special introductory pricing for our founding clients
              </p>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="mt-20">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-brass">Our Values</p>
            <h3 className="mt-3 font-display text-3xl font-semibold text-ink md:text-4xl">
              What we stand for
            </h3>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-coal/60">
              These aren&apos;t just words on a website. These are promises we make to every client.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {values.map((item) => (
              <article
                key={item.title}
                className="group rounded-lg border border-coal/8 bg-paper/50 p-7 transition hover:border-brass/30 hover:bg-white hover:shadow-crisp"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-burgundy/10 text-burgundy transition group-hover:bg-burgundy group-hover:text-white">
                  <item.icon size={24} />
                </div>
                <h4 className="mt-5 text-lg font-bold text-ink">{item.title}</h4>
                <p className="mt-3 text-sm leading-7 text-coal/65">{item.text}</p>
              </article>
            ))}
          </div>
        </div>      </div>

      {/* Team / Our People (omitted when no members) */}
      <Team />

      {/* Certifications / awards / safety (omitted when empty) */}
      <Credentials />
    </AnimatedSection>
  );
}



