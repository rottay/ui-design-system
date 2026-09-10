/**
 * One leaf, one answer: the pill and the sanctioned radius override.
 *
 * `shape.button-style` expands into `chrome.controls.buttonGeometry.radius` and
 * a sanctioned override NAMES it, so the two contest one leaf inside one
 * provenance class and I-P5 settles it for the override. The paint could not
 * honour that -- the silhouette settles at the `tenant` rank and the chrome
 * family one rank below it -- so a `pill` + override document reported the
 * override as effective and drew the pill.
 *
 * Both directions are probed, because the failure this closes is not "the wrong
 * value won" but "two owners answered": a test that only asserted the painted
 * value would stay green if the ledger later changed its mind.
 */
import { describe, expect, it } from "vitest";

import { FIRST_PARTY_VERTICAL_SLUGS } from "@/foundation/contracts/kernel/verticals";
import type { TenantThemeDocumentV2 } from "@/contracts/theme/presentation/document";
import { compileTenantThemeDocumentV2 } from "@/infrastructure/compilers/composition/tenant-theme/document-v2";
import {
  admitDocument,
  documentThemeIntent,
  previewThemeIntent,
} from "@/infrastructure/compilers/runtime/theme/runtime/ingress";
import { compileThemeIntent } from "@/infrastructure/compilers/runtime/theme";

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
  return entry.ref.kind === "decision"
    ? `decision:${entry.ref.id}`
    : `override:${entry.ref.path}`;
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
