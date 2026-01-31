---
trigger: manual
---

# UNIFIED CUSTOMER SUPPORT PLATFORM — BUILD SPECIFICATION

## What You're Building

A **context-aware, multi-vendor customer support platform** where every interaction (chat, call, email, docs) contributes to a **single, continuous support journey** with zero context loss across channels, agents, languages, and time.

**Core Philosophy**: One system of record. Customers never repeat themselves. Reps never start blind. Context always flows forward.

---

## System Architecture

### Roles & Hierarchy
1. **Customer** — creates tickets, interacts across channels
2. **Representative (CR)** — L1 → L2 → L3 support levels
3. **Admin** — Manager → Senior Admin → Super Admin

### Core Entities
- **User** (customers, reps, admins)
- **Vendor** (multi-vendor support isolation)
- **Ticket** (single source of truth per issue)
- **Conversation** (chat/email threads)
- **Call Session** (with live transcription)
- **Context Summary** (AI-curated, living memory)
- **Queue** (intelligent routing)
- **Feedback** (closure ratings)
- **Task** (internal assignments)
- **Calendar Event** (scheduling)

### Ticket States (Strict Enum)
```

CREATED → INTAKE_IN_PROGRESS → WAITING_FOR_AGENT → ASSIGNED → IN_PROGRESS → [REASSIGNED | ESCALATED] → RESOLVED → CLOSED → [REOPENED]

```

### Support Channels
- CHAT (text messaging)
- CALL (voice with transcription)
- MAIL (email integration)
- DOCS (self-serve knowledge base)

---

## Customer Flow

### 1. Entry & Context Setup
```

Login → Customer Dashboard ├─ Active Tickets (live/pending) ├─ Ticket History ├─ Vendor Selector (sets context boundary) └─ Language Selector (UI + AI)

Bottom Nav: Dashboard | Tickets | Vendors | History | Profile

```

### 2. Vendor Selection
```

Vendors Tab → Select Vendor → Vendor Context Locked

```
All subsequent tickets inherit this vendor context.

### 3. Getting Help — Two Paths

#### Path A: Quick Help (AI-First)
```

Quick Help ├─ Chat (AI - SAGE) │ ├─ Ticket: CREATED → INTAKE_IN_PROGRESS │ ├─ AI collects: issue, urgency, metadata │ ├─ IF Solved → RESOLVED → Feedback → CLOSED │ └─ ELSE → WAITING_FOR_AGENT → Queue (context preserved) │ └─ Call (AI Voice - ElevenLabs) ├─ Ticket: CREATED ├─ Call Session + Live Transcript ├─ IF Solved → RESOLVED → Feedback → CLOSED └─ ELSE → WAITING_FOR_AGENT → Queue

```

#### Path B: Human Help (Direct)
```

Help ├─ Chat → Ticket CREATED → WAITING_FOR_AGENT → Queue ├─ Call → Recording Consent → Ticket CREATED → Call Session → Queue/Direct ├─ Mail → Redirect to email app → Ticket CREATED → Email thread linked └─ FAQ/Docs → No ticket (unless "Still need help?" clicked)

```

### 4. Queue Waiting
```

Status: WAITING_FOR_AGENT Display: ├─ Queue position (optional) ├─ Estimated wait time └─ Cancel option

Agent Accepts → ASSIGNED → Live interaction begins

```

### 5. Active Interaction
```

Status: IN_PROGRESS ├─ Customer communicates via chosen channel ├─ Channel switches preserve full context └─ Rep sees: profile, AI summary, history, transcript, suggested responses

```

### 6. Closure & Feedback
```

Issue Resolved → Status: RESOLVED → Feedback Prompt → Status: CLOSED

Customer can: Reopen Ticket → REOPENED (context intact)

```

---

## Representative Flow

### 1. CR Dashboard
```

Login → Role Detection (L1/L2/L3) Dashboard: ├─ Calendar (Day/Week/Month views) ├─ Task List ├─ Quick Stats (resolved, escalated, avg time) └─ Navigation Sidebar

```

### 2. Unified Inbox
All tickets from all channels, sorted by:
- Priority
- Urgency
- SLA deadline
- Vendor
- Language

**For Each Ticket, CR Can:**
1. **Accept** → Status: ASSIGNED → Ownership set → Full context loaded
2. **Reassign** → Select target CR → Status: REASSIGNED → Queue + audit log
3. **Escalate** → Move to L2/L3 → Status: ESCALATED → Higher queue

### 3. Handling Tickets
```

Accept Ticket → View Context Panel: ├─ Customer profile ├─ AI-generated summary ("Why they came") ├─ Past interactions ├─ Transcript (if call) ├─ Confirmed facts vs. inferences └─ Suggested next steps

Communicate → Update "Case Summary" field → Update "Contact Confirmation" if needed

Decision: ├─ Resolved → Close ├─ Needs expertise → Escalate (AI handoff summary auto-generated) └─ Wrong owner → Reassign

```

### 4. AI Handoff Summaries
Every escalation/reassignment generates:
- Customer intent
- Confirmed facts
- Actions already taken
- Open blockers
- Reason for handoff

**Summaries are additive** — never overwrite, always append.

### 5. CR Analytics
View personal stats:
- Tickets resolved/escalated/reassigned
- Avg handling time
- Feedback scores

### 6. Employee View (Managers Only)
If CR manages subordinates:
- Employee performance
- Ticket outcomes
- Ratings & trends

