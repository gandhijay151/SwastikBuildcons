import { Rocket, Star } from 'lucide-react';
import AnimatedSection from '../components/AnimatedSection';
import SectionHeading from '../components/SectionHeading';
import Seo from '../components/Seo';

export default function Projects({ showSeo = true }) {
  return (
    <>
      {showSeo && (
        <Seo
          title="Our Vision"
          description="Discover the vision and standards of Swastik Buildcons, a newly launched construction and interior design firm serving PAN India."
          path="/projects"
        />
      )}

      <AnimatedSection id="projects" className="py-20 lg:py-28 bg-sand/30 border-t border-coal/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Future Direction"
            title="Our Vision & Infrastructure Aspirations"
            subtitle="Positioning Swastik Buildcons for sustainable growth, larger developments, and impactful civil infrastructure."
          />

          {/* Strategic Goals Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-coal/8 bg-white p-8 enhanced-card-hover shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brass/10 text-brass">
                  <Rocket size={22} />
                </div>
                <h3 className="font-display text-xl font-semibold text-ink">Growth Trajectory</h3>
              </div>
              <p className="mt-4 text-sm leading-7 text-coal/70">
                Expanding our operational footprint across residential, commercial, and industrial segments with a focus on quality delivery and client satisfaction.
              </p>
              <ul className="mt-6 space-y-3 text-xs text-coal/70">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-brass" />
                  Scaling project capacity and execution teams
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-brass" />
                  Building long-term client relationships
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-brass" />
                  Adopting modern construction management methods
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-coal/8 bg-white p-8 enhanced-card-hover shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brass/10 text-brass">
                  <Star size={22} />
                </div>
                <h3 className="font-display text-xl font-semibold text-ink">Standard of Excellence</h3>
              </div>
              <p className="mt-4 text-sm leading-7 text-coal/70">
                Every project, regardless of scale, receives dedicated engineering oversight, transparent costing, and rigorous material quality checks.
              </p>
              <ul className="mt-6 space-y-3 text-xs text-coal/70">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-brass" />
                  Zero compromise on structural integrity
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-brass" />
                  On-time delivery commitments
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-brass" />
                  Safety and environmental compliance
                </li>
              </ul>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </>
  );
}
