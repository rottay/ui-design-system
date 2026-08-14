/**
 * Runtime verification and ownership for tenant visual artifacts.
 *
 * A declaration is evidence, not a switch. The compiled form carries the full
 * v1 artifact and is accepted only when its identity, scopes, coverage, digest
 * and CSS all recompute and the exact bytes are mounted by the application.
 * Runtime payload is never used as a substitute compiler.
 */

import type { TenantConfig } from '@/foundation/contracts/composition/tenants';
import type { TenantAppearance } from '@/foundation/contracts/composition/tenants/themes';
import {
  TENANT_THEME_SCHEMA_VERSION,
  TENANT_THEME_V1_COVERAGE,
  type NormalizedTenantThemeAppearance,
  type TenantThemeArtifact,
  type TenantVisualChannel,
} from '@/foundation/contracts/composition/tenants/themes/tenant-theme';
import {
  canonicalizeJsonValue,
  cloneJsonValueExact,
} from '@/foundation/kernel/serialization';
import {
  TENANT_THEME_COMPILER_VERSION,
  sha256TenantThemeValue,
} from '@/infrastructure/compilers/composition/tenant-theme';

/** Context-only provider state or app-mounted compiled paint. */
export type VisualAuthority = 'provider' | 'compiled-artifact';

export const TENANT_THEME_ARTIFACT_DIGEST_ATTRIBUTE =
  'data-ds-tenant-theme-digest' as const;
export const TENANT_THEME_ARTIFACT_SLUG_ATTRIBUTE =
  'data-ds-tenant-theme-slug' as const;
export const TENANT_THEME_ARTIFACT_VERTICAL_ATTRIBUTE =
  'data-ds-tenant-theme-vertical' as const;

export type VisualAuthorityOrigin =
  | 'explicit-context'
  | 'compiled-envelope'
  /** Admitted on the server against a request-owned emission receipt. */
  | 'ssr-emission-receipt'
  | 'no-visual-payload'
  | 'invalid-declaration'
  /** Refused because no DOM exists AND no honest emission receipt was given. */
  | 'unprovable-ssr-mount'
  | 'uncompiled-visual-payload';

/** Explicitly context-only. This never grants a runtime painter. */
export interface ProviderDeclaration {
  authority: 'provider';
}

/** The app claims that this exact, complete v1 artifact is mounted. */
export interface CompiledArtifactDeclaration {
  authority: 'compiled-artifact';
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
  'primaryColor',
  'secondaryColor',
  'accentColor',
  'darkPrimaryColor',
  'darkSecondaryColor',
  'darkAccentColor',
  'darkBackgroundColor',
  'successColor',
  'warningColor',
  'errorColor',
  'infoColor',
  'fontFamilyBase',
  'fontFamilyHeading',
  'fontFamilyMono',
  'fontFamilyDisplay',
] as const;

