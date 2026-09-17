/**
 * @fileoverview Pins the modern chip's lifecycle glyph: which governed status
 * role each `ActiveFilterState` resolves to, that it is sized from the icon
 * ramp rather than a pixel literal, and that an applied chip carries no glyph
 * at all (an empty icon slot is still a slot in the composed Tag).
 */

import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, screen } from '@testing-library/react';

import { PatternListToolbar } from '..';
import type { ActiveFilterState } from '../contracts';
import { renderWithEngine } from '@tests/support/engine';
import { mockMatchMedia } from '@tests/support/browser/match-media';

const PILLS = [
  {
    key: 'status',
    label: 'Status',
    value: 'all',
    options: [
      { label: 'All', value: 'all' },
      { label: 'Live', value: 'live' },
    ],
  },
];

function baseProps(filterStates: Record<string, ActiveFilterState>) {
  return {
    title: 'Candidates',
    totalCount: 42,
    search: '',
    onSearchChange: vi.fn(),
    filterPills: PILLS,
    activeFilters: { status: 'live' },
    activeFilterCount: 1,
    onFilterChange: vi.fn(),
    onClearFilters: vi.fn(),
    viewMode: 'list' as const,
    onViewModeChange: vi.fn(),
    density: 'comfortable' as const,
    onDensityChange: vi.fn(),
    primaryAction: { label: 'New candidate', onClick: vi.fn() },
    onExport: vi.fn(),
    filterStates,
  };
}

async function renderChip(state: ActiveFilterState): Promise<HTMLElement> {
  mockMatchMedia(1280);
  renderWithEngine(
    <PatternListToolbar engine="modern" {...baseProps({ status: state })} />,
    'modern',
  );
  const chip = (await screen.findAllByText('Live'))[0].closest(
    '[data-part="filter-chip"]',
  ) as HTMLElement;
  expect(chip).not.toBeNull();
  return chip;
}

/** The Tag's own close control also carries a glyph; the state glyph is the
 *  one outside it. */
function stateGlyph(chip: HTMLElement): Element | null {
  return (
    [...chip.querySelectorAll('[data-icon-name]')].find(
      (node) => !node.closest('[data-part="close"]'),
    ) ?? null
  );
}

describe('PatternListToolbar filter-state glyph', () => {
  afterEach(async () => {
    await act(async () => {
      document.documentElement.removeAttribute('dir');
      await new Promise((resolve) => setTimeout(resolve, 500));
    });
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('resolves the draft state to the governed status.draft role', async () => {
    const chip = await renderChip('draft');
    expect(stateGlyph(chip)?.getAttribute('data-icon-name')).toBe('status.draft');
  });

  it('resolves the invalid state to the governed status.error role', async () => {
    const chip = await renderChip('invalid');
    expect(stateGlyph(chip)?.getAttribute('data-icon-name')).toBe('status.error');
  });

  it('sizes the glyph from the icon ramp, never a pixel literal', async () => {
    const chip = await renderChip('draft');
    const glyph = stateGlyph(chip) as SVGElement;
    for (const attribute of ['width', 'height']) {
      const value = glyph.getAttribute(attribute) ?? '';
      expect(value).toContain('--ds-icon-xs-size');
      expect(/^\d+(?:px)?$/u.test(value)).toBe(false);
    }
  });

  it('renders no glyph for an applied chip', async () => {
    const chip = await renderChip('applied');
    expect(stateGlyph(chip)).toBeNull();
  });
});
