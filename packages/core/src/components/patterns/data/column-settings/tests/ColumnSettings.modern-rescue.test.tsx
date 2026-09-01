import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernColumnSettingsDropdown from '../engines/modern';
import type { ColumnSettingsProps } from '../contracts';

function buildProps(overrides: Partial<ColumnSettingsProps> = {}): ColumnSettingsProps {
  return {
    allColumns: [
      { key: 'name', header: 'Name' },
      { key: 'status', header: 'Status' },
      { key: 'owner', header: 'Owner' },
    ],
    visibleColumns: ['name', 'status'],
    lockedColumns: ['name'],
    columnOrder: ['name', 'status', 'owner'],
    pinnedColumns: { left: [], right: [] },
    onToggleVisibility: vi.fn(),
    onReorder: vi.fn(),
    onTogglePin: vi.fn(),
    onReset: vi.fn(),
    ...overrides,
  };
}

describe('ColumnSettings modern — rescue drills', () => {
  it('exposes each row rank to assistive technology', async () => {
    const { container, findAllByRole } = render(
      <ModernColumnSettingsDropdown {...buildProps()} />,
    );
    await findAllByRole('listitem');

    const rows = Array.from(container.querySelectorAll('[data-part="row"]'));
    expect(rows).toHaveLength(3);

    // Before: the reorderable list carried no position information at all.
    rows.forEach((row, index) => {
      expect(row).toHaveAttribute('aria-posinset', String(index + 1));
      expect(row).toHaveAttribute('aria-setsize', '3');
    });
  });
});
