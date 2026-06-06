import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  FileCheck, 
  CheckSquare, 
  ShoppingCart, 
  Receipt, 
  Activity, 
  BarChart3, 
  Bell, 
  Settings,
  LogOut,
  Menu,
  Search,
  Mail,
  ChevronRight,
  ChevronDown,
  Share2,
  Sparkles,
  HelpCircle,
  PieChart
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { useListNotifications, useLogout } from "@workspace/api-client-react";
import { Logo } from "@/components/logo";
import { Button } from "./ui/button";

const NAV_SECTIONS = [
  {
    label: "Main Menu",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Vendors", url: "/vendors", icon: Users },
      { title: "RFQs", url: "/rfqs", icon: FileText },
      { title: "Quotations", url: "/quotations", icon: FileCheck },
      { title: "Approvals", url: "/approvals", icon: CheckSquare },
    ],
  },
  {
    label: "Procurement",
    items: [
      { title: "Purchase Orders", url: "/purchase-orders", icon: ShoppingCart },
      { title: "Invoices", url: "/invoices", icon: Receipt },
      { title: "Activity Logs", url: "/activity-logs", icon: Activity },
    ],
  },
  {
    label: "General",
    items: [
      { title: "Analytics", url: "/analytics", icon: BarChart3 },
      { title: "Notifications", url: "/notifications", icon: Bell, hasBadge: true },
      { title: "Settings", url: "/settings", icon: Settings },
    ],
  },
];

