import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { TenantConfig } from '../../../foundation/contracts';
import type { BrandTheme, TenantAppearance } from '../../../foundation/contracts/composition/tenants/themes';
import { DesignSystemProvider } from '../../../infrastructure/runtime/bootstrap';
import { PatternBrandStudio } from '../customization/brand-studio';
import { BrandingPreviewSandbox } from '../customization/branding-preview-sandbox';
import ModernTenantPreview from '../customization/tenant-preview/engines/modern';
import RusticTenantPreview from '../customization/tenant-preview/engines/rustic';

// WO-SKIN-06 CK-H1 migration contract. These tests exercise the hooks consumed
// by the extracted skins; paint and injected-CSS behavior remain
// owned by their existing focused tests plus ck-h1-inert-prestep.test.mjs.

const TENANT_CONFIG = {
  slug: 'ck-h1-preview',
  name: 'CK-H1 Preview',
  primaryColor: '#3b82f6',
  secondaryColor: '#10b981',
  personality: 'formal' as const,
  logo: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>',
};

const TEST_TENANT: TenantConfig = {
  slug: 'ck-h1-studio',
  name: 'CK-H1 Studio',
  engine: 'rustic',
  theme: 'light',
  plan: 'enterprise',
  features: ['all'],
  branding: { companyName: 'CK-H1 Studio' },
};

const STUDIO_THEME: BrandTheme = {
  id: 'ck-h1-theme',
  name: 'CK-H1 Theme',
  palette: {
    primaryColor: '#4f46e5',
    secondaryColor: '#0ea5e9',
    accentColor: '#f59e0b',
    successColor: '#16a34a',
    warningColor: '#d97706',
    errorColor: '#dc2626',
    infoColor: '#2563eb',
    darkPrimaryColor: '#818cf8',
    darkBackgroundColor: '#0b1020',
  },
  typography: {
    fontFamilyBase: 'Inter, sans-serif',
    headingWeightBias: 'heavier',
    labelStyle: 'sentence',
  },
  surfaces: {
    borderRadius: { sm: '6px', md: '10px', lg: '14px', xl: '20px' },
    effectIntensity: 1,
    densityScale: 1,
  },
};

const SANDBOX_APPEARANCE: TenantAppearance = {
  general: {
    palette: { primary: '#4f46e5', secondary: '#0ea5e9', accent: '#f59e0b' },
    typography: {
      fontFamilyBase: 'Inter, sans-serif',
      fontFamilyHeading: 'Inter, sans-serif',
    },
    shape: { buttonStyle: 'soft' },
    surfaces: { elevation: 'elevated' },
  },
  advanced: {
    tokenOverrides: {
      '--ds-card-bg': '#ffffff',
      '--ds-card-title-color': '#111827',
    },
  },
};

function StudioHarness({
  children,
  engine = 'rustic',
}: {
  children: React.ReactNode;
  engine?: 'modern' | 'rustic' | 'classic';
}): React.ReactElement {
  return (
    <DesignSystemProvider tenantConfig={TEST_TENANT} forceEngine={engine} skipCssLoading>
      {children}
    </DesignSystemProvider>
  );
}

const queryAll = (container: HTMLElement, selector: string) => container.querySelectorAll(selector);

