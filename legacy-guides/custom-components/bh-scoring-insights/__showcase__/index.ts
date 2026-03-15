/**
 * bh-scoring-insights - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type {
  ScoringKpi,
  LevelDistribution,
  HeatmapCell,
  KnockoutStat,
  TrendPoint,
  CohortComparison,
  SkillGapSummary,
  ModelPerformance,
  TokenUsageTrend,
  ScoreDistributionBucket,
} from '../core';

export const MOCK_KPIS: ScoringKpi[] = [
  { label: 'Avg Composite Score', value: 74.8, trend: 2.6, previousValue: 72.2, unit: 'pts', description: 'Weighted average across all scoring dimensions' },
  { label: 'Pass Rate', value: 68, trend: 5.1, previousValue: 62.9, unit: '%', description: 'Percentage of candidates meeting minimum score threshold' },
  { label: 'Knockout Rate', value: 7.4, trend: -1.8, previousValue: 9.2, unit: '%', description: 'Candidates automatically disqualified by knockout rules' },
  { label: 'Calibration Delta', value: 3.2, trend: -0.8, previousValue: 4.0, unit: 'pts', description: 'Average deviation between AI and human reviewer scores' },
  { label: 'Evaluations This Period', value: 342, trend: 14, previousValue: 328, unit: 'evals', description: 'Total scorecards completed in the current reporting period' },
];

export const MOCK_DISTRIBUTION: LevelDistribution[] = [
  { level: 'Exceptional (90-100)', count: 24, colorKey: 'success' },
  { level: 'Strong (75-89)', count: 86, colorKey: 'primary' },
  { level: 'Adequate (60-74)', count: 142, colorKey: 'warning' },
  { level: 'Below (40-59)', count: 68, colorKey: 'error' },
  { level: 'Poor (0-39)', count: 22, colorKey: 'secondary' },
];

export const MOCK_HEATMAP: HeatmapCell[] = [
  { dimension: 'Technical Skills', job: 'Sr. Engineer', avgScore: 82 },
  { dimension: 'Technical Skills', job: 'Product Manager', avgScore: 65 },
  { dimension: 'Technical Skills', job: 'Data Analyst', avgScore: 78 },
  { dimension: 'Technical Skills', job: 'UX Designer', avgScore: 58 },
  { dimension: 'Communication', job: 'Sr. Engineer', avgScore: 71 },
  { dimension: 'Communication', job: 'Product Manager', avgScore: 88 },
  { dimension: 'Communication', job: 'Data Analyst', avgScore: 74 },
  { dimension: 'Communication', job: 'UX Designer', avgScore: 85 },
  { dimension: 'Leadership', job: 'Sr. Engineer', avgScore: 64 },
  { dimension: 'Leadership', job: 'Product Manager', avgScore: 79 },
  { dimension: 'Leadership', job: 'Data Analyst', avgScore: 55 },
  { dimension: 'Leadership', job: 'UX Designer', avgScore: 61 },
  { dimension: 'Problem Solving', job: 'Sr. Engineer', avgScore: 86 },
  { dimension: 'Problem Solving', job: 'Product Manager', avgScore: 76 },
  { dimension: 'Problem Solving', job: 'Data Analyst', avgScore: 83 },
  { dimension: 'Problem Solving', job: 'UX Designer', avgScore: 72 },
  { dimension: 'Culture Fit', job: 'Sr. Engineer', avgScore: 77 },
  { dimension: 'Culture Fit', job: 'Product Manager', avgScore: 82 },
  { dimension: 'Culture Fit', job: 'Data Analyst', avgScore: 80 },
  { dimension: 'Culture Fit', job: 'UX Designer', avgScore: 84 },
];

export const MOCK_KNOCKOUTS: KnockoutStat[] = [
  { dimension: 'Technical Skills', knockoutCount: 14, totalEvaluations: 342 },
  { dimension: 'Communication', knockoutCount: 8, totalEvaluations: 342 },
  { dimension: 'Culture Fit', knockoutCount: 6, totalEvaluations: 342 },
  { dimension: 'Problem Solving', knockoutCount: 4, totalEvaluations: 342 },
  { dimension: 'Leadership', knockoutCount: 2, totalEvaluations: 342 },
];

export const MOCK_TREND: TrendPoint[] = [
  { date: 'Week 1', value: 68 }, { date: 'Week 2', value: 70 },
  { date: 'Week 3', value: 69 }, { date: 'Week 4', value: 72 },
  { date: 'Week 5', value: 71 }, { date: 'Week 6', value: 74 },
  { date: 'Week 7', value: 73 }, { date: 'Week 8', value: 72 },
];

export const MOCK_COHORTS: CohortComparison[] = [
  { groupName: 'Referrals', avgScore: 78.4, count: 64 },
  { groupName: 'LinkedIn', avgScore: 71.2, count: 128 },
  { groupName: 'Career Site', avgScore: 69.8, count: 96 },
  { groupName: 'Agencies', avgScore: 74.1, count: 42 },
  { groupName: 'Job Boards', avgScore: 65.3, count: 112 },
];

export const MOCK_GAPS: SkillGapSummary[] = [
  { dimension: 'System Design', avgScore: 62, gapFromTarget: -13 },
  { dimension: 'Data Modeling', avgScore: 58, gapFromTarget: -17 },
  { dimension: 'API Design', avgScore: 71, gapFromTarget: -4 },
  { dimension: 'User Research', avgScore: 68, gapFromTarget: -7 },
  { dimension: 'Team Collaboration', avgScore: 82, gapFromTarget: 7 },
  { dimension: 'Strategic Thinking', avgScore: 65, gapFromTarget: -10 },
];

export const MOCK_TRENDS: TrendPoint[] = [
  { date: 'Jan', value: 68 }, { date: 'Feb', value: 70 }, { date: 'Mar', value: 69 },
  { date: 'Apr', value: 72 }, { date: 'May', value: 71 }, { date: 'Jun', value: 74 },
  { date: 'Jul', value: 73 }, { date: 'Aug', value: 76 }, { date: 'Sep', value: 75 },
  { date: 'Oct', value: 74 }, { date: 'Nov', value: 77 }, { date: 'Dec', value: 79 },
];

export const MOCK_MODEL_PERFORMANCE: ModelPerformance[] = [
  { model: 'gpt-4-turbo', avgLatencyMs: 2340, avgTokensUsed: 3850, totalScorecards: 148, avgScore: 76.2, errorRate: 0.012 },
  { model: 'claude-3.5-sonnet', avgLatencyMs: 1820, avgTokensUsed: 3200, totalScorecards: 112, avgScore: 78.1, errorRate: 0.008 },
  { model: 'gpt-4o', avgLatencyMs: 1450, avgTokensUsed: 2900, totalScorecards: 62, avgScore: 74.5, errorRate: 0.015 },
  { model: 'claude-3-opus', avgLatencyMs: 4100, avgTokensUsed: 5200, totalScorecards: 20, avgScore: 81.3, errorRate: 0.005 },
];

export const MOCK_TOKEN_USAGE_TRENDS: TokenUsageTrend[] = [
  { date: '2026-01-06', inputTokens: 142000, outputTokens: 98000, totalTokens: 240000, cost: 4.82 },
  { date: '2026-01-13', inputTokens: 158000, outputTokens: 104000, totalTokens: 262000, cost: 5.24 },
  { date: '2026-01-20', inputTokens: 136000, outputTokens: 91000, totalTokens: 227000, cost: 4.54 },
  { date: '2026-01-27', inputTokens: 171000, outputTokens: 112000, totalTokens: 283000, cost: 5.66 },
  { date: '2026-02-03', inputTokens: 164000, outputTokens: 108000, totalTokens: 272000, cost: 5.44 },
  { date: '2026-02-10', inputTokens: 189000, outputTokens: 125000, totalTokens: 314000, cost: 6.28 },
];

export const MOCK_SCORE_DISTRIBUTION_BUCKETS: ScoreDistributionBucket[] = [
  { rangeMin: 0, rangeMax: 10, count: 3, percentage: 0.9 },
  { rangeMin: 10, rangeMax: 20, count: 5, percentage: 1.5 },
  { rangeMin: 20, rangeMax: 30, count: 8, percentage: 2.3 },
  { rangeMin: 30, rangeMax: 40, count: 14, percentage: 4.1 },
  { rangeMin: 40, rangeMax: 50, count: 32, percentage: 9.4 },
  { rangeMin: 50, rangeMax: 60, count: 48, percentage: 14.0 },
  { rangeMin: 60, rangeMax: 70, count: 72, percentage: 21.1 },
  { rangeMin: 70, rangeMax: 80, count: 86, percentage: 25.1 },
  { rangeMin: 80, rangeMax: 90, count: 52, percentage: 15.2 },
  { rangeMin: 90, rangeMax: 100, count: 22, percentage: 6.4 },
];
