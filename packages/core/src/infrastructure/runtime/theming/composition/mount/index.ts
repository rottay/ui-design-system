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
 * WHAT IT PROVES. Bytes AND scope. An artifact whose exact bytes are inlined in
 * `<head>` paints nothing when the root element does not match the selector
 * those bytes are nested under, and that is not a hypothetical: it was the
 * state of app-platform. So this call projects the root attributes and then
 * verifies them against the artifact's own scope descriptors before returning,
 * refusing by name rather than handing back a mount that renders unstyled.
 *
 * WHAT IT PROJECTS. The COMPLETE governed root scope for one request: theme,
 * engine, lang/dir, tenant scope, density, motion posture, the viewport hint
 * the responsive runtime renders its server snapshot for, and the artifact's
 * validated recipe profile (D-26). Density and motion used to be written by
 * client effects after the first paint, and the viewport was not projected at
 * all — which is why every first paint was a phone paint.
 *
 * WHAT IT DOES NOT DO. It does not compile a second time for a code-owned
 * vertical (one compile per vertical per process, cached), it does not resolve
 * `auto`, and it emits no `<style>` for a vertical whose artifact already ships
 * inside `@rottay/design-system/styles.css`.
 *
 * SIGNATURE STABILITY. `(intent, options?)`, every field of
 * `MountTenantThemeOptions` including `artifact`, and the four returned fields
 * are frozen by the WO-CON-02 contract. New options are additive and optional.
 * An input this facade accepts is retired only through a versioned breaking
 * change with its own codemod — the 3.0 changeset of WO-RET-01 under the
 * WO-CON-05 protocol.
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
  DocumentDensityPosture,
  DocumentMotionPosture,
  DocumentRootAttributes,
  DocumentViewportHint,
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
  /**
   * The viewport tier this REQUEST is for, as the server knows it (a cookie, a
   * client hint, a user-agent parse). It is projected as `data-ds-viewport` and
   * is the only thing that lets the responsive runtime render a desktop server
   * snapshot; without it the first paint is a phone paint on every device.
   *
   * PASS THE SAME VALUE TO `DesignSystemProvider.ssrViewport`. The attribute is
   * for CSS; the runtime takes the hint as a prop, because a value read back
   * off `<html>` is `undefined` on a server and defined during hydration, which
   * is a mismatch by construction.
   */
  viewport?: DocumentViewportHint;
  /**
   * Document motion policy for this request. `system` — the default — stamps
   * nothing and leaves the OS media query as the sole authority.
   */
  motion?: DocumentMotionPosture;
  /**
   * Density posture override. Omitted, the mount reads the posture the
   * artifact itself compiled, so the cascade resolves it on the FIRST paint
   * instead of after `RootDensityProvider`'s effect.
   */
  density?: DocumentDensityPosture;
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
 * server can. What it DOES prove beyond the bytes is the SCOPE: `scope` names
 * the three root attributes this mount projected and verified against the
 * artifact's own scope descriptors, so a caller can assert the mount would
 * paint without re-deriving the selector grammar.
 *
 * It is a SERVER value. Do not serialize it across the flight boundary: the
 * receipt is admitted by module-private identity and a structural copy of it is
 * refused by design.
 */
export interface MountedThemeScopeProof {
  /** The exact selector the mounted bytes are nested under. */
  readonly selector: string;
  /** The root attributes that make that selector match, as projected. */
  readonly attributes: Readonly<Record<string, string>>;
}

