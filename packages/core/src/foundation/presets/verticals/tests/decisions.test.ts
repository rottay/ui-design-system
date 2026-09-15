import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { THEME_DECISION_IDS } from "@/contracts/theme/foundation/decisions";
import { assertTenantThemeDocumentV2, type TenantThemeDocumentV2 } from "@/contracts/theme/presentation/document";
import { THEME_CONTROL_CATALOG } from "@/contracts/theme/runtime/catalog";
import { contrastRatio } from "@/foundation/kernel/color/contrast";
import { BITHIRE_IDENTITY_CANDIDATES, bithireIdentityCandidate } from "@/foundation/presets/candidates/bithire";
import { FIRST_PARTY_VERTICALS } from "@/foundation/presets/verticals/roster";
import { compileTenantThemeDocumentV2 } from "@/infrastructure/compilers/composition/tenant-theme/document-v2";
import { admitDocument } from "@/infrastructure/compilers/runtime/theme/runtime/ingress/runtime/document-v2/presentation/admission";
import { compileThemeIntent, staticThemeIntent } from "@/infrastructure/compilers/runtime/theme";

import { VERTICAL_THEME_PRESETS, getVerticalThemePreset, type VerticalThemePreset } from "..";

type FirstParty = "rottay" | "bithire" | "evnto";
const VERTICALS: readonly FirstParty[] = ["rottay", "bithire", "evnto"];
const ARTIFACTS = resolve(__dirname, "../../../tokens/css/facade/artifacts");

const documentOf = (preset: VerticalThemePreset): TenantThemeDocumentV2 =>
  assertTenantThemeDocumentV2(preset.document);

function compile(vertical: FirstParty, document: TenantThemeDocumentV2) {
  const { artifact } = compileTenantThemeDocumentV2({
    document,
    tenantId: `wo-der-06-${vertical}`,
    slug: `preset-${vertical}`,
    verticalKey: vertical,
    rowVersion: 1,
  });
  const dark = artifact.modeDeltas?.find((delta) => delta.mode === "dark");
  return {
    base: artifact.variables as Readonly<Record<string, string>>,
    dark: (dark?.variables ?? {}) as Readonly<Record<string, string>>,
    effectiveDark: { ...artifact.variables, ...(dark?.variables ?? {}) } as Readonly<Record<string, string>>,
  };
}

/** A shipped artifact's value for one channel, inside its `Compiled from Theme.modes.dark` block or the base block. */
function shippedValue(vertical: FirstParty, channel: string, mode: "base" | "dark"): string | undefined {
  const css = readFileSync(resolve(ARTIFACTS, vertical, "index.css"), "utf8");
  const marker = css.indexOf("Compiled from Theme.modes.dark");
  const haystack = mode === "dark" ? css.slice(marker) : css.slice(0, marker);
  const match = new RegExp(`${channel}:\\s*([^;]+);`, "u").exec(haystack);
  return match?.[1]?.trim();
}

const ratio = (a: string | undefined, b: string | undefined): number | null =>
  a && b && /^#[0-9a-f]{6}$/iu.test(a) && /^#[0-9a-f]{6}$/iu.test(b) ? Number(contrastRatio(a, b).toFixed(2)) : null;

