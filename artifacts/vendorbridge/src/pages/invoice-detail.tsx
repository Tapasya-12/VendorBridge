import React, { useState, useRef } from "react";
import html2pdf from "html2pdf.js";
import { useParams, Link } from "wouter";
import { useGetInvoice, useSendInvoiceEmail, getGetInvoiceQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { ArrowLeft, Printer, Mail, CheckCircle, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function useToastSafe() {
  try { return useToast(); }
  catch { return { toast: ({ title, description }: { title?: string; description?: string }) => console.log(title, description) }; }
}

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  sent: "bg-blue-100 text-blue-800",
  viewed: "bg-purple-100 text-purple-800",
  issued: "bg-indigo-100 text-indigo-800",
  paid: "bg-green-100 text-green-800",
  partially_paid: "bg-amber-100 text-amber-800",
  overdue: "bg-red-100 text-red-800",
  disputed: "bg-orange-100 text-orange-800",
  cancelled: "bg-gray-100 text-gray-500",
};

export default function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToastSafe();
  const invId = parseInt(id ?? "0", 10);
  const [emailInput, setEmailInput] = useState("");
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: inv, isLoading, isError } = useGetInvoice(invId, { query: { enabled: !!invId, queryKey: getGetInvoiceQueryKey(invId) } });
  const sendEmail = useSendInvoiceEmail();

  // Prefill email when invoice data is loaded
  React.useEffect(() => {
    if (inv?.vendorEmail && !emailInput) {
      setEmailInput(inv.vendorEmail);
    }
  }, [inv?.vendorEmail]);

  const handleDownloadPdf = async () => {
    if (!invoiceRef.current) {
      toast({ title: "Error", description: "Invoice content not ready for download." });
      return;
    }
    
    try {
      const opt = {
        margin:       10,
        filename:     `Invoice-${inv?.invoiceNumber || invId}.pdf`,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false },
        jsPDF:        { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
      };
      
      await html2pdf().set(opt).from(invoiceRef.current).save();
      toast({ title: "Success", description: "Invoice PDF downloaded successfully." });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast({ title: "Error", description: "Failed to generate PDF. Please try again." });
    }
  };

  const handleSendEmail = async () => {
    if (!emailInput) return;
    try {
      await sendEmail.mutateAsync({ id: invId, data: { recipientEmail: emailInput } });
      await queryClient.invalidateQueries({ queryKey: getGetInvoiceQueryKey(invId) });
      toast({ title: "Invoice sent", description: `Sent to ${emailInput}` });
      setEmailDialogOpen(false);
    } catch {
      toast({ title: "Error", description: "Failed to send invoice." });
    }
  };

  if (isLoading) return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <Card className="border-border/50"><CardContent className="pt-6 space-y-3">{Array.from({length:6}).map((_,i) => <Skeleton key={i} className="h-10 w-full" />)}</CardContent></Card>
    </div>
  );

  if (isError || !inv) return (
    <div className="space-y-4">
      <Link href="/invoices"><Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button></Link>
      <p className="text-destructive">Invoice not found.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Link href="/invoices"><Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button></Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-mono">{inv.invoiceNumber}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={`border-0 capitalize ${STATUS_COLORS[inv.status] ?? ""}`}>{inv.status}</Badge>
              <span className="text-muted-foreground text-sm">{inv.poNumber && `PO: ${inv.poNumber}`}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="btn-send-email"><Mail className="mr-2 h-4 w-4" /> Send Email</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Send Invoice by Email</DialogTitle></DialogHeader>
              <div className="space-y-3 py-4">
                <Label>Recipient Email</Label>
                <Input type="email" value={emailInput} onChange={e => setEmailInput(e.target.value)} placeholder="vendor@example.com" autoFocus />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSendEmail} disabled={!emailInput || sendEmail.isPending}>
                  {sendEmail.isPending ? "Sending..." : "Send"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={() => window.print()} data-testid="btn-print"><Printer className="mr-2 h-4 w-4" /> Print</Button>
          <Button variant="outline" onClick={handleDownloadPdf} data-testid="btn-download-pdf"><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
        </div>
      </div>

      {/* Printable invoice document */}
      <Card className="border-border/50 print:shadow-none print:border-0" ref={invoiceRef}>
        <CardContent className="pt-8 pb-8 px-10">
          <div className="flex items-start justify-between mb-8 print:mb-6">
            <div>
              <div className="text-2xl font-bold text-primary">VendorBridge</div>
              <div className="text-sm text-muted-foreground mt-1">Procurement Management Platform</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">INVOICE</div>
              <div className="font-mono text-lg mt-1">{inv.invoiceNumber}</div>
              <Badge variant="outline" className={`border-0 capitalize mt-1 ${STATUS_COLORS[inv.status] ?? ""}`}>{inv.status}</Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Bill To</p>
              <p className="font-semibold">{inv.vendorName}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Invoice Details</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-end gap-4"><span className="text-muted-foreground">Date</span><span>{new Date(inv.createdAt).toLocaleDateString()}</span></div>
                {inv.dueDate && <div className="flex justify-end gap-4"><span className="text-muted-foreground">Due</span><span className="font-medium">{inv.dueDate}</span></div>}
                {inv.poNumber && <div className="flex justify-end gap-4"><span className="text-muted-foreground">PO Ref</span><span className="font-mono">{inv.poNumber}</span></div>}
              </div>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-3 font-medium">Description</th>
                  <th className="text-right p-3 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="p-3">Services / Goods as per {inv.poNumber || `PO #${inv.purchaseOrderId}`}</td>
                  <td className="p-3 text-right">${inv.subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                </tr>
                {inv.notes && (
                  <tr className="border-t text-muted-foreground">
                    <td colSpan={2} className="p-3 text-xs">{inv.notes}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <div className="w-64 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${inv.subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>${inv.taxAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span></div>
              <div className="flex justify-between border-t pt-2 font-bold text-base">
                <span>Total</span>
                <span>${inv.totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {inv.emailSentAt && (
            <div className="mt-6 pt-4 border-t flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              Email sent on {new Date(inv.emailSentAt).toLocaleDateString()}
            </div>
          )}
        </CardContent>
      </Card>

      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
          body { 
            background: white !important; 
            margin: 0;
            padding: 0;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page {
            margin: 20mm;
            size: A4;
          }
        }
      `}</style>
    </div>
  );
}
