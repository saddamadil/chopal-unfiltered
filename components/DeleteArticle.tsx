"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
export default function DeleteArticle({ id }: { id: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  return (
    <>
      <button
        className="danger-link"
        onClick={async () => {
          if (
            !confirm(
              "यह लेख और उसकी टिप्पणियाँ स्थायी रूप से हट जाएँगी। हटाएँ?",
            )
          )
            return;
          const res = await fetch("/api/admin/articles", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
          });
          if (res.ok) router.refresh();
          else setMessage("हटाया नहीं जा सका।");
        }}
      >
        हटाएँ
      </button>
      <span role="status">{message}</span>
    </>
  );
}
