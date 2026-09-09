import { describe, expect, it } from "vitest";

import {
  documentThemeAdmission,
} from "@/infrastructure/compilers/runtime/theme";
import { THEME_DECISION_IDS } from "@/contracts/theme/foundation/decisions";
import { compileTenantThemeDocumentV2 } from "@/infrastructure/compilers/composition/tenant-theme/document-v2";

import {
  BITHIRE_IDENTITY_CANDIDATES,
  bithireCandidateDigest,
} from "../../documents";
import {
  NON_COLOR_AXES,
  formatAxisChannels,
  formatAxisProbe,
  runBitHireAxisProbe,
} from "..";

const REQUIRED_DIFFERING_AXES = 4;

describe("WO-DER-07 candidates", () => {
  it("states every decision of the kit, with no raw channel anywhere", () => {
    for (const candidate of BITHIRE_IDENTITY_CANDIDATES) {
      expect(Object.keys(candidate.document.decisions).sort()).toEqual(
        [...THEME_DECISION_IDS].sort()
      );
      expect(JSON.stringify(candidate.document)).not.toContain("--ds-");
      expect(candidate.document.overrides).toBeUndefined();
    }
  });

  it("passes admission as a pro document and compiles through the one door", () => {
    for (const candidate of BITHIRE_IDENTITY_CANDIDATES) {
      const { admission, intent } = documentThemeAdmission({
        vertical: "bithire",
        slug: candidate.slug,
        document: candidate.document,
      });
      expect(admission.version).toBe(2);
      expect(intent.entitlement?.plan).toBe("pro");
      expect(admission.decisions).toHaveLength(THEME_DECISION_IDS.length);

      const { artifact } = compileTenantThemeDocumentV2({
        document: candidate.document,
        tenantId: `wo-der-07-${candidate.id}`,
        slug: candidate.slug,
        verticalKey: "bithire",
        rowVersion: 1,
      });
      expect(artifact.slug).toBe(candidate.slug);
      expect(Object.keys(artifact.variables).length).toBeGreaterThan(0);

      // eslint-disable-next-line no-console
      console.log(
        `${candidate.id} digest=${bithireCandidateDigest(candidate)} ` +
          `channels=${Object.keys(artifact.variables).length} ` +
          `unlit=${admission.unlit.map((row) => row.id).join(",") || "none"}`
      );
    }
  });

  it("differs on at least four non-colour axes for every pair", () => {
    const report = runBitHireAxisProbe();
    // eslint-disable-next-line no-console
    console.log(formatAxisProbe(report));
    // eslint-disable-next-line no-console
    console.log(formatAxisChannels(report));
    for (const pair of report.pairs) {
      expect(
        pair.differingNonColorAxes.length,
        `${pair.left} vs ${pair.right}: ${pair.differingNonColorAxes.join(",")}`
      ).toBeGreaterThanOrEqual(REQUIRED_DIFFERING_AXES);
    }
  });

  it("moves nothing a non-colour axis owns when only the palette changes", () => {
    const report = runBitHireAxisProbe();
    expect(report.colorLeaks).toEqual([]);
    expect(NON_COLOR_AXES).not.toContain("color");
  });
});
