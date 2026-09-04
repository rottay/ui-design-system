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
import { lowerBrandThemeFixture } from "@tests/support/theme-lowering";
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
      resolve(process.cwd(), 'src/foundation/tokens/css/foundation/themes/default/index.css'),
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

  /* F2A-1 Lote F-2. El pin exacto se CONSERVA: `#ffffff` es el valor resuelto que
   * bithire debe emitir para el panel, y aflojarlo a "definido, opaco y distinto
   * del velo" aceptaria un `#00ff00` sin chistar (correccion del DT a una primera
   * version mia que hizo justo eso). Lo que se agrega es la afirmacion que SC-7
   * siempre quiso hacer y que el pin solo no hace: que panel y velo resuelvan a
   * autoridades DISTINTAS. Las dos cosas, no una en lugar de la otra.
   *
   * Por que importa que esten juntas: el pin solo se cayo cuando el Lote F removio
   * la declaracion del tema aunque la separacion siguiera intacta, y la separacion
   * sola habria pasado con el panel pintando cualquier cosa. Juntas, la prueba
   * distingue los dos modos de romperse. */
  it('static BrandTheme emits the tenant panel and veil independently', () => {
    const compiled = lowerBrandThemeFixture({ brandTheme: bithireBrandTheme, tenantSlug: 'bithire' });
    const panel = compiled.cssVariables['--ds-surface-overlay'];
    const veil = compiled.cssVariables['--ds-color-bg-overlay'];
    // El pin duro, intacto.
    expect(panel).toBe('#ffffff');
    expect(veil).toBe('rgba(20, 40, 59, 0.42)');
    // Y encima, la separacion de roles que da nombre a SC-7.
    expect(panel).not.toBe(veil);
    // El velo es scrim: translucido por construccion. El panel es superficie que
    // un tooltip o un popover pintan ENCIMA, asi que es opaco. Confundirlos
    // volveria falsa alguna de estas dos.
    expect(veil).toMatch(/rgba?\(/i);
    expect(panel).not.toMatch(/rgba?\(/i);
  });

  it('drill: the role-separation half dies if panel and veil collapse to one origin', () => {
    /* El contrafactual que el DT pidio, sobre la mitad que el pin no cubre:
     * plantar el colapso y ver morir el predicado de separacion. */
    const collapsed = {
      '--ds-surface-overlay': 'rgba(20, 40, 59, 0.42)',
      '--ds-color-bg-overlay': 'rgba(20, 40, 59, 0.42)',
    };
    const panel = collapsed['--ds-surface-overlay'];
    const veil = collapsed['--ds-color-bg-overlay'];
    expect(() => expect(panel).not.toBe(veil)).toThrow();
    expect(() => expect(panel).not.toMatch(/rgba?\(/i)).toThrow();
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
