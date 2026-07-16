import React, { type CSSProperties } from 'react';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithEngine } from '../../../../_internal/testing/helpers/engine-test-utils';
import {
  ResponsiveContext,
  type ResponsiveContextValue,
} from '../../../../runtime/responsive';
import { AppShell, useShellContext, type AppShellProps } from '..';

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

function renderShell(
  responsive: ResponsiveContextValue,
  props: Partial<AppShellProps> = {},
) {
  return renderWithEngine(
    <ResponsiveContext.Provider value={responsive}>
      <AppShell {...BASE_PROPS} {...props} />
    </ResponsiveContext.Provider>,
    'modern',
  );
}

function getShellRoot(container: HTMLElement): HTMLElement {
  return container.querySelector(
    '.rottay-app-shell[data-part="root"]',
  ) as HTMLElement;
}

describe('AppShell responsive contract', () => {
  it('keeps the fixed collapsible sidebar exclusively in desktop posture', () => {
    const { container } = renderShell(DESKTOP_CONTEXT, {
      defaultCollapsed: true,
      geometry: { sidebarCollapsedWidth: 80 },
    });

    const root = getShellRoot(container);
    const sidebar = container.querySelector(
      '[data-part="navigation-sidebar"]',
    ) as HTMLElement;
    const mainArea = container.querySelector('[data-part="main-area"]') as HTMLElement;

    expect(root).toHaveAttribute('data-posture', 'desktop');
    expect(root.style.minHeight).toBe('100dvh');
    expect(sidebar).toHaveAccessibleName('Primary navigation');
    expect(root.style.getPropertyValue('--ds-shell-inline-start-inset')).toBe(
      'calc(80px + var(--ds-shell-safe-area-left))',
    );
    expect(sidebar.style.width).toBe('var(--ds-shell-inline-start-inset)');
    expect(mainArea.style.minHeight).toBe('100dvh');
    expect(mainArea.style.marginLeft).toBe(
      'var(--ds-shell-inline-start-inset)',
    );
    expect(
      container.querySelector('[data-part="navigation-trigger"]'),
    ).toBeNull();
  });

  it.each([
    ['phone', PHONE_CONTEXT],
    ['tablet', TABLET_CONTEXT],
  ] as const)('uses compact navigation in %s posture', (posture, responsive) => {
    const { container } = renderShell(responsive);
    const root = getShellRoot(container);
    const trigger = screen.getByRole('button', { name: 'Open Primary navigation' });

    expect(root).toHaveAttribute('data-posture', posture);
    expect(
      container.querySelector('[data-part="navigation-sidebar"]'),
    ).toBeNull();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger.style.width).toBe('44px');
    expect(trigger.style.height).toBe('44px');
  });

  it('publishes and reserves one canonical bottom inset by posture', () => {
    const bottomInset =
      'calc(58px + env(safe-area-inset-bottom, 0px))';
    const { container } = renderShell(PHONE_CONTEXT, {
      geometry: { bottomInset: { phone: bottomInset } },
    });
    const root = getShellRoot(container);
    const mainArea = container.querySelector('[data-part="main-area"]') as HTMLElement;

    expect(root.style.getPropertyValue('--ds-shell-bottom-inset')).toBe(
      bottomInset,
    );
    expect(root.style.getPropertyValue('--ds-shell-top-inset')).toBe(
      'calc(64px + var(--ds-shell-safe-area-top))',
    );
    expect(mainArea.style.paddingBlockEnd).toBe(
      'var(--ds-shell-bottom-inset)',
    );
    expect(mainArea.style.boxSizing).toBe('border-box');
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

    expect(
      getShellRoot(tablet.container).style.getPropertyValue(
        '--ds-shell-bottom-inset',
      ),
    ).toBe('env(safe-area-inset-bottom, 0px)');
    expect(
      getShellRoot(desktop.container).style.getPropertyValue(
        '--ds-shell-bottom-inset',
      ),
    ).toBe('env(safe-area-inset-bottom, 0px)');
  });

  it('lets an explicit style variable override geometry resolution', () => {
    const style = {
      '--ds-shell-bottom-inset': '72px',
    } as CSSProperties;
    const { container } = renderShell(PHONE_CONTEXT, {
      geometry: { bottomInset: { phone: 58 } },
      style,
    });

    expect(
      getShellRoot(container).style.getPropertyValue('--ds-shell-bottom-inset'),
    ).toBe('72px');
  });

  it('composes compact navigation with the accessible Sheet authority', async () => {
    const { container } = renderShell(TABLET_CONTEXT);
    const trigger = screen.getByRole('button', { name: 'Open Primary navigation' });
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
    expect(dialog.style.boxSizing).toBe('border-box');
    expect(close.style.width).toBe('44px');
    expect(close.style.height).toBe('44px');
    expect(document.body.style.overflow).toBe('hidden');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => {
      expect(
        screen.queryByRole('dialog', { name: 'Primary navigation' }),
      ).toBeNull();
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
      expect(
        screen.getByRole('button', { name: 'phone:true:true' }),
      ).toBeInTheDocument();
    });
  });
});
