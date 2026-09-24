import { db } from "@/lib/db";
import { demoMode } from "@/lib/constants";
export default async function AdSlot({ position }: { position: string }) {
  if (demoMode) return null;
  const now = new Date();
  const ad = await db.advertisement.findFirst({
    where: {
      position,
      active: true,
      AND: [
        { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
        { OR: [{ endsAt: null }, { endsAt: { gt: now } }] },
      ],
    },
  });
  if (!ad) return null;
  return (
    <aside className={`ad-slot ad-${position}`} aria-label="विज्ञापन">
      <small>विज्ञापन</small>
      <a href={ad.url} rel="sponsored noopener noreferrer" target="_blank">
        <img src={ad.image} alt={ad.alt} loading="lazy" />
      </a>
    </aside>
  );
}
