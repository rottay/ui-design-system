import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernLink from '../engines/modern';

const SKIN = readFileSync(
  resolve(
    __dirname,
    '../../../../../foundation/tokens/css/runtime/engines/modern/skin/link.css'
  ),
  'utf8'
);

describe('Link modern engine contract', () => {
  it('stamps the skin data contract and no DaisyUI/Tailwind paint', () => {
    render(
      <ModernLink href="/docs" type="primary">
        Docs
      </ModernLink>
    );

    const link = screen.getByRole('link', { name: 'Docs' });
    expect(link).toHaveClass('rottay-link-shell', 'rottay-link-shell--modern');
    expect(link).toHaveAttribute('data-part', 'root');
    expect(link).toHaveAttribute('data-variant', 'primary');
    expect(link).toHaveAttribute('data-underline', 'true');
    expect(link.className).not.toMatch(/(^|\s)(link|link-info|link-primary|no-underline|opacity-50|pointer-events-none|cursor-not-allowed)(\s|$)/);
    // The skin owns the underline and its offset; the engine inlines neither.
    expect(link.getAttribute('style')).toBeNull();
  });

  it('renders the open-external affordance for external links by default', () => {
    render(
      <ModernLink href="https://example.com" external>
        Reference
      </ModernLink>
    );

    const link = screen.getByRole('link', { name: 'Reference (opens in new tab)' });
    expect(link).toHaveAttribute('data-external', 'true');
    const icon = link.querySelector('[data-part="external-icon"]');
    expect(icon).not.toBeNull();
    expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(icon?.querySelector('[data-icon-name="action.open-external"]')).not.toBeNull();
  });

  it('lets callers suppress the external affordance icon', () => {
    render(
      <ModernLink href="https://example.com" external externalIcon={false}>
        Reference
      </ModernLink>
    );

    const link = screen.getByRole('link', { name: 'Reference (opens in new tab)' });
    expect(link.querySelector('[data-part="external-icon"]')).toBeNull();
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('suppresses navigation when disabled and drops href', () => {
    const onClick = vi.fn();
    render(
      <ModernLink href="/blocked" disabled onClick={onClick}>
        Blocked
      </ModernLink>
    );

    const text = screen.getByText('Blocked');
    fireEvent.click(text);
    expect(onClick).not.toHaveBeenCalled();
    expect(text).toHaveAttribute('aria-disabled', 'true');
    expect(text).toHaveAttribute('data-disabled', 'true');
    expect(text.getAttribute('href')).toBeNull();
  });
});

describe('Link modern skin resilience', () => {
  it('owns every interactive state with tone-derived fallbacks', () => {
    for (const state of [':visited', ':hover', ':active', ':focus-visible']) {
      expect(SKIN).toContain(`.rottay-link-shell.rottay-link-shell--modern[data-part='root']${state}`);
    }
    // States derive from the resolved tone channel along a monotonically
    // darkening ramp: base 16% -> hover 30% -> active 42% black mix.
    expect(SKIN).toContain('color-mix(in srgb, var(--ds-link-tone) 84%');
    expect(SKIN).toContain('color-mix(in srgb, var(--ds-link-tone) 70%');
    expect(SKIN).toContain('color-mix(in srgb, var(--ds-link-tone) 58%');
    expect(SKIN).toContain('color-mix(in srgb, var(--ds-link-tone) 76%');
  });

  it('keeps the disabled policy out of the pointer path and off hardcoded utilities', () => {
    expect(SKIN).toContain("[data-disabled='true'][data-disabled='true']");
    expect(SKIN).toContain('pointer-events: none;');
    expect(SKIN).not.toContain('opacity-50');
  });

  it('mirrors the external icon in RTL with logical gap only', () => {
    expect(SKIN).toContain(':dir(rtl)');
    expect(SKIN).toContain("[data-part='external-icon']");
    expect(SKIN).toContain('margin-inline-start');
    expect(SKIN).not.toMatch(/margin-(left|right)\s*:/);
  });

  it('covers reduced motion and forced colors', () => {
    expect(SKIN).toContain('@media (prefers-reduced-motion: reduce)');
    expect(SKIN).toContain('@media (forced-colors: active)');
    expect(SKIN).toContain('LinkText');
    expect(SKIN).toContain('VisitedText');
  });
});
