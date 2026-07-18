/**
 * P-81 regression (audit SKN-02): the surface passes `id="section-<key>"` to
 * each section `Card` and `handleSectionClick` resolves that id with
 * `document.getElementById(...).scrollIntoView(...)`. Card engines used to
 * drop the caller `id`, so the lookup always missed and section navigation was
 * dead. With the pass-through honesty law the id reaches the DOM and the
 * scroll must fire.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { GuidedDraftFormSurface } from '../index';
import { renderSurface } from '../../../../../foundation/common/test-utils';
import type { ResponsiveContextValue } from '../../../../../../../infrastructure/runtime/responsive';

/** Deterministic desktop snapshot: pins the sidebar section nav layout. */
const RESOLVED_DESKTOP_TEST_CONTEXT: ResponsiveContextValue = {
  hasResolvedViewport: true,
  deviceClass: 'desktop',
  activeBreakpoint: 'xl',
  isPhone: false,
  isTablet: false,
  isDesktop: true,
  pointer: 'fine',
  orientation: 'landscape',
  prefersReducedMotion: true,
  isPhoneOrTablet: false,
  isTabletOrDesktop: true,
  isTouchDevice: false,
  virtualKeyboardInset: 0,
  isVirtualKeyboardOpen: false,
};

describe('GuidedDraftFormSurface section navigation (P-81)', () => {
  const sections = [
    { key: 'info', title: 'Basic Info', render: () => <div>Info Form</div> },
    { key: 'details', title: 'Details', render: () => <div>Details Form</div> },
  ];

  const originalScrollIntoView = Element.prototype.scrollIntoView;
  let scrollIntoView: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
  });

  afterEach(() => {
    Element.prototype.scrollIntoView = originalScrollIntoView;
  });

  it('renders every section card with its DOM id in scroll mode', async () => {
    renderSurface(
      <GuidedDraftFormSurface title="Create Event" sections={sections} onSubmit={vi.fn()} />,
      { responsiveContext: RESOLVED_DESKTOP_TEST_CONTEXT },
    );

    expect(await screen.findByText('Details Form')).toBeInTheDocument();
    expect(document.getElementById('section-info')).not.toBeNull();
    expect(document.getElementById('section-details')).not.toBeNull();
  });

  it('scrolls the target section card when a section nav item is activated', async () => {
    const { container } = renderSurface(
      <GuidedDraftFormSurface title="Create Event" sections={sections} onSubmit={vi.fn()} />,
      { responsiveContext: RESOLVED_DESKTOP_TEST_CONTEXT },
    );

    await screen.findByText('Details Form');

    // The nav items are engine-resolved Buttons behind Suspense; wait for them.
    await waitFor(() => {
      expect(
        container.querySelectorAll('.ds-guided-draft-form__section-nav-item').length,
      ).toBeGreaterThanOrEqual(2);
    });
    const navItems = container.querySelectorAll('.ds-guided-draft-form__section-nav-item');
    fireEvent.click(navItems[1]);

    const target = document.getElementById('section-details');
    expect(target).not.toBeNull();
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(scrollIntoView.mock.contexts[0]).toBe(target);
  });
});
