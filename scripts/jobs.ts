import { db } from "../lib/db";
async function main() {
  const now = new Date();
  const result = await db.article.updateMany({
    where: { status: "SCHEDULED", scheduledAt: { lte: now } },
    data: { status: "PUBLISHED", publishedAt: now, version: { increment: 1 } },
  });
  await db.session.deleteMany({ where: { expiresAt: { lt: now } } });
  await db.rateLimit.deleteMany({ where: { expiresAt: { lt: now } } });
  console.log(
    `Published ${result.count} due articles; expired sessions and request counters cleaned.`,
  );
}
main()
  .catch(() => {
    console.error("Job failed. Check the database connection.");
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
