import React, { useState } from "react";
import { useLocation, Link } from "wouter";
import { useCreatePurchaseOrder, useListQuotations, getListPurchaseOrdersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { SuccessAnimation } from "@/components/ui/success-animation";

function useToastSafe() {
  try { return useToast(); }
  catch { return { toast: ({ title, description }: { title?: string; description?: string }) => console.log(title, description) }; }
}

export default function PurchaseOrderNew() {
  const [, setLocation] = useLocation();
  const { toast } = useToastSafe();
  const queryClient = useQueryClient();
  const createPO = useCreatePurchaseOrder();
  const { data: quotations } = useListQuotations({ status: "accepted" });

  const [quotationId, setQuotationId] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [taxPercent, setTaxPercent] = useState("18");
  const [showSuccess, setShowSuccess] = useState(false);

  const selectedQuotation = quotations?.find(q => String(q.id) === quotationId);
  const taxAmount = selectedQuotation ? (selectedQuotation.totalPrice * (parseFloat(taxPercent) || 0)) / 100 : 0;
  const totalAmount = selectedQuotation ? selectedQuotation.totalPrice + taxAmount : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quotationId || !selectedQuotation) { toast({ title: "Validation Error", description: "Please select an approved quotation." }); return; }
    try {
      await createPO.mutateAsync({
        data: {
          rfqId: selectedQuotation.rfqId,
          quotationId: parseInt(quotationId, 10),
          vendorId: selectedQuotation.vendorId,
          totalAmount,
          taxAmount,
          deliveryDate: deliveryDate || undefined,
          notes: notes || undefined,
        }
      });
      await queryClient.invalidateQueries({ queryKey: getListPurchaseOrdersQueryKey() });
      setShowSuccess(true);
      toast({ title: "Purchase order created" });
      setTimeout(() => {
        setLocation("/purchase-orders");
      }, 1500);
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed to create PO" });
    }
  };

  return (
    <div className="space-y-6">
      {showSuccess ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <SuccessAnimation size="xl" text="Purchase Order Created Successfully!" variant="bounce" />
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4">
            <Link href="/purchase-orders"><Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button></Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Create Purchase Order</h1>
              <p className="text-muted-foreground mt-1">Issue a purchase order from an approved quotation.</p>
            </div>
          </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-border/50">
          <CardHeader><CardTitle>Source Quotation</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Select Approved Quotation *</Label>
              <Select value={quotationId} onValueChange={setQuotationId}>
                <SelectTrigger data-testid="select-quotation"><SelectValue placeholder="Choose an approved quotation..." /></SelectTrigger>
                <SelectContent>
                  {quotations?.map(q => (
                    <SelectItem key={q.id} value={String(q.id)}>
                      {q.vendorName} — {q.rfqTitle} (${ q.totalPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!quotations?.length && <p className="text-xs text-muted-foreground">No accepted quotations available. Approve a quotation first.</p>}
            </div>

            {selectedQuotation && (
              <div className="p-4 rounded-lg bg-muted/50 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Vendor</span><span className="font-medium">{selectedQuotation.vendorName}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Base Amount</span><span className="font-medium">${selectedQuotation.totalPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Tax ({taxPercent}%)</span><span className="font-medium">${taxAmount.toFixed(2)}</span></div>
                <div className="flex justify-between border-t pt-2"><span className="font-semibold">Total</span><span className="font-bold text-base">${totalAmount.toFixed(2)}</span></div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader><CardTitle>Order Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Tax Rate (%)</Label>
                <Input type="number" value={taxPercent} onChange={e => setTaxPercent(e.target.value)} min="0" max="100" placeholder="18" />
              </div>
              <div className="space-y-1.5">
                <Label>Expected Delivery Date</Label>
                <Input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Special instructions, terms..." rows={3} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Link href="/purchase-orders"><Button variant="outline" type="button">Cancel</Button></Link>
          <Button type="submit" disabled={createPO.isPending} data-testid="btn-submit">
            {createPO.isPending ? (
              <span className="flex items-center gap-2">
                <LoadingSpinner size="sm" />
                Creating...
              </span>
            ) : (
              "Create Purchase Order"
            )}
          </Button>
        </div>
      </form>
        </>
      )}
    </div>
  );
}
