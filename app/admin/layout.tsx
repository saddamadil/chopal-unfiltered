import Link from "next/link";
import {
  LayoutDashboard,
  FileText,
  Radio,
  Image as ImageIcon,
  Settings,
  ExternalLink,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { canManage, canPublish } from "@/lib/permissions";
import { logout } from "@/app/login/actions";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "न्यूज़रूम",
  robots: { index: false, follow: false },
};
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  return (
    <div className="admin-shell">
      <aside className="admin-nav">
        <Link href="/admin" className="admin-brand">
          चौपाल<span>NEWSROOM</span>
        </Link>
        <nav>
          <Link href="/admin">
            <LayoutDashboard size={18} /> डैशबोर्ड
          </Link>
          <Link href="/admin/articles">
            <FileText size={18} /> सभी लेख
          </Link>
          <Link href="/admin/articles/new">＋ नया लेख</Link>
          <Link href="/admin/media">
            <ImageIcon size={18} /> मीडिया लाइब्रेरी
          </Link>
          {canPublish(user.role) && (
            <>
              <Link href="/admin/breaking">
                <Radio size={18} /> ब्रेकिंग न्यूज़
              </Link>
              {[
                ["categories", "श्रेणियाँ"],
                ["subcategories", "उपश्रेणियाँ"],
                ["authors", "लेखक"],
                ["tags", "टैग"],
                ["states", "राज्य"],
                ["cities", "शहर"],
                ["comments", "टिप्पणियाँ"],
                ["messages", "पाठक संदेश"],
              ].map(([s, n]) => (
                <Link key={s} href={`/admin/${s}`}>
                  {n}
                </Link>
              ))}
              <Link href="/admin/articles?type=VIDEO">वीडियो</Link>
              <Link href="/admin/articles?type=OPINION">ओपिनियन</Link>
              <Link href="/admin/articles?type=FACT_CHECK">फैक्ट चेक</Link>
              <Link href="/admin/analytics">एनालिटिक्स</Link>
            </>
          )}
          {canManage(user.role) && (
            <>
              {[
                ["users", "उपयोगकर्ता"],
                ["advertisements", "विज्ञापन"],
                ["settings", "सेटिंग्स व नीतियाँ"],
                ["subscribers", "समाचार पत्र सदस्य"],
                ["audit", "गतिविधि लॉग"],
              ].map(([s, n]) => (
                <Link key={s} href={`/admin/${s}`}>
                  {n}
                </Link>
              ))}
            </>
          )}
        </nav>
        <Link className="visit-site" href="/" target="_blank">
          <ExternalLink size={16} /> वेबसाइट देखें
        </Link>
      </aside>
      <div className="admin-workspace">
        <header className="admin-topbar">
          <span>संपादकीय डेस्क</span>
          <div>
            <span>
              {user.name} · {user.role}
            </span>
            <form action={logout}>
              <button>लॉगआउट</button>
            </form>
          </div>
        </header>
        <main className="admin-content" id="main">
          {children}
        </main>
      </div>
    </div>
  );
}
