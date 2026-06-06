import { Router } from "express";
import { eq, and } from "drizzle-orm";
import { db, purchaseOrdersTable, rfqsTable, vendorsTable } from "@workspace/db";

const router = Router();

let poCounter = 1000;

function generatePoNumber() {
  poCounter++;
  return `PO-${new Date().getFullYear()}-${String(poCounter).padStart(5, "0")}`;
}

async function getPoWithDetails(poId: number) {
  const [po] = await db.select().from(purchaseOrdersTable).where(eq(purchaseOrdersTable.id, poId));
  if (!po) return null;
  const [rfq] = await db.select({ title: rfqsTable.title }).from(rfqsTable).where(eq(rfqsTable.id, po.rfqId));
  const [vendor] = await db.select({ name: vendorsTable.name }).from(vendorsTable).where(eq(vendorsTable.id, po.vendorId));
  return {
    id: po.id, poNumber: po.poNumber, rfqId: po.rfqId, rfqTitle: rfq?.title ?? null,
    quotationId: po.quotationId, vendorId: po.vendorId, vendorName: vendor?.name ?? null,
    totalAmount: po.totalAmount, taxAmount: po.taxAmount, status: po.status,
    deliveryDate: po.deliveryDate ?? null, notes: po.notes ?? null,
    createdAt: po.createdAt.toISOString(),
  };
}

router.get("/purchase-orders", async (req, res): Promise<void> => {
  const { status, vendorId } = req.query as { status?: string; vendorId?: string };
  const conditions = [];
  if (status) conditions.push(eq(purchaseOrdersTable.status, status));
  if (vendorId) conditions.push(eq(purchaseOrdersTable.vendorId, parseInt(vendorId, 10)));
  const rows = conditions.length > 0
    ? await db.select().from(purchaseOrdersTable).where(conditions.length === 1 ? conditions[0] : and(...conditions)).orderBy(purchaseOrdersTable.createdAt)
    : await db.select().from(purchaseOrdersTable).orderBy(purchaseOrdersTable.createdAt);
  const results = await Promise.all(rows.map(r => getPoWithDetails(r.id)));
  res.json(results.filter(Boolean));
});

router.post("/purchase-orders", async (req, res): Promise<void> => {
  const { rfqId, quotationId, vendorId, totalAmount, taxAmount, deliveryDate, notes } = req.body;
  if (!rfqId || !quotationId || !vendorId || totalAmount == null) {
    res.status(400).json({ error: "rfqId, quotationId, vendorId and totalAmount required" });
    return;
  }
  const poNumber = generatePoNumber();
  const [po] = await db.insert(purchaseOrdersTable).values({
    poNumber, rfqId, quotationId, vendorId,
    totalAmount, taxAmount: taxAmount ?? 0, status: "draft",
    deliveryDate: deliveryDate ?? null, notes: notes ?? null,
  }).returning();
  const result = await getPoWithDetails(po.id);
  res.status(201).json(result);
});

router.get("/purchase-orders/:id", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const result = await getPoWithDetails(id);
  if (!result) { res.status(404).json({ error: "Purchase order not found" }); return; }
  res.json(result);
});

router.patch("/purchase-orders/:id", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const updates: Record<string, unknown> = {};
  if (req.body.status !== undefined) updates.status = req.body.status;
  if (req.body.deliveryDate !== undefined) updates.deliveryDate = req.body.deliveryDate;
  if (req.body.notes !== undefined) updates.notes = req.body.notes;
  const [po] = await db.update(purchaseOrdersTable).set(updates).where(eq(purchaseOrdersTable.id, id)).returning();
  if (!po) { res.status(404).json({ error: "Purchase order not found" }); return; }
  const result = await getPoWithDetails(id);
  res.json(result);
});

export default router;
