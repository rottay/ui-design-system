import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";

import { brandThemeToTheme } from "@/foundation/contracts/composition/tenants/themes/iso";
import { bithireBrandTheme } from "@/foundation/tokens/ts/presentation/brand-themes/bithire";
import { evntoBrandTheme } from "@/foundation/tokens/ts/presentation/brand-themes/evnto";
import { rottayBrandTheme } from "@/foundation/tokens/ts/presentation/brand-themes/rottay";
import type { FirstPartyBrandTheme } from "@/foundation/contracts/composition/tenants/themes";
import type { SemanticTypographyRoleTokens } from "@/foundation/contracts/kernel/tokens/typography";

import { compileTheme } from "@/infrastructure/compilers/runtime/theme/runtime/lowering";
import { lowerBrandThemeFixture } from "@tests/support/theme-lowering";
import { EMPTY_PROVENANCE } from "@/foundation/contracts/composition/tenants/themes/resolved";
import { resolveTheme } from "../../resolution";
import { resolveAdapter } from "../../../presentation/adapters";
import { containerScope, emitThemeCss } from "../../emission";
import { brandTenantSelector } from "@/infrastructure/compilers/kernel/foundation/css/tenant-selectors";

/**
 * The two lowerings of one authored theme:
 *   leg A — the static BrandTheme transport, compiled directly.
 *   leg B — the ISO transport: BrandTheme -> Theme -> governed intake -> compile.
 * Both must produce the SAME artifact. The ISO bridge materializes complete
 * containers, so leg B carries role keys that are present with the value
 * `undefined`; the compiler compacts those spread sources so a key that carries
 * no value does not participate in the merge (see `omitUndefined`).
 */
const FIRST_PARTY = [
  ["rottay", rottayBrandTheme],
  ["bithire", bithireBrandTheme],
  ["evnto", evntoBrandTheme],
] as const;

/**
 * Leg-A surface digests measured on the sealed worktree IMMEDIATELY BEFORE the
 * present-with-undefined compaction landed. The static path must be zero-pixel:
 * a moved digest here means the fix changed what a first-party BrandTheme
 * compiles to, which it must never do.
 *
 * ALT-SOURCE re-anchor, ROTTAY ONLY: the authored key order of the base
 * `chrome.popover` and `chrome.tooltip` blocks was permuted to match
 * `DEFAULT_CHROME_SHAPE`, which moved this digest from
 * ed3b3a677090bf56... to bd6dae97451b5b6e... The move is ORDER-ONLY, and that
 * is measured rather than asserted: four independent invariants were byte-
 * identical across the edit — the sorted cssString line multiset
 * (da8f1840e6392eb9...), the leg-A/leg-B value map (b777660c112521b9...), the
 * 1819-leaf authored manifest F2' (1fd5558de5c9ef89...), and the raw/bridged
 * keysets (bb0aec7a19f4ec7b..., 1191 keys). The source delta itself was
 * reconstructed in BOTH directions byte-exactly (cd6c33e256b22fde... <->
 * d672bfb6f3dd811f...) by two independent auditors. Zero pixel, zero value,
 * zero key: only authored order moved. bithire/evnto did not move and are not
 * re-anchored.
 *
 * CI-1 re-anchor, ALL THREE VERTICALS (2026-08-24): F4A-6/K3 (3393f70d4,
 * 2026-08-21) authored a NEW root, `--ds-color-text-page`, and rewired ~35
 * ink channels onto it. Unlike the two re-anchors above, this is NOT
 * order-only: confirmed the new channel is genuinely present in leg-A's
 * compiled output for all three verticals (`--ds-color-text-page` appears in
 * the tenant artifact today: 37 occurrences rottay, 3 bithire, 1 evnto) --
 * real added content, not a permutation. This re-anchor does NOT repeat the
 * full "measured, not asserted" invariant battery (value-map/cssString-
 * multiset/keyset diffs) the two re-anchors above performed -- it is a
 * mechanical CI-1 re-pin against the tree as measured today (the exact
 * `Received` value the suite itself reports), not an architecture audit. If
 * a zero-pixel proof is required for this specific move, it still needs
 * doing.
 *
 * D-1 re-anchor, ALL THREE VERTICALS (2026-08-24, same protocol as the CI-1
 * row above): D-1 restituted the four dark/light overlay shields that F2.4
 * drained, so leg-A's mode blocks each gained exactly the lines the drain had
 * removed -- bithire dark `--ds-card-bg: #151d2b` and
 * `--ds-table-cell-color: #e4e8ed`, rottay light and evnto dark
 * `--ds-layout-sider-bg`. Like the CI-1 row, this is real added content and
 * NOT a permutation, and it does NOT repeat the full invariant battery: the
 * zero-delta proof D-1 does carry is of a different shape -- each restituted
 * value equals what the base alias already resolved to in that mode (measured
 * per leaf), the rest of the compile is identical, and the three tenant
 * artifacts changed in exactly those four lines and nothing else.
 *
 * D-1b re-anchor, ROTTAY ONLY (2026-08-24, same protocol): D-1b restitutes the
 * fifth and sixth overlay shields -- rottay's light `--ds-sidebar-footer-bg`
 * (#F4F4F3, drained by F2.4 `8f58229e3`) and `--ds-table-header-color`
 * (#6B6B6B, drained by F4A-6 `3393f70d4`). Only rottay's leg-A compile moves,
 * and bithire/evnto are NOT re-anchored -- verified: their digests still equal
 * the pins above, which is the same evidence the compile census gives (rottay
 * light 680 -> 682 channels, the other two byte-identical). Same protocol as
 * the two rows above: real added content, no zero-pixel claim; the proof D-1b
 * carries is per-leaf chained resolution + rest-identical + a two-line artifact
 * diff.
 *
 * SUBTLE-WASH re-anchor, ALL THREE (WO-FAM-04 acceptance, same protocol): the
 * alert deriver produces four new channels, --ds-alert-{info,success,warning,
 * error}-wash-subtle, the step-4 wash the folded Callout kept. Real added
 * content, no zero-pixel claim, and ADDITIVE ONLY -- measured by withdrawing
 * exactly those four rows from the deriver and recompiling: all three leg-A
 * digests then return to the pins above byte-for-byte (edfd945f..., 168d239e...,
 * bf47bcb7...), which is only possible if nothing else moved. Per-vertical the
 * emitted keyset goes rottay 2092 -> 2096, bithire 2133 -> 2137, evnto
 * 1449 -> 1453: added 4, removed 0, moved 0 in every one, the same four names
 * each carrying var(--ds-tint-<tone>-4).
 *
 * SHAPE-BASE re-anchor, ROTTAY ONLY: `applyModeOverlay` now completes the chrome
 * merge base to the canonical shape, so an overlay-ONLY key lands in its shape
 * slot instead of being appended after the authored base keys. That closed the
 * one adjudicated cross-lowering residual and moved this digest from
 * bd6dae97451b5b6e... to 80b245093f6fb3b9... The move is again ORDER-ONLY, and
 * again measured rather than asserted: across the edit the leg-A value map
 * (ceadb11e6190fe52...), the sorted cssString line multiset
 * (858cb824c7d4f5c3...) and the emitted keyset (1945 entries,
 * aae01a01eaa604bf...) are all byte-identical, so the ONLY component of the
 * digest that moved is `cssString` — from d02562c4f7c7f462... to exactly leg B's
 * 5b0a754e3112b083... The residual is closed, not relocated. The cross-leg
 * `tokenOverrides` gap that keeps leg A and leg B surface digests distinct is
 * pre-existing and invariant here (8 keys on both legs, before and after); it
 * applies identically to bithire and evnto, which did not move and are not
 * re-anchored.
 */
