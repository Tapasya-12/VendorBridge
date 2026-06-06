import { db } from "./index";

async function seed() {
  console.log("🌱 Database seeding is now disabled.");
  console.log("   Mock data has been migrated to the production Supabase database.");
  console.log("   To add data, use the application UI or API endpoints.");
}

seed().catch(console.error).finally(() => process.exit(0));
