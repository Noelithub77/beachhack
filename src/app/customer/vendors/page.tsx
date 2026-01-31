"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Tag,
  X,
  Ticket,
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { Id } from "../../../../convex/_generated/dataModel";

type SortOption = "alphabetical" | "recent" | "favorites";
type ViewMode = "grid" | "list";

export default function CustomerVendors() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const mode = searchParams.get("mode") as "ai" | "human" | null;

  // Fetch vendors with favorites if user is logged in
  const vendorsWithFavorites = useQuery(
    api.functions.vendors.listWithFavorites,
    user?.id ? { userId: user.id as Id<"users"> } : "skip",
  );
  const vendorsBasic = useQuery(
    api.functions.vendors.list,
    user?.id ? "skip" : {},
  );
  const vendors = vendorsWithFavorites ?? vendorsBasic;

  const categories = useQuery(api.functions.vendors.listCategories);
  const toggleFavorite = useMutation(api.functions.vendors.toggleFavorite);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("alphabetical");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Filter and sort vendors
  const filteredVendors = useMemo(() => {
    if (!vendors) return [];

    let result = [...vendors];

    // Filter by search query
    if (searchQuery) {
      result = result.filter(
        (vendor) =>
          vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          vendor.category?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Filter by categories
    if (selectedCategories.length > 0) {
      result = result.filter(
        (vendor) =>
          vendor.category && selectedCategories.includes(vendor.category),
      );
    }

    // Sort based on selected option
    switch (sortBy) {
      case "alphabetical":
        result = result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "recent":
        result = result.sort((a, b) => b.createdAt - a.createdAt);
        break;
      case "favorites":
        result = result.sort((a, b) => {
          const aFav = "isFavorite" in a && a.isFavorite ? 1 : 0;
          const bFav = "isFavorite" in b && b.isFavorite ? 1 : 0;
          return bFav - aFav;
        });
        break;
    }

    return result;
  }, [vendors, searchQuery, sortBy, selectedCategories]);

  const handleVendorSelect = (vendorId: string) => {
    if (mode === "ai") {
      router.push(`/customer/vendors/${vendorId}?mode=ai`);
    } else if (mode === "human") {
      router.push(`/customer/vendors/${vendorId}?mode=human`);
    } else {
      router.push(`/customer/vendors/${vendorId}`);
    }
  };

  const handleToggleFavorite = async (
    e: React.MouseEvent,
    vendorId: string,
  ) => {
    e.stopPropagation();
    if (!user?.id) return;
    await toggleFavorite({
      userId: user.id as Id<"users">,
      vendorId: vendorId as Id<"vendors">,
    });
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setSortBy("alphabetical");
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
  const hasActiveFilters =
    searchQuery || selectedCategories.length > 0 || sortBy !== "alphabetical";

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
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search vendors by name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            {/* Category Filter */}
            {categories && categories.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 shrink-0"
                  >
                    <Tag className="h-4 w-4" />
                    Category
                    {selectedCategories.length > 0 && (
                      <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                        {selectedCategories.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {categories.map((category) => (
                    <DropdownMenuCheckboxItem
                      key={category}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={() => toggleCategory(category)}
                    >
                      {category}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Sort */}
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
                  Favorites First
                  {sortBy === "favorites" && " ✓"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* View Toggle */}
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

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Filters:</span>
            {selectedCategories.map((cat) => (
              <Badge
                key={cat}
                variant="secondary"
                className="gap-1 cursor-pointer"
                onClick={() => toggleCategory(cat)}
              >
                {cat}
                <X className="h-3 w-3" />
              </Badge>
            ))}
            {sortBy !== "alphabetical" && (
              <Badge variant="outline" className="gap-1">
                Sort: {sortBy}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={clearFilters}
            >
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        {filteredVendors.length} vendor{filteredVendors.length !== 1 ? "s" : ""}{" "}
        found
      </div>

      {/* Vendor List/Grid */}
      {filteredVendors.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            {searchQuery || selectedCategories.length > 0 ? (
              <>
                <p className="font-medium">No vendors found</p>
                <p className="text-muted-foreground text-sm">
                  Try adjusting your search or filters
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
              </>
            ) : (
              <p className="text-muted-foreground">No vendors available</p>
            )}
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVendors.map((vendor) => {
            const isFavorite = "isFavorite" in vendor && vendor.isFavorite;
            return (
              <Card
                key={vendor._id}
                className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/20 hover:scale-[1.02] relative group"
                onClick={() => handleVendorSelect(vendor._id)}
              >
                {/* Favorite button */}
                {user?.id && (
                  <button
                    className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-muted transition-colors z-10"
                    onClick={(e) => handleToggleFavorite(e, vendor._id)}
                  >
                    <Star
                      className={cn(
                        "h-4 w-4 transition-colors",
                        isFavorite
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground group-hover:text-foreground",
                      )}
                    />
                  </button>
                )}
                <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                  <div className="rounded-xl bg-primary/10 p-4 mb-4">
                    <Building2
                      className="h-8 w-8 text-primary"
                      strokeWidth={1.5}
                    />
                  </div>
                  <p className="font-semibold text-lg">{vendor.name}</p>
                  {vendor.category && (
                    <Badge variant="outline" className="mt-2">
                      {vendor.category}
                    </Badge>
                  )}
                  <p className="text-sm text-muted-foreground mt-2">
                    Active vendor
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredVendors.map((vendor) => {
            const isFavorite = "isFavorite" in vendor && vendor.isFavorite;
            return (
              <Card
                key={vendor._id}
                className="cursor-pointer transition-all hover:shadow-soft hover:border-primary/20 group"
                onClick={() => handleVendorSelect(vendor._id)}
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="rounded-lg bg-primary/10 p-2.5 shrink-0">
                      <Building2
                        className="h-5 w-5 text-primary"
                        strokeWidth={1.5}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{vendor.name}</p>
                        {isFavorite && (
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {vendor.category && (
                          <Badge variant="outline" className="text-xs">
                            {vendor.category}
                          </Badge>
                        )}
                        <span className="text-sm text-muted-foreground">
                          Active vendor
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {user?.id && (
                      <button
                        className="p-1.5 rounded-full hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
                        onClick={(e) => handleToggleFavorite(e, vendor._id)}
                      >
                        <Star
                          className={cn(
                            "h-4 w-4",
                            isFavorite
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground",
                          )}
                        />
                      </button>
                    )}
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