export function censusRuntimeVisualPayload(
  config: Pick<
    TenantConfig,
    'branding' | 'tokenOverrides' | 'appearance' | 'personality' | 'brandTheme'
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
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

const LOWER_KEBAB_IDENTITY = /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/;

function freezeJsonValue<T>(value: T): T {
  if (value === null || typeof value !== 'object' || Object.isFrozen(value)) {
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
    return freezeJsonValue(cloneJsonValueExact(candidate) as TenantThemeArtifact);
  } catch {
    return null;
  }
}

function sameOrderedStrings(
  actual: readonly unknown[],
  expected: readonly string[],
): boolean {
  return actual.length === expected.length &&
    actual.every((value, index) => value === expected[index]);
}

function expectedScopes(slug: string, verticalKey: string): TenantThemeArtifact['scopes'] {
  return {
    root: { attribute: 'data-ds-root', selector: ':where([data-ds-root])' },
    vertical: {
      attribute: 'data-vertical',
      value: verticalKey,
      selector: `:where([data-ds-root][data-vertical="${verticalKey}"])`,
    },
    tenant: {
      attribute: 'data-tenant',
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
    .join('\n');
  return [
    `/* TenantThemeArtifact v1 | ${TENANT_THEME_COMPILER_VERSION} | ${artifact.digest} */`,
    `${artifact.scopes.combinedSelector} {`,
    declarations,
    '}',
    '',
  ].join('\n');
}

/** Recompute every self-contained invariant in the v1 artifact. */
export function verifyTenantThemeArtifactV1(
  candidate: unknown,
  expected: TenantThemeArtifactExpectation,
): TenantThemeArtifactVerification {
  if (!isRecord(candidate)) return { ok: false, error: 'artifact is not an object' };

  // Snapshot BEFORE verifying, then verify the snapshot. Every check below
  // therefore reads the same owned bytes the caller will consume: a declaration
  // cannot pass verification and then mutate its appearance or CSS, and an
  // accessor on the candidate cannot serve one value to the verifier and
  // another to the consumer.
  const artifact = exactArtifactSnapshot(candidate);
  if (!artifact) return { ok: false, error: 'artifact is not plain JSON data' };
  if (artifact.schemaVersion !== TENANT_THEME_SCHEMA_VERSION) {
    return { ok: false, error: `schemaVersion is not ${TENANT_THEME_SCHEMA_VERSION}` };
  }
  if (artifact.compilerVersion !== TENANT_THEME_COMPILER_VERSION) {
    return { ok: false, error: `compilerVersion is not ${TENANT_THEME_COMPILER_VERSION}` };
  }
  if (artifact.slug !== expected.slug) {
    return { ok: false, error: `artifact slug ${JSON.stringify(artifact.slug)} does not match ${JSON.stringify(expected.slug)}` };
  }
  if (expected.verticalKey !== undefined && artifact.verticalKey !== expected.verticalKey) {
    return { ok: false, error: `artifact verticalKey ${JSON.stringify(artifact.verticalKey)} does not match ${JSON.stringify(expected.verticalKey)}` };
  }
  if (
    typeof artifact.tenantId !== 'string' || artifact.tenantId.length === 0 ||
    typeof artifact.slug !== 'string' || !LOWER_KEBAB_IDENTITY.test(artifact.slug) ||
    typeof artifact.verticalKey !== 'string' || !LOWER_KEBAB_IDENTITY.test(artifact.verticalKey) ||
    !Number.isSafeInteger(artifact.rowVersion) || artifact.rowVersion < 0 ||
    typeof artifact.digest !== 'string' || !/^sha256-[0-9a-f]{64}$/.test(artifact.digest) ||
    (artifact.verticalEnvelopeDigest !== undefined &&
      !/^sha256-[0-9a-f]{64}$/.test(artifact.verticalEnvelopeDigest)) ||
    !isRecord(artifact.normalizedAppearance) ||
    !isRecord(artifact.variables) ||
    !isRecord(artifact.scopes) ||
    typeof artifact.css !== 'string' ||
    !Array.isArray(artifact.coverage) ||
    (artifact.adjustments !== undefined && (
      !Array.isArray(artifact.adjustments) ||
      artifact.adjustments.some((adjustment) =>
        !isRecord(adjustment) ||
        typeof adjustment.token !== 'string' ||
        typeof adjustment.pairedWith !== 'string' ||
        typeof adjustment.from !== 'string' ||
        typeof adjustment.to !== 'string' ||
        typeof adjustment.lcBefore !== 'number' ||
        !Number.isFinite(adjustment.lcBefore) ||
        typeof adjustment.lcAfter !== 'number' ||
        !Number.isFinite(adjustment.lcAfter)
      )
    ))
  ) {
    return { ok: false, error: 'artifact is missing a required v1 field or field type' };
  }
  if (!sameOrderedStrings(artifact.coverage, TENANT_THEME_V1_COVERAGE)) {
    return { ok: false, error: 'coverage is not the exact ordered v1 coverage' };
  }
  if (
    Object.entries(artifact.variables).some(
      ([name, value]) => !name.startsWith('--ds-') || typeof value !== 'string',
    ) ||
    Object.keys(artifact.variables).join('\0') !==
      Object.keys(artifact.variables).sort().join('\0')
  ) {
    return { ok: false, error: 'variables are not an ordered --ds-* string map' };
  }

  try {
    const scopes = expectedScopes(artifact.slug, artifact.verticalKey);
    if (canonicalizeJsonValue(artifact.scopes) !== canonicalizeJsonValue(scopes)) {
      return { ok: false, error: 'artifact scopes do not recompute from identity' };
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
    const digest = `sha256-${sha256TenantThemeValue(canonicalizeJsonValue(digestSource))}`;
    if (artifact.digest !== digest) {
      return { ok: false, error: 'artifact digest does not recompute from v1 source' };
    }
    if (artifact.css !== expectedArtifactCss(artifact)) {
      return { ok: false, error: 'artifact CSS is not the deterministic v1 rendering' };
    }
  } catch {
    return { ok: false, error: 'artifact contains a non-canonical v1 value' };
  }
  return { ok: true, artifact };
}

function hexToBase64(hex: string): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const bytes = Array.from({ length: hex.length / 2 }, (_, index) =>
    Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16),
  );
  let output = '';
  for (let index = 0; index < bytes.length; index += 3) {
    const a = bytes[index];
    const b = bytes[index + 1];
    const c = bytes[index + 2];
    const bits = (a << 16) | ((b ?? 0) << 8) | (c ?? 0);
    output += alphabet[(bits >>> 18) & 63];
    output += alphabet[(bits >>> 12) & 63];
    output += b === undefined ? '=' : alphabet[(bits >>> 6) & 63];
    output += c === undefined ? '=' : alphabet[bits & 63];
  }
  return output;
}

export function tenantThemeArtifactCssIntegrity(artifact: TenantThemeArtifact): string {
  return `sha256-${hexToBase64(sha256TenantThemeValue(artifact.css))}`;
}

export type MountedTenantThemeArtifactVerification =
  | { ok: true; element: HTMLStyleElement | HTMLLinkElement }
  | { ok: false; error: string };

/** Prove that the verified artifact is already mounted by the application. */
export function verifyMountedTenantThemeArtifact(
  artifact: TenantThemeArtifact,
  root: ParentNode | undefined =
    typeof document === 'undefined' ? undefined : document,
): MountedTenantThemeArtifactVerification {
  if (!root) return { ok: false, error: 'no document root is available' };
  const candidates = Array.from(
    root.querySelectorAll<HTMLStyleElement | HTMLLinkElement>(
      `style[${TENANT_THEME_ARTIFACT_DIGEST_ATTRIBUTE}],link[${TENANT_THEME_ARTIFACT_DIGEST_ATTRIBUTE}]`,
    ),
  ).filter(
    (element) =>
      element.getAttribute(TENANT_THEME_ARTIFACT_SLUG_ATTRIBUTE) === artifact.slug &&
      element.getAttribute(TENANT_THEME_ARTIFACT_VERTICAL_ATTRIBUTE) === artifact.verticalKey,
  );
  if (candidates.length !== 1) {
    return { ok: false, error: `expected exactly one mounted artifact element, found ${candidates.length}` };
  }
  const element = candidates[0];
  if (element.getAttribute(TENANT_THEME_ARTIFACT_DIGEST_ATTRIBUTE) !== artifact.digest) {
    return { ok: false, error: 'mounted artifact digest does not match the declaration' };
  }
  if (element.tagName === 'STYLE') {
    return element.textContent === artifact.css
      ? { ok: true, element: element as HTMLStyleElement }
      : { ok: false, error: 'mounted style bytes do not equal artifact.css' };
  }
  // A live CSSStyleSheet plus a matching *attribute* cannot prove which bytes
  // produced a link that may already have loaded before integrity was added.
  // Until the host can supply a browser-authenticated response receipt, inline
  // exact bytes are the only proof this synchronous boundary can verify.
  return {
    ok: false,
    error: 'external stylesheet links cannot prove exact loaded artifact bytes; mount an inline style artifact',
  };
}

const MOUNTED_ARTIFACT_SELECTOR =
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
    typeof document === 'undefined' ? undefined : document,
): string | null {
  const current = verifyMountedTenantThemeArtifact(artifact, root);
  if (!current.ok) return current.error;
  if (current.element !== element) {
    return 'the admitted artifact element was replaced after admission';
  }
  return null;
}

/**
 * Name the disqualifying change a single record carries, if it carries one.
 *
 * Records are delivered in a batch, after the fact. Auditing the document at
 * delivery time therefore answers a different question from the one asked: it
 * reports the state the mutations settled into, not whether the admitted
 * element was ever displaced. A detach followed by a re-attach, or a rewrite
 * followed by a restore, settles into a pristine end state and would be
 * certified -- even though the paint diverged from the artifact for the whole
 * window in between.
 *
 * The artifact is immutable by contract: server-compiled bytes, mounted once.
 * So any record that reaches its content or removes it IS the divergence, and
 * is judged from the record itself rather than from what the DOM looks like
 * afterwards.
 */
const ARTIFACT_REMOVED = 'the admitted artifact element was removed from the document';

function disqualifyingArtifactMutation(
  record: MutationRecord,
  element: Element,
): string | null {
  if (record.type === 'characterData') {
    return element.contains(record.target)
      ? 'the admitted artifact bytes were rewritten'
      : null;
  }
  if (record.type === 'attributes') {
    if (record.target !== element) return null;
    const attribute = record.attributeName;
    // A same-value write still produces a record. Only a real change moves the
    // element's scope, and the filter already narrows this to the three proof
    // attributes.
    return attribute && record.oldValue !== element.getAttribute(attribute)
      ? 'the admitted artifact scope attributes were changed'
      : null;
  }
  if (record.type !== 'childList') return null;
  if (record.target === element || element.contains(record.target)) {
    return 'the admitted artifact bytes were rewritten';
  }
  return Array.from(record.removedNodes).some(
    (node) => node === element || (node.contains?.(element) ?? false),
  )
    ? ARTIFACT_REMOVED
    : null;
}

function touchesArtifactProof(
  record: MutationRecord,
  element: Element,
): boolean {
  // `attributes` is filtered to the three artifact attributes, so any such
  // record is by construction relevant: it either re-labels the admitted
  // element or promotes some other node into the same tenant scope.
  if (record.type === 'attributes') return true;
  if (element === record.target || element.contains(record.target)) return true;
  const carriesArtifact = (node: Node): boolean => {
    if (node.nodeType !== 1) return false;
    const candidate = node as Element;
    return candidate.matches?.(MOUNTED_ARTIFACT_SELECTOR) === true ||
      candidate.querySelector?.(MOUNTED_ARTIFACT_SELECTOR) != null;
  };
  return Array.from(record.addedNodes).some(carriesArtifact) ||
    Array.from(record.removedNodes).some(carriesArtifact);
}

/**
 * Keep an admitted mount under proof for as long as the declaration is live.
 *
 * `resolveVisualAuthority` proves that the exact artifact bytes are mounted at
 * the moment it runs, and then the tree renders for as long as the application
 * lives. Everything a client can do to that element afterwards -- remove it,
 * rewrite its bytes, relabel its scope attributes, mount a second element into
 * the same tenant scope, or swap the node out from under the admission -- moves
 * the real paint away from the artifact the runtime is still claiming. Each of
 * those revokes here, and the caller must block on revocation exactly as it
 * blocks on a failed admission.
 *
 * SCOPE, stated honestly. This proves that the ADMITTED NODE stays present,
 * unique in its tenant scope, and byte-exact. It does not, and cannot, prove
 * that no other stylesheet in the document paints over it -- any script that
 * can reach the DOM can append `!important` rules the DS never sees, and no
 * runtime check can prevent that. One narrower residual is in the same class:
 * a CSSOM write (`element.sheet.insertRule`) changes the rendered rules without
 * touching the node's text and fires no mutation record, so it is invisible to
 * this watch. Both are properties of the platform, not gaps this function
 * silently ignores.
 */
export function retainMountedTenantThemeArtifact(
  artifact: TenantThemeArtifact,
  element: HTMLStyleElement | HTMLLinkElement,
  onRevoked: (conflict: string) => void,
  root: ParentNode | undefined =
    typeof document === 'undefined' ? undefined : document,
): () => void {
  return watchMountedTenantThemeArtifact(artifact, element, onRevoked, root).release;
}

/**
 * The same watch, plus the one control a React commit needs.
 *
 * `MutationObserver` delivers its records in a microtask, and a commit does not
 * yield one: the mutation phase, every layout effect and the browser's paint
 * all happen on one task. A watch that can only hear from its own callback
 * therefore learns what a descendant did AFTER the frame that tampering
 * painted. `drain` takes the same verdict on the caller's stack, from the
 * records the observer is already holding, which is the whole difference
 * between a gate and a report.
 */
interface RetainedArtifactWatcher {
  /** Stop watching. */
  readonly release: () => void;
  /** Judge every pending record now, then re-audit the admitted node. */
  readonly drain: () => void;
}

const INERT_ARTIFACT_WATCHER: RetainedArtifactWatcher = Object.freeze({
  release: () => {},
  drain: () => {},
});

function watchMountedTenantThemeArtifact(
  artifact: TenantThemeArtifact,
  element: HTMLStyleElement | HTMLLinkElement,
  onRevoked: (conflict: string) => void,
  root: ParentNode | undefined,
): RetainedArtifactWatcher {
  if (!root) {
    onRevoked('no document root is available to retain the mounted artifact');
    return INERT_ARTIFACT_WATCHER;
  }
  if (typeof MutationObserver === 'undefined') {
    // An unretainable proof is not a retained proof. Fail closed rather than
    // let the admission stand unwatched for the life of the tree.
    onRevoked('the mounted artifact cannot be retained: MutationObserver is unavailable');
    return INERT_ARTIFACT_WATCHER;
  }

  let revoked = false;
  const revoke = (reason: string): void => {
    if (revoked) return;
    revoked = true;
    observer.disconnect();
    onRevoked(`the mounted artifact was revoked: ${reason}`);
  };

  const judge = (records: readonly MutationRecord[]): void => {
    if (revoked) return;
    for (const record of records) {
      const disqualified = disqualifyingArtifactMutation(record, element);
      if (!disqualified) continue;
      if (disqualified === ARTIFACT_REMOVED) {
        // A removal that leaves another element holding the scope is a
        // takeover, and saying so is worth the one extra look at the DOM.
        const settled = verifyMountedTenantThemeArtifact(artifact, root);
        if (settled.ok && settled.element !== element) {
          revoke('the admitted artifact element was replaced after admission');
          return;
        }
      }
      revoke(disqualified);
      return;
    }
    if (!records.some((record) => touchesArtifactProof(record, element))) return;
    // Changes elsewhere in the document cannot be judged from a record alone --
    // a node appearing in the same tenant scope only breaks uniqueness if it is
    // still there. Those are settled by re-auditing the end state.
    const failure = auditRetainedTenantThemeArtifact(artifact, element, root);
    if (failure) revoke(failure);
  };

  const observer = new MutationObserver(judge);

  observer.observe(root as Node, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeOldValue: true,
    attributeFilter: [
      TENANT_THEME_ARTIFACT_DIGEST_ATTRIBUTE,
      TENANT_THEME_ARTIFACT_SLUG_ATTRIBUTE,
      TENANT_THEME_ARTIFACT_VERTICAL_ATTRIBUTE,
    ],
  });

  // The DOM can have moved between admission and this call. Audit once now so
  // the watch never starts by certifying a mount that is already gone.
  const initial = auditRetainedTenantThemeArtifact(artifact, element, root);
  if (initial) revoke(initial);

  return {
    release: () => {
      revoked = true;
      observer.disconnect();
    },
    drain: () => {
      if (revoked) return;
      judge(observer.takeRecords());
      if (revoked) return;
      // Records name what was DONE; this names what IS. The two answer
      // different questions and the seal owes the caller both: a displacement
      // that produced no record this watch can attribute -- one that happened
      // between admission and arming, or through a root this observer does not
      // cover -- is still a paint that diverged from the artifact.
      const failure = auditRetainedTenantThemeArtifact(artifact, element, root);
      if (failure) revoke(failure);
    },
  };
}

