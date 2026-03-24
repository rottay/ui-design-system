# dm-recruiter - Use Cases

> **ATS (Applicant Tracking System) - Candidate tracking and hiring management**

**Total: 145 use cases (82 mutations, 63 queries) + 10 orchestrators | 145 zero-arg factories (100% coverage)**

> **REVIEW-2026 Result Pattern Migration**: Complete. All 129 use cases return `Result<T>` using `createSuccessResult(data)` / `createErrorResult(code, message, details)` from `@rottay/core`. 57 I-prefix interfaces renamed. All `console.log` statements cleaned up. ~100K LOC.

---

## Quick Index

### Mutations
- [Application](#application)
- [Candidate](#candidate)
- [Interview](#interview)
- [Job](#job)
- [Offer](#offer)
- [Recruiter](#recruiter)
- [Team](#team)
- [Team Sprint](#team-sprint)
- [Approval](#approval)
- [Client](#client)
- [Position](#position)
- [Talent Pool](#talent-pool)
- [Token Management](#token-management)
- [Message Template](#message-template)
- [Outreach](#outreach)

### Queries
- [Application Queries](#application-queries)
- [Candidate Queries](#candidate-queries)
- [Interview Queries](#interview-queries)
- [Interview Template Queries](#interview-template-queries)
- [Job Queries](#job-queries)
- [Offer Queries](#offer-queries)
- [Recruiter Queries](#recruiter-queries)
- [Team Queries](#team-queries)
- [Team Sprint Queries](#team-sprint-queries)
- [Approval Queries](#approval-queries)
- [Client Queries](#client-queries)
- [Position Queries](#position-queries)
- [Activity Timeline Queries](#activity-timeline-queries)
- [Candidate Matching Queries](#candidate-matching-queries)
- [Talent Pool Queries](#talent-pool-queries)
- [SLA Queries](#sla-queries)
- [Analytics](#analytics)
- [Token Queries](#token-queries)
- [Message Template Queries](#message-template-queries)
- [Outreach Queries](#outreach-queries)

### Additional
- [Orchestrators](#orchestrators)
- [Pipeline Stages](#pipeline-stages)
- [Application Status](#application-status)
- [Entities](#entities)
- [Related Modules](#related-modules)

---

## Overview

The **Recruiter Module** implements a complete **Applicant Tracking System (ATS)** for managing the entire hiring lifecycle. It provides comprehensive functionality for:

- **Job Management**: Create, publish, and manage job postings across multiple channels
- **Candidate Tracking**: Maintain candidate profiles, experience, education, and skills
- **Application Pipeline**: Process applications through configurable workflow stages
- **Interview Coordination**: Schedule, conduct, and evaluate interviews (including AI-powered sessions)
- **Offer Management**: Create, negotiate, and track job offers through approval workflows
- **Analytics & Reporting**: Track hiring metrics, recruiter performance, and source effectiveness
- **Talent Pool**: Maintain and search curated pools of candidates
- **Client & Position Management**: Manage hiring clients and open positions with approval workflows
- **Team & Sprint Management**: Organize recruiting teams with sprint-based goal tracking

The module integrates with **dm-scoring** for candidate evaluation and **dm-ia-chat** for AI-powered interview capabilities.

---

## Mutations

### Application

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| submit | Submits a new job application | `SubmitApplicationUseCase` | `makeSubmitApplicationUseCase` |
| update | Updates application data | `UpdateApplicationUseCase` | `makeUpdateApplicationUseCase` |
| withdraw | Withdraws application | `WithdrawApplicationUseCase` | `makeWithdrawApplicationUseCase` |
| advance-stage | Advances to next pipeline stage | `AdvanceStageUseCase` | `makeAdvanceStageUseCase` |
| reject | Rejects application | `RejectApplicationUseCase` | `makeRejectApplicationUseCase` |
| score | Scores application | `ScoreApplicationUseCase` | `makeScoreApplicationUseCase` |
| add-note | Adds note to application | `AddApplicationNoteUseCase` | `makeAddApplicationNoteUseCase` |
| assign-recruiter | Assigns recruiter to application | `AssignRecruiterToApplicationUseCase` | `makeAssignRecruiterToApplicationUseCase` |
| bulk-advance | Bulk advances multiple applications | `BulkAdvanceApplicationsUseCase` | `makeBulkAdvanceApplicationsUseCase` |
| bulk-reject | Bulk rejects multiple applications | `BulkRejectApplicationsUseCase` | `makeBulkRejectApplicationsUseCase` |

### Candidate

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| create | Creates new candidate | `CreateCandidateUseCase` | `makeCreateCandidateUseCase` |
| update | Updates candidate data | `UpdateCandidateUseCase` | `makeUpdateCandidateUseCase` |
| archive | Archives candidate | `ArchiveCandidateUseCase` | `makeArchiveCandidateUseCase` |
| merge | Merges duplicate candidates | `MergeCandidatesUseCase` | `makeMergeCandidatesUseCase` |
| do-not-contact | Marks candidate as do not contact | `SetDoNotContactUseCase` | `makeSetDoNotContactUseCase` |
| add-experience | Adds work experience | `AddExperienceUseCase` | `makeAddExperienceUseCase` |
| add-education | Adds education | `AddEducationUseCase` | `makeAddEducationUseCase` |
| update-skills | Updates skills | `UpdateSkillsUseCase` | `makeUpdateSkillsUseCase` |

### Interview

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| schedule | Schedules interview | `ScheduleInterviewUseCase` | `makeScheduleInterviewUseCase` |
| reschedule | Reschedules interview | `RescheduleInterviewUseCase` | `makeRescheduleInterviewUseCase` |
| cancel | Cancels interview | `CancelInterviewUseCase` | `makeCancelInterviewUseCase` |
| start | Starts interview | `StartInterviewUseCase` | `makeStartInterviewUseCase` |
| complete | Completes interview | `CompleteInterviewUseCase` | `makeCompleteInterviewUseCase` |
| submit-feedback | Submits interview feedback | `SubmitInterviewFeedbackUseCase` | `makeSubmitInterviewFeedbackUseCase` |
| update | Updates interview | `UpdateInterviewUseCase` | `makeUpdateInterviewUseCase` |
| start-ai-session | Starts AI interview session | `StartAIInterviewSessionUseCase` | `makeStartAIInterviewSessionUseCase` |
| create-template | Creates interview template | `CreateInterviewTemplateUseCase` | `makeCreateInterviewTemplateUseCase` |
| update-template | Updates template | `UpdateInterviewTemplateUseCase` | `makeUpdateInterviewTemplateUseCase` |
| delete-template | Soft-deletes interview template | `DeleteInterviewTemplateUseCase` | `makeDeleteInterviewTemplateUseCase` |

### Job

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| create | Creates new job posting | `CreateJobUseCase` | `makeCreateJobUseCase` |
| update | Updates job posting | `UpdateJobUseCase` | `makeUpdateJobUseCase` |
| publish | Publishes job posting | `PublishJobUseCase` | `makePublishJobUseCase` |
| pause | Pauses publication | `PauseJobUseCase` | `makePauseJobUseCase` |
| close | Closes job posting | `CloseJobUseCase` | `makeCloseJobUseCase` |
| reactivate | Reactivates job posting | `ReactivateJobUseCase` | `makeReactivateJobUseCase` |
| duplicate | Duplicates job posting | `DuplicateJobUseCase` | `makeDuplicateJobUseCase` |

### Offer

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| create | Creates job offer | `CreateOfferUseCase` | `makeCreateOfferUseCase` |
| update | Updates offer | `UpdateOfferUseCase` | `makeUpdateOfferUseCase` |
| send | Sends offer to candidate | `SendOfferUseCase` | `makeSendOfferUseCase` |
| approve | Approves offer | `ApproveOfferUseCase` | `makeApproveOfferUseCase` |
| accept | Candidate accepts offer | `AcceptOfferUseCase` | `makeAcceptOfferUseCase` |
| decline | Candidate declines offer | `DeclineOfferUseCase` | `makeDeclineOfferUseCase` |
| negotiate | Negotiates terms | `NegotiateOfferUseCase` | `makeNegotiateOfferUseCase` |
| withdraw | Withdraws offer | `WithdrawOfferUseCase` | `makeWithdrawOfferUseCase` |

### Recruiter

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| create | Creates recruiter profile | `CreateRecruiterUseCase` | `makeCreateRecruiterUseCase` |
| update | Updates recruiter | `UpdateRecruiterUseCase` | `makeUpdateRecruiterUseCase` |
| deactivate | Deactivates recruiter | `DeactivateRecruiterUseCase` | `makeDeactivateRecruiterUseCase` |
| assign-to-job | Assigns recruiter to job | `AssignRecruiterToJobUseCase` | `makeAssignRecruiterToJobUseCase` |

### Approval

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| process | Processes approval request | `ProcessApprovalUseCase` | `makeProcessApprovalUseCase` |
| create-request | Creates a new approval request | `CreateApprovalRequestUseCase` | `makeCreateApprovalRequestUseCase` |
| escalate | Escalates an approval to next level | `EscalateApprovalUseCase` | `makeEscalateApprovalUseCase` |
| cancel | Cancels an approval request | `CancelApprovalUseCase` | `makeCancelApprovalUseCase` |

### Client

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| create | Creates a new client | `CreateClientUseCase` | `makeCreateClientUseCase` |
| create-with-approval | Creates client with approval workflow | `CreateClientWithApprovalUseCase` | `makeCreateClientWithApprovalUseCase` |
| update | Updates client details | `UpdateClientUseCase` | `makeUpdateClientUseCase` |
| deactivate | Deactivates a client | `DeactivateClientUseCase` | `makeDeactivateClientUseCase` |

### Position

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| create | Creates a new position | `CreatePositionUseCase` | `makeCreatePositionUseCase` |
| create-with-approval | Creates position with approval | `CreatePositionWithApprovalUseCase` | `makeCreatePositionWithApprovalUseCase` |
| update | Updates position details | `UpdatePositionUseCase` | `makeUpdatePositionUseCase` |
| deactivate | Deactivates a position | `DeactivatePositionUseCase` | `makeDeactivatePositionUseCase` |
| close | Closes a position | `ClosePositionUseCase` | `makeClosePositionUseCase` |
| bulk-assign-to-team | Bulk assigns positions to a team | `BulkAssignPositionsToTeamUseCase` | `makeBulkAssignPositionsToTeamUseCase` |

### Team

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| create | Creates a new team | `CreateTeamUseCase` | `makeCreateTeamUseCase` |
| update | Updates team details | `UpdateTeamUseCase` | `makeUpdateTeamUseCase` |
| deactivate | Deactivates a team (soft delete) | `DeactivateTeamUseCase` | `makeDeactivateTeamUseCase` |
| add-member | Adds a recruiter to a team | `AddTeamMemberUseCase` | `makeAddTeamMemberUseCase` |
| remove-member | Removes a member from a team | `RemoveTeamMemberUseCase` | `makeRemoveTeamMemberUseCase` |
| update-member | Updates member role/allocation | `UpdateTeamMemberUseCase` | `makeUpdateTeamMemberUseCase` |

### Team Sprint

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| create | Creates a sprint with targets | `CreateTeamSprintUseCase` | `makeCreateTeamSprintUseCase` |
| update | Updates sprint (planned/active only) | `UpdateTeamSprintUseCase` | `makeUpdateTeamSprintUseCase` |
| start | Starts a sprint (planned -> active) | `StartSprintUseCase` | `makeStartSprintUseCase` |
| complete | Completes a sprint (active -> completed) | `CompleteSprintUseCase` | `makeCompleteSprintUseCase` |
| cancel | Cancels a sprint | `CancelSprintUseCase` | `makeCancelSprintUseCase` |
| record-progress | Records sprint progress metrics | `RecordSprintProgressUseCase` | `makeRecordSprintProgressUseCase` |

### Talent Pool

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| add | Adds a candidate to the talent pool | `AddToTalentPoolUseCase` | `makeAddToTalentPoolUseCase` |
| remove | Removes a candidate from the talent pool | `RemoveFromTalentPoolUseCase` | `makeRemoveFromTalentPoolUseCase` |

---

## Queries

### Application Queries

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| get-by-id | Gets application by ID | `GetApplicationByIdQuery` | `makeGetApplicationByIdQuery` |
| list-by-job | Lists applications for a job | `ListApplicationsByJobQuery` | `makeListApplicationsByJobQuery` |
| list-by-candidate | Lists candidate applications | `ListApplicationsByCandidateQuery` | `makeListApplicationsByCandidateQuery` |
| get-pipeline | Gets application pipeline view | `GetPipelineViewQuery` | `makeGetPipelineViewQuery` |
| get-scoring | Gets application scoring | `GetApplicationScoringQuery` | `makeGetApplicationScoringQuery` |
| get-stage-history | Gets stage history | `GetApplicationStageHistoryQuery` | `makeGetApplicationStageHistoryQuery` |

### Candidate Queries

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| get-by-id | Gets candidate by ID | `GetCandidateByIdQuery` | `makeGetCandidateByIdQuery` |
| get-by-email | Finds candidate by email | `GetCandidateByEmailQuery` | `makeGetCandidateByEmailQuery` |
| list | Lists candidates | `ListCandidatesQuery` | `makeListCandidatesQuery` |
| search | Searches candidates | `SearchCandidatesQuery` | `makeSearchCandidatesQuery` |
| get-history | Gets candidate history | `GetCandidateHistoryQuery` | `makeGetCandidateHistoryQuery` |

### Interview Queries

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| get-by-id | Gets interview by ID | `GetInterviewByIdQuery` | `makeGetInterviewByIdQuery` |
| list | Lists interviews | `ListInterviewsQuery` | `makeListInterviewsQuery` |

### Interview Template Queries

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| get-by-id | Gets interview template by ID | `GetInterviewTemplateByIdQuery` | `makeGetInterviewTemplateByIdQuery` |
| list | Lists interview templates with filters | `ListInterviewTemplatesQuery` | `makeListInterviewTemplatesQuery` |

### Job Queries

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| get-by-id | Gets job by ID | `GetJobByIdQuery` | `makeGetJobByIdQuery` |
| get-by-slug | Gets job by slug | `GetJobBySlugQuery` | `makeGetJobBySlugQuery` |
| list | Lists jobs | `ListJobsQuery` | `makeListJobsQuery` |
| list-published | Lists published jobs | `ListPublishedJobsQuery` | `makeListPublishedJobsQuery` |
| get-metrics | Gets job metrics | `GetJobMetricsQuery` | `makeGetJobMetricsQuery` |

### Offer Queries

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| get-by-id | Gets offer by ID | `GetOfferByIdQuery` | `makeGetOfferByIdQuery` |
| list | Lists offers | `ListOffersQuery` | `makeListOffersQuery` |
| list-by-candidate | Lists offers by candidate | `ListOffersByCandidateQuery` | `makeListOffersByCandidateQuery` |
| list-by-job | Lists offers by job | `ListOffersByJobQuery` | `makeListOffersByJobQuery` |

### Recruiter Queries

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| get-by-id | Gets recruiter by ID | `GetRecruiterByIdQuery` | `makeGetRecruiterByIdQuery` |
| get-by-user-id | Gets recruiter by user ID | `GetRecruiterByUserIdQuery` | `makeGetRecruiterByUserIdQuery` |
| list | Lists recruiters | `ListRecruitersQuery` | `makeListRecruitersQuery` |
| get-workload | Gets recruiter workload | `GetRecruiterWorkloadQuery` | `makeGetRecruiterWorkloadQuery` |

### Team Queries

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| get | Gets team by ID | `GetTeamUseCase` | `makeGetTeamUseCase` |
| list | Lists teams with filters | `ListTeamsUseCase` | `makeListTeamsUseCase` |
| get-members | Gets team members | `GetTeamMembersUseCase` | `makeGetTeamMembersUseCase` |
| get-metrics-scoped | Gets scoped team metrics | `GetTeamMetricsScopedUseCase` | `makeGetTeamMetricsScopedUseCase` |

### Team Sprint Queries

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| get | Gets sprint by ID | `GetTeamSprintUseCase` | `makeGetTeamSprintUseCase` |
| list | Lists team sprints | `ListTeamSprintsUseCase` | `makeListTeamSprintsUseCase` |
| get-active | Gets active sprint for a team | `GetActiveSprintUseCase` | `makeGetActiveSprintUseCase` |

### Approval Queries

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| get-by-id | Gets approval by ID | `GetApprovalByIdUseCase` | `makeGetApprovalByIdUseCase` |
| list-pending | Lists pending approvals | `ListPendingApprovalsUseCase` | `makeListPendingApprovalsUseCase` |
| list-by-requester | Lists approvals by requester | `ListApprovalsByRequesterUseCase` | `makeListApprovalsByRequesterUseCase` |

### Client Queries

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| get-by-id | Gets client by ID | `GetClientByIdUseCase` | `makeGetClientByIdUseCase` |
| list-scoped | Lists clients with scope | `ListClientsScopedUseCase` | `makeListClientsScopedUseCase` |

### Position Queries

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| get-by-id | Gets position by ID | `GetPositionByIdUseCase` | `makeGetPositionByIdUseCase` |
| list-scoped | Lists positions with scope | `ListPositionsScopedUseCase` | `makeListPositionsScopedUseCase` |

### Activity Timeline Queries

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| get-timeline | Gets activity timeline for an entity | `GetActivityTimelineUseCase` | `makeGetActivityTimelineQuery` |

### Candidate Matching Queries

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| match-to-job | Matches candidates to a job posting | `MatchCandidatesToJobUseCase` | `makeMatchCandidatesToJobQuery` |
| find-similar | Finds similar candidates | `FindSimilarCandidatesUseCase` | `makeFindSimilarCandidatesQuery` |

### Talent Pool Queries

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| list | Lists talent pool entries | `ListTalentPoolUseCase` | `makeListTalentPoolQuery` |
| search | Searches the talent pool | `SearchTalentPoolUseCase` | `makeSearchTalentPoolQuery` |

### SLA Queries

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| check-stalled | Checks for stalled applications | `CheckStalledApplicationsUseCase` | `makeCheckStalledApplicationsQuery` |

### Analytics

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| get-hiring-analytics | Gets hiring analytics | `GetHiringAnalyticsQuery` | `makeGetHiringAnalyticsQuery` |
| get-pipeline-analytics | Gets pipeline analytics | `GetPipelineAnalyticsQuery` | `makeGetPipelineAnalyticsQuery` |
| get-recruiter-performance | Gets recruiter performance | `GetRecruiterPerformanceQuery` | `makeGetRecruiterPerformanceQuery` |
| get-source-effectiveness | Gets source effectiveness | `GetSourceEffectivenessQuery` | `makeGetSourceEffectivenessQuery` |
| get-time-to-hire | Gets time to hire metrics | `GetTimeToHireQuery` | `makeGetTimeToHireQuery` |

### Token Management

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| purchase-tokens | Purchase tokens (individual or company pool) | `PurchaseTokensUseCase` | `makePurchaseTokensUseCase` |
| distribute-tokens | Distribute tokens from pool to team/recruiter (admin) | `DistributeTokensUseCase` | `makeDistributeTokensUseCase` |

### Token Queries

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| get-balance | Get token balance for tenant/user | `GetTokenBalanceQuery` | `makeGetTokenBalanceQuery` |
| get-history | Get token transaction history | `GetTokenTransactionHistoryQuery` | `makeGetTokenTransactionHistoryQuery` |
| get-purchase-options | Get available token packages | `GetTokenPurchaseOptionsQuery` | `makeGetTokenPurchaseOptionsQuery` |

### Message Template

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| create-message-template | Create a new message template | `CreateMessageTemplateUseCase` | `makeCreateMessageTemplateUseCase` |
| update-message-template | Update an existing template | `UpdateMessageTemplateUseCase` | `makeUpdateMessageTemplateUseCase` |
| delete-message-template | Soft delete a template | `DeleteMessageTemplateUseCase` | `makeDeleteMessageTemplateUseCase` |
| record-template-usage | Record template usage + increment counter | `RecordTemplateUsageUseCase` | `makeRecordTemplateUsageUseCase` |

### Outreach

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| log-outreach-activity | Log LinkedIn outreach contact | `LogOutreachActivityUseCase` | `makeLogOutreachActivityUseCase` |
| record-outreach-response | Record response received for outreach | `RecordOutreachResponseUseCase` | `makeRecordOutreachResponseUseCase` |

### Message Template Queries

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| list-message-templates | List templates (by recruiter, channel, category) | `ListMessageTemplatesQuery` | `makeListMessageTemplatesQuery` |
| get-message-template-by-id | Get template by ID | `GetMessageTemplateByIdQuery` | `makeGetMessageTemplateByIdQuery` |

### Outreach Queries

| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| list-outreach-activities | List outreach activities (by recruiter, date range) | `ListOutreachActivitiesQuery` | `makeListOutreachActivitiesQuery` |
| get-outreach-metrics | Get outreach metrics (response rate, counts, trends) | `GetOutreachMetricsQuery` | `makeGetOutreachMetricsQuery` |
| get-outreach-by-profile | Get outreach history for a LinkedIn profile URL | `GetOutreachByProfileQuery` | `makeGetOutreachByProfileQuery` |

---

## Orchestrators

| Orchestrator | Location | Description |
|-------------|----------|-------------|
| `JobPublishingOrchestrator` | `application/services/job-publishing-orchestrator` | Coordinates job posting publication |
| `ApplicationPipelineOrchestrator` | `application/services/application-pipeline-orchestrator` | Manages application pipeline |
| `InterviewSchedulingOrchestrator` | `application/services/interview-scheduling-orchestrator` | Coordinates interview scheduling |
| `OfferManagementOrchestrator` | `application/services/offer-management-orchestrator` | Manages offer workflow |
| `AIInterviewOrchestrator` | `application/services/ai-interview-orchestrator` | Coordinates AI interviews |
| `CandidateEngagementOrchestrator` | `application/services/candidate-engagement-orchestrator` | Manages candidate engagement |
| `HiringProcessOrchestrator` | `application/services/hiring-process-orchestrator` | Coordinates complete hiring process |
| `NotificationOrchestrator` | `application/services/notification-orchestrator` | Handles module notifications |
| `AnalyticsOrchestrator` | `application/services/analytics-orchestrator` | Processes analytics data |
| `TokenManagementOrchestrator` | `application/services/token-management-orchestrator` | Manages tokens |

---

## Pipeline Stages

```typescript
type ApplicationStage =
  | 'applied'           // Application received
  | 'screening'         // Initial screening
  | 'phone_screen'      // Phone call
  | 'interview'         // Interviews
  | 'assessment'        // Technical assessment
  | 'reference_check'   // Reference verification
  | 'offer'             // Offer stage
  | 'hired'             // Hired
  | 'rejected'          // Rejected
  | 'withdrawn';        // Withdrawn
```

---

## Application Status

```typescript
type ApplicationStatus =
  | 'active'
  | 'on_hold'
  | 'rejected'
  | 'withdrawn'
  | 'hired';
```

---

## Entities

| Entity | Description |
|--------|-------------|
| `Application` | Job application linking candidate to job posting |
| `Candidate` | Person applying for positions |
| `Interview` | Scheduled interview session |
| `InterviewTemplate` | Reusable interview configuration |
| `Job` | Job posting/position |
| `Offer` | Job offer to candidate |
| `Recruiter` | Hiring team member (primaryTeamId links to Team) |
| `Client` | Company/organization hiring |
| `Position` | Role within a client organization |
| `Team` | Recruiting team with members, capacity, and KPIs (50+ fields) |
| `TeamSprint` | Sprint period for a team with targets and progress tracking |
| `Experience` | Candidate work experience |
| `Education` | Candidate education record |
| `Skill` | Candidate skill/competency |
| `Note` | Application note/comment |
| `Feedback` | Interview feedback |
| `TeamTokenQuota` | Token balance and quota per team/recruiter (41 fields) |
| `TeamTokenTransaction` | Token transaction record (20 fields) |
| `MessageTemplate` | Reusable message template for LinkedIn/Email/SMS outreach (27 fields) |
| `OutreachActivity` | LinkedIn outreach contact record with response tracking (25+ fields) |

---

## Related Modules

### dm-scoring
Integration for candidate evaluation and scoring:
- `ScoreApplicationUseCase` triggers scoring calculations
- `GetApplicationScoringQuery` retrieves scoring results
- Scoring criteria based on job requirements matching

### dm-ia-chat
Integration for AI-powered interview capabilities:
- `StartAIInterviewSessionUseCase` initiates AI interview sessions
- `AIInterviewOrchestrator` coordinates AI-assisted interviews
- Automated candidate screening and evaluation
