# Task 2 — Briefing 01: Customer List Dashboard + Subscription Management

**Status:** FIRST MILESTONE DEPLOYED — continuing with remaining features
**Requested by:** Enzo Becker (Product Owner)
**Assigned to:** Saba
**Briefing doc:** [Briefing 01 — Google Doc](https://docs.google.com/document/d/1B602uqZ2yp7eXqZFODyUbPjB9mDrQIHEpIUhMGGCODo/edit?usp=sharing)
**Last updated:** 2026-03-13

---

## 1. What Enzo Asked For (Full Requirements)

### 1.1 Purpose

A dashboard that is the primary operational surface for teams to find, segment, and manage customers and their active subscriptions. It must answer within seconds:
- "Which customers need action today?"
- "Which subscriptions are at risk / expiring / paused / unpaid / need renewal?"
- "What's the current status of access, payment, and key milestones for a given customer?"
- "How do I apply a subscription change (pause, extension, payment plan change) safely and auditable?"

### 1.2 Target Users

| Team | Role |
|------|------|
| Customer Ops / Backoffice | Primary — daily operations, manage subscriptions |
| Finance | Secondary — payment status, collections context |
| Sales | Secondary — renewal upsell, contract follow-up handoff |

### 1.3 User Journeys

**Journey A — Daily Operations: "Work my list"**
- Open dashboard, select Smart View or apply filters
- See list with action-relevant columns
- Pick a row → open Subscription Detail
- Perform action (pause, extend, payment change, note, task)
- System updates: timeline + audit trail, derived dates, access policies, tasks/reminders
- Go back to list, continue with next item

**Journey B — "Pause for 4 weeks with certificate"**
- Search customer by name/email → open subscription
- Select Action: Pause / Freeze
- Enter: pause start date (default today), pause duration, reason (dropdown + free text), evidence attachment flag, whether coaching access pauses or remains
- System preview shows: new end date, impact on entitlements, any conflicts
- Confirm → system writes: immutable audit event, updated end date, case/task if approval required, updates access state per policy

**Journey C — "Extend existing subscription"**
- Renewal contract signed or manually triggered
- Open subscription → Action: Extend / Renew
- Enter: extension term (months/weeks), new pricing/offer reference, link renewal contract (Contract ID)
- System updates: end date, subscription term metadata, timeline event "renewed", optionally generates next invoice logic

**Journey D — "Switch to installments"**
- Customer requests payment terms change, or Finance triggers it
- Open subscription → Action: Payment plan change
- Edit: payment mode (upfront vs installments), schedule (due dates, amounts), installment pause
- System creates: updated payment schedule, flags for Finance dashboard, any required approvals

**Journey E — "Customer buys different product"**
- Customer has Coaching; now buys Training
- System creates new subscription object (not extension of old one)
- Both visible in customer list, clearly labeled by product type
- Each managed independently

### 1.4 Dashboard UX Requirements

**List View — Two Modes:**
- Customer-centric (one row per customer, shows primary subscription summary + counts)
- Subscription-centric (one row per subscription — recommended default for Ops)

**Columns (minimum viable):**

| Column | Description |
|--------|------------|
| Customer Name | |
| Primary Email | |
| Subscription Type | e.g., Coaching / Training |
| Subscription Status | Active / Paused / Pending Access / Ending Soon / Ended |
| Contract Signed Date | |
| Contract Start Date | |
| Program Start Date | |
| Subscription End Date | |
| Payment Status | Paid / Installments / Overdue / In dispute |
| Offer/Discount Tag | e.g., "Spring Promo -20%" |
| Access Status | Active / Not granted / Paused / Withdrawn |
| Last Touchpoint | Timestamp + channel icon |
| Next Action / Due Date | If follow-up exists |
| Owner | Optional but very useful |

**Filters (must be combinable):**
- Date ranges: signed date, end date, program start
- Status filters: subscription status, payment status, access status
- Product filters: subscription type, offer/discount
- Operational: "needs action", "no touchpoint in X days", "has open case", "missing required data"

**Smart Views (saved cohorts):**
- Save filter sets as named Smart Views
- Shareable across teams/roles
- Show count and last updated timestamp
- Examples: "Access not granted after signing", "Expiring in 60 days", "Paused subscriptions", "Overdue payments", "No touchpoint in 14 days"

**Bulk Actions (Phase 2 but design-ready):**
- Create follow-up tasks for all in view
- Export list (CSV)
- Apply tags
- Bulk schedule reminders

### 1.5 Subscription Detail View

**Summary Header:**
- Customer + subscription type
- Status pills: Subscription / Payment / Access
- Key dates: signed / start / program start / end
- Offer/discount summary
- Owner & team

**Actions (with guided workflows):**
- Pause / Freeze
- Extend / Renew
- Payment plan change (incl. installment pause)
- Update program start date
- Add note / create follow-up task
- Open case (exception escalation)

Each action must:
- Show preview impact (end date change, access impact)
- Enforce guardrails (see section 1.6)
- Write an audit event

**Timeline / Audit:**
- Chronological feed of subscription events: created, access granted, payment received, paused, extended, payment plan changed, notes/tasks
- Filterable by event type

**Linked Objects:**
- Related contracts (original + renewals/amendments)
- Invoices/payments overview (read-only link to Finance view)
- Access history
- Communication feed snapshot

### 1.6 Rules & Guardrails (non-negotiable)

- No silent changes — every mutation generates an immutable audit event
- Pause duration max X without approval (configurable)
- Cannot pause an already ended subscription
- Cannot create negative end dates / overlap issues
- Renewal must reference a contract (or explicit manual override with reason)
- Policy-driven access behavior (pause → access pauses or remains depending on product rules)
- Withdrawal due to non-payment controlled by finance policy
- Permissions: who can pause? who can change payment plan? who can renew? Backoffice vs Finance role splits.

### 1.7 Definition of Done (from Enzo)

- Filter customers/subscriptions and save Smart Views
- Execute Pause with preview + audit
- Execute Extend/Renew with end date recalculation + audit
- Execute Payment plan change and see updated payment mode/status
- See all changes in timeline + reflected in list immediately
- Basic permissioning (at least Admin vs Standard)
- List performance: usable at scale (thousands+ records)

---

## 2. What Was Built and Delivered

### 2.1 Code Changes (PR #12, merged to main)

**Action Buttons (3 components):**

| Action | File | What It Does |
|--------|------|-------------|
| Pause Subscription | `PauseSubscriptionAction.tsx` | Shows confirmation dialog, extends end date by fixed 4 weeks, sets accessStatus → PAUSED. Blocks if WITHDRAWN. |
| Extend / Renew | `ExtendSubscriptionAction.tsx` | Shows confirmation dialog, extends end date by fixed 3 months, sets accessStatus → ACTIVE. |
| Change Payment Plan | `ChangePaymentPlanAction.tsx` | Shows confirmation dialog, toggles paymentStatus between PAID and INSTALLMENTS. |

**Config + Routing:**

| File | What |
|------|------|
| `TobSubscriptionActionsConfig.tsx` | Registers 3 custom actions + inherits default actions (favorites, delete, export, etc.) |
| `SubscriptionSingleRecordActionKeys.ts` | Enum: `pause-subscription`, `extend-subscription`, `change-payment-plan` |
| `CoreObjectNameSingular.ts` | Added `TobSubscription = 'tobSubscription'` enum entry |
| `getActionConfig.ts` | Routes tobSubscription to custom config via enum switch case |

**Lingui Translations:**
- Ran `lingui extract` + `lingui compile` — all action labels compiled into 31 locale catalogs
- Labels display as readable text on production (not garbled hashes)

**Deploy Scripts (metadata — runs via Docker):**

| Script | Creates |
|--------|---------|
| `deploy/add-subscription-fields.sh` | 6 fields: Payment Status (SELECT), Access Status (SELECT), Subscription Type (SELECT), Offer/Discount Tag (TEXT), Last Touchpoint (DATE_TIME), Next Action/Due Date (DATE_TIME) |
| `deploy/create-subscription-views.py` | 5 Smart Views: Access Not Granted, Expiring in 60 Days, Paused Subscriptions, Overdue Payments, No Touchpoint 14 Days |

**Docker-compose:**
- Added `setup-subscriptions` one-shot service that runs deploy scripts automatically after twenty-server is healthy (internal Docker network, no Cloudflare needed)

### 2.2 What Works on Production (verified after PRs #14 + #16, deployed 2026-03-11)

| Feature | Status |
|---------|--------|
| Subscription list (582 records) | ✅ Works |
| 6 custom fields visible on subscription records | ✅ Visible (but empty — no data populated) |
| Action button labels (Pause, Extend, Change Payment Plan) | ✅ Readable |
| Smart Views appear in sidebar (5 views) | ✅ Visible |
| 3 action buttons (Pause, Extend, Change Payment Plan) | ✅ Working with confirmation dialogs |
| Timeline/audit trail | ✅ Working (built-in Twenty) |
| Docker-compose auto-setup service | ✅ Works |

### 2.3 Previously Broken — Now Fixed

| Issue | Fix | PR |
|-------|-----|-----|
| Smart Views crashed when clicked | Fixed filter values and field IDs in deploy script | PR #14 |
| Delete mutation used wrong ID type | Changed `$id: ID!` to `$id: String!` | PR #16 |
| Garbled action labels on production | Fixed Lingui translations | PR #12 |

---

## 3. What Is Left To Do (from Enzo's Requirements)

### 3.1 Features Never Built

| # | Feature | Enzo's Requirement | Current State |
|---|---------|-------------------|---------------|
| 1 | Pause guided workflow | Start date, duration input, reason dropdown, evidence attachment, conflict check, preview impact, approval flow | Fixed 4-week confirm dialog only |
| 2 | Extend guided workflow | Extension term input, pricing/offer reference, link contract ID, preview impact | Fixed 3-month confirm dialog only |
| 3 | Payment plan change workflow | Payment mode, schedule editing, amounts, installment pause, Finance flags | Toggle between 2 values only |
| 4 | List columns | 14+ columns: Email, Type, Status, Dates, Payment, Access, Touchpoint, Owner | Only 4 columns: Name, Creation date, Created by, Last update |
| 5 | Customer-centric vs Subscription-centric toggle | Two view modes for the list | Only subscription-centric |
| 6 | Detail view summary header | Status pills, key dates, owner, offer summary at top | Just a flat field list |
| 7 | Guardrails | Max pause duration, no overlap, renewal must reference contract, approval flows | Only checks WITHDRAWN status |
| 8 | Linked objects | Related contracts, invoices, access history, communication feed | Not built |
| 9 | Combinable filters (AND/OR) | Filter groups with AND/OR logic | Basic Twenty filters only |
| 10 | Bulk actions (Phase 2) | Follow-up tasks, CSV export, tags, bulk reminders | Not built |
| 11 | Role-based permissions | Backoffice vs Finance role splits | Basic canUpdate check only |
| 12 | Parallel subscriptions handling | Multiple subscriptions per customer, independently managed | Not explicitly handled |

---

## 4. Timeline / History

| Date | What Happened |
|------|--------------|
| 2026-03-06 | Task received from Enzo (Briefing 01) |
| 2026-03-07 | Pablo completed data migration (Subscriptions, Contracts, Customers, Contacts) |
| 2026-03-09 | Pablo recreated objects with correct field types (Date and Time, Number) |
| 2026-03-10 | Built action buttons, deploy scripts, Smart Views. PR #8 created and merged. |
| 2026-03-10 | Found broken on production: garbled labels, missing fields. Reverted (PR #9). |
| 2026-03-10 | Code audit: found 6 problems, 0 code bugs in hooks/components. |
| 2026-03-10 | Fixed Lingui translations + type-safe routing. PR #10 merged. Reverted (PR #11). |
| 2026-03-10 | Added docker-compose setup-subscriptions service (Pablo's suggestion). |
| 2026-03-10 | Final PR #12 merged with all fixes. Pablo ran docker compose up. |
| 2026-03-10 | Production verification: labels readable ✅, fields visible ✅, Smart Views crash ❌. |
| 2026-03-10 | Honest assessment: ~30-40% of Enzo's requirements built. Smart Views broken. Actions untested. |
| 2026-03-11 | PRs #14 (main feature fixes) and #16 (delete mutation fix) merged. First milestone deployed and verified on crm.tob.sh. Smart Views, action buttons, custom fields all working. |
| 2026-03-13 | Enzo confirmed progress looks good. Marketing event starting — urgently needs contracts/subscriptions dashboard for incoming new contracts. Meeting planned with Enzo + Lascha to define priorities. |

---

## 5. Key Files

| File | Purpose |
|------|---------|
| `packages/twenty-front/src/modules/action-menu/actions/record-actions/constants/TobSubscriptionActionsConfig.tsx` | 3 custom action configs |
| `packages/twenty-front/src/modules/action-menu/actions/record-actions/single-record/subscription-actions/components/PauseSubscriptionAction.tsx` | Pause action component |
| `packages/twenty-front/src/modules/action-menu/actions/record-actions/single-record/subscription-actions/components/ExtendSubscriptionAction.tsx` | Extend action component |
| `packages/twenty-front/src/modules/action-menu/actions/record-actions/single-record/subscription-actions/components/ChangePaymentPlanAction.tsx` | Change Payment action component |
| `packages/twenty-front/src/modules/action-menu/actions/utils/getActionConfig.ts` | Routes tobSubscription to custom config |
| `packages/twenty-front/src/modules/object-metadata/types/CoreObjectNameSingular.ts` | TobSubscription enum entry |
| `deploy/add-subscription-fields.sh` | Creates 6 metadata fields |
| `deploy/create-subscription-views.py` | Creates 5 Smart Views (currently broken filters) |
| `deploy/docker-compose.yml` | setup-subscriptions service |

---

## 6. Next Action

Continue building remaining features from Section 3.1. Priority order depends on Enzo's requests — some features may come first based on urgency (e.g. marketing event needs). Some items from Task 3 (Change Requests) may also be worked on in parallel where they overlap with this task.
