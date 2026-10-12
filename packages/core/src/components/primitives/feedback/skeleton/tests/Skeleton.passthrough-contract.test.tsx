/**
 * Pass-through law contract (P-88) for the modern Skeleton: its parts are the
 * anatomy the bone renderer reads, so a caller `data-part` reaches no element
 * it paints and the engine-stamped tree is the same with or without one;
 * `className` is the composition door.
 */
import React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import ModernSkeleton from '../engines/modern';

const CALLER_PART = 'p88-caller-part';

const parts = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('[data-part]')).map((node) => node.getAttribute('data-part'));

describe('modern Skeleton pass-through law', () => {
  it.each(['circular', 'rectangular', 'rounded'] as const)(
    'the %s block keeps its root part, drops the caller part and lands the caller class',
    (variant) => {
      const { container } = render(
        <ModernSkeleton variant={variant} className="caller-hook" data-part={CALLER_PART} />,
      );

      expect(container.querySelector(`[data-part="${CALLER_PART}"]`)).toBeNull();
      expect(container.querySelector(".rottay-skeleton.caller-hook[data-part='root']")).toBeTruthy();
      expect(parts(container)).toEqual(['root']);
    },
  );

  it('the composed wrapper keeps its whole anatomy, drops the caller part and lands the caller class', () => {
    const { container } = render(
      <ModernSkeleton avatar title paragraph={{ rows: 2 }} className="caller-hook" data-part={CALLER_PART} />,
    );

    expect(container.querySelector(`[data-part="${CALLER_PART}"]`)).toBeNull();
    expect(container.querySelector(".rottay-skeleton-wrapper.caller-hook[data-part='root']")).toBeTruthy();
    expect(parts(container)).toEqual(['root', 'avatar', 'content', 'title', 'line', 'line']);
  });

  it('renders the same tree with and without a caller part', () => {
    const bare = render(<ModernSkeleton avatar title paragraph={{ rows: 2 }} />);
    const named = render(<ModernSkeleton avatar title paragraph={{ rows: 2 }} data-part={CALLER_PART} />);

    expect(named.container.innerHTML).toBe(bare.container.innerHTML);
  });
});
