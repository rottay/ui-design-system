/**
 * @fileoverview ListToolbar behavior tests (P1 elevation): every interactive
 * control the contract advertises — search, filter selection, view switch,
 * density switch, chip dismissal, clear-all, export, primary action — is
 * exercised through the real engines, including APG arrow-key selection on
 * the modern segmented controls.
 */

import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, screen } from '@testing-library/react';

import { PatternListToolbar } from '..';
import { renderWithEngine } from '../../../../../tooling/testing/helpers/engine';
import { mockMatchMedia } from '../../../../../tooling/testing/helpers/browser/match-media';

const PILLS = [
  {
    key: 'status',
    label: 'Status',
    value: 'all',
    options: [
      { label: 'All', value: 'all' },
      { label: 'Live', value: 'live' },
      { label: 'Paused', value: 'paused' },
    ],
  },
];

function baseProps(overrides: Record<string, unknown> = {}) {
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
    ...overrides,
  };
}

describe('PatternListToolbar behavior', () => {
  afterEach(async () => {
    // Every overlay instance (Tooltip/Popover) carries a MutationObserver on
    // its anchor's ancestor chain that re-applies locale context with state
    // updates. Removing the suite's `dir` attribute outside act() used to fire
    // those observers after teardown, producing one "not wrapped in act"
    // warning per instance per setter. Removing it INSIDE act, together with a
    // short drain for pending overlay follow-ups (exit fallback ≈ 240ms),
    // keeps every update wrapped before RTL's auto-cleanup unmounts.
    await act(async () => {
      document.documentElement.removeAttribute('dir');
      await new Promise((resolve) => setTimeout(resolve, 500));
    });
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  // ------------------------------------------------------------------
  // Modern engine (desktop posture)
  // ------------------------------------------------------------------

  it('forwards modern search edits to onSearchChange', async () => {
    mockMatchMedia(1280);
    const onSearchChange = vi.fn();
    renderWithEngine(
      <PatternListToolbar engine="modern" {...baseProps({ onSearchChange })} />,
      'modern',
    );

    const input = await screen.findByRole('textbox', { name: 'Search...' });
    fireEvent.change(input, { target: { value: 'ana' } });
    expect(onSearchChange).toHaveBeenCalled();
  });

  it('selects a modern filter option through the dropdown listbox', async () => {
    mockMatchMedia(1280);
    const onFilterChange = vi.fn();
    renderWithEngine(
      <PatternListToolbar engine="modern" {...baseProps({ onFilterChange })} />,
      'modern',
    );

    // The trigger's accessible name announces the current option; disclosure
    // ARIA is owned by the Popover (dialog surface holding the listbox).
    const trigger = await screen.findByRole('button', { name: 'Status: All' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(trigger);
    const listbox = await screen.findByRole('listbox', { name: 'Status' });
    expect(listbox).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(screen.getByRole('option', { name: 'Live' }));
    expect(onFilterChange).toHaveBeenCalledWith('status', 'live');
  });

  it('switches the modern view mode through the segmented control', async () => {
    mockMatchMedia(1280);
    const onViewModeChange = vi.fn();
    renderWithEngine(
      <PatternListToolbar engine="modern" {...baseProps({ onViewModeChange })} />,
      'modern',
    );

    fireEvent.click(await screen.findByRole('radio', { name: 'Card view' }));
    expect(onViewModeChange).toHaveBeenCalledWith('cards');
  });

  it('switches the modern density through the segmented control', async () => {
    mockMatchMedia(1280);
    const onDensityChange = vi.fn();
    renderWithEngine(
      <PatternListToolbar engine="modern" {...baseProps({ onDensityChange })} />,
      'modern',
    );

    fireEvent.click(await screen.findByRole('radio', { name: 'Compact density' }));
    expect(onDensityChange).toHaveBeenCalledWith('compact');
  });

  it('selects the next segmented option with arrow keys (APG)', async () => {
    mockMatchMedia(1280);
    const onViewModeChange = vi.fn();
    renderWithEngine(
      <PatternListToolbar engine="modern" {...baseProps({ onViewModeChange })} />,
      'modern',
    );

    const listRadio = await screen.findByRole('radio', { name: 'List view' });
    // Focus shows the option's tooltip/popover (focus reason, zero delay) and
    // the roving keydown moves focus — and the overlays — to the next option.
    // A bare DOM focus() is not act-wrapped by RTL, so run both inside a
    // single act() with a drain for the overlays' mount/positioning work.
    await act(async () => {
      listRadio.focus();
      fireEvent.keyDown(listRadio, { key: 'ArrowRight' });
      await new Promise((resolve) => setTimeout(resolve, 500));
    });
    expect(onViewModeChange).toHaveBeenCalledWith('cards');
  });

  it('dismisses a single modern filter chip and clears all filters', async () => {
    mockMatchMedia(1280);
    const onFilterChange = vi.fn();
    const onClearFilters = vi.fn();
    renderWithEngine(
      <PatternListToolbar
        engine="modern"
        {...baseProps({ onFilterChange, onClearFilters })}
      />,
      'modern',
    );

    const chip = (await screen.findAllByText('Live'))[0].closest(
      '[data-part="filter-chip"]',
    ) as HTMLElement;
    expect(chip).not.toBeNull();
    fireEvent.click(chip.querySelector('[data-part="close"]') as HTMLElement);
    expect(onFilterChange).toHaveBeenCalledWith('status', '');

    fireEvent.click(screen.getByRole('button', { name: 'Clear all' }));
    expect(onClearFilters).toHaveBeenCalled();
  });

  it('fires modern export and primary action handlers', async () => {
    mockMatchMedia(1280);
    const onExport = vi.fn();
    const onClick = vi.fn();
    renderWithEngine(
      <PatternListToolbar
        engine="modern"
        {...baseProps({ onExport, primaryAction: { label: 'New candidate', onClick } })}
      />,
      'modern',
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Export' }));
    expect(onExport).toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'New candidate' }));
    expect(onClick).toHaveBeenCalled();
  });

  // ------------------------------------------------------------------
  // Classic engine (desktop posture; rustic shares the implementation)
  // ------------------------------------------------------------------

  it.each(['classic', 'rustic'] as const)(
    'forwards classic-family filter pill and view toggle clicks (%s)',
    async (engine) => {
      mockMatchMedia(1280);
      const onFilterChange = vi.fn();
      const onViewModeChange = vi.fn();
      renderWithEngine(
        <PatternListToolbar
          engine={engine}
          {...baseProps({ onFilterChange, onViewModeChange })}
        />,
        engine,
      );

      fireEvent.click(await screen.findByRole('button', { name: 'Live' }));
      expect(onFilterChange).toHaveBeenCalledWith('status', 'live');

      fireEvent.click(screen.getByRole('button', { name: 'Cards' }));
      expect(onViewModeChange).toHaveBeenCalledWith('cards');
    },
    45000,
  );

  it('changes classic density from the settings dropdown', async () => {
    mockMatchMedia(1280);
    const onDensityChange = vi.fn();
    renderWithEngine(
      <PatternListToolbar engine="classic" {...baseProps({ onDensityChange })} />,
      'classic',
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Settings' }));
    fireEvent.click(await screen.findByRole('tab', { name: 'Density' }));
    fireEvent.click(await screen.findByRole('button', { name: /Compact/ }));
    expect(onDensityChange).toHaveBeenCalledWith('compact');
  });

  it('clears all classic filters from the chips strip', async () => {
    mockMatchMedia(1280);
    const onClearFilters = vi.fn();
    renderWithEngine(
      <PatternListToolbar engine="classic" {...baseProps({ onClearFilters })} />,
      'classic',
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Clear all' }));
    expect(onClearFilters).toHaveBeenCalled();
  });

  it('forwards classic search edits to onSearchChange', async () => {
    mockMatchMedia(1280);
    const onSearchChange = vi.fn();
    renderWithEngine(
      <PatternListToolbar engine="classic" {...baseProps({ onSearchChange })} />,
      'classic',
    );

    const input = await screen.findByRole('textbox', { name: 'Search...' });
    fireEvent.change(input, { target: { value: 'ana' } });
    expect(onSearchChange).toHaveBeenCalled();
  });

  // ------------------------------------------------------------------
  // Mobile posture (modern compact layout)
  // ------------------------------------------------------------------

  it('keeps every modern mobile control reachable and operable', async () => {
    mockMatchMedia(390);
    const onFilterChange = vi.fn();
    const onViewModeChange = vi.fn();
    const onDensityChange = vi.fn();
    const onExport = vi.fn();
    renderWithEngine(
      <PatternListToolbar
        engine="modern"
        {...baseProps({ onFilterChange, onViewModeChange, onDensityChange, onExport })}
      />,
      'modern',
    );

    // Filter rail pills still open their listbox in the compact posture.
    fireEvent.click(await screen.findByRole('button', { name: 'Status: All' }));
    fireEvent.click(await screen.findByRole('option', { name: 'Live' }));
    expect(onFilterChange).toHaveBeenCalledWith('status', 'live');

    // View mode + density live inside the overflow panel on mobile.
    fireEvent.click(screen.getByRole('button', { name: 'More options' }));
    fireEvent.click(await screen.findByRole('radio', { name: 'Card view' }));
    expect(onViewModeChange).toHaveBeenCalledWith('cards');
    fireEvent.click(await screen.findByRole('radio', { name: 'Spacious density' }));
    expect(onDensityChange).toHaveBeenCalledWith('spacious');
    fireEvent.click(await screen.findByRole('button', { name: 'Export' }));
    expect(onExport).toHaveBeenCalled();
  });
});
