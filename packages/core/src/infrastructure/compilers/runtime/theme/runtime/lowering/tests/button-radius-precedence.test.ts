/**
 * One leaf, one answer: the pill and the sanctioned radius override.
 *
 * THE LAW. A radius the tenant AUTHORED through a route its plan entitles beats
 * the silhouette `shape.button-style` expands into; a radius it merely inherited
 * does not, and a route its plan does not entitle is refused by name rather than
 * ranked. The ledger settles it -- I-P1 between provenance classes, then I-P5
 * between a named leaf and an expansion-derived one -- and the paint READS that
 * verdict instead of restating it.
 *
 * `shape.button-style` expands into `chrome.controls.buttonGeometry.radius` and
 * a sanctioned override NAMES it, so the two contest one leaf inside one
 * provenance class. The paint could not honour that -- the silhouette settles at
 * the `tenant` rank and the chrome family one rank below it -- so a `pill` +
 * override document reported the override as effective and drew the pill.
 *
 * Both directions are probed, because the failure this closes is not "the wrong
 * value won" but "two owners answered": a test that only asserted the painted
 * value would stay green if the ledger later changed its mind.
 */
import { describe, expect, it } from "vitest";

import type { FirstPartyVerticalId } from "@/foundation/contracts/kernel/verticals";
import { FIRST_PARTY_VERTICAL_SLUGS } from "@/foundation/contracts/kernel/verticals";
import type { TenantThemeDocumentV2 } from "@/contracts/theme/presentation/document";
import { compileTenantThemeDocumentV2 } from "@/infrastructure/compilers/composition/tenant-theme/document-v2";
import type { FlatTheme } from "@/foundation/contracts/composition/tenants/themes";
import {
  admitDocument,
  documentThemeIntent,
  draftPreviewThemeIntent,
  previewThemeIntent,
} from "@/infrastructure/compilers/runtime/theme/runtime/ingress";
import { draftProvenanceLedger } from "@/infrastructure/compilers/runtime/theme/runtime/ingress/foundation/provenance";
import { compileThemeIntent } from "@/infrastructure/compilers/runtime/theme";
import { FIRST_PARTY_BASELINES } from "@tests/support/theme-lowering";
import { baselineFor } from "@/infrastructure/compilers/runtime/theme";

const SLUG = "radius-precedence";
const LEAF = "chrome.controls.buttonGeometry.radius";
const NAMED_RADIUS = "7px";
const SILHOUETTE_CHANNELS = [
  "--ds-radius-button",
  "--ds-button-xs-radius",
  "--ds-button-sm-radius",
  "--ds-button-md-radius",
  "--ds-button-lg-radius",
  "--ds-button-xl-radius",
] as const;

const override = {
  chrome: { controls: { buttonGeometry: { radius: NAMED_RADIUS } } },
};

const doc = (body: Partial<TenantThemeDocumentV2>): TenantThemeDocumentV2 =>
  ({ version: 2, plan: "pro", decisions: {}, ...body }) as TenantThemeDocumentV2;

const painted = (
  vertical: (typeof FIRST_PARTY_VERTICAL_SLUGS)[number],
  document: TenantThemeDocumentV2
): Record<string, string | undefined> => {
  const vars = compileThemeIntent(
    documentThemeIntent({ vertical, slug: SLUG, document })
  ).compiled.cssVariables;
  return Object.fromEntries(
    SILHOUETTE_CHANNELS.map((channel) => [channel, vars[channel]])
  );
};

const ownerOfRadius = (
  vertical: (typeof FIRST_PARTY_VERTICAL_SLUGS)[number],
  document: TenantThemeDocumentV2
): string | undefined => {
  const entry = admitDocument({ vertical, document }).ledger.entries.find(
    (candidate) => candidate.effectiveLeaves.includes(LEAF)
  );
  if (!entry) return undefined;
  if (entry.ref.kind === "decision") return `decision:${entry.ref.id}`;
  // A style entry is neither a decision nor an override; naming it as one would
  // make this reader's answer about ownership quietly wrong.
  if (entry.ref.kind === "style-reference") {
    return `style:${entry.ref.id}@${entry.ref.version}`;
  }
  return `override:${entry.ref.path}`;
};

