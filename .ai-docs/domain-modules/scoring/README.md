# Scoring Module (dm-scoring)

> **LLM-as-Judge evaluation system for AI-powered assessments**

## What It Does

The Scoring module implements an LLM-as-Judge system for evaluating responses, interviews, and other content using AI. It supports configurable rubrics with multiple dimensions, calibration sessions for consistency, and human review workflows.

The module provides fraud detection through similarity checking and proctoring events, skill gap analysis, and appeal processes. It's designed to work across multiple industries including recruiting, call centers, healthcare, sales, and education.

## When to Use

- **AI Evaluation**: Score responses using LLM judges
- **Rubric Management**: Create and manage evaluation rubrics
- **Calibration**: Ensure scoring consistency across evaluators
- **Fraud Detection**: Detect plagiarism and suspicious behavior
- **Skill Analysis**: Identify skill gaps from evaluations
- **Appeals**: Handle score dispute processes

## Key Concepts

| Concept | Description |
|---------|-------------|
| **Rubric** | Evaluation criteria with dimensions |
| **Dimension** | Individual scoring criterion |
| **Scorecard** | Evaluation results with scores |
| **Scorable** | Object being evaluated |
| **Calibration** | Scorer alignment session |
| **Evidence** | Supporting evidence for scores |

## Documentation

| File | Content |
|------|---------|
| [USE-CASES.md](./USE-CASES.md) | All 53 use cases with descriptions |
| [ENTITIES.md](./ENTITIES.md) | Data schemas and relationships |

## Import

```typescript
// Rubrics
import { makeCreateRubricUC, makeAddDimensionUC, makePublishRubricUC } from '@rottay/scoring';

// Scoring
import { makeScoreWithLlmUC, makeSubmitHumanScoreUC, makeBatchScoreUC } from '@rottay/scoring';

// Calibration
import { makeCreateCalibrationUC, makeCalculateCalibrationMetricsUC } from '@rottay/scoring';

// Fraud detection
import { makeCheckSimilarityUC, makeRecordProctoringEventUC } from '@rottay/scoring';
```

## Evaluation Flow

```
1. Create Rubric (rubric + dimensions)
         ↓
2. Create Scorable (object to evaluate)
         ↓
3. Execute score-with-llm
         ↓
4. Generate Scorecard with DimensionScores
         ↓
5. (Optional) Human review
         ↓
6. (Optional) Calibration
```

## REVIEW-2026: Result Pattern Migration

- **Status**: Complete -- ALL 53 use cases migrated
- **Codebase**: ~76K LOC
- **Pattern**: All use cases return `Result<T>` using `createSuccessResult(data)` and `createErrorResult(code, message, details)` from `@rottay/core`
- **Previous pattern**: Mixed throwing errors and manual `{ success: true/false }` objects
- Mutations inherit from `BaseMutationUseCase`, queries from `BaseQueryUseCase`
- LLM-as-Judge pattern preserved -- scoring operations return structured `Result<Scorecard>` instead of throwing on LLM failures

## Turn-Aware Scoring (2026-02-06 Audit)

The scoring module now supports structured transcript turns for richer speaker-attributed evidence:

- **Scorable.transcriptTurns**: Optional array of `TranscriptTurn` objects (from dm-ia-chat's `NormalizedTranscript`) attached to the scorable entity
- **Evidence.turnIndex / Evidence.turnRole**: Each piece of extracted evidence can now reference the specific turn index and speaker role (e.g., "interviewer", "candidate") it was drawn from
- **Integration**: dm-ia-chat produces `ConversationOutput` with `NormalizedTranscript` -> dm-scoring consumes `TranscriptTurn[]` for speaker-aware LLM evaluation

## Session 2026-02-06 Changes

- **Deprecated shims + 44 legacy type/schema aliases cleaned**: Removed backward-compatibility shims and redundant type aliases that duplicated canonical definitions in the domain layer
- **ESLint v9 flat config**: Migrated from `.eslintrc.json` to ESLint v9 flat config (`eslint.config.js`). Legacy `.eslintrc.json` deleted.

## Related Modules

- [Recruiter](../recruiter/) - Candidate and interview scoring
- [IA-Chat](../ia-chat/) - LLM providers for evaluation
