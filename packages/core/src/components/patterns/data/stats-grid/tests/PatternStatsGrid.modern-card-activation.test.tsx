import React from 'react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { act, fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithEngine } from '@tests/support/engine';

import ModernStatsGrid from '../engines/modern';

const STATS = [
  { key: 'rev', label: 'Revenue', value: 120, change: 4, changeType: 'increase' as const, description: 'vs last month' },
  { key: 'usr', label: 'Users', value: 30 },
];

const SKIN = readFileSync(
  resolve(__dirname, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/stats-grid/index.css'),
  'utf8',
).replace(/\/\*[\s\S]*?\*\//g, '');

async function mount(props: Partial<React.ComponentProps<typeof ModernStatsGrid>> = {}) {
  const view = renderWithEngine(<ModernStatsGrid stats={STATS} animate={false} {...props} />, 'modern');
  await act(async () => {});
  return view;
}

describe('StatsGrid modern card activation is a composed chrome-less Button', () => {
  it('names each activation by its whole card and fires once per click, Enter and Space', async () => {
    const onStatClick = vi.fn();
    await mount({ onStatClick });
    const activation = await screen.findByRole('button', { name: /Revenue.*vs last month/ });
    expect(activation).toHaveAttribute('data-part', 'card-activate');
    expect(activation).toHaveAttribute('data-chrome', 'none');
    const card = activation.closest('[data-part="card"]');
    expect(card).toHaveAttribute('id', activation.getAttribute('aria-labelledby'));
    expect(card).not.toHaveAttribute('role');
    expect(card).not.toHaveAttribute('tabindex');

    fireEvent.click(activation);
    fireEvent.keyDown(activation, { key: 'Enter' });
    fireEvent.keyDown(activation, { key: ' ' });
    fireEvent.keyDown(activation, { key: 'a' });
    expect(onStatClick).toHaveBeenCalledTimes(3);
    expect(onStatClick).toHaveBeenLastCalledWith(STATS[0]);
  });

  it('feeds the card its focus-visible state from the activation the card hosts', async () => {
    await mount({ onStatClick: vi.fn() });
    const activation = await screen.findByRole('button', { name: /Users/ });
    act(() => activation.focus());
    expect(activation.closest('[data-part="card"]')?.getAttribute('data-state')).toMatch(/\bfocus-visible\b/);
  });

  it('renders no activation and no state without onStatClick', async () => {
    const { container } = await mount();
    await screen.findByText('Revenue');
    expect(screen.queryByRole('button')).toBeNull();
    for (const card of container.querySelectorAll('[data-part="card"]')) {
      expect(card).toHaveAttribute('data-interactive', 'false');
      expect(card).not.toHaveAttribute('data-state');
    }
  });

  it('stretches the activation over the card in a corner-clipped frame', () => {
    expect(SKIN).toMatch(/\.ds-stats-grid__card > \[data-part="card-hit"\] \{\s*position: absolute;\s*z-index: var\(--ds-z-index-relative-above\);\s*inset: 0;\s*border-radius: inherit;\s*clip-path: border-box;\s*\}/);
    expect(SKIN).toMatch(/\[data-part="card-hit"\] > \.ds-stats-grid__card-activate \{\s*position: absolute;\s*inset: -4%;\s*max-inline-size: none;\s*\}/);
  });
});
