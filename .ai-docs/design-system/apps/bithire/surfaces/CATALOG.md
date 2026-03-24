# BitHire Surfaces Catalog

> Auto-generated: 2026-03-23
> Source: `app-bithire/src/surfaces/`

## Overview

BitHire uses a **surfaces architecture** where each UI screen is encapsulated as a "surface screen" component.
Surfaces are the glue layer between Next.js pages and domain logic.

- **27 surface modules** (26 domain + 1 `_shared`)
- **~130 surface files** total
- Every surface uses `useSurfacePermissions` for RBAC gating
- 5 core domains have `_shared/adapter.ts` + `_shared/helpers.ts`
- 5 list surfaces use `PatternDataTable` + `useListController`

---

## _shared (Infrastructure)

Shared infrastructure consumed by all domain surfaces.

| File | Description |
|------|-------------|
| `_shared/index.ts` | Barrel: permissions, cell-renderers, FilterPills |
| `_shared/cell-renderers/index.tsx` | Reusable column render functions (avatar, status dot, tags, date, score, contact) |
| `_shared/filter-pills/index.tsx` | Segmented filter pill component |
| `_shared/permissions/index.ts` | Barrel: 18 permission maps + hooks |
| `_shared/permissions/compute-permissions.ts` | Pure function RBAC computation |
| `_shared/permissions/permission-maps.ts` | Field/action/tab permission maps for all domains |
| `_shared/permissions/route-guard.tsx` | Route-level permission gate component |
| `_shared/permissions/types.ts` | BitHirePermission type |
| `_shared/permissions/use-surface-permissions.ts` | `useSurfacePermissions()` hook |

**Key DS types used**: `SurfacePermissionsConfig`, `SurfacePermissionRule`

---

## activity

Single-screen standalone surface.

| File | Description |
|------|-------------|
| `activity/index.ts` | Barrel: `ActivitySurfaceScreen` |
| `activity/screen/index.tsx` | Activity feed screen |

**DS imports**: `Box`
**Patterns**: useSurfacePermissions: No | PatternDataTable: No | useListController: No | Adapter: No

---

## admin

Admin-only surfaces for platform management.

| File | Description |
|------|-------------|
| `admin/index.ts` | Barrel: 4 screens |
| `admin/audit-center/index.tsx` | Audit log viewer with filters, timeline |
| `admin/persona-studio/index.tsx` | AI persona management |
| `admin/sla-monitor/index.tsx` | SLA monitoring dashboard |
| `admin/token-billing/index.tsx` | Token usage and billing |

**DS imports**: `Box, Flex, Grid, Stack, Text, Card, Button, Input, Spinner, Modal`
**Patterns**: useSurfacePermissions: Yes (all 4) | PatternDataTable: No | useListController: No | Adapter: No

---

## ai-studio

Largest surface module (23 sub-surfaces). Tenant-feature-gated (not permission-gated).

| File | Description |
|------|-------------|
| `ai-studio/index.ts` | Barrel: 23 screens |
| `ai-studio/overview/index.tsx` | AI Studio landing/dashboard |
| `ai-studio/agents/index.tsx` | Agent management |
| `ai-studio/analytics-view/index.tsx` | AI analytics |
| `ai-studio/browser/index.tsx` | AI browser interface |
| `ai-studio/chatbox/index.tsx` | Chat interface |
| `ai-studio/cost-analyzer/index.tsx` | AI cost analysis |
| `ai-studio/dubbing/index.tsx` | Voice dubbing |
| `ai-studio/email-generator/index.tsx` | AI email composition |
| `ai-studio/evaluation-detail/index.tsx` | Single evaluation view |
| `ai-studio/evaluations/index.tsx` | Evaluations list |
| `ai-studio/intelligence/index.tsx` | AI intelligence dashboard |
| `ai-studio/interview-replay/index.tsx` | Interview replay viewer |
| `ai-studio/knowledge/index.tsx` | Knowledge base management |
| `ai-studio/model-catalog/index.tsx` | Model catalog browser |
| `ai-studio/phone/index.tsx` | Phone interview interface |
| `ai-studio/provider-health/index.tsx` | AI provider health dashboard |
| `ai-studio/rubric-create/index.tsx` | Rubric creation form |
| `ai-studio/rubric-detail/index.tsx` | Rubric detail view |
| `ai-studio/rubrics/index.tsx` | Rubrics list |
| `ai-studio/showroom/index.tsx` | AI demo showroom |
| `ai-studio/test-interviews/index.tsx` | Test interview runner |
| `ai-studio/transcription/index.tsx` | Transcription tools |
| `ai-studio/voices/index.tsx` | Voice management |
| `ai-studio/webhook-manager/index.tsx` | Webhook configuration |

