/**
 * Pass-through law contract (P-88) for the Modern carriers that already keep
 * their own part and only forwarded a caller state: Container, Space, the
 * Modern grid item and the notifier stack. A caller `data-part`/`data-state`
 * reaches no element they paint and the owner's own anatomy survives; `id`,
 * `aria-*`, every other `data-*` and `className` keep forwarding (the honesty
 * law), and PresenceList still reaches them through its own seam.
 */
import React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import { NotifierStack } from '@/components/primitives/feedback/foundation/notifier';
import ModernContainer from '@/components/primitives/layout/container/engines/modern';
import { ModernGrid, ModernGridItem } from '@/components/primitives/layout/grid/engines/modern';
import ModernSpace from '@/components/primitives/layout/space/engines/modern';
import { PresenceList } from '@/graphics/motion/react/runtime';
import { renderWithEngine } from '@tests/support/engine';

const CALLER_PART = 'p88-caller-part';
const CALLER_STATE = 'p88-caller-state';

const caller = {
  id: 'p88-root',
  'aria-label': 'Caller label',
  'data-custom': 'caller-data',
  className: 'caller-hook',
  'data-part': CALLER_PART,
  'data-state': CALLER_STATE,
} as const;

describe('P-88 pass-through law: Modern carriers cohort 1 (Container, Space, grid item, notifier stack)', () => {
  it.each([
    ['Container', <ModernContainer key="container" {...caller}>Body</ModernContainer>, ".ds-container--modern.caller-hook[data-part='root'][data-component='container']"],
    ['Space', <ModernSpace key="space" split="|" {...caller}><span>A</span><span>B</span></ModernSpace>, ".ds-space--modern.caller-hook[data-part='root'][data-component='space']"],
    ['Grid item', <ModernGrid key="grid" columns={2}><ModernGridItem {...caller}>Cell</ModernGridItem></ModernGrid>, ".rottay-grid-item--modern.caller-hook[data-part='grid-cell'][data-component='grid-item']"],
    ['Notifier stack', <NotifierStack key="stack" role="toast" placement="top-end" layer="1000" liveRole="log" {...caller}>Item</NotifierStack>, ".ds-notifier-stack.caller-hook[data-part='stack'][data-variant='toast'][data-placement='top-end'][role='log']"],
  ] as const)('%s drops the caller part and state, keeps its own anatomy and still forwards id, aria-*, data-* and className', (_family, ui, ownAnatomy) => {
    const { container } = renderWithEngine(ui, 'modern');
    const root = container.querySelector<HTMLElement>(ownAnatomy);

    expect(root).toBeTruthy();
    expect(container.querySelector(`[data-part="${CALLER_PART}"]`)).toBeNull();
    expect(container.querySelector(`[data-state~="${CALLER_STATE}"]`)).toBeNull();
    expect(root).not.toHaveAttribute('data-state');

    expect(root).toHaveAttribute('id', 'p88-root');
    expect(root).toHaveAttribute('aria-label', 'Caller label');
    expect(root).toHaveAttribute('data-custom', 'caller-data');
  });

  it('Space keeps its engine-owned separator sub-part', () => {
    const { container } = renderWithEngine(
      <ModernSpace split="|" {...caller}><span>A</span><span>B</span></ModernSpace>,
      'modern',
    );

    expect(container.querySelectorAll(".ds-space--modern > [data-part='separator'][aria-hidden='true']")).toHaveLength(1);
  });

  it('PresenceList still reaches each carrier through its own seam, never through data-state', () => {
    const { container } = render(
      <PresenceList>
        <ModernContainer key="container" id="presence-container">Body</ModernContainer>
        <ModernSpace key="space" id="presence-space">A</ModernSpace>
      </PresenceList>,
    );

    for (const id of ['presence-container', 'presence-space']) {
      const node = container.querySelector(`#${id}`);
      expect(node).toHaveAttribute('data-ds-presence', 'open');
      expect(node).not.toHaveAttribute('data-state');
    }
  });
});
