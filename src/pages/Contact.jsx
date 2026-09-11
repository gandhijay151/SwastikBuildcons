import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import AnimatedSection from '../components/AnimatedSection';
import ContactForm from '../components/ContactForm';
import SectionHeading from '../components/SectionHeading';
import { company } from '../data/site';
import Seo from '../components/Seo';

const contactInfo = [
  {
    icon: Phone,
    label: 'Phone',
    value: company.phone,
    href: company.phoneHref,
  },
  {
    icon: Mail,
    label: 'Email',
    value: company.email,
    href: company.emailHref,
  },
  {
    icon: MapPin,
    label: 'Office Address',
    value: company.address,
    href: null,
  },
  {
    icon: Clock,
    label: 'Working Hours',
    value: 'Mon - Sat, 9:00 AM - 7:00 PM',
    href: null,
  },
];

export default function Contact({ showSeo = true }) {
  return (
    <AnimatedSection id="contact" className="bg-paper section-pad">
      {showSeo && (
        <Seo
          title="Contact Us"
          description="Get in touch with Swastik Buildcons for a free consultation on your construction or interior design project. Call +91 8511 00 3888."
          path="/contact"
        />
      )}
      <div className="container-shell">
        <SectionHeading
          eyebrow="Get In Touch"
          title="Let's discuss your project"
          text="Share your requirements and our team will connect within 24 hours to discuss scope, budget, and next steps."
          align="center"
        />

        <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-start">
          {/* Contact Info */}
          <div>
            <div className="grid gap-4">
              {contactInfo.map((item) => {
                const content = (
                  <div className="flex items-start gap-4 rounded-lg border border-coal/8 bg-white p-5 transition hover:border-brass/30 hover:shadow-crisp">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-burgundy/8 text-burgundy">
                      <item.icon size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-coal/50">{item.label}</p>
                      <p className="mt-1 text-sm font-semibold text-ink">{item.value}</p>
                    </div>
                  </div>
                );

                return item.href ? (
                  <a key={item.label} href={item.href} className="block">
                    {content}
                  </a>
                ) : (
                  <div key={item.label}>{content}</div>
                );
              })}
            </div>

            {/* Quick CTA */}
            <div className="mt-6 rounded-lg border border-brass/20 bg-ink p-6">
              <p className="text-sm font-bold uppercase tracking-wider text-brass">Quick Connect</p>
              <p className="mt-2 text-sm leading-6 text-white/65">
                Prefer to talk directly? Call us or send a WhatsApp message for immediate assistance.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href={company.phoneHref}
                  className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2.5 text-sm font-bold text-ink transition hover:bg-brass"
                >
                  <Phone size={15} /> Call Now
                </a>
                <a
                  href={company.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-md border border-white/20 px-4 py-2.5 text-sm font-bold text-white transition hover:border-brass hover:text-brass"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <ContactForm />
        </div>
      </div>
    </AnimatedSection>
  );
}

