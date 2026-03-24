# dm-recruiter - Entities

> **Entidades del módulo de recruiting**

---

## Entidades Principales

### Candidate

```typescript
interface Candidate {
  id: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  linkedinUrl?: string;
  resumeUrl?: string;
  location?: {
    city: string;
    state?: string;
    country: string;
  };
  skills: string[];
  experience: Experience[];
  education: Education[];
  doNotContact: boolean;
  source: CandidateSource;
  tags: string[];
  customFields: Record<string, unknown>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
```

### Job

```typescript
interface Job {
  id: string;
  tenantId: string;
  companyId: string;
  title: string;
  slug: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  department: string;
  location: JobLocation;
  locationType: 'remote' | 'onsite' | 'hybrid';
  employmentType: 'full_time' | 'part_time' | 'contract' | 'temporary';
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
  status: JobStatus;
  publishedAt?: Date;
  closedAt?: Date;
  pipeline: PipelineConfig;
  recruiters: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

type JobStatus = 'draft' | 'published' | 'paused' | 'closed';
```

### Application

```typescript
interface Application {
  id: string;
  tenantId: string;
  candidateId: string;
  jobId: string;
  stage: ApplicationStage;
  status: ApplicationStatus;
  source: ApplicationSource;
  coverLetter?: string;
  answers: QuestionAnswer[];
  scores: ApplicationScore[];
  notes: ApplicationNote[];
  assignedRecruiterId?: string;
  referralId?: string;
  stageHistory: StageHistoryEntry[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
```

### Interview

```typescript
interface Interview {
  id: string;
  tenantId: string;
  applicationId: string;
  candidateId: string;
  jobId: string;
  type: InterviewType;
  status: InterviewStatus;
  scheduledAt: Date;
  duration: number; // minutes
  location?: string;
  meetingUrl?: string;
  interviewers: Interviewer[];
  feedback: InterviewFeedback[];
  aiSession?: AiInterviewSession;
  templateId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

type InterviewType =
  | 'phone_screen'
  | 'video'
  | 'onsite'
  | 'technical'
  | 'behavioral'
  | 'panel'
  | 'ai';

type InterviewStatus =
  | 'scheduled'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';
```

### Offer

```typescript
interface Offer {
  id: string;
  tenantId: string;
  applicationId: string;
  candidateId: string;
  jobId: string;
  status: OfferStatus;
  salary: {
    base: number;
    currency: string;
    frequency: 'hourly' | 'monthly' | 'yearly';
  };
  bonus?: {
    amount: number;
    type: 'signing' | 'performance' | 'annual';
  };
  equity?: {
    shares: number;
    vestingMonths: number;
    cliffMonths: number;
  };
  startDate: Date;
  expiresAt: Date;
  benefits: string[];
  terms: string;
  sentAt?: Date;
  respondedAt?: Date;
  negotiations: OfferNegotiation[];
  approvals: OfferApproval[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

type OfferStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'sent'
  | 'negotiating'
  | 'accepted'
  | 'declined'
  | 'withdrawn'
  | 'expired';
```

### Recruiter

```typescript
interface Recruiter {
  id: string;
  tenantId: string;
  companyId: string;
  userId: string;
  type: RecruiterType;
  primaryTeamId?: string; // Renamed from teamId - primary team assignment
  managerId?: string;
  specializations: string[];
  maxActiveJobs: number;
  maxActiveCandidates: number;
  availability: RecruiterAvailability;
  metrics: RecruiterMetrics;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

type RecruiterType = 'internal' | 'external' | 'agency';
```

---

## Entidades de Soporte

### Experience

```typescript
interface Experience {
  id: string;
  company: string;
  title: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  description?: string;
  location?: string;
}
```

### Education

```typescript
interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  gpa?: number;
}
```

### InterviewFeedback

```typescript
interface InterviewFeedback {
  id: string;
  interviewerId: string;
  rating: number; // 1-5
  recommendation: 'strong_hire' | 'hire' | 'neutral' | 'no_hire' | 'strong_no_hire';
  strengths: string[];
  weaknesses: string[];
  notes: string;
  submittedAt: Date;
}
```

