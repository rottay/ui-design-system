# BitHire Surface Adapters

> All adapters in `app-bithire/src/surfaces/{module}/_shared/adapter.ts`.
> Each implements `EntityAdapter<Source, View>` from `@rottay/design-system`.

## Adapter Index

| Module | Adapter | Source Type | View Model | Helper File |
|--------|---------|------------|------------|-------------|
| candidates | `candidateListAdapter` | `Candidate` (from `@/types`) | `CandidateListView` | `helpers.ts` |
| jobs | `jobListAdapter` | `Job` (from `@/types`) | `JobListView` | `helpers.ts` |
| interviews | `interviewListAdapter` | `InterviewWithParticipants` (from `@/types/domain/interviews`) | `InterviewListView` | `helpers.ts` |
| offers | `offerListAdapter` | `OfferContentItem` (from `@/types/domain/offers`) | `OfferListView` | `helpers.ts` |
| applications | `applicationListAdapter` | `Application` (from `@/types`) | `ApplicationListView` | `helpers.ts` |
| recruiters | `recruiterListAdapter` | `RecruiterSummary` (from `@/types`) | `RecruiterListView` | `helpers.ts` |

---

## Adapter Details

### candidateListAdapter
- **Source**: `Candidate` from `@/types`
- **View fields**: id, fullName, email, avatar, status, statusLabel, statusVariant, source, sourceLabel, score, scoreLabel, matchPercent, appliedAt, appliedAtLabel
- **Computed values**: fullName (concatenation), statusLabel/statusVariant (from status), scoreLabel (formatted score)

### jobListAdapter
- **Source**: `Job` from `@/types`
- **View fields**: id, title, department, location, status, statusLabel, statusVariant, workMode, workModeLabel, salaryRange, salaryRangeLabel, candidateCount, openDays
- **Computed values**: `workModeLabel` (via `formatWorkMode()`), `salaryRangeLabel` (via `formatSalaryRange()`)
- **Enums**: `JobStatus`, `WorkMode` from `@/types/enums/job-status`

### interviewListAdapter
- **Source**: `InterviewWithParticipants` from `@/types/domain/interviews`
- **View fields**: id, candidateName, jobTitle, type, typeLabel, status, statusLabel, statusVariant, scheduledAt, scheduledAtLabel, duration, durationLabel, score, scoreLabel, interviewerCount
- **Computed values**: `typeLabel` (via `formatInterviewType()`), `durationLabel` (via `formatDuration()`)
- **Enums**: `InterviewStatus`, `InterviewType` from `@/types/enums`

### offerListAdapter
- **Source**: `OfferContentItem` from `@/types/domain/offers`
- **View fields**: id, candidateName, jobTitle, status, statusLabel, statusVariant, salary, salaryLabel, startDate, startDateLabel, expiresAt, daysUntilExpiry, isExpiringSoon
- **Computed values**: `salaryLabel` (via `formatSalary()`), `daysUntilExpiry` (via `daysUntilExpiry()`)
- **Enums**: `OfferStatus` from `@rottay/recruiter`

### applicationListAdapter
- **Source**: `Application` from `@/types`
- **View fields**: id, candidateName, candidateEmail, jobTitle, status, statusLabel, statusVariant, stage, stageLabel, score, submittedAt, submittedAtLabel, lastActivityAt
- **Enums**: `ApplicationStatus` from `@rottay/recruiter`

### recruiterListAdapter
- **Source**: `RecruiterSummary` from `@/types`
- **View fields**: id, fullName, email, avatar, role, roleLabel, status, statusLabel, statusVariant, activeJobs, totalPlacements, avgTimeToFill, specializations, lastActiveAt
- **Computed values**: Various computed labels and counts from recruiter metrics
