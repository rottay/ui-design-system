/**
 * `palette.contrast-posture` acceptance: what a raised posture may do to a
 * compiled block, and what it may never do.
 *
 * Two halves, one decision. The FLOOR half holds the posture to its own
 * promise: asking for more contrast must raise the derived ink or leave it
 * alone, never withdraw it. A withdrawn channel is not neutral -- the cascade
 * fallback that takes its place is unmeasured, and on bithire's dark primary
 * it reads worse than the ink that was withheld, so the posture that asked
 * for MORE delivered LESS. The TINT half holds the posture to one owner:
 * every producer of the status tints reads the posture's mix strengths, so a
 * tenant cannot get the posture's separator in one block and the identity's
 * in another.
 */
import { describe, expect, it } from "vitest";

import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";
import type { TenantThemeDocument } from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import type { TenantThemeDocumentV2 } from "@/contracts/theme/presentation/document";
import { contrastRatio, isHexColor } from "@/foundation/kernel/color/contrast";
import { bithireBrandTheme } from "@/foundation/tokens/ts/presentation/brand-themes/bithire";
import {
  compileThemeIntent,
  type ThemeCompilation,
} from "@/infrastructure/compilers/runtime/theme";
import { documentThemeIntent } from "@/infrastructure/compilers/runtime/theme/runtime/ingress";
import { CONTRAST_POSTURES } from "@/infrastructure/compilers/runtime/theme/runtime/lowering/runtime/derivation/palette/contrast-posture";
import { lowerBrandThemeFixture } from "@tests/support/theme-lowering";

// ── The floor half: a raised posture never lowers a measured ratio ─────────

/** Every ink this family derives, with the ground it is read against. */
const INK_OVER_GROUND = [
  ["--ds-color-primary-foreground", "--ds-color-primary"],
  ["--ds-color-on-success", "--ds-color-success"],
  ["--ds-color-on-warning", "--ds-color-warning"],
  ["--ds-color-on-error", "--ds-color-error"],
  ["--ds-color-on-info", "--ds-color-info"],
] as const;

const bithireAt = (contrastPosture: string) =>
  lowerBrandThemeFixture({
    brandTheme: {
      ...bithireBrandTheme,
      palette: { ...bithireBrandTheme.palette, contrastPosture },
    } as BrandTheme,
    tenantSlug: "bithire",
  });

/**
 * What a block actually renders for a channel: its own value, or -- when the
 * block states none -- the one it inherits from the base block. A withdrawn
 * channel therefore measures as whatever the reader would really see, which
 * is the whole point of the assertion below.
 */
function rendered(
  compiled: ReturnType<typeof bithireAt>,
  mode: string | null,
  channel: string
): string | undefined {
  if (mode === null) return compiled.cssVariables[channel];
  const block = compiled.modeBlocks?.find((candidate) => candidate.mode === mode);
  return block?.cssVariables[channel] ?? compiled.cssVariables[channel];
}

/** The measured ratio a block renders for one ink/ground pair. */
function renderedRatio(
  compiled: ReturnType<typeof bithireAt>,
  mode: string | null,
  ink: string,
  ground: string
): number {
  const inkValue = rendered(compiled, mode, ink);
  const groundValue = rendered(compiled, mode, ground);
  expect(inkValue, `${ink} in ${mode ?? "base"}`).toBeDefined();
  expect(groundValue, `${ground} in ${mode ?? "base"}`).toBeDefined();
  expect(isHexColor(inkValue!), `${ink} is measurable`).toBe(true);
  expect(isHexColor(groundValue!), `${ground} is measurable`).toBe(true);
  return contrastRatio(inkValue!, groundValue!);
}

describe("a raised contrast posture never lowers a rendered ratio", () => {
  const standard = bithireAt("standard");
  const high = bithireAt("high");

  it.each(["base", "dark"] as const)(
    "%s: every derived ink reads at least as hard under `high` as under `standard`",
    (block) => {
      const mode = block === "base" ? null : block;
      for (const [ink, ground] of INK_OVER_GROUND) {
        expect(
          renderedRatio(high, mode, ink, ground),
          `${ink} over ${ground} in ${block}`
        ).toBeGreaterThanOrEqual(renderedRatio(standard, mode, ink, ground));
      }
    }
  );

  /**
   * The measured repro, pinned so a revert cannot pass the comparison above
   * by lowering both arms together: bithire's dark primary is `#1e84e6`, no
   * pure ink over it clears the posture's 7:1, and the block the posture
   * withdrew the channel from inherits a base `#ffffff` that reads 3.82:1 --
   * below AA, and below the 4.69:1 the `standard` arm derives.
   */
  it("bithire dark keeps a foreground at or above AA when no ink clears 7:1", () => {
    const ground = rendered(high, "dark", "--ds-color-primary");
    expect(ground).toBe("#1e84e6");
    for (const pure of [CONTRAST_POSTURES.high.inkLight, CONTRAST_POSTURES.high.inkDark]) {
      expect(contrastRatio(pure, ground!)).toBeLessThan(CONTRAST_POSTURES.high.minimumRatio);
    }
    const measured = renderedRatio(high, "dark", "--ds-color-primary-foreground", "--ds-color-primary");
    expect(measured).toBeGreaterThanOrEqual(CONTRAST_POSTURES.standard.minimumRatio);
    expect(measured).toBeGreaterThanOrEqual(
      renderedRatio(standard, "dark", "--ds-color-primary-foreground", "--ds-color-primary")
    );
    expect(rendered(high, "dark", "--ds-color-primary-foreground")).not.toBe(
      rendered(high, null, "--ds-color-primary-foreground")
    );
  });
});

