import React, { useState, useMemo } from "react";
import { useParams, Link, useLocation } from "wouter";
import {
  useGetRfq, useListRfqQuotations, useListApprovals,
  useApproveApproval, useRejectApproval, useCreatePurchaseOrder,
  getListRfqQuotationsQueryKey, getListApprovalsQueryKey, getListPurchaseOrdersQueryKey,
  getGetRfqQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, Star, TrendingDown, CheckCircle2, Clock, Box, XCircle,
  Award, ArrowUp, ArrowDown, DollarSign, Truck, ThumbsUp, ThumbsDown,
  FileText, ShoppingCart,
} from "lucide-react";

const QUOTATION_STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  submitted: "bg-blue-100 text-blue-800",
  under_review: "bg-indigo-100 text-indigo-800",
  negotiating: "bg-yellow-100 text-yellow-800",
  accepted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

function StarRating({ rating }: { rating: number | null | undefined }) {
  const r = rating ?? 0;
  const full = Math.floor(r);
  const half = r - full >= 0.5;
  const stars = [];
  for (let i = 0; i < 5; i++) {
    if (i < full) stars.push("full");
    else if (i === full && half) stars.push("half");
    else stars.push("empty");
  }
  return (
    <div className="flex items-center gap-0.5" title={`Rating: ${r.toFixed(1)} / 5`}>
      {stars.map((s, i) => (
        <Star key={i} className={`h-3 w-3 ${s === "full" ? "fill-yellow-400 text-yellow-400" : s === "half" ? "fill-yellow-400/50 text-yellow-400" : "text-gray-300"}`} />
      ))}
      <span className="text-xs text-muted-foreground ml-1">{r.toFixed(1)}</span>
    </div>
  );
}

