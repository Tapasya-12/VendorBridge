import React, { useState } from "react";
import { Link } from "wouter";
import { useListPurchaseOrders } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

export default function PurchaseOrders() {
  const [status, setStatus] = useState("all");
  const { data: pos, isLoading, isError } = useListPurchaseOrders(status !== "all" ? { status } : undefined);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
          <p className="text-muted-foreground mt-1">Confirmed orders issued to vendors.</p>
        </div>
        <Link href="/purchase-orders/new">
          <Button data-testid="btn-new-po"><Plus className="mr-2 h-4 w-4" /> New Purchase Order</Button>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Filter by status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-md border border-border/50 bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>PO Number</TableHead>
              <TableHead>RFQ</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Tax</TableHead>
              <TableHead>Delivery Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>{Array.from({ length: 8 }).map((__, j) => <TableCell key={j}><Skeleton className="h-5 w-20" /></TableCell>)}</TableRow>
              ))
            ) : isError ? (
              <TableRow><TableCell colSpan={8} className="h-24 text-center text-destructive">Failed to load purchase orders.</TableCell></TableRow>
            ) : !pos?.length ? (
              <TableRow><TableCell colSpan={8} className="h-24 text-center text-muted-foreground">No purchase orders found.</TableCell></TableRow>
            ) : (
              pos.map((po) => (
                <TableRow key={po.id}>
                  <TableCell className="font-mono font-semibold text-sm">{po.poNumber}</TableCell>
                  <TableCell className="text-sm">{po.rfqTitle || `RFQ-${po.rfqId}`}</TableCell>
                  <TableCell>{po.vendorName || `Vendor ${po.vendorId}`}</TableCell>
                  <TableCell className="text-right font-semibold">${po.totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell className="text-right text-muted-foreground">${po.taxAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell className="text-sm">{po.deliveryDate ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`border-0 capitalize ${STATUS_COLORS[po.status] ?? ""}`}>{po.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/purchase-orders/${po.id}`}><Button variant="ghost" size="sm">View</Button></Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  );
}
