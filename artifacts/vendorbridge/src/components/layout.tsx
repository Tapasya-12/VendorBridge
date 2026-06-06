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
      <SidebarHeader className="h-20 flex items-center px-6 border-b border-sidebar-border/50">
        <div className="flex items-center gap-3 font-bold text-2xl tracking-tight">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary to-blue-600 text-white shadow-lg shadow-primary/20 shrink-0">
            VB
          </div>
          {state === "expanded" && <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 truncate">VendorBridge</span>}
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {NAV_ITEMS.map((item) => {
                const isActive = location.startsWith(item.url) && (item.url !== "/" || location === "/");
                const showBadge = item.title === "Notifications" && unreadCount > 0;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      tooltip={item.title}
                      className={`h-11 rounded-xl transition-all duration-200 group px-3 ${
                        isActive 
                          ? "!bg-primary !text-primary-foreground shadow-md shadow-primary/20 font-medium" 
                          : "text-muted-foreground hover:!bg-primary/10 hover:!text-primary hover:translate-x-1"
                      }`}
                    >
                      <Link href={item.url} data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, "-")}`}>
                        <div className="relative flex items-center justify-center">
                          <item.icon className={`w-5 h-5 ${isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary transition-colors"}`} />
                          {showBadge && (
                            <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full ring-2 ring-background">
                              {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                          )}
                        </div>
                        <span className="text-[15px]">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/50 p-4">
        {user ? (
          <div className="flex flex-col gap-4">
            {state === "expanded" && (
              <div className="flex items-center gap-3 px-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shadow-inner shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-foreground truncate">{user.name}</span>
                  <span className="text-xs text-muted-foreground capitalize truncate">{user.role.replace("_", " ")}</span>
                </div>
              </div>
            )}
            <Button 
              variant="outline" 
              className={`w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30 transition-all ${state === "collapsed" ? "px-0 justify-center" : "justify-start"}`}
              onClick={handleLogout}
              data-testid="btn-logout"
            >
              <LogOut className={`${state === "expanded" ? "mr-2" : ""} h-4 w-4`} />
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
      <div className="flex min-h-screen w-full bg-transparent print:bg-white print:min-h-0 print:h-auto">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 print:block">
          <header className="h-16 flex items-center px-6 border-b border-sidebar-border/50 bg-background/60 backdrop-blur-xl backdrop-saturate-150 shrink-0 print:hidden gap-4">
            <SidebarTrigger className="hover:bg-primary/10 hover:text-primary transition-colors" />
            <div className="h-6 w-px bg-sidebar-border/50 hidden sm:block" />
            {breadcrumbs}
            <div className="flex-1" />
            <div className="flex items-center gap-4">
              <Link href="/notifications" className="relative group">
                <div className="p-2 rounded-full hover:bg-primary/10 transition-colors">
                  <Bell className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full ring-2 ring-background">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
              {user && (
                <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-sidebar-border/50">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-semibold text-foreground">{user.name}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{user.role.replace("_", " ")}</span>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-blue-500 flex items-center justify-center text-white font-bold shadow-sm ring-2 ring-background">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
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