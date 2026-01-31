# COCO - Context Oriented Customer Ops

A context-aware, multi-vendor customer support platform where every interaction contributes to a single, continuous support journey with zero context loss.

## Project Overview

COCO is a multi-tenant customer support platform built for hackathons. It enables customers to interact with multiple vendors through a single interface, with AI-powered context preservation across all interactions.

**Core Value Proposition**: Zero context loss between channels (chat, call, email, docs) and vendors. Every conversation contributes to a unified customer history.

## Tech Stack

| Layer     | Technology                            |
| --------- | ------------------------------------- |
| Framework | Next.js 16 (App Router)               |
| Database  | Convex (real-time)                    |
| Auth      | Email/Password with role-based access |
| State     | Zustand                               |
| AI/Agent  | Vercel AI SDK + Google Gemini 2.5     |
| Voice     | Twilio (WebRTC) + ElevenLabs          |
| Email     | Resend                                |
| UI        | shadcn/ui + Tailwind v4               |
| Icons     | Lucide React                          |

---

## Architecture Overview

### Core Concepts

1. **Multi-Tenancy**: Multiple vendors share a single platform with isolated data
2. **Role-Based Access**: 7 user roles with hierarchical permissions
3. **Context Preservation**: AI maintains conversation context across all channels
4. **Real-Time Sync**: Convex provides instant data synchronization
5. **Zero Context Loss**: Every interaction contributes to unified customer history

### User Roles

| Role          | Description               | Access Level |
| ------------- | ------------------------- | ------------ |
| customer      | End users seeking support | Basic        |
| rep_l1        | Level 1 support reps      | Standard     |
| rep_l2        | Level 2 support reps      | Advanced     |
| rep_l3        | Level 3 senior reps       | Senior       |
| admin_manager | Vendor managers           | Admin        |
| admin_senior  | Senior admins             | Senior Admin |
| admin_super   | Super admins              | Full Access  |

### Key Flows

#### 1. Authentication Flow
```
User → Login page → Convex auth.login() → Set user in Zustand → Redirect to role dashboard
```
- Login: `src/app/login/page.tsx`
- Auth logic: `convex/functions/auth.ts`
- State: `src/stores/auth-store.ts`

#### 2. Ticket Creation Flow
```
Customer fills intake form → Convex tickets.createFromIntake() → Auto-routing → Queue → Rep assignment
```
- Intake: `src/app/customer/tickets/new/page.tsx`
- Backend: `convex/functions/tickets.ts` (createFromIntake)
- Queue: `convex/functions/queues.ts`

#### 3. AI Chat Flow
```
User message → API route → Gemini 2.5 → Stream response → Update conversation
```
- Chat UI: `src/app/customer/help/chat/page.tsx`
- API: `src/app/api/ai/` (handoff, summarize)
- Messages: `convex/functions/messages.ts`

#### 4. Voice Call Flow
```
Initiate call → Twilio token → WebRTC connection → ElevenLabs TTS → Store transcript
```
- Voice UI: `src/components/call/`
- API: `src/app/api/voice/`
- Call state: `src/stores/call-store.ts`
- Hook: `src/hooks/use-elevenlabs-conversation.ts`

---

## File Structure

