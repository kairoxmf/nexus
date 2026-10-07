import { Link } from "react-router-dom";
import { ArrowRight, HardHat } from "lucide-react";

export default function NotFound() {
  return (
    <section className="flex min-h-[60vh] items-center py-24">
      <div className="shell text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-xl bg-gold-pale">
          <HardHat className="h-8 w-8 text-gold-dark" aria-hidden="true" />
        </span>
        <p className="eyebrow mt-6">404 — Off the Plans</p>
        <h1 className="mt-3 text-4xl font-extrabold text-ink sm:text-5xl">This Page Isn't in the Drawings.</h1>
        <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-muted">
          The page you're looking for doesn't exist or has moved. Let's get you back to solid ground.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link to="/" className="btn btn-gold">
            Back to Home
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link to="/projects" className="btn btn-outline">
            View Projects
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
