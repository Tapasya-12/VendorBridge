import React, { useState } from "react";
import { useLocation } from "wouter";
import { useCreateVendor, getListVendorsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

// Check if use-toast exists or use sonner
function useToastSafe() {
  try {
    return useToast();
  } catch {
    return { toast: ({ title, description }: { title?: string; description?: string }) => console.log(title, description) };
  }
}

export default function VendorsNew() {
  const [, setLocation] = useLocation();
  const { toast } = useToastSafe();
  const queryClient = useQueryClient();
  const createVendor = useCreateVendor();

  const [form, setForm] = useState({
    name: "", email: "", phone: "", category: "", gstNumber: "",
    address: "", status: "pending", contactPerson: "", website: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.category) {
      toast({ title: "Validation Error", description: "Name, email and category are required." });
      return;
    }
    try {
      await createVendor.mutateAsync({ data: { ...form, phone: form.phone || undefined, gstNumber: form.gstNumber || undefined, address: form.address || undefined, contactPerson: form.contactPerson || undefined, website: form.website || undefined } });
      await queryClient.invalidateQueries({ queryKey: getListVendorsQueryKey() });
      toast({ title: "Vendor created", description: `${form.name} has been added.` });
      setLocation("/vendors");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create vendor";
      toast({ title: "Error", description: msg });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/vendors">
          <Button variant="ghost" size="sm" data-testid="btn-back">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Vendor</h1>
          <p className="text-muted-foreground mt-1">Register a new supplier in your network.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-border/50">
            <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Company Name *</Label>
                <Input id="name" value={form.name} onChange={e => handleChange("name", e.target.value)} placeholder="Acme Corp" data-testid="input-name" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" value={form.email} onChange={e => handleChange("email", e.target.value)} placeholder="contact@acme.com" data-testid="input-email" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={form.phone} onChange={e => handleChange("phone", e.target.value)} placeholder="+1 555 000 0000" data-testid="input-phone" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contactPerson">Contact Person</Label>
                <Input id="contactPerson" value={form.contactPerson} onChange={e => handleChange("contactPerson", e.target.value)} placeholder="John Doe" data-testid="input-contact-person" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader><CardTitle>Classification</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="category">Category *</Label>
                <Input id="category" value={form.category} onChange={e => handleChange("category", e.target.value)} placeholder="e.g. IT, Office Supplies, Logistics" data-testid="input-category" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="status">Status</Label>
                <Select value={form.status} onValueChange={v => handleChange("status", v)}>
                  <SelectTrigger data-testid="select-status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="gstNumber">GST / Tax Number</Label>
                <Input id="gstNumber" value={form.gstNumber} onChange={e => handleChange("gstNumber", e.target.value)} placeholder="GSTIN / VAT ID" data-testid="input-gst" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="website">Website</Label>
                <Input id="website" value={form.website} onChange={e => handleChange("website", e.target.value)} placeholder="https://acme.com" data-testid="input-website" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 lg:col-span-2">
            <CardHeader><CardTitle>Address</CardTitle></CardHeader>
            <CardContent>
              <Textarea value={form.address} onChange={e => handleChange("address", e.target.value)} placeholder="Street address, city, state, ZIP, country" rows={3} data-testid="textarea-address" />
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Link href="/vendors"><Button variant="outline" type="button">Cancel</Button></Link>
          <Button type="submit" disabled={createVendor.isPending} data-testid="btn-submit">
            {createVendor.isPending ? "Creating..." : "Create Vendor"}
          </Button>
        </div>
      </form>
    </div>
  );
}
