# dm-scoring - Entities

> **Entidades del sistema de evaluación LLM-as-Judge**

---

## Entidades Principales

### Rubric

Plantilla de evaluación con dimensiones y criterios.

```typescript
interface Rubric {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  industry: Industry;
  version: number;
  status: RubricStatus;
  dimensions: Dimension[];
  scoringScale: ScoringScale;
  instructions: string;
  publishedAt?: Date;
  archivedAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

type RubricStatus = 'draft' | 'published' | 'archived';

interface ScoringScale {
  min: number;      // e.g., 1
  max: number;      // e.g., 5
  labels?: {        // Optional labels
    [score: number]: string;
  };
}
```

### Dimension

Aspecto específico a evaluar dentro de una rúbrica.

```typescript
interface Dimension {
  id: string;
  rubricId: string;
  name: string;
  description: string;
  weight: number;       // 0-100, suma de todas = 100
  order: number;
  criteria: DimensionCriteria[];
  scoringGuidelines: {
    [score: number]: string;  // Guía por nivel de puntuación
  };
  evidenceRequired: boolean;
}

interface DimensionCriteria {
  id: string;
  description: string;
  weight: number;
}
```

### Scorable

Cualquier objeto que puede ser evaluado.

```typescript
interface Scorable {
  id: string;
  tenantId: string;
  type: ScorableType;
  externalId: string;       // ID en sistema externo
  content: string;          // Contenido a evaluar
  transcriptTurns?: TranscriptTurn[];      // Structured turn data from dm-ia-chat
  transcriptMetadata?: {
    turnCount: number;
    wordCount: number;
    speakers: Array<{ id?: string; role: string; name?: string; turnCount: number; wordCount: number }>;
  };
  metadata: Record<string, unknown>;
  processConfigId?: string;
  status: ScorableStatus;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

interface TranscriptTurn {
  index: number;
  role: string;             // 'interviewer' | 'candidate' | 'system'
  speakerId?: string;
  content: string;
  charOffset: number;       // Position in full transcript text
  charLength: number;
  startTime?: number;       // Seconds from start
  endTime?: number;
}

type ScorableType =
  | 'interview_response'    // Respuesta de entrevista
  | 'call_recording'        // Grabación de llamada
  | 'written_assessment'    // Evaluación escrita
  | 'code_submission'       // Código enviado
  | 'video_response';       // Respuesta en video

type ScorableStatus =
  | 'pending'
  | 'scoring'
  | 'scored'
  | 'failed';
```

### Scorecard

Resultado completo de una evaluación.

```typescript
interface Scorecard {
  id: string;
  tenantId: string;
  scorableId: string;
  rubricId: string;
  rubricVersion: number;
  scorerType: ScorerType;
  scorerId?: string;        // userId si es humano
  overallScore: number;
  dimensionScores: DimensionScore[];
  summary: string;
  status: ScorecardStatus;
  approvedBy?: string;
  approvedAt?: Date;
  llmMetadata?: {
    model: string;
    promptTokens: number;
    completionTokens: number;
    latencyMs: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

type ScorerType = 'llm' | 'human' | 'hybrid';

type ScorecardStatus =
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'rejected';
```

### DimensionScore

Puntuación en una dimensión específica.

```typescript
interface DimensionScore {
  id: string;
  scorecardId: string;
  dimensionId: string;
  dimensionName: string;
  score: number;
  weightedScore: number;
  evidence: Evidence[];
  rationale: string;
  confidence?: number;      // 0-1 para scores de LLM
}
```

### Evidence

Evidencia que justifica una puntuación.

```typescript
interface Evidence {
  id: string;
  dimensionScoreId: string;
  type: EvidenceType;
  content: string;
  location?: {
    start: number;
    end: number;
  };
  turnIndex?: number;            // Turn where evidence was found
  turnRole?: string;             // Speaker role for the turn
  withinTurnStartChar?: number;  // Position within the turn content
  withinTurnEndChar?: number;
  relevance: number;        // 0-1
}

type EvidenceType =
  | 'quote'                 // Cita directa
  | 'paraphrase'            // Parafraseo
  | 'observation';          // Observación
```

### Calibration

Proceso de alineación entre evaluadores humanos y LLM.

```typescript
interface Calibration {
  id: string;
  tenantId: string;
  rubricId: string;
  name: string;
  status: CalibrationStatus;
  samples: CalibrationSample[];
  metrics?: CalibrationMetrics;
  completedAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

type CalibrationStatus =
  | 'collecting_samples'
  | 'in_progress'
  | 'completed';

interface CalibrationSample {
  id: string;
  calibrationId: string;
  scorableId: string;
  humanScore: number;
  llmScore: number;
  humanDimensionScores: DimensionScore[];
  llmDimensionScores: DimensionScore[];
  agreement: number;        // 0-1
}

interface CalibrationMetrics {
  overallAgreement: number;
  dimensionAgreements: {
    dimensionId: string;
    agreement: number;
  }[];
  cohenKappa: number;
  pearsonCorrelation: number;
  meanAbsoluteError: number;
}
```