### ApplicationScore

```typescript
interface ApplicationScore {
  id: string;
  scorerId: string;
  type: 'manual' | 'ai';
  overallScore: number;
  dimensionScores: {
    dimension: string;
    score: number;
    evidence?: string;
  }[];
  rubricId?: string;
  scoredAt: Date;
}
```

---

## Entidades Adicionales

### Client

```typescript
interface Client {
  id: string;
  tenantId: string;
  name: string;
  industry?: string;
  size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  website?: string;
  logoUrl?: string;
  primaryContact?: {
    name: string;
    email: string;
    phone?: string;
  };
  billingInfo?: BillingInfo;
  status: 'prospect' | 'active' | 'inactive' | 'churned';
  contractStartDate?: Date;
  contractEndDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
```

### Position

```typescript
interface Position {
  id: string;
  tenantId: string;
  clientId: string;
  title: string;
  department?: string;
  level?: 'entry' | 'mid' | 'senior' | 'lead' | 'manager' | 'director' | 'executive';
  headcount: number;
  filledCount: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'draft' | 'open' | 'on_hold' | 'filled' | 'cancelled';
  requirements: PositionRequirement[];
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
```

### ApprovalRequest

```typescript
interface ApprovalRequest {
  id: string;
  tenantId: string;
  type: 'position' | 'offer' | 'client' | 'job';
  referenceId: string;
  requesterId: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approvers: ApprovalStep[];
  currentStep: number;
  metadata?: Record<string, unknown>;
  dueDate?: Date;
  completedAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

interface ApprovalStep {
  approverId: string;
  status: 'pending' | 'approved' | 'rejected';
  comment?: string;
  decidedAt?: Date;
}
```

### Team (50+ fields)

```typescript
interface Team {
  id: string;
  tenantId: string;
  companyId: string;
  name: string;
  code: string;
  type: TeamType; // 'general' | 'executive' | 'technical' | 'volume' | 'specialized'
  status: TeamStatus; // 'active' | 'inactive' | 'archived'
  description?: string;

  // Leadership
  leaderId?: string;
  managerId?: string;
  directorId?: string;

  // Members (JSONB array)
  members: TeamMember[];

  // Specializations & Industries (JSONB)
  specializations: string[];
  industries: string[];
  locations: string[];

  // Capacity
  capacity: TeamCapacity;

  // Clients assigned
  clientIds: string[];

  // Performance Metrics (JSONB)
  performanceMetrics: TeamPerformanceMetrics;
  kpiTargets: TeamKPITargets;
  kpiActuals: TeamKPIActuals;

  // Positions
  maxActivePositions: number;
  currentActivePositions: number;
  currentUtilization: number;
  activeMemberCount: number;

  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

interface TeamMember {
  recruiterId: string;
  role: TeamMemberRole; // 'member' | 'senior_member' | 'team_lead' | 'manager' | 'director'
  allocation: number; // 0-100%
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
}

type TeamType = 'general' | 'executive' | 'technical' | 'volume' | 'specialized';
type TeamStatus = 'active' | 'inactive' | 'archived';
type TeamMemberRole = 'member' | 'senior_member' | 'team_lead' | 'manager' | 'director';
```

### TeamSprint (NEW)

```typescript
interface TeamSprint {
  id: string;
  tenantId: string;
  teamId: string;

  // Identity
  name: string;
  code: string;
  description?: string;

  // Period
  startDate: Date;
  endDate: Date;
  durationWeeks: number;

  // Targets
  positionTarget: number;
  placementTarget: number;
  revenueTarget: number;
  revenueCurrency: string;

  // Progress
  positionsAssigned: number;
  positionsFilled: number;
  placementsCompleted: number;
  revenueGenerated: number;

  // Member Snapshot (JSONB)
  memberSnapshot: SprintMemberSnapshot[];

  // Status
  status: SprintStatus; // 'planned' | 'active' | 'completed' | 'cancelled'
  completionPercentage: number;

  // Notes
  retrospectiveNotes?: string;
  goals: string[];

  // Audit
  isActive: boolean;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface SprintMemberSnapshot {
  recruiterId: string;
  role: TeamMemberRole;
  allocation: number;
  positionsHandled: number;
  placementsMade: number;
}

type SprintStatus = 'planned' | 'active' | 'completed' | 'cancelled';
```

