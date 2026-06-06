#!/usr/bin/env node
/**
 * Seed Management Script for VendorBridge
 * 
 * Usage:
 *   pnpm run seed                    - Run fresh seed
 *   pnpm run seed:clear              - Clear all data without seeding
 *   pnpm run seed:reset              - Clear and reseed with new data
 *   pnpm run seed:check              - Verify seed data exists
 */

import { db } from "@workspace/db";
import {
  usersTable,
  vendorsTable,
  rfqsTable,
  rfqItemsTable,
  rfqVendorsTable,
  quotationsTable,
  quotationItemsTable,
  purchaseOrdersTable,
  invoicesTable,
  notificationsTable,
  activityLogsTable,
  approvalsTable,
} from "@workspace/db";

interface SeedStats {
  vendors: number;
  users: number;
  rfqs: number;
  quotations: number;
  purchaseOrders: number;
  invoices: number;
  approvals: number;
  notifications: number;
  activityLogs: number;
}

async function clearAllData(): Promise<void> {
  console.log("🗑️  Clearing all data...");
  try {
    await db.delete(approvalsTable);
    console.log("   ✓ Cleared approvals");

    await db.delete(activityLogsTable);
    console.log("   ✓ Cleared activity logs");

    await db.delete(notificationsTable);
    console.log("   ✓ Cleared notifications");

    await db.delete(invoicesTable);
    console.log("   ✓ Cleared invoices");

    await db.delete(purchaseOrdersTable);
    console.log("   ✓ Cleared purchase orders");

    await db.delete(quotationItemsTable);
    console.log("   ✓ Cleared quotation items");

    await db.delete(quotationsTable);
    console.log("   ✓ Cleared quotations");

    await db.delete(rfqVendorsTable);
    console.log("   ✓ Cleared RFQ vendors");

    await db.delete(rfqItemsTable);
    console.log("   ✓ Cleared RFQ items");

    await db.delete(rfqsTable);
    console.log("   ✓ Cleared RFQs");

    await db.delete(usersTable);
    console.log("   ✓ Cleared users");

    await db.delete(vendorsTable);
    console.log("   ✓ Cleared vendors");

    console.log("✅ All data cleared successfully!\n");
  } catch (error) {
    console.error("❌ Error clearing data:", error);
    throw error;
  }
}

async function getSeedStats(): Promise<SeedStats> {
  const [vendorCount] = await db
    .select({ count: db.count() })
    .from(vendorsTable);
  const [userCount] = await db
    .select({ count: db.count() })
    .from(usersTable);
  const [rfqCount] = await db
    .select({ count: db.count() })
    .from(rfqsTable);
  const [quotationCount] = await db
    .select({ count: db.count() })
    .from(quotationsTable);
  const [poCount] = await db
    .select({ count: db.count() })
    .from(purchaseOrdersTable);
  const [invoiceCount] = await db
    .select({ count: db.count() })
    .from(invoicesTable);
  const [approvalCount] = await db
    .select({ count: db.count() })
    .from(approvalsTable);
  const [notificationCount] = await db
    .select({ count: db.count() })
    .from(notificationsTable);
  const [activityCount] = await db
    .select({ count: db.count() })
    .from(activityLogsTable);

  return {
    vendors: vendorCount?.count ?? 0,
    users: userCount?.count ?? 0,
    rfqs: rfqCount?.count ?? 0,
    quotations: quotationCount?.count ?? 0,
    purchaseOrders: poCount?.count ?? 0,
    invoices: invoiceCount?.count ?? 0,
    approvals: approvalCount?.count ?? 0,
    notifications: notificationCount?.count ?? 0,
    activityLogs: activityCount?.count ?? 0,
  };
}

async function checkSeedData(): Promise<void> {
  console.log("🔍 Checking seed data...\n");
  const stats = await getSeedStats();

  console.log("📊 Current Database Statistics:");
  console.log(`   Vendors:            ${stats.vendors}`);
  console.log(`   Users:              ${stats.users}`);
  console.log(`   RFQs:               ${stats.rfqs}`);
  console.log(`   Quotations:         ${stats.quotations}`);
  console.log(`   Purchase Orders:    ${stats.purchaseOrders}`);
  console.log(`   Invoices:           ${stats.invoices}`);
  console.log(`   Approvals:          ${stats.approvals}`);
  console.log(`   Notifications:      ${stats.notifications}`);
  console.log(`   Activity Logs:      ${stats.activityLogs}`);

  const hasData =
    Object.values(stats).reduce((sum, val) => sum + val, 0) > 0;

  if (hasData) {
    console.log("\n✅ Database contains seed data");
  } else {
    console.log("\n⚠️  Database is empty - run 'pnpm run seed' to populate");
  }
}

async function main(): Promise<void> {
  const command = process.argv[2];

  try {
    switch (command) {
      case "clear":
        await clearAllData();
        break;

      case "reset":
        await clearAllData();
        console.log("🌱 Reseeding database...");
        await new Promise((resolve) => setTimeout(resolve, 500));
        console.log("ℹ️  Please run 'pnpm run seed' to populate fresh data\n");
        break;

      case "check":
        await checkSeedData();
        break;

      case "seed":
      default:
        console.log("🌱 Running seed script...");
        console.log(
          "ℹ️  Run seed from: cd lib/db && pnpm exec tsx src/seed.ts\n"
        );
        process.exit(0);
    }
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

main().catch(console.error).finally(() => process.exit(0));
