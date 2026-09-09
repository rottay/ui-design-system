/**
 * The common profile-expansion station: what it fills, what it refuses to
 * touch, and what it claims for the ledger.
 */
import { describe, expect, it } from "vitest";

import type { TenantThemeDocument } from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import { expandProfileDefaults } from "..";

const EDITORIAL = "rottay/management-editorial@1";

const simple = (appearance: Record<string, unknown>): TenantThemeDocument =>
  ({ schemaVersion: 1, mode: "simple", appearance }) as TenantThemeDocument;

const generalOf = (document: TenantThemeDocument) =>
  document.mode === "simple" ? document.appearance : document.visualFoundation.general;

describe("expandProfileDefaults", () => {
  it("returns its input by identity when there is no profile to expand", () => {
    const document = simple({ density: "compact" });
    const expansion = expandProfileDefaults({ vertical: "bithire", document });
    expect(expansion.document).toBe(document);
    expect(expansion.claims).toEqual([]);
  });

  it("fills the fields the profile declares and nothing else", () => {
    const { document, claims } = expandProfileDefaults({
      vertical: "bithire",
      document: simple({ experienceProfile: EDITORIAL }),
    });
    const general = generalOf(document);
    expect(general?.typography?.typePairing).toBe("editorial");
    expect(general?.motion?.intensity).toBe(0.7);
    expect(general?.shape?.radiusScale).toBe(1.15);
    expect(claims.every((claim) => claim.provenance === "profile-derived")).toBe(
      true
    );
  });

  it("is idempotent: expanding an expanded document adds nothing", () => {
    const once = expandProfileDefaults({
      vertical: "bithire",
      document: simple({ experienceProfile: EDITORIAL }),
    });
    const twice = expandProfileDefaults({
      vertical: "bithire",
      document: once.document,
    });
    expect(twice.document).toBe(once.document);
    expect(twice.claims).toEqual([]);
  });

  it("never overwrites an authored field, and fills the dials beside it", () => {
    const { document, claims } = expandProfileDefaults({
      vertical: "bithire",
      document: simple({
        experienceProfile: EDITORIAL,
        motion: { intensity: 0.2 },
      }),
    });
    const general = generalOf(document);
    expect(general?.motion?.intensity).toBe(0.2);
    expect(general?.motion?.durationScale).toBe(1.1);
    const motion = claims.find(
      (claim) => claim.ref.kind === "decision" && claim.ref.id === "motion.dial"
    );
    expect(motion?.leaves.map((leaf) => leaf.leaf)).toEqual([
      "motion.durationScale",
      "motion.ambient",
    ]);
  });

  it("claims the catalog's Theme keypaths, as expansion-derived leaves", () => {
    const { claims } = expandProfileDefaults({
      vertical: "bithire",
      document: simple({ experienceProfile: EDITORIAL }),
    });
    const pairing = claims.find(
      (claim) =>
        claim.ref.kind === "decision" && claim.ref.id === "typography.pairing"
    );
    expect(pairing?.leaves).toEqual([
      { leaf: "typography.typePairing", specificity: "expansion-derived" },
    ]);
  });

  it("clamps a numeric default into the caller's envelope", () => {
    const { document } = expandProfileDefaults({
      vertical: "bithire",
      document: simple({ experienceProfile: EDITORIAL }),
      ranges: { radiusScale: { min: 0.5, max: 1 } },
    });
    expect(generalOf(document)?.shape?.radiusScale).toBe(1);
  });

  it("expands an unknown profile to nothing rather than to a guess", () => {
    const document = simple({ experienceProfile: "vendor/not-registered@9" });
    expect(expandProfileDefaults({ vertical: "bithire", document }).document).toBe(
      document
    );
  });
});