describe.each([
  ['modern', ModernTenantPreview],
  ['rustic', RusticTenantPreview],
] as const)('TenantPreview %s CK-H1 anatomy', (engine, Preview) => {
  it('exposes the complete palette, samples and finite states without disturbing tenant CSS lifecycle', () => {
    const { container, unmount } = render(<Preview config={{ ...TENANT_CONFIG, engine }} />);
    const root = container.querySelector(
      `.ds-pattern-tenant-preview.ds-engine-${engine}[data-part="root"]`
    ) as HTMLElement;

    expect(root).toHaveAttribute('data-tenant', 'ck-h1-preview');
    expect(queryAll(root, '[data-part="header"]')).toHaveLength(1);
    expect(queryAll(root, '[data-part="logo"]')).toHaveLength(1);
    expect(queryAll(root, '[data-part="tenant-name"]')).toHaveLength(1);
    expect(queryAll(root, '[data-part="tenant-slug"]')).toHaveLength(1);

    for (const palette of ['primary', 'secondary']) {
      const swatches = queryAll(root, `[data-part="swatch"][data-palette="${palette}"]`);
      expect(swatches).toHaveLength(10);
      expect(Array.from(swatches, (swatch) => Number(swatch.getAttribute('data-step')))).toEqual([
        50, 100, 200, 300, 400, 500, 600, 700, 800, 900,
      ]);
    }

    for (const variant of ['primary', 'outlined', 'default']) {
      expect(queryAll(root, `[data-part="button"][data-variant="${variant}"]`)).toHaveLength(1);
    }
    for (const part of [
      'sample-card',
      'accent-bar',
      'preview-card-title',
      'preview-card-body',
      'sample-input',
      'sample-table',
      'table-head',
    ]) {
      expect(queryAll(root, `[data-part="${part}"]`), part).toHaveLength(1);
    }
    expect(queryAll(root, '[data-part="preview-table-cell"]')).toHaveLength(9);
    expect(queryAll(root, '[data-part="personality-tile"]')).toHaveLength(8);
    expect(queryAll(root, '[data-part="badge"][data-status="active"]')).toHaveLength(2);
    expect(queryAll(root, '[data-part="badge"][data-status="pending"]')).toHaveLength(2);
    expect(queryAll(root, '[data-part="badge"][data-status="draft"]')).toHaveLength(1);

    const generatedCss = root.querySelector('style')?.textContent ?? '';
    expect(generatedCss).toContain('ck-h1-preview');

    unmount();
    expect(root).not.toHaveAttribute('data-tenant');
  });
});

describe('BrandingPreviewSandbox CK-H1 createElement anatomy', () => {
  it('preserves instance scoping while exposing the full and compact state trees', () => {
    const { container, rerender, unmount } = render(<BrandingPreviewSandbox appearance={SANDBOX_APPEARANCE} />);

    const root = container.querySelector('.ds-pattern-branding-preview-sandbox[data-part="root"]') as HTMLElement;
    expect(root).toHaveAttribute('data-state', 'full');
    const scopeAttribute = root.getAttributeNames().find((attribute) => attribute.startsWith('data-preview-'));
    expect(scopeAttribute).toBeDefined();
    expect(container.querySelector('style')?.textContent).toContain(`[${scopeAttribute}]`);
    expect(container.querySelector('style')?.textContent).toContain('--ds-color-primary: #4f46e5;');

    for (const variant of ['primary', 'secondary', 'default', 'ghost']) {
      expect(queryAll(root, `[data-part="button"][data-variant="${variant}"]`)).toHaveLength(1);
    }
    for (const state of ['default', 'error']) {
      expect(queryAll(root, `[data-part="input"][data-state="${state}"]`)).toHaveLength(1);
    }
    for (const state of ['default', 'elevated']) {
      expect(queryAll(root, `[data-part="card"][data-state="${state}"]`)).toHaveLength(1);
    }
    for (const state of ['active', 'warning', 'error', 'info']) {
      expect(queryAll(root, `[data-part="badge"][data-state="${state}"]`).length).toBeGreaterThan(0);
    }
    expect(queryAll(root, '[data-part="table"]')).toHaveLength(1);
    expect(queryAll(root, '[data-part="table-head"]')).toHaveLength(1);
    expect(queryAll(root, '[data-part="title"]')).toHaveLength(1);
    expect(queryAll(root, '[data-part="subtitle"]')).toHaveLength(3);

    rerender(<BrandingPreviewSandbox appearance={SANDBOX_APPEARANCE} compact />);
    const compactRoot = container.querySelector('.ds-pattern-branding-preview-sandbox') as HTMLElement;
    expect(compactRoot).toHaveAttribute('data-state', 'compact');
    expect(queryAll(compactRoot, '[data-part="card"][data-state="elevated"]')).toHaveLength(0);
    expect(queryAll(compactRoot, '[data-part="table"]')).toHaveLength(0);
    expect(queryAll(compactRoot, '[data-part="title"]')).toHaveLength(0);

    unmount();
    expect(container.children).toHaveLength(0);
  });
});

