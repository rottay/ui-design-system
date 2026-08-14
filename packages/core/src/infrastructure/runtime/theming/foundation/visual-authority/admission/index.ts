/**
 * Runtime admission for tenant visual artifacts.
 *
 * Verification, mount proof, SSR receipt minting/audit, and authority resolution.
 * This module deliberately does NOT depend on the compiler root, the retention
 * watcher, or any digest/CSS helper shared with the producer. It owns the
 * snapshot, the deterministic re-render checks, and the WeakSet that proves SSR
 * receipt provenance.
 */

import type { TenantConfig } from "@/foundation/contracts/composition/tenants";
import type { TenantAppearance } from "@/foundation/contracts/composition/tenants/themes";
import type {
  NormalizedTenantThemeAppearance,
  TenantThemeArtifact,
} from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import {
  TENANT_THEME_SCHEMA_VERSION,
  TENANT_THEME_V1_COVERAGE,
  type TenantVisualChannel,
} from "@/foundation/contracts/composition/tenants/themes/tenant-theme/artifact-protocol";
import { sha256Utf8 } from "@/foundation/kernel/cryptography/sha-256";
import {
  canonicalizeJsonValue,
  cloneJsonValueExact,
} from "@/foundation/kernel/serialization";
import { TENANT_THEME_COMPILER_VERSION } from "@/infrastructure/compilers/composition/tenant-theme/version";

/** Context-only provider state or app-mounted compiled paint. */
export type VisualAuthority = "provider" | "compiled-artifact";

export const TENANT_THEME_ARTIFACT_DIGEST_ATTRIBUTE =
  "data-ds-tenant-theme-digest" as const;
export const TENANT_THEME_ARTIFACT_SLUG_ATTRIBUTE =
  "data-ds-tenant-theme-slug" as const;
export const TENANT_THEME_ARTIFACT_VERTICAL_ATTRIBUTE =
  "data-ds-tenant-theme-vertical" as const;

export type VisualAuthorityOrigin =
  | "explicit-context"
  | "compiled-envelope"
  /** Admitted on the server against a request-owned emission receipt. */
  | "ssr-emission-receipt"
  | "no-visual-payload"
  | "invalid-declaration"
  /** Refused because no DOM exists AND no honest emission receipt was given. */
  | "unprovable-ssr-mount"
  | "uncompiled-visual-payload";

/** Explicitly context-only. This never grants a runtime painter. */
export interface ProviderDeclaration {
  authority: "provider";
}

/** The app claims that this exact, complete v1 artifact is mounted. */
export interface CompiledArtifactDeclaration {
  authority: "compiled-artifact";
  artifact: TenantThemeArtifact;
  /**
   * Required only where no DOM exists to observe (SSR). It is the design
   * system's own record of having produced these bytes for this request -- see
   * `emitTenantThemeArtifactForSsr` for what it does and does not prove.
   */
  ssrReceipt?: TenantThemeArtifactSsrEmissionReceipt;
}

export type VisualAuthorityDeclaration =
  | ProviderDeclaration
  | CompiledArtifactDeclaration;

export interface RuntimeVisualPayloadCensus {
  visualBranding: boolean;
  tokenOverrides: boolean;
  appearance: TenantAppearance | undefined;
  personality: boolean;
  brandTheme: boolean;
}

const VISUAL_BRANDING_FIELDS = [
  "primaryColor",
  "secondaryColor",
  "accentColor",
  "darkPrimaryColor",
  "darkSecondaryColor",
  "darkAccentColor",
  "darkBackgroundColor",
  "successColor",
  "warningColor",
  "errorColor",
  "infoColor",
  "fontFamilyBase",
  "fontFamilyHeading",
  "fontFamilyMono",
  "fontFamilyDisplay",
] as const;

export function censusRuntimeVisualPayload(
  config: Pick<
    TenantConfig,
    "branding" | "tokenOverrides" | "appearance" | "personality" | "brandTheme"
  > | null | undefined,
): RuntimeVisualPayloadCensus {
  const branding = config?.branding;
  return {
    visualBranding:
      branding != null &&
      VISUAL_BRANDING_FIELDS.some((field) => branding[field] != null),
    tokenOverrides: Object.keys(config?.tokenOverrides ?? {}).length > 0,
    appearance: config?.appearance,
    personality: config?.personality !== undefined,
    brandTheme: config?.brandTheme !== undefined,
  };
}

