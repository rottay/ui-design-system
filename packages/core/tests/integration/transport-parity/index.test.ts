/**
 * Transport parity: one decision, four transports, compared as BYTES
 * (rubric J.4 and J.5).
 *
 * WHAT ALREADY EXISTS, AND IS NOT REPEATED HERE. The VOCABULARY relation
 * between the static and DB paths is owned by
 * `compilers/composition/tenant-theme/tests/static-db-channel-vocabulary.test.ts`:
 * every channel the DB path emits in the shared core families is also emitted
 * by the static path. That file answers "do the two paths speak the same
 * language". It does not answer "does the same sentence produce the same
 * value", which is the question J.4 and J.5 ask and the one a customer
 * discovers the hard way.
 *
 * SCOPE: ONE VERTICAL. Every arm runs on `bithire` (`VERTICAL` below). Parity
 * is a relation between four transports of the SAME document, which one
 * vertical demonstrates; a divergence that appears only under another
 * vertical's envelope or default mode -- rottay's is dark, and the mode a
 * decision lands in follows it -- is outside what this file measures.
 *
 * THE FOUR TRANSPORTS, each the real productive door:
 *
 *   static    a code-owned `FlatTheme` with the decision's own
 *             `keypath.brandTheme` set, through `draftPreviewThemeIntent`
 *   document  the persisted v2 row, through `documentThemeIntent`
 *   preview   the same unsaved row, through `previewThemeIntent`
 *   publish   the artifact `compileTenantThemeDocumentV2` writes
 *
 * THE FOUR LAWS, in the order they have to hold:
 *
 *   0  NON-VACUITY. The document arm must MOVE at least one channel against
 *      the vertical's own baseline. Parity between two transports that both
 *      changed nothing is the cheapest green in this repository, and it is
 *      exactly the shape of green F-23 found.
 *   1  J.4 static = DB. On every channel the document arm moved, the static
 *      arm produces the byte-identical value -- once the two arms carry the
 *      same AUTHORSHIP. See `PRECEDENCE` below: making them carry it is the
 *      finding, not a workaround.
 *   2  J.5 preview = document. Byte-identical across the WHOLE map, not only
 *      the moved set: a preview that showed a tenant a different number from
 *      the one publish will store is the defect, wherever it appears. The
 *      variable map ALONE would be close to tautological here -- both doors
 *      build their patch through the same `admitDocument`, and the map is a
 *      function of (baseline, patch) -- so the law is stated on the three
 *      things the ORIGIN can still change: tenant authorship, the moved delta,
 *      and the map. Measured: mutating `isTenantAuthoredOrigin` leaves the map
 *      identical and moves the other two, which is exactly why they are here.
 *   3  J.5 publish = preview. The artifact is a DELTA, so the law is a set
 *      equality plus a value equality: its key set is exactly the moved set,
 *      and every value is byte-identical to the preview's.
 *
 * THE ASYMMETRY THIS FILE MEASURED, AND WHY IT IS NOT A DEFECT. A document
 * carries only what its tenant selected. A FlatTheme draft carries the WHOLE
 * theme, so where the vertical states the derived leaf EXPLICITLY the explicit
 * leaf outranks the posture that would derive it: `typography.pairing` cannot
 * move a family bithire names. Measured on this tree, not predicted: 2 of 4
 * moved channels.
 *
 * D6-2c-ii (2026-09-15): tenant-document compiles over neutral + preset, so the
 * composed bithire baseline states only what its preset document decides. Three
 * rows lost their competing leaves and therefore their asymmetry -- the two
 * palette postures named `palette.linkColor`, `palette.linkHoverColor` and
 * `palette.borderFocusColor`, which the composed baseline does not carry at all,
 * and `navigation.sidebar-tone` named `chrome.sidebar`, whose only remaining
 * leaves are the anatomy and the tone the decision itself sets. Measured, both
 * directions: 4 rows with an asymmetry -> 1.
 *
 * That is a precedence fact about authoring, and the honest way to state it is
 * to PROVE it rather than baseline it. Each declaring row lists the competing
 * leaves in `PRECEDENCE`, and each row is asserted twice: with the leaves
 * AUTHORED the named channels MUST diverge (so the ledger cannot be
 * decorative), and with them merely carried from the preset the arms MUST be
 * byte-identical on every moved channel. A row whose precedence entry stopped being true fails in the first
 * direction; a row that drifts fails in the second.
 *
 * DRIVEN OFF THE CATALOG, ACCOUNTED FOR IN BOTH DIRECTIONS. `CASES` must name
 * every row that declares a `css-channels` effect on both keypaths -- either
 * with the value to drive it, or with a written reason. A new dual-transport
 * decision fails this file until its parity is proven or its absence argued.
 */
