import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable, sessionsTable } from "@workspace/db";
import { hashPassword, verifyPassword } from "../lib/auth";
import crypto from "crypto";

const router = Router();

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function tokenExpiry(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d;
}

function safeUser(user: typeof usersTable.$inferSelect) {
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

router.post("/auth/login", async (req, res): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Email and password required" });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user || !verifyPassword(password, user.passwordHash)) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const token = generateToken();
  await db.insert(sessionsTable).values({ userId: user.id, token, expiresAt: tokenExpiry() });
  res.json({ user: safeUser(user), token });
});

router.post("/auth/signup", async (req, res): Promise<void> => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ error: "Name, email and password required" });
    return;
  }
  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing) {
    res.status(409).json({ error: "Email already in use" });
    return;
  }
  const passwordHash = hashPassword(password);
  const [user] = await db
    .insert(usersTable)
    .values({ name, email, passwordHash, role: role || "procurement_officer" })
    .returning();
  const token = generateToken();
  await db.insert(sessionsTable).values({ userId: user.id, token, expiresAt: tokenExpiry() });
  res.status(201).json({ user: safeUser(user), token });
});

router.post("/auth/logout", async (req, res): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    await db.delete(sessionsTable).where(eq(sessionsTable.token, token));
  }
  res.json({ message: "Logged out" });
});

router.get("/auth/me", async (req, res): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = authHeader.slice(7);
  const [session] = await db.select().from(sessionsTable).where(eq(sessionsTable.token, token));
  if (!session || session.expiresAt < new Date()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, session.userId));
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  res.json(safeUser(user));
});

router.post("/auth/forgot-password", async (req, res): Promise<void> => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: "Email required" });
    return;
  }
  res.json({ message: "If that email exists, a reset link has been sent." });
});

export default router;
