"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Building2, MoreHorizontal } from "lucide-react";

const vendors = [
  {
    id: 1,
    name: "Acme Corporation",
    activeTickets: 45,
    totalTickets: 1234,
    status: "active",
  },
  {
    id: 2,
    name: "TechStart Inc",
    activeTickets: 23,
    totalTickets: 567,
    status: "active",
  },
  {
    id: 3,
    name: "Global Services",
    activeTickets: 67,
    totalTickets: 2341,
    status: "active",
  },
  {
    id: 4,
    name: "Beta Company",
    activeTickets: 0,
    totalTickets: 89,
    status: "inactive",
  },
];

export default function AdminVendors() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Vendors</h1>
          <p className="text-muted-foreground">Manage supported vendors</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Vendor
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search vendors..." className="pl-9" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {vendors.map((vendor) => (
          <Card key={vendor.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2.5">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{vendor.name}</p>
                    <Badge
                      variant={
                        vendor.status === "active" ? "default" : "secondary"
                      }
                      className="mt-1"
                    >
                      {vendor.status}
                    </Badge>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Active</p>
                  <p className="font-medium">{vendor.activeTickets}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total</p>
                  <p className="font-medium">
                    {vendor.totalTickets.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
