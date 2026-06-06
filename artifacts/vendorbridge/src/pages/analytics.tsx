import React from "react";
import { useGetAnalyticsOverview, useGetVendorPerformance, useGetSpendingTrends } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { TrendingUp, DollarSign, ShoppingCart, FileText, Percent } from "lucide-react";
import { motion } from "framer-motion";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export default function Analytics() {
  const { data: overview, isLoading: overviewLoading } = useGetAnalyticsOverview();
  const { data: vendorPerf, isLoading: vendorLoading } = useGetVendorPerformance();
  const { data: trends, isLoading: trendsLoading } = useGetSpendingTrends();

  const kpis = overview ? [
    { title: "Total RFQs", value: overview.totalRfqs, icon: FileText, color: "text-blue-500" },
    { title: "Total Spend", value: `$${Number(overview.totalSpend).toLocaleString("en-US", { maximumFractionDigits: 0 })}`, icon: DollarSign, color: "text-green-500" },
    { title: "Total POs", value: overview.totalPOs, icon: ShoppingCart, color: "text-purple-500" },
    { title: "Approval Rate", value: `${overview.approvalRate}%`, icon: Percent, color: "text-orange-500" },
    { title: "Avg Quotations / RFQ", value: overview.avgQuotationsPerRfq, icon: TrendingUp, color: "text-cyan-500" },
  ] : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">Procurement performance insights and trends.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {overviewLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="border-border/50">
              <CardContent className="pt-6"><Skeleton className="h-8 w-16 mb-2" /><Skeleton className="h-4 w-24" /></CardContent>
            </Card>
          ))
        ) : (
          kpis.map((kpi, idx) => (
            <motion.div key={kpi.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
              <Card className="border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">{kpi.title}</p>
                    <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                  </div>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader><CardTitle>Monthly Spending Trends</CardTitle></CardHeader>
          <CardContent>
            {trendsLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : !trends?.length ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">No spending data yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={trends} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => [`$${Number(v).toLocaleString()}`, "Spend"]} />
                  <Bar dataKey="totalSpend" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader><CardTitle>PO Volume by Month</CardTitle></CardHeader>
          <CardContent>
            {trendsLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : !trends?.length ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">No data yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={trends} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="orderCount" fill="#10b981" radius={[4, 4, 0, 0]} name="Orders" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Vendor Performance Table */}
      <Card className="border-border/50">
        <CardHeader><CardTitle>Vendor Performance</CardTitle></CardHeader>
        <CardContent>
          {vendorLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : !vendorPerf?.length ? (
            <p className="text-center text-muted-foreground py-8">No vendor performance data yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Vendor</TableHead>
                  <TableHead className="text-right">Total Orders</TableHead>
                  <TableHead className="text-right">Total Spend</TableHead>
                  <TableHead className="text-right">Avg Delivery (days)</TableHead>
                  <TableHead className="text-right">Rating</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendorPerf.map((v) => (
                  <TableRow key={v.vendorId}>
                    <TableCell className="font-medium">{v.vendorName}</TableCell>
                    <TableCell className="text-right">{v.totalOrders}</TableCell>
                    <TableCell className="text-right">${Number(v.totalSpend).toLocaleString("en-US", { maximumFractionDigits: 0 })}</TableCell>
                    <TableCell className="text-right">{v.avgDeliveryDays || "—"}</TableCell>
                    <TableCell className="text-right">
                      {v.rating ? <span className="text-yellow-500">★ {v.rating}</span> : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
