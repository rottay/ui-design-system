'use client';
import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { WidgetBoardProps } from './contracts';
export type {
  WidgetBoardItem,
  WidgetBoardCatalogEntry,
  WidgetBoardLabels,
  WidgetBoardProps,
  WidgetBoardSize,
} from './contracts';
export const PatternWidgetBoard = createEngineComponent<WidgetBoardProps>(
  'PatternWidgetBoard',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
export const WidgetBoard = PatternWidgetBoard;