// C0 re-anchor. These pin the WHOLE leg-A surface, so they move whenever a
// first-party theme moves -- which is what makes them a tripwire and also what
// obliges a written reason on every re-anchor. The cause here is not the
// typography compaction they guard: the three themes rewired their chrome
// grounds onto cascade roots (`layout.bg: "var(--ds-color-bg-primary)"` in
// rottay and evnto, and the sider/table/button grounds in all three), so the
// compiled surface carries the alias where it used to carry the literal. The
// resolved colour is unchanged -- the root declares it in the same block --
// and the T2 cross-lowering equality above still holds byte for byte, which is
// the property this file actually exists to defend.
//
// C2 re-anchor, with its cause measured rather than asserted. The lowering
// stopped carrying the engine-bridge family through its product -- it was
// produced by the compiler and read by nobody, and the family is retired from
// the Theme contract entirely now -- so the digest's payload lost exactly one
// key. PROOF that nothing else moved: re-adding that key to this payload,
// taken from the theme where it always came from, reproduced the PREVIOUS pins
// byte for byte (rottay 16d10f6d…, bithire cdff418d…, evnto 4a6019fb…). Every
// other member of the surface -- cssVariables, cssString, colorScheme,
// modeBlocks, personality, tokenOverrides and both profile ids -- is identical.
//
// DERIVATION re-anchor, all three, ORDER-ONLY and measured rather than
// asserted. The channel assembly is now one deriver per family behind a ranked
// merge, so a family emits its whole block in one place instead of in the two
// or three positions its statements used to be spread across. Across the edit
// the emitted KEYSET is identical (rottay 1196, bithire 1233, evnto 475 keys,
// none added, none removed), every VALUE is identical (0 diffs on all three,
// base block and every mode block), and the sorted `cssString` line multiset is
// identical for all three. The only component of the digest that moved is
// `cssString`, and only in the order its lines appear -- `stable()` sorts
// `cssVariables`, so the value map contributes nothing to the move.
//
// MATERIALS/STATES re-anchor, all three, ADDITIVE-ONLY and measured rather
// than asserted. `derivation/materials` emits all 71 `--ds-material-*` roots
// for every vertical instead of only the facets a theme authored, and
// `derivation/states` emits the interaction deltas and the focus ring. Across
// the edit NOTHING was removed and NO existing value moved: rottay 1196 ->
// 1276 keys (+80), bithire 1233 -> 1248 (+15), evnto 475 -> 553 (+78),
// removed 0 and changed 0 on all three, measured against the committed
// artifacts the previous compiler wrote. Every added key is `--ds-material-*`,
// `--ds-state-*` or `--ds-focus-ring*`; bithire adds only 15 because it had
// already authored 65 of the 71 roots by hand.
// SHAPE re-anchor, all three, ORDER-ONLY and measured rather than asserted.
// The radius operands and the button-silhouette alias moved out of the
// `surfaces` and `axes` families into the new `shape` family, which sits
// earlier in the deriver registry. The digest covers `cssString`, and
// `cssString` preserves declaration order, so it moves. NOTHING ELSE DOES:
// compiling all three themes on both sides of the edit gives 0 value
// differences, identical key sets (rottay 1276, bithire 1248, evnto 553 on
// both sides) and byte-identical `modeBlocks`, and the three committed
// artifacts stay byte-identical (`first-party-artifacts-generated`). Zero
// pixel, one order.
// WO-DER-04 re-anchor, ADDITIVE plus one intentional value move, measured
// rather than asserted. Five axes gained an owner and emit what they used to
// withhold: rottay 1276 -> 1315 keys (+39), bithire 1248 -> 1291 (+43), evnto
// 553 -> 592 (+39), removed 0 on all three. Every added key is a
// `--ds-z-index-*` band, a `--ds-font-weight-*` step, a `--ds-breakpoint-*`
// step, a `--ds-posture-*` channel or a `--ds-motion-*` role that had no
// resting value; bithire adds four more because a `flat` posture now states
// the whole 0..6 elevation ladder and the border weight it implies instead of
// levels 1..3. 18 existing values moved on all three, all of them the named
// ramp: `--ds-text-*` size and leading now carry `var(--ds-type-scale, 1)` and
// each entry is expressed on its own facets instead of repeating the same
// literals. At the default scale of 1 the ramp computes byte-identically --
// the change is that a tenant's `typography.scale` finally reaches it.
// ONE-AUTHORITY re-anchor, ROTTAY ONLY: the baseline authored
// `chrome.table.cellFontSize` as `calc(var(--ds-text-body-size) *
// var(--ds-type-scale, 1))`, which applied the type dial twice once
// `--ds-text-body-size` started carrying it. It now reads the channel plain.
// Measured rather than asserted: the keyset is byte-identical across the edit
// (227961786ff66844..., 1315 base keys plus the same 3-key mode block on both
// sides, none added, none removed) and exactly ONE value moved, the
// `--ds-table-cell-font-size` above; the committed rottay facade artifact
// diff is that single line. bithire authors the same field over a literal
// seed, so it applies the dial once and did not move; evnto does not author
// it. Neither is re-anchored.
// SHAPE-OVER-DERIVED re-anchor, all three: the two blocks above are
// independent, so the tree that carries both lands on neither of their values.
// The SHAPE half stays ORDER-ONLY on top of the derived families, measured on
// the tree that carries both: the emitted keyset is exactly the derived-family
// keyset (rottay 1315, bithire 1291, evnto 592, none added, none removed), and
// the three committed first-party facade artifacts -- which ARE this leg's
// projection -- are byte-identical to the derived-family tree's. Only
// `cssString` moves, and only in the order its lines appear, because the
// `shape` family sits earlier in the deriver registry than the `surfaces` and
// `axes` families it took the radius operands from.
// PALETTE re-anchor, all three (WO-DER-03 palette half): the base keyset moves
// by exactly -8 in every vertical -- rottay 1315 -> 1307, bithire 1291 -> 1283,
// evnto 592 -> 584 -- and the -8 is the same -10/+2 everywhere. The ten that
// leave are `--ds-color-accent-{50..900}`, a ramp with no `var()` reader
// anywhere in the package; the two that arrive are `--ds-color-neutral-ink` and
// `--ds-color-neutral-paper`, the monochrome ramp's own anchors, read by
// `foundation/monochrome`. No surviving channel changes value: this is a
// keyset move, not a paint move.
// ON-PRIMARY FLOOR re-anchor, all three: ORDER-ONLY, and
// measured as such. `--ds-color-text-on-primary` gained a derived floor under
// the authored value, so the channel is now first declared by the interaction
// floor instead of by the extended-palette writer that overwrites it, and
// `emitThemeCss` keeps a channel where it was first declared. An
// order-insensitive digest over the same three surfaces -- base map, mode-block
// maps and colorScheme, keys sorted -- is byte-identical across the edit:
// rottay 165ebd18e98090078bbed6f32326691d03d3acc948c63a891f1bf47fb7ae21ec,
// bithire 93abf144ed88c172354f4711888562a7afb586535ff1336f8e9eaec3d6f949c8,
// evnto bdc4f4f6759108e79084f89afea86b92de7094bb00b22e23ad93f7b32a3a6fb2 on
// both sides, with the base keysets unchanged at 1307 / 1283 / 584. The three
// committed facade artifacts emit sorted, so all three stayed byte-identical
// under `build:vertical-artifacts --check`.
/**
 * WO-INV-04 re-anchored `bithire` ONLY: the one channel that moved is
 * `--ds-command-home-console-min-height`, whose authored value moved off the
 * static viewport unit onto `calc(100dvh - 108px)` with the rest of the
 * dynamic-viewport migration. `rottay` and `evnto` declare no viewport-unit
 * channel and keep the digests they had, which is what makes this a
 * one-channel move rather than a re-baseline.
 */
