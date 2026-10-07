import { useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";

const BUDGETS = ["Under $100k", "$100k – $500k", "$500k – $2M", "$2M – $10M", "$10M+"];
const TYPES = [
  "Commercial Construction",
  "Residential Construction",
  "Industrial Construction",
  "Renovation & Remodeling",
  "Construction Management",
  "General Contracting",
  "Design & Build",
  "Infrastructure Development",
  "Other",
];

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  company: string;
  projectType: string;
  location: string;
  budget: string;
  details: string;
}

const EMPTY: FormState = {
  fullName: "",
  email: "",
  phone: "",
  company: "",
  projectType: TYPES[0],
  location: "",
  budget: "",
  details: "",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+()\-.\s\d]{7,20}$/;

type Status = "idle" | "submitting" | "success" | "error";

export default function ContactForm({ defaultDetails = "" }: { defaultDetails?: string }) {
  const [form, setForm] = useState<FormState>({ ...EMPTY, details: defaultDetails });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [status, setStatus] = useState<Status>("idle");

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.fullName.trim()) next.fullName = "Please enter your full name.";
    if (!form.email.trim()) next.email = "Please enter your email address.";
    else if (!EMAIL_RE.test(form.email)) next.email = "Please enter a valid email address.";
    if (form.phone.trim() && !PHONE_RE.test(form.phone)) next.phone = "Please enter a valid phone number.";
    if (form.details.trim().length < 20) next.details = "Please describe your project (at least 20 characters).";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "submitting") return;
    if (!validate()) {
      setStatus("error");
      return;
    }
    setStatus("submitting");
    // No backend in this build — simulate a request round-trip.
    window.setTimeout(() => {
      setStatus("success");
    }, 900);
  };

  if (status === "success") {
    return (
      <div className="fade-in flex flex-col items-center justify-center rounded-xl border border-line bg-mist px-8 py-16 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-gold-pale">
          <CheckCircle2 className="h-8 w-8 text-gold-dark" aria-hidden="true" />
        </span>
        <h3 className="mt-5 text-2xl font-extrabold text-ink">Request Received</h3>
        <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-muted">
          Thank you, {form.fullName.split(" ")[0] || "there"}. Your project request has been sent to our
          pre-construction team — we'll get back to you within one business day.
        </p>
        <button
          type="button"
          onClick={() => {
            setForm(EMPTY);
            setErrors({});
            setStatus("idle");
          }}
          className="btn btn-outline mt-7 text-[13px]"
        >
          Send Another Request
        </button>
      </div>
    );
  }

  const err = (key: keyof FormState) =>
    errors[key] ? (
      <p className="mt-1.5 flex items-center gap-1.5 text-[12px] font-bold text-red-600" role="alert">
        <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
        {errors[key]}
      </p>
    ) : null;

  return (
    <form onSubmit={onSubmit} noValidate className="rounded-xl border border-line bg-white p-6 shadow-card sm:p-8">
      {status === "error" && Object.keys(errors).length > 0 && (
        <div className="fade-in mb-5 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3" role="alert">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" aria-hidden="true" />
          <p className="text-[13px] font-semibold text-red-700">
            Please correct the highlighted fields below and resubmit your request.
          </p>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="q-name" className="field-label">
            Full Name <span className="text-gold-dark" aria-hidden="true">*</span>
          </label>
          <input
            id="q-name"
            type="text"
            autoComplete="name"
            value={form.fullName}
            onChange={set("fullName")}
            aria-invalid={!!errors.fullName}
            aria-describedby={errors.fullName ? "q-name-err" : undefined}
            className={`field ${errors.fullName ? "!border-red-400" : ""}`}
            placeholder="John Miller"
          />
          {errors.fullName && <span id="q-name-err">{err("fullName")}</span>}
        </div>
        <div>
          <label htmlFor="q-email" className="field-label">
            Email <span className="text-gold-dark" aria-hidden="true">*</span>
          </label>
          <input
            id="q-email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={set("email")}
            aria-invalid={!!errors.email}
            className={`field ${errors.email ? "!border-red-400" : ""}`}
            placeholder="you@company.com"
          />
          {err("email")}
        </div>
        <div>
          <label htmlFor="q-phone" className="field-label">
            Phone
          </label>
          <input
            id="q-phone"
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={set("phone")}
            aria-invalid={!!errors.phone}
            className={`field ${errors.phone ? "!border-red-400" : ""}`}
            placeholder="(555) 000-0000"
          />
          {err("phone")}
        </div>
        <div>
          <label htmlFor="q-company" className="field-label">
            Company
          </label>
          <input
            id="q-company"
            type="text"
            autoComplete="organization"
            value={form.company}
            onChange={set("company")}
            className="field"
            placeholder="Company name"
          />
        </div>
        <div>
          <label htmlFor="q-type" className="field-label">
            Project Type
          </label>
          <select id="q-type" value={form.projectType} onChange={set("projectType")} className="field">
            {TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="q-location" className="field-label">
            Project Location
          </label>
          <input
            id="q-location"
            type="text"
            value={form.location}
            onChange={set("location")}
            className="field"
            placeholder="City, State"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="q-budget" className="field-label">
            Estimated Budget
          </label>
          <select id="q-budget" value={form.budget} onChange={set("budget")} className="field">
            <option value="">Select a budget range</option>
            {BUDGETS.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="q-details" className="field-label">
            Project Details <span className="text-gold-dark" aria-hidden="true">*</span>
          </label>
          <textarea
            id="q-details"
            rows={5}
            value={form.details}
            onChange={set("details")}
            aria-invalid={!!errors.details}
            className={`field resize-none ${errors.details ? "!border-red-400" : ""}`}
            placeholder="Tell us about your project — scope, timeline, site conditions, goals..."
          />
          {err("details")}
        </div>
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="btn btn-gold mt-7 w-full sm:w-auto disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === "submitting" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Sending Request...
          </>
        ) : (
          <>
            Request a Quote
            <Send className="h-4 w-4" aria-hidden="true" />
          </>
        )}
      </button>
    </form>
  );
}