import { describe, expect, it } from "vitest";

import {
  THEME_CONTROL_CATALOG,
  type ThemeControlRow,
} from "@/contracts/theme/runtime/catalog";
import type { TenantThemeDocumentV2 } from "@/contracts/theme/presentation/document";
import type { FlatTheme } from "@/foundation/contracts/composition/tenants/themes";
import { compileTenantThemeDocumentV2 } from "@/infrastructure/compilers/composition/tenant-theme/document-v2";
import { compileThemeIntent } from "@/infrastructure/compilers/runtime/theme";
import {
  documentThemeIntent,
  draftPreviewThemeIntent,
  previewThemeIntent,
  staticThemeIntent,
} from "@/infrastructure/compilers/runtime/theme/runtime/ingress";
import { firstPartyFixture } from "@tests/support/theme-lowering";

const bithireFlatTheme = firstPartyFixture('bithire');

const VERTICAL = "bithire" as const;
const SLUG = "transport-parity-probe";

type Case = { value: unknown } | { skip: string };

/**
 * One value per dual-transport row, or the reason the row cannot be driven as
 * a single leaf.
 *
 * The values are not generated from the domain, and the two reasons are not
 * hypothetical. A generated "first enum value" is often the vertical's own
 * baseline, which moves nothing and turns law 0 into the vacuous green it
 * exists to refuse. And a generated scale endpoint lands outside the envelope:
 * the catalog bounds `typography.scale` at 0.9..1.1 while bithire's envelope
 * admits 0.92..1.08, and it bounds `surfaces.effect-intensity` at 0..1 while
 * bithire admits 0..0.65 -- so the catalog's own maxima are REFUSED here.
 * Measured, not predicted. Each value below is inside bithire's envelope and
 * MOVES.
 *
 * D6-2c-ii (2026-09-15): tenant-document compiles over neutral + preset, and
 * bithire's preset document DECIDES nine of these rows, so nine values that used
 * to move against the authored theme ARE the baseline now and move nothing. Each
 * was re-anchored on a value measured to move -- the same rule the paragraph
 * above states, applied to the new baseline, not a regression:
 * `palette.contrast-posture` high -> soft (0 -> 15 channels),
 * `typography.role-weights` strong -> light (0 -> 7),
 * `typography.numeric` tabular -> proportional (0 -> 9),
 * `shape.nesting` uniform -> concentric (0 -> 2),
 * `shape.button-style` sharp -> soft (0 -> 6),
 * `surfaces.border-style` strong -> none (0 -> 3),
 * `states.emphasis` strong -> subtle (0 -> 6),
 * `navigation.sidebar-tone` inverse -> strong (0 -> 5),
 * `responsive.posture` compact -> balanced (0 -> 4).
 */