/**
 * WO-FAM-01 re-anchored all three, ADDITIVE plus two intentional value moves,
 * measured: the five family-cut derivers add rottay 1307 -> 1357 base keys
 * (+50), bithire 1283 -> 1355 (+72), evnto 584 -> 649 (+65), removed 0; every
 * added key is a `--ds-{button,checkbox,radio,toggle,segmented}-*` relation.
 * The only moved values are rottay's radio and toggle descriptions, now the
 * secondary ink in both modes, so the light block no longer restates them.
 */
/**
 * WO-FAM-02 re-anchored all three, ADDITIVE plus one rename, measured: the eight
 * field family derivers add rottay 1357 -> 1469 base keys, bithire 1355 -> 1485,
 * evnto 649 -> 786, moved 0; every added key is a `--ds-{input,textarea,
 * password-input,otp-input,tag-input,input-number,form-field,form}-*` relation.
 * rottay's twelve authored `--ds-inputnumber-*` keys (and their light-block
 * twins) now emit as `--ds-input-number-*` with the same values.
 */
/**
 * WO-FAM-03 re-anchored all three, ADDITIVE plus three renames, measured: the
 * nine selection family derivers add rottay 1469 -> 1683 base keys, bithire
 * 1485 -> 1737, evnto 786 -> 1038, moved 0; every added key is a `--ds-{select,
 * auto-complete,cascader,tree-select,mentions,transfer,date-picker,time-picker,
 * color-picker}-*` relation. rottay's thirty-one authored `--ds-autocomplete-*`,
 * `--ds-datepicker-*` and `--ds-timepicker-*` keys (and their light-block twins)
 * now emit under the family namespaces with the same values, and bithire's
 * `--ds-timepicker-panel-shadow` emits as `--ds-time-picker-panel-shadow`.
 */
