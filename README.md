# VendorBridge 🌉

> A comprehensive ERP platform for streamlining procurement workflows and vendor management

VendorBridge is a modern, full-stack procurement management system designed to transform how organizations handle their entire procurement lifecycle—from vendor onboarding to invoice payment. Built with the latest web technologies, it provides a seamless experience for managing vendors, creating RFQs, comparing quotations, and processing purchase orders.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.1-61dafb.svg)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-5.2-green.svg)](https://expressjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38bdf8.svg)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-via_Supabase-336791.svg)](https://supabase.com/)

---

## ✨ Features

### 🏢 Vendor Management
- Complete vendor registration and onboarding workflow
- Category-based vendor organization (Hardware, Electronics, Stationery, Construction, etc.)
- Vendor status tracking (Pending, Approved, Suspended, Blacklisted)
- Rating system and performance analytics
- GST number verification and address management

### 📋 Request for Quotation (RFQ)
- Create detailed RFQs with multiple line items
- Assign RFQs to multiple vendors simultaneously
- Set deadlines and product specifications
- Track RFQ status through lifecycle (Draft → Sent → Closed)
- Comprehensive product specifications with quantity and unit tracking

### 💰 Quotation Management
- Vendors submit competitive quotations
- Side-by-side quotation comparison
- Line-item level pricing details
- Delivery timeline tracking
- Status management (Draft, Submitted, Accepted, Rejected, Negotiating)

### ✅ Approval Workflows
- Multi-level approval system for quotations
- Role-based approval permissions
- Audit trail with remarks and timestamps
- Manager oversight and decision tracking

### 📦 Purchase Order Management
- Automated PO generation from approved quotations
- Unique PO number generation
- Tax calculation and invoice-ready formatting
- Status tracking (Draft → Issued → Acknowledged → Received → Fulfilled)
- Delivery date management

### 🧾 Invoice Processing
- Vendor invoice submission portal
- Link invoices to purchase orders
- Payment status tracking (Issued, Sent, Paid, Overdue, Disputed)
- Due date management with overdue alerts
- Email tracking for sent invoices

### 📊 Dashboard & Analytics
- Real-time KPI metrics dashboard
- Spending trends and financial analytics
- Vendor performance rankings
- RFQ and PO status breakdowns
- Recent activity feed

### 🔐 Authentication & Authorization
- Role-based access control (Admin, Procurement Officer, Manager, Vendor)
- Secure session-based authentication
- 30-day session expiry
- Password security and hashing

### 📝 Activity Logs & Notifications
- Comprehensive audit trail of all system activities
- Real-time notification system
- User activity tracking
- Workflow change alerts

---

## 🚀 Tech Stack

### Frontend
- **Framework:** React 19.1 with TypeScript
- **Build Tool:** Vite
- **Routing:** Wouter
- **State Management:** TanStack Query (React Query)
- **Styling:** Tailwind CSS 4.1 with Shadcn/ui components
- **UI Components:** Radix UI primitives
- **Animations:** Framer Motion
- **Charts:** Recharts
- **Forms:** React Hook Form with Zod validation

### Backend
- **Framework:** Express.js 5.2
- **Runtime:** Node.js
- **Language:** TypeScript
- **Authentication:** Session-based auth
- **Logging:** Pino (structured logging)
- **API Validation:** Zod schemas

### Database
- **Database:** PostgreSQL (hosted on Supabase)
- **ORM:** Drizzle ORM 0.45
- **Database Client:** Supabase JS SDK
- **Region:** Asia Pacific (Singapore)

### Monorepo
- **Package Manager:** pnpm with workspaces
- **Build System:** TypeScript project references
- **Code Quality:** TypeScript strict mode, Prettier

---

## 📁 Project Structure

```
Vendorbridge/
├── artifacts/                    # Main applications
│   ├── api-server/              # Express backend API
│   │   ├── src/
│   │   │   ├── routes/         # REST API endpoints
│   │   │   ├── middleware/     # Auth middleware
│   │   │   ├── lib/           # Auth, logging, Supabase client
│   │   │   └── index.ts       # Server entry point
│   │   └── package.json
│   │
│   └── vendorbridge/           # React frontend SPA
│       ├── src/
│       │   ├── pages/         # 25+ page components
│       │   ├── components/    # Reusable UI components
│       │   ├── hooks/         # Custom React hooks
│       │   ├── lib/          # Utilities
│       │   └── App.tsx       # Main app router
│       └── package.json
│
├── lib/                        # Shared libraries
│   ├── db/                    # Database package
│   │   ├── src/
│   │   │   ├── schema/       # 12 table schemas
│   │   │   └── index.ts      # DB connection
│   │   └── drizzle.config.ts
│   │
│   ├── api-zod/              # Zod validation schemas
│   ├── api-client-react/     # React Query API hooks
│   └── api-spec/             # OpenAPI specification
│
├── .env                       # Environment variables
├── DATABASE_SETUP.md          # Database setup guide
├── pnpm-workspace.yaml        # Monorepo workspace config
└── package.json               # Root workspace
```

---

## 🛠️ Setup & Installation

### Prerequisites

- **Node.js:** v18 or higher
- **pnpm:** v8 or higher (install via `npm install -g pnpm`)
- **Git:** For version control

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Tapasya-12/VendorBridge.git
   cd Vendorbridge
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up the database**
   
   The project is pre-configured with Supabase. Push the database schema. Ensure your `.env` file is set up first, then run:
   ```bash
   cd lib/db
   # For Windows PowerShell:
   $env:DATABASE_URL="<your-database-url>"; pnpm run push
   
   # For Mac/Linux:
   DATABASE_URL="<your-database-url>" pnpm run push
   ```

4. **Verify environment variables**
   
   Ensure `.env` file exists in the root directory with database credentials:
   ```env
   DATABASE_URL=postgresql://...
   SUPABASE_URL=https://...
   ```

5. **Build the project**
   ```bash
   pnpm run build
   ```

---

## 🛠️ Troubleshooting

- **`ERR_PNPM_IGNORED_BUILDS` on install:** If `pnpm install` blocks `esbuild` from running, update `pnpm-workspace.yaml` and set `allowBuilds: esbuild: true` or run `pnpm approve-builds`.
- **Database Push Errors:** If `pnpm run push` fails with `DATABASE_URL, ensure the database is provisioned`, ensure you are explicitly passing the `DATABASE_URL` variable as shown in the setup steps above.

---

## 🎯 Running the Application

### Development Mode

**Option 1: Run all services** (Recommended)

Open two terminal windows:

```bash
# Terminal 1 - Backend API Server (Port 5000)
cd artifacts/api-server
pnpm run dev
```

```bash
# Terminal 2 - Frontend Development Server (Port 5173)
cd artifacts/vendorbridge
pnpm run dev
```

**Option 2: Use the root scripts**

The application provides convenient scripts at the workspace root:
```bash
# From root directory
pnpm run build          # Build all packages
pnpm run typecheck      # Type check all packages
```

### Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/api/health

### Production Mode

1. **Build all packages:**
   ```bash
   pnpm run build
   ```

2. **Start the backend:**
   ```bash
   cd artifacts/api-server
   pnpm run start
   ```

3. **Serve the frontend:**
   ```bash
   cd artifacts/vendorbridge
   pnpm run serve
   ```

---

## 📖 User Roles & Permissions

VendorBridge supports four distinct user roles:

| Role | Description | Access Level |
|------|-------------|--------------|
| **Admin** | Full system access | All features and configurations |
| **Procurement Officer** | Manages procurement workflow | Create RFQs, manage vendors, process POs |
| **Manager** | Oversees and approves | Approve quotations, view analytics |
| **Vendor** | External vendor access | Submit quotations, view RFQs, manage invoices |

---

## 🔑 Key API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Vendors
- `GET /api/vendors` - List all vendors
- `POST /api/vendors` - Create new vendor
- `GET /api/vendors/:id` - Get vendor details
- `PUT /api/vendors/:id` - Update vendor
- `DELETE /api/vendors/:id` - Delete vendor

### RFQs
- `GET /api/rfqs` - List all RFQs
- `POST /api/rfqs` - Create new RFQ
- `GET /api/rfqs/:id` - Get RFQ details
- `PUT /api/rfqs/:id` - Update RFQ

### Quotations
- `GET /api/quotations` - List quotations
- `POST /api/quotations` - Submit quotation
- `GET /api/quotations/:id` - Get quotation details

### Purchase Orders
- `GET /api/purchase-orders` - List purchase orders
- `POST /api/purchase-orders` - Create purchase order
- `GET /api/purchase-orders/:id` - Get PO details

### Invoices
- `GET /api/invoices` - List invoices
- `POST /api/invoices` - Create invoice
- `GET /api/invoices/:id` - Get invoice details

### Analytics
- `GET /api/dashboard/summary` - Dashboard KPI metrics
- `GET /api/analytics/spending-trend` - Spending trends
- `GET /api/analytics/vendor-performance` - Vendor analytics

---

## 🎨 UI/UX Highlights

- **Responsive Design:** Fully mobile-optimized interface
- **Dark Mode:** Built-in theme switcher
- **Smooth Animations:** Framer Motion powered transitions
- **Accessible:** WCAG compliant with Radix UI primitives
- **Modern UI:** Clean, professional design with Tailwind CSS
- **Interactive Charts:** Data visualization with Recharts
- **Real-time Updates:** Live notifications and activity feeds

---

## 🗄️ Database Schema

VendorBridge uses 12 core tables:

1. **users** - User accounts and authentication
2. **vendors** - Vendor company profiles
3. **rfqs** - Request for Quotations
4. **rfq_items** - RFQ line items
5. **rfq_vendors** - RFQ-Vendor relationships
6. **quotations** - Vendor quotation responses
7. **quotation_items** - Quotation line items
8. **approvals** - Approval workflow records
9. **purchase_orders** - Purchase orders
10. **invoices** - Vendor invoices
11. **notifications** - User notifications
12. **activity_logs** - Audit trail
13. **sessions** - Authentication sessions

---

## 🧪 Development

### Type Checking
```bash
pnpm run typecheck
```

### Building Packages
```bash
pnpm run build
```

### Database Operations
```bash
cd lib/db

# Push schema changes to database
pnpm run push

# Generate Drizzle migrations
pnpm run generate

# View database in Drizzle Studio
pnpm run studio
```

---

## 🔒 Security Features

- **Session-based Authentication:** Secure 30-day sessions
- **Password Hashing:** Industry-standard password encryption
- **CORS Protection:** Configured CORS middleware
- **SQL Injection Prevention:** Drizzle ORM parameterized queries
- **Role-based Access Control:** Granular permission system
- **Audit Logging:** Complete activity trail
- **Environment Security:** Sensitive variables (`.env`) are excluded from version control to prevent credential leaks.
---

## 🌟 Key Workflows

### 1. Procurement Workflow
```
Create RFQ → Assign to Vendors → Receive Quotations → 
Compare & Approve → Generate Purchase Order → 
Receive Goods → Process Invoice → Complete Payment
```

### 2. Vendor Onboarding
```
Vendor Registration → Admin Review → 
Approval/Rejection → Vendor Activation → 
Category Assignment
```

### 3. Approval Process
```
Quotation Submitted → Pending Approval → 
Manager Review → Approve/Reject → 
Notification Sent → PO Generation (if approved)
```

---

## 📈 Performance Optimizations

- **Code Splitting:** Vite-powered lazy loading
- **React Query Caching:** Optimized data fetching with 30s stale time
- **Database Connection Pooling:** Supabase pooler for efficient connections
- **TypeScript Strict Mode:** Type safety and better IDE support
- **Build Optimization:** Production-ready minified bundles

---

## 🤝 Contributing

This is a hackathon project. If you'd like to contribute or use this as a foundation for your procurement system, feel free to fork and customize to your needs.

### Development Guidelines
- Follow TypeScript strict mode
- Use Prettier for code formatting
- Write type-safe code with Zod validation
- Follow React best practices
- Maintain consistent component structure

---

## 📝 License

MIT License - Feel free to use this project for your organization's procurement needs.

---

## 🙏 Acknowledgments

Built with modern web technologies and best practices for the Vendorbridge Hackathon. Special thanks to:
- **Supabase** for database hosting
- **Shadcn/ui** for beautiful UI components
- **Drizzle ORM** for type-safe database operations
- **React Query** for powerful data fetching

---

## 📞 Support

For setup issues or questions, please refer to:
- **Database Setup:** See `DATABASE_SETUP.md`
- **API Documentation:** Available in `lib/api-spec/`

---

**Made with ❤️ for streamlined procurement management**
