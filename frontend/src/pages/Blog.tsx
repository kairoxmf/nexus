import { useMemo, useState } from "react";
import PageHero from "../components/ui/PageHero";
import BlogCard from "../components/blog/BlogCard";
import Reveal from "../components/ui/Reveal";
import CtaSection from "../components/common/CtaSection";
import { BLOG_CATEGORIES, POSTS } from "../data/site";

export default function Blog() {
  const [category, setCategory] = useState("All");

  const posts = useMemo(
    () => (category === "All" ? POSTS : POSTS.filter((p) => p.category === category)),
    [category],
  );

  return (
    <>
      <PageHero
        eyebrow="Insights & News"
        title="From the Field and the Boardroom."
        description="Practical thinking on construction, engineering, safety and where the industry is heading."
      />

      <section className="py-14 lg:py-16">
        <div className="shell">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter articles by category">
            {BLOG_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                aria-pressed={category === cat}
                className={`rounded-full px-4 py-2 text-[12.5px] font-bold transition-all duration-200 ${
                  category === cat
                    ? "bg-navy-darker text-white"
                    : "bg-mist text-ink/70 hover:bg-gold-pale hover:text-navy-darker"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {posts.length > 0 ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post, i) => (
                <Reveal key={post.slug} delay={(i % 3) * 80}>
                  <BlogCard post={post} />
                </Reveal>
              ))}
            </div>
          ) : (
            <p className="mt-10 rounded-xl border border-dashed border-line bg-mist px-8 py-16 text-center text-[14px] text-muted">
              No articles in this category yet — check back soon.
            </p>
          )}
        </div>
      </section>

      <CtaSection
        eyebrow="LET'S BUILD"
        title="Turn Insight Into Your Next Project."
        text="Our pre-construction team applies everything we publish — and everything we learn on site — to your project."
        ctaLabel="Request a Quote"
        ctaTo="/contact"
        image="https://images.unsplash.com/photo-1541123437800-1bb1317badc2?auto=format&fit=crop&w=1800&q=80"
      />
    </>
  );
}
