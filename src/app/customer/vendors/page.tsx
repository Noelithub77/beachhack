"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Building2,
  ArrowRight,
  Loader2,
  Search,
  Star,
  Clock,
  ArrowUpAZ,
  Filter,
  Sparkles,
  UserRound,
  ArrowLeft,
  LayoutGrid,
  List,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type SortOption = "alphabetical" | "recent" | "favorites";
type ViewMode = "grid" | "list";

export default function CustomerVendors() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mode = searchParams.get("mode") as "ai" | "human" | null;

  const vendors = useQuery(api.functions.vendors.list);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("alphabetical");
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  // Filter and sort vendors
  const filteredVendors = useMemo(() => {
    if (!vendors) return [];

    let result = vendors.filter((vendor) =>
      vendor.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort based on selected option
    switch (sortBy) {
      case "alphabetical":
        result = result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "recent":
        result = result.sort((a, b) => b.createdAt - a.createdAt);
        break;
      case "favorites":
        // For now, just keep the order (would need favorites data)
        break;
    }

    return result;
  }, [vendors, searchQuery, sortBy]);

  const handleVendorSelect = (vendorId: string) => {
    if (mode === "ai") {
      router.push(`/customer/vendors/${vendorId}?mode=ai`);
    } else if (mode === "human") {
      router.push(`/customer/vendors/${vendorId}?mode=human`);
    } else {
      router.push(`/customer/vendors/${vendorId}`);
    }
  };

  const getModeInfo = () => {
    if (mode === "ai") {
      return {
        icon: Sparkles,
        title: "Quick Help (AI)",
        description: "Select a vendor to get instant AI-powered assistance",
        color: "text-primary",
        bgColor: "bg-primary/10",
      };
    } else if (mode === "human") {
      return {
        icon: UserRound,
        title: "Talk to a Human",
        description: "Select a vendor to connect with a support representative",
        color: "text-sage-700 dark:text-sage-400",
        bgColor: "bg-sage-500/10",
      };
    }
    return null;
  };

  const modeInfo = getModeInfo();

  if (vendors === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button and Mode indicator */}
      {mode && (
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/customer/dashboard")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      )}

      {/* Header with mode info */}
      <div>
        {modeInfo ? (
          <div className="flex items-center gap-3 mb-2">
            <div className={cn("rounded-lg p-2", modeInfo.bgColor)}>
              <modeInfo.icon className={cn("h-5 w-5", modeInfo.color)} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">{modeInfo.title}</h1>
              <p className="text-muted-foreground">{modeInfo.description}</p>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-semibold">Vendors</h1>
            <p className="text-muted-foreground">
              Select a vendor to manage support
            </p>
          </>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vendors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Sort By</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSortBy("alphabetical")}>
                <ArrowUpAZ className="mr-2 h-4 w-4" />
                Alphabetical
                {sortBy === "alphabetical" && " ✓"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("recent")}>
                <Clock className="mr-2 h-4 w-4" />
                Recently Added
                {sortBy === "recent" && " ✓"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("favorites")}>
                <Star className="mr-2 h-4 w-4" />
                Favorites
                {sortBy === "favorites" && " ✓"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="rounded-r-none"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="rounded-l-none"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Vendor List/Grid */}
      {filteredVendors.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            {searchQuery ? (
              <>
                <p className="font-medium">No vendors found</p>
                <p className="text-muted-foreground text-sm">
                  Try adjusting your search terms
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">No vendors available</p>
            )}
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVendors.map((vendor) => (
            <Card
              key={vendor._id}
              className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/20 hover:scale-[1.02]"
              onClick={() => handleVendorSelect(vendor._id)}
            >
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <div className="rounded-xl bg-primary/10 p-4 mb-4">
                  <Building2
                    className="h-8 w-8 text-primary"
                    strokeWidth={1.5}
                  />
                </div>
                <p className="font-semibold text-lg">{vendor.name}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Active vendor
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredVendors.map((vendor) => (
            <Card
              key={vendor._id}
              className="cursor-pointer transition-all hover:shadow-soft hover:border-primary/20"
              onClick={() => handleVendorSelect(vendor._id)}
            >
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
          ))}
        </div>
      )}
    </div>
  );
}