const CASES: Readonly<Record<string, Case>> = {
  "palette.neutral-temperature": { value: "warm" },
  "palette.contrast-posture": { value: "soft" },
  "typography.pairing": { value: "editorial" },
  "typography.scale": { value: 1.08 },
  "typography.role-weights": { value: "light" },
  "typography.numeric": { value: "proportional" },
  "shape.radius-scale": { value: 1.15 },
  "shape.nesting": { value: "concentric" },
  "shape.button-style": { value: "soft" },
  "shape.control-height": { value: "tall" },
  "density.mode": { value: "spacious" },
  "spacing.rhythm": { value: "airy" },
  "surfaces.elevation-posture": { value: "elevated" },
  "surfaces.border-style": { value: "none" },
  "surfaces.effect-intensity": { value: 0.6 },
  "states.emphasis": { value: "subtle" },
  "states.focus-style": { value: "glow" },
  "motion.character": { value: "playful" },
  "navigation.sidebar-tone": { value: "strong" },
  "responsive.posture": { value: "balanced" },
  "palette.seeds": {
    skip:
      "the keypath names four colour leaves at once and a seed change re-derives the whole ramp through the APCA " +
      "admission; its parity is a palette question, and the by-axis probe excludes colour for the same reason",
  },
  "palette.status-seeds": {
    skip: "four status leaves at once, and the same APCA admission applies; not a single-leaf transport case",
  },
  "palette.dark-mode": {
    skip:
      "the brandTheme keypath is `modes.dark.palette.*` — a whole second ramp, not a leaf; the transports are " +
      "compared on the ramp it publishes, which is the mode-block question F-73 owns",
  },
  "typography.families": {
    skip: "four font-family leaves at once, each gated by the font-pack registry rather than by a value domain",
  },
  "motion.dial": {
    skip: "a three-key record (intensity, durationScale, ambient); each key is a separate leaf with its own clamp",
  },
  "experience.profile": {
    skip:
      "locked-by-default (D-28 b): the vertical's product posture, not a tenant taste axis, so a tenant document " +
      "cannot author it and there is no tenant transport to compare",
  },
  // `recipe-profile` was removed from this table: its catalog row declares
  // `effect: "data-only"`, so it is not a dual-transport CSS row at all and
  // this suite's law -- byte parity of emitted channels -- has no subject for
  // it. Its transports are proven where they do land, on the governed runtime
  // block, by `provider/tests/recipe-profile.integration`.
  "profiles.expressive": {
    skip: "a six-key record composed into postures; a single key would measure the composition, not the transports",
  },
};

/**
 * Rows whose decision a FlatTheme can also say a SECOND way, with the leaves
 * that outrank it.
 *
 * Every entry is a measurement, and an entry that stopped being one is removed
 * rather than kept as decoration -- law 1b asserts the divergence is REAL, so a
 * dead entry fails the file in the first direction.
 *
 * D6-2c-ii (2026-09-15): tenant-document compiles over neutral + preset, so the
 * composed bithire baseline carries only what its preset decides, and three
 * entries lost their subject (measured: each outranked 0 channels where it had
 * outranked 6):
 *   palette.neutral-temperature, palette.contrast-posture
 *     named `palette.linkColor`, `palette.linkHoverColor` and
 *     `palette.borderFocusColor`, none of which the composed baseline carries,
 *     and `chrome.controls`, which survives only as empty sections.
 *   navigation.sidebar-tone
 *     named `chrome.sidebar`, whose remaining leaves are the anatomy and the
 *     tone the decision itself sets, so clearing and setting are one act.
 * `typography.pairing` keeps its entry: an AUTHORED face still outranks the
 * pairing. `typography.fontFamilyDisplay` left the list with the others: the
 * composed baseline does not carry it.
 *
 * Adjudication #2 (2026-09-15): the outranking arm now AUTHORS a face distinct
 * from the preset's instead of leaving the carried one in place. The draft door
 * states the leaves the editor moved, so a carried face is the vertical's own
 * and outranks nothing -- which is the precedence this file measures, applied to
 * the transport that restates what it never touched.
 */
const PRECEDENCE: Readonly<Record<string, readonly string[]>> = {
  "typography.pairing": [
    "typography.fontFamilyBase",
    "typography.fontFamilyHeading",
    "typography.fontFamilyMono",
  ],
};

const dualTransportRows: readonly ThemeControlRow[] = THEME_CONTROL_CATALOG.filter(
  (row) =>
    row.effect === "css-channels" &&
    row.keypath.document !== null &&
    row.keypath.brandTheme !== null
);

const v2 = (decisions: Record<string, unknown>): TenantThemeDocumentV2 =>
  ({ version: 2, plan: "pro", decisions }) as TenantThemeDocumentV2;

/**
 * A real FlatTheme draft carrying the decision, with the competing explicit
 * leaves optionally cleared so the two arms carry the same authorship.
 */
