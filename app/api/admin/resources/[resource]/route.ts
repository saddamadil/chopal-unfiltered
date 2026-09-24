import { readJson } from "@/lib/request";
import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { assertOrigin, currentUser } from "@/lib/auth";
import { canPublish, canManage } from "@/lib/permissions";
import { resources } from "@/lib/resources";
import { safeUrl, cleanHtml } from "@/lib/utils";
import { hashPassword } from "@/lib/password";
async function handle(req: Request, resource: string, deleting = false) {
  try {
    await assertOrigin();
    const spec = resources[resource];
    const user = await currentUser();
    if (
      !spec ||
      !user ||
      !canPublish(user.role) ||
      (spec.adminOnly && !canManage(user.role)) ||
      spec.readOnly
    )
      return new Response(null, { status: 403 });
    const input = await readJson(req);
    const id = typeof input.id === "string" ? input.id : undefined;
    const model = (db as any)[spec.model];
    const existing = id ? await model.findUnique({ where: { id } }) : null;
    if (id && !existing && resource !== "settings")
      return NextResponse.json(
        { error: "रिकॉर्ड नहीं मिला।" },
        { status: 404 },
      );
    if (
      resource === "users" &&
      existing &&
      (existing.id === user.id ||
        (existing.role === "SUPER_ADMIN" && user.role !== "SUPER_ADMIN"))
    )
      return NextResponse.json(
        { error: "इस खाते को यहाँ बदल नहीं सकते।" },
        { status: 403 },
      );
    if (
      resource === "users" &&
      existing?.role === "SUPER_ADMIN" &&
      (deleting || input.role !== "SUPER_ADMIN" || !input.active) &&
      (await db.user.count({ where: { role: "SUPER_ADMIN", active: true } })) <=
        1
    )
      return NextResponse.json(
        { error: "कम से कम एक सक्रिय SUPER_ADMIN ज़रूरी है।" },
        { status: 400 },
      );
    if (deleting) {
      await db.$transaction(async (tx) => {
        await (tx as any)[spec.model].delete({ where: { id } });
        await tx.auditLog.create({
          data: { userId: user.id, action: `${resource}:delete`, target: id! },
        });
      });
      return NextResponse.json({ ok: true });
    }
    const data: Record<string, any> = {};
    for (const f of spec.fields) {
      if (f.key === "password") continue;
      const raw = input[f.key];
      if (f.type === "checkbox") data[f.key] = !!raw;
      else if (f.type === "number")
        data[f.key] = z.coerce
          .number()
          .int()
          .min(0)
          .max(1000)
          .parse(raw || 0);
      else if (f.type === "datetime-local")
        data[f.key] = raw ? z.coerce.date().parse(raw) : null;
      else {
        let s = z
          .string()
          .trim()
          .max(
            f.type === "textarea"
              ? 20000
              : f.key === "slug"
                ? 150
                : f.key === "url" || f.key === "image"
                  ? 500
                  : 250,
          )
          .parse(raw || "");
        if (f.required && !s) throw new Error("VALIDATION");
        if (f.options && !f.options.includes(s)) throw new Error("VALIDATION");
        if (f.key === "slug" && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s))
          throw new Error("VALIDATION");
        if (["url", "image"].includes(f.key) && s && !safeUrl(s))
          throw new Error("VALIDATION");
        data[f.key] = f.relation && !s ? null : s;
      }
    }
    if (data.startsAt && data.endsAt && data.endsAt <= data.startsAt)
      throw new Error("VALIDATION");
    if (resource === "settings") data.value = cleanHtml(data.value);
    if (resource === "users") {
      data.email = z.email().max(191).parse(data.email).toLowerCase();
      if (user.role !== "SUPER_ADMIN" && data.role === "SUPER_ADMIN")
        return new Response(null, { status: 403 });
      if (input.password)
        data.passwordHash = await hashPassword(
          z.string().min(14).max(200).parse(input.password),
        );
      else if (!existing) throw new Error("VALIDATION");
    }
    const row = await db.$transaction(async (tx) => {
      const m = (tx as any)[spec.model];
      const row = existing
        ? await m.update({ where: { id }, data })
        : await m.create({ data });
      if (resource === "users" && existing)
        await tx.session.deleteMany({ where: { userId: existing.id } });
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: `${resource}:${existing ? "update" : "create"}`,
          target: row.id,
        },
      });
      return row;
    });
    return NextResponse.json({ id: row.id, message: "बदलाव सुरक्षित हो गए।" });
  } catch (e) {
    const conflict =
      e instanceof Prisma.PrismaClientKnownRequestError &&
      (e.code === "P2002" || e.code === "P2003");
    return NextResponse.json(
      {
        error: conflict
          ? "यह रिकॉर्ड पहले से मौजूद है या किसी लेख से जुड़ा है। संबंध हटाकर फिर कोशिश करें।"
          : "विवरण जाँचें। बदलाव सुरक्षित नहीं हो पाया।",
      },
      { status: 400 },
    );
  }
}
export async function POST(
  req: Request,
  { params }: { params: Promise<{ resource: string }> },
) {
  return handle(req, (await params).resource);
}
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ resource: string }> },
) {
  return handle(req, (await params).resource, true);
}
