/**
 * @fileoverview Skin Pack API - Rottay Design System
 * @description Registers a white-label skin — a stylesheet plus a bounded
 * token set — for the `custom` engine, so a tenant can restyle the flagship
 * component set without forking React components.
 *
 * @remarks
 * `custom.ts` already lets a tenant register bespoke React components,
 * pack-scoped by a string key that matches `TenantConfig.componentPack`. A
 * `SkinPack` registers under that SAME key: `css` targets the
 * `[data-part]`/`[data-state]` anatomy contract (`behavior/anatomy.ts`) and
 * `tokenOverrides`/`brandTheme` supply the palette. `factory.tsx` applies the
 * active pack's CSS and tokens to the document whenever the resolved engine
 * is `custom`; component resolution itself is unchanged — a bespoke
 * component registered under the same pack id (via `pack.components` or
 * directly via `registerCustomComponent`) still wins, exactly as it did
 * before this module existed.
 *
 * A pack cannot introduce domain semantics through its typed fields:
 * `tokenOverrides` is bound to the `--ds-` namespace (same contract as
 * `TenantAppearanceAdvanced.tokenOverrides`) and capped at 200 entries, and
 * `brandTheme` is the fixed `BrandTheme` shape, not an open bag. Neither can
 * carry a `candidate`/`interview`/`company` field the DS does not already
 * define. This module does NOT parse `css` content — a pack's stylesheet is
 * opaque text, so a `content: '...'` declaration inside it is not rejected.
 * `components` remains exactly as unsandboxed as `registerCustomComponent`
 * was before this module existed: arbitrary React, by design (the escape
 * hatch), not narrowed by anything here.
 *
 * @example Register a skin pack
 * ```tsx
 * import { registerSkinPack } from '@rottay/design-system';
 *
 * registerSkinPack({
 *   id: 'acme-pack',
 *   css: `[data-part='trigger'] { border-radius: 0; }`,
 *   tokenOverrides: { '--ds-color-primary': '#123456' },
 * });
 * ```
 *
 * @module System/Engines/SkinPack
 * @category System
 * @package @rottay/design-system
 */

import type { ComponentType } from 'react';
import { DEFAULT_PACK, registerCustomComponents } from './custom';
import { compileBrandTheme } from '../../compilers/brand-theme';
import type { BrandTheme } from '../../contracts/themes';
import { warnInDev } from '../../_internal/utils/runtime-logger';

/**
 * A white-label skin for the `custom` engine: an id (matching
 * `TenantConfig.componentPack` and the pack-scoped custom-component
 * registry), a stylesheet targeting the anatomy contract, and a bounded
 * token set.
 */
export interface SkinPack {
  /**
   * Pack key. The same string a tenant sets as `TenantConfig.componentPack`,
   * and the same key `registerCustomComponent(s)` scopes bespoke overrides
   * under. Registering a pack under an id does not require that id to also
   * have bespoke components — most packs will not.
   */
  id: string;
  /**
   * Stylesheet text targeting `[data-part]`/`[data-state]` selectors from
   * `behavior/anatomy.ts` (e.g. `[data-part='trigger'][data-state~='hovered']`)
   * plus any stable engine class hooks (e.g. `.rottay-input--focused`) for
   * components not yet wired to the anatomy contract. Injected verbatim into
   * a pack-scoped `<style>` element; not parsed or sanitized.
   */
  css: string;
  /**
   * Raw `--ds-*` overrides applied to `document.documentElement`. Bound to
   * the same contract as `TenantAppearanceAdvanced.tokenOverrides`: every
   * key must start with `--ds-`, max 200 entries. `registerSkinPack` and
   * `applySkinPack` both validate this and throw rather than truncate — a
   * pack that does not fit the bound is not registered/applied at all.
   */
  tokenOverrides?: Record<string, string | number>;
  /**
   * Full premium token surface, compiled through the same
   * `compileBrandTheme` path tenant branding uses. Bounded because
   * `BrandTheme` is a fixed TypeScript shape, not an open record — a caller
   * cannot smuggle an arbitrary key through it the way a free-form map would
   * allow.
   */
  brandTheme?: BrandTheme;
  /**
   * Bespoke React overrides for components this skin cannot express in CSS
   * alone. Registered under `id` via the existing `registerCustomComponents`
   * path (`custom.ts`) — a name present here, or registered directly against
   * this pack id, always wins over the pack's CSS fallback.
   */
  components?: Record<string, ComponentType<unknown>>;
}

