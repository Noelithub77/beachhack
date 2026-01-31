const statusConfig: Record<string, { label: string; className: string }> = {
  created: { label: "Created", className: "bg-muted text-muted-foreground" },
  intake_in_progress: {
    label: "Intake",
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  waiting_for_agent: { label: "Waiting", className: "bg-sand/20 text-earth" },
  assigned: { label: "Assigned", className: "bg-primary/10 text-primary" },
  in_progress: {
    label: "In Progress",
    className: "bg-primary/10 text-primary",
  },
  reassigned: {
    label: "Reassigned",
    className:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  },
  escalated: {
    label: "Escalated",
    className:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  },
  resolved: {
    label: "Resolved",
    className: "bg-sage-500/20 text-sage-900 dark:text-sage-400",
  },
  closed: { label: "Closed", className: "bg-muted text-muted-foreground" },
  reopened: {
    label: "Reopened",
    className: "bg-destructive/10 text-destructive",
  },
};

export type TicketStatus = keyof typeof statusConfig;

interface TicketStatusBadgeProps {
  status: TicketStatus;
}

export function TicketStatusBadge({ status }: TicketStatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.created;
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
