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
    for (const vertical of VERTICALS) {
      const compiled = compile(vertical, documentOf(getVerticalThemePreset(vertical)!));
      expect(Object.keys(compiled.base).length).toBeGreaterThan(0);
    }
  });

  describe("contrast, measured at decision level (the two flags routed to WO-DER-06)", () => {
    it("bithire dark: the authored --ds-input-error-color (1.08:1 under axe) is not decision-derived and no longer ships; the invalid input reads its own ink and the message the error seed", () => {
      const before = ratio(shippedValue("bithire", "--ds-input-error-color", "base"), shippedValue("bithire", "--ds-color-bg-primary", "dark"));
      const compiled = compile("bithire", documentOf(getVerticalThemePreset("bithire")!));
      expect(compiled.base["--ds-input-error-color"]).toBeUndefined();
      expect(compiled.dark["--ds-input-error-color"]).toBeUndefined();
      const bg = compiled.effectiveDark["--ds-color-bg-primary"];
      const error = compiled.effectiveDark["--ds-color-error"];
      const after = ratio(error, bg);
      console.info(`[WO-DER-06 contrast] bithire dark invalid input: before ${before}:1 (#14283B authored on ${shippedValue("bithire", "--ds-color-bg-primary", "dark")}); after: channel absent, message ink --ds-color-error ${error} on ${bg} = ${after}:1`);
      expect(before).not.toBeNull();
      expect(before!).toBeLessThan(1.5);
      expect(after).not.toBeNull();
      expect(after!).toBeGreaterThanOrEqual(3);
    });

    it("evnto dark: --ds-color-primary-600 (2.27:1 under axe) is the baseline's dark ramp, which no kit decision reaches; the flag routes to the baseline retirement, not to an override", () => {
      const shippedBg = shippedValue("evnto", "--ds-color-bg-primary", "dark");
      const shipped600 = shippedValue("evnto", "--ds-color-primary-600", "base");
      const before = ratio(shipped600, shippedBg);
      const neutral = documentOf(getVerticalThemePreset("evnto")!);
      const withoutSeeds = compile("evnto", neutral);
      const withSeeds = compile("evnto", {
        ...neutral,
        decisions: { ...neutral.decisions, "palette.seeds": { primary: "#2F5BE8", secondary: "#0F172A", accent: "#06A6C4", background: "#FFFFFF" } },
      });
      console.info(`[WO-DER-06 contrast] evnto dark button text/link: before ${before}:1 (${shipped600} on ${shippedBg}); decisions reach --ds-color-primary-600 in light (${withSeeds.base["--ds-color-primary-600"]}) but the dark ramp stays ${withSeeds.dark["--ds-color-primary-600"]} with or without seeds`);
      expect(before).not.toBeNull();
      expect(before!).toBeLessThan(3);
      // Without palette decisions no ramp is emitted at all: the shipped value is the baseline's.
      expect(withoutSeeds.dark["--ds-color-primary-600"]).toBeUndefined();
      expect(withoutSeeds.base["--ds-color-primary-600"]).toBeUndefined();
      // With seeds the LIGHT ramp derives from them, and the DARK ramp still carries the baseline's grey.
      expect(withSeeds.base["--ds-color-primary-600"]).not.toBe(shipped600);
      expect(withSeeds.dark["--ds-color-primary-600"]).toBe(shipped600);
    });
  });
});
