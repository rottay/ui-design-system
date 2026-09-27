/**
 * The legacy source: a v1 TenantThemeDocument through its own validator, the v1 compile and the
 * mount law. Plain ESM so the torture harness can load it under a bare `node` as well.
 */

import {
  compileTenantTheme,
  documentThemeIntent,
  emitTenantThemeArtifactForSsr,
  getTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
  mountTenantTheme,
  validateTenantThemeDocument,
} from '@rottay/design-system/server';

/**
 * @typedef {object} LegacyGroundInput
 * @property {unknown} document A v1 TenantThemeDocument (schemaVersion 1).
 * @property {string} tenantId
 * @property {string} slug
 * @property {string} [vertical] Defaults to `bithire`.
 * @property {number} [rowVersion] Defaults to 1; it is part of the digest.
 */

export class LegacyGroundRefusal extends Error {
  /**
   * @param {string} slug
   * @param {string} reason
   */
  constructor(slug, reason) {
    super(`probe-ground legacy source "${slug}" refused: ${reason}`);
    this.name = 'LegacyGroundRefusal';
    this.slug = slug;
  }
}

/**
 * @param {unknown} left
 * @param {unknown} right
 * @returns {boolean}
 */
function sameJson(left, right) {
  if (left === right) return true;
  if (typeof left !== 'object' || typeof right !== 'object' || left === null || right === null) return false;
  if (Array.isArray(left) !== Array.isArray(right)) return false;
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  if (leftKeys.length !== rightKeys.length) return false;
  return leftKeys.every(
    (key) =>
      Object.prototype.hasOwnProperty.call(right, key) &&
      sameJson(/** @type {Record<string, unknown>} */ (left)[key], /** @type {Record<string, unknown>} */ (right)[key]),
  );
}

/**
 * Validate, hydrate and compile, refusing by name at the first gap: an invalid document, a parse
 * that would drop or coerce a field, a vertical without an envelope, or a join that moved.
 *
 * @param {LegacyGroundInput} input
 */
export function compileLegacyGroundDocument({ document, tenantId, slug, vertical = 'bithire', rowVersion = 1 }) {
  const validation = validateTenantThemeDocument(document);
  if (!validation.success) {
    throw new LegacyGroundRefusal(slug, `the v1 validator rejects the document: ${JSON.stringify(validation.issues)}`);
  }
  if (!sameJson(validation.data, document)) {
    throw new LegacyGroundRefusal(slug, 'the validated document differs from the authored one');
  }
  const verticalEnvelope = getTenantThemeVerticalEnvelope(vertical);
  if (!verticalEnvelope) {
    throw new LegacyGroundRefusal(slug, `no tenant-theme envelope for vertical "${vertical}"`);
  }
  const identity = { tenantId, slug, verticalKey: vertical, rowVersion };
  const hydrated = hydrateTenantThemeConfig(validation.data, identity, { expectedIdentity: identity });
  const { artifact, engineVisual } = compileTenantTheme(hydrated, { verticalEnvelope });
  if (artifact.slug !== slug || artifact.verticalKey !== vertical) {
    throw new LegacyGroundRefusal(slug, `the artifact names ${artifact.slug}/${artifact.verticalKey}`);
  }
  return { document: validation.data, artifact, engineVisual };
}

/**
 * The compiled artifact through the one mount law. Mounting anything but exactly the artifact's
 * own emission is refused, so a partial ground never reaches the page.
 *
 * @param {LegacyGroundInput} input
 * @param {NonNullable<Parameters<typeof mountTenantTheme>[1]>} [options]
 */
export async function mountLegacyGround(input, options = {}) {
  const vertical = input.vertical ?? 'bithire';
  const { document, artifact, engineVisual } = compileLegacyGroundDocument(input);
  const intent = documentThemeIntent({ vertical, slug: input.slug, document });
  const mounted = await mountTenantTheme(intent, { ...options, artifact });
  const emission = emitTenantThemeArtifactForSsr(artifact, { slug: artifact.slug, verticalKey: artifact.verticalKey });
  const [element, ...extra] = mounted.styleElements;
  if (!element || extra.length > 0) {
    throw new LegacyGroundRefusal(input.slug, `the mount emitted ${mounted.styleElements.length} style elements, not 1`);
  }
  if (element.css !== emission.css || !sameJson(element.attributes, emission.attributes)) {
    throw new LegacyGroundRefusal(input.slug, "the mounted style is not the artifact's own emission");
  }
  return { artifact, engineVisual, mounted };
}
