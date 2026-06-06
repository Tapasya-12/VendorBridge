import React from "react";
import { useParams, useLocation, Link } from "wouter";
import { useGetPurchaseOrder, useUpdatePurchaseOrder, getGetPurchaseOrderQueryKey, getListPurchaseOrdersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function useToastSafe() {
  try { return useToast(); }
  catch { return { toast: ({ title, description }: { title?: string; description?: string }) => console.log(title, description) }; }
}

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  confirmed: "bg-blue-100 text-blue-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function PurchaseOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToastSafe();
  const queryClient = useQueryClient();
  const poId = parseInt(id ?? "0", 10);

  const { data: po, isLoading, isError } = useGetPurchaseOrder(poId, { query: { enabled: !!poId, queryKey: getGetPurchaseOrderQueryKey(poId) } });
  const updatePO = useUpdatePurchaseOrder();

  const updateStatus = async (status: string) => {
    try {
      await updatePO.mutateAsync({ id: poId, data: { status } });
      await queryClient.invalidateQueries({ queryKey: getGetPurchaseOrderQueryKey(poId) });
      await queryClient.invalidateQueries({ queryKey: getListPurchaseOrdersQueryKey() });
      toast({ title: "Status updated", description: `PO is now ${status}.` });
    } catch {
      toast({ title: "Error", description: "Failed to update status." });
    }
  };

  if (isLoading) return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <Card className="border-border/50"><CardContent className="pt-6 space-y-3">{Array.from({length:6}).map((_,i) => <Skeleton key={i} className="h-10 w-full" />)}</CardContent></Card>
    </div>
  );

  if (isError || !po) return (
    <div className="space-y-4">
      <Link href="/purchase-orders"><Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button></Link>
      <p className="text-destructive">Purchase order not found.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/purchase-orders"><Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button></Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-mono">{po.poNumber}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={`border-0 capitalize ${STATUS_COLORS[po.status] ?? ""}`}>{po.status}</Badge>
              <span className="text-muted-foreground text-sm">{po.rfqTitle || `RFQ-${po.rfqId}`}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <Select value={po.status} onValueChange={updateStatus} disabled={updatePO.isPending}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Link href="/invoices/new">
            <Button variant="outline"><FileText className="mr-2 h-4 w-4" /> Generate Invoice</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
          <CardContent>
            <dl className="space-y-4">
              {[
                { label: "Vendor", value: po.vendorName || `Vendor ${po.vendorId}` },
                { label: "RFQ", value: po.rfqTitle || `RFQ-${po.rfqId}` },
                { label: "Delivery Date", value: po.deliveryDate ?? "—" },
                { label: "Created", value: new Date(po.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <dt className="text-sm text-muted-foreground">{label}</dt>
                  <dd className="text-sm font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader><CardTitle>Financials</CardTitle></CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div className="flex justify-between">
                <dt className="text-sm text-muted-foreground">Subtotal</dt>
                <dd className="text-sm font-medium">${(po.totalAmount - po.taxAmount).toLocaleString("en-US", { minimumFractionDigits: 2 })}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-muted-foreground">Tax</dt>
                <dd className="text-sm font-medium">${po.taxAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</dd>
              </div>
              <div className="flex justify-between border-t pt-3">
                <dt className="font-semibold">Total Amount</dt>
                <dd className="font-bold text-lg">${po.totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {po.notes && (
          <Card className="border-border/50 lg:col-span-2">
            <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">{po.notes}</p></CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