/**
 * WO-FAM-03 compatibility re-anchored all three, measured: rottay restates its
 * twenty-nine authored `--ds-{autocomplete,datepicker,timepicker}-*` values
 * under the pre-cut names the frozen skins read (base 1683 -> 1712, and the
 * light block's twins), moved 0; bithire and evnto change key order only, as
 * `--ds-datepicker-panel-shadow` is now written after the chrome blocks.
 */
/**
 * WO-FAM-04 re-anchored all three, ADDITIVE, measured: the twelve overlay and
 * feedback family derivers add rottay 1712 -> 2092 base keys, bithire 1737 ->
 * 2133, evnto 1038 -> 1449, removed 0, moved 0; every added key is a
 * `--ds-{modal,drawer,sheet,alert-dialog,confirm-dialog,popover,dropdown,
 * hover-card,tooltip,tour,notifier,alert}-*` relation. The authored message and
 * notification chrome now also emits as `--ds-notifier-{message,notification}-*`
 * (rottay's light block 697 -> 704 carries the seven twins), with the pre-cut
 * names the frozen skins read restated at the same values.
 */
/**
 * TOGGLE SILHOUETTE re-anchored all three, ADDITIVE, measured (04e835647,
 * `fix(toggle): let the shape decision govern the track and thumb radius`):
 * the toggle deriver now emits `--ds-toggle-track-border-radius` and
 * `--ds-toggle-dot-border-radius`, a pill unless the theme states a
 * `surfaces.buttonStyle`, and no first-party theme states one, so all three
 * carry `var(--ds-radius-full)`. Base keys rottay 2096 -> 2098, bithire
 * 2137 -> 2139, evnto 1453 -> 1455, removed 0, moved 0; every mode block is
 * byte-identical (rottay light 704, bithire dark 441, evnto dark 89 keys).
 * Withdrawing exactly those two deriver rows on an isolated copy of the tree
 * and recompiling returns all three digests to the previous pins byte for byte
 * (ca0a6c20..., 68f0be02..., 3bfe8d96...), which is only possible if nothing
 * else moved; and the moved digests are identical on 04e835647, 7314b2dbb,
 * da95cf1b3 and d7d1aba2a, so no later change is folded into this move.
 */
