import React from "react";
import { useParams, Link } from "wouter";
import { useGetRfq, useListRfqQuotations, useSendRfq, getGetRfqQueryKey, getListRfqsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Send, Calendar, Package, Star, TrendingDown, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { motion } from "framer-motion";

function useToastSafe() {
  try { return useToast(); }
  catch { return { toast: ({ title, description }: { title?: string; description?: string }) => console.log(title, description) }; }
}

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  published: "bg-indigo-100 text-indigo-800",
  sent: "bg-blue-100 text-blue-800",
  closed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const QUOTATION_STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  submitted: "bg-blue-100 text-blue-800",
  negotiating: "bg-yellow-100 text-yellow-800",
  accepted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export default function RfqDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToastSafe();
  const queryClient = useQueryClient();
  const rfqId = parseInt(id ?? "0", 10);

  const { data: rfq, isLoading, isError } = useGetRfq(rfqId, { query: { enabled: !!rfqId, queryKey: getGetRfqQueryKey(rfqId) } });
  const { data: quotations, isLoading: quotationsLoading } = useListRfqQuotations(rfqId);
  const sendRfq = useSendRfq();

  const handleSend = async () => {
    try {
      await sendRfq.mutateAsync({ id: rfqId });
      await queryClient.invalidateQueries({ queryKey: getGetRfqQueryKey(rfqId) });
      await queryClient.invalidateQueries({ queryKey: getListRfqsQueryKey() });
      toast({ title: "RFQ sent", description: "Vendors have been notified." });
    } catch {
      toast({ title: "Error", description: "Failed to send RFQ." });
    }
  };

  const sortedQuotations = quotations?.length
    ? [...quotations].sort((a, b) => a.totalPrice - b.totalPrice)
    : [];
  const lowestPrice = sortedQuotations.length ? sortedQuotations[0].totalPrice : null;

  if (isLoading) return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      {Array.from({length:3}).map((_,i) => <Card key={i} className="border-border/50"><CardContent className="pt-6 space-y-3">{Array.from({length:3}).map((_,j) => <Skeleton key={j} className="h-10 w-full" />)}</CardContent></Card>)}
    </div>
  );

  if (isError || !rfq) return (
    <div className="space-y-4">
      <Link href="/rfqs"><Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button></Link>
      <p className="text-destructive">RFQ not found.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/rfqs"><Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button></Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{rfq.title}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge variant="outline" className={`border-0 capitalize ${STATUS_COLORS[rfq.status] ?? ""}`}>{rfq.status}</Badge>
              <span className="font-mono text-xs text-muted-foreground">RFQ-{String(rfq.id).padStart(5, "0")}</span>
              {rfq.deadline && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" /> Deadline: {format(new Date(rfq.deadline), "MMM d, yyyy")}
                </span>
              )}
            </div>
          </div>
        </div>
        {rfq.status === "draft" && (
          <Button onClick={handleSend} disabled={sendRfq.isPending} data-testid="btn-send-rfq">
            <Send className="mr-2 h-4 w-4" /> {sendRfq.isPending ? "Sending..." : "Send to Vendors"}
          </Button>
        )}
      </div>

      {rfq.description && (
        <Card className="border-border/50">
          <CardHeader><CardTitle>Description</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-muted-foreground">{rfq.description}</p></CardContent>
        </Card>
      )}

      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Line Items ({rfq.items?.length ?? 0})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {rfq.items?.length ? (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Product</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead>Unit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rfq.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.productName}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{item.description || "—"}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell>{item.unit || "pcs"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-sm">No line items.</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Quotation Comparison ({quotations?.length ?? 0})</CardTitle>
            </div>
            {rfq.status === "sent" && (
              <Link href="/quotations/new">
                <Button variant="outline" size="sm">Submit Quotation</Button>
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {quotationsLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : !sortedQuotations.length ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground text-sm">No quotations received yet.</p>
              <p className="text-xs text-muted-foreground mt-1">Quotations will appear here once vendors respond.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground">Lowest Price</p>
                  <p className="text-lg font-bold text-green-600">${lowestPrice?.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground">Highest Price</p>
                  <p className="text-lg font-bold text-red-600">${sortedQuotations[sortedQuotations.length - 1].totalPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground">Avg Delivery</p>
                  <p className="text-lg font-bold">{Math.round(sortedQuotations.reduce((s, q) => s + (q.deliveryDays || 0), 0) / sortedQuotations.length)} days</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground">Total Quotes</p>
                  <p className="text-lg font-bold">{sortedQuotations.length}</p>
                </div>
              </div>

              {/* Side-by-side comparison cards */}
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {sortedQuotations.map((q, idx) => {
                  const isBest = q.totalPrice === lowestPrice;
                  const isAccepted = q.status === "accepted";
                  const isRejected = q.status === "rejected";
                  return (
                    <motion.div
                      key={q.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card className={`relative overflow-hidden transition-shadow hover:shadow-md border-2 ${
                        isBest && !isRejected ? "border-green-200 dark:border-green-900" :
                        isAccepted ? "border-blue-200 dark:border-blue-900" :
                        isRejected ? "border-red-200 dark:border-red-900 opacity-70" :
                        "border-border/50"
                      }`}>
                        {isBest && !isRejected && (
                          <div className="absolute top-0 right-0">
                            <div className="bg-green-500 text-white text-[10px] font-bold px-3 py-0.5 rounded-bl-lg flex items-center gap-1">
                              <Star className="h-3 w-3 fill-white" /> BEST VALUE
                            </div>
                          </div>
                        )}
                        {isAccepted && (
                          <div className="absolute top-0 left-0">
                            <div className="bg-blue-500 text-white text-[10px] font-bold px-3 py-0.5 rounded-br-lg flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> ACCEPTED
                            </div>
                          </div>
                        )}
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="font-semibold">{q.vendorName || `Vendor ${q.vendorId}`}</p>
                              <Badge variant="outline" className={`border-0 capitalize text-xs mt-1 ${QUOTATION_STATUS_COLORS[q.status] ?? ""}`}>
                                {q.status.replace("_", " ")}
                              </Badge>
                            </div>
                            <div className="text-right">
                              <p className={`text-xl font-bold ${isBest && !isRejected ? "text-green-600" : ""}`}>
                                ${q.totalPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                              </p>
                              {isBest && !isRejected && (
                                <p className="text-[10px] text-green-600 font-medium">Lowest Price</p>
                              )}
                            </div>
                          </div>
                          <div className="space-y-1.5 text-sm">
                            <div className="flex justify-between text-muted-foreground">
                              <span>Delivery</span>
                              <span className="font-medium text-foreground">{q.deliveryDays ? `${q.deliveryDays} days` : "—"}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                              <span>Items</span>
                              <span className="font-medium text-foreground">{q.items?.length ?? 0}</span>
                            </div>
                            {q.notes && (
                              <div className="pt-1 border-t border-border/50">
                                <p className="text-xs text-muted-foreground line-clamp-2">{q.notes}</p>
                              </div>
                            )}
                          </div>
                          <div className="mt-3">
                            <Link href={`/quotations/${q.id}`}>
                              <Button variant="outline" size="sm" className="w-full">View Details</Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
