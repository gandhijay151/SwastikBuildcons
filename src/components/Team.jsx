import { User } from 'lucide-react';
import AnimatedSection from './AnimatedSection';
import SectionHeading from './SectionHeading';
import { teamMembers } from '../data/site';

/**
 * Team / "Our People" section (Req 6.1, 6.3).
 *
 * Renders the members from `teamMembers` (name, role, optional photo and bio).
 * When there are no members, the section omits itself entirely (Req 6.3), so no
 * empty block appears on the public site.
 */
export default function Team() {
  if (!Array.isArray(teamMembers) || teamMembers.length === 0) return null;

  return (
    <AnimatedSection id="team" className="bg-white section-pad">
      <div className="container-shell">
        <SectionHeading
          eyebrow="Our People"
          title="The team behind the build"
          text="Experienced professionals dedicated to delivering quality on every project."
          align="center"
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {teamMembers.map((member) => (
            <article
              key={`${member.name}-${member.role}`}
              className="group rounded-xl border border-coal/8 bg-paper/50 p-6 text-center transition hover:border-brass/30 hover:bg-white hover:shadow-crisp"
            >
              <div className="mx-auto h-24 w-24 overflow-hidden rounded-full bg-burgundy/10">
                {member.photoUrl ? (
                  <img
                    src={member.photoUrl}
                    alt={member.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-burgundy">
                    <User size={34} aria-hidden="true" />
                  </div>
                )}
              </div>
              <h4 className="mt-5 font-display text-lg font-semibold text-ink">{member.name}</h4>
              <p className="mt-1 text-xs font-bold uppercase tracking-wider text-brass">{member.role}</p>
              {member.bio && <p className="mt-3 text-sm leading-7 text-coal/65">{member.bio}</p>}
            </article>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}