// PROVENANCE-CHANNEL re-anchor, rottay and bithire only, SUBTRACTIVE-ONLY and
// measured rather than asserted. The governed selection ids stopped being
// emitted as CSS channels -- a selection is data, and the runtime payload
// (`recipeProfile`, `experienceProfile`, still members of this digest) carries
// it -- so the emitted KEYSET lost exactly the provenance channels each theme
// authored: rottay 2180 -> 2179 (`--ds-recipe-profile`), bithire 2230 -> 2228
// (`--ds-recipe-profile`, `--ds-experience-profile`). evnto authors neither
// selection, emitted neither channel, and its digest is unchanged. Measured
// with every other producer at its committed state, eabf62987: that commit
// (the menu chrome deriver) had moved the keyset rottay 2098 -> 2180, bithire
// 2139 -> 2230, evnto 1455 -> 1547 without re-anchoring these pins, so the
// starting digests are the ones measured on eabf62987 itself (rottay
// d2447215…, bithire a2bedc6a…, evnto 815bc4b2…), and restoring the two
// emissions on that tree reproduces them byte for byte.
// ELEVATION-KEYLINE re-anchor, bithire only, SUBTRACTIVE-ONLY and measured.
// `--ds-elevation-border-style` was retired with its producers (nothing read
// it), and bithire is the one first-party theme whose `flat` posture emitted
// it: bithire 2380 -> 2379, rottay and evnto unchanged. Measured with every
// other producer at its committed state, a054f8972: the navigation family cuts
// (011910356) had moved the keyset rottay 2179 -> 2350, bithire 2228 -> 2380,
// evnto 1547 -> 1760 without re-anchoring these pins, so rottay and evnto are
// pinned at the digests measured on a054f8972 itself (c7223694…, b758de6e…) and
// bithire's starting digest there is d6546f8a…; restoring the two map entries
// on that tree reproduces it byte for byte.
// WO-FAM-05 LOT 2 attribution (2026-09-15), the per-cut measurement the two
// rows above lean on when they say the navigation cuts "moved the keyset
// without re-anchoring": 011910356 is ADDITIVE ONLY and measured rather than
// asserted. The tabs, breadcrumb and pagination chrome derivers add rottay
// 2179 -> 2350 base keys (+171: tabs 95, breadcrumb 39, pagination 37), bithire 2228 -> 2380 (+152:
// tabs 78, breadcrumb 32, pagination 42), evnto 1547 -> 1760 (+213: tabs 128, breadcrumb 43, pagination 42); removed 0, values
// moved 0, every mode block byte-identical (rottay light 704, bithire dark 441,
// evnto dark 89 keys) and cssString grows by exactly the added keys. Withdrawing
// the four files the cut added under `derivation` (chrome/tabs,
// chrome/breadcrumb, chrome/pagination and their registry lines) on an isolated
// copy of that tree returns all three digests to the PROVENANCE-CHANNEL pins
// byte for byte (f2eaf241…, 1392ba2a…, 815bc4b2…) and that copy passes this
// suite; the cut's parent (82ba19fdb) measures those same pins, so nothing
// between them moved. The menu cut (eabf62987, +82/+91/+92 keys, all
// `--ds-menu-*`) is likewise parent-exact against 73c6e9195.
const LEG_A_SURFACE_DIGEST: Record<string, string> = {
  rottay: "c7223694115e1a36504401b43426dde79d69b8a081a104f7b392e64a8966e0d0",
  bithire: "e384038826da0c9147fa0d9fe94b07bb66aae0052084545efc4f5d8ed3677600",
  evnto: "b758de6e74775dbcd0ef28bcac68d9a51698407560dc2899d7b33ad2fc4bb455",
};

/**
 * The re-anchor's own evidence: the aliases the surface now carries. Without
 * this a future re-anchor could restate a number with no way to see whether the
 * cause was the compaction this file guards or something else entirely.
 */
const CASCADE_ROOT_ALIASES: Record<string, ReadonlyArray<readonly [string, string]>> = {
  rottay: [["--ds-layout-bg", "var(--ds-color-bg-primary)"]],
  bithire: [["--ds-button-primary-bg", "var(--ds-color-primary)"]],
  evnto: [["--ds-layout-bg", "var(--ds-color-bg-primary)"]],
};

/** Every own key of a role, materialized with no value — the bridge skeleton. */
const ROLE_SKELETON: SemanticTypographyRoleTokens = {
  fontFamily: undefined,
  fontSize: undefined,
  fontWeight: undefined,
  lineHeight: undefined,
  letterSpacing: undefined,
  textTransform: undefined,
  fontVariantNumeric: undefined,
};

type Compiled = ReturnType<typeof lowerBrandThemeFixture>;

function legA(brandTheme: FirstPartyBrandTheme): Compiled {
  return lowerBrandThemeFixture({ brandTheme, tenantSlug: brandTheme.id });
}

/**
 * Leg B still means something with one lowering left: both legs call the same
 * door, so the comparison now isolates the ISO NORMALIZER. Leg A lifts the
 * authored theme wrap-only; leg B routes it through `brandThemeToTheme`, which
 * also completes shapes and materializes declared keys. Identical digests are
 * the proof that completion changes no compiled byte.
 */