export interface TenantThemeArtifactExpectation {
  slug: string;
  verticalKey?: string;
}

export type TenantThemeArtifactVerification =
  | { ok: true; artifact: TenantThemeArtifact }
  | { ok: false; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const LOWER_KEBAB_IDENTITY = /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/;

function freezeJsonValue<T>(value: T): T {
  if (value === null || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }
  for (const nested of Object.values(value as Record<string, unknown>)) {
    freezeJsonValue(nested);
  }
  return Object.freeze(value);
}

/**
 * Retain the declaration as an owned, deeply frozen, byte-exact snapshot.
 *
 * Byte-exact is not a detail here: `artifact.css` is verified against, and
 * later mounted as, exact bytes down to its trailing newline. A canonicalizing
 * round trip trims string edges, so it would silently rewrite the very payload
 * this module exists to prove. Canonical form stays where it belongs -- digest
 * and structural comparison -- and never carries the value.
 */
function exactArtifactSnapshot(candidate: unknown): TenantThemeArtifact | null {
  try {
    return freezeJsonValue(
      cloneJsonValueExact(candidate) as TenantThemeArtifact,
    );
  } catch {
    return null;
  }
}

function sameOrderedStrings(
  actual: readonly unknown[],
  expected: readonly string[],
): boolean {
  return (
    actual.length === expected.length &&
    actual.every((value, index) => value === expected[index])
  );
}

function expectedScopes(
  slug: string,
  verticalKey: string,
): TenantThemeArtifact["scopes"] {
  return {
    root: { attribute: "data-ds-root", selector: ":where([data-ds-root])" },
    vertical: {
      attribute: "data-vertical",
      value: verticalKey,
      selector: `:where([data-ds-root][data-vertical="${verticalKey}"])`,
    },
    tenant: {
      attribute: "data-tenant",
      value: slug,
      selector: `:where([data-ds-root][data-tenant="${slug}"])`,
    },
    combinedSelector:
      `[data-ds-root][data-vertical="${verticalKey}"]` +
      `[data-tenant][data-tenant="${slug}"]`,
  };
}

function expectedArtifactCss(artifact: TenantThemeArtifact): string {
  const declarations = Object.entries(artifact.variables)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join("\n");
  return [
    `/* TenantThemeArtifact v1 | ${TENANT_THEME_COMPILER_VERSION} | ${artifact.digest} */`,
    `${artifact.scopes.combinedSelector} {`,
    declarations,
    "}",
    "",
  ].join("\n");
}

/** Recompute every self-contained invariant in the v1 artifact. */
export function verifyTenantThemeArtifactV1(
  candidate: unknown,
  expected: TenantThemeArtifactExpectation,
): TenantThemeArtifactVerification {
  if (!isRecord(candidate))
    return { ok: false, error: "artifact is not an object" };

  // Snapshot BEFORE verifying, then verify the snapshot. Every check below
  // therefore reads the same owned bytes the caller will consume: a declaration
  // cannot pass verification and then mutate its appearance or CSS, and an
  // accessor on the candidate cannot serve one value to the verifier and
  // another to the consumer.
  const artifact = exactArtifactSnapshot(candidate);
  if (!artifact) return { ok: false, error: "artifact is not plain JSON data" };
  if (artifact.schemaVersion !== TENANT_THEME_SCHEMA_VERSION) {
    return {
      ok: false,
      error: `schemaVersion is not ${TENANT_THEME_SCHEMA_VERSION}`,
    };
  }
  if (artifact.compilerVersion !== TENANT_THEME_COMPILER_VERSION) {
    return {
      ok: false,
      error: `compilerVersion is not ${TENANT_THEME_COMPILER_VERSION}`,
    };
  }
  if (artifact.slug !== expected.slug) {
    return {
      ok: false,
      error: `artifact slug ${JSON.stringify(artifact.slug)} does not match ${JSON.stringify(expected.slug)}`,
    };
  }
  if (
    expected.verticalKey !== undefined &&
    artifact.verticalKey !== expected.verticalKey
  ) {
    return {
      ok: false,
      error: `artifact verticalKey ${JSON.stringify(artifact.verticalKey)} does not match ${JSON.stringify(expected.verticalKey)}`,
    };
  }
  if (
    typeof artifact.tenantId !== "string" ||
    artifact.tenantId.length === 0 ||
    typeof artifact.slug !== "string" ||
    !LOWER_KEBAB_IDENTITY.test(artifact.slug) ||
    typeof artifact.verticalKey !== "string" ||
    !LOWER_KEBAB_IDENTITY.test(artifact.verticalKey) ||
    !Number.isSafeInteger(artifact.rowVersion) ||
    artifact.rowVersion < 0 ||
    typeof artifact.digest !== "string" ||
    !/^sha256-[0-9a-f]{64}$/.test(artifact.digest) ||
    (artifact.verticalEnvelopeDigest !== undefined &&
      !/^sha256-[0-9a-f]{64}$/.test(artifact.verticalEnvelopeDigest)) ||
    !isRecord(artifact.normalizedAppearance) ||
    !isRecord(artifact.variables) ||
    !isRecord(artifact.scopes) ||
    typeof artifact.css !== "string" ||
    !Array.isArray(artifact.coverage) ||
    (artifact.adjustments !== undefined &&
      (!Array.isArray(artifact.adjustments) ||
        artifact.adjustments.some(
          (adjustment) =>
            !isRecord(adjustment) ||
            typeof adjustment.token !== "string" ||
            typeof adjustment.pairedWith !== "string" ||
            typeof adjustment.from !== "string" ||
            typeof adjustment.to !== "string" ||
            typeof adjustment.lcBefore !== "number" ||
            !Number.isFinite(adjustment.lcBefore) ||
            typeof adjustment.lcAfter !== "number" ||
            !Number.isFinite(adjustment.lcAfter),
        )))
  ) {
    return { ok: false, error: "artifact is missing a required v1 field or field type" };
  }
  if (!sameOrderedStrings(artifact.coverage, TENANT_THEME_V1_COVERAGE)) {
    return { ok: false, error: "coverage is not the exact ordered v1 coverage" };
  }
  if (
    Object.entries(artifact.variables).some(
      ([name, value]) => !name.startsWith("--ds-") || typeof value !== "string",
    ) ||
    Object.keys(artifact.variables).join("\0") !==
      Object.keys(artifact.variables).sort().join("\0")
  ) {
    return { ok: false, error: "variables are not an ordered --ds-* string map" };
  }

  try {
    const scopes = expectedScopes(artifact.slug, artifact.verticalKey);
    if (canonicalizeJsonValue(artifact.scopes) !== canonicalizeJsonValue(scopes)) {
      return { ok: false, error: "artifact scopes do not recompute from identity" };
    }

    const digestSource = {
      schemaVersion: TENANT_THEME_SCHEMA_VERSION,
      compilerVersion: TENANT_THEME_COMPILER_VERSION,
      coverage: TENANT_THEME_V1_COVERAGE,
      tenantId: artifact.tenantId,
      slug: artifact.slug,
      verticalKey: artifact.verticalKey,
      rowVersion: artifact.rowVersion,
      normalizedAppearance: artifact.normalizedAppearance,
      variables: artifact.variables,
      scopes,
      ...(artifact.adjustments && artifact.adjustments.length > 0
        ? { adjustments: artifact.adjustments }
        : {}),
      ...(artifact.verticalEnvelopeDigest
        ? { verticalEnvelopeDigest: artifact.verticalEnvelopeDigest }
        : {}),
    };
    const digest = `sha256-${sha256Utf8(canonicalizeJsonValue(digestSource))}`;
    if (artifact.digest !== digest) {
      return { ok: false, error: "artifact digest does not recompute from v1 source" };
    }
    if (artifact.css !== expectedArtifactCss(artifact)) {
      return {
        ok: false,
        error: "artifact CSS is not the deterministic v1 rendering",
      };
    }
  } catch {
    return { ok: false, error: "artifact contains a non-canonical v1 value" };
  }
  return { ok: true, artifact };
}

function hexToBase64(hex: string): string {
  const alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const bytes = Array.from({ length: hex.length / 2 }, (_, index) =>
    Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16),
  );
  let output = "";
  for (let index = 0; index < bytes.length; index += 3) {
    const a = bytes[index];
    const b = bytes[index + 1];
    const c = bytes[index + 2];
    const bits = (a << 16) | ((b ?? 0) << 8) | (c ?? 0);
    output += alphabet[(bits >>> 18) & 63];
    output += alphabet[(bits >>> 12) & 63];
    output += b === undefined ? "=" : alphabet[(bits >>> 6) & 63];
    output += c === undefined ? "=" : alphabet[bits & 63];
  }
  return output;
}

