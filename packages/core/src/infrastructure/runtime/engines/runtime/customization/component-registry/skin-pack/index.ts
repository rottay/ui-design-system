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

import { DEFAULT_PACK, registerCustomComponents } from '..';
import { TENANT_THEME_CONFIG_SCHEMA } from '../../../../../../compilers/kernel/foundation/schemas/tenant-theme';
import { compileBrandTheme } from '../../../../../../compilers/kernel/runtime/brand-theme';
import { warnInDev } from '@/infrastructure/runtime/foundation/diagnostics/development-logging';
import {
  acquirePreparedSkinPack,
  applyPreparedSkinPack,
  clearPreparedSkinPacks,
  getPreparedSkinPack,
  registerPreparedSkinPack,
  unregisterPreparedSkinPack,
} from './application';
import type { SkinPack } from './contracts';

export type { SkinPack } from './contracts';

/**
 * A white-label skin for the `custom` engine: an id (matching
 * `TenantConfig.componentPack` and the pack-scoped custom-component
 * registry), a stylesheet targeting the anatomy contract, and a bounded
 * token set.
 */
/** Every `tokenOverrides` key must live in the DS's own custom-property namespace. */
const TOKEN_PREFIX = '--ds-';

/** Same bound as `TenantAppearanceAdvanced.tokenOverrides`; the schema limits object is the sole authority. */
const MAX_TOKEN_OVERRIDES: number =
  TENANT_THEME_CONFIG_SCHEMA.limits.maxTokenOverrides;

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

/**
 * Compile premium brand input before it reaches the component loading seam.
 * Compilation failures remain non-fatal, matching the previous apply-time
 * behavior; the pack's CSS and bounded raw tokens still apply.
 */
function compileSkinPackBrandCss(pack: SkinPack): string | undefined {
  if (!pack.brandTheme) return undefined;
  try {
    return compileBrandTheme({ brandTheme: pack.brandTheme, tenantSlug: pack.id }).cssString;
  } catch (error) {
    warnInDev(`[SkinPack] Failed to compile brandTheme for pack "${pack.id}":`, error as Error);
    return undefined;
  }
}

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

  registerPreparedSkinPack(pack, compileSkinPackBrandCss(pack));

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
  return getPreparedSkinPack(id)?.pack;
}

/** Removes a registered skin pack and revokes anything it applied to the document. */
export function unregisterSkinPack(id: string = DEFAULT_PACK): boolean {
  return unregisterPreparedSkinPack(id);
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
  clearPreparedSkinPacks(id);
}

// ── DOM application ─────────────────────────────────────────────────────

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
  validateTokenOverrides(pack.tokenOverrides);
  applyPreparedSkinPack(pack, compileSkinPackBrandCss(pack));
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
  validateTokenOverrides(pack.tokenOverrides);
  return acquirePreparedSkinPack(pack, compileSkinPackBrandCss(pack));
}
