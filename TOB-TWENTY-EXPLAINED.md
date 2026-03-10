# TOB Twenty — The Complete Guide (Down to the Bones)

Everything you need to know about this project, from the business context down to every technical detail.

---

## Table of Contents

1. [The Company: The Original Body (TOB)](#1-the-company-the-original-body-tob)
2. [The Problem: Island Solutions](#2-the-problem-island-solutions)
3. [The Solution: TOB OS](#3-the-solution-tob-os)
4. [What is Twenty CRM?](#4-what-is-twenty-crm)
5. [What is a Fork? What is tob-twenty?](#5-what-is-a-fork-what-is-tob-twenty)
6. [The People and Their Roles](#6-the-people-and-their-roles)
7. [The Data Pipeline: How Data Flows](#7-the-data-pipeline-how-data-flows)
8. [The Technical Architecture (Everything)](#8-the-technical-architecture-everything)
9. [The Monorepo: Every Package Explained](#9-the-monorepo-every-package-explained)
10. [How the Fork Works: StGit Patches](#10-how-the-fork-works-stgit-patches)
11. [How Deployment Works: Push to Live](#11-how-deployment-works-push-to-live)
12. [The Server: What's Running on crm.tob.sh](#12-the-server-whats-running-on-crmtobsh)
13. [Custom Objects & the Metadata System](#13-custom-objects--the-metadata-system)
14. [The GraphQL API](#14-the-graphql-api)
15. [The setup-data-model.sh Script (What's Already Built)](#15-the-setup-data-modelsh-script-whats-already-built)
16. [AI/Automation: Claude Code in CI](#16-aiautomation-claude-code-in-ci)
17. [The Three Phases: What Gets Built When](#17-the-three-phases-what-gets-built-when)
18. [The Unique Identifier Problem](#18-the-unique-identifier-problem)
19. [Listmonk & Email Marketing](#19-listmonk--email-marketing)
20. [N8N, Make, Zapier — The Automation Question](#20-n8n-make-zapier--the-automation-question)
21. [Key Commands You'll Use Every Day](#21-key-commands-youll-use-every-day)
22. [How to Work With This Codebase](#22-how-to-work-with-this-codebase)
23. [Connection to TOB Events](#23-connection-to-tob-events)
24. [Glossary: Every Term Explained](#24-glossary-every-term-explained)

---

## 1. The Company: The Original Body (TOB)

TOB (The Original Body AG) is a Swiss company that sells:

- **Coaching programs** — personal coaching sessions with trainers
- **Certification programs** — professional certifications customers can earn
- **Subscriptions** — ongoing monthly/yearly access to the TOB app, content, and sessions

They have customers who go through a lifecycle:
1. First hear about TOB (marketing)
2. Attend a free event or webinar (lead generation)
3. Talk to a salesperson (sales)
4. Buy a program (contracting)
5. Get set up with credentials and access (onboarding)
6. Use the product on an active subscription (active customer)
7. Upgrade, change, or pause (subscription management)
8. Leave (offboarding)

Each step of this lifecycle was handled by a **different tool** — that's the problem.

---

## 2. The Problem: Island Solutions

Enzo (the business/product lead) calls these "island solutions" — separate software tools that each do one thing but can't talk to each other. Here's what TOB was using:

| Tool | Purpose | Problem |
|------|---------|---------|
| **FunnelBox** | Marketing CRM — captures new leads, nurtures them through email sequences | Only knows about marketing. Doesn't know if someone became a customer. |
| **Close.io** | Sales CRM — tracks deals, follow-ups, closing | Doesn't know about marketing leads or contracts after sale. |
| **Bexio** | Swiss finance tool — invoices, contracts, accounting | Doesn't know about sales or marketing. Finance team uses it separately. |
| **Stripe** | Payment processing — charges credit cards | Has its own customer ID system. Knows about payments but nothing else. |
| **WordPress** | Website — has subscription data for the TOB app | Separate database. Not connected to CRM or finance. |
| **N8N** | Automation — connects tools together via workflows | Extra complexity. One more thing to maintain. |
| **Make / Zapier** | More automation tools (same as N8N, different platforms) | Even more scattered automations to maintain. |
| **Palantir Foundry** | Data platform — data pipelines, transformations, dashboards | Company is migrating away from it (expensive, complex). |
| **Gmail** | Sending individual emails to customers | Not scalable. No tracking. |
| **MariaDB** | Raw database — stores the original source-of-truth data | Raw, unprocessed. Needs transformation before it's usable. |

### Real-world pain this causes:

**Example 1: The duplicate person problem.**
A customer uses `john@gmail.com` to sign up for a free webinar (enters FunnelBox). Then they buy a coaching program using `john.doe@company.com` (enters Close.io and Bexio). Stripe sees `John D.` as the payer. Now you have THREE records for the same person across different tools. The finance team sends two invoices. Customer support can't see the full history. Marketing sends duplicate emails.

**Example 2: The "where is this customer?" problem.**
A customer calls and says "I didn't get my credentials." Customer support has to check: FunnelBox (are they a lead?), Close.io (did they buy?), Bexio (was the invoice sent?), WordPress (do they have a subscription?), email (were credentials sent?). Each tool has a different interface, different login, different data format.

**Example 3: The automation spaghetti.**
When a new contract comes in, an N8N automation fires. It creates a record in one place, a Make automation handles the invoice, a Zapier automation sends the credentials email, and someone manually updates a spreadsheet. If one automation breaks, nobody knows until a customer complains.

---

## 3. The Solution: TOB OS

Instead of 10+ separate tools, build **one platform** that handles everything. Enzo calls it:

- **TOB OS** (TOB Operating System) — one system for all business operations
- Or **ERP** (Enterprise Resource Planning) — the industry term for a single system that manages an entire business

The center of TOB OS is **Twenty CRM** — an open-source CRM that they can customize because they have the complete source code.

The vision:

```
                          ┌─────────────────────────────────────┐
                          │           TOB OS (Twenty)           │
                          │                                     │
                          │  Contacts    Contracts    Invoices  │
    Raw Data ──> Dexter ──│  Companies   Subscriptions          │──> Listmonk (emails)
    (MariaDB)  (pipelines)│  Sales       Coaching      Notes    │──> Twilio (SMS)
                          │  Marketing   Certificates  Tasks    │──> TOB App (credentials)
                          │  Dashboards  Workflows     Reports  │──> Stripe (payments)
                          │                                     │
                          └─────────────────────────────────────┘
                                    One database.
                                    One interface.
                                    One source of truth.
```

---

## 4. What is Twenty CRM?

Twenty is an **open-source CRM application** developed by a company called Twenty (https://twenty.com). Think of it as an open-source alternative to Salesforce or HubSpot.

What it does out of the box:
- **Contacts & Companies** — store and manage people and organizations
- **Opportunities** — track sales deals through a pipeline
- **Tasks & Notes** — assign work, take notes on interactions
- **Calendar integration** — sync with Google/Microsoft calendars
- **Email integration** — connect Gmail/Outlook, see email threads on contact records
- **Custom Objects** — create ANY type of data entity (Contract, Subscription, Invoice, etc.) through the UI or API
- **Custom Fields** — add fields of any type (text, number, date, currency, select, multi-select, relation, boolean, etc.)
- **Views** — filtered/sorted lists, Kanban boards, group-by views
- **Workflows** — built-in automation engine with triggers, conditions, branches, and actions
- **GraphQL API** — programmatic access to everything
- **Webhooks** — fire HTTP requests when data changes
- **Import/Export** — CSV import, API-based bulk operations
- **Search** — full-text search across all records
- **Permissions** — role-based access control, field-level permissions
- **i18n** — multi-language support
- **Self-hostable** — you can run it on your own server

What makes it special for TOB:
- It's **open source** — TOB owns a copy of the code and can modify anything
- It has **custom objects** — they can create Contract, Subscription, Invoice entities without writing code
- It has a **GraphQL API** — Dexter pipelines can push data directly into it
- It has **workflows** — can potentially replace N8N/Make automations
- It's **actively developed** — the upstream Twenty team releases updates frequently

---

## 5. What is a Fork? What is tob-twenty?

### What is a fork?

A **fork** is a copy of someone else's software repository that you own and control.

Analogy: Imagine a publishing company releases a textbook. You photocopy the entire book. Now you have your own copy. You can:
- Write in the margins (add customizations)
- Add new chapters (add features)
- Cross out sections (remove things you don't need)
- And when the publisher releases a 2nd edition, you can get the new edition and re-apply your notes to it

That's exactly what tob-twenty is:

- **Upstream**: `twentyhq/twenty` — the original Twenty repository, maintained by the Twenty team
- **Fork**: `the-original-body/tob-twenty` — TOB's copy, where they add their customizations

The fork is stored on GitHub at: `https://github.com/the-original-body/tob-twenty`

### What's in the fork that's NOT in upstream?

Looking at the actual git history, TOB has added:

1. **`deploy/` directory** — Docker Compose configuration, database init scripts, data model setup
2. **`.github/workflows/docker-publish.yml`** — CI/CD pipeline that builds and pushes Docker images
3. **`.github/workflows/claude.yml`** — Claude Code AI agent that can respond to GitHub issues/comments
4. **`setup-data-model.sh`** — Script that creates custom objects (CommunicationLog, AI Profile) and extends the Person object with new fields
5. **`CLAUDE.md`** — Instructions for the Claude Code AI agent
6. **Various configuration files** — MCP servers, VS Code settings, Cursor rules

---

## 6. The People and Their Roles

### Enzo Becker — Product Owner / Business Expert

- **His role**: He defines WHAT gets built. He knows the business processes inside-out.
- **What he's done**: Interviewed the finance department, customer support, and customer onboarding teams. Documented all processes. Created a brainstorming document (in German, will be translated).
- **What he provides**: Business requirements, process definitions, mock-ups, priority decisions.
- **Contact him when**: You need to know WHAT to build, HOW a business process should work, or WHICH feature to build next.
- **Key quote from meeting**: "I'm the first person to talk about that" — he's the go-to for all business logic questions.

### Johannes Schulz — Technical Lead / Architect

- **His role**: He built the current technical infrastructure. He set up the fork, the deployment pipeline, the server, the StGit workflow.
- **What he's done**: Set up Twenty on the server, configured Docker Compose, created the GitHub Actions CI/CD, managed the Foundry migration.
- **Status**: Going on leave. This meeting was his handover to you and Pablo.
- **Contact him when**: You have deep technical questions about the infrastructure or deployment.

### Pablo Perez — Data Engineer / Infrastructure

- **His role**: He handles the DATA side — getting raw data cleaned, transformed, and into Twenty.
- **What he's done**: Already has customer data and contract data in PostgreSQL. Rebuilt Foundry pipelines using Dexter. Has WordPress subscription data. Prepared for Bexio financial data (waiting on API key).
- **What he provides**: Clean, processed data ready to be imported into Twenty.
- **Contact him when**: You need data pushed into Twenty, need a new data source connected, or need something done on the server.
- **Key fact**: He's rebuilding what Foundry used to do, using **Dexter** (a data pipeline orchestration tool).

### Mariam Garchagudashvili — Listmonk Integration

- **Her role**: Set up Listmonk (self-hosted email marketing tool) and connected it to Twenty via N8N.
- **What she's done**: Deployed Listmonk, created API user, set up N8N workflow (Twenty person created -> N8N -> Listmonk subscriber). Not fully tested yet.
- **Status**: Going on leave with Johannes. Her work needs documentation and testing before she leaves.

### You (Saba) — Builder / Developer

- **Your role**: Implement features in Twenty CRM. Configure custom objects, set up data schemas, build UI customizations, create the user experience that Enzo defines.
- **Key responsibilities**:
  - Configure Twenty for TOB's business needs
  - Work with Pablo to import data
  - Implement features defined by Enzo
  - Modify the fork when custom code changes are needed
  - Push to main to deploy

### Andre / Armin — Infrastructure / Management

- **Andre**: Manages server infrastructure, provides API keys. Pablo is waiting on him for the Bexio API key.
- **Armin**: Management. Suggested using HiROS for digital fingerprinting (Enzo thinks it's overkill for now). Wanted Enzo to prepare mockups.

### Lasha & Nico — Existing Automations

- They maintain existing N8N/Make automations for finance and customer onboarding processes.
- Their work stays as-is for now. No migration planned unless there's a specific problem.

---

## 7. The Data Pipeline: How Data Flows

Here is the complete data flow from raw source to user-facing CRM:

### Step 1: Raw Data Sources

```
MariaDB (raw database)
├── Customer records (names, emails, phones, addresses)
├── Contract records (product, price, date, status)
└── Other raw business data

WordPress Database
└── Subscription records (active subscriptions, plan type, start/end dates)

Bexio API (Swiss finance tool)
├── Invoices
├── Payment records
└── Accounting data

Stripe API
├── Payment transactions
├── Customer IDs
└── Subscription billing data

Close.io API (current sales CRM)
├── Sales leads
├── Deal stages
└── Communication history
```

### Step 2: Dexter Processes the Data (Pablo's Job)

```
Raw Sources ──> Dexter Pipelines ──> PostgreSQL (clean, processed data)
```

**What is Dexter?** A data pipeline orchestration tool. It replaces what Palantir Foundry used to do: take raw, messy data from multiple sources, clean it up, transform it, join it together, and output clean data ready for use.

**What Dexter does specifically:**
- Reads from MariaDB, WordPress, Bexio API, Stripe API
- Cleans data (removes duplicates, fixes formatting, standardizes fields)
- Transforms data (joins customer + contract + subscription records)
- Materializes the results into PostgreSQL tables

**Pablo's Dexter pipelines already process:**
- Customer data (contacts)
- Contract data
- WordPress subscription data
- Bexio financial data (pending API key from Andre)

### Step 3: PostgreSQL to Twenty CRM (Your Job + Pablo's)

```
PostgreSQL (processed data) ──> Twenty GraphQL API ──> Twenty CRM
```

The processed data gets pushed into Twenty through its GraphQL API. This can be done:
- Via Dexter pipelines directly (Pablo configures them to write to Twenty's API)
- Via manual import scripts
- Via the setup-data-model.sh script (for schema setup)

### Step 4: Twenty CRM Connects Outward

```
Twenty CRM ──> Listmonk (email marketing)
            ──> Twilio / WhatsApp (messaging)
            ──> TOB App (credential provisioning)
            ──> Webhooks (any external system)
            ──> Workflows (internal automation)
```

---

## 8. The Technical Architecture (Everything)

### Tech Stack — Frontend

| Technology | What it does |
|-----------|-------------|
| **React 18** | UI framework — renders the interface |
| **TypeScript** | Typed JavaScript — catches bugs at compile time |
| **Recoil** | State management — stores app state (atoms, selectors, atom families) |
| **Emotion** | CSS-in-JS — styles components using JavaScript (styled-components pattern) |
| **Vite** | Build tool — fast development server, hot module reloading |
| **Apollo Client** | GraphQL client — manages API requests and caching |
| **Lingui** | i18n — internationalization/translation |

### Tech Stack — Backend

| Technology | What it does |
|-----------|-------------|
| **NestJS** | Backend framework — organizes code into modules, controllers, services |
| **TypeORM** | ORM — maps TypeScript classes to PostgreSQL tables |
| **PostgreSQL 16** | Primary database — stores all CRM data |
| **Redis 7** | Cache & session store — also used for BullMQ job queue |
| **GraphQL (Yoga)** | API layer — code-first GraphQL with resolvers |
| **BullMQ** | Background job processor — handles async tasks (email sending, data processing) |
| **ClickHouse** | Analytics database (optional) — for heavy reporting queries |

### Tech Stack — Infrastructure

| Technology | What it does |
|-----------|-------------|
| **Docker** | Containerization — packages the app into a portable container |
| **Docker Compose** | Orchestration — runs multiple containers (app, db, redis, worker) together |
| **GitHub Actions** | CI/CD — builds Docker images on push to main |
| **GHCR** | GitHub Container Registry — stores built Docker images |
| **Watchtower** | Auto-updater — checks for new Docker images every 5 minutes and deploys them |
| **Cloudflare Access** | Security — adds authentication layer in front of crm.tob.sh |
| **Nx** | Monorepo tool — manages builds, tests, dependencies between packages |
| **Yarn 4** | Package manager — installs JavaScript dependencies |
| **StGit** | Patch management — manages fork customizations as a stack of patches |

---

## 9. The Monorepo: Every Package Explained

The repository is a **monorepo** — one repo containing multiple packages. Each package is in the `packages/` directory:

```
packages/
├── twenty-front/          # THE MAIN FRONTEND APPLICATION
│   ├── src/
│   │   ├── modules/       # Feature modules (people, companies, opportunities, etc.)
│   │   ├── pages/         # Route-level page components
│   │   ├── generated/     # Auto-generated GraphQL types
│   │   └── ...
│   └── ...
│
├── twenty-server/         # THE MAIN BACKEND APPLICATION
│   ├── src/
│   │   ├── engine/        # Core engine (metadata, object records, workspace)
│   │   ├── modules/       # Feature modules (auth, user, messaging, calendar, etc.)
│   │   ├── database/      # Migrations, commands, typeorm config
│   │   └── ...
│   └── ...
│
├── twenty-ui/             # SHARED UI COMPONENT LIBRARY
│   └── src/               # Buttons, inputs, modals, layouts, icons, themes
│
├── twenty-shared/         # SHARED TYPES AND UTILITIES
│   └── src/               # isDefined(), isNonEmptyString(), common types
│                          # MUST be built first (other packages depend on it)
│
├── twenty-emails/         # EMAIL TEMPLATES
│   └── src/               # React Email templates for invite, password reset, etc.
│
├── twenty-website/        # DOCUMENTATION WEBSITE (Next.js)
│   └── ...                # Not relevant for your daily work
│
├── twenty-docker/         # DOCKER CONFIGURATION
│   └── twenty/
│       ├── Dockerfile     # The Dockerfile used to build the production image
│       └── entrypoint.sh  # Container startup script
│
├── twenty-e2e-testing/    # END-TO-END TESTS
│   └── ...                # Playwright tests
│
├── twenty-zapier/         # ZAPIER INTEGRATION
│   └── ...                # Zapier app definition
│
├── twenty-sdk/            # JavaScript/TypeScript SDK for the Twenty API
│   └── ...
│
├── twenty-apps/           # TWENTY APPS (serverless functions, integrations)
│   ├── hello-world/       # Example app
│   └── community/         # Community-contributed apps
│       ├── fireflies/     # Meeting transcript integration
│       ├── stripe-synchronizer/  # Stripe sync
│       ├── linkedin-browser-extension/  # LinkedIn integration
│       └── ...
│
├── twenty-eslint-rules/   # Custom ESLint rules for code quality
├── twenty-utils/          # Build utilities and dev environment setup
├── twenty-cli/            # CLI tool (deprecated)
├── twenty-docs/           # Documentation source (Mintlify)
└── create-twenty-app/     # Scaffolding tool for new Twenty apps
```

### Build Order (Dependencies)

```
twenty-shared (must be built FIRST — everything depends on it)
     ↓
twenty-ui ──────────┐
     ↓              ↓
twenty-front    twenty-server
```

Build command: `npx nx build twenty-shared` must run before building front or server.

---

## 10. How the Fork Works: StGit Patches

### What is StGit?

**StGit** (Stacked Git) is a tool that sits on top of Git. Instead of making regular commits, you create **patches** — small, logical changes that stack on top of the upstream code.

### Why use StGit instead of regular Git?

With regular Git, when you merge upstream updates, your changes get mixed in with the upstream commits. Over time, it becomes impossible to tell "what did WE change vs. what came from upstream?"

With StGit:
```
[Upstream Twenty code - latest version]
  + [Patch 1: TOB deployment configuration]
  + [Patch 2: Custom data model setup script]
  + [Patch 3: Docker publish workflow]
  + [Patch 4: Claude Code CI integration]
  + [Patch 5: Custom UI for contract management]
```

Each patch is a clean, isolated change. You can:
- **See exactly what TOB modified** by listing the patches
- **Update upstream** by pulling new Twenty code and re-applying patches on top
- **Add new customizations** by creating new patches
- **Remove customizations** by dropping patches
- **Reorder patches** to manage dependencies

### The workflow:

```
1. Pull upstream updates:    stg pull (gets latest Twenty code)
2. Patches re-apply:         Your changes are stacked back on top
3. Resolve conflicts:        If upstream changed something you also changed
4. Push to GitHub:           git push (triggers build + deploy)
```

There's a full skill documented in `.claude/skills/managing-stgit-fork/` with detailed guides for:
- Setup guide
- Patch management
- Sync workflow
- Troubleshooting

---

## 11. How Deployment Works: Push to Live

This is the complete pipeline from code change to live server:

```
Step 1: You push to the main branch on GitHub
        ↓
Step 2: GitHub Actions detects the push
        (file: .github/workflows/docker-publish.yml)
        ↓
Step 3: GitHub Actions builds a Docker image
        - Uses the Dockerfile at packages/twenty-docker/twenty/Dockerfile
        - Builds with REACT_APP_SERVER_BASE_URL=https://crm.tob.sh
        - Extracts APP_VERSION from the codebase automatically
        - Uses GitHub Actions cache for faster builds
        ↓
Step 4: Image is pushed to GHCR (GitHub Container Registry)
        - Tagged as: ghcr.io/the-original-body/tob-twenty:latest
        - Also tagged with the short commit SHA
        ↓
Step 5: Watchtower (running on the server) checks every 5 minutes
        "Is there a new version of ghcr.io/the-original-body/tob-twenty:latest?"
        ↓
Step 6: Watchtower finds the new image → pulls it → restarts containers
        ↓
Step 7: Live on crm.tob.sh within ~5 minutes of pushing
```

**Important**: The build ignores changes to `deploy/**` and `**.md` files (see the `paths-ignore` in the workflow). So editing documentation or deployment config won't trigger a rebuild.

### What is Docker?

Docker packages an application and ALL its dependencies into a standardized unit called a **container**. Think of it as a shipping container: no matter what's inside, it fits on any ship (server) the same way.

A **Docker image** is the blueprint (like a class in programming).
A **Docker container** is a running instance of that image (like an object).

### What is Watchtower?

Watchtower is a simple tool that runs on the server. Every 5 minutes, it:
1. Checks GHCR: "Is there a new version of the Docker image?"
2. If yes: pulls the new image, stops the old container, starts a new one
3. If no: does nothing

This means **zero-downtime deployment** — no SSH into the server, no manual restarts.

---

## 12. The Server: What's Running on crm.tob.sh

The server runs Docker Compose with these services (from `deploy/docker-compose.yml`):

```
┌─────────────────────────────────────────────────────────┐
│                    crm.tob.sh server                     │
│                                                         │
│  ┌──────────────────┐  ┌──────────────────┐            │
│  │  twenty-server   │  │  twenty-worker   │            │
│  │  (NestJS app)    │  │  (background     │            │
│  │  Port 3003→3000  │  │   job processor) │            │
│  │                  │  │                  │            │
│  │  Handles:        │  │  Handles:        │            │
│  │  - GraphQL API   │  │  - Email sending │            │
│  │  - REST API      │  │  - Data sync     │            │
│  │  - Auth          │  │  - Cron jobs     │            │
│  │  - Webhooks      │  │  - Async tasks   │            │
│  └────────┬─────────┘  └────────┬─────────┘            │
│           │                     │                       │
│           ├─────────────────────┤                       │
│           ↓                     ↓                       │
│  ┌──────────────────┐  ┌──────────────────┐            │
│  │  PostgreSQL 16   │  │  Redis 7         │            │
│  │  Port 5435→5432  │  │  (internal)      │            │
│  │                  │  │                  │            │
│  │  Stores:         │  │  Stores:         │            │
│  │  - All CRM data  │  │  - Cache         │            │
│  │  - Custom objects│  │  - Sessions      │            │
│  │  - Metadata      │  │  - Job queues    │            │
│  │  - Migrations    │  │  (BullMQ)        │            │
│  │  - Listmonk DB   │  │                  │            │
│  └──────────────────┘  └──────────────────┘            │
│                                                         │
│  ┌──────────────────┐                                   │
│  │  Watchtower      │                                   │
│  │  Checks GHCR     │                                   │
│  │  every 5 min     │                                   │
│  └──────────────────┘                                   │
│                                                         │
│  ┌──────────────────┐                                   │
│  │  Listmonk        │                                   │
│  │  (email tool)    │                                   │
│  │  Uses same       │                                   │
│  │  Postgres (own   │                                   │
│  │  database)       │                                   │
│  └──────────────────┘                                   │
└─────────────────────────────────────────────────────────┘
              ↑
        Cloudflare Access
        (authentication layer)
              ↑
         The Internet
```

### Key details from the actual docker-compose.yml:

- **PostgreSQL** is exposed on port `5435` externally (maps to 5432 internally) — this is how Dexter pipelines can write to it
- **PostgreSQL** creates a `listmonk` database on first startup (from `init-db.sql`)
- **twenty-server** runs on port `3003` externally (maps to 3000 internally)
- **twenty-worker** runs the same Docker image but with command `yarn worker:prod` — it processes background jobs instead of serving HTTP
- **SMTP** is configured with Mailgun (`smtp.eu.mailgun.org`) for sending emails
- **Storage** is local (file uploads stored in a Docker volume)
- **Multiworkspace** is disabled — single workspace for TOB
- **Serverless** is disabled — no serverless functions
- **Migrations** run automatically on the server container (`DISABLE_DB_MIGRATIONS: false`)

### Environment Variables

From `.env.example`:
```
TAG=latest
IMAGE=ghcr.io/the-original-body/tob-twenty
SERVER_URL=https://crm.tob.sh
APP_SECRET=<random 32-byte base64>
PG_DATABASE_USER=twenty
PG_DATABASE_PASSWORD=<strong password>
EMAIL_DRIVER=smtp
EMAIL_SMTP_HOST=smtp.eu.mailgun.org
EMAIL_FROM_ADDRESS=noreply@notification.original-body.com
EMAIL_FROM_NAME=TOB CRM
TWENTY_API_KEY=<api key for external access>
CF_ACCESS_CLIENT_ID=<cloudflare access credentials>
CF_ACCESS_CLIENT_SECRET=<cloudflare access credentials>
```

### Cloudflare Access

The server sits behind **Cloudflare Access** — this means you can't just visit `crm.tob.sh` without authentication. You need either:
- A Cloudflare Access account (for browser access)
- CF-Access-Client-Id and CF-Access-Client-Secret headers (for API access)

The `setup-data-model.sh` script includes these headers in its API calls.

---

## 13. Custom Objects & the Metadata System

This is one of the most important things to understand. Twenty has a **metadata-driven architecture**, which means:

- You don't have to write code to create new data types
- You can create **custom objects** (like "Contract", "Subscription", "Invoice") through the UI or API
- Each custom object gets its own database table, GraphQL type, API endpoints, views, and permissions — automatically

### How it works:

```
You define metadata:
  "I want an object called Contract with fields: customer, amount, startDate, status"
        ↓
Twenty's metadata engine:
  1. Creates a PostgreSQL table for contracts
  2. Generates GraphQL types (Contract, ContractInput, ContractFilter, etc.)
  3. Adds API endpoints (createContract, updateContract, findContracts, etc.)
  4. Makes it available in the UI (views, filters, sorts, Kanban)
  5. Enables search, import/export, webhooks, workflows
        ↓
Result: A fully functional entity without writing a single line of code
```

### Field Types Available

| Type | What it stores | Example |
|------|---------------|---------|
| TEXT | String | "John Doe" |
| NUMBER | Numeric value | 1500.00 |
| BOOLEAN | True/false | Marketing consent: true |
| DATE_TIME | Timestamp | 2024-03-15T10:30:00Z |
| SELECT | Single choice from options | Status: "Active" |
| MULTI_SELECT | Multiple choices | Tags: ["Premium", "VIP"] |
| CURRENCY | Money with currency code | Amount: 500 EUR |
| LINK | URL | "https://example.com" |
| RELATION | Link to another object | Contract -> Person |
| EMAIL | Email address | "john@example.com" |
| PHONE | Phone number | "+41791234567" |
| RATING | Star rating | 4/5 |
| RICH_TEXT | Formatted text | Notes with bold, lists, etc. |
| ADDRESS | Physical address | Full address with components |
| ARRAY | List of values | Tags: ["tag1", "tag2"] |

### How to create a custom object

**Method 1: Through the UI**
1. Go to Settings > Data Model
2. Click "Create Object"
3. Define name, fields, relations
4. Done — it's immediately available

**Method 2: Through the GraphQL API** (what `setup-data-model.sh` does)
```graphql
mutation {
  createOneObject(input: {
    object: {
      nameSingular: "contract"
      namePlural: "contracts"
      labelSingular: "Contract"
      labelPlural: "Contracts"
      icon: "IconFileText"
      description: "Customer contracts"
    }
  }) {
    id
  }
}
```

Then add fields:
```graphql
mutation {
  createOneField(input: {
    field: {
      objectMetadataId: "<contract-object-id>"
      name: "amount"
      label: "Amount"
      type: CURRENCY
      icon: "IconCurrencyEuro"
    }
  }) {
    id
  }
}
```

Then add relations:
```graphql
mutation {
  createOneField(input: {
    field: {
      objectMetadataId: "<person-object-id>"
      name: "contracts"
      label: "Contracts"
      type: RELATION
      relationCreationPayload: {
        type: ONE_TO_MANY
        targetObjectMetadataId: "<contract-object-id>"
        targetFieldLabel: "Person"
        targetFieldIcon: "IconUser"
      }
    }
  }) {
    id
  }
}
```

---

## 14. The GraphQL API

Twenty exposes a **GraphQL API** for everything. This is the primary way to interact with the system programmatically.

### What is GraphQL?

GraphQL is an API query language. Instead of REST (where each endpoint returns a fixed structure), GraphQL lets you ask for exactly the data you need.

**REST example**: `GET /api/contacts/123` — returns everything about contact 123, whether you need it or not.

**GraphQL example**:
```graphql
query {
  person(id: "123") {
    name { firstName lastName }
    emails { primaryEmail }
    contracts {
      edges {
        node { amount status }
      }
    }
  }
}
```
Returns ONLY the name, email, and contract amount/status. Nothing more.

### Two GraphQL endpoints:

1. **`/api`** — The main data API (CRUD on all objects)
2. **`/metadata`** — The metadata API (create/modify objects, fields, relations)

### Authentication:

```
Authorization: Bearer <TWENTY_API_KEY>
```

If behind Cloudflare Access, also add:
```
CF-Access-Client-Id: <id>
CF-Access-Client-Secret: <secret>
```

### Common operations:

**Create a record:**
```graphql
mutation {
  createPerson(input: {
    name: { firstName: "John", lastName: "Doe" }
    emails: { primaryEmail: "john@example.com" }
  }) {
    id
  }
}
```

**Query records:**
```graphql
query {
  people(filter: { emails: { primaryEmail: { eq: "john@example.com" } } }) {
    edges {
      node {
        id
        name { firstName lastName }
      }
    }
  }
}
```

**Update a record:**
```graphql
mutation {
  updatePerson(id: "123", input: {
    phones: { primaryPhoneNumber: "+41791234567" }
  }) {
    id
  }
}
```

### After schema changes:

When you modify the GraphQL schema (add objects, fields, etc.), regenerate types:
```bash
npx nx run twenty-front:graphql:generate
npx nx run twenty-front:graphql:generate --configuration=metadata
```

---

## 15. The setup-data-model.sh Script (What's Already Built)

The file `deploy/setup-data-model.sh` is a script that creates custom objects in Twenty via the GraphQL API. This shows what's already been planned/built:

### Custom Object 1: Communication Log

Tracks all communication events across channels.

| Field | Type | Purpose |
|-------|------|---------|
| channel | SELECT | CALL, SMS, WHATSAPP, EMAIL |
| direction | SELECT | INBOUND, OUTBOUND |
| status | SELECT | QUEUED, SENT, DELIVERED, READ, FAILED |
| externalId | TEXT | ID from the external system (e.g., Twilio message ID) |
| contentSummary | TEXT | Brief summary of the communication |
| sentimentScore | NUMBER | AI-generated sentiment analysis score |

**Relation**: Person -> CommunicationLog (one-to-many: a person has many communication logs)

### Custom Object 2: AI Profile

AI-generated profile summary for a person.

| Field | Type | Purpose |
|-------|------|---------|
| profileSummary | TEXT | AI-generated summary of the person |
| lastUpdated | DATE_TIME | When the AI last updated this profile |

**Relation**: Person -> AI Profile (one-to-many)

### Extended Person Fields

The built-in Person object has been extended with:

| Field | Type | Purpose |
|-------|------|---------|
| listmonkUUID | TEXT | Links to the Listmonk email marketing subscriber |
| marketingConsent | BOOLEAN | Whether they opted in to marketing emails |
| whatsAppStatus | TEXT | WhatsApp delivery/read status |
| emailValid | BOOLEAN | Whether their email has been verified |

### What's NOT yet built (your job):

The script doesn't yet create:
- **Contract** object
- **Subscription** object
- **Invoice** object
- **Product/Program** object
- Any sales pipeline customizations
- Workflow automations

---

## 16. AI/Automation: Claude Code in CI

The repository has a Claude Code GitHub Action (`.github/workflows/claude.yml`) that allows AI-assisted development directly from GitHub issues and pull requests.

### How it works:

1. Someone creates a GitHub issue or comments `@claude` on an issue/PR
2. GitHub Actions triggers the Claude Code workflow
3. Claude Code (using the Opus model) gets access to the full codebase
4. It can edit files, run tests, run builds, create PRs
5. It has access to PostgreSQL and Redis in CI for running tests

### What it can do:
- Fix bugs described in issues
- Implement features from issue descriptions
- Review pull requests
- Answer questions about the codebase
- Run tests and verify changes

### Cross-repo support:
There's also a `claude-cross-repo` job that allows other TOB repositories (like tob-foundry-migration) to dispatch work to this repo's Claude Code instance.

### MCP Servers (.mcp.json):

The project configures three MCP (Model Context Protocol) servers:

1. **postgres** — Direct database access for Claude Code
2. **playwright** — Browser automation for testing
3. **context7** — Documentation lookup for libraries

---

## 17. The Three Phases: What Gets Built When

Enzo defined these priorities based on business impact:

### Phase 1: Contracting & Subscription Management (FIRST PRIORITY)

**Why first?** The admin/finance team has immediate problems. Manual processes are causing errors, delays, and customer complaints.

**What needs to happen:**

1. **Custom objects**: Create Contract, Subscription, Invoice, Product/Program objects in Twenty
2. **Data import**: Import existing customer, contract, and subscription data from Pablo's Postgres
3. **Views**: Set up filtered views for the finance team (active contracts, pending invoices, expiring subscriptions)
4. **Workflows**: Automate the contract lifecycle:
   - New contract comes in -> Create record -> Generate invoice -> Send to customer
   - Customer pays -> Activate subscription -> Send credentials
   - Subscription changes -> Update records -> Notify team
   - Customer cancels -> Deactivate -> Offboard

**The end-to-end customer lifecycle to implement:**

```
New Customer Signs Up
       ↓
Contract Created in Twenty
       ↓
Invoice Generated (via Bexio integration)
       ↓
Customer Pays (via Stripe)
       ↓
Credentials Sent (TOB app access, coaching sessions)
       ↓
Active Subscription
       ↓
Changes (upgrade, downgrade, pause, extend)
       ↓
Offboarding (cancellation, expiry)
```

### Phase 2: Sales CRM (Replace Close.io)

**What needs to happen:**

1. **Opportunities/Deals**: Configure the built-in Opportunity object for TOB's sales process
2. **Sales Pipeline**: Define stages (Lead -> Contacted -> Proposal -> Negotiation -> Won/Lost)
3. **Data import**: Migrate Close.io data into Twenty
4. **Views**: Kanban board for sales pipeline, filtered lists for salespeople
5. **Automation**: Follow-up reminders, task creation, lead scoring

### Phase 3: Marketing (Replace FunnelBox + use Listmonk)

**What needs to happen:**

1. **Listmonk integration**: Full bi-directional sync between Twenty contacts and Listmonk subscribers
2. **Lead management**: Lead stages (Cold -> Warm -> Hot -> Sales Qualified)
3. **Email campaigns**: Targeted email sends to segmented groups
4. **Analytics**: Open rates, click rates, conversion tracking
5. **Mass email**: Handle 5,000+ email sends with good delivery rates

---

## 18. The Unique Identifier Problem

This is a critical data quality issue that hasn't been solved yet.

### The problem:

A single real person can have multiple records across different systems:

```
FunnelBox:  john@gmail.com, "John", signed up for webinar
Close.io:   john.doe@company.com, "John Doe", bought coaching
Stripe:     "J. Doe", card ending 4242, customer_cus_123
Bexio:      "Doe, John", invoice INV-001
WordPress:  johnd, "John D", subscription active
```

These are ALL the same person but there's no single identifier linking them.

### Proposed solutions (from the meeting):

1. **HiROS Digital Fingerprinting** (Armin's suggestion)
   - Tracks website visitors with browser fingerprinting
   - Creates a unique ID per real person across sessions
   - Enzo thinks: overkill for now, only relevant for marketing/sales tracking

2. **Stripe Customer ID** (Enzo's lean)
   - Everyone who pays gets a Stripe customer ID (`cus_xxxxx`)
   - Already a unique identifier for paying customers
   - Limitation: doesn't cover leads who haven't paid yet

3. **CRM-Generated ID** (simplest)
   - Twenty assigns a UUID when a Person is created
   - All other systems reference this ID
   - Limitation: requires mapping from existing systems

4. **Composite approach** (most likely)
   - Twenty UUID as the primary identifier
   - Store Stripe ID, FunnelBox ID, Close.io ID, etc. as fields on the Person record
   - Use matching logic (email, phone, name) to merge duplicates

### What Twenty already offers:

Twenty has a built-in **merge** feature — you can merge two Person records into one, combining their data. This helps clean up duplicates as they're discovered.

---

## 19. Listmonk & Email Marketing

### What is Listmonk?

Listmonk is a **self-hosted email marketing tool** (like Mailchimp, but you run it on your own server). It can:
- Manage subscriber lists
- Create email campaigns
- Send bulk emails
- Track opens, clicks, bounces
- Manage unsubscribes

### Current status (what Mariam set up):

1. **Listmonk is deployed** on the same server, sharing the PostgreSQL database (but using its own `listmonk` database — see `init-db.sql`)
2. **API user created** — Listmonk's API is working
3. **N8N workflow created** (not fully tested):
   - Twenty fires a webhook when a Person is created
   - N8N receives the webhook
   - N8N calls Listmonk API to create a subscriber
4. **Person object extended** with `listmonkUUID` field — to link Twenty contacts to Listmonk subscribers

### What still needs to be done:

- Test the full flow end-to-end
- Handle edge cases (person updated, person deleted, email changed)
- Decide: keep using N8N, or replace with Twenty's built-in workflows or Dexter?

### Johannes's decision:

Don't invest more in N8N for now. Focus on Dexter and Twenty's native capabilities. Listmonk stays deployed and ready, but the marketing integration is Phase 3.

---

## 20. N8N, Make, Zapier — The Automation Question

### Current state:

TOB has automations scattered across multiple platforms:
- **N8N**: Self-hosted, Mariam used it for Listmonk integration
- **Make** (formerly Integromat): Cloud-based, some contracting automations
- **Zapier**: Cloud-based, some older automations
- **Lasha & Nico** maintain these existing automations

### Decision from the meeting:

**Leave existing automations as-is.** Don't migrate them unless:
1. They break and need fixing anyway
2. The platform becomes too expensive or limited
3. There's spare time to consolidate

**Don't build NEW automations on N8N/Make.** Instead, prefer:
1. **Dexter pipelines** — for data transformations and scheduled jobs
2. **Twenty's built-in workflows** — for event-driven automation (when X happens, do Y)
3. **Direct API calls** — for simple integrations

### Why?

Every automation platform is another "island" to maintain. The whole point of TOB OS is consolidation. Adding more N8N workflows defeats the purpose.

---

## 21. Key Commands You'll Use Every Day

### Development

```bash
# Start everything (frontend + backend + worker)
yarn start

# Start individual packages
npx nx start twenty-front       # Frontend dev server (React app)
npx nx start twenty-server      # Backend server (NestJS)
npx nx run twenty-server:worker # Background worker

# Build (twenty-shared MUST be built first)
npx nx build twenty-shared
npx nx build twenty-front
npx nx build twenty-server
```

### Testing

```bash
# Run a single test file (fastest — do this most often)
npx jest path/to/test.test.ts --config=packages/twenty-front/jest.config.mjs

# Run all tests for a package
npx nx test twenty-front
npx nx test twenty-server

# Run integration tests (needs database)
npx nx run twenty-server:test:integration:with-db-reset

# Run a specific pattern of tests
cd packages/twenty-server && npx jest "contract"
```

### Code Quality

```bash
# Lint only changed files (fast — always prefer this)
npx nx lint:diff-with-main twenty-front
npx nx lint:diff-with-main twenty-server

# Auto-fix lint issues
npx nx lint:diff-with-main twenty-front --configuration=fix

# Type checking
npx nx typecheck twenty-front
npx nx typecheck twenty-server

# Format code
npx nx fmt twenty-front
npx nx fmt twenty-server
```

### Database

```bash
# Reset database completely
npx nx database:reset twenty-server

# Run migrations
npx nx run twenty-server:database:migrate:prod

# Generate a new migration (after changing entity files)
npx nx run twenty-server:typeorm migration:generate \
  src/database/typeorm/core/migrations/common/add-contract-fields \
  -d src/database/typeorm/core/core.datasource.ts

# Sync metadata
npx nx run twenty-server:command workspace:sync-metadata
```

### GraphQL

```bash
# Regenerate GraphQL types (after schema changes)
npx nx run twenty-front:graphql:generate
npx nx run twenty-front:graphql:generate --configuration=metadata
```

---

## 22. How to Work With This Codebase

### Code Style Rules (enforced)

- **Functional components only** — no class components
- **Named exports only** — no `export default`
- **Types over interfaces** — use `type`, not `interface` (unless extending third-party)
- **String literals over enums** — except for GraphQL enums
- **No `any` type** — strict TypeScript everywhere
- **No abbreviations** — `user` not `u`, `fieldMetadata` not `fm`
- **camelCase** for variables/functions
- **PascalCase** for types/classes (suffix props with `Props`: `ButtonProps`)
- **SCREAMING_SNAKE_CASE** for constants
- **kebab-case** for file names with descriptive suffixes (`.component.tsx`, `.service.ts`, `.entity.ts`)
- Components under 300 lines, services under 500 lines
- Use `//` comments, not `/** */` — explain WHY, not WHAT

### When you DON'T need to modify code:

- Creating custom objects -> Use UI or API
- Adding fields -> Use UI or API
- Setting up views (filters, sorts) -> Use UI
- Importing data -> Use GraphQL API or CSV import
- Creating workflows -> Use UI workflow builder
- Setting up webhooks -> Use UI

### When you DO need to modify code:

- Custom UI components (something Twenty's UI can't do)
- Custom backend logic (special business rules)
- Modifying existing Twenty behavior (changing how something works)
- Adding integrations that need server-side code

### Workflow for code changes:

```
1. Create a StGit patch:     stg new my-change-description
2. Make your changes          (edit files)
3. Stage and refresh:         git add . && stg refresh
4. Push to main:              git push origin main
5. Wait ~5 minutes            (GitHub builds + Watchtower deploys)
6. Check crm.tob.sh           (verify your change is live)
```

### Before submitting any change:

```bash
npx nx lint:diff-with-main twenty-front    # Check linting
npx nx typecheck twenty-front              # Check types
npx jest path/to/relevant.test.ts          # Run relevant tests
```

---

## 23. Connection to TOB Events

TOB Events is a **separate project** — a mobile/web app for managing live events, sessions, and registrations. It has its own lobby, its own user interface.

**How they connect:**

```
TOB Events (event management)
     │
     │ webhook fires when someone registers for an event
     ↓
Twenty CRM (customer data)
     │
     │ can trigger workflows when customer data changes
     ↓
Listmonk / Email (follow-up communications)
```

The connection isn't built yet — it's a future integration. When it happens, it will probably use Twenty's webhook system to keep the two systems in sync.

---

## 24. Glossary: Every Term Explained

| Term | Definition |
|------|-----------|
| **CRM** | Customer Relationship Management — software for managing contacts, deals, and customer interactions |
| **ERP** | Enterprise Resource Planning — software that manages all business operations (finance, HR, sales, etc.) in one system |
| **Fork** | A copy of a software repository that you own and can modify independently |
| **Upstream** | The original repository that a fork was copied from (in this case, twentyhq/twenty) |
| **StGit** | Stacked Git — a tool for managing patches on top of upstream code |
| **Patch** | A small, logical change to the codebase, managed by StGit |
| **Monorepo** | A single repository containing multiple related packages/projects |
| **Nx** | A build system for monorepos — manages dependencies, builds, tests, and caching |
| **Docker** | A tool that packages applications into containers for consistent deployment |
| **Docker Compose** | A tool for defining and running multi-container Docker applications |
| **GHCR** | GitHub Container Registry — where Docker images are stored |
| **Watchtower** | A tool that auto-updates Docker containers when new images are available |
| **GraphQL** | An API query language that lets you request exactly the data you need |
| **TypeORM** | An ORM (Object-Relational Mapper) that maps TypeScript classes to database tables |
| **NestJS** | A Node.js backend framework inspired by Angular (modules, controllers, services) |
| **Recoil** | A state management library for React (atoms, selectors) |
| **Emotion** | A CSS-in-JS library for styling React components |
| **Vite** | A fast frontend build tool with hot module replacement |
| **BullMQ** | A job queue library for Node.js, backed by Redis |
| **Dexter** | A data pipeline orchestration tool (replaces Foundry) |
| **Foundry** | Palantir's data platform — TOB is migrating away from it |
| **MariaDB** | An open-source relational database (fork of MySQL) — TOB's raw data source |
| **PostgreSQL** | An advanced open-source relational database — used by Twenty and Dexter |
| **Redis** | An in-memory key-value store — used for caching and job queues |
| **ClickHouse** | A column-oriented analytics database — used for heavy reporting (optional) |
| **Listmonk** | A self-hosted email marketing tool (alternative to Mailchimp) |
| **N8N** | A self-hosted automation tool (alternative to Zapier) |
| **Bexio** | A Swiss business software for accounting, invoicing, and CRM |
| **Close.io** | A cloud-based sales CRM |
| **FunnelBox** | A marketing CRM for lead generation and nurturing |
| **Stripe** | An online payment processing platform |
| **Cloudflare Access** | A zero-trust security tool that adds authentication in front of web applications |
| **MCP** | Model Context Protocol — a standard for connecting AI tools to external services |
| **Custom Object** | A user-defined data entity in Twenty (like Contract, Subscription) |
| **Metadata** | Data about data — in Twenty, it describes what objects and fields exist |
| **Webhook** | An HTTP callback — when something happens, the system sends a request to a URL |
| **Workflow** | An automated sequence of actions triggered by events (Twenty's built-in automation) |
| **Migration** | A database schema change script (creates/modifies tables, columns, indexes) |
| **Mailgun** | An email sending service (SMTP) — used by TOB for transactional emails |
| **HiROS** | A digital fingerprinting tool for identifying website visitors |
| **CI/CD** | Continuous Integration / Continuous Deployment — automated build and deploy pipeline |

---

*This document combines information from the team meeting transcript (Enzo, Johannes, Pablo, Mariam, Saba), the CLAUDE.md project configuration, the actual codebase files (docker-compose.yml, setup-data-model.sh, docker-publish.yml, claude.yml, .mcp.json), and the git history.*
