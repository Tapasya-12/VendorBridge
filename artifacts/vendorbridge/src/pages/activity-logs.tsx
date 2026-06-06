import React, { useState } from "react";
import { useListActivityLogs } from "@workspace/api-client-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Activity, FileText, Users, ShoppingCart, Receipt, CheckSquare, FileCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const ENTITY_ICONS: Record<string, React.ElementType> = {
  rfq: FileText,
  vendor: Users,
  purchase_order: ShoppingCart,
  invoice: Receipt,
  approval: CheckSquare,
  quotation: FileCheck,
};

const ENTITY_COLORS: Record<string, string> = {
  rfq: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  vendor: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  purchase_order: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  invoice: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  approval: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  quotation: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300",
};

export default function ActivityLogs() {
  const [entityType, setEntityType] = useState("all");
  const { data: logs, isLoading, isError } = useListActivityLogs(entityType !== "all" ? { entityType } : undefined);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Activity Logs</h1>
        <p className="text-muted-foreground mt-1">Track all actions and events across the platform.</p>
      </div>

      <div className="flex items-center gap-3">
        <Select value={entityType} onValueChange={setEntityType}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Filter by entity" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Entities</SelectItem>
            <SelectItem value="rfq">RFQs</SelectItem>
            <SelectItem value="vendor">Vendors</SelectItem>
            <SelectItem value="purchase_order">Purchase Orders</SelectItem>
            <SelectItem value="invoice">Invoices</SelectItem>
            <SelectItem value="approval">Approvals</SelectItem>
            <SelectItem value="quotation">Quotations</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="border-border/50">
              <CardContent className="py-4 flex gap-4">
                <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : isError ? (
          <p className="text-center text-destructive py-12">Failed to load activity logs.</p>
        ) : !logs?.length ? (
          <Card className="border-border/50">
            <CardContent className="py-12 text-center">
              <Activity className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No activity logs found.</p>
            </CardContent>
          </Card>
        ) : (
          logs.map((log, idx) => {
            const Icon = ENTITY_ICONS[log.entityType] ?? Activity;
            const colorClass = ENTITY_COLORS[log.entityType] ?? "bg-gray-100 text-gray-700";
            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.02 }}
              >
                <Card className="border-border/50">
                  <CardContent className="py-4 flex items-start gap-4">
                    <div className={`p-2 rounded-full flex-shrink-0 ${colorClass}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{log.userName || "System"}</span>
                        <Badge variant="outline" className={`border-0 capitalize text-xs ${colorClass}`}>
                          {log.action}
                        </Badge>
                        <Badge variant="outline" className="border-0 text-xs text-muted-foreground">
                          {log.entityType.replace("_", " ")} #{log.entityId}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{log.description}</p>
                    </div>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                    </span>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
