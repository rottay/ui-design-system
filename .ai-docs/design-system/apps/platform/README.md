# App Platform

> **Central platform administration and management application**

## What It Does

The Platform app is the central administration application for the Rottay platform. It provides tenant management, user administration, compliance monitoring, and platform-wide settings. This is where platform operators manage all tenants and their configurations.

## Target Users

- Platform administrators
- Tenant managers
- Compliance officers
- Support staff

## Key Features

- Tenant lifecycle management
- User and group administration
- Permission and role configuration
- Compliance dashboard and monitoring
- Feature flag management
- System health monitoring

## Modules Used

| Module | Purpose |
|--------|---------|
| [Auth](../../platform/auth/) | Admin authentication, SSO |
| [Identity](../../platform/identity/) | User management |
| [Permissions](../../platform/permissions/) | RBAC configuration |
| [Tenancy](../../platform/tenancy/) | Tenant management |
| [Compliance](../../platform/compliance/) | KYC, AML monitoring |
| [Feature Flags](../../platform/feature-flags/) | Feature management |
| [Navigation](../../platform/navigation/) | Admin navigation |
| [Notifications](../../platform/notifications/) | System notifications |

## Tech Stack

- Next.js 14 (App Router)
- React Server Components
- @rottay/design-system
- tRPC for API

## Structure

```
apps/platform/
├── app/                 # Next.js app directory
│   ├── (auth)/         # Auth pages
│   ├── (dashboard)/    # Main dashboard
│   ├── tenants/        # Tenant management
│   ├── users/          # User management
│   ├── compliance/     # Compliance tools
│   └── settings/       # Platform settings
├── components/         # App-specific components
├── lib/               # Utilities
├── tests/             # Test suites
│   ├── integration/   # Integration tests (module-level)
│   ├── flows/         # Flow tests (multi-step workflows)
│   ├── e2e/           # End-to-end tests (Playwright)
│   └── unit/          # Unit tests
└── styles/            # Global styles
```

## Testing

### Flow Tests

Flow-based integration tests that verify complete workflows:

```bash
# Run all flow tests
pnpm test:flows

# Run specific module
pnpm test:flows:identity
pnpm test:flows:auth
pnpm test:flows:permissions
pnpm test:flows:tenancy
pnpm test:flows:features

# Watch mode
pnpm test:flows:watch
```

Flow tests cover:
- **Identity**: User lifecycle (CRUD), tenant isolation
- **Auth**: Login/session flow, token lifecycle
- **Permissions**: Role lifecycle, permission enforcement
- **Tenancy**: Tenant lifecycle, settings management
- **Feature Flags**: Flag lifecycle, targeting rules
- **Cross-Module**: Full onboarding flows

## REVIEW-2026 Changes

### Console Log Cleanup
- ~753 `console.log` statements removed from `src/`

### Wrapper Migration
- Companies and menus server actions migrated to use query/mutation wrappers (previously bypassing)

### MDX Docs Rendering
- Fixed from `dangerouslySetInnerHTML` to use `next-mdx-remote/rsc` for proper MDX compilation and security

### Code Health Metrics
- **Design System adoption**: 92.9% (288/310 TSX files import DS)
- **Server Action wrapper compliance**: ~96% (only 4 files bypass: SCIM, privacy remain)
- **Raw divs remaining**: 23.2%

### Token Economy: Admin Pricing UI (2026-02-06 Audit)

- **AI Pricing page** (`/admin/ai-pricing`): Super admin interface for configuring provider rates, markup percentages, discounts, and token packages
- **di.ts split**: The 5,434-line `di.ts` monolith split into 10 focused modules in `src/app/lib/di/` (auth.ts, identity.ts, permissions.ts, tenancy.ts, feature-flags.ts, navigation.ts, app-services.ts, shared.ts, init.ts, index.ts)
- **Health check endpoint**: `/api/health` added with DB + Redis checks, uptime, and version info

### Session 2026-02-06

