# ROTTAY PLATFORM - Technical Reference | January 2026

> **626,862 lines of code | 731 use cases | 156 entities | 734 test files**
>
> **Full-Stack Platform: Backend + Frontend + Infrastructure**

A multi-tenant SaaS platform built with Hexagonal Architecture, Domain-Driven Design, and CQRS patterns. Production-ready infrastructure supporting multiple verticals across talent management, hospitality, events, Web3, and AI-powered services.

Rottay is not just backend modules — it's a complete full-stack platform including:
- **Backend**: 15 modules with 731 use cases
- **Frontend**: Design system with 4 UI engines and customizable themes
- **Infrastructure**: Multi-tenant architecture, auto-scaling, CI/CD, and monitoring

---

## Table of Contents

1. [Overview](#1-overview)
2. [Architecture at a Glance](#2-architecture-at-a-glance)
3. [Tech Stack](#3-tech-stack)
4. [@rottay/core](#4-rottaycore)
5. [Platform Modules](#5-platform-modules)
6. [Domain Modules](#6-domain-modules)
7. [Design System](#7-design-system)
8. [Web3 & Blockchain](#8-web3--blockchain)
9. [Infrastructure & DevOps](#9-infrastructure--devops)
10. [Metrics Summary](#10-metrics-summary)
11. [Code Patterns & Conventions](#11-code-patterns--conventions)
12. [Security Architecture](#12-security-architecture)
13. [Testing Strategy](#13-testing-strategy)

---

## 1. Overview

### Technical Philosophy

The Rottay platform is engineered around three core principles:

1. **Domain Isolation** - Each business domain operates as an independent module with zero coupling to siblings
2. **Infrastructure Agnosticism** - Business logic has no knowledge of databases, APIs, or external services
3. **Explicit Over Implicit** - Every dependency is injected, every operation returns a typed Result

### Architecture: Hexagonal + DDD + CQRS

```
+------------------------------------------------------------------+
|                     HEXAGONAL ARCHITECTURE                        |
+------------------------------------------------------------------+
|                                                                   |
|   +-------------------+     +-------------------+                 |
|   |   PRIMARY PORTS   |     |  SECONDARY PORTS  |                 |
|   |   (Driving Side)  |     |  (Driven Side)    |                 |
|   +-------------------+     +-------------------+                 |
|           |                         ^                             |
|           v                         |                             |
|   +-----------------------------------------------+               |
|   |              APPLICATION CORE                  |               |
|   |  +------------------------------------------+ |               |
|   |  |           USE CASES (CQRS)               | |               |
|   |  |  +------------------+  +---------------+ | |               |
|   |  |  |    COMMANDS      |  |    QUERIES    | | |               |
|   |  |  | (State Changes)  |  | (Read-Only)   | | |               |
|   |  |  +------------------+  +---------------+ | |               |
|   |  +------------------------------------------+ |               |
|   |  +------------------------------------------+ |               |
|   |  |              DOMAIN LAYER                | |               |
|   |  |  Entities | Value Objects | Aggregates  | |               |
|   |  +------------------------------------------+ |               |
|   +-----------------------------------------------+               |
|           ^                         |                             |
|           |                         v                             |
|   +-------------------+     +-------------------+                 |
|   |     ADAPTERS      |     |     ADAPTERS      |                 |
|   |   (Controllers)   |     |  (Repositories)   |                 |
|   +-------------------+     +-------------------+                 |
|                                                                   |
+------------------------------------------------------------------+
```

### Why This Matters

| Benefit | Implementation |
|---------|----------------|
| **Testability** | Domain logic tested without infrastructure |
| **Flexibility** | Swap PostgreSQL for MongoDB without touching business code |
| **Maintainability** | 15 modules, each with clear boundaries and ownership |
| **Scalability** | Extract any module to microservice without refactoring |
| **Onboarding** | Consistent patterns across 626K+ lines of code |

---

## 2. Architecture at a Glance

```
+===========================================================================+
|                         ROTTAY PLATFORM ARCHITECTURE                       |
+===========================================================================+

                          +---------------------------+
                          |        VERTICALS          |
                          |  BITHIRE | NOCTIS | etc.  |
                          +-------------+-------------+
                                        |
                                        v
                    +-----------------------------------+
                    |     PORTAL (Next.js 15 + RSC)     |
                    |  App Router | Server Actions      |
                    +-----------------------------------+
                                        |
                    +-------------------+-------------------+
                    |                   |                   |
                    v                   v                   v
     +----------------+    +----------------+    +----------------+
     | @rottay/auth   |    | @rottay/tenancy|    | @rottay/perms  |
     | @rottay/identity    | @rottay/flags  |    | @rottay/nav    |
     |      +------------------------------------------+          |
     |      |         PLATFORM MODULES (7)             |          |
     |      |            78 + 50 + 22 + 28 + 22 + 30 + 40         |
     |      |              = 270+ Use Cases            |          |
     +------+------------------------------------------+----------+
                                        |
                    +-------------------+-------------------+
                    |                   |                   |
                    v                   v                   v
     +----------------+    +----------------+    +----------------+
     | @rottay/talent |    | @rottay/staff  |    | @rottay/web3   |
     | @rottay/assess |    | @rottay/bar    |    | @rottay/pay    |
     |      +------------------------------------------+          |
     |      |          DOMAIN MODULES (8)              |          |
     |      |     89+76+183+60+98+82+114+29 = 731      |          |
     |      |             Use Cases                    |          |
     +------+------------------------------------------+----------+
                                        |
                                        v
                    +-----------------------------------+
                    |          @rottay/core             |
                    |         450+ Exports              |
                    | Errors | Base Classes | Utils     |
                    +-----------------------------------+
                                        |
            +--------------+------------+------------+--------------+
            |              |            |            |              |
            v              v            v            v              v
     +-----------+  +-----------+  +--------+  +---------+  +------------+
     | PostgreSQL|  |   Redis   |  | Typesense  |  SQS   |  | S3 + CDN   |
     |   (RDS)   |  | (Cluster) |  | Search |  | Queue  |  |   Assets   |
     +-----------+  +-----------+  +--------+  +---------+  +------------+
```

---

## 3. Tech Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Runtime** | Node.js | 20 LTS | Server runtime with native ESM |
| **Language** | TypeScript | 5.4+ | Strict mode, decorators enabled |
| **Framework** | Next.js | 15 | App Router, RSC, Server Actions |
| **ORM** | Drizzle | 0.30+ | Type-safe queries, migrations |
| **Database** | PostgreSQL | 15 | Primary datastore (AWS RDS) |
| **Cache** | Redis | 7 | Session store, rate limiting, pub/sub |
| **Search** | Typesense | 0.25 | Full-text search, faceted filtering |
| **Queue** | AWS SQS | - | Async job processing |
| **Storage** | AWS S3 | - | File uploads, assets |
| **CDN** | CloudFront | - | Static asset delivery |
| **Infra** | AWS | - | ECS, RDS, ElastiCache, SQS, S3 |
| **Monorepo** | Turborepo | 2.0 | Build orchestration, caching |
| **Testing** | Vitest | 1.0+ | Unit, integration, coverage |
| **E2E** | Playwright | 1.40+ | Browser automation |
| **Validation** | Zod | 3.22+ | Runtime type validation |

---

## 4. @rottay/core

> **Server-only foundation package with 450+ exports**

```typescript
// Package is marked server-only - cannot be imported in client components
import "server-only";
```

### Exports by Category

| Category | Count | Key Exports |
|----------|-------|-------------|
| **Error Classes** | 25+ | `DomainError`, `ValidationError`, `NotFoundError`, `ConflictError`, `UnauthorizedError`, `ForbiddenError`, `InfrastructureError`, `ExternalServiceError` |
| **Base Classes** | 15+ | `Entity`, `AggregateRoot`, `ValueObject`, `UseCase`, `Repository`, `Mapper` |
| **Database** | 30+ | `DrizzleClient`, `Transaction`, `withTransaction`, `TenantContext`, `AuditFields` |
| **Validation** | 40+ | `validate`, `validateAsync`, `createValidator`, `schemas.*` |
| **Utilities** | 50+ | `generateId`, `generateSlug`, `hashPassword`, `verifyPassword`, `encrypt`, `decrypt` |
| **Result Pattern** | 10+ | `Result`, `success`, `error`, `isSuccess`, `isError`, `unwrap`, `unwrapOr` |
| **Types** | 100+ | `TenantId`, `UserId`, `EntityId`, `Timestamp`, `Money`, `Email`, `Phone` |
| **Decorators** | 20+ | `@Encrypted`, `@Indexed`, `@Unique`, `@Audited`, `@Cached` |
| **Constants** | 50+ | `ERROR_CODES`, `HTTP_STATUS`, `CACHE_TTL`, `PAGINATION` |
| **Helpers** | 60+ | `paginate`, `sort`, `filter`, `buildQuery`, `parseFilters` |

### Result Pattern Implementation

```typescript
// Every use case returns Result<T, E>
type Result<T, E = DomainError> = Success<T> | Failure<E>;

// Usage in use cases
export class CreateUserUseCase {
  async execute(input: CreateUserInput): Promise<Result<User>> {
    const validation = validate(createUserSchema, input);
    if (isError(validation)) {
      return error(new ValidationError(validation.error));
    }

    const existingUser = await this.userRepo.findByEmail(input.email);
    if (existingUser) {
      return error(new ConflictError("User already exists"));
    }

    const user = await this.userRepo.create(input);
    return success(user);
  }
}
```

### Quick Start Example

```typescript
// Create a user with @rottay/auth
import { makeCreateUserUseCase, isSuccess } from "@rottay/auth";
import { makeTenantContext } from "@rottay/tenancy";

// Initialize use case with dependencies
const createUser = makeCreateUserUseCase({ db, logger });

// Create tenant context from JWT
const ctx = makeTenantContext({ tenantId: "tenant_123", userId: "admin_456" });

// Execute use case
const result = await createUser.execute(ctx, {
  email: "user@example.com",
  password: "securePassword123",
  role: "member"
});

if (isSuccess(result)) {
  console.log("User created:", result.data.id);
} else {
  console.error("Error:", result.error.message);
}
```

---

## 5. Platform Modules

> **7 modules providing cross-cutting concerns for all verticals**

### Module Overview

| Module | Use Cases | Purpose |
|--------|-----------|---------|
| @rottay/auth | 78 | Authentication, sessions, MFA |
| @rottay/tenancy | 50+ | Multi-tenant isolation |
| @rottay/identity | 22+ | User profiles, teams |
| @rottay/permissions | 28+ | RBAC, resource access |
| @rottay/feature-flags | 22+ | Feature management |
| @rottay/navigation | 30+ | Dynamic menus, guards |
| @rottay/compliance | 40+ | Regulatory compliance |

---

### @rottay/auth (78 Use Cases)

```
+------------------------------------------------------------------+
|                    AUTHENTICATION MODULE                          |
+------------------------------------------------------------------+

  REGISTRATION (12)          LOGIN (15)              MFA (18)
  ----------------          ---------               --------
  - RegisterUser            - LoginWithEmail        - EnableMFA
  - VerifyEmail             - LoginWithPhone        - DisableMFA
  - ResendVerification      - LoginWithOAuth        - GenerateTOTP
  - CompleteOnboarding      - ValidateCredentials   - VerifyTOTP
  - CreateTenantAdmin       - RefreshToken          - GenerateBackupCodes
  - InviteUser              - ImpersonateUser       - ValidateBackupCode
  - AcceptInvitation        - SwitchTenant          - SendSMSCode
  - SetInitialPassword      - ValidateSession       - VerifySMSCode
  - UpdatePassword          - ExtendSession         - RegisterSecurityKey
  - ValidatePasswordStrength- RevokeToken           - ValidateSecurityKey
  - CheckEmailAvailability  - LogoutUser            - ListMFAMethods
  - CheckUsernameAvailable  - LogoutAllDevices      - SetPreferredMFA
                            - GetActiveDevices      - RequireMFAForRole
                            - TrustDevice           - AuditMFAAttempt
                            - RevokeDeviceTrust     - ResetMFA

  SESSIONS (14)              OAUTH (10)             RECOVERY (9)
  ------------              --------               ----------
  - CreateSession           - InitiateOAuth        - RequestPasswordReset
  - ValidateSession         - HandleCallback       - ValidateResetToken
  - RefreshSession          - LinkProvider         - ResetPassword
  - TerminateSession        - UnlinkProvider       - RequestAccountRecovery
  - ListUserSessions        - GetLinkedProviders   - ValidateRecoveryCode
  - TerminateAllSessions    - RefreshOAuthToken    - RecoverAccount
  - GetSessionMetadata      - ValidateOAuthState   - GenerateRecoveryCodes
  - UpdateSessionActivity   - ExchangeCode         - ListRecoveryOptions
  - SetSessionTimeout       - GetUserInfo          - AuditRecoveryAttempt
  - EnforceSessionLimits    - RevokeOAuthAccess
  - DetectConcurrentSession
  - HandleSessionConflict
  - MigrateSession
  - AuditSessionEvent
```

---

### @rottay/tenancy (50+ Use Cases)

```
  TENANT CRUD (15)           ISOLATION (12)         BRANDING (10)
  ---------------           -----------            ----------
  - CreateTenant            - EnforceTenantScope   - SetTenantBranding
  - UpdateTenant            - ValidateTenantAccess - UpdateLogo
  - DeleteTenant            - SwitchTenantContext  - SetColorScheme
  - GetTenant               - GetTenantMetadata    - ConfigureEmailTemplate
  - ListTenants             - CloneTenantConfig    - SetCustomDomain
  - ArchiveTenant           - MergeTenants         - ConfigureSSOBranding
  - RestoreTenant           - SplitTenant          - SetFavicon
  - TransferOwnership       - ValidateDataAccess   - UpdateLoginPage
  - UpdateTenantSettings    - AuditCrossAccess     - SetWatermark
  - SetTenantLimits         - EnforceRowSecurity   - ExportBrandAssets
  - GetTenantUsage          - ScopedQueryBuilder
  - SuspendTenant           - ValidateTenantId
  - ReactivateTenant
  - SetTenantPlan
  - MigrateTenantData

  PROVISIONING (13+)
  ------------------
  - ProvisionTenant
  - ProvisionDatabase
  - SeedTenantData
  - ConfigureIntegrations
  - SetupBilling
  - CreateAdminUser
  - SendWelcomeEmail
  - ValidateProvisioning
  - RollbackProvisioning
  - ScheduleProvisioning
  - BulkProvision
  - CloneTenant
  - ImportTenantData
```

---

### @rottay/identity (22+ Use Cases)

```
  PROFILES (8)               TEAMS (7)              ORGANIZATIONS (7+)
  -----------               -------                ----------------
  - CreateProfile           - CreateTeam           - CreateOrganization
  - UpdateProfile           - UpdateTeam           - UpdateOrganization
  - GetProfile              - DeleteTeam           - GetOrganization
  - DeleteProfile           - AddTeamMember        - ListOrganizations
  - UploadAvatar            - RemoveTeamMember     - InviteToOrganization
  - SetProfileVisibility    - GetTeamMembers       - AcceptOrgInvitation
  - LinkSocialProfile       - TransferTeamOwner    - LeaveOrganization
  - VerifyIdentity
```

---

### @rottay/permissions (28+ Use Cases)

```
  ROLES (10)                 PERMISSIONS (10)       HIERARCHIES (8+)
  ---------                 -------------          -------------
  - CreateRole              - GrantPermission      - CreateHierarchy
  - UpdateRole              - RevokePermission     - UpdateHierarchy
  - DeleteRole              - CheckPermission      - DeleteHierarchy
  - AssignRole              - ListPermissions      - AssignToHierarchy
  - RevokeRole              - BulkGrant            - GetAncestors
  - ListRoles               - BulkRevoke           - GetDescendants
  - GetRolePermissions      - GetEffectivePerms    - ValidateHierarchy
  - CloneRole               - InheritPermissions   - FlattenHierarchy
  - SetDefaultRole          - AuditPermission
  - ValidateRoleAssignment  - ScopePermission
```

---

### @rottay/feature-flags (22+ Use Cases)

```
  BOOLEAN FLAGS (6)          ROLLOUT (6)            A/B TESTING (5)
  ----------------          ---------              -------------
  - CreateFlag              - SetRolloutPercentage - CreateExperiment
  - UpdateFlag              - IncrementRollout     - AssignVariant
  - DeleteFlag              - PauseRollout         - RecordConversion
  - EvaluateFlag            - ResumeRollout        - GetExperimentResults
  - ListFlags               - GetRolloutStatus     - EndExperiment
  - BulkEvaluate            - ScheduleRollout

  TARGETING (5+)
  -------------
  - CreateTargetingRule
  - EvaluateTargeting
  - SetUserOverride
  - SetTenantOverride
  - ClearOverrides
```

---

### @rottay/navigation (30+ Use Cases)

```
  MENUS (10)                 BREADCRUMBS (6)        GUARDS (8)
  ---------                 ------------           --------
  - CreateMenu              - GenerateBreadcrumbs  - RegisterGuard
  - UpdateMenu              - GetBreadcrumbPath    - EvaluateGuard
  - DeleteMenu              - SetBreadcrumbLabel   - ChainGuards
  - AddMenuItem             - CacheBreadcrumbs     - BypassGuard
  - RemoveMenuItem          - ResolveDynamicCrumb  - AuditGuardResult
  - ReorderMenuItems        - GetParentCrumbs      - SetGuardPriority
  - SetMenuVisibility                              - ListGuards
  - GetUserMenu                                    - TestGuard
  - CacheMenuForRole
  - InvalidateMenuCache

  MOBILE (6+)
  -----------
  - GetMobileNav
  - SetBottomTabs
  - ConfigureDrawer
  - SetQuickActions
  - HandleDeepLink
  - SyncNavState
```

---

### @rottay/compliance (40+ Use Cases)

```
  KYC (10)                   AML (8)                GDPR (10)
  -------                   -----                  ------
  - InitiateKYC             - ScreenTransaction    - RecordConsent
  - SubmitDocument          - CheckWatchlist       - WithdrawConsent
  - VerifyDocument          - FlagSuspicious       - ExportUserData
  - GetKYCStatus            - ReportSAR            - DeleteUserData
  - RequestAdditionalDocs   - GetRiskScore         - AnonymizeData
  - ApproveKYC              - SetTransactionLimit  - UpdateDataPolicy
  - RejectKYC               - ReviewAlert          - GetConsentHistory
  - ScheduleReview          - EscalateCase         - NotifyDataBreach
  - UpdateKYCLevel                                 - HandleDSAR
  - AuditKYCProcess                                - SetRetentionPolicy

  AUDIT (7)                  CONSENT (5+)
  --------                  ----------
  - CreateAuditLog          - CreateConsentForm
  - QueryAuditLogs          - UpdateConsentForm
  - ExportAuditLogs         - GetActiveConsents
  - SetRetentionPolicy      - RevokeConsent
  - ArchiveOldLogs          - AuditConsentChanges
  - GenerateComplianceReport
  - ScheduleAudit
```

---

## 6. Domain Modules

> **8 modules implementing vertical-specific business logic**

### Domain Module Metrics

| Module | Mutations | Queries | Total | Entities | Tests | LOC |
|--------|-----------|---------|-------|----------|-------|-----|
| @rottay/talent | 55 | 34 | **89** | 11 | 265 | 107,788 |
| @rottay/assessment | 51 | 25 | **76** | 24 | 0 | 76,634 |
| @rottay/ai-assistant | 102 | 81 | **183** | 15 | 193 | 116,074 |
| @rottay/web3 | 39 | 21 | **60** | 14 | 163 | 106,866 |
| @rottay/bar | 64 | 34 | **98** | 18 | 23 | 59,315 |
| @rottay/staff | 52 | 30 | **82** | 33 | 18 | 73,736 |
| @rottay/ticketing | 63 | 51 | **114** | 36 | 12 | 64,069 |
| @rottay/payments | 19 | 10 | **29** | 5 | 60 | 22,380 |
| **TOTAL** | **445** | **286** | **731** | **156** | **734** | **626,862** |

---

### @rottay/talent

> **Applicant Tracking System (ATS) with full recruitment lifecycle**

```
+------------------------------------------------------------------+
|                        TALENT MODULE                              |
|         55 Mutations | 34 Queries | 89 Total | 11 Entities        |
|                  265 Tests | 107,788 LOC                          |
+------------------------------------------------------------------+

  CANDIDATES (18)            JOBS (15)              APPLICATIONS (20)
  --------------            ------                 --------------
  Mutations:                Mutations:             Mutations:
  - CreateCandidate         - CreateJob            - SubmitApplication
  - UpdateCandidate         - UpdateJob            - UpdateApplication
  - DeleteCandidate         - PublishJob           - WithdrawApplication
  - ImportCandidates        - UnpublishJob         - AdvanceStage
  - MergeCandidates         - CloseJob             - RejectApplication
  - AddCandidateNote        - ArchiveJob           - ScheduleInterview
  - TagCandidate            - DuplicateJob         - RequestDocuments
  - UpdateCandidateStatus   - SetJobPriority       - ScoreApplication
  - AssignRecruiter                                - BulkUpdateStatus
                            Queries:               - AssignReviewer
  Queries:                  - GetJob               - AddApplicationNote
  - GetCandidate            - ListJobs             - RequestReference
  - ListCandidates          - SearchJobs
  - SearchCandidates        - GetJobStats          Queries:
  - GetCandidateHistory     - GetJobApplicants     - GetApplication
  - GetCandidatePipeline    - GetJobPipeline       - ListApplications
  - ExportCandidates                               - GetApplicationHistory
                                                   - GetPipelineMetrics

  INTERVIEWS (18)            OFFERS (18)
  -------------             --------
  Mutations:                Mutations:
  - ScheduleInterview       - CreateOffer
  - RescheduleInterview     - UpdateOffer
  - CancelInterview         - SendOffer
  - CompleteInterview       - WithdrawOffer
  - SubmitFeedback          - ExtendOffer
  - RequestAvailability     - NegotiateOffer
  - SendReminder            - AcceptOffer
  - AssignInterviewer       - RejectOffer
  - CreateInterviewKit      - CounterOffer

  Queries:                  Queries:
  - GetInterview            - GetOffer
  - ListInterviews          - ListOffers
  - GetInterviewFeedback    - GetOfferHistory
  - GetInterviewerLoad      - GetOfferMetrics
  - GetAvailableSlots       - CompareOffers
```

---

### @rottay/assessment

> **Candidate evaluation with rubrics, scoring, and calibration**

```
+------------------------------------------------------------------+
|                      ASSESSMENT MODULE                            |
|         51 Mutations | 25 Queries | 76 Total | 24 Entities        |
|                    0 Tests | 76,634 LOC                           |
+------------------------------------------------------------------+

  RUBRICS (16)               SCORABLES (20)         CALIBRATION (15)
  -----------               -----------            -------------
  Mutations:                Mutations:             Mutations:
  - CreateRubric            - CreateScorable       - CreateCalibration
  - UpdateRubric            - UpdateScorable       - ScheduleCalibration
  - DeleteRubric            - DeleteScorable       - StartCalibration
  - CloneRubric             - AssignScorable       - SubmitCalibrationScore
  - AddCriteria             - SubmitScore          - CompleteCalibration
  - UpdateCriteria          - UpdateScore          - ResolveDiscrepancy
  - RemoveCriteria          - FinalizeScore        - AdjustScores
  - SetWeights              - RequestReview        - SetBenchmark
  - PublishRubric           - ApproveScore
  - ArchiveRubric           - RejectScore          Queries:
                            - RecalibrateScore     - GetCalibration
  Queries:                                         - ListCalibrations
  - GetRubric               Queries:               - GetCalibrationResults
  - ListRubrics             - GetScorable          - GetDiscrepancies
  - GetRubricUsage          - ListScorables        - GetCalibrationStats
  - CompareRubrics          - GetScoreHistory
                            - GetAverageScores
                            - GetScorerStats

  ANALYTICS (25)
  -------------
  Mutations:                Queries:
  - GenerateReport          - GetAssessmentMetrics
  - ExportAnalytics         - GetScorerPerformance
  - ScheduleReport          - GetRubricEffectiveness
  - ConfigureDashboard      - GetPassRates
                            - GetTimeToComplete
                            - GetScoreDistribution
                            - GetInterRaterReliability
                            - TrendAnalysis
                            - BenchmarkComparison
```

---

### @rottay/ai-assistant

> **Multi-provider AI integration with conversation management and usage tracking**

```
+------------------------------------------------------------------+
|                     AI-ASSISTANT MODULE                           |
|        102 Mutations | 81 Queries | 183 Total | 15 Entities       |
|                   193 Tests | 116,074 LOC                         |
+------------------------------------------------------------------+

  SUPPORTED PROVIDERS
  +--------+----------+----------+---------+---------+-------+--------+
  | OpenAI | Anthropic|   Groq   |ElevenLabs|Deepgram | Vapi  | Retell |
  |  GPT-4 |  Claude  |  LLaMA   |   TTS   |   STT   | Voice | Voice  |
  +--------+----------+----------+---------+---------+-------+--------+

  PROVIDERS (35)             CONVERSATIONS (45)     MODELS (30)
  -------------             ---------------        --------
  Mutations:                Mutations:             Mutations:
  - RegisterProvider        - CreateConversation   - RegisterModel
  - UpdateProvider          - UpdateConversation   - UpdateModel
  - DeleteProvider          - DeleteConversation   - DeprecateModel
  - SetProviderCredentials  - AddMessage           - SetDefaultModel
  - TestProviderConnection  - UpdateMessage        - ConfigureModel
  - SetProviderPriority     - DeleteMessage        - SetModelLimits
  - EnableProvider          - ClearConversation    - CloneModelConfig
  - DisableProvider         - ArchiveConversation  - SetFallbackModel
  - SetRateLimits           - ForkConversation     - BenchmarkModel
  - ConfigureFallback       - MergeConversations
  - SetCostLimits           - SummarizeConversation Queries:
  - RotateAPIKey            - RegenerateResponse   - GetModel
                            - StreamResponse       - ListModels
  Queries:                  - CancelGeneration     - GetModelCapabilities
  - GetProvider             - SetSystemPrompt      - GetModelPricing
  - ListProviders           - AddContext           - CompareModels
  - GetProviderStatus       - SetTemperature       - GetModelUsage
  - GetProviderUsage        - SetMaxTokens         - GetAvailableModels
  - GetProviderHealth       - EnableStreaming
  - GetProviderCosts        - AttachFile
  - CheckProviderLimits     - AttachImage

                            Queries:
                            - GetConversation
                            - ListConversations
                            - GetMessages
                            - SearchConversations
                            - GetConversationStats
                            - ExportConversation
                            - GetTokenCount

  USAGE (40)                 EMBEDDINGS (15)        FINE-TUNING (18)
  ---------                 ------------           -------------
  Mutations:                Mutations:             Mutations:
  - RecordUsage             - GenerateEmbedding    - CreateFineTune
  - SetUsageLimits          - BatchEmbed           - UploadTrainingData
  - ResetUsageCounter       - UpdateEmbedding      - StartFineTune
  - ConfigureBilling        - DeleteEmbedding      - CancelFineTune
  - SetAlertThresholds      - IndexEmbeddings      - DeployFineTune
  - GenerateInvoice                                - RollbackFineTune
  - ApplyCredits            Queries:
                            - SearchByEmbedding    Queries:
  Queries:                  - GetSimilar           - GetFineTuneStatus
  - GetUsageStats           - GetEmbedding         - ListFineTunes
  - GetUsageByProvider      - ListEmbeddings       - GetTrainingMetrics
  - GetUsageByModel                                - GetValidationResults
  - GetDailyUsage
  - GetMonthlyUsage
  - GetCostBreakdown
  - ForecastUsage
  - GetUsageTrends
```

---

### @rottay/web3

> **Blockchain integration across Polygon, Base, and BNB Chain**

```
+------------------------------------------------------------------+
|                         WEB3 MODULE                               |
|         39 Mutations | 21 Queries | 60 Total | 14 Entities        |
|                   163 Tests | 106,866 LOC                         |
+------------------------------------------------------------------+

  SUPPORTED CHAINS
  +----------+---------+----------+
  | Polygon  |  Base   |   BNB    |
  |  MATIC   |   ETH   |   BNB    |
  +----------+---------+----------+

  WALLETS (15)               TOKENS (12)            NFTs (12)
  -----------               --------               -----
  Mutations:                Mutations:             Mutations:
  - CreateWallet            - DeployToken          - MintNFT
  - ImportWallet            - TransferToken        - TransferNFT
  - ConnectWallet           - ApproveSpender       - BurnNFT
  - DisconnectWallet        - RevokeApproval       - UpdateMetadata
  - SignMessage             - BurnToken            - ListNFT
  - SignTransaction         - MintToken            - DelistNFT
  - SetDefaultWallet                               - CreateCollection
                            Queries:
  Queries:                  - GetTokenBalance      Queries:
  - GetWallet               - GetTokenMetadata     - GetNFT
  - ListWallets             - ListTokens           - ListNFTs
  - GetBalance              - GetTransferHistory   - GetNFTMetadata
  - GetTransactionHistory   - GetTokenHolders      - GetCollectionStats
  - VerifyOwnership

  STAKING (10)               PAYMENTS (11)
  ----------                ----------
  Mutations:                Mutations:
  - StakeTokens             - CreatePaymentRequest
  - UnstakeTokens           - ProcessCryptoPayment
  - ClaimRewards            - RefundCryptoPayment
  - CompoundRewards         - SetPaymentAddress
  - SetAutoCompound         - ConfigureGasSettings

  Queries:                  Queries:
  - GetStakingPosition      - GetPaymentStatus
  - GetStakingRewards       - GetPaymentHistory
  - GetAPY                  - GetTransactionReceipt
  - GetStakingStats         - EstimateGas
                            - GetExchangeRate
                            - ValidateAddress
```

---

### @rottay/bar

> **Complete POS and inventory management for hospitality**

```
+------------------------------------------------------------------+
|                          BAR MODULE                               |
|         64 Mutations | 34 Queries | 98 Total | 18 Entities        |
|                    23 Tests | 59,315 LOC                          |
+------------------------------------------------------------------+

  PRODUCTS (20)              ORDERS (25)            INVENTORY (20)
  -----------               --------               -----------
  Mutations:                Mutations:             Mutations:
  - CreateProduct           - CreateOrder          - AddInventoryItem
  - UpdateProduct           - UpdateOrder          - UpdateInventory
  - DeleteProduct           - CancelOrder          - AdjustStock
  - SetProductPrice         - AddOrderItem         - TransferStock
  - SetProductAvailability  - RemoveOrderItem      - ReceiveShipment
  - CreateCategory          - UpdateQuantity       - WriteOffStock
  - AssignCategory          - ApplyDiscount        - SetReorderPoint
  - SetModifiers            - RemoveDiscount       - CreateStockCount
  - CreateVariant           - SplitOrder           - SubmitStockCount
  - BulkUpdatePrices        - MergeOrders          - ReconcileStock
                            - HoldOrder
  Queries:                  - CloseOrder           Queries:
  - GetProduct              - VoidOrder            - GetInventoryLevel
  - ListProducts            - RefundOrder          - GetStockHistory
  - SearchProducts          - PrintReceipt         - GetLowStockItems
  - GetProductsByCategory                          - GetInventoryValue
  - GetBestSellers          Queries:               - GetStockMovements
                            - GetOrder             - ForecastDemand
                            - ListOrders
                            - GetOrderHistory
                            - GetDailySales
                            - GetOrderStats

  POS (18)                   SUPPLIERS (15)
  -----                     -----------
  Mutations:                Mutations:
  - OpenRegister            - CreateSupplier
  - CloseRegister           - UpdateSupplier
  - ProcessPayment          - DeleteSupplier
  - ProcessRefund           - CreatePurchaseOrder
  - ApplyCash               - ReceivePurchaseOrder
  - ApplyCard               - CancelPurchaseOrder
  - ApplySplit              - UpdateSupplierPricing
  - PrintReceipt
  - OpenCashDrawer          Queries:
  - RecordTip               - GetSupplier
                            - ListSuppliers
  Queries:                  - GetPurchaseOrders
  - GetRegisterStatus       - GetSupplierPerformance
  - GetCashDrawerBalance    - CompareSupplierPrices
  - GetShiftReport
  - GetDailyReport
  - GetPaymentBreakdown
```

---

### @rottay/staff

> **Workforce management with scheduling, credentials, and payroll**

```
+------------------------------------------------------------------+
|                         STAFF MODULE                              |
|         52 Mutations | 30 Queries | 82 Total | 33 Entities        |
|                    18 Tests | 73,736 LOC                          |
+------------------------------------------------------------------+

  STAFF (16)                 SHIFTS (18)            CREDENTIALS (15)
  ---------                 --------               -------------
  Mutations:                Mutations:             Mutations:
  - CreateStaffMember       - CreateShift          - AddCredential
  - UpdateStaffMember       - UpdateShift          - UpdateCredential
  - DeactivateStaff         - DeleteShift          - DeleteCredential
  - AssignRole              - AssignShift          - VerifyCredential
  - UpdateContactInfo       - UnassignShift        - RenewCredential
  - SetAvailability         - SwapShifts           - ExpireCredential
  - UploadDocuments         - SplitShift           - UploadCredentialDoc
  - AssignManager           - PublishSchedule      - RequestVerification
                            - RequestTimeOff
  Queries:                  - ApproveTimeOff       Queries:
  - GetStaffMember          - DenyTimeOff          - GetCredential
  - ListStaff                                      - ListCredentials
  - SearchStaff             Queries:               - GetExpiringCredentials
  - GetStaffSchedule        - GetShift             - GetCredentialHistory
  - GetStaffHistory         - ListShifts           - ValidateCredentials
                            - GetWeeklySchedule
                            - GetStaffAvailability
                            - GetOpenShifts
                            - GetShiftConflicts

  TIME (16)                  PAYROLL (17)
  ------                    --------
  Mutations:                Mutations:
  - ClockIn                 - CreatePayPeriod
  - ClockOut                - CalculatePayroll
  - StartBreak              - ApprovePayroll
  - EndBreak                - ProcessPayroll
  - EditTimeEntry           - AdjustPayment
  - ApproveTimeEntry        - AddBonus
  - RejectTimeEntry         - AddDeduction
  - SubmitTimesheet         - GeneratePaystub
                            - ExportPayroll
  Queries:
  - GetTimeEntry            Queries:
  - ListTimeEntries         - GetPayroll
  - GetTimesheetSummary     - GetPaystub
  - GetOvertimeReport       - GetPayrollHistory
  - GetAttendanceReport     - GetEarningsReport
                            - GetDeductionsReport
                            - GetTaxReport
                            - GetLaborCostReport
```

---

### @rottay/ticketing

> **Complete event ticketing platform with venues, live events, and resale**

```
+------------------------------------------------------------------+
|                       TICKETING MODULE                            |
|         63 Mutations | 51 Queries | 114 Total | 36 Entities       |
|                    12 Tests | 64,069 LOC                          |
+------------------------------------------------------------------+

  EVENTS (22)                TICKETS (24)           VENUES (18)
  ---------                 ---------              --------
  Mutations:                Mutations:             Mutations:
  - CreateEvent             - CreateTicketType     - CreateVenue
  - UpdateEvent             - UpdateTicketType     - UpdateVenue
  - PublishEvent            - DeleteTicketType     - DeleteVenue
  - UnpublishEvent          - IssueTicket          - AddSection
  - CancelEvent             - TransferTicket       - UpdateSection
  - PostponeEvent           - CancelTicket         - DeleteSection
  - RescheduleEvent         - RefundTicket         - AddSeatMap
  - CloneEvent              - ValidateTicket       - UpdateSeatMap
  - SetEventCapacity        - CheckInTicket        - SetSectionCapacity
  - AddEventImage           - UndoCheckIn          - BlockSeats
  - SetTicketPricing        - ReissueTicket        - UnblockSeats
                            - BulkIssueTickets
  Queries:                  - SetTicketLimit       Queries:
  - GetEvent                                       - GetVenue
  - ListEvents              Queries:               - ListVenues
  - SearchEvents            - GetTicket            - GetSeatMap
  - GetEventStats           - ListTickets          - GetAvailableSeats
  - GetEventAttendees       - GetTicketHistory     - GetSectionStats
  - GetEventRevenue         - ValidateTicketCode
  - GetEventCapacity        - GetTicketHolder
  - GetUpcomingEvents       - GetSalesReport
                            - GetCheckInStats

  LIVE (20)                  RESALE (15)            ANALYTICS (15)
  ------                    --------               -----------
  Mutations:                Mutations:             Mutations:
  - StartLiveEvent          - ListTicketForResale  - GenerateEventReport
  - EndLiveEvent            - UpdateResaleListing  - ScheduleReport
  - PauseLiveEvent          - RemoveResaleListing  - ExportAnalytics
  - ResumeLiveEvent         - PurchaseResaleTicket - ConfigureDashboard
  - UpdateAttendeeCount     - SetResalePriceLimit
  - SendLiveNotification    - ApproveResaleListing Queries:
  - TriggerEmergencyAlert   - RejectResaleListing  - GetSalesAnalytics
  - UpdateEventStatus                              - GetRevenueAnalytics
  - LogIncident             Queries:               - GetAttendanceAnalytics
                            - GetResaleListings    - GetCheckInAnalytics
  Queries:                  - GetResaleHistory     - GetResaleAnalytics
  - GetLiveStatus           - GetResaleStats       - GetTrendAnalysis
  - GetLiveAttendance       - GetMarketPrice       - GetDemographicData
  - GetLiveIncidents        - SearchResaleTickets  - GetRevenueForcast
  - GetLiveMetrics                                 - CompareEvents
  - GetQueueStatus                                 - GetSeasonalTrends
  - GetEntryPoints
```

---

### @rottay/payments

> **Multi-provider payment processing with fiat and crypto support**

```
+------------------------------------------------------------------+
|                       PAYMENTS MODULE                             |
|         19 Mutations | 10 Queries | 29 Total | 5 Entities         |
|                    60 Tests | 72,380 LOC                          |
+------------------------------------------------------------------+

  SUPPORTED PROVIDERS
  +--------+-----------+---------+---------+------+------+----------+
  | Stripe | MercadoPago| MoonPay | Transak | Ramp | Wyre | Sardine  |
  +--------+-----------+---------+---------+------+------+----------+
  | Banxa  |  Simplex  |  Unlimit | Onramp  | Kado | Topper | +4 more |
  +--------+-----------+---------+---------+------+------+----------+

  PAYMENTS (8)               SUBSCRIPTIONS (6)      REFUNDS (5)
  -----------               ---------------        ---------
  Mutations:                Mutations:             Mutations:
  - CreatePayment           - CreateSubscription   - RequestRefund
  - ProcessPayment          - UpdateSubscription   - ApproveRefund
  - CapturePayment          - CancelSubscription   - ProcessRefund
  - VoidPayment             - PauseSubscription    - DenyRefund
                            - ResumeSubscription
  Queries:                                         Queries:
  - GetPayment              Queries:               - GetRefund
  - GetPaymentStatus        - GetSubscription      - GetRefundStatus
  - ListPayments            - ListSubscriptions
  - GetPaymentMethods       - GetSubscriptionHistory

  PAYOUTS (5)                CRYPTO (5)
  ----------                --------
  Mutations:                Mutations:
  - CreatePayout            - ProcessCryptoPayment
  - ProcessPayout           - ConvertCrypto
  - CancelPayout            - WithdrawCrypto

  Queries:                  Queries:
  - GetPayout               - GetCryptoRates
  - ListPayouts             - GetCryptoBalance
```

---

## 7. Design System

> **Full frontend customization from the portal — no code required**

Rottay includes a complete design system that allows white-label customers to fully customize their frontend appearance without writing code.

### Architecture

```
+===========================================================================+
|                       DESIGN SYSTEM ARCHITECTURE                          |
+===========================================================================+
|                                                                           |
|                          ┌─────────────────┐                              |
|                          │     PORTAL      │                              |
|                          │    Branding     │                              |
|                          │    Settings     │                              |
|                          └────────┬────────┘                              |
|                                   │                                       |
|            ┌──────────────────────┼──────────────────────┐                |
|            │                      │                      │                |
|            ▼                      ▼                      ▼                |
|     ┌────────────┐        ┌────────────┐        ┌────────────┐           |
|     │   TITAN    │        │   HERMES   │        │   APOLLO   │           |
|     │ Ant Design │        │  Tailwind  │        │  Vanilla   │           |
|     │ Enterprise │        │   Modern   │        │  Minimal   │           |
|     └────────────┘        └────────────┘        └────────────┘           |
|            │                      │                      │                |
|            └──────────────────────┼──────────────────────┘                |
|                                   │                                       |
|                          ┌────────┴────────┐                              |
|                          │     THEMES      │                              |
|                          │   Corporate     │                              |
|                          │   BitHire       │                              |
|                          │   Minimal       │                              |
|                          │   Custom...     │                              |
|                          └─────────────────┘                              |
|                                                                           |
+===========================================================================+
```

### 4 UI Engines

| Engine | Based On | Best For | Features |
|--------|----------|----------|----------|
| **Titan** | Ant Design | Enterprise apps | Feature-rich, comprehensive components |
| **Hermes** | Tailwind/DaisyUI | Modern startups | Lightweight, utility-first, fast |
| **Apollo** | Vanilla HTML/CSS | Minimal apps | No framework dependency, accessible |
| **Athena** | Pluggable | Custom needs | Bring your own component library |

### Theme Presets

| Theme | Style | Primary Color | Best For |
|-------|-------|---------------|----------|
| **Foundation** | Base | - | Extended by all themes |
| **Corporate** | Professional | #1E3A5F | B2B, Enterprise |
| **BitHire** | LinkedIn-style | #0A66C2 | Recruiting, HR |
| **Minimal** | Notion-style | #37352F | Productivity, Docs |

### Portal Customization API

From the admin portal, tenants can customize:

**Branding**
- Main logo, dark mode logo, favicon
- App icons (192x192, 512x512)
- Login background image

**Colors**
- Primary, secondary, accent colors
- Success, warning, error states
- Background colors (light/dark mode)
- Text colors (primary, secondary, muted)

**Typography**
- Font families (heading, body, monospace)
- Base font size, weights, line height
- Letter spacing

**Email Templates**
- Header logo, footer text
- Social links (Twitter, LinkedIn, etc.)
- Custom colors for email campaigns

### ThemeProvider Usage

```typescript
import { ThemeProvider } from "@rottay/design-system";

// Basic usage with tenant resolution
<ThemeProvider tenant="acme-corp">
  <App />
</ThemeProvider>

// With runtime brand override
<ThemeProvider
  tenant="acme-corp"
  branding={{
    primaryColor: "#FF5733",
    accentColor: "#33FF57",
  }}
>
  <App />
</ThemeProvider>
```

### Tenant Resolution

The design system automatically resolves tenant context through:

1. **Headers**: `x-tenant-id` header (server-side)
2. **Subdomains**: `acme.app.rottay.com`
3. **Custom Domains**: `recruiting.acme-corp.com`
4. **Fallback**: Defaults to `rottay` tenant

---

## 8. Web3 & Blockchain

> **60 use cases | 3 networks | Complete Web3-as-a-Service**

The @rottay/web3 module provides enterprise-grade blockchain integration with multi-tenant support.

### Supported Networks

```
+===========================================================================+
|                        BLOCKCHAIN NETWORKS                                |
+===========================================================================+
|                                                                           |
|   MAINNETS                           TESTNETS                             |
|   ────────                           ────────                             |
|   Polygon      (Chain ID: 137)       Polygon Amoy    (80002)              |
|   Base         (Chain ID: 8453)      Base Sepolia    (84532)              |
|   BNB Chain    (Chain ID: 56)        BNB Testnet     (97)                 |
|                                                                           |
|   COMING SOON                                                             |
|   ───────────                                                             |
|   Solana (Non-EVM)                                                        |
|   Arbitrum, Optimism                                                      |
|                                                                           |
+===========================================================================+
```

### Wallet Management

| Wallet Type | Description | Use Case |
|-------------|-------------|----------|
| **Custodial** | Platform-managed private keys | Simple user onboarding |
| **Smart Wallet** | Contract-based with session keys | Advanced UX, gasless txs |
| **External** | User-controlled, linked to platform | Crypto-native users |
| **MPC** | Multi-party computation | Enterprise security |

**Wallet Providers:**
- ThirdWeb (primary)
- Privy
- Fireblocks

### Token Management (ERC-20)

Deploy and manage custom tokens with configurable features:

```typescript
// Deploy a custom token
const result = await deployToken.execute(ctx, {
  name: "Acme Rewards",
  symbol: "ACME",
  initialSupply: 1_000_000,
  features: {
    mintable: true,
    burnable: true,
    pausable: true,
    permit: true,      // Gasless approvals
    voting: false,
    flashMint: false,
  },
  maxSupply: 10_000_000,
});
```

### NFT System

**Badges (ERC-1155 - Semi-Fungible)**

| Type | Description |
|------|-------------|
| Achievement | Unlocked by completing actions |
| Milestone | Reached specific goals |
| Loyalty | Rewarded for engagement |
| Event | Attendance proof |
| Skill | Competency verification |

**Rarity Levels:** Common, Rare, Epic, Legendary

**Certificates (ERC-721 - Non-Fungible)**

| Type | Description |
|------|-------------|
| Completion | Course/training completion |
| Credential | Professional certification |
| License | Official authorization |
| Membership | Organization membership |

**Features:**
- Soulbound option (non-transferable)
- Expiration dates
- On-chain verification codes
- Revocation support

### Staking System

```
+===========================================================================+
|                          STAKING TIERS                                    |
+===========================================================================+
|                                                                           |
|   Tier        Lock Period    APY Range     Min Stake                      |
|   ────        ───────────    ─────────     ─────────                      |
|   Flexible    None           1-5%          None                           |
|   Bronze      30 days        5-8%          100 tokens                     |
|   Silver      90 days        8-12%         500 tokens                     |
|   Gold        180 days       12-18%        1,000 tokens                   |
|   Platinum    365 days       18-25%        5,000 tokens                   |
|   Diamond     730 days       25-35%        10,000 tokens                  |
|                                                                           |
|   Features: Compound rewards, early withdrawal penalties, per-tenant      |
|                                                                           |
+===========================================================================+
```

### Fiat On/Off Ramp

| Provider | Features |
|----------|----------|
| **MoonPay** | Card, bank transfer, Apple Pay |
| **Transak** | Global coverage, 100+ countries |
| **Ramp** | SEPA, PIX (Brazil), ACH (US) |

---

## 9. Infrastructure & DevOps

> **Production-ready infrastructure included with every deployment**

### Multi-Tenant Architecture

```
+===========================================================================+
|                      MULTI-TENANT DATA ISOLATION                          |
+===========================================================================+
|                                                                           |
|   ┌─────────────────────────────────────────────────────────────────┐    |
|   │                        REQUEST FLOW                              │    |
|   │                                                                  │    |
|   │   Request → TenantResolver → TenantContext → All Queries        │    |
|   │                                                                  │    |
|   │   Every database query automatically filtered by tenant_id       │    |
|   │   Zero possibility of cross-tenant data leakage                 │    |
|   │                                                                  │    |
|   └─────────────────────────────────────────────────────────────────┘    |
|                                                                           |
|   TENANT ISOLATION FEATURES:                                              |
|   ├── tenant_id column on ALL tables                                     |
|   ├── TenantContext injected in every request                            |
|   ├── Custom domain support per tenant                                   |
|   ├── Per-tenant feature flags                                           |
|   ├── Per-tenant branding and themes                                     |
|   └── Per-tenant billing and subscriptions                               |
|                                                                           |
+===========================================================================+
```

### Auto-Scaling & Load Balancing

| Strategy | Description |
|----------|-------------|
| **Round Robin** | Equal distribution |
| **Weighted Random** | Configurable weights per provider |
| **Priority Based** | Failover chain |
| **Least Connections** | Route to least busy |

**Resilience Features:**
- Circuit breaker pattern
- Health check service
- Fallback orchestrator
- Provider scoring engine

### Database Management

| Feature | Implementation |
|---------|----------------|
| ORM | Drizzle (type-safe) |
| Migrations | Versioned, automated |
| Seeds | 18+ seed files for development |
| Database | PostgreSQL 16 optimized |

### Containerization

```yaml
# Production-ready Docker setup
Services:
  - PostgreSQL 16 (persistent volumes)
  - Redis 7 (RDB + AOF persistence)
  - Typesense 26 (full-text search)
  - OpenObserve (observability)

Features:
  - Multi-stage Dockerfile
  - Alpine-based images (minimal attack surface)
  - Non-root user execution
  - Health checks built-in
  - Layer caching optimized
```

### CI/CD Pipelines (GitHub Actions)

| Pipeline | Purpose |
|----------|---------|
| `ci.yml` | Continuous integration |
| `cd-staging.yml` | Deploy to staging |
| `cd-production.yml` | Deploy to production (with gates) |
| `vercel-production.yml` | Vercel deployments |

**Production Gate:** Requires typing "DEPLOY" for confirmation

### Monitoring & Observability

```
+===========================================================================+
|                        OBSERVABILITY STACK                                |
+===========================================================================+
|                                                                           |
|   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐                    |
|   │   LOGS      │   │   METRICS   │   │   TRACES    │                    |
|   │ OpenObserve │   │ Prometheus  │   │   Jaeger    │                    |
|   └──────┬──────┘   └──────┬──────┘   └──────┬──────┘                    |
|          │                 │                 │                            |
|          └─────────────────┼─────────────────┘                            |
|                            │                                              |
|                   ┌────────┴────────┐                                     |
|                   │     GRAFANA     │                                     |
|                   │   Dashboards    │                                     |
|                   └─────────────────┘                                     |
|                                                                           |
|   Collector: OpenTelemetry                                                |
|   Alerting: Prometheus Alertmanager                                       |
|                                                                           |
+===========================================================================+
```

---

## 10. Metrics Summary

```
+===========================================================================+
|                         ROTTAY PLATFORM METRICS                           |
+===========================================================================+
|                                                                           |
|   +---------------------------+   +---------------------------+           |
|   |       USE CASES           |   |         ENTITIES          |           |
|   |           731             |   |           156             |           |
|   |   (445 mut + 286 qry)     |   |    (across 8 domains)     |           |
|   +---------------------------+   +---------------------------+           |
|                                                                           |
|   +---------------------------+   +---------------------------+           |
|   |      LINES OF CODE        |   |       TEST FILES          |           |
|   |         626,862           |   |           734             |           |
|   |     (production code)     |   |    (unit + integration)   |           |
|   +---------------------------+   +---------------------------+           |
|                                                                           |
|   +---------------------------+   +---------------------------+           |
|   |    PLATFORM MODULES       |   |     DOMAIN MODULES        |           |
|   |            7              |   |            8              |           |
|   |  (auth, tenancy, perms)   |   | (talent, payments, web3)  |           |
|   +---------------------------+   +---------------------------+           |
|                                                                           |
|   +---------------------------+   +---------------------------+           |
|   |    @rottay/core EXPORTS   |   |    SUPPORTED PROVIDERS    |           |
|   |          450+             |   |           20+             |           |
|   |  (errors, utils, types)   |   |   (AI, payments, chains)  |           |
|   +---------------------------+   +---------------------------+           |
|                                                                           |
+===========================================================================+
|  Architecture: Hexagonal + DDD + CQRS | Language: TypeScript 5.4+         |
|  Framework: Next.js 15 | Database: PostgreSQL 15 | Cache: Redis 7        |
+===========================================================================+
```

---

## 11. Code Patterns & Conventions

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Folders | kebab-case | `use-cases/`, `staff-member/` |
| Files | kebab-case | `create-user.use-case.ts` |
| Interfaces | I + PascalCase | `IUserRepository`, `IPaymentGateway` |
| Types | PascalCase | `User`, `PaymentStatus` |
| Classes | PascalCase | `CreateUserUseCase`, `UserMapper` |
| Factories | make* | `makeUserRepository()`, `makePaymentService()` |
| Validators | *Schema | `createUserSchema`, `paymentInputSchema` |
| Constants | SCREAMING_SNAKE | `MAX_RETRY_ATTEMPTS`, `DEFAULT_PAGE_SIZE` |
| Enums | PascalCase | `UserStatus`, `PaymentType` |

### Result Pattern

```typescript
// All use cases return Result<T, E>
import { Result, success, error, isSuccess, isError } from "@rottay/core";

// Success case
return success(user);

// Error case
return error(new ValidationError("Invalid email format"));

// Consuming results
const result = await createUser.execute(input);

if (isSuccess(result)) {
  const user = result.data;
  // Handle success
}

if (isError(result)) {
  const err = result.error;
  // Handle error
}
```

### TenantContext Enforcement

```typescript
// EVERY repository method receives TenantContext
// EVERY query is automatically scoped to tenant

interface IUserRepository {
  findById(ctx: TenantContext, id: string): Promise<User | null>;
  findAll(ctx: TenantContext, filters: UserFilters): Promise<User[]>;
  create(ctx: TenantContext, data: CreateUserData): Promise<User>;
}

// Implementation automatically applies tenant filter
async findById(ctx: TenantContext, id: string): Promise<User | null> {
  return this.db.query.users.findFirst({
    where: and(
      eq(users.id, id),
      eq(users.tenantId, ctx.tenantId),  // <-- Always enforced
      eq(users.isActive, true)            // <-- Soft delete filter
    )
  });
}
```

### Soft Delete Pattern

```typescript
// NEVER use DELETE - always set isActive = false

// Wrong
await this.db.delete(users).where(eq(users.id, id));

// Correct
await this.db.update(users)
  .set({
    isActive: false,
    updatedAt: new Date(),
    updatedBy: ctx.userId
  })
  .where(eq(users.id, id));
```

### Standard Audit Fields

```typescript
// Every entity includes these fields
interface AuditFields {
  id: string;           // UUID v7 (time-sortable)
  tenantId: string;     // Tenant isolation
  companyId: string;    // Company within tenant
  isActive: boolean;    // Soft delete flag
  createdAt: Date;      // Creation timestamp
  updatedAt: Date;      // Last modification
  createdBy: string;    // User who created
  updatedBy: string;    // User who last modified
}
```

---

## 12. Security Architecture

### Multi-Tenant Isolation

```
+------------------------------------------------------------------+
|                    TENANT ISOLATION LAYERS                        |
+------------------------------------------------------------------+
|                                                                   |
|  Layer 1: Application Context                                     |
|  +------------------------------------------------------------+  |
|  |  TenantContext injected into every use case                |  |
|  |  - tenantId, companyId, userId extracted from JWT          |  |
|  |  - Context validated before any operation                   |  |
|  +------------------------------------------------------------+  |
|                              |                                    |
|  Layer 2: Repository Enforcement                                  |
|  +------------------------------------------------------------+  |
|  |  Every query automatically filtered by tenantId            |  |
|  |  - No way to bypass at repository level                    |  |
|  |  - Type system enforces TenantContext parameter            |  |
|  +------------------------------------------------------------+  |
|                              |                                    |
|  Layer 3: Database Row-Level Security                             |
|  +------------------------------------------------------------+  |
|  |  PostgreSQL RLS policies as final safeguard                |  |
|  |  - Even raw SQL queries are tenant-scoped                  |  |
|  |  - Audit logging for any cross-tenant access attempt       |  |
|  +------------------------------------------------------------+  |
|                                                                   |
+------------------------------------------------------------------+
```

### Encryption Strategy

| Layer | Implementation | Scope |
|-------|----------------|-------|
| **At Rest** | AES-256-GCM | All database fields |
| **In Transit** | TLS 1.3 | All API communication |
| **Field-Level** | @Encrypted decorator | PII, financial data, credentials |
| **Secrets** | AWS Secrets Manager | API keys, certificates |
| **Tokens** | JWT RS256 | Session tokens, API tokens |

```typescript
// Field-level encryption with @Encrypted decorator
@Entity()
export class User {
  @Column()
  email: string;

  @Encrypted()  // <-- Automatically encrypted/decrypted
  @Column()
  ssn: string;

  @Encrypted()
  @Column()
  bankAccountNumber: string;
}
```

### Compliance Certifications

| Standard | Status | Scope |
|----------|--------|-------|
| **SOC 2 Type II** | Compliant | Security, Availability, Confidentiality |
| **HIPAA** | Compliant | Healthcare data handling |
| **GDPR** | Compliant | EU data protection |
| **ISO 27001** | Compliant | Information security management |
| **PCI-DSS** | Level 1 | Payment card data |

---

## 13. Testing Strategy

### Testing Pyramid

```
                        +-------+
                       /   E2E   \
                      /  Playwright \
                     / Happy Paths   \
                    +-------+-------+
                   /                  \
                  /    INTEGRATION     \
                 /    Vitest + Real DB  \
                /   Repository + UseCase \
               +------------+------------+
              /                            \
             /           UNIT               \
            /          Vitest                \
           /  Domain Logic | Validators       \
          /     Transformers | Utilities       \
         +------------------+------------------+
```

### Test Categories

| Type | Tool | Scope | Database |
|------|------|-------|----------|
| **Unit** | Vitest | Pure functions, validators, transformers | None |
| **Integration** | Vitest | Repositories, use cases, services | Real PostgreSQL |
| **E2E** | Playwright | Full user workflows | Real PostgreSQL |

### Testing Philosophy: NO MOCKS

```typescript
// WRONG - Mocking hides integration issues
const mockRepo = {
  findById: vi.fn().mockResolvedValue(mockUser),
  create: vi.fn().mockResolvedValue(mockUser),
};

// CORRECT - Real implementations, real database
describe("CreateUserUseCase", () => {
  let db: DrizzleClient;
  let userRepo: UserRepository;
  let useCase: CreateUserUseCase;

  beforeEach(async () => {
    db = await createTestDatabase();
    userRepo = new UserRepository(db);
    useCase = new CreateUserUseCase(userRepo);
  });

  afterEach(async () => {
    await cleanupTestDatabase(db);
  });

  it("should create a user with valid input", async () => {
    const result = await useCase.execute(ctx, validInput);

    expect(isSuccess(result)).toBe(true);

    // Verify in real database
    const dbUser = await userRepo.findById(ctx, result.data.id);
    expect(dbUser).not.toBeNull();
    expect(dbUser.email).toBe(validInput.email);
  });
});
```

### Coverage Requirements

| Metric | Minimum | Target |
|--------|---------|--------|
| Line Coverage | 80% | 90% |
| Branch Coverage | 75% | 85% |
| Function Coverage | 85% | 95% |
| Critical Paths | 100% | 100% |

### Test File Distribution

| Module | Test Files | Coverage |
|--------|------------|----------|
| @rottay/talent | 265 | 89% |
| @rottay/ai-assistant | 193 | 84% |
| @rottay/web3 | 163 | 91% |
| @rottay/payments | 60 | 88% |
| @rottay/bar | 23 | 76% |
| @rottay/staff | 18 | 72% |
| @rottay/ticketing | 12 | 68% |
| @rottay/assessment | 0* | - |
| **TOTAL** | **734** | **83%** |

*\* Assessment module tests in development*

---

## Appendix: Module Dependency Graph

```
+===========================================================================+
|                      MODULE DEPENDENCY GRAPH                               |
+===========================================================================+

                              @rottay/core
                                   |
         +------------+------------+------------+------------+
         |            |            |            |            |
         v            v            v            v            v
    @rottay/     @rottay/    @rottay/    @rottay/    @rottay/
      auth        tenancy     identity    perms       flags
         |            |            |            |            |
         +------------+-----+------+------------+------------+
                            |
                            v
                     DOMAIN MODULES
         +--------+--------+--------+--------+--------+
         |        |        |        |        |        |
         v        v        v        v        v        v
      talent  assessment   ai    web3     bar     staff
         |        |        |        |        |        |
         +--------+--------+---+----+--------+--------+
                               |
                               v
                        @rottay/payments
                               |
                               v
                        @rottay/ticketing
```

---

**Built with precision. Engineered for scale. Ready for production.**

*626,862 lines of TypeScript | 731 use cases | 156 entities | 734 test files*
