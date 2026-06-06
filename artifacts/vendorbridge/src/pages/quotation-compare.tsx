import React, { useState } from "react";
import { useParams, Link } from "wouter";
import { useGetRfq, useListRfqQuotations } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Star, TrendingDown, CheckCircle2, Clock, Box } from "lucide-react";
import { motion } from "framer-motion";

const QUOTATION_STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  submitted: "bg-blue-100 text-blue-800",
  negotiating: "bg-yellow-100 text-yellow-800",
  accepted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export default function QuotationCompare() {
  const { id } = useParams<{ id: string }>();
  const rfqId = parseInt(id ?? "0", 10);

  const { data: rfq, isLoading: rfqLoading, isError } = useGetRfq(rfqId, { query: { enabled: !!rfqId } });
  const { data: quotations, isLoading: quotationsLoading } = useListRfqQuotations(rfqId);

  const [sortBy, setSortBy] = useState<"price" | "delivery">("price");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  if (rfqLoading || quotationsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (isError || !rfq) {
    return (
      <div className="space-y-4">
        <Link href={`/rfqs/${rfqId}`}>
          <Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4" /> Back to RFQ</Button>
        </Link>
        <p className="text-destructive">RFQ not found.</p>
      </div>
    );
  }

  let filteredQuotations = quotations || [];
  if (filterStatus !== "all") {
    filteredQuotations = filteredQuotations.filter((q) => q.status === filterStatus);
  }

  const sortedQuotations = [...filteredQuotations].sort((a, b) => {
    if (sortBy === "price") {
      return a.totalPrice - b.totalPrice;
    } else {
      return (a.deliveryDays || 0) - (b.deliveryDays || 0);
    }
  });

  const allQuotations = quotations || [];
  const lowestPrice = allQuotations.length ? Math.min(...allQuotations.map(q => q.totalPrice)) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href={`/rfqs/${rfqId}`}>
            <Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Compare Quotations</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Comparing {sortedQuotations.length} quotes for <span className="font-medium text-foreground">{rfq.title}</span>
            </p>
          </div>
        </div>
      </div>

      <Card className="border-border/50 bg-muted/20">
        <CardContent className="p-4 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Sort By:</span>
            <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
              <SelectTrigger className="w-[180px] bg-white dark:bg-slate-900">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price">Lowest Price First</SelectItem>
                <SelectItem value="delivery">Fastest Delivery First</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Status:</span>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px] bg-white dark:bg-slate-900">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="negotiating">Negotiating</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {!sortedQuotations.length ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            No quotations found matching your criteria.
          </CardContent>
        </Card>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
          {sortedQuotations.map((q, idx) => {
            const isBestPrice = q.totalPrice === lowestPrice;
            const isAccepted = q.status === "accepted";
            const isRejected = q.status === "rejected";
            
            // Mock rating for demonstration based on vendor ID or index to keep it deterministic per quote
            const mockRating = 3.5 + ((q.vendorId % 3) * 0.5);

            return (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="snap-center shrink-0 w-[300px] md:w-[350px]"
              >
                <Card className={`h-full relative overflow-hidden transition-all hover:shadow-lg border-2 ${
                  isBestPrice && !isRejected ? "border-green-400 dark:border-green-600 shadow-green-100 dark:shadow-none" :
                  isAccepted ? "border-blue-400 dark:border-blue-600" :
                  isRejected ? "border-red-200 dark:border-red-900 opacity-60" :
                  "border-border/50"
                }`}>
                  {isBestPrice && !isRejected && (
                    <div className="absolute top-0 right-0">
                      <div className="bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
                        <TrendingDown className="h-3 w-3" /> BEST PRICE
                      </div>
                    </div>
                  )}
                  {isAccepted && (
                    <div className="absolute top-0 left-0">
                      <div className="bg-blue-500 text-white text-[10px] font-bold px-3 py-1 rounded-br-lg flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> ACCEPTED
                      </div>
                    </div>
                  )}

                  <CardHeader className="pb-3 pt-6">
                    <CardTitle className="text-lg flex flex-col gap-2">
                      <span className="truncate" title={q.vendorName || `Vendor ${q.vendorId}`}>
                        {q.vendorName || `Vendor ${q.vendorId}`}
                      </span>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className={`border-0 capitalize text-xs ${QUOTATION_STATUS_COLORS[q.status] ?? ""}`}>
                          {q.status.replace("_", " ")}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-yellow-500" title={`Vendor Rating: ${mockRating}`}>
                          <Star className="h-3.5 w-3.5 fill-current" />
                          <span className="font-medium text-foreground">{mockRating.toFixed(1)}</span>
                        </div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Price Section */}
                    <div className="text-center py-4 bg-muted/30 rounded-xl">
                      <p className="text-sm text-muted-foreground mb-1">Total Price</p>
                      <p className={`text-3xl font-bold ${isBestPrice && !isRejected ? "text-green-600 dark:text-green-400" : ""}`}>
                        ${q.totalPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </p>
                    </div>

                    {/* Comparison Details */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-2 border-b">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm">Delivery Time</span>
                        </div>
                        <span className="font-semibold">{q.deliveryDays ? `${q.deliveryDays} Days` : "—"}</span>
                      </div>
                      
                      <div className="flex items-center justify-between py-2 border-b">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Box className="h-4 w-4" />
                          <span className="text-sm">Items Quoted</span>
                        </div>
                        <span className="font-semibold">{q.items?.length || 0} / {rfq.items?.length || 0}</span>
                      </div>

                      <div className="py-2">
                        <span className="text-sm text-muted-foreground block mb-2">Vendor Notes</span>
                        <div className="bg-muted/30 p-3 rounded-lg text-sm text-foreground/80 min-h-[80px] italic">
                          {q.notes || "No notes provided by vendor."}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Link href={`/quotations/${q.id}`}>
                        <Button className="w-full" variant={isAccepted ? "secondary" : "default"}>
                          View Full Quote
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
