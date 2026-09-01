import { expect, it } from 'vitest';
import React from 'react';
import { waitFor } from '@testing-library/react';

import type { ColumnDef } from '../../../../../../../foundation/contracts/runtime/components/patterns/core';
import {
  ResponsiveContext,
  type ResponsiveContextValue,
} from '../../../../../../../infrastructure/runtime/responsive';
import type { AdaptiveConfig } from '../../../../../foundation/contracts/adaptive';
import { renderSurface } from '../../../../../foundation/common/test-utils';
import { CollectionWorkspaceSurface } from '../index';

interface TestRecord {
  id: string;
  name: string;
}

const DATA: TestRecord[] = [
  { id: 'one', name: 'One' },
  { id: 'two', name: 'Two' },
];

const COLUMNS: ColumnDef<TestRecord>[] = [
  { key: 'name', header: 'Name', accessorKey: 'name' },
];

const PHONE_CONTEXT: ResponsiveContextValue = {
  deviceClass: 'phone',
  activeBreakpoint: 'xs',
  isPhone: true,
  isTablet: false,
  isDesktop: false,
  pointer: 'coarse',
  orientation: 'portrait',
  prefersReducedMotion: false,
  isPhoneOrTablet: true,
  isTabletOrDesktop: false,
  isTouchDevice: true,
};

const TABLET_CONTEXT: ResponsiveContextValue = {
  ...PHONE_CONTEXT,
  deviceClass: 'tablet',
  activeBreakpoint: 'md',
  isPhone: false,
  isTablet: true,
  isDesktop: false,
  isTabletOrDesktop: true,
};

const DESKTOP_CONTEXT: ResponsiveContextValue = {
  ...PHONE_CONTEXT,
  deviceClass: 'desktop',
  activeBreakpoint: 'lg',
  isPhone: false,
  isDesktop: true,
  pointer: 'fine',
  isPhoneOrTablet: false,
  isTabletOrDesktop: true,
  isTouchDevice: false,
};

function renderAdaptiveWorkspace(
  context: ResponsiveContextValue,
  adaptive: AdaptiveConfig,
  cardsColumns: number | 'auto' = 'auto',
) {
  return renderSurface(
    <ResponsiveContext.Provider value={context}>
      <CollectionWorkspaceSurface<TestRecord>
        title="Adaptive records"
        data={DATA}
        columns={COLUMNS}
        rowKey="id"
        defaultViewMode="table"
        adaptive={adaptive}
        viewModes={{
          cards: {
            columns: cardsColumns,
            renderCard: (record) => <span>{record.name}</span>,
          },
        }}
      />
    </ResponsiveContext.Provider>,
  );
}

async function cardDispatch(container: HTMLElement): Promise<HTMLElement> {
  return waitFor(() => {
    const dispatch = container.querySelector<HTMLElement>(
      '.ds-collection-render-dispatch[data-view-mode="cards"]',
    );
    if (!dispatch) throw new Error('Expected cards render dispatch');
    return dispatch;
  });
}

it('uses two tablet and one phone column from adaptive card posture', async () => {
  const adaptive = {
    desktop: { collection: 'table' as const },
    tablet: { collection: 'cards' as const, gridColumns: 2 },
    phone: { gridColumns: 1 },
  };

  const tablet = renderAdaptiveWorkspace(TABLET_CONTEXT, adaptive);
  expect((await cardDispatch(tablet.container)).style.gridTemplateColumns).toBe(
    'repeat(2, minmax(0, 1fr))',
  );
  tablet.unmount();

  const phone = renderAdaptiveWorkspace(PHONE_CONTEXT, adaptive);
  expect((await cardDispatch(phone.container)).style.gridTemplateColumns).toBe(
    'repeat(1, minmax(0, 1fr))',
  );
});

it('does not apply the posture column override to desktop table rendering', async () => {
  const { container } = renderAdaptiveWorkspace(DESKTOP_CONTEXT, {
    desktop: { collection: 'table', gridColumns: 6 },
  });

  await waitFor(() => {
    expect(
      container.querySelector('.ds-collection-workspace[data-view-mode="table"]'),
    ).not.toBeNull();
  });
  expect(
    container.querySelector('.ds-collection-render-dispatch[data-view-mode="cards"]'),
  ).toBeNull();
});

it('preserves the cards auto-column fallback when posture columns are absent', async () => {
  const { container } = renderAdaptiveWorkspace(PHONE_CONTEXT, {
    phone: { collection: 'cards' },
  });

  expect((await cardDispatch(container)).style.gridTemplateColumns).toBe(
    'repeat(auto-fill, minmax(var(--ds-listing-grid-min-card-width, 280px), 1fr))',
  );
});
