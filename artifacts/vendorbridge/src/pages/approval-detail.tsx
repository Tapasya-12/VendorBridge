import React, { useState } from "react";
import { useParams, Link } from "wouter";
import { useListApprovals, useApproveApproval, useRejectApproval, getListApprovalsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function useToastSafe() {
  try { return useToast(); }
  catch { return { toast: ({ title, description }: { title?: string; description?: string }) => console.log(title, description) }; }
}

const STATUS_STYLES: Record<string, { color: string; icon: React.ElementType }> = {
  pending: { color: "bg-yellow-100 text-yellow-800", icon: () => null },
  approved: { color: "bg-green-100 text-green-800", icon: CheckCircle },
  rejected: { color: "bg-red-100 text-red-800", icon: XCircle },
};

export default function ApprovalDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToastSafe();
  const queryClient = useQueryClient();
  const aId = parseInt(id ?? "0", 10);
  const [remarks, setRemarks] = useState("");

  const { data: approvals, isLoading, isError } = useListApprovals();
  const approval = approvals?.find(a => a.id === aId);

  const approveApproval = useApproveApproval();
  const rejectApproval = useRejectApproval();

  const handleApprove = async () => {
    try {
      await approveApproval.mutateAsync({ id: aId, data: { remarks: remarks || undefined } });
      await queryClient.invalidateQueries({ queryKey: getListApprovalsQueryKey() });
      toast({ title: "Approved", description: "The quotation has been approved." });
    } catch {
      toast({ title: "Error", description: "Failed to approve." });
    }
  };

  const handleReject = async () => {
    if (!remarks) { toast({ title: "Remarks required", description: "Please provide a reason for rejection." }); return; }
    try {
      await rejectApproval.mutateAsync({ id: aId, data: { remarks } });
      await queryClient.invalidateQueries({ queryKey: getListApprovalsQueryKey() });
      toast({ title: "Rejected", description: "The quotation has been rejected." });
    } catch {
      toast({ title: "Error", description: "Failed to reject." });
    }
  };

  if (isLoading) return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <Card className="border-border/50"><CardContent className="pt-6 space-y-3">{Array.from({length:5}).map((_,i) => <Skeleton key={i} className="h-10 w-full" />)}</CardContent></Card>
    </div>
  );

  if (isError || !approval) return (
    <div className="space-y-4">
      <Link href="/approvals"><Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button></Link>
      <p className="text-destructive">Approval not found.</p>
    </div>
  );

  const statusStyle = STATUS_STYLES[approval.status] ?? STATUS_STYLES.pending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/approvals"><Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button></Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Approval #{approval.id}</h1>
            <Badge variant="outline" className={`border-0 capitalize mt-1 ${statusStyle.color}`}>{approval.status}</Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader><CardTitle>Approval Details</CardTitle></CardHeader>
          <CardContent>
            <dl className="space-y-4">
              {[
                { label: "RFQ", value: approval.rfqTitle || `RFQ-${approval.quotationId}` },
                { label: "Vendor", value: approval.vendorName || "—" },
                { label: "Total Price", value: approval.totalPrice ? `$${Number(approval.totalPrice).toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "—" },
                { label: "Submitted", value: new Date(approval.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) },
                { label: "Last Updated", value: new Date(approval.updatedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) },
                { label: "Approved By", value: approval.approvedByName || "—" },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <dt className="text-sm text-muted-foreground">{label}</dt>
                  <dd className="text-sm font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        {approval.status === "pending" && (
          <Card className="border-border/50">
            <CardHeader><CardTitle>Take Action</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  placeholder="Add remarks or reason for decision..."
                  rows={4}
                  data-testid="textarea-remarks"
                />
                <p className="text-xs text-muted-foreground">Required for rejection.</p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleApprove}
                  disabled={approveApproval.isPending || rejectApproval.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  data-testid="btn-approve"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {approveApproval.isPending ? "Approving..." : "Approve"}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={approveApproval.isPending || rejectApproval.isPending}
                  className="flex-1"
                  data-testid="btn-reject"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  {rejectApproval.isPending ? "Rejecting..." : "Reject"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {approval.remarks && (
          <Card className="border-border/50">
            <CardHeader><CardTitle>Remarks</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{approval.remarks}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
