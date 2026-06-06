import { Router } from "express";
import { eq, ilike, and, sql } from "drizzle-orm";
import { db, rfqsTable, rfqItemsTable, rfqVendorsTable, usersTable, quotationsTable, quotationItemsTable, vendorsTable } from "@workspace/db";

const router = Router();

async function getRfqWithDetails(rfqId: number) {
  const [rfq] = await db.select().from(rfqsTable).where(eq(rfqsTable.id, rfqId));
  if (!rfq) return null;
  const items = await db.select().from(rfqItemsTable).where(eq(rfqItemsTable.rfqId, rfqId));
  const vendorLinks = await db.select().from(rfqVendorsTable).where(eq(rfqVendorsTable.rfqId, rfqId));
  const [quotationCount] = await db.select({ count: sql<number>`count(*)` }).from(quotationsTable).where(eq(quotationsTable.rfqId, rfqId));
  let createdByName: string | null = null;
  if (rfq.createdById) {
    const [creator] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, rfq.createdById));
    createdByName = creator?.name ?? null;
  }
  return {
    id: rfq.id,
    title: rfq.title,
    description: rfq.description ?? null,
    deadline: rfq.deadline ?? null,
    status: rfq.status,
    createdById: rfq.createdById ?? null,
    createdByName,
    vendorIds: vendorLinks.map(v => v.vendorId),
    items: items.map(i => ({ id: i.id, rfqId: i.rfqId, productName: i.productName, description: i.description ?? null, quantity: i.quantity, unit: i.unit ?? null })),
    quotationCount: Number(quotationCount?.count ?? 0),
    createdAt: rfq.createdAt.toISOString(),
  };
}

router.get("/rfqs", async (req, res): Promise<void> => {
  const { status, search } = req.query as { status?: string; search?: string };
  const conditions = [];
  if (status) conditions.push(eq(rfqsTable.status, status));
  if (search) conditions.push(ilike(rfqsTable.title, `%${search}%`));
  const rfqs = conditions.length > 0
    ? await db.select().from(rfqsTable).where(conditions.length === 1 ? conditions[0] : and(...conditions)).orderBy(rfqsTable.createdAt)
    : await db.select().from(rfqsTable).orderBy(rfqsTable.createdAt);
  const results = await Promise.all(rfqs.map(r => getRfqWithDetails(r.id)));
  res.json(results.filter(Boolean));
});

router.post("/rfqs", async (req, res): Promise<void> => {
  const { title, description, deadline, vendorIds, items } = req.body;
  if (!title) { res.status(400).json({ error: "Title required" }); return; }
  const [rfq] = await db.insert(rfqsTable).values({ title, description: description ?? null, deadline: deadline ?? null, status: "draft" }).returning();
  if (items && Array.isArray(items)) {
    for (const item of items) {
      await db.insert(rfqItemsTable).values({ rfqId: rfq.id, productName: item.productName, description: item.description ?? null, quantity: item.quantity ?? 1, unit: item.unit ?? null });
    }
  }
  if (vendorIds && Array.isArray(vendorIds)) {
    for (const vendorId of vendorIds) {
      await db.insert(rfqVendorsTable).values({ rfqId: rfq.id, vendorId });
    }
  }
  const result = await getRfqWithDetails(rfq.id);
  res.status(201).json(result);
});

router.get("/rfqs/:id", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const result = await getRfqWithDetails(id);
  if (!result) { res.status(404).json({ error: "RFQ not found" }); return; }
  res.json(result);
});

router.patch("/rfqs/:id", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const { title, description, deadline, status, vendorIds } = req.body;
  const updates: Record<string, unknown> = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (deadline !== undefined) updates.deadline = deadline;
  if (status !== undefined) updates.status = status;
  const [rfq] = await db.update(rfqsTable).set(updates).where(eq(rfqsTable.id, id)).returning();
  if (!rfq) { res.status(404).json({ error: "RFQ not found" }); return; }
  if (vendorIds && Array.isArray(vendorIds)) {
    await db.delete(rfqVendorsTable).where(eq(rfqVendorsTable.rfqId, id));
    for (const vendorId of vendorIds) {
      await db.insert(rfqVendorsTable).values({ rfqId: id, vendorId });
    }
  }
  const result = await getRfqWithDetails(id);
  res.json(result);
});

router.delete("/rfqs/:id", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [rfq] = await db.delete(rfqsTable).where(eq(rfqsTable.id, id)).returning();
  if (!rfq) { res.status(404).json({ error: "RFQ not found" }); return; }
  res.sendStatus(204);
});

router.post("/rfqs/:id/send", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [rfq] = await db.update(rfqsTable).set({ status: "sent" }).where(eq(rfqsTable.id, id)).returning();
  if (!rfq) { res.status(404).json({ error: "RFQ not found" }); return; }
  const result = await getRfqWithDetails(id);
  res.json(result);
});

router.get("/rfqs/:rfqId/quotations", async (req, res): Promise<void> => {
  const rfqId = parseInt(Array.isArray(req.params.rfqId) ? req.params.rfqId[0] : req.params.rfqId, 10);
  const quotations = await db.select().from(quotationsTable).where(eq(quotationsTable.rfqId, rfqId));
  const results = [];
  for (const q of quotations) {
    const [vendor] = await db.select({ name: vendorsTable.name, rating: vendorsTable.rating }).from(vendorsTable).where(eq(vendorsTable.id, q.vendorId));
    const [rfq] = await db.select({ title: rfqsTable.title }).from(rfqsTable).where(eq(rfqsTable.id, rfqId));
    const items = await db.select().from(quotationItemsTable).where(eq(quotationItemsTable.quotationId, q.id));
    results.push({
      id: q.id, rfqId: q.rfqId, rfqTitle: rfq?.title ?? null, vendorId: q.vendorId,
      vendorName: vendor?.name ?? null, vendorRating: vendor?.rating ?? null,
      totalPrice: q.totalPrice, deliveryDays: q.deliveryDays ?? null,
      notes: q.notes ?? null, status: q.status,
      items: items.map(i => ({ id: i.id, quotationId: i.quotationId, productName: i.productName, unitPrice: i.unitPrice, quantity: i.quantity, totalPrice: i.totalPrice })),
      createdAt: q.createdAt.toISOString(),
    });
  }
  res.json(results);
});

export default router;
