import { db } from "./index";
import { usersTable } from "./schema/users";
import { vendorsTable } from "./schema/vendors";
import { rfqsTable } from "./schema/rfqs";
import { quotationsTable } from "./schema/quotations";
import { purchaseOrdersTable } from "./schema/purchase-orders";
import { invoicesTable } from "./schema/invoices";
import { notificationsTable } from "./schema/notifications";
import { activityLogsTable } from "./schema/activity-logs";
import { approvalsTable } from "./schema/approvals";
import { sql } from "drizzle-orm";

async function verifyData() {
  console.log("🔍 Verifying database data...\n");

  try {
    // Count records in each table
    const [vendorsCount] = await db.select({ count: sql<number>`count(*)` }).from(vendorsTable);
    const [usersCount] = await db.select({ count: sql<number>`count(*)` }).from(usersTable);
    const [rfqsCount] = await db.select({ count: sql<number>`count(*)` }).from(rfqsTable);
    const [quotationsCount] = await db.select({ count: sql<number>`count(*)` }).from(quotationsTable);
    const [posCount] = await db.select({ count: sql<number>`count(*)` }).from(purchaseOrdersTable);
    const [invoicesCount] = await db.select({ count: sql<number>`count(*)` }).from(invoicesTable);
    const [approvalsCount] = await db.select({ count: sql<number>`count(*)` }).from(approvalsTable);
    const [activityLogsCount] = await db.select({ count: sql<number>`count(*)` }).from(activityLogsTable);
    const [notificationsCount] = await db.select({ count: sql<number>`count(*)` }).from(notificationsTable);

    console.log("📊 Database Statistics:\n");
    console.log(`  Vendors:          ${vendorsCount?.count || 0}`);
    console.log(`  Users:            ${usersCount?.count || 0}`);
    console.log(`  RFQs:             ${rfqsCount?.count || 0}`);
    console.log(`  Quotations:       ${quotationsCount?.count || 0}`);
    console.log(`  Purchase Orders:  ${posCount?.count || 0}`);
    console.log(`  Invoices:         ${invoicesCount?.count || 0}`);
    console.log(`  Approvals:        ${approvalsCount?.count || 0}`);
    console.log(`  Activity Logs:    ${activityLogsCount?.count || 0}`);
    console.log(`  Notifications:    ${notificationsCount?.count || 0}`);

    // Sample some data
    console.log("\n📋 Sample Data:\n");

    const vendors = await db.select().from(vendorsTable).limit(3);
    console.log("  Top 3 Vendors:");
    vendors.forEach(v => {
      console.log(`    • ${v.name} (${v.category}) - ${v.status}`);
    });

    const users = await db.select().from(usersTable).limit(3);
    console.log("\n  Top 3 Users:");
    users.forEach(u => {
      console.log(`    • ${u.name} (${u.email}) - ${u.role}`);
    });

    const rfqs = await db.select().from(rfqsTable).limit(3);
    console.log("\n  Top 3 RFQs:");
    rfqs.forEach(r => {
      console.log(`    • ${r.title} - Status: ${r.status}`);
    });

    // Check if database is empty
    const totalRecords = Number(vendorsCount?.count || 0) + 
                        Number(usersCount?.count || 0) + 
                        Number(rfqsCount?.count || 0);

    if (totalRecords === 0) {
      console.log("\n⚠️  Database is empty!");
      console.log("💡 Run 'pnpm run seed' to populate with data.");
    } else {
      console.log("\n✅ Database verification completed successfully!");
      console.log(`📦 Total records: ${totalRecords}`);
    }

  } catch (error) {
    console.error("\n❌ Error verifying database:", error);
    throw error;
  }
}

verifyData()
  .catch(console.error)
  .finally(() => process.exit(0));
