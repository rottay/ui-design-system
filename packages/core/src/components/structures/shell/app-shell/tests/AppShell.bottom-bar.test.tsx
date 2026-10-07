import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithEngine } from '@tests/support/engine';
import {
  ResponsiveContext,
  type ResponsiveContextValue,
} from '../../../../../infrastructure/runtime/responsive';
import { AppShell } from '..';
import type { AppShellProps } from '../../../foundation/shell-contracts';

const PHONE_CONTEXT: ResponsiveContextValue = {
  deviceClass: 'phone',
  activeBreakpoint: 'xs',
  isPhone: true,
  isTablet: false,
  isDesktop: false,
  pointer: 'coarse',
  orientation: 'portrait',
  prefersReducedMotion: false,
  isPhoneOrTablet: true,
  isTabletOrDesktop: false,
  isTouchDevice: true,
};

const DESKTOP_CONTEXT: ResponsiveContextValue = {
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

const BASE_PROPS: AppShellProps = {
  sidebar: {
    navigationLabel: 'Primary navigation',
    nav: <a href="/candidates">Candidates</a>,
  },
  children: <div>Page content</div>,
};

function renderShell(responsive: ResponsiveContextValue, props: Partial<AppShellProps> = {}) {
  return renderWithEngine(
    <ResponsiveContext.Provider value={responsive}>
      <AppShell {...BASE_PROPS} {...props} />
    </ResponsiveContext.Provider>,
    'modern',
  );
}

describe('AppShell bottom-bar presentation', () => {
  it('renders the navigation as a persistent bottom bar on phone, not an overlay', () => {
    const { container } = renderShell(PHONE_CONTEXT, {
      adapt: { phone: { navigation: 'bottom-bar' } },
    });
    const root = container.querySelector('.ds-app-shell[data-part="root"]') as HTMLElement;
    const bar = container.querySelector('[data-part="navigation-bottom-bar"]');

    expect(root).toHaveAttribute('data-posture', 'phone');
    // The bottom bar is not an overlay: the compact flag stays off, so no
    // drawer trigger, no Sheet dialog and no sidebar track render.
    expect(root).toHaveAttribute('data-compact', 'false');
    expect(bar).not.toBeNull();
    expect(bar?.tagName).toBe('NAV');
    expect(bar).toHaveAccessibleName('Primary navigation');
    expect(bar).toHaveAttribute('data-compact', 'false');
    expect(bar?.textContent).toContain('Candidates');
    expect(container.querySelector('[data-part="navigation-sidebar"]')).toBeNull();
    expect(
      screen.queryByRole('button', { name: 'Open Primary navigation' }),
    ).toBeNull();
    expect(screen.queryByRole('dialog', { name: 'Primary navigation' })).toBeNull();
  });

  it('keeps the bottom inset at the platform default: no track inset is published', () => {
    const { container } = renderShell(PHONE_CONTEXT, {
      adapt: { phone: { navigation: 'bottom-bar' } },
    });
    const root = container.querySelector('.ds-app-shell[data-part="root"]') as HTMLElement;
    const mainArea = container.querySelector('[data-part="main-area"]') as HTMLElement;

    expect(root.style.getPropertyValue('--ds-shell-inline-start-inset')).toBe('0px');
    expect(mainArea).toHaveAttribute('data-compact', 'false');
  });

  it('keeps the desktop sidebar when no posture declares the bottom bar', () => {
    const { container } = renderShell(DESKTOP_CONTEXT, {
      adapt: { phone: { navigation: 'bottom-bar' } },
    });

    expect(
      container.querySelector('[data-part="navigation-sidebar"]'),
    ).not.toBeNull();
    expect(container.querySelector('[data-part="navigation-bottom-bar"]')).toBeNull();
    expect(
      screen.queryByRole('button', { name: 'Open Primary navigation' }),
    ).toBeNull();
  });
});
