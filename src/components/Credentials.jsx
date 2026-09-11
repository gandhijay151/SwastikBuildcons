import {
  Award,
  Shield,
  CheckCircle,
  Briefcase,
  FileText,
  Moon,
  BadgeCheck,
} from 'lucide-react';
import AnimatedSection from './AnimatedSection';
import SectionHeading from './SectionHeading';
import { certifications } from '../data/site';

/**
 * Certifications / awards / safety credentials section (Req 6.2, 6.3).
 *
 * Renders the entries from `certifications`. Icons are referenced by name in the
 * data; this map resolves them to Lucide components with a sensible fallback.
 * When there are no credentials, the section omits itself (Req 6.3).
 */
const ICONS = {
  Award,
  Shield,
  CheckCircle,
  Briefcase,
  FileText,
  Moon,
};

export default function Credentials() {
  if (!Array.isArray(certifications) || certifications.length === 0) return null;

  return (
    <AnimatedSection id="credentials" className="bg-ivory/50 section-pad">
      <div className="container-shell">
        <SectionHeading
          eyebrow="Certifications & Compliance"
          title="Credentials you can build on"
          text="Recognized standards, registrations, and safety compliance that back our work."
          align="center"
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {certifications.map((cert) => {
            const Icon = ICONS[cert.icon] || BadgeCheck;
            return (
              <article
                key={cert.name}
                className="group flex flex-col rounded-xl border border-coal/8 bg-white p-7 shadow-crisp transition duration-300 hover:-translate-y-1 hover:border-brass/40 hover:shadow-soft"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-burgundy/10 text-burgundy transition group-hover:bg-burgundy group-hover:text-white">
                  <Icon size={24} aria-hidden="true" />
                </div>
                <h4 className="mt-5 font-display text-lg font-semibold text-ink">{cert.name}</h4>
                <p className="mt-3 text-sm leading-7 text-coal/65">{cert.text}</p>
              </article>
            );
          })}
        </div>
      </div>
    </AnimatedSection>
  );
}