export function AppSidebar() {
  const [location, setLocation] = useLocation();
  const { user, logout: localLogout } = useAuth();
  const { state } = useSidebar();
  const logoutMutation = useLogout();
  const { data: unreadNotifications } = useListNotifications({ unreadOnly: true });
  const unreadCount = unreadNotifications?.length ?? 0;

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (e) {
      console.error("Logout error", e);
    } finally {
      localLogout();
      setLocation("/login");
    }
  };

  return (
    <Sidebar className="print:hidden" style={{ '--sidebar-width': '260px' } as React.CSSProperties}>
      {/* Logo + Brand */}
      <SidebarHeader className="h-[72px] flex items-center px-5 border-b" style={{ borderColor: 'var(--crm-divider)' }}>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 px-1 mb-6 mt-2">
            <Logo className="w-8 h-8 shrink-0" />
            {state === "expanded" && (
              <span className="font-bold text-lg tracking-tight">
                <span style={{ color: '#235A7B' }}>Vendor</span>
                <span style={{ color: '#79AE61' }}>Bridge</span>
              </span>
            )}
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-3 py-3">
        {/* Search bar */}
        {state === "expanded" && (
          <div className="px-1 mb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type="text"
                placeholder="Search..."
                className="w-full h-9 pl-9 pr-10 rounded-lg text-sm bg-muted/60 border-none outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground"
              />
              <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground bg-background px-1.5 py-0.5 rounded border border-border font-mono">⌘K</kbd>
            </div>
          </div>
        )}

        {/* Nav Sections */}
        {NAV_SECTIONS.map((section) => (
          <SidebarGroup key={section.label} className="mb-1">
            <SidebarGroupLabel className="px-3 text-[11px] font-medium text-muted-foreground uppercase tracking-[0.06em] mb-1.5">
              {section.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {section.items.map((item) => {
                  const isActive = location.startsWith(item.url) && (item.url !== "/" || location === "/");
                  const showBadge = item.hasBadge && unreadCount > 0;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={isActive}
                        tooltip={item.title}
                        className={`h-[38px] rounded-lg transition-all duration-150 group px-3 ${
                          isActive 
                            ? "!bg-gray-900 !text-white dark:!bg-gray-100 dark:!text-gray-900 font-medium" 
                            : "text-gray-600 dark:text-gray-400 hover:!bg-gray-100 dark:hover:!bg-gray-800"
                        }`}
                      >
                        <Link href={item.url} data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, "-")}`}>
                          <div className="relative flex items-center justify-center">
                            <item.icon className={`w-[18px] h-[18px] ${isActive ? "text-white dark:text-gray-900" : "text-gray-500 dark:text-gray-400"}`} strokeWidth={1.8} />
                            {showBadge && (
                              <span className="absolute -top-1 -right-1.5 flex items-center justify-center w-[18px] h-[18px] text-[10px] font-bold text-white bg-red-500 rounded-full">
                                {unreadCount > 9 ? "9+" : unreadCount}
                              </span>
                            )}
                          </div>
                          <span className="text-sm">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-3">
        {/* Upgrade Promo Card */}
        {state === "expanded" && (
          <div className="mb-3 rounded-2xl p-4" style={{ background: 'linear-gradient(135deg, #EEF2FF, #F5F3FF)' }}>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-bold text-gray-900">Upgrade to Pro</span>
            </div>
            <p className="text-xs text-gray-500 mb-3">Get 20% off for first 3 months</p>
            <button className="w-full bg-white text-gray-800 text-sm font-medium py-2 px-3 rounded-lg shadow-sm hover:shadow-md transition-all">
              Claim Now
            </button>
          </div>
        )}

        {/* User Profile Row */}
        {user ? (
          <div className="border-t pt-3" style={{ borderColor: 'var(--crm-divider)' }}>
            {state === "expanded" ? (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shrink-0 overflow-hidden">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-sm font-medium text-foreground truncate">{user.name}</span>
                  <span className="text-xs text-muted-foreground truncate capitalize">{user.role.replace("_", " ")}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  title="Log out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Button 
                variant="outline" 
                className="w-full px-0 justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                onClick={handleLogout}
                data-testid="btn-logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : null}
      </SidebarFooter>
    </Sidebar>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [location, setLocation] = useLocation();
  const { data: unreadNotifications } = useListNotifications({ unreadOnly: true });
  const unreadCount = unreadNotifications?.length ?? 0;

  // Derive page title from location
  const pageTitle = useMemo(() => {
    const parts = location.split("/").filter(Boolean);
    if (parts.length === 0) return "Dashboard";
    const labels: Record<string, string> = {
      dashboard: "Dashboard", vendors: "Vendors", rfqs: "RFQs",
      quotations: "Quotations", approvals: "Approvals",
      "purchase-orders": "Purchase Orders", invoices: "Invoices",
      "activity-logs": "Activity Logs", analytics: "Analytics",
      notifications: "Notifications", settings: "Settings",
      new: "Create New",
    };
    const mainPart = parts[0];
    return labels[mainPart] || mainPart.charAt(0).toUpperCase() + mainPart.slice(1).replace(/-/g, " ");
  }, [location]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !['/login', '/signup', '/forgot-password', '/profile-setup'].includes(location)) {
      setLocation("/login");
    }
  }, [isAuthenticated, isLoading, location, setLocation]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Auth pages don't get the sidebar
  if (['/login', '/signup', '/forgot-password', '/profile-setup'].includes(location)) {
    return <>{children}</>;
  }

  if (!isAuthenticated) return null;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background print:bg-white print:min-h-0 print:h-auto">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 print:block">
          {/* Top Header Bar */}
          <header className="h-16 flex items-center px-6 border-b shrink-0 print:hidden gap-4 bg-background" style={{ borderColor: 'var(--crm-divider)' }}>
            <SidebarTrigger className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" />
            
            {/* Page Title */}
            <h1 className="text-[22px] font-semibold text-foreground ml-1">{pageTitle}</h1>
            
            <div className="flex-1" />
            
            {/* Right side: icon buttons + CTA */}
            <div className="flex items-center gap-2">
              {/* Mail icon button */}
              <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <Mail className="h-5 w-5" />
              </button>
              
              {/* Bell icon button */}
              <Link href="/notifications" className="relative">
                <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <Bell className="h-5 w-5" />
                </button>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full ring-2 ring-background">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>

              {/* Primary CTA Button */}
              <button 
                onClick={() => setLocation("/rfqs/new")}
                className="flex items-center gap-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-xl px-4 py-2 text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors ml-1"
              >
                <Share2 className="h-4 w-4" />
                New RFQ
              </button>
            </div>
          </header>

          {/* Main content area with 24px padding */}
          <main className="flex-1 p-6 overflow-auto print:p-0 print:overflow-visible print:block bg-background">
            <div className="mx-auto max-w-[1400px] print:max-w-none print:w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}