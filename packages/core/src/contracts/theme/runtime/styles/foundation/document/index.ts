/**
 * @fileoverview A reusable style: the decisions a reviewed DS publication
 * carries, the manifest that names it, and the frozen record of both.
 *
 * A style body is `Partial<ThemeDecisions>` and NOT a v2 document. The ladder
 * forbids the second shape -- `TenantThemeDocumentV2` lives at
 * `contracts/theme/presentation/document`, above this rung -- and the contract
 * is better for it: a v2-shaped style would carry its own `plan`, and two plans
 * in one compile is the entitlement ambiguity a style exists not to create. It
 * would also be able to carry `overrides`, which are Pro-gated by entitlement
 * rather than by tier, and would therefore be a laundering channel for Pro
 * chrome authorship. Neither is refused by policy here; both are unrepresentable.
 *
 * @module Contracts/Theme/Styles/Document
 * @category Types
 * @package @rottay/design-system
 */

import { sha256Utf8 } from "@/foundation/kernel/cryptography/sha-256";
import { canonicalizeJsonValue } from "@/foundation/kernel/serialization";
import {
  FIRST_PARTY_VERTICAL_SLUGS,
  type FirstPartyVerticalId,
} from "@/foundation/contracts/kernel/verticals";
import {
  THEME_DECISION_IDS,
  type ThemeDecisionId,
  type ThemeDecisions,
} from "@/contracts/theme/foundation/decisions";

/** Refusals carry the offending name, never a generic "invalid style". */
export class ThemeStyleReferenceError extends Error {
  constructor(message: string) {
    super(`ThemeStyle: ${message}`);
    this.name = "ThemeStyleReferenceError";
  }
}

/**
 * What a style authors. No `plan`, no `overrides`, no `version`: the tenant row
 * owns the entitlement, the sanctioned overrides and the transport version, and
 * a style that could state any of the three would be stating the tenant's.
 */
export interface ThemeStyleDocument {
  readonly decisions: Partial<ThemeDecisions>;
}

/** What a style publication declares about itself. */
export interface ThemeStyleManifest {
  readonly id: string;
  readonly version: number;
  readonly title: string;
  /** The work order that published this version. */
  readonly workOrder: string;
  readonly publishedOn: string;
  /** `sha256-<hex>`, over the canonical document. Checked at module load. */
  readonly digest: string;
  readonly rows: readonly ThemeDecisionId[];
  /** Why each row is in this style, one written reason per row. */
  readonly provenance: Readonly<Record<string, string>>;
  /**
   * Which verticals may inherit this style. `"all"` is the launch position; a
   * named list is an EXCLUSION and every exclusion carries a written D-28
   * reason, because a style that cannot clear a vertical's envelope is a
   * measured functional incompatibility rather than something to narrow away.
   */
  readonly verticals: "all" | readonly FirstPartyVerticalId[];
  /**
   * The D-28 reason per EXCLUDED vertical -- the roster minus `verticals` --
   * required for each one when `verticals` is a list, and read back under the
   * same key by the request-time refusal.
   */
  readonly exclusionReasons?: Readonly<Record<string, string>>;
}

export interface ThemeStyleRecord {
  readonly ref: { readonly id: string; readonly version: number };
  readonly document: ThemeStyleDocument;
  readonly manifest: ThemeStyleManifest;
}

/**
 * The digest of a style's content, in the SAME pair the visual-authority
 * admission already digests a compiled artifact with: `sha256Utf8` over
 * `canonicalizeJsonValue`. Key-sorted, insertion-order independent, and the
 * `sha256-` prefix is the artifact spelling, so one regex validates both.
 */
export function themeStyleDigest(document: ThemeStyleDocument): string {
  return `sha256-${sha256Utf8(canonicalizeJsonValue(document.decisions))}`;
}

const DIGEST = /^sha256-[0-9a-f]{64}$/u;
const DOCUMENT_KEYS = ["decisions"];
const MANIFEST_KEYS = [
  "id",
  "version",
  "title",
  "workOrder",
  "publishedOn",
  "digest",
  "rows",
  "provenance",
  "verticals",
  "exclusionReasons",
];

function assertClosedKeys(
  value: unknown,
  allowed: readonly string[],
  where: string
): Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new ThemeStyleReferenceError(`${where} must be an object`);
  }
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key)) {
      throw new ThemeStyleReferenceError(
        `unsupported key ${JSON.stringify(key)} in ${where}; it carries ${allowed.join(" | ")}`
      );
    }
  }
  return value as Record<string, unknown>;
}

