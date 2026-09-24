import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { demoMode, siteUrl, policyPages } from "@/lib/constants";
import { articleUrl } from "@/lib/utils";
import { publishDue } from "@/lib/content";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (demoMode) return [];
  await publishDue();
  const [articles, categories, authors, states, cities] = await Promise.all([
    db.article.findMany({
      where: {
        status: "PUBLISHED",
        isDemo: false,
        publishedAt: { lte: new Date() },
        OR: [{ seo: null }, { seo: { robotsIndex: true } }],
      },
      select: { slug: true, type: true, updatedAt: true },
    }),
    db.category.findMany(),
    db.author.findMany(),
    db.state.findMany(),
    db.city.findMany(),
  ]);
  return [
    { url: siteUrl },
    ...Object.keys(policyPages).map((p) => ({ url: `${siteUrl}/${p}` })),
    ...articles.map((a) => ({
      url: `${siteUrl}${articleUrl(a)}`,
      lastModified: a.updatedAt,
    })),
    ...categories.map((c) => ({ url: `${siteUrl}/${c.slug}` })),
    ...authors.map((a) => ({ url: `${siteUrl}/author/${a.slug}` })),
    ...states.map((s) => ({ url: `${siteUrl}/state/${s.slug}` })),
    ...cities.map((c) => ({ url: `${siteUrl}/city/${c.slug}` })),
  ];
}
