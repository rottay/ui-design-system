/**
 * F-20: the request's viewport reaches the first paint.
 *
 * The provider used to seed its snapshot from `useState` and correct it in a
 * passive effect, so the first committed render was a phone on every device and
 * on every server. `<Modal adaptiveFullscreen>` therefore opened fullscreen on a
 * desktop and snapped out of it a frame later.
 *
 * WHAT THIS FILE CAN AND CANNOT OBSERVE. The modern Modal renders its dialog
 * through a Portal, which resolves its container in an effect, so no server
 * render of any kind emits the dialog — `renderToReadableStream` of an open
 * Modal yields its inline anchor and nothing else. The server leg is therefore
 * asserted where it is observable, on the snapshot the provider publishes, and
 * the Modal is asserted on the FIRST COMMITTED render, which is the frame the
 * finding is about.
 */

import { describe, expect, it, vi, afterEach } from 'vitest';
import React from 'react';
import { cleanup, render } from '@testing-library/react';
import { renderToString } from 'react-dom/server';

import ModernModal from '@/components/primitives/feedback/modal/engines/modern';

import { ResponsiveProvider } from '..';
import { usePhoneBreakpoint } from '../phone-state';
import { resetResponsiveMediaStore } from '../../../../runtime/media-snapshot';

/** A `matchMedia` that answers for one fixed viewport width. */
function viewportMock(width: number) {
  return vi.fn((query: string) => {
    const min = /\(min-width:\s*(\d+)px\)/.exec(query);
    const max = /\(max-width:\s*(\d+)px\)/.exec(query);
    const matches =
      query.includes('pointer: coarse')
        ? width < 640
        : (min ? width >= Number(min[1]) : true) && (max ? width <= Number(max[1]) : true);
    return {
      matches,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
      onchange: null,
    } as unknown as MediaQueryList;
  });
}

function withViewport(width: number, run: () => void): void {
  const original = window.matchMedia;
  window.matchMedia = viewportMock(width) as unknown as typeof window.matchMedia;
  resetResponsiveMediaStore();
  try {
    run();
  } finally {
    window.matchMedia = original;
    resetResponsiveMediaStore();
  }
}

/** The modern Modal's panel, which carries the posture attributes. */
function modalSurface(): HTMLElement {
  const surface = document.querySelector("[data-part='surface']") as HTMLElement | null;
  expect(surface).not.toBeNull();
  return surface as HTMLElement;
}

function PhoneProbe(): React.ReactElement {
  return <output data-testid="is-phone">{String(usePhoneBreakpoint())}</output>;
}

afterEach(() => {
  cleanup();
  resetResponsiveMediaStore();
  document.documentElement.removeAttribute('data-ds-viewport');
});

describe('the request viewport reaches the server snapshot', () => {
  it('renders a desktop request as a desktop, not as a phone', () => {
    const html = renderToString(
      <ResponsiveProvider ssrViewport="desktop">
        <PhoneProbe />
      </ResponsiveProvider>,
    );

    expect(html).toContain('>false<');
  });

  it('still renders a request that declared nothing mobile-first', () => {
    const html = renderToString(
      <ResponsiveProvider>
        <PhoneProbe />
      </ResponsiveProvider>,
    );

    // The design system does not invent a viewport it was never told about.
    expect(html).toContain('>true<');
  });

  it('reads the hint `mountTenantTheme` projected when no prop is passed', () => {
    document.documentElement.setAttribute('data-ds-viewport', 'desktop');

    const html = renderToString(
      <ResponsiveProvider>
        <PhoneProbe />
      </ResponsiveProvider>,
    );

    expect(html).toContain('>false<');
  });
});

describe('adaptiveFullscreen on the first committed render', () => {
  it('renders a desktop request non-fullscreen, with no correcting frame', () => {
    withViewport(1440, () => {
      render(
        <ResponsiveProvider>
          <ModernModal open onClose={() => {}} title="Desktop">
            body
          </ModernModal>
        </ResponsiveProvider>,
      );

      expect(modalSurface().getAttribute('data-adaptive-fullscreen')).toBe('false');
    });
  });

  it('still renders a phone request fullscreen', () => {
    withViewport(390, () => {
      render(
        <ResponsiveProvider>
          <ModernModal open onClose={() => {}} title="Phone">
            body
          </ModernModal>
        </ResponsiveProvider>,
      );

      expect(modalSurface().getAttribute('data-adaptive-fullscreen')).toBe('true');
    });
  });
});