export function tenantThemeArtifactCssIntegrity(
  artifact: TenantThemeArtifact,
): string {
  return `sha256-${hexToBase64(sha256Utf8(artifact.css))}`;
}

export type MountedTenantThemeArtifactVerification =
  | { ok: true; element: HTMLStyleElement | HTMLLinkElement }
  | { ok: false; error: string };

/** Prove that the verified artifact is already mounted by the application. */
export function verifyMountedTenantThemeArtifact(
  artifact: TenantThemeArtifact,
  root: ParentNode | undefined =
    typeof document === "undefined" ? undefined : document,
): MountedTenantThemeArtifactVerification {
  if (!root) return { ok: false, error: "no document root is available" };
  const candidates = Array.from(
    root.querySelectorAll<HTMLStyleElement | HTMLLinkElement>(
      `style[${TENANT_THEME_ARTIFACT_DIGEST_ATTRIBUTE}],link[${TENANT_THEME_ARTIFACT_DIGEST_ATTRIBUTE}]`,
    ),
  ).filter(
    (element) =>
      element.getAttribute(TENANT_THEME_ARTIFACT_SLUG_ATTRIBUTE) ===
        artifact.slug &&
      element.getAttribute(TENANT_THEME_ARTIFACT_VERTICAL_ATTRIBUTE) ===
        artifact.verticalKey,
  );
  if (candidates.length !== 1) {
    return {
      ok: false,
      error: `expected exactly one mounted artifact element, found ${candidates.length}`,
    };
  }
  const element = candidates[0];
  if (
    element.getAttribute(TENANT_THEME_ARTIFACT_DIGEST_ATTRIBUTE) !==
    artifact.digest
  ) {
    return {
      ok: false,
      error: "mounted artifact digest does not match the declaration",
    };
  }
  if (element.tagName === "STYLE") {
    return element.textContent === artifact.css
      ? { ok: true, element: element as HTMLStyleElement }
      : { ok: false, error: "mounted style bytes do not equal artifact.css" };
  }
  // A live CSSStyleSheet plus a matching *attribute* cannot prove which bytes
  // produced a link that may already have loaded before integrity was added.
  // Until the host can supply a browser-authenticated response receipt, inline
  // exact bytes are the only proof this synchronous boundary can verify.
  return {
    ok: false,
    error:
      "external stylesheet links cannot prove exact loaded artifact bytes; mount an inline style artifact",
  };
}