/**
 * A live watch over one artifact identity in one document.
 *
 * The retention above is per-call: one observer and one revoked flag per
 * caller. That is the wrong shape for a React tree, for two reasons.
 *
 * ARMING ORDER. The watch has to be armed while the provider renders, before
 * descendants exist, so it cannot be owned by an effect -- and therefore
 * cannot be owned by one component instance. The document owns it; components
 * subscribe.
 *
 * REVOCATION LIFETIME. A revocation stored in component state lives exactly as
 * long as the admission object it was keyed to. Applications declare the
 * artifact inline, so that is one render. The next render re-resolves, and a
 * re-resolve is not a re-proof of the thing that failed: it re-runs precisely
 * the observation a takeover already satisfies -- one byte-exact element with
 * the right scope attributes -- and admits the replacement. Node identity is
 * the only evidence separating the admitted element from an identical
 * impostor, and once broken it cannot be rebuilt by observing harder. So the
 * verdict outlives the admission: an identity revoked in a document stays
 * revoked there.
 *
 * The cost is stated plainly: an application that legitimately unmounts and
 * remounts the same compiled artifact stays blocked until it ships a different
 * one. That is fail-closed by choice. The artifact is server-embedded and
 * immutable by contract, so a client that removes it is doing the thing this
 * gate exists to catch, and a real theme change recompiles to a new digest and
 * is admitted on its own proof.
 */
