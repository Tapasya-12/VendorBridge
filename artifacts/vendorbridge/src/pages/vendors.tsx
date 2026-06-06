import React, { useState } from "react";
import { Link } from "wouter";
import { useListVendors } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus, Filter } from "lucide-react";
import { motion } from "framer-motion";

export default function Vendors() {
  const [search, setSearch] = useState("");
  const { data: vendors, isLoading, isError } = useListVendors({ search: search || undefined });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "inactive": return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "blacklisted": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default: return "bg-primary/10 text-primary";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vendors</h1>
          <p className="text-muted-foreground mt-1">Manage and evaluate your supplier network.</p>
        </div>
        <Link href="/vendors/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Vendor
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search vendors..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" className="w-full sm:w-auto">
          <Filter className="mr-2 h-4 w-4" /> Filter
        </Button>
      </div>

      <div className="rounded-md border border-border/50 bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Vendor Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-10" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-destructive">
                  Failed to load vendors.
                </TableCell>
              </TableRow>
            ) : vendors?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No vendors found.
                </TableCell>
              </TableRow>
            ) : (
              vendors?.map((vendor, index) => (
                <TableRow key={vendor.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-md bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase">
                        {vendor.name.substring(0, 2)}
                      </div>
                      {vendor.name}
                    </div>
                  </TableCell>
                  <TableCell>{vendor.category}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm">{vendor.email}</span>
                      {vendor.phone && <span className="text-xs text-muted-foreground">{vendor.phone}</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`border-0 ${getStatusColor(vendor.status)}`}>
                      {vendor.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{vendor.rating ? vendor.rating.toFixed(1) : "N/A"}</span>
                      {vendor.rating && <span className="text-yellow-500 text-xs">★</span>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/vendors/${vendor.id}`}>
                      <Button variant="ghost" size="sm">View</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}