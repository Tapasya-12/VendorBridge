import { Router } from "express";
import { eq, desc } from "drizzle-orm";
import { db, activityLogsTable, usersTable } from "@workspace/db";

const router = Router();

router.get("/activity-logs", async (req, res): Promise<void> => {
  const { entityType, entityId, limit } = req.query as { entityType?: string; entityId?: string; limit?: string };
  const conditions = [];
  if (entityType) conditions.push(eq(activityLogsTable.entityType, entityType));
  if (entityId) conditions.push(eq(activityLogsTable.entityId, parseInt(entityId, 10)));

  let query = db.select().from(activityLogsTable);
  if (conditions.length > 0) {
    query = query.where(conditions.length === 1 ? conditions[0] : conditions[0]) as typeof query;
  }
  const rows = await db.select().from(activityLogsTable).orderBy(desc(activityLogsTable.createdAt)).limit(limit ? parseInt(limit, 10) : 100);

  const results = await Promise.all(rows.map(async (log) => {
    let userName: string | null = null;
    if (log.userId) {
      const [user] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, log.userId));
      userName = user?.name ?? null;
    }
    return {
      id: log.id, userId: log.userId ?? null, userName,
      action: log.action, entityType: log.entityType, entityId: log.entityId ?? null,
      description: log.description, createdAt: log.createdAt.toISOString(),
    };
  }));
  res.json(results);
});

export default router;
