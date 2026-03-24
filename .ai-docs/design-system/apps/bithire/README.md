# App BitHire

> **AI-powered recruiting and applicant tracking application**

## What It Does

BitHire is the recruiting vertical application built on the Rottay platform. It provides a complete Applicant Tracking System (ATS) with AI-powered candidate evaluation, automated interview scheduling, and intelligent scoring using LLM-as-Judge technology.

## Target Users

- Recruiters
- Hiring managers
- HR administrators
- Candidates (applicant portal)

## Key Features

- Job posting and management
- Candidate pipeline tracking
- AI-powered interviews
- LLM-based candidate scoring
- Offer management
- Recruiting analytics
- AI chat assistants
- LinkedIn Chrome Extension for outreach (ext-bithire)
- Message template management with merge variables
- Outreach activity tracking and metrics

## Modules Used

| Module | Purpose |
|--------|---------|
| [Recruiter](../../domain-modules/recruiter/) | ATS core functionality |
| [Scoring](../../domain-modules/scoring/) | AI candidate evaluation |
| [IA-Chat](../../domain-modules/ia-chat/) | AI interviews and chat |
| [Auth](../../platform/auth/) | User authentication |
| [Identity](../../platform/identity/) | Recruiter profiles |
| [Notifications](../../platform/notifications/) | Candidate communications |

## Tech Stack

- Next.js 16.1.1 (App Router)
- React 19 (Server Components + Server Actions)
- @rottay/design-system (multi-engine: Titan/Ant Design)
- next-auth 4.24.13 for authentication
- TanStack React Query + Zustand for state
- Real-time with WebSockets

## Structure

```
app-bithire/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── (auth)/         # Auth pages (login, register, callback)
│   │   ├── (dashboard)/    # Main dashboard (110+ routes)
│   │   │   ├── jobs/       # Job management
│   │   │   ├── candidates/ # Candidate management
│   │   │   ├── interviews/ # Interview scheduling
│   │   │   ├── offers/     # Offer management
│   │   │   ├── ai-studio/  # AI tools (rubrics, phone, browser)
│   │   │   └── settings/   # App settings
│   │   └── api/            # API routes (extension, auth, search, branding)
│   ├── surfaces/           # Screen-level components (153 files, 27 domains)
│   ├── components/         # Shared + domain components
│   ├── actions/            # Server actions (query/mutation wrappers)
│   ├── types/              # Domain types and responses
│   ├── constants/          # Status configs, options, UI constants
│   └── lib/                # Utilities, DB, adapters
```

## Token Economy: Consumer Billing (2026-02-06 Audit)

- **Billing page** (`/settings/billing`): Displays team token balance, purchase interface, distribution controls, and transaction history
- **AI Studio integration**: `QuotaWarning` component warns recruiters when token balance is low; `CostEstimator` shows estimated token cost before starting an AI interview
- **Token client**: Client-side hooks for querying balance, initiating purchases, and distributing tokens to teams

## Chrome Extension (ext-bithire)

Premium Chrome Extension for LinkedIn outreach:
- **Templates**: Pre-loaded message templates with auto-complete in LinkedIn messaging
- **Profile Detection**: Auto-detects LinkedIn profiles and matches to candidates in BitHire
- **Outreach Tracking**: Logs contact activities, tracks response rates
- **Metrics Dashboard**: Per-recruiter analytics on outreach effectiveness

### Extension API Routes (`/api/extension/*`)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/extension/auth/verify` | GET | Verify extension JWT token |
| `/api/extension/templates` | GET, POST | List/create templates |
| `/api/extension/templates/[id]` | GET, PUT, DELETE | CRUD single template |
| `/api/extension/templates/[id]/use` | POST | Record template usage |
| `/api/extension/outreach` | GET, POST | List/log outreach activities |
| `/api/extension/outreach/response` | POST | Record response received |
| `/api/extension/outreach/profile` | GET | Get outreach by LinkedIn profile URL |
| `/api/extension/outreach/metrics` | GET | Get recruiter outreach metrics |
| `/api/extension/candidates/match` | GET | Match LinkedIn profile to candidate |

All extension routes use Bearer JWT auth (same as mobile API clients).

## REVIEW-2026 Changes

### Console Log Cleanup
- ~313 `console.log` statements removed from `src/`

### Code Health Metrics
- **Design System adoption**: 87.0% (360/414 TSX files import DS)
- **Server Action wrapper compliance**: ~97% (2 files bypass for pre-auth registration)

## Related Apps

- [Platform](../platform/) - Platform administration
- [Evnto](../evnto/) - Events vertical
