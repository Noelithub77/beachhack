# COCO - Context Oriented Customer Ops

A context-aware, multi-vendor customer support platform where every interaction contributes to a single, continuous support journey with zero context loss.

## Tech Stack

| Layer     | Technology                            |
| --------- | ------------------------------------- |
| Framework | Next.js 16 (App Router)               |
| Database  | Convex (real-time)                    |
| Auth      | Email/Password with role-based access |
| State     | Zustand                               |
| AI/Agent  | Vercel AI SDK + Google Gemini         |
| Voice     | Twilio (WebRTC) + ElevenLabs          |
| Email     | Resend                                |
| Analytics | Tremor                                |
| UI        | shadcn/ui + Tailwind v4               |

---

## File Structure

```
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx                    # Root layout with providers
│   ├── page.tsx                      # Landing/login redirect
│   ├── login/
│   │   └── page.tsx                  # Login page
│   │
│   ├── customer/                     # Customer routes
│   │   ├── layout.tsx                # Customer layout with bottom nav
│   │   ├── dashboard/
│   │   │   ├── page.tsx
│   │   │   └── components/
│   │   │       ├── active-tickets.tsx
│   │   │       ├── vendor-selector.tsx
│   │   │       └── quick-stats.tsx
│   │   ├── tickets/
│   │   │   ├── page.tsx              # All tickets list
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx          # Ticket detail
│   │   │   ├── new/
│   │   │   │   └── page.tsx          # Create ticket
│   │   │   └── components/
│   │   │       ├── ticket-card.tsx
│   │   │       ├── ticket-status.tsx
│   │   │       └── chat-interface.tsx
│   │   ├── help/
│   │   │   ├── page.tsx              # Help options (chat/call/email/docs)
│   │   │   ├── chat/
│   │   │   │   └── page.tsx          # AI chat (SAGE)
│   │   │   ├── call/
│   │   │   │   └── page.tsx          # Voice call
│   │   │   └── components/
│   │   │       ├── help-option-card.tsx
│   │   │       ├── ai-chat.tsx
│   │   │       └── call-interface.tsx
│   │   ├── vendors/
│   │   │   ├── page.tsx
│   │   │   └── components/
│   │   │       └── vendor-card.tsx
│   │   ├── history/
│   │   │   └── page.tsx
│   │   └── profile/
│   │       ├── page.tsx
│   │       └── components/
│   │           ├── settings-form.tsx
│   │           └── privacy-controls.tsx
│   │
│   ├── rep/                          # Representative routes
│   │   ├── layout.tsx                # Rep layout with sidebar
│   │   ├── inbox/
│   │   │   ├── page.tsx              # Unified inbox
│   │   │   ├── [ticketId]/
│   │   │   │   └── page.tsx          # Ticket handling view
│   │   │   └── components/
│   │   │       ├── ticket-list.tsx
│   │   │       ├── ticket-filters.tsx
│   │   │       ├── context-panel.tsx
│   │   │       ├── customer-profile.tsx
│   │   │       ├── ai-summary.tsx
│   │   │       ├── suggested-actions.tsx
│   │   │       └── handoff-dialog.tsx
│   │   ├── calendar/
│   │   │   ├── page.tsx
│   │   │   └── components/
│   │   │       ├── calendar-view.tsx
│   │   │       └── shift-card.tsx
│   │   ├── tasks/
│   │   │   ├── page.tsx
│   │   │   └── components/
│   │   │       └── task-list.tsx
│   │   ├── analytics/
│   │   │   ├── page.tsx
│   │   │   └── components/
│   │   │       ├── personal-stats.tsx
│   │   │       └── performance-chart.tsx
│   │   └── team/                     # Only for managers
│   │       ├── page.tsx
│   │       └── components/
│   │           └── employee-card.tsx
│   │
│   ├── admin/                        # Admin routes
│   │   ├── layout.tsx                # Admin layout with sidebar
│   │   ├── dashboard/
│   │   │   ├── page.tsx
│   │   │   └── components/
│   │   │       ├── system-overview.tsx
│   │   │       └── quick-actions.tsx
│   │   ├── analytics/
│   │   │   ├── page.tsx
│   │   │   └── components/
│   │   │       ├── company-metrics.tsx
│   │   │       ├── level-breakdown.tsx
│   │   │       ├── sentiment-chart.tsx
│   │   │       └── trend-analysis.tsx
│   │   ├── employees/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   └── components/
│   │   │       ├── employee-table.tsx
│   │   │       ├── performance-card.tsx
│   │   │       └── role-manager.tsx
│   │   ├── calendar/
│   │   │   ├── page.tsx
│   │   │   └── components/
│   │   │       └── shift-scheduler.tsx
│   │   ├── tasks/
│   │   │   ├── page.tsx
│   │   │   └── components/
│   │   │       ├── task-creator.tsx
│   │   │       └── task-assign.tsx
│   │   ├── vendors/
│   │   │   ├── page.tsx
│   │   │   └── components/
│   │   │       └── vendor-manager.tsx
│   │   └── settings/
│   │       └── page.tsx
│   │
│   └── api/
│       ├── ai/
│       │   └── chat/
│       │       └── route.ts          # Gemini streaming endpoint
│       ├── voice/
│       │   ├── token/
│       │   │   └── route.ts          # Twilio access token
│       │   └── webhook/
│       │       └── route.ts          # Twilio webhooks
│       └── email/
│           └── send/
│               └── route.ts          # Resend email endpoint
│
├── components/
│   ├── ui/                           # shadcn components (existing)
│   ├── call/
│   │   ├── call-overlay.tsx          # iOS-style call overlay
│   │   ├── call-controls.tsx         # Mute, speaker, end
│   │   ├── call-timer.tsx
│   │   ├── call-avatar.tsx
│   │   └── transcription-panel.tsx
│   ├── chat/
│   │   ├── message-bubble.tsx
│   │   ├── message-list.tsx
│   │   ├── chat-input.tsx
│   │   └── typing-indicator.tsx
│   ├── layout/
│   │   ├── customer-nav.tsx          # Bottom nav for customers
│   │   ├── rep-sidebar.tsx           # Sidebar for reps
│   │   ├── admin-sidebar.tsx         # Sidebar for admins
│   │   └── header.tsx
│   ├── tickets/
│   │   ├── ticket-badge.tsx
│   │   ├── ticket-timeline.tsx
│   │   ├── priority-indicator.tsx
│   │   └── channel-icon.tsx
│   └── shared/
│       ├── loading-spinner.tsx
│       ├── empty-state.tsx
│       ├── error-boundary.tsx
│       └── avatar-with-status.tsx
│
├── lib/
│   ├── utils.ts                      # Utility functions
│   ├── auth.ts                       # Auth helpers
│   ├── ai.ts                         # Gemini client setup
│   ├── twilio.ts                     # Twilio client
│   ├── resend.ts                     # Resend client
│   └── constants.ts                  # App constants
│
├── stores/
│   ├── auth-store.ts                 # User session & role
│   ├── vendor-store.ts               # Selected vendor context
│   ├── ticket-store.ts               # Current ticket state
│   ├── call-store.ts                 # Active call state
│   └── ui-store.ts                   # UI state (modals, etc.)
│
├── hooks/
│   ├── use-auth.ts
│   ├── use-ticket.ts
│   ├── use-call.ts
│   ├── use-chat.ts
│   └── use-realtime.ts
│
└── types/
    ├── ticket.ts
    ├── user.ts
    ├── vendor.ts
    ├── call.ts
    └── index.ts

convex/
├── schema.ts                         # Database schema
├── auth.ts                           # Auth functions
├── users.ts                          # User CRUD
├── vendors.ts                        # Vendor operations
├── tickets.ts                        # Ticket lifecycle
├── conversations.ts                  # Chat/email threads
├── calls.ts                          # Call sessions
├── context.ts                        # AI context summaries
├── queues.ts                         # Ticket routing
├── tasks.ts                          # Internal tasks
├── calendar.ts                       # Events/scheduling
├── feedback.ts                       # Ratings
├── analytics.ts                      # Aggregations
└── seed.ts                           # Seed data function

scripts/
└── seed.ts                           # Run seed via CLI
```

