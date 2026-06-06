import { Router } from "express";
import { eq, sql, desc } from "drizzle-orm";
import { db, rfqsTable, vendorsTable, purchaseOrdersTable, invoicesTable, approvalsTable } from "@workspace/db";

const router = Router();

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const [pendingApprovals] = await db.select({ count: sql<number>`count(*)` }).from(approvalsTable).where(eq(approvalsTable.status, "pending"));
  const [activeRfqs] = await db.select({ count: sql<number>`count(*)` }).from(rfqsTable).where(eq(rfqsTable.status, "sent"));
  const [totalVendors] = await db.select({ count: sql<number>`count(*)` }).from(vendorsTable);
  const [totalPOs] = await db.select({ count: sql<number>`count(*)` }).from(purchaseOrdersTable);
  const [totalInvoices] = await db.select({ count: sql<number>`count(*)` }).from(invoicesTable);
  const [totalSpendRow] = await db.select({ sum: sql<number>`coalesce(sum(total_amount), 0)` }).from(purchaseOrdersTable);

  const recentRfqs = await db.select().from(rfqsTable).orderBy(desc(rfqsTable.createdAt)).limit(5);
  const recentPOs = await db.select().from(purchaseOrdersTable).orderBy(desc(purchaseOrdersTable.createdAt)).limit(5);
  const recentInvoices = await db.select().from(invoicesTable).orderBy(desc(invoicesTable.createdAt)).limit(5);

  const rfqStatusRows = await db.select({ status: rfqsTable.status, count: sql<number>`count(*)` }).from(rfqsTable).groupBy(rfqsTable.status);
  const invoiceStatusRows = await db.select({ status: invoicesTable.status, count: sql<number>`count(*)` }).from(invoicesTable).groupBy(invoicesTable.status);

  res.json({
    pendingApprovals: Number(pendingApprovals?.count ?? 0),
    activeRfqs: Number(activeRfqs?.count ?? 0),
    totalVendors: Number(totalVendors?.count ?? 0),
    totalPurchaseOrders: Number(totalPOs?.count ?? 0),
    totalInvoices: Number(totalInvoices?.count ?? 0),
    totalSpend: Number(totalSpendRow?.sum ?? 0),
    recentRfqs: recentRfqs.map(r => ({
      id: r.id, title: r.title, description: r.description ?? null,
      deadline: r.deadline ?? null, status: r.status,
      createdById: r.createdById ?? null, createdByName: null,
      vendorIds: [], items: [], quotationCount: 0, createdAt: r.createdAt.toISOString(),
    })),
    recentPurchaseOrders: recentPOs.map(p => ({
      id: p.id, poNumber: p.poNumber, rfqId: p.rfqId, rfqTitle: null,
      quotationId: p.quotationId, vendorId: p.vendorId, vendorName: null,
      totalAmount: p.totalAmount, taxAmount: p.taxAmount, status: p.status,
      deliveryDate: p.deliveryDate ?? null, notes: p.notes ?? null,
      createdAt: p.createdAt.toISOString(),
    })),
    recentInvoices: recentInvoices.map(i => ({
      id: i.id, invoiceNumber: i.invoiceNumber, purchaseOrderId: i.purchaseOrderId, poNumber: null,
      vendorId: i.vendorId, vendorName: null, subtotal: i.subtotal, taxAmount: i.taxAmount,
      totalAmount: i.totalAmount, status: i.status, dueDate: i.dueDate ?? null, notes: i.notes ?? null,
      emailSentAt: i.emailSentAt ? i.emailSentAt.toISOString() : null, createdAt: i.createdAt.toISOString(),
    })),
    rfqStatusBreakdown: rfqStatusRows.map(r => ({ status: r.status, count: Number(r.count) })),
    invoiceStatusBreakdown: invoiceStatusRows.map(r => ({ status: r.status, count: Number(r.count) })),
  });
});

export default router;
