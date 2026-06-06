import React, { useState } from "react";
import { Link } from "wouter";
import { useListRfqs } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus, Calendar, FileText, Filter } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

const STATUS_COLORS: Record<string, string> = {
  sent: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  published: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
  closed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

export default function Rfqs() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const params: Record<string, string> = {};
  if (search) params.search = search;
  if (statusFilter !== "all") params.status = statusFilter;
  const { data: rfqs, isLoading, isError } = useListRfqs(Object.keys(params).length ? params : undefined);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Requests for Quotation</h1>
          <p className="text-muted-foreground mt-1">Manage procurement requests and bids.</p>
        </div>
        <Link href="/rfqs/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Create RFQ
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search RFQs..." 
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
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-md border border-border/50 bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>RFQ Reference</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>Quotations</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-destructive">
                  <p className="font-medium">Failed to load RFQs.</p>
                  <p className="text-sm mt-1">Please try again later.</p>
                </TableCell>
              </TableRow>
            ) : rfqs?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground font-medium">
                      {search ? "No RFQs match your search." : "No RFQs yet."}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {search ? "Try a different search term." : "Create your first request for quotation."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              rfqs?.map((rfq, idx) => (
                <motion.tr
                  key={rfq.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.03 }}
                  className="border-b transition-colors hover:bg-muted/50"
                >
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{rfq.title}</span>
                      <span className="text-xs text-muted-foreground">RFQ-{String(rfq.id).padStart(5, '0')}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-sm">
                    {rfq.description || "No description"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`border-0 capitalize ${STATUS_COLORS[rfq.status] ?? ""}`}>
                      {rfq.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <Calendar className="mr-2 h-3 w-3 text-muted-foreground" />
                      {rfq.deadline ? format(new Date(rfq.deadline), "MMM d, yyyy") : "No deadline"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-mono">{rfq.quotationCount || 0}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/rfqs/${rfq.id}`}>
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