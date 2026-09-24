import { cookies, headers } from "next/headers";
import { createHash, randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { db } from "./db";
import { demoMode, siteUrl } from "./constants";
import type { Role } from "@prisma/client";
export const editors: Role[] = ["SUPER_ADMIN", "ADMIN", "EDITOR"];
export const admins: Role[] = ["SUPER_ADMIN", "ADMIN"];
export const digest = (s: string) =>
  createHash("sha256").update(s).digest("hex");
export async function currentUser() {
  if (demoMode) return null;
  const token = (await cookies()).get("chopal_session")?.value;
  if (!token) return null;
  const s = await db.session.findUnique({
    where: { tokenHash: digest(token) },
    include: { user: true },
  });
  return s && s.expiresAt > new Date() && s.user.active ? s.user : null;
}
export async function requireUser(roles?: Role[]) {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (roles && !roles.includes(user.role))
    throw new Error("आपको इस कार्रवाई की अनुमति नहीं है।");
  return user;
}
export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);
  await db.session.create({
    data: { userId, tokenHash: digest(token), expiresAt },
  });
  (await cookies()).set("chopal_session", token, {
    httpOnly: true,
    secure: new URL(siteUrl).protocol === "https:",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}
export async function assertOrigin() {
  const h = await headers();
  const origin = h.get("origin");
  if (!origin || origin !== new URL(siteUrl).origin)
    throw new Error("अनुरोध का स्रोत मान्य नहीं है।");
  if (demoMode)
    throw new Error(
      "यह केवल पढ़ने योग्य डेमो है। बदलाव के लिए MySQL के साथ वेबसाइट चलाएँ।",
    );
}
export async function rateLimit(
  scope: string,
  limit = 8,
  windowMs = 15 * 60 * 1000,
) {
  const h = await headers();
  const ip =
    process.env.TRUST_PROXY === "true"
      ? h.get("x-forwarded-for")?.split(",")[0].trim() || "unknown"
      : "shared";
  return rateLimitKey(`${scope}:${ip}`, limit, windowMs);
}
export async function rateLimitKey(
  key: string,
  limit: number,
  windowMs: number,
) {
  const window = Math.floor(Date.now() / windowMs);
  const row = await db.rateLimit.upsert({
    where: { id: digest(`${key}:${window}`) },
    create: {
      id: digest(`${key}:${window}`),
      count: 1,
      expiresAt: new Date((window + 1) * windowMs),
    },
    update: { count: { increment: 1 } },
  });
  if (row.count > limit)
    throw new Error("बहुत अधिक प्रयास हुए हैं। कृपया कुछ देर बाद कोशिश करें।");
}
export async function audit(userId: string, action: string, target: string) {
  await db.auditLog.create({ data: { userId, action, target } });
}
