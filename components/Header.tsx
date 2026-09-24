import Link from "next/link";
import Image from "next/image";
import { Search, Menu, MapPin, ArrowUpRight } from "lucide-react";
import { nav, demoMode, TAGLINE } from "@/lib/constants";
import { taxonomy, breakingItems } from "@/lib/content";
export default async function Header() {
  const [t, b] = await Promise.all([taxonomy(), breakingItems()]);
  const date = new Intl.DateTimeFormat("hi-IN", {
    dateStyle: "full",
    timeZone: "Asia/Kolkata",
  }).format(new Date());
  return (
    <>
      <a href="#main" className="skip-link">
        मुख्य सामग्री पर जाएँ
      </a>
      <header className="site-header">
        <div className="topbar wrap">
          <span>{date}</span>
          <div>
            <Link href="/state">राज्य चुनें</Link>
            <Link href="/contact">
              अपनी खबर भेजें <ArrowUpRight size={13} />
            </Link>
            <Link href="/about">हमारे बारे में</Link>
          </div>
        </div>
        <div className="masthead wrap">
          <details className="menu">
            <summary aria-label="मेन्यू खोलें">
              <Menu size={24} />
              <span>मेन्यू</span>
            </summary>
            <div className="menu-panel">
              <Link href="/">होम</Link>
              <Link href="/latest">ताज़ा खबरें</Link>
              <Link href="/originals">चौपाल से</Link>
              {nav.map(([n, s]) => (
                <Link key={s} href={`/${s}`}>
                  {n}
                </Link>
              ))}
              <Link href="/admin">एडमिन</Link>
            </div>
          </details>
          <Link
            href="/"
            className="brand"
            aria-label={`Chopal Unfiltered — ${TAGLINE}`}
          >
            <Image
              src="/images/logo.png"
              alt={`चौपाल UNFILTERED — ${TAGLINE}`}
              width={1944}
              height={810}
              priority
            />
          </Link>
          <div className="header-actions">
            <Link href="/search" aria-label="खबर खोजें">
              <Search size={23} />
            </Link>
            <Link href="/login" className="login-link">
              लॉगिन
            </Link>
            <Link href="/#newsletter" className="subscribe-link">
              जुड़ें <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
        <nav className="main-nav wrap" aria-label="मुख्य नेविगेशन">
          <Link href="/">होम</Link>
          {nav.slice(0, 2).map(([n, s]) => (
            <Link key={s} href={`/${s}`}>
              {n}
            </Link>
          ))}
          <Link href="/state">राज्य</Link>
          <Link href="/city">शहर</Link>
          {nav.slice(2).map(([n, s]) => (
            <Link key={s} href={`/${s}`}>
              {n}
            </Link>
          ))}
        </nav>
      </header>
      {demoMode && (
        <div className="demo-strip">
          डेमो संस्करण · सभी लेख उदाहरण हैं, वास्तविक समाचार नहीं
        </div>
      )}
      {b.length > 0 && (
        <div className="breaking wrap">
          <span className="live-label">
            <i /> LIVE
          </span>
          <Link href={b[0].url || "/latest"}>{b[0].title}</Link>
          <Link
            className="breaking-more"
            href="/latest"
            aria-label="सभी ताज़ा खबरें"
          >
            →
          </Link>
        </div>
      )}
      <div className="regional-strip wrap">
        <span>
          <MapPin size={15} /> आपके आस-पास
        </span>
        {t.states.map((s) => (
          <Link key={s.id} href={`/state/${s.slug}`}>
            {s.name}
          </Link>
        ))}
      </div>
    </>
  );
}
