/**
 * Pass-through law contract (P-88) for the Stack carrier (ARC-12 M-P2). The
 * Modern Stack root stamps its own part, so a caller `data-part`/`data-state`
 * reaches no element it paints; `id`, `aria-*`, every other `data-*` and
 * `className` keep forwarding (the honesty law). A caller-supplied divider
 * element keeps its own part and takes the slot class `rottay-stack-divider`;
 * the engine's own divider span keeps the Stack's `divider` part. Classic and
 * Rustic are read-only: their Stack still forwards a caller part and still
 * stamps `data-part="divider"` on a caller divider (the Modern-only gate).
 */
import React from 'react';
import { describe, expect, it } from 'vitest';
import { waitFor } from '@testing-library/react';

import { Stack } from '@/components/primitives/layout/stack';
import ModernStack from '@/components/primitives/layout/stack/engines/modern';
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

async function find(container: HTMLElement, selector: string): Promise<HTMLElement> {
  await waitFor(() => expect(container.querySelector(selector)).toBeTruthy());
  return container.querySelector<HTMLElement>(selector) as HTMLElement;
}

describe('P-88 pass-through law: Modern carriers cohort M-P2 (Stack root, Stack divider slot)', () => {
  it('the Modern Stack root drops the caller part and state, keeps its own anatomy and still forwards id, aria-*, data-* and className', async () => {
    const { container } = renderWithEngine(
      <ModernStack {...caller}><span>One</span></ModernStack>,
      'modern',
    );
    const root = await find(container, ".rottay-stack--modern.caller-hook[data-part='root'][data-component='stack']");

    expect(container.querySelector(`[data-part="${CALLER_PART}"]`)).toBeNull();
    expect(container.querySelector(`[data-state~="${CALLER_STATE}"]`)).toBeNull();
    expect(root).not.toHaveAttribute('data-state');

    expect(root).toHaveAttribute('id', 'p88-root');
    expect(root).toHaveAttribute('aria-label', 'Caller label');
    expect(root).toHaveAttribute('data-custom', 'caller-data');
  });

  it('a caller divider on Modern keeps its own part and takes the slot class beside its own classes', async () => {
    const { container } = renderWithEngine(
      <ModernStack divider={<span className="caller-divider" data-part="caller-divider-part">/</span>}>
        <span>One</span>
        <span>Two</span>
        <span>Three</span>
      </ModernStack>,
      'modern',
    );
    await find(container, '.rottay-stack--modern > .caller-divider');
    const dividers = Array.from(container.querySelectorAll<HTMLElement>('.rottay-stack--modern > .caller-divider'));

    expect(dividers).toHaveLength(2);
    expect(container.querySelector('[data-part="divider"]')).toBeNull();
    for (const divider of dividers) {
      expect(divider).toHaveClass('caller-divider', 'rottay-stack-divider');
      expect(divider).toHaveAttribute('data-part', 'caller-divider-part');
      expect(divider).toHaveAttribute('aria-hidden', 'true');
    }
  });

  it("the engine's own divider span on Modern keeps the Stack's divider part and class", async () => {
    const { container } = renderWithEngine(
      <ModernStack divider><span>One</span><span>Two</span></ModernStack>,
      'modern',
    );
    const span = await find(container, '.rottay-stack--modern > span.rottay-stack-divider');

    expect(span).toHaveAttribute('data-part', 'divider');
    expect(span).toHaveAttribute('aria-hidden', 'true');
  });

  it.each(['classic', 'rustic'] as const)(
    'the read-only %s Stack still forwards the caller part and stamps data-part="divider" on a caller divider',
    async (engine) => {
      const { container } = renderWithEngine(
        <Stack data-part={CALLER_PART} divider={<span className="caller-divider">/</span>}>
          <span>One</span>
          <span>Two</span>
        </Stack>,
        engine,
      );
      await find(container, `.rottay-stack--${engine}[data-part="${CALLER_PART}"]`);
      const divider = await find(container, `.rottay-stack--${engine} > .caller-divider`);

      expect(divider).toHaveAttribute('data-part', 'divider');
      expect(divider).not.toHaveClass('rottay-stack-divider');
    },
  );
});