describe("WO-DER-06 — the first-party verticals as decisions", () => {
  it("every first-party vertical has a preset on the internal seat whose document passes the door", () => {
    expect(Object.keys(VERTICAL_THEME_PRESETS).sort()).toEqual([...VERTICALS].sort());
    for (const vertical of VERTICALS) {
      const preset = getVerticalThemePreset(vertical)!;
      expect(preset.vertical).toBe(vertical);
      expect(preset.plan).toBe("internal");
      expect(preset.manifest.workOrder).toBe("WO-DER-06");
      const document = documentOf(preset);
      expect(document.plan).toBe("internal");
      expect(document.overrides).toBeUndefined();
      expect(preset.manifest.overrideReasons).toEqual({});
      const admission = admitDocument({ vertical, document });
      expect(admission.version).toBe(2);
      expect(admission.decisions.length).toBe(Object.keys(document.decisions).length);
    }
    expect(getVerticalThemePreset("platform")).toBeUndefined();
  });

  it("every decision value sits inside its closed catalog domain; nothing is free text or a raw channel", () => {
    const rows = new Map(THEME_CONTROL_CATALOG.map((row) => [row.id, row]));
    for (const vertical of VERTICALS) {
      const { decisions } = documentOf(getVerticalThemePreset(vertical)!);
      for (const [id, value] of Object.entries(decisions)) {
        expect(THEME_DECISION_IDS).toContain(id);
        const domain = rows.get(id as never)!.domain as { kind: string; values?: readonly string[]; bounds?: { min: number; max: number }; roles?: readonly string[]; keys?: readonly string[] };
        if (domain.kind === "enum") expect(domain.values).toContain(value);
        if (domain.kind === "scale") {
          expect(typeof value).toBe("number");
          expect(value as number).toBeGreaterThanOrEqual(domain.bounds!.min);
          expect(value as number).toBeLessThanOrEqual(domain.bounds!.max);
        }
        if (domain.kind === "color-set") for (const [role, seed] of Object.entries(value as Record<string, string>)) {
          expect(domain.roles).toContain(role);
          expect(seed).toMatch(/^#[0-9A-Fa-f]{6}$/u);
        }
        if (domain.kind === "record") for (const key of Object.keys(value as object)) expect(domain.keys).toContain(key);
        expect(JSON.stringify(value)).not.toMatch(/--ds-|var\(/u);
      }
    }
  });

  it("bithire is the WO-DER-07 product-dense candidate verbatim, provisional under D-30, and the only candidate inside the roster's font packs", () => {
    const preset = getVerticalThemePreset("bithire")!;
    const chosen = assertTenantThemeDocumentV2(bithireIdentityCandidate("product-dense").document);
    expect(documentOf(preset).decisions).toEqual(chosen.decisions);
    expect(preset.manifest.provenance.provisional).toMatch(/D-30/u);
    expect(preset.manifest.provenance.source).toMatch(/product-dense/u);

    const shipped = new Set(FIRST_PARTY_VERTICALS.bithire.fontPacks);
    const packsOf = (id: string) =>
      Object.values(assertTenantThemeDocumentV2(bithireIdentityCandidate(id).document).decisions["typography.families"] ?? {});
    expect(packsOf("product-dense").every((pack) => shipped.has(pack as never))).toBe(true);
    const outside = BITHIRE_IDENTITY_CANDIDATES.filter((candidate) => !packsOf(candidate.id).every((pack) => shipped.has(pack as never))).map((candidate) => candidate.id);
    expect(outside.sort()).toEqual(["editorial-quiet", "warm-humanist"]);

    const decisions = documentOf(preset).decisions;
    expect(decisions["palette.contrast-posture"]).toBe("high");
    expect(decisions["typography.role-weights"]).toBe("strong");
    expect(decisions["states.emphasis"]).toBe("strong");
    expect(decisions["surfaces.border-style"]).toBe("strong");
  });

  it("rottay and evnto carry structure only: no palette, family, pairing, profile or recipe decision", () => {
    const identityRows = [
      "palette.seeds", "palette.status-seeds", "palette.neutral-temperature", "palette.contrast-posture", "palette.dark-mode",
      "typography.families", "typography.pairing", "experience.profile", "profiles.expressive", "recipe-profile", "chrome.anatomy",
    ];
    for (const vertical of ["rottay", "evnto"] as const) {
      const { decisions } = documentOf(getVerticalThemePreset(vertical)!);
      for (const id of identityRows) expect(decisions).not.toHaveProperty(id);
      expect(Object.keys(decisions).length).toBe(18);
      expect(decisions["typography.scale"]).toBe(1);
      expect(decisions["shape.radius-scale"]).toBe(1);
      expect(decisions["density.mode"]).toBe("normal");
    }
    expect(documentOf(getVerticalThemePreset("rottay")!).decisions).toEqual(documentOf(getVerticalThemePreset("evnto")!).decisions);
  });

  it("the three presets compile for their vertical through the v2 door", () => {
    // D6-2c-ii (2026-09-15): tenant-document compiles over neutral + preset.
    // `artifact.variables` is the tenant DELTA over the vertical baseline, and
    // the preset document IS that baseline now, so re-sending it as a tenant
    // of its own vertical moves nothing: base delta > 0 -> exactly 0. The door
    // is proven to compile by the vertical's own full compile instead, which
    // is what the old assertion was standing in for.
    for (const vertical of VERTICALS) {
      const { compiled: full } = compileThemeIntent(staticThemeIntent(vertical));
      expect(Object.keys(full.cssVariables).length).toBeGreaterThan(100);

      const compiled = compile(vertical, documentOf(getVerticalThemePreset(vertical)!));
      expect(Object.keys(compiled.dark)).toEqual([]);
      if (vertical === "bithire") continue;
      expect(Object.keys(compiled.base)).toEqual([]);
    }
  });

  // WO-DER-06 derivation-lane registry (D6-2c-ii, 2026-09-15):
  // --ds-radius-button and --ds-button-{xs,sm,md,lg,xl}-radius; pinned to the
  // measured state until the lane lands. Re-sending bithire's own preset as a
  // tenant document emits six button-radius channels the vertical baseline
  // does not, which is this regression seen from the other side: the six are
  // reachable on the document transport and unreachable on the static one.
  it("bithire's preset as a tenant moves only the registered button-radius channels", () => {
    const compiled = compile("bithire", documentOf(getVerticalThemePreset("bithire")!));
    expect(Object.keys(compiled.base).sort()).toEqual([
      "--ds-button-lg-radius",
      "--ds-button-md-radius",
      "--ds-button-sm-radius",
      "--ds-button-xl-radius",
      "--ds-button-xs-radius",
      "--ds-radius-button",
    ]);
  });

  describe("contrast, measured at decision level (the two flags routed to WO-DER-06)", () => {
    it("bithire dark: the authored --ds-input-error-color (1.08:1 under axe) is not decision-derived and no longer ships; the invalid input reads its own ink and the message the error seed", () => {
      // The 1.08:1 "before" was measured on the authored bundle, which no
      // longer ships the channel at all -- so the live half of "no longer
      // ships" is asserted instead of re-reading a value that is gone.
      expect(shippedValue("bithire", "--ds-input-error-color", "base")).toBeUndefined();
      const compiled = compile("bithire", documentOf(getVerticalThemePreset("bithire")!));
      expect(compiled.base["--ds-input-error-color"]).toBeUndefined();
      expect(compiled.dark["--ds-input-error-color"]).toBeUndefined();
      // Measured on the SHIPPED baseline, which is what a user gets: compiling
      // the preset's own document as a tenant is a delta over itself and is
      // empty by construction. The dark scope does not restate the ground --
      // the mode-palette seeding gap already registered against this WO -- so
      // the ground the dark scope resolves is the base one, and that is what
      // the replacement ink is measured against.
      const bg =
        shippedValue("bithire", "--ds-color-bg-primary", "dark") ??
        shippedValue("bithire", "--ds-color-bg-primary", "base");
      const error =
        shippedValue("bithire", "--ds-color-error", "dark") ??
        shippedValue("bithire", "--ds-color-error", "base");
      const after = ratio(error, bg);
      console.info(`[WO-DER-06 contrast] bithire dark invalid input: before 1.08:1 (#14283B authored, recorded); after: channel absent, message ink --ds-color-error ${error} on ${bg} = ${after}:1`);
      expect(after).not.toBeNull();
      expect(after!).toBeGreaterThanOrEqual(3);
    });

    it("evnto dark: --ds-color-primary-600 (2.27:1 under axe) is the baseline's dark ramp, which no kit decision reaches; the flag routes to the baseline retirement, not to an override", () => {
      // The 2.27:1 "before" was measured on the authored bundle. The baseline's
      // dark ramp is what the flag routed to, and the shipped bundle no longer
      // declares it, so absence is asserted and the recorded ratio is written.
      const shipped600 = shippedValue("evnto", "--ds-color-primary-600", "base");
      expect(shipped600).toBeUndefined();
      const neutral = documentOf(getVerticalThemePreset("evnto")!);
      const withoutSeeds = compile("evnto", neutral);
      const withSeeds = compile("evnto", {
        ...neutral,
        decisions: { ...neutral.decisions, "palette.seeds": { primary: "#2F5BE8", secondary: "#0F172A", accent: "#06A6C4", background: "#FFFFFF" } },
      });
      console.info(`[WO-DER-06 contrast] evnto dark button text/link: before 2.27:1 (recorded); decisions reach --ds-color-primary-600 in light (${withSeeds.base["--ds-color-primary-600"]}) and in dark (${withSeeds.dark["--ds-color-primary-600"]}); without seeds neither ramp is emitted`);
      // Without palette decisions no ramp is emitted at all.
      expect(withoutSeeds.dark["--ds-color-primary-600"]).toBeUndefined();
      expect(withoutSeeds.base["--ds-color-primary-600"]).toBeUndefined();
      // With seeds BOTH ramps derive, and they differ: the dark ramp is no
      // longer the baseline's frozen grey the flag was raised against.
      expect(withSeeds.base["--ds-color-primary-600"]).toBeDefined();
      expect(withSeeds.dark["--ds-color-primary-600"]).toBeDefined();
      expect(withSeeds.dark["--ds-color-primary-600"]).not.toBe(
        withSeeds.base["--ds-color-primary-600"],
      );
    });
  });
});
