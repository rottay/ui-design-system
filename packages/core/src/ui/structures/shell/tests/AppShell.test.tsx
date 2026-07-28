import React, { type CSSProperties } from 'react';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithEngine } from '../../../../tooling/testing/helpers/engine';
import {
  ResponsiveContext,
  type ResponsiveContextValue,
} from '../../../../infrastructure/runtime/responsive';
import { AppShell, useShellContext, type AppShellProps } from '..';
import shellStyles from '../../../../foundation/tokens/css/presentation/components/skin/app-shell.css?raw';

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

const TABLET_CONTEXT: ResponsiveContextValue = {
  ...PHONE_CONTEXT,
  deviceClass: 'tablet',
  activeBreakpoint: 'md',
  isPhone: false,
  isTablet: true,
  orientation: 'landscape',
  isTabletOrDesktop: true,
};

const DESKTOP_CONTEXT: ResponsiveContextValue = {
  ...TABLET_CONTEXT,
  deviceClass: 'desktop',
  activeBreakpoint: 'lg',
  isTablet: false,
  isDesktop: true,
  pointer: 'fine',
  isPhoneOrTablet: false,
  isTouchDevice: false,
};

const BASE_PROPS: AppShellProps = {
  sidebar: {
    navigationLabel: 'Primary navigation',
    logo: <span>Tenant logo</span>,
    nav: <a href="/candidates">Candidates</a>,
    footer: <span>Signed in</span>,
  },
  header: { left: <span>Workspace</span> },
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

function getShellRoot(container: HTMLElement): HTMLElement {
  return container.querySelector('.rottay-app-shell[data-part="root"]') as HTMLElement;
}

describe('AppShell responsive contract', () => {
  it('publishes default geometry through overridable CSS inputs', () => {
    const { container } = renderShell(DESKTOP_CONTEXT);
    const root = getShellRoot(container);
    const logo = container.querySelector('[data-part="navigation-logo"]') as HTMLElement;
    const header = container.querySelector('[data-part="header"]') as HTMLElement;

    expect(root.style.getPropertyValue('--ds-shell-inline-start-inset')).toBe(
      'calc(var(--ds-shell-sidebar-width, 296px) + var(--ds-shell-safe-area-left))',
    );
    expect(root.style.getPropertyValue('--ds-shell-header-height')).toBe(
      'var(--ds-shell-header-block-size, var(--ds-shell-topbar-height, 64px))',
    );
    expect(root.style.getPropertyValue('--ds-shell-top-inset')).toBe(
      'calc(var(--ds-shell-header-block-size, var(--ds-shell-topbar-height, 64px)) + var(--ds-shell-safe-area-top))',
    );
    expect(logo.style.getPropertyValue('--ds-shell-resolved-sidebar-header-block-size')).toBe(
      'var(--ds-shell-sidebar-header-block-size, var(--ds-shell-topbar-height, 104px))',
    );
    expect(logo).toHaveClass('rottay-app-shell__navigation-logo');
    expect(logo.style.height).toBe('');
    expect(header).toHaveClass('rottay-app-shell__header');
    expect(header.style.height).toBe('');
    expect(shellStyles).toContain('height: var(--ds-shell-resolved-sidebar-header-block-size)');
    expect(shellStyles).toContain('height: var(--ds-shell-top-inset)');
  });

  it('keeps the fixed collapsible sidebar exclusively in desktop posture', () => {
    const { container } = renderShell(DESKTOP_CONTEXT, {
      defaultCollapsed: true,
      geometry: { sidebarCollapsedWidth: 80 },
    });

    const root = getShellRoot(container);
    const sidebar = container.querySelector('[data-part="navigation-sidebar"]') as HTMLElement;
    const mainArea = container.querySelector('[data-part="main-area"]') as HTMLElement;

    expect(root).toHaveAttribute('data-posture', 'desktop');
    expect(root).toHaveAttribute('data-collapsed', 'true');
    expect(root).toHaveAttribute('data-compact', 'false');
    expect(root.style.minHeight).toBe('');
    expect(sidebar).toHaveAccessibleName('Primary navigation');
    expect(sidebar).toHaveClass('rottay-app-shell__navigation-sidebar');
    expect(sidebar).toHaveAttribute('data-collapsed', 'true');
    expect(root.style.getPropertyValue('--ds-shell-inline-start-inset')).toBe(
      'calc(var(--ds-shell-sidebar-collapsed-width, 80px) + var(--ds-shell-safe-area-left))',
    );
    expect(sidebar.style.width).toBe('');
    expect(mainArea).toHaveClass('rottay-app-shell__main');
    expect(mainArea).toHaveAttribute('data-compact', 'false');
    expect(mainArea.style.minHeight).toBe('');
    expect(mainArea.style.marginLeft).toBe('');
    expect(container.querySelector('[data-part="navigation-trigger"]')).toBeNull();
  });

  it.each([
    ['phone', PHONE_CONTEXT],
    ['tablet', TABLET_CONTEXT],
  ] as const)('uses compact navigation in %s posture', (posture, responsive) => {
    const { container } = renderShell(responsive);
    const root = getShellRoot(container);
    const trigger = screen.getByRole('button', {
      name: 'Open Primary navigation',
    });

    expect(root).toHaveAttribute('data-posture', posture);
    expect(root).toHaveAttribute('data-compact', 'true');
    expect(container.querySelector('[data-part="navigation-sidebar"]')).toBeNull();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveClass('rottay-app-shell__navigation-trigger');
    expect(trigger.style.width).toBe('');
    expect(trigger.style.height).toBe('');
  });

  it('publishes and reserves one canonical bottom inset by posture', () => {
    const bottomInset = 'calc(58px + env(safe-area-inset-bottom, 0px))';
    const { container } = renderShell(PHONE_CONTEXT, {
      geometry: { bottomInset: { phone: bottomInset } },
    });
    const root = getShellRoot(container);
    const mainArea = container.querySelector('[data-part="main-area"]') as HTMLElement;

    expect(root.style.getPropertyValue('--ds-shell-bottom-inset')).toBe(bottomInset);
    expect(root.style.getPropertyValue('--ds-shell-top-inset')).toBe(
      'calc(var(--ds-shell-header-block-size, var(--ds-shell-topbar-height, 64px)) + var(--ds-shell-safe-area-top))',
    );
    expect(mainArea).toHaveClass('rottay-app-shell__main');
    expect(mainArea).toHaveAttribute('data-compact', 'true');
    expect(mainArea.style.paddingBlockEnd).toBe('');
    expect(mainArea.style.boxSizing).toBe('');
  });

  it('does not reserve a phone-only bottom navigation on tablet or desktop', () => {
    const phoneOnlyInset = {
      phone: 'calc(58px + env(safe-area-inset-bottom, 0px))',
    } as const;
    const tablet = renderShell(TABLET_CONTEXT, {
      geometry: { bottomInset: phoneOnlyInset },
    });
    const desktop = renderShell(DESKTOP_CONTEXT, {
      geometry: { bottomInset: phoneOnlyInset },
    });

    expect(getShellRoot(tablet.container).style.getPropertyValue('--ds-shell-bottom-inset')).toBe(
      'env(safe-area-inset-bottom, 0px)',
    );
    expect(getShellRoot(desktop.container).style.getPropertyValue('--ds-shell-bottom-inset')).toBe(
      'env(safe-area-inset-bottom, 0px)',
    );
  });

  it('lets an explicit style variable override geometry resolution', () => {
    const style = {
      '--ds-shell-bottom-inset': '72px',
    } as CSSProperties;
    const { container } = renderShell(PHONE_CONTEXT, {
      geometry: { bottomInset: { phone: 58 } },
      style,
    });

    expect(getShellRoot(container).style.getPropertyValue('--ds-shell-bottom-inset')).toBe('72px');
  });

  it('composes compact navigation with the accessible Sheet authority', async () => {
    renderShell(TABLET_CONTEXT, {
      collapsed: true,
      geometry: {
        sidebarWidth: 312,
        sidebarCollapsedWidth: 72,
        sidebarHeaderHeight: 32,
      },
    });
    const trigger = screen.getByRole('button', {
      name: 'Open Primary navigation',
    });
    trigger.focus();
    fireEvent.click(trigger);

    const dialog = await screen.findByRole(
      'dialog',
      { name: 'Primary navigation' },
      { timeout: 15_000 },
    );
    const close = within(dialog).getByRole('button', {
      name: 'Close Primary navigation',
    });

    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('data-placement', 'left');
    expect(dialog).toHaveClass('rottay-app-shell__navigation-drawer');
    expect(dialog.style.boxSizing).toBe('');
    expect(dialog.style.getPropertyValue('--ds-shell-resolved-drawer-inline-size')).toBe(
      'min(var(--ds-shell-sidebar-width, 312px), 100dvw)',
    );
    expect(dialog.style.width).toBe('var(--ds-shell-resolved-drawer-inline-size)');
    const drawerHeader = dialog.querySelector(
      '[data-part="navigation-drawer-header"]',
    ) as HTMLElement;
    expect(
      drawerHeader.style.getPropertyValue('--ds-shell-resolved-sidebar-header-min-block-size'),
    ).toBe(
      'max(var(--ds-shell-sidebar-header-block-size, var(--ds-shell-topbar-height, 32px)), 44px)',
    );
    expect(drawerHeader).toHaveClass('rottay-app-shell__navigation-drawer-header');
    expect(drawerHeader.style.minHeight).toBe('');
    expect(shellStyles).toContain(
      'min-height: var(--ds-shell-resolved-sidebar-header-min-block-size)',
    );
    expect(close).toHaveClass('rottay-app-shell__navigation-close');
    expect(close.style.width).toBe('');
    expect(close.style.height).toBe('');
    expect(document.body.style.overflow).toBe('hidden');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Primary navigation' })).toBeNull();
    });
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(document.body.style.overflow).toBe('');
  });

  it('exposes posture and compact navigation controls through shell context', async () => {
    function ContextProbe() {
      const shell = useShellContext();
      return (
        <button type="button" onClick={shell?.openNavigation}>
          {shell?.posture}:{String(shell?.isCompact)}:{String(shell?.navigationOpen)}
        </button>
      );
    }

    renderShell(PHONE_CONTEXT, { children: <ContextProbe /> });
    const probe = screen.getByRole('button', { name: 'phone:true:false' });
    fireEvent.click(probe);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'phone:true:true' })).toBeInTheDocument();
    });
  });

  it('keeps numeric geometry props unchanged in shell context', () => {
    function GeometryProbe() {
      const shell = useShellContext();
      return (
        <output data-testid="shell-geometry">
          {shell?.sidebarWidth}:{shell?.sidebarCollapsedWidth}:{shell?.headerHeight}
        </output>
      );
    }

    const style = {
      '--ds-shell-sidebar-width': '344px',
      '--ds-shell-sidebar-collapsed-width': '68px',
      '--ds-shell-header-block-size': '72px',
      '--ds-shell-sidebar-header-block-size': '88px',
    } as CSSProperties;
    const { container } = renderShell(DESKTOP_CONTEXT, {
      geometry: {
        sidebarWidth: 320,
        sidebarCollapsedWidth: 76,
        headerHeight: 68,
        sidebarHeaderHeight: 92,
      },
      style,
      children: <GeometryProbe />,
    });
    const root = getShellRoot(container);

    expect(root.style.getPropertyValue('--ds-shell-sidebar-width')).toBe('344px');
    expect(root.style.getPropertyValue('--ds-shell-sidebar-collapsed-width')).toBe('68px');
    expect(root.style.getPropertyValue('--ds-shell-header-block-size')).toBe('72px');
    expect(root.style.getPropertyValue('--ds-shell-sidebar-header-block-size')).toBe('88px');
    expect(root.style.getPropertyValue('--ds-shell-inline-start-inset')).toBe(
      'calc(var(--ds-shell-sidebar-width, 320px) + var(--ds-shell-safe-area-left))',
    );
    expect(root.style.getPropertyValue('--ds-shell-top-inset')).toBe(
      'calc(var(--ds-shell-header-block-size, var(--ds-shell-topbar-height, 68px)) + var(--ds-shell-safe-area-top))',
    );
    expect(screen.getByTestId('shell-geometry')).toHaveTextContent('320:76:68');
  });

  it('publishes neutral shell remapping hooks from the canonical bundled skin', () => {
    const hooks = [
      '--ds-shell-navigation-background',
      '--ds-shell-navigation-border',
      '--ds-shell-navigation-radius',
      '--ds-shell-navigation-shadow',
      '--ds-shell-navigation-body-padding',
      '--ds-shell-navigation-body-padding-collapsed',
      '--ds-shell-navigation-footer-padding',
      '--ds-shell-navigation-footer-padding-collapsed',
      '--ds-shell-header-padding-inline',
      '--ds-shell-header-background',
      '--ds-shell-header-border',
      '--ds-shell-header-radius',
      '--ds-shell-header-shadow',
      '--ds-shell-header-inset-block-start',
      '--ds-shell-header-inset-inline',
      '--ds-shell-main-transition',
      '--ds-shell-main-background',
      '--ds-shell-main-border',
      '--ds-shell-footer-padding',
      '--ds-shell-footer-background',
      '--ds-shell-footer-border',
      '--ds-shell-footer-shadow',
    ];

    for (const hook of hooks) {
      expect(shellStyles).toContain(hook);
    }
  });

  it('owns hover/active/reduced-motion chrome states in the skin, not the engine', () => {
    // Wave R2+R3: the compact chrome buttons gained hover + active washes via
    // documented escape hatches, motion rides --ds-motion-* channels, and the
    // sidebar/main collapse transition is gated for reduced motion.
    expect(shellStyles).toContain('[data-part="navigation-close"]:hover');
    expect(shellStyles).toContain('[data-part="navigation-trigger"]:hover');
    expect(shellStyles).toContain('--ds-shell-navigation-action-hover-bg');
    expect(shellStyles).toContain('--ds-shell-navigation-action-active-bg');
    expect(shellStyles).toContain('@media (prefers-reduced-motion: reduce)');

    const { container } = renderShell(PHONE_CONTEXT);
    const trigger = screen.getByRole('button', { name: 'Open Primary navigation' });
    expect(trigger.style.background).toBe('');
    expect(trigger.style.transition).toBe('');
    expect(container.querySelector('[data-part="navigation-trigger"]')).toBe(trigger);
  });
});
