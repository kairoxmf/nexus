import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <section className="flex min-h-[80vh] flex-col items-center justify-center bg-ivory px-6 pt-20 text-center">
      <span className="eyebrow">Error 404</span>
      <h1 className="mt-4 text-5xl font-extrabold text-ink sm:text-6xl">Page Not Found</h1>
      <p className="mt-4 max-w-sm text-muted">
        The page you're looking for doesn't exist — but plenty of exceptional
        properties do.
      </p>
      <Link to="/" className="btn btn-primary mt-9">
        Back to Home
        <ArrowRight className="arrow" aria-hidden="true" />
      </Link>
    </section>
  );
}
