import { db } from "@/lib/db";
import { demoMode, siteUrl } from "@/lib/constants";
import { xml, articleUrl } from "@/lib/utils";
import { publishDue } from "@/lib/content";
export const dynamic = "force-dynamic";
export async function GET() {
  await publishDue();
  const items = demoMode
    ? []
    : await db.article.findMany({
        where: {
          status: "PUBLISHED",
          isDemo: false,
          publishedAt: { lte: new Date() },
        },
        orderBy: { publishedAt: "desc" },
        take: 50,
      });
  const content = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Chopal Unfiltered</title><link>${xml(siteUrl)}</link><description>आपकी भाषा में, आपकी आवाज़</description><language>hi-IN</language>${items.map((a) => `<item><title>${xml(a.title)}</title><link>${xml(siteUrl + articleUrl(a))}</link><guid>${xml(siteUrl + articleUrl(a))}</guid><description>${xml(a.excerpt)}</description><pubDate>${a.publishedAt!.toUTCString()}</pubDate></item>`).join("")}</channel></rss>`;
  return new Response(content, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=60",
    },
  });
}
