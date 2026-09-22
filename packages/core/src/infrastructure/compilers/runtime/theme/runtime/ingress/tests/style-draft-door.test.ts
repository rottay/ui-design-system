/**
 * The draft/studio door, on HEAD's measured semantics.
 *
 * This door builds its ledger from the flattened draft `Theme`, not from a
 * document, so it cannot see WHICH source put a value in the draft:
 * `draftChromeClaim` stamps `direct-override` unconditionally. A chrome-reaching
 * row a style supplied is therefore reported at rank 2 -- exactly as a chrome-
 * reaching row a vertical preset supplied is reported today. That is not a
 * defect this lot introduces; it is HEAD's behaviour for presets, and a style
 * inherits it.
 *
 * What this lot DOES owe the door is the baseline. `carriedFrom` is what the
 * moved patch is measured against and what the intent hands down as `baseline`,
 * so a draft opened over a style-bearing tenant WITHOUT it reports every
 * inherited style leaf as the editor's own authorship.
 */

import { describe, expect, it } from "vitest";

import { ledgerOwnerOfLeaf } from "@/foundation/contracts/composition/tenants/themes/provenance";
import {
  mergeThemePatches,
  type Theme,
} from "@/foundation/contracts/composition/tenants/themes/iso";
import {
  baselineFor,
  draftPreviewThemeIntent,
} from "@/infrastructure/compilers/runtime/theme";
import { styleThemePatch } from "../runtime/document-v2";

const VERTICAL = "bithire" as const;
const SLUG = "acme";
const STYLE = { id: "quiet-premium", version: 1 } as const;

const baseline = () => baselineFor(VERTICAL, SLUG);
const composed = (): Theme =>
  mergeThemePatches(
    baseline(),
    styleThemePatch({ vertical: VERTICAL, plan: "pro", style: STYLE })
  );

const carriedEntries = (ledger: { entries: readonly unknown[] }) =>
  (ledger.entries as readonly { provenance: string }[]).filter(
    (entry) => entry.provenance === "preset-inherited"
  );

const styleEntryOf = (ledger: { entries: readonly unknown[] }) =>
  (ledger.entries as readonly { ref: { kind: string }; effectiveLeaves: readonly string[] }[]).find(
    (entry) => entry.ref.kind === "style-reference"
  );

/* -------------------------------------------------------------------------- */
/* I6 (i) — an explicit style-bearing carriedFrom                             */
/* -------------------------------------------------------------------------- */

describe("I6 (i) a draft opened over a style-bearing baseline", () => {
  const intent = () =>
    draftPreviewThemeIntent({
      vertical: VERTICAL,
      slug: SLUG,
      draft: composed(),
      carriedFrom: composed(),
      style: STYLE,
    });

  it("resolves without throwing", () => {
    expect(() => intent()).not.toThrow();
  });

  it("excludes from the moved patch every leaf the style supplied and the editor did not move", () => {
    const patch = intent().patch as Record<string, unknown>;
    // The draft IS its baseline, so nothing moved. A style leaf appearing here
    // would be the studio reporting the style's ink as the editor's.
    expect(patch.surfaces).toBeUndefined();
    expect(patch.typography).toBeUndefined();
    expect(patch.motion).toBeUndefined();
  });

  it("records the style reference on the ledger", () => {
    expect(styleEntryOf(intent().ledger as never)).toBeDefined();
  });

  it("claims chrome and nothing else, so non-chrome style leaves are unclaimed here", () => {
    const ledger = intent().ledger as never as {
      entries: readonly { effectiveLeaves: readonly string[] }[];
    };
    for (const entry of ledger.entries) {
      for (const leaf of entry.effectiveLeaves) {
        expect([leaf, leaf.startsWith("chrome.") || leaf.startsWith("modes.")]).toEqual([
          leaf,
          true,
        ]);
      }
    }
  });

  it("reports a style exactly as a preset: same claims, plus the recorded ref", () => {
    // The SAME draft and the SAME baseline, with the style's values arriving as
    // the handed-in baseline rather than as a named style. Every decision and
    // override claim is byte-identical; the only difference is the entry the WO
    // requires the door to record, and it owns no leaf.
    const asPreset = draftPreviewThemeIntent({
      vertical: VERTICAL,
      slug: SLUG,
      draft: composed(),
      carriedFrom: composed(),
    });
    const asStyle = intent();
    const withoutStyleEntry = (ledger: never) =>
      (ledger as { entries: readonly { ref: { kind: string } }[] }).entries.filter(
        (entry) => entry.ref.kind !== "style-reference"
      );
    expect(withoutStyleEntry(asStyle.ledger as never)).toEqual(
      withoutStyleEntry(asPreset.ledger as never)
    );
    expect(styleEntryOf(asStyle.ledger as never)?.effectiveLeaves).toEqual([]);
    expect(styleEntryOf(asPreset.ledger as never)).toBeUndefined();
    expect(asStyle.patch).toEqual(asPreset.patch);
  });
});