export interface RetainedArtifactWatchHandle {
  /** The revocation reason, or null. Safe to read during render. */
  readonly revocation: () => string | null;
  /** Subscribe and retain; the returned function unsubscribes and releases. */
  readonly subscribe: (onRevocationChange: () => void) => () => void;
  /**
   * Settle every pending verdict now, before the caller's frame paints.
   *
   * A no-op on a watch nobody has armed -- a seal is a demand for the current
   * verdict, never permission to start watching.
   */
  readonly seal: () => void;
}

interface RetainedArtifactWatch {
  readonly artifact: TenantThemeArtifact;
  readonly element: HTMLStyleElement | HTMLLinkElement;
  readonly root: ParentNode;
  readonly handle: RetainedArtifactWatchHandle;
  /** The subscriber set IS the reference count; there is no second tally. */
  readonly subscribers: Set<() => void>;
  revoked: string | null;
  watcher: RetainedArtifactWatcher | null;
  releaseScheduled: boolean;
}

const RETENTION_LEDGERS = new WeakMap<ParentNode, Map<string, RetainedArtifactWatch>>();

function retainedArtifactIdentity(artifact: TenantThemeArtifact): string {
  return `${artifact.digest}|${artifact.slug}|${artifact.verticalKey}`;
}

/**
 * Arm the retained-artifact watch for this identity, or join the armed one.
 *
 * COMMIT PHASE ONLY. This is a side effect on a document, and idempotence does
 * not make it safe to perform during render: React discards renders, and the
 * ledger entry a discarded render creates is one no cleanup will ever reach.
 * React callers go through `prepareMountedTenantThemeArtifactClaim`, which
 * splits the read from the write. This stays exported for the ledger's own
 * drills and for a non-React host that owns its own commit boundary.
 *
 * Idempotent per (document, artifact identity): at most one watch per identity
 * can exist in a document, and it is exactly the watch the runtime wants alive.
 * The returned handle is stable for the life of the watch, so a caller whose
 * admission object churns every render still subscribes once.
 */
