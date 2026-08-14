"use client";

/**
 * The showroom's ONE tenant ground for the probe fleet.
 *
 * Every probe needs the same two opposing governed sources -- the checked-in
 * BitHire vertical and a DB-owned customer tenant -- and until now each one
 * hand-built them. Twenty callsites did it with the same two mistakes, and both
 * mistakes are SILENT: a blocked visual-authority resolution makes
 * DesignSystemProvider return `<LoadingScreen />`, and that component renders
 * `null` -- so a blocked probe is a BLANK page, not a spinner, and is
 * indistinguishable from a slow load. Every one of those probes was
 * photographing a blank page.
 *
 * The two mistakes, measured against real core source rather than read off the
 * types:
 *
 *   1. `{ ...tenantConfigFor(...), locale }`. Code-owned identity is WeakSet
 *      OBJECT IDENTITY, not slug matching, so ANY spread of a registry config
 *      produces an ordinary tenant. The registry configs carry `brandTheme`,
 *      and `hasVisualPayload` is true the moment `brandTheme` is present, so
 *      the spread result is uncompiled visual payload and blocks. Measured:
 *      `registry bithire` resolves `no-visual-payload`; `{ ...registry, locale }`
 *      resolves `uncompiled-visual-payload` and BLOCKS.
 *
 *   2. A hand-authored `appearance` literal for the DB tenant. `appearance !==
 *      undefined` is visual payload on its own. There is no declaration that
 *      admits a raw appearance -- `authority: 'provider'` refuses it just as
 *      hard as no declaration at all. The only path is to COMPILE it and prove
 *      the compiled bytes are mounted.
 *
 * So this module owns both halves and the probes own neither:
 *
 *   `bithire-static`   the registry's own object, UNSPREAD. Locale and
 *                      translations move to the provider's own props, and
 *                      density moves to `DensityScope`, which is the sanctioned
 *                      density seam for a code-owned tenant precisely because
 *                      it does not touch the config.
 *
 *   `themanagement-db` the bounded `TenantThemeDocument` below, validated,
 *                      hydrated against trusted identity columns, compiled, and
 *                      emitted. The `<style>` mounts OUTSIDE the provider and
 *                      `tenantConfig.appearance` is DERIVED from
 *                      `artifact.normalizedAppearance`, so
 *                      `appearanceMatchesArtifact` is true by construction
 *                      rather than by care.
 *
 *   `themanagement-seeds` the SAME DB channel, publishing a document that
 *                      authors exactly four colours and nothing else. It is a
 *                      third tenant identity rather than a mode of the one
 *                      above, and it is a real validated/hydrated/compiled
 *                      artifact rather than a raw appearance literal: a
 *                      "four seeds derive the whole system" claim proven
 *                      against a payload the DB channel would refuse to accept
 *                      proves nothing about the DB channel.
 *
 * WHY THIS FILE IS `'use client'` AND COMPILES AT RENDER TIME. The SSR pass has
 * no DOM, so it admits the artifact only against a receipt this runtime minted
 * -- a WeakSet membership test, deliberately not a data check. A receipt
 * therefore cannot survive serialization across the RSC boundary: a server
 * component that compiled and passed the receipt down would hand the client a
 * structurally identical object the runtime has never seen, and the SSR pass
 * would block while the browser pass succeeded. A `'use client'` module runs in
 * BOTH passes in the same module realm, which is the only placement where both
 * proofs hold. `probe/ds-reference/ground` is a server component and gets away
 * with it only because it compiles and renders in one server pass.
 */

import {
  useEffect,
  useInsertionEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  DensityScope,
  DesignSystemProvider,
  type EngineName,
  type TenantConfig,
  type VisualAuthorityDeclaration,
} from "@rottay/design-system";
import {
  claimRootAttribute,
  composeRootAttributeReleases,
} from "@rottay/design-system/runtime/root-attributes";
import { resolveVisualAuthority } from "@rottay/design-system/runtime/visual-authority";
import {
  censusRuntimeVisualPayload,
  compileTenantThemeConfig,
  emitTenantThemeArtifactForSsr,
  getKnownTenantConfig,
  getTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
  validateTenantThemeDocument,
  type TenantThemeArtifactSsrEmission,
} from "@rottay/design-system/server";