```
src/
├── app/
│   ├── (landing)/                    # Public landing pages
│   ├── ConvexClientProvider.tsx      # Convex client setup
│   ├── globals.css                   # Global styles
│   ├── layout.tsx                    # Root layout with providers
│   ├── login/
│   │   └── page.tsx                  # Login page
│   │
│   ├── customer/                     # Customer routes (role: customer)
│   │   ├── layout.tsx                # Customer layout with sidebar/bottom-nav
│   │   ├── dashboard/                # Customer dashboard
│   │   ├── help/                     # Help options (chat, call, email, docs)
│   │   │   ├── chat/                 # AI chat interface (SAGE)
│   │   │   └── page.tsx              # Help options selection
│   │   ├── history/                  # Ticket history
│   │   ├── memory/                   # AI memory/context view
│   │   ├── profile/                  # User profile & settings
│   │   ├── tickets/                  # Ticket management
│   │   │   ├── new/                  # Create ticket (intake form)
│   │   │   └── page.tsx              # Ticket list
│   │   └── vendors/                  # Vendor selection & favorites
│   │
│   ├── rep/                          # Representative routes (role: rep_l1-3)
│   │   ├── layout.tsx                # Rep layout with sidebar
│   │   ├── inbox/                    # Unified ticket inbox
│   │   │   └── [ticketId]/           # Ticket detail view
│   │   ├── analytics/                # Personal performance stats
│   │   ├── calendar/                 # Shift calendar
│   │   ├── tasks/                    # Assigned tasks
│   │   └── team/                     # Team view (managers only)
│   │
│   ├── admin/                        # Admin routes (role: admin_*)
│   │   ├── layout.tsx                # Admin layout with sidebar
│   │   ├── dashboard/                # System overview
│   │   ├── analytics/                # Company-wide analytics
│   │   ├── employees/                # Employee management
│   │   ├── calendar/                 # Shift scheduling
│   │   ├── tasks/                    # Task assignment
│   │   ├── vendors/                  # Vendor management
│   │   ├── settings/                 # System settings
│   │   └── memory/                   # AI memory management
│   │
│   └── api/                          # API routes
│       ├── ai/                       # AI endpoints
│       │   ├── handoff/              # Generate handoff summaries
│       │   └── summarize/            # Extract conversation context
│       ├── auth/                     # Auth endpoints
│       ├── chat/                     # Chat endpoints
│       ├── elevenlabs/               # ElevenLabs voice
│       ├── memory/                   # Memory/context endpoints
│       └── voice/                    # Twilio voice endpoints
│
├── components/
│   ├── ai-elements/                  # AI-related UI components
│   ├── call/                        # Voice call components
│   │   ├── call-overlay.tsx         # iOS-style call overlay
│   │   ├── call-controls.tsx        # Mute, speaker, end call
│   │   └── transcription-panel.tsx   # Live transcription display
│   ├── chat/                        # Chat components
│   ├── landing/                     # Landing page components
│   ├── layout/                      # Layout components
│   │   ├── customer-sidebar.tsx     # Customer sidebar
│   │   ├── customer-bottom-nav.tsx  # Mobile bottom nav
│   │   ├── rep-sidebar.tsx          # Rep sidebar
│   │   └── admin-sidebar.tsx        # Admin sidebar
│   ├── tickets/                     # Ticket-related components
│   ├── ui/                          # shadcn/ui components
│   ├── error-boundary.tsx          # Error boundary component
│   ├── image-upload-input.tsx      # Image upload component
│   ├── mode-toggle.tsx             # Dark/light mode toggle
│   ├── theme-provider.tsx          # Theme provider
│   └── UserCard.tsx                # User card component
│
├── hooks/
│   ├── use-elevenlabs-conversation.ts  # ElevenLabs voice hook
│   ├── use-image-upload.tsx            # Image upload hook
│   └── use-mobile.ts                   # Mobile detection hook
│
├── lib/
│   ├── auth/                        # Auth utilities
│   ├── stores/                      # Zustand stores
│   │   ├── auth-store.ts            # User session & role state
│   │   ├── call-store.ts            # Active call state
│   │   ├── ticket-store.ts          # Current ticket state
│   │   ├── ui-store.ts              # UI state (modals, etc.)
│   │   └── vendor-store.ts          # Selected vendor context
│   ├── error-handler.ts            # Error handling utilities
│   └── utils.ts                    # Utility functions
│
├── proxy.ts                         # Proxy configuration
└── types/                           # TypeScript type definitions

convex/
├── schema.ts                        # Database schema definition
├── auth.ts                          # Auth configuration
├── functions/                       # Convex backend functions
│   ├── analytics.ts                # Analytics aggregations
│   ├── auth.ts                     # Authentication functions
│   ├── calendar.ts                 # Calendar/scheduling functions
│   ├── calls.ts                    # Call session management
│   ├── context.ts                  # AI context summaries
│   ├── conversations.ts            # Chat/email thread management
│   ├── feedback.ts                 # Customer feedback
│   ├── manage/                     # Management functions
│   ├── messages.ts                 # Message CRUD
│   ├── queues.ts                   # Ticket routing queues
│   ├── storage.ts                  # File storage
│   ├── tasks.ts                    # Task management
│   ├── tickets.ts                  # Ticket lifecycle (CRUD)
│   ├── transcripts.ts              # Call transcripts
│   ├── users.ts                    # User CRUD
│   └── vendors.ts                  # Vendor CRUD & favorites
├── http.ts                          # HTTP client
└── convex.config.ts                 # Convex configuration
```

