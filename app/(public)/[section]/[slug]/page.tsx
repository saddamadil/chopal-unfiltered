import Link from "next/link";
import Image from "next/image";
import { notFound, permanentRedirect } from "next/navigation";
import { getStory, listStories, taxonomy } from "@/lib/content";
import { NewsCard, Pagination } from "@/components/News";
import ArticleTools from "@/components/ArticleTools";
import PublicForm from "@/components/PublicForm";
import AdSlot from "@/components/AdSlot";
import { db } from "@/lib/db";
import { demoMode, labels, siteUrl } from "@/lib/constants";
import {
  articleUrl,
  cleanHtml,
  dateLabel,
  jsonLd,
  absolute,
  videoEmbed,
} from "@/lib/utils";
type Props = {
  params: Promise<{ section: string; slug: string }>;
  searchParams: Promise<{ page?: string }>;
};
export async function generateMetadata({ params }: Props) {
  const { section, slug } = await params;
  if (["state", "city", "author", "tag"].includes(section)) {
    const t = await taxonomy();
    const list =
      section === "state"
        ? t.states
        : section === "city"
          ? t.cities
          : section === "author"
            ? t.authors
            : t.tags;
    const item = list.find((x) => x.slug === slug);
    return {
      title: item?.name,
      alternates: { canonical: `/${section}/${slug}` },
    };
  }
  const a = await getStory(slug);
  if (!a) return { title: "खबर नहीं मिली" };
  const canonical = a.seo?.canonicalUrl || absolute(articleUrl(a));
  const image = a.seo?.ogImage || a.featuredImage;
  return {
    title: a.seo?.title || a.title,
    description: a.seo?.description || a.excerpt,
    alternates: { canonical },
    robots: {
      index: !demoMode && !a.isDemo && (a.seo?.robotsIndex ?? true),
      follow: a.seo?.robotsFollow ?? true,
    },
    openGraph: {
      type: "article" as const,
      title: a.title,
      description: a.excerpt,
      url: canonical,
      publishedTime: a.publishedAt?.toISOString(),
      modifiedTime: a.updatedAt.toISOString(),
      authors: [a.author.name],
      images: image ? [absolute(image)] : [],
    },
    twitter: {
      card: "summary_large_image" as const,
      title: a.title,
      description: a.excerpt,
      images: image ? [absolute(image)] : [],
    },
  };
}
export default async function Detail({ params, searchParams }: Props) {
  const { section, slug } = await params;
  const p = await searchParams;
  if (["state", "city", "author", "tag"].includes(section)) {
    const t = await taxonomy();
    const list =
      section === "state"
        ? t.states
        : section === "city"
          ? t.cities
          : section === "author"
            ? t.authors
            : t.tags;
    const item = list.find((x) => x.slug === slug);
    if (!item) notFound();
    const results = await listStories({
      [section]: slug,
      page: Number(p.page) || 1,
    });
    return (
      <main id="main" className="wrap listing">
        <span className="eyebrow">
          {section === "author" ? "हमारे लेखक" : "आपके आस-पास"}
        </span>
        <h1>{item.name}</h1>
        {"bio" in item && <p className="listing-intro">{String(item.bio)}</p>}
        <div className="three-grid">
          {results.items.map((a) => (
            <NewsCard key={a.id} story={a} />
          ))}
        </div>
        {!results.total && (
          <p className="empty">अभी कोई खबर प्रकाशित नहीं हुई है।</p>
        )}
        <Pagination {...results} base={`/${section}/${slug}`} />
      </main>
    );
  }
  if (!["news", "opinion", "fact-check", "video"].includes(section)) notFound();
  const a = await getStory(slug);
  if (!a) notFound();
  if (articleUrl(a) !== `/${section}/${slug}`) permanentRedirect(articleUrl(a));
  const [related, comments] = await Promise.all([
    listStories({ category: a.category.slug, limit: 4 }),
    demoMode
      ? Promise.resolve([])
      : db.comment.findMany({
          where: { articleId: a.id, approved: true },
          select: { id: true, name: true, content: true, createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 50,
        }),
  ]);
  const embed = a.video?.url ? videoEmbed(a.video.url) : null;
  return (
    <main id="main" className="wrap article-page">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link href="/">होम</Link>
        <span>/</span>
        <Link href={`/${a.category.slug}`}>{a.category.name}</Link>
        <span>/</span>
        <span>खबर</span>
      </nav>
      <div className="article-layout">
        <article>
          <div className="eyebrow">
            {a.isSponsored ? "प्रायोजित सामग्री" : labels[a.type]}{" "}
            {a.isDemo && <span className="demo-tag">डेमो लेख</span>}
          </div>
          <h1>{a.title}</h1>
          <p className="article-deck">{a.excerpt}</p>
          <div className="article-author">
            <Link href={`/author/${a.author.slug}`}>{a.author.name}</Link>
            <span>प्रकाशित: {dateLabel(a.publishedAt)}</span>
            {a.updatedAt.getTime() >
              (a.publishedAt?.getTime() || 0) + 60000 && (
              <span>अपडेट: {dateLabel(a.updatedAt)}</span>
            )}
          </div>
          <ArticleTools id={a.id} title={a.title} demo={demoMode || a.isDemo} />
          {a.isDemo && (
            <p className="notice">
              यह उदाहरण लेख है। इसमें प्रस्तुत सामग्री वास्तविक समाचार या
              सत्यापित तथ्य-जाँच नहीं है।
            </p>
          )}
          {a.featuredImage && (
            <figure className="article-figure">
              <Image
                src={a.featuredImage}
                alt={a.imageAlt || a.title}
                width={1200}
                height={760}
                priority
                unoptimized={/^https?:/.test(a.featuredImage)}
              />
              <figcaption>
                {a.imageCaption} <Link href="/credits">चित्र श्रेय</Link>
              </figcaption>
            </figure>
          )}
          {a.type === "VIDEO" &&
            (embed ? (
              <iframe
                className="video-player"
                src={embed}
                title={a.title}
                allow="fullscreen; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            ) : a.video?.url ? (
              <video
                controls
                className="video-player"
                preload="metadata"
                src={a.video.url}
              />
            ) : (
              <div className="notice">
                इस डेमो में वीडियो संलग्न नहीं है। संपादक CMS से सत्यापित वीडियो
                URL जोड़ सकते हैं।
              </div>
            ))}
          {a.type === "FACT_CHECK" && (
            <div className="fact-detail">
              <h2>दावा</h2>
              <p>{a.claim}</p>
              <h2>निष्कर्ष</h2>
              <strong>{a.verdict}</strong>
            </div>
          )}
          <div
            className="article-body"
            dangerouslySetInnerHTML={{ __html: cleanHtml(a.content) }}
          />
          {a.sources && (
            <section className="sources">
              <h2>स्रोत और संदर्भ</h2>
              <p className="pre-line">{a.sources}</p>
            </section>
          )}
          <AdSlot position="in-article" />
          <div className="tag-row">
            {a.tags.map((t) => (
              <Link key={t.tagId} href={`/tag/${t.tag.slug}`}>
                #{t.tag.name}
              </Link>
            ))}
          </div>
          <div className="author-box">
            <span className="avatar">{a.author.name.slice(0, 1)}</span>
            <div>
              <h2>
                <Link href={`/author/${a.author.slug}`}>{a.author.name}</Link>
              </h2>
              <p>{a.author.bio}</p>
            </div>
          </div>
          <section className="comments">
            <h2>आपकी बात</h2>
            <p>
              सभ्य और विषय से जुड़ी टिप्पणियाँ समीक्षा के बाद प्रकाशित होंगी।
            </p>
            {comments.map((c) => (
              <article className="comment" key={c.id}>
                <strong>{c.name}</strong>
                <small>{dateLabel(c.createdAt)}</small>
                <p>{c.content}</p>
              </article>
            ))}
            <PublicForm kind="comment" articleId={a.id} demo={demoMode} />
          </section>
        </article>
        <aside className="article-sidebar">
          <h2>यह भी पढ़ें</h2>
          {related.items
            .filter((s) => s.id !== a.id)
            .map((s) => (
              <NewsCard key={s.id} story={s} />
            ))}
          <AdSlot position="sidebar" />
        </aside>
      </div>
      {!a.isDemo && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLd({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type":
                    a.type === "OPINION"
                      ? "Article"
                      : a.seo?.schemaType || "NewsArticle",
                  headline: a.title,
                  description: a.excerpt,
                  image: a.featuredImage ? [absolute(a.featuredImage)] : [],
                  datePublished: a.publishedAt?.toISOString(),
                  dateModified: a.updatedAt.toISOString(),
                  author: {
                    "@type": "Person",
                    name: a.author.name,
                    url: `${siteUrl}/author/${a.author.slug}`,
                  },
                  publisher: {
                    "@type": "Organization",
                    name: "Chopal Unfiltered",
                    logo: {
                      "@type": "ImageObject",
                      url: `${siteUrl}/images/logo.png`,
                    },
                  },
                  mainEntityOfPage: absolute(articleUrl(a)),
                  articleBody: cleanHtml(a.content).replace(/<[^>]+>/g, " "),
                  inLanguage: "hi-IN",
                },
                {
                  "@type": "BreadcrumbList",
                  itemListElement: [
                    {
                      "@type": "ListItem",
                      position: 1,
                      name: "होम",
                      item: siteUrl,
                    },
                    {
                      "@type": "ListItem",
                      position: 2,
                      name: a.category.name,
                      item: `${siteUrl}/${a.category.slug}`,
                    },
                    {
                      "@type": "ListItem",
                      position: 3,
                      name: a.title,
                      item: absolute(articleUrl(a)),
                    },
                  ],
                },
              ],
            }),
          }}
        />
      )}
    </main>
  );
}
