/**
 * A retired channel is refused by name, never admitted into silence.
 *
 * The ten accent ramp steps were referenceable while the compiler emitted none
 * of them, so `var(--ds-color-accent-500)` admitted cleanly and resolved to
 * nothing. They left the reference allowlist; a value citing one now earns a
 * refusal that names the channel as retired on every door, while the accent
 * seed itself stays referenceable.
 */

import { describe, expect, it } from "vitest";

import type { TenantThemeDocumentV2 } from "@/contracts/theme/presentation/document";
import {
  TENANT_THEME_REFERENCE_TOKENS,
  TENANT_THEME_RETIRED_REFERENCE_TOKENS,
  type TenantThemeDocument,
} from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import { getTenantThemeVerticalEnvelope } from "@/contracts/theme/runtime/envelopes";
import {
  compileTenantThemeConfig,
  hydrateTenantThemeConfig,
} from "@/infrastructure/compilers/composition/tenant-theme";
import { compileTenantThemeDocumentV2 } from "@/infrastructure/compilers/composition/tenant-theme/document-v2";
import { validateTenantThemeNode } from "@/infrastructure/compilers/kernel/foundation/schemas/tenant-theme";
import {
  compileThemeIntent,
  documentThemeIntent,
  previewThemeIntent,
} from "@/infrastructure/compilers/runtime/theme";

import type { ThemeAdmissionIssue } from "..";

const VERTICAL = "rottay" as const;
const SLUG = "retired-references";
const LEAF_PATH = "$.overrides.chrome.controls.buttonGeometry.radius";
const ACCENT_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;

const retiredMessage = (channel: string) =>
  `Retired reference: var(${channel}) is no longer a tenant-referenceable channel; the compiler emits no value for it`;

const v2 = (radius: string): TenantThemeDocumentV2 =>
  ({
    version: 2,
    plan: "pro",
    decisions: {},
    overrides: { chrome: { controls: { buttonGeometry: { radius } } } },
  }) as unknown as TenantThemeDocumentV2;

function issuesOf(run: () => unknown): readonly ThemeAdmissionIssue[] {
  try {
    run();
  } catch (error) {
    const issues = (error as { issues?: readonly ThemeAdmissionIssue[] }).issues;
    if (issues) return issues;
    throw error;
  }
  throw new Error("the door admitted a retired reference");
}

describe("the accent ramp steps are retired from the reference allowlist", () => {
  it("lists all ten as retired and none as referenceable; the seed stays", () => {
    expect([...TENANT_THEME_RETIRED_REFERENCE_TOKENS]).toEqual(
      ACCENT_STEPS.map((step) => `--ds-color-accent-${step}`)
    );
    for (const channel of TENANT_THEME_RETIRED_REFERENCE_TOKENS) {
      expect(TENANT_THEME_REFERENCE_TOKENS).not.toContain(channel);
    }
    expect(TENANT_THEME_REFERENCE_TOKENS).toContain("--ds-color-accent");
    expect(TENANT_THEME_REFERENCE_TOKENS).toContain("--ds-color-secondary-500");
  });

  it("refuses a chrome override citing one by name on preview, document and publication", () => {
    const document = v2("var(--ds-color-accent-500)");
    const doors = [
      () =>
        compileThemeIntent(
          previewThemeIntent({ vertical: VERTICAL, slug: SLUG, document })
        ),
      () =>
        compileThemeIntent(
          documentThemeIntent({ vertical: VERTICAL, slug: SLUG, document })
        ),
      () =>
        compileTenantThemeDocumentV2({
          document,
          tenantId: SLUG,
          slug: SLUG,
          verticalKey: VERTICAL,
          rowVersion: 1,
        } as never),
    ];
    for (const door of doors) {
      expect(issuesOf(door)).toContainEqual({
        code: "unsafe_value",
        path: LEAF_PATH,
        message: retiredMessage("--ds-color-accent-500"),
      });
    }
  });

  it("refuses one hidden in a fallback position", () => {
    const document = v2("var(--ds-radius-md, var(--ds-color-accent-50))");
    expect(
      issuesOf(() =>
        compileThemeIntent(
          previewThemeIntent({ vertical: VERTICAL, slug: SLUG, document })
        )
      )
    ).toContainEqual({
      code: "unsafe_value",
      path: LEAF_PATH,
      message: retiredMessage("--ds-color-accent-50"),
    });
  });

  it("refuses a v1 token override value citing one by name", () => {
    const document = {
      schemaVersion: 1,
      mode: "advanced",
      visualFoundation: {
        advanced: {
          tokenOverrides: { "--ds-shadow-md": "var(--ds-color-accent-900)" },
        },
      },
    } as unknown as TenantThemeDocument;
    const issues = issuesOf(() =>
      compileTenantThemeConfig(
        hydrateTenantThemeConfig(document, {
          tenantId: SLUG,
          slug: SLUG,
          verticalKey: VERTICAL,
          rowVersion: 1,
        } as never),
        { verticalEnvelope: getTenantThemeVerticalEnvelope(VERTICAL) }
      )
    );
    expect(issues.map((issue) => issue.message)).toContain(
      retiredMessage("--ds-color-accent-900")
    );
  });

  it("names the retirement on the schema node judge, not the generic unsafe message", () => {
    for (const step of ACCENT_STEPS) {
      const issues: ThemeAdmissionIssue[] = [];
      validateTenantThemeNode(
        `var(--ds-color-accent-${step})`,
        { type: "string", format: "visual-value" } as never,
        "$.probe",
        issues as never
      );
      expect(issues).toEqual([
        {
          code: "unsafe_value",
          path: "$.probe",
          message: retiredMessage(`--ds-color-accent-${step}`),
        },
      ]);
    }
  });

  it("still admits the accent seed and a live ramp step", () => {
    for (const value of ["var(--ds-color-accent)", "var(--ds-color-secondary-500)"]) {
      const issues: ThemeAdmissionIssue[] = [];
      validateTenantThemeNode(
        value,
        { type: "string", format: "visual-value" } as never,
        "$.probe",
        issues as never
      );
      expect(issues).toEqual([]);
    }
  });
});