/**
 * The governed sources. Closed on purpose: this is not a selector, it is the
 * set the whole probe fleet contrasts -- one bundled vertical against two
 * DB-owned customer documents that differ only in how much they author.
 */
export type ShowroomTenantSource =
  | "bithire-static"
  | "themanagement-db"
  | "themanagement-seeds";

/** The density axis the probe matrix sweeps. */
export type ShowroomDensityPosture = "compact" | "comfortable" | "spacious";

/** Locales the probe matrix renders. `ar` is the RTL case. */
export type ShowroomTenantLocale = "en" | "es" | "ar";

/**
 * The ground a cell renders on. Probes spell this `theme` or `ground`; it is one
 * axis and it drives BOTH halves, by two different mechanisms that are not
 * interchangeable -- see `THEMANAGEMENT_DARK_PALETTE`.
 */
export type ShowroomTenantTheme = "light" | "dark";

/**
 * The tenant-facing Appearance vocabulary has no `comfortable` literal --
 * `normal` is its canonical alias. The posture name stays `comfortable` at the
 * probe boundary because that is what the URL matrix and the capture filenames
 * already say.
 */
const DOCUMENT_DENSITY: Record<
  ShowroomDensityPosture,
  "compact" | "normal" | "spacious"
> = {
  compact: "compact",
  comfortable: "normal",
  spacious: "spacious",
};

/**
 * The customer's authored light palette. Brand hues are shared with the dark
 * one below; only the ground, the inks and the rules change.
 */
const THEMANAGEMENT_LIGHT_PALETTE = {
  primary: "#0F766E",
  secondary: "#8C6D46",
  accent: "#B44F3C",
  background: "#FBF6EC",
  foreground: {
    primary: "#2E261C",
    secondary: "#5C4F3D",
    muted: "#6B5B48",
    disabled: "#74644F",
  },
  border: { primary: "#C8B9A5", secondary: "#E2D9CC" },
  backgroundMode: "light",
} as const;

/**
 * The customer's authored DARK palette, and it has to be authored.
 *
 * `backgroundMode: 'dark'` alone does NOT produce a dark ground. Measured on the
 * real compiler: flipping only that flag changes the digest and re-ramps every
 * generated scale for a dark ground (`--ds-color-primary-50` goes from #E1FEFA
 * to #071F1D, and the ten chart series with it) but leaves
 * `--ds-color-background` at #FBF6EC and `--ds-color-text-primary` at #2E261C,
 * because those are values the customer stated outright and the compiler does
 * not overrule a stated value. `backgroundMode` tells the RAMP which way to run;
 * it does not recolour the ground.
 *
 * That matters because the artifact's selector --
 * `[data-ds-root][data-vertical="bithire"][data-tenant][data-tenant="..."]` --
 * outranks the base `[data-theme="dark"]` block, so a half-authored dark
 * document does not merely look unfinished: it pins a light ground that the
 * provider's own dark theme cannot take back. Authoring both palettes is how a
 * customer publishes dark, and the compiled result is measured dark:
 * `--ds-color-background: #17130E`, `--ds-color-text-primary: #F2EADC`, and a
 * derived `--ds-color-bg-elevated: #231f1a`.
 */
const THEMANAGEMENT_DARK_PALETTE = {
  primary: "#0F766E",
  secondary: "#8C6D46",
  accent: "#B44F3C",
  background: "#17130E",
  foreground: {
    primary: "#F2EADC",
    secondary: "#C9BCA6",
    muted: "#A2937C",
    disabled: "#6E6252",
  },
  border: { primary: "#3A3128", secondary: "#2A231C" },
  backgroundMode: "dark",
} as const;

/**
 * The published customer document for `themanagementmiami`.
 *
 * This is the DB channel expressed as the DB channel: a bounded
 * `TenantThemeDocument`, not a `BrandTheme` and not a raw appearance literal.
 * Supplying `brandTheme` here would be a false-positive proof of the file-first
 * path that is reserved for bundled vertical identity, which is why the DB
 * tenant carries no theme at all.
 *
 * `shape.radiusScale` is 0.8 and not the 0.76 the superseded hand-authored
 * appearance used: 0.8 is the bithire envelope FLOOR, and 0.76 is a value the
 * real DB channel rejects outright (`$.appearance.shape.radiusScale: Value
 * exceeds the bithire envelope`). The measured bithire envelope is
 * densityScale 0.85-1.15, effectIntensity 0-0.65, motionIntensity 0-0.8,
 * motionDurationScale 0.75-1.35, typeScale 0.92-1.08, radiusScale 0.8-1.2;
 * every other axis below was already inside it.
 */
