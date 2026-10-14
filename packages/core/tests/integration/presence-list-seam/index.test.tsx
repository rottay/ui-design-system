/**
 * PresenceList keys exit motion on its own `data-ds-presence` seam, so a family
 * that keeps its own `data-state` anatomy (P-88) still exits through it.
 */
import React from 'react';
import { act, render, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ModernCard from '@/components/primitives/display/card/engines/modern';
import { PresenceList } from '@/graphics/motion/react/runtime';

const SEAM_EXIT_CSS = "[data-ds-presence='closed'] { transition-property: opacity; transition-duration: 50ms; }";

function Cards({ ids, onExitComplete }: { ids: string[]; onExitComplete: (key: string) => void }) {
  return (
    <>
      <style>{SEAM_EXIT_CSS}</style>
      <PresenceList onExitComplete={onExitComplete}>
        {ids.map((id) => <ModernCard key={id} id={`card-${id}`} title={id}>{id}</ModernCard>)}
      </PresenceList>
    </>
  );
}

describe('PresenceList seam on a P-88 family (Card)', () => {
  it('the card refuses the injected data-state yet exits through the seam', async () => {
    const exited: string[] = [];
    const { container, rerender } = render(<Cards ids={['a', 'b']} onExitComplete={(key) => exited.push(key)} />);
    const card = () => container.querySelector<HTMLElement>('#card-b');

    expect(card()).toHaveAttribute('data-ds-presence', 'open');
    expect(card()).not.toHaveAttribute('data-state', 'open');

    rerender(<Cards ids={['a']} onExitComplete={(key) => exited.push(key)} />);
    const exiting = card();
    expect(exiting).toHaveAttribute('data-ds-presence', 'closed');
    expect(exiting).not.toHaveAttribute('data-state', 'closed');
    expect(['50ms', '0.05s']).toContain(getComputedStyle(exiting as HTMLElement).transitionDuration);
    expect(exited).toEqual([]);

    act(() => {
      exiting?.dispatchEvent(new Event('transitionend', { bubbles: true }));
    });
    await waitFor(() => expect(card()).toBeNull());
    expect(exited).toEqual(['b']);
    expect(container.querySelector('#card-a')).toHaveAttribute('data-ds-presence', 'open');
  });
});
