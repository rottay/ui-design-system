'use client';
import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { RecordFactsProps } from './contracts';

export type {
  RecordFact,
  RecordFactEmphasis,
  RecordFactSpan,
  RecordFactState,
  RecordFactsProps,
} from './contracts';

export const PatternRecordFacts = createEngineComponent<RecordFactsProps>(
  'PatternRecordFacts',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  },
);

export const RecordFacts = PatternRecordFacts;