### Appeal

Apelación de un score.

```typescript
interface Appeal {
  id: string;
  tenantId: string;
  scorecardId: string;
  appealerId: string;
  reason: string;
  status: AppealStatus;
  resolution?: {
    decision: 'upheld' | 'overturned' | 'modified';
    newScore?: number;
    rationale: string;
    resolvedBy: string;
    resolvedAt: Date;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

type AppealStatus =
  | 'pending'
  | 'under_review'
  | 'resolved';
```

### ProctoringEvent

Evento detectado durante evaluación proctorizada.

```typescript
interface ProctoringEvent {
  id: string;
  tenantId: string;
  scorableId: string;
  type: ProctoringEventType;
  severity: 'low' | 'medium' | 'high';
  timestamp: Date;
  details: Record<string, unknown>;
  reviewed: boolean;
  reviewedBy?: string;
  reviewedAt?: Date;
  decision?: 'dismissed' | 'flagged' | 'invalidated';
}

type ProctoringEventType =
  | 'tab_switch'
  | 'copy_paste'
  | 'face_not_detected'
  | 'multiple_faces'
  | 'audio_detected'
  | 'screen_share_detected';
```

### RubricVersion

Versiones inmutables de rubricas para trazabilidad de evaluaciones.

```typescript
interface RubricVersion {
  id: string;
  tenantId: string;
  rubricId: string;
  version: number;
  snapshot: Record<string, unknown>; // Full rubric state at this version
  publishedAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
```

### ScoringJob

Trabajo asíncrono de evaluación en cola.

```typescript
interface ScoringJob {
  id: string;
  tenantId: string;
  scorableId: string;
  rubricId: string;
  status: ScoringJobStatus;
  priority?: number;
  attempts: number;
  maxAttempts: number;
  startedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
  errorMessage?: string;
  resultScorecardId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

type ScoringJobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
```

### Process

Proceso de evaluación multi-paso.

```typescript
interface Process {
  id: string;
  tenantId: string;
  name: string;
  configId: string;
  scorableId: string;
  status: ProcessStatus;
  currentStep: number;
  totalSteps: number;
  startedAt?: Date;
  completedAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

type ProcessStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
```

### ProcessStep

Paso individual dentro de un proceso de evaluación.

```typescript
interface ProcessStep {
  id: string;
  tenantId: string;
  processId: string;
  stepNumber: number;
  type: ProcessStepType;
  status: ProcessStepStatus;
  rubricId?: string;
  scorecardId?: string;
  startedAt?: Date;
  completedAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

type ProcessStepType = 'scoring' | 'review' | 'calibration' | 'approval';
type ProcessStepStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
```

### ProcessConfig

Configuración de proceso de evaluación multi-paso.

```typescript
interface ProcessConfig {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  aggregationStrategy: AggregationStrategy;
  knockoutBehavior: KnockoutBehavior;
  steps: ProcessConfigStep[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

type AggregationStrategy = 'average' | 'weighted_average' | 'highest' | 'lowest' | 'median';
type KnockoutBehavior = 'fail_immediately' | 'continue_scoring' | 'flag_for_review';
```

### AnswerEmbedding

Embeddings vectoriales de respuestas para detección de similitud.

```typescript
interface AnswerEmbedding {
  id: string;
  tenantId: string;
  scorableId: string;
  dimensionId?: string;
  content: string;
  embedding: number[]; // Vector embedding
  model: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
```

### AnswerSimilarityCheck

Verificación de similitud entre respuestas.

```typescript
interface AnswerSimilarityCheck {
  id: string;
  tenantId: string;
  sourceEmbeddingId: string;
  targetEmbeddingId: string;
  similarityScore: number; // 0-1
  threshold: number;
  isFlagged: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
```

### SkillGapAnalysis

Análisis de brecha de habilidades basado en resultados de evaluación.

```typescript
interface SkillGapAnalysis {
  id: string;
  tenantId: string;
  scorecardId: string;
  scorableId: string;
  identifiedGaps: SkillGap[];
  recommendations: string[];
  overallReadiness: number; // 0-100
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

interface SkillGap {
  dimensionId: string;
  dimensionName: string;
  currentScore: number;
  targetScore: number;
  gap: number;
  priority: 'low' | 'medium' | 'high';
}
```

