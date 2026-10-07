import PageHero from "../components/ui/PageHero";
import Reveal from "../components/ui/Reveal";

interface LegalProps {
  kind: "privacy" | "terms";
}

const CONTENT = {
  privacy: {
    eyebrow: "Legal",
    title: "Privacy Policy",
    intro:
      "Built Right Construction respects your privacy. This policy explains what information we collect through this website and how we use it.",
    sections: [
      {
        h: "Information We Collect",
        p: "When you submit a quote request or application, we collect the details you provide — such as your name, email, phone number, company and project information. We do not sell your personal information to third parties.",
      },
      {
        h: "How We Use It",
        p: "Your information is used solely to respond to your inquiry, prepare proposals and communicate about your project. Our team stores it securely and retains it only as long as needed for the business relationship.",
      },
      {
        h: "Cookies & Analytics",
        p: "This website uses only essential cookies required for its operation. Any analytics used are anonymized and never combined with personal information you submit.",
      },
      {
        h: "Your Rights",
        p: `You may request access to, correction of, or deletion of your personal information at any time by contacting us at ${"info@builtright.com"}. We respond to every request within 30 days.`,
      },
    ],
  },
  terms: {
    eyebrow: "Legal",
    title: "Terms of Service",
    intro:
      "These terms govern your use of the Built Right Construction website. By using the site, you accept these terms.",
    sections: [
      {
        h: "Use of Content",
        p: "All text, photography and project information on this site are the property of Built Right Construction and may not be reproduced without written permission, except for personal, non-commercial reference.",
      },
      {
        h: "Quote Requests",
        p: "Submitting a request through this site creates an inquiry only — it does not form a contract. All proposals, budgets and schedules are issued in writing and are subject to our standard terms of agreement.",
      },
      {
        h: "Accuracy",
        p: "Project statistics and imagery are representative. Individual results vary by project, site conditions and contract scope.",
      },
      {
        h: "Contact",
        p: "Questions about these terms can be directed to info@builtright.com or by phone at (800) 123-4567.",
      },
    ],
  },
} as const;

export default function Legal({ kind }: LegalProps) {
  const content = CONTENT[kind];
  return (
    <>
      <PageHero eyebrow={content.eyebrow} title={content.title} description={content.intro} />
      <section className="py-16 lg:py-20">
        <div className="shell max-w-3xl">
          {content.sections.map((section, i) => (
            <Reveal key={section.h} delay={Math.min(i, 3) * 60} className="mt-10 first:mt-0">
              <h2 className="text-xl font-extrabold text-ink">{section.h}</h2>
              <p className="mt-3 text-[14.5px] leading-relaxed text-muted">{section.p}</p>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