function legB(brandTheme: FirstPartyBrandTheme): Compiled {
  const slug = brandTheme.id;
  // The normalizer's own output, lowered directly. It cannot go through the
  // intent door: the door reads the roster, so it would compare the roster's
  // theme to itself instead of comparing the two lifts.
  const compiled = compileTheme(
    { theme: brandThemeToTheme(brandTheme), provenance: EMPTY_PROVENANCE },
    resolveAdapter("modern")
  );
  return {
    cssVariables: { ...compiled.cssVariables },
    cssString: emitThemeCss(compiled, containerScope(brandTenantSelector(slug))),
    personality: compiled.runtime.personality,
    tokenOverrides: compiled.runtime.tokenOverrides,
    ...(compiled.runtime.recipeProfile
      ? { recipeProfile: compiled.runtime.recipeProfile }
      : {}),
    ...(compiled.runtime.experienceProfile
      ? { experienceProfile: compiled.runtime.experienceProfile }
      : {}),
    ...(compiled.colorScheme ? { colorScheme: compiled.colorScheme } : {}),
    ...(compiled.modeBlocks.length > 0 ? { modeBlocks: compiled.modeBlocks } : {}),
  };
}

function stable(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    const ordered: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      ordered[key] = stable((value as Record<string, unknown>)[key]);
    }
    return ordered;
  }
  return value;
}

function surfaceDigest(compiled: Compiled): string {
  return createHash("sha256")
    .update(
      JSON.stringify(
        stable({
          cssVariables: compiled.cssVariables,
          cssString: compiled.cssString,
          colorScheme: compiled.colorScheme ?? null,
          modeBlocks: compiled.modeBlocks ?? null,
          personality: compiled.personality,
          tokenOverrides: compiled.tokenOverrides,
          recipeProfile: compiled.recipeProfile ?? null,
          experienceProfile: compiled.experienceProfile ?? null,
        })
      )
    )
    .digest("hex");
}

function typeChannels(compiled: Compiled): Record<string, string> {
  const channels: Record<string, string> = {};
  for (const [name, value] of Object.entries(compiled.cssVariables)) {
    if (name.startsWith("--ds-type-")) channels[name] = value;
  }
  return channels;
}

/** Every variable the compile emits: the base block plus every mode block. */
function everyEmittedEntry(compiled: Compiled): Array<[string, string]> {
  const entries = Object.entries(compiled.cssVariables);
  for (const block of compiled.modeBlocks ?? []) {
    entries.push(...Object.entries(block.cssVariables));
  }
  return entries;
}

type OrderedDiff = {
  index: number;
  legA: string | undefined;
  legB: string | undefined;
};

/**
 * Positional — ORDER-SENSITIVE — difference between two ordered lists. `toEqual`
 * on the compiled containers is deliberately order-insensitive and proves the
 * two legs carry the same channels and the same values; this is the complement
 * that sees the one thing `toEqual` cannot: authored emission order.
 */
function orderedDiff(
  fromLegA: readonly string[],
  fromLegB: readonly string[]
): OrderedDiff[] {
  const diff: OrderedDiff[] = [];
  const length = Math.max(fromLegA.length, fromLegB.length);
  for (let index = 0; index < length; index += 1) {
    if (fromLegA[index] !== fromLegB[index]) {
      diff.push({ index, legA: fromLegA[index], legB: fromLegB[index] });
    }
  }
  return diff;
}

/** The emitted lines as a multiset: equal here means an order-only move. */
function sortedLines(css: string): string[] {
  return css.split("\n").sort();
}

/** Own key order of one authored mode block. */
function modeBlockKeys(compiled: Compiled, mode: string): string[] {
  const block = (compiled.modeBlocks ?? []).find(
    (entry) => entry.mode === mode
  );
  return Object.keys(block?.cssVariables ?? {});
}

/** True when this css line declares exactly `channel`. */
function declares(line: string | undefined, channel: string): boolean {
  return (line ?? "").trim().startsWith(`${channel}:`);
}

/** One authored source block, addressed by path. */
function authoredBlock(
  brandTheme: FirstPartyBrandTheme,
  path: readonly string[]
): Record<string, unknown> {
  let cursor: unknown = brandTheme;
  for (const step of path) cursor = (cursor as Record<string, unknown>)[step];
  return cursor as Record<string, unknown>;
}

/** Own key order of an authored source block. */
function authoredKeys(
  brandTheme: FirstPartyBrandTheme,
  path: readonly string[]
): string[] {
  return Object.keys(authoredBlock(brandTheme, path));
}

/**
 * Re-authors one nested source block with the SAME keys and the SAME values in
 * a different order — a permutation that changes nothing but authoring order.
 */
function withRotatedBlock(
  brandTheme: FirstPartyBrandTheme,
  path: readonly string[]
): FirstPartyBrandTheme {
  const clone = structuredClone(brandTheme) as unknown as Record<
    string,
    unknown
  >;
  let owner = clone;
  for (const step of path.slice(0, -1)) {
    owner = owner[step] as Record<string, unknown>;
  }
  const leaf = path[path.length - 1];
  const block = owner[leaf] as Record<string, unknown>;
  const keys = Object.keys(block);
  const rotated: Record<string, unknown> = {};
  for (const key of [...keys.slice(1), keys[0]]) rotated[key] = block[key];
  owner[leaf] = rotated;
  return clone as unknown as FirstPartyBrandTheme;
}