---

## Relaciones

```
Rubric            1──*  RubricVersion
Rubric            1──*  Dimension
Rubric            1──*  Scorecard
Scorable          1──*  Scorecard
Scorecard         1──*  DimensionScore
DimensionScore    1──*  Evidence
Rubric            1──*  Calibration
Calibration       1──*  CalibrationSample
Scorecard         1──1  Appeal
Scorable          1──*  ProctoringEvent
Scorable          1──*  ScoringJob
Scorable          1──*  AnswerEmbedding
AnswerEmbedding   1──*  AnswerSimilarityCheck
ProcessConfig     1──*  Process
Process           1──*  ProcessStep
Scorecard         1──*  SkillGapAnalysis
```

---

## Database Tables

Complete mapping of all 18 scoring module database tables.

All tables have: `id` (UUID PK), `tenant_id`, `is_active`, `created_at`, `updated_at`, `created_by`, `updated_by`.

### Rubric Tables

| Entity | DB Table | Key Columns | Notes |
|--------|----------|-------------|-------|
| Rubric | `scoring_rubrics` | tenant_id, company_id, name, slug, industry, scoring_mode, status, version | Evaluation template with dimensions |
| RubricVersion | `scoring_rubric_versions` | tenant_id, rubric_id, version, snapshot (JSONB), published_at | Immutable rubric version snapshots |
| Dimension | `scoring_dimensions` | tenant_id, rubric_id, name, weight, order, criteria (JSONB), scoring_guidelines (JSONB) | Scoring criterion within rubric |

### Scoring Tables

| Entity | DB Table | Key Columns | Notes |
|--------|----------|-------------|-------|
| Scorable | `scoring_scorables` | tenant_id, type, external_id, content, transcript_turns (JSONB), process_config_id, status | The thing being scored |
| Scorecard | `scoring_scorecards` | tenant_id, scorable_id, rubric_id, rubric_version, scorer_type, overall_score, status | Scoring result with overall + dimension scores |
| DimensionScore | `scoring_dimension_scores` | scorecard_id, dimension_id, score, weighted_score, rationale, confidence | Individual dimension result |
| ScoringJob | `scoring_jobs` | tenant_id, scorable_id, rubric_id, status, priority, attempts, result_scorecard_id | Async scoring job queue |

### Calibration Tables

| Entity | DB Table | Key Columns | Notes |
|--------|----------|-------------|-------|
| Calibration | `scoring_calibrations` | tenant_id, rubric_id, name, status, metrics (JSONB) | Human-AI alignment tracking |
| CalibrationSample | `scoring_calibration_samples` | calibration_id, scorable_id, human_score, llm_score, agreement | Human vs AI comparison data |

### Process Tables

| Entity | DB Table | Key Columns | Notes |
|--------|----------|-------------|-------|
| Process | `scoring_processes` | tenant_id, config_id, scorable_id, status, current_step, total_steps | Multi-step evaluation process |
| ProcessStep | `scoring_process_steps` | tenant_id, process_id, step_number, type, status, rubric_id, scorecard_id | Individual step in evaluation process |
| ProcessConfig | `scoring_process_configs` | tenant_id, name, aggregation_strategy, knockout_behavior, steps (JSONB) | Process configuration template |

### Answer Similarity Tables

| Entity | DB Table | Key Columns | Notes |
|--------|----------|-------------|-------|
| AnswerEmbedding | `scoring_answer_embeddings` | tenant_id, scorable_id, dimension_id, content, embedding (vector), model | Vector embeddings for answers |
| AnswerSimilarityCheck | `scoring_answer_similarity_checks` | tenant_id, source_embedding_id, target_embedding_id, similarity_score, is_flagged | Plagiarism/similarity detection |

### Evidence, Appeals & Proctoring Tables

| Entity | DB Table | Key Columns | Notes |
|--------|----------|-------------|-------|
| Evidence | `scoring_evidence` | dimension_score_id, type, content, turn_index, turn_role, relevance, impact | Transcript quotes supporting scores |
| Appeal | `scoring_appeals` | tenant_id, scorecard_id, appealer_id, reason, status, resolution (JSONB) | Score appeal management |
| ProctoringEvent | `scoring_proctoring_events` | tenant_id, scorable_id, type, severity, timestamp, reviewed, decision | Proctoring event detection |

### Analysis Tables

| Entity | DB Table | Key Columns | Notes |
|--------|----------|-------------|-------|
| SkillGapAnalysis | `scoring_skill_gap_analyses` | tenant_id, scorecard_id, scorable_id, identified_gaps (JSONB), recommendations, overall_readiness | Skill gap analysis from scoring results |
