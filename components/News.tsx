import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Play, CheckCheck } from "lucide-react";
import type { Story } from "@/lib/content";
import { articleUrl, dateLabel } from "@/lib/utils";
import { labels } from "@/lib/constants";
export function StoryImage({
  story,
  priority = false,
}: {
  story: Story;
  priority?: boolean;
}) {
  return story.featuredImage ? (
    <Image
      src={story.featuredImage}
      alt={story.imageAlt || story.title}
      fill
      sizes={
        priority
          ? "200vw"
          : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      }
      priority={priority}
      unoptimized={/^https?:/.test(story.featuredImage)}
      className="story-image"
    />
  ) : (
    <div className="no-image">
      <span>चौपाल</span>
      <small>UNFILTERED</small>
    </div>
  );
}
export function NewsCard({
  story,
  compact = false,
}: {
  story: Story;
  compact?: boolean;
}) {
  return (
    <article className={`news-card ${compact ? "compact-card" : ""}`}>
      <Link href={articleUrl(story)} className="card-picture">
        <StoryImage story={story} />
        {story.type === "VIDEO" && (
          <span className="play-circle">
            <Play fill="currentColor" size={18} />
          </span>
        )}
      </Link>
      <div className="card-copy">
        <div className="story-category">
          {story.isSponsored
            ? "प्रायोजित सामग्री"
            : labels[story.type] || story.category.name}
          {story.isDemo && <span className="demo-tag">डेमो</span>}
        </div>
        <h3>
          <Link href={articleUrl(story)}>{story.title}</Link>
        </h3>
        {!compact && <p>{story.excerpt}</p>}
        <div className="byline">
          {story.author.name}
          <span>·</span>
          {dateLabel(story.publishedAt).split(",")[0]}
        </div>
      </div>
    </article>
  );
}
export function SectionHeading({
  title,
  subtitle,
  href,
  dark = false,
}: {
  title: string;
  subtitle?: string;
  href?: string;
  dark?: boolean;
}) {
  return (
    <div className={`section-heading ${dark ? "on-dark" : ""}`}>
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {href && (
        <Link href={href}>
          सभी देखें <ArrowUpRight size={16} />
        </Link>
      )}
    </div>
  );
}
export function FactCard({ story }: { story: Story }) {
  return (
    <article className="fact-card">
      <div className="eyebrow">
        <CheckCheck size={20} /> फैक्ट चेक{" "}
        {story.isDemo && <span className="demo-tag">डेमो</span>}
      </div>
      <h3>
        <Link href={articleUrl(story)}>{story.title}</Link>
      </h3>
      <p>{story.claim}</p>
      <span className="verdict">{story.verdict || "पड़ताल पढ़ें"}</span>
    </article>
  );
}
export function Pagination({
  page,
  pages,
  base,
  q,
}: {
  page: number;
  pages: number;
  base: string;
  q?: string;
}) {
  if (pages < 2) return null;
  const href = (p: number) =>
    `${base}?${new URLSearchParams({ ...(q ? { q } : {}), page: String(p) })}`;
  return (
    <nav aria-label="पृष्ठ नेविगेशन" className="pagination">
      {page > 1 && <Link href={href(page - 1)}>← पिछला</Link>}
      <span>
        पृष्ठ {page} / {pages}
      </span>
      {page < pages && <Link href={href(page + 1)}>अगला →</Link>}
    </nav>
  );
}
