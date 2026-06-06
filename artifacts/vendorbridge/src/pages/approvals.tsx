import React from "react";
import { useListApprovals } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { CheckSquare, Clock, ArrowRight } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  needs_revision: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
};

export default function Approvals() {
  const { data: approvals, isLoading, isError } = useListApprovals();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Approvals</h1>
        <p className="text-muted-foreground mt-1">Review and manage pending procurement requests.</p>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border-border/50">
              <CardContent className="p-6 space-y-3">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))
        ) : isError ? (
          <div className="text-center py-12 text-destructive">
            <p className="font-medium">Failed to load approvals.</p>
          </div>
        ) : !approvals?.length ? (
          <Card className="border-border/50">
            <CardContent className="py-12 text-center">
              <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">All caught up!</p>
              <p className="text-sm text-muted-foreground mt-1">No pending approvals at the moment.</p>
            </CardContent>
          </Card>
        ) : (
          approvals.map((approval, idx) => (
            <motion.div
              key={approval.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Link href={`/approvals/${approval.id}`}>
                <Card className="border-border/50 transition-all hover:shadow-md cursor-pointer">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`p-2 rounded-full flex-shrink-0 mt-0.5 ${
                          approval.status === "pending" ? "bg-yellow-100 dark:bg-yellow-900" :
                          approval.status === "approved" ? "bg-green-100 dark:bg-green-900" :
                          "bg-red-100 dark:bg-red-900"
                        }`}>
                          <Clock className={`h-4 w-4 ${
                            approval.status === "pending" ? "text-yellow-600" :
                            approval.status === "approved" ? "text-green-600" :
                            "text-red-600"
                          }`} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold">{approval.rfqTitle || `RFQ #${approval.quotationId}`}</h3>
                            <Badge variant="outline" className={`border-0 capitalize ${STATUS_COLORS[approval.status] ?? ""}`}>
                              {approval.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{approval.vendorName}</p>
                          <div className="flex gap-4 mt-2 text-sm">
                            <span>
                              <span className="text-muted-foreground">Amount: </span>
                              <span className="font-medium">${approval.totalPrice?.toFixed(2) || "0.00"}</span>
                            </span>
                            <span>
                              <span className="text-muted-foreground">Date: </span>
                              <span className="font-medium">{format(new Date(approval.createdAt), "MMM d, yyyy")}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}