/**
 * Sheet modern engine — overlay intensity ladder pins (OVM-ADOPT, WO-EVI-02 lane).
 *
 * `overlayIntensity` stamps `data-intensity` on the backdrop so the modern
 * skin can paint the tenant ladder channel `--ds-overlay-<step>`.
 */

import React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import ModernSheet from '../engines/modern';

function backdrop(): HTMLElement {
  const el = document.body.querySelector("[data-part='backdrop']");
  expect(el, "expected data-part='backdrop'").not.toBeNull();
  return el as HTMLElement;
}

describe('Sheet modern — overlayIntensity', () => {
  it('stamps data-intensity="light" on the backdrop when overlayIntensity="light"', () => {
    render(
      <ModernSheet open onOpenChange={() => {}} overlayIntensity="light">
        Sheet body
      </ModernSheet>,
    );

    expect(backdrop()).toHaveAttribute('data-intensity', 'light');
  });

  it('omits the data-intensity attribute when the prop is absent', () => {
    render(
      <ModernSheet open onOpenChange={() => {}}>
        Sheet body
      </ModernSheet>,
    );

    expect(backdrop()).not.toHaveAttribute('data-intensity');
  });
});
