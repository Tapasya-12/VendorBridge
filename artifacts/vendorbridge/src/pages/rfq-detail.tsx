import React from "react";
import { useParams, Link } from "wouter";
import { useGetRfq, useListRfqQuotations, useSendRfq, getGetRfqQueryKey, getListRfqsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Send, Calendar, Package, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

function useToastSafe() {
  try { return useToast(); }
  catch { return { toast: ({ title, description }: { title?: string; description?: string }) => console.log(title, description) }; }
}

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  sent: "bg-blue-100 text-blue-800",
  closed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function RfqDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToastSafe();
  const queryClient = useQueryClient();
  const rfqId = parseInt(id ?? "0", 10);

  const { data: rfq, isLoading, isError } = useGetRfq(rfqId, { query: { enabled: !!rfqId, queryKey: getGetRfqQueryKey(rfqId) } });
  const { data: quotations, isLoading: quotationsLoading } = useListRfqQuotations(rfqId, { query: { enabled: !!rfqId } });
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

  const lowestPrice = quotations?.length ? Math.min(...quotations.map(q => q.totalPrice)) : null;

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/rfqs"><Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button></Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{rfq.title}</h1>
            <div className="flex items-center gap-2 mt-1">
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
            <CardTitle>Vendor Quotations ({quotations?.length ?? 0})</CardTitle>
            {rfq.status === "sent" && (
              <Link href="/quotations/new">
                <Button variant="outline" size="sm">Submit Quotation</Button>
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {quotationsLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : !quotations?.length ? (
            <p className="text-muted-foreground text-sm text-center py-8">No quotations received yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Vendor</TableHead>
                  <TableHead className="text-right">Total Price</TableHead>
                  <TableHead>Delivery</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotations.map((q) => (
                  <TableRow key={q.id} className={q.totalPrice === lowestPrice ? "bg-green-50 dark:bg-green-950/30" : ""}>
                    <TableCell className="font-medium">
                      {q.vendorName || `Vendor ${q.vendorId}`}
                      {q.totalPrice === lowestPrice && <span className="ml-2 text-xs text-green-600 font-semibold">Lowest</span>}
                    </TableCell>
                    <TableCell className={`text-right font-semibold ${q.totalPrice === lowestPrice ? "text-green-600" : ""}`}>
                      ${q.totalPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>{q.deliveryDays ? `${q.deliveryDays} days` : "—"}</TableCell>
                    <TableCell><Badge variant="outline" className="border-0 capitalize text-xs">{q.status}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[150px] truncate">{q.notes || "—"}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/quotations/${q.id}`}><Button variant="ghost" size="sm">View</Button></Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