export const MOUNTED_ARTIFACT_SELECTOR =
  `style[${TENANT_THEME_ARTIFACT_DIGEST_ATTRIBUTE}],link[${TENANT_THEME_ARTIFACT_DIGEST_ATTRIBUTE}]`;

/**
 * Re-prove an already-admitted mount against the artifact it was admitted for.
 *
 * Admission is a point-in-time observation. This is the same observation, taken
 * again, plus the one invariant a single observation cannot express: the proof
 * must still rest on the SAME node. Re-verifying alone would accept a takeover
 * by an identical-looking element, which hands a later mutation to a node the
 * application never mounted.
 */
export function auditRetainedTenantThemeArtifact(
  artifact: TenantThemeArtifact,
  element: HTMLStyleElement | HTMLLinkElement,
  root: ParentNode | undefined =
    typeof document === "undefined" ? undefined : document,
): string | null {
  const current = verifyMountedTenantThemeArtifact(artifact, root);
  if (!current.ok) return current.error;
  if (current.element !== element) {
    return "the admitted artifact element was replaced after admission";
  }
  return null;
}

/**
 * SSR HONESTY.
 *
 * On the server there is no DOM, so the mounted-bytes proof the client performs
 * is unavailable by construction -- not merely inconvenient. An app-supplied
 * "the artifact is mounted" flag would be self-reporting, which is not proof of
 * anything, so this boundary does not offer one.
 *
 * What a server request CAN prove is narrower and real: that the design system
 * itself produced these exact bytes for this request and handed them to the
 * response writer. That is what a receipt is. It is minted only by
 * `emitTenantThemeArtifactForSsr`, only from an artifact whose digest has been
 * recomputed, and it cannot be forged by an object literal because admission
 * additionally requires membership in a module-private registry.
 *
 * SCOPE, stated honestly. The receipt does NOT prove the browser received the
 * bytes; nothing available at this boundary can. An application that mints a
 * receipt and then drops the markup from its response is lying about its own
 * output, and no check inside that same process can contradict it. The
 * containment is that such a lie survives exactly one render: hydration
 * re-resolves against a real document, finds no mounted artifact, and blocks.
 * Server emission and the client mount proof are two halves of one invariant,
 * and neither is offered as the whole of it.
 */
