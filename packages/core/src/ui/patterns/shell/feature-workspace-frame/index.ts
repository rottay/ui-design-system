'use client';

import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { FeatureWorkspaceFrameProps } from './contracts';

export type {
  FeatureWorkspaceFrameProps,
  FeatureWorkspaceFrameWidth,
} from './contracts';

export const PatternFeatureWorkspaceFrame =
  createEngineComponent<FeatureWorkspaceFrameProps>(
    'PatternFeatureWorkspaceFrame',
    {
      classic: () => import('./engines/classic'),
      modern: () => import('./engines/modern'),
      rustic: () => import('./engines/rustic'),
    },
  );

export const FeatureWorkspaceFrame = PatternFeatureWorkspaceFrame;