**DS imports**: `Box, Text, Stack, Flex, Grid, Badge, Button, Card, Input, Textarea, Spinner, Modal`
**Patterns**: useSurfacePermissions: No | PatternDataTable: No | useListController: No | Adapter: No

---

## analytics

Analytics surfaces for hiring metrics.

| File | Description |
|------|-------------|
| `analytics/index.ts` | Barrel: 2 screens |
| `analytics/overview/index.tsx` | Analytics overview with charts |
| `analytics/quality-of-hire/index.tsx` | Quality-of-hire deep dive |

**DS imports**: `Box, Flex, Text, Button, Grid, Stack, Card, Input, Spinner, Modal`
**Patterns**: useSurfacePermissions: Yes | PatternDataTable: No | useListController: No | Adapter: No

---

## applications

Core recruiting domain with adapter pattern.

| File | Description |
|------|-------------|
| `applications/index.ts` | Barrel: 2 screens + adapter |
| `applications/_shared/adapter.ts` | `applicationListAdapter` (EntityAdapter) |
| `applications/_shared/helpers.ts` | Status variant helpers |
| `applications/list/index.tsx` | Application list surface |
| `applications/detail/index.tsx` | Application detail surface |

**DS imports**: `Box, toast, Badge, Flex, Text, Spinner, Card, Button, Grid, Stack, Modal, Tooltip, Divider`
**Patterns**: useSurfacePermissions: Yes | PatternDataTable: No | useListController: No | **Adapter: Yes** (`applicationListAdapter`)

---

## approvals

Single-screen standalone surface.

| File | Description |
|------|-------------|
| `approvals/index.ts` | Barrel: `ApprovalsSurfaceScreen` |
| `approvals/screen/index.tsx` | Approval queue screen |

**DS imports**: `Box, Text, Stack, Flex, Grid, Badge`
**Patterns**: useSurfacePermissions: No | PatternDataTable: No | useListController: No | Adapter: No

---

## calibration

Single-screen standalone surface.

| File | Description |
|------|-------------|
| `calibration/index.ts` | Barrel: `CalibrationSurfaceScreen` |
| `calibration/screen/index.tsx` | Calibration session screen |

**DS imports**: Multiple DS components
**Patterns**: useSurfacePermissions: No | PatternDataTable: No | useListController: No | Adapter: No

---

## candidates

Core recruiting domain. Most important surface in the app. Full adapter + list controller pattern.

| File | Description |
|------|-------------|
| `candidates/index.ts` | Barrel: 7 screens + adapter + helpers |
| `candidates/_shared/adapter.ts` | `candidateListAdapter` (EntityAdapter) |
| `candidates/_shared/helpers.ts` | Status variant, source formatting |
| `candidates/list/index.tsx` | **Primary list** - PatternDataTable + useListController |
| `candidates/detail/index.tsx` | Candidate detail view |
| `candidates/detail/sections/candidate-header/index.tsx` | Detail header section |
| `candidates/detail/sections/candidate-overview/index.tsx` | Detail overview section |
| `candidates/detail/sections/candidate-applications/index.tsx` | Embedded applications list |
| `candidates/create/index.tsx` | Candidate creation form |
| `candidates/edit/index.tsx` | Candidate edit form |
| `candidates/compare/index.tsx` | Side-by-side candidate comparison |
| `candidates/matching/index.tsx` | AI matching surface |
| `candidates/three-sixty/index.tsx` | 360-degree candidate view |

**DS imports**: Full DS stack (Box, Flex, Grid, Stack, Text, Card, Button, Badge, Input, Tooltip, Spinner, Modal, toast)
**Patterns**: useSurfacePermissions: Yes (all) | **PatternDataTable: Yes** | **useListController: Yes** | **Adapter: Yes** (`candidateListAdapter`)

---

## clients

Single-screen standalone surface.

| File | Description |
|------|-------------|
| `clients/index.ts` | Barrel: `ClientsSurfaceScreen` |
| `clients/screen/index.tsx` | Client management screen |

**DS imports**: Multiple DS components
**Patterns**: useSurfacePermissions: No | PatternDataTable: No | useListController: No | Adapter: No

---

## dashboard

Recruiter dashboard surface.

| File | Description |
|------|-------------|
| `dashboard/index.ts` | Barrel: `RecruiterDashboardSurfaceScreen` |
| `dashboard/recruiter/index.tsx` | Main recruiter dashboard |

