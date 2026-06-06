import { pgTable, text, serial, timestamp, integer, doublePrecision, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const purchaseOrdersTable = pgTable("purchase_orders", {
  id: serial("id").primaryKey(),
  poNumber: text("po_number").notNull().unique(),
  rfqId: integer("rfq_id").notNull(),
  quotationId: integer("quotation_id").notNull(),
  vendorId: integer("vendor_id").notNull(),
  totalAmount: doublePrecision("total_amount").notNull(),
  taxAmount: doublePrecision("tax_amount").notNull().default(0),
  status: text("status").notNull().default("draft"),
  deliveryDate: date("delivery_date", { mode: "string" }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrdersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPurchaseOrder = z.infer<typeof insertPurchaseOrderSchema>;
export type PurchaseOrder = typeof purchaseOrdersTable.$inferSelect;
