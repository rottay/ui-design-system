import React from 'react';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Transfer as ModernTransfer } from '../engines/modern';
import type { TransferItem } from '../contracts';
import { renderWithEngine } from '../../../../../tooling/testing/helpers/engine';

// ---------------------------------------------------------------------------
// K4-D Pass 1 -- modern Transfer paint-ownership ratchet + modern pagination
// coverage (the interaction coverage for pagination was rustic-only).
//
// Every static geometry channel (panel inline-size, checkbox boxes, search
// padding/font, list max-block-size + ul reset, item flex/disabled posture,
// pagination + move-button sizing, root/operations flex) moved out of inline
// styles and Tailwind utilities into `modern/skin/transfer.css`, keyed on
// data-part hooks. The panel title is a NEW data-part (panel-title) whose
// margin is LOGICAL (the drained `ml-2` was an RTL hazard), and the physical
// pagination glyphs mirror under [dir='rtl']. Inline is reserved for the
// public `style`/`listStyle` channels.
// ---------------------------------------------------------------------------

const SKIN = readFileSync(
  join(
    dirname(fileURLToPath(import.meta.url)),
    '../../../../../foundation/tokens/css/runtime/engines/modern/skin/transfer.css'
  ),
  'utf8'
);

/** Comment-stripped copy -- negative pins must not match prose in the header. */
const SKIN_NC = SKIN.replace(/\/\*[\s\S]*?\*\//g, '');

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
    expect(/\[data-part='panel-title'\]\s*\{[^}]*margin-inline-start:\s*var\(--ds-spacing-2,\s*8px\)/.test(SKIN)).toBe(true);
    expect(/margin-left|ml-2/.test(SKIN_NC)).toBe(false);
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

  it('skin pins: panel/list/search geometry channels drained from inline + utilities', () => {
    expect(/\[data-part='panel'\]\s*\{[^}]*inline-size:\s*var\(--ds-transfer-list-width,\s*200px\)/.test(SKIN)).toBe(true);
    expect(/\[data-part='panel'\]\s*\{[^}]*border-radius:\s*var\(--ds-radius-lg\)/.test(SKIN)).toBe(true);
    expect(/\[data-part='panel-list'\]\s*\{[^}]*max-block-size:\s*var\(--ds-transfer-list-max-height,\s*240px\)/.test(SKIN)).toBe(true);
    expect(/\[data-part='panel-list'\] > ul\s*\{[^}]*list-style:\s*none/.test(SKIN)).toBe(true);
    expect(/\[data-part='panel-search'\]\s*\{[^}]*padding:\s*4px var\(--ds-input-sm-padding-x,\s*10px\)/.test(SKIN)).toBe(true);
    expect(/\[data-part='panel-search'\]\s*\{[^}]*font-size:\s*var\(--ds-input-sm-font-size,\s*13px\)/.test(SKIN)).toBe(true);
  });

  it('skin pins: item disabled posture + checkbox boxes + move/pagination sizing', () => {
    expect(/\[data-part='panel-item'\]\[data-disabled='true'\]\s*\{[^}]*opacity:\s*0\.5/.test(SKIN)).toBe(true);
    expect(/\[data-part='panel-item'\]\[data-disabled='true'\]\s*\{[^}]*cursor:\s*not-allowed/.test(SKIN)).toBe(true);
    // Checkbox chrome is owned by the composed Checkbox primitive; Transfer
    // only owns its wrappers' layout.
    expect(/\[data-part='panel-item-checkbox'\]\s*\{[^}]*display:\s*inline-flex/.test(SKIN)).toBe(true);
    expect(/\[data-part='panel-select-all'\]\s*\{[^}]*display:\s*inline-flex/.test(SKIN)).toBe(true);
    expect(/\[data-part='panel-item-checkbox'\]\s*\{[^}]*inline-size:\s*16px/.test(SKIN)).toBe(false);
    expect(/\[data-part='move-button'\]\s*\{[^}]*inline-size:\s*var\(--ds-input-sm-height,\s*32px\)/.test(SKIN)).toBe(true);
    expect(/\[data-part='pagination-button'\]\s*\{[^}]*block-size:\s*24px/.test(SKIN)).toBe(true);
  });

  it('skin pins: the physical pagination glyphs mirror under [dir=rtl]', () => {
    expect(/\[dir='rtl'\] \.rottay-transfer\.rottay-transfer--modern \[data-part='pagination-button'\]\s*\{[^}]*transform:\s*scaleX\(-1\)/.test(SKIN)).toBe(true);
  });

  it('skin pins: search surface reads the certified --ds-input-bg channel, never the generic bg-input (TMM near-black class)', () => {
    expect(/background:\s*var\(--ds-transfer-search-bg,\s*var\(--ds-input-bg,\s*var\(--ds-surface-control\)\)\)/.test(SKIN_NC)).toBe(true);
    expect(SKIN_NC).not.toContain('var(--ds-color-bg-input');
  });

  it('skin pins: coarse-pointer 44px floor on search + move + pagination buttons (mobile chromium regression)', () => {
    const coarse = SKIN_NC.match(/@media \(pointer: coarse\)\s*\{\n([\s\S]*?)\n\}/);
    expect(coarse, 'coarse media block present').not.toBeNull();
    const body = coarse![1];
    expect(/\[data-part='panel-search'\]\s*\{[^}]*min-block-size:\s*var\(--ds-input-touch-target-min,\s*44px\)/.test(body)).toBe(true);
    expect(/\[data-part='move-button'\]\s*\{[^}]*min-inline-size:\s*var\(--ds-input-touch-target-min,\s*44px\)/.test(body)).toBe(true);
    expect(/\[data-part='move-button'\]\s*\{[^}]*min-block-size:\s*var\(--ds-input-touch-target-min,\s*44px\)/.test(body)).toBe(true);
    expect(/\[data-part='pagination-button'\]\s*\{[^}]*min-inline-size:\s*var\(--ds-input-touch-target-min,\s*44px\)/.test(body)).toBe(true);
    expect(/\[data-part='pagination-button'\]\s*\{[^}]*min-block-size:\s*var\(--ds-input-touch-target-min,\s*44px\)/.test(body)).toBe(true);
  });

  it('skin pins: move + pagination buttons repaint on hover with the certified ghost grammar (flagship interactive-states regression)', () => {
    // The WO-SKIN-02 migration documented the absence ("none is invented
    // here"); the premium interaction bar now requires a visible repaint.
    // Channel chain: family escape hatch -> certified Button ghost hover
    // (tenant brand tint over its control surface) -> surface-inset floor.
    expect(
      /\[data-part='move-button'\]:not\(:disabled\):hover,\s*\.rottay-transfer\.rottay-transfer--modern \[data-part='pagination-button'\]:not\(:disabled\):hover\s*\{[^}]*background:\s*var\(--ds-transfer-button-bg-hover,\s*var\(--ds-button-ghost-bg-hover,\s*var\(--ds-surface-inset\)\)\)/.test(SKIN_NC)
    ).toBe(true);
    // Motion honoured on both buttons with the standard guard.
    const rm = SKIN_NC.match(/@media \(prefers-reduced-motion: reduce\)\s*\{\n([\s\S]*?)\n\}/);
    expect(rm, 'reduced-motion block present').not.toBeNull();
    expect(/move-button/.test(rm![1])).toBe(true);
    expect(/pagination-button/.test(rm![1])).toBe(true);
    expect(/transition-duration:\s*0\.01ms/.test(rm![1])).toBe(true);
  });

  it('skin pins: disabled posture on move + pagination buttons uses the canonical Button channels (Pass-2 adjudication)', () => {
    expect(
      /\[data-part='move-button'\]:disabled,\s*\n\.rottay-transfer\.rottay-transfer--modern \[data-part='pagination-button'\]:disabled\s*\{[^}]*cursor:\s*var\(--ds-transfer-button-disabled-cursor,\s*var\(--ds-button-disabled-cursor,\s*not-allowed\)\)/.test(SKIN_NC)
    ).toBe(true);
    expect(
      /\[data-part='pagination-button'\]:disabled\s*\{[^}]*opacity:\s*var\(--ds-transfer-button-disabled-opacity,\s*var\(--ds-button-disabled-opacity,\s*0\.6\)\)/.test(SKIN_NC)
    ).toBe(true);
    // The native checkboxes get the cursor correction (no double-dim: the
    // item row owns the opacity posture).
    expect(
      /\[data-part='panel-item-checkbox'\]:disabled\s*\{[^}]*cursor:\s*var\(--ds-transfer-button-disabled-cursor,/.test(SKIN_NC)
    ).toBe(true);
  });

  it('skin pins: Pass-2 craft -- panels shrink on mobile, rows repaint on hover, long words wrap, placeholder governed', () => {
    // Mobile law: the 200px panel width is a ceiling, not a floor.
    expect(/\[data-part='panel'\]\s*\{[^}]*min-inline-size:\s*0/.test(SKIN_NC)).toBe(true);
    // Row hover on the ghost-row grammar, gated off disabled items.
    expect(
      /\[data-part='panel-item'\]:not\(\[data-disabled='true'\]\):not\(\[data-selected='true'\]\):hover\s*\{[^}]*background:\s*var\(--ds-transfer-item-bg-hover,\s*var\(--ds-surface-inset\)\)/.test(SKIN_NC)
    ).toBe(true);
    expect(/\[data-part='panel-item'\]\s*\{[^}]*border-radius:\s*var\(--ds-transfer-item-radius,\s*var\(--ds-radius-md\)\)/.test(SKIN_NC)).toBe(true);
    // Unbroken words wrap word-first in item text and panel titles, and the
    // header wraps whole lines before letting a title break mid-word against
    // the count (390px / Optima-wide fonts).
    expect(/\[data-part='panel-item'\] > span\s*\{[^}]*overflow-wrap:\s*break-word/.test(SKIN_NC)).toBe(true);
    expect(/\[data-part='panel-title'\]\s*\{[^}]*overflow-wrap:\s*break-word/.test(SKIN_NC)).toBe(true);
    expect(/\[data-part='panel-header'\]\s*\{[^}]*flex-wrap:\s*wrap/.test(SKIN_NC)).toBe(true);
    expect(/\[data-part='panel-count'\]\s*\{[^}]*margin-inline-start:\s*auto/.test(SKIN_NC)).toBe(true);
    expect(/\[data-part='panel-count'\]\s*\{[^}]*padding-inline-start:\s*var\(--ds-spacing-2,\s*8px\)/.test(SKIN_NC)).toBe(true);
    // Search placeholder reads the governed channel.
    expect(/\[data-part='panel-search'\]::placeholder\s*\{[^}]*var\(--ds-transfer-search-placeholder-color,\s*var\(--ds-input-color-placeholder,\s*var\(--ds-color-text-muted\)\)\)/.test(SKIN_NC)).toBe(true);
    // Reduced-motion guard covers item rows.
    const rm = SKIN_NC.match(/@media \(prefers-reduced-motion: reduce\)\s*\{\n([\s\S]*?)\n\}/);
    expect(rm).not.toBeNull();
    expect(/panel-item/.test(rm![1])).toBe(true);
  });

  it('disabled move buttons read the posture in the DOM (engine contract)', () => {
    renderWithEngine(
      <ModernTransfer dataSource={FOUR_ITEMS} onChange={vi.fn()} />,
      'modern'
    );
    // Nothing selected: both move buttons are disabled and carry no inline
    // opacity/cursor -- the skin owns the posture.
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
