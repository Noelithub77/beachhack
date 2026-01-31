import { CustomerNav } from "@/components/layout/customer-nav";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen pb-20">
      <main className="mx-auto max-w-2xl px-4 py-6">{children}</main>
      <CustomerNav />
    </div>
  );
}
