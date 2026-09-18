/**
 * DashboardHeader, WO-FAM-10 sub-lot D2.
 *
 * What this suite owns, and the browser suite beside it does not: the DOM and
 * skin contract the family cut changed. The operational status is a domain
 * stamp on `data-status` — never the kernel's `data-state` vocabulary — the
 * metrics readout's focus ring is the shared interaction kernel's decision
 * read off `data-state`, and every part the skin selects is a part the
 * structure stamps.
 */

import React from 'react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, waitFor } from '@testing-library/react';

import DashboardHeader from '../runtime/rendering';
import { renderWithEngine } from '@tests/support/engine';

const SKIN = readFileSync(
  resolve(
    process.cwd(),
    'src/foundation/tokens/css/presentation/components/skin/dashboard-header/index.css',
  ),
  'utf8',
);

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

const FULL_FIXTURE = (
  <DashboardHeader
    title="Overview"
    subtitle="Live operational metrics"
    icon={<svg />}
    status={{ state: 'live' }}
    metrics={[
      { key: 'm1', label: 'Users', value: 128, icon: <svg />, change: { value: '4%', direction: 'up' } },
      { key: 'm2', label: 'Errors', value: 3, change: { value: '2%', direction: 'down' } },
    ]}
    actions={[{ key: 'a1', label: 'Refresh', icon: <svg />, onClick: vi.fn() }]}
    searchSlot={<input aria-label="Search" />}
    timeRangeSlot={<button type="button">7d</button>}
  />
);

function stampedParts(container: HTMLElement): string[] {
  return [...container.querySelectorAll('[data-part]')].map(
    (node) => node.getAttribute('data-part') as string,
  );
}

describe('DashboardHeader (WO-FAM-10 cut) — the anatomy contract', () => {
  it('stamps every part the skin selects, and the skin selects every stamped part', async () => {
    const { container } = renderWithEngine(FULL_FIXTURE, 'modern');
    await waitFor(() => expect(container.querySelector('[data-part="action-label"]')).not.toBeNull(), {
      timeout: 2000,
    });

    const stamped = new Set(stampedParts(container));
    for (const part of OWNED_PARTS) {
      expect(stamped.has(part), `stamped ${part}`).toBe(true);
      expect(SKIN, `skin rule for ${part}`).toContain(`[data-part='${part}']`);
    }
    // And the converse: no skin rule hangs on a part this structure never stamps.
    for (const match of SKIN.matchAll(/\[data-part='([a-z-]+)'\]/g)) {
      expect(OWNED_PARTS, match[1]).toContain(match[1]);
    }
  });

  it('paints nothing inline: every visual value reaches the skin through a stamp', async () => {
    const { container } = renderWithEngine(FULL_FIXTURE, 'modern');
    await waitFor(() => expect(container.querySelector('[data-part="action-label"]')).not.toBeNull(), {
      timeout: 2000,
    });
    for (const node of container.querySelectorAll('[data-part]')) {
      const style = node.getAttribute('style');
      const part = node.getAttribute('data-part');
      if (OWNED_PARTS.includes(part as (typeof OWNED_PARTS)[number])) {
        // The structure's own parts carry no inline style at all.
        expect({ part, style }).toEqual({ part, style: null });
      } else if (style !== null) {
        // A composed primitive may travel runtime-computed `--ds-*` channels
        // only -- never a paint value.
        for (const declaration of style.split(';')) {
          expect(declaration.trim(), `${part}: ${declaration}`).toMatch(/^(--ds-[^:]+:.*)?$/);
        }
      }
    }
  });

  it('keys the variant and direction stamps both sides of the contract', () => {
    const { container } = render(
      <DashboardHeader
        title="Overview"
        icon={<svg />}
        status={{ state: 'syncing' }}
        metrics={[
          { key: 'm1', label: 'Users', value: 1, change: { value: '4%', direction: 'up' } },
          { key: 'm2', label: 'Errors', value: 3, change: { value: '2%', direction: 'down' } },
          { key: 'm3', label: 'Latency', value: '120ms', change: { value: '0%', direction: 'flat' } },
          { key: 'm4', label: 'Load', value: '2k' },
        ]}
      />,
    );

    const root = container.querySelector('[data-part="root"]') as HTMLElement;
    expect(root).toHaveAttribute('data-compact', 'false');
    expect(root).toHaveAttribute('data-has-icon', 'true');
    expect(root).toHaveAttribute('data-has-metrics', 'true');
    expect(root).toHaveAttribute('data-has-actions', 'false');
    expect(root).toHaveAttribute('data-status', 'syncing');

    const directions = [...container.querySelectorAll('[data-part="metric-chip-change"]')].map(
      (node) => node.getAttribute('data-direction'),
    );
    expect(directions).toEqual(['up', 'down', 'flat']);
    for (const direction of ['up', 'down', 'flat'] as const) {
      expect(SKIN).toContain(`[data-direction='${direction}']`);
    }
    // A chip without change stamps the explicit 'none' direction; the skin
    // paints no arm for it (no tint, no trend icon).
    expect(
      container.querySelectorAll('[data-part="metric-chip"]')[3].getAttribute('data-direction'),
    ).toBe('none');
    expect(SKIN).not.toContain("[data-direction='none']");
  });
});

