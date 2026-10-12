/**
 * The scrim doors: every authored value that paints a scrim outside the ladder is
 * admitted and named on the admission, and the Pro strength door lowers into the
 * ladder or is refused by name.
 */
import { describe, expect, it } from "vitest";

import type { TenantThemeDocument } from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import { APP_PLATFORM_TENANT_ROWS } from "@/foundation/contracts/composition/tenants/themes/tenant-theme/fixtures/app-platform-rows";
import { FIRST_PARTY_VERTICAL_SLUGS } from "@/foundation/contracts/kernel/verticals";
import { VERTICAL_THEME_PRESETS } from "@/foundation/presets/verticals";
import {
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
} from "@/infrastructure/compilers/composition/tenant-theme";
import { TENANT_THEME_CHROME_FAMILIES } from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import { chromeLeafChannels } from "@/infrastructure/compilers/runtime/theme/facade/foundation/admission/foundation/references";
import {
  compileThemeIntent,
  emitThemeCss,
  tenantArtifactScope,
} from "@/infrastructure/compilers/runtime/theme";
import { PERSISTED_ROW_OVERRIDES } from "@tests/fixtures/tenants/raw-override-rows";
import { admitDocument, documentThemeIntent, ThemePatchMigrationError } from "../../..";

const v1Advanced = (advanced: Record<string, unknown>) =>
  ({ schemaVersion: 1, mode: "advanced", visualFoundation: { advanced } }) as unknown as TenantThemeDocument;
const v2Pro = (chrome: Record<string, unknown>, plan: "standard" | "pro" = "pro") =>
  ({ version: 2, plan, decisions: {}, overrides: { chrome } }) as never;

const doorsOf = (document: unknown) =>
  admitDocument({ vertical: "bithire", document: document as never }).scrimDoors;

describe("the scrim-door census on the admission", () => {
  it("names the stored row's three ladder colours and admits them", () => {
    const ladderRow = Object.fromEntries(
      Object.entries(PERSISTED_ROW_OVERRIDES).filter(([token]) => token.startsWith("--ds-overlay-"))
    );
    expect(doorsOf(v1Advanced({ tokenOverrides: ladderRow }))).toEqual([
      {
        door: "overlay-ladder-colour",
        path: 'visualFoundation.advanced.tokenOverrides["--ds-overlay-light"]',
        value: "rgba(32, 48, 40, 0.025)",
        message:
          'visualFoundation.advanced.tokenOverrides["--ds-overlay-light"] authors a ladder colour; a tenant edits the ladder strength only (overrides.chrome.scrim.light); reported, not refused, until the stored-row census of owner decision Q4 (2026-10-06) reads 0',
      },
      expect.objectContaining({ door: "overlay-ladder-colour", value: "rgba(32, 48, 40, 0.05)" }),
      expect.objectContaining({ door: "overlay-ladder-colour", value: "rgba(32, 48, 40, 0.1)" }),
    ]);
  });

  it("names a Modal scrim colour and a tinting backdrop filter, on both document versions", () => {
    const modal = { modal: { overlayBg: "rgba(255, 0, 170, 0.2)", overlayBackdrop: "sepia(1)" } };
    expect(doorsOf(v1Advanced({ chrome: modal })).map(({ door, path }) => [door, path])).toEqual([
      ["modal-overlay-bg", "visualFoundation.advanced.chrome.modal.overlayBg"],
      ["modal-overlay-backdrop", "visualFoundation.advanced.chrome.modal.overlayBackdrop"],
    ]);
    expect(doorsOf(v2Pro(modal)).map(({ door, path }) => [door, path])).toEqual([
      ["modal-overlay-bg", "overrides.chrome.modal.overlayBg"],
      ["modal-overlay-backdrop", "overrides.chrome.modal.overlayBackdrop"],
    ]);
  });

  it("admits a blur up to 24px, the canon glass filter and none without a finding", () => {
    for (const overlayBackdrop of ["none", "blur(4px)", "blur(24px)", "var(--ds-glass-backdrop-filter)"]) {
      expect(doorsOf(v2Pro({ modal: { overlayBackdrop } })), overlayBackdrop).toEqual([]);
    }
    expect(doorsOf(v2Pro({ modal: { overlayBackdrop: "blur(25px)" } }))).toHaveLength(1);
  });

  it("names a chromatic veil and admits a neutral one silently", () => {
    expect(doorsOf(v1Advanced({ tokenOverrides: { "--ds-color-bg-overlay": "rgb(255, 0, 170)" } }))).toEqual([
      expect.objectContaining({ door: "chromatic-overlay-veil", value: "rgb(255, 0, 170)" }),
    ]);
    for (const veil of ["rgba(0, 0, 0, 0.6)", "rgb(17, 17, 17)"]) {
      expect(doorsOf(v1Advanced({ tokenOverrides: { "--ds-color-bg-overlay": veil } })), veil).toEqual([]);
    }
  });

  it("finds nothing in the first-party presets or the app-platform fixture rows", () => {
    for (const vertical of FIRST_PARTY_VERTICAL_SLUGS) {
      expect(doorsOf(VERTICAL_THEME_PRESETS[vertical].document), vertical).toEqual([]);
    }
    for (const row of APP_PLATFORM_TENANT_ROWS) {
      expect(doorsOf(row.document), row.tenant).toEqual([]);
    }
  });
});