export interface MountedThemeHydrationProof {
  readonly origin: ThemeIntentOrigin;
  readonly slug: string;
  readonly verticalKey: string;
  readonly digest: string;
  readonly css: string;
  readonly scope: MountedThemeScopeProof;
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
interface FirstPartyArtifact {
  readonly css: string;
  readonly selector: string;
  readonly recipeProfile?: string;
}

const FIRST_PARTY_ARTIFACTS = new Map<FirstPartyVerticalId, FirstPartyArtifact>();

function firstPartyArtifact(vertical: FirstPartyVerticalId): FirstPartyArtifact {
  const cached = FIRST_PARTY_ARTIFACTS.get(vertical);
  if (cached !== undefined) return cached;
  const spec = FIRST_PARTY_ARTIFACT_SPECS.find((row) => row.slug === vertical);
  if (!spec) {
    throw new Error(`${REFUSAL}: no first-party artifact is registered for ${JSON.stringify(vertical)}.`);
  }
  const { css, compiled } = renderFirstPartyArtifact({ spec });
  const artifact: FirstPartyArtifact = Object.freeze({
    css,
    selector: spec.selector,
    ...(compiled.runtime.recipeProfile === undefined
      ? {}
      : { recipeProfile: compiled.runtime.recipeProfile }),
  });
  FIRST_PARTY_ARTIFACTS.set(vertical, artifact);
  return artifact;
}

interface MountedBytes {
  readonly css: string;
  readonly digest: string;
  readonly styleElements: readonly MountedThemeStyleElement[];
  readonly anatomyAttributes: Record<string, string>;
  /** The selector the mounted bytes are nested under. */
  readonly scopeSelector: string;
  /** Root attributes that must be live for that selector to match. */
  readonly scopeAttributes: Readonly<Record<string, string>>;
  /** Validated recipe-profile id the artifact compiled (D-26). */
  readonly recipeProfile?: string;
  /** Density posture the artifact compiled, when it declared one. */
  readonly density?: DocumentDensityPosture;
  readonly receipt?: TenantThemeArtifactSsrEmissionReceipt;
}

/**
 * The compiled density preference as a runtime posture.
 *
 * `normal` is the document vocabulary's spelling of the runtime's
 * `comfortable`; an absent preference stays absent so the mount does not stamp
 * a posture the tenant never chose.
 */
function compiledDensityPosture(
  preference: string | undefined,
): DocumentDensityPosture | undefined {
  if (preference === 'compact') return 'compact';
  if (preference === 'spacious') return 'spacious';
  if (preference === 'comfortable' || preference === 'normal') return 'comfortable';
  return undefined;
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
  const artifact = firstPartyArtifact(intent.vertical);
  return {
    css: artifact.css,
    digest: `sha256-${sha256Utf8(artifact.css)}`,
    styleElements: [],
    anatomyAttributes: {},
    scopeSelector: artifact.selector,
    scopeAttributes: { 'data-tenant': intent.slug },
    ...(artifact.recipeProfile === undefined
      ? {}
      : { recipeProfile: artifact.recipeProfile }),
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
  const density = compiledDensityPosture(
    artifact.normalizedAppearance.general?.density,
  );
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
    scopeSelector: artifact.scopes.combinedSelector,
    scopeAttributes: {
      [artifact.scopes.root.attribute]: '',
      [artifact.scopes.vertical.attribute]: artifact.scopes.vertical.value,
      [artifact.scopes.tenant.attribute]: artifact.scopes.tenant.value,
    },
    ...(artifact.normalizedAppearance.recipeProfile === undefined
      ? {}
      : { recipeProfile: artifact.normalizedAppearance.recipeProfile }),
    ...(density === undefined ? {} : { density }),
    receipt: emission.receipt,
  };
}

/**
 * The mount's own scope proof: the projection it is about to return must
 * satisfy the selector the bytes it is about to return are nested under.
 *
 * This is the server half of the invariant `resolveVisualAuthority` enforces on
 * the client. Neither side trusts the other: the server refuses to hand back a
 * mount that cannot paint, and the client refuses to admit a document that does
 * not carry it.
 */
function assertMountScope(
  projected: Readonly<Record<string, string | undefined>>,
  mounted: MountedBytes,
): void {
  for (const [name, expected] of Object.entries(mounted.scopeAttributes)) {
    if (projected[name] !== expected) {
      throw new Error(
        `${REFUSAL}: the projected root attributes do not satisfy ${mounted.scopeSelector}; ${name} is ${JSON.stringify(projected[name])}, not ${JSON.stringify(expected)}.`,
      );
    }
  }
}

/**
 * Mount one tenant's compiled visual identity for one server render.
 *
 * Asynchronous because an application awaits it and the compile it caches may
 * become asynchronous; nothing in the body suspends today.
 */
export async function mountTenantTheme(
  intent: ThemeIntent,
  options: MountTenantThemeOptions = {},
): Promise<MountedTenantTheme> {
  const mounted =
    intent.origin === 'static-vertical'
      ? mountStaticVertical(intent, options)
      : mountTenantAuthored(intent, options);

  // The application's explicit posture outranks the compiled one: a request
  // may know something the row does not (a viewer preference, a print render).
  const density = options.density ?? mounted.density;

  const rootAttributes = resolveDocumentRootAttributes({
    themeMode: options.themeMode ?? 'light',
    ...(options.autoFallback ? { autoFallback: options.autoFallback } : {}),
    // The ENGINE is the roster's, never the application's. A hand-written
    // `engine="modern"` in a root layout is a second authority on a question
    // the vertical row already answers.
    engine: verticalEngine(intent.vertical),
    locale: options.locale ?? 'en',
    tenant: { slug: intent.slug, verticalKey: intent.vertical },
    ...(density === undefined ? {} : { density }),
    ...(options.motion === undefined ? {} : { motion: options.motion }),
    ...(options.viewport === undefined ? {} : { viewport: options.viewport }),
    ...(mounted.recipeProfile === undefined
      ? {}
      : { recipeProfile: mounted.recipeProfile }),
  });

  const projected = Object.freeze({ ...rootAttributes, ...mounted.anatomyAttributes });
  assertMountScope(projected, mounted);

  return Object.freeze({
    rootAttributes: projected,
    styleElements: Object.freeze(mounted.styleElements),
    artifactDigest: mounted.digest,
    hydrationProof: Object.freeze({
      origin: intent.origin,
      slug: intent.slug,
      verticalKey: intent.vertical,
      digest: mounted.digest,
      css: mounted.css,
      scope: Object.freeze({
        selector: mounted.scopeSelector,
        attributes: Object.freeze({ ...mounted.scopeAttributes }),
      }),
      ...(mounted.receipt ? { receipt: mounted.receipt } : {}),
    }),
  });
}
