import { Loader2 } from "lucide-react";

export default function TicketDetailLoading() {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}