- **Migrated to pnpm**: Package manager standardized from npm/yarn to pnpm across the app
- **API response format standardized**: 74+ endpoints now use a consistent response shape (`{ success, data, error, metadata }`)
- **Billing routes wired to real @rottay/payments**: Subscriptions, plans, invoices, usage, upgrade, and dashboard endpoints now use real payment use cases instead of mock data
- **Dashboard churn data from real subscriptions**: Replaced `Math.sin` mock with actual subscription churn calculations
- **Feature overrides persisted to DB**: New tables and migration for storing feature flag overrides (previously in-memory only)
- **Feature analytics from real tracking data**: Analytics endpoints now read from actual feature usage tracking tables
- **Admin reports with BullMQ job queue**: Report generation offloaded to background jobs with new tables and migration for report state tracking
- **Admin units from real DB**: Administrative unit endpoints now query @rottay/identity instead of returning mock data
- **User creation with auth credentials**: User creation flow now provisions bcrypt-hashed auth credentials via @rottay/auth
- **CORS wildcard vulnerability fixed**: CORS configuration no longer allows wildcard origins in production
- **bundle:size CI script**: New CI script for tracking bundle size regressions

### Session 2026-02-06 (Code Quality Hardening)

- **platform/src/ deleted**: The standalone API server (429 routes) has been removed. app-platform is now the sole API server for all platform administration. `platform/` only contains `packages/` (shared @rottay/* modules).
- **Math.random() -> crypto**: 785+ instances of `Math.random()` replaced with `crypto.randomUUID()` and `crypto.getRandomValues()` for security-grade randomness
- **console.* -> structured loggers**: 103 instances of `console.log/warn/error` replaced with structured loggers from @rottay/core
- **New logger namespaces**: identity, tenancy, permissions, navigation, featureFlags added to app-platform logger configuration
- **as any eliminated**: 82 `as any` casts replaced with proper TypeScript types (only 2 remaining, both justified)
- **handleApiError coverage**: `handleApiError` error wrapper added to 180 of 184 API routes (97.8% coverage)
- **31 corrupted files repaired**: Files with syntax errors, truncated content, or broken imports fixed
- **Mock data replaced with real DB**: Dashboard stats, active sessions, and security activity endpoints now query real database instead of returning hardcoded/mock data
- **Missing randomUUID imports fixed**: 14 files were using `randomUUID` without importing it from `crypto`

### Session 2026-02-08 (Compliance Route Use Case Migration)

- **33 compliance routes migrated from direct DB to @rottay/compliance use cases** across 5 domains:
  - **AML** (11 routes): alerts, risk-profiles, rules, sars, transactions - previously migrated
  - **KYC** (7 routes): documents, sessions, review, screening, workload - previously migrated
  - **HIPAA** (7 routes): access-logs (POST->makeLogPHIAccessUseCase), breaches (POST->makeReportHIPAABreachUseCase), breaches/[id] (TODO), breaches/[id]/risk-assessment (POST->makeCompleteRiskAssessmentUseCase), disclosures (POST->makeProvideAccountingOfDisclosuresUseCase), notifications (POST HHS->makeNotifyHHSUseCase), phi (POST->makeRegisterPHIRecordUseCase)
  - **Gaming** (5 routes): exclusions (POST->makeRequestSelfExclusionUseCase), licenses (PATCH renew->makeRenewOperatorLicenseUseCase), limits (POST->makeSetLimitUseCase), reality-checks (POST trigger->makeTriggerRealityCheckUseCase), sessions (POST terminate->makeEndGameplaySessionUseCase)
  - **Banking** (3 routes): consents (POST AISP->makeCreateAISPConsentUseCase, PISP->makeCreatePISPConsentUseCase), ict-incidents (POST create->makeReportICTIncidentUseCase, submit_report->makeSubmitIncidentReportUseCase), sca (TODO - config-only actions)
- **Pattern**: Write operations (POST/PATCH with db.insert/db.update) migrated to use cases. Complex GET handlers with pagination/metrics/tabs remain as direct DB with TODO comments.
- **Zero TypeScript errors** in all compliance route files after migration.

## Related Apps

- [BitHire](../bithire/) - Recruiting vertical
- [Evnto](../evnto/) - Events vertical
