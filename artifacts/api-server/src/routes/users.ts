import { Router } from "express";
import { eq, ilike, or } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { hashPassword } from "../lib/auth";

const router = Router();

function formatUser(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    vendorId: user.vendorId,
    createdAt: user.createdAt.toISOString(),
  };
}

router.get("/users", async (req, res): Promise<void> => {
  const { role, search } = req.query as { role?: string; search?: string };
  let query = db.select().from(usersTable);
  const conditions = [];
  if (role) conditions.push(eq(usersTable.role, role));
  if (search) conditions.push(or(ilike(usersTable.name, `%${search}%`), ilike(usersTable.email, `%${search}%`))!);
  const users = conditions.length > 0
    ? await db.select().from(usersTable).where(conditions.length === 1 ? conditions[0] : conditions.reduce((a, b) => or(a, b)!))
    : await db.select().from(usersTable);
  res.json(users.map(formatUser));
});

router.post("/users", async (req, res): Promise<void> => {
  const { name, email, password, role, vendorId } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ error: "Name, email and password required" });
    return;
  }
  const passwordHash = hashPassword(password);
  const [user] = await db.insert(usersTable).values({ name, email, passwordHash, role: role || "procurement_officer", vendorId: vendorId ?? null }).returning();
  res.status(201).json(formatUser(user));
});

router.get("/users/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json(formatUser(user));
});

router.patch("/users/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const { name, email, role, isActive, vendorId } = req.body;
  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name;
  if (email !== undefined) updates.email = email;
  if (role !== undefined) updates.role = role;
  if (isActive !== undefined) updates.isActive = isActive;
  if (vendorId !== undefined) updates.vendorId = vendorId;
  const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, id)).returning();
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json(formatUser(user));
});

router.delete("/users/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const [user] = await db.delete(usersTable).where(eq(usersTable.id, id)).returning();
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.sendStatus(204);
});

export default router;
