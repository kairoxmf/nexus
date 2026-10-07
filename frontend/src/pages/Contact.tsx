import { useLocation } from "react-router-dom";
import { Clock, Facebook, Instagram, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import PageHero from "../components/ui/PageHero";
import Reveal from "../components/ui/Reveal";
import ContactForm from "../components/common/ContactForm";
import { BRAND } from "../data/site";

const INFO = [
  { icon: Phone, label: "Phone", value: BRAND.phone, href: BRAND.phoneHref },
  { icon: Mail, label: "Email", value: BRAND.email, href: `mailto:${BRAND.email}` },
  {
    icon: MapPin,
    label: "Office",
    value: `${BRAND.address1}, ${BRAND.address2}`,
    href: "https://maps.google.com/?q=123+Construction+Way+New+York+NY+10001",
  },
  { icon: Clock, label: "Hours", value: "Mon – Fri · 8:00 AM – 6:00 PM", href: undefined },
];

export default function Contact() {
  const location = useLocation();
  const interest = (location.state as { interest?: string } | null)?.interest ?? "";

  return (
    <>
      <PageHero
        eyebrow="Contact Us"
        title="Start Your Project With Us."
        description="Tell us about your project — scope, site and timeline — and our pre-construction team will get back to you within one business day."
      />

      <section className="py-14 lg:py-20">
        <div className="shell grid gap-10 lg:grid-cols-[1.6fr_1fr] lg:gap-12">
          <Reveal>
            <ContactForm defaultDetails={interest} />
          </Reveal>

          <Reveal delay={120}>
            <div className="rounded-xl border border-line bg-navy-darker p-7 text-white sm:p-8">
              <h2 className="text-lg font-extrabold">Contact Information</h2>
              <ul className="mt-6 space-y-5">
                {INFO.map(({ icon: Icon, label, value, href }) => (
                  <li key={label} className="flex items-start gap-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white/10 text-gold">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block text-[11px] font-extrabold uppercase tracking-widest text-gold">
                        {label}
                      </span>
                      {href ? (
                        <a
                          href={href}
                          target={href.startsWith("http") ? "_blank" : undefined}
                          rel="noreferrer"
                          className="mt-1 block text-[14px] font-semibold text-white/85 transition-colors hover:text-gold"
                        >
                          {value}
                        </a>
                      ) : (
                        <span className="mt-1 block text-[14px] font-semibold text-white/85">{value}</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 border-t border-white/10 pt-6">
                <p className="text-[11px] font-extrabold uppercase tracking-widest text-gold">Follow Us</p>
                <div className="mt-3 flex items-center gap-3">
                  {[
                    { label: "Facebook", icon: Facebook, href: "https://facebook.com" },
                    { label: "LinkedIn", icon: Linkedin, href: "https://linkedin.com" },
                    { label: "Instagram", icon: Instagram, href: "https://instagram.com" },
                  ].map(({ label, icon: Icon, href }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Built Right on ${label}`}
                      className="grid h-9 w-9 place-items-center rounded-md border border-white/15 text-white/70 transition-all duration-300 hover:border-gold hover:bg-gold hover:text-navy-abyss"
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Map */}
        <Reveal className="shell mt-12">
          <div className="overflow-hidden rounded-xl border border-line shadow-card">
            <iframe
              title="Built Right Construction office location map"
              src="https://www.google.com/maps?q=123%20Construction%20Way,%20New%20York,%20NY%2010001&output=embed"
              className="h-[380px] w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </Reveal>
      </section>
    </>
  );
}