export function armMountedTenantThemeArtifact(
  artifact: TenantThemeArtifact,
  element: HTMLStyleElement | HTMLLinkElement,
  root: ParentNode | undefined =
    typeof document === 'undefined' ? undefined : document,
): RetainedArtifactWatchHandle {
  if (!root) {
    const reason = 'no document root is available to retain the mounted artifact';
    return { revocation: () => reason, subscribe: () => () => {}, seal: () => {} };
  }

  const key = retainedArtifactIdentity(artifact);
  let ledger = RETENTION_LEDGERS.get(root);
  if (!ledger) {
    ledger = new Map();
    RETENTION_LEDGERS.set(root, ledger);
  }

  const existing = ledger.get(key);
  if (existing) {
    if (!existing.revoked && existing.element !== element) {
      // Two admissions of one identity resolved to two different nodes. Only a
      // replacement can produce that, and the watch is already the authority on
      // what replacement means.
      revokeRetainedArtifactWatch(
        existing,
        'the mounted artifact was revoked: the admitted artifact element was replaced after admission',
      );
    }
    // Arming is a live claim, so it re-arms a watch the last subscriber let go
    // rather than hand back a handle that is dormant until the next commit.
    joinRetainedArtifactWatch(existing, ledger, key);
    return existing.handle;
  }

  const scope = ledger;
  const watch: RetainedArtifactWatch = {
    artifact,
    element,
    root,
    subscribers: new Set(),
    revoked: null,
    watcher: null,
    releaseScheduled: false,
    handle: {
      revocation: () => watch.revoked,
      seal: () => { watch.watcher?.drain(); },
      subscribe: (onRevocationChange) => {
        joinRetainedArtifactWatch(watch, scope, key);
        watch.subscribers.add(onRevocationChange);
        return () => {
          if (!watch.subscribers.delete(onRevocationChange)) return;
          if (watch.subscribers.size > 0 || watch.revoked) return;
          scheduleRetainedArtifactRelease(watch, scope, key);
        };
      },
    },
  };
  ledger.set(key, watch);
  armRetainedArtifactWatch(watch);

  return watch.handle;
}

