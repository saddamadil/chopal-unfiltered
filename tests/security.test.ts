import test from "node:test";
import assert from "node:assert/strict";
import { hashPassword, verifyPassword } from "../lib/password";
import {
  canEditArticle,
  canChooseStatus,
  canPublish,
  canManage,
} from "../lib/permissions";
import { cleanHtml, safeUrl, videoEmbed, jsonLd } from "../lib/utils";
import { articleSchema } from "../lib/validations";
test("password hashes use unique salts and reject incorrect passwords", async () => {
  const a = await hashPassword("correct horse battery staple"),
    b = await hashPassword("correct horse battery staple");
  assert.notEqual(a, b);
  assert.equal(await verifyPassword("correct horse battery staple", a), true);
  assert.equal(await verifyPassword("wrong", a), false);
});
test("reporters cannot publish, schedule or edit other reporters or published articles", () => {
  for (const role of ["REPORTER", "AUTHOR"] as const) {
    assert.equal(canPublish(role), false);
    assert.equal(canManage(role), false);
    for (const status of ["PUBLISHED", "SCHEDULED", "APPROVED", "ARCHIVED"])
      assert.equal(canChooseStatus(role, status), false);
    assert.equal(
      canEditArticle(role, "a", { creatorId: "b", status: "DRAFT" }),
      false,
    );
    assert.equal(
      canEditArticle(role, "a", { creatorId: "a", status: "PUBLISHED" }),
      false,
    );
    assert.equal(
      canEditArticle(role, "a", { creatorId: "a", status: "DRAFT" }),
      true,
    );
    assert.equal(canChooseStatus(role, "PENDING_REVIEW"), true);
  }
  assert.equal(canPublish("EDITOR"), true);
  assert.equal(canManage("EDITOR"), false);
});
test("rich content removes scripts, event handlers, iframes and unsafe link protocols", () => {
  const s = cleanHtml(
    '<script>alert(1)</script><p onclick="bad()">अच्छी खबर</p><a href="javascript:alert(1)">खोलें</a><iframe src="https://evil.test"></iframe>',
  );
  assert.ok(s.includes("अच्छी खबर"));
  assert.ok(!/script|onclick|iframe|javascript/.test(s));
});
test("URLs reject unsafe protocols and protocol-relative redirects", () => {
  assert.equal(safeUrl("javascript:alert(1)"), "");
  assert.equal(safeUrl("//evil.test"), "");
  assert.equal(safeUrl("/news/story"), "/news/story");
  assert.equal(videoEmbed("https://evil.test/watch?v=abcdefghijk"), null);
  assert.equal(
    videoEmbed("https://www.youtube.com/watch?v=abcdefghijk"),
    "https://www.youtube-nocookie.com/embed/abcdefghijk",
  );
});
test("JSON-LD cannot break out of script element", () =>
  assert.ok(!jsonLd({ x: "</script><script>bad</script>" }).includes("<")));
test("article validation refuses scheduled publishing without a future date", () => {
  const d = {
    title: "एक उदाहरण शीर्षक यहाँ",
    slug: "sample-story",
    excerpt: "एक अर्थपूर्ण और पर्याप्त लंबा विवरण",
    content: "<p>यह एक परीक्षण लेख की पूरी सामग्री है।</p>",
    categoryId: "c",
    authorId: "a",
    featuredImage: "",
    imageAlt: "",
    imageCaption: "",
    type: "NEWS",
    status: "SCHEDULED",
    scheduledAt: "",
    isFeatured: false,
    isTrending: false,
    isBreaking: false,
    isSponsored: false,
    isDemo: false,
    claim: "",
    verdict: "",
    sources: "",
    seoTitle: "",
    seoDescription: "",
    canonicalUrl: "",
    ogImage: "",
    focusKeyword: "",
    schemaType: "NewsArticle",
    robotsIndex: true,
    robotsFollow: true,
    videoUrl: "",
    duration: "",
    tagIds: [],
  };
  assert.equal(articleSchema.safeParse(d).success, false);
  assert.equal(
    articleSchema.safeParse({
      ...d,
      scheduledAt: new Date(Date.now() + 86400000).toISOString(),
    }).success,
    true,
  );
  assert.equal(
    articleSchema.safeParse({
      ...d,
      status: "PUBLISHED",
      featuredImage: "/images/test.jpg",
      imageAlt: "",
    }).success,
    false,
  );
});
