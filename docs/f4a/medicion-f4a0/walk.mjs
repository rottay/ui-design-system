import { FIRST_PARTY_VERTICAL_ROSTER } from '/Users/daniel/Developer/Rottay/ui-design-system/packages/core/dist/foundation/tokens/ts/presentation/brand-themes/index.js';
export const THEMES = Object.fromEntries(FIRST_PARTY_VERTICAL_ROSTER.map(r => [r.slug, r.theme]));
/** Hojas del objeto evaluado: cada valor primitivo con su keypath. */
export function leaves(obj, prefix = '', out = new Map()) {
  if (obj === null || obj === undefined) return out;
  if (typeof obj !== 'object') { out.set(prefix, obj); return out; }
  if (Array.isArray(obj)) { obj.forEach((v, i) => leaves(v, `${prefix}[${i}]`, out)); return out; }
  for (const [k, v] of Object.entries(obj)) leaves(v, prefix ? `${prefix}.${k}` : k, out);
  return out;
}
/** Los 2 scopes: cuerpo (sin modes) y el overlay declarado. */
export function scopes(theme) {
  const { modes, ...body } = theme;
  const overlayKey = modes ? Object.keys(modes)[0] : null;
  return { body, overlay: overlayKey ? modes[overlayKey] : {}, overlayKey };
}