function armRetainedArtifactWatch(watch: RetainedArtifactWatch): void {
  watch.watcher = watchMountedTenantThemeArtifact(
    watch.artifact,
    watch.element,
    (conflict) => revokeRetainedArtifactWatch(watch, conflict),
    watch.root,
  );
  // A synchronous revocation from the arming audit lands before the watcher
  // above is assigned, so reconcile once here rather than leave a live handle
  // on a disconnected observer.
  if (watch.revoked) {
    watch.watcher.release();
    watch.watcher = null;
  }
}

/**
 * Rejoin a watch, re-arming it if the last subscriber had already let it go.
 *
 * StrictMode replays subscriptions (subscribe -> unsubscribe -> resubscribe) and
 * `useSyncExternalStore` subscribes through an internal effect, so the drop to
 * zero subscribers is a normal development posture rather than a teardown. The
 * scheduled release below absorbs that case without ever disconnecting; this
 * covers the rest, where a host rejoins after the release actually ran -- a
 * hidden subtree being shown again, for instance.
 *
 * Re-arming re-audits, and that audit is bound to the node the admission named,
 * so anything that displaced the element while the watch was down is caught
 * here. What stays unobserved is a change made and undone inside the gap -- and
 * for the whole gap no subscriber was attached, which is to say no committed
 * consumer was reading this verdict.
 */
function joinRetainedArtifactWatch(
  watch: RetainedArtifactWatch,
  ledger: Map<string, RetainedArtifactWatch>,
  key: string,
): void {
  watch.releaseScheduled = false;
  if (watch.revoked || watch.watcher) return;
  const current = ledger.get(key);
  if (current && current !== watch) {
    // Another watch already holds this identity in this document. Reviving this
    // one beside it would put two proofs on one identity, and neither took the
    // evidence that would order them.
    revokeRetainedArtifactWatch(
      watch,
      'the mounted artifact was revoked: the retained proof was superseded while it was released',
    );
    return;
  }
  ledger.set(key, watch);
  armRetainedArtifactWatch(watch);
}

/**
 * Release one microtask later, so a resubscribe in the same tick cancels it.
 *
 * Tearing down at the instant the last subscriber leaves is what makes a
 * StrictMode replay fatal: the observer is gone and the rejoin lands on a dead
 * handle. Deferring costs nothing -- the watch is idle either way -- and the
 * cancellation is the whole point.
 */
function scheduleRetainedArtifactRelease(
  watch: RetainedArtifactWatch,
  ledger: Map<string, RetainedArtifactWatch>,
  key: string,
): void {
  if (watch.releaseScheduled) return;
  watch.releaseScheduled = true;
  queueMicrotask(() => {
    if (!watch.releaseScheduled) return;
    watch.releaseScheduled = false;
    if (watch.subscribers.size > 0 || watch.revoked) return;
    // Nothing is depending on this proof any more, and it never failed. Drop it
    // so a later mount arms a fresh watch on its own evidence.
    watch.watcher?.release();
    watch.watcher = null;
    if (ledger.get(key) === watch) ledger.delete(key);
  });
}

function revokeRetainedArtifactWatch(
  watch: RetainedArtifactWatch,
  conflict: string,
): void {
  if (watch.revoked) return;
  watch.revoked = conflict;
  watch.watcher?.release();
  watch.watcher = null;
  for (const notify of Array.from(watch.subscribers)) notify();
}

/**
 * Read this document's verdict on an artifact identity WITHOUT arming it.
 *
 * Render must be able to see a sticky revocation -- that is the whole point of
 * stickiness -- and render must not have side effects. Those are only in
 * tension if reading and arming are the same act, so they are not: this looks
 * the identity up in the ledger and touches nothing.
 */
function peekRetainedArtifactRevocation(
  root: ParentNode,
  artifact: TenantThemeArtifact,
): string | null {
  return RETENTION_LEDGERS.get(root)?.get(retainedArtifactIdentity(artifact))?.revoked
    ?? null;
}