### Organization

```typescript
interface Organization {
  id: string;
  tenantId: string;
  name: string;
  type: 'company' | 'agency' | 'department';
  parentId?: string;
  settings: OrganizationSettings;
  billing?: BillingConfig;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

interface OrganizationSettings {
  defaultPipeline?: string[];
  emailDomain?: string;
  timezone: string;
  locale: string;
}
```

### HiringProcessTemplate

```typescript
interface HiringProcessTemplate {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  stages: HiringStage[];
  isDefault: boolean;
  forJobTypes?: string[];
  averageDuration?: number; // days
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

interface HiringStage {
  id: string;
  name: string;
  type: 'screening' | 'interview' | 'assessment' | 'review' | 'offer';
  order: number;
  estimatedDays: number;
  isOptional: boolean;
  autoAdvance: boolean;
}
```

### Document

```typescript
interface Document {
  id: string;
  tenantId: string;
  ownerId: string;
  ownerType: 'candidate' | 'application' | 'job' | 'offer';
  type: 'resume' | 'cover_letter' | 'portfolio' | 'certificate' | 'reference' | 'contract' | 'other';
  name: string;
  url: string;
  mimeType: string;
  size: number;
  metadata?: DocumentMetadata;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

interface DocumentMetadata {
  parsed?: boolean;
  parsedAt?: Date;
  extractedData?: Record<string, unknown>;
}
```

### TokenManagement

```typescript
interface RecruiterToken {
  id: string;
  tenantId: string;
  recruiterId: string;
  type: 'invitation' | 'referral' | 'assessment' | 'offer';
  token: string;
  expiresAt: Date;
  usedAt?: Date;
  usedBy?: string;
  metadata?: Record<string, unknown>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface TokenConfig {
  type: string;
  expirationHours: number;
  maxUses: number;
  requiresAuth: boolean;
}
```

### RecruiterMetrics

Metricas de rendimiento de reclutadores por periodo.

```typescript
interface RecruiterMetrics {
  id: string;
  tenantId: string;
  companyId: string;
  recruiterId: string;
  teamId?: string;
  periodType: MetricsPeriodType; // 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  periodStart: Date;
  placements: number;
  revenueGenerated: number;
  // Additional performance metrics (JSONB)
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

type MetricsPeriodType = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
```

### ClientBilling

Facturacion y seguimiento de pagos de clientes.

```typescript
interface ClientBilling {
  id: string;
  tenantId: string;
  companyId: string;
  clientId: string;
  positionId?: string;
  recruiterId?: string;
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  status: InvoiceStatus; // 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  type: InvoiceType;
  amount: number;
  currency: string;
  paymentMethod?: PaymentMethod;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
```

### SearchCostLog

Registro de costos de busqueda por posicion.

```typescript
interface SearchCostLog {
  id: string;
  tenantId: string;
  companyId: string;
  positionId: string;
  clientId: string;
  recruiterId?: string;
  teamId?: string;
  category: CostCategory;
  status: CostStatus;
  amount: number;
  currency: string;
  isBillable: boolean;
  billedAt?: Date;
  incurredDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
```

### MessageTemplate

Plantillas reutilizables de mensajes para outreach.

