import { Request, Response, NextFunction } from "express";
import { eq, gt } from "drizzle-orm";
import { db, sessionsTable } from "@workspace/db";

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = authHeader.slice(7);
  const now = new Date();
  const [session] = await db
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.token, token));

  if (!session || session.expiresAt < now) {
    res.status(401).json({ error: "Token expired or invalid" });
    return;
  }

  req.headers["x-user-id"] = String(session.userId);
  next();
}
