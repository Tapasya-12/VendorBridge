import { Router } from "express";
import { eq, and } from "drizzle-orm";
import { db, notificationsTable } from "@workspace/db";

const router = Router();

function formatNotification(n: typeof notificationsTable.$inferSelect) {
  return {
    id: n.id, userId: n.userId ?? null, title: n.title, message: n.message,
    type: n.type, entityType: n.entityType ?? null, entityId: n.entityId ?? null,
    isRead: n.isRead, createdAt: n.createdAt.toISOString(),
  };
}

router.get("/notifications", async (req, res): Promise<void> => {
  const { unreadOnly } = req.query as { unreadOnly?: string };
  const rows = unreadOnly === "true"
    ? await db.select().from(notificationsTable).where(eq(notificationsTable.isRead, false))
    : await db.select().from(notificationsTable);
  res.json(rows.map(formatNotification));
});

router.patch("/notifications/:id/read", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [n] = await db.update(notificationsTable).set({ isRead: true }).where(eq(notificationsTable.id, id)).returning();
  if (!n) { res.status(404).json({ error: "Notification not found" }); return; }
  res.json(formatNotification(n));
});

router.patch("/notifications/read-all", async (req, res): Promise<void> => {
  await db.update(notificationsTable).set({ isRead: true });
  res.json({ message: "All notifications marked as read" });
});

export default router;
