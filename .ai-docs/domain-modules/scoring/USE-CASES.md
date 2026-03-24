# dm-scoring - Use Cases

> **LLM-as-Judge - AI-powered evaluation system**

**Total: 53 use cases (34 mutations, 19 queries) | 53 zero-arg factories (100% coverage)**

**REVIEW-2026 Result Pattern**: ALL 53 use cases migrated. Uses `createSuccessResult(data)` / `createErrorResult(code, message, details)` from `@rottay/core`. LLM-as-Judge pattern intact. ~76K LOC.

---

## Quick Index

### Mutations
- [rubric](#mutations-rubric) - Evaluation rubric management
- [dimension](#mutations-dimension) - Rubric dimension management
- [scoring](#mutations-scoring) - Core LLM scoring operations
- [calibration](#mutations-calibration) - Human-AI alignment calibration
- [scoring-job](#mutations-scoring-job) - Scoring job queue management
- [embedding](#mutations-embedding) - Embedding generation
- [appeal](#mutations-appeal) - Score appeals
- [fraud](#mutations-fraud) - Fraud detection and proctoring
- [analytics](#mutations-analytics) - Skill gap analysis
- [process](#mutations-process) - Process configuration and execution

### Queries
- [rubric](#queries-rubric) - Rubric retrieval
- [scorecard](#queries-scorecard) - Scorecard retrieval
- [calibration](#queries-calibration) - Calibration data retrieval
- [analytics](#queries-analytics) - Skill gap retrieval
- [embedding](#queries-embedding) - Similarity search
- [appeal](#queries-appeal) - Appeal listing
- [fraud](#queries-fraud) - Proctoring event retrieval
- [process-config](#queries-process-config) - Process config retrieval

---

## Overview

The **dm-scoring** module implements an **LLM-as-Judge** evaluation system that uses artificial intelligence to score and evaluate various types of content (candidate responses, call center interactions, sales pitches, etc.).

**Key capabilities:**
- **Rubric-based evaluation**: Define multi-dimensional scoring rubrics with configurable criteria
- **LLM scoring**: Automated evaluation using GPT-4, Claude, or other LLM providers
- **Turn-aware scoring**: Optional structured transcript turns with speaker attribution for richer evidence extraction
- **Human-AI calibration**: Align LLM scores with human judgment through calibration sessions
- **Evidence extraction**: Automatically extract supporting evidence with optional turn context (turnIndex, turnRole)
- **Fraud detection**: Plagiarism checking and proctoring event monitoring
- **Appeals workflow**: Allow score appeals with resolution tracking
- **Analytics**: Skill gap analysis and scorecard analytics
- **Scoring jobs**: Queue-based asynchronous scoring with job lifecycle management

**Supported industries:** Recruiting, Call Center QA, Healthcare, Sales, Education

**REVIEW-2026**: All 53 use cases return `Result<T>` via `createSuccessResult(data)` / `createErrorResult(code, message, details)` from `@rottay/core`. No more thrown errors or manual `{ success: true/false }` objects.

---

## Entities

| Entity | Description |
|--------|-------------|
| `Rubric` | Evaluation rubric containing dimensions and scoring criteria |
| `Dimension` | Individual scoring criterion within a rubric |
| `Scorable` | Object to be evaluated (answer, transcript, etc.) |
| `Scorecard` | Result of an evaluation containing dimension scores |
| `DimensionScore` | Individual score for a single dimension |
| `CalibrationSession` | Session for aligning human and LLM scoring |
| `CalibrationSample` | Sample submission in a calibration session |
| `Appeal` | Score appeal request and resolution |
| `ProctoringEvent` | Suspicious activity event during evaluation |
| `ProcessConfig` | Configuration for a scoring process |
| `SkillGap` | Identified skill gap from analytics |
| `ScoringJob` | Asynchronous scoring job with queue lifecycle |

---

## Mutations

### rubric {#mutations-rubric}
| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| create-rubric | Creates new evaluation rubric | `CreateRubricUseCase` | `makeCreateRubricUseCase` |
| update-rubric | Updates rubric | `UpdateRubricUseCase` | `makeUpdateRubricUseCase` |
| clone-rubric | Clones existing rubric | `CloneRubricUseCase` | `makeCloneRubricUseCase` |
| publish-rubric | Publishes rubric for use | `PublishRubricUseCase` | `makePublishRubricUseCase` |
| archive-rubric | Archives rubric | `ArchiveRubricUseCase` | `makeArchiveRubricUseCase` |
| create-rubric-version | Creates a new version of a rubric | `CreateRubricVersionUseCase` | `makeCreateRubricVersionUseCase` |

### dimension {#mutations-dimension}
| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| add-dimension | Adds dimension to rubric | `AddDimensionUseCase` | `makeAddDimensionUseCase` |
| update-dimension | Updates dimension | `UpdateDimensionUseCase` | `makeUpdateDimensionUseCase` |
| reorder-dimensions | Reorders dimensions | `ReorderDimensionsUseCase` | `makeReorderDimensionsUseCase` |
| remove-dimension | Removes dimension | `RemoveDimensionUseCase` | `makeRemoveDimensionUseCase` |

### scoring {#mutations-scoring}
| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| score-with-llm | **CORE** Evaluates with LLM | `ScoreWithLLMUseCase` | `makeScoreWithLLMUseCase` |
| submit-human-score | Submits human score | `SubmitHumanScoreUseCase` | `makeSubmitHumanScoreUseCase` |
| approve-score | Approves scorecard | `ApproveScoreUseCase` | `makeApproveScoreUseCase` |
| override-score | Overrides an existing score | `OverrideScoreUseCase` | `makeOverrideScoreUseCase` |
| batch-score | Batch evaluates multiple items | `BatchScoreUseCase` | `makeBatchScoreUseCase` |

### calibration {#mutations-calibration}
| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| create-calibration | Creates calibration session | `CreateCalibrationUseCase` | `makeCreateCalibrationUseCase` |
| submit-sample | Submits calibration sample | `SubmitCalibrationSampleUseCase` | `makeSubmitCalibrationSampleUseCase` |
| complete-calibration | Completes calibration | `CompleteCalibrationUseCase` | `makeCompleteCalibrationUseCase` |
| calculate-metrics | Calculates alignment metrics | `CalculateCalibrationMetricsUseCase` | `makeCalculateCalibrationMetricsUseCase` |

### scoring-job {#mutations-scoring-job}
| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| enqueue | Enqueues a new scoring job | `EnqueueScoringJobUseCase` | `makeEnqueueScoringJobUseCase` |
| process | Processes a scoring job | `ProcessScoringJobUseCase` | `makeProcessScoringJobUseCase` |
| fail | Marks a scoring job as failed | `FailScoringJobUseCase` | `makeFailScoringJobUseCase` |

### embedding {#mutations-embedding}
| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| create-embedding | Creates answer embedding | `CreateEmbeddingUseCase` | `makeCreateEmbeddingUseCase` |

### appeal {#mutations-appeal}
| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| create-appeal | Creates score appeal | `CreateAppealUseCase` | `makeCreateAppealUseCase` |
| resolve-appeal | Resolves appeal | `ResolveAppealUseCase` | `makeResolveAppealUseCase` |

### fraud {#mutations-fraud}
| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| check-similarity | Checks similarity (plagiarism) | `CheckSimilarityUseCase` | `makeCheckSimilarityUseCase` |
| record-proctoring-event | Records proctoring event | `RecordProctoringEventUseCase` | `makeRecordProctoringEventUseCase` |
| review-event | Reviews proctoring event | `ReviewProctoringEventUseCase` | `makeReviewProctoringEventUseCase` |

### analytics {#mutations-analytics}
| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| analyze-skill-gaps | Analyzes skill gaps | `AnalyzeSkillGapsUseCase` | `makeAnalyzeSkillGapsUseCase` |

### process {#mutations-process}
| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| create-process-config | Creates process configuration | `CreateProcessConfigUseCase` | `makeCreateProcessConfigUseCase` |
| update-process-config | Updates process configuration | `UpdateProcessConfigUseCase` | `makeUpdateProcessConfigUseCase` |
| create-scorable | Creates scorable object | `CreateScorableUseCase` | `makeCreateScorableUseCase` |
| start-process | Starts a scoring process | `StartProcessUseCase` | `makeStartProcessUseCase` |
| advance-process-step | Advances to next process step | `AdvanceProcessStepUseCase` | `makeAdvanceProcessStepUseCase` |

---

## Queries

### rubric {#queries-rubric}
| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| get-rubric-by-id | Gets rubric by ID | `GetRubricByIdUseCase` | `makeGetRubricByIdUseCase` |
| list-rubrics | Lists rubrics | `ListRubricsUseCase` | `makeListRubricsUseCase` |
| list-rubrics-by-industry | Lists rubrics by industry | `ListRubricsByIndustryUseCase` | `makeListRubricsByIndustryUseCase` |

### scorecard {#queries-scorecard}
| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| get-scorecard-by-id | Gets scorecard by ID | `GetScorecardByIdUseCase` | `makeGetScorecardByIdUseCase` |
| get-scorecards-by-scorable | Gets scorecards by scorable | `GetScorecardsByScorableUseCase` | `makeGetScorecardsByScorableUseCase` |
| list-scorecards | Lists scorecards | `ListScorecardsUseCase` | `makeListScorecardsUseCase` |

### calibration {#queries-calibration}
| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| get-calibration-by-id | Gets calibration by ID | `GetCalibrationByIdUseCase` | `makeGetCalibrationByIdUseCase` |
| list-calibrations | Lists calibrations | `ListCalibrationsUseCase` | `makeListCalibrationsUseCase` |
| get-calibration-samples | Gets calibration samples | `GetCalibrationSamplesUseCase` | `makeGetCalibrationSamplesUseCase` |

### analytics {#queries-analytics}
| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| list-skill-gaps | Lists skill gap analyses | `ListSkillGapsQuery` | `makeListSkillGapsQuery` |
| get-skill-gap-by-id | Gets skill gap by ID | `GetSkillGapByIdQuery` | `makeGetSkillGapByIdQuery` |
| get-skill-gap-by-scorecard | Gets skill gap by scorecard | `GetSkillGapByScorecardQuery` | `makeGetSkillGapByScorecardQuery` |
| get-critical-gaps | Gets critical skill gaps | `GetCriticalGapsQuery` | `makeGetCriticalGapsQuery` |

### embedding {#queries-embedding}
| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| find-similar | Finds similar embeddings | `FindSimilarEmbeddingsQuery` | `makeFindSimilarEmbeddingsQuery` |

### appeal {#queries-appeal}
| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| list-appeals | Lists appeals | `ListAppealsQuery` | `makeListAppealsQuery` |

### fraud {#queries-fraud}
| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| get-proctoring-events | Gets proctoring events | `GetProctoringEventsQuery` | `makeGetProctoringEventsQuery` |
| get-suspicious-scorables | Lists suspicious scorables | `GetSuspiciousScorableQuery` | `makeGetSuspiciousScorableQuery` |

### process-config {#queries-process-config}
| Use Case | Description | Class | Factory |
|----------|-------------|-------|---------|
| get-process-config-by-id | Gets process config by ID | `GetProcessConfigByIdQuery` | `makeGetProcessConfigByIdQuery` |
| list-process-configs | Lists process configurations | `ListProcessConfigsQuery` | `makeListProcessConfigsQuery` |

---

## Evaluation Flow

```
1. Create Rubric (rubric + dimensions)
          |
2. Create Scorable (object to evaluate)
          |
3. Execute score-with-llm
          |
4. Generate Scorecard with DimensionScores
          |
5. (Optional) Human review
          |
6. (Optional) Calibration
```

---

## Supported Industries

```typescript
type Industry =
  | 'recruiting'     // Candidate evaluation
  | 'call-center'    // Call QA
  | 'healthcare'     // Medical evaluation
  | 'sales'          // Sales evaluation
  | 'education';     // Educational evaluation
```

---

## LLM Providers

The module abstracts LLM providers through a port:

```typescript
interface LLMJudgePort {
  score(input: LLMJudgeInput, context: TenantContext): Promise<LLMJudgeOutput>;
  extractEvidence(input: EvidenceExtractionInput): Promise<ExtractedEvidence[]>;
  estimateTokens(input: LLMJudgeInput): Promise<number>;
}
```

Implemented providers:
- OpenAI (GPT-4, GPT-4 Turbo)
- Anthropic (Claude)

---

## Related

### dm-recruiter
The scoring module integrates with the recruiter module to evaluate candidate responses:
- `ScoreWithLLMUseCase` is called after candidates submit interview answers
- Scorecards are linked to `Application` entities via `Scorable`
- Skill gap analysis feeds into candidate matching algorithms

See: [dm-recruiter USE-CASES](../recruiter/USE-CASES.md)

### dm-ia-chat
The scoring module uses shared AI infrastructure:
- Common LLM provider abstractions (`LLMJudgePort`)
- Embedding generation for similarity search
- Token estimation and cost tracking

See: [dm-ia-chat USE-CASES](../ia-chat/USE-CASES.md)
