/**
 * @fileoverview The widget-board kernel Chromium scene: the Modern board on the shared DnD
 * kernel beside the foundation engine with no Modern pieces (the frozen engines' path), both
 * under the source DS stylesheet and the bithire tenant artifact. Emissions are published on
 * `window.__board` for the runner.
 */
import React, { Suspense, useState } from 'react';

import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import { getKnownTenantConfig } from '@/infrastructure/runtime/tenant/foundation/configuration/registry';

import type { WidgetBoardItem, WidgetBoardLabels } from '../../../contracts';
import ModernWidgetBoard from '../../../engines/modern';
import { WidgetBoardEngine } from '../../../engines/foundation';

const labels: WidgetBoardLabels = {
  customize: 'Customize',
  done: 'Done',
  addWidget: 'Add widget',
  reset: 'Reset',
  emptyCatalog: 'Empty',
  editHint: 'Editing',
  readHint: 'Reading',
  move: 'Move',
  resize: 'Resize',
  resizeWidth: 'Resize width',
  resizeHeight: 'Resize height',
  autoHeight: 'Automatic height',
  remove: 'Remove',
};

const item = (id: string, order: number, extra: Partial<WidgetBoardItem> = {}): WidgetBoardItem => ({
  id,
  size: 'md',
  order,
  visible: true,
  title: id,
  accessibleTitle: id,
  content: <span>{id}</span>,
  ...extra,
});

const ITEMS: WidgetBoardItem[] = [
  item('a', 0),
  item('b', 1),
  item('c', 2),
  item('d', 3, { size: 'sm' }),
  item('hidden', 4, { visible: false, catalog: { description: 'catalog entry' } }),
];

const ADAPTIVE_ITEMS: WidgetBoardItem[] = [
  item('pipeline', 0, {
    title: 'Pipeline',
    accessibleTitle: 'Pipeline',
    content: <span data-testid="view-content">Pipeline overview</span>,
    views: {
      number: <p data-testid="view-number">42 open roles</p>,
      chart: (
        <svg data-testid="view-chart" role="img" aria-label="Pipeline trend" width="240" height="64" viewBox="0 0 240 64">
          <path d="M0 60 L60 40 L120 44 L180 16 L240 8" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      ),
    },
    adapt: { compact: { view: 'number' }, expanded: { view: 'chart' } },
  }),
  item('b', 1),
  item('c', 2),
];

export interface BoardRecord {
  itemsChanges: string[][];
  sizes: Record<string, string>[];
  layoutChanges: number;
}

const record: BoardRecord = { itemsChanges: [], sizes: [], layoutChanges: 0 };

declare global {
  interface Window {
    __board?: BoardRecord;
    __setBoardWidth?: (width: number) => void;
    __appReorder?: () => void;
  }
}

const order = (next: WidgetBoardItem[]) =>
  next.filter((entry) => entry.visible).sort((x, y) => x.order - y.order).map((entry) => entry.id);

export function KernelBoardScene({ catalog, adaptive = false }: { catalog: boolean; adaptive?: boolean }): React.JSX.Element {
  const [items, setItems] = useState(adaptive ? ADAPTIVE_ITEMS : ITEMS);
  const [width, setWidth] = useState(1100);
  window.__board = record;
  window.__setBoardWidth = setWidth;
  // The owner hands the board a new array with the first and third widgets swapped.
  window.__appReorder = () =>
    setItems((current) => {
      const ranked = [...current].sort((x, y) => x.order - y.order);
      const [first, , third] = ranked;
      return current.map((entry) =>
        entry.id === first.id ? { ...entry, order: third.order } : entry.id === third.id ? { ...entry, order: first.order } : entry
      );
    });
  return (
    <DesignSystemProvider
      tenantConfig={getKnownTenantConfig('bithire')}
      forceEngine="modern"
      forceTheme="light"
      locale="en"
      skipCssLoading
    >
      <Suspense fallback={null}>
        <div data-scene="modern" style={{ width, padding: 16 }}>
          <ModernWidgetBoard
            labels={labels}
            items={items}
            editable
            defaultEditing
            defaultCatalogOpen={catalog}
            onItemsChange={(next) => {
              record.itemsChanges.push(order(next));
              record.sizes.push(Object.fromEntries(next.map((entry) => [entry.id, entry.size])));
              setItems(next);
            }}
            onLayoutChange={() => {
              record.layoutChanges += 1;
            }}
          />
        </div>
        {catalog || adaptive ? null : (
          <div data-scene="frozen" style={{ width: 1100, padding: 16 }}>
            <WidgetBoardEngine labels={labels} items={ITEMS} editable defaultEditing />
          </div>
        )}
      </Suspense>
    </DesignSystemProvider>
  );
}
