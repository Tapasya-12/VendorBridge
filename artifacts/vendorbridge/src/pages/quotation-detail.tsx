import React from "react";
import { useParams, Link } from "wouter";
import { useGetQuotation, getGetQuotationQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  submitted: "bg-blue-100 text-blue-800",
  negotiating: "bg-yellow-100 text-yellow-800",
  accepted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export default function QuotationDetail() {
  const { id } = useParams<{ id: string }>();
  const qId = parseInt(id ?? "0", 10);
  const { data: q, isLoading, isError } = useGetQuotation(qId, { query: { enabled: !!qId, queryKey: getGetQuotationQueryKey(qId) } });

  if (isLoading) return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <Card className="border-border/50"><CardContent className="pt-6 space-y-3">{Array.from({length:4}).map((_,i) => <Skeleton key={i} className="h-10 w-full" />)}</CardContent></Card>
    </div>
  );

  if (isError || !q) return (
    <div className="space-y-4">
      <Link href="/quotations"><Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button></Link>
      <p className="text-destructive">Quotation not found.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/quotations"><Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button></Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">QUO-{String(q.id).padStart(5, "0")}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className={`border-0 capitalize ${STATUS_COLORS[q.status] ?? ""}`}>{q.status.replace("_", " ")}</Badge>
            <span className="text-muted-foreground text-sm">{q.rfqTitle || `RFQ-${q.rfqId}`}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
          <CardContent>
            <dl className="space-y-4">
              {[
                { label: "Vendor", value: q.vendorName || `Vendor ${q.vendorId}` },
                { label: "RFQ", value: q.rfqTitle || `RFQ-${q.rfqId}` },
                { label: "Total Price", value: `$${q.totalPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}` },
                { label: "Delivery", value: q.deliveryDays ? `${q.deliveryDays} days` : "—" },
                { label: "Status", value: q.status.replace("_", " ") },
                { label: "Submitted", value: q.createdAt ? new Date(q.createdAt).toLocaleDateString() : "—" },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-start">
                  <dt className="text-sm text-muted-foreground">{label}</dt>
                  <dd className="text-sm font-medium text-right">{value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{q.notes || "No notes provided."}</p>
          </CardContent>
        </Card>
      </div>

      {q.items && q.items.length > 0 && (
        <Card className="border-border/50">
          <CardHeader><CardTitle>Pricing Items</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {q.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.productName}</TableCell>
                    <TableCell className="text-right">${item.unitPrice.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right font-semibold">${item.totalPrice.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="border-t-2">
                  <TableCell colSpan={3} className="text-right font-semibold">Grand Total</TableCell>
                  <TableCell className="text-right font-bold text-lg">${q.totalPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
