"use server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import {
  assertOrigin,
  rateLimit,
  rateLimitKey,
  createSession,
  digest,
} from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import { z } from "zod";
export async function login(_: unknown, form: FormData) {
  try {
    await assertOrigin();
    await rateLimit("login", 30);
    const d = z
      .object({
        email: z.email().max(191),
        password: z.string().min(1).max(200),
      })
      .safeParse(Object.fromEntries(form));
    if (!d.success) return { error: "ईमेल और पासवर्ड दर्ज करें।" };
    const email = d.data.email.toLowerCase();
    await rateLimitKey(`login-email:${email}`, 10, 15 * 60 * 1000);
    const user = await db.user.findUnique({ where: { email } });
    const fallback =
      "scrypt:00112233445566778899aabbccddeeff:" + "0".repeat(128);
    const valid = await verifyPassword(
      d.data.password,
      user?.passwordHash || fallback,
    );
    if (!user || !user.active || !valid)
      return { error: "ईमेल या पासवर्ड सही नहीं है।" };
    await createSession(user.id);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "लॉगिन नहीं हो पाया।" };
  }
  redirect("/admin");
}
export async function logout() {
  await assertOrigin();
  const c = await cookies();
  const token = c.get("chopal_session")?.value;
  if (token)
    await db.session.deleteMany({ where: { tokenHash: digest(token) } });
  c.delete("chopal_session");
  redirect("/");
}
