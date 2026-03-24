# app-bithire - Modules Used

> **BitHire - Recruiting & ATS Application**

---

## Overview

`app-bithire` is the recruiting application that combines ATS (Applicant Tracking System), AI-powered candidate scoring, and conversational AI for interviews.

---

## Domain Modules

| Module | Import | Description | Use Cases |
|--------|--------|-------------|-----------|
| **@rottay/dm-recruiter** | `import { ... } from '@rottay/recruiter'` | ATS + Token Management | 134 |
| **@rottay/dm-scoring** | `import { ... } from '@rottay/scoring'` | LLM-as-Judge - AI Evaluation (turn-aware) | 53 |
| **@rottay/dm-ia-chat** | `import { ... } from '@rottay/ia-chat'` | AI Providers + Pricing Engine | 152 |

**Total Domain Use Cases: 339**

---

## Platform Modules

| Module | Import | Use Case |
|--------|--------|----------|
| **@rottay/auth** | `import { ... } from '@rottay/auth'` | Authentication, SSO |
| **@rottay/identity** | `import { ... } from '@rottay/identity'` | User profiles, permissions |
| **@rottay/tenancy** | `import { ... } from '@rottay/tenancy'` | Multi-tenancy |
| **@rottay/permissions** | `import { ... } from '@rottay/permissions'` | RBAC |
| **@rottay/compliance** | `import { ... } from '@rottay/compliance'` | AI Hiring bias audits |
| **@rottay/navigation** | `import { ... } from '@rottay/navigation'` | App navigation |
| **@rottay/notifications** | `import { ... } from '@rottay/notifications'` | Email, In-App notifications |

---

## Core

```typescript
import {
  success,
  error,
  type TenantContext,
  type UseCaseResult,
  logger,
  db,
  // Errors
  ValidationError,
  NotFoundError,
  ConflictError,
  // ...
} from '@rottay/core';
```

---

## Design System

```typescript
import {
  Box,
  Flex,
  Text,
  Button,
  Input,
  Table,
  Modal,
  Card,
  Badge,
  Avatar,
  Tabs,
  // ...
} from '@rottay/design-system';
```

---

## Key Features

### Recruiting (dm-recruiter)
- **Job Management** - Create, publish, and manage job postings
- **Candidate Pipeline** - Track candidates through hiring stages
- **Interview Scheduling** - Schedule and manage interviews
- **Offer Management** - Create and track job offers
- **Analytics** - Hiring metrics and pipeline analytics
- **Team Sprints** - Time-boxed recruiting sprints with targets, progress tracking, and retrospectives
- **Token Management** - Purchase tokens, distribute to teams, view balances and transaction history

### AI Scoring (dm-scoring)
- **Rubric Management** - Create evaluation rubrics with dimensions
- **Scorecard Generation** - AI-powered candidate evaluation
- **Turn-Aware Scoring** - Structured transcript turns with speaker attribution for richer evidence
- **Calibration** - Calibrate scoring across evaluators
- **Bias Detection** - Detect and mitigate scoring bias

### AI Chat (dm-ia-chat)
- **AI Interviews** - Conduct AI-powered interviews
- **Multi-Provider Support** - OpenAI, Anthropic, Mistral, Groq + self-hosted (Rottay TTS/STT/Voice)
- **Voice Integration** - STT/TTS for voice interviews
- **Phone Integration** - Automated phone screening
- **DB-Driven Pricing** - Configurable provider rates, markup, discounts with Rottay Token conversion
- **Normalized Output** - Standardized conversation output with turn structure for dm-scoring
- **Cost Estimation** - Real-time token cost estimation based on provider/model/duration

---

## Module Integration Example

```typescript
// Interview flow using multiple modules
import { makeScheduleInterviewUseCase } from '@rottay/dm-recruiter';
import { makeGenerateScorecardUseCase } from '@rottay/dm-scoring';
import { makeSendMessageUseCase } from '@rottay/dm-ia-chat';

// 1. Schedule interview (recruiter)
const interview = await scheduleInterview.execute({
  applicationId,
  type: 'ai',
  scheduledAt: new Date(),
}, context);

// 2. Conduct AI interview (ia-chat)
const response = await sendMessage.execute({
  agentId: 'interviewer-agent',
  message: candidateResponse,
}, context);

// 3. Generate scorecard (scoring)
const scorecard = await generateScorecard.execute({
  applicationId,
  rubricId,
  transcript: interview.transcript,
}, context);
```