function draftWith(
  keypath: string,
  value: unknown,
  outrank: readonly string[] = []
): FlatTheme {
  const draft = JSON.parse(JSON.stringify(bithireFlatTheme)) as Record<string, unknown>;
  // Two walks, not one. Clearing must never CREATE the branch it was asked to
  // remove, and setting must create the branch a clear may just have removed --
  // `chrome.sidebar` is both in the same fixture. One permissive walk wrote
  // `tone` at the patch root, which the ingestion contract refuses by name.
  const find = (path: readonly string[]): Record<string, unknown> | null => {
    let cursor: Record<string, unknown> = draft;
    for (const segment of path) {
      const next = cursor[segment];
      if (next === null || typeof next !== "object") return null;
      cursor[segment] = { ...(next as object) };
      cursor = cursor[segment] as Record<string, unknown>;
    }
    return cursor;
  };
  const ensure = (path: readonly string[]): Record<string, unknown> => {
    let cursor: Record<string, unknown> = draft;
    for (const segment of path) {
      const next = cursor[segment];
      cursor[segment] =
        next === null || typeof next !== "object" ? {} : { ...(next as object) };
      cursor = cursor[segment] as Record<string, unknown>;
    }
    return cursor;
  };
  // Adjudication #2 (2026-09-15): the draft door states the leaves the editor
  // MOVED, so a competing leaf the draft merely carries from the preset is the
  // vertical's own and outranks nothing. The outranking arm therefore AUTHORS a
  // distinct value instead of leaving the carried one in place; the other arm
  // carries the preset's, which is the same authorship the DB arm has.
  for (const leaf of outrank) {
    const segments = leaf.split(".");
    const parent = find(segments.slice(0, -1));
    const key = segments[segments.length - 1]!;
    const carried = parent?.[key];
    if (parent && typeof carried === "string") {
      parent[key] = `"Outranking Probe", ${carried}`;
    }
  }
  const segments = keypath.split(".");
  ensure(segments.slice(0, -1))[segments[segments.length - 1]!] = value;
  return draft as unknown as FlatTheme;
}

const compilationOf = (intent: Parameters<typeof compileThemeIntent>[0]) =>
  compileThemeIntent(intent);

const variablesOf = (intent: Parameters<typeof compileThemeIntent>[0]): Record<string, string> =>
  compilationOf(intent).compiled.cssVariables;

const BASELINE = variablesOf(staticThemeIntent(VERTICAL, SLUG));

