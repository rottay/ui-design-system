# Recruiter Module (dm-recruiter)

> **Complete Applicant Tracking System (ATS) for modern recruiting**

## What It Does

The Recruiter module provides a full-featured ATS for managing the entire hiring process. It handles candidates, job postings, applications, interviews, and offers with a customizable pipeline workflow.

The module supports AI-assisted interviews, integrates with the Scoring module for candidate evaluation, and provides comprehensive analytics for hiring metrics. It includes approval workflows for enterprise hiring processes and bulk operations for high-volume recruiting.

## When to Use

- **Candidate Management**: Create and track candidate profiles
- **Job Postings**: Create, publish, and manage job listings
- **Applications**: Process applications through pipeline stages
- **Interviews**: Schedule and conduct interviews (including AI)
- **Offers**: Create, send, and negotiate job offers
- **Analytics**: Track hiring metrics and recruiter performance

## Key Concepts

| Concept | Description |
|---------|-------------|
| **Candidate** | Person applying for positions |
| **Job** | Job posting with requirements |
| **Application** | Candidate's application to a job |
| **Interview** | Scheduled interview session |
| **Offer** | Job offer to candidate |
| **Pipeline** | Application workflow stages |

## Documentation

| File | Content |
|------|---------|
| [USE-CASES.md](./USE-CASES.md) | All 129 use cases (76 mutations + 53 queries) + 10 orchestrators |
| [ENTITIES.md](./ENTITIES.md) | Data schemas and relationships |

## REVIEW-2026: Result Pattern Migration

- **Status**: Complete -- all 129 use cases migrated
- **Pattern**: All use cases now return `Result<T>` via `createSuccessResult(data)` and `createErrorResult(code, message, details)` from `@rottay/core` instead of throwing errors or returning manual `{ success: true/false }` objects
- **Interface naming**: 57 I-prefix interfaces renamed (removed `I` prefix per naming convention)
- **Cleanup**: All `console.log` statements removed
- **Codebase size**: ~100K LOC

## Import

```typescript
// Candidates
import { makeCreateCandidateUC, makeUpdateCandidateUC, makeMergeCandidatesUC } from '@rottay/recruiter';

// Jobs
import { makeCreateJobUC, makePublishJobUC, makeCloseJobUC } from '@rottay/recruiter';

// Applications
import { makeCreateApplicationUC, makeAdvanceStageUC, makeRejectApplicationUC } from '@rottay/recruiter';

// Interviews
import { makeScheduleInterviewUC, makeStartAiSessionUC, makeSubmitFeedbackUC } from '@rottay/recruiter';

// Offers
import { makeCreateOfferUC, makeSendOfferUC, makeAcceptOfferUC } from '@rottay/recruiter';
```

## Pipeline Stages

```typescript
type ApplicationStage =
  | 'applied'        // Application received
  | 'screening'      // Initial screening
  | 'phone_screen'   // Phone interview
  | 'interview'      // In-person interviews
  | 'assessment'     // Technical assessment
  | 'reference_check'// Reference verification
  | 'offer'          // Offer stage
  | 'hired'          // Successfully hired
  | 'rejected'       // Rejected
  | 'withdrawn';     // Candidate withdrew
```

## Token Economy: Purchase and Distribution (2026-02-06 Audit)

The recruiter module manages the token wallet layer of the AI Token Economy:

- **TeamTokenQuota**: Per-team token balance with reservation support
- **TeamTokenTransaction**: Ledger of all token movements (purchase, allocation, consumption, reservation, release, transfer, adjustment, rollover, bonus)
- **Purchase flow**: Tokens purchased individually or as company pool via dm-payments integration
- **Distribution flow**: Tenant admins distribute company pool tokens to teams; team leads allocate to individual quotas
- **Reserve/Consume/Settle pattern**: `Estimate -> Reserve -> Consume -> Settle (refund unused)` for AI interview token usage

## Session 2026-02-06 Changes

- **Deprecated shims + 22 schema aliases cleaned**: Removed legacy re-export shims and redundant schema type aliases that duplicated canonical definitions
- **N+1 queries fixed**: Repository queries that caused N+1 database round-trips have been consolidated into proper JOIN-based queries
- **ESLint v9 flat config**: Migrated from `.eslintrc.json` to ESLint v9 flat config (`eslint.config.js`). Legacy `.eslintrc.json` deleted.

## Related Modules

- [Scoring](../scoring/) - AI-powered candidate evaluation
- [IA-Chat](../ia-chat/) - AI interview capabilities
- [Notifications](../../platform/notifications/) - Candidate communications
