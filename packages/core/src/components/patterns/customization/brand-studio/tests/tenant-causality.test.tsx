/**
 * BrandStudio tenant-causality + exact-restore contract (Lane B).
 *
 * Fails against the pre-change pattern: clearing an editor field left the empty
 * string (and the empty group above it) in the emitted draft, so no control was
 * the exact inverse of itself — the document could not deep-equal the untouched
 * default and the DB-bound `chrome` projection carried the empty value forward.
 */

import React, { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DesignSystemProvider } from '../../../../../infrastructure/runtime/bootstrap';
import type { TenantConfig } from '../../../../../foundation/contracts';
import type { BrandTheme } from '../../../../../foundation/contracts/composition/tenants/themes';
import type {
  TenantThemeConfigIdentity,
  TenantThemeDocument,
} from '../../../../../foundation/contracts/composition/tenants/themes/tenant-theme';
import {
  PatternBrandStudio,
  buildSurfaceVariables,
  normalizeBrandTheme,
} from '../index';
import { brandThemeToTenantAppearanceAdvanced } from '../runtime/file-export';
import {
  buildTenantThemePreviewScope,
  compileTenantThemePreview,
} from '../runtime/tenant-theme-preview';

const TEST_TENANT: TenantConfig = {
  slug: 'brand-studio-causality',
  name: 'Brand Studio Causality',
  engine: 'rustic',
  theme: 'light',
  plan: 'enterprise',
  features: ['all'],
  branding: { companyName: 'Brand Studio Causality' },
};

const DEFAULT_THEME: BrandTheme = {
  id: 'causality',
  name: 'Causality',
  palette: { primaryColor: '#4f46e5' },
};

const IDENTITY: TenantThemeConfigIdentity = {
  tenantId: 'tenant_causality',
  slug: 'causality-tenant',
  verticalKey: 'bithire',
  rowVersion: 1,
};

function makeDocument(primary: string): TenantThemeDocument {
  return {
    schemaVersion: 1,
    mode: 'simple',
    appearance: { palette: { primary } },
  };
}

/** Controlled host: the studio drives real state, exactly as a console would. */
function ControlledStudio({
  initial,
  onTheme,
}: {
  initial: BrandTheme;
  onTheme: (theme: BrandTheme) => void;
}): React.ReactElement {
  const [theme, setTheme] = useState<BrandTheme>(initial);
  return (
    <PatternBrandStudio
      vertical="bithire"
      value={theme}
      title="Causality Studio"
      onChange={(next) => {
        setTheme(next);
        onTheme(next);
      }}
    />
  );
}

function styleText(): string {
  return Array.from(document.querySelectorAll('style'))
    .map((element) => element.textContent ?? '')
    .join('\n');
}

describe('PatternBrandStudio tenant causality (static BrandTheme path)', () => {
  it('mutates the rendered tree from a chrome control and restores the exact default document when cleared', async () => {
    const seen: BrandTheme[] = [];
    render(
      <DesignSystemProvider tenantConfig={TEST_TENANT} forceEngine="rustic" skipCssLoading>
        <ControlledStudio initial={DEFAULT_THEME} onTheme={(next) => seen.push(next)} />
      </DesignSystemProvider>
    );
    await screen.findByText('Causality Studio');

    const before = styleText();
    expect(before).not.toContain('--ds-input-bg: #101010;');

    const control = screen.getByLabelText('Input bg');
    fireEvent.change(control, { target: { value: '#101010' } });

    // Causality: the control reaches the rendered tree through the compiler.
    expect(styleText()).toContain('--ds-input-bg: #101010;');

    // Exact restore: clearing the same control is its inverse on every path.
    fireEvent.change(screen.getByLabelText('Input bg'), { target: { value: '' } });

    const restored = seen[seen.length - 1];
    expect(restored).toEqual(normalizeBrandTheme(DEFAULT_THEME));
    expect(restored.chrome).toBeUndefined();
    expect(styleText()).toBe(before);
  });

  it('does not leak a cleared chrome value into the DB-bound appearance projection', async () => {
    const seen: BrandTheme[] = [];
    render(
      <DesignSystemProvider tenantConfig={TEST_TENANT} forceEngine="rustic" skipCssLoading>
        <ControlledStudio initial={DEFAULT_THEME} onTheme={(next) => seen.push(next)} />
      </DesignSystemProvider>
    );
    await screen.findByText('Causality Studio');

    fireEvent.change(screen.getByLabelText('Card bg'), { target: { value: '#0b0b0b' } });
    expect(
      brandThemeToTenantAppearanceAdvanced(seen[seen.length - 1]!).chrome?.cardComponent?.bg
    ).toBe('#0b0b0b');

    fireEvent.change(screen.getByLabelText('Card bg'), { target: { value: '  ' } });
    const advanced = brandThemeToTenantAppearanceAdvanced(seen[seen.length - 1]!);
    // `chrome` projects verbatim, so an empty leaf would reach the DB document.
    expect(advanced.chrome?.cardComponent).toBeUndefined();
    expect(advanced.chrome).toBeUndefined();
  });

  it('keeps a contract-required leaf present when its control is cleared', async () => {
    const seen: BrandTheme[] = [];
    render(
      <DesignSystemProvider tenantConfig={TEST_TENANT} forceEngine="rustic" skipCssLoading>
        <ControlledStudio initial={DEFAULT_THEME} onTheme={(next) => seen.push(next)} />
      </DesignSystemProvider>
    );
    await screen.findByText('Causality Studio');

    fireEvent.change(screen.getByLabelText('Primary'), { target: { value: '' } });
    const emitted = seen[seen.length - 1]!;
    expect(emitted.palette).toBeDefined();
    expect(emitted.palette!.primaryColor).toBe('');
  });
});

describe('PatternBrandStudio static/DB channel parity', () => {
  it('drives --ds-color-primary from the same tenant input on both authoring paths', () => {
    const staticVars = buildSurfaceVariables(
      { id: 'p', name: 'P', palette: { primaryColor: '#2f6b9a' } },
      { key: 'dark', baseTheme: 'dark', vertical: 'bithire', tenantSlug: 'parity' }
    ).vars;
    expect(staticVars['--ds-color-primary']).toBe('#2f6b9a');

    const compiled = compileTenantThemePreview({
      document: makeDocument('#2F6B9A'),
      identity: IDENTITY,
    });
    expect(compiled.issues).toBeNull();
    const scoped = buildTenantThemePreviewScope(compiled.artifact!);
    expect(scoped.css).toContain('--ds-color-primary');
    expect(scoped.css.toLowerCase()).toContain('#2f6b9a');
  });

  it('restores the exact DB-path stylesheet when the document returns to its default', () => {
    const cssFor = (primary: string): string => {
      const compiled = compileTenantThemePreview({
        document: makeDocument(primary),
        identity: IDENTITY,
      });
      return buildTenantThemePreviewScope(compiled.artifact!).css;
    };

    const base = cssFor('#2F6B9A');
    const edited = cssFor('#B4451F');
    expect(edited).not.toBe(base);
    // A fresh document object with the default value reproduces it byte for byte.
    expect(cssFor('#2F6B9A')).toBe(base);
  });
});