describe("transport parity — one decision, four doors, compared as bytes", () => {
  it("every dual-transport row is driven or has a written reason", () => {
    const accounted = Object.keys(CASES);
    const missing = dualTransportRows.map((row) => row.id).filter((id) => !accounted.includes(id));
    expect(missing, "a new dual-transport decision must prove its own parity").toEqual([]);
    const stale = accounted.filter((id) => !dualTransportRows.some((row) => row.id === id));
    expect(stale, "CASES names a row that no longer declares both transports").toEqual([]);
  });

  /**
   * The two doors rank the preset's two radius statements the SAME way.
   *
   * bithire's preset decides `shape.radius-scale: 0.8` AND
   * `profiles.expressive.geometry: "sharp"`, and the sharp geometry expands to
   * `radiusScale: 0.85`. The explicit decision precedes the profile default, so
   * both doors divide by 0.8.
   *
   * This pinned 6 diverging channels when the draft door presented the leaves a
   * draft merely CARRIES as tenant authorship: the carried `surfaces.radiusScale`
   * reached the tenant posture floors, was read as a re-dial, and the divisor
   * fell through to the profile expansion. Adjudication #2 (2026-09-15) ruled the
   * preview door the defect; it now states only the leaves the editor moved, and
   * the assertion is kept as the parity it always should have measured.
   */
  it("ranks the preset's two radius statements the same way on both doors", () => {
    const draftOfBaseline = variablesOf(
      draftPreviewThemeIntent({
        vertical: VERTICAL,
        slug: SLUG,
        draft: JSON.parse(JSON.stringify(bithireFlatTheme)) as FlatTheme,
      })
    );
    const names = [...new Set([...Object.keys(BASELINE), ...Object.keys(draftOfBaseline)])];
    expect(names.filter((channel) => BASELINE[channel] !== draftOfBaseline[channel])).toEqual([]);
    for (const channel of [
      "--ds-radius-button",
      "--ds-button-xs-radius",
      "--ds-button-sm-radius",
      "--ds-button-md-radius",
      "--ds-button-lg-radius",
      "--ds-button-xl-radius",
    ]) {
      expect(BASELINE[channel], `${channel} on the compile door`).toContain("/ 0.8 *");
      expect(draftOfBaseline[channel], `${channel} on the draft door`).toContain("/ 0.8 *");
    }
  });

  for (const row of dualTransportRows) {
    const entry = CASES[row.id];
    if (!entry || "skip" in entry) continue;

    describe(`${row.id} = ${JSON.stringify(entry.value)}`, () => {
      const document = v2({ [row.id]: entry.value });
      const dbCompilation = compilationOf(
        documentThemeIntent({ vertical: VERTICAL, slug: SLUG, document })
      );
      const previewCompilation = compilationOf(
        previewThemeIntent({ vertical: VERTICAL, slug: SLUG, document })
      );
      const db = dbCompilation.compiled.cssVariables;
      const preview = previewCompilation.compiled.cssVariables;
      const outranking = PRECEDENCE[row.id] ?? [];
      const brandKeypath = row.keypath.brandTheme as string;
      const statik = variablesOf(
        draftPreviewThemeIntent({
          vertical: VERTICAL,
          slug: SLUG,
          draft: draftWith(brandKeypath, entry.value),
        })
      );
      const statikOutranked = variablesOf(
        draftPreviewThemeIntent({
          vertical: VERTICAL,
          slug: SLUG,
          draft: draftWith(brandKeypath, entry.value, outranking),
        })
      );
      const published = compileTenantThemeDocumentV2({
        document,
        tenantId: "tenant_transport_parity",
        slug: SLUG,
        verticalKey: VERTICAL,
        rowVersion: 1,
      }).artifact.variables as Record<string, string>;

      const moved = Object.keys(db).filter((channel) => db[channel] !== BASELINE[channel]);

      it("law 0 — the decision MOVES the DB arm against the vertical baseline", () => {
        expect(moved.length, `${row.id} moved nothing; parity would be vacuous`).toBeGreaterThan(0);
      });

      it("law 1 (J.4) — the static FlatTheme arm produces the same bytes on every moved channel", () => {
        const mismatched = moved
          .filter((channel) => statik[channel] !== db[channel])
          .map((channel) => `${channel}: static=${statik[channel]} db=${db[channel]}`);
        expect(mismatched).toEqual([]);
      });

      it(
        outranking.length > 0
          ? "law 1b — the declared explicit leaves DO outrank the decision, so the ledger is not decorative"
          : "law 1b — nothing in the FlatTheme outranks this decision",
        () => {
          const outranked = moved.filter((channel) => statikOutranked[channel] !== db[channel]);
          if (outranking.length === 0) {
            expect(outranked, `${row.id} needs a PRECEDENCE entry naming what outranks it`).toEqual([]);
            return;
          }
          expect(
            outranked.length,
            `${row.id} declares ${outranking.join(", ")} as outranking leaves, but clearing them changed nothing`
          ).toBeGreaterThan(0);
        }
      );

      it("law 2 (J.5) — preview is byte-identical to the persisted document, across the whole map", () => {
        const names = new Set([...Object.keys(db), ...Object.keys(preview)]);
        const mismatched = [...names]
          .filter((channel) => preview[channel] !== db[channel])
          .map((channel) => `${channel}: preview=${preview[channel]} document=${db[channel]}`);
        expect(mismatched).toEqual([]);
      });

      it("law 2b (J.5) — preview resolves with the same authorship and the same delta", () => {
        expect(previewCompilation.resolution.provenance.tenantAuthored).toBe(true);
        expect(dbCompilation.resolution.provenance.tenantAuthored).toBe(true);
        expect(previewCompilation.delta).toEqual(dbCompilation.delta);
      });

      it("law 3 (J.5) — the published artifact is exactly the moved delta, byte-identical", () => {
        expect([...Object.keys(published)].sort()).toEqual([...moved].sort());
        const mismatched = Object.keys(published)
          .filter((channel) => published[channel] !== preview[channel])
          .map((channel) => `${channel}: artifact=${published[channel]} preview=${preview[channel]}`);
        expect(mismatched).toEqual([]);
      });
    });
  }
});