describe("the Pro scrim strength door", () => {
  const css = (document: unknown) =>
    emitThemeCss(
      compileThemeIntent(
        documentThemeIntent({ vertical: "bithire", slug: "acme", document: document as never })
      ).compiled,
      tenantArtifactScope("bithire", "acme")
    );

  it("lowers a strength into its step at each block's own hue, leaves the other steps at canon, and writes no chrome", () => {
    const admission = admitDocument({ vertical: "bithire", document: v2Pro({ scrim: { medium: 0.7 } }) });
    expect(admission.patch.surfaces?.overlayStrength).toEqual({ medium: 0.7 });
    expect(admission.patch.chrome).toBeUndefined();
    const emitted = css(v2Pro({ scrim: { medium: 0.7 } }));
    expect(emitted).toContain("--ds-overlay-medium: color-mix(in srgb, var(--ds-color-black) 70%, transparent)");
    expect(emitted).toContain("--ds-overlay-medium: color-mix(in srgb, var(--ds-color-bg-primary) 70%, transparent)");
    for (const hue of ["var(--ds-color-black)", "var(--ds-color-bg-primary)"]) {
      expect(emitted).toContain(`--ds-overlay-light: color-mix(in srgb, ${hue} 52%, transparent)`);
      expect(emitted).toContain(`--ds-overlay-heavy: color-mix(in srgb, ${hue} 90%, transparent)`);
    }
  });

  it("writes no chrome channel, so the reference census sees an empty write set", () => {
    for (const step of ["light", "medium", "heavy"]) {
      expect([...chromeLeafChannels(`scrim.${step}`)], step).toEqual([]);
    }
  });

  it("publishes through the v1 terminal without entering the vertical envelope's chrome families", () => {
    expect(TENANT_THEME_CHROME_FAMILIES as readonly string[]).not.toContain("scrim");
    const { css } = compileTenantThemeConfig(
      hydrateTenantThemeConfig(v1Advanced({ chrome: { scrim: { heavy: 0.88 } } }), {
        tenantId: "scrim",
        slug: "scrim",
        verticalKey: "bithire",
        rowVersion: 1,
      } as never),
      { verticalEnvelope: getTenantThemeVerticalEnvelope("bithire") }
    );
    expect(css).toContain("--ds-overlay-heavy: color-mix(in srgb, var(--ds-color-black) 88%, transparent)");
  });

  it("refuses a Standard plan with the existing sanctioned-override wording", () => {
    expect(() => admitDocument({ vertical: "bithire", document: v2Pro({ scrim: { medium: 0.7 } }, "standard") }))
      .toThrow(/sanctioned overrides are tier pro; plan standard entitles standard/);
  });

  it("refuses an out-of-band strength and an unknown step by name on both document versions", () => {
    expect(() => admitDocument({ vertical: "bithire", document: v2Pro({ scrim: { medium: 0.05 } }) }))
      .toThrow("overrides.chrome.scrim.medium must be a number in [0.66, 0.81], the medium step's band; got 0.05");
    expect(() => admitDocument({ vertical: "bithire", document: v2Pro({ scrim: { tint: 0.5 } }) }))
      .toThrow('unsupported key "tint" in overrides.chrome.scrim; the scrim ladder steps are light | medium | heavy');
    expect(() => admitDocument({ vertical: "bithire", document: v1Advanced({ chrome: { scrim: { heavy: 0.99 } } }) }))
      .toThrow(ThemePatchMigrationError);
    expect(() => admitDocument({ vertical: "bithire", document: v1Advanced({ chrome: { scrim: { heavy: 0.99 } } }) }))
      .toThrow("visualFoundation.advanced.chrome.scrim.heavy must be a number in [0.86, 0.95], the heavy step's band; got 0.99");
  });
});
