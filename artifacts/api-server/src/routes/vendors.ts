import { Router } from "express";
import { eq, ilike, or, and } from "drizzle-orm";
import { db, vendorsTable } from "@workspace/db";

const router = Router();

function formatVendor(v: typeof vendorsTable.$inferSelect) {
  return {
    id: v.id,
    name: v.name,
    email: v.email,
    phone: v.phone ?? null,
    category: v.category,
    gstNumber: v.gstNumber ?? null,
    address: v.address ?? null,
    status: v.status,
    rating: v.rating ?? null,
    contactPerson: v.contactPerson ?? null,
    website: v.website ?? null,
    createdAt: v.createdAt.toISOString(),
  };
}

router.get("/vendors", async (req, res): Promise<void> => {
  const { status, category, search } = req.query as { status?: string; category?: string; search?: string };
  const conditions = [];
  if (status) conditions.push(eq(vendorsTable.status, status));
  if (category) conditions.push(eq(vendorsTable.category, category));
  if (search) conditions.push(or(ilike(vendorsTable.name, `%${search}%`), ilike(vendorsTable.email, `%${search}%`))!);
  const vendors = conditions.length > 0
    ? await db.select().from(vendorsTable).where(conditions.length === 1 ? conditions[0] : and(...conditions))
    : await db.select().from(vendorsTable);
  res.json(vendors.map(formatVendor));
});

router.post("/vendors", async (req, res): Promise<void> => {
  const { name, email, phone, category, gstNumber, address, status, contactPerson, website } = req.body;
  if (!name || !email || !category) {
    res.status(400).json({ error: "Name, email and category required" });
    return;
  }
  const [vendor] = await db.insert(vendorsTable).values({
    name, email, phone: phone ?? null, category, gstNumber: gstNumber ?? null,
    address: address ?? null, status: status || "pending",
    contactPerson: contactPerson ?? null, website: website ?? null,
  }).returning();
  res.status(201).json(formatVendor(vendor));
});

router.get("/vendors/:id", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [vendor] = await db.select().from(vendorsTable).where(eq(vendorsTable.id, id));
  if (!vendor) { res.status(404).json({ error: "Vendor not found" }); return; }
  res.json(formatVendor(vendor));
});

router.patch("/vendors/:id", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const updates: Record<string, unknown> = {};
  const fields = ["name", "email", "phone", "category", "gstNumber", "address", "status", "rating", "contactPerson", "website"];
  for (const f of fields) {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  }
  const [vendor] = await db.update(vendorsTable).set(updates).where(eq(vendorsTable.id, id)).returning();
  if (!vendor) { res.status(404).json({ error: "Vendor not found" }); return; }
  res.json(formatVendor(vendor));
});

router.delete("/vendors/:id", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [vendor] = await db.delete(vendorsTable).where(eq(vendorsTable.id, id)).returning();
  if (!vendor) { res.status(404).json({ error: "Vendor not found" }); return; }
  res.sendStatus(204);
});

export default router;
