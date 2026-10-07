import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Calendar, Clock } from "lucide-react";
import Reveal from "../components/ui/Reveal";
import BlogCard from "../components/blog/BlogCard";
import CtaSection from "../components/common/CtaSection";
import NotFound from "./NotFound";
import { POSTS, getPost } from "../data/site";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPost(slug) : undefined;
  if (!post) return <NotFound />;

  const related = POSTS.filter((p) => p.slug !== post.slug)
    .sort((a, b) => Number(b.category === post.category) - Number(a.category === post.category))
    .slice(0, 3);

  return (
    <>
      <article className="pt-12 lg:pt-16">
        <div className="shell max-w-3xl">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-[13px] font-extrabold text-muted transition-colors hover:text-navy-darker"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            All Articles
          </Link>
          <Reveal className="mt-6">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] font-extrabold uppercase tracking-widest">
              <span className="text-gold-dark">{post.category}</span>
              <span className="h-1 w-1 rounded-full bg-gold" aria-hidden="true" />
              <span className="flex items-center gap-1.5 font-bold tracking-normal text-muted">
                <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                {post.date}
              </span>
              <span className="flex items-center gap-1.5 font-bold tracking-normal text-muted">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                {post.readTime}
              </span>
            </div>
            <h1 className="mt-4 text-3xl font-extrabold leading-[1.12] text-ink sm:text-4xl lg:text-[44px]">
              {post.title}
            </h1>
          </Reveal>
        </div>

        <Reveal delay={100} className="shell mt-10 max-w-5xl overflow-hidden rounded-xl shadow-lifted">
          <img
            src={post.image}
            alt={post.title}
            className="aspect-[16/8] w-full object-cover"
          />
        </Reveal>

        <div className="shell mt-12 max-w-3xl pb-16 lg:pb-20">
          {post.body.map((paragraph, i) => (
            <Reveal key={i} delay={Math.min(i, 2) * 60}>
              <p className="mt-6 text-[15.5px] leading-[1.85] text-ink/80 first-of-type:mt-0">
                {paragraph}
              </p>
            </Reveal>
          ))}

          <div className="mt-12 rounded-xl border border-line bg-mist p-7">
            <p className="text-[14.5px] font-semibold leading-relaxed text-ink">
              Want this thinking applied to your project?{" "}
              <Link to="/contact" className="inline-flex items-center gap-1 font-extrabold text-gold-dark hover:text-navy-darker">
                Talk to our team
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </p>
          </div>
        </div>
      </article>

      <section className="bg-ivory py-16 lg:py-20">
        <div className="shell">
          <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">Keep Reading</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((rel, i) => (
              <Reveal key={rel.slug} delay={i * 90}>
                <BlogCard post={rel} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CtaSection
        eyebrow="GET STARTED"
        title="Start Your Project With Us."
        text="Tell us about your goals and receive a detailed proposal from our pre-construction team within one business day."
        ctaLabel="Request a Quote"
        ctaTo="/contact"
        image={post.image}
      />
    </>
  );
}
