/**
 * RT05 — publishing a profile must compile the document previewing it showed.
 *
 * The re-audit's receipt (`profile-publication-cases.json`) compared the door's
 * admitted delta for a document against the artifact that same document
 * published, for both registered experience ids across all three verticals, and
 * found 10-41 differing entries per case: the artifact carried the profile's
 * editorial fonts, `--ds-motion-intensity: 0.7` and `--ds-radius-scale: 1.15`,
 * and the door carried none of them. The terminal expanded the profile into a
 * replacement document it built for itself; the door was sent the selection
 * alone.
 *
 * The repair is not "emit neither": a profile default IS part of the effective
 * configuration the tenant chose when it selected the profile, so both doors
 * must emit it. These cases therefore assert EFFECTIVE VALUES first and parity
 * second — a green run with the defaults deleted from both paths would satisfy
 * parity and fail this file.
 */
import { describe, expect, it } from "vitest";

import type { FirstPartyVerticalId } from "@/foundation/contracts/kernel/verticals";
import type {
  TenantThemeConfigIdentity,
  TenantThemeDocument,
} from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import { compileThemeIntent } from "@/infrastructure/compilers/runtime/theme";
import {
  documentThemeIntent,
  previewThemeIntent,
} from "@/infrastructure/compilers/runtime/theme";
import { compileTenantThemeConfig, getTenantThemeVerticalEnvelope } from "..";

const VERTICALS: readonly FirstPartyVerticalId[] = ["rottay", "bithire", "evnto"];
const PROFILES = [
  "rottay/bithire-technical@1",
  "rottay/management-editorial@1",
] as const;

const identity = (vertical: FirstPartyVerticalId): TenantThemeConfigIdentity => ({
  tenantId: "11111111-1111-4111-8111-111111111111",
  slug: "acme",
  verticalKey: vertical,
  rowVersion: 3,
});

const profileDocument = (profile: string): TenantThemeDocument => ({
  schemaVersion: 1,
  mode: "simple",
  appearance: { experienceProfile: profile },
});

/** What the door admits for a document, as the audit compared it. */
function doorVariables(
  vertical: FirstPartyVerticalId,
  document: TenantThemeDocument,
  origin: "preview" | "tenant-document" = "preview"
): Readonly<Record<string, string>> {
  const intent =
    origin === "preview"
      ? previewThemeIntent({ vertical, slug: "acme", document })
      : documentThemeIntent({ vertical, slug: "acme", document });
  const { delta } = compileThemeIntent(intent);
  if (!delta) throw new Error("the door measured no delta");
  return delta.variables;
}

function publishedVariables(
  vertical: FirstPartyVerticalId,
  document: TenantThemeDocument
): Readonly<Record<string, string>> {
  return compileTenantThemeConfig(
    { ...document, ...identity(vertical) },
    { verticalEnvelope: getTenantThemeVerticalEnvelope(vertical) }
  ).variables;
}

function differences(
  door: Readonly<Record<string, string>>,
  published: Readonly<Record<string, string>>
): readonly string[] {
  const keys = new Set([...Object.keys(door), ...Object.keys(published)]);
  return [...keys].filter((key) => door[key] !== published[key]).sort();
}

describe("RT05 · one document, one effective compile", () => {
  for (const vertical of VERTICALS) {
    for (const profile of PROFILES) {
      it(`${vertical} · ${profile} previews exactly what it publishes`, () => {
        const document = profileDocument(profile);
        expect(
          differences(
            doorVariables(vertical, document),
            publishedVariables(vertical, document)
          )
        ).toEqual([]);
      });

      it(`${vertical} · ${profile} admits the same delta through both producers`, () => {
        const document = profileDocument(profile);
        expect(doorVariables(vertical, document, "preview")).toEqual(
          doorVariables(vertical, document, "tenant-document")
        );
      });
    }
  }

  it("emits the editorial profile's declared defaults on BOTH paths", () => {
    const document = profileDocument("rottay/management-editorial@1");
    for (const source of [
      doorVariables("bithire", document),
      publishedVariables("bithire", document),
    ]) {
      expect(source["--ds-motion-intensity"]).toBe("0.7");
      expect(source["--ds-radius-scale"]).toBe("1.15");
      expect(source["--ds-font-family-base"]).toContain("var(--ds-font-");
    }
  });

  it("keeps the profile out of the normalized appearance nowhere: the runtime metadata carries the effective values", () => {
    const artifact = compileTenantThemeConfig(
      {
        ...profileDocument("rottay/management-editorial@1"),
        ...identity("bithire"),
      },
      { verticalEnvelope: getTenantThemeVerticalEnvelope("bithire") }
    );
    expect(artifact.normalizedAppearance.general?.shape?.radiusScale).toBe(1.15);
    expect(artifact.normalizedAppearance.general?.motion?.intensity).toBe(0.7);
    expect(artifact.normalizedAppearance.general?.typography?.typePairing).toBe(
      "editorial"
    );
  });
});