**DS imports**: `Flex`
**Patterns**: useSurfacePermissions: Yes (ANALYTICS_ACTION_PERMISSIONS) | PatternDataTable: No | useListController: No | Adapter: No

---

## hiring-command

Single-screen standalone surface.

| File | Description |
|------|-------------|
| `hiring-command/index.ts` | Barrel: `HiringCommandSurfaceScreen` |
| `hiring-command/screen/index.tsx` | Hiring command center |

**DS imports**: `Box, Flex, Grid, Stack, Text, Card, Button, Spinner, Modal`
**Patterns**: useSurfacePermissions: No | PatternDataTable: No | useListController: No | Adapter: No

---

## interviews

Core recruiting domain. Full adapter + list controller pattern.

| File | Description |
|------|-------------|
| `interviews/index.ts` | Barrel: 10 screens + adapter + helpers |
| `interviews/_shared/adapter.ts` | `interviewListAdapter` (EntityAdapter) |
| `interviews/_shared/helpers.ts` | Status variant, type formatting, duration formatting |
| `interviews/list/index.tsx` | Interview list - PatternDataTable + useListController |
| `interviews/detail/index.tsx` | Interview detail view |
| `interviews/detail/sections/interview-header/index.tsx` | Detail header section |
| `interviews/detail/sections/interview-overview/index.tsx` | Detail overview section |
| `interviews/detail/sections/interview-scoring/index.tsx` | Detail scoring section |
| `interviews/create/index.tsx` | Interview scheduling form |
| `interviews/edit/index.tsx` | Interview edit form |
| `interviews/ai/index.tsx` | AI interview surface |
| `interviews/debrief/index.tsx` | Post-interview debrief |
| `interviews/live-scoring/index.tsx` | Real-time scoring during interview |
| `interviews/panel/index.tsx` | Interview panel view |
| `interviews/prep/index.tsx` | Interview preparation |
| `interviews/test/index.tsx` | Test interview runner |

**DS imports**: Full DS stack
**Patterns**: useSurfacePermissions: Yes (all) | **PatternDataTable: Yes** | **useListController: Yes** | **Adapter: Yes** (`interviewListAdapter`)

---

## jobs

Core recruiting domain. Full adapter + list controller pattern.

| File | Description |
|------|-------------|
| `jobs/index.ts` | Barrel: 4 screens + adapter + helpers |
| `jobs/_shared/adapter.ts` | `jobListAdapter` (EntityAdapter) |
| `jobs/_shared/helpers.ts` | Status variant, work mode, salary formatting |
| `jobs/list/index.tsx` | Job list - PatternDataTable + useListController |
| `jobs/detail/index.tsx` | Job detail view |
| `jobs/detail/sections/job-header/index.tsx` | Detail header section |
| `jobs/detail/sections/job-overview/index.tsx` | Detail overview section |
| `jobs/detail/sections/job-requirements/index.tsx` | Requirements section |
| `jobs/create/index.tsx` | Job creation form |
| `jobs/edit/index.tsx` | Job edit form |

**DS imports**: Full DS stack
**Patterns**: useSurfacePermissions: Yes (all) | **PatternDataTable: Yes** | **useListController: Yes** | **Adapter: Yes** (`jobListAdapter`)

---

## my-interviews

Single-screen standalone surface.

| File | Description |
|------|-------------|
| `my-interviews/index.ts` | Barrel: `MyInterviewsSurfaceScreen` |
| `my-interviews/screen/index.tsx` | Personal interview schedule |

**DS imports**: `Box, Flex, Grid, Stack, Text, Card, Button, Spinner, Modal, Input`
**Patterns**: useSurfacePermissions: No | PatternDataTable: No | useListController: No | Adapter: No

---

## offers

Core recruiting domain. Full adapter + list controller pattern.

| File | Description |
|------|-------------|
| `offers/index.ts` | Barrel: 5 screens + adapter + helpers |
| `offers/_shared/adapter.ts` | `offerListAdapter` (EntityAdapter) |
| `offers/_shared/helpers.ts` | Status variant, salary formatting, expiry calculation |
| `offers/list/index.tsx` | Offer list - PatternDataTable + useListController |
| `offers/detail/index.tsx` | Offer detail view |
| `offers/detail/sections/offer-header/index.tsx` | Detail header section |
| `offers/detail/sections/offer-compensation/index.tsx` | Compensation breakdown |
| `offers/detail/sections/offer-terms/index.tsx` | Terms and conditions |
| `offers/create/index.tsx` | Offer creation form |
| `offers/edit/index.tsx` | Offer edit form |
| `offers/approval-center/index.tsx` | Offer approval queue |

