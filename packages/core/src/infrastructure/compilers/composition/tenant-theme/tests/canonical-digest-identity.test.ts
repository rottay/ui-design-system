/**
 * Digest identity across the canonicalization extraction.
 *
 * Canonical form moved out of this compiler into
 * `foundation/kernel/serialization` so the theming runtime could stop reaching
 * up into a compiler composition owner for it, and the plain-object predicate
 * became realm-safe at the same time. Both changes sit directly under every
 * artifact digest, and a digest drift silently invalidates every artifact
 * already persisted against a tenant row.
 *
 * The pinned values in `canonical-extraction-pre-change-digests.json` were
 * captured from the compiler BEFORE the extraction. Every one of them must
 * still be produced byte-identically. This file is the regression fence for
 * that; it deliberately duplicates the fixture documents rather than importing
 * them, so a future edit to another suite's document constants cannot move
 * these inputs without also moving this file.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import type { TenantThemeDocument } from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import {
  FIRST_PARTY_THEMES,
  FIRST_PARTY_VERTICAL_ROSTER,
} from "@/foundation/tokens/ts/presentation/brand-themes";
import { compileTheme } from "@/infrastructure/compilers/kernel/runtime/brand-theme";
import {
  TENANT_THEME_COMPILER_VERSION,
  TENANT_THEME_CONFIG_SCHEMA_DIGEST,
  TENANT_THEME_DOCUMENT_SCHEMA_DIGEST,
  canonicalizeTenantThemeValue,
  assertTenantThemeEnvelopeDeclaresAdvanced,
  compileTenantThemeConfig,
  getFirstPartyTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
} from "..";

const FIXTURE_DIR = resolve(
  process.cwd(),
  "src/infrastructure/compilers/composition/tenant-theme/tests/fixtures"
);

const PINNED = JSON.parse(
  readFileSync(
    resolve(FIXTURE_DIR, "canonical-extraction-pre-change-digests.json"),
    "utf8"
  )
) as Record<string, string>;

const IDENTITY = {
  tenantId: "tenant_fixture",
  slug: "fixture-tenant",
  verticalKey: "bithire",
  rowVersion: 1,
} as const;

const W4_PIN_IDENTITY = {
  tenantId: "tenant_w4_pin",
  slug: "w4-pin-tenant",
  verticalKey: "bithire",
  rowVersion: 3,
} as const;

/**
 * The 26 top-level chrome families ROTTAY-T3 MASS added to
 * `TENANT_THEME_CHROME_FAMILIES`. Written out here rather than imported, for
 * the same reason this file duplicates its fixture documents: a re-anchor that
 * reads its own subject cannot fail, and this list is what the block below
 * subtracts to reproduce the pre-tranche envelope.
 */
const ROTTAY_T3_CHROME_FAMILIES = [
  "alert",
  "anchor",
  "avatar",
  "backTop",
  "calendar",
  "collapse",
  "descriptions",
  "drawer",
  "dropdown",
  "empty",
  "floatButton",
  "liveFeed",
  "menu",
  "message",
  "notification",
  "pagination",
  "progress",
  "result",
  "skeleton",
  "spinner",
  "statistic",
  "statsGrid",
  "steps",
  "tag",
  "timeline",
  "tree",
] as const;

/**
 * Today's bithire envelope, and the same envelope with ROTTAY-T3's 26 names
 * subtracted back out.
 *
 * Reconstructing the pre-tranche envelope from the LIVE one -- rather than
 * pasting a captured literal -- is what keeps a pre-change digest reachable
 * from today's compiler. If the reconstruction ever stops reproducing the old
 * pin, the claim "only the roster moved" is false and every block that asserts
 * it reds. Three blocks below make that claim, so the reconstruction has one
 * owner rather than three copies that could drift apart.
 */
function bithireEnvelopePair() {
  const envelope = getFirstPartyTenantThemeVerticalEnvelope("bithire");
  assertTenantThemeEnvelopeDeclaresAdvanced(envelope);
  const preRottayT3 = {
    ...envelope,
    advanced: {
      ...envelope.advanced,
      chromeFamilies: envelope.advanced.chromeFamilies.filter(
        (family) => !ROTTAY_T3_CHROME_FAMILIES.includes(family as never)
      ),
    },
  };
  return { envelope, preRottayT3 };
}

/**
 * The envelope digest every bithire artifact carries today, once ROTTAY-T3
 * widened the published roster from 22 chrome families to 48. It is shared by
 * the three fixture documents because they share a vertical, and it is written
 * once here so the three blocks cannot pin three different values.
 */