export interface TenantThemeArtifactSsrEmissionReceipt {
  readonly digest: string;
  /**
   * The v1 digest deliberately does NOT cover `css` -- CSS is proven instead by
   * re-rendering it deterministically. A receipt that bound only the digest
   * would therefore cover an artifact's identity but not its bytes, and the
   * bytes are the whole subject of this proof. This binds them directly.
   */
  readonly cssIntegrity: string;
  readonly slug: string;
  readonly verticalKey: string;
  readonly elementId: string;
}

export interface TenantThemeArtifactSsrEmission {
  readonly receipt: TenantThemeArtifactSsrEmissionReceipt;
  /** Spread onto the `<style>` element. Includes the three proof attributes. */
  readonly attributes: Readonly<Record<string, string>>;
  /** The exact bytes to place inside that element, and nothing else. */
  readonly css: string;
}

/**
 * Provenance, not data. A receipt is admitted because THIS module minted it,
 * so a structurally identical literal supplied by a caller is rejected. Weak
 * membership keeps the registry from retaining a receipt per request forever.
 */
const MINTED_SSR_RECEIPTS = new WeakSet<object>();

export const TENANT_THEME_ARTIFACT_ELEMENT_ID_PREFIX = "ds-tenant-css";

/**
 * One id shape for the artifact element, shared by the SSR emitter and the
 * client mount. If these two ever disagreed, hydration would either duplicate
 * the scope or fail to recognise the server's own element.
 */
export function tenantThemeArtifactElementId(slug: string): string {
  return `${TENANT_THEME_ARTIFACT_ELEMENT_ID_PREFIX}-${slug}`;
}

/**
 * Produce the artifact element a server response must carry, plus the receipt
 * that lets the resolver admit it. Throws rather than returning a partial
 * emission: a caller that cannot emit honestly must not be handed something
 * that looks emittable.
 */
