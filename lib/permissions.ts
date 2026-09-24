import type { Role, Status } from "@prisma/client";
export function canPublish(role: Role) {
  return ["SUPER_ADMIN", "ADMIN", "EDITOR"].includes(role);
}
export function canManage(role: Role) {
  return ["SUPER_ADMIN", "ADMIN"].includes(role);
}
export function canEditArticle(
  role: Role,
  userId: string,
  article: { creatorId: string; status: Status },
) {
  return (
    canPublish(role) ||
    (article.creatorId === userId &&
      ["DRAFT", "PENDING_REVIEW", "REJECTED"].includes(article.status))
  );
}
export function canChooseStatus(role: Role, status: string) {
  return canPublish(role) || ["DRAFT", "PENDING_REVIEW"].includes(status);
}
