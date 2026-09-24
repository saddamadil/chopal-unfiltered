import { notFound } from "next/navigation";
import ArticleEditor from "@/components/ArticleEditor";
import { taxonomy, includeArticle } from "@/lib/content";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { canEditArticle, canPublish } from "@/lib/permissions";
import { dateLabel } from "@/lib/utils";
export default async function EditArticle({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const u = await requireUser();
  const { id } = await params;
  const [a, t, revisions] = await Promise.all([
    db.article.findUnique({ where: { id }, include: includeArticle }),
    taxonomy(),
    db.articleRevision.findMany({
      where: { articleId: id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);
  if (!a || !canEditArticle(u.role, u.id, a)) notFound();
  return (
    <>
      <ArticleEditor
        article={JSON.parse(JSON.stringify(a))}
        taxonomy={t}
        canPublish={canPublish(u.role)}
        ownAuthorId={t.authors.find((a) => a.userId === u.id)?.id}
      />
      {revisions.length > 0 && (
        <details className="panel">
          <summary>पिछले संस्करण ({revisions.length})</summary>
          {revisions.map((r) => (
            <details key={r.id}>
              <summary>{dateLabel(r.createdAt)}</summary>
              <pre className="revision">
                {JSON.stringify(r.snapshot, null, 2)}
              </pre>
            </details>
          ))}
        </details>
      )}
    </>
  );
}