export function emitTenantThemeArtifactForSsr(
  artifact: TenantThemeArtifact,
  expected: TenantThemeArtifactExpectation = { slug: artifact.slug },
): TenantThemeArtifactSsrEmission {
  // Checked BEFORE verification, deliberately. A raw `</style` in the payload
  // would close the element early and hand the remainder of the artifact to the
  // HTML parser as markup. Today's compiler cannot produce one, so ordering
  // this second would make it unreachable -- a guard no test could exercise and
  // no future compiler change would trip. It is the cheapest check here anyway.
  if (typeof artifact?.css === "string" && /<\/style/i.test(artifact.css)) {
    throw new Error(
      "[design-system] refusing to emit a tenant theme artifact whose CSS closes its own style element.",
    );
  }
  const verified = verifyTenantThemeArtifactV1(artifact, expected);
  if (!verified.ok) {
    throw new Error(
      `[design-system] refusing to emit an unverified tenant theme artifact: ${verified.error}.`,
    );
  }

  const receipt: TenantThemeArtifactSsrEmissionReceipt = Object.freeze({
    digest: verified.artifact.digest,
    cssIntegrity: tenantThemeArtifactCssIntegrity(verified.artifact),
    slug: verified.artifact.slug,
    verticalKey: verified.artifact.verticalKey,
    elementId: tenantThemeArtifactElementId(verified.artifact.slug),
  });
  MINTED_SSR_RECEIPTS.add(receipt);

  return Object.freeze({
    receipt,
    attributes: Object.freeze({
      id: receipt.elementId,
      "data-tenant-css": verified.artifact.slug,
      [TENANT_THEME_ARTIFACT_DIGEST_ATTRIBUTE]: verified.artifact.digest,
      [TENANT_THEME_ARTIFACT_SLUG_ATTRIBUTE]: verified.artifact.slug,
      [TENANT_THEME_ARTIFACT_VERTICAL_ATTRIBUTE]: verified.artifact.verticalKey,
    }),
    css: verified.artifact.css,
  });
}

/**
 * Audit a receipt against the artifact it is being used to admit. Returns the
 * reason it is unusable, or `null` when it genuinely covers this artifact.
 */
export function auditTenantThemeArtifactSsrReceipt(
  artifact: TenantThemeArtifact,
  receipt: unknown,
): string | null {
  if (receipt === undefined) return "no SSR emission receipt was supplied";
  if (!isRecord(receipt) || !MINTED_SSR_RECEIPTS.has(receipt)) {
    return "the SSR emission receipt was not minted by this runtime";
  }
  // A minted receipt still only covers the artifact it was minted for. Without
  // this, one legitimately emitted tenant would admit every other tenant.
  const candidate = receipt as unknown as TenantThemeArtifactSsrEmissionReceipt;
  if (candidate.digest !== artifact.digest) {
    return "the SSR emission receipt was minted for a different artifact";
  }
  if (candidate.cssIntegrity !== tenantThemeArtifactCssIntegrity(artifact)) {
    return "the SSR emission receipt was minted for different artifact bytes";
  }
  if (
    candidate.slug !== artifact.slug ||
    candidate.verticalKey !== artifact.verticalKey
  ) {
    return "the SSR emission receipt was minted for a different tenant scope";
  }
  return null;
}

export interface VisualAuthorityInput {
  declaration?: VisualAuthorityDeclaration;
  slug: string;
  verticalKey?: string;
  payload: RuntimeVisualPayloadCensus;
  /** `null` explicitly represents SSR/no mounted DOM proof. */
  documentRoot?: ParentNode | null;
}

export interface VisualAuthorityResolution {
  authority: VisualAuthority;
  origin: VisualAuthorityOrigin;
  suppressedChannels: readonly TenantVisualChannel[];
  conflict: string | null;
  artifact: TenantThemeArtifact | null;
  mountedArtifact: HTMLStyleElement | HTMLLinkElement | null;
}

const NO_SUPPRESSION: readonly TenantVisualChannel[] = Object.freeze([]);

function hasVisualPayload(payload: RuntimeVisualPayloadCensus): boolean {
  return (
    payload.visualBranding ||
    payload.tokenOverrides ||
    payload.appearance !== undefined ||
    payload.personality ||
    payload.brandTheme
  );
}

export function appearanceMatchesArtifact(
  appearance: TenantAppearance,
  normalizedAppearance: NormalizedTenantThemeAppearance,
): boolean {
  try {
    return (
      canonicalizeJsonValue(appearance) ===
      canonicalizeJsonValue(normalizedAppearance)
    );
  } catch {
    return false;
  }
}

function blocked(
  origin: VisualAuthorityOrigin,
  message: string,
): VisualAuthorityResolution {
  return {
    authority: "compiled-artifact",
    origin,
    suppressedChannels: TENANT_THEME_V1_COVERAGE,
    conflict: message,
    artifact: null,
    mountedArtifact: null,
  };
}

