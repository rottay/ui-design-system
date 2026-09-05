/**
 * @fileoverview `mountTenantTheme` — the ONE server call that mounts a tenant's
 * compiled visual identity.
 *
 * WHY IT EXISTS. Every application re-implemented the mount in three files of
 * its own (`runtime-tenant-theme/{ssr,contracts,artifact-resolution}`): one to
 * decide the tenant scope, one to narrow the artifact, one to project the root
 * attributes and hand-write the `<style>` element. Three copies of one
 * invariant is how an app ends up stamping `data-tenant`/`data-digest` — names
 * the mount proof does not read — while its CSS sits correctly in the document
 * and the provider refuses the surface anyway.
 *
 * WHAT THIS IS TODAY. A thin adapter over the pipeline that already exists:
 * the first-party artifact renderer for a code-owned vertical, the tenant-theme
 * compiler's artifact for a customer document, `resolveDocumentRootAttributes`
 * for the governed root scope, and `emitTenantThemeArtifactForSsr` for the
 * inline element and its receipt. It compiles nothing of its own and emits no
 * byte the current pipeline does not already emit.
 *
 * WHAT IT IS FOR. The SIGNATURE is the deliverable. WO-EMI-02 replaces this
 * body with the real mount — scope verification, SSR responsive, one compile
 * per request — and deletes this file. What it KEEPS is the whole signature:
 * `(intent, options?)`, every field of `MountTenantThemeOptions` including
 * `artifact`, and the return shape. Applications that call it today are not
 * touched by that landing, which is the whole point of freezing the call now.
 * An input this facade accepts is retired only through a versioned breaking
 * change with its own codemod — the 3.0 changeset of WO-RET-01 under the
 * WO-CON-05 protocol — never by swapping the implementation behind it.
 *
 * @module Runtime/Theming/Composition/Mount
 * @category Runtime
 * @package @rottay/design-system
 */

import { sha256Utf8 } from '@/foundation/kernel/cryptography/sha-256';
import type { SupportedLocale } from '@/foundation/i18n/kernel/contracts';
import type {
  ThemeIntent,
  ThemeIntentOrigin,
} from '@/foundation/contracts/composition/tenants/themes/intent';
import type { TenantThemeArtifact } from '@/foundation/contracts/composition/tenants/themes/tenant-theme';
import type { FirstPartyVerticalId } from '@/foundation/contracts/kernel/verticals';
import { tenantThemeAnatomyAttributes } from '@/infrastructure/compilers/composition/tenant-theme';
import { verticalEngine } from '@/infrastructure/compilers/runtime/theme';
import {
  FIRST_PARTY_ARTIFACT_SPECS,
  renderFirstPartyArtifact,
} from '@/infrastructure/compilers/runtime/tenant-css';
import type {
  DocumentRootAttributes,
  ResolvedTheme,
  TenantThemeMode,
} from '@/infrastructure/runtime/foundation/root-attributes/ssr';
import { resolveDocumentRootAttributes } from '@/infrastructure/runtime/foundation/root-attributes/ssr';
import type { TenantThemeArtifactSsrEmissionReceipt } from '../../foundation/visual-authority';
import { emitTenantThemeArtifactForSsr } from '../../foundation/visual-authority';

/** Everything the mount needs that a `ThemeIntent` deliberately does not name. */
export interface MountTenantThemeOptions {
  /**
   * The tenant's declared mode. `auto` is preserved for the pre-paint script
   * exactly as `resolveDocumentRootAttributes` preserves it; the server never
   * resolves it.
   */
  themeMode?: TenantThemeMode;
  /** What `auto` paints before the viewer's preference is known. */
  autoFallback?: ResolvedTheme;
  /** Active locale; `lang` and `dir` are both derived from it. */
  locale?: SupportedLocale;
  /**
   * The compiled artifact for a TENANT-AUTHORED intent. REQUIRED today for the
   * `tenant-document` and `preview` origins, and optional in the type only
   * because a `static-vertical` intent must not carry one.
   *
   * WHY IT IS AN INPUT. A `ThemeIntent` names a baseline and carries a patch; it
   * does not carry the `tenantId` and `rowVersion` the artifact digest is
   * computed over, and that digest is embedded in the artifact CSS the client
   * matches its mount proof against. A facade that compiled from the intent
   * alone would have to invent an identity, produce a different digest, and be
   * refused by the very resolver it is mounting for. So it takes the artifact
   * the application already compiled and re-admits it.
   *
   * WHY IT IS RETAINED. WO-EMI-02 keeps accepting it. When the real mount
   * compiles from the intent internally, it must verify the supplied artifact's
   * digest AND bytes against its own compile and refuse a mismatch by name —
   * two independent answers to one question are exactly what that check is for.
   * The option is retired only through a versioned breaking change carrying its
   * own codemod (the 3.0 changeset of WO-RET-01 under the WO-CON-05 protocol),
   * never by WO-EMI-02: the codemod of this WO writes `artifact:` into every
   * migrated layout, so deleting it behind an implementation swap would be the
   * app-touching landing this WO exists to prevent.
   */
  artifact?: TenantThemeArtifact;
}

