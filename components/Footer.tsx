import Link from "next/link";
import Image from "next/image";
import { nav, policyPages, TAGLINE } from "@/lib/constants";
export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-grid">
        <div>
          <Link className="footer-logo" href="/">
            <Image
              src="/images/logo.png"
              alt="चौपाल UNFILTERED"
              width={280}
              height={117}
            />
          </Link>
          <p>{TAGLINE}</p>
          <p className="muted">
            खबरों के साथ संदर्भ।
            <br />
            केंद्र में हमेशा आम लोग।
          </p>
        </div>
        <div>
          <h3>खबरों की दुनिया</h3>
          {nav.slice(0, 6).map(([n, s]) => (
            <Link key={s} href={`/${s}`}>
              {n}
            </Link>
          ))}
        </div>
        <div>
          <h3>हमारी पत्रकारिता</h3>
          <Link href="/originals">चौपाल से</Link>
          {[
            "editorial-policy",
            "corrections",
            "fact-check-policy",
            "about",
            "contact",
          ].map((s) => (
            <Link key={s} href={`/${s}`}>
              {policyPages[s]}
            </Link>
          ))}
        </div>
        <div>
          <h3>पाठकों के लिए</h3>
          {["privacy", "terms", "disclaimer", "careers"].map((s) => (
            <Link key={s} href={`/${s}`}>
              {policyPages[s]}
            </Link>
          ))}
          <Link href="/credits">चित्र श्रेय</Link>
          <Link href="/rss.xml">RSS फ़ीड</Link>
        </div>
      </div>
      <div className="wrap footer-bottom">
        <span>© {new Date().getFullYear()} Chopal Unfiltered</span>
        <span>हिंदी में खबर। बिना फ़िल्टर के सवाल।</span>
        <Link href="/admin">न्यूज़रूम ↗</Link>
      </div>
    </footer>
  );
}
