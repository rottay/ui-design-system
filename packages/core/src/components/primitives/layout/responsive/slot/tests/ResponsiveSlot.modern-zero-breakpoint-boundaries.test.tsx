import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ResponsiveSlot } from '..';

function emittedQueries(container: HTMLElement): string[] {
  const queries: string[] = [];
  for (const tag of Array.from(container.querySelectorAll('style'))) {
    const pattern = /@media ([^{]+)\{/g;
    const css = tag.textContent ?? '';
    let match = pattern.exec(css);
    while (match !== null) {
      queries.push((match[1] ?? '').trim());
      match = pattern.exec(css);
    }
  }
  return queries;
}

describe('ResponsiveSlot boundaries after the shared visibility change', () => {
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