/**
 * A claim on an admitted mount, prepared during render and owned by a commit.
 *
 * The arm has to happen before any descendant runs, which used to mean it
 * happened during the provider's render -- and a render is not an event that
 * happened. React discards renders: a sibling throws, a child suspends, a
 * concurrent pass is superseded. Each of those leaves an armed observer and a
 * ledger entry that no commit will ever release, and because a revocation is
 * deliberately permanent, one abandoned render can poison an identity for the
 * life of the document. That is a self-inflicted denial of the very artifact
 * the gate exists to protect.
 *
 * So render prepares and commits arm. Preparing is pure -- it captures the
 * artifact, the node the admission named, and the document, and reads the
 * standing verdict -- while `commit` performs the single side effect, from an
 * insertion effect, which React runs during the mutation phase: after the DOM
 * is in place, before every descendant's insertion and layout effect, and
 * before paint. A discarded render never reaches it and so leaves nothing
 * behind; a real commit owns a release that is guaranteed to run.
 *
 * `seal` is the other half of the same clock. Effects and paint share one task,
 * so the observer's microtask has not run when the frame goes out; the last
 * thing in the tree drains it, and the provider's own store check -- a parent's
 * layout effect, after every child's -- turns that verdict into a synchronous
 * re-render before anything is shown.
 */
export interface PreparedTenantThemeArtifactClaim {
  /** The standing verdict for this identity. Safe to read during render. */
  readonly revocation: () => string | null;
  /** Subscribe to verdict changes. Pure: it neither arms nor releases. */
  readonly subscribe: (onRevocationChange: () => void) => () => void;
  /** Arm and join the document watch. Returns the release for THIS claim. */
  readonly commit: () => () => void;
  /** Settle the committed claim's pending verdict before paint. */
  readonly seal: () => void;
}