const THEMANAGEMENT_DOCUMENT = {
  schemaVersion: 1,
  mode: "advanced",
  visualFoundation: {
    general: {
      palette: THEMANAGEMENT_LIGHT_PALETTE,
      typography: {
        typePairing: "editorial",
        fontFamilyHeading: "Georgia, 'Times New Roman', serif",
        fontFamilyBase: "Optima, Candara, 'Noto Sans', sans-serif",
        scale: 1.04,
      },
      shape: { buttonStyle: "soft", radiusScale: 0.8 },
      motion: { intensity: 0.62, durationScale: 1.08 },
      density: "spacious",
      surfaces: { elevation: "elevated", effectIntensity: 0.45 },
      navigation: { sidebarTone: "strong" },
    },
  },
} as const;

/**
 * The trusted row columns. These are the half a customer never writes, which is
 * why they are supplied here and joined by `hydrateTenantThemeConfig` rather
 * than being fields of the document above.
 */
const THEMANAGEMENT_IDENTITY = {
  tenantId: "8b2e6d41-0c39-4a7f-b5d2-9e14c6a08f37",
  slug: "themanagementmiami",
  verticalKey: "bithire",
  rowVersion: 1,
} as const;

/**
 * The seeds-only customer's OWN trusted identity columns.
 *
 * A distinct tenant rather than a second document for `themanagementmiami`:
 * the artifact selector is keyed by slug, so two documents published under one
 * slug would emit two artifacts into the same tenant scope and the provider's
 * mount proof fails on `candidates.length !== 1`.
 */
const THEMANAGEMENT_SEEDS_IDENTITY = {
  tenantId: "3d7c1a52-6b48-4e19-9f03-2c85d7ae610b",
  slug: "themanagementseeds",
  verticalKey: "bithire",
  rowVersion: 1,
} as const;

/**
 * The canonical seeds allowlist, expressed in the DB DOCUMENT vocabulary --
 * which is the vocabulary the claim is about.
 *
 * The capability registry row `palette.seeds` states
 * `appearance.palette.{primary,secondary,accent,background}`; the published
 * document states the same four under
 * `visualFoundation.general.palette`, and the compiler's normalized appearance
 * is a THIRD shape again. Writing the allowlist against the shape a helper
 * happened to return is how a seeds-only claim ends up certifying a payload
 * the DB channel would never have accepted -- so it is written against the
 * document this module actually publishes.
 *
 * `schemaVersion` and `mode` are envelope fields, not visual authoring:
 * they carry no palette, typography, shape, density, motion, surface or chrome
 * value. Every branch that could is enumerated below and there are none.
 *
 * `palette.status-seeds` is REJECTED today and `palette.dark-mode` is tier
 * `internal`, so neither belongs here; `foreground`/`border` are authorable in
 * this shape but are not seeds.
 */
export const SEEDS_ONLY_DOCUMENT_ALLOWLIST: Readonly<
  Record<string, readonly string[]>
> = Object.freeze({
  "": Object.freeze(["schemaVersion", "mode", "visualFoundation"]),
  visualFoundation: Object.freeze(["general"]),
  "visualFoundation.general": Object.freeze(["palette"]),
  "visualFoundation.general.palette": Object.freeze([
    "primary",
    "secondary",
    "accent",
    "background",
  ]),
});

/**
 * The seeds-only published document: the four seed colours of the SAME
 * customer palette, with zero projection of any BrandTheme and zero spread of
 * the full document above.
 *
 * The four values are read off `THEMANAGEMENT_LIGHT_PALETTE` rather than
 * re-transcribed, so the two DB sources are provably the same brand authoring
 * different amounts of it -- but they are picked FIELD BY FIELD, never spread,
 * because a spread would carry `foreground`, `border` and `backgroundMode`
 * along and quietly break the property this source exists to prove.
 *
 * `primary` is a parameter because the canary mutates it to prove the derived
 * channels are causally downstream of a seed rather than merely non-empty.
 */