```typescript
interface MessageTemplate {
  id: string;
  tenantId: string;
  companyId: string;
  name: string;
  description?: string;
  category?: string;
  templateType: string; // 'email' | 'linkedin' | 'sms'
  subject?: string;
  body: string;
  plainTextBody?: string;
  availableVariables: unknown[];
  sampleData?: Record<string, unknown>;
  createdByRecruiterId: string;
  isShared: boolean;
  isSystemTemplate: boolean;
  targetAudience?: string;
  useCase?: string;
  language: string;
  usageCount: number;
  lastUsedAt?: Date;
  responseRate?: number;
  avgResponseTimeHours?: number;
  requiresApproval: boolean;
  isApproved: boolean;
  approvedBy?: string;
  approvedAt?: Date;
  version: number;
  previousVersionId?: string;
  isPublished: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
```

### OutreachActivity

Registro de actividades de outreach en LinkedIn y otros canales.

```typescript
interface OutreachActivity {
  id: string;
  tenantId: string;
  companyId: string;
  recruiterId: string;
  linkedinProfileUrl: string;
  linkedinProfileName: string;
  linkedinHeadline?: string;
  linkedinLocation?: string;
  linkedinProfileImageUrl?: string;
  candidateId?: string;
  activityType: string; // 'connection_request' | 'inmail' | 'message' | 'follow_up'
  channel: string; // 'linkedin' | 'email'
  messageTemplateId?: string;
  messageSent?: string;
  messageVariablesUsed?: Record<string, unknown>;
  responseReceived: boolean;
  responseReceivedAt?: Date;
  responseTimeHours?: number;
  jobId?: string;
  notes?: string;
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
```

### RecruiterFeatures

```typescript
interface RecruiterFeatureFlag {
  id: string;
  tenantId: string;
  feature: RecruiterFeature;
  enabled: boolean;
  config?: Record<string, unknown>;
  enabledAt?: Date;
  enabledBy?: string;
}

type RecruiterFeature =
  | 'ai_interviews'
  | 'ai_scoring'
  | 'bulk_actions'
  | 'advanced_analytics'
  | 'custom_pipelines'
  | 'api_access'
  | 'integrations'
  | 'white_label';
```

### MVPFeatures

```typescript
interface MVPFeatureConfig {
  id: string;
  tenantId: string;
  tier: 'free' | 'starter' | 'professional' | 'enterprise';
  features: MVPFeature[];
  limits: MVPLimits;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface MVPFeature {
  name: string;
  enabled: boolean;
  config?: Record<string, unknown>;
}

interface MVPLimits {
  maxJobs: number;
  maxCandidatesPerMonth: number;
  maxRecruiters: number;
  maxStorageGB: number;
  maxApiCallsPerMonth: number;
}
```

---

## Relaciones

```
Candidate 1──*  Application
Job       1──*  Application
Application 1──*  Interview
Application 1──1  Offer
Recruiter  *──*  Job
Recruiter  1──*  Application (assigned)
Recruiter  *──1  Team (primaryTeamId)
Client     1──*  Position
Position   1──*  Job
Position   *──*  Team (assignedTeams)
Team       *──*  Recruiter (members JSONB)
Team       1──*  TeamSprint
TeamSprint *──1  Team
Organization 1──*  Client
HiringProcessTemplate 1──*  Job
Document   *──1  Candidate|Application|Job|Offer
```

---

## Database Tables

Complete mapping of all 25 recruiting module database tables.

All tables have: `id` (UUID PK), `tenant_id`, `is_active`, `created_at`, `updated_at`, `created_by`, `updated_by`.

### Core ATS Tables

| Entity | DB Table | Key Columns | Notes |
|--------|----------|-------------|-------|
| Recruiter | `recruiting_recruiters` | tenant_id, company_id, user_id, type, primary_team_id, manager_id | Recruiter profiles and assignments |
| Candidate | `recruiting_candidates` | tenant_id, email, first_name, last_name, source, skills (JSONB) | Candidate profiles and engagement |
| Job | `recruiting_jobs` | tenant_id, company_id, title, slug, status, employment_type, work_mode | Job postings and requirements |
| Application | `recruiting_applications` | tenant_id, candidate_id, job_id, stage, status, source, assigned_recruiter_id | Application tracking and pipeline stages |
| Offer | `recruiting_offers` | tenant_id, application_id, candidate_id, job_id, status, salary (JSONB), start_date | Offer management and negotiation |