export function prepareMountedTenantThemeArtifactClaim(
  artifact: TenantThemeArtifact,
  element: HTMLStyleElement | HTMLLinkElement,
  root: ParentNode | undefined =
    typeof document === 'undefined' ? undefined : document,
): PreparedTenantThemeArtifactClaim {
  if (!root) {
    const reason = 'no document root is available to retain the mounted artifact';
    return {
      revocation: () => reason,
      subscribe: () => () => {},
      commit: () => () => {},
      seal: () => {},
    };
  }

  const scope = root;
  const listeners = new Set<() => void>();
  const notify = (): void => {
    for (const listener of Array.from(listeners)) listener();
  };
  let committed: RetainedArtifactWatchHandle | null = null;

  return {
    revocation: () =>
      committed?.revocation() ?? peekRetainedArtifactRevocation(scope, artifact),
    subscribe: (onRevocationChange) => {
      listeners.add(onRevocationChange);
      return () => { listeners.delete(onRevocationChange); };
    },
    commit: () => {
      const handle = armMountedTenantThemeArtifact(artifact, element, scope);
      committed = handle;
      const leave = handle.subscribe(notify);
      // Only a claim that got here releases anything. A prepared-and-discarded
      // claim has no cleanup to run because it never took a hold to give back.
      return () => {
        if (committed === handle) committed = null;
        leave();
      };
    },
    seal: () => { committed?.seal(); },
  };
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

export const TENANT_THEME_ARTIFACT_ELEMENT_ID_PREFIX = 'ds-tenant-css';

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
  if (typeof artifact?.css === 'string' && /<\/style/i.test(artifact.css)) {
    throw new Error(
      '[design-system] refusing to emit a tenant theme artifact whose CSS closes its own style element.',
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
      'data-tenant-css': verified.artifact.slug,
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
  if (receipt === undefined) return 'no SSR emission receipt was supplied';
  if (!isRecord(receipt) || !MINTED_SSR_RECEIPTS.has(receipt)) {
    return 'the SSR emission receipt was not minted by this runtime';
  }
  // A minted receipt still only covers the artifact it was minted for. Without
  // this, one legitimately emitted tenant would admit every other tenant.
  const candidate = receipt as unknown as TenantThemeArtifactSsrEmissionReceipt;
  if (candidate.digest !== artifact.digest) {
    return 'the SSR emission receipt was minted for a different artifact';
  }
  if (candidate.cssIntegrity !== tenantThemeArtifactCssIntegrity(artifact)) {
    return 'the SSR emission receipt was minted for different artifact bytes';
  }
  if (
    candidate.slug !== artifact.slug ||
    candidate.verticalKey !== artifact.verticalKey
  ) {
    return 'the SSR emission receipt was minted for a different tenant scope';
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
  return payload.visualBranding || payload.tokenOverrides ||
    payload.appearance !== undefined || payload.personality || payload.brandTheme;
}

export function appearanceMatchesArtifact(
  appearance: TenantAppearance,
  normalizedAppearance: NormalizedTenantThemeAppearance,
): boolean {
  try {
    return canonicalizeJsonValue(appearance) ===
      canonicalizeJsonValue(normalizedAppearance);
  } catch {
    return false;
  }
}

function blocked(
  origin: VisualAuthorityOrigin,
  message: string,
): VisualAuthorityResolution {
  return {
    authority: 'compiled-artifact',
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
        'uncompiled-visual-payload',
        `Tenant "${slug}" carries runtime visual payload but no verified mounted artifact.`,
      );
    }
    return {
      authority: 'provider',
      origin: 'no-visual-payload',
      suppressedChannels: NO_SUPPRESSION,
      conflict: null,
      artifact: null,
      mountedArtifact: null,
    };
  }

  if (!isRecord(declaration) ||
      (declaration.authority !== 'provider' && declaration.authority !== 'compiled-artifact')) {
    return blocked('invalid-declaration', `Tenant "${slug}" supplied an invalid visual authority declaration.`);
  }
  if (declaration.authority === 'provider') {
    if (hasVisualPayload(payload)) {
      return blocked(
        'uncompiled-visual-payload',
        `Tenant "${slug}" cannot use context-only provider authority with runtime visual payload.`,
      );
    }
    return {
      authority: 'provider',
      origin: 'explicit-context',
      suppressedChannels: NO_SUPPRESSION,
      conflict: null,
      artifact: null,
      mountedArtifact: null,
    };
  }

  const verified = verifyTenantThemeArtifactV1(declaration.artifact, { slug, verticalKey });
  if (!verified.ok) {
    return blocked('invalid-declaration', `Tenant "${slug}" artifact rejected: ${verified.error}.`);
  }
  const documentRoot = input.documentRoot === undefined
    ? (typeof document === 'undefined' ? null : document)
    : input.documentRoot;

  // An explicit `null` means "there is no DOM to observe" and must stay that
  // way. Passing it through as `undefined` would re-enter the parameter default
  // and silently audit the ambient `document` instead -- so a caller declaring
  // it has no mounted proof would be answered by someone else's document.
  let mountedArtifact: HTMLStyleElement | HTMLLinkElement | null = null;
  let origin: VisualAuthorityOrigin = 'compiled-envelope';
  if (documentRoot === null) {
    const receiptFailure = auditTenantThemeArtifactSsrReceipt(
      verified.artifact,
      declaration.ssrReceipt,
    );
    if (receiptFailure) {
      return blocked(
        'unprovable-ssr-mount',
        `Tenant "${slug}" cannot admit a compiled artifact with no mounted DOM: ${receiptFailure}.`,
      );
    }
    origin = 'ssr-emission-receipt';
  } else {
    const mounted = verifyMountedTenantThemeArtifact(verified.artifact, documentRoot);
    if (!mounted.ok) {
      return blocked('invalid-declaration', `Tenant "${slug}" artifact is not mounted: ${mounted.error}.`);
    }
    mountedArtifact = mounted.element;
  }

  const conflicts: string[] = [];
  if (payload.visualBranding) conflicts.push('raw visual branding');
  if (payload.tokenOverrides) conflicts.push('raw tokenOverrides');
  if (payload.personality) conflicts.push('raw tenant personality');
  if (payload.brandTheme) conflicts.push('raw tenant brandTheme');
  if (
    payload.appearance !== undefined &&
    !appearanceMatchesArtifact(payload.appearance, verified.artifact.normalizedAppearance)
  ) {
    conflicts.push('raw appearance differs from the artifact');
  }
  if (conflicts.length > 0) {
    return blocked(
      'invalid-declaration',
      `Tenant "${slug}" mixes a compiled artifact with ${conflicts.join(', ')}.`,
    );
  }

  return {
    authority: 'compiled-artifact',
    origin,
    suppressedChannels: verified.artifact.coverage,
    conflict: null,
    artifact: verified.artifact,
    mountedArtifact,
  };
}

let hasReportedConflict = false;

/**
 * Reset the once-per-process conflict report and the ambient document's
 * retention ledger.
 *
 * A revoked identity is deliberately permanent for the life of a document, so
 * a suite that reuses one document needs a way back to a clean slate between
 * cases. Only the ambient document is cleared: a caller that armed a watch on
 * a detached root holds that root itself and its ledger dies with it.
 */
export function resetVisualAuthorityDiagnostics(): void {
  hasReportedConflict = false;
  if (typeof document === 'undefined') return;
  const ledger = RETENTION_LEDGERS.get(document);
  if (!ledger) return;
  for (const watch of ledger.values()) {
    watch.watcher?.release();
    watch.watcher = null;
    watch.releaseScheduled = false;
  }
  ledger.clear();
}

export function reportVisualAuthorityConflict(
  conflict: string,
  environment: string | undefined = process.env.NODE_ENV,
): void {
  if (environment === 'development') throw new Error(`[design-system] ${conflict}`);
  if (hasReportedConflict) return;
  hasReportedConflict = true;
  console.error(`[design-system] ${conflict}`);
}
