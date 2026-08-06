import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { fireEvent, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Transfer as ModernTransfer } from '../engines/modern';
import type { TransferItem } from '../contracts';
import { renderWithEngine } from '../../../../../tooling/testing/helpers/engine';

const dataSource: TransferItem[] = [
  { key: 'alpha', title: 'Alpha' },
  { key: 'beta', title: 'Beta' },
  { key: 'gamma', title: 'Gamma' },
];

function filterOption(input: string, item: TransferItem) {
  return item.title.toLowerCase().includes(input.toLowerCase());
}

function sourcePanel(container: HTMLElement): HTMLElement {
  const panel = container.querySelector('[data-part="panel"][data-panel="source"]');
  if (!(panel instanceof HTMLElement)) throw new Error('Expected modern source panel');
  return panel;
}

describe('Transfer modern - select-all scope under search', () => {
  it('keeps selections made outside the active search filter when select-all is used', () => {
    const handleSelectChange = vi.fn();

    const { container } = renderWithEngine(
      <ModernTransfer
        dataSource={dataSource}
        showSearch
        filterOption={filterOption}
        onSelectChange={handleSelectChange}
        titles={['Available', 'Selected']}
      />,
      { engine: 'modern' },
    );

    const panel = sourcePanel(container);

    // Select Alpha with no filter applied.
    fireEvent.click(within(panel).getByRole('checkbox', { name: 'Alpha' }));
    expect(handleSelectChange).toHaveBeenLastCalledWith(['alpha'], []);

    // Narrow the panel to Beta only, then use select-all.
    const search = within(panel).getByPlaceholderText('Search');
    fireEvent.change(search, { target: { value: 'beta' } });

    const selectAll = within(panel).getByRole('checkbox', { name: 'Select all' });
    fireEvent.click(selectAll);

    const [sourceSelection] = handleSelectChange.mock.calls[handleSelectChange.mock.calls.length - 1] as [string[], string[]];
    expect([...sourceSelection].sort()).toEqual(['alpha', 'beta']);
  });

  it('clearing select-all under a filter only deselects the visible rows', () => {
    const handleSelectChange = vi.fn();

    const { container } = renderWithEngine(
      <ModernTransfer
        dataSource={dataSource}
        showSearch
        filterOption={filterOption}
        onSelectChange={handleSelectChange}
        titles={['Available', 'Selected']}
      />,
      { engine: 'modern' },
    );

    const panel = sourcePanel(container);

    fireEvent.click(within(panel).getByRole('checkbox', { name: 'Alpha' }));
    fireEvent.click(within(panel).getByRole('checkbox', { name: 'Beta' }));

    const search = within(panel).getByPlaceholderText('Search');
    fireEvent.change(search, { target: { value: 'beta' } });

    // Beta is the only visible row and is already selected -> select-all clears it.
    fireEvent.click(within(panel).getByRole('checkbox', { name: 'Select all' }));

    const [sourceSelection] = handleSelectChange.mock.calls[handleSelectChange.mock.calls.length - 1] as [string[], string[]];
    expect(sourceSelection).toEqual(['alpha']);
  });
});

describe('Modern Transfer narrow-viewport containment', () => {
  it('sizes the root as shrinkable panel tracks so two panels fit a 390px viewport', () => {
    const SKIN = readFileSync(
      join(
        dirname(fileURLToPath(import.meta.url)),
        '../../../../../foundation/tokens/css/runtime/engines/modern/skin/transfer.css'
      ),
      'utf8'
    ).replace(/\/\*[\s\S]*?\*\//g, '');

    const root = SKIN.match(/\[data-part='root'\]\s*\{[^}]*\}/)?.[0] ?? '';
    expect(root).toContain('display: grid');
    expect(root).toContain('grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr)');
    expect(root).toContain('inline-size: fit-content');
    expect(root).toContain('max-inline-size: 100%');
    expect(root).not.toContain('display: flex');

    const panel = SKIN.match(/\[data-part='panel'\]\s*\{[^}]*\}/)?.[0] ?? '';
    expect(panel).toContain('inline-size: var(--ds-transfer-list-width, 200px)');
    expect(panel).toContain('min-inline-size: 0');
    // desktop keeps the tenant width; 100% is what lets it shrink when narrow
    expect(panel).toContain('max-inline-size: 100%');
  });
});
