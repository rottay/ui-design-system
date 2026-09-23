/**
 * `prefers-contrast: more` on the DB artifact: the tenant's compile re-lowered
 * at the high contrast posture, emitted as a media delta over its resting rules.
 *
 * The fixture rests at `standard` with status seeds light enough that the
 * readable-ink solver picks the DARK ink. That is what makes the on-tone inks
 * move: the light ink is `#ffffff` in both postures, so seeds that take the
 * light ink (bithire's own four) state the same ink at rest and under the
 * preference, and only the separator and wash mixes move.
 */
import { describe, expect, it } from "vitest";

import type { TenantThemeArtifact } from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import type { FirstPartyVerticalId } from "@/foundation/contracts/kernel/verticals";
import { compileThemeIntent, staticThemeIntent } from "@/infrastructure/compilers/runtime/theme";
import { verifyTenantThemeArtifactV1 } from "@/infrastructure/runtime/theming/foundation/visual-authority/foundation/admission";
import {
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
} from "../..";

const VERTICALS = ["bithire", "evnto", "rottay"] as const satisfies readonly FirstPartyVerticalId[];
const ON_TONE = ["success", "warning", "error", "info"].map((role) => `--ds-color-on-${role}`);

/** Light tones: the dark ink wins, `#171717` at rest and `#000000` under the preference. */
const DARK_INK_SEEDS = { success: "#4ADE80", warning: "#F59E0B", error: "#F87171", info: "#38BDF8" };
/** bithire's own seeds: the light ink wins in both postures. */
const LIGHT_INK_SEEDS = { success: "#16794A", warning: "#B45309", error: "#C62828", info: "#0369A1" };

function compileFixture(
  vertical: FirstPartyVerticalId,
  palette: Record<string, unknown>
): TenantThemeArtifact {
  return compileTenantThemeConfig(
    hydrateTenantThemeConfig(
      {
        schemaVersion: 1,
        mode: "advanced",
        visualFoundation: { general: { palette: { primary: "#315D4D", ...palette } } },
      } as never,
      { tenantId: "tenant_contrast_fixture", slug: "contrast-fixture", verticalKey: vertical, rowVersion: 1 }
    ),
    { verticalEnvelope: getTenantThemeVerticalEnvelope(vertical)! }
  );
}

function baselineOf(vertical: FirstPartyVerticalId) {
  return compileThemeIntent(staticThemeIntent(vertical, vertical)).compiled;
}

/** What a DB tenant's root resolves in one state, with or without the preference. */
function resolved(
  vertical: FirstPartyVerticalId,
  artifact: TenantThemeArtifact,
  mode: "light" | "dark" | undefined,
  moreContrast: boolean
): Record<string, string> {
  const baseline = baselineOf(vertical);
  const contrast = moreContrast ? (artifact.contrastDeltas ?? []) : [];
  return {
    ...baseline.cssVariables,
    ...baseline.modeBlocks.find((block) => block.mode === mode)?.cssVariables,
    ...artifact.variables,
    ...contrast.find((block) => block.mode === undefined)?.variables,
    ...artifact.modeDeltas?.find((block) => block.mode === mode)?.variables,
    ...contrast.find((block) => block.mode !== undefined && block.mode === mode)?.variables,
  };
}

describe("contrastDeltas: the fixture tenant at standard posture, under each vertical baseline", () => {
  for (const vertical of VERTICALS) {
    const artifact = compileFixture(vertical, { status: DARK_INK_SEEDS, contrastPosture: "standard" });
    const base = artifact.contrastDeltas?.find((block) => block.mode === undefined)?.variables ?? {};

    it(`${vertical}: the delta declares all four on-tone inks, each differing from the resolved resting value`, () => {
      const rest = resolved(vertical, artifact, undefined, false);
      for (const channel of ON_TONE) {
        expect(base[channel], channel).toBe("#000000");
        expect(rest[channel], channel).toBe("#171717");
      }
      for (const channel of ON_TONE) {
        expect(artifact.css).toMatch(new RegExp(`@media \\(prefers-contrast: more\\) \\{[^@]*${channel}: #000000;`));
      }
    });

    it(`${vertical}: under the preference every state resolves exactly as the same tenant compiled at high`, () => {
      const high = compileFixture(vertical, { status: DARK_INK_SEEDS, contrastPosture: "high" });
      expect(high.contrastDeltas).toBeUndefined();
      const modes = [undefined, ...baselineOf(vertical).modeBlocks.map((block) => block.mode)];
      expect(modes.length).toBe(2);
      for (const mode of modes) {
        expect(resolved(vertical, artifact, mode, true), `${mode ?? "base"} state`).toEqual(
          resolved(vertical, high, mode, false)
        );
      }
      expect(resolved(vertical, artifact, undefined, true)).not.toEqual(
        resolved(vertical, artifact, undefined, false)
      );
    });

    it(`${vertical}: the artifact carrying the block verifies at mount, and a tampered block does not`, () => {
      expect(verifyTenantThemeArtifactV1(structuredClone(artifact), { slug: "contrast-fixture" }).ok).toBe(true);
      const forged = structuredClone(artifact) as TenantThemeArtifact & { contrastDeltas: { mode?: string; variables: Record<string, string> }[] };
      forged.contrastDeltas[0] = { ...forged.contrastDeltas[0], mode: "base" };
      expect(verifyTenantThemeArtifactV1(forged, { slug: "contrast-fixture" })).toMatchObject({ ok: false });
      const repainted = structuredClone(artifact);
      repainted.css = repainted.css.replace("--ds-color-on-error: #000000;", "--ds-color-on-error: #171717;");
      expect(repainted.css).not.toBe(artifact.css);
      expect(verifyTenantThemeArtifactV1(repainted, { slug: "contrast-fixture" })).toMatchObject({ ok: false });
    });
  }
});

describe("contrastDeltas: no move, no block", () => {
  it("a tenant already at high emits zero bytes of the block", () => {
    for (const vertical of VERTICALS) {
      const artifact = compileFixture(vertical, { status: DARK_INK_SEEDS, contrastPosture: "high" });
      expect(artifact.contrastDeltas).toBeUndefined();
      expect(artifact.css).not.toContain("prefers-contrast");
    }
  });

  it("a tenant whose high posture equals its compiled posture emits no empty media rule", () => {
    // evnto authors no status seeds and the dark primary takes the light ink
    // in both postures, so re-lowering at high moves nothing.
    const artifact = compileFixture("evnto", { contrastPosture: "standard" });
    expect(artifact.contrastDeltas).toBeUndefined();
    expect(artifact.css).not.toContain("prefers-contrast");
    expect(artifact.css).not.toMatch(/@media[^{]*\{\s*\}/);
  });

  it("seeds that take the light ink move only the mixes, never the on-tone inks", () => {
    for (const vertical of VERTICALS) {
      const artifact = compileFixture(vertical, { status: LIGHT_INK_SEEDS, contrastPosture: "standard" });
      const base = artifact.contrastDeltas?.find((block) => block.mode === undefined)?.variables ?? {};
      for (const channel of ON_TONE) expect(base[channel], `${vertical} ${channel}`).toBeUndefined();
      expect(Object.keys(base).sort()).toEqual(
        Object.keys(base).filter((channel) => /-(border|alpha-[a-z]+-(10|20))$/.test(channel)).sort()
      );
      expect(Object.keys(base).length).toBe(11);
    }
  });
});
