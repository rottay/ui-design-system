/**
 * The pill composes the caller's handler bag with the kernel's instead of
 * spreading one over the other. Every one of the six kernel handlers must
 * survive that composition.
 */
import React from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { StatusFilterPills } from '..';
import { EngineProvider } from '@/infrastructure/runtime/engines/composition/react/provider';

const OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
];

describe('the composed handler bag keeps every kernel handler', () => {
  it('routes hover, press and focus on a pill', async () => {
    render(
      <EngineProvider defaultEngine="modern">
        <StatusFilterPills options={OPTIONS} value="open" onChange={() => {}} />
      </EngineProvider>,
    );
    const pill = await screen.findByRole('button', { name: /All/ });

    expect(pill).not.toHaveAttribute('data-state');
    fireEvent.pointerEnter(pill);
    expect(pill).toHaveAttribute('data-state', 'hovered');
    fireEvent.pointerDown(pill);
    expect(pill).toHaveAttribute('data-state', 'hovered pressed');
    fireEvent.pointerUp(pill);
    expect(pill).toHaveAttribute('data-state', 'hovered');
    fireEvent.pointerLeave(pill);
    expect(pill).not.toHaveAttribute('data-state');
    fireEvent.focus(pill);
    expect(pill).toHaveAttribute('data-state', 'focused focus-visible');
    fireEvent.blur(pill);
    expect(pill).not.toHaveAttribute('data-state');
  });
});