/** Resolve authority without inferring paint ownership from a tenant slug. */
export function resolveVisualAuthority(
  input: VisualAuthorityInput,
): VisualAuthorityResolution {
  const { declaration, slug, verticalKey, payload } = input;
  if (declaration === undefined) {
    if (hasVisualPayload(payload)) {
      return blocked(
        "uncompiled-visual-payload",
        `Tenant "${slug}" carries runtime visual payload but no verified mounted artifact.`,
      );
    }
    return {
      authority: "provider",
      origin: "no-visual-payload",
      suppressedChannels: NO_SUPPRESSION,
      conflict: null,
      artifact: null,
      mountedArtifact: null,
    };
  }

  if (
    !isRecord(declaration) ||
    (declaration.authority !== "provider" &&
      declaration.authority !== "compiled-artifact")
  ) {
    return blocked(
      "invalid-declaration",
      `Tenant "${slug}" supplied an invalid visual authority declaration.`,
    );
  }
  if (declaration.authority === "provider") {
    if (hasVisualPayload(payload)) {
      return blocked(
        "uncompiled-visual-payload",
        `Tenant "${slug}" cannot use context-only provider authority with runtime visual payload.`,
      );
    }
    return {
      authority: "provider",
      origin: "explicit-context",
      suppressedChannels: NO_SUPPRESSION,
      conflict: null,
      artifact: null,
      mountedArtifact: null,
    };
  }

  const verified = verifyTenantThemeArtifactV1(declaration.artifact, {
    slug,
    verticalKey,
  });
  if (!verified.ok) {
    return blocked(
      "invalid-declaration",
      `Tenant "${slug}" artifact rejected: ${verified.error}.`,
    );
  }
  const documentRoot =
    input.documentRoot === undefined
      ? typeof document === "undefined"
        ? null
        : document
      : input.documentRoot;

  // An explicit `null` means "there is no DOM to observe" and must stay that
  // way. Passing it through as `undefined` would re-enter the parameter default
  // and silently audit the ambient `document` instead -- so a caller declaring
  // it has no mounted proof would be answered by someone else's document.
  let mountedArtifact: HTMLStyleElement | HTMLLinkElement | null = null;
  let origin: VisualAuthorityOrigin = "compiled-envelope";
  if (documentRoot === null) {
    const receiptFailure = auditTenantThemeArtifactSsrReceipt(
      verified.artifact,
      declaration.ssrReceipt,
    );
    if (receiptFailure) {
      return blocked(
        "unprovable-ssr-mount",
        `Tenant "${slug}" cannot admit a compiled artifact with no mounted DOM: ${receiptFailure}.`,
      );
    }
    origin = "ssr-emission-receipt";
  } else {
    const mounted = verifyMountedTenantThemeArtifact(
      verified.artifact,
      documentRoot,
    );
    if (!mounted.ok) {
      return blocked(
        "invalid-declaration",
        `Tenant "${slug}" artifact is not mounted: ${mounted.error}.`,
      );
    }
    mountedArtifact = mounted.element;
  }

  const conflicts: string[] = [];
  if (payload.visualBranding) conflicts.push("raw visual branding");
  if (payload.tokenOverrides) conflicts.push("raw tokenOverrides");
  if (payload.personality) conflicts.push("raw tenant personality");
  if (payload.brandTheme) conflicts.push("raw tenant brandTheme");
  if (
    payload.appearance !== undefined &&
    !appearanceMatchesArtifact(
      payload.appearance,
      verified.artifact.normalizedAppearance,
    )
  ) {
    conflicts.push("raw appearance differs from the artifact");
  }
  if (conflicts.length > 0) {
    return blocked(
      "invalid-declaration",
      `Tenant "${slug}" mixes a compiled artifact with ${conflicts.join(", ")}.`,
    );
  }

  return {
    authority: "compiled-artifact",
    origin,
    suppressedChannels: verified.artifact.coverage,
    conflict: null,
    artifact: verified.artifact,
    mountedArtifact,
  };
}