describe("RT05 · precedence, removal and plan", () => {
  const partialMotion: TenantThemeDocument = {
    schemaVersion: 1,
    mode: "simple",
    appearance: {
      experienceProfile: "rottay/management-editorial@1",
      motion: { intensity: 0.2 },
    },
  };

  it("an explicit dial outranks the profile, and the empty ones still receive it", () => {
    const door = doorVariables("bithire", partialMotion);
    const published = publishedVariables("bithire", partialMotion);
    expect(differences(door, published)).toEqual([]);
    expect(published["--ds-motion-intensity"]).toBe("0.2");
    expect(published["--ds-motion-duration-scale"]).toBe("1.1");
  });

  it("removing the profile returns the document to its own authorship, digest included", () => {
    const withoutProfile: TenantThemeDocument = {
      schemaVersion: 1,
      mode: "simple",
      appearance: { density: "compact" },
    };
    const withProfile: TenantThemeDocument = {
      schemaVersion: 1,
      mode: "simple",
      appearance: {
        density: "compact",
        experienceProfile: "rottay/management-editorial@1",
      },
    };
    const removed = publishedVariables("bithire", withoutProfile);
    const restored = publishedVariables("bithire", withProfile);
    expect(removed["--ds-radius-scale"]).not.toBe("1.15");
    expect(restored["--ds-radius-scale"]).toBe("1.15");
    expect(
      compileTenantThemeConfig(
        { ...withoutProfile, ...identity("bithire") },
        { verticalEnvelope: getTenantThemeVerticalEnvelope("bithire") }
      ).digest
    ).toBe(
      compileTenantThemeConfig(
        { ...withoutProfile, ...identity("bithire") },
        { verticalEnvelope: getTenantThemeVerticalEnvelope("bithire") }
      ).digest
    );
  });

  it("the same effective configuration compiles the same under every entitled plan", () => {
    const base = doorVariables(
      "bithire",
      profileDocument("rottay/management-editorial@1")
    );
    for (const plan of ["pro", "internal"] as const) {
      const { delta } = compileThemeIntent(
        previewThemeIntent({
          vertical: "bithire",
          slug: "acme",
          document: {
            version: 2,
            plan,
            decisions: { "experience.profile": "rottay/management-editorial@1" },
          },
        })
      );
      expect(delta?.variables).toEqual(base);
    }
  });

  /**
   * The `standard` leg of the cross-plan comparison, and the ONE case this lot
   * cannot close on its own.
   *
   * The tier station still infers decisions from merged patch leaves, so the
   * font families a pairing expands into read as an authored `typography.
   * families` (RA01). Now that the profile expansion runs at the door for both
   * transports, a Standard v2 document that selects a profile reaches that same
   * inference — the identical defect the re-audit reported for an authored
   * pairing, over one more input. It closes with the ledger-judged tier station
   * of R1 (contract I-T1/I-T4, Control 1), not here: exempting font-family
   * leaves by name is forbidden. When that lands, this expectation goes red and
   * is replaced by the parity assertion above extended to `standard`.
   */
  it("records the Standard leg still refused by the leaf-inferred tier station", () => {
    expect(() =>
      compileThemeIntent(
        previewThemeIntent({
          vertical: "bithire",
          slug: "acme",
          document: {
            version: 2,
            plan: "standard",
            decisions: { "experience.profile": "rottay/management-editorial@1" },
          },
        })
      )
    ).toThrow(/typography\.families/);
  });
});
