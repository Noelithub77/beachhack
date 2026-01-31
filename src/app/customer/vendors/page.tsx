"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Building2, ArrowRight } from "lucide-react";
import Link from "next/link";

const mockVendors = [
  { id: "v1", name: "Acme Corporation", activeTickets: 2 },
  { id: "v2", name: "TechStart Inc", activeTickets: 0 },
  { id: "v3", name: "Global Services", activeTickets: 1 },
];

export default function CustomerVendors() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Vendors</h1>
        <p className="text-muted-foreground">
          Select a vendor to manage support
        </p>
      </div>

      <div className="space-y-3">
        {mockVendors.map((vendor) => (
          <Link
            key={vendor.id}
            href={`/customer/dashboard?vendor=${vendor.id}`}
          >
            <Card className="cursor-pointer transition-all hover:shadow-soft hover:border-primary/20">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2.5">
                    <Building2
                      className="h-5 w-5 text-primary"
                      strokeWidth={1.5}
                    />
                  </div>
                  <div>
                    <p className="font-medium">{vendor.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {vendor.activeTickets > 0
                        ? `${vendor.activeTickets} active ticket${vendor.activeTickets > 1 ? "s" : ""}`
                        : "No active tickets"}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
