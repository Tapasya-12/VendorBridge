import React, { useState } from "react";
import { Link } from "wouter";
import { useListInvoices } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Receipt, Filter } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

const STATUS_COLORS: Record<string, string> = {
  paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  overdue: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  sent: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  issued: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
  viewed: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  partially_paid: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
  disputed: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  cancelled: "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-300",
};

export default function Invoices() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const params: Record<string, string> = {};
  if (statusFilter !== "all") params.status = statusFilter;
  const { data: invoices, isLoading, isError } = useListInvoices(Object.keys(params).length ? params : undefined);

  const filtered = invoices?.filter(inv =>
    !search || 
    inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
    inv.vendorName?.toLowerCase().includes(search.toLowerCase()) ||
    inv.poNumber?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground mt-1">Manage billing and payments.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="viewed">Viewed</SelectItem>
            <SelectItem value="issued">Issued</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="partially_paid">Partially Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="disputed">Disputed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-md border border-border/50 bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Invoice Number</TableHead>
              <TableHead>PO Reference</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-destructive">
                  <p className="font-medium">Failed to load invoices.</p>
                  <p className="text-sm mt-1">Please try again later.</p>
                </TableCell>
              </TableRow>
            ) : filtered?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <Receipt className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground font-medium">
                      {search ? "No invoices match your search." : "No invoices found."}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {search ? "Try a different search term." : "Generate an invoice from a purchase order to get started."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered?.map((invoice, idx) => (
                <motion.tr
                  key={invoice.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.03 }}
                  className="border-b transition-colors hover:bg-muted/50"
                >
                  <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{invoice.poNumber || "—"}</TableCell>
                  <TableCell>{invoice.vendorName}</TableCell>
                  <TableCell className="text-right font-semibold">${invoice.totalAmount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`border-0 capitalize ${STATUS_COLORS[invoice.status] ?? ""}`}>
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {invoice.dueDate ? format(new Date(invoice.dueDate), "MMM d, yyyy") : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/invoices/${invoice.id}`}>
                      <Button variant="ghost" size="sm">View</Button>
                    </Link>
                  </TableCell>
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  );
}