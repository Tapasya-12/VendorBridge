import { db, approvalsTable, rfqsTable, vendorsTable, purchaseOrdersTable, invoicesTable } from "../lib/db/src/index";
import { eq, sql, desc } from "drizzle-orm";

async function run() {
  try {
    const [pendingApprovals] = await db.select({ count: sql<number>`count(*)` }).from(approvalsTable).where(eq(approvalsTable.status, "pending"));
    console.log("pendingApprovals", pendingApprovals);
    const [activeRfqs] = await db.select({ count: sql<number>`count(*)` }).from(rfqsTable).where(eq(rfqsTable.status, "sent"));
    console.log("activeRfqs", activeRfqs);
    const [totalVendors] = await db.select({ count: sql<number>`count(*)` }).from(vendorsTable);
    console.log("totalVendors", totalVendors);
    const [totalPOs] = await db.select({ count: sql<number>`count(*)` }).from(purchaseOrdersTable);
    console.log("totalPOs", totalPOs);
    const [totalInvoices] = await db.select({ count: sql<number>`count(*)` }).from(invoicesTable);
    console.log("totalInvoices", totalInvoices);
    const [totalSpendRow] = await db.select({ sum: sql<number>`coalesce(sum(total_amount), 0)` }).from(purchaseOrdersTable);
    console.log("totalSpendRow", totalSpendRow);
    const recentRfqs = await db.select().from(rfqsTable).orderBy(desc(rfqsTable.createdAt)).limit(5);
    console.log("recentRfqs", recentRfqs);
    const recentPOs = await db.select().from(purchaseOrdersTable).orderBy(desc(purchaseOrdersTable.createdAt)).limit(5);
    console.log("recentPOs", recentPOs);
    const recentInvoices = await db.select().from(invoicesTable).orderBy(desc(invoicesTable.createdAt)).limit(5);
    console.log("recentInvoices", recentInvoices);
    const rfqStatusRows = await db.select({ status: rfqsTable.status, count: sql<number>`count(*)` }).from(rfqsTable).groupBy(rfqsTable.status);
    console.log("rfqStatusRows", rfqStatusRows);
    const invoiceStatusRows = await db.select({ status: invoicesTable.status, count: sql<number>`count(*)` }).from(invoicesTable).groupBy(invoicesTable.status);
    console.log("invoiceStatusRows", invoiceStatusRows);
    console.log("All success!");
  } catch(e) {
    console.error("Failed:", e);
  }
}

run();
