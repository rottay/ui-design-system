'use client';
import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { DecisionPanoramaProps } from './contracts';
export type { DecisionPanoramaFact, DecisionPanoramaProps } from './contracts';
export const PatternDecisionPanorama = createEngineComponent<DecisionPanoramaProps>(
  'PatternDecisionPanorama',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
export const DecisionPanorama = PatternDecisionPanorama;
