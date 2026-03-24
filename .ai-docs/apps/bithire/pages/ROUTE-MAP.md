# BitHire Route Map

> All `page.tsx` files in `app-bithire/src/app/` with their route paths and surface imports.
> Every dashboard page is a thin wrapper that delegates to a Surface screen.

## Auth Routes (no surface import)

| Route | Layout Group |
|-------|-------------|
| `/login` | `(auth)` |
| `/register` | `(auth)` |
| `/forgot-password` | `(auth)` |
| `/reset-password` | `(auth)` |
| `/callback` | `(auth)` |

## Onboarding Routes

| Route | Layout Group |
|-------|-------------|
| `/onboarding` | `(onboarding)` |

## Public Routes

| Route | Layout Group |
|-------|-------------|
| `/career-coach/[token]` | `(public)` |
| `/career-coach/[token]/talent-pool` | `(public)` |

## Dashboard Routes

### Core
| Route | Surface Import |
|-------|---------------|
| `/dashboard` | `RecruiterDashboardSurfaceScreen` from `@/surfaces/dashboard` |
| `/dashboard/showcase` | (showcase page, no surface) |
| `/profile` | `ProfileSurfaceScreen` from `@/surfaces/profile` |
| `/activity` | `ActivitySurfaceScreen` from `@/surfaces/activity` |
| `/hiring-command` | `HiringCommandSurfaceScreen` from `@/surfaces/hiring-command` |
| `/recruiter-hub` | `RecruiterHubSurfaceScreen` from `@/surfaces/recruiter-hub` |
| `/talent-pool` | `TalentPoolSurfaceScreen` from `@/surfaces/talent-pool` |
| `/sprints` | `SprintsSurfaceScreen` from `@/surfaces/sprints` |
| `/calibration` | `CalibrationSurfaceScreen` from `@/surfaces/calibration` |
| `/approvals` | `ApprovalsSurfaceScreen` from `@/surfaces/approvals` |
| `/my-interviews` | `MyInterviewsSurfaceScreen` from `@/surfaces/my-interviews` |
| `/clients` | `ClientsSurfaceScreen` from `@/surfaces/clients` |

### Jobs
| Route | Surface Import |
|-------|---------------|
| `/jobs` | `JobsListSurfaceScreen` from `@/surfaces/jobs` |
| `/jobs/new` | `JobCreateSurfaceScreen` from `@/surfaces/jobs` |
| `/jobs/[id]` | `JobDetailSurfaceScreen` from `@/surfaces/jobs` |
| `/jobs/[id]/edit` | `JobEditSurfaceScreen` from `@/surfaces/jobs/edit` |

### Candidates
| Route | Surface Import |
|-------|---------------|
| `/candidates` | `CandidatesListSurfaceScreen` from `@/surfaces/candidates` |
| `/candidates/new` | `CandidateCreateSurfaceScreen` from `@/surfaces/candidates/create` |
| `/candidates/[id]` | `CandidateDetailSurfaceScreen` from `@/surfaces/candidates` |
| `/candidates/[id]/edit` | `CandidateEditSurfaceScreen` from `@/surfaces/candidates/edit` |
| `/candidates/[id]/360` | `CandidateThreeSixtySurfaceScreen` from `@/surfaces/candidates/three-sixty` |
| `/candidates/matching` | `CandidateMatchingSurfaceScreen` from `@/surfaces/candidates/matching` |
| `/candidates/compare` | `CandidateCompareSurfaceScreen` from `@/surfaces/candidates/compare` |

### Interviews
| Route | Surface Import |
|-------|---------------|
| `/interviews` | `InterviewsListSurfaceScreen` from `@/surfaces/interviews` |
| `/interviews/new` | `InterviewCreateSurfaceScreen` from `@/surfaces/interviews/create` |
| `/interviews/[id]` | `InterviewDetailSurfaceScreen` from `@/surfaces/interviews` |
| `/interviews/[id]/edit` | `InterviewEditSurfaceScreen` from `@/surfaces/interviews/edit` |
| `/interviews/[id]/debrief` | `InterviewDebriefSurfaceScreen` from `@/surfaces/interviews/debrief` |
| `/interviews/ai` | `InterviewAISurfaceScreen` from `@/surfaces/interviews/ai` |
| `/interviews/test` | `InterviewTestSurfaceScreen` from `@/surfaces/interviews/test` |
| `/interviews/prep/[id]` | `InterviewPrepSurfaceScreen` from `@/surfaces/interviews/prep` |
| `/interviews/panel/[id]` | `InterviewPanelSurfaceScreen` from `@/surfaces/interviews/panel` |
| `/interviews/live-scoring/[id]` | `InterviewLiveScoringSurfaceScreen` from `@/surfaces/interviews/live-scoring` |

