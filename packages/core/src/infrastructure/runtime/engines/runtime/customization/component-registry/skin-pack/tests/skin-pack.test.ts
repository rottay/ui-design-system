/**
 * @fileoverview Skin pack tests (WO-ARC-04): registration, the bounded
 * `tokenOverrides` contract, bespoke-component precedence wiring, and DOM
 * application/revocation. `factory.tsx`'s loading seam (the effect that
 * calls `applySkinPack` for the active engine/pack) is covered separately in
 * `skin-pack-loading-seam.integration.test.tsx`, since it requires mounting
 * a real `createEngineComponent` tree.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  registerSkinPack,
  getRegisteredSkinPack,
  unregisterSkinPack,
  clearSkinPacks,
  applySkinPack,
  type SkinPack,
} from '..';
import { clearCustomRegistry, getCustomComponent, hasCustomComponent } from '../..';
import { TENANT_THEME_CONFIG_V1_SCHEMA } from '../../../../../../../compilers/kernel/foundation/schemas/tenant-theme';
import type { BrandTheme } from '../../../../../../../../foundation/contracts/composition/tenants/themes';

function resetDom(): void {
  document.head.querySelectorAll('[id^="rottay-skin-pack-"]').forEach((el) => el.remove());
  document.documentElement.removeAttribute('style');
}

describe('SkinPack registration', () => {
  beforeEach(() => {
    clearSkinPacks();
    clearCustomRegistry();
    resetDom();
  });

  it('registers and retrieves a pack by id', () => {
    const pack: SkinPack = { id: 'acme', css: '' };
    registerSkinPack(pack);
    expect(getRegisteredSkinPack('acme')).toBe(pack);
  });

  it('resolves the default pack when no id is given, matching getCustomComponent default-pack semantics', () => {
    const pack: SkinPack = { id: '__default__', css: '' };
    registerSkinPack(pack);
    expect(getRegisteredSkinPack()).toBe(pack);
    expect(getRegisteredSkinPack(undefined)).toBe(pack);
  });

  it('returns undefined for an unregistered id', () => {
    expect(getRegisteredSkinPack('missing-pack')).toBeUndefined();
  });

  it('unregisterSkinPack removes the pack and reports whether it existed', () => {
    registerSkinPack({ id: 'acme', css: '' });
    expect(unregisterSkinPack('acme')).toBe(true);
    expect(getRegisteredSkinPack('acme')).toBeUndefined();
    expect(unregisterSkinPack('acme')).toBe(false);
  });

  it('clearSkinPacks(id) clears one pack; clearSkinPacks() clears all', () => {
    registerSkinPack({ id: 'acme', css: '' });
    registerSkinPack({ id: 'globex', css: '' });

    clearSkinPacks('acme');
    expect(getRegisteredSkinPack('acme')).toBeUndefined();
    expect(getRegisteredSkinPack('globex')).toBeDefined();

    clearSkinPacks();
    expect(getRegisteredSkinPack('globex')).toBeUndefined();
  });

  it('requires a non-empty id', () => {
    expect(() => registerSkinPack({ id: '', css: '' })).toThrow(/id/);
  });
});

describe('SkinPack bounded token-override contract', () => {
  beforeEach(() => {
    clearSkinPacks();
  });

  it('accepts tokenOverrides whose keys all start with --ds-', () => {
    expect(() =>
      registerSkinPack({
        id: 'acme',
        css: '',
        tokenOverrides: { '--ds-color-primary': '#123456', '--ds-button-radius': '2px' },
      })
    ).not.toThrow();
  });

  it('rejects a tokenOverrides key that does not start with --ds-, and never registers the pack', () => {
    expect(() =>
      registerSkinPack({
        id: 'acme',
        css: '',
        // The exact defect this bound exists to stop: a pack smuggling a
        // domain-shaped custom property outside the DS's own namespace.
        tokenOverrides: { '--acme-candidate-status-color': '#123456' },
      })
    ).toThrow(/--ds-/);
    expect(getRegisteredSkinPack('acme')).toBeUndefined();
  });

  it('rejects more than 200 tokenOverrides entries, and never registers the pack', () => {
    const tokenOverrides: Record<string, string> = {};
    for (let i = 0; i < 201; i++) tokenOverrides[`--ds-example-${i}`] = '1px';

    expect(() => registerSkinPack({ id: 'acme', css: '', tokenOverrides })).toThrow(/200/);
    expect(getRegisteredSkinPack('acme')).toBeUndefined();
  });

  it('accepts exactly 200 tokenOverrides entries (boundary)', () => {
    const tokenOverrides: Record<string, string> = {};
    for (let i = 0; i < 200; i++) tokenOverrides[`--ds-example-${i}`] = '1px';

    expect(() => registerSkinPack({ id: 'acme', css: '', tokenOverrides })).not.toThrow();
  });

  it('derives its bound from the tenant-theme schema limits object (single authority)', () => {
    const cap = TENANT_THEME_CONFIG_V1_SCHEMA.limits.maxTokenOverrides;
    expect(cap).toBe(200);

    const atCap: Record<string, string> = {};
    for (let i = 0; i < cap; i++) atCap[`--ds-example-${i}`] = '1px';
    expect(() => registerSkinPack({ id: 'acme-cap', css: '', tokenOverrides: atCap })).not.toThrow();

    const overCap = { ...atCap, '--ds-example-overflow': '1px' };
    expect(() =>
      registerSkinPack({ id: 'acme-over', css: '', tokenOverrides: overCap })
    ).toThrow(new RegExp(String(cap)));
    expect(getRegisteredSkinPack('acme-over')).toBeUndefined();
  });
});

describe('SkinPack bespoke-component precedence wiring', () => {
  beforeEach(() => {
    clearSkinPacks();
    clearCustomRegistry();
  });

  it('registers pack.components under the pack id via the existing custom-component registry', () => {
    const Bespoke = () => null;
    registerSkinPack({ id: 'acme', css: '', components: { Button: Bespoke } });

    expect(hasCustomComponent('Button', 'acme')).toBe(true);
    expect(getCustomComponent('Button', 'acme')).toBe(Bespoke);
  });

  it('a component name absent from pack.components has no bespoke override under that pack', () => {
    registerSkinPack({ id: 'acme', css: '', components: { Button: () => null } });
    expect(hasCustomComponent('Card', 'acme')).toBe(false);
  });

  it('a skin pack with no components leaves the pack-scoped registry untouched', () => {
    registerSkinPack({ id: 'acme', css: "[data-part='trigger'] {}" });
    expect(hasCustomComponent('Button', 'acme')).toBe(false);
  });
});

describe('applySkinPack DOM application', () => {
  beforeEach(() => {
    clearSkinPacks();
    resetDom();
  });

  it('injects the pack css into a pack-scoped <style> element', () => {
    applySkinPack({ id: 'acme', css: "[data-part='trigger'] { color: red; }" });

    const styleEl = document.getElementById('rottay-skin-pack-acme');
    expect(styleEl?.tagName).toBe('STYLE');
    expect(styleEl?.textContent).toContain("[data-part='trigger']");
  });

  it('applies tokenOverrides as documentElement custom properties', () => {
    applySkinPack({ id: 'acme', css: '', tokenOverrides: { '--ds-button-radius': '2px' } });
    expect(document.documentElement.style.getPropertyValue('--ds-button-radius')).toBe('2px');
  });

  it('is idempotent: re-applying the same pack content does not duplicate the style element', () => {
    const pack: SkinPack = { id: 'acme', css: 'a{}', tokenOverrides: { '--ds-x': '1px' } };
    applySkinPack(pack);
    applySkinPack(pack);

    expect(document.head.querySelectorAll('#rottay-skin-pack-acme').length).toBe(1);
    expect(document.documentElement.style.getPropertyValue('--ds-x')).toBe('1px');
  });

  it('updates the style element content when the registered pack content changes', () => {
    applySkinPack({ id: 'acme', css: 'a{color:red}' });
    applySkinPack({ id: 'acme', css: 'a{color:blue}' });
    expect(document.getElementById('rottay-skin-pack-acme')?.textContent).toBe('a{color:blue}');
  });

  it('rejects an unbounded tokenOverrides map even when called directly, not only through registerSkinPack', () => {
    expect(() =>
      applySkinPack({ id: 'acme', css: '', tokenOverrides: { '--not-ds-prefixed': '1px' } })
    ).toThrow(/--ds-/);
  });

  it('no-ops without throwing when there is no tokenOverrides or brandTheme', () => {
    expect(() => applySkinPack({ id: 'acme', css: 'a{}' })).not.toThrow();
  });

  it('unregisterSkinPack removes the style element and the token custom properties it applied', () => {
    applySkinPack({ id: 'acme', css: 'a{}', tokenOverrides: { '--ds-x': '1px' } });
    unregisterSkinPack('acme');

    expect(document.getElementById('rottay-skin-pack-acme')).toBeNull();
    expect(document.documentElement.style.getPropertyValue('--ds-x')).toBe('');
  });

  it('unregistering one pack does not remove a different pack\'s tokens', () => {
    applySkinPack({ id: 'acme', css: '', tokenOverrides: { '--ds-x': '1px' } });
    applySkinPack({ id: 'globex', css: '', tokenOverrides: { '--ds-y': '2px' } });

    unregisterSkinPack('acme');

    expect(document.documentElement.style.getPropertyValue('--ds-x')).toBe('');
    expect(document.documentElement.style.getPropertyValue('--ds-y')).toBe('2px');
  });

  it('compiles brandTheme through compileBrandTheme into a second pack-scoped style element', () => {
    const brandTheme: BrandTheme = {
      id: 'acme-brand',
      name: 'Acme',
      palette: { primaryColor: '#112233' },
    };
    applySkinPack({ id: 'acme', css: '', brandTheme });

    const brandStyleEl = document.getElementById('rottay-skin-pack-brand-acme');
    expect(brandStyleEl?.tagName).toBe('STYLE');
    expect(brandStyleEl?.textContent?.length).toBeGreaterThan(0);
  });

  it('removes the brand style element on a re-apply that drops brandTheme', () => {
    const brandTheme: BrandTheme = { id: 'acme-brand', name: 'Acme' };
    applySkinPack({ id: 'acme', css: 'a{}', brandTheme });
    expect(document.getElementById('rottay-skin-pack-brand-acme')).not.toBeNull();

    applySkinPack({ id: 'acme', css: 'a{color:blue}' });
    expect(document.getElementById('rottay-skin-pack-brand-acme')).toBeNull();
  });
});