export function seedsOnlyDocument(
  primary: string = THEMANAGEMENT_LIGHT_PALETTE.primary,
) {
  return {
    schemaVersion: 1,
    mode: "advanced",
    visualFoundation: {
      general: {
        palette: {
          primary,
          secondary: THEMANAGEMENT_LIGHT_PALETTE.secondary,
          accent: THEMANAGEMENT_LIGHT_PALETTE.accent,
          background: THEMANAGEMENT_LIGHT_PALETTE.background,
        },
      },
    },
  };
}

/** The testid every probe's artifact element carries, so e2e can find it. */
export const SHOWROOM_TENANT_ARTIFACT_TESTID = "showroom-tenant-artifact";

/**
 * Document lease registry. One ShowroomTenantProvider may claim a given
 * Document; a second provider in the same Document throws. Different Documents
 * (e.g., iframes) are independent. The token makes release idempotent and
 * stale-release safe: a release only deletes the entry it itself created.
 */
const SHOWROOM_TENANT_DOCUMENT_CLAIMS = new WeakMap<Document, symbol>();

/**
 * Claim the Document for a single ShowroomTenantProvider instance. Returns an
 * idempotent release function checked against the claim token. Exported for the
 * canary's pure document-claim contracts only; real usage is inside the
 * provider's commit-phase effect.
 */
export function claimShowroomTenantDocument(doc: Document): () => void {
  if (SHOWROOM_TENANT_DOCUMENT_CLAIMS.has(doc)) {
    throw new Error(
      "A ShowroomTenantProvider already claims this Document; only one tenant ground may own a document.",
    );
  }
  const token = Symbol();
  SHOWROOM_TENANT_DOCUMENT_CLAIMS.set(doc, token);
  return function release(): void {
    if (SHOWROOM_TENANT_DOCUMENT_CLAIMS.get(doc) !== token) return;
    SHOWROOM_TENANT_DOCUMENT_CLAIMS.delete(doc);
  };
}

/**
 * The readiness lease written by the commit-phase resolver and revalidated by
 * every render. It never outlives the exact proof it was minted from: a render
 * whose current digest, document or node differs discards it and recomputes.
 */
interface ShowroomTenantLease {
  readonly document: Document;
  readonly digest: string;
  readonly node: HTMLStyleElement | HTMLLinkElement;
}

/**
 * The root claim is a commit-phase decision, so it runs before paint; on the
 * server there is no layout phase and no document to claim.
 */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * The trusted identity columns a customer row supplies. Named so probes that
 * publish their OWN document (the DS-Q001L specimen) state the same half.
 */
export interface ShowroomTenantIdentity {
  readonly tenantId: string;
  readonly slug: string;
  readonly verticalKey: string;
  readonly rowVersion: number;
}

export interface ShowroomTenantGround {
  readonly tenantConfig: TenantConfig;
  /** Present only on the DB path; the static path's CSS is bundled. */
  readonly emission: TenantThemeArtifactSsrEmission | null;
  /** Required for the DB path and required to be ABSENT for the static one. */
  readonly declaration: VisualAuthorityDeclaration | undefined;
}

export interface ShowroomTenantGroundOptions {
  /**
   * Omit to keep the document's authored posture (`spacious`), which is what
   * the probes without a density axis render.
   */
  readonly density?: ShowroomDensityPosture;
  /**
   * Governed recipe-profile registry id, and it is a real compiled axis:
   * measured, `rottay/technical-sharp@1` and `rottay/editorial-round@1` produce
   * distinct digests and are both KEPT on the artifact.
   *
   * It is fail-closed at VALIDATION, not at compile: an unknown id is rejected
   * outright (`$.visualFoundation.recipeProfile`) rather than dropped, so a
   * typo throws out of `dbGround` instead of quietly degrading to "no profile".
   */
  readonly recipeProfile?: string;
  /**
   * Defaults to `light`. On the DB path this selects the authored palette and
   * therefore changes the compiled bytes and the digest; on the static path it
   * is carried by the provider's `forceTheme`, which is the ONLY dark seam a
   * code-owned tenant has -- the projection keeps `theme` but the registry
   * object cannot be edited and must not be copied.
   */
  readonly theme?: ShowroomTenantTheme;
  /**
   * `themanagement-seeds` only: the authored `primary` seed. Mutating it is
   * how a probe proves the derived channels follow a seed causally instead of
   * merely being populated. Ignored by the other two sources, which do not
   * author a seed the caller may move.
   */
  readonly seedPrimary?: string;
}

