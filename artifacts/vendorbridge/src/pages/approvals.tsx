import React from "react";
import { useListApprovals } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function Approvals() {
  const { data: approvals, isLoading, isError } = useListApprovals();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "rejected": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Approvals</h1>
          <p className="text-muted-foreground mt-1">Review and manage pending procurement requests.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-1">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="w-full">
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-1/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-1/3" />
              </CardContent>
            </Card>
          ))
        ) : isError ? (
          <p className="text-destructive">Failed to load approvals.</p>
        ) : approvals?.length === 0 ? (
          <p className="text-muted-foreground text-center py-10">No pending approvals found.</p>
        ) : (
          approvals?.map(approval => (
            <Card key={approval.id} className="w-full transition-shadow hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{approval.rfqTitle || `RFQ ID: ${approval.quotationId}`}</h3>
                      <Badge variant="outline" className={`border-0 capitalize ${getStatusColor(approval.status)}`}>
                        {approval.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">Vendor: {approval.vendorName}</p>
                    <div className="flex gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Total Amount:</span>
                        <span className="font-medium ml-2">${approval.totalPrice?.toFixed(2) || "0.00"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Date:</span>
                        <span className="font-medium ml-2">{format(new Date(approval.createdAt), "MMM d, yyyy")}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Link href={`/approvals/${approval.id}`}>
                      <span className="text-sm font-medium text-primary hover:underline cursor-pointer">Review Details &rarr;</span>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}