# BitHire Surface Adapters

> Auto-generated: 2026-03-23
> Source: `app-bithire/src/surfaces/*/_ shared/adapter.ts`

## Overview

Surface adapters implement the **EntityAdapter** pattern from `@rottay/design-system`.
They transform raw domain entities into flat **view models** optimized for table/card rendering.

Each adapter provides:
1. **`entity`** - domain name (e.g., "candidate")
2. **`version`** - semantic version for schema evolution
3. **`map()`** - transforms raw entity to flat view model
4. **`fields[]`** - canonical field definitions with stable `fieldId`s

The `fieldId` contract connects permissions, column configs, and cell renderers
without brittle implicit property coupling.

---

## Adapter Locations

| Domain | File | Adapter Name | View Model |
|--------|------|-------------|------------|
| candidates | `candidates/_shared/adapter.ts` | `candidateListAdapter` | `CandidateListView` |
| applications | `applications/_shared/adapter.ts` | `applicationListAdapter` | `ApplicationListView` |
| interviews | `interviews/_shared/adapter.ts` | `interviewListAdapter` | `InterviewListView` |
| jobs | `jobs/_shared/adapter.ts` | `jobListAdapter` | `JobListView` |
| offers | `offers/_shared/adapter.ts` | `offerListAdapter` | `OfferListView` |
| recruiters | `recruiters/_shared/adapter.ts` | `recruiterListAdapter` | `RecruiterListView` |

---

## Adapter Details

### candidateListAdapter

**Source entity**: `Candidate` (from `@/types`)
**View model**: `CandidateListView`

| Field Key | Field ID | Type | Notes |
|-----------|----------|------|-------|
| name | candidate.name | string | `firstName + lastName` combined |
| email | candidate.email | string | |
| status | candidate.status | CandidateStatus | |
| source | candidate.source | string | |
| skills | candidate.skills | string[] | Flattened to name strings only |
| totalApplications | candidate.totalApplications | number | Defaults to 0 |
| lastActivityAt | candidate.lastActivityAt | Date? | |
| createdAt | candidate.createdAt | Date | |
| avatarUrl | candidate.avatarUrl | string? | |

**Companion helpers** (`candidates/_shared/helpers.ts`):
- `getCandidateStatusVariant(status)` - maps status to BadgeVariant
- `formatCandidateSource(source)` - human-readable source label

---

### applicationListAdapter

**Source entity**: `Application` (from `@/types`)
**View model**: `ApplicationListView`

| Field Key | Field ID | Type | Notes |
|-----------|----------|------|-------|
| candidateId | application.candidateId | string | FK to candidate |
| jobId | application.jobId | string | FK to job |
| status | application.status | ApplicationStatus | From `@rottay/recruiter` |
| currentStage | application.currentStage | string | Defaults to "Not assigned" |
| source | application.source | string | |
| aiMatchScore | application.aiMatchScore | number? | 0-100 |
| priority | application.priority | string | |
| daysInPipeline | application.daysInPipeline | number | Computed |
| appliedAt | application.appliedAt | Date | |
| lastActivityAt | application.lastActivityAt | Date? | Maps from `lastCommunicationAt` |

**Companion helpers** (`applications/_shared/helpers.ts`):
- Status variant helpers using `BadgeVariant`

---

### interviewListAdapter

**Source entity**: `InterviewWithParticipants` (from `@/types/domain/interviews`)
**View model**: `InterviewListView`

| Field Key | Field ID | Type | Notes |
|-----------|----------|------|-------|
| candidateName | interview.candidateName | string | Combined first + last |
| jobTitle | interview.jobTitle | string | Hardcoded "Untitled Position" (needs upstream join) |
| type | interview.type | string | Human-readable via `formatInterviewType()` |
| typeRaw | - | InterviewType | Raw enum for programmatic use |
| status | interview.status | InterviewStatus | |
| scheduledAt | interview.scheduledAt | Date/string? | |
| duration | interview.duration | string | Formatted via `formatDuration()` |
| durationMinutes | - | number | Raw minutes for sorting |
| overallScore | interview.overallScore | number? | 0-100 |
| interviewers | interview.interviewers | string | Comma-joined names |

