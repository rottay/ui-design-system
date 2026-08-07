import React from 'react';
import { render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import ModernCockpitHeader from '../engines/modern';

function setScrollY(value: number) {
  Object.defineProperty(window, 'scrollY', {
    value,
    configurable: true,
    writable: true,
  });
}

afterEach(() => setScrollY(0));

describe('CockpitHeader modern — rescue drills', () => {
  it('adopts the compact posture when mounted into an already-scrolled document', () => {
    setScrollY(400);
    const { container } = render(
      <ModernCockpitHeader title="Detail" subtitle="Meta" sticky />,
    );

    // Before: the listener was registered but never run once, so the header
    // painted the resting posture until the user scrolled again.
    expect(container.querySelector('[data-part="root"]')).toHaveAttribute(
      'data-compact',
      'true',
    );
    expect(container.querySelector('[data-part="subtitle"]')).toBeNull();
  });

  it('leaves a non-sticky header at rest regardless of scroll offset', () => {
    setScrollY(400);
    const { container } = render(<ModernCockpitHeader title="Detail" subtitle="Meta" />);

    expect(container.querySelector('[data-part="root"]')).toHaveAttribute(
      'data-compact',
      'false',
    );
  });
});