/** One `<style>` element the server response must carry, and nothing else. */
export interface MountedThemeStyleElement {
  readonly id: string;
  /** Spread onto the element. Includes the three artifact proof attributes. */
  readonly attributes: Readonly<Record<string, string>>;
  /** The exact bytes to place inside that element. */
  readonly css: string;
}

/**
 * What the design system can prove about this mount, stated honestly.
 *
 * It carries the BYTES this mount is authoritative for, and — when those bytes
 * are inlined by this call — the receipt the client resolver admits them
 * against. It does NOT prove the browser received them; nothing available on a
 * server can. Scope verification arrives with the real mount (WO-EMI-02), which
 * keeps this shape.
 *
 * It is a SERVER value. Do not serialize it across the flight boundary: the
 * receipt is admitted by module-private identity and a structural copy of it is
 * refused by design.
 */
export interface MountedThemeHydrationProof {
  readonly origin: ThemeIntentOrigin;
  readonly slug: string;
  readonly verticalKey: string;
  readonly digest: string;
  readonly css: string;
  readonly receipt?: TenantThemeArtifactSsrEmissionReceipt;
}

/** The complete mount: what to stamp, what to emit, and what it proves. */
export interface MountedTenantTheme {
  /**
   * Every governed root attribute, plus a compiled artifact's closed anatomy
   * selections. Spread onto the root element and add nothing.
   */
  readonly rootAttributes: Readonly<DocumentRootAttributes & Record<string, string>>;
  /**
   * EMPTY for a code-owned vertical: its artifact ships inside
   * `@rottay/design-system/styles.css`, which the application already loads,
   * and inlining a second copy would create a competing visual layer.
   */
  readonly styleElements: readonly MountedThemeStyleElement[];
  /**
   * TWO GRAMMARS behind one `sha256-` prefix, and they are NOT comparable.
   *
   * For a tenant document this is `TenantThemeArtifact.digest`: a hash of the
   * canonicalized digest source (identity, row version, coverage, variables,
   * scopes), which is what the client mount proof matches. For a code-owned
   * vertical there is no such record, so this is a hash of the artifact's CSS
   * BYTES. A consumer that compared one against the other would be comparing a
   * compiled identity with a content hash.
   */
  readonly artifactDigest: string;
  readonly hydrationProof: MountedThemeHydrationProof;
}

const REFUSAL = '[design-system] mountTenantTheme';

/**
 * The first-party compile is deterministic and keyed only by the vertical, so
 * one compile per vertical per process serves every request. Without this the
 * facade would lower a total ~9K-line authored theme on every SSR render for a
 * result that cannot differ.
 */
const FIRST_PARTY_ARTIFACT_CSS = new Map<FirstPartyVerticalId, string>();

function firstPartyArtifactCss(vertical: FirstPartyVerticalId): string {
  const cached = FIRST_PARTY_ARTIFACT_CSS.get(vertical);
  if (cached !== undefined) return cached;
  const spec = FIRST_PARTY_ARTIFACT_SPECS.find((row) => row.slug === vertical);
  if (!spec) {
    throw new Error(`${REFUSAL}: no first-party artifact is registered for ${JSON.stringify(vertical)}.`);
  }
  const { css } = renderFirstPartyArtifact({ spec });
  FIRST_PARTY_ARTIFACT_CSS.set(vertical, css);
  return css;
}

