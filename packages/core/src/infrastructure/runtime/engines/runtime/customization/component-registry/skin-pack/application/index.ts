import { DEFAULT_PACK } from '../..';
import type { SkinPack } from '../contracts';

/**
 * Internal prepared representation. `brandCss` is compiled by the public
 * skin-pack facade before the lightweight component loading seam sees it.
 */
interface PreparedSkinPack {
  pack: SkinPack;
  brandCss: string | undefined;
}

const skinPacks = new Map<string, PreparedSkinPack>();

/** Signature of the pack content last written to the DOM, keyed by pack id. */
const appliedSignatures = new Map<string, string>();
/** `--ds-*` variable names this pack wrote so revocation removes only its keys. */
const appliedVarNames = new Map<string, string[]>();
/** How many mounted engine components currently hold each applied pack. */
const packConsumers = new Map<string, number>();

function styleElementId(packId: string): string {
  return `rottay-skin-pack-${packId}`;
}

function brandStyleElementId(packId: string): string {
  return `rottay-skin-pack-brand-${packId}`;
}

/** Store an already validated and prepared pack. */
export function registerPreparedSkinPack(pack: SkinPack, brandCss: string | undefined): void {
  skinPacks.set(pack.id, { pack, brandCss });
}

/** Return the original public pack object, preserving registry identity semantics. */
export function getPreparedSkinPack(id?: string): PreparedSkinPack | undefined {
  return skinPacks.get(id || DEFAULT_PACK);
}

/** Remove a registered pack and everything it currently owns in the DOM. */
export function unregisterPreparedSkinPack(id: string = DEFAULT_PACK): boolean {
  revokeAppliedSkin(id);
  return skinPacks.delete(id);
}

/** Clear one registered pack or the complete registry. */
export function clearPreparedSkinPacks(id?: string): void {
  if (id !== undefined) {
    revokeAppliedSkin(id);
    skinPacks.delete(id);
    return;
  }

  for (const packId of skinPacks.keys()) revokeAppliedSkin(packId);
  skinPacks.clear();
}

/**
 * Apply prepared CSS/tokens. This module intentionally has no compiler import:
 * every engine-aware leaf retains this small DOM seam, while only the public
 * registration/application API pays for theme compilation.
 */
export function applyPreparedSkinPack(pack: SkinPack, brandCss: string | undefined): void {
  if (typeof document === 'undefined') return;

  const signature = JSON.stringify([pack.css, pack.tokenOverrides ?? null, brandCss ?? null]);
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
  for (const name of previousVarNames) root.removeProperty(name);

  const nextVarNames: string[] = [];
  if (pack.tokenOverrides) {
    for (const [key, value] of Object.entries(pack.tokenOverrides)) {
      root.setProperty(key, String(value));
      nextVarNames.push(key);
    }
  }
  appliedVarNames.set(pack.id, nextVarNames);

  if (brandCss !== undefined) {
    let brandStyleEl = document.getElementById(brandStyleElementId(pack.id)) as HTMLStyleElement | null;
    if (!brandStyleEl) {
      brandStyleEl = document.createElement('style');
      brandStyleEl.id = brandStyleElementId(pack.id);
      document.head.appendChild(brandStyleEl);
    }
    brandStyleEl.textContent = brandCss;
  } else {
    document.getElementById(brandStyleElementId(pack.id))?.remove();
  }

  appliedSignatures.set(pack.id, signature);
}

/** Apply a prepared pack and return an idempotent reference-counted release. */
export function acquirePreparedSkinPack(pack: SkinPack, brandCss: string | undefined): () => void {
  applyPreparedSkinPack(pack, brandCss);
  packConsumers.set(pack.id, (packConsumers.get(pack.id) ?? 0) + 1);

  let released = false;
  return () => {
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

/**
 * Component-factory seam: acquire by registry key without importing the
 * brand-theme compiler or any compiler transitive dependencies.
 */
export function acquireRegisteredSkinPack(id?: string): (() => void) | undefined {
  const prepared = getPreparedSkinPack(id);
  if (!prepared) return undefined;
  return acquirePreparedSkinPack(prepared.pack, prepared.brandCss);
}

/** Remove everything an applied pack wrote to the document. */
function revokeAppliedSkin(packId: string): void {
  packConsumers.delete(packId);

  if (typeof document === 'undefined') return;

  document.getElementById(styleElementId(packId))?.remove();
  document.getElementById(brandStyleElementId(packId))?.remove();

  const root = document.documentElement.style;
  const varNames = appliedVarNames.get(packId) ?? [];
  for (const name of varNames) root.removeProperty(name);
  appliedVarNames.delete(packId);
  appliedSignatures.delete(packId);
}