/**
 * Compile ONE published customer document into a mountable ground.
 *
 * Exported because the showroom has two DB-owned probes with different
 * documents -- the fleet's `themanagementmiami` below and the DS-Q001L
 * editorial specimen -- and the sequence they share is the part that is easy to
 * get silently wrong. Validate, hydrate against trusted identity columns,
 * compile under the vertical envelope, and emit the style and the receipt from
 * ONE call so the bytes the resolver hashes are the bytes the page embeds.
 * Deriving `appearance` from `artifact.normalizedAppearance` rather than from
 * the raw document is what makes `appearanceMatchesArtifact` true by
 * construction; re-authoring it recreates the second authority the declaration
 * exists to prevent.
 */
export function compileShowroomTenantGround(input: {
  readonly document: unknown;
  readonly identity: ShowroomTenantIdentity;
  readonly name: string;
  readonly theme?: ShowroomTenantTheme;
}): ShowroomTenantGround {
  const { document, identity, name, theme = "light" } = input;

  // Validated rather than trusted, and the PARSED document is what gets
  // hydrated. A probe fixture that drifts out of the envelope must fail loudly
  // here instead of compiling into an artifact the resolver later refuses --
  // that refusal renders as a blank page, which is the failure mode this whole
  // module exists to delete.
  const validation = validateTenantThemeDocument(document);
  if (!validation.success) {
    throw new Error(
      `The showroom ${identity.slug} document is invalid: ${JSON.stringify(validation.issues)}`,
    );
  }

  const hydrated = hydrateTenantThemeConfig(validation.data, identity);
  const artifact = compileTenantThemeConfig(hydrated, {
    verticalEnvelope: getTenantThemeVerticalEnvelope(identity.verticalKey),
  });
  // The style element AND the receipt come from one call, so the bytes the
  // resolver hashes are the bytes this ground embeds and the attributes it
  // looks for are the attributes this ground writes. Hand-writing either half
  // is how a caller ends up stamping `data-tenant`/`data-digest`, which the
  // mount proof does not read.
  const emission = emitTenantThemeArtifactForSsr(artifact, {
    slug: artifact.slug,
    verticalKey: artifact.verticalKey,
  });

  return {
    tenantConfig: {
      slug: artifact.slug,
      name,
      vertical: artifact.verticalKey,
      engine: "modern",
      theme,
      plan: "enterprise",
      features: ["*"],
      branding: { companyName: name },
      appearance: artifact.normalizedAppearance,
    } as TenantConfig,
    emission,
    declaration: {
      authority: "compiled-artifact",
      artifact,
      ssrReceipt: emission.receipt,
    },
  };
}

/**
 * The artifact `<style>`, and the ONE place its placement law is written down.
 *
 * It must mount OUTSIDE the provider, and that is load-bearing rather than
 * stylistic: the provider verifies the mount during its own render, before any
 * child has been committed. Mounted as a child, the artifact is invisible to
 * the proof, the provider blocks, the children never commit, and the artifact
 * never mounts -- a permanently blank page for a document whose CSS is correct.
 *
 * Exactly one artifact element may exist per document per tenant scope: the
 * mount proof fails on `candidates.length !== 1`.
 */
export function ShowroomArtifactStyle({
  emission,
}: {
  readonly emission: TenantThemeArtifactSsrEmission | null;
}) {
  if (!emission) return null;
  return (
    <style
      {...emission.attributes}
      data-testid={SHOWROOM_TENANT_ARTIFACT_TESTID}
      dangerouslySetInnerHTML={{ __html: emission.css }}
    />
  );
}

/**
 * One compile per distinct ground, kept for the process lifetime.
 *
 * Identity matters as much as cost here: the provider verifies the mounted
 * artifact on every render, and a fresh artifact object each render would churn
 * the retained-artifact ledger for a document whose bytes never changed.
 */
const DB_GROUND_CACHE = new Map<string, ShowroomTenantGround>();

