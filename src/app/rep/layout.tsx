import { RepSidebar } from "@/components/layout/rep-sidebar";

export default function RepLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <RepSidebar />
      <main className="ml-64 p-6">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
