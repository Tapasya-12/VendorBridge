import { Client } from 'pg';
import 'dotenv/config';

async function checkSupabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✅ Connected to Supabase PostgreSQL database.');

    const tables = [
      'vendors',
      'users',
      'rfqs',
      'rfq_items',
      'rfq_vendors',
      'quotations',
      'quotation_items',
      'purchase_orders',
      'invoices',
      'approvals',
      'activity_logs',
      'notifications'
    ];

    console.log('\n📊 Checking data counts in Supabase:');
    
    for (const table of tables) {
      try {
        const res = await client.query(`SELECT count(*) FROM ${table}`);
        console.log(`   - ${table}: ${res.rows[0].count} rows`);
      } catch (err) {
        console.log(`   ❌ Error querying ${table}:`, err.message);
      }
    }

  } catch (err) {
    console.error('❌ Failed to connect to Supabase:', err);
  } finally {
    await client.end();
  }
}

checkSupabase();
