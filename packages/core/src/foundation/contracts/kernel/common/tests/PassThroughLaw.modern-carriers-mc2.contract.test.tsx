/**
 * Pass-through law contract (P-88) for the Grid carriers: the Modern grid root
 * and the public `Grid.Item` compound. A caller `data-part`/`data-state` reaches
 * no element they paint and the owner's own anatomy survives; `id`, `aria-*`,
 * every other `data-*` and `className` keep forwarding (the honesty law). The
 * compound is engine-agnostic, so the Classic row pins the same rule there.
 */
import React from 'react';
import { describe, expect, it } from 'vitest';
import { waitFor } from '@testing-library/react';

import { Grid } from '@/components/primitives/layout/grid';
import { ModernGrid } from '@/components/primitives/layout/grid/engines/modern';
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

describe('P-88 pass-through law: Modern carriers cohort M-C2 (grid root, Grid.Item)', () => {
  it.each([
    ['Modern grid root', 'modern', <ModernGrid key="grid" columns={2} {...caller}><span>Cell</span></ModernGrid>, ".rottay-grid--modern.caller-hook[data-part='root'][data-component='grid']"],
    ['Grid.Item on Modern', 'modern', <Grid key="grid" columns={2}><Grid.Item {...caller}>Cell</Grid.Item></Grid>, ".rottay-grid--modern > .rottay-grid-item.caller-hook[data-part='grid-cell'][data-component='grid-item']"],
    ['Grid.Item on Classic', 'classic', <Grid key="grid" columns={2}><Grid.Item {...caller}>Cell</Grid.Item></Grid>, ".rottay-grid--classic > .rottay-grid-item.caller-hook[data-part='grid-cell'][data-component='grid-item']"],
  ] as const)('%s drops the caller part and state, keeps its own anatomy and still forwards id, aria-*, data-* and className', async (_family, engine, ui, ownAnatomy) => {
    const { container } = renderWithEngine(ui, engine);
    await waitFor(() => expect(container.querySelector(ownAnatomy)).toBeTruthy());
    const root = container.querySelector<HTMLElement>(ownAnatomy);

    expect(container.querySelector(`[data-part="${CALLER_PART}"]`)).toBeNull();
    expect(container.querySelector(`[data-state~="${CALLER_STATE}"]`)).toBeNull();
    expect(root).not.toHaveAttribute('data-state');

    expect(root).toHaveAttribute('id', 'p88-root');
    expect(root).toHaveAttribute('aria-label', 'Caller label');
    expect(root).toHaveAttribute('data-custom', 'caller-data');
  });
});
