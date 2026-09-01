import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import DashboardHeader from '../runtime/rendering';
import { renderWithEngine } from '@tests/support/engine';

/** The anatomy this structure owns; composed primitives stamp their own parts. */
const OWNED_PARTS = [
  'root',
  'header-row',
  'identity',
  'icon',
  'copy',
  'title-row',
  'title',
  'subtitle',
  'status-dot',
  'status-dot-glyph',
  'status-dot-text',
  'actions',
  'time-range',
  'search',
  'action-label',
  'metrics-row',
  'metric-chip',
  'metric-chip-icon',
  'metric-chip-label',
  'metric-chip-readout',
  'metric-chip-value',
  'metric-chip-change',
  'metric-chip-trend',
] as const;

/**
 * The structure is anatomy + state only: every value the skin paints must
 * reach it through the scope class and a `data-part` / `data-*` stamp, never
 * an inline style. One inline paint here would outrank every tenant channel.
 */
describe('DashboardHeader — the structure paints nothing', () => {
  it('carries the scope class and leaves every part it owns without an inline style', async () => {
    const { container } = renderWithEngine(
      <DashboardHeader
        title="Overview"
        subtitle="Live operational metrics"
        icon={<svg />}
        status={{ state: 'live' }}
        metrics={[
          { key: 'm1', label: 'Users', value: 128, icon: <svg />, change: { value: '4%', direction: 'up' } },
        ]}
        actions={[{ key: 'a1', label: 'Refresh', icon: <svg />, onClick: vi.fn() }]}
        searchSlot={<input aria-label="Search" />}
        timeRangeSlot={<button type="button">7d</button>}
      />,
      'modern',
    );

    // The action rides the engine-resolved Button, which lazy-loads.
    await waitFor(() => expect(container.querySelector('[data-part="action-label"]')).not.toBeNull(), {
      timeout: 2000,
    });

    const root = container.querySelector('[data-part="root"]') as HTMLElement;
    expect(root.className).toContain('ds-structure');
    expect(root.className).toContain('ds-dashboard-header');

    // Every stamp must actually land: a part a composed primitive ate is a
    // skin rule that silently never fires.
    for (const part of OWNED_PARTS) {
      const nodes = container.querySelectorAll<HTMLElement>(`[data-part="${part}"]`);
      expect(nodes.length, part).toBeGreaterThan(0);
      for (const node of nodes) {
        expect(node.getAttribute('style'), part).toBeNull();
      }
    }
  });

  it('stamps the state channels the skin keys its posture on', () => {
    const { container } = render(
      <DashboardHeader
        title="Overview"
        icon={<svg />}
        status={{ state: 'syncing' }}
        metrics={[{ key: 'm1', label: 'Users', value: 1 }]}
      />,
    );

    const root = container.querySelector('[data-part="root"]') as HTMLElement;
    expect(root).toHaveAttribute('data-compact', 'false');
    expect(root).toHaveAttribute('data-has-icon', 'true');
    expect(root).toHaveAttribute('data-has-metrics', 'true');
    expect(root).toHaveAttribute('data-has-actions', 'false');
    expect(root).toHaveAttribute('data-status', 'syncing');
  });

  /**
   * The header's own chrome is plain elements, so it paints on first commit.
   * Only the composed Button is behind a boundary — the identity and the
   * readout must never wait on one.
   */
  it('renders its identity and readout synchronously, with no Suspense wait', () => {
    const { container } = render(
      <DashboardHeader
        title="Overview"
        status={{ state: 'live' }}
        metrics={[{ key: 'm1', label: 'Users', value: 128 }]}
      />,
    );

    expect(container.querySelector('[data-part="title"]')).not.toBeNull();
    expect(container.querySelector('[data-part="status-dot-text"]')).not.toBeNull();
    expect(container.querySelector('[data-part="metric-chip-value"]')).not.toBeNull();
  });
});

/**
 * The previous rendering dressed the root as a lift-on-hover card and declared
 * a second `banner` landmark on a page whose shell already owns one. Both are
 * withdrawn: nothing in a page header is clickable, and the `<h1>` names the
 * region.
 */