for (const vertical of FIRST_PARTY_VERTICAL_SLUGS) {
  describe(`button radius precedence (${vertical})`, () => {
    const pillOnly = doc({ decisions: { "shape.button-style": "pill" } });
    const pillAndOverride = doc({
      decisions: { "shape.button-style": "pill" },
      overrides: override,
    });

    it("without an override, the silhouette owns the leaf AND paints it", () => {
      expect(ownerOfRadius(vertical, pillOnly)).toBe(
        "decision:shape.button-style"
      );
      for (const channel of SILHOUETTE_CHANNELS) {
        expect(painted(vertical, pillOnly)[channel], channel).toContain("9999px");
      }
    });

    it("with an override, the OVERRIDE owns the leaf AND paints it", () => {
      expect(ownerOfRadius(vertical, pillAndOverride)).toBe(
        "override:overrides.chrome.controls.buttonGeometry.radius"
      );
      for (const channel of SILHOUETTE_CHANNELS) {
        const value = painted(vertical, pillAndOverride)[channel];
        expect(value, channel).toContain(NAMED_RADIUS);
        expect(value, channel).not.toContain("9999px");
      }
    });

    it("the decision reports the leaf as LOST, not as still owned", () => {
      // The other half of the same fact. A ledger that gave the leaf to the
      // override while the decision also kept it would be two owners again,
      // and `effectiveLeaves` is where that shows.
      const decision = admitDocument({
        vertical,
        document: pillAndOverride,
      }).ledger.entries.find(
        (entry) =>
          entry.ref.kind === "decision" && entry.ref.id === "shape.button-style"
      );
      expect(decision?.effectiveLeaves).toEqual(["surfaces.buttonStyle"]);
    });

    it("neither the authoring order nor the chosen silhouette decides it", () => {
      const reversed = {
        version: 2,
        plan: "pro",
        overrides: override,
        decisions: { "shape.button-style": "pill" },
      } as TenantThemeDocumentV2;
      expect(painted(vertical, reversed)).toEqual(
        painted(vertical, pillAndOverride)
      );
      const sharp = doc({
        decisions: { "shape.button-style": "sharp" },
        overrides: override,
      });
      expect(painted(vertical, sharp)).toEqual(painted(vertical, pillAndOverride));
    });

    it("the override is emitted in the same grammar with or without a silhouette", () => {
      // The value a tenant named must not be re-spelled because a decision
      // happens to sit beside it: it is one authored radius at the vertical's
      // own dial position either way.
      const overrideOnly = doc({ overrides: override });
      expect(painted(vertical, overrideOnly)["--ds-radius-button"]).toBe(
        painted(vertical, pillAndOverride)["--ds-radius-button"]
      );
    });

    it("document, preview and publication all carry the override's value", () => {
      const preview = compileThemeIntent(
        previewThemeIntent({ vertical, slug: SLUG, document: pillAndOverride })
      );
      const published = compileTenantThemeDocumentV2({
        document: pillAndOverride,
        verticalKey: vertical,
        slug: SLUG,
        tenantId: "radius-precedence",
        rowVersion: 1,
      });
      expect(preview.compiled.cssVariables["--ds-radius-button"]).toBe(
        painted(vertical, pillAndOverride)["--ds-radius-button"]
      );
      expect(published.artifact.variables["--ds-radius-button"]).toContain(
        NAMED_RADIUS
      );
    });

    it("a plan that does not entitle the route refuses it, and the pill stays", () => {
      // The third direction, and the one a ranked answer must never give: an
      // override the plan forbids is not a weaker claim to be outranked, it is
      // not a claim at all. Refused BY NAME at the door, and the same decisions
      // without it compile to the silhouette -- so the refusal is the whole
      // difference, not a document that failed for some other reason.
      const forbidden = {
        version: 2,
        plan: "standard",
        decisions: { "shape.button-style": "pill" },
        overrides: override,
      } as TenantThemeDocumentV2;
      expect(() => painted(vertical, forbidden)).toThrowError(/tier pro/u);
      const entitled = doc({
        decisions: { "shape.button-style": "pill" },
      }) as TenantThemeDocumentV2;
      expect(painted(vertical, { ...entitled, plan: "standard" })).toEqual(
        painted(vertical, pillOnly)
      );
    });

    it("a VERTICAL's own button geometry still loses to a tenant silhouette", () => {
      // The inversion the ranked merge was built to fix, and the reason the
      // tenant family reads the LEDGER rather than the effective theme: a
      // chrome radius the tenant never NAMED is not this fact, however the
      // vertical spelled it. Measured against the vertical's own compile, so
      // the assertion cannot pass by the channel simply being unset.
      const verticalOwn = painted(vertical, doc({}));
      for (const channel of SILHOUETTE_CHANNELS) {
        expect(painted(vertical, pillOnly)[channel], channel).not.toBe(
          verticalOwn[channel]
        );
      }
    });
  });
}

