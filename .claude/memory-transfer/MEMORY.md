# TOB Twenty — Project Memory

## Key Facts
- **Project**: TOB Twenty (TOB OS) — CRM/ERP built on Twenty CRM (open-source fork)
- **Repo**: `the-original-body/tob-twenty` (fork of `twentyhq/twenty`)
- **Live URL**: `crm.tob.sh` (behind Cloudflare Access)
- **Listmonk**: `listmonk.tob.sh/admin`
- **Working branch**: `tob-twenty/saba`
- **Local dev**: `localhost:3001` (frontend) / `localhost:3000` (backend), login: `tim@apple.dev` / `tim@apple.dev`
- **Deploy**: push to main → GitHub Actions builds Docker → GHCR → Watchtower auto-deploys within 5 min

## Key People
- **Enzo Becker**: Product Owner — defines what gets built, sends briefings
- **Pablo Perez**: Data Engineer — data pipelines, server infrastructure
- **Johannes Schulz**: Technical Lead — built the fork, deployment, CI/CD
- **Saba**: Builder/Developer — implements features, pushes code

## Current Phase
- SDLC phase: **Maintenance → Development/Improvement/Update**
- Data migration: DONE (Pablo migrated Subscriptions, Contracts, Customers, Contacts)
- Local dev server: WORKING (required Docker + long paths fix + workspaceMember seeding)

## Active Tasks
- Task 1: Explore Twenty CRM (DONE)
- Task 2: Briefing 01 — Dashboard + Subscription Management (FIRST MILESTONE COMPLETE — Phase 3 remaining)
- Task 3: Change Requests — 11 items from Enzo (NOT STARTED)
- Task 4: Briefing 02 — Coach View / Client Profile (NOT STARTED)

## Task 2 Details (Briefing 01)
- First milestone deployed and verified on crm.tob.sh (2026-03-11)
- PRs: #14 (main feature), #16 (delete mutation fix)
- Working: 3 action buttons (Pause/Extend/Payment), 5 Smart Views, 6 custom fields, timeline
- Remaining (Phase 3): guided workflows, list columns, guardrails, linked objects, role permissions
- Deploy scripts run via docker-compose setup-subscriptions service (Pablo's suggestion)
- Smart View filters: SELECT needs JSON arrays, IS_RELATIVE needs DIRECTION_AMOUNT_UNIT format
- Delete mutation: use $id: String! not $id: ID! for Twenty API

## Master Document
- `tob-twenty-development-guide.md` is the MASTER document (the rulebook)
- Quality algorithm: WRITE → TEST (SMOKE+MAT+AT+GUI) → OPTIMIZE → RE-TEST → DONE
- Full app QA test happens AFTER development, BEFORE deployment
- AI stops after each task, waits for human review
- Daily EOD updates to Enzo expected

## Documentation Files (saved in memory/docs/ — keep synced)
- `docs/tob-twenty-development-guide.md` — MASTER DOCUMENT (the rulebook)
- `docs/project-control.md` — task tracking (living document, update frequently)
- `docs/tob-twenty-starting-guide-about-project.md` — project overview & context
- `docs/GUIDE-FOR-PROJECT-DOCUMENTATION.md` — universal framework/template
- **Rule: Always ask "Should I save to memory?" before updating these. Only save after permission.**

## Key Technical Notes
- Windows long paths: `git config --global core.longpaths true` (required)
- Missing file fix: created `delete-universal-flat-entity-from-universal-flat-entity-and-related-entity-maps-through-mutation-or-throw.util.ts`
- Local login fix: had to manually insert workspaceMember records (seed partially failed)
- GraphQL codegen: `npx nx run twenty-front:graphql:generate --configuration=metadata`
- Cloudflare blocks API calls — work through code + deployment, not direct API
