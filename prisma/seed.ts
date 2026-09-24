import { db } from "../lib/db";
import {
  authors,
  categories,
  states,
  cities,
  tags,
  demoArticles,
  breaking,
} from "../lib/demo";
import { hashPassword } from "../lib/password";
async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 14)
    throw new Error(
      "Set ADMIN_EMAIL and a unique ADMIN_PASSWORD of at least 14 characters.",
    );
  const user = await db.user.upsert({
    where: { email },
    update: {},
    create: {
      name: process.env.ADMIN_NAME || "Editor",
      email,
      passwordHash: await hashPassword(password),
      role: "SUPER_ADMIN",
    },
  });
  for (const c of categories)
    await db.category.upsert({ where: { id: c.id }, update: {}, create: c });
  for (const a of authors)
    await db.author.upsert({ where: { id: a.id }, update: {}, create: a });
  for (const s of states)
    await db.state.upsert({ where: { id: s.id }, update: {}, create: s });
  for (const c of cities)
    await db.city.upsert({ where: { id: c.id }, update: {}, create: c });
  for (const t of tags)
    await db.tag.upsert({ where: { id: t.id }, update: {}, create: t });
  for (const a of demoArticles()) {
    const {
      category,
      author,
      state,
      city,
      tags: articleTags,
      comments,
      seo,
      video,
      publishedAt,
      createdAt,
      updatedAt,
      ...data
    } = a;
    await db.article.upsert({
      where: { id: a.id },
      update: {},
      create: {
        ...data,
        type: data.type as any,
        status: "PUBLISHED",
        creatorId: user.id,
        publishedAt: new Date(),
        tags: { create: articleTags.map((t) => ({ tagId: t.tagId })) },
        ...(video ? { video: { create: { url: video.url } } } : {}),
      },
    });
  }
  for (const b of breaking)
    await db.breakingNews.upsert({
      where: { id: b.id },
      update: {},
      create: b,
    });
  console.log(
    "Seed complete: 30 clearly marked demo articles, 10 categories/authors/tags, 5 states, 10 cities, 5 videos/opinions/fact checks/breaking records.",
  );
}
main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