---

## Convex Schema Design

The database schema is defined in `convex/schema.ts`. Key tables and their purposes:

### Core Tables

- **users**: User accounts with role-based access (customer, rep_l1-3, admin_* roles)
- **vendors**: Multi-vendor support with branding, categories, and SLA settings
- **tickets**: Support tickets with status lifecycle (created → waiting_for_agent → assigned → in_progress → resolved → closed)
- **conversations**: Chat/email threads linked to tickets
- **messages**: Individual messages within conversations

### Voice & AI

- **callSessions**: Voice call sessions with Twilio integration
- **transcripts**: Real-time call transcriptions
- **contextSummaries**: AI-generated context preservation (summary, facts, signals, unknowns, actions)

### Support Features

- **queues**: Intelligent ticket routing with priority-based queuing
- **feedback**: Customer ratings (1-5) and comments
- **tasks**: Internal task management for reps/admins
- **calendarEvents**: Shift scheduling and meetings
- **userFavorites**: Customer vendor preferences

### Key Indexes

- `by_email`, `by_role`, `by_vendor` on users
- `by_customer`, `by_vendor`, `by_rep`, `by_status` on tickets
- `by_ticket` on conversations
- `by_conversation` on messages
- `by_call` on transcripts

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

## API Routes

### AI Endpoints

#### Handoff Summary Generation
```
POST /api/ai/handoff
Body: { ticketId, ticketSubject, customerName, messages, previousTickets }
Response: { summary: string } // Markdown-formatted handoff summary
```
Generates comprehensive handoff summaries when transferring tickets between reps.

#### Context Extraction
```
POST /api/ai/summarize
Body: { messages, ticketSubject }
Response: { summary, confirmedFacts, inferredSignals, unknowns, actionsTaken, sentiment, suggestedNextSteps }
```
Extracts structured context from conversations for reps.

### Voice Endpoints

#### Twilio Token Generation
```
POST /api/voice/token
Body: { userId }
Response: { token, identity }
```
Generates Twilio access tokens for WebRTC voice calls.

#### Twilio Webhooks
```
POST /api/voice/webhook
Body: Twilio webhook payload
Response: TwiML instructions
```
Handles Twilio call events (ringing, answered, ended, transcription).

### Memory Endpoints

#### Context Storage
```
POST /api/memory/store
Body: { ticketId, contextData }
Response: { success }
```
Stores AI-generated context for tickets.

#### Context Retrieval
```
GET /api/memory/retrieve?ticketId={id}
Response: { contextData }
```
Retrieves stored context for a ticket.

---

## Key Implementation Details

### State Management (Zustand)

**auth-store.ts** (`src/stores/auth-store.ts`)
- Stores current user session and role
- Helper functions: `isRep()`, `isAdmin()`, `isCustomer()`, `getRepLevel()`, `getAdminLevel()`
- Persists to localStorage

**call-store.ts** (`src/stores/call-store.ts`)
- Manages active call state (isInCall, conversationId, agentName, isMuted, callStartTime)
- Agent mode tracking (listening/speaking)

**ticket-store.ts** (`src/stores/ticket-store.ts`)
- Stores current ticket context

**vendor-store.ts** (`src/stores/vendor-store.ts`)
- Stores selected vendor context

**ui-store.ts** (`src/stores/ui-store.ts`)
- Manages UI state (modals, panels, etc.)

### Convex Backend Functions

**tickets.ts** (`convex/functions/tickets.ts`)
- `createFromIntake()`: Creates ticket with auto-routing to queue
- `create()`: Basic ticket creation
- `assign()`: Assign ticket to rep
- `escalate()`: Escalate ticket to higher level
- `reassign()`: Reassign to different rep
- `updateStatus()`: Update ticket status
- `listByCustomer()`, `listByVendor()`, `listByRep()`: Query functions

**messages.ts** (`convex/functions/messages.ts`)
- `send()`: Send message to conversation
- `listByConversation()`: Get all messages (real-time)
- `getRecent()`: Get recent N messages for context