const POST_ROTTAY_T3_ENVELOPE_DIGEST =
  "sha256-38b931bbd463ba683a7c5b495c580865dd62e1753c4380ad21ca737f8d8250be";

const NULL_OVERRIDE_DOCUMENT = {
  schemaVersion: 1,
  mode: "simple",
  appearance: {},
} as unknown as TenantThemeDocument;

const POPULATED_SIMPLE_DOCUMENT = {
  schemaVersion: 1,
  mode: "simple",
  appearance: {
    palette: {
      primary: "#0F766E",
      secondary: "#8C6D46",
      accent: "#E2725B",
      backgroundMode: "light",
    },
    typography: {
      fontFamilyBase: "Optima, Candara, 'Noto Sans', sans-serif",
      fontFamilyHeading: "'Fraunces', Georgia, 'Times New Roman', serif",
    },
    density: "normal",
    motion: { intensity: 0.62, durationScale: 1.15, ambient: "subtle" },
    shape: { buttonStyle: "soft" },
    surfaces: { elevation: "elevated" },
    navigation: { sidebarTone: "subtle" },
  },
} as unknown as TenantThemeDocument;

const ABSENT_NEW_FIELDS_DOCUMENT = {
  schemaVersion: 1,
  mode: "advanced",
  visualFoundation: {
    general: {
      typography: {
        fontFamilyBase: "Optima, Candara, 'Noto Sans', sans-serif",
        fontFamilyHeading: "'Fraunces', Georgia, serif",
      },
      shape: { buttonStyle: "pill" },
      density: "compact",
      motion: { intensity: 0.4, durationScale: 0.9, ambient: "off" },
      surfaces: { elevation: "flat" },
      navigation: { sidebarTone: "inverse" },
    },
    advanced: {
      chrome: {
        sidebar: { bg: "#101014", text: "#F4F4F5", width: "248px" },
        layout: { headerBg: "#FFFFFF", headerHeight: "56px" },
        table: { headerBg: "#F8F8FA", cellPadding: "10px 12px" },
        cardComponent: { bg: "#FFFFFF", radius: "10px" },
      },
      tokenOverrides: {
        "--ds-radius-md": "10px",
        "--ds-density-scale": 0.9,
      },
    },
  },
} as unknown as TenantThemeDocument;

/**
 * The closed-domain invariant, stated executably.
 *
 * `getFirstPartyTenantThemeVerticalEnvelope` is typed total over
 * `FirstPartyVerticalId` because the registry is `satisfies
 * Readonly<Record<FirstPartyVerticalId, ...>>`. That is a compile-time claim;
 * this iterates the ROSTER -- the single runtime enumeration of the same three
 * identities -- so a registry row that goes missing, or a roster that grows a
 * fourth vertical the registry never learned about, fails here rather than as
 * a `possibly undefined` in whichever suite happens to index it next.
 */
describe("first-party vertical envelope registry is total over the roster", () => {
  it.each(FIRST_PARTY_VERTICAL_ROSTER.map((row) => row.verticalKey))(
    "%s resolves an envelope that declares an advanced policy",
    (verticalKey) => {
      const envelope = getFirstPartyTenantThemeVerticalEnvelope(verticalKey);
      expect(envelope).toBeDefined();
      expect(envelope.verticalKey).toBe(verticalKey);
      // The runtime half of the invariant, via the shared assertion rather
      // than a per-file narrowing throw.
      assertTenantThemeEnvelopeDeclaresAdvanced(envelope);
      expect(envelope.advanced.chromeFamilies.length).toBeGreaterThan(0);
    }
  );

  it("names the vertical when an envelope declares no advanced policy", () => {
    expect(() =>
      assertTenantThemeEnvelopeDeclaresAdvanced({
        schemaVersion: 1,
        verticalKey: "simple-only",
        allowedModes: ["simple"],
      })
    ).toThrow(/simple-only/);
  });
});

