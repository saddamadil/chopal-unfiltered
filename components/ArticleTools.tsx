"use client";
import { useEffect, useState } from "react";
import { Share2, Link as LinkIcon, Printer } from "lucide-react";
export default function ArticleTools({
  id,
  title,
  demo,
}: {
  id: string;
  title: string;
  demo: boolean;
}) {
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (!demo)
      fetch("/api/views", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      }).catch(() => {});
  }, [id, demo]);
  return (
    <div className="article-tools">
      <button
        onClick={async () => {
          try {
            if (navigator.share)
              await navigator.share({ title, url: location.href });
            else {
              await navigator.clipboard.writeText(location.href);
              setMessage("लिंक कॉपी हो गया।");
            }
          } catch {
            setMessage("शेयर नहीं हुआ। पेज का लिंक कॉपी कर सकते हैं।");
          }
        }}
      >
        <Share2 size={16} /> शेयर
      </button>
      <button
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(location.href);
            setMessage("लिंक कॉपी हो गया।");
          } catch {
            setMessage("ब्राउज़र के एड्रेस बार से लिंक कॉपी करें।");
          }
        }}
      >
        <LinkIcon size={16} /> लिंक
      </button>
      <button onClick={() => window.print()}>
        <Printer size={16} /> प्रिंट
      </button>
      <span role="status">{message}</span>
    </div>
  );
}