describe('DashboardHeader (WO-FAM-10 cut) — state is decided once', () => {
  it('carries the operational status on data-status, never on data-state', () => {
    const { container } = render(<DashboardHeader title="Overview" status={{ state: 'offline' }} />);

    for (const part of ['status-dot', 'status-dot-glyph', 'status-dot-text']) {
      const node = container.querySelector(`[data-part="${part}"]`) as HTMLElement;
      expect(node.getAttribute('data-status')).toBe('offline');
      expect(node.hasAttribute('data-state')).toBe(false);
    }
  });

  it('stamps the status union on data-status for every operational state', () => {
    for (const state of ['live', 'connected', 'syncing', 'offline', 'warning'] as const) {
      const { container, unmount } = render(<DashboardHeader title="Overview" status={{ state }} />);
      const dot = container.querySelector('[data-part="status-dot"]') as HTMLElement;
      expect(dot.getAttribute('data-status'), state).toBe(state);
      // Each painted status arm in the skin keys on the same stamp.
      expect(SKIN).toContain(`[data-status='${state}']`);
      unmount();
    }
  });

  it('decides the metrics readout focus ring in the kernel and reads it off data-state', () => {
    const { container } = render(<DashboardHeader title="Overview" metrics={[{ key: 'm1', label: 'Users', value: 1 }]} />);

    const readout = container.querySelector('[data-part="metrics-row"]') as HTMLElement;
    // At rest the kernel serializes nothing, so [data-state] never matches.
    expect(readout.hasAttribute('data-state')).toBe(false);

    fireEvent.focus(readout);
    expect(readout.getAttribute('data-state')).toBe('focused focus-visible');

    fireEvent.blur(readout);
    expect(readout.hasAttribute('data-state')).toBe(false);
  });

  it('pairs every state pseudo-class in the skin with its data-state twin (F-37)', () => {
    // Per rule: a selector list that names a state pseudo-class must also name
    // the kernel token it stands for -- the pseudo is the fallback arm of one
    // decision, never a second authority.
    for (const match of SKIN.matchAll(/([^{}]+)\{/g)) {
      const selectors = match[1];
      if (selectors.includes(':hover') || selectors.includes(':active') || selectors.includes(':focus-visible') || selectors.includes(':disabled')) {
        expect(selectors.trim(), selectors.trim()).toContain("[data-state~='");
      }
    }
    // The one painted state is the readout's ring, paired in the resting rule
    // and again inside forced-colors.
    expect(SKIN).toContain("[data-part='metrics-row'][data-state~='focus-visible']");
  });
});

describe('DashboardHeader (WO-FAM-10 cut) — its own accessibility evidence', () => {
  it('names the region by its h1 and gives the readout a group label and a tab stop', () => {
    const { container } = render(
      <DashboardHeader title="Overview" metrics={[{ key: 'm1', label: 'Users', value: 128 }]} />,
    );

    const root = container.querySelector('[data-part="root"]') as HTMLElement;
    expect(root.tagName).toBe('HEADER');
    expect(root.hasAttribute('role')).toBe(false);
    const heading = container.querySelector('[data-part="title"]') as HTMLElement;
    expect(heading.tagName).toBe('H1');
    expect(root.getAttribute('aria-labelledby')).toBe(heading.getAttribute('id'));

    const readout = container.querySelector('[data-part="metrics-row"]') as HTMLElement;
    expect(readout.getAttribute('role')).toBe('group');
    expect(readout.getAttribute('aria-label')).toBe('Key metrics');
    expect(readout.getAttribute('tabindex')).toBe('0');
  });

  it('keeps the status text as the carrier of meaning, so the state survives colour-blindness', () => {
    for (const state of ['live', 'connected', 'syncing', 'offline', 'warning'] as const) {
      const { container, unmount } = render(
        <DashboardHeader title="Overview" status={{ state, label: undefined }} />,
      );
      const text = container.querySelector('[data-part="status-dot-text"]') as HTMLElement;
      expect(text.textContent, state).toBeTruthy();
      expect(text.querySelector('bdi'), state).not.toBeNull();
      unmount();
    }
  });

  it('keeps the trend readout in text, not only in the tint, under dir=rtl', () => {
    const { container } = render(
      <div dir="rtl">
        <DashboardHeader
          title="نظرة عامة"
          metrics={[
            { key: 'm1', label: 'Users', value: 128, change: { value: '4%', direction: 'up' } },
            { key: 'm2', label: 'Errors', value: 3, change: { value: '2%', direction: 'down' } },
          ]}
        />
      </div>,
    );

    const changes = container.querySelectorAll('[data-part="metric-chip-change"]');
    // The sign is text: it reads the same in either direction, and the bdi
    // wrappers keep the embedded numbers from being reordered.
    expect(changes[0].textContent).toBe('+4%');
    expect(changes[1].textContent).toBe('-2%');
    expect(changes[0].getAttribute('data-direction')).toBe('up');
    expect(changes[1].getAttribute('data-direction')).toBe('down');
    // The governed trend icons are the redundant channel in both directions;
    // the family stamps no transform of its own (autoMirror is the icon's).
    expect(changes[0].querySelector('[data-part="metric-chip-trend"] svg')).not.toBeNull();
    expect(changes[1].querySelector('[data-part="metric-chip-trend"] svg')).not.toBeNull();
    expect(container.innerHTML).not.toContain('scaleX');
  });
});