---

## Convex Schema Design

```typescript
// convex/schema.ts

// Enums as union types
const ticketStatus = v.union(
  v.literal("created"),
  v.literal("intake_in_progress"),
  v.literal("waiting_for_agent"),
  v.literal("assigned"),
  v.literal("in_progress"),
  v.literal("reassigned"),
  v.literal("escalated"),
  v.literal("resolved"),
  v.literal("closed"),
  v.literal("reopened")
);

const channel = v.union(
  v.literal("chat"),
  v.literal("call"),
  v.literal("email"),
  v.literal("docs")
);

const userRole = v.union(
  v.literal("customer"),
  v.literal("rep_l1"),
  v.literal("rep_l2"),
  v.literal("rep_l3"),
  v.literal("admin_manager"),
  v.literal("admin_senior"),
  v.literal("admin_super")
);

// Tables
users: defineTable({
  email: v.string(),
  passwordHash: v.string(),
  name: v.string(),
  role: userRole,
  vendorId: v.optional(v.id("vendors")),  // For reps/admins
  language: v.string(),
  isActive: v.boolean(),
  createdAt: v.number(),
})

vendors: defineTable({
  name: v.string(),
  logoStorageId: v.optional(v.id("_storage")),
  primaryColor: v.optional(v.string()),
  isActive: v.boolean(),
})

tickets: defineTable({
  customerId: v.id("users"),
  vendorId: v.id("vendors"),
  assignedRepId: v.optional(v.id("users")),
  status: ticketStatus,
  channel: channel,
  priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent")),
  subject: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
  resolvedAt: v.optional(v.number()),
  closedAt: v.optional(v.number()),
})

conversations: defineTable({
  ticketId: v.id("tickets"),
  channel: channel,
  createdAt: v.number(),
})

messages: defineTable({
  conversationId: v.id("conversations"),
  senderId: v.id("users"),
  senderType: v.union(v.literal("customer"), v.literal("rep"), v.literal("ai")),
  content: v.string(),
  createdAt: v.number(),
})

callSessions: defineTable({
  ticketId: v.id("tickets"),
  callerId: v.id("users"),
  receiverId: v.optional(v.id("users")),
  twilioSid: v.optional(v.string()),
  status: v.union(v.literal("ringing"), v.literal("in_progress"), v.literal("ended")),
  startedAt: v.number(),
  endedAt: v.optional(v.number()),
  recordingUrl: v.optional(v.string()),
})

transcripts: defineTable({
  callSessionId: v.id("callSessions"),
  speakerId: v.id("users"),
  text: v.string(),
  timestamp: v.number(),
})

contextSummaries: defineTable({
  ticketId: v.id("tickets"),
  summary: v.string(),           // AI-generated summary
  confirmedFacts: v.array(v.string()),
  inferredSignals: v.array(v.string()),
  unknowns: v.array(v.string()),
  actionsTaken: v.array(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
})

queues: defineTable({
  vendorId: v.id("vendors"),
  ticketId: v.id("tickets"),
  priority: v.number(),
  enteredAt: v.number(),
  estimatedWaitMinutes: v.optional(v.number()),
})

feedback: defineTable({
  ticketId: v.id("tickets"),
  customerId: v.id("users"),
  rating: v.number(),  // 1-5
  comment: v.optional(v.string()),
  createdAt: v.number(),
})

tasks: defineTable({
  vendorId: v.id("vendors"),
  assigneeId: v.id("users"),
  createdById: v.id("users"),
  title: v.string(),
  description: v.optional(v.string()),
  status: v.union(v.literal("pending"), v.literal("in_progress"), v.literal("completed")),
  dueAt: v.optional(v.number()),
  createdAt: v.number(),
})

calendarEvents: defineTable({
  vendorId: v.id("vendors"),
  userId: v.id("users"),
  title: v.string(),
  type: v.union(v.literal("shift"), v.literal("meeting"), v.literal("other")),
  startAt: v.number(),
  endAt: v.number(),
})
```

