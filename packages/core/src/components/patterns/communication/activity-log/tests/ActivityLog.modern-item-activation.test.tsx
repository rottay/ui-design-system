import React from 'react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernActivityLog from '../engines/modern';
import type { Activity } from '../contracts';

const ACTIVITIES: Activity[] = [
  { id: 'a1', user: { name: 'Ann Lee' }, action: 'updated', entityType: 'Invoice', timestamp: '2026-10-01T10:00:00Z' },
  { id: 'a2', user: { name: 'Bo Kim' }, action: 'created', timestamp: '2026-10-01T09:00:00Z' },
];

const SKIN = readFileSync(
  resolve(__dirname, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/activity-log/index.css'),
  'utf8',
).replace(/\/\*[\s\S]*?\*\//g, '');

async function mount(props: Partial<React.ComponentProps<typeof ModernActivityLog>> = {}) {
  const view = render(<ModernActivityLog activities={ACTIVITIES} {...props} />);
  await act(async () => {});
  return view;
}

describe('ActivityLog modern item activation is a composed chrome-less Button', () => {
  it('names each activation by its item body and fires once per click, Enter and Space', async () => {
    const onActivityClick = vi.fn();
    await mount({ onActivityClick });
    const activation = screen.getByRole('button', { name: /Ann Lee/ });
    expect(activation).toHaveAttribute('data-part', 'item-activate');
    expect(activation).toHaveAttribute('data-chrome', 'none');
    expect(activation).toHaveClass('ds-button', 'ds-button--modern');
    expect(activation.closest('[data-part="item-body"]')).toHaveAttribute('id', activation.getAttribute('aria-labelledby'));

    fireEvent.click(activation);
    fireEvent.keyDown(activation, { key: 'Enter' });
    fireEvent.keyDown(activation, { key: ' ' });
    fireEvent.keyDown(activation, { key: 'a' });
    expect(onActivityClick).toHaveBeenCalledTimes(3);
    expect(onActivityClick).toHaveBeenLastCalledWith(ACTIVITIES[0]);
  });

  it('feeds the item body its focus-visible state from the activation the body hosts', async () => {
    await mount({ onActivityClick: vi.fn() });
    const activation = screen.getByRole('button', { name: /Bo Kim/ });
    act(() => activation.focus());
    expect(activation.closest('[data-part="item-body"]')?.getAttribute('data-state')).toMatch(/\bfocus-visible\b/);
  });

  it('renders no activation and no state without onActivityClick', async () => {
    const { container } = await mount();
    expect(screen.queryByRole('button')).toBeNull();
    for (const body of container.querySelectorAll('[data-part="item-body"]')) {
      expect(body).not.toHaveAttribute('data-state');
    }
  });

  it('stretches the activation over the body in a corner-clipped frame', () => {
    expect(SKIN).toMatch(/\[data-part='item-body'\]\[data-interactive='true'\] \{\s*position: relative;/);
    expect(SKIN).toMatch(/\[data-part='item-body'\] > \[data-part='item-hit'\] \{\s*position: absolute;\s*z-index: var\(--ds-z-index-relative-above\);\s*inset: 0;\s*border-radius: inherit;\s*clip-path: border-box;\s*\}/);
    expect(SKIN).toMatch(/\[data-part='item-hit'\] > \[data-part='item-activate'\] \{\s*position: absolute;\s*inset: -4%;\s*max-inline-size: none;\s*\}/);
  });
});
