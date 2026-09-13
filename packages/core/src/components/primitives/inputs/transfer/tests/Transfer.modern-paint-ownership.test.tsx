import React from 'react';

import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Transfer as ModernTransfer } from '../engines/modern';
import type { TransferItem } from '../contracts';
import { renderWithEngine } from '@tests/support/engine';

// The transfer DOM carries anatomy and the public style/listStyle hatches only; paint is
// the skin's, proven in a real browser by Transfer.causality.integration.test.tsx.

const FOUR_ITEMS: TransferItem[] = [
  { key: 'alpha', title: 'Alpha' },
  { key: 'beta', title: 'Beta' },
  { key: 'delta', title: 'Delta' },
  { key: 'echo', title: 'Echo' },
];

describe('Transfer modern -- pagination coverage (was rustic-only)', () => {
  it('pages the source panel, keeps page count in sync, and resets on search', () => {
    renderWithEngine(
      <ModernTransfer
        dataSource={FOUR_ITEMS}
        defaultTargetKeys={['delta', 'echo']}
        showSearch
        pagination={{ pageSize: 1 }}
        onChange={vi.fn()}
      />,
      'modern'
    );

    // Source panel shows one item per page: Alpha, then Beta on page 2.
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.queryByText('Beta')).not.toBeInTheDocument();

    const sourcePagination = screen.getAllByText('1 / 2')[0];
    const paginationCell = sourcePagination.closest('[data-part="panel-pagination"]') as HTMLElement;
    expect(paginationCell).not.toBeNull();
    const [prev, next] = Array.from(paginationCell.querySelectorAll('[data-part="pagination-button"]'));
    expect(prev).toBeDisabled();
    fireEvent.click(next);
    expect(screen.getByText('Beta')).toBeInTheDocument();
    expect(screen.getByText('2 / 2')).toBeInTheDocument();
    fireEvent.click(prev);
    expect(screen.getByText('Alpha')).toBeInTheDocument();

    // Searching resets the source panel to a single page (its pagination
    // disappears); the untouched target panel keeps its own page count.
    const search = screen.getAllByPlaceholderText('Search')[0];
    fireEvent.change(search, { target: { value: 'alp' } });
    expect(screen.getAllByText(/\d+ \/ \d+/)).toHaveLength(1);
    expect(screen.getByText('Alpha')).toBeInTheDocument();
  });
});

describe('Transfer modern -- geometry lives in the skin, hooks in the DOM', () => {
  it('no part carries inline styles; only the public style/listStyle channels remain inline', () => {
    const { container } = renderWithEngine(
      <ModernTransfer
        dataSource={FOUR_ITEMS}
        defaultTargetKeys={['delta']}
        showSearch
        pagination={{ pageSize: 1 }}
        style={{ marginBlockStart: 12 }}
        listStyle={{ inlineSize: 280 }}
        onChange={vi.fn()}
      />,
      'modern'
    );

    const root = container.querySelector('[data-part="root"]') as HTMLElement;
    expect(root.style.marginBlockStart).toBe('12px');

    const panel = container.querySelector('[data-part="panel"]') as HTMLElement;
    // listStyle is the documented public override hatch and wins over the skin.
    expect(panel.style.inlineSize).toBe('280px');
    expect(panel.style.width).toBe('');

    for (const part of [
      'panel-header',
      'panel-select-all',
      'panel-title',
      'panel-count',
      'panel-search',
      'panel-list',
      'panel-item',
      'panel-item-checkbox',
      'panel-pagination',
      'pagination-button',
      'operations',
      'move-button',
    ]) {
      const el = container.querySelector(`[data-part="${part}"]`) as HTMLElement | null;
      expect(el, `${part} rendered`).not.toBeNull();
      expect(el!.getAttribute('style'), `${part} inline style`).toBeNull();
    }

    // The ul reset moved to the skin as well.
    const list = container.querySelector('[data-part="panel-list"] > ul') as HTMLElement;
    expect(list.getAttribute('style')).toBeNull();
  });

  it('stamps the new panel-title part with a logical skin margin (the ml-2 RTL fix)', () => {
    const { container } = renderWithEngine(
      <ModernTransfer dataSource={FOUR_ITEMS} titles={['Available', 'Chosen']} onChange={vi.fn()} />,
      'modern'
    );
    const title = container.querySelector('[data-part="panel-title"]') as HTMLElement;
    expect(title).toHaveTextContent('Available');
    expect(title.className).toBe('');
  });

  it('select-all checkboxes carry an accessible name in both panels (axe label/critical regression)', () => {
    const { container } = renderWithEngine(
      <ModernTransfer dataSource={FOUR_ITEMS} defaultTargetKeys={['delta']} onChange={vi.fn()} />,
      'modern'
    );
    const selectAlls = container.querySelectorAll('[data-part="panel-select-all"]');
    expect(selectAlls).toHaveLength(2);
    // The existing transfer.select_all catalog key (en catalog: "Select all").
    for (const input of Array.from(selectAlls)) {
      expect(input).toHaveAttribute('aria-label', 'Select all');
    }
  });

  it('uses the governed auto-mirroring icon role in RTL without mirroring whole buttons', () => {
    const { container } = renderWithEngine(
      <ModernTransfer
        dataSource={FOUR_ITEMS}
        defaultTargetKeys={['delta', 'echo']}
        pagination={{ pageSize: 1 }}
        onChange={vi.fn()}
      />,
      'modern'
    );

    const paginationIcons = container.querySelectorAll(
      '[data-part="pagination-button"] [data-icon-mirrored="auto"]'
    );
    expect(paginationIcons).toHaveLength(4);
  });

  it('disabled move buttons read the posture in the DOM (engine contract)', () => {
    const { container } = renderWithEngine(
      <ModernTransfer
        dataSource={FOUR_ITEMS}
        defaultTargetKeys={['delta', 'echo']}
        pagination={{ pageSize: 1 }}
        showSearch
        disabled
        onChange={vi.fn()}
      />,
      'modern'
    );
    // The global posture reaches every interactive region, not only the move
    // buttons. Paint remains skin-owned.
    expect(container.querySelector('[data-part="root"]')).toHaveAttribute('data-disabled', 'true');
    for (const row of Array.from(container.querySelectorAll('[data-part="panel-item"]'))) {
      expect(row).toHaveAttribute('data-disabled', 'true');
    }
    for (const search of Array.from(container.querySelectorAll('[data-part="panel-search"]'))) {
      expect(search).toBeDisabled();
    }
    for (const pagination of Array.from(container.querySelectorAll('[data-part="pagination-button"]'))) {
      expect(pagination).toBeDisabled();
    }

    const buttons = screen.getAllByRole('button').filter((b) =>
      b.hasAttribute('data-part') && b.getAttribute('data-part') === 'move-button'
    );
    expect(buttons).toHaveLength(2);
    for (const button of buttons) {
      expect(button).toBeDisabled();
      expect(button.getAttribute('style')).toBeNull();
    }
  });
});
