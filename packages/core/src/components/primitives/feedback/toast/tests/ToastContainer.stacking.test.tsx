/**
 * ToastContainer compress/fan stacking-physics tests (WO-CRA-07).
 *
 * Before this WO, `ToastContainer` laid every visible toast out with plain
 * flex `gap` and no depth cue -- the stack read as a flat list, and CRA-02's
 * undo countdown ring owns only the per-toast timer, not how multiple toasts
 * relate to each other. These tests fail if the transform-only compress/fan
 * (front toast untransformed, earlier toasts scaled/offset) or its
 * reduced-motion guard is ever deleted.
 */
import React, { useEffect } from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it, vi, afterEach } from 'vitest';

import { Toast, ToastProvider, useToast } from '..';
import { renderSurface } from '../../../../surfaces/foundation/common/test-utils';

function stubReducedMotion(reduced: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: reduced && query.includes('prefers-reduced-motion'),
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

function SeedThreeToasts(): React.ReactElement | null {
  const api = useToast();

  useEffect(() => {
    api.show({ title: 'First', duration: 0 });
    api.show({ title: 'Second', duration: 0 });
    api.show({ title: 'Third', duration: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

describe('ToastContainer stacking physics', () => {
  it('leaves the most recent toast untransformed and compresses earlier ones behind it', async () => {
    stubReducedMotion(false);
    renderSurface(
      <ToastProvider position="top-right">
        <SeedThreeToasts />
        <Toast.Container />
      </ToastProvider>
    );

    await screen.findByText('Third');

    const first = screen.getByText('First').closest('[data-stack-depth]') as HTMLElement;
    const second = screen.getByText('Second').closest('[data-stack-depth]') as HTMLElement;
    const third = screen.getByText('Third').closest('[data-stack-depth]') as HTMLElement;

    // The depth-derived transform rides a custom property the skin consumes;
    // the container stamps the value, `skin/toast-compounds.css` applies it.
    const stackTransform = (el: HTMLElement) =>
      el.style.getPropertyValue('--ds-toast-stack-transform');

    // Most recently added toast is the front layer: full scale, no offset.
    expect(third.getAttribute('data-stack-depth')).toBe('0');
    expect(stackTransform(third)).toBe('none');

    // Earlier toasts progressively compress -- transform-only (scale + translateY).
    expect(second.getAttribute('data-stack-depth')).toBe('1');
    expect(stackTransform(second)).toContain('scale(');
    expect(stackTransform(second)).toContain('translateY(');

    expect(first.getAttribute('data-stack-depth')).toBe('2');
    expect(stackTransform(first)).toContain('scale(');
  });

  it('transitions the stacking transform on --ds-motion-normal so a dismissal re-settles the rest', async () => {
    stubReducedMotion(false);
    renderSurface(
      <ToastProvider position="top-right">
        <SeedThreeToasts />
        <Toast.Container />
      </ToastProvider>
    );

    await screen.findByText('Third');
    const second = screen.getByText('Second').closest('[data-stack-depth]') as HTMLElement;
    expect(second.style.transition).toContain('transform');
    expect(second.style.transition).toContain('var(--ds-motion-normal)');
  });

  it('disables the stacking transition under prefers-reduced-motion', async () => {
    stubReducedMotion(true);
    renderSurface(
      <ToastProvider position="top-right">
        <SeedThreeToasts />
        <Toast.Container />
      </ToastProvider>
    );

    await screen.findByText('Third');
    const first = screen.getByText('First').closest('[data-stack-depth]') as HTMLElement;
    const second = screen.getByText('Second').closest('[data-stack-depth]') as HTMLElement;

    expect(first.style.transition).toBe('none');
    expect(second.style.transition).toBe('none');
  });
});