function dbGround({
  density,
  recipeProfile,
  theme = "light",
}: ShowroomTenantGroundOptions): ShowroomTenantGround {
  const key = `${density ?? "authored"}|${recipeProfile ?? ""}|${theme}`;
  const cached = DB_GROUND_CACHE.get(key);
  if (cached) return cached;

  const document = {
    ...THEMANAGEMENT_DOCUMENT,
    visualFoundation: {
      ...THEMANAGEMENT_DOCUMENT.visualFoundation,
      general: {
        ...THEMANAGEMENT_DOCUMENT.visualFoundation.general,
        palette:
          theme === "dark"
            ? THEMANAGEMENT_DARK_PALETTE
            : THEMANAGEMENT_LIGHT_PALETTE,
        ...(density ? { density: DOCUMENT_DENSITY[density] } : {}),
      },
      ...(recipeProfile ? { recipeProfile } : {}),
    },
  };

  const ground = compileShowroomTenantGround({
    document,
    identity: THEMANAGEMENT_IDENTITY,
    name: "The Management Miami",
    theme,
  });

  DB_GROUND_CACHE.set(key, ground);
  return ground;
}

/**
 * One compile per distinct seed, for the same reasons as `DB_GROUND_CACHE`.
 * Keyed by the seed the caller moved, so the canary's mutate-and-restore drill
 * gets the SAME object back on restore and can assert byte-identity rather
 * than approximate equality.
 */
const SEEDS_GROUND_CACHE = new Map<string, ShowroomTenantGround>();

function seedsGround({
  seedPrimary,
  theme = "light",
}: ShowroomTenantGroundOptions): ShowroomTenantGround {
  const key = `${seedPrimary ?? "authored"}|${theme}`;
  const cached = SEEDS_GROUND_CACHE.get(key);
  if (cached) return cached;

  // `density` and `recipeProfile` are deliberately NOT threaded here. They are
  // authorable axes of the DB channel and the document would happily carry
  // them -- which is exactly why this source must not, since everything beyond
  // the four seeds has to be DERIVED for the claim to mean anything.
  const ground = compileShowroomTenantGround({
    document: seedsOnlyDocument(seedPrimary),
    identity: THEMANAGEMENT_SEEDS_IDENTITY,
    name: "The Management (seeds only)",
    theme,
  });

  SEEDS_GROUND_CACHE.set(key, ground);
  return ground;
}

function staticGround(): ShowroomTenantGround {
  // The REGISTRY's own object, not a literal that copies its fields and not a
  // spread of it. Both alternatives are ordinary tenants carrying an
  // uncompiled `brandTheme`, and both block.
  const tenantConfig = getKnownTenantConfig("bithire");
  if (!tenantConfig) {
    throw new Error("The bundled bithire tenant is missing from the registry");
  }
  return { tenantConfig, emission: null, declaration: undefined };
}

/**
 * The ground for one probe cell, without rendering it.
 *
 * Exported so an assertion can read the digest, the slug and the vertical the
 * probe is about to mount, and compare them against what it finds in the DOM.
 */
export function showroomTenantGround(
  source: ShowroomTenantSource,
  options: ShowroomTenantGroundOptions = {},
): ShowroomTenantGround {
  switch (source) {
    case "themanagement-db":
      return dbGround(options);
    case "themanagement-seeds":
      return seedsGround(options);
    default:
      return staticGround();
  }
}

export interface ShowroomTenantProviderProps
  extends ShowroomTenantGroundOptions {
  readonly source: ShowroomTenantSource;
  readonly locale?: ShowroomTenantLocale;
  /**
   * Probe copy. It travels as a PROVIDER prop rather than on the tenant config
   * because the code-owned projection keeps only
   * `branding | engine | features | name | plan | slug | theme | vertical` --
   * anything else set on a registry config is dropped before the runtime sees
   * it. Routing it identically on both sources keeps one rule instead of two.
   */
  readonly customTranslations?: TenantConfig["customTranslations"];
  /**
   * Defaults to `modern`, which is the engine the rescue is about. The probes
   * that sweep engines override it; the tenant configs keep `engine: 'modern'`
   * as their stored preference, exactly as before, because a probe forcing an
   * engine is a viewer choice and not a change of what the tenant asked for.
   */
  readonly engine?: EngineName;
  readonly children: ReactNode;
}

/**
 * Renders `children` under a proven visual authority.
 *
 * The artifact `<style>` mounts outside the provider -- see
 * `ShowroomArtifactStyle` for why that placement is load-bearing. Every probe
 * route renders one cell, so a page must not compose two of these for the same
 * source.
 */
