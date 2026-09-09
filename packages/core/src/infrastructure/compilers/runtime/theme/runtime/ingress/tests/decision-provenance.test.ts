/**
 * RA01 (WO-CAT-03 amendment): the tier station judges the SELECTIONS the gate
 * recorded, never the leaves the merge left behind.
 *
 * Control 1 of the provenance contract: a Standard tenant that authors only
 * `typography.pairing` compiles, in all four pairings x three verticals x both
 * public producers. Every one of those 24 outcomes was refused as Pro font
 * authorship, because the pairing's expanded font leaves look exactly like a
 * `typography.families` selection once they are in the patch.
 *
 * Control 2: the same tenant authoring `typography.families` DIRECTLY is still
 * refused by name, and a selection whose value equals the value it would have
 * inherited is still authorship (I-P4).
 */

import { describe, expect, it } from "vitest";

import type { TenantThemeDocumentV2 } from "@/contracts/theme/presentation/document";
import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";
import { buttonStyleRadius } from "@/infrastructure/compilers/kernel/foundation/css/appearance-posture";
import { TYPOGRAPHY_FAMILY_ROLES } from "@/contracts/theme/foundation/decisions";
import { THEME_CONTROL_CATALOG } from "@/contracts/theme/runtime/catalog";
import { FIRST_PARTY_VERTICAL_SLUGS } from "@/foundation/contracts/kernel/verticals";
import {
  directOverrideEntries,
  ledgerOwnerOfLeaf,
} from "@/foundation/contracts/composition/tenants/themes/provenance";

import { compileThemeIntent } from "../../../facade/runtime/compile";
import {
  movedLeaves,
  tierIssues,
} from "../../../facade/foundation/admission";
import { baselineFor } from "../../../runtime/resolution";
import {
  documentProvenanceLedger,
  draftProvenanceLedger,
} from "../foundation/provenance";
import { admitDocument, documentThemeIntent, previewThemeIntent } from "..";

const SLUG = "provenance-acceptance";
const PAIRINGS = ["sober", "editorial", "geometric", "technical"] as const;
const PRODUCERS = { documentThemeIntent, previewThemeIntent } as const;

const pairingDocument = (pairing: string): TenantThemeDocumentV2 =>
  ({
    version: 2,
    plan: "standard",
    decisions: { "typography.pairing": pairing },
  }) as unknown as TenantThemeDocumentV2;

describe("Control 1 -- a Standard pairing compiles through both producers", () => {
  it("admits all 4 pairings x 3 verticals x 2 producers", () => {
    const outcomes: string[] = [];
    for (const vertical of FIRST_PARTY_VERTICAL_SLUGS) {
      for (const pairing of PAIRINGS) {
        for (const [name, produce] of Object.entries(PRODUCERS)) {
          const document = pairingDocument(pairing);
          expect(() =>
            compileThemeIntent(produce({ vertical, slug: SLUG, document }))
          ).not.toThrow();
          outcomes.push(`${vertical}/${pairing}/${name}`);
        }
      }
    }
    expect(outcomes).toHaveLength(24);
  });

  it("records ONE selection, at its own tier, owning the font leaves it expanded", () => {
    const { ledger } = admitDocument({
      vertical: "bithire",
      document: pairingDocument("editorial"),
    });
    expect(ledger.entries).toHaveLength(1);
    const [entry] = ledger.entries;
    expect(entry.ref).toEqual({ kind: "decision", id: "typography.pairing" });
    expect(entry.provenance).toBe("direct-override");
    expect(entry.tier).toBe("standard");
    // I-P3a: the causal owner of the derived font leaves is the pairing, not a
    // `typography.families` nobody selected.
    for (const leaf of [
      "typography.typePairing",
      "typography.fontFamilyBase",
      "typography.fontFamilyHeading",
    ]) {
      expect(ledgerOwnerOfLeaf(ledger, leaf)?.ref).toEqual({
        kind: "decision",
        id: "typography.pairing",
      });
    }
    expect(tierIssues(ledger, { plan: "standard" })).toEqual([]);
  });

  it("still refuses a pro decision the plan does not entitle", () => {
    const proDocument = {
      version: 2,
      plan: "pro",
      decisions: { "typography.families": { base: "editorial-text" } },
    } as unknown as TenantThemeDocumentV2;
    const { ledger } = admitDocument({ vertical: "bithire", document: proDocument });
    const issues = tierIssues(ledger, { plan: "standard" });
    expect(issues).toHaveLength(1);
    expect(issues[0].path).toBe('$.decisions["typography.families"]');
  });
});

