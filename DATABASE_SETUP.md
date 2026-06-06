# VendorBridge Database Setup Guide

This guide will help you set up the VendorBridge database with Supabase and seed it with production-like data.

## 🎯 Overview

VendorBridge uses:
- **Supabase** (PostgreSQL) for cloud database hosting
- **Drizzle ORM** for type-safe database operations
- **Production-like seed data** for testing and development

## ⚡ Quick Setup (5 Minutes)

### Step 1: Install Dependencies

```bash
pnpm install
```

### Step 2: Verify Database Connection

Your `.env` file is already configured with Supabase credentials:

```env
DATABASE_URL=postgresql://postgres.ezoeannifgojdvmhnlix:...
SUPABASE_URL=https://ezoeannifgojdvmhnlix.supabase.co
```

### Step 3: Push Database Schema to Supabase

Navigate to the database package and push the schema:

```bash
cd lib/db
# For Windows PowerShell:
$env:DATABASE_URL="<your-database-url>"; pnpm run push

# For Mac/Linux:
DATABASE_URL="<your-database-url>" pnpm run push
```

This will create all tables in your Supabase database.

### Step 4: Seed the Database

```bash
pnpm run seed
```

This populates your database with:
- ✅ 15 Vendors (various categories)
- ✅ 25 Users (admin, procurement, managers, vendors)
- ✅ 25 RFQs (Request for Quotations)
- ✅ 40 Quotations from vendors
- ✅ 30 Purchase Orders
- ✅ 15 Invoices
- ✅ 20 Approval records
- ✅ 25 Activity logs
- ✅ 30 Notifications

### Step 5: Start the API Server

Return to the root directory and start the backend:

```bash
cd ../..
cd artifacts/api-server
pnpm run dev
```

The API server will run at `http://localhost:5000`

### Step 6: Start the Frontend

```bash
cd ../vendorbridge
pnpm run dev
```

The frontend will run at `http://localhost:5173`

## 🔑 Test Credentials

After seeding, login with these accounts:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@vendorbridge.com | password123 |
| **Procurement Officer** | john.procurement@vendorbridge.com | password123 |
| **Manager** | michael.manager@vendorbridge.com | password123 |
| **Vendor** | sales@acmesupplies.com | password123 |

## 📊 What Data is Seeded?

### Vendors (15)
Diverse vendors across categories:
- Hardware, Electronics, Stationery
- Construction, Cleaning, Logistics
- Medical, Software, Furniture
- Distribution, Packaging, IT Security, Consulting

### Users (25)
- 2 Admins
- 5 Procurement Officers
- 4 Managers
- 15 Vendor users (linked to vendor companies)

### RFQs (25)
Sample requests like:
- Q3 Laptops Procurement
- Office Chairs
- Server Racks
- Printer Ink
- Medical Masks
- Network Switches
- Software Licenses
- And more...

### Quotations (40)
Multiple vendor responses per RFQ with varied statuses:
- Submitted
- Accepted
- Rejected
- Negotiating

### Purchase Orders (30)
Various statuses:
- Draft
- Issued
- Acknowledged
- Partially Received
- Received
- Fulfilled
- Cancelled

### Invoices (15)
Different payment states:
- Draft
- Issued
- Sent
- Viewed
- Partially Paid
- Paid
- Overdue
- Disputed

## 🔄 Database Management Commands

All commands should be run from `lib/db` directory:

```bash
cd lib/db
```

### Push Schema Changes
```bash
pnpm run push
```

### Force Push (deletes conflicting data)
```bash
pnpm run push-force
```

### Seed Database
```bash
pnpm run seed
```

### Reset Database (Clear + Reseed)
```bash
pnpm run reset
```

## 🔍 Verify Data in Supabase

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project: `ezoeannifgojdvmhnlix`
3. Click **Table Editor** in the left sidebar
4. Browse your seeded tables:
   - `vendors`
   - `users`
   - `rfqs`
   - `quotations`
   - `purchase_orders`
   - `invoices`
   - `approvals`
   - `notifications`
   - `activity_logs`

## 🧪 Testing API Endpoints

### Get All Vendors
```bash
curl http://localhost:5000/api/vendors
```

### Get All RFQs
```bash
curl http://localhost:5000/api/rfqs
```

### Get Dashboard Summary
```bash
curl http://localhost:5000/api/dashboard/summary
```

### Get Analytics
```bash
curl http://localhost:5000/api/analytics/overview
```

## 🏗️ Architecture

### Data Flow

```
Frontend (React) 
    ↓
API Server (Express)
    ↓
Drizzle ORM
    ↓
Supabase PostgreSQL
```

### No Mock Data!

✅ **All API routes fetch from Supabase database**  
❌ **No hardcoded mock data in the codebase**  
✅ **Production-ready implementation**  

Every API endpoint in `artifacts/api-server/src/routes/` uses:

```typescript
import { db } from "@workspace/db";

// Real database queries
const vendors = await db.select().from(vendorsTable);
```

## 🚨 Important Notes

### ⚠️ Development vs Production

**Development (Current Setup):**
- Uses seed data for testing
- Safe to run `pnpm run reset`
- Can modify data freely

**Production (Future):**
- ❌ Never run `seed` or `reset` commands
- ✅ Use proper migrations
- ✅ Enable Row Level Security (RLS)
- ✅ Change default passwords
- ✅ Set up backups

### 🔐 Security Checklist for Production

- [ ] Change all default passwords
- [ ] Enable Row Level Security in Supabase
- [ ] Use environment-specific credentials
- [ ] Set up database backups
- [ ] Enable SSL/TLS connections
- [ ] Implement proper authentication
- [ ] Add rate limiting
- [ ] Enable audit logging

## 🐛 Troubleshooting

### Problem: "DATABASE_URL not found"

**Solution:** Ensure `.env` file exists in root directory and that you pass it during command execution if necessary (e.g., `$env:DATABASE_URL="..." pnpm run push`).

### Problem: "Connection timeout"

**Solution:** Check Supabase project status and connection string

### Problem: "Foreign key constraint violation"

**Solution:** Run reset to clear database in correct order:
```bash
cd lib/db
pnpm run reset
```

### Problem: "Table already exists"

**Solution:** Use force push:
```bash
pnpm run push-force
```

### Problem: Seed script fails halfway

**Solution:** Reset and try again:
```bash
pnpm run reset
```

## 📚 Additional Resources

- [Full Database Documentation](./lib/db/README.md)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Supabase Docs](https://supabase.com/docs)
- [API Documentation](./artifacts/api-server/README.md)

## 🎉 Success!

After completing these steps, your VendorBridge application should have:

✅ Database schema deployed to Supabase  
✅ Production-like seed data  
✅ API server fetching from database  
✅ Frontend connected and working  
✅ Test accounts ready to use  

Happy coding! 🚀
