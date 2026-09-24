import { db } from "../lib/db";
import { hashPassword } from "../lib/password";
import { z } from "zod";
async function main() {
  const email = z.email().parse(process.env.ADMIN_EMAIL).toLowerCase();
  const password = z
    .string()
    .min(14)
    .max(200)
    .parse(process.env.ADMIN_PASSWORD);
  if (await db.user.findUnique({ where: { email } }))
    throw new Error(
      "Account exists. Use the authenticated Users screen to manage it.",
    );
  const u = await db.user.create({
    data: {
      name: process.env.ADMIN_NAME || "Editor",
      email,
      passwordHash: await hashPassword(password),
      role: "SUPER_ADMIN",
    },
  });
  await db.author.create({
    data: {
      name: u.name,
      slug: `editor-${u.id}`,
      bio: "संपादकीय टीम",
      userId: u.id,
    },
  });
  console.log(
    "Administrator created. Sign in at /login. No credentials are printed.",
  );
}
main()
  .catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
