import React from 'react';
import { act, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernActivityLog from '../engines/modern';
import type { ActivityLogProps } from '../contracts';

function buildProps(overrides: Partial<ActivityLogProps> = {}): ActivityLogProps {
  return {
    activities: [
      {
        id: 'a1',
        user: { name: 'Alice' },
        action: 'updated',
        timestamp: new Date().toISOString(),
        entityType: 'Task',
        entityId: '42',
      },
    ],
    ...overrides,
  };
}

const settle = () => act(async () => {});

describe('ActivityLog modern engine busy posture', () => {
  it('marks the root busy while the skeleton is showing', async () => {
    const { container } = render(<ModernActivityLog {...buildProps({ loading: true })} />);
    await settle();

    expect(container.querySelector('[data-part="root"]')?.getAttribute('aria-busy')).toBe('true');
  });

  it('clears busy on the loaded root rather than dropping the attribute', async () => {
    const { container } = render(<ModernActivityLog {...buildProps()} />);
    await settle();

    expect(container.querySelector('[data-part="root"]')?.getAttribute('aria-busy')).toBe('false');
  });

  it('keeps the filter bar mounted across the skeleton swap', async () => {
    const props = {
      onFilterChange: vi.fn(),
      actionTypes: ['created', 'updated'],
      users: [{ name: 'Alice' }],
    };

    const { container, rerender } = render(
      <ModernActivityLog {...buildProps({ ...props, loading: true })} />,
    );
    await settle();

    // A refetch that unmounts the user's own filter controls re-flows the page
    // and hides the controls that caused the refetch.
    expect(container.querySelector('[data-part="filters"]')).toBeTruthy();
    expect(container.querySelector('[data-part="skeleton-list"]')).toBeTruthy();

    rerender(<ModernActivityLog {...buildProps({ ...props, loading: false })} />);
    await settle();

    expect(container.querySelector('[data-part="filters"]')).toBeTruthy();
  });
});

describe('ActivityLog modern engine diff legibility', () => {
  function withDiff(diff: Record<string, { from: unknown; to: unknown }>) {
    return buildProps({
      activities: [
        {
          id: 'a1',
          user: { name: 'Alice' },
          action: 'updated',
          timestamp: new Date().toISOString(),
          diff,
        },
      ],
    } as Partial<ActivityLogProps>);
  }

  it('names the old and new sides outside the strikethrough channel', async () => {
    const { container } = render(
      <ModernActivityLog {...withDiff({ status: { from: 'open', to: 'closed' } })} />,
    );
    await settle();

    // line-through + a muted tint are the only visual marks of the old value,
    // and a screen reader receives neither.
    const from = container.querySelector('[data-diff-role="from"]');
    const to = container.querySelector('[data-diff-role="to"]');
    expect(from?.textContent).toBe('fromopen');
    expect(to?.textContent).toBe('toclosed');
  });

  it('expands a structured value into the keys that actually moved', async () => {
    const { container } = render(
      <ModernActivityLog
        {...withDiff({
          panel: {
            from: { leads: 2, safetyOfficer: false },
            to: { leads: 2, safetyOfficer: true },
          },
        })}
      />,
    );
    await settle();

    const rows = container.querySelectorAll('[data-part="diff-row"]');
    expect(rows.length).toBe(1);
    // Serializing the whole panel buries the one key that moved in unchanged
    // noise, and throws outright on a cyclic value.
    expect(rows[0].querySelector('[data-diff-role="label"]')?.textContent).toBe(
      'panel.safetyOfficer:',
    );
    expect(rows[0].querySelector('[data-diff-role="from"]')?.textContent).toBe('fromfalse');
    expect(rows[0].querySelector('[data-diff-role="to"]')?.textContent).toBe('totrue');

    const text = container.textContent ?? '';
    expect(text).not.toContain('[object Object]');
    expect(text).not.toContain('{"');
    expect(text).not.toContain('leads');
  });

  it('renders a cyclic value instead of throwing on it', async () => {
    const cyclic: Record<string, unknown> = { name: 'node' };
    cyclic.self = cyclic;

    const { container } = render(
      <ModernActivityLog {...withDiff({ graph: { from: cyclic, to: { name: 'leaf' } } })} />,
    );
    await settle();

    const text = container.textContent ?? '';
    expect(text).toContain('graph.name');
    expect(text).not.toContain('[object Object]');
  });

  it('reads an opaque value as changed rather than as an empty object', async () => {
    const { container } = render(
      <ModernActivityLog
        {...withDiff({ tags: { from: new Map([['a', 1]]), to: new Map([['b', 2]]) } })}
      />,
    );
    await settle();

    const from = container.querySelector('[data-diff-role="from"]');
    expect(from?.textContent).toBe('fromchanged');
    expect(container.textContent).not.toContain('{}');
  });

  it('leaves a trace when a struct field exceeds the row cap', async () => {
    const from: Record<string, number> = {};
    const to: Record<string, number> = {};
    for (let i = 0; i < 9; i += 1) {
      from[`k${i}`] = i;
      to[`k${i}`] = i + 1;
    }

    const { container } = render(<ModernActivityLog {...withDiff({ config: { from, to } })} />);
    await settle();

    expect(container.querySelectorAll('[data-diff-depth="1"]').length).toBe(6);
    expect(container.querySelector('[data-diff-overflow="true"]')?.textContent).toBe(
      '+3 more changes',
    );
  });

  it('joins a short primitive array and caps a long one', async () => {
    const { container } = render(
      <ModernActivityLog
        {...withDiff({ labels: { from: ['a', 'b'], to: ['a', 'b', 'c', 'd', 'e', 'f'] } })}
      />,
    );
    await settle();

    expect(container.querySelector('[data-diff-role="from"]')?.textContent).toBe('froma, b');
    expect(container.querySelector('[data-diff-role="to"]')?.textContent).toBe(
      'toa, b, c, d, +2 more',
    );
  });

  it('names an absent value instead of printing undefined', async () => {
    const { container } = render(
      <ModernActivityLog {...withDiff({ assignee: { from: undefined, to: 'Alice' } })} />,
    );
    await settle();

    const from = container.querySelector('[data-diff-role="from"]');
    expect(from?.textContent).not.toContain('undefined');
    expect(from?.textContent).toBe('fromempty');
  });
});

describe('ActivityLog modern engine floor interpolation', () => {
  it('never prints a raw placeholder in a relative timestamp', async () => {
    const { container } = render(
      <ModernActivityLog
        {...buildProps({
          activities: [
            {
              id: 'a1',
              user: { name: 'Alice' },
              action: 'updated',
              timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
            },
          ],
        } as Partial<ActivityLogProps>)}
      />,
    );
    await settle();

    const stamp = container.querySelector('[data-part="timestamp"]');
    expect(stamp?.textContent).toBe('3h ago');
    expect(stamp?.textContent).not.toContain('{count}');
  });
});
