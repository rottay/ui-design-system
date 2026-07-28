import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernPageShell from '../engines/modern';
import type { PageShellProps } from '../contracts';
import skinStyles from '../../../../../foundation/tokens/css/runtime/engines/modern/skin/page-shell.css?raw';

function buildProps(overrides: Partial<PageShellProps> = {}): PageShellProps {
  return {
    title: 'Launchpad',
    subtitle: 'Ready for launch',
    breadcrumbs: [
      { label: 'Home', href: '/home' },
      { label: 'Launchpad' },
    ],
    tabs: [
      { key: 'overview', label: 'Overview', content: <div>Overview content</div> },
      { key: 'activity', label: 'Activity', content: <div>Activity content</div> },
      { key: 'billing', label: 'Billing', content: <div>Billing content</div> },
    ],
    activeTab: 'overview',
    onTabChange: vi.fn(),
    children: <div>Fallback content</div>,
    back: { onClick: vi.fn() },
    ...overrides,
  };
}

describe('PatternPageShell modern — wave R2+R3 craft contract', () => {
  it('resolves chrome aria-labels through the i18n channel with an English floor', () => {
    // No I18nProvider: useOptionalTranslation returns null and the documented
    // English floor renders (byte-identical to the pre-i18n contract).
    render(<ModernPageShell {...buildProps()} />);

    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
    expect(screen.getByRole('tablist', { name: 'Page tabs' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
  });

  it('marks the loading root as busy for assistive technology', () => {
    const { container } = render(<ModernPageShell {...buildProps({ loading: true })} />);
    const root = container.querySelector('[data-part="root"][data-loading="true"]');

    expect(root).toHaveAttribute('aria-busy', 'true');
  });

  it('keeps header typography in the skin, not inline on the engine', () => {
    const { container } = render(<ModernPageShell {...buildProps()} />);
    const title = container.querySelector('[data-part="title"]') as HTMLElement;
    const subtitle = container.querySelector('[data-part="subtitle"]') as HTMLElement;
    const crumb = container.querySelector('[data-part="crumb"]') as HTMLElement;
    const tab = screen.getByRole('tab', { name: 'Activity' });

    expect(title.style.fontSize).toBe('');
    expect(title.style.fontWeight).toBe('');
    expect(subtitle.style.fontSize).toBe('');
    expect(crumb.style.fontWeight).toBe('');
    expect(tab.style.fontWeight).toBe('');

    // The skin owns the moved typography verbatim.
    expect(skinStyles).toContain('font-size: var(--ds-font-size-fluid-2xl, 1.5rem)');
    expect(skinStyles).toContain('letter-spacing: var(--ds-letter-spacing-display)');
    expect(skinStyles).toContain('font-weight: var(--ds-tabs-item-font-weight-active)');
    expect(skinStyles).toContain('font-size: var(--ds-font-size-xs, 12px)');
  });

  it('follows the APG tabs keyboard contract with roving tabindex', () => {
    const onTabChange = vi.fn();
    render(<ModernPageShell {...buildProps({ onTabChange })} />);

    const overview = screen.getByRole('tab', { name: 'Overview' });
    const activity = screen.getByRole('tab', { name: 'Activity' });
    const billing = screen.getByRole('tab', { name: 'Billing' });

    expect(overview).toHaveAttribute('tabIndex', '0');
    expect(activity).toHaveAttribute('tabIndex', '-1');
    expect(billing).toHaveAttribute('tabIndex', '-1');

    const tablist = screen.getByRole('tablist', { name: 'Page tabs' });
    fireEvent.keyDown(tablist, { key: 'ArrowRight' });

    expect(onTabChange).toHaveBeenCalledWith('activity');
    expect(activity).toHaveFocus();
  });

  it('mirrors arrow keys under RTL and supports Home/End', () => {
    const onTabChange = vi.fn();
    render(
      <div dir="rtl">
        <ModernPageShell {...buildProps({ onTabChange })} />
      </div>,
    );

    const tablist = screen.getByRole('tablist', { name: 'Page tabs' });
    const billing = screen.getByRole('tab', { name: 'Billing' });

    // RTL: ArrowRight is the logical "previous" — from the first tab it wraps
    // to the last one.
    fireEvent.keyDown(tablist, { key: 'ArrowRight' });
    expect(onTabChange).toHaveBeenCalledWith('billing');
    expect(billing).toHaveFocus();

    fireEvent.keyDown(tablist, { key: 'Home' });
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveFocus();
  });
});