interface MountedBytes {
  readonly css: string;
  readonly digest: string;
  readonly styleElements: readonly MountedThemeStyleElement[];
  readonly anatomyAttributes: Record<string, string>;
  readonly receipt?: TenantThemeArtifactSsrEmissionReceipt;
}

function mountStaticVertical(intent: ThemeIntent, options: MountTenantThemeOptions): MountedBytes {
  if (options.artifact) {
    throw new Error(
      `${REFUSAL}: a static first-party intent has no compiled tenant artifact; pass a document or preview intent instead.`,
    );
  }
  // A static intent may be scoped under another slug for a probe delta, but
  // only the vertical's own slug has bytes that ship. There is nothing to mount
  // for any other scope, so it is refused rather than silently mounted empty.
  if (intent.slug !== intent.vertical) {
    throw new Error(
      `${REFUSAL}: a static first-party mount is scoped to its own vertical; ${JSON.stringify(intent.slug)} is not ${JSON.stringify(intent.vertical)}.`,
    );
  }
  const css = firstPartyArtifactCss(intent.vertical);
  return {
    css,
    digest: `sha256-${sha256Utf8(css)}`,
    styleElements: [],
    anatomyAttributes: {},
  };
}

function mountTenantAuthored(intent: ThemeIntent, options: MountTenantThemeOptions): MountedBytes {
  const artifact = options.artifact;
  if (!artifact) {
    throw new Error(
      `${REFUSAL}: a ${JSON.stringify(intent.origin)} intent must be handed the artifact its document compiled to.`,
    );
  }
  // The artifact and the intent are two statements of one identity. Emitting a
  // mount whose scope attributes name one tenant and whose CSS names another is
  // exactly the cross-tenant leak the root attributes exist to prevent.
  if (artifact.slug !== intent.slug || artifact.verticalKey !== intent.vertical) {
    throw new Error(
      `${REFUSAL}: the compiled artifact (${artifact.verticalKey}/${artifact.slug}) is not the tenant this intent mounts (${intent.vertical}/${intent.slug}).`,
    );
  }
  const emission = emitTenantThemeArtifactForSsr(artifact, {
    slug: artifact.slug,
    verticalKey: artifact.verticalKey,
  });
  return {
    css: emission.css,
    digest: artifact.digest,
    styleElements: [
      Object.freeze({
        id: emission.receipt.elementId,
        attributes: emission.attributes,
        css: emission.css,
      }),
    ],
    anatomyAttributes: tenantThemeAnatomyAttributes(artifact),
    receipt: emission.receipt,
  };
}

/**
 * Mount one tenant's compiled visual identity for one server render.
 *
 * Asynchronous because the real mount is: WO-EMI-02 resolves and compiles here,
 * and an application that awaited a synchronous facade would otherwise have to
 * change when it lands. Today nothing in the body suspends.
 */
export async function mountTenantTheme(
  intent: ThemeIntent,
  options: MountTenantThemeOptions = {},
): Promise<MountedTenantTheme> {
  const mounted =
    intent.origin === 'static-vertical'
      ? mountStaticVertical(intent, options)
      : mountTenantAuthored(intent, options);

  const rootAttributes = resolveDocumentRootAttributes({
    themeMode: options.themeMode ?? 'light',
    ...(options.autoFallback ? { autoFallback: options.autoFallback } : {}),
    // The ENGINE is the roster's, never the application's. A hand-written
    // `engine="modern"` in a root layout is a second authority on a question
    // the vertical row already answers.
    engine: verticalEngine(intent.vertical),
    locale: options.locale ?? 'en',
    tenant: { slug: intent.slug, verticalKey: intent.vertical },
  });

  return Object.freeze({
    rootAttributes: Object.freeze({ ...rootAttributes, ...mounted.anatomyAttributes }),
    styleElements: Object.freeze(mounted.styleElements),
    artifactDigest: mounted.digest,
    hydrationProof: Object.freeze({
      origin: intent.origin,
      slug: intent.slug,
      verticalKey: intent.vertical,
      digest: mounted.digest,
      css: mounted.css,
      ...(mounted.receipt ? { receipt: mounted.receipt } : {}),
    }),
  });
}
