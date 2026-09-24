export const dynamic = "force-dynamic";
import LoginForm from "@/components/LoginForm";
import { demoMode } from "@/lib/constants";
import Link from "next/link";
export const metadata = {
  title: "न्यूज़रूम लॉगिन",
  robots: { index: false, follow: false },
};
export default function Login() {
  return (
    <main className="login-shell">
      <Link href="/">← चौपाल पर लौटें</Link>
      <span className="eyebrow">CHOPAL NEWSROOM</span>
      <h1>
        आपकी खबर।
        <br />
        आपकी ज़िम्मेदारी।
      </h1>
      <p>संपादकीय टीम लॉगिन</p>
      {demoMode ? (
        <div className="notice">
          यह पढ़ने योग्य डेमो है। CMS उपयोग करने के लिए MySQL जोड़ें और अपना
          एडमिन खाता बनाएँ।
        </div>
      ) : (
        <LoginForm />
      )}
    </main>
  );
}
