import { ArrowRight, PhoneCall, Rocket, Shield, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import AnimatedSection from '../components/AnimatedSection';
import Button from '../components/Button';
import ProcessSteps from '../components/ProcessSteps';
import SectionHeading from '../components/SectionHeading';
import StatsBar from '../components/StatsBar';
import Testimonials from '../components/Testimonials';
import Seo from '../components/Seo';
import { company, whyChooseUs } from '../data/site';
import sbMonogram from '../../assets/brand/SWASTIK.svg';
import terracottaPattern from '../../assets/brand/Background.jpeg';
import { homeHeroImage } from '../data/site';

const trustPoints = [
  { icon: Rocket, text: 'New & Ambitious' },
  { icon: Shield, text: 'Quality Focused' },
  { icon: Sparkles, text: 'Modern Approach' },
];

export default function Home({ showSeo = true }) {
  return (
    <>
      {showSeo && (
        <Seo
          title="Construction & Interior Design Company"
          description="Swastik Buildcons delivers construction, interior design, renovation, and civil works across PAN India with quality craftsmanship and transparent pricing."
          path="/"
        />
      )}
      {/* Hero Section */}
      <section id="home" className="relative min-h-screen overflow-hidden bg-rust pt-16 text-white">
        <div className="absolute inset-0">
          <img
            src={homeHeroImage || terracottaPattern}
            alt=""
            aria-hidden="true"
            className={`h-full w-full object-cover ${homeHeroImage ? 'opacity-40' : 'opacity-100'}`}
            decoding="async"
            fetchPriority="high"
          />
          {/* Readability scrim: darkens the terracotta pattern behind the copy
              (strong on the left where the text sits, fading toward the right)
              so the white text stays legible while the pattern still shows. */}
          <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/55 to-transparent" />
        </div>

        <div className="container-shell relative z-10 flex min-h-[calc(100vh-64px)] items-center py-16 lg:py-20">
          <div className="grid w-full gap-12 lg:grid-cols-1 lg:items-center">
            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="max-w-2xl"
            >
              <span className="inline-block rounded-full border border-brass/60 bg-ink/40 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-brass backdrop-blur-sm">
                Now Open for Projects
              </span>

              <h1 className="mt-6 font-display text-4xl font-bold leading-[1.1] md:text-5xl lg:text-6xl xl:text-7xl">
                {company.tagline}
              </h1>

              <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/90">
                {company.intro}
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Button to="/contact">Get Free Consultation</Button>
                <Button to="/services" type="secondary">
                  Our Services <ArrowRight size={16} className="ml-1" />
                </Button>
              </div>

              <div className="mt-10 flex flex-wrap gap-6">
                {trustPoints.map((item) => (
                  <span key={item.text} className="flex items-center gap-2 text-sm font-medium text-white/90">
                    <item.icon size={18} className="text-brass" />
                    {item.text}
                  </span>
                ))}
              </div>
            </motion.div>


          </div>
        </div>
      </section>

      {/* Stats */}
      <StatsBar />

      {/* Why Choose Us */}
      <AnimatedSection className="bg-paper section-pad">
        <div className="container-shell">
          <SectionHeading
            eyebrow="Why Choose a New Company"
            title="Fresh energy, serious commitment"
            text="Being new means we have everything to prove. Every project is a chance to build our reputation, and we don't take that lightly."
            align="center"
          />
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {whyChooseUs.map((item, index) => (
              <article
                key={item.title}
                className="group rounded-lg border border-coal/8 bg-white p-7 shadow-crisp transition duration-300 hover:-translate-y-1 hover:border-brass/40 hover:shadow-soft"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-burgundy/8 font-display text-xl font-bold text-burgundy transition group-hover:bg-burgundy group-hover:text-white">
                  {String(index + 1).padStart(2, '0')}
                </div>
                <h3 className="text-lg font-bold text-ink">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-coal/65">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Process */}
      <ProcessSteps />

      {/* Client testimonials (hidden when none published) */}
      <Testimonials />

      {/* CTA Banner */}
      <section className="relative overflow-hidden bg-rust py-20">
        <img
          src={terracottaPattern}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-100"
          aria-hidden="true"
          loading="lazy"
          decoding="async"
        />
        {/* Readability scrim: darkest through the middle where the centered copy
            sits, fading toward the edges so the terracotta pattern still shows. */}
        <div className="absolute inset-0 bg-gradient-to-b from-ink/45 via-ink/70 to-ink/45" />
        <div className="container-shell relative z-10 text-center">
          <img src={sbMonogram} alt="Swastik Buildcons" className="mx-auto mb-6 w-20" loading="lazy" decoding="async" />
          <h2 className="font-display text-3xl font-bold text-white md:text-4xl">
            Be Our First Success Story
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-white/90">
            We&apos;re looking for our founding clients: people who value quality work, clear communication, and a team that goes the extra mile. Let&apos;s build something great together.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button to="/contact">Start Your Project</Button>
            <Button href={company.phoneHref} type="secondary">
              <PhoneCall size={16} className="mr-2" /> {company.phone}
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}




