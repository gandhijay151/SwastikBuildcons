import { useEffect, useState } from 'react';
import { Quote, Star } from 'lucide-react';
import AnimatedSection from './AnimatedSection';
import SectionHeading from './SectionHeading';
import { getApiBaseUrl } from '../lib/api';

/**
 * Public testimonials section (Req 5.1, 5.2, 5.4).
 *
 * Fetches published testimonials from GET /api/testimonials. The entire section
 * is hidden (renders nothing) while loading, on error, or when there are no
 * published testimonials — so the public page never shows an empty block
 * (Req 5.4).
 */
export default function Testimonials() {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${getApiBaseUrl()}/api/testimonials`, {
          headers: { Accept: 'application/json' },
        });
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
        const data = await res.json();
        if (!cancelled) setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        // On failure, leave the list empty so the section stays hidden.
        console.error('Failed to load testimonials:', err);
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Hide the whole section until we have at least one published testimonial (Req 5.4).
  if (!ready || items.length === 0) return null;

  return (
    <AnimatedSection id="testimonials" className="bg-ivory/50 section-pad">
      <div className="container-shell">
        <SectionHeading
          eyebrow="What Clients Say"
          title="Trusted by the people we build for"
          text="Real feedback from clients who put their projects in our hands."
          align="center"
        />

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((t) => (
            <figure
              key={t.id}
              className="flex flex-col rounded-xl border border-coal/8 bg-white p-7 shadow-crisp transition duration-300 hover:-translate-y-1 hover:shadow-soft"
            >
              <Quote className="h-7 w-7 text-brass/50" aria-hidden="true" />

              {t.rating ? (
                <div className="mt-4 flex items-center gap-0.5" aria-label={`Rated ${t.rating} out of 5`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={15}
                      className={i < t.rating ? 'fill-brass text-brass' : 'text-coal/20'}
                      aria-hidden="true"
                    />
                  ))}
                </div>
              ) : null}

              <blockquote className="mt-4 flex-1 text-sm leading-7 text-coal/75">
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              <figcaption className="mt-5 border-t border-coal/8 pt-4">
                <span className="block font-display text-base font-semibold text-ink">
                  {t.clientName}
                </span>
                {t.company && <span className="block text-xs text-coal/55">{t.company}</span>}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}
