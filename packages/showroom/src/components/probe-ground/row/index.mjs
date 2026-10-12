/**
 * The tenant-theme row as bytes — SHOWROOM COPY of `packages/core/tests/support/tenant-theme-row`.
 * Core test support is outside the published package, so the showroom cannot import it; the
 * serialized-row spec asserts both codecs emit identical bytes on every run. Plain ESM so the
 * Next build, a bare `node` and Playwright load this same file.
 */

/**
 * @typedef {'json' | 'jsonb'} TenantThemeRowEncoding
 * @typedef {{ tenantId: string, slug: string, verticalKey: string, rowVersion: number }} TenantThemeRowIdentity
 * @typedef {TenantThemeRowIdentity & { document: unknown }} TenantThemeRow
 */

/** @type {readonly TenantThemeRowEncoding[]} */
export const TENANT_THEME_ROW_ENCODINGS = ['json', 'jsonb'];

const ROW_COLUMNS = ['tenantId', 'slug', 'verticalKey', 'rowVersion', 'document'];

export class TenantThemeRowRefusal extends Error {
  /** @param {string} reason */
  constructor(reason) {
    super(`tenant-theme row refused: ${reason}`);
    this.name = 'TenantThemeRowRefusal';
  }
}

const utf8 = new TextEncoder();

/**
 * PostgreSQL's jsonb key order: shorter keys first, equal lengths bytewise.
 *
 * @param {string} left
 * @param {string} right
 * @returns {number}
 */
function jsonbKeyOrder(left, right) {
  const a = utf8.encode(left);
  const b = utf8.encode(right);
  if (a.length !== b.length) return a.length - b.length;
  for (let index = 0; index < a.length; index += 1) {
    if (a[index] !== b[index]) return a[index] - b[index];
  }
  return 0;
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function jsonbText(value) {
  if (Array.isArray(value)) return `[${value.map(jsonbText).join(', ')}]`;
  if (value !== null && typeof value === 'object') {
    const record = /** @type {Record<string, unknown>} */ (value);
    const members = Object.keys(record)
      .filter((key) => record[key] !== undefined)
      .sort(jsonbKeyOrder)
      .map((key) => `${JSON.stringify(key)}: ${jsonbText(record[key])}`);
    return `{${members.join(', ')}}`;
  }
  return JSON.stringify(value);
}

/**
 * @param {unknown} document
 * @param {TenantThemeRowIdentity} identity
 * @returns {TenantThemeRow}
 */
export function tenantThemeRowOf(document, identity) {
  return {
    tenantId: identity.tenantId,
    slug: identity.slug,
    verticalKey: identity.verticalKey,
    rowVersion: identity.rowVersion,
    document,
  };
}

/**
 * `json` is authored key order with no whitespace; `jsonb` is what PostgreSQL renders for
 * `jsonb::text` (reordered keys, `": "` and `", "` separators).
 *
 * @param {TenantThemeRow} row
 * @param {TenantThemeRowEncoding} encoding
 * @returns {Uint8Array}
 */
export function encodeTenantThemeRow(row, encoding) {
  return utf8.encode(encoding === 'jsonb' ? jsonbText(row) : JSON.stringify(row));
}

/**
 * Bytes back to the two arguments of `hydrateTenantThemeConfig`, refusing by name anything that
 * is not exactly one row. The document is validated by the hydration door, not here.
 *
 * @param {Uint8Array} bytes
 * @returns {{ document: unknown, identity: TenantThemeRowIdentity }}
 */
export function decodeTenantThemeRow(bytes) {
  let text;
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    throw new TenantThemeRowRefusal('the bytes are not UTF-8');
  }
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new TenantThemeRowRefusal('the bytes are not one JSON value');
  }
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new TenantThemeRowRefusal('the row is not an object');
  }
  const columns = Object.keys(parsed);
  const missing = ROW_COLUMNS.filter((column) => !columns.includes(column));
  const extra = columns.filter((column) => !ROW_COLUMNS.includes(column));
  if (missing.length > 0 || extra.length > 0) {
    throw new TenantThemeRowRefusal(
      `columns do not match (missing: ${missing.join(', ') || 'none'}; extra: ${extra.join(', ') || 'none'})`,
    );
  }
  const { tenantId, slug, verticalKey, rowVersion, document } = parsed;
  if (typeof tenantId !== 'string' || typeof slug !== 'string' || typeof verticalKey !== 'string') {
    throw new TenantThemeRowRefusal('an identity column is not a string');
  }
  if (typeof rowVersion !== 'number' || !Number.isInteger(rowVersion)) {
    throw new TenantThemeRowRefusal('rowVersion is not an integer');
  }
  return { document, identity: { tenantId, slug, verticalKey, rowVersion } };
}
