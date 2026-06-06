import React from "react";
import { useGetDashboardSummary, useGetSpendingTrends } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Users, ShoppingCart, Receipt, DollarSign, CheckSquare, TrendingUp, BarChart3, ChevronRight, Activity, Clock, CheckCircle2, AlertCircle, PlusCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'sent':
    case 'active':
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/50';
    case 'closed':
    case 'paid':
    case 'approved':
      return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800/50';
    case 'draft':
    case 'pending':
      return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800/50';
    case 'cancelled':
    case 'overdue':
    case 'rejected':
      return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/50';
    default:
      return 'bg-gray-100 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800/50';
  }
};

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'closed':
    case 'paid':
    case 'approved':
      return <CheckCircle2 className="w-3 h-3 mr-1" />;
    case 'cancelled':
    case 'overdue':
    case 'rejected':
      return <AlertCircle className="w-3 h-3 mr-1" />;
    case 'draft':
    case 'pending':
      return <Clock className="w-3 h-3 mr-1" />;
    default:
      return <Activity className="w-3 h-3 mr-1" />;
  }
};

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { data: summary, isLoading, isError } = useGetDashboardSummary();
  const { data: trends, isLoading: trendsLoading } = useGetSpendingTrends();

  if (isLoading) {
    return (
      <div className="space-y-6 pb-12">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-border/50 rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-4 px-4">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-7 w-7 rounded-lg" />
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <Skeleton className="h-8 w-1/3" />
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
        <div className="text-center space-y-3">
          <AlertCircle className="mx-auto h-10 w-10 text-destructive/80" />
          <p className="text-lg font-medium text-destructive">Failed to load dashboard summary.</p>
          <p className="text-sm text-muted-foreground">Please try refreshing the page or check your connection.</p>
        </div>
      </div>
    );
  }

  const kpis = [
    { title: "Pending Approvals", value: summary.pendingApprovals, icon: CheckSquare, color: "text-orange-500", bg: "bg-orange-500/10", link: "/approvals" },
    { title: "Active RFQs", value: summary.activeRfqs, icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10", link: "/rfqs" },
    { title: "Total Vendors", value: summary.totalVendors, icon: Users, color: "text-green-500", bg: "bg-green-500/10", link: "/vendors" },
    { title: "Purchase Orders", value: summary.totalPurchaseOrders, icon: ShoppingCart, color: "text-purple-500", bg: "bg-purple-500/10", link: "/purchase-orders" },
    { title: "Invoices", value: summary.totalInvoices, icon: Receipt, color: "text-cyan-500", bg: "bg-cyan-500/10", link: "/invoices" },
    { title: "Total Spend", value: summary.totalSpend ? `$${Number(summary.totalSpend).toLocaleString("en-US", { maximumFractionDigits: 0 })}` : "$0", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10", link: "/analytics" },
  ];

  const quickActions = [
    { title: "Create RFQ", icon: FileText, desc: "Draft a new request for quotation", link: "/rfqs/new", bg: "bg-blue-500/10 hover:bg-blue-500/20", color: "text-blue-600" },
    { title: "Add Vendor", icon: Users, desc: "Onboard a new supplier", link: "/vendors/new", bg: "bg-green-500/10 hover:bg-green-500/20", color: "text-green-600" },
    { title: "Create Invoice", icon: Receipt, desc: "Log a new invoice", link: "/invoices/new", bg: "bg-purple-500/10 hover:bg-purple-500/20", color: "text-purple-600" },
    { title: "New PO", icon: ShoppingCart, desc: "Issue a purchase order", link: "/purchase-orders/new", bg: "bg-orange-500/10 hover:bg-orange-500/20", color: "text-orange-600" },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1 text-base">Key metrics and recent activity across your procurement lifecycle.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        {kpis.map((kpi, index) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="h-full"
          >
            <Link href={kpi.link} className="block h-full">
              <Card className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border-border/50 group relative overflow-hidden h-full rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-4">
                  <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate mr-2">{kpi.title}</CardTitle>
                  <div className={`p-1.5 rounded-lg transition-colors ${kpi.bg} group-hover:bg-opacity-20 shrink-0`}>
                    <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="text-2xl xl:text-3xl font-bold tracking-tight text-foreground truncate">{kpi.value}</div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Recent RFQs */}
        <Card className="lg:col-span-3 border-border/50 shadow-sm flex flex-col">
          <CardHeader className="pb-3 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent RFQs</CardTitle>
                <CardDescription>Latest requests for quotation</CardDescription>
              </div>
              <Link href="/rfqs">
                <span className="text-sm font-medium text-primary hover:underline cursor-pointer flex items-center">
                  View all <ChevronRight className="h-4 w-4 ml-1" />
                </span>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-4 flex-1">
            {summary.recentRfqs?.length ? (
              <div className="space-y-4">
                {summary.recentRfqs.map((rfq) => (
                  <div key={rfq.id} className="group flex items-center justify-between py-3 border-b border-white/20 hover:bg-white/5 transition-colors last:border-0 px-2 rounded-md">
                    <div className="flex flex-col gap-1.5">
                      <p className="font-semibold text-sm leading-none">{rfq.title}</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(rfq.status)} w-fit capitalize`}>
                        {getStatusIcon(rfq.status)}
                        {rfq.status}
                      </span>
                    </div>
                    <Link href={`/rfqs/${rfq.id}`}>
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-primary hover:text-primary-foreground">
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-10 space-y-2">
                <FileText className="h-8 w-8 opacity-20" />
                <p className="text-sm">No recent RFQs found.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* RFQ Status Breakdown */}
        <Card className="lg:col-span-2 border-border/50 shadow-sm flex flex-col">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle>RFQ Status</CardTitle>
            <CardDescription>Current pipeline distribution</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 flex-1 flex flex-col justify-center">
            {summary.rfqStatusBreakdown?.length ? (
              <div className="space-y-5">
                {summary.rfqStatusBreakdown.map((item) => {
                  const maxCount = Math.max(...summary.rfqStatusBreakdown.map(i => i.count));
                  const percent = Math.min(100, (item.count / maxCount) * 100);
                  const isSent = item.status === "sent";
                  const isClosed = item.status === "closed";
                  const isDraft = item.status === "draft";
                  const barColor = isSent ? "bg-blue-500" : isClosed ? "bg-green-500" : isDraft ? "bg-gray-400" : "bg-red-500";
                  
                  return (
                    <div key={item.status} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium capitalize text-foreground">{item.status}</span>
                        <span className="font-semibold text-muted-foreground">{item.count}</span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percent}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className={`h-full rounded-full ${barColor}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-10 space-y-2">
                <BarChart3 className="h-8 w-8 opacity-20" />
                <p className="text-sm">No status data available.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card className="lg:col-span-2 border-border/50 shadow-sm flex flex-col">
          <CardHeader className="pb-3 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Invoices</CardTitle>
                <CardDescription>Latest billing activity</CardDescription>
              </div>
              <Link href="/invoices">
                <span className="text-sm font-medium text-primary hover:underline cursor-pointer flex items-center">
                  View all <ChevronRight className="h-4 w-4 ml-1" />
                </span>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-4 flex-1">
             {summary.recentInvoices?.length ? (
              <div className="space-y-4">
                {summary.recentInvoices.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between py-3 border-b border-white/20 hover:bg-white/5 transition-colors last:border-0 px-2 rounded-md">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">{inv.invoiceNumber}</p>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getStatusColor(inv.status)}`}>
                          {inv.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1" title={inv.vendorName || ''}>{inv.vendorName}</p>
                    </div>
                    <div className="text-right flex flex-col justify-center">
                      <p className="font-bold text-sm tracking-tight">${inv.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-10 space-y-2">
                <Receipt className="h-8 w-8 opacity-20" />
                <p className="text-sm">No recent invoices.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Secondary Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Quick Actions */}
        <Card className="lg:col-span-2 border-border/50 shadow-sm">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequent tasks</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid gap-3 grid-cols-1">
              {quickActions.map((action, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setLocation(action.link)}
                  className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-border/50 ${action.bg}`}
                >
                  <div className={`mt-0.5 ${action.color}`}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className={`font-semibold text-sm ${action.color}`}>{action.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{action.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Spending Trends */}
        <Card className="lg:col-span-5 border-border/50 shadow-sm">
          <CardHeader className="pb-3 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Spending Overview</CardTitle>
                <CardDescription>Monthly expenditure trends</CardDescription>
              </div>
              <Link href="/analytics">
                <span className="text-sm font-medium text-primary hover:underline cursor-pointer flex items-center">
                  Full Analytics <BarChart3 className="h-4 w-4 ml-1" />
                </span>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {trendsLoading ? (
              <Skeleton className="h-[280px] w-full" />
            ) : !trends?.length ? (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">No spending data available yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={trends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorDashboardSpend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-white/10" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} dx={-10} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-card)', color: 'var(--color-card-foreground)' }}
                    formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Total Spend']}
                  />
                  <Area type="monotone" dataKey="totalSpend" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorDashboardSpend)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}