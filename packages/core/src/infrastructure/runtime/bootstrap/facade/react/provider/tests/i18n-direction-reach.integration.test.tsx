/**
 * One root i18n owner, and its direction reaches portaled content.
 *
 * `dir` is the channel most likely to acquire a second authority, because a
 * portaled overlay leaves its trigger's DOM ancestry and every overlay is
 * tempted to re-derive direction for itself. The DS answer is that the root
 * `I18nProvider` is the only writer and the portal substrate CARRIES that value
 * across the boundary — it never recomputes a second opinion.
 *
 * The unit halves are proven elsewhere and not repeated: the provider's own
 * `dir`/`lang` writing and `useDirection` (`i18n/runtime/context/provider/tests`),
 * and an overlay re-stamping a hand-written `dir` ancestor
 * (`Tooltip.modern.test.tsx`). What is unproven until here is the END-TO-END
 * reach: locale prop -> single root writer -> anchor lineage -> portal.
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import type { TenantConfig } from '@/foundation/contracts';
import ModernTooltip from '@/ui/primitives/display/Tooltip/engines/modern';
import { DesignSystemProvider } from '..';

function tenantConfig(): TenantConfig {
  return {
    slug: 'direction-reach',
    name: 'Direction reach',
    theme: 'base',
    plan: 'enterprise',
    features: [],
    branding: { companyName: 'Direction reach' },
  } as TenantConfig;
}

function tree(locale: 'ar' | 'en'): React.ReactElement {
  return (
    <DesignSystemProvider
      tenantConfig={tenantConfig()}
      locale={locale}
      forceEngine="modern"
      skipCssLoading
    >
      <ModernTooltip content="direction probe" visible>
        <button>trigger</button>
      </ModernTooltip>
    </DesignSystemProvider>
  );
}

afterEach(() => {
  document.documentElement.removeAttribute('dir');
  document.documentElement.removeAttribute('lang');
  document.documentElement.removeAttribute('data-tenant');
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.removeAttribute('data-engine');
  document.documentElement.removeAttribute('data-density');
});

describe('i18n direction reach', () => {
  it('carries the root locale into a portaled overlay', async () => {
    render(tree('ar'));

    // The single writer publishes it...
    await waitFor(() => {
      expect(document.documentElement.dir).toBe('rtl');
      expect(document.documentElement.lang).toBe('ar');
    });

    // ...and the portaled surface, which is no longer a DOM descendant of its
    // trigger, carries the direction ON ITSELF. Reading an ancestor would be
    // vacuous: `closest('[dir]')` walks all the way to the `<html>` element the
    // provider just wrote, so it would pass even if nothing crossed the portal.
    const tooltip = await screen.findByRole('tooltip');
    expect(document.getElementById('rottay-portal-root')?.contains(tooltip)).toBe(true);
    await waitFor(() => {
      expect(tooltip.getAttribute('dir')).toBe('rtl');
      expect(tooltip.getAttribute('lang')).toBe('ar');
    });
  });

  it('answers ltr for a Latin locale, so the assertion is not direction-blind', async () => {
    // Anti-cheat. Without this, an overlay that hardcoded `dir="rtl"`, or a
    // probe that read a stale attribute left by another test, would satisfy the
    // test above.
    render(tree('en'));

    await waitFor(() => {
      expect(document.documentElement.dir).toBe('ltr');
    });

    const tooltip = await screen.findByRole('tooltip');
    expect(document.getElementById('rottay-portal-root')?.contains(tooltip)).toBe(true);
    await waitFor(() => {
      expect(tooltip.getAttribute('dir')).toBe('ltr');
      expect(tooltip.getAttribute('lang')).toBe('en');
    });
  });

  it('re-projects the portal when the root locale switches at runtime', async () => {
    const view = render(tree('en'));
    await screen.findByRole('tooltip');
    await waitFor(() => expect(document.documentElement.dir).toBe('ltr'));

    view.rerender(tree('ar'));

    await waitFor(() => {
      expect(document.documentElement.dir).toBe('rtl');
    });
    const tooltip = await screen.findByRole('tooltip');
    await waitFor(() => {
      expect(tooltip.getAttribute('dir')).toBe('rtl');
      expect(tooltip.getAttribute('lang')).toBe('ar');
    });
  });
});
