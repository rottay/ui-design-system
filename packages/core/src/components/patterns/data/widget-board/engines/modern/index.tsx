'use client';
import React, { createContext, useContext, useMemo, useRef } from 'react';
import type { WidgetBoardAdaptation, WidgetBoardProps } from '../../contracts';
import { WidgetBoardEngine, type WidgetBoardModernSlots } from '../foundation';
import { createLayoutCommit } from '../../runtime/adaptive/policy';
import type { ContainerPosture } from '../../../../runtime/adaptive-layout/foundation';
import { ModernGrid } from '../../../../../primitives/layout/grid/engines/modern';
import { useAdaptation } from '@/infrastructure/runtime/adaptation';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';

/** Before the board is measured, the viewport names the posture a commit lands in. */
const VIEWPORT_CONTAINER: Record<string, ContainerPosture> = {
  phone: 'compact',
  tablet: 'regular',
  desktop: 'expanded',
};

type CatalogMinItem = NonNullable<WidgetBoardAdaptation['catalogMinItem']>;

const CatalogMinItemContext = createContext<CatalogMinItem>('md');

// One component type for every preset: a posture-driven preset change re-renders the catalog, never remounts it.
function ModernCatalogGrid({
  children,
  ...attributes
}: React.ComponentProps<NonNullable<WidgetBoardModernSlots['CatalogGrid']>>): React.ReactElement {
  const minItem = useContext(CatalogMinItemContext);
  return (
    <ModernGrid autoFit minItem={minItem} {...attributes}>
      {children}
    </ModernGrid>
  );
}

/**
 * Modern engine for the WidgetBoard pattern.
 *
 * The anatomy is the shared foundation engine (the adaptive solver, drag /
 * resize gestures and catalog composition live there, the gestures on the shared
 * DnD kernel for Modern); the `ds-engine-modern`
 * scope class mirrors the family idiom so modern-only remediation can layer
 * over the shared presentation skin without touching classic/rustic paint.
 * Modern also slots in the auto-fit catalog Grid and the root's measured posture.
 */
export default function ModernWidgetBoard(props: WidgetBoardProps): React.ReactElement {
  const { className, adapt, catalogMinItem = 'md', onItemsChange, onLayoutChange, labels, ...rest } = props;
  // Caller labels outrank the catalog; without a provider the shared English floor stays.
  const translate = useOptionalTranslation('components')?.t;
  const catalogLabels = useMemo<WidgetBoardProps['labels']>(
    () =>
      translate
        ? {
            ...labels,
            catalogSearchPlaceholder: labels.catalogSearchPlaceholder ?? translate('widgetBoard.catalog_search'),
            catalogNoResults: labels.catalogNoResults ?? translate('widgetBoard.catalog_no_results'),
          }
        : labels,
    [labels, translate],
  );
  const rootRef = useRef<HTMLElement | null>(null);
  const base = useMemo<WidgetBoardAdaptation>(() => ({ catalogMinItem }), [catalogMinItem]);
  const { adaptation, posture, postureAttribute } = useAdaptation<WidgetBoardAdaptation>(adapt, {
    base,
    containerRef: rootRef,
  });
  const postureRef = useRef<ContainerPosture>('expanded');
  postureRef.current = posture.container ?? VIEWPORT_CONTAINER[posture.viewport] ?? 'expanded';
  const commitItems = useMemo(
    () => createLayoutCommit(onItemsChange, onLayoutChange, () => postureRef.current),
    [onItemsChange, onLayoutChange],
  );
  const modernSlots = useMemo<WidgetBoardModernSlots>(
    () => ({ CatalogGrid: ModernCatalogGrid, rootRef, rootPosture: postureAttribute, kernelGestures: true, adaptiveCells: true }),
    [postureAttribute],
  );
  return (
    <CatalogMinItemContext.Provider value={adaptation.catalogMinItem ?? catalogMinItem}>
      <WidgetBoardEngine
        {...rest}
        labels={catalogLabels}
        onItemsChange={commitItems}
        className={['ds-engine-modern', className].filter(Boolean).join(' ')}
        modernSlots={modernSlots}
      />
    </CatalogMinItemContext.Provider>
  );
}
