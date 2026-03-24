# BitHire Surface Catalog

> All surface files in `app-bithire/src/surfaces/`. Each module follows the folder/index
> pattern where surface screens are in `{module}/{screen}/index.tsx`.

## Surface Modules

### activity/ (1 screen)
| File | Export |
|------|--------|
| `screen/index.tsx` | `ActivitySurfaceScreen` |

### admin/ (4 screens)
| File | Export |
|------|--------|
| `audit-center/index.tsx` | `AuditCenterSurfaceScreen` |
| `persona-studio/index.tsx` | `PersonaStudioSurfaceScreen` |
| `sla-monitor/index.tsx` | `SlaMonitorSurfaceScreen` |
| `token-billing/index.tsx` | `TokenBillingSurfaceScreen` |

### ai-studio/ (22 screens)
| File | Export |
|------|--------|
| `agents/index.tsx` | `AIStudioAgentsSurfaceScreen` |
| `analytics-view/index.tsx` | `AIStudioAnalyticsViewSurfaceScreen` |
| `browser/index.tsx` | `AIStudioBrowserSurfaceScreen` |
| `chatbox/index.tsx` | `AIStudioChatboxSurfaceScreen` |
| `cost-analyzer/index.tsx` | `AIStudioCostAnalyzerSurfaceScreen` |
| `dubbing/index.tsx` | `AIStudioDubbingSurfaceScreen` |
| `email-generator/index.tsx` | `AIStudioEmailGeneratorSurfaceScreen` |
| `evaluation-detail/index.tsx` | `AIStudioEvaluationDetailSurfaceScreen` |
| `evaluations/index.tsx` | `AIStudioEvaluationsSurfaceScreen` |
| `intelligence/index.tsx` | `AIStudioIntelligenceSurfaceScreen` |
| `interview-replay/index.tsx` | `AIStudioInterviewReplaySurfaceScreen` |
| `knowledge/index.tsx` | `AIStudioKnowledgeSurfaceScreen` |
| `model-catalog/index.tsx` | `AIStudioModelCatalogSurfaceScreen` |
| `overview/index.tsx` | `AIStudioOverviewSurfaceScreen` |
| `phone/index.tsx` | `AIStudioPhoneSurfaceScreen` |
| `provider-health/index.tsx` | `AIStudioProviderHealthSurfaceScreen` |
| `rubric-create/index.tsx` | `AIStudioRubricCreateSurfaceScreen` |
| `rubric-detail/index.tsx` | `AIStudioRubricDetailSurfaceScreen` |
| `rubrics/index.tsx` | `AIStudioRubricsSurfaceScreen` |
| `showroom/index.tsx` | `AIStudioShowroomSurfaceScreen` |
| `test-interviews/index.tsx` | `AIStudioTestInterviewsSurfaceScreen` |
| `transcription/index.tsx` | `AIStudioTranscriptionSurfaceScreen` |
| `voices/index.tsx` | `AIStudioVoicesSurfaceScreen` |
| `webhook-manager/index.tsx` | `AIStudioWebhookManagerSurfaceScreen` |

### analytics/ (2 screens)
| File | Export |
|------|--------|
| `overview/index.tsx` | `AnalyticsOverviewSurfaceScreen` |
| `quality-of-hire/index.tsx` | `QualityOfHireSurfaceScreen` |

### applications/ (2 screens + _shared)
| File | Export |
|------|--------|
| `list/index.tsx` | `ApplicationListSurfaceScreen` |
| `detail/index.tsx` | `ApplicationDetailSurfaceScreen` |
| `_shared/adapter.ts` | `applicationListAdapter`, `ApplicationListView` |
| `_shared/helpers.ts` | Helper functions |

### approvals/ (1 screen)
| File | Export |
|------|--------|
| `screen/index.tsx` | `ApprovalsSurfaceScreen` |

### calibration/ (1 screen)
| File | Export |
|------|--------|
| `screen/index.tsx` | `CalibrationSurfaceScreen` |

### candidates/ (6 screens + _shared)
| File | Export |
|------|--------|
| `list/index.tsx` | `CandidatesListSurfaceScreen` |
| `detail/index.tsx` | `CandidateDetailSurfaceScreen` |
| `detail/sections/candidate-header/index.tsx` | CandidateHeader section |
| `detail/sections/candidate-overview/index.tsx` | CandidateOverview section |
| `detail/sections/candidate-applications/index.tsx` | CandidateApplications section |
| `create/index.tsx` | `CandidateCreateSurfaceScreen` |
| `edit/index.tsx` | `CandidateEditSurfaceScreen` |
| `matching/index.tsx` | `CandidateMatchingSurfaceScreen` |
| `compare/index.tsx` | `CandidateCompareSurfaceScreen` |
| `three-sixty/index.tsx` | `CandidateThreeSixtySurfaceScreen` |
| `_shared/adapter.ts` | `candidateListAdapter`, `CandidateListView` |
| `_shared/helpers.ts` | Helper functions |

