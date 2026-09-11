import { CalendarDays, ClipboardList, Hammer, Handshake } from 'lucide-react';
import AnimatedSection from './AnimatedSection';

const steps = [
  {
    icon: CalendarDays,
    title: 'Consultation',
    description: 'Understanding your vision, site conditions, budget parameters, and project timeline.',
  },
  {
    icon: ClipboardList,
    title: 'Planning & Design',
    description: 'Detailed scope mapping, material specifications, layout design, and execution roadmap.',
  },
  {
    icon: Hammer,
    title: 'Execution',
    description: 'Disciplined on-site work with quality checks, vendor coordination, and regular progress updates.',
  },
  {
    icon: Handshake,
    title: 'Handover',
    description: 'Final inspection, quality assurance, documentation, and clean project closure.',
  },
];

export default function ProcessSteps() {
  return (
    <AnimatedSection className="bg-white section-pad">
      <div className="container-shell">
        <div className="mb-12 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-brass">Our Process</p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-ink md:text-4xl">
            From consultation to handover
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-coal/65">
            A structured 4-step approach that ensures clarity, accountability, and quality at every project milestone.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="group relative rounded-lg border border-coal/8 bg-paper/50 p-6 transition-all duration-500 hover:border-brass/40 hover:bg-white/10 hover:shadow-xl float-on-hover button-shine"
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-burgundy/10 text-burgundy transition group-hover:bg-burgundy group-hover:text-white">
                  <step.icon size={20} />
                </span>
                <span className="font-display text-2xl font-bold text-brass/60">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>
              <h3 className="text-base font-bold text-ink">{step.title}</h3>
              <p className="mt-2 text-sm leading-7 text-coal/60">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}
