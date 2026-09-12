import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { responsiveVisibilityQuery } from '@/foundation/contracts/kernel/responsive/visibility';
import { ResponsiveSlot } from '..';

/**
 * The boundary each wrapper stands for.
 *
 * Show/Hide no longer inject a stylesheet per instance: each stamps ONE token
 * on `data-ds-show` / `data-ds-hide`, and the static sheet
 * (`foundation/responsive/visibility`) owns every prelude. Reading the token
 * back through the contract keeps these assertions about the same boundaries
 * they always measured.
 */
function boundaryOf(node: Element): string {
  const token = node.getAttribute('data-ds-show') ?? node.getAttribute('data-ds-hide');
  if (token === null) return '';
  const [kind, value] = token.split(':') as [string, never];
  const constraints =
    kind === 'on' ? { on: value } : kind === 'from' ? { from: value } : { below: value };
  return responsiveVisibilityQuery(constraints) ?? '';
}

function emittedQueries(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll('[data-ds-show],[data-ds-hide]')).map(boundaryOf);
}

describe('ResponsiveSlot boundaries after the shared visibility change', () => {
  it('injects no stylesheet of its own', () => {
    const { container } = render(
      <ResponsiveSlot phone={<span>Compact</span>} desktop={<span>Wide</span>} />,
    );
    expect(container.querySelectorAll('style')).toHaveLength(0);
  });

  it('splits a phone + desktop pair at the desktop boundary', () => {
    const { container } = render(
      <ResponsiveSlot phone={<span>Compact</span>} desktop={<span>Wide</span>} />,
    );

    expect(emittedQueries(container)).toEqual(['(max-width: 1023px)', '(min-width: 1024px)']);
  });

  it('covers every device range exactly once when all three slots differ', () => {
    const { container } = render(
      <ResponsiveSlot
        phone={<span>Phone</span>}
        tablet={<span>Tablet</span>}
        desktop={<span>Desktop</span>}
      />,
    );

    expect(emittedQueries(container)).toEqual([
      '(max-width: 639px)',
      '(min-width: 640px) and (max-width: 1023px)',
      '(min-width: 1024px)',
    ]);
  });

  it('cascades a sparse standard-breakpoint set without a zero-pixel boundary', () => {
    const { container } = render(
      <ResponsiveSlot xs={<span>Tiny</span>} md={<span>Medium</span>} xl={<span>Large</span>} />,
    );

    const queries = emittedQueries(container);
    expect(queries).toEqual([
      '(max-width: 767px)',
      '(min-width: 768px)',
      '(max-width: 1279px)',
      '(min-width: 1280px)',
    ]);
    expect(queries).not.toContain('not all');
    expect(queries).not.toContain('(min-width: 0px)');
  });
});