/** Every `tokenOverrides` key must live in the DS's own custom-property namespace. */
const TOKEN_PREFIX = '--ds-';

/** Same bound as `TenantAppearanceAdvanced.tokenOverrides` (compilers/appearance). */
const MAX_TOKEN_OVERRIDES = 200;

/**
 * Validates a skin pack's raw token overrides against the bounded contract.
 * Throws rather than filtering, so a pack that does not fit the bound is
 * rejected outright instead of silently losing entries.
 */
function validateTokenOverrides(tokenOverrides: Record<string, string | number> | undefined): void {
  if (!tokenOverrides) return;

  const keys = Object.keys(tokenOverrides);
  if (keys.length > MAX_TOKEN_OVERRIDES) {
    throw new Error(
      `[SkinPack] tokenOverrides has ${keys.length} entries; the bound is ${MAX_TOKEN_OVERRIDES} ` +
        `(same contract as TenantAppearanceAdvanced.tokenOverrides).`
    );
  }

  const offenders = keys.filter((key) => !key.startsWith(TOKEN_PREFIX));
  if (offenders.length > 0) {
    throw new Error(
      `[SkinPack] tokenOverrides keys must start with "${TOKEN_PREFIX}"; rejected: ${offenders.join(', ')}.`
    );
  }
}

const skinPacks = new Map<string, SkinPack>();

/**
 * Registers a skin pack. Validates `tokenOverrides` against the bounded
 * contract (throws on an unbounded override, before anything is stored) and,
 * when `components` is present, registers them under `pack.id` via the
 * existing `registerCustomComponents` path so bespoke-override precedence in
 * `custom.ts` needs no changes.
 */
export function registerSkinPack(pack: SkinPack): void {
  if (!pack.id) {
    throw new Error('[SkinPack] registerSkinPack requires a non-empty id.');
  }
  validateTokenOverrides(pack.tokenOverrides);

  skinPacks.set(pack.id, pack);

  if (pack.components) {
    registerCustomComponents(pack.components, pack.id);
  }
}

/**
 * Returns the skin pack registered under `id`, or the default (unscoped)
 * pack when `id` is omitted — the same default-pack semantics
 * `getCustomComponent` uses.
 */
export function getRegisteredSkinPack(id?: string): SkinPack | undefined {
  return skinPacks.get(id || DEFAULT_PACK);
}

/** Removes a registered skin pack and revokes anything it applied to the document. */
export function unregisterSkinPack(id: string = DEFAULT_PACK): boolean {
  revokeAppliedSkin(id);
  return skinPacks.delete(id);
}

/**
 * Removes skin packs and revokes anything they applied to the document. When
 * called without `id`, clears every pack — mirrors `clearCustomRegistry`'s
 * all/one-pack split. Does NOT touch the `custom.ts` component registry: a
 * pack's `components` were registered there as a side effect of
 * `registerSkinPack`, but that registry has its own lifecycle
 * (`clearCustomRegistry`) and callers may register bespoke components
 * against the same pack id independently of a skin pack's existence.
 */
export function clearSkinPacks(id?: string): void {
  if (id !== undefined) {
    revokeAppliedSkin(id);
    skinPacks.delete(id);
    return;
  }
  for (const packId of skinPacks.keys()) revokeAppliedSkin(packId);
  skinPacks.clear();
}

// ── DOM application ─────────────────────────────────────────────────────

/** Signature of the pack content last written to the DOM, keyed by pack id. */
const appliedSignatures = new Map<string, string>();
/** `--ds-*` variable names this pack wrote to `documentElement`, so unregister can remove exactly those. */
const appliedVarNames = new Map<string, string[]>();
/** How many live consumers currently hold each applied pack. */
const packConsumers = new Map<string, number>();

function styleElementId(packId: string): string {
  return `rottay-skin-pack-${packId}`;
}

function brandStyleElementId(packId: string): string {
  return `rottay-skin-pack-brand-${packId}`;
}