describe('DashboardHeader — no affordance the header cannot honour', () => {
  it('forces no banner landmark and names the region by its heading', () => {
    const { container } = render(<DashboardHeader title="Overview" />);

    const root = container.querySelector('[data-part="root"]') as HTMLElement;
    // No EXPLICIT role: a bare `<header>` maps to `banner` only while it is
    // top-level, and maps to nothing once the page shell nests it under
    // `<main>`. An explicit `role="banner"` forces the landmark in both cases
    // and duplicates the shell's own.
    expect(root.tagName).toBe('HEADER');
    expect(root.hasAttribute('role')).toBe(false);

    const heading = screen.getByRole('heading', { level: 1, name: 'Overview' });
    expect(root.getAttribute('aria-labelledby')).toBe(heading.getAttribute('id'));
  });
});

describe('DashboardHeader — the readout is reachable and never colour-only', () => {
  it('gives the overflowing metric rail a tab stop and an accessible name', () => {
    render(
      <DashboardHeader
        title="Overview"
        metrics={[
          { key: 'm1', label: 'Users', value: 128 },
          { key: 'm2', label: 'Errors', value: 3 },
        ]}
      />,
    );

    expect(screen.getByRole('group', { name: 'Key metrics' })).toHaveAttribute('tabindex', '0');
  });

  it('carries every change direction in text, not only in the tint', () => {
    const { container } = render(
      <DashboardHeader
        title="Overview"
        metrics={[
          { key: 'm1', label: 'Users', value: 128, change: { value: '4%', direction: 'up' } },
          { key: 'm2', label: 'Errors', value: 3, change: { value: '2%', direction: 'down' } },
          { key: 'm3', label: 'Latency', value: '120ms', change: { value: '0%', direction: 'flat' } },
        ]}
      />,
    );

    const changes = container.querySelectorAll('[data-part="metric-chip-change"]');
    expect(changes[0].textContent).toBe('+4%');
    expect(changes[1].textContent).toBe('-2%');
    expect(changes[2].textContent).toBe('0%');

    // The governed trend icon is the second redundant channel; a flat change
    // has no direction to carry, so it gets none.
    expect(changes[0].querySelector('[data-part="metric-chip-trend"] svg')).not.toBeNull();
    expect(changes[1].querySelector('[data-part="metric-chip-trend"] svg')).not.toBeNull();
    expect(changes[2].querySelector('[data-part="metric-chip-trend"]')).toBeNull();
  });
});

/**
 * The narrow-container cut hides the visible label on icon-bearing actions.
 * The name has to survive that cut, so it lives on `aria-label`, and the label
 * span advertises whether it may be hidden at all.
 */
describe('DashboardHeader — the action name survives the icon-only cut', () => {
  it('keeps the accessible name on the button and marks which labels may collapse', async () => {
    const { container } = renderWithEngine(
      <DashboardHeader
        title="Overview"
        actions={[
          { key: 'a1', label: 'Refresh', icon: <svg />, onClick: vi.fn() },
          { key: 'a2', label: 'Export', onClick: vi.fn() },
        ]}
      />,
      'modern',
    );

    await waitFor(
      () => expect(container.querySelectorAll('[data-part="action-label"]').length).toBe(2),
      { timeout: 2000 },
    );

    expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();

    const labels = container.querySelectorAll('[data-part="action-label"]');
    expect(labels[0]).toHaveAttribute('data-has-icon', 'true');
    // Without an icon there is nothing left to click, so the label never hides.
    expect(labels[1]).toHaveAttribute('data-has-icon', 'false');
  });
});

describe('DashboardHeader — status is skin-owned', () => {
  it('resolves the English floor and leaves the pulse to the skin', () => {
    const { container } = render(<DashboardHeader title="Overview" status={{ state: 'live' }} />);

    expect(container.querySelector('[data-part="status-dot-text"]')?.textContent).toBe('Live');

    const glyph = container.querySelector('[data-part="status-dot-glyph"]') as HTMLElement;
    expect(glyph.style.animation).toBe('');
    expect(glyph).toHaveAttribute('data-state', 'live');
  });
});