describe("Control 2 -- explicit Pro families stay refused, by name", () => {
  it("refuses a Standard document that authors families directly", () => {
    for (const vertical of FIRST_PARTY_VERTICAL_SLUGS) {
      for (const produce of Object.values(PRODUCERS)) {
        const document = {
          version: 2,
          plan: "standard",
          decisions: {
            "typography.pairing": "geometric",
            "typography.families": { base: "editorial-text" },
          },
        } as unknown as TenantThemeDocumentV2;
        expect(() => produce({ vertical, slug: SLUG, document })).toThrow(
          /typography\.families/u
        );
      }
    }
  });

  it("judges the two selections separately: families falls, the pairing does not", () => {
    const { ledger } = admitDocument({
      vertical: "bithire",
      document: {
        version: 2,
        plan: "pro",
        decisions: {
          "typography.pairing": "geometric",
          "typography.families": { base: "editorial-text" },
        },
      } as unknown as TenantThemeDocumentV2,
    });
    const issues = tierIssues(ledger, { plan: "standard" });
    expect(issues.map((issue) => issue.path)).toEqual([
      '$.decisions["typography.families"]',
    ]);
    // I-P5: the more specific selection owns the contested leaf, and the
    // displaced one is RETAINED rather than deleted.
    expect(ledgerOwnerOfLeaf(ledger, "typography.fontFamilyBase")?.ref).toEqual({
      kind: "decision",
      id: "typography.families",
    });
    const pairing = ledger.entries.find(
      (entry) => entry.ref.kind === "decision" && entry.ref.id === "typography.pairing"
    );
    // 2026-09-09: this pinned `["typography.typePairing"]`, which was the
    // ledger agreeing with itself rather than with the lowering. A families
    // record naming only `base` displaces only `fontFamilyBase`; the heading,
    // the heading letter-spacing and the display line-height are still the
    // pairing's own expansion (I-P0/I-P3a), and `geometric` tunes no mono.
    expect(pairing?.effectiveLeaves).toEqual([
      "typography.typePairing",
      "typography.fontFamilyHeading",
      "typography.letterSpacing.heading",
      "typography.lineHeight.display",
    ]);
    expect(ledgerOwnerOfLeaf(ledger, "typography.fontFamilyMono")).toBeUndefined();
  });

  it("a families record owns the members it NAMES, and no others", () => {
    const { ledger } = admitDocument({
      vertical: "bithire",
      document: {
        version: 2,
        plan: "pro",
        decisions: { "typography.families": { base: "editorial-text" } },
      } as unknown as TenantThemeDocumentV2,
    });
    expect(ledger.entries[0].effectiveLeaves).toEqual([
      "typography.fontFamilyBase",
    ]);
    for (const leaf of [
      "typography.fontFamilyHeading",
      "typography.fontFamilyMono",
      "typography.fontFamilyDisplay",
    ]) {
      expect(ledgerOwnerOfLeaf(ledger, leaf)).toBeUndefined();
    }
  });

  it("a technical pairing keeps the mono leaf it alone expands into", () => {
    const { ledger } = admitDocument({
      vertical: "bithire",
      document: pairingDocument("technical"),
    });
    expect(ledger.entries[0].effectiveLeaves).toEqual([
      "typography.typePairing",
      "typography.fontFamilyBase",
      "typography.fontFamilyHeading",
      "typography.fontFamilyMono",
      "typography.letterSpacing.heading",
      "typography.lineHeight.display",
    ]);
  });

  it("a profile selection creates no typographic authorship (anti-RA01)", () => {
    // The expansion of an experience profile fills fields the tenant left
    // empty. Whatever it writes is `profile-derived` by transitivity, so it can
    // never appear as a directly authored Pro decision -- which is exactly the
    // shape RA01 would come back in once the expansion moves upstream.
    const document = {
      version: 2,
      plan: "standard",
      decisions: { "experience.profile": "rottay/management-editorial@1" },
    } as unknown as TenantThemeDocumentV2;
    for (const vertical of FIRST_PARTY_VERTICAL_SLUGS) {
      expect(() =>
        compileThemeIntent(documentThemeIntent({ vertical, slug: SLUG, document }))
      ).not.toThrow();
    }
    const { ledger } = admitDocument({ vertical: "bithire", document });
    expect(directOverrideEntries(ledger).map((entry) => entry.ref)).toEqual([
      { kind: "decision", id: "experience.profile" },
    ]);
    expect(tierIssues(ledger, { plan: "standard" })).toEqual([]);
  });

  it("I-P4: a value equal to the inherited one is still authorship", () => {
    // Rottay's baseline already renders dark, so this selection moves NO leaf.
    // It is still a decision the tenant made, still `direct-override`, and
    // still judged at its own tier.
    const document = {
      version: 2,
      plan: "pro",
      decisions: { "palette.dark-mode": "dark" },
    } as unknown as TenantThemeDocumentV2;
    const { patch, ledger } = admitDocument({ vertical: "rottay", document });
    expect(movedLeaves(patch, baselineFor("rottay", SLUG)).size).toBe(0);
    expect(directOverrideEntries(ledger).map((entry) => entry.ref)).toEqual([
      { kind: "decision", id: "palette.dark-mode" },
    ]);
    expect(tierIssues(ledger, { plan: "standard" })).toHaveLength(1);
  });
});

