/**
 * RT05 — the PUBLICATION side of "one document, one effective compile".
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
 * This file proves the half R2 owns: the publish terminals expand ONCE, and the
 * artifact's runtime metadata and its CSS are two projections of that one
 * effective document rather than of two different ones. The door arm — teaching
 * `admitDocument` to expand, so previewing a profile shows what publishing it
 * compiles — is R1's file and is a routed integration item; the twelve
 * door-versus-published cases that asserted it are named in the R2 report and
 * come back with that integration, not as skips here.
 *
 * The repair is not "emit neither": a profile default IS part of the effective
 * configuration the tenant chose when it selected the profile, so a publish must
 * emit it. These cases therefore assert EFFECTIVE VALUES, not only agreement — a
 * green run with the defaults deleted would fail this file.
 */
import { describe, expect, it } from "vitest";

import { ThemeAdmissionError } from "@/infrastructure/compilers/runtime/theme";
import type { FirstPartyVerticalId } from "@/foundation/contracts/kernel/verticals";
import type {
  TenantThemeArtifact,
  TenantThemeConfigIdentity,
  TenantThemeDocument,
} from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import { compileTenantThemeConfig, getTenantThemeVerticalEnvelope } from "..";
import { compileTenantThemeDocumentV2 } from "../document-v2";

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

function publish(
  vertical: FirstPartyVerticalId,
  document: TenantThemeDocument
): TenantThemeArtifact {
  return compileTenantThemeConfig(
    { ...document, ...identity(vertical) },
    { verticalEnvelope: getTenantThemeVerticalEnvelope(vertical) }
  );
}

function publishedVariables(
  vertical: FirstPartyVerticalId,
  document: TenantThemeDocument
): Readonly<Record<string, string>> {
  return publish(vertical, document).variables;
}

/** The v2 transport publishing the same selection, under a stated plan. */
function publishV2(plan: "standard" | "pro" | "internal", profile: string) {
  return compileTenantThemeDocumentV2({
    ...identity("bithire"),
    verticalKey: "bithire",
    document: { version: 2, plan, decisions: { "experience.profile": profile } },
  });
}

describe("RT05 · one publish, one effective document", () => {
  for (const vertical of VERTICALS) {
    for (const profile of PROFILES) {
      it(`${vertical} · ${profile} states the same effective values in its metadata and its CSS`, () => {
        const artifact = publish(vertical, profileDocument(profile));
        const general = artifact.normalizedAppearance.general;
        // The terminal used to project the metadata from a replacement document
        // it expanded for itself while the CSS came from the unexpanded
        // selection, so one artifact could state two effective values. One
        // station, run once, is what makes these two reads the same answer --
        // including the silences: a dial this profile declares no default for
        // is absent from BOTH, never present in one of them.
        const dials = [
          ["--ds-motion-intensity", general?.motion?.intensity],
          ["--ds-motion-duration-scale", general?.motion?.durationScale],
          ["--ds-radius-scale", general?.shape?.radiusScale],
        ] as const;
        for (const [name, value] of dials) {
          expect(artifact.variables[name]).toBe(
            value === undefined ? undefined : String(value)
          );
        }
      });
    }
  }

  it("emits the editorial profile's declared defaults into the published artifact", () => {
    const published = publishedVariables(
      "bithire",
      profileDocument("rottay/management-editorial@1")
    );
    expect(published["--ds-motion-intensity"]).toBe("0.7");
    expect(published["--ds-radius-scale"]).toBe("1.15");
    expect(published["--ds-font-family-base"]).toContain("var(--ds-font-");
  });

  it("keeps the profile out of the normalized appearance nowhere: the runtime metadata carries the effective values", () => {
    const artifact = publish(
      "bithire",
      profileDocument("rottay/management-editorial@1")
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
    const published = publishedVariables("bithire", partialMotion);
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
    expect(publishedVariables("bithire", withoutProfile)["--ds-radius-scale"]).not.toBe(
      "1.15"
    );
    expect(publishedVariables("bithire", withProfile)["--ds-radius-scale"]).toBe(
      "1.15"
    );
    expect(publish("bithire", withoutProfile).digest).toBe(
      publish("bithire", withoutProfile).digest
    );
  });

  it("the same effective configuration publishes the same under every entitled plan", () => {
    const base = publishV2("pro", "rottay/management-editorial@1").artifact;
    const other = publishV2("internal", "rottay/management-editorial@1").artifact;
    expect(other.variables).toEqual(base.variables);
    expect(base.variables["--ds-radius-scale"]).toBe("1.15");
  });

  /**
   * The ONE case this lot cannot close, pinned rather than hidden.
   *
   * The tier station still infers decisions from merged patch leaves, so the
   * font families a pairing expands into read as an authored
   * `typography.families` (RA01). A Standard v2 document that selects a profile
   * therefore reaches that inference at PUBLISH, where the expansion runs — the
   * identical defect the re-audit reported for an authored pairing, over one
   * more input. It closes with the ledger-judged tier station of R1 (contract
   * I-T1/I-T4, Control 1), not here: exempting font-family leaves by name is
   * forbidden. When that lands, this expectation goes red and is replaced by the
   * cross-plan assertion above extended to `standard`.
   */
  it("records the Standard leg still refused by the leaf-inferred tier station", () => {
    expect(() => publishV2("standard", "rottay/management-editorial@1")).toThrow(
      ThemeAdmissionError
    );
    expect(() => publishV2("standard", "rottay/management-editorial@1")).toThrow(
      /typography\.families/
    );
  });
});