describe("semantic typography roles", () => {
  it("emits complete defaults and accepts bounded first-party role overrides", () => {
    const compiled = lowerBrandThemeFixture({
      tenantSlug: "type-proof",
      brandTheme: {
        id: "type-proof",
        name: "Type proof",
        typography: {
          roles: {
            pageTitle: { fontSize: "1.75rem", fontWeight: 650 },
            numeric: { fontFamily: "var(--ds-font-family-mono)" },
          },
        },
      },
    });

    expect(compiled.cssVariables).toMatchObject({
      "--ds-type-display-font-family":
        "var(--ds-font-family-display, var(--ds-font-family-heading))",
      "--ds-type-page-title-font-size": "1.75rem",
      "--ds-type-page-title-font-weight": "650",
      "--ds-type-body-font-family": "var(--ds-font-family-base)",
      "--ds-type-code-font-family": "var(--ds-font-family-mono)",
      "--ds-type-numeric-font-family": "var(--ds-font-family-mono)",
      "--ds-type-numeric-font-variant-numeric": "tabular-nums lining-nums",
      "--ds-type-page-title":
        "var(--ds-type-page-title-font-weight) var(--ds-type-page-title-font-size)/var(--ds-type-page-title-line-height) var(--ds-type-page-title-font-family)",
    });
  });
});

describe("cross-lowering equality of the first-party themes", () => {
  for (const [slug, brandTheme] of FIRST_PARTY) {
    // T1 — the family the bridge skeleton reaches, channel by channel.
    it(`${slug}: every --ds-type-* channel is identical in both lowerings`, () => {
      expect(typeChannels(legB(brandTheme))).toEqual(
        typeChannels(legA(brandTheme))
      );
    });

    // T2 — the whole artifact, not just the family under repair. Any residual
    // here is a SECOND defect, not a tolerable gap: it fails, it is not pinned.
    it(`${slug}: the complete compiled surface is identical in both lowerings`, () => {
      const a = legA(brandTheme);
      const b = legB(brandTheme);
      expect(b.cssVariables).toEqual(a.cssVariables);
      expect(b.cssString).toBe(a.cssString);
      expect(b.colorScheme).toBe(a.colorScheme);
      expect(b.modeBlocks ?? null).toEqual(a.modeBlocks ?? null);
    });

    // T6 — the static path is untouched by the compaction (zero pixel).
    it(`${slug}: the leg-A surface digest is unchanged by the compaction`, () => {
      expect(surfaceDigest(legA(brandTheme))).toBe(LEG_A_SURFACE_DIGEST[slug]);
      // The re-anchor is only legible while its stated cause is still true.
      for (const [channel, alias] of CASCADE_ROOT_ALIASES[slug]) {
        expect(legA(brandTheme).cssVariables[channel]).toBe(alias);
      }
    });

    // T5 — permanent tripwire. `String(undefined)` must never reach a value,
    // in either lowering, in the base block or in any mode block.
    it(`${slug}: no compiled value is the literal string "undefined"`, () => {
      for (const compiled of [legA(brandTheme), legB(brandTheme)]) {
        const leaked = everyEmittedEntry(compiled)
          .filter(([, value]) => value === "undefined")
          .map(([name]) => name);
        expect(leaked).toEqual([]);
      }
    });
  }
});

/**
 * M3 — the authored-order law.
 *
 * The residual above is an ORDER defect, so the tripwire that guards it has to
 * be able to see authored order. This law states the asymmetry directly, on a
 * synthetic permutation of the source that changes no key and no value:
 *   - leg B is byte-INVARIANT under it, because the ISO bridge re-materializes
 *     the canonical shape and discards authoring order;
 *   - leg A DEVIATES under it, because the static transport carries authoring
 *     order straight through to the emitted css.
 * That asymmetry is exactly what makes an order-only source edit able to move
 * the leg-A digest while moving no pixel, and it is what a future change to the
 * merge machinery must not silently repeal. Both directions are asserted, so
 * the law fails if leg B starts leaking order AND if leg A stops carrying it.
 *
 * The permutation is applied through the same `withRotatedBlock` /
 * `orderedDiff` / `sortedLines` helpers the residual law enforces through, so a
 * mutant planted in any of them is causal for both.
 */
