import React, { useEffect } from "react";
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
import { useLogout } from "@workspace/api-client-react";
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
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Link href={item.url} data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, "-")}`}>
                        <item.icon />
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
  const { isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

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
      <div className="flex min-h-screen w-full bg-slate-50 dark:bg-slate-950">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 flex items-center px-4 border-b bg-white dark:bg-slate-900 shrink-0 print:hidden gap-4">
            <SidebarTrigger />
            <div className="flex-1" />
            {/* Header actions can go here */}
          </header>
          <main className="flex-1 p-6 overflow-auto">
            <div className="mx-auto max-w-6xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}