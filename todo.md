# COCO Platform – Refined Product TODOs

## Dashboard (Customer Entry)

- [ ] Show exactly two primary actions on the dashboard: **Quick Help (AI)** and **Help (Human)** as large, visually dominant cards
- [ ] User must select one of the two before continuing (no other actions allowed first)
- [ ] After selecting AI or Human, force vendor selection before proceeding
- [ ] Do not create a ticket until the user completes the flow and confirms the request

---

## Vendor Selection + Vendor View

- [ ] Vendor list must be searchable, sortable, and filterable
- [ ] Filters should include category, recent, favorites, alphabetical
- [ ] Selecting a vendor opens a dedicated vendor context page
- [ ] Vendor page must show:
  - Quick Help (AI)
  - Help (Human)
  - User’s historical tickets for that vendor
  - Activity timeline and interaction history
  - Vendor-specific metadata (contracts, SLAs, notes, attachments)
- [ ] Allow users to merge or compare data across vendors within a selected timeframe
- [ ] Vendor experience should feel contextual, not just a static list

---

## Help (Human) Flow

- [ ] After selecting Human Help, show a short mandatory intake survey before contact
- [ ] Survey must capture:
  - Problem description (free text)
  - Category/type
  - Severity level
  - Urgency level
  - Preferred contact method
- [ ] Provide contact methods: Email, Chat, Call
- [ ] Automatically create a ticket immediately after submission
- [ ] Pre-fill ticket fields using survey answers
- [ ] Route ticket automatically based on category + severity

---

## Quick Help (AI) Flow

- [ ] Provide AI Chat option
- [ ] Provide AI Call/Voice assistant option
- [ ] Provide Docs/FAQ/self-serve knowledge base option
- [ ] AI should use full user + vendor context to personalize responses
- [ ] If AI cannot resolve, allow seamless escalation to Human without losing context
- [ ] Escalation must reuse the same ticket (no duplicate tickets)

---

## Ticket Creation (Global Rules)

- [ ] Every support interaction automatically generates a ticket (AI or Human)
- [ ] All channels attach to the same ticket timeline
- [ ] Preserve full context, history, and summaries across handoffs
- [ ] Tickets must include channel source (chat/email/call/AI/docs)
- [ ] Implement AI-generated summaries for faster understanding

---

## Ticket UI Improvements

- [ ] Redesign tickets to look modern, clean, and visually structured
- [ ] Show status, priority, SLA, vendor, and channel at a glance
- [ ] Use cards/timeline layout instead of dense text blocks
- [ ] Improve readability and quick scanning

---

## Homepage Chat

- [ ] Remove generic homepage chat unless it is explicitly COCO AI
- [ ] If present, it must connect directly to Quick Help (AI) and create a ticket automatically

---

# Representative Experience

## Inbox View

- [ ] Inbox must resemble Gmail-style list layout
- [ ] Each ticket row should show:
  - Channel source icon
  - Short AI-generated summary
  - Vendor name
  - Category
  - Priority
  - Timestamp
- [ ] Provide quick actions per ticket: Accept, Reassign, Escalate
- [ ] Enable sorting, filtering, and search
- [ ] Inbox must focus only on ticket management (no analytics widgets here)

---

## Calendar View

- [ ] Calendar must display scheduled calls, follow-ups, and deadlines
- [ ] Allow reps to create or reschedule follow-up tasks directly from tickets
- [ ] Show upcoming commitments clearly by day/week/month

---

## Analytics View

- [ ] Provide detailed performance analytics separate from Inbox
- [ ] Include metrics like resolution time, SLA compliance, backlog, channel distribution
- [ ] Allow filtering by team, vendor, timeframe, and category

---

## Teams View

- [ ] Show all teams with high-level metrics
- [ ] Each team must be clickable
- [ ] Team detail view must show per-member stats (tickets handled, resolution time, SLA performance, workload)
- [ ] Support comparisons and time filtering

---

# Admin View

- [ ] Admin interface is vendor-specific (single-tenant perspective)
- [ ] Do not show vendors tab in Admin view
- [ ] Admin should only manage their own organization, agents, settings, workflows, and analytics
- [ ] Remove any cross-vendor navigation to avoid confusion