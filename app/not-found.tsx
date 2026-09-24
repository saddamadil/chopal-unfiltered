import Link from "next/link";
export default function NotFound() {
  return (
    <main className="wrap empty">
      <span className="eyebrow">404</span>
      <h1>यह पेज नहीं मिला।</h1>
      <p>हो सकता है लिंक बदल गया हो या खबर अभी प्रकाशित न हुई हो।</p>
      <Link className="button" href="/">
        होम पर जाएँ
      </Link>
    </main>
  );
}
