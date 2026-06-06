import React, { useEffect, useMemo } from "react";
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
  Menu
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
import { Button } from "./ui/button";

const NAV_ITEMS = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Vendors", url: "/vendors", icon: Users },
  { title: "RFQs", url: "/rfqs", icon: FileText },
  { title: "Quotations", url: "/quotations", icon: FileCheck },
  { title: "Approvals", url: "/approvals", icon: CheckSquare },
  { title: "Purchase Orders", url: "/purchase-orders", icon: ShoppingCart },
  { title: "Invoices", url: "/invoices", icon: Receipt },
  { title: "Activity Logs", url: "/activity-logs", icon: Activity },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Settings", url: "/settings", icon: Settings },
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
    <Sidebar className="print:hidden">
      <SidebarHeader className="h-16 flex items-center px-4 border-b">
        <div className="flex items-center gap-2 font-bold text-lg text-primary tracking-tight">
          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-md flex items-center justify-center">
            VB
          </div>
          {state === "expanded" && <span>VendorBridge</span>}
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                const isActive = location.startsWith(item.url) && (item.url !== "/" || location === "/");
                const showBadge = item.title === "Notifications" && unreadCount > 0;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Link href={item.url} data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, "-")}`}>
                        <div className="relative">
                          <item.icon />
                          {showBadge && (
                            <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full">
                              {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                          )}
                        </div>
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        {user ? (
          <div className="flex flex-col gap-4">
            {state === "expanded" && (
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user.name}</span>
                <span className="text-xs text-muted-foreground capitalize">{user.role.replace("_", " ")}</span>
              </div>
            )}
            <Button 
              variant="outline" 
              className="w-full justify-start text-muted-foreground" 
              onClick={handleLogout}
              data-testid="btn-logout"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {state === "expanded" && "Log out"}
            </Button>
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

  const breadcrumbs = useMemo(() => {
    const parts = location.split("/").filter(Boolean);
    if (parts.length === 0) return null;
    const labels: Record<string, string> = {
      dashboard: "Dashboard", vendors: "Vendors", rfqs: "RFQs",
      quotations: "Quotations", approvals: "Approvals",
      "purchase-orders": "Purchase Orders", invoices: "Invoices",
      "activity-logs": "Activity Logs", analytics: "Analytics",
      notifications: "Notifications", settings: "Settings",
    };
    return (
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground min-w-0">
        <Link href="/dashboard" className="hover:text-foreground transition-colors truncate">Home</Link>
        {parts.map((part, i) => {
          const path = "/" + parts.slice(0, i + 1).join("/");
          const isLast = i === parts.length - 1;
          const label = labels[part] || part.charAt(0).toUpperCase() + part.slice(1);
          return (
            <React.Fragment key={path}>
              <span className="text-muted-foreground/40 mx-0.5">/</span>
              {isLast ? (
                <span className="text-foreground font-medium truncate">{label}</span>
              ) : (
                <Link href={path} className="hover:text-foreground transition-colors truncate">{label}</Link>
              )}
            </React.Fragment>
          );
        })}
      </nav>
    );
  }, [location]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !['/login', '/signup', '/forgot-password'].includes(location)) {
      setLocation("/login");
    }
  }, [isAuthenticated, isLoading, location, setLocation]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Auth pages don't get the sidebar
  if (['/login', '/signup', '/forgot-password'].includes(location)) {
    return <>{children}</>;
  }

  if (!isAuthenticated) return null;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50 dark:bg-slate-950 print:bg-white print:min-h-0 print:h-auto">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 print:block">
          <header className="h-14 flex items-center px-4 border-b bg-white dark:bg-slate-900 shrink-0 print:hidden gap-3">
            <SidebarTrigger />
            {breadcrumbs}
            <div className="flex-1" />
            <div className="flex items-center gap-3">
              <Link href="/notifications" className="relative">
                <Bell className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
              {user && (
                <div className="hidden sm:flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">{user.name}</span>
                </div>
              )}
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto print:p-0 print:overflow-visible print:block">
            <div className="mx-auto max-w-6xl print:max-w-none print:w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}