import { readJson } from "@/lib/request";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { currentUser, assertOrigin, audit } from "@/lib/auth";
import { articleSchema } from "@/lib/validations";
import { canEditArticle, canChooseStatus, canPublish } from "@/lib/permissions";
import { cleanHtml } from "@/lib/utils";
export async function POST(req: Request) {
  try {
    await assertOrigin();
    const user = await currentUser();
    if (!user)
      return NextResponse.json({ error: "लॉगिन करें।" }, { status: 401 });
    const raw = await readJson(req);
    const parsed = articleSchema.safeParse(raw);
    if (!parsed.success)
      return NextResponse.json(
        { error: parsed.error.issues.map((i) => i.message).join(" ") },
        { status: 400 },
      );
    const d = parsed.data;
    const old = d.id
      ? await db.article.findUnique({ where: { id: d.id } })
      : null;
    if (old && !d.version)
      return NextResponse.json(
        { error: "लेख का संस्करण आवश्यक है।" },
        { status: 400 },
      );
    if (d.id && !old)
      return NextResponse.json({ error: "लेख नहीं मिला।" }, { status: 404 });
    if (
      (old && !canEditArticle(user.role, user.id, old)) ||
      !canChooseStatus(user.role, d.status)
    )
      return NextResponse.json(
        { error: "इस लेख या स्थिति के लिए अनुमति नहीं है।" },
        { status: 403 },
      );
    if (!canPublish(user.role)) {
      const author = await db.author.findUnique({ where: { id: d.authorId } });
      if (author?.userId !== user.id)
        return NextResponse.json(
          { error: "केवल अपनी लेखक प्रोफ़ाइल चुनें।" },
          { status: 403 },
        );
    }
    if (d.cityId) {
      const city = await db.city.findUnique({ where: { id: d.cityId } });
      if (!city || city.stateId !== d.stateId)
        return NextResponse.json(
          { error: "शहर और राज्य का चयन मेल नहीं खाता।" },
          { status: 400 },
        );
    }
    if (d.subcategoryId) {
      const sub = await db.subcategory.findUnique({
        where: { id: d.subcategoryId },
      });
      if (!sub || sub.categoryId !== d.categoryId)
        return NextResponse.json(
          { error: "उपश्रेणी सही श्रेणी में चुनें।" },
          { status: 400 },
        );
    }
    const content = cleanHtml(d.content);
    if (content.replace(/<[^>]*>/g, "").trim().length < 30)
      return NextResponse.json(
        { error: "लेख में कम से कम 30 अक्षरों की सामग्री लिखें।" },
        { status: 400 },
      );
    const data = {
      title: d.title,
      slug: d.slug,
      excerpt: d.excerpt,
      content,
      featuredImage: d.featuredImage || null,
      imageAlt: d.imageAlt || null,
      imageCaption: d.imageCaption || null,
      categoryId: d.categoryId,
      subcategoryId: d.subcategoryId || null,
      authorId: d.authorId,
      stateId: d.stateId || null,
      cityId: d.cityId || null,
      location: d.location || null,
      type: d.type,
      status: d.status,
      scheduledAt: d.status === "SCHEDULED" ? new Date(d.scheduledAt!) : null,
      publishedAt:
        d.status === "PUBLISHED"
          ? old?.publishedAt || new Date()
          : old?.publishedAt || null,
      isFeatured: canPublish(user.role) ? d.isFeatured : false,
      isTrending: canPublish(user.role) ? d.isTrending : false,
      isBreaking: canPublish(user.role) ? d.isBreaking : false,
      isSponsored: d.isSponsored,
      isDemo: d.isDemo,
      claim: d.claim || null,
      verdict: d.verdict || null,
      sources: d.sources || null,
    };
    const seo = {
      title: d.seoTitle || null,
      description: d.seoDescription || null,
      focusKeyword: d.focusKeyword || null,
      canonicalUrl: d.canonicalUrl || null,
      ogImage: d.ogImage || null,
      schemaType: d.schemaType,
      robotsIndex: d.robotsIndex,
      robotsFollow: d.robotsFollow,
    };
    const article = await db.$transaction(async (tx) => {
      let id: string;
      if (old) {
        const changed = await tx.article.updateMany({
          where: { id: old.id, version: d.version },
          data: { ...data, version: { increment: 1 } },
        });
        if (changed.count !== 1) throw new Error("CONFLICT");
        await tx.articleRevision.create({
          data: {
            articleId: old.id,
            editedBy: user.id,
            snapshot: JSON.parse(JSON.stringify(old)),
          },
        });
        id = old.id;
        await tx.articleTag.deleteMany({ where: { articleId: id } });
      } else {
        id = (
          await tx.article.create({ data: { ...data, creatorId: user.id } })
        ).id;
      }
      await tx.seoMetadata.upsert({
        where: { articleId: id },
        create: { ...seo, articleId: id },
        update: seo,
      });
      if (d.type === "VIDEO")
        await tx.video.upsert({
          where: { articleId: id },
          create: {
            articleId: id,
            url: d.videoUrl,
            duration: d.duration || null,
          },
          update: { url: d.videoUrl, duration: d.duration || null },
        });
      else await tx.video.deleteMany({ where: { articleId: id } });
      if (d.tagIds.length)
        await tx.articleTag.createMany({
          data: [...new Set(d.tagIds)].map((tagId) => ({
            articleId: id,
            tagId,
          })),
        });
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: `article:${d.status.toLowerCase()}`,
          target: id,
        },
      });
      return tx.article.findUniqueOrThrow({
        where: { id },
        select: { id: true, version: true },
      });
    });
    return NextResponse.json({ article, message: "लेख सुरक्षित हो गया।" });
  } catch (e) {
    if (e instanceof Error && e.message === "CONFLICT")
      return NextResponse.json(
        {
          error:
            "किसी अन्य संपादक ने बदलाव किया है। पेज दोबारा खोलकर नवीनतम संस्करण लें।",
        },
        { status: 409 },
      );
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")
      return NextResponse.json(
        { error: "यह slug पहले से उपयोग हो रहा है। दूसरा slug चुनें।" },
        { status: 409 },
      );
    return NextResponse.json(
      { error: "लेख सुरक्षित नहीं हुआ। चयन और कनेक्शन जाँचें।" },
      { status: 400 },
    );
  }
}
export async function DELETE(req: Request) {
  try {
    await assertOrigin();
    const user = await currentUser();
    if (!user || !canPublish(user.role))
      return new Response(null, { status: 403 });
    const { id } = await readJson(req);
    await db.$transaction([
      db.article.delete({ where: { id: String(id) } }),
      db.auditLog.create({
        data: { userId: user.id, action: "article:delete", target: String(id) },
      }),
    ]);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "लेख हटाया नहीं जा सका।" },
      { status: 400 },
    );
  }
}
