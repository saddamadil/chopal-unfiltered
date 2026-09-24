import ArticleEditor from "@/components/ArticleEditor";
import { taxonomy } from "@/lib/content";
import { requireUser } from "@/lib/auth";
import { canPublish } from "@/lib/permissions";
export default async function NewArticle() {
  const [u, t] = await Promise.all([requireUser(), taxonomy()]);
  const own = t.authors.find((a) => a.userId === u.id);
  if (!canPublish(u.role) && !own)
    return (
      <div className="notice">
        अपना लेखक प्रोफ़ाइल जोड़ने के लिए व्यवस्थापक से संपर्क करें।
      </div>
    );
  return (
    <ArticleEditor
      taxonomy={t}
      canPublish={canPublish(u.role)}
      ownAuthorId={own?.id}
    />
  );
}
