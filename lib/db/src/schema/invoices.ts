import { pgTable, text, serial, timestamp, integer, doublePrecision, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const invoicesTable = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  purchaseOrderId: integer("purchase_order_id").notNull(),
  vendorId: integer("vendor_id").notNull(),
  subtotal: doublePrecision("subtotal").notNull(),
  taxAmount: doublePrecision("tax_amount").notNull().default(0),
  totalAmount: doublePrecision("total_amount").notNull(),
  status: text("status").notNull().default("draft"),
  dueDate: date("due_date", { mode: "string" }),
  notes: text("notes"),
  emailSentAt: timestamp("email_sent_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertInvoiceSchema = createInsertSchema(invoicesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoicesTable.$inferSelect;