export default function QuotationCompare() {
  const { id } = useParams<{ id: string }>();
  const rfqId = parseInt(id ?? "0", 10);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: rfq, isLoading: rfqLoading, isError } = useGetRfq(rfqId, { query: { enabled: !!rfqId, queryKey: getGetRfqQueryKey(rfqId) } });
  const { data: quotations, isLoading: quotationsLoading } = useListRfqQuotations(rfqId);
  const { data: approvals } = useListApprovals();

  const approveMutation = useApproveApproval();
  const rejectMutation = useRejectApproval();
  const createPOMutation = useCreatePurchaseOrder();

  const [sortBy, setSortBy] = useState<string>("price_asc");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [approveDialog, setApproveDialog] = useState<{ quotationId: number; approvalId: number } | null>(null);
  const [rejectDialog, setRejectDialog] = useState<{ quotationId: number; approvalId: number } | null>(null);
  const [poDialog, setPoDialog] = useState<{ quotation: any } | null>(null);
  const [remarks, setRemarks] = useState("");

  const approvalByQuotationId = useMemo(() => {
    if (!approvals) return {};
    const map: Record<number, any> = {};
    for (const a of approvals) {
      if (a.quotationId) map[a.quotationId] = a;
    }
    return map;
  }, [approvals]);

  if (rfqLoading || quotationsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({length:4}).map((_,i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  if (isError || !rfq) {
    return (
      <div className="space-y-4">
        <Link href="/rfqs">
          <Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4" /> Back to RFQs</Button>
        </Link>
        <p className="text-destructive">RFQ not found.</p>
      </div>
    );
  }

  const allQuotations = quotations || [];

  let filteredQuotations = allQuotations;
  if (filterStatus !== "all") {
    filteredQuotations = filteredQuotations.filter((q) => q.status === filterStatus);
  }

  const sortedQuotations = [...filteredQuotations].sort((a, b) => {
    switch (sortBy) {
      case "price_asc": return a.totalPrice - b.totalPrice;
      case "price_desc": return b.totalPrice - a.totalPrice;
      case "delivery_asc": return (a.deliveryDays || 0) - (b.deliveryDays || 0);
      case "delivery_desc": return (b.deliveryDays || 0) - (a.deliveryDays || 0);
      case "vendor": return (a.vendorName || "").localeCompare(b.vendorName || "");
      case "items": return (b.items?.length || 0) - (a.items?.length || 0);
      case "rating": {
        const ra = (a as any).vendorRating ?? 0;
        const rb = (b as any).vendorRating ?? 0;
        return rb - ra;
      }
      default: return 0;
    }
  });

  const lowestPrice = allQuotations.length ? Math.min(...allQuotations.map(q => q.totalPrice)) : null;
  const highestPrice = allQuotations.length ? Math.max(...allQuotations.map(q => q.totalPrice)) : null;
  const fastestDelivery = allQuotations.length ? Math.min(...allQuotations.map(q => q.deliveryDays ?? Infinity)) : null;
  const avgDelivery = allQuotations.length
    ? Math.round(allQuotations.reduce((s, q) => s + (q.deliveryDays || 0), 0) / allQuotations.filter(q => q.deliveryDays).length)
    : null;
  const avgRating = allQuotations.length
    ? (allQuotations.reduce((s, q) => s + ((q as any).vendorRating ?? 0), 0) / allQuotations.length).toFixed(1)
    : null;

  const rfqItems = rfq.items || [];

  const handleApprove = async () => {
    if (!approveDialog) return;
    try {
      await approveMutation.mutateAsync({ id: approveDialog.approvalId, data: { remarks: remarks || undefined } });
      await queryClient.invalidateQueries({ queryKey: getListRfqQuotationsQueryKey(rfqId) });
      await queryClient.invalidateQueries({ queryKey: getListApprovalsQueryKey() });
      toast({ title: "Approved", description: "Quotation has been approved." });
      setApproveDialog(null);
      setRemarks("");
    } catch {
      toast({ title: "Error", description: "Failed to approve quotation." });
    }
  };

  const handleReject = async () => {
    if (!rejectDialog) return;
    try {
      await rejectMutation.mutateAsync({ id: rejectDialog.approvalId, data: { remarks: remarks || undefined } });
      await queryClient.invalidateQueries({ queryKey: getListRfqQuotationsQueryKey(rfqId) });
      await queryClient.invalidateQueries({ queryKey: getListApprovalsQueryKey() });
      toast({ title: "Rejected", description: "Quotation has been rejected." });
      setRejectDialog(null);
      setRemarks("");
    } catch {
      toast({ title: "Error", description: "Failed to reject quotation." });
    }
  };

  const handleCreatePO = async () => {
    if (!poDialog) return;
    const q = poDialog.quotation;
    try {
      const po = await createPOMutation.mutateAsync({
        data: {
          rfqId: q.rfqId,
          quotationId: q.id,
          vendorId: q.vendorId,
          totalAmount: q.totalPrice,
          taxAmount: q.totalPrice * 0.1,
        },
      });
      await queryClient.invalidateQueries({ queryKey: getListPurchaseOrdersQueryKey() });
      toast({ title: "PO Created", description: `Purchase Order ${po.poNumber} created.` });
      setPoDialog(null);
      setLocation(`/purchase-orders/${po.id}`);
    } catch {
      toast({ title: "Error", description: "Failed to create purchase order." });
    }
  };

  const getApprovalForQuotation = (quotationId: number) => approvalByQuotationId[quotationId] || null;

  const getRankIcon = (idx: number) => {
    if (idx === 0) return <Award className="h-4 w-4 text-yellow-500" />;
    if (idx === 1) return <Award className="h-4 w-4 text-gray-400" />;
    if (idx === 2) return <Award className="h-4 w-4 text-amber-700" />;
    return null;
  };

  const getDeliveryRank = (days: number | null | undefined) => {
    if (!days || !allQuotations.length) return null;
    const sorted = [...allQuotations].filter(q => q.deliveryDays).sort((a, b) => (a.deliveryDays || 0) - (b.deliveryDays || 0));
    const rank = sorted.findIndex(q => q.deliveryDays === days);
    if (rank === 0) return <Badge className="bg-green-100 text-green-800 border-0 text-xs">Fastest</Badge>;
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href={`/rfqs/${rfqId}`}>
            <Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Compare Quotations</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Comparing {sortedQuotations.length} quote{sortedQuotations.length !== 1 ? "s" : ""} for <span className="font-medium text-foreground">{rfq.title}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Summary Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="border-green-200 dark:border-green-900 bg-green-50/30 dark:bg-green-950/20">
          <CardContent className="p-3 flex flex-col items-center justify-center text-center">
            <TrendingDown className="h-4 w-4 text-green-600 mb-1" />
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Lowest Price</p>
            <p className="text-lg font-bold text-green-600">${lowestPrice?.toLocaleString("en-US", { minimumFractionDigits: 2 }) || "—"}</p>
          </CardContent>
        </Card>
        <Card className="border-red-200 dark:border-red-900 bg-red-50/30 dark:bg-red-950/20">
          <CardContent className="p-3 flex flex-col items-center justify-center text-center">
            <ArrowUp className="h-4 w-4 text-red-600 mb-1" />
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Highest Price</p>
            <p className="text-lg font-bold text-red-600">${highestPrice?.toLocaleString("en-US", { minimumFractionDigits: 2 }) || "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex flex-col items-center justify-center text-center">
            <Clock className="h-4 w-4 text-blue-600 mb-1" />
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Avg Delivery</p>
            <p className="text-lg font-bold">{avgDelivery ? `${avgDelivery} days` : "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex flex-col items-center justify-center text-center">
            <Box className="h-4 w-4 text-indigo-600 mb-1" />
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total Quotes</p>
            <p className="text-lg font-bold">{allQuotations.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex flex-col items-center justify-center text-center">
            <Star className="h-4 w-4 text-yellow-500 mb-1" />
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Avg Rating</p>
            <p className="text-lg font-bold">{avgRating || "—"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card className="border-border/50 bg-muted/20">
        <CardContent className="p-4 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Sort By:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[200px] bg-white dark:bg-slate-900">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price_asc">Lowest Price First</SelectItem>
                <SelectItem value="price_desc">Highest Price First</SelectItem>
                <SelectItem value="delivery_asc">Fastest Delivery First</SelectItem>
                <SelectItem value="delivery_desc">Slowest Delivery First</SelectItem>
                <SelectItem value="vendor">Vendor Name A-Z</SelectItem>
                <SelectItem value="items">Most Items First</SelectItem>
                <SelectItem value="rating">Highest Rating First</SelectItem>
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
                <SelectItem value="under_review">Under Review</SelectItem>
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
        <>
          {/* Line Item Comparison Table */}
          {rfqItems.length > 0 && (
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  Line Item Comparison
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[200px] min-w-[160px]">Product</TableHead>
                      <TableHead className="text-center w-[80px]">Qty</TableHead>
                      {sortedQuotations.map((q) => (
                        <TableHead key={q.id} className="text-right min-w-[120px]">
                          <div className="text-xs font-semibold truncate" title={q.vendorName || `Vendor ${q.vendorId}`}>
                            {q.vendorName || `V${q.vendorId}`}
                          </div>
                          <div className="text-[10px] font-normal text-muted-foreground">
                            ${q.totalPrice.toLocaleString("en-US", { minimumFractionDigits: 0 })}
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rfqItems.map((rfqItem) => {
                      const prices = sortedQuotations.map((q) => {
                        const matched = (q.items || []).find(
                          (i) => i.productName.toLowerCase() === rfqItem.productName.toLowerCase()
                        );
                        return matched ? matched.unitPrice : null;
                      });
                      const bestPrice = prices.filter((p): p is number => p !== null).length > 0
                        ? Math.min(...prices.filter((p): p is number => p !== null))
                        : null;
                      return (
                        <TableRow key={rfqItem.id}>
                          <TableCell className="font-medium">{rfqItem.productName}</TableCell>
                          <TableCell className="text-center">{rfqItem.quantity}</TableCell>
                          {prices.map((price, pi) => (
                            <TableCell key={pi} className={`text-right font-mono text-sm ${
                              price !== null && price === bestPrice
                                ? "text-green-600 font-semibold bg-green-50 dark:bg-green-950/20"
                                : ""
                            }`}>
                              {price !== null ? `$${price.toFixed(2)}` : "—"}
                              {price !== null && price === bestPrice && (
                                <TrendingDown className="inline-block h-3 w-3 text-green-500 ml-1" />
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      );
                    })}
                    {/* Total row */}
                    <TableRow className="border-t-2 font-semibold bg-muted/30">
                      <TableCell>Total</TableCell>
                      <TableCell></TableCell>
                      {sortedQuotations.map((q) => (
                        <TableCell key={q.id} className="text-right">
                          ${q.totalPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Vendor Comparison Cards */}
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
            {sortedQuotations.map((q, idx) => {
              const isBestPrice = q.totalPrice === lowestPrice;
              const isAccepted = q.status === "accepted";
              const isRejected = q.status === "rejected";
              const hasPO = poDialog?.quotation?.id === q.id;
              const approval = getApprovalForQuotation(q.id);
              const canApprove = approval && (approval.status === "pending" || approval.status === "under_review");
              const vendorRating = (q as any).vendorRating ?? null;

              return (
                <div
                  key={q.id}
                  className="snap-center shrink-0 w-[350px]"
                >
                  <Card className={`h-full relative overflow-hidden transition-all hover:shadow-lg border-2 ${
                    isBestPrice && !isRejected ? "border-green-400 dark:border-green-600 shadow-green-100 dark:shadow-none" :
                    isAccepted ? "border-blue-400 dark:border-blue-600" :
                    isRejected ? "border-red-200 dark:border-red-900 opacity-60" :
                    "border-border/50"
                  }`}>
                    {/* Rank Badge */}
                    {idx < 3 && (
                      <div className="absolute top-2 left-2 z-10">
                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          idx === 0 ? "bg-yellow-100 text-yellow-800" :
                          idx === 1 ? "bg-gray-100 text-gray-600" :
                          "bg-amber-100 text-amber-700"
                        }`}>
                          {getRankIcon(idx)}
                          <span>#{idx + 1}</span>
                        </div>
                      </div>
                    )}

                    {/* BEST PRICE Badge */}
                    {isBestPrice && !isRejected && idx !== 0 && (
                      <div className="absolute top-0 right-0">
                        <div className="bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
                          <TrendingDown className="h-3 w-3" /> BEST PRICE
                        </div>
                      </div>
                    )}
                    {isBestPrice && !isRejected && idx === 0 && (
                      <div className="absolute top-0 right-0">
                        <div className="bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
                          <TrendingDown className="h-3 w-3" /> BEST PRICE
                        </div>
                      </div>
                    )}

                    {/* ACCEPTED Badge */}
                    {isAccepted && (
                      <div className="absolute top-0 left-0">
                        <div className="bg-blue-500 text-white text-[10px] font-bold px-3 py-1 rounded-br-lg flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> ACCEPTED
                        </div>
                      </div>
                    )}

                    <CardHeader className="pb-3 pt-8">
                      <CardTitle className="text-lg flex flex-col gap-2">
                        <span className="truncate pr-16" title={q.vendorName || `Vendor ${q.vendorId}`}>
                          {q.vendorName || `Vendor ${q.vendorId}`}
                        </span>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className={`border-0 capitalize text-xs ${QUOTATION_STATUS_COLORS[q.status] ?? ""}`}>
                            {q.status.replace("_", " ")}
                          </Badge>
                          <StarRating rating={vendorRating} />
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Price Section */}
                      <div className="text-center py-4 bg-muted/30 rounded-xl">
                        <p className="text-sm text-muted-foreground mb-1">Total Price</p>
                        <p className={`text-3xl font-bold ${isBestPrice && !isRejected ? "text-green-600 dark:text-green-400" : ""}`}>
                          ${q.totalPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </p>
                        {isBestPrice && !isRejected && (
                          <p className="text-[10px] text-green-600 font-medium mt-1">Best Value</p>
                        )}
                      </div>

                      {/* Comparison Details */}
                      <div className="space-y-3">
                        <div className={`flex items-center justify-between py-2 px-3 rounded-lg ${
                          getDeliveryRank(q.deliveryDays) ? "bg-green-50 dark:bg-green-950/20" : ""
                        }`}>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Truck className="h-4 w-4" />
                            <span className="text-sm">Delivery Time</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{q.deliveryDays ? `${q.deliveryDays} Days` : "—"}</span>
                            {getDeliveryRank(q.deliveryDays)}
                          </div>
                        </div>

                        <div className="flex items-center justify-between py-2 px-3 rounded-lg">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Box className="h-4 w-4" />
                            <span className="text-sm">Items Quoted</span>
                          </div>
                          <span className="font-semibold">{q.items?.length || 0} / {rfqItems.length}</span>
                        </div>

                        <div className="py-2">
                          <span className="text-sm text-muted-foreground block mb-2">Vendor Notes</span>
                          <div className="bg-muted/30 p-3 rounded-lg text-sm text-foreground/80 min-h-[60px] italic">
                            {q.notes || "No notes provided."}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="space-y-2 pt-2">
                        <div className="flex gap-2">
                          {canApprove && (
                            <>
                              <Button
                                size="sm"
                                className="flex-1"
                                onClick={() => setApproveDialog({ quotationId: q.id, approvalId: approval.id })}
                              >
                                <ThumbsUp className="h-4 w-4 mr-1" /> Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 text-destructive border-destructive/30 hover:bg-destructive/10"
                                onClick={() => setRejectDialog({ quotationId: q.id, approvalId: approval.id })}
                              >
                                <ThumbsDown className="h-4 w-4 mr-1" /> Reject
                              </Button>
                            </>
                          )}
                          {isAccepted && (
                            <Button
                              size="sm"
                              className="flex-1"
                              onClick={() => setPoDialog({ quotation: q })}
                            >
                              <ShoppingCart className="h-4 w-4 mr-1" /> Create PO
                            </Button>
                          )}
                        </div>
                        <Link href={`/quotations/${q.id}`}>
                          <Button className="w-full" variant="outline" size="sm">
                            <FileText className="h-4 w-4 mr-1" /> View Full Quote
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Approve Dialog */}
      <Dialog open={!!approveDialog} onOpenChange={(open) => { if (!open) { setApproveDialog(null); setRemarks(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Quotation</DialogTitle>
            <DialogDescription>
              Add optional remarks for approving this quotation.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Remarks (optional)..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setApproveDialog(null); setRemarks(""); }}>Cancel</Button>
            <Button onClick={handleApprove} disabled={approveMutation.isPending}>
              {approveMutation.isPending ? "Approving..." : "Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={!!rejectDialog} onOpenChange={(open) => { if (!open) { setRejectDialog(null); setRemarks(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Quotation</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this quotation.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for rejection..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRejectDialog(null); setRemarks(""); }}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={rejectMutation.isPending}>
              {rejectMutation.isPending ? "Rejecting..." : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create PO Dialog */}
      <Dialog open={!!poDialog} onOpenChange={(open) => { if (!open) setPoDialog(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Purchase Order</DialogTitle>
            <DialogDescription>
              Generate a purchase order from <strong>{poDialog?.quotation?.vendorName || "this vendor"}</strong>'s accepted quotation.
            </DialogDescription>
          </DialogHeader>
          {poDialog && (
            <div className="space-y-3 py-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Vendor</span>
                <span className="font-medium">{poDialog.quotation.vendorName || `Vendor ${poDialog.quotation.vendorId}`}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Amount</span>
                <span className="font-medium">${poDialog.quotation.totalPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (10%)</span>
                <span className="font-medium">${(poDialog.quotation.totalPrice * 0.1).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold border-t pt-2">
                <span>Grand Total</span>
                <span>${(poDialog.quotation.totalPrice * 1.1).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPoDialog(null)}>Cancel</Button>
            <Button onClick={handleCreatePO} disabled={createPOMutation.isPending}>
              {createPOMutation.isPending ? "Creating..." : "Create PO"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
