import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SectionHeading from "../ui/SectionHeading";
import Reveal from "../ui/Reveal";
import BlogCard from "../blog/BlogCard";
import { POSTS } from "../../data/site";

/** Latest insights from the company blog. */
export default function BlogSection() {
  const latest = POSTS.slice(0, 3);

  return (
    <section className="bg-ivory py-20 lg:py-24">
      <div className="shell">
        <SectionHeading
          eyebrow="Latest News"
          title="Insights From the Field."
          action={
            <Link to="/blog" className="btn btn-outline">
              View All Articles
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          }
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {latest.map((post, i) => (
            <Reveal key={post.slug} delay={i * 100}>
              <BlogCard post={post} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
