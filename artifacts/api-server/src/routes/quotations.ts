import { Router } from "express";
import { eq, and } from "drizzle-orm";
import { db, quotationsTable, quotationItemsTable, rfqsTable, vendorsTable, approvalsTable } from "@workspace/db";

const router = Router();

async function getQuotationWithDetails(qId: number) {
  const [q] = await db.select().from(quotationsTable).where(eq(quotationsTable.id, qId));
  if (!q) return null;
  const items = await db.select().from(quotationItemsTable).where(eq(quotationItemsTable.quotationId, qId));
  const [rfq] = await db.select({ title: rfqsTable.title }).from(rfqsTable).where(eq(rfqsTable.id, q.rfqId));
  const [vendor] = await db.select({ name: vendorsTable.name, rating: vendorsTable.rating }).from(vendorsTable).where(eq(vendorsTable.id, q.vendorId));
  return {
    id: q.id, rfqId: q.rfqId, rfqTitle: rfq?.title ?? null,
    vendorId: q.vendorId, vendorName: vendor?.name ?? null, vendorRating: vendor?.rating ?? null,
    totalPrice: q.totalPrice, deliveryDays: q.deliveryDays ?? null,
    notes: q.notes ?? null, status: q.status,
    items: items.map(i => ({ id: i.id, quotationId: i.quotationId, productName: i.productName, unitPrice: i.unitPrice, quantity: i.quantity, totalPrice: i.totalPrice })),
    createdAt: q.createdAt.toISOString(),
  };
}

router.get("/quotations", async (req, res): Promise<void> => {
  const { status, rfqId, vendorId } = req.query as { status?: string; rfqId?: string; vendorId?: string };
  const conditions = [];
  if (status) conditions.push(eq(quotationsTable.status, status));
  if (rfqId) conditions.push(eq(quotationsTable.rfqId, parseInt(rfqId, 10)));
  if (vendorId) conditions.push(eq(quotationsTable.vendorId, parseInt(vendorId, 10)));
  const rows = conditions.length > 0
    ? await db.select().from(quotationsTable).where(conditions.length === 1 ? conditions[0] : and(...conditions))
    : await db.select().from(quotationsTable);
  const results = await Promise.all(rows.map(r => getQuotationWithDetails(r.id)));
  res.json(results.filter(Boolean));
});

router.post("/quotations", async (req, res): Promise<void> => {
  const { rfqId, vendorId, totalPrice, deliveryDays, notes, items } = req.body;
  if (!rfqId || !vendorId || totalPrice == null) {
    res.status(400).json({ error: "rfqId, vendorId and totalPrice required" });
    return;
  }
  const [q] = await db.insert(quotationsTable).values({
    rfqId, vendorId, totalPrice, deliveryDays: deliveryDays ?? null, notes: notes ?? null, status: "submitted"
  }).returning();
  if (items && Array.isArray(items)) {
    for (const item of items) {
      await db.insert(quotationItemsTable).values({ quotationId: q.id, productName: item.productName, unitPrice: item.unitPrice, quantity: item.quantity, totalPrice: item.totalPrice });
    }
  }
  // Auto-create approval record
  await db.insert(approvalsTable).values({ quotationId: q.id, status: "pending" });
  const result = await getQuotationWithDetails(q.id);
  res.status(201).json(result);
});

router.get("/quotations/:id", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const result = await getQuotationWithDetails(id);
  if (!result) { res.status(404).json({ error: "Quotation not found" }); return; }
  res.json(result);
});

router.patch("/quotations/:id", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const updates: Record<string, unknown> = {};
  if (req.body.totalPrice !== undefined) updates.totalPrice = req.body.totalPrice;
  if (req.body.deliveryDays !== undefined) updates.deliveryDays = req.body.deliveryDays;
  if (req.body.notes !== undefined) updates.notes = req.body.notes;
  if (req.body.status !== undefined) updates.status = req.body.status;
  const [q] = await db.update(quotationsTable).set(updates).where(eq(quotationsTable.id, id)).returning();
  if (!q) { res.status(404).json({ error: "Quotation not found" }); return; }
  const result = await getQuotationWithDetails(id);
  res.json(result);
});

export default router;
