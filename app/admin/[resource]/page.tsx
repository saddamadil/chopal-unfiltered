import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { canManage, canPublish } from "@/lib/permissions";
import { resources } from "@/lib/resources";
import ResourceManager from "@/components/ResourceManager";
import MediaManager from "@/components/MediaManager";
export default async function ResourcePage({
  params,
  searchParams,
}: {
  params: Promise<{ resource: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { resource } = await params;
  const p = await searchParams;
  const page = Math.max(1, Number(p.page) || 1);
  const user = await requireUser();
  if (resource === "media") {
    const where = canPublish(user.role) ? {} : { uploaderId: user.id };
    const [items, total] = await Promise.all([
      db.media.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 30,
        skip: (page - 1) * 30,
      }),
      db.media.count({ where }),
    ]);
    return (
      <>
        <MediaManager
          items={JSON.parse(JSON.stringify(items))}
          canDelete={canPublish(user.role)}
        />
        <PageNav page={page} total={total} size={30} resource={resource} />
      </>
    );
  }
  if (resource === "analytics") {
    if (!canPublish(user.role)) notFound();
    const [top, counts] = await Promise.all([
      db.article.findMany({
        select: { id: true, title: true, views: true },
        orderBy: { views: "desc" },
        take: 15,
      }),
      db.article.groupBy({ by: ["status"], _count: { id: true } }),
    ]);
    return (
      <>
        <h1>पाठक गतिविधि</h1>
        <p className="notice">
          ये साधारण पेज व्यू हैं, unique visitors नहीं। बॉट फ़िल्टरिंग और
          advanced analytics शामिल नहीं हैं।
        </p>
        <div className="stats-grid">
          {counts.map((c) => (
            <div className="panel stat" key={c.status}>
              <span>{c.status}</span>
              <strong>{c._count.id}</strong>
            </div>
          ))}
        </div>
        <div className="panel">
          <h2>सबसे ज़्यादा पढ़े गए लेख</h2>
          {top.map((a) => (
            <div className="analytics-row" key={a.id}>
              <Link href={`/admin/articles/${a.id}`}>{a.title}</Link>
              <strong>{a.views}</strong>
            </div>
          ))}
        </div>
      </>
    );
  }
  const spec = resources[resource];
  if (
    !spec ||
    !canPublish(user.role) ||
    (spec.adminOnly && !canManage(user.role))
  )
    notFound();
  const model = (db as any)[spec.model];
  const select =
    resource === "users"
      ? {
          id: true,
          name: true,
          email: true,
          role: true,
          active: true,
          createdAt: true,
        }
      : undefined;
  const [rows, total, categories, states, users] = await Promise.all([
    model.findMany({
      take: 25,
      skip: (page - 1) * 25,
      orderBy: { id: "desc" },
      ...(select ? { select } : {}),
    }),
    model.count(),
    db.category.findMany({ select: { id: true, name: true } }),
    db.state.findMany({ select: { id: true, name: true } }),
    db.user.findMany({ select: { id: true, name: true } }),
  ]);
  return (
    <>
      <ResourceManager
        resource={resource}
        rows={JSON.parse(JSON.stringify(rows))}
        options={{ categories, states, users }}
        role={user.role}
      />
      <PageNav page={page} total={total} size={25} resource={resource} />
    </>
  );
}
function PageNav({
  page,
  total,
  size,
  resource,
}: {
  page: number;
  total: number;
  size: number;
  resource: string;
}) {
  return (
    <nav className="pagination">
      {page > 1 && (
        <Link href={`/admin/${resource}?page=${page - 1}`}>← पिछला</Link>
      )}
      <span>
        {total} रिकॉर्ड · पृष्ठ {page}
      </span>
      {page * size < total && (
        <Link href={`/admin/${resource}?page=${page + 1}`}>अगला →</Link>
      )}
    </nav>
  );
}
