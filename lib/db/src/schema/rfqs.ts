import { pgTable, text, serial, timestamp, integer, doublePrecision, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const rfqsTable = pgTable("rfqs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  deadline: date("deadline", { mode: "string" }),
  status: text("status").notNull().default("draft"),
  createdById: integer("created_by_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const rfqItemsTable = pgTable("rfq_items", {
  id: serial("id").primaryKey(),
  rfqId: integer("rfq_id").notNull(),
  productName: text("product_name").notNull(),
  description: text("description"),
  quantity: doublePrecision("quantity").notNull().default(1),
  unit: text("unit"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const rfqVendorsTable = pgTable("rfq_vendors", {
  id: serial("id").primaryKey(),
  rfqId: integer("rfq_id").notNull(),
  vendorId: integer("vendor_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertRfqSchema = createInsertSchema(rfqsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertRfqItemSchema = createInsertSchema(rfqItemsTable).omit({ id: true, createdAt: true });
export const insertRfqVendorSchema = createInsertSchema(rfqVendorsTable).omit({ id: true, createdAt: true });

export type InsertRfq = z.infer<typeof insertRfqSchema>;
export type Rfq = typeof rfqsTable.$inferSelect;
export type RfqItem = typeof rfqItemsTable.$inferSelect;
export type RfqVendor = typeof rfqVendorsTable.$inferSelect;
