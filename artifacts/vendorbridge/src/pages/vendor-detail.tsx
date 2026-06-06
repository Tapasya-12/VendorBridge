import React, { useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useGetVendor, useUpdateVendor, useDeleteVendor, getListVendorsQueryKey, getGetVendorQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ArrowLeft, Edit2, Trash2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function useToastSafe() {
  try { return useToast(); }
  catch { return { toast: ({ title, description }: { title?: string; description?: string }) => console.log(title, description) }; }
}

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-700",
  pending: "bg-yellow-100 text-yellow-800",
  blacklisted: "bg-red-100 text-red-800",
};

export default function VendorDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToastSafe();
  const queryClient = useQueryClient();
  const vendorId = parseInt(id ?? "0", 10);

  const { data: vendor, isLoading, isError } = useGetVendor(vendorId, { query: { enabled: !!vendorId, queryKey: getGetVendorQueryKey(vendorId) } });
  const updateVendor = useUpdateVendor();
  const deleteVendor = useDeleteVendor();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", category: "", gstNumber: "", address: "", status: "", contactPerson: "", website: "" });

  React.useEffect(() => {
    if (vendor) {
      setForm({
        name: vendor.name ?? "", email: vendor.email ?? "", phone: vendor.phone ?? "",
        category: vendor.category ?? "", gstNumber: vendor.gstNumber ?? "", address: vendor.address ?? "",
        status: vendor.status ?? "", contactPerson: vendor.contactPerson ?? "", website: vendor.website ?? "",
      });
    }
  }, [vendor]);

  const handleSave = async () => {
    try {
      await updateVendor.mutateAsync({ id: vendorId, data: { ...form, phone: form.phone || undefined, gstNumber: form.gstNumber || undefined } });
      await queryClient.invalidateQueries({ queryKey: getGetVendorQueryKey(vendorId) });
      await queryClient.invalidateQueries({ queryKey: getListVendorsQueryKey() });
      setEditing(false);
      toast({ title: "Vendor updated", description: "Changes saved successfully." });
    } catch {
      toast({ title: "Error", description: "Failed to update vendor." });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteVendor.mutateAsync({ id: vendorId });
      await queryClient.invalidateQueries({ queryKey: getListVendorsQueryKey() });
      toast({ title: "Vendor deleted" });
      setLocation("/vendors");
    } catch {
      toast({ title: "Error", description: "Failed to delete vendor." });
    }
  };

  if (isLoading) return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-6 lg:grid-cols-2">
        {[0,1].map(i => <Card key={i} className="border-border/50"><CardContent className="pt-6 space-y-4">{Array.from({length:4}).map((_,j) => <Skeleton key={j} className="h-10 w-full" />)}</CardContent></Card>)}
      </div>
    </div>
  );

  if (isError || !vendor) return (
    <div className="space-y-4">
      <Link href="/vendors"><Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button></Link>
      <p className="text-destructive">Vendor not found.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/vendors"><Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button></Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{vendor.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={`border-0 capitalize ${STATUS_COLORS[vendor.status] ?? ""}`}>{vendor.status}</Badge>
              <span className="text-muted-foreground text-sm">{vendor.category}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <Button variant="outline" onClick={() => setEditing(false)}><X className="mr-2 h-4 w-4" /> Cancel</Button>
              <Button onClick={handleSave} disabled={updateVendor.isPending}><Save className="mr-2 h-4 w-4" /> {updateVendor.isPending ? "Saving..." : "Save"}</Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setEditing(true)} data-testid="btn-edit"><Edit2 className="mr-2 h-4 w-4" /> Edit</Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" data-testid="btn-delete"><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete vendor?</AlertDialogTitle>
                    <AlertDialogDescription>This will permanently remove {vendor.name} from your system.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {["name","email","phone","contactPerson"].map(field => (
              <div key={field} className="space-y-1.5">
                <Label className="capitalize">{field.replace(/([A-Z])/g, " $1")}</Label>
                {editing
                  ? <Input value={form[field as keyof typeof form]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))} />
                  : <p className="text-sm py-2 px-3 rounded-md bg-muted/40">{vendor[field as keyof typeof vendor] as string || "—"}</p>
                }
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader><CardTitle>Classification</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Category</Label>
              {editing ? <Input value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} /> : <p className="text-sm py-2 px-3 rounded-md bg-muted/40">{vendor.category || "—"}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              {editing ? (
                <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="blacklisted">Blacklisted</SelectItem>
                  </SelectContent>
                </Select>
              ) : <p className="text-sm py-2 px-3 rounded-md bg-muted/40 capitalize">{vendor.status || "—"}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>GST Number</Label>
              {editing ? <Input value={form.gstNumber} onChange={e => setForm(p => ({ ...p, gstNumber: e.target.value }))} /> : <p className="text-sm py-2 px-3 rounded-md bg-muted/40">{vendor.gstNumber || "—"}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Website</Label>
              {editing ? <Input value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))} /> : (vendor.website ? <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline py-2 px-3 block rounded-md bg-muted/40">{vendor.website}</a> : <p className="text-sm py-2 px-3 rounded-md bg-muted/40">—</p>)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 lg:col-span-2">
          <CardHeader><CardTitle>Address</CardTitle></CardHeader>
          <CardContent>
            {editing
              ? <Textarea value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} rows={3} />
              : <p className="text-sm py-2 px-3 rounded-md bg-muted/40 whitespace-pre-wrap">{vendor.address || "No address recorded."}</p>
            }
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