### Client & Position Tables

| Entity | DB Table | Key Columns | Notes |
|--------|----------|-------------|-------|
| Client | `recruiting_clients` | tenant_id, name, type, tier, status, contract_type | Hiring companies/individuals |
| Position | `recruiting_positions` | tenant_id, client_id, title, status, priority, fill_type, fee_type, headcount | Client hiring requisitions with fees/SLAs |
| ApprovalRequest | `recruiting_approval_requests` | tenant_id, type, reference_id, requester_id, status, priority, current_step | Approval workflow for positions/offers/jobs |

### Team & Sprint Tables

| Entity | DB Table | Key Columns | Notes |
|--------|----------|-------------|-------|
| Team | `recruiting_teams` | tenant_id, company_id, name, code, type, status, leader_id, members (JSONB) | Recruiting teams with members and KPIs |
| TeamSprint | `recruiting_team_sprints` | tenant_id, team_id, name, code, start_date, end_date, status, targets (JSONB) | Time-boxed recruiting periods with targets |

### Interview Tables

| Entity | DB Table | Key Columns | Notes |
|--------|----------|-------------|-------|
| Interview | `recruiting_interviews` | tenant_id, application_id, candidate_id, job_id, type, mode, status | AI/human interviews (92 fields) |
| InterviewTemplate | `recruiting_interview_templates` | tenant_id, name, category, interview_type, status | Reusable interview structures |
| InterviewPersona | `recruiting_interview_personas` | tenant_id, voice_provider, tone, emotion_style | AI interviewer personalities |
| InterviewProcessConfig | `recruiting_interview_process_configs` | tenant_id, aggregation_strategy, knockout_behavior | Multi-step process definitions |
| InterviewProcessInstance | `recruiting_interview_process_instances` | tenant_id, status, recommendation, rating_tier | Active process tracking |
| InterviewFeedback | `recruiting_interview_feedback` | tenant_id, interview_id, interviewer_id, recommendation, rating | Interviewer evaluations |

### Token Billing Tables

| Entity | DB Table | Key Columns | Notes |
|--------|----------|-------------|-------|
| TokenBalance | `recruiting_token_balances` | tenant_id, company_id, balance, reserved | Company token balance tracking |
| TokenTransaction | `recruiting_token_transactions` | tenant_id, company_id, type, amount, reference_id | Token transaction history |

### Metrics Tables

| Entity | DB Table | Key Columns | Notes |
|--------|----------|-------------|-------|
| RecruiterMetrics | `recruiting_recruiter_metrics` | tenant_id, company_id, recruiter_id, team_id, period_type, period_start, placements, revenue_generated | Performance tracking by period |
| ClientBilling | `recruiting_client_billing` | tenant_id, company_id, client_id, position_id, invoice_number, status, amount, due_date | Invoice and payment tracking |
| SearchCostLog | `recruiting_search_cost_log` | tenant_id, company_id, position_id, client_id, recruiter_id, category, status, amount, incurred_date | Position search cost tracking |

### Process & Template Tables

| Entity | DB Table | Key Columns | Notes |
|--------|----------|-------------|-------|
| HiringProcessTemplate | `recruiting_hiring_process_templates` | tenant_id, name, category, status, stages (JSONB) | Hiring workflow templates |
| AuditLog | `recruiting_audit_logs` | tenant_id, action, actor_type, actor_id, entity_type, entity_id | Compliance audit logging |

### Message Template & Outreach Tables

| Entity | DB Table | Key Columns | Notes |
|--------|----------|-------------|-------|
| MessageTemplate | `recruiting_message_templates` | tenant_id, company_id, name, template_type, subject, body, created_by_recruiter_id, use_case | Reusable outreach message templates |
| OutreachActivity | `recruiting_outreach_activities` | tenant_id, company_id, recruiter_id, linkedin_profile_url, activity_type, channel, candidate_id, message_template_id | LinkedIn outreach tracking |
