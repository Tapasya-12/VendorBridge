import { Router } from "express";
import { sql, desc } from "drizzle-orm";
import { db, rfqsTable, quotationsTable, purchaseOrdersTable, invoicesTable, approvalsTable, vendorsTable } from "@workspace/db";

const router = Router();

router.get("/analytics/overview", async (req, res): Promise<void> => {
  const { period = "month" } = req.query as { period?: string };

  const [totalRfqs] = await db.select({ count: sql<number>`count(*)` }).from(rfqsTable);
  const [totalQuotations] = await db.select({ count: sql<number>`count(*)` }).from(quotationsTable);
  const [totalPOs] = await db.select({ count: sql<number>`count(*)` }).from(purchaseOrdersTable);
  const [totalInvoices] = await db.select({ count: sql<number>`count(*)` }).from(invoicesTable);
  const [totalSpend] = await db.select({ sum: sql<number>`coalesce(sum(total_amount), 0)` }).from(purchaseOrdersTable);
  const [approvedCount] = await db.select({ count: sql<number>`count(*)` }).from(approvalsTable).where(sql`status = 'approved'`);
  const [totalApprovals] = await db.select({ count: sql<number>`count(*)` }).from(approvalsTable);

  const totalQ = Number(totalQuotations?.count ?? 0);
  const totalR = Number(totalRfqs?.count ?? 0);
  const avgQ = totalR > 0 ? totalQ / totalR : 0;
  const approvalRate = Number(totalApprovals?.count ?? 0) > 0 ? (Number(approvedCount?.count ?? 0) / Number(totalApprovals?.count ?? 0)) * 100 : 0;

  res.json({
    totalRfqs: totalR,
    totalQuotations: totalQ,
    totalPOs: Number(totalPOs?.count ?? 0),
    totalInvoices: Number(totalInvoices?.count ?? 0),
    totalSpend: Number(totalSpend?.sum ?? 0),
    avgQuotationsPerRfq: Math.round(avgQ * 10) / 10,
    approvalRate: Math.round(approvalRate * 10) / 10,
    topVendors: [],
  });
});

router.get("/analytics/vendor-performance", async (_req, res): Promise<void> => {
  const vendors = await db.select().from(vendorsTable).limit(10);
  const results = await Promise.all(vendors.map(async (v) => {
    const [poCount] = await db.select({ count: sql<number>`count(*)` }).from(purchaseOrdersTable).where(sql`vendor_id = ${v.id}`);
    const [spend] = await db.select({ sum: sql<number>`coalesce(sum(total_amount), 0)` }).from(purchaseOrdersTable).where(sql`vendor_id = ${v.id}`);
    const [avgDel] = await db.select({ avg: sql<number>`coalesce(avg(delivery_days), 0)` }).from(quotationsTable).where(sql`vendor_id = ${v.id}`);
    return {
      vendorId: v.id,
      vendorName: v.name,
      totalOrders: Number(poCount?.count ?? 0),
      totalSpend: Number(spend?.sum ?? 0),
      avgDeliveryDays: Math.round(Number(avgDel?.avg ?? 0) * 10) / 10,
      rating: v.rating ?? 0,
    };
  }));
  res.json(results);
});

router.get("/analytics/spending-trends", async (req, res): Promise<void> => {
  const { months = "6" } = req.query as { months?: string };
  const monthCount = parseInt(months, 10) || 6;
  const rows = await db.execute(sql`
    SELECT 
      to_char(created_at, 'YYYY-MM') AS month,
      coalesce(sum(total_amount), 0) AS total_spend,
      count(*) AS order_count
    FROM purchase_orders
    WHERE created_at >= now() - interval '${sql.raw(String(monthCount))} months'
    GROUP BY to_char(created_at, 'YYYY-MM')
    ORDER BY month ASC
  `);
  res.json((rows.rows as Array<{ month: string; total_spend: string; order_count: string }>).map(r => ({
    month: r.month,
    totalSpend: parseFloat(r.total_spend),
    orderCount: parseInt(r.order_count, 10),
  })));
});

export default router;
