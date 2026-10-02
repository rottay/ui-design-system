/**
 * feedback/modal modern engine — overlay intensity ladder pins (OVM-ADOPT, WO-EVI-02 lane).
 *
 * `overlayIntensity` stamps `data-intensity` on the backdrop so the modern
 * skin can paint the tenant ladder channel `--ds-overlay-<step>`. A custom
 * `scrim` (`overlayOpacity`) keeps precedence: when both are passed the scrim
 * wins and the attribute is NOT stamped.
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import ModernModal from '../engines/modern';
import {
  ResponsiveContext,
  type ResponsiveContextValue,
} from '../../../../../infrastructure/runtime/responsive';

const DESKTOP_RESPONSIVE_CONTEXT: ResponsiveContextValue = {
  deviceClass: 'desktop',
  activeBreakpoint: 'lg',
  isPhone: false,
  isTablet: false,
  isDesktop: true,
  pointer: 'fine',
  orientation: 'landscape',
  prefersReducedMotion: false,
  isPhoneOrTablet: false,
  isTabletOrDesktop: true,
  isTouchDevice: false,
};

function renderModal(ui: React.ReactElement) {
  return render(
    <ResponsiveContext.Provider value={DESKTOP_RESPONSIVE_CONTEXT}>
      {ui}
    </ResponsiveContext.Provider>,
  );
}

function backdrop(): HTMLElement {
  const el = document.querySelector("[data-part='backdrop']");
  expect(el, "expected data-part='backdrop'").not.toBeNull();
  return el as HTMLElement;
}

describe('feedback/modal modern — overlayIntensity', () => {
  it('stamps data-intensity="heavy" on the backdrop when overlayIntensity="heavy"', () => {
    renderModal(
      <ModernModal open title="t" overlayIntensity="heavy" onClose={() => {}}>
        Body
      </ModernModal>,
    );

    expect(backdrop()).toHaveAttribute('data-intensity', 'heavy');
  });

  it('omits the data-intensity attribute when the prop is absent', () => {
    renderModal(
      <ModernModal open title="t" onClose={() => {}}>
        Body
      </ModernModal>,
    );

    expect(backdrop()).not.toHaveAttribute('data-intensity');
  });

  it('lets a custom scrim win: data-scrim="custom" present, data-intensity absent', () => {
    renderModal(
      <ModernModal open title="t" overlayOpacity={0.6} overlayIntensity="heavy" onClose={() => {}}>
        Body
      </ModernModal>,
    );

    expect(backdrop()).toHaveAttribute('data-scrim', 'custom');
    expect(backdrop()).not.toHaveAttribute('data-intensity');
  });
});
