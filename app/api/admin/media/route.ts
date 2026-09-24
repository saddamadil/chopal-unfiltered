import { readLimited } from "@/lib/request";
import { readJson } from "@/lib/request";
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { db } from "@/lib/db";
import { currentUser, assertOrigin, audit } from "@/lib/auth";
import { canPublish } from "@/lib/permissions";
export async function POST(req: Request) {
  let paths: string[] = [];
  try {
    await assertOrigin();
    const user = await currentUser();
    if (!user) return new Response(null, { status: 401 });
    if (Number(req.headers.get("content-length") || 0) > 6 * 1024 * 1024)
      return NextResponse.json(
        { error: "अधिकतम फ़ाइल आकार 5 MB है।" },
        { status: 413 },
      );
    const bytesBody = await readLimited(req, 6 * 1024 * 1024);
    const f = await new Response(bytesBody, {
      headers: { "Content-Type": req.headers.get("content-type") || "" },
    }).formData();
    const file = f.get("file");
    const alt = String(f.get("alt") || "").trim();
    if (
      !(file instanceof File) ||
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 5 * 1024 * 1024 ||
      alt.length < 5 ||
      alt.length > 250
    )
      return NextResponse.json(
        { error: "JPG, PNG या WebP (5 MB तक) और अर्थपूर्ण alt text दें।" },
        { status: 400 },
      );
    const bytes = Buffer.from(await file.arrayBuffer());
    const img = sharp(bytes, { limitInputPixels: 40000000, animated: false });
    const meta = await img.metadata();
    if (!["jpeg", "png", "webp"].includes(meta.format || ""))
      throw new Error("Invalid image");
    const id = randomUUID();
    const dir = path.resolve(process.env.UPLOAD_DIR || "uploads");
    await mkdir(dir, { recursive: true });
    const large = await img
      .rotate()
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer({ resolveWithObject: true });
    const small = await sharp(large.data)
      .resize({ width: 480, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
    paths = [path.join(dir, `${id}.webp`), path.join(dir, `${id}-thumb.webp`)];
    await Promise.all([
      writeFile(paths[0], large.data, { flag: "wx" }),
      writeFile(paths[1], small, { flag: "wx" }),
    ]);
    const media = await db.$transaction(async (tx) => {
      const saved = await tx.media.create({
        data: {
          url: `/media/${id}.webp`,
          thumbnail: `/media/${id}-thumb.webp`,
          alt,
          caption: String(f.get("caption") || "").slice(0, 2000),
          width: large.info.width,
          height: large.info.height,
          size: large.data.length,
          uploaderId: user.id,
        },
      });
      await tx.auditLog.create({
        data: { userId: user.id, action: "media:upload", target: saved.id },
      });
      return saved;
    });
    return NextResponse.json({ media });
  } catch {
    await Promise.all(paths.map((p) => unlink(p).catch(() => {})));
    return NextResponse.json(
      { error: "तस्वीर अपलोड नहीं हो सकी। फ़ाइल और विवरण जाँचें।" },
      { status: 400 },
    );
  }
}
export async function PATCH(req: Request) {
  try {
    await assertOrigin();
    const user = await currentUser();
    if (!user) return new Response(null, { status: 401 });
    const d = await readJson(req);
    const media = await db.media.findUnique({ where: { id: String(d.id) } });
    if (!media || (!canPublish(user.role) && media.uploaderId !== user.id))
      return new Response(null, { status: 403 });
    const alt = String(d.alt || "").trim();
    if (alt.length < 5 || alt.length > 250) throw new Error();
    await db.media.update({
      where: { id: media.id },
      data: { alt, caption: String(d.caption || "").slice(0, 2000) },
    });
    await audit(user.id, "media:update", media.id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "विवरण सुरक्षित नहीं हुए।" },
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
    const m = await db.media.findUniqueOrThrow({ where: { id: String(id) } });
    const refs = await Promise.all([
      db.article.count({
        where: {
          OR: [
            { featuredImage: m.url },
            { content: { contains: m.url } },
            { seo: { ogImage: m.url } },
          ],
        },
      }),
      db.author.count({ where: { image: m.url } }),
      db.advertisement.count({ where: { image: m.url } }),
    ]);
    if (refs.some(Boolean))
      return NextResponse.json(
        {
          error:
            "यह तस्वीर उपयोग में है। पहले संबंधित लेख या विज्ञापन से हटाएँ।",
        },
        { status: 409 },
      );
    await db.media.delete({ where: { id: m.id } });
    const dir = path.resolve(process.env.UPLOAD_DIR || "uploads");
    await Promise.all(
      [m.url, m.thumbnail].map((u) =>
        unlink(path.join(dir, path.basename(u))).catch(() => {}),
      ),
    );
    await audit(user.id, "media:delete", m.id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "तस्वीर हटाई नहीं जा सकी।" },
      { status: 400 },
    );
  }
}