/**
 * The same law on the DRAFT door, where "authored" is not free.
 *
 * A document states only what its tenant chose, so an override in it is
 * authorship by construction. A `FlatTheme` draft is the whole theme the studio
 * opened: the same chrome leaf may be the value the editor typed or the
 * vertical's own ink carried along untouched, and only the baseline separates
 * them. Reading every carried leaf as inherited made a radius the editor really
 * typed lose to the silhouette beside it -- with the ledger still reporting that
 * radius as the leaf's owner, which is the one answer this law forbids.
 */
const draftOf = (radius: string | undefined): FlatTheme =>
  ({
    id: SLUG,
    name: "Draft precedence",
    surfaces: { buttonStyle: "pill" },
    ...(radius === undefined
      ? {}
      : { chrome: { controls: { buttonGeometry: { radius } } } }),
  }) as unknown as FlatTheme;

const draftPainted = (
  vertical: FirstPartyVerticalId,
  radius: string | undefined
): Record<string, string | undefined> => {
  const vars = compileThemeIntent(
    draftPreviewThemeIntent({ vertical, slug: SLUG, draft: draftOf(radius) })
  ).compiled.cssVariables;
  return Object.fromEntries(
    SILHOUETTE_CHANNELS.map((channel) => [channel, vars[channel]])
  );
};

const draftRadiusOwner = (
  vertical: FirstPartyVerticalId,
  radius: string | undefined
): string =>
  draftProvenanceLedger(draftOf(radius), vertical, { carriedFrom: baselineFor(vertical, vertical) })
    .entries.filter((entry) => entry.effectiveLeaves.includes(LEAF))
    .map((entry) => entry.provenance)
    .join(",") || "none";

/** What the vertical itself states for the contested leaf, or nothing. */
const baselineRadius = (vertical: FirstPartyVerticalId): string | undefined =>
  (
    FIRST_PARTY_BASELINES[vertical] as unknown as {
      chrome?: { controls?: { buttonGeometry?: { radius?: string } } };
    }
  ).chrome?.controls?.buttonGeometry?.radius;

for (const vertical of FIRST_PARTY_VERTICAL_SLUGS) {
  describe(`button radius precedence, draft door (${vertical})`, () => {
    it("a radius the editor MOVED wins, and the ledger says so", () => {
      expect(draftRadiusOwner(vertical, NAMED_RADIUS)).toBe("direct-override");
      for (const channel of SILHOUETTE_CHANNELS) {
        const value = draftPainted(vertical, NAMED_RADIUS)[channel];
        expect(value, channel).toContain(NAMED_RADIUS);
        expect(value, channel).not.toContain("9999px");
      }
    });

    it("a draft that states no radius at all paints the silhouette", () => {
      expect(draftRadiusOwner(vertical, undefined)).toBe("none");
      for (const channel of SILHOUETTE_CHANNELS) {
        expect(draftPainted(vertical, undefined)[channel], channel).toContain(
          "9999px"
        );
      }
    });

    it("a radius the draft merely CARRIED does not win", () => {
      // Only bithire pairs a control radius with its control heights, so only
      // bithire can carry one. The arm is written against the roster rather
      // than a literal: a vertical that starts authoring the leaf joins the law
      // instead of quietly skipping it.
      const carried = baselineRadius(vertical);
      if (carried === undefined) {
        expect(draftRadiusOwner(vertical, NAMED_RADIUS)).toBe("direct-override");
        return;
      }
      expect(draftRadiusOwner(vertical, carried)).toBe("preset-inherited");
      expect(draftPainted(vertical, carried)).toEqual(
        draftPainted(vertical, undefined)
      );
      expect(draftPainted(vertical, carried)).not.toEqual(
        draftPainted(vertical, NAMED_RADIUS)
      );
    });

    it("the draft and the document answer the contest identically", () => {
      // One law, two transports. The draft carries the vertical's whole chrome
      // and the document carries only the override, so the channels agree only
      // if both doors ranked the same two claims the same way.
      const asDocument = painted(
        vertical,
        doc({
          decisions: { "shape.button-style": "pill" },
          overrides: { chrome: { controls: { buttonGeometry: { radius: NAMED_RADIUS } } } },
        })
      );
      expect(draftPainted(vertical, NAMED_RADIUS)).toEqual(asDocument);
    });
  });
}
