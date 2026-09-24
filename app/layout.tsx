import type { Metadata } from "next";
import "@fontsource/noto-sans-devanagari/devanagari-400.css";
import "@fontsource/noto-sans-devanagari/devanagari-600.css";
import "@fontsource/noto-serif-devanagari/devanagari-700.css";
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-600.css";
import "./globals.css";
import { siteUrl, SITE_NAME, TAGLINE, demoMode } from "@/lib/constants";
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${SITE_NAME} | ${TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "देश, राज्य, शहर और ज़मीन से जुड़ी हिंदी खबरें। ग्राउंड रिपोर्ट, ओपिनियन, वीडियो और तथ्य-जाँच।",
  icons: { icon: "/favicon.svg" },
  ...(demoMode ? { robots: { index: false, follow: false } } : {}),
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION || undefined },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hi">
      <body>{children}</body>
    </html>
  );
}
