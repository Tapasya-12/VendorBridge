import React from "react";
import { useGetMe } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  manager: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  procurement_officer: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  vendor: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
};

export default function Settings() {
  const { user: localUser } = useAuth();
  const { data: me, isLoading } = useGetMe({ query: { enabled: true } });

  const user = me ?? localUser;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2"><Skeleton className="h-5 w-40" /><Skeleton className="h-4 w-32" /></div>
              </div>
            ) : user ? (
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
                    {user.name?.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-semibold">{user.name}</p>
                  <p className="text-muted-foreground text-sm">{user.email}</p>
                  <Badge variant="outline" className={`border-0 mt-1 capitalize text-xs ${ROLE_COLORS[user.role] ?? ""}`}>
                    {user.role?.replace("_", " ")}
                  </Badge>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No profile data.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader><CardTitle>Account Details</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : user ? (
              <dl className="space-y-4">
                <div className="flex flex-col gap-1">
                  <dt className="text-xs text-muted-foreground uppercase tracking-wider">Full Name</dt>
                  <dd className="font-medium">{user.name}</dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="text-xs text-muted-foreground uppercase tracking-wider">Email</dt>
                  <dd className="font-medium">{user.email}</dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="text-xs text-muted-foreground uppercase tracking-wider">Role</dt>
                  <dd className="font-medium capitalize">{user.role?.replace("_", " ")}</dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="text-xs text-muted-foreground uppercase tracking-wider">Status</dt>
                  <dd>
                    <Badge variant="outline" className={`border-0 text-xs ${user.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="text-xs text-muted-foreground uppercase tracking-wider">Member Since</dt>
                  <dd className="text-sm text-muted-foreground">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—"}
                  </dd>
                </div>
              </dl>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
