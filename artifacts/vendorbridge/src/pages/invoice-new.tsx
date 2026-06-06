import React, { useState } from "react";
import { useLocation, Link } from "wouter";
import { useCreateInvoice, useListPurchaseOrders, getListInvoicesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function useToastSafe() {
  try { return useToast(); }
  catch { return { toast: ({ title, description }: { title?: string; description?: string }) => console.log(title, description) }; }
}

export default function InvoiceNew() {
  const [, setLocation] = useLocation();
  const { toast } = useToastSafe();
  const queryClient = useQueryClient();
  const createInvoice = useCreateInvoice();
  const { data: pos } = useListPurchaseOrders({ status: "confirmed" });

  const [poId, setPoId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");

  const selectedPO = pos?.find(p => String(p.id) === poId);
  const subtotal = selectedPO ? selectedPO.totalAmount - selectedPO.taxAmount : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!poId || !selectedPO) { toast({ title: "Validation Error", description: "Please select a purchase order." }); return; }
    try {
      await createInvoice.mutateAsync({
        data: {
          purchaseOrderId: parseInt(poId, 10),
          vendorId: selectedPO.vendorId,
          subtotal,
          taxAmount: selectedPO.taxAmount,
          totalAmount: selectedPO.totalAmount,
          dueDate: dueDate || undefined,
          notes: notes || undefined,
        }
      });
      await queryClient.invalidateQueries({ queryKey: getListInvoicesQueryKey() });
      toast({ title: "Invoice created" });
      setLocation("/invoices");
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed to create invoice" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/invoices"><Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button></Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Generate Invoice</h1>
          <p className="text-muted-foreground mt-1">Create an invoice from a confirmed purchase order.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-border/50">
          <CardHeader><CardTitle>Source Purchase Order</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Select Purchase Order *</Label>
              <Select value={poId} onValueChange={setPoId}>
                <SelectTrigger data-testid="select-po"><SelectValue placeholder="Choose a confirmed PO..." /></SelectTrigger>
                <SelectContent>
                  {pos?.map(p => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.poNumber} — {p.vendorName} (${p.totalAmount.toLocaleString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!pos?.length && <p className="text-xs text-muted-foreground">No confirmed purchase orders available.</p>}
            </div>

            {selectedPO && (
              <div className="p-4 rounded-lg bg-muted/50 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Vendor</span><span className="font-medium">{selectedPO.vendorName}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">PO Number</span><span className="font-mono font-medium">{selectedPO.poNumber}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-medium">${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span className="font-medium">${selectedPO.taxAmount.toFixed(2)}</span></div>
                <div className="flex justify-between border-t pt-2"><span className="font-semibold">Total</span><span className="font-bold text-base">${selectedPO.totalAmount.toFixed(2)}</span></div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader><CardTitle>Invoice Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Due Date</Label>
              <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Payment terms, bank details..." rows={3} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Link href="/invoices"><Button variant="outline" type="button">Cancel</Button></Link>
          <Button type="submit" disabled={createInvoice.isPending} data-testid="btn-submit">
            {createInvoice.isPending ? "Creating..." : "Generate Invoice"}
          </Button>
        </div>
      </form>
    </div>
  );
}