**DS imports**: Full DS stack
**Patterns**: useSurfacePermissions: Yes (all) | **PatternDataTable: Yes** | **useListController: Yes** | **Adapter: Yes** (`offerListAdapter`)

---

## outreach

Single-screen standalone surface.

| File | Description |
|------|-------------|
| `outreach/index.ts` | Barrel: `OutreachCampaignsSurfaceScreen` |
| `outreach/screen/index.tsx` | Outreach campaigns manager |

**DS imports**: `Box, Flex, Grid, Stack, Text, Card, Button, Input, Spinner, Modal`
**Patterns**: useSurfacePermissions: No | PatternDataTable: No | useListController: No | Adapter: No

---

## pipeline

Kanban-based pipeline surfaces.

| File | Description |
|------|-------------|
| `pipeline/index.ts` | Barrel: 2 screens |
| `pipeline/kanban/index.tsx` | Drag-and-drop Kanban board |
| `pipeline/visual/index.tsx` | Visual pipeline view |

**DS imports**: `Box, Flex, Text, Card, Grid, Stack, Button, Input, Spinner, Modal`
**Patterns**: useSurfacePermissions: Yes (PIPELINE_ACTION_PERMISSIONS) | PatternDataTable: No | useListController: No | Adapter: No

---

## positions

Position management surfaces.

| File | Description |
|------|-------------|
| `positions/index.ts` | Barrel: 2 screens |
| `positions/list/index.tsx` | Positions list |
| `positions/war-room/index.tsx` | Position war room (deep-dive) |

**DS imports**: `Box, Text, Stack, Flex, Grid, Card, Button, Input, Spinner, Modal`
**Patterns**: useSurfacePermissions: Yes (JOB_ACTION_PERMISSIONS) | PatternDataTable: No | useListController: No | Adapter: No

---

## profile

Single-screen standalone surface.

| File | Description |
|------|-------------|
| `profile/index.ts` | Barrel: `ProfileSurfaceScreen` |
| `profile/screen/index.tsx` | User profile management |

**DS imports**: Multiple DS components
**Patterns**: useSurfacePermissions: No | PatternDataTable: No | useListController: No | Adapter: No

---

## recruiter-hub

Single-screen standalone surface.

| File | Description |
|------|-------------|
| `recruiter-hub/index.ts` | Barrel: `RecruiterHubSurfaceScreen` |
| `recruiter-hub/screen/index.tsx` | Recruiter personal hub |

**DS imports**: `Box, Flex, Grid, Stack, Text, Card, Button, Spinner, Modal`
**Patterns**: useSurfacePermissions: No | PatternDataTable: No | useListController: No | Adapter: No

---

## recruiters

Recruiter management domain with adapter pattern.

| File | Description |
|------|-------------|
| `recruiters/index.ts` | Barrel: 3 screens + adapter + helpers |
| `recruiters/_shared/adapter.ts` | `recruiterListAdapter` (EntityAdapter) |
| `recruiters/_shared/helpers.ts` | Status variant helpers |
| `recruiters/list/index.tsx` | Recruiter list - PatternDataTable + useListController |
| `recruiters/detail/index.tsx` | Recruiter detail view |
| `recruiters/create/index.tsx` | Recruiter creation form |

**DS imports**: Full DS stack
**Patterns**: useSurfacePermissions: Yes (all) | **PatternDataTable: Yes** | **useListController: Yes** | **Adapter: Yes** (`recruiterListAdapter`)

---

## scoring

Scoring engine surfaces (7 sub-surfaces).

| File | Description |
|------|-------------|
| `scoring/index.ts` | Barrel: 7 screens |
| `scoring/overview/index.tsx` | Scoring overview dashboard |
| `scoring/appeals/index.tsx` | Score appeals management |
| `scoring/calibration-detail/index.tsx` | Calibration session detail |
| `scoring/evidence-browser/index.tsx` | Evidence browser |
| `scoring/fraud-monitor/index.tsx` | Fraud detection dashboard |
| `scoring/process-builder/index.tsx` | Scoring process builder |
| `scoring/skill-gaps/index.tsx` | Skill gap analysis |

**DS imports**: `Box, Flex, Text, Grid, Stack, Card, Button, Spinner, Modal`
**Patterns**: useSurfacePermissions: Yes (all) | PatternDataTable: No | useListController: No | Adapter: No

