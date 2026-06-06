import React from "react";
import { useGetDashboardSummary } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Users, ShoppingCart, Receipt, DollarSign, CheckSquare } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: summary, isLoading, isError } = useGetDashboardSummary();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-1/3 mb-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !summary) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-destructive">Failed to load dashboard summary.</p>
      </div>
    );
  }

  const kpis = [
    {
      title: "Pending Approvals",
      value: summary.pendingApprovals,
      icon: CheckSquare,
      color: "text-orange-500",
      link: "/approvals",
    },
    {
      title: "Active RFQs",
      value: summary.activeRfqs,
      icon: FileText,
      color: "text-blue-500",
      link: "/rfqs",
    },
    {
      title: "Total Vendors",
      value: summary.totalVendors,
      icon: Users,
      color: "text-green-500",
      link: "/vendors",
    },
    {
      title: "Purchase Orders",
      value: summary.totalPurchaseOrders,
      icon: ShoppingCart,
      color: "text-purple-500",
      link: "/purchase-orders",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of procurement activities and metrics.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, index) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Link href={kpi.link}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer border-border/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                  <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpi.value}</div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-border/50">
          <CardHeader>
            <CardTitle>Recent RFQs</CardTitle>
          </CardHeader>
          <CardContent>
            {summary.recentRfqs?.length ? (
              <div className="space-y-4">
                {summary.recentRfqs.map((rfq) => (
                  <div key={rfq.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium">{rfq.title}</p>
                      <p className="text-sm text-muted-foreground">ID: {rfq.id} • Status: <span className="capitalize">{rfq.status}</span></p>
                    </div>
                    <Link href={`/rfqs/${rfq.id}`}>
                      <span className="text-sm text-primary hover:underline cursor-pointer">View</span>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recent RFQs.</p>
            )}
          </CardContent>
        </Card>
        <Card className="lg:col-span-3 border-border/50">
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent>
             {summary.recentInvoices?.length ? (
              <div className="space-y-4">
                {summary.recentInvoices.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium">{inv.invoiceNumber}</p>
                      <p className="text-sm text-muted-foreground">{inv.vendorName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${inv.totalAmount.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground capitalize">{inv.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recent invoices.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}