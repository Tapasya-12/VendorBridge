import { Router } from "express";
import { eq, and } from "drizzle-orm";
import { db, invoicesTable, purchaseOrdersTable, vendorsTable } from "@workspace/db";
import { sendInvoiceEmail } from "../lib/email.js";
import { logger } from "../lib/logger.js";

const router = Router();

let invoiceCounter = 1000;

function generateInvoiceNumber() {
  invoiceCounter++;
  return `INV-${new Date().getFullYear()}-${String(invoiceCounter).padStart(5, "0")}`;
}

async function getInvoiceWithDetails(invId: number) {
  const [inv] = await db.select().from(invoicesTable).where(eq(invoicesTable.id, invId));
  if (!inv) return null;
  const [po] = await db.select({ poNumber: purchaseOrdersTable.poNumber }).from(purchaseOrdersTable).where(eq(purchaseOrdersTable.id, inv.purchaseOrderId));
  const [vendor] = await db.select({ name: vendorsTable.name, email: vendorsTable.email }).from(vendorsTable).where(eq(vendorsTable.id, inv.vendorId));
  return {
    id: inv.id, invoiceNumber: inv.invoiceNumber,
    purchaseOrderId: inv.purchaseOrderId, poNumber: po?.poNumber ?? null,
    vendorId: inv.vendorId, vendorName: vendor?.name ?? null, vendorEmail: vendor?.email ?? null,
    subtotal: inv.subtotal, taxAmount: inv.taxAmount, totalAmount: inv.totalAmount,
    status: inv.status, dueDate: inv.dueDate ?? null, notes: inv.notes ?? null,
    emailSentAt: inv.emailSentAt ? inv.emailSentAt.toISOString() : null,
    createdAt: inv.createdAt.toISOString(),
  };
}

router.get("/invoices", async (req, res): Promise<void> => {
  const { status, vendorId } = req.query as { status?: string; vendorId?: string };
  const conditions = [];
  if (status) conditions.push(eq(invoicesTable.status, status));
  if (vendorId) conditions.push(eq(invoicesTable.vendorId, parseInt(vendorId, 10)));
  const rows = conditions.length > 0
    ? await db.select().from(invoicesTable).where(conditions.length === 1 ? conditions[0] : and(...conditions)).orderBy(invoicesTable.createdAt)
    : await db.select().from(invoicesTable).orderBy(invoicesTable.createdAt);
  const results = await Promise.all(rows.map(r => getInvoiceWithDetails(r.id)));
  res.json(results.filter(Boolean));
});

router.post("/invoices", async (req, res): Promise<void> => {
  const { purchaseOrderId, vendorId, subtotal, taxAmount, totalAmount, dueDate, notes } = req.body;
  if (!purchaseOrderId || !vendorId || subtotal == null || totalAmount == null) {
    res.status(400).json({ error: "purchaseOrderId, vendorId, subtotal and totalAmount required" });
    return;
  }
  const invoiceNumber = generateInvoiceNumber();
  const [inv] = await db.insert(invoicesTable).values({
    invoiceNumber, purchaseOrderId, vendorId,
    subtotal, taxAmount: taxAmount ?? 0, totalAmount, status: "draft",
    dueDate: dueDate ?? null, notes: notes ?? null,
  }).returning();
  const result = await getInvoiceWithDetails(inv.id);
  res.status(201).json(result);
});

router.get("/invoices/:id", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const result = await getInvoiceWithDetails(id);
  if (!result) { res.status(404).json({ error: "Invoice not found" }); return; }
  res.json(result);
});

router.patch("/invoices/:id", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const updates: Record<string, unknown> = {};
  if (req.body.status !== undefined) updates.status = req.body.status;
  if (req.body.dueDate !== undefined) updates.dueDate = req.body.dueDate;
  if (req.body.notes !== undefined) updates.notes = req.body.notes;
  const [inv] = await db.update(invoicesTable).set(updates).where(eq(invoicesTable.id, id)).returning();
  if (!inv) { res.status(404).json({ error: "Invoice not found" }); return; }
  const result = await getInvoiceWithDetails(id);
  res.json(result);
});

router.post("/invoices/:id/send-email", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const { recipientEmail } = req.body;
  if (!recipientEmail) { res.status(400).json({ error: "recipientEmail required" }); return; }
  
  // Get full invoice details before sending
  const result = await getInvoiceWithDetails(id);
  if (!result) { res.status(404).json({ error: "Invoice not found" }); return; }
  
  // Send email
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const emailSent = await sendInvoiceEmail(recipientEmail, {
    invoiceNumber: result.invoiceNumber,
    vendorName: result.vendorName || "Vendor",
    totalAmount: result.totalAmount,
    dueDate: result.dueDate,
    invoiceUrl: `${frontendUrl}/invoices/${id}`,
  });
  
  if (!emailSent) {
    logger.error({ invoiceId: id, recipientEmail }, "Failed to send invoice email");
    res.status(500).json({ error: "Failed to send email" });
    return;
  }
  
  // Update invoice status
  const [inv] = await db.update(invoicesTable).set({ status: "sent", emailSentAt: new Date() }).where(eq(invoicesTable.id, id)).returning();
  if (!inv) { res.status(404).json({ error: "Invoice not found after email sent" }); return; }
  
  res.json({ message: `Invoice sent to ${recipientEmail}`, success: true });
});

export default router;
