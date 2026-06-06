import React, { useMemo } from "react";
import { useGetAnalyticsOverview, useGetVendorPerformance, useGetSpendingTrends } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area, ComposedChart, Line, ScatterChart, Scatter, ZAxis } from "recharts";
import { TrendingUp, DollarSign, ShoppingCart, FileText, Percent, Activity } from "lucide-react";
import { motion } from "framer-motion";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];
const GRADIENTS = {
  spend: "url(#colorSpend)",
  orders: "url(#colorOrders)"
};

export default function Analytics() {
  const { data: overview, isLoading: overviewLoading } = useGetAnalyticsOverview();
  const { data: vendorPerf, isLoading: vendorLoading } = useGetVendorPerformance();
  const { data: trends, isLoading: trendsLoading } = useGetSpendingTrends();

  const kpis = overview ? [
    { title: "Total RFQs", value: overview.totalRfqs, icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Total Spend", value: `$${Number(overview.totalSpend).toLocaleString("en-US", { maximumFractionDigits: 0 })}`, icon: DollarSign, color: "text-green-500", bg: "bg-green-500/10" },
    { title: "Total POs", value: overview.totalPOs, icon: ShoppingCart, color: "text-purple-500", bg: "bg-purple-500/10" },
    { title: "Approval Rate", value: `${overview.approvalRate}%`, icon: Percent, color: "text-orange-500", bg: "bg-orange-500/10" },
    { title: "Avg Quotations / RFQ", value: overview.avgQuotationsPerRfq, icon: TrendingUp, color: "text-cyan-500", bg: "bg-cyan-500/10" },
  ] : [];

  // Derived Data for new charts
  const documentFlowData = useMemo(() => {
    if (!overview) return [];
    return [
      { name: 'RFQs', value: overview.totalRfqs },
      { name: 'Quotations', value: overview.totalQuotations },
      { name: 'Purchase Orders', value: overview.totalPOs },
      { name: 'Invoices', value: overview.totalInvoices },
    ].filter(d => d.value > 0);
  }, [overview]);

  const vendorMatrixData = useMemo(() => {
    if (!vendorPerf) return [];
    return vendorPerf.map(v => ({
      name: v.vendorName,
      delivery: v.avgDeliveryDays || 0,
      rating: v.rating || 0,
      spend: v.totalSpend || 0,
    })).filter(v => v.spend > 0 || v.delivery > 0 || v.rating > 0);
  }, [vendorPerf]);

  const topVendorsBySpend = useMemo(() => {
    if (!vendorPerf) return [];
    return [...vendorPerf].sort((a, b) => b.totalSpend - a.totalSpend).slice(0, 5);
  }, [vendorPerf]);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics & Insights</h1>
        <p className="text-muted-foreground mt-1">Comprehensive procurement performance and financial overview.</p>
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
              <Card className="border-border/50 overflow-hidden relative">
                <div className={`absolute top-0 right-0 p-4 rounded-bl-3xl ${kpi.bg}`}>
                  <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
                <CardContent className="pt-6">
                  <p className="text-sm font-medium text-muted-foreground mb-1">{kpi.title}</p>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Primary Charts Row */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Spending & Order Trends (Composed Chart) */}
        <Card className="border-border/50 lg:col-span-2 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Spending & Order Volume</CardTitle>
                <CardDescription>Monthly correlation between total spend and order count</CardDescription>
              </div>
              <Activity className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {trendsLoading ? (
              <Skeleton className="h-72 w-full" />
            ) : !trends?.length ? (
              <div className="h-72 flex items-center justify-center text-muted-foreground text-sm">No spending data yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={trends} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/50" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis yAxisId="left" tick={{ fontSize: 12 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} dx={-10} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} dx={10} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))' }}
                    formatter={(value: any, name: string) => [name === 'totalSpend' ? `$${Number(value).toLocaleString()}` : value, name === 'totalSpend' ? 'Total Spend' : 'Orders']}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px' }} />
                  <Area yAxisId="left" type="monotone" dataKey="totalSpend" fill="url(#colorSpend)" stroke="#3b82f6" strokeWidth={3} name="Total Spend" />
                  <Bar yAxisId="right" dataKey="orderCount" barSize={20} fill="#10b981" radius={[4, 4, 0, 0]} name="Orders" />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Document Flow (Donut Chart) */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>Document Flow</CardTitle>
            <CardDescription>Proportion of lifecycle documents</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            {overviewLoading ? (
              <Skeleton className="h-72 w-full rounded-full" />
            ) : !documentFlowData.length ? (
              <div className="h-72 flex items-center justify-center text-muted-foreground text-sm">No data yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))' }}
                    formatter={(value: number) => [value, "Documents"]}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  <Pie
                    data={documentFlowData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {documentFlowData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Secondary Charts Row */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Top Vendors by Spend (Horizontal Bar) */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>Top Vendors by Spend</CardTitle>
            <CardDescription>Highest value suppliers</CardDescription>
          </CardHeader>
          <CardContent>
             {vendorLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : !topVendorsBySpend.length ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">No vendor data yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={topVendorsBySpend} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} className="stroke-border/50" />
                  <XAxis type="number" tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="vendorName" type="category" width={100} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{fill: 'hsl(var(--muted))', opacity: 0.4}}
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))' }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, "Total Spend"]}
                  />
                  <Bar dataKey="totalSpend" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={24}>
                     {topVendorsBySpend.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 4) % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Vendor Matrix (Scatter) */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>Vendor Matrix</CardTitle>
            <CardDescription>Rating vs Delivery Days (Bubble size = Spend)</CardDescription>
          </CardHeader>
          <CardContent>
            {vendorLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : !vendorMatrixData.length ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">No rating/delivery data yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis type="number" dataKey="delivery" name="Delivery Days" tick={{ fontSize: 12 }} axisLine={false} tickLine={false}>
                    {/* Add label below axis via dy? We'll rely on tooltip and title */}
                  </XAxis>
                  <YAxis type="number" dataKey="rating" name="Rating" tick={{ fontSize: 12 }} domain={[0, 5]} axisLine={false} tickLine={false} />
                  <ZAxis type="number" dataKey="spend" range={[50, 400]} name="Spend" />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }} 
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))' }}
                    formatter={(value: any, name: string) => {
                      if (name === "Spend") return `$${Number(value).toLocaleString()}`;
                      if (name === "Delivery Days") return `${value} days`;
                      if (name === "Rating") return `${value} ★`;
                      return value;
                    }}
                  />
                  <Scatter name="Vendors" data={vendorMatrixData} fill="#f59e0b" fillOpacity={0.7} />
                </ScatterChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Vendor Performance Table */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle>All Vendor Performance</CardTitle>
          <CardDescription>Detailed tabular view of vendor metrics</CardDescription>
        </CardHeader>
        <CardContent>
          {vendorLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : !vendorPerf?.length ? (
            <p className="text-center text-muted-foreground py-8">No vendor performance data yet.</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
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
                        {v.rating ? <span className="text-yellow-500 font-medium">★ {v.rating.toFixed(1)}</span> : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