### clients/ (1 screen)
| File | Export |
|------|--------|
| `screen/index.tsx` | `ClientsSurfaceScreen` |

### dashboard/ (1 screen)
| File | Export |
|------|--------|
| `recruiter/index.tsx` | `RecruiterDashboardSurfaceScreen` |

### hiring-command/ (1 screen)
| File | Export |
|------|--------|
| `screen/index.tsx` | `HiringCommandSurfaceScreen` |

### interviews/ (10 screens + _shared)
| File | Export |
|------|--------|
| `list/index.tsx` | `InterviewsListSurfaceScreen` |
| `detail/index.tsx` | `InterviewDetailSurfaceScreen` |
| `detail/sections/interview-header/index.tsx` | InterviewHeader section |
| `detail/sections/interview-overview/index.tsx` | InterviewOverview section |
| `detail/sections/interview-scoring/index.tsx` | InterviewScoring section |
| `create/index.tsx` | `InterviewCreateSurfaceScreen` |
| `edit/index.tsx` | `InterviewEditSurfaceScreen` |
| `ai/index.tsx` | `InterviewAISurfaceScreen` |
| `debrief/index.tsx` | `InterviewDebriefSurfaceScreen` |
| `live-scoring/index.tsx` | `InterviewLiveScoringSurfaceScreen` |
| `panel/index.tsx` | `InterviewPanelSurfaceScreen` |
| `prep/index.tsx` | `InterviewPrepSurfaceScreen` |
| `test/index.tsx` | `InterviewTestSurfaceScreen` |
| `_shared/adapter.ts` | `interviewListAdapter`, `InterviewListView` |
| `_shared/helpers.ts` | `formatDuration`, `formatInterviewType` |

### jobs/ (4 screens + _shared)
| File | Export |
|------|--------|
| `list/index.tsx` | `JobsListSurfaceScreen` |
| `detail/index.tsx` | `JobDetailSurfaceScreen` |
| `detail/sections/job-header/index.tsx` | JobHeader section |
| `detail/sections/job-overview/index.tsx` | JobOverview section |
| `detail/sections/job-requirements/index.tsx` | JobRequirements section |
| `create/index.tsx` | `JobCreateSurfaceScreen` |
| `edit/index.tsx` | `JobEditSurfaceScreen` |
| `_shared/adapter.ts` | `jobListAdapter`, `JobListView` |
| `_shared/helpers.ts` | `formatWorkMode`, `formatSalaryRange` |

### my-interviews/ (1 screen)
| File | Export |
|------|--------|
| `screen/index.tsx` | `MyInterviewsSurfaceScreen` |

### offers/ (5 screens + _shared)
| File | Export |
|------|--------|
| `list/index.tsx` | `OffersListSurfaceScreen` |
| `detail/index.tsx` | `OfferDetailSurfaceScreen` |
| `detail/sections/offer-header/index.tsx` | OfferHeader section |
| `detail/sections/offer-terms/index.tsx` | OfferTerms section |
| `detail/sections/offer-compensation/index.tsx` | OfferCompensation section |
| `create/index.tsx` | `OfferCreateSurfaceScreen` |
| `edit/index.tsx` | `OfferEditSurfaceScreen` |
| `approval-center/index.tsx` | `OfferApprovalCenterSurfaceScreen` |
| `_shared/adapter.ts` | `offerListAdapter`, `OfferListView` |
| `_shared/helpers.ts` | `formatSalary`, `daysUntilExpiry` |

### outreach/ (1 screen)
| File | Export |
|------|--------|
| `screen/index.tsx` | `OutreachCampaignsSurfaceScreen` |

### pipeline/ (2 screens)
| File | Export |
|------|--------|
| `kanban/index.tsx` | `PipelineKanbanSurfaceScreen` |
| `visual/index.tsx` | `VisualPipelineSurfaceScreen` |

### positions/ (2 screens)
| File | Export |
|------|--------|
| `list/index.tsx` | `PositionsListSurfaceScreen` |
| `war-room/index.tsx` | `PositionWarRoomSurfaceScreen` |

### profile/ (1 screen)
| File | Export |
|------|--------|
| `screen/index.tsx` | `ProfileSurfaceScreen` |

### recruiter-hub/ (1 screen)
| File | Export |
|------|--------|
| `screen/index.tsx` | `RecruiterHubSurfaceScreen` |

### recruiters/ (3 screens + _shared)
| File | Export |
|------|--------|
| `list/index.tsx` | `RecruitersListSurfaceScreen` |
| `detail/index.tsx` | `RecruiterDetailSurfaceScreen` |
| `create/index.tsx` | `RecruiterCreateSurfaceScreen` |
| `_shared/adapter.ts` | `recruiterListAdapter`, `RecruiterListView` |
| `_shared/helpers.ts` | Helper functions |