---

## Seed Credentials

| Role          | Email                  | Password |
| ------------- | ---------------------- | -------- |
| Customer      | customer@coco.com      | password |
| Rep L1        | rep.l1@coco.com        | password |
| Rep L2        | rep.l2@coco.com        | password |
| Rep L3        | rep.l3@coco.com        | password |
| Admin Manager | admin.manager@coco.com | password |
| Admin Senior  | admin.senior@coco.com  | password |
| Super Admin   | super@coco.com         | password |

---

## Implementation Phases

### Phase 1: Foundation (Days 1-2)
1. Remove existing restaurant schema
2. Create new Convex schema
3. Implement auth with email/password
4. Create seed function
5. Set up Zustand stores
6. Create base layouts for all route groups

### Phase 2: Core UI & Routing (Days 2-3)
1. Build customer bottom nav and dashboard
2. Build rep sidebar and inbox
3. Build admin sidebar and dashboard
4. Create shared components (ticket cards, avatars, etc.)

### Phase 3: Ticket System (Days 3-4)
1. Ticket CRUD operations in Convex
2. Ticket list and detail views
3. Status transitions and lifecycle
4. Queue management
5. Assignment and escalation flows

### Phase 4: AI Chat (SAGE) (Days 4-5)
1. Set up Vercel AI SDK with Gemini
2. Create streaming chat API route
3. Build AI chat interface
4. Implement context extraction
5. Build handoff summary generation

### Phase 5: Voice/Call (Days 5-6)
1. Set up Twilio WebRTC
2. Create iOS-style call overlay
3. Integrate ElevenLabs for voice AI
4. Implement live transcription
5. Store call sessions and transcripts

### Phase 6: Email & Final Features (Days 6-7)
1. Set up Resend
2. Create email templates
3. Build Tremor analytics dashboards
4. Add calendar and task management
5. Implement privacy controls

---

## API Routes

### AI Chat Streaming
```
POST /api/ai/chat
Body: { ticketId, message, history }
Response: ReadableStream (Gemini streaming)
```

### Twilio Token
```
POST /api/voice/token
Body: { userId }
Response: { token, identity }
```

### Email Send
```
POST /api/email/send
Body: { to, subject, template, data }
Response: { success, messageId }
```

---

## Key Dependencies to Add

```bash
pnpm add ai @ai-sdk/google          # Vercel AI SDK + Gemini
pnpm add @tremor/react              # Analytics charts
pnpm add twilio                     # Voice/WebRTC
pnpm add resend                     # Email
pnpm add bcryptjs                   # Password hashing
pnpm add @types/bcryptjs -D
```

---

## Verification Plan

### Automated Tests
1. Auth flow: login → role detection → correct dashboard
2. Ticket lifecycle: create → assign → resolve → close
3. AI chat: message → stream response → context extraction
4. Real-time updates: Convex subscriptions working

### Manual Testing
1. Log in with each seeded credential, verify correct UI
2. Create ticket as customer, accept as rep
3. Test call interface with iOS-style overlay
4. Verify analytics dashboards render correctly