// ── The tint half: one posture, one set of mix strengths, every block ──────

const v2 = (decisions: TenantThemeDocumentV2["decisions"]): TenantThemeDocumentV2 => ({
  version: 2,
  plan: "internal",
  decisions,
});

/** The tenant document Fable's repro authors: a status seed, at a posture. */
const rottayAt = (
  contrastPosture: NonNullable<
    TenantThemeDocumentV2["decisions"]["palette.contrast-posture"]
  >
): ThemeCompilation =>
  compileThemeIntent(
    documentThemeIntent({
      vertical: "rottay",
      slug: "posture-tenant",
      document: v2({
        "palette.contrast-posture": contrastPosture,
        "palette.status-seeds": { success: "#10B981" },
      }) as unknown as TenantThemeDocument,
    })
  ).compiled;

/**
 * The status-tint channels the tint owner mixes for one tone -- the separator
 * and the two washes. `-bg` is excluded because it names the ramp step
 * directly and carries no mix strength to govern.
 */
const SUCCESS_TINT_CHANNELS = [
  "--ds-color-success-border",
  "--ds-color-alpha-success-10",
  "--ds-color-alpha-success-20",
] as const;

/** Every success-tint value the compilation states, base block and overlays. */
function successTints(compiled: ThemeCompilation): string[] {
  const blocks = [compiled.cssVariables, ...(compiled.modeBlocks ?? []).map((b) => b.cssVariables)];
  return blocks.flatMap((vars) =>
    SUCCESS_TINT_CHANNELS.map((channel) => vars[channel]).filter(
      (value): value is string => value?.startsWith("color-mix") ?? false
    )
  );
}

/** The mix percentage a `color-mix` tint survives at. */
const mixStrengths = (values: string[]) =>
  [...new Set(values.map((value) => Number(/ (\d+)%,/u.exec(value)?.[1])))].sort((a, b) => a - b);

describe("one posture governs the status tints in every block that states them", () => {
  it("the `high` document states the posture's strengths and no other", () => {
    const tints = successTints(rottayAt("high"));
    expect(tints.length).toBeGreaterThan(0);
    expect(mixStrengths(tints)).toEqual(
      [CONTRAST_POSTURES.high.washMix, CONTRAST_POSTURES.high.separatorMix].sort((a, b) => a - b)
    );
    // The block the tenant's own seed reaches is the one the second producer
    // used to re-author at the identity strengths; naming it keeps the
    // assertion above from passing on some other block's tint. On rottay that
    // is the BASE block: an unselected seed tunes the mode the vertical
    // renders, and rottay renders dark.
    expect(rottayAt("high").cssVariables["--ds-color-alpha-success-20"]).toBe(
      `color-mix(in srgb, var(--ds-color-success) ${CONTRAST_POSTURES.high.separatorMix}%, transparent)`
    );
  });

  it("`standard` is the identity: the same document states 20 %/10 % throughout", () => {
    expect(mixStrengths(successTints(rottayAt("standard")))).toEqual([
      CONTRAST_POSTURES.standard.washMix,
      CONTRAST_POSTURES.standard.separatorMix,
    ]);
  });

  it("never resurrects the retired `--ds-color-alpha-info-20`", () => {
    for (const posture of ["standard", "high"] as const) {
      const compiled = compileThemeIntent(
        documentThemeIntent({
          vertical: "rottay",
          slug: "posture-tenant",
          document: v2({
            "palette.contrast-posture": posture,
            "palette.status-seeds": { info: "#10B981" },
          }) as unknown as TenantThemeDocument,
        })
      ).compiled;
      for (const vars of [compiled.cssVariables, ...(compiled.modeBlocks ?? []).map((b) => b.cssVariables)]) {
        expect(vars["--ds-color-alpha-info-20"]).toBeUndefined();
      }
    }
  });
});