### Offers
| Route | Surface Import |
|-------|---------------|
| `/offers` | `OffersListSurfaceScreen` from `@/surfaces/offers` |
| `/offers/new` | `OfferCreateSurfaceScreen` from `@/surfaces/offers/create` |
| `/offers/[id]` | `OfferDetailSurfaceScreen` from `@/surfaces/offers` |
| `/offers/[id]/edit` | `OfferEditSurfaceScreen` from `@/surfaces/offers/edit` |
| `/offers/approval-center` | `OfferApprovalCenterSurfaceScreen` from `@/surfaces/offers/approval-center` |

### Applications
| Route | Surface Import |
|-------|---------------|
| `/applications` | `ApplicationListSurfaceScreen` from `@/surfaces/applications/list` |
| `/applications/[id]` | `ApplicationDetailSurfaceScreen` from `@/surfaces/applications/detail` |
| `/applications/showcase` | (showcase page) |

### Recruiters
| Route | Surface Import |
|-------|---------------|
| `/recruiters` | `RecruitersListSurfaceScreen` from `@/surfaces/recruiters` |
| `/recruiters/new` | `RecruiterCreateSurfaceScreen` from `@/surfaces/recruiters/create` |
| `/recruiters/[id]` | `RecruiterDetailSurfaceScreen` from `@/surfaces/recruiters/detail` |

### Pipeline
| Route | Surface Import |
|-------|---------------|
| `/pipeline` | `PipelineKanbanSurfaceScreen` from `@/surfaces/pipeline` |
| `/pipeline/visual` | `VisualPipelineSurfaceScreen` from `@/surfaces/pipeline/visual` |

### Positions
| Route | Surface Import |
|-------|---------------|
| `/positions` | `PositionsListSurfaceScreen` from `@/surfaces/positions/list` |
| `/positions/[id]/war-room` | `PositionWarRoomSurfaceScreen` from `@/surfaces/positions/war-room` |

### Team
| Route | Surface Import |
|-------|---------------|
| `/team` | `TeamListSurfaceScreen` from `@/surfaces/team/list` |
| `/team/[id]` | `TeamDetailSurfaceScreen` from `@/surfaces/team/detail` |
| `/team/[id]/performance` | `TeamPerformanceSurfaceScreen` from `@/surfaces/team/performance` |
| `/team/[id]/sprint/[sprintId]` | `SprintDetailSurfaceScreen` from `@/surfaces/team/sprint-detail` |

### Scoring
| Route | Surface Import |
|-------|---------------|
| `/scoring/process-builder` | `ProcessBuilderSurfaceScreen` from `@/surfaces/scoring/process-builder` |
| `/scoring/appeals` | `AppealsSurfaceScreen` from `@/surfaces/scoring/appeals` |
| `/scoring/evidence-browser` | `EvidenceBrowserSurfaceScreen` from `@/surfaces/scoring/evidence-browser` |
| `/scoring/fraud-monitor` | `FraudMonitorSurfaceScreen` from `@/surfaces/scoring/fraud-monitor` |
| `/scoring/skill-gaps` | `SkillGapsSurfaceScreen` from `@/surfaces/scoring/skill-gaps` |
| `/scoring/calibration/[id]` | `CalibrationDetailSurfaceScreen` from `@/surfaces/scoring/calibration-detail` |

### AI Studio
| Route | Surface Import |
|-------|---------------|
| `/ai-studio` | `AIStudioOverviewSurfaceScreen` from `@/surfaces/ai-studio` |
| `/ai-studio/analytics` | `AIStudioAnalyticsViewSurfaceScreen` from `@/surfaces/ai-studio` |
| `/ai-studio/agents` | `AIStudioAgentsSurfaceScreen` from `@/surfaces/ai-studio` |
| `/ai-studio/browser` | `AIStudioBrowserSurfaceScreen` from `@/surfaces/ai-studio` |
| `/ai-studio/chatbox` | `AIStudioChatboxSurfaceScreen` from `@/surfaces/ai-studio` |
| `/ai-studio/cost-analyzer` | `AIStudioCostAnalyzerSurfaceScreen` from `@/surfaces/ai-studio` |
| `/ai-studio/dubbing` | `AIStudioDubbingSurfaceScreen` from `@/surfaces/ai-studio` |
| `/ai-studio/email-generator` | `AIStudioEmailGeneratorSurfaceScreen` from `@/surfaces/ai-studio` |
| `/ai-studio/evaluations` | `AIStudioEvaluationsSurfaceScreen` from `@/surfaces/ai-studio` |
| `/ai-studio/evaluations/[id]` | `AIStudioEvaluationDetailSurfaceScreen` from `@/surfaces/ai-studio` |
| `/ai-studio/intelligence` | `AIStudioIntelligenceSurfaceScreen` from `@/surfaces/ai-studio` |
| `/ai-studio/interview-replay` | `AIStudioInterviewReplaySurfaceScreen` from `@/surfaces/ai-studio` |
| `/ai-studio/knowledge` | `AIStudioKnowledgeSurfaceScreen` from `@/surfaces/ai-studio` |
| `/ai-studio/model-catalog` | `AIStudioModelCatalogSurfaceScreen` from `@/surfaces/ai-studio` |
| `/ai-studio/phone` | `AIStudioPhoneSurfaceScreen` from `@/surfaces/ai-studio` |
| `/ai-studio/provider-health` | `AIStudioProviderHealthSurfaceScreen` from `@/surfaces/ai-studio` |
| `/ai-studio/rubrics` | `AIStudioRubricsSurfaceScreen` from `@/surfaces/ai-studio` |
| `/ai-studio/rubrics/new` | `AIStudioRubricCreateSurfaceScreen` from `@/surfaces/ai-studio` |
| `/ai-studio/rubrics/[id]` | `AIStudioRubricDetailSurfaceScreen` from `@/surfaces/ai-studio` |
| `/ai-studio/showroom` | `AIStudioShowroomSurfaceScreen` from `@/surfaces/ai-studio` |
| `/ai-studio/test-interviews` | `AIStudioTestInterviewsSurfaceScreen` from `@/surfaces/ai-studio` |
| `/ai-studio/transcription` | `AIStudioTranscriptionSurfaceScreen` from `@/surfaces/ai-studio` |
| `/ai-studio/voices` | `AIStudioVoicesSurfaceScreen` from `@/surfaces/ai-studio` |
| `/ai-studio/webhook-manager` | `AIStudioWebhookManagerSurfaceScreen` from `@/surfaces/ai-studio` |