describe("digest identity across the canonicalization extraction", () => {
  it("pins the digests against the compiler version they were captured on", () => {
    // The version is inside the digest source, so bumping it moves every
    // artifact digest at once — which is why this file has never used a bump
    // to sanction a move, and why `nullOverrideDigest` survives as a negative
    // control. A pin below may only move with a written attribution in the
    // fixture's `reanchored` field naming what changed and how it was
    // measured; an unattributed move is a regression.
    expect(TENANT_THEME_COMPILER_VERSION).toBe(PINNED.compilerVersion);
  });

  it("moves both schema drift sentinels only for the declared narrowing and widening", () => {
    // `TENANT_THEME_OVERRIDE_TOKENS` stopped publishing the four
    // `--ds-color-dark-primary|-secondary|-accent|-bg` rows: no compiler emits
    // that family and no stylesheet reads it, so the allowlist was granting a
    // tenant a knob wired to nothing. The re-anchor and its full rationale are
    // recorded at the primary sentinel site in `tenant-theme-compiler.test.ts`;
    // this file's job is to prove the move happened HERE too and is the
    // declared one, not a silent second drift.
    //
    // The pre-change values stay pinned and stay asserted. This suite's other
    // pins -- the null-override and W4-absent artifact digests, and the
    // compiler version -- are untouched, which is what confines the narrowing
    // to the schema surface.
    const POST_DARK_TOKEN_NARROWING_DOCUMENT_DIGEST =
      "sha256-4beabac2c0147b671abf92236230584950c5ba900d4f8750e3d036e84e088ce2";
    const POST_DARK_TOKEN_NARROWING_CONFIG_DIGEST =
      "sha256-2c4c6e60732ca8fee64938eb1e4959508408b22391f60c9d373f1c138bd10c53";

    // ROTTAY-T1 widening: the document schema then gained the DB mirror for
    // the chrome channels the rottay extension drain moved into the governed
    // contract — strictly additive, 117 leaf paths gained and zero removed
    // (57 fields across eight chrome sections, plus three new container
    // objects). The full rationale lives at the primary sentinel site in
    // `tenant-theme-compiler.test.ts`; this file's job is unchanged — prove
    // the move happened HERE too and is the declared one.
    //
    // Both predecessor values stay pinned and stay asserted as values the
    // sentinels must no longer equal, so the chain of declared moves is
    // proven rather than replaced. The artifact digests and the compiler
    // version below are untouched, which is what confines this widening to
    // the schema surface.
    const POST_ROTTAY_T1_DB_MIRROR_DOCUMENT_DIGEST =
      "sha256-713ccbafb369557d4e9c57686400e9eef2a02dd0dc478ab3fa0862ca9eb1d5d6";
    const POST_ROTTAY_T1_DB_MIRROR_CONFIG_DIGEST =
      "sha256-d8871d06009115f98da1afef5c32ce961b387d7078d6092f331d090e35355a7f";

    // ROTTAY-T2 widening: the second rottay extension tranche moved 302
    // declarations (151 unique channels) out of the artifact source, and the
    // document schema gained the DB mirror for the control chrome that
    // migrated — again strictly additive, 678 leaf paths gained and zero
    // removed (163 fields plus 13 container objects, counted across the two
    // projections of the advanced document). The full rationale, the measured
    // per-container counts and the reconstruction that reproduces the T1
    // predecessor digest live at the primary sentinel site in
    // `tenant-theme-compiler.test.ts`; this file's job is unchanged — prove
    // the move happened HERE too and is the declared one.
    //
    // Every predecessor stays pinned and stays asserted as a value the
    // sentinels must no longer equal, so the chain PINNED -> dark-token
    // narrowing -> ROTTAY-T1 -> ROTTAY-T2 is proven link by link rather than
    // replaced by its newest end. The artifact digests and the compiler
    // version below are untouched, which is what confines this widening to
    // the schema surface.
    const POST_ROTTAY_T2_DB_MIRROR_DOCUMENT_DIGEST =
      "sha256-07ea7738ce1f56d001aa28aec49b75f5d41c155b051913152b4966f4330d509f";
    const POST_ROTTAY_T2_DB_MIRROR_CONFIG_DIGEST =
      "sha256-aa46cb88dbe73997c82be88497e264ded8370a2bd4d6aa310e63e1961d64fd25";

    // ROTTAY-T3 widening: the third and final rottay extension tranche moved
    // the whole 380-declaration remainder (190 unique channels) out of the
    // artifact source, taking the file to zero custom properties, and the
    // document schema gained the DB mirror for the 26 chrome families that
    // migrated — again strictly additive, no leaf path removed. Unlike T1 and
    // T2, whose containers hung off existing sections, these 26 are TOP-LEVEL
    // families: `BrandChrome` 28 -> 54 and `TenantThemeChrome` 22 -> 48. The
    // full rationale and the per-family static=DB proof live in
    // `rottay-t3-mass-drain.test.ts`; this file's job is unchanged — prove the
    // move happened HERE too and is the declared one.
    //
    // Every predecessor stays pinned and stays asserted as a value the
    // sentinels must no longer equal, so the chain PINNED -> dark-token
    // narrowing -> ROTTAY-T1 -> ROTTAY-T2 -> ROTTAY-T3 is proven link by link
    // rather than replaced by its newest end.
    //
    // This widening is NOT confined to the schema surface, and that is stated
    // here rather than left for the artifact fences below to discover: because
    // the 26 names are top-level, they enter `TENANT_THEME_CHROME_FAMILIES`,
    // which every vertical envelope publishes, so `verticalEnvelopeDigest` —
    // and therefore every artifact digest — moves for every vertical. The
    // block below measures exactly that and shows it is the ONLY cause.
    const POST_ROTTAY_T3_DB_MIRROR_DOCUMENT_DIGEST =
      "sha256-f3f55fa2ae71d264f9211d713eed00265578273a6ea11d4f74a63606f2e6e202";
    const POST_ROTTAY_T3_DB_MIRROR_CONFIG_DIGEST =
      "sha256-73eef2348a5fa534c6ed4f2b58e3be4fb7dfd0527d57f82f6de8b3d0b8e3f9cb";

    // CI-1 re-anchor (F4A-6/K3, 3393f70d4, 2026-08-21): the schema PUBLISHES
    // referenceTokens and gained --ds-color-text-page -- an AMPLIATION of the
    // closed field set, not a narrowing, same law as the sentinel note in
    // tenant-theme-compiler.test.ts (the primary site for this exact move).
    // Both values re-derived from the tree and verified directly against
    // dist/server.js today, not copied from that other file's pins blind.
    const POST_F4A6_TEXT_PAGE_ROOT_DOCUMENT_DIGEST =
      "sha256-9b9d5b8d32a90805d9a52998d9e94b2fa586491063a19055d94b713a8b53a739";
    const POST_F4A6_TEXT_PAGE_ROOT_CONFIG_DIGEST =
      "sha256-e893268074cc59e4acdeaf27a0986d71104c98df67c12bf643031ed615caa952";

    expect(TENANT_THEME_DOCUMENT_SCHEMA_DIGEST).not.toBe(
      PINNED.documentSchemaDigest
    );
    expect(TENANT_THEME_CONFIG_SCHEMA_DIGEST).not.toBe(PINNED.configSchemaDigest);
    expect(TENANT_THEME_DOCUMENT_SCHEMA_DIGEST).not.toBe(
      POST_DARK_TOKEN_NARROWING_DOCUMENT_DIGEST
    );
    expect(TENANT_THEME_CONFIG_SCHEMA_DIGEST).not.toBe(
      POST_DARK_TOKEN_NARROWING_CONFIG_DIGEST
    );
    expect(TENANT_THEME_DOCUMENT_SCHEMA_DIGEST).not.toBe(
      POST_ROTTAY_T1_DB_MIRROR_DOCUMENT_DIGEST
    );
    expect(TENANT_THEME_CONFIG_SCHEMA_DIGEST).not.toBe(
      POST_ROTTAY_T1_DB_MIRROR_CONFIG_DIGEST
    );
    expect(TENANT_THEME_DOCUMENT_SCHEMA_DIGEST).not.toBe(
      POST_ROTTAY_T2_DB_MIRROR_DOCUMENT_DIGEST
    );
    expect(TENANT_THEME_CONFIG_SCHEMA_DIGEST).not.toBe(
      POST_ROTTAY_T2_DB_MIRROR_CONFIG_DIGEST
    );
    expect(TENANT_THEME_DOCUMENT_SCHEMA_DIGEST).not.toBe(
      POST_ROTTAY_T3_DB_MIRROR_DOCUMENT_DIGEST
    );
    expect(TENANT_THEME_CONFIG_SCHEMA_DIGEST).not.toBe(
      POST_ROTTAY_T3_DB_MIRROR_CONFIG_DIGEST
    );
    // P0 re-anchor (2026-08-28): the envelope gained `general.palette.status`
    // -- the four status tone seeds of the `palette.status-seeds` dial, opened
    // in place from its frontier row. Same law as the F4A-6 note directly
    // above: an AMPLIATION of the closed field set, not a narrowing. The
    // previous positive pin drops to `not.toBe` so the ratchet keeps every
    // superseded value asserted, and the two new values are re-derived from the
    // tree (not copied from another file's pins).
    const POST_P0_STATUS_SEEDS_DOCUMENT_DIGEST =
      "sha256-e1875114d48a83e2d28ba9fa1b4a3af801c3a311183dc8126c2019af1e65cb8c";
    const POST_P0_STATUS_SEEDS_CONFIG_DIGEST =
      "sha256-6b8503c4d6e472a0091bf41da16bc9b3514b39d2cee8a201fcf0568a16d05a18";

    expect(TENANT_THEME_DOCUMENT_SCHEMA_DIGEST).not.toBe(
      POST_F4A6_TEXT_PAGE_ROOT_DOCUMENT_DIGEST
    );
    expect(TENANT_THEME_CONFIG_SCHEMA_DIGEST).not.toBe(
      POST_F4A6_TEXT_PAGE_ROOT_CONFIG_DIGEST
    );
    expect(TENANT_THEME_DOCUMENT_SCHEMA_DIGEST).toBe(
      POST_P0_STATUS_SEEDS_DOCUMENT_DIGEST
    );
    expect(TENANT_THEME_CONFIG_SCHEMA_DIGEST).toBe(
      POST_P0_STATUS_SEEDS_CONFIG_DIGEST
    );
  });

  it("attributes the artifact-digest move to the 26 family names and nothing else", () => {
    // ROTTAY-T3. `nullOverride` IS re-anchored by this tranche -- it is the
    // only fence T3 broke, and it moves under the law written into this file
    // below: a pin may move with a written attribution in the fixture's
    // `reanchored` field naming what changed and how it was measured. That
    // attribution is the ROTTAY-T3 paragraph in
    // `canonical-extraction-pre-change-digests.json`, and this block is the
    // measurement it cites.
    //
    // `populatedSimple` and `w4Absent` are NOT re-anchored: they were already
    // red on the inherited worktree BEFORE this tranche, so they are foreign
    // reds, and re-anchoring a foreign red is an owner decision -- not least
    // because a moved artifact digest invalidates every artifact already
    // persisted against a tenant row and every such row must be recompiled.
    //
    // What this block does is convert "the fence is red" into "the fence is
    // red for exactly this measured reason". `TENANT_THEME_CHROME_FAMILIES`
    // gained 26 top-level names; the list is published inside every vertical
    // envelope, so the envelope digest moves, and the envelope digest is
    // inside the artifact digest source. Rebuilding the envelope WITHOUT the
    // 26 names and recompiling reproduces the pinned digests byte-for-byte --
    // which is the strongest available statement that nothing else moved, and
    // is a claim about the compiler rather than about this file's comments.
    const { envelope, preRottayT3: preT3Envelope } = bithireEnvelopePair();
    // The reconstruction removes exactly the tranche's 26 and leaves the 22
    // that predate it -- it is not an arbitrary subset chosen to fit a hash.
    expect(
      envelope.advanced.chromeFamilies.length -
        preT3Envelope.advanced.chromeFamilies.length
    ).toBe(ROTTAY_T3_CHROME_FAMILIES.length);
    expect(preT3Envelope.advanced.chromeFamilies).toHaveLength(22);
    expect(envelope.advanced.chromeFamilies).toHaveLength(48);

    const config = hydrateTenantThemeConfig(NULL_OVERRIDE_DOCUMENT, {
      ...IDENTITY,
    });
    const before = compileTenantThemeConfig(config, {
      verticalEnvelope: preT3Envelope,
    });
    const after = compileTenantThemeConfig(config, {
      verticalEnvelope: envelope,
    });

    // The pre-change fence is REPRODUCED, not abandoned. These two literals
    // ARE the values the fixture pinned before this tranche; they stay
    // written and asserted here, so the re-anchor recorded in the fixture's
    // `reanchored` ledger is attributed rather than laundered -- the old pin
    // is still reachable from today's compiler, which is what proves it was
    // never stale.
    expect(before.digest).toBe(
      "sha256-f594475c5aba01a40f2fe9f4b3f08d6343a4e2df3640ecd4d2abd9acaece8a6c"
    );
    expect(before.verticalEnvelopeDigest).toBe(
      "sha256-65da54f9b7e5bb192b79f73ae996855a43a9ce15ab8c6a419c69dca2a18d783f"
    );
    // ...and today's output is the RE-ANCHORED pin, in both the envelope and
    // the artifact. The inequality is carried by the two sets of values being
    // different literals, so nothing is asserted only against itself.
    expect(after.verticalEnvelopeDigest).toBe(
      PINNED.nullOverrideEnvelopeDigest
    );
    expect(after.digest).toBe(PINNED.nullOverrideDigest);

    // Everything else in the digest source is byte-identical, so the move is
    // provenance, not paint. A tenant that renders through this artifact sees
    // the same variables it saw before the tranche.
    expect(after.variables).toEqual(before.variables);
    expect(after.variables).toEqual({});
    expect(after.normalizedAppearance).toEqual(before.normalizedAppearance);
    expect(after.scopes).toEqual(before.scopes);
    expect(after.coverage).toEqual(before.coverage);
    expect(after.compilerVersion).toBe(before.compilerVersion);
  });

  it("keeps the null-override artifact digest byte-identical", () => {
    const artifact = compileTenantThemeConfig(
      hydrateTenantThemeConfig(NULL_OVERRIDE_DOCUMENT, { ...IDENTITY })
    );
    expect(artifact.digest).toBe(PINNED.nullOverrideDigest);
    expect(artifact.verticalEnvelopeDigest).toBe(
      PINNED.nullOverrideEnvelopeDigest
    );
  });

  it("moves the populated simple artifact digest for two separated reasons", () => {
    // TWO causes, stacked. This block separates them instead of re-pinning one
    // number and calling that an attribution.
    //
    // CAUSE 1 -- ROTTAY-T3's roster. `TENANT_THEME_CHROME_FAMILIES` went from
    // 22 names to 48. That list is published inside every vertical envelope,
    // and the envelope digest sits inside the artifact digest source, so both
    // digests move. Subtracting the 26 names back out reproduces the pinned
    // envelope digest byte-for-byte, asserted below: the old pin is still
    // reachable from today's compiler, which is what proves it was never stale.
    //
    // CAUSE 2 -- the ISO delta. `variables` stopped being the tenant's whole
    // compiled theme and became its DELTA against the code-owned vertical
    // baseline (`baseCompiled = compileTheme(baseTheme, ...)`; a channel whose
    // compiled value equals the baseline's is withdrawn). The channel-by-
    // channel census is owned by `tenant-theme-artifact-stability.test.ts`
    // (`POPULATED_WITHDRAWN`); what is pinned here is its effect on the hash.
    //
    // The previously declared interaction-floor move stays written and
    // asserted, because it is what cause 2 acts on. The floor really did land
    // -- and the subtraction then took it straight back out, since the floor
    // was derived from the BASELINE's primary rather than from the tenant's
    // `#0F766E`. It therefore never differed from the baseline and never
    // survived into the delta.
    //
    // CAUSE 3 -- T2A's seed derivation (`applyTenantSeedDerivations`). That is
    // exactly the repair the paragraph above said would red this block, and it
    // has now been made: when the tenant authors `palette.primary`, the ten
    // channels that seed owns are re-derived from the TENANT's seed instead of
    // being left on the baseline's. Seven of them consequently stop matching
    // the baseline and survive the subtraction, which is the whole `59 -> 66`
    // move and the third artifact digest. The channels that changed sides are
    // re-asserted below by VALUE rather than by absence, and the one that
    // legitimately still resolves through an indirection stays pinned ABSENT
    // beside the baseline value that displaces it -- so a future derivation
    // change still reds this block instead of quietly changing what a customer
    // sees. The per-channel census remains owned by
    // `tenant-theme-artifact-stability.test.ts`.
    //
    // OPERATIONAL NOTE: a digest move invalidates artifacts already persisted
    // against a tenant row. Every such row must be recompiled.
    const POST_INTERACTION_FLOOR_DIGEST =
      "sha256-04c7dac06febfd205c12545ccb7a67144cdbfcff283479d168e8ee887d017985";
    const POST_ISO_DELTA_DIGEST =
      "sha256-4693b1bdfdb469a59a0d6ba12e29f03b53ee682bfccbab8b8b323b8aed2b6498";
    const POST_TENANT_SEED_DERIVATION_DIGEST =
      "sha256-3afa6b39ec2fe43789a92738623adb177bb32d9ed5e51861ec1dc5773ec621ca";

    const { envelope, preRottayT3 } = bithireEnvelopePair();
    const config = hydrateTenantThemeConfig(POPULATED_SIMPLE_DOCUMENT, {
      ...IDENTITY,
    });
    const artifact = compileTenantThemeConfig(config, {
      verticalEnvelope: envelope,
    });

    // Cause 1, isolated: the roster and nothing else moved the envelope.
    expect(artifact.verticalEnvelopeDigest).not.toBe(
      PINNED.populatedSimpleEnvelopeDigest
    );
    expect(artifact.verticalEnvelopeDigest).toBe(POST_ROTTAY_T3_ENVELOPE_DIGEST);
    expect(
      compileTenantThemeConfig(config, { verticalEnvelope: preRottayT3 })
        .verticalEnvelopeDigest
    ).toBe(PINNED.populatedSimpleEnvelopeDigest);

    // All three prior artifact pins stay asserted, so this reads as a fourth
    // declared move rather than a refreshed baseline.
    expect(artifact.digest).not.toBe(PINNED.populatedSimpleDigest);
    expect(artifact.digest).not.toBe(POST_INTERACTION_FLOOR_DIGEST);
    expect(artifact.digest).not.toBe(POST_ISO_DELTA_DIGEST);
    expect(artifact.digest).toBe(POST_TENANT_SEED_DERIVATION_DIGEST);

    // Cause 2, two-sided. What the tenant authored survives the subtraction...
    expect(artifact.variables["--ds-color-primary"]).toBe("#0F766E");
    expect(Object.keys(artifact.variables)).toHaveLength(66);

    const baseline = compileTheme(FIRST_PARTY_THEMES.bithire, {
      tenantSlug: IDENTITY.slug,
    }).cssVariables;

    // ...and cause 3, two-sided as well. Three of the four channels this block
    // used to pin ABSENT now carry a value derived from the TENANT's seed, and
    // each is asserted against the baseline value it displaced -- pinning the
    // new value alone would also pass if the baseline had drifted onto it.
    for (const [channel, derived, displaced] of [
      ["--ds-color-border-focus", "#0F766E", "#3a6fb0"],
      ["--ds-color-link", "#0F766E", "#3a6fb0"],
      ["--ds-color-link-hover", "#00635C", "#2c5587"],
    ] as const) {
      expect(baseline[channel], channel).toBe(displaced);
      expect(artifact.variables[channel], channel).toBe(derived);
    }

    // The fourth stays ABSENT, and legitimately so: `--ds-color-primary-
    // foreground` is not a member of the seed-derived family. It is the
    // contrast partner the family points AT, so the tenant's seed does not
    // re-derive it and it still matches the bithire baseline. Absence on its
    // own would also pass if emission stopped altogether, so the displacing
    // value is pinned beside it.
    expect(baseline["--ds-color-primary-foreground"]).toBe("#ffffff");
    expect(artifact.variables["--ds-color-primary-foreground"]).toBeUndefined();
  });

  it("moves the W4-absent advanced artifact digest for the same two reasons", () => {
    // The same two causes as the block above, on a document that authors no
    // primary seed: ROTTAY-T3's envelope, then the ISO delta subtraction. This
    // document's per-channel census -- the seven channels that proved
    // baseline-identical and the two sidebar channels that moved -- is owned
    // by `tenant-theme-artifact-stability.test.ts` (`W4_RETIRED`, `W4_MOVED`).
    //
    // This is the last of the four keys the ROTTAY-T3 tranche recorded as
    // "deliberately not re-anchored", on the grounds that re-anchoring a red
    // it had inherited was an owner decision rather than its own. That
    // decision has since been taken; the pre-change value stays written and
    // stays asserted, and the same recompile obligation applies.
    //
    // CAUSE 3 -- T2A's sidebar leaf-over-tone ruling. This document authors
    // `sidebarTone: "inverse"` AND two explicit sidebar leaves (`bg`, `text`).
    // The tone used to be assigned last and overwrite both. It no longer does:
    // an explicit tenant leaf outranks the tenant's own tone, so the two
    // authored colours reach CSS and the digest moves with them. The four
    // sidebar channels the tenant did NOT author still carry the inverse tone,
    // which is asserted below so this reads as a precedence fix rather than as
    // the tone having been dropped. The channel census stays owned by
    // `tenant-theme-artifact-stability.test.ts` (`W4_RESTORED`).
    //
    // CAUSE 4 -- the same ruling, one layer out. The digest covers the mode
    // deltas as well as the base variables, and this document's dark block
    // used to re-state bithire's own `modes.dark.chrome.sidebar` bg and ink
    // over the two leaves the tenant had just won at the base. A tenant leaf
    // outranks a baseline mode overlay exactly as it outranks the tenant's own
    // tone, so those two rows are gone from the delta and the digest moves
    // again. This is a SUBTRACTION from the emission, asserted below.
    const POST_ISO_DELTA_W4_DIGEST =
      "sha256-1de6b0082acce8bc9a26d4de3884ce0f4dd9a1980301f5c7fa707ae566fc6e9f";
    const POST_SIDEBAR_LEAF_PRECEDENCE_W4_DIGEST =
      "sha256-fd8ed58a8b15f8159dac7d0e77deabe9fd4e9ecb536556fdb3ac7bc60c5fd5cf";

    const { envelope, preRottayT3 } = bithireEnvelopePair();
    const config = hydrateTenantThemeConfig(ABSENT_NEW_FIELDS_DOCUMENT, {
      ...W4_PIN_IDENTITY,
    });
    const artifact = compileTenantThemeConfig(config, {
      verticalEnvelope: envelope,
    });

    expect(artifact.verticalEnvelopeDigest).not.toBe(
      PINNED.w4AbsentEnvelopeDigest
    );
    expect(artifact.verticalEnvelopeDigest).toBe(POST_ROTTAY_T3_ENVELOPE_DIGEST);
    expect(
      compileTenantThemeConfig(config, { verticalEnvelope: preRottayT3 })
        .verticalEnvelopeDigest
    ).toBe(PINNED.w4AbsentEnvelopeDigest);

    expect(artifact.digest).not.toBe(PINNED.w4AbsentDigest);
    expect(artifact.digest).not.toBe(POST_ISO_DELTA_W4_DIGEST);
    expect(artifact.digest).toBe(POST_SIDEBAR_LEAF_PRECEDENCE_W4_DIGEST);

    // Cause 3, two-sided. The two authored leaves win over the tenant's own
    // `inverse` tone...
    expect(artifact.variables["--ds-sidebar-bg"]).toBe("#101014");
    expect(artifact.variables["--ds-sidebar-text"]).toBe("#F4F4F5");
    // ...and the four the tenant did NOT author still carry that tone, so the
    // ruling is a precedence fix and not a silent removal of the tone itself.
    for (const [channel, tone] of [
      ["--ds-sidebar-text-muted", "var(--ds-color-neutral-500)"],
      ["--ds-sidebar-item-bg-hover", "var(--ds-color-neutral-800)"],
      ["--ds-sidebar-item-bg-active", "var(--ds-color-neutral-700)"],
      ["--ds-sidebar-item-color-active", "var(--ds-color-white)"],
    ] as const) {
      expect(artifact.variables[channel], channel).toBe(tone);
    }

    // Cause 4, two-sided against the vertical it outranks. bithire really does
    // author a dark sidebar bg and ink; they are simply outranked, so the dark
    // delta carries neither. Asserting the baseline values exist keeps this a
    // proof that they LOSE rather than a vacuous absence.
    const bithireDark = FIRST_PARTY_THEMES.bithire.modes?.dark?.chrome?.sidebar;
    expect(bithireDark?.bg).toBe("#0a0f18");
    expect(bithireDark?.text).toBe("#9aacbf");
    const darkDelta = artifact.modeDeltas?.find((d) => d.mode === "dark");
    expect(darkDelta, "the document still produces a dark delta").toBeDefined();
    expect(darkDelta!.variables["--ds-sidebar-bg"]).toBeUndefined();
    expect(darkDelta!.variables["--ds-sidebar-text"]).toBeUndefined();

    // The radius dial law is the one visible-value change this delta carries,
    // so it is named here rather than left to the census: the tenant's `10px`
    // is folded onto bithire's 1.25 radius scale instead of being emitted raw,
    // which is what keeps a tenant override on the vertical's dial.
    expect(artifact.variables["--ds-card-radius"]).toBe(
      "calc(10px / 1.25 * var(--ds-radius-scale, 1))"
    );
    expect(Object.keys(artifact.variables)).toHaveLength(20);
  });

  it("produces one digest for a document authored in any key order", () => {
    // The whole point of canonical form: two editors that serialise the same
    // appearance with different property order must not fork the artifact.
    const reordered = {
      mode: "simple",
      appearance: {
        navigation: { sidebarTone: "subtle" },
        surfaces: { elevation: "elevated" },
        shape: { buttonStyle: "soft" },
        motion: { durationScale: 1.15, ambient: "subtle", intensity: 0.62 },
        density: "normal",
        typography: {
          fontFamilyHeading: "'Fraunces', Georgia, 'Times New Roman', serif",
          fontFamilyBase: "Optima, Candara, 'Noto Sans', sans-serif",
        },
        palette: {
          backgroundMode: "light",
          accent: "#E2725B",
          secondary: "#8C6D46",
          primary: "#0F766E",
        },
      },
      schemaVersion: 1,
    } as unknown as TenantThemeDocument;

    const artifact = compileTenantThemeConfig(
      hydrateTenantThemeConfig(reordered, { ...IDENTITY })
    );

    // Compared against the SAME document compiled in its declared key order,
    // not against a pinned literal. Key-order independence is a property of
    // the two compilations relative to each other; pinning it to a captured
    // hash made it break every time the emission legitimately changed, which
    // is a different fact wearing this test's name.
    const declaredOrder = compileTenantThemeConfig(
      hydrateTenantThemeConfig(POPULATED_SIMPLE_DOCUMENT, { ...IDENTITY })
    );
    expect(artifact.digest).toBe(declaredOrder.digest);
  });

  it("still publishes canonicalizeTenantThemeValue as a working alias", () => {
    // The name is part of the /server entrypoint. The extraction rebound it to
    // the shared kernel function; it must stay callable and stay canonical.
    expect(canonicalizeTenantThemeValue({ b: 1, a: "  x  " })).toBe(
      '{"a":"x","b":1}'
    );
  });
});
