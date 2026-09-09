/**
 * RT05 — one document, one effective compile, on every door that admits it.
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
 * Both arms are asserted here. The PUBLICATION arm proves the terminals expand
 * once and project the artifact's runtime metadata and its CSS from that one
 * effective document. The PREVIEW arm — the twelve door-versus-published and
 * door-versus-door cases R2 routed to the R1 integration — proves the door
 * itself expands, so previewing a profile shows what publishing it compiles.
 * Every document here is a v1 row, which carries no plan: the parity holds
 * without an entitlement to judge, and the v2 cases below add the plan leg.
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
  TenantThemeArtifact,
  TenantThemeConfigIdentity,
  TenantThemeDocument,
} from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import {
  compileThemeIntent,
  documentThemeIntent,
  previewThemeIntent,
} from "@/infrastructure/compilers/runtime/theme";
import { compileTenantThemeConfig, getTenantThemeVerticalEnvelope } from "..";
import { compileTenantThemeDocumentV2 } from "../document-v2";

const VERTICALS: readonly FirstPartyVerticalId[] = ["rottay", "bithire", "evnto"];
const PROFILES = [
  "rottay/bithire-technical@1",
  "rottay/management-editorial@1",
] as const;
const PLANS = ["standard", "pro", "internal"] as const;

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

function differences(
  door: Readonly<Record<string, string>>,
  published: Readonly<Record<string, string>>
): readonly string[] {
  const keys = new Set([...Object.keys(door), ...Object.keys(published)]);
  return [...keys].filter((key) => door[key] !== published[key]).sort();
}

/** The v2 transport previewing the same selection, under a stated plan. */
function previewV2Variables(
  plan: (typeof PLANS)[number],
  profile: string
): Readonly<Record<string, string>> {
  const { delta } = compileThemeIntent(
    previewThemeIntent({
      vertical: "bithire",
      slug: "acme",
      document: { version: 2, plan, decisions: { "experience.profile": profile } },
    })
  );
  if (!delta) throw new Error("the door measured no delta");
  return delta.variables;
}

/** The v2 transport publishing the same selection, under a stated plan. */
function publishV2(plan: (typeof PLANS)[number], profile: string) {
  return compileTenantThemeDocumentV2({
    ...identity("bithire"),
    verticalKey: "bithire",
    document: { version: 2, plan, decisions: { "experience.profile": profile } },
  });
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
    expect(
      differences(
        doorVariables("bithire", withoutProfile),
        publishedVariables("bithire", withoutProfile)
      )
    ).toEqual([]);
    expect(publishedVariables("bithire", withoutProfile)["--ds-radius-scale"]).not.toBe(
      "1.15"
    );
    expect(publishedVariables("bithire", withProfile)["--ds-radius-scale"]).toBe(
      "1.15"
    );
    expect(publish("bithire", withoutProfile).digest).toBe(
      publish("bithire", withoutProfile).digest
    );
    // No `profile-derived` entry survives the removal, and the row keeps its
    // own direct authorship on both sides.
    const classesOf = (document: TenantThemeDocument) =>
      (publish("bithire", document).provenance?.entries ?? []).map(
        (entry) => entry.provenance
      );
    expect(classesOf(withoutProfile)).toEqual(["direct-override"]);
    expect(classesOf(withProfile)).toContain("profile-derived");
    expect(classesOf(withProfile)).toContain("direct-override");
  });

  /**
   * Anti-regression 1 of the contract: the expansion may never manufacture
   * authorship. A Standard row that selects a profile carries no directly
   * authored typographic decision, however many typographic leaves the
   * profile's defaults reach.
   */
  it("publishes a Standard profile selection without inventing typographic authorship", () => {
    const { ledger } = publishV2("standard", "rottay/management-editorial@1");
    expect(
      ledger.entries
        .filter((entry) => entry.provenance === "direct-override")
        .map((entry) => entry.ref)
    ).toEqual([{ kind: "decision", id: "experience.profile" }]);
    expect(
      ledger.entries.some((entry) => entry.provenance === "profile-derived")
    ).toBe(true);
  });

  /**
   * The cross-plan leg, `standard` included.
   *
   * The `standard` case used to be pinned as a known refusal: the tier station
   * inferred decisions from merged patch leaves, so the font families the
   * profile's pairing expands into read as an authored Pro `typography.families`
   * and a Standard tenant could not select a profile at all. The station now
   * judges the gate's ledger, where a profile default is `profile-derived` and
   * authorship is never invented by an expansion (I-P0/I-T4), so the three plans
   * compile one effective configuration to one result.
   */
  it("the same effective configuration compiles the same under every entitled plan", () => {
    const base = previewV2Variables("standard", "rottay/management-editorial@1");
    for (const plan of PLANS) {
      expect(previewV2Variables(plan, "rottay/management-editorial@1")).toEqual(
        base
      );
    }
    expect(base["--ds-radius-scale"]).toBe("1.15");
  });

  it("the same effective configuration publishes the same under every entitled plan", () => {
    const base = publishV2("standard", "rottay/management-editorial@1").artifact;
    for (const plan of PLANS) {
      expect(
        publishV2(plan, "rottay/management-editorial@1").artifact.variables
      ).toEqual(base.variables);
    }
    expect(base.variables["--ds-radius-scale"]).toBe("1.15");
  });

  /**
   * The clamp leg. A profile default is NARROWED by the envelope the caller
   * publishes under -- never refused, because the tenant did not author it --
   * and the door that previews must be handed the same envelope, or an editor
   * would show a value the publish would clamp away.
   */
  it("clamps a profile default into the caller's envelope on both doors", () => {
    const registered = getTenantThemeVerticalEnvelope("bithire")!;
    const narrowed = {
      ...registered,
      ranges: { ...registered.ranges, radiusScale: { min: 0.9, max: 1 } },
    };
    const document = profileDocument("rottay/management-editorial@1");
    const published = compileTenantThemeConfig(
      { ...document, ...identity("bithire") },
      { verticalEnvelope: narrowed }
    );
    const { delta } = compileThemeIntent(
      previewThemeIntent({
        vertical: "bithire",
        slug: "acme",
        document,
        ranges: narrowed.ranges,
      })
    );
    expect(published.variables["--ds-radius-scale"]).toBe("1");
    expect(delta?.variables["--ds-radius-scale"]).toBe("1");
    expect(differences(delta!.variables, published.variables)).toEqual([]);
    // Without the envelope the preview would show the registered vertical's
    // clamp, which is the whole reason the door takes one.
    expect(
      doorVariables("bithire", document)["--ds-radius-scale"]
    ).toBe("1.15");
  });

  it("previews a v2 profile document exactly as it publishes it", () => {
    for (const plan of PLANS) {
      expect(
        differences(
          previewV2Variables(plan, "rottay/management-editorial@1"),
          publishV2(plan, "rottay/management-editorial@1").artifact.variables
        )
      ).toEqual([]);
    }
  });
});
