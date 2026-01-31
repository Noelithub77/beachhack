"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

export default function CustomerVendors() {
  const vendors = useQuery(api.functions.vendors.list);

  if (vendors === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Vendors</h1>
        <p className="text-muted-foreground">
          Select a vendor to manage support
        </p>
      </div>

      {vendors.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No vendors available</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {vendors.map((vendor) => (
            <Link
              key={vendor._id}
              href={`/customer/dashboard?vendor=${vendor._id}`}
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
                        Active vendor
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
