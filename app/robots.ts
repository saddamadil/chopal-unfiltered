export const dynamic = "force-dynamic";
import { demoMode, siteUrl } from "@/lib/constants";
export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: demoMode ? undefined : "/",
      disallow: demoMode ? "/" : ["/admin", "/login", "/api", "/search"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
