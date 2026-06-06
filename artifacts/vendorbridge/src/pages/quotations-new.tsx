import React, { useState } from "react";
import { useLocation, Link } from "wouter";
import { useCreateQuotation, useListRfqs, getListQuotationsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

function useToastSafe() {
  try { return useToast(); }
  catch { return { toast: ({ title, description }: { title?: string; description?: string }) => console.log(title, description) }; }
}

interface Item { productName: string; unitPrice: string; quantity: string; }

export default function QuotationsNew() {
  const [, setLocation] = useLocation();
  const { toast } = useToastSafe();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const createQuotation = useCreateQuotation();
  const { data: rfqs } = useListRfqs({ status: "sent" });

  const [rfqId, setRfqId] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<Item[]>([{ productName: "", unitPrice: "", quantity: "1" }]);

  const addItem = () => setItems(p => [...p, { productName: "", unitPrice: "", quantity: "1" }]);
  const removeItem = (idx: number) => setItems(p => p.filter((_, i) => i !== idx));
  const updateItem = (idx: number, field: keyof Item, value: string) => setItems(p => p.map((it, i) => i === idx ? { ...it, [field]: value } : it));

  const totalPrice = items.reduce((sum, it) => {
    const up = parseFloat(it.unitPrice) || 0;
    const qty = parseFloat(it.quantity) || 0;
    return sum + up * qty;
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rfqId) { toast({ title: "Validation Error", description: "Please select an RFQ." }); return; }
    if (!user?.vendorId && user?.role !== "vendor") {
      toast({ title: "Info", description: "Submitting as admin/officer for demo purposes." });
    }
    const validItems = items.filter(i => i.productName.trim() && i.unitPrice);
    try {
      await createQuotation.mutateAsync({
        data: {
          rfqId: parseInt(rfqId, 10),
          vendorId: user?.vendorId ?? 1,
          totalPrice,
          deliveryDays: deliveryDays ? parseInt(deliveryDays, 10) : undefined,
          notes: notes || undefined,
          items: validItems.map(i => ({
            productName: i.productName,
            unitPrice: parseFloat(i.unitPrice),
            quantity: parseFloat(i.quantity) || 1,
            totalPrice: (parseFloat(i.unitPrice) || 0) * (parseFloat(i.quantity) || 1),
          })),
        }
      });
      await queryClient.invalidateQueries({ queryKey: getListQuotationsQueryKey() });
      toast({ title: "Quotation submitted" });
      setLocation("/quotations");
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed to submit quotation" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/quotations"><Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button></Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Submit Quotation</h1>
          <p className="text-muted-foreground mt-1">Respond to an open request for quotation.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-border/50">
          <CardHeader><CardTitle>Quotation Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Select RFQ *</Label>
              <Select value={rfqId} onValueChange={setRfqId}>
                <SelectTrigger data-testid="select-rfq"><SelectValue placeholder="Choose an open RFQ..." /></SelectTrigger>
                <SelectContent>
                  {rfqs?.map(r => <SelectItem key={r.id} value={String(r.id)}>{r.title} (RFQ-{String(r.id).padStart(5,"0")})</SelectItem>)}
                </SelectContent>
              </Select>
              {!rfqs?.length && <p className="text-xs text-muted-foreground">No open RFQs available. An RFQ must be in "sent" status.</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Delivery Days</Label>
                <Input type="number" value={deliveryDays} onChange={e => setDeliveryDays(e.target.value)} placeholder="e.g. 14" min="1" />
              </div>
              <div className="space-y-1.5">
                <Label>Total Price</Label>
                <div className="py-2 px-3 rounded-md bg-muted text-sm font-semibold">
                  ${totalPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Terms, conditions, remarks..." rows={3} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Pricing Items</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addItem}><Plus className="mr-2 h-4 w-4" /> Add Item</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-3 items-start p-3 rounded-lg bg-muted/30">
                <div className="col-span-5 space-y-1.5">
                  <Label>Product</Label>
                  <Input value={item.productName} onChange={e => updateItem(idx, "productName", e.target.value)} placeholder="Product name" />
                </div>
                <div className="col-span-3 space-y-1.5">
                  <Label>Unit Price ($)</Label>
                  <Input type="number" value={item.unitPrice} onChange={e => updateItem(idx, "unitPrice", e.target.value)} placeholder="0.00" min="0" step="0.01" />
                </div>
                <div className="col-span-3 space-y-1.5">
                  <Label>Quantity</Label>
                  <Input type="number" value={item.quantity} onChange={e => updateItem(idx, "quantity", e.target.value)} min="1" />
                </div>
                <div className="col-span-1 pt-7">
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(idx)} disabled={items.length === 1}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Link href="/quotations"><Button variant="outline" type="button">Cancel</Button></Link>
          <Button type="submit" disabled={createQuotation.isPending} data-testid="btn-submit">
            {createQuotation.isPending ? "Submitting..." : "Submit Quotation"}
          </Button>
        </div>
      </form>
    </div>
  );
}
