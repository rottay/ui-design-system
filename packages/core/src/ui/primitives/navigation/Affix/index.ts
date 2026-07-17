'use client';

/** Public Affix facade. */
import { createEngineComponent } from '@/infrastructure/runtime/engines/presentation/component-factory';
import type { AffixProps } from './contracts';

export type { AffixProps, AffixState } from './contracts';
export { AFFIX_DEFAULTS } from './contracts';
export { BaseAffix } from './runtime/rendering';

/** Sticky positioning primitive resolved through the active engine. */
export const Affix = createEngineComponent<AffixProps>('Affix', {
  classic: () => import('./engines/classic'),
  modern: () => import('./engines/modern'),
  rustic: () => import('./engines/rustic'),
});