describe("authored-order law", () => {
  const ROTATED_BLOCK = ["chrome", "tooltip"] as const;

  it("a source permutation changes authoring order and nothing else", () => {
    const permuted = withRotatedBlock(rottayBrandTheme, ROTATED_BLOCK);
    const before = authoredKeys(rottayBrandTheme, ROTATED_BLOCK);
    const after = authoredKeys(permuted, ROTATED_BLOCK);

    expect(after).not.toEqual(before);
    expect([...after].sort()).toEqual([...before].sort());
    expect(authoredBlock(permuted, ROTATED_BLOCK)).toEqual(
      authoredBlock(rottayBrandTheme, ROTATED_BLOCK)
    );
  });

  it("leg B is byte-invariant under a source permutation", () => {
    const base = legB(rottayBrandTheme);
    const permuted = legB(withRotatedBlock(rottayBrandTheme, ROTATED_BLOCK));

    expect(permuted.cssString).toBe(base.cssString);
    expect(Object.keys(permuted.cssVariables)).toEqual(
      Object.keys(base.cssVariables)
    );
    expect(surfaceDigest(permuted)).toBe(surfaceDigest(base));
  });

  it("leg A carries the permutation, and the deviation is order-only", () => {
    const base = legA(rottayBrandTheme);
    const permuted = legA(withRotatedBlock(rottayBrandTheme, ROTATED_BLOCK));

    // Detected: the static transport moved.
    expect(
      orderedDiff(
        Object.keys(base.cssVariables),
        Object.keys(permuted.cssVariables)
      )
    ).not.toEqual([]);
    expect(surfaceDigest(permuted)).not.toBe(surfaceDigest(base));

    // ...and moved by order ALONE — same lines, same channels, same values.
    expect(sortedLines(permuted.cssString)).toEqual(sortedLines(base.cssString));
    expect(permuted.cssVariables).toEqual(base.cssVariables);
    expect(permuted.modeBlocks ?? null).toEqual(base.modeBlocks ?? null);
  });
});

describe("present-with-undefined role keys", () => {
  // T3 — a materialized key with no value must not participate in the merge:
  // it neither emits "undefined" nor deletes the default it sits on top of,
  // while a key that DOES carry a value still wins.
  it("falls through to the default and still lets an authored value win", () => {
    const control = lowerBrandThemeFixture({
      tenantSlug: "skeleton-control",
      brandTheme: { id: "skeleton-control", name: "Control" },
    }).cssVariables;

    const skeletal = lowerBrandThemeFixture({
      tenantSlug: "skeleton-probe",
      brandTheme: {
        id: "skeleton-probe",
        name: "Probe",
        typography: {
          roles: {
            pageTitle: { ...ROLE_SKELETON, fontWeight: 650 },
            body: { ...ROLE_SKELETON },
          },
        },
      },
    }).cssVariables;

    expect(
      Object.entries(skeletal).filter(([, value]) => value === "undefined")
    ).toEqual([]);

    // The default font-size survives an all-undefined authored role.
    expect(skeletal["--ds-type-page-title-font-size"]).toBe(
      control["--ds-type-page-title-font-size"]
    );
    expect(skeletal["--ds-type-page-title-font-size"]).toBeDefined();
    expect(skeletal["--ds-type-page-title-line-height"]).toBe(
      control["--ds-type-page-title-line-height"]
    );
    // `body` declares no default font-size, so the channel stays unemitted
    // rather than being emitted with a placeholder.
    expect("--ds-type-body-font-size" in skeletal).toBe(
      "--ds-type-body-font-size" in control
    );
    // A key that carries a value still overrides the default.
    expect(skeletal["--ds-type-page-title-font-weight"]).toBe("650");
    expect(skeletal["--ds-type-page-title-font-weight"]).not.toBe(
      control["--ds-type-page-title-font-weight"]
    );
  });

  // T4 — the label-case regression. `labelStyle` is authored one level above
  // `typography.roles.label`; a skeletal label role must not stomp it. This is
  // the mechanical counterfactual: compacting only the role emitter leaves this
  // red, because the value is destroyed in the caller before the emitter runs.
  it("keeps an authored labelStyle when the label role arrives as a skeleton", () => {
    const probe = lowerBrandThemeFixture({
      tenantSlug: "label-case-probe",
      brandTheme: {
        id: "label-case-probe",
        name: "Label case probe",
        typography: {
          labelStyle: "capitalize",
          roles: { label: { ...ROLE_SKELETON } },
        },
      },
    }).cssVariables;

    expect(probe["--ds-type-label-text-transform"]).toBe("capitalize");

    // ...and an explicitly authored role value still outranks labelStyle.
    const explicit = lowerBrandThemeFixture({
      tenantSlug: "label-case-explicit",
      brandTheme: {
        id: "label-case-explicit",
        name: "Label case explicit",
        typography: {
          labelStyle: "capitalize",
          roles: { label: { ...ROLE_SKELETON, textTransform: "uppercase" } },
        },
      },
    }).cssVariables;

    expect(explicit["--ds-type-label-text-transform"]).toBe("uppercase");
  });

  // T4 (first-party leg): evnto authors `labelStyle: "capitalize"`, so the
  // channel is a live regression surface for the real artifact, in both legs.
  it("evnto emits its authored capitalize label case in both lowerings", () => {
    expect(legA(evntoBrandTheme).cssVariables["--ds-type-label-text-transform"]).toBe(
      "capitalize"
    );
    expect(legB(evntoBrandTheme).cssVariables["--ds-type-label-text-transform"]).toBe(
      "capitalize"
    );
  });
});