---

## settings

Settings surfaces (17 sub-surfaces).

| File | Description |
|------|-------------|
| `settings/index.ts` | Barrel: 17 screens |
| `settings/general/index.tsx` | General settings |
| `settings/ai-models/index.tsx` | AI model configuration |
| `settings/ai-providers/index.tsx` | AI provider management |
| `settings/ai-test/index.tsx` | AI test harness |
| `settings/ai-test-chat/index.tsx` | Chat AI testing |
| `settings/ai-test-phone/index.tsx` | Phone AI testing |
| `settings/ai-test-stt/index.tsx` | Speech-to-text testing |
| `settings/ai-test-tts/index.tsx` | Text-to-speech testing |
| `settings/api-keys/index.tsx` | API key management |
| `settings/billing/index.tsx` | Billing and subscription |
| `settings/interview-templates/index.tsx` | Interview template editor |
| `settings/outreach/index.tsx` | Outreach settings |
| `settings/security/index.tsx` | Security settings |
| `settings/team/index.tsx` | Team management settings |
| `settings/templates/index.tsx` | Template library |
| `settings/usage/index.tsx` | Usage metrics |
| `settings/workflows/index.tsx` | Workflow configuration |

**DS imports**: Full DS stack including `Table, Select, Textarea`
**Patterns**: useSurfacePermissions: Yes (general only) | PatternDataTable: No | useListController: No | Adapter: No

---

## sprints

Single-screen standalone surface.

| File | Description |
|------|-------------|
| `sprints/index.ts` | Barrel: `SprintsSurfaceScreen` |
| `sprints/screen/index.tsx` | Sprint planning board |

**DS imports**: Multiple DS components
**Patterns**: useSurfacePermissions: No | PatternDataTable: No | useListController: No | Adapter: No

---

## talent-pool

Single-screen standalone surface.

| File | Description |
|------|-------------|
| `talent-pool/index.ts` | Barrel: `TalentPoolSurfaceScreen` |
| `talent-pool/screen/index.tsx` | Talent pool browser |

**DS imports**: `Box, Text, Stack, Flex, Grid`
**Patterns**: useSurfacePermissions: No | PatternDataTable: No | useListController: No | Adapter: No

---

## team

Team management surfaces (4 sub-surfaces).

| File | Description |
|------|-------------|
| `team/index.ts` | Barrel: 4 screens |
| `team/list/index.tsx` | Team member list |
| `team/detail/index.tsx` | Team member detail |
| `team/performance/index.tsx` | Performance analytics |
| `team/sprint-detail/index.tsx` | Sprint detail view |

**DS imports**: Full DS stack
**Patterns**: useSurfacePermissions: Yes (all) | PatternDataTable: No | useListController: No | Adapter: No

---

## Summary Matrix

| Module | Screens | Adapter | PatternDataTable | useListController | useSurfacePermissions |
|--------|---------|---------|-----------------|-------------------|----------------------|
| _shared | 0 (infra) | - | - | - | Provides hook |
| activity | 1 | No | No | No | No |
| admin | 4 | No | No | No | Yes |
| ai-studio | 23 | No | No | No | No |
| analytics | 2 | No | No | No | Yes |
| applications | 2 | Yes | No | No | Yes |
| approvals | 1 | No | No | No | No |
| calibration | 1 | No | No | No | No |
| **candidates** | **7** | **Yes** | **Yes** | **Yes** | **Yes** |
| clients | 1 | No | No | No | No |
| dashboard | 1 | No | No | No | Yes |
| hiring-command | 1 | No | No | No | No |
| **interviews** | **10** | **Yes** | **Yes** | **Yes** | **Yes** |
| **jobs** | **4** | **Yes** | **Yes** | **Yes** | **Yes** |
| my-interviews | 1 | No | No | No | No |
| **offers** | **5** | **Yes** | **Yes** | **Yes** | **Yes** |
| outreach | 1 | No | No | No | No |
| pipeline | 2 | No | No | No | Yes |
| positions | 2 | No | No | No | Yes |
| profile | 1 | No | No | No | No |
| recruiter-hub | 1 | No | No | No | No |
| **recruiters** | **3** | **Yes** | **Yes** | **Yes** | **Yes** |
| scoring | 7 | No | No | No | Yes |
| settings | 17 | No | No | No | Partial |
| sprints | 1 | No | No | No | No |
| talent-pool | 1 | No | No | No | No |
| team | 4 | No | No | No | Yes |
| **TOTAL** | **~104** | **6** | **5** | **5** | **~58 files** |
