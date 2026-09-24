import { cache } from "react";
import { Prisma } from "@prisma/client";
import { db } from "./db";
import { demoMode } from "./constants";
import {
  demoArticles,
  authors,
  categories,
  states,
  cities,
  tags,
  breaking,
} from "./demo";
export const includeArticle = {
  category: true,
  author: true,
  state: true,
  city: true,
  seo: true,
  video: true,
  tags: { include: { tag: true } },
} satisfies Prisma.ArticleInclude;
export type Story = Prisma.ArticleGetPayload<{
  include: typeof includeArticle;
}>;
export const publishDue = cache(async function publishDue() {
  if (!demoMode)
    await db.article.updateMany({
      where: { status: "SCHEDULED", scheduledAt: { lte: new Date() } },
      data: {
        status: "PUBLISHED",
        publishedAt: new Date(),
        version: { increment: 1 },
      },
    });
});
export async function listStories(
  options: {
    q?: string;
    category?: string;
    type?: string;
    state?: string;
    city?: string;
    author?: string;
    tag?: string;
    page?: number;
    limit?: number;
    featured?: boolean;
  } = {},
) {
  const page = Math.max(1, options.page || 1),
    take = Math.min(50, options.limit || 12);
  if (demoMode) {
    let all = demoArticles() as unknown as Story[];
    if (options.q) {
      const q = options.q.toLocaleLowerCase();
      all = all.filter((a) =>
        [
          a.title,
          a.excerpt,
          a.author.name,
          a.category.name,
          a.state?.name,
          a.city?.name,
          ...a.tags.map((t) => t.tag.name),
        ]
          .join(" ")
          .toLocaleLowerCase()
          .includes(q),
      );
    }
    all = all.filter(
      (a) =>
        (!options.category || a.category.slug === options.category) &&
        (!options.type || a.type === options.type) &&
        (!options.state || a.state?.slug === options.state) &&
        (!options.city || a.city?.slug === options.city) &&
        (!options.author || a.author.slug === options.author) &&
        (!options.tag || a.tags.some((t) => t.tag.slug === options.tag)) &&
        (!options.featured || a.isFeatured),
    );
    return {
      items: all.slice((page - 1) * take, page * take),
      total: all.length,
      page,
      pages: Math.ceil(all.length / take),
    };
  }
  await publishDue();
  const q = options.q?.slice(0, 150);
  const where: Prisma.ArticleWhereInput = {
    status: "PUBLISHED",
    publishedAt: { lte: new Date() },
    ...(options.category ? { category: { slug: options.category } } : {}),
    ...(options.type ? { type: options.type as any } : {}),
    ...(options.state ? { state: { slug: options.state } } : {}),
    ...(options.city ? { city: { slug: options.city } } : {}),
    ...(options.author ? { author: { slug: options.author } } : {}),
    ...(options.tag ? { tags: { some: { tag: { slug: options.tag } } } } : {}),
    ...(options.featured ? { isFeatured: true } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q } },
            { excerpt: { contains: q } },
            { author: { name: { contains: q } } },
            { category: { name: { contains: q } } },
            { state: { name: { contains: q } } },
            { city: { name: { contains: q } } },
            { tags: { some: { tag: { name: { contains: q } } } } },
          ],
        }
      : {}),
  };
  const [items, total] = await Promise.all([
    db.article.findMany({
      where,
      include: includeArticle,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * take,
      take,
    }),
    db.article.count({ where }),
  ]);
  return { items, total, page, pages: Math.ceil(total / take) };
}
export async function getStory(slug: string) {
  if (demoMode)
    return demoArticles().find((a) => a.slug === slug) as unknown as
      Story | undefined;
  await publishDue();
  return db.article.findFirst({
    where: { slug, status: "PUBLISHED", publishedAt: { lte: new Date() } },
    include: includeArticle,
  });
}
export async function taxonomy() {
  if (demoMode)
    return { authors, categories, states, cities, tags, subcategories: [] };
  const [a, c, s, ci, t, sub] = await Promise.all([
    db.author.findMany(),
    db.category.findMany(),
    db.state.findMany(),
    db.city.findMany(),
    db.tag.findMany(),
    db.subcategory.findMany(),
  ]);
  return {
    authors: a,
    categories: c,
    states: s,
    cities: ci,
    tags: t,
    subcategories: sub,
  };
}
export async function breakingItems() {
  if (demoMode) return breaking.filter((b) => b.active);
  const now = new Date();
  return db.breakingNews.findMany({
    where: {
      active: true,
      AND: [
        { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
        { OR: [{ endsAt: null }, { endsAt: { gt: now } }] },
      ],
    },
    orderBy: { priority: "desc" },
    take: 5,
  });
}
export async function setting(key: string, fallback = "") {
  if (demoMode) return fallback;
  return (
    (await db.setting.findUnique({ where: { id: key } }))?.value || fallback
  );
}
