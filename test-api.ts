import { db } from "./lib/db/src/index";
import { usersTable } from "./lib/db/src/schema/users";
import { sessionsTable } from "./lib/db/src/schema/sessions";
import { eq } from "drizzle-orm";

async function testApi() {
  console.log("Setting up test session...");
  
  // Get the admin user we seeded earlier
  const [admin] = await db.select().from(usersTable).where(eq(usersTable.email, "admin@vendorbridge.com"));
  if (!admin) {
    console.error("Seed data missing!");
    process.exit(1);
  }

  const token = "test_token_12345";
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

  // Clear any existing test session
  await db.delete(sessionsTable).where(eq(sessionsTable.token, token));

  // Insert a test session
  await db.insert(sessionsTable).values({
    userId: admin.id,
    token,
    expiresAt,
  });

  const baseUrl = "http://localhost:5000/api";
  const headers = { Authorization: `Bearer ${token}` };

  async function fetchEndpoint(name: string, path: string) {
    try {
      const response = await fetch(`${baseUrl}${path}`, { headers });
      if (!response.ok) {
        console.error(`❌ [${name}] Failed with status ${response.status}`);
        console.error(await response.text());
      } else {
        const data = await response.json();
        console.log(`✅ [${name}] OK - Returned ${Array.isArray(data) ? data.length + ' items' : '1 object'}`);
      }
    } catch (e: any) {
      console.error(`❌ [${name}] Network error: ${e.message}`);
    }
  }

  console.log("\nTesting API Endpoints:");
  await fetchEndpoint("Health Check", "/health");
  await fetchEndpoint("Dashboard Stats", "/dashboard/stats");
  await fetchEndpoint("RFQs List", "/rfqs");
  await fetchEndpoint("Vendors List", "/vendors");
  await fetchEndpoint("Quotations List", "/quotations");
  await fetchEndpoint("Purchase Orders List", "/purchase-orders");
  await fetchEndpoint("Invoices List", "/invoices");
  await fetchEndpoint("Users List", "/users");
  
  console.log("\nDone testing API endpoints.");
  process.exit(0);
}

testApi().catch(console.error);
