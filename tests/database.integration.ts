import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { db } from "../lib/db";
import { hashPassword } from "../lib/password";
import { listStories, getStory, publishDue } from "../lib/content";
const name = new URL(process.env.DATABASE_URL || "mysql://unused/invalid")
  .pathname;
if (!name.endsWith("_test") || process.env.DEMO_MODE === "true")
  throw new Error(
    "Use a dedicated database ending in _test and DEMO_MODE=false.",
  );
test("MySQL publication lifecycle and dynamic public queries", async () => {
  const id = randomUUID();
  let articleId: string | undefined;
  const user = await db.user.create({
    data: {
      name: "Integration test",
      email: `${id}@example.invalid`,
      passwordHash: await hashPassword(randomUUID()),
      role: "EDITOR",
    },
  });
  const category = await db.category.create({
    data: { name: "परीक्षण", slug: `test-${id}` },
  });
  const author = await db.author.create({
    data: {
      name: "परीक्षण लेखक",
      slug: `test-author-${id}`,
      bio: "Integration test only",
      userId: user.id,
    },
  });
  try {
    const a = await db.article.create({
      data: {
        title: "डेटाबेस परीक्षण की खबर",
        slug: `test-story-${id}`,
        excerpt: "यह केवल एक स्वचालित परीक्षण की सामग्री है।",
        content: "<p>यह प्रकाशन प्रक्रिया की स्वचालित जाँच है।</p>",
        creatorId: user.id,
        categoryId: category.id,
        authorId: author.id,
        status: "DRAFT",
      },
    });
    articleId = a.id;
    assert.equal(await getStory(a.slug), null);
    await db.article.update({
      where: { id: a.id },
      data: { status: "PUBLISHED", publishedAt: new Date() },
    });
    assert.equal((await getStory(a.slug))?.id, a.id);
    assert.equal((await listStories({ category: category.slug })).total, 1);
    await db.article.update({
      where: { id: a.id },
      data: { title: "बदली हुई डेटाबेस परीक्षण की खबर" },
    });
    assert.equal(
      (await getStory(a.slug))?.title,
      "बदली हुई डेटाबेस परीक्षण की खबर",
    );
    await db.article.update({
      where: { id: a.id },
      data: { status: "ARCHIVED" },
    });
    assert.equal(await getStory(a.slug), null);
    await db.article.update({
      where: { id: a.id },
      data: {
        status: "SCHEDULED",
        scheduledAt: new Date(Date.now() - 1000),
        publishedAt: null,
      },
    });
    await publishDue();
    assert.equal((await getStory(a.slug))?.status, "PUBLISHED");
  } finally {
    if (articleId) await db.article.delete({ where: { id: articleId } });
    await db.author.delete({ where: { id: author.id } });
    await db.category.delete({ where: { id: category.id } });
    await db.user.delete({ where: { id: user.id } });
    await db.$disconnect();
  }
});
