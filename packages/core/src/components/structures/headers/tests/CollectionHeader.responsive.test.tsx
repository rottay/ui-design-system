import React from 'react';
import { waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { renderWithEngine } from '../../../../_internal/testing/helpers/engine-test-utils';
import {
  ResponsiveContext,
  type ResponsiveContextValue,
} from '../../../../runtime/responsive';
import { CollectionHeader, type CollectionHeaderProps } from '../collection';

const PHONE_CONTEXT: ResponsiveContextValue = {
  deviceClass: 'phone',
  activeBreakpoint: 'xs',
  isPhone: true,
  isTablet: false,
  isDesktop: false,
  pointer: 'coarse',
  orientation: 'portrait',
  prefersReducedMotion: true,
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

const BASE_PROPS: CollectionHeaderProps = {
  eyebrow: 'People',
  title: 'Candidates',
  subtitle: 'All active candidates',
};

const originalMatchMedia = window.matchMedia;

afterEach(() => {
  window.matchMedia = originalMatchMedia;
});

function renderHeader(
  responsive: ResponsiveContextValue,
  props: Partial<CollectionHeaderProps> = {},
) {
  return renderWithEngine(
    <ResponsiveContext.Provider value={responsive}>
      <CollectionHeader {...BASE_PROPS} {...props} />
    </ResponsiveContext.Provider>,
    'modern',
  );
}

async function readRoot(container: HTMLElement): Promise<HTMLElement> {
  await waitFor(() => {
    expect(
      container.querySelector('.ds-collection-header[data-part="root"]'),
    ).not.toBeNull();
  });

  return container.querySelector(
    '.ds-collection-header[data-part="root"]',
  ) as HTMLElement;
}

describe('CollectionHeader responsive contract', () => {
  it('uses ResponsiveProvider device authority when compact is omitted', async () => {
    const phone = renderHeader(PHONE_CONTEXT);
    const desktop = renderHeader(DESKTOP_CONTEXT);

    expect(await readRoot(phone.container)).toHaveAttribute('data-compact', 'true');
    expect(await readRoot(desktop.container)).toHaveAttribute('data-compact', 'false');
  });

  it('lets an explicit compact value override the responsive device class', async () => {
    const forcedCompact = renderHeader(DESKTOP_CONTEXT, { compact: true });
    const forcedExpanded = renderHeader(PHONE_CONTEXT, { compact: false });

    expect(await readRoot(forcedCompact.container)).toHaveAttribute('data-compact', 'true');
    expect(await readRoot(forcedExpanded.container)).toHaveAttribute('data-compact', 'false');
    expect(forcedCompact.container.querySelector('[data-part="title"]')).toHaveAttribute(
      'data-compact-layout',
      'true',
    );
    expect(forcedExpanded.container.querySelector('[data-part="title"]')).toHaveAttribute(
      'data-compact-layout',
      'false',
    );
  });

  it('keeps identity but removes supporting mobile anatomy in minimal mode', async () => {
    const { container } = renderHeader(PHONE_CONTEXT, {
      minimal: true,
      metaItems: [{ key: 'active', label: '12 active', tone: 'success' }],
      shortcuts: [{ key: 'search', label: 'Command K' }],
      quickActions: [{ key: 'invite', label: 'Invite', onClick: vi.fn() }],
    });

    const root = await readRoot(container);
    const title = container.querySelector('[data-part="title"]') as HTMLElement;

    expect(root).toHaveAttribute('data-minimal', 'true');
    expect(container.querySelector('[data-part="eyebrow"]')).not.toBeNull();
    expect(title).not.toBeNull();
    expect(title.textContent).toBe('Candidates');
    expect(container.querySelector('[data-part="subtitle"]')).toBeNull();
    expect(container.querySelector('[data-part="meta-item"]')).toBeNull();
    expect(container.querySelector('[data-part="shortcut-pill"]')).toBeNull();
    expect(container.querySelector('[data-part="quick-actions"]')).toBeNull();
    expect(container.querySelector('[data-part="secondary-rail"]')).toBeNull();
  });

  it('preserves the existing supporting anatomy when minimal is not requested', async () => {
    const { container } = renderHeader(PHONE_CONTEXT, {
      metaItems: [{ key: 'active', label: '12 active' }],
      shortcuts: [{ key: 'search', label: 'Command K' }],
      quickActions: [{ key: 'invite', label: 'Invite', onClick: vi.fn() }],
    });

    const root = await readRoot(container);
    expect(root).toHaveAttribute('data-minimal', 'false');
    expect(container.querySelector('[data-part="subtitle"]')).not.toBeNull();
    expect(container.querySelector('[data-part="meta-item"]')).not.toBeNull();
    expect(container.querySelector('[data-part="shortcut-pill"]')).not.toBeNull();
    expect(container.querySelector('[data-part="quick-actions"]')).not.toBeNull();
  });

  it('does not create a component-local 959px matchMedia subscription', async () => {
    const matchMedia = vi.fn((query: string): MediaQueryList => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    window.matchMedia = matchMedia;

    const { container } = renderHeader(PHONE_CONTEXT);
    await readRoot(container);

    const queries = matchMedia.mock.calls.map(([query]) => query);
    expect(queries).not.toContain('(max-width: 959px)');
  });
});
