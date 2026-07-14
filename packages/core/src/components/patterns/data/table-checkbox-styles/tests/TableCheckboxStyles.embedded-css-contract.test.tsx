import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TableCheckboxStyles } from '..';

const BASE_PAINT_DECLARATIONS = [
  'transform: translateX(-8px) scale(0.9)',
  'transform: translateX(0) scale(1)',
  'box-shadow: 0 0 0 0 var(--ds-color-primary-200)',
  'box-shadow: 0 0 0 4px var(--ds-color-primary-100)',
  'accent-color: var(--ds-color-primary)',
  'background: var(--ds-color-neutral-50)',
  'color: var(--ds-color-primary) !important',
] as const;

describe('TableCheckboxStyles embedded CSS exemption contract', () => {
  it('emits the seven identity-bound base paint declarations only when explicitly mounted', () => {
    const { container, unmount } = render(<TableCheckboxStyles />);
    const style = container.querySelector('style');

    expect(style).not.toBeNull();
    const css = style?.textContent ?? '';
    for (const declaration of BASE_PAINT_DECLARATIONS) {
      expect(css).toContain(declaration);
    }

    const emittedPaint = css.match(
      /(?:^|[;{]\s*)(?:transform|box-shadow|accent-color|background|color)\s*:[^;}]+/gm,
    );
    expect(emittedPaint).toHaveLength(7);

    unmount();
    expect(container.querySelector('style')).toBeNull();
  });

  it('keeps caller CSS after the protected base contract without rewriting it', () => {
    const customStyles = '.tenant-owned-checkbox { outline: 3px solid rebeccapurple; }';
    const { container } = render(<TableCheckboxStyles customStyles={customStyles} />);
    const css = container.querySelector('style')?.textContent ?? '';

    expect(css.endsWith(`\n${customStyles}`)).toBe(true);
    expect(css.indexOf(BASE_PAINT_DECLARATIONS[0])).toBeLessThan(css.indexOf(customStyles));
  });
});