/* -------------------------------------------------------------------------- */
/* I6 (ii) — no carriedFrom, style named                                      */
/* -------------------------------------------------------------------------- */

describe("I6 (ii) the door composes the baseline when the caller omits it", () => {
  const explicit = () =>
    draftPreviewThemeIntent({
      vertical: VERTICAL,
      slug: SLUG,
      draft: composed(),
      carriedFrom: composed(),
      style: STYLE,
    });
  const composedByDoor = () =>
    draftPreviewThemeIntent({
      vertical: VERTICAL,
      slug: SLUG,
      draft: composed(),
      style: STYLE,
    });

  it("produces the same moved patch and the same ledger as the explicit arm", () => {
    expect(composedByDoor().patch).toEqual(explicit().patch);
    expect(composedByDoor().ledger).toEqual(explicit().ledger);
    expect(composedByDoor().baseline).toEqual(explicit().baseline);
  });

  /**
   * THE DRILL, executed rather than described: the same draft measured against
   * the UNcomposed baseline -- which is what the door would hand itself if the
   * composition were dropped -- gains every style leaf as tenant authorship.
   */
  it("diverges from it when the baseline does not contain the style", () => {
    const uncomposed = draftPreviewThemeIntent({
      vertical: VERTICAL,
      slug: SLUG,
      draft: composed(),
      carriedFrom: baseline(),
      style: STYLE,
    });
    expect(uncomposed.patch).not.toEqual(explicit().patch);
    const patch = uncomposed.patch as Record<string, unknown>;
    expect(patch.surfaces ?? patch.typography ?? patch.motion).toBeDefined();
  });

  it("leaves a styleless draft exactly where it was", () => {
    const styleless = draftPreviewThemeIntent({
      vertical: VERTICAL,
      slug: SLUG,
      draft: baseline(),
    });
    expect(styleless.baseline).toEqual(baseline());
    expect(styleEntryOf(styleless.ledger as never)).toBeUndefined();
  });
});

/* -------------------------------------------------------------------------- */
/* I6 (iii) — the pre-emption, asserted rather than drilled                   */
/* -------------------------------------------------------------------------- */

describe("I6 (iii) a decision claim pre-empts every override claim on its leaf", () => {
  /**
   * HEAD's own draft, no style. The decision loop runs first and adds every
   * leaf of every decision claim to `claimed`, so `chromeOverrideClaims` skips
   * them and no `CARRIED` claim is ever constructed for a named chrome leaf.
   *
   * This fixture needs nothing from this WO, and it is the tripwire for the lot
   * that WOULD make the tie real: extending `draftChromeClaim` with a
   * `carriedFrom` comparison drops a baseline-equal decision claim to
   * `preset-inherited`, and this arm is where that surfaces.
   */
  it("owns chrome.sidebar.tone by its decision, at direct-override", () => {
    const { ledger } = draftPreviewThemeIntent({
      vertical: VERTICAL,
      slug: SLUG,
      draft: baseline(),
      carriedFrom: baseline(),
    });
    const owner = ledgerOwnerOfLeaf(ledger as never, "chrome.sidebar.tone");
    expect(owner?.ref).toEqual({ kind: "decision", id: "navigation.sidebar-tone" });
    expect(owner?.provenance).toBe("direct-override");
    expect(
      carriedEntries(ledger as never).filter((entry) =>
        (entry as unknown as { effectiveLeaves: readonly string[] }).effectiveLeaves.includes(
          "chrome.sidebar.tone"
        )
      )
    ).toEqual([]);
  });

  it("lets no CARRIED claim name a leaf the style entry also names", () => {
    const { ledger } = draftPreviewThemeIntent({
      vertical: VERTICAL,
      slug: SLUG,
      draft: composed(),
      style: STYLE,
    });
    const entries = (ledger as never as {
      entries: readonly {
        ref: { kind: string };
        provenance: string;
        leaves?: readonly { leaf: string }[];
        effectiveLeaves: readonly string[];
      }[];
    }).entries;
    const style = entries.find((entry) => entry.ref.kind === "style-reference");
    expect(style).toBeDefined();
    const carriedLeaves = new Set(
      entries
        .filter(
          (entry) =>
            entry.ref.kind === "sanctioned-override" &&
            entry.provenance === "preset-inherited"
        )
        .flatMap((entry) => [...entry.effectiveLeaves])
    );
    for (const leaf of style?.effectiveLeaves ?? []) {
      expect([leaf, carriedLeaves.has(leaf)]).toEqual([leaf, false]);
    }
    expect(() =>
      draftPreviewThemeIntent({
        vertical: VERTICAL,
        slug: SLUG,
        draft: composed(),
        style: STYLE,
      })
    ).not.toThrow();
  });
});
