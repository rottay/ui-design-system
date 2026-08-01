/**
 * SC-7: floating panels and dimming scrims are separate semantic roles.
 *
 * This contract is deliberately structural rather than value-based: a brand
 * may coincidentally choose similar colors, but the two values must travel
 * through different fields, channels and consumers. A source chain that feeds
 * the panel from the scrim channel (or vice versa) fails this test.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import type {
  TenantThemeConfigIdentity,
  TenantThemeDocument,
} from '@/foundation/contracts/composition/tenants/themes/tenant-theme';
import { bithireBrandTheme } from '@/foundation/tokens/ts/presentation/brand-themes/bithire';
import { compileBrandTheme } from '@/infrastructure/compilers/kernel/runtime/brand-theme';
import {
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
} from '..';

const IDENTITY: TenantThemeConfigIdentity = {
  tenantId: 'tenant_overlay_role_probe',
  slug: 'overlay-role-probe',
  verticalKey: 'bithire',
  rowVersion: 1,
};

const declaration = (css: string, name: string): string | undefined =>
  css.match(new RegExp(`${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*:\\s*([^;]+);`))?.[1]?.trim();

describe('SC-7 overlay panel/scrim separation', () => {
  it('keeps the foundation aliases pointed at different authorities', () => {
    const css = readFileSync(
      resolve(process.cwd(), 'src/foundation/tokens/css/foundation/themes/default.css'),
      'utf8'
    );

    const panel = declaration(css, '--ds-surface-overlay');
    const scrim = declaration(css, '--ds-overlay-scrim');
    expect(panel).toContain('--ds-color-bg-elevated');
    expect(panel).not.toContain('--ds-color-bg-overlay');
    expect(scrim).toContain('--ds-color-bg-overlay');
    expect(scrim).not.toContain('--ds-surface-overlay');
  });

  it('drill: the structural assertion rejects the former conflated chain', () => {
    const conflated = `:root {
      --ds-surface-overlay: var(--ds-color-bg-overlay);
      --ds-overlay-scrim: var(--ds-color-bg-overlay);
    }`;
    expect(declaration(conflated, '--ds-surface-overlay')).toContain('--ds-color-bg-overlay');
    expect(declaration(conflated, '--ds-surface-overlay')).not.toContain(
      '--ds-color-bg-elevated'
    );
  });

  it('static BrandTheme emits the tenant panel and veil independently', () => {
    const compiled = compileBrandTheme({ brandTheme: bithireBrandTheme, tenantSlug: 'bithire' });
    expect(compiled.cssVariables['--ds-surface-overlay']).toBe('#ffffff');
    expect(compiled.cssVariables['--ds-color-bg-overlay']).toBe('rgba(20, 40, 59, 0.42)');
  });

  it('DB Advanced can tune either role without rewriting the other', () => {
    const document: TenantThemeDocument = {
      schemaVersion: 1,
      mode: 'advanced',
      visualFoundation: {
        advanced: {
          tokenOverrides: {
            '--ds-surface-overlay': '#fffdf8',
            '--ds-color-bg-overlay': 'rgba(20, 19, 17, 0.55)',
          },
        },
      },
    };
    const artifact = compileTenantThemeConfig(
      hydrateTenantThemeConfig(document, IDENTITY),
      { verticalEnvelope: getTenantThemeVerticalEnvelope('bithire')! }
    );
    expect(artifact.variables['--ds-surface-overlay']).toBe('#fffdf8');
    expect(artifact.variables['--ds-color-bg-overlay']).toBe(
      'rgba(20, 19, 17, 0.55)'
    );
  });
});