/**
 * Applies a skin pack's CSS and tokens to the document: a pack-scoped
 * `<style>` element for `css`, `documentElement` custom properties for
 * `tokenOverrides`, and — when present — the compiled `brandTheme` CSS
 * string in a second pack-scoped `<style>` element.
 *
 * Idempotent by content signature, so calling this from every mounted
 * engine-component instance of the same active pack (the `factory.tsx`
 * loading seam does exactly that) is cheap: only the first call in a render
 * pass with new content touches the DOM. No-ops outside a DOM environment
 * (SSR) — the pack is applied on the client once `factory.tsx`'s effect runs.
 */
export function applySkinPack(pack: SkinPack): void {
  if (typeof document === 'undefined') return;

  validateTokenOverrides(pack.tokenOverrides);

  const signature = JSON.stringify([pack.css, pack.tokenOverrides ?? null, pack.brandTheme ?? null]);
  if (appliedSignatures.get(pack.id) === signature) return;

  let styleEl = document.getElementById(styleElementId(pack.id)) as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = styleElementId(pack.id);
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = pack.css;

  const root = document.documentElement.style;
  const previousVarNames = appliedVarNames.get(pack.id) ?? [];
  for (const name of previousVarNames) {
    root.removeProperty(name);
  }
  const nextVarNames: string[] = [];
  if (pack.tokenOverrides) {
    for (const [key, value] of Object.entries(pack.tokenOverrides)) {
      root.setProperty(key, String(value));
      nextVarNames.push(key);
    }
  }
  appliedVarNames.set(pack.id, nextVarNames);

  if (pack.brandTheme) {
    try {
      const compiled = compileBrandTheme({ brandTheme: pack.brandTheme, tenantSlug: pack.id });
      let brandStyleEl = document.getElementById(brandStyleElementId(pack.id)) as HTMLStyleElement | null;
      if (!brandStyleEl) {
        brandStyleEl = document.createElement('style');
        brandStyleEl.id = brandStyleElementId(pack.id);
        document.head.appendChild(brandStyleEl);
      }
      brandStyleEl.textContent = compiled.cssString;
    } catch (error) {
      warnInDev(`[SkinPack] Failed to compile brandTheme for pack "${pack.id}":`, error as Error);
    }
  } else {
    document.getElementById(brandStyleElementId(pack.id))?.remove();
  }

  appliedSignatures.set(pack.id, signature);
}

/**
 * Applies a pack and hands back the release for one consumer of it.
 *
 * A pack's `css` targets `[data-part]`/`[data-state]`, which EVERY engine
 * stamps, and its `tokenOverrides` land on `documentElement`'s inline style,
 * the highest precedence the cascade offers. A pack left applied after the
 * engine moves off `custom` therefore keeps painting and re-tokenizing
 * whichever engine took over. It has to be withdrawn.
 *
 * It cannot be withdrawn by the first consumer to let go. `factory.tsx` runs
 * its seam effect once per engine-component instance, so a page of thirty
 * buttons holds the same pack thirty times; revoking on the first unmount
 * would strip the skin off the twenty-nine still on screen. The document keeps
 * the pack while any consumer holds it and drops it when the last one
 * releases.
 */
export function acquireSkinPack(pack: SkinPack): () => void {
  applySkinPack(pack);
  packConsumers.set(pack.id, (packConsumers.get(pack.id) ?? 0) + 1);

  let released = false;
  return () => {
    // React may invoke an effect cleanup more than once; a double release
    // would drop the count below the number of live consumers.
    if (released) return;
    released = true;

    const remaining = (packConsumers.get(pack.id) ?? 1) - 1;
    if (remaining > 0) {
      packConsumers.set(pack.id, remaining);
      return;
    }
    packConsumers.delete(pack.id);
    revokeAppliedSkin(pack.id);
  };
}

/** Removes everything `applySkinPack` wrote to the document for `packId`. */
function revokeAppliedSkin(packId: string): void {
  packConsumers.delete(packId);

  if (typeof document === 'undefined') return;

  document.getElementById(styleElementId(packId))?.remove();
  document.getElementById(brandStyleElementId(packId))?.remove();

  const root = document.documentElement.style;
  const varNames = appliedVarNames.get(packId) ?? [];
  for (const name of varNames) {
    root.removeProperty(name);
  }
  appliedVarNames.delete(packId);
  appliedSignatures.delete(packId);
}
