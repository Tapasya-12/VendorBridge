import { pgTable, text, serial, timestamp, integer, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const quotationsTable = pgTable("quotations", {
  id: serial("id").primaryKey(),
  rfqId: integer("rfq_id").notNull(),
  vendorId: integer("vendor_id").notNull(),
  totalPrice: doublePrecision("total_price").notNull(),
  deliveryDays: integer("delivery_days"),
  notes: text("notes"),
  status: text("status").notNull().default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const quotationItemsTable = pgTable("quotation_items", {
  id: serial("id").primaryKey(),
  quotationId: integer("quotation_id").notNull(),
  productName: text("product_name").notNull(),
  unitPrice: doublePrecision("unit_price").notNull(),
  quantity: doublePrecision("quantity").notNull(),
  totalPrice: doublePrecision("total_price").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertQuotationSchema = createInsertSchema(quotationsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertQuotationItemSchema = createInsertSchema(quotationItemsTable).omit({ id: true, createdAt: true });

export type InsertQuotation = z.infer<typeof insertQuotationSchema>;
export type Quotation = typeof quotationsTable.$inferSelect;
export type QuotationItem = typeof quotationItemsTable.$inferSelect;
