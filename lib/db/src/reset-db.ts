import { db } from "./index";
import { usersTable } from "./schema/users";
import { vendorsTable } from "./schema/vendors";
import { rfqsTable, rfqItemsTable, rfqVendorsTable } from "./schema/rfqs";
import { quotationsTable, quotationItemsTable } from "./schema/quotations";
import { purchaseOrdersTable } from "./schema/purchase-orders";
import { invoicesTable } from "./schema/invoices";
import { notificationsTable } from "./schema/notifications";
import { activityLogsTable } from "./schema/activity-logs";
import { approvalsTable } from "./schema/approvals";

async function resetDatabase() {
  console.log("🗑️  Clearing all tables...");
  
  try {
    // Delete in correct order due to foreign keys
    await db.delete(approvalsTable);
    console.log("  ✓ Cleared approvals");
    
    await db.delete(activityLogsTable);
    console.log("  ✓ Cleared activity logs");
    
    await db.delete(notificationsTable);
    console.log("  ✓ Cleared notifications");
    
    await db.delete(invoicesTable);
    console.log("  ✓ Cleared invoices");
    
    await db.delete(purchaseOrdersTable);
    console.log("  ✓ Cleared purchase orders");
    
    await db.delete(quotationItemsTable);
    console.log("  ✓ Cleared quotation items");
    
    await db.delete(quotationsTable);
    console.log("  ✓ Cleared quotations");
    
    await db.delete(rfqVendorsTable);
    console.log("  ✓ Cleared RFQ vendors");
    
    await db.delete(rfqItemsTable);
    console.log("  ✓ Cleared RFQ items");
    
    await db.delete(rfqsTable);
    console.log("  ✓ Cleared RFQs");
    
    await db.delete(usersTable);
    console.log("  ✓ Cleared users");
    
    await db.delete(vendorsTable);
    console.log("  ✓ Cleared vendors");
    
    console.log("\n✅ Database reset completed successfully!");
  } catch (error) {
    console.error("\n❌ Error resetting database:", error);
    throw error;
  }
}

resetDatabase()
  .catch(console.error)
  .finally(() => process.exit(0));