### Analytics
| Route | Surface Import |
|-------|---------------|
| `/analytics` | `AnalyticsOverviewSurfaceScreen` from `@/surfaces/analytics` |
| `/analytics/quality-of-hire` | `QualityOfHireSurfaceScreen` from `@/surfaces/analytics/quality-of-hire` |

### Outreach
| Route | Surface Import |
|-------|---------------|
| `/outreach/campaigns` | `OutreachCampaignsSurfaceScreen` from `@/surfaces/outreach` |

### Admin
| Route | Surface Import |
|-------|---------------|
| `/admin/audit-center` | `AuditCenterSurfaceScreen` from `@/surfaces/admin/audit-center` |
| `/admin/persona-studio` | `PersonaStudioSurfaceScreen` from `@/surfaces/admin/persona-studio` |
| `/admin/sla-monitor` | `SlaMonitorSurfaceScreen` from `@/surfaces/admin/sla-monitor` |
| `/admin/token-billing` | `TokenBillingSurfaceScreen` from `@/surfaces/admin/token-billing` |

### Settings
| Route | Surface Import |
|-------|---------------|
| `/settings` | `SettingsSurfaceScreen` from `@/surfaces/settings` |
| `/settings/ai-models` | `AIModelsSurfaceScreen` from `@/surfaces/settings/ai-models` |
| `/settings/ai-providers` | `AIProvidersSurfaceScreen` from `@/surfaces/settings/ai-providers` |
| `/settings/ai-providers/test` | `AITestSurfaceScreen` from `@/surfaces/settings/ai-test` |
| `/settings/ai-providers/test/chat` | `AITestChatSurfaceScreen` from `@/surfaces/settings/ai-test-chat` |
| `/settings/ai-providers/test/tts` | `AITestTTSSurfaceScreen` from `@/surfaces/settings/ai-test-tts` |
| `/settings/ai-providers/test/stt` | `AITestSTTSurfaceScreen` from `@/surfaces/settings/ai-test-stt` |
| `/settings/ai-providers/test/phone` | `AITestPhoneSurfaceScreen` from `@/surfaces/settings/ai-test-phone` |
| `/settings/api-keys` | `APIKeysSurfaceScreen` from `@/surfaces/settings/api-keys` |
| `/settings/billing` | `BillingSurfaceScreen` from `@/surfaces/settings/billing` |
| `/settings/interview-templates` | `InterviewTemplatesSurfaceScreen` from `@/surfaces/settings/interview-templates` |
| `/settings/outreach` | `OutreachSurfaceScreen` from `@/surfaces/settings/outreach` |
| `/settings/security` | `SecuritySurfaceScreen` from `@/surfaces/settings/security` |
| `/settings/team` | `TeamSurfaceScreen` from `@/surfaces/settings/team` |
| `/settings/templates` | `TemplatesSurfaceScreen` from `@/surfaces/settings/templates` |
| `/settings/usage` | `UsageSurfaceScreen` from `@/surfaces/settings/usage` |
| `/settings/workflows` | `WorkflowsSurfaceScreen` from `@/surfaces/settings/workflows` |

### Showcase (dev-only)
| Route | Surface Import |
|-------|---------------|
| `/preview-design` | (no surface) |
| `/preview-cards` | (no surface) |
| `/showcase/forms` | (no surface) |

---

**Total page.tsx files: ~113** (5 auth + 1 onboarding + 2 public + ~102 dashboard + 3 showcase)