export function ShowroomTenantProvider({
  source,
  locale,
  density,
  recipeProfile,
  customTranslations,
  theme = "light",
  seedPrimary,
  engine = "modern",
  children,
}: ShowroomTenantProviderProps) {
  const ground = useMemo(
    () =>
      showroomTenantGround(source, {
        density,
        recipeProfile,
        theme,
        seedPrimary,
      }),
    [source, density, recipeProfile, theme, seedPrimary],
  );

  // Lease written by the commit-phase resolver and revalidated every render.
  const [lease, setLease] = useState<ShowroomTenantLease | null>(null);

  // Commit-prelayout document claim. A second provider in the same Document
  // throws here; different Documents are independent. Cleanup makes StrictMode
  // remounts safe.
  useInsertionEffect(() => {
    if (typeof document === "undefined") return;
    const release = claimShowroomTenantDocument(document);
    return () => release();
  }, []);

  // Core claims only `data-tenant`, so the application owns the artifact
  // selector's other two root channels -- as claims, restoring predecessors.
  useIsomorphicLayoutEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    return composeRootAttributeReleases([
      claimRootAttribute(root, "data-ds-root", ""),
      claimRootAttribute(root, "data-vertical", "bithire"),
    ]);
  }, []);

  // After the root claims are written, resolve exact proof against the mounted
  // artifact. On the first client-only commit only the <style> is present, so
  // this effect captures the lease that enables the second render to mount DSP.
  useIsomorphicLayoutEffect(() => {
    if (typeof document === "undefined") return;
    if (!ground.emission) {
      setLease(null);
      return;
    }
    const resolution = resolveVisualAuthority({
      declaration: ground.declaration!,
      slug: ground.tenantConfig.slug,
      verticalKey: ground.tenantConfig.vertical,
      payload: censusRuntimeVisualPayload(ground.tenantConfig),
      documentRoot: document,
    });
    if (resolution.conflict === null && resolution.mountedArtifact) {
      setLease({
        document,
        digest: ground.emission.receipt.digest,
        node: resolution.mountedArtifact,
      });
    } else {
      setLease(null);
    }
  }, [ground]);

  // Render-phase readiness. Each render revalidates exact proof; the lease is
  // never trusted across a changed digest, document or node.
  const ready = (() => {
    // Static ground: no artifact, no lease, DSP mounts immediately.
    if (!ground.emission) return true;
    // SSR ground: no document to observe, so DSP mounts with the receipt in the
    // same markup.
    if (typeof document === "undefined") return true;

    // Revalidate an existing lease before trusting it.
    if (
      lease &&
      lease.document === document &&
      lease.digest === ground.emission.receipt.digest
    ) {
      const revalidated = resolveVisualAuthority({
        declaration: ground.declaration!,
        slug: ground.tenantConfig.slug,
        verticalKey: ground.tenantConfig.vertical,
        payload: censusRuntimeVisualPayload(ground.tenantConfig),
        documentRoot: document,
      });
      if (
        revalidated.conflict === null &&
        revalidated.mountedArtifact === lease.node
      ) {
        return true;
      }
    }

    // Hydration or a post-claim commit: synchronous exact proof.
    const resolution = resolveVisualAuthority({
      declaration: ground.declaration!,
      slug: ground.tenantConfig.slug,
      verticalKey: ground.tenantConfig.vertical,
      payload: censusRuntimeVisualPayload(ground.tenantConfig),
      documentRoot: document,
    });
    return resolution.conflict === null && resolution.mountedArtifact !== null;
  })();

  return (
    <>
      <ShowroomArtifactStyle emission={ground.emission} />
      {ready && (
        <DesignSystemProvider
          tenantConfig={ground.tenantConfig}
          vertical="bithire"
          forceEngine={engine}
          forceTheme={theme}
          {...(locale ? { locale } : {})}
          {...(customTranslations ? { customTranslations } : {})}
          {...(ground.declaration ? { visualAuthority: ground.declaration } : {})}
        >
          {/*
            Density is a POSTURE on the static path and a compiled DOCUMENT value
            on the DB path, and it must never be both: the DB artifact already
            carries its own density scale, so wrapping it here would apply density
            twice. `themanagement-seeds` is the third case and takes NEITHER --
            it emits an artifact, so this gate skips it, and its document does not
            author density on purpose.
          */}
          {ground.emission === null && density ? (
            <DensityScope posture={density}>{children}</DensityScope>
          ) : (
            children
          )}
        </DesignSystemProvider>
      )}
    </>
  );
}
