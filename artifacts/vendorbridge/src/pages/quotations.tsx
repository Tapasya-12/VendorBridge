import React, { useState } from "react";
import { Link } from "wouter";
import { useListQuotations } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  submitted: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  negotiating: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  accepted: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

export default function Quotations() {
  const [status, setStatus] = useState<string>("all");
  const { data: quotations, isLoading, isError } = useListQuotations(status !== "all" ? { status } : undefined);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quotations</h1>
          <p className="text-muted-foreground mt-1">Vendor quotations received against RFQs.</p>
        </div>
        <Link href="/quotations/new">
          <Button data-testid="btn-new-quotation"><Plus className="mr-2 h-4 w-4" /> New Quotation</Button>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Filter by status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="negotiating">Negotiating</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-md border border-border/50 bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Quotation</TableHead>
              <TableHead>RFQ</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead className="text-right">Total Price</TableHead>
              <TableHead>Delivery</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((__, j) => <TableCell key={j}><Skeleton className="h-5 w-20" /></TableCell>)}
                </TableRow>
              ))
            ) : isError ? (
              <TableRow><TableCell colSpan={7} className="h-24 text-center text-destructive">Failed to load quotations.</TableCell></TableRow>
            ) : !quotations?.length ? (
              <TableRow><TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No quotations found.</TableCell></TableRow>
            ) : (
              quotations.map((q) => (
                <TableRow key={q.id}>
                  <TableCell className="font-mono text-sm">QUO-{String(q.id).padStart(5, "0")}</TableCell>
                  <TableCell className="font-medium text-sm">{q.rfqTitle || `RFQ-${q.rfqId}`}</TableCell>
                  <TableCell>{q.vendorName || `Vendor ${q.vendorId}`}</TableCell>
                  <TableCell className="text-right font-semibold">${q.totalPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell>{q.deliveryDays ? `${q.deliveryDays} days` : "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`border-0 capitalize ${STATUS_COLORS[q.status] ?? ""}`}>
                      {q.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/quotations/${q.id}`}><Button variant="ghost" size="sm">View</Button></Link>
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
