'use client';

import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { DecisionComparisonProps } from './contracts';

export type {
  DecisionComparisonFact,
  DecisionComparisonProps,
  DecisionComparisonSubject,
  DecisionComparisonTone,
} from './contracts';

export const PatternDecisionComparison =
  createEngineComponent<DecisionComparisonProps>('PatternDecisionComparison', {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  });

export const DecisionComparison = PatternDecisionComparison;