describe("member attribution holds for every braced row of the catalog", () => {
  /** The record keys a row closes; the registered typography row names roles. */
  const memberKeysOf = (id: string, domain: (typeof THEME_CONTROL_CATALOG)[number]["domain"]) => {
    if (domain.kind === "record") return domain.keys;
    if (domain.kind === "color-set") return domain.roles;
    return id === "typography.families" ? TYPOGRAPHY_FAMILY_ROLES : null;
  };

  it("gives each named member exactly its own leaf, and no sibling's", () => {
    const measured: string[] = [];
    for (const row of THEME_CONTROL_CATALOG) {
      if (row.keypath.brandTheme === null || !row.keypath.brandTheme.includes("{")) {
        continue;
      }
      const keys = memberKeysOf(row.id, row.domain);
      if (keys === null) continue;
      for (const key of keys) {
        const { entries } = documentProvenanceLedger({
          decisions: { [row.id]: { [key]: "x" } },
          chrome: undefined,
          chromeTransportPrefix: "overrides.chrome",
        });
        // A member the catalog has no keypath for is unlit, not unowned: it
        // claims nothing rather than claiming the whole brace list.
        expect(entries[0].effectiveLeaves.length).toBeLessThanOrEqual(1);
        measured.push(`${row.id}.${key}=${entries[0].effectiveLeaves.length}`);
      }
    }
    expect(measured).toContain("typography.families.mono=1");
    expect(measured).toContain("profiles.expressive.icon=0");
    expect(measured.length).toBeGreaterThan(20);
  });
});

describe("the draft door records the derivation its own transport states twice", () => {
  const RADIUS_LEAF = "chrome.controls.buttonGeometry.radius";

  const draftOf = (draft: object): BrandTheme =>
    ({ id: SLUG, name: "Draft provenance", ...draft }) as unknown as BrandTheme;

  const radiusOwner = (draft: BrandTheme) =>
    ledgerOwnerOfLeaf(draftProvenanceLedger(draft), RADIUS_LEAF)?.ref;

  it("attributes the radius to the style word when the value IS the derivation", () => {
    expect(
      radiusOwner(
        draftOf({
          surfaces: { buttonStyle: "pill" },
          chrome: {
            controls: { buttonGeometry: { radius: buttonStyleRadius("pill") } },
          },
        })
      )
    ).toEqual({ kind: "decision", id: "shape.button-style" });
  });

  it("attributes a radius no style word derived to the override that wrote it", () => {
    expect(
      radiusOwner(
        draftOf({ chrome: { controls: { buttonGeometry: { radius: "99999px" } } } })
      )
    ).toEqual({ kind: "sanctioned-override", path: RADIUS_LEAF });
  });

  it("attributes a radius that is not the selected style's derivation to the override", () => {
    // The guard is the whole mechanism: `pill` beside a radius `pill` does not
    // produce is authored chrome, and reading it as the decision's own output
    // would exempt it from the ceiling it breaches.
    expect(
      radiusOwner(
        draftOf({
          surfaces: { buttonStyle: "pill" },
          chrome: { controls: { buttonGeometry: { radius: "99999px" } } },
        })
      )
    ).toEqual({ kind: "sanctioned-override", path: RADIUS_LEAF });
  });

  it("gives a chrome leaf a decision NAMES exactly one owner", () => {
    const ledger = draftProvenanceLedger(
      draftOf({ chrome: { sidebar: { tone: "strong" } } })
    );
    expect(ledgerOwnerOfLeaf(ledger, "chrome.sidebar.tone")?.ref).toEqual({
      kind: "decision",
      id: "navigation.sidebar-tone",
    });
  });

  it("claims a mode overlay's chrome at its own transport path", () => {
    const ledger = draftProvenanceLedger(
      draftOf({ modes: { dark: { chrome: { cardComponent: { radius: "8px" } } } } })
    );
    expect(
      ledgerOwnerOfLeaf(ledger, "modes.dark.chrome.cardComponent.radius")?.ref
    ).toEqual({
      kind: "sanctioned-override",
      path: "modes.dark.chrome.cardComponent.radius",
    });
  });
});
