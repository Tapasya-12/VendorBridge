import React from "react";
import { Link } from "wouter";
import { useListInvoices } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function Invoices() {
  const { data: invoices, isLoading, isError } = useListInvoices();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-800";
      case "overdue": return "bg-red-100 text-red-800";
      case "sent": return "bg-blue-100 text-blue-800";
      case "draft": return "bg-gray-100 text-gray-800";
      case "cancelled": return "bg-slate-200 text-slate-800";
      default: return "bg-primary/10 text-primary";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground mt-1">Manage billing and payments.</p>
        </div>
      </div>

      <div className="rounded-md border border-border/50 bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Invoice Number</TableHead>
              <TableHead>PO Reference</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Amount</TableHead>
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
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-destructive">
                  Failed to load invoices.
                </TableCell>
              </TableRow>
            ) : invoices?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No invoices found.
                </TableCell>
              </TableRow>
            ) : (
              invoices?.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{invoice.poNumber || "N/A"}</TableCell>
                  <TableCell>{invoice.vendorName}</TableCell>
                  <TableCell className="font-semibold">${invoice.totalAmount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`border-0 capitalize ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {invoice.dueDate ? format(new Date(invoice.dueDate), "MMM d, yyyy") : "N/A"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/invoices/${invoice.id}`}>
                      <Button variant="ghost" size="sm">View</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}