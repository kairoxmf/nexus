import { useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle2, Mail, MapPin, Phone, Send } from "lucide-react";
import PageHero from "../components/ui/PageHero";
import Reveal from "../components/ui/Reveal";
import {
  ADDRESS,
  EMAIL,
  PHONE,
  PHONE_HREF,
  PROPERTIES,
} from "../data/site";

export default function Contact() {
  const [params] = useSearchParams();
  const propertyRef = params.get("property");
  const property = PROPERTIES.find((p) => p.slug === propertyRef);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    interest: property ? `Buying — ${property.name}` : "Buying",
    message: property ? `I'd like to learn more about ${property.name}.` : "",
  });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) || !form.message.trim()) {
      setError("Please fill in your name, a valid email and a message.");
      return;
    }
    setError("");
    setSent(true);
  };

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let's Talk"
        description="Tell us what you're looking for — a first home, a fifth investment, or something that doesn't exist on the market yet."
      />

      <section className="bg-ivory py-20 lg:py-28">
        <div className="shell grid items-start gap-10 lg:grid-cols-[400px_1fr] lg:gap-16">
          <Reveal className="space-y-4">
            <ContactCard
              icon={<Phone className="h-5 w-5" aria-hidden="true" />}
              label="Phone"
              value={PHONE}
              href={PHONE_HREF}
            />
            <ContactCard
              icon={<Mail className="h-5 w-5" aria-hidden="true" />}
              label="Email"
              value={EMAIL}
              href={`mailto:${EMAIL}`}
            />
            <div className="rounded-2xl border border-line bg-white p-6">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-gold/10 text-gold">
                <MapPin className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="mt-4 text-[11px] font-bold uppercase tracking-wider text-muted">Office</p>
              <p className="mt-1.5 font-extrabold text-ink">{ADDRESS}</p>
              <p className="mt-2 text-sm text-muted">Mon–Fri 9:00–18:00 · Sat by appointment</p>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="rounded-2xl border border-line bg-white p-6 shadow-lg shadow-navy/5 sm:p-9">
              {sent ? (
                <div className="flex flex-col items-center py-14 text-center">
                  <CheckCircle2 className="h-14 w-14 text-gold" aria-hidden="true" />
                  <h2 className="mt-6 text-2xl font-extrabold text-ink">Message received</h2>
                  <p className="mt-3 max-w-sm text-muted">
                    Thank you, {form.name.split(" ")[0]}. One of our advisors will
                    reach out within one business day.
                  </p>
                </div>
              ) : (
                <form onSubmit={submit} noValidate>
                  <h2 className="text-2xl font-extrabold text-ink">Send a Message</h2>
                  <div className="mt-7 grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="c-name" className="field-label">Full name *</label>
                      <input id="c-name" className="field" placeholder="Your name" value={form.name} onChange={(e) => set("name")(e.target.value)} />
                    </div>
                    <div>
                      <label htmlFor="c-email" className="field-label">Email *</label>
                      <input id="c-email" type="email" className="field" placeholder="you@example.com" value={form.email} onChange={(e) => set("email")(e.target.value)} />
                    </div>
                    <div>
                      <label htmlFor="c-phone" className="field-label">Phone</label>
                      <input id="c-phone" type="tel" className="field" placeholder="(555) 000-0000" value={form.phone} onChange={(e) => set("phone")(e.target.value)} />
                    </div>
                    <div>
                      <label htmlFor="c-interest" className="field-label">I'm interested in</label>
                      <select id="c-interest" className="field" value={form.interest} onChange={(e) => set("interest")(e.target.value)}>
                        <option>Buying</option>
                        <option>Selling</option>
                        <option>Investment</option>
                        <option>Valuation</option>
                        <option>Relocation</option>
                        <option>Something else</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="c-message" className="field-label">Message *</label>
                      <textarea id="c-message" rows={5} className="field resize-none" placeholder="Tell us what you're looking for…" value={form.message} onChange={(e) => set("message")(e.target.value)} />
                    </div>
                  </div>
                  {error && <p className="mt-4 text-sm font-semibold text-red-600">{error}</p>}
                  <button type="submit" className="btn btn-primary mt-7 w-full sm:w-auto">
                    Send Message
                    <Send className="arrow h-4 w-4" aria-hidden="true" />
                  </button>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function ContactCard({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href: string }) {
  return (
    <a href={href} className="group flex items-center gap-5 rounded-2xl border border-line bg-white p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-navy/10">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gold/10 text-gold transition-colors duration-300 group-hover:bg-gold group-hover:text-navy-abyss">
        {icon}
      </span>
      <span>
        <span className="block text-[11px] font-bold uppercase tracking-wider text-muted">{label}</span>
        <span className="mt-1 block font-extrabold text-ink">{value}</span>
      </span>
    </a>
  );
}
