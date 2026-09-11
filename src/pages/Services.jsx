import { useEffect, useState } from 'react';
import AnimatedSection from '../components/AnimatedSection';
import SectionHeading from '../components/SectionHeading';
import ServiceCard from '../components/ServiceCard';
import Seo from '../components/Seo';
import { processSteps, services, civilServices, equipmentFleet, certifications } from '../data/site';
import sbMonogram from '../../assets/brand/SWASTIK.svg';
import { Factory, Zap, Route, Droplets, Landmark, SquareStack, Menu, MapPin, Award, Shield, CheckCircle, Briefcase, FileText } from 'lucide-react';

// Showcase photos for the "How We Work" panel (WebP, optimized). Imported so
// Vite bundles and fingerprints them.
import showcase1 from '../../assets/home-photos/pexels-raymond-ma-yi-rong-504251-7025800.webp';
import showcase2 from '../../assets/home-photos/pexels-mikhael-91948491-9136257.webp';
import showcase3 from '../../assets/home-photos/photo-1748063578185-3d68121b11ff.webp';
import showcase4 from '../../assets/home-photos/pexels-myatezhny39-3021129.webp';

export default function Services({ showSeo = true }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('all');

  const filteredServices = activeTab === 'all'
    ? services
    : activeTab === 'construction'
    ? [...services.slice(0, 1), ...civilServices]
    : services.slice(0, 4); // Interior design services

  // Rotating showcase photos for the "How We Work" panel (optimized WebP).
  const industrialImages = [
    { src: showcase1, alt: 'Modern high-rise construction', transform: 'scale(1)' },
    { src: showcase2, alt: 'Contemporary commercial towers', transform: 'scale(1.05)' },
    { src: showcase3, alt: 'Completed residential development', transform: 'scale(1)' },
    { src: showcase4, alt: 'Active construction site with cranes', transform: 'scale(1.05)' },
  ];

  useEffect(() => {
    if (industrialImages.length === 0) return;
    const interval = setInterval(() => {
      setCurrentImageIndex(prevIndex => (prevIndex + 1) % industrialImages.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [industrialImages.length]);

  return (
    <AnimatedSection id="services" className="bg-white section-pad">
      {showSeo && (
        <Seo
          title="Our Services"
          description="Construction, civil works, interior design, renovation, and turnkey project delivery from Swastik Buildcons across PAN India."
          path="/services"
        />
      )}
      <div className="container-shell">
        <SectionHeading
          eyebrow="What We Offer"
          title="Complete construction & civil works services"
          text="From foundation to finishing, we're ready to handle every aspect of your project with dedication and modern expertise."
          align="center"
        />

        {/* Services Tabs */}
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-md border border-coal/3 bg-white/50 text-sm font-medium text-coal/70 transition-all duration-200 hover:bg-white/10 hover:text-brass hover:border-brass/20 ${activeTab === 'all' ? 'bg-brass/20 text-brass border-brass/40' : ''}`}
          >
            All Services
          </button>
          <button
            onClick={() => setActiveTab('construction')}
            className={`px-4 py-2 rounded-md border border-coal/3 bg-white/50 text-sm font-medium text-coal/70 transition-all duration-200 hover:bg-white/10 hover:text-brass hover:border-brass/20 ${activeTab === 'construction' ? 'bg-brass/20 text-brass border-brass/40' : ''}`}
          >
            Civil Construction
          </button>
          <button
            onClick={() => setActiveTab('interior')}
            className={`px-4 py-2 rounded-md border border-coal/3 bg-white/50 text-sm font-medium text-coal/70 transition-all duration-200 hover:bg-white/10 hover:text-brass hover:border-brass/20 ${activeTab === 'interior' ? 'bg-brass/20 text-brass border-brass/40' : ''}`}
          >
            Interior Design
          </button>
        </div>

        {/* Services Grid */}
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {filteredServices.map((service) => (
            <ServiceCard key={service.title} service={service} />
          ))}
        </div>

        {/* Civil Construction Specialization */}
        {activeTab === 'construction' && (
          <div>
            <div className="mt-20">
              <SectionHeading
                eyebrow="Our Expertise"
                title="Specialized Civil Construction Services"
                text="We focus on infrastructure development and heavy civil works that build the foundation of modern society."
                align="center"
              />

              <div className="mt-12 grid gap-6 md:grid-cols-2">
                {civilServices.map((service, index) => (
                  <div
                    key={service.title}
                    className="group rounded-lg border border-coal/8 bg-white p-6 shadow-crisp transition duration-300 hover:-translate-y-1 hover:border-brass/40 hover:shadow-soft"
                  >
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-burgundy/8 font-display text-xl font-bold text-burgundy transition group-hover:bg-burgundy group-hover:text-white">
                      {index < 4 ? (
                        <>
                          {service.title === 'Earthworks & Excavation' && <Factory size={20} className="text-brass" />}
                          {service.title === 'Utility Infrastructure' && <Zap size={20} className="text-brass" />}
                          {service.title === 'Road & Pavement Works' && <Route size={20} className="text-brass" />}
                          {service.title === 'Drainage Systems' && <Droplets size={20} className="text-brass" />}
                          {service.title === 'Bridge & Flyover Construction' && <Landmark size={20} className="text-brass" />}
                          {service.title === 'Foundation Works' && <SquareStack size={20} className="text-brass" />}
                          {service.title === 'Retaining Walls' && <Menu size={20} className="text-brass" />}
                          {service.title === 'Land Development' && <MapPin size={20} className="text-brass" />}
                        </>
                      ) : (
                        <Factory size={20} className="text-brass" />
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-ink">{service.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-coal/65">{service.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-20">
              <SectionHeading
                eyebrow="Our Fleet"
                title="Modern Equipment for Efficient Execution"
                text="We maintain a well-equipped fleet of machinery to ensure timely and quality execution of all civil works."
                align="center"
              />

              <div className="mt-12 grid gap-6 md:grid-cols-3">
                {equipmentFleet.map((equipment) => (
                  <div
                    key={equipment.name}
                    className="group rounded-lg border border-coal/8 bg-white p-6 shadow-crisp transition duration-300 hover:-translate-y-1 hover:border-brass/40 hover:shadow-soft"
                  >
                    <div className="mb-4 overflow-hidden rounded-md bg-ink/90 aspect-[16/10] relative">
                      {equipment.image ? (
                        <img
                          src={equipment.image}
                          alt={equipment.name}
                          width={400}
                          height={250}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-ink to-coal">
                          <Factory size={40} className="text-brass/70" />
                        </div>
                      )}
                      <span className="absolute top-2 right-2 rounded-md bg-brass/90 text-white px-2 py-0.5 text-xs font-bold shadow-sm">
                        {equipment.count} Available
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-ink">{equipment.name}</h3>
                    <p className="mt-2 text-sm text-coal/60">{equipment.description}</p>
                    <div className="mt-4 flex items-center gap-3 text-sm text-coal/50">
                      <div className="flex items-center gap-1">
                        <MapPin size={16} className="text-brass" />
                        <span>{equipment.count}+</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap size={16} className="text-brass" />
                        <span>Units</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-20">
              <SectionHeading
                eyebrow="Our Commitment"
                title="Certifications & Quality Assurance"
                text="Our certifications demonstrate our commitment to quality, safety, and environmental stewardship."
                align="center"
              />

              <div className="mt-12 flex flex-wrap gap-6 justify-center">
                {certifications.map((cert) => (
                  <div
                    key={cert.name}
                    className="group rounded-lg border border-coal/8 bg-white p-6 text-center shadow-crisp transition duration-300 hover:-translate-y-1 hover:border-brass/40 hover:shadow-soft"
                  >
                    <div className="mb-4 h-10 w-10 items-center justify-center rounded-lg bg-burgundy/8 font-display text-xl font-bold text-burgundy transition group-hover:bg-burgundy group-hover:text-white">
                      {cert.name.includes('ISO') && (
                        <Award size={20} className="text-brass" />
                      )}
                      {cert.name.includes('NABET') && (
                        <CheckCircle size={20} className="text-brass" />
                      )}
                      {cert.name.includes('MSME') && (
                        <Briefcase size={20} className="text-brass" />
                      )}
                      {cert.name.includes('GST') && (
                        <FileText size={20} className="text-brass" />
                      )}
                      {!cert.name.includes('ISO') && !cert.name.includes('NABET') && !cert.name.includes('MSME') && !cert.name.includes('GST') && (
                        <Shield size={20} className="text-brass" />
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-ink">{cert.name}</h3>
                    <p className="mt-3 text-sm leading-6 text-coal/65">{cert.text}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>
        )}

        {/* How We Work */}
        <div className="mt-20 overflow-hidden rounded-xl border border-coal/8 bg-paper shadow-soft">
          <div className="grid lg:grid-cols-2">
            {/* Left Visual - Industrial Work Showcase */}
            <div className="relative min-h-[300px] bg-ink p-8 lg:p-10 overflow-hidden">
              {/* Industrial Image Showcase */}
              <div className="absolute inset-0 h-full w-full">
                <div className="absolute inset-0 h-full w-full">
                  {industrialImages.map((image, index) => (
                    <img
                      key={index}
                      src={image.src}
                      alt={image.alt}
                      className={`h-full w-full object-cover transform transition-transform duration-3000 ease-in-out ${
                        index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                      }`}
                      style={{ transform: image.transform }}
                      loading={index === 0 ? 'eager' : 'lazy'}
                      decoding="async"
                    />
                  ))}
                </div>
              </div>

              {/* Overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-transparent to-ink/90" />

              <div className="relative z-10 flex h-full flex-col justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-brass">
                    How We Work
                  </p>
                  <h3 className="mt-3 font-display text-3xl font-semibold leading-tight text-white lg:text-4xl">
                    A clear process you can count on
                  </h3>
                  <p className="mt-4 max-w-md text-sm leading-7 text-white/60">
                    Even as a new company, we follow a structured approach. Every project gets a defined plan, clear milestones, and regular communication.
                  </p>
                </div>
                <img src={sbMonogram} alt="Swastik Buildcons" className="mt-8 w-28 opacity-80" loading="lazy" decoding="async" />
              </div>
            </div>

            {/* Right Steps */}
            <div className="p-6 lg:p-10">
              <div className="grid gap-5 sm:grid-cols-2">
                {processSteps.map((step, index) => (
                  <div
                    key={step.title}
                    className="rounded-lg border border-coal/8 bg-white p-5 transition hover:border-brass/30 hover:shadow-crisp"
                  >
                    <span className="font-display text-2xl font-bold text-brass">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h4 className="mt-2 font-bold text-ink">{step.title}</h4>
                    <p className="mt-2 text-sm leading-6 text-coal/60">{step.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}

