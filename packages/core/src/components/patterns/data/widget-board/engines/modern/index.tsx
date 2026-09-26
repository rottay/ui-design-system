'use client';
import React, { useMemo, useRef } from 'react';
import type { WidgetBoardAdaptation, WidgetBoardProps } from '../../contracts';
import { WidgetBoardEngine, type WidgetBoardModernSlots } from '../foundation';
import { ModernGrid } from '../../../../../primitives/layout/grid/engines/modern';
import { useAdaptation } from '@/infrastructure/runtime/adaptation';

/**
 * Modern engine for the WidgetBoard pattern.
 *
 * The anatomy is the shared foundation engine (the adaptive solver, drag /
 * resize gestures and catalog composition live there); the `ds-engine-modern`
 * scope class mirrors the family idiom so modern-only remediation can layer
 * over the shared presentation skin without touching classic/rustic paint.
 * Modern also slots in the auto-fit catalog Grid and the root's measured posture.
 */
export default function ModernWidgetBoard(props: WidgetBoardProps): React.ReactElement {
  const { className, adapt, catalogMinItem = 'md', ...rest } = props;
  const rootRef = useRef<HTMLElement | null>(null);
  const base = useMemo<WidgetBoardAdaptation>(() => ({ catalogMinItem }), [catalogMinItem]);
  const { adaptation, postureAttribute } = useAdaptation<WidgetBoardAdaptation>(adapt, {
    base,
    containerRef: rootRef,
  });
  const minItem = adaptation.catalogMinItem;
  // The catalog's identity follows its preset only, so a resize never remounts it.
  const CatalogGrid = useMemo<NonNullable<WidgetBoardModernSlots['CatalogGrid']>>(
    () =>
      function CatalogGrid({ children, ...attributes }) {
        return (
          <ModernGrid autoFit minItem={minItem} {...attributes}>
            {children}
          </ModernGrid>
        );
      },
    [minItem],
  );
  const modernSlots = useMemo<WidgetBoardModernSlots>(
    () => ({ CatalogGrid, rootRef, rootPosture: postureAttribute }),
    [CatalogGrid, postureAttribute],
  );
  return (
    <WidgetBoardEngine
      {...rest}
      className={['ds-engine-modern', className].filter(Boolean).join(' ')}
      modernSlots={modernSlots}
    />
  );
}