---

## Admin Flow

### 1. Admin Dashboard
```

Login → Admin Level Detection Dashboard: ├─ Company-wide analytics ├─ Support level breakdowns (L1/L2/L3) ├─ Employee roster ├─ Calendar (shift assignment) └─ Task management

```

### 2. Calendar & Scheduling
```

Calendar View (Day/Week/Month) → Assign: ├─ Agent shifts └─ Rep shifts

```

### 3. Task Management
```

Create Task → Assign to Agent/Rep → Track completion

```

### 4. Analytics & Insights

#### Company-Level
- Ticket volume trends
- Resolution vs. escalation rates
- Customer sentiment analysis
- Feedback aggregation
- Correlation with business metrics (e.g., stock price, churn)

#### Employee-Level
- Tickets handled
- Resolved vs. escalated ratio
- Reassignment frequency
- Performance scores
- Ratings over time

---

## Context Continuity System (Critical)

### What It Does
Every interaction builds a **living customer narrative**:
- Customer profile enrichment
- Vendor-specific issue history
- Confirmed facts (explicitly stated)
- Inferred signals (AI-detected patterns)
- Unknowns (flagged gaps)

### How It Works
1. **AI extracts structured data** from unstructured interactions
2. **Context survives**:
   - Channel switches (call → chat → email)
   - Agent handoffs
   - Escalations
   - Time gaps (weeks/months between tickets)
3. **Reps see curated summaries**, not raw logs
4. **Language normalization**: multilingual input → unified meaning layer

### Customer Control
- Context is **customer-owned**
- Explicit opt-in for cross-vendor sharing
- Visible transparency: what's stored, where it's used
- Reversible: delete or restrict context at any time

---

## Language & Accessibility

### Multi-Language Support
- Customer selects language → affects UI + AI
- AI normalizes all languages into internal meaning layer
- Reps see clean, consistent context regardless of input language
- Voice AI supports multiple languages (ElevenLabs integration)

### Transcription
- All calls auto-transcribed in real-time
- Transcripts linked to tickets
- Searchable, auditable, context-enriching

---

## Error Handling & Edge Cases

| Scenario         | Behavior                              |
| ---------------- | ------------------------------------- |
| Network failure  | Auto-retry → Save state → Resume      |
| Call drops       | Fallback to chat (same ticket)        |
| Queue timeout    | Notify customer → Offer mail/callback |
| Feedback skipped | Ticket still closes (CLOSED)          |
| Rep unavailable  | Auto-reassign based on rules          |

---

## Navigation & UI Structure

### Customer App
```

Bottom Navigation Bar (always visible): [Dashboard] [Tickets] [Vendors] [History] [Profile]

Dashboard → Vendor Selection → Help Entry Point Help → Quick Help (AI) | Human Help (Chat/Call/Mail/Docs) Tickets → Active | Pending | Resolved History → All past tickets (searchable) Profile → Settings, language, privacy controls

```

### Representative App
```

Sidebar Navigation: [Inbox] [Calendar] [Tasks] [Analytics] [Employees*]

Inbox → Ticket List → Ticket Detail (context panel) Calendar → Day/Week/Month → Shift management Tasks → Assigned tasks → Complete/Update Analytics → Personal stats Employees* → Only if manages team

```

### Admin App
```

Sidebar Navigation: [Dashboard] [Analytics] [Employees] [Calendar] [Tasks] [Settings]

Dashboard → System overview + quick stats Analytics → Company/Level/Employee views Employees → Roster, performance, assignments Calendar → Shift planning Tasks → Create/Assign/Track

```

---

## AI Integration Points

### 1. SAGE (Chat AI)
- Intake automation
- Intent detection
- Self-serve resolution
- Escalation triggers
- Context extraction

### 2. Voice AI (ElevenLabs)
- Natural language call handling
- Real-time transcription
- Emotion detection
- Escalation handoff

### 3. Context AI (Continuous)
- Summarization
- Handoff note generation
- Repetition prevention
- Next-step suggestions
- Quality flagging

### 4. Analytics AI
- Sentiment analysis
- Trend detection
- Performance insights
- Risk identification

---

## Success Metrics

### Customer-Facing
- Zero repetition rate (track if customer restates issue)
- First-contact resolution %
- Avg time to resolution
- Satisfaction scores

### Operational
- Context handoff quality (rep ratings)
- Escalation reasons (appropriate vs. avoidable)
- Channel switch friction (time lost)
- Queue efficiency (wait time vs. workload)

### Business
- Support cost per ticket
- Retention impact
- Cross-vendor insights
- Predictive issue detection

---

## Mental Model for Builders

Think of this as:
> **A continuously evolving customer narrative engine**

Where:
- **Tickets** = chapters in a story
- **Context** = curated memory
- **Every interaction** = moves story forward
- **AI** = librarian, not author
- **Reps** = editors with final authority

Build with this metaphor in mind: You're creating a system that remembers, learns, and **never makes the customer start over**.

---

## Implementation Priority

1. **Core ticket lifecycle** (CREATED → CLOSED)
2. **Context capture & summarization** (AI integration)
3. **Unified inbox** (rep experience)
4. **Multi-channel support** (chat, call, email)
5. **Queue & routing** (intelligent assignment)
6. **Analytics & reporting** (admin insights)
7. **Customer privacy controls** (opt-in/out)
8. **Multi-language normalization**

---

**End of Build Specification**
