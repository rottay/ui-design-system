/**
 * Modern-elevation drills for the PageShell modern engine.
 * Every assertion here is the OPPOSITE of what the pre-elevation engine
 * produced, so each one fails without its paired source change.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernPageShell from '../engines/modern';
import type { PageShellProps } from '../contracts';

function buildProps(overrides: Partial<PageShellProps> = {}): PageShellProps {
  return {
    title: 'Launchpad',
    tabs: [
      { key: 'overview', label: 'Overview', content: <div>Overview content</div> },
      { key: 'activity', label: 'Activity', content: <div>Activity content</div> },
    ],
    activeTab: 'overview',
    onTabChange: vi.fn(),
    children: <div>Fallback content</div>,
    ...overrides,
  };
}

describe('PatternPageShell modern — elevation drills', () => {
  it('emits a unit-bearing max-width for the contract example numeric value', () => {
    const { container } = render(<ModernPageShell {...buildProps({ maxWidth: 1200 })} />);
    const root = container.querySelector('[data-part="root"]') as HTMLElement;

    // Before: React writes custom-property values verbatim, so this channel
    // carried `1200` and the browser dropped `max-width: 1200`.
    expect(root.style.getPropertyValue('--ds-page-shell-max-width')).toBe('1200px');
  });

  it('carries the same unit through the loading root', () => {
    const { container } = render(
      <ModernPageShell {...buildProps({ maxWidth: 960, loading: true })} />,
    );
    const root = container.querySelector('[data-part="root"]') as HTMLElement;

    expect(root.style.getPropertyValue('--ds-page-shell-max-width')).toBe('960px');
  });

  it('passes an authored string max-width through untouched', () => {
    const { container } = render(
      <ModernPageShell {...buildProps({ maxWidth: '72rem' })} />,
    );
    const root = container.querySelector('[data-part="root"]') as HTMLElement;

    expect(root.style.getPropertyValue('--ds-page-shell-max-width')).toBe('72rem');
  });

  it('falls back to the first tab when activeTab names no tab', () => {
    render(<ModernPageShell {...buildProps({ activeTab: 'retired-key' })} />);

    // Before: `tabs.find()` missed, so the panel rendered nothing at all and
    // aria-labelledby pointed at an id nothing owned.
    expect(screen.getByText('Overview content')).toBeInTheDocument();

    const panel = screen.getByRole('tabpanel');
    const labelledBy = panel.getAttribute('aria-labelledby') as string;
    expect(document.getElementById(labelledBy)).not.toBeNull();
    expect(screen.getByRole('tab', { name: 'Overview' }).id).toBe(labelledBy);
  });

  it('does not paint header skeleton chrome the loaded render will never show', () => {
    const { container } = render(
      <ModernPageShell
        {...buildProps({
          loading: true,
          hideHeader: true,
          breadcrumbs: [{ label: 'Home', href: '/' }],
          subtitle: 'Ready',
          actions: <button type="button">Create</button>,
        })}
      />,
    );

    // Before: the skeleton painted breadcrumb/title/actions/tabs blocks even
    // though `hideHeader` guarantees none of them arrive.
    expect(container.querySelectorAll('[data-part="skeleton"]')).toHaveLength(0);
    expect(
      container.querySelector('[data-part="skeleton-group"]'),
    ).toHaveAttribute('data-hide-header', 'true');
  });

  it('reserves the whole tab strip, not the first four blocks', () => {
    const manyTabs = ['a', 'b', 'c', 'd', 'e', 'f'].map((key) => ({
      key,
      label: key.toUpperCase(),
      content: <div>{key}</div>,
    }));
    const { container } = render(
      <ModernPageShell {...buildProps({ tabs: manyTabs, loading: true })} />,
    );

    expect(
      container.querySelectorAll('[data-part="skeleton"][data-block="tab"]'),
    ).toHaveLength(6);
  });

  it('announces the loading state and hides the decorative skeleton from AT', () => {
    const { container } = render(<ModernPageShell {...buildProps({ loading: true })} />);

    expect(screen.getByRole('status')).toHaveTextContent('Loading page');
    expect(container.querySelector('[data-part="skeleton-group"]')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });

  it('sizes the back glyph on the governed icon channel, not a raw pixel literal', () => {
    const { container } = render(
      <ModernPageShell {...buildProps({ back: { onClick: vi.fn() } })} />,
    );
    const glyph = container.querySelector('[data-part="back"] svg') as SVGElement;

    // Before: size={15}, an off-scale literal no tenant could reach.
    expect(glyph.getAttribute('width')).toBe('var(--ds-icon-sm-size, 1rem)');
  });
});