**Companion helpers** (`interviews/_shared/helpers.ts`):
- `getInterviewStatusVariant(status)` - maps status to BadgeVariant
- `formatInterviewType(type)` - human-readable type label
- `formatDuration(minutes)` - e.g., "45 min"

---

### jobListAdapter

**Source entity**: `Job` (from `@/types`)
**View model**: `JobListView`

| Field Key | Field ID | Type | Notes |
|-----------|----------|------|-------|
| title | job.title | string | |
| department | job.department | string | Defaults to "No department" |
| status | job.status | JobStatus | |
| workMode | job.workMode | WorkMode | |
| location | job.location | string | Composed from primaryLocation fields |
| totalApplications | job.totalApplications | number | Defaults to 0 |
| salary | job.salary | string | Formatted via `formatSalaryRange()` |
| currency | - | string | Defaults to "USD" |
| createdAt | job.createdAt | Date | |

**Companion helpers** (`jobs/_shared/helpers.ts`):
- `getJobStatusVariant(status)` - maps status to BadgeVariant
- `formatWorkMode(mode)` - human-readable work mode
- `formatSalaryRange(min, max, currency)` - formatted salary range

---

### offerListAdapter

**Source entity**: `OfferContentItem` (from `@/types/domain/offers`)
**View model**: `OfferListView`

| Field Key | Field ID | Type | Notes |
|-----------|----------|------|-------|
| candidateName | offer.candidateName | string | Server-side join |
| jobTitle | offer.jobTitle | string | Server-side join |
| status | offer.status | OfferStatus | From `@rottay/recruiter` |
| salary | offer.salary | string | Formatted via `formatSalary()` |
| currency | - | string | Hardcoded "USD" |
| sentAt | offer.sentAt | string | Uses `createdAt` as proxy |
| expiresAt | offer.expiresAt | string | |
| daysUntilExpiry | offer.daysUntilExpiry | number | Computed via `daysUntilExpiry()` |

**Companion helpers** (`offers/_shared/helpers.ts`):
- `getOfferStatusVariant(status)` - maps status to BadgeVariant
- `formatSalary(amount)` - formatted salary string
- `daysUntilExpiry(expiresAt)` - days remaining

---

### recruiterListAdapter

**Source entity**: `RecruiterSummary` (from `@/types`)
**View model**: `RecruiterListView`

| Field Key | Field ID | Type | Notes |
|-----------|----------|------|-------|
| name | recruiter.name | string | |
| email | recruiter.email | string | |
| role | recruiter.role | string | Department or first specialization |
| status | recruiter.status | string | |
| activeJobs | recruiter.activeJobs | number | Defaults to 0 |
| totalPlacements | recruiter.totalPlacements | number | Not yet on RecruiterSummary (defaults 0) |
| hiredThisMonth | recruiter.hiredThisMonth | number | Not yet on RecruiterSummary (defaults 0) |

**Companion helpers** (`recruiters/_shared/helpers.ts`):
- `getRecruiterStatusVariant(status)` - maps status to BadgeVariant

---

## Architecture Pattern

```
page.tsx (Next.js route)
  |
  v
SurfaceScreen (e.g., CandidatesListSurfaceScreen)
  |
  +-- useSurfacePermissions() -- RBAC gating
  +-- useListController() -- column/sort/filter/view state
  +-- server action (e.g., listCandidates) -- data fetch
  |
  v
adapter.map(rawEntity) -- transforms to view model
  |
  v
PatternDataTable (DS pattern) -- renders with columns + actions
```

### Domains Without Adapters

The following surface modules do NOT have adapters because they either:
- Are single-screen dashboards (no list surface)
- Use custom rendering without PatternDataTable
- Are feature-gated rather than data-driven

activity, admin, ai-studio, analytics, approvals, calibration, clients, dashboard,
hiring-command, my-interviews, outreach, pipeline, positions, profile,
recruiter-hub, scoring, settings, sprints, talent-pool, team
