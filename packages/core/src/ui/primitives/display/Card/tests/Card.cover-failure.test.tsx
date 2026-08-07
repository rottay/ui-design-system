/**
 * Cover media failure for the modern Card.
 *
 * A `cover` that 404s used to leave the browser's broken-image glyph inside the
 * frame: the primitive shipped media with no error fallback. The wrapper now
 * survives the failure (reserved geometry, no layout shift) while the dead
 * `img` is dropped and the skin paints the wrapper as neutral inset material.
 */
import React from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import ModernCard from '../engines/modern';

const SKIN = readFileSync(
  resolve(
    __dirname,
    '../../../../../foundation/tokens/css/runtime/engines/modern/skin/card.css',
  ),
  'utf8',
);

describe('Card modern -- cover media failure', () => {
  it('drops the dead image and keeps the cover wrapper for reserved geometry', () => {
    const { container } = render(
      <ModernCard title="Broken" cover="/missing.jpg">
        Content
      </ModernCard>
    );

    const image = container.querySelector("[data-part='cover-image']") as HTMLImageElement;
    expect(image).toBeTruthy();

    fireEvent.error(image);

    const wrapper = container.querySelector("[data-part='cover']") as HTMLElement;
    expect(wrapper).toBeTruthy();
    expect(wrapper).toHaveAttribute('data-error', 'true');
    expect(container.querySelector("[data-part='cover-image']")).toBeNull();
  });

  it('recovers when the caller swaps in a new cover source', () => {
    const { container, rerender } = render(
      <ModernCard title="Broken" cover="/missing.jpg">
        Content
      </ModernCard>
    );

    fireEvent.error(container.querySelector("[data-part='cover-image']") as HTMLImageElement);
    expect(container.querySelector("[data-part='cover']")).toHaveAttribute('data-error', 'true');

    rerender(
      <ModernCard title="Broken" cover="/present.jpg">
        Content
      </ModernCard>
    );

    const wrapper = container.querySelector("[data-part='cover']") as HTMLElement;
    expect(wrapper.hasAttribute('data-error')).toBe(false);
    expect(container.querySelector("[data-part='cover-image']")).toHaveAttribute(
      'src',
      '/present.jpg',
    );
  });

  it('applies the failure treatment to a bottom-positioned cover too', () => {
    const { container } = render(
      <ModernCard title="Broken" cover="/missing.jpg" coverPosition="bottom">
        Content
      </ModernCard>
    );

    fireEvent.error(container.querySelector("[data-part='cover-image']") as HTMLImageElement);

    expect(container.querySelector("[data-part='cover']")).toHaveAttribute('data-error', 'true');
  });

  it('the modern skin paints the failed wrapper instead of leaving a hole', () => {
    expect(SKIN).toContain("[data-part='cover'][data-error='true']");
  });
});
