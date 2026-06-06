import React, { useState } from "react";
import { useLocation } from "wouter";
import { useCreateRfq, useListVendors, getListRfqsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Trash2, X, Search } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { SuccessAnimation } from "@/components/ui/success-animation";

function useToastSafe() {
  try { return useToast(); }
  catch { return { toast: ({ title, description }: { title?: string; description?: string }) => console.log(title, description) }; }
}

interface LineItem { productName: string; description: string; quantity: string; unit: string; }

export default function RfqsNew() {
  const [, setLocation] = useLocation();
  const { toast } = useToastSafe();
  const queryClient = useQueryClient();
  const createRfq = useCreateRfq();
  const { data: vendors } = useListVendors();

  const [form, setForm] = useState({ title: "", description: "", deadline: "" });
  const [selectedVendors, setSelectedVendors] = useState<number[]>([]);
  const [vendorSearch, setVendorSearch] = useState("");
  const [items, setItems] = useState<LineItem[]>([{ productName: "", description: "", quantity: "1", unit: "pcs" }]);
  const [showSuccess, setShowSuccess] = useState(false);

  const toggleVendor = (id: number) => {
    setSelectedVendors(prev => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]);
  };

  const addItem = () => setItems(prev => [...prev, { productName: "", description: "", quantity: "1", unit: "pcs" }]);
  const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));
  const updateItem = (idx: number, field: keyof LineItem, value: string) => {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) { toast({ title: "Validation Error", description: "Title is required." }); return; }
    const validItems = items.filter(i => i.productName.trim());
    try {
      await createRfq.mutateAsync({
        data: {
          title: form.title,
          description: form.description || undefined,
          deadline: form.deadline || undefined,
          vendorIds: selectedVendors,
          items: validItems.map(i => ({ productName: i.productName, description: i.description || undefined, quantity: parseFloat(i.quantity) || 1, unit: i.unit || undefined })),
        }
      });
      await queryClient.invalidateQueries({ queryKey: getListRfqsQueryKey() });
      setShowSuccess(true);
      toast({ title: "RFQ created", description: `${form.title} has been created.` });
      setTimeout(() => {
        setLocation("/rfqs");
      }, 1500);
    } catch (err: unknown) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed to create RFQ" });
    }
  };

  return (
    <div className="space-y-6">
      {showSuccess ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <SuccessAnimation size="lg" text="RFQ Created Successfully!" variant="bounce" />
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4">
            <Link href="/rfqs"><Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button></Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Create RFQ</h1>
              <p className="text-muted-foreground mt-1">Send requests for quotation to your vendors.</p>
            </div>
          </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-border/50">
          <CardHeader><CardTitle>RFQ Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Q3 Office Supplies" data-testid="input-title" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Provide context for vendors..." rows={3} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="deadline">Deadline</Label>
              <Input id="deadline" type="date" value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} data-testid="input-deadline" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Line Items</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addItem}><Plus className="mr-2 h-4 w-4" /> Add Item</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-3 items-start p-3 rounded-lg bg-muted/30">
                <div className="col-span-4 space-y-1.5">
                  <Label>Product Name *</Label>
                  <Input value={item.productName} onChange={e => updateItem(idx, "productName", e.target.value)} placeholder="Laptop" />
                </div>
                <div className="col-span-3 space-y-1.5">
                  <Label>Description</Label>
                  <Input value={item.description} onChange={e => updateItem(idx, "description", e.target.value)} placeholder="15-inch, 16GB RAM" />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Qty</Label>
                  <Input type="number" value={item.quantity} onChange={e => updateItem(idx, "quantity", e.target.value)} min="1" />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Unit</Label>
                  <Input value={item.unit} onChange={e => updateItem(idx, "unit", e.target.value)} placeholder="pcs" />
                </div>
                <div className="col-span-1 pt-7">
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(idx)} disabled={items.length === 1}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader><CardTitle>Select Vendors ({selectedVendors.length} selected)</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {vendors?.length ? (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search vendors..."
                    className="pl-9"
                    value={vendorSearch}
                    onChange={(e) => setVendorSearch(e.target.value)}
                  />
                </div>
                {selectedVendors.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedVendors.map(id => {
                      const v = vendors.find(v => v.id === id);
                      return v ? (
                        <Badge key={id} variant="secondary" className="gap-1 pr-1">
                          {v.name}
                          <button onClick={() => toggleVendor(id)} className="ml-1 hover:text-destructive">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}
                <div className="max-h-48 overflow-y-auto space-y-1 rounded-lg border border-border/50 p-1">
                  {vendors
                    .filter(v => v.name.toLowerCase().includes(vendorSearch.toLowerCase()) || v.category?.toLowerCase().includes(vendorSearch.toLowerCase()))
                    .map(v => {
                      const isSelected = selectedVendors.includes(v.id);
                      return (
                        <div
                          key={v.id}
                          onClick={() => toggleVendor(v.id)}
                          className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors ${
                            isSelected ? "bg-primary/10 text-primary" : "hover:bg-muted/50"
                          }`}
                        >
                          <div>
                            <p className="text-sm font-medium">{v.name}</p>
                            <p className="text-xs text-muted-foreground">{v.category}</p>
                          </div>
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            isSelected ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30"
                          }`}>
                            {isSelected && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                          </div>
                        </div>
                      );
                    })}
                  {vendors.filter(v => v.name.toLowerCase().includes(vendorSearch.toLowerCase())).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-3">No vendors match your search.</p>
                  )}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No vendors available. <Link href="/vendors/new"><span className="text-primary underline cursor-pointer">Add vendors</span></Link> first.</p>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Link href="/rfqs"><Button variant="outline" type="button">Cancel</Button></Link>
          <Button type="submit" disabled={createRfq.isPending} data-testid="btn-submit">
            {createRfq.isPending ? (
              <span className="flex items-center gap-2">
                <LoadingSpinner size="sm" />
                Creating...
              </span>
            ) : (
              "Create RFQ"
            )}
          </Button>
        </div>
      </form>
        </>
      )}
    </div>
  );
}
