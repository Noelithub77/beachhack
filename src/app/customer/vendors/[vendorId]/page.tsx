import { preloadQuery } from "convex/nextjs";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { VendorDetailClient } from "./vendor-detail-client";

interface PageProps {
  params: Promise<{ vendorId: string }>;
  searchParams: Promise<{ mode?: "ai" | "human" }>;
}

export default async function VendorDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { vendorId } = await params;
  const { mode } = await searchParams;

  const preloadedVendor = await preloadQuery(api.functions.vendors.getWithStats, {
    vendorId: vendorId as Id<"vendors">,
  });

  return (
    <VendorDetailClient
      vendorId={vendorId}
      mode={mode}
      preloadedVendor={preloadedVendor}
    />
  );
}
