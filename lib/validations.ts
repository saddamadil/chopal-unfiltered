import { z } from "zod";
import { statuses, types } from "./constants";
import { safeUrl } from "./utils";
const text = z.string().trim();
export const optionalUrl = text
  .max(500)
  .refine((v) => !v || !!safeUrl(v), "मान्य URL दर्ज करें।");
export const slug = text
  .min(2)
  .max(150)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug में छोटे अंग्रेज़ी अक्षर, अंक और हाइफ़न रखें।",
  );
export const articleSchema = z
  .object({
    id: text.optional(),
    version: z.coerce.number().int().optional(),
    title: text.min(10).max(250),
    slug,
    excerpt: text.min(20).max(1000),
    content: text.min(30).max(200000),
    categoryId: text.min(1),
    subcategoryId: text.nullable().optional(),
    authorId: text.min(1),
    stateId: text.nullable().optional(),
    cityId: text.nullable().optional(),
    location: text.max(191).optional(),
    featuredImage: optionalUrl,
    imageAlt: text.max(250),
    imageCaption: text.max(2000),
    type: z.enum(types),
    status: z.enum(statuses),
    scheduledAt: text.optional(),
    isFeatured: z.boolean(),
    isTrending: z.boolean(),
    isBreaking: z.boolean(),
    isSponsored: z.boolean(),
    isDemo: z.boolean(),
    claim: text.max(5000),
    verdict: text.max(100),
    sources: text.max(10000),
    seoTitle: text.max(250),
    seoDescription: text.max(1000),
    canonicalUrl: optionalUrl,
    ogImage: optionalUrl,
    focusKeyword: text.max(191),
    schemaType: z.enum(["NewsArticle", "Article", "BlogPosting"]),
    robotsIndex: z.boolean(),
    robotsFollow: z.boolean(),
    videoUrl: optionalUrl,
    duration: text.max(20),
    tagIds: z.array(text).max(20),
  })
  .superRefine((v, c) => {
    if (v.featuredImage && !v.imageAlt)
      c.addIssue({
        code: "custom",
        message: "तस्वीर का अर्थपूर्ण alt text ज़रूरी है।",
        path: ["imageAlt"],
      });
    if (
      v.status === "SCHEDULED" &&
      (!v.scheduledAt ||
        !Number.isFinite(Date.parse(v.scheduledAt)) ||
        new Date(v.scheduledAt) <= new Date())
    )
      c.addIssue({
        code: "custom",
        message: "आने वाले समय की प्रकाशन तारीख चुनें।",
        path: ["scheduledAt"],
      });
    if (
      ["PUBLISHED", "SCHEDULED"].includes(v.status) &&
      v.type === "FACT_CHECK" &&
      (!v.claim || !v.verdict || !v.sources)
    )
      c.addIssue({
        code: "custom",
        message: "फैक्ट चेक में दावा, निष्कर्ष और स्रोत ज़रूरी हैं।",
      });
    if (
      ["PUBLISHED", "SCHEDULED"].includes(v.status) &&
      v.type === "VIDEO" &&
      !v.videoUrl &&
      !v.isDemo
    )
      c.addIssue({ code: "custom", message: "वीडियो का URL ज़रूरी है।" });
  });
export const publicSchema = z.object({
  kind: z.enum(["newsletter", "comment", "contact"]),
  name: text.max(100).optional(),
  email: z.email().max(191),
  subject: text.max(191).optional(),
  message: text.max(5000).optional(),
  articleId: text.optional(),
  consent: z.literal("yes"),
  website: text.max(0).optional(),
});