### scoring/ (7 screens)
| File | Export |
|------|--------|
| `overview/index.tsx` | `ScoringOverviewSurfaceScreen` |
| `appeals/index.tsx` | `AppealsSurfaceScreen` |
| `calibration-detail/index.tsx` | `CalibrationDetailSurfaceScreen` |
| `evidence-browser/index.tsx` | `EvidenceBrowserSurfaceScreen` |
| `fraud-monitor/index.tsx` | `FraudMonitorSurfaceScreen` |
| `process-builder/index.tsx` | `ProcessBuilderSurfaceScreen` |
| `skill-gaps/index.tsx` | `SkillGapsSurfaceScreen` |

### settings/ (17 screens)
| File | Export |
|------|--------|
| `general/index.tsx` | `SettingsSurfaceScreen` |
| `ai-models/index.tsx` | `AIModelsSurfaceScreen` |
| `ai-providers/index.tsx` | `AIProvidersSurfaceScreen` |
| `ai-test/index.tsx` | `AITestSurfaceScreen` |
| `ai-test-chat/index.tsx` | `AITestChatSurfaceScreen` |
| `ai-test-tts/index.tsx` | `AITestTTSSurfaceScreen` |
| `ai-test-stt/index.tsx` | `AITestSTTSurfaceScreen` |
| `ai-test-phone/index.tsx` | `AITestPhoneSurfaceScreen` |
| `api-keys/index.tsx` | `APIKeysSurfaceScreen` |
| `billing/index.tsx` | `BillingSurfaceScreen` |
| `interview-templates/index.tsx` | `InterviewTemplatesSurfaceScreen` |
| `outreach/index.tsx` | `OutreachSurfaceScreen` |
| `security/index.tsx` | `SecuritySurfaceScreen` |
| `team/index.tsx` | `TeamSurfaceScreen` |
| `templates/index.tsx` | `TemplatesSurfaceScreen` |
| `usage/index.tsx` | `UsageSurfaceScreen` |
| `workflows/index.tsx` | `WorkflowsSurfaceScreen` |

### sprints/ (1 screen)
| File | Export |
|------|--------|
| `screen/index.tsx` | `SprintsSurfaceScreen` |

### talent-pool/ (1 screen)
| File | Export |
|------|--------|
| `screen/index.tsx` | `TalentPoolSurfaceScreen` |

### team/ (4 screens)
| File | Export |
|------|--------|
| `list/index.tsx` | `TeamListSurfaceScreen` |
| `detail/index.tsx` | `TeamDetailSurfaceScreen` |
| `performance/index.tsx` | `TeamPerformanceSurfaceScreen` |
| `sprint-detail/index.tsx` | `SprintDetailSurfaceScreen` |

### _shared/ (3 utility groups)
| File | Purpose |
|------|---------|
| `permissions/permission-maps.ts` | Action permission maps per domain |
| `permissions/compute-permissions.ts` | Pure function to compute effective permissions |
| `permissions/use-surface-permissions.ts` | `useSurfacePermissions()` hook |
| `permissions/route-guard.tsx` | Route-level permission guard |
| `permissions/types.ts` | Permission type definitions |
| `cell-renderers/index.tsx` | Shared cell render functions for ListSurface columns |
| `filter-pills/index.tsx` | Reusable filter pill components |

---

## Summary

| Module | Screens | Detail Sections | _shared files | Total |
|--------|---------|----------------|--------------|-------|
| activity | 1 | 0 | 0 | 1 |
| admin | 4 | 0 | 0 | 4 |
| ai-studio | 22 | 0 | 0 | 22 |
| analytics | 2 | 0 | 0 | 2 |
| applications | 2 | 0 | 2 | 4 |
| approvals | 1 | 0 | 0 | 1 |
| calibration | 1 | 0 | 0 | 1 |
| candidates | 6 | 3 | 2 | 11 |
| clients | 1 | 0 | 0 | 1 |
| dashboard | 1 | 0 | 0 | 1 |
| hiring-command | 1 | 0 | 0 | 1 |
| interviews | 10 | 3 | 2 | 15 |
| jobs | 4 | 3 | 2 | 9 |
| my-interviews | 1 | 0 | 0 | 1 |
| offers | 5 | 3 | 2 | 10 |
| outreach | 1 | 0 | 0 | 1 |
| pipeline | 2 | 0 | 0 | 2 |
| positions | 2 | 0 | 0 | 2 |
| profile | 1 | 0 | 0 | 1 |
| recruiter-hub | 1 | 0 | 0 | 1 |
| recruiters | 3 | 0 | 2 | 5 |
| scoring | 7 | 0 | 0 | 7 |
| settings | 17 | 0 | 0 | 17 |
| sprints | 1 | 0 | 0 | 1 |
| talent-pool | 1 | 0 | 0 | 1 |
| team | 4 | 0 | 0 | 4 |
| _shared | 0 | 0 | 7 | 7 |
| **TOTAL** | **~102** | **12** | **19** | **~133** |
