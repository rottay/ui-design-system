/**
 * @fileoverview The tenant-theme ROW as bytes: the boundary a consuming
 * application crosses when it reads its own database.
 *
 * The design system never reads a database. What it is handed is whatever the
 * application's read returned, and the only honest test fixture for that is a
 * byte sequence: an in-memory fixture object shares key order, number spelling
 * and identity with the object the static arm compiled, so two arms built from
 * it can agree without the transport having been exercised at all.
 *
 * THE ROW. The four trusted columns `hydrateTenantThemeConfig` takes as its
 * identity, named as `TenantThemeConfigIdentity` names them, plus the JSONB
 * `document`. How an application spells its own column names is its mapping
 * and no part of this shape.
 *
 * THE TWO ENCODINGS. `json` is the row in authored key order with no
 * whitespace -- a `json` column, or a driver that hands the text through.
 * `jsonb` is what PostgreSQL renders for `jsonb::text`: object keys reordered
 * shortest-first and then bytewise, `": "` and `", "` separators. A compile
 * that depended on authored key order would agree on the first and diverge on
 * the second, which is the difference a customer's database introduces and a
 * fixture object cannot.
 *
 * Runtime-pure: type-only imports and no side effects, so a plain Node or
 * Playwright context can load it without the design system.
 */

import type { TenantThemeConfigIdentity } from "../../../src/foundation/contracts/composition/tenants/themes/tenant-theme";

export type TenantThemeRowEncoding = "json" | "jsonb";

export const TENANT_THEME_ROW_ENCODINGS: readonly TenantThemeRowEncoding[] = [
  "json",
  "jsonb",
];

export interface TenantThemeRow extends TenantThemeConfigIdentity {
  /** The JSONB column, exactly as read; validated by the hydration door, not here. */
  document: unknown;
}

const ROW_COLUMNS = [
  "tenantId",
  "slug",
  "verticalKey",
  "rowVersion",
  "document",
] as const;

export class TenantThemeRowRefusal extends Error {
  constructor(reason: string) {
    super(`tenant-theme row refused: ${reason}`);
    this.name = "TenantThemeRowRefusal";
  }
}

const utf8 = new TextEncoder();

/** PostgreSQL's jsonb key order: shorter keys first, equal lengths bytewise. */
function jsonbKeyOrder(left: string, right: string): number {
  const a = utf8.encode(left);
  const b = utf8.encode(right);
  if (a.length !== b.length) return a.length - b.length;
  for (let index = 0; index < a.length; index += 1) {
    if (a[index] !== b[index]) return a[index]! - b[index]!;
  }
  return 0;
}

function jsonbText(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(jsonbText).join(", ")}]`;
  if (value !== null && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const members = Object.keys(record)
      .filter((key) => record[key] !== undefined)
      .sort(jsonbKeyOrder)
      .map((key) => `${JSON.stringify(key)}: ${jsonbText(record[key])}`);
    return `{${members.join(", ")}}`;
  }
  return JSON.stringify(value);
}

export function tenantThemeRowOf(
  document: unknown,
  identity: TenantThemeConfigIdentity
): TenantThemeRow {
  return {
    tenantId: identity.tenantId,
    slug: identity.slug,
    verticalKey: identity.verticalKey,
    rowVersion: identity.rowVersion,
    document,
  };
}

export function encodeTenantThemeRow(
  row: TenantThemeRow,
  encoding: TenantThemeRowEncoding
): Uint8Array {
  return utf8.encode(encoding === "jsonb" ? jsonbText(row) : JSON.stringify(row));
}

/**
 * Bytes back to the two arguments of `hydrateTenantThemeConfig`. Refuses by
 * name anything that is not exactly one row: invalid UTF-8, invalid JSON, a
 * missing or extra column, or a column of the wrong primitive type. The
 * document is NOT validated here; that is the hydration door's own law.
 */
export function decodeTenantThemeRow(bytes: Uint8Array): {
  document: unknown;
  identity: TenantThemeConfigIdentity;
} {
  let text: string;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new TenantThemeRowRefusal("the bytes are not UTF-8");
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new TenantThemeRowRefusal("the bytes are not one JSON value");
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new TenantThemeRowRefusal("the row is not an object");
  }
  const row = parsed as Record<string, unknown>;
  const columns = Object.keys(row);
  const missing = ROW_COLUMNS.filter((column) => !columns.includes(column));
  const extra = columns.filter(
    (column) => !(ROW_COLUMNS as readonly string[]).includes(column)
  );
  if (missing.length > 0 || extra.length > 0) {
    throw new TenantThemeRowRefusal(
      `columns do not match (missing: ${missing.join(", ") || "none"}; extra: ${extra.join(", ") || "none"})`
    );
  }
  const { tenantId, slug, verticalKey, rowVersion, document } = row;
  if (
    typeof tenantId !== "string" ||
    typeof slug !== "string" ||
    typeof verticalKey !== "string"
  ) {
    throw new TenantThemeRowRefusal("an identity column is not a string");
  }
  if (typeof rowVersion !== "number" || !Number.isInteger(rowVersion)) {
    throw new TenantThemeRowRefusal("rowVersion is not an integer");
  }
  return { document, identity: { tenantId, slug, verticalKey, rowVersion } };
}
