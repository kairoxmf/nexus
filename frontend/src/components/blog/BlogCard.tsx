import { Link } from "react-router-dom";
import { ArrowRight, Calendar } from "lucide-react";
import type { Post } from "../../data/site";

export default function BlogCard({ post }: { post: Post }) {
  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-line bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lifted focus-visible:outline-none"
    >
      <div className="aspect-[16/10] overflow-hidden">
        <img
          src={post.image}
          alt={post.title}
          loading="lazy"
          className="zoom-img h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-3 text-[11px] font-extrabold uppercase tracking-widest">
          <span className="text-gold-dark">{post.category}</span>
          <span className="h-1 w-1 rounded-full bg-gold" aria-hidden="true" />
          <span className="flex items-center gap-1 text-muted">
            <Calendar className="h-3 w-3" aria-hidden="true" />
            {post.date}
          </span>
        </div>
        <h3 className="mt-3 text-[17px] font-extrabold leading-snug text-ink transition-colors duration-300 group-hover:text-navy">
          {post.title}
        </h3>
        <p className="mt-2.5 line-clamp-2 text-[13.5px] leading-relaxed text-muted">{post.excerpt}</p>
        <span className="mt-4 inline-flex items-center gap-1.5 pt-1 text-[13px] font-extrabold text-navy-darker">
          Read Article
          <ArrowRight
            className="h-4 w-4 text-gold-dark transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </span>
      </div>
    </Link>
  );
}