**vendors.ts** (`convex/functions/vendors.ts`)
- `listWithFavorites()`: Get vendors with user's favorites
- `toggleFavorite()`: Add/remove favorite
- `getWithStats()`: Get vendor with ticket statistics

**auth.ts** (`convex/functions/auth.ts`)
- `login()`: Email/password authentication
- `me()`: Get current user session
- `getUsersByRole()`: Get users by role
- `getVendorReps()`: Get reps for a vendor

### Component Patterns

**Layout Components**
- Customer: Sidebar (desktop) + Bottom Nav (mobile)
- Rep: Sidebar only
- Admin: Sidebar only

**AI Components**
- Located in `src/components/ai-elements/`
- Streaming chat interfaces
- Context visualization

**Call Components**
- iOS-style call overlay with controls
- Live transcription panel
- Mute/speaker/end call controls

---

## Development Workflow

### Running the App

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Seed database
pnpm seed
```

### Adding New Features

1. **Database Changes**: Modify `convex/schema.ts`, then run `npx convex dev` to sync
2. **Backend Logic**: Add functions to `convex/functions/`
3. **Frontend Routes**: Add to `src/app/customer/`, `src/app/rep/`, or `src/app/admin/`
4. **Components**: Add to `src/components/`
5. **State**: Add to `src/stores/` if needed
6. **API Routes**: Add to `src/app/api/`

### Convex Development

```bash
# Start Convex backend
npx convex dev

# View dashboard
npx convex dashboard

# Run functions
npx convex function <functionName>
```

---

## Testing Guide

### Manual Testing Checklist

1. **Authentication**
   - Login with each role credential
   - Verify correct redirect to role-specific dashboard
   - Test session persistence

2. **Customer Flows**
   - Create ticket via intake form
   - Chat with AI support
   - Initiate voice call
   - View ticket history
   - Manage vendor favorites

3. **Rep Flows**
   - View unified inbox
   - Accept assigned tickets
   - Handle customer chats
   - Escalate tickets
   - View analytics

4. **Admin Flows**
   - Manage employees
   - View company analytics
   - Schedule shifts
   - Manage vendors
   - Review AI memory

5. **Real-time Features**
   - Message streaming in chat
   - Live call transcription
   - Ticket status updates
   - Convex subscriptions

---

## Common Patterns

### Convex Query Pattern
```typescript
export const functionName = query({
  args: { /* args */ },
  handler: async (ctx, args) => {
    // Query logic
    return result;
  },
});
```

### Convex Mutation Pattern
```typescript
export const functionName = mutation({
  args: { /* args */ },
  handler: async (ctx, args) => {
    // Mutation logic
    return { success: true };
  },
});
```

### Zustand Store Pattern
```typescript
export const useStore = create<StateType>((set) => ({
  state: initialState,
  action: (args) => set({ /* updates */ }),
}));
```

### Next.js Route Group Pattern
- `(landing)/`: Public pages
- `customer/`: Customer routes with auth check
- `rep/`: Representative routes with auth check
- `admin/`: Admin routes with auth check

---

## Environment Variables

Required in `.env`:
```
NEXT_PUBLIC_CONVEX_URL=...
CONVEX_DEPLOYMENT=...
GOOGLE_GENERATIVE_AI_API_KEY=...
ELEVENLABS_API_KEY=...
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=...  # Client-side for WebRTC calls
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
RESEND_API_KEY=...
```

---

## Important Notes for LLMs

1. **Role-Based Routing**: The app uses route groups (`customer/`, `rep/`, `admin/`) with layouts that enforce role-based access
2. **Real-Time Updates**: Convex subscriptions are used extensively for real-time data sync
3. **AI Integration**: Gemini 2.5 is used for chat, handoff summaries, and context extraction
4. **Voice Integration**: Twilio WebRTC + ElevenLabs for AI-powered voice calls
5. **Multi-Tenancy**: Vendors are isolated but share the same platform infrastructure
6. **Context Preservation**: Every interaction (chat, call, email) contributes to unified ticket context
7. **Mobile-First**: Customer UI uses bottom nav for mobile, sidebar for desktop
8. **Clean Code**: Follow existing patterns, use functional programming, minimal comments, descriptive variable names