/**
 * Freeze one publication, refusing at MODULE LOAD what a request-time check
 * would have refused on the tenant's behalf.
 *
 * A style is authored content written once by a reviewed DS change and
 * inherited by many tenants, so the failure belongs on the author. The
 * authorability partition and the envelope clearance are applied by the
 * registry above this owner: they read the catalog and the vertical envelopes,
 * which are this owner's unranked peers.
 */
export function defineThemeStyle(input: {
  readonly document: unknown;
  readonly manifest: unknown;
}): ThemeStyleRecord {
  const manifest = assertClosedKeys(input.manifest, MANIFEST_KEYS, "manifest");
  const document = assertClosedKeys(input.document, DOCUMENT_KEYS, "document");
  const id = manifest.id;
  if (typeof id !== "string" || id.length === 0) {
    throw new ThemeStyleReferenceError(
      `manifest.id must be a non-empty string; got ${JSON.stringify(id)}`
    );
  }
  const version = manifest.version;
  if (!Number.isSafeInteger(version) || (version as number) <= 0) {
    throw new ThemeStyleReferenceError(
      `style ${JSON.stringify(id)} version must be a positive integer; got ${JSON.stringify(version)}`
    );
  }
  const decisions = assertClosedKeys(
    document.decisions,
    THEME_DECISION_IDS as readonly string[],
    `style ${JSON.stringify(id)} decisions`
  );
  const record: ThemeStyleRecord = Object.freeze({
    ref: Object.freeze({ id, version: version as number }),
    document: Object.freeze({
      decisions: Object.freeze({ ...decisions }) as Partial<ThemeDecisions>,
    }),
    manifest: Object.freeze({ ...manifest }) as unknown as ThemeStyleManifest,
  });
  assertManifestAgreesWithDocument(record);
  return record;
}

/**
 * The manifest describes the document it ships with, or the import fails.
 *
 * A hand-edited document with a stale digest is refused HERE rather than at
 * first paint, and a `rows` list that drifted from the decisions is refused for
 * the same reason: the manifest is what an audit reads, so a manifest that can
 * disagree with its own content is not evidence of anything.
 */
function assertManifestAgreesWithDocument(record: ThemeStyleRecord): void {
  const { manifest, document } = record;
  const name = JSON.stringify(manifest.id);
  if (typeof manifest.digest !== "string" || !DIGEST.test(manifest.digest)) {
    throw new ThemeStyleReferenceError(
      `style ${name} manifest.digest must match sha256-<64 hex>; got ${JSON.stringify(manifest.digest)}`
    );
  }
  const measured = themeStyleDigest(document);
  if (manifest.digest !== measured) {
    throw new ThemeStyleReferenceError(
      `style ${name} manifest.digest ${manifest.digest} is not the document digest ${measured}; a style is immutable, so a changed document is a NEW version`
    );
  }
  const authored = Object.keys(document.decisions).sort();
  const declared = [...(manifest.rows ?? [])].sort();
  if (authored.join(",") !== declared.join(",")) {
    throw new ThemeStyleReferenceError(
      `style ${name} manifest.rows [${declared.join(", ")}] disagrees with the document's [${authored.join(", ")}]`
    );
  }
  for (const row of authored) {
    if (typeof manifest.provenance?.[row] !== "string") {
      throw new ThemeStyleReferenceError(
        `style ${name} states no written reason for row ${JSON.stringify(row)}`
      );
    }
  }
  if (manifest.verticals !== "all") {
    if (!Array.isArray(manifest.verticals) || manifest.verticals.length === 0) {
      throw new ThemeStyleReferenceError(
        `style ${name} verticals must be "all" or a non-empty list of first-party verticals`
      );
    }
    // The list names who is ADMITTED, so the exclusion is the roster minus the
    // list and each reason is keyed by the vertical it excludes -- the key
    // `assertStyleAdmitsVertical` reads when it refuses that vertical's request.
    const admitted = new Set<string>(manifest.verticals);
    for (const vertical of FIRST_PARTY_VERTICAL_SLUGS) {
      if (admitted.has(vertical)) continue;
      const reason = manifest.exclusionReasons?.[vertical];
      if (typeof reason === "string" && reason.length > 0) continue;
      throw new ThemeStyleReferenceError(
        `style ${name} excludes ${vertical} without a written D-28 reason under that key; an exclusion is a measured incompatibility, never a convenience`
      );
    }
  }
}
