import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, approvalsTable, quotationsTable, rfqsTable, vendorsTable, usersTable } from "@workspace/db";

const router = Router();

async function getApprovalWithDetails(aId: number) {
  const [a] = await db.select().from(approvalsTable).where(eq(approvalsTable.id, aId));
  if (!a) return null;
  const [q] = await db.select().from(quotationsTable).where(eq(quotationsTable.id, a.quotationId));
  let rfqTitle: string | null = null;
  let vendorName: string | null = null;
  let approvedByName: string | null = null;
  if (q) {
    const [rfq] = await db.select({ title: rfqsTable.title }).from(rfqsTable).where(eq(rfqsTable.id, q.rfqId));
    rfqTitle = rfq?.title ?? null;
    const [vendor] = await db.select({ name: vendorsTable.name }).from(vendorsTable).where(eq(vendorsTable.id, q.vendorId));
    vendorName = vendor?.name ?? null;
  }
  if (a.approvedById) {
    const [approver] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, a.approvedById));
    approvedByName = approver?.name ?? null;
  }
  return {
    id: a.id, quotationId: a.quotationId,
    rfqTitle, vendorName, totalPrice: q?.totalPrice ?? null,
    approvedById: a.approvedById ?? null, approvedByName,
    status: a.status, remarks: a.remarks ?? null,
    createdAt: a.createdAt.toISOString(), updatedAt: a.updatedAt.toISOString(),
  };
}

router.get("/approvals", async (req, res): Promise<void> => {
  const { status } = req.query as { status?: string };
  const rows = status
    ? await db.select().from(approvalsTable).where(eq(approvalsTable.status, status)).orderBy(approvalsTable.createdAt)
    : await db.select().from(approvalsTable).orderBy(approvalsTable.createdAt);
  const results = await Promise.all(rows.map(r => getApprovalWithDetails(r.id)));
  res.json(results.filter(Boolean));
});

router.post("/approvals/:id/approve", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const { remarks } = req.body;
  const [a] = await db.update(approvalsTable).set({ status: "approved", remarks: remarks ?? null }).where(eq(approvalsTable.id, id)).returning();
  if (!a) { res.status(404).json({ error: "Approval not found" }); return; }
  // Also update quotation status
  await db.update(quotationsTable).set({ status: "accepted" }).where(eq(quotationsTable.id, a.quotationId));
  const result = await getApprovalWithDetails(id);
  res.json(result);
});

router.post("/approvals/:id/reject", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const { remarks } = req.body;
  const [a] = await db.update(approvalsTable).set({ status: "rejected", remarks: remarks ?? null }).where(eq(approvalsTable.id, id)).returning();
  if (!a) { res.status(404).json({ error: "Approval not found" }); return; }
  await db.update(quotationsTable).set({ status: "rejected" }).where(eq(quotationsTable.id, a.quotationId));
  const result = await getApprovalWithDetails(id);
  res.json(result);
});

export default router;