describe('PatternBrandStudio CK-H1 anatomy and behavior', () => {
  it.each(['modern', 'rustic', 'classic'] as const)(
    'retains every class-authoritative skin hook on the rendered %s hosts',
    async (engine) => {
      const { container, unmount } = render(
        <StudioHarness engine={engine}>
          <PatternBrandStudio
            value={STUDIO_THEME}
            title={`CK-H1 ${engine} host probe`}
            description="Host forwarding probe"
          />
        </StudioHarness>
      );

      await screen.findByText(`CK-H1 ${engine} host probe`);
      const root = container.querySelector('.ds-pattern-brand-studio') as HTMLElement;
      const actionPanel = root.querySelector('.ds-pattern-brand-studio__action-panel') as HTMLElement;
      expect(actionPanel).not.toBeNull();
      expect(
        actionPanel.matches(
          '.ds-pattern-brand-studio__action-panel.ds-pattern-brand-studio__action-panel.ds-pattern-brand-studio__action-panel'
        )
      ).toBe(true);

      for (const [className, part] of [
        ['ds-pattern-brand-studio__color-swatch', 'color-swatch'],
        ['ds-pattern-brand-studio__section', 'section'],
        ['ds-pattern-brand-studio__contrast-summary', 'contrast-summary'],
        ['ds-pattern-brand-studio__preview-content', 'preview-content'],
        ['ds-pattern-brand-studio__field-label', 'field-label'],
        ['ds-pattern-brand-studio__contrast-label', 'contrast-label'],
        ['ds-pattern-brand-studio__contrast-message', 'contrast-message'],
        ['ds-pattern-brand-studio__preview-fallback', 'preview-fallback'],
        ['ds-pattern-brand-studio__description', 'description'],
        ['ds-pattern-brand-studio__editor-heading', 'editor-heading'],
        ['ds-pattern-brand-studio__preview-heading', 'preview-heading'],
        ['ds-pattern-brand-studio__action-helper', 'action-helper'],
      ] as const) {
        expect(root.querySelector(`.${className}[data-part="${part}"]`), `${engine}:${part}`).not.toBeNull();
      }

      unmount();
    }
  );

  it('exposes editor, both preview grounds, contrast and action states while callbacks remain live', async () => {
    const onChange = vi.fn();
    const { container, unmount } = render(
      <StudioHarness>
        <PatternBrandStudio value={STUDIO_THEME} onChange={onChange} title="CK-H1 Brand Studio" />
      </StudioHarness>
    );

    await screen.findByText('CK-H1 Brand Studio');
    const root = container.querySelector('.ds-pattern-brand-studio') as HTMLElement;
    expect(root).toHaveAttribute('data-part', 'root');
    expect(root).toHaveAttribute('data-state', 'idle');
    expect(queryAll(root, '.ds-pattern-brand-studio__section')).toHaveLength(5);
    expect(queryAll(root, '.ds-pattern-brand-studio__field').length).toBeGreaterThan(30);
    expect(queryAll(root, '.ds-pattern-brand-studio__color-swatch')).toHaveLength(23);
    expect(queryAll(root, '.ds-pattern-brand-studio__field-input').length).toBeGreaterThan(30);

    for (const ground of ['dark', 'light']) {
      expect(
        queryAll(root, `[data-part="preview-panel"][data-surface="${ground}"][data-ground="${ground}"]`)
      ).toHaveLength(1);
      expect(
        queryAll(root, `[data-part="preview-content"][data-surface="${ground}"][data-ground="${ground}"]`)
      ).toHaveLength(1);
      expect(queryAll(root, `[data-part="contrast-summary"][data-ground="${ground}"]`)).toHaveLength(1);
    }

    const injectedCss = Array.from(root.querySelectorAll('style'), (style) => style.textContent ?? '').join('\n');
    expect(injectedCss).toMatch(/\.brand-studio-dark-[^{ ]+ \{/);
    expect(injectedCss).toMatch(/\.brand-studio-light-[^{ ]+ \{/);

    const firstFieldInput = queryAll(root, '.ds-pattern-brand-studio__field-input')[0] as HTMLElement;
    const firstColorInput = (
      firstFieldInput.matches('input') ? firstFieldInput : firstFieldInput.querySelector('input')
    ) as HTMLInputElement;
    fireEvent.change(firstColorInput, { target: { value: '#123456' } });
    await waitFor(() => expect(onChange).toHaveBeenCalled());
    expect(onChange.mock.calls.at(-1)?.[0].palette.primaryColor).toBe('#123456');

    fireEvent.click(await screen.findByRole('button', { name: 'Run check' }));
    await waitFor(() => expect(root).toHaveAttribute('data-state', 'checked'));
    expect(queryAll(root, '.ds-pattern-brand-studio__action[data-state="complete"]')).toHaveLength(1);
    expect(queryAll(root, '[data-part="violation"][data-severity="error"]').length).toBeGreaterThan(0);

    unmount();
    expect(container.children).toHaveLength(0);
  });
});
