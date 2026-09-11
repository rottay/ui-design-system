/**
 * An override may point a channel at another channel; it may not point one at
 * itself.
 *
 * THE DEFECT. `shape.button-style: pill` plus the sanctioned override
 * `chrome.controls.buttonGeometry.radius: var(--ds-radius-button)` compiled to
 * `--ds-radius-button: var(--ds-radius-button)` and painted the same cycle into
 * the five per-size button radii derived from it. A custom property that
 * resolves to itself is invalid at use time, so the tenant's own radius became
 * no radius at all while the ledger reported the override as effective -- one
 * leaf, two answers, which is exactly what the pill-vs-override law refuses.
 *
 * BOTH READINGS ARE PROBED. The authored one names the override path, so it is
 * asserted by path on every door; the emitted one closes the general class over
 * the compiled delta, so it is asserted through a second authoring route the
 * authored reading cannot see. The legitimate cross-reference is asserted
 * beside them, because a law that refused `var(--ds-radius-md)` too would have
 * closed the escape hatch instead of fixing it.
 */

import { describe, expect, it } from "vitest";

import type { TenantThemeDocumentV2 } from "@/contracts/theme/presentation/document";
import type { TenantThemeDocument } from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import { getTenantThemeVerticalEnvelope } from "@/contracts/theme/runtime/envelopes";
import {
  compileTenantThemeConfig,
  hydrateTenantThemeConfig,
} from "@/infrastructure/compilers/composition/tenant-theme";
import { compileTenantThemeDocumentV2 } from "@/infrastructure/compilers/composition/tenant-theme/document-v2";
import {
  compileThemeIntent,
  documentThemeIntent,
  draftPreviewThemeIntent,
  previewThemeIntent,
} from "@/infrastructure/compilers/runtime/theme";

import type { ThemeAdmissionIssue } from "..";
import { ThemeAdmissionError, chromeLeafChannels } from "..";

const VERTICAL = "rottay" as const;
const SLUG = "reference-cycles";
const LEAF_PATH = "$.overrides.chrome.controls.buttonGeometry.radius";
const BUTTON_CHANNELS = [
  "--ds-radius-button",
  "--ds-button-xs-radius",
  "--ds-button-sm-radius",
  "--ds-button-md-radius",
  "--ds-button-lg-radius",
  "--ds-button-xl-radius",
] as const;

const v2 = (
  radius: string,
  plan: "standard" | "pro" = "pro"
): TenantThemeDocumentV2 =>
  ({
    version: 2,
    plan,
    decisions: { "shape.button-style": "pill" },
    overrides: {
      chrome: { controls: { buttonGeometry: { radius } } },
    },
  }) as unknown as TenantThemeDocumentV2;

const v1TokenOverrides = (
  tokenOverrides: Record<string, string>
): TenantThemeDocument =>
  ({
    schemaVersion: 1,
    mode: "advanced",
    visualFoundation: { advanced: { tokenOverrides } },
  }) as unknown as TenantThemeDocument;

function refusal(run: () => unknown): ThemeAdmissionError {
  try {
    run();
  } catch (error) {
    if (error instanceof ThemeAdmissionError) return error;
    throw error;
  }
  throw new Error("the door admitted a reference cycle");
}

/**
 * The issues a refusal carries, whichever published name it travels under.
 *
 * The v1 terminal re-throws the door's own issues as `TenantThemeValidationError`
 * and the v2 tier check has its own name; the LAW is the issue list, so the
 * assertions read that rather than the constructor.
 */
function issuesOf(run: () => unknown): readonly ThemeAdmissionIssue[] {
  try {
    run();
  } catch (error) {
    const issues = (error as { issues?: readonly ThemeAdmissionIssue[] }).issues;
    if (issues) return issues;
    return [
      { code: "invalid_value", path: "$", message: (error as Error).message },
    ];
  }
  throw new Error("the door admitted a reference cycle");
}

function publishV1(document: TenantThemeDocument): unknown {
  return compileTenantThemeConfig(
    hydrateTenantThemeConfig(document, {
      tenantId: "reference-cycles",
      slug: SLUG,
      verticalKey: VERTICAL,
      rowVersion: 1,
    } as never),
    { verticalEnvelope: getTenantThemeVerticalEnvelope(VERTICAL) }
  );
}

function publishV2(document: TenantThemeDocumentV2): unknown {
  return compileTenantThemeDocumentV2({
    document,
    tenantId: "reference-cycles",
    slug: SLUG,
    verticalKey: VERTICAL,
    rowVersion: 1,
  } as never);
}

function painted(document: TenantThemeDocumentV2): Record<string, string> {
  return compileThemeIntent(
    previewThemeIntent({ vertical: VERTICAL, slug: SLUG, document })
  ).compiled.cssVariables as Record<string, string>;
}

describe("a governed override may not resolve into its own channel", () => {
  it("refuses the self-reference by name on preview, document and publication", () => {
    const document = v2("var(--ds-radius-button)");
    const doors = [
      () =>
        compileThemeIntent(
          previewThemeIntent({ vertical: VERTICAL, slug: SLUG, document })
        ),
      () =>
        compileThemeIntent(
          documentThemeIntent({ vertical: VERTICAL, slug: SLUG, document })
        ),
      () => publishV2(document),
    ];
    for (const door of doors) {
      const error = refusal(door);
      expect(error.issues).toEqual([
        {
          code: "unsafe_value",
          path: LEAF_PATH,
          message:
            "Reference cycle: var(--ds-radius-button) resolves to a channel this override writes",
        },
      ]);
      // Refused at the INTENT stage: nothing was lowered, so the cycle never
      // reached a channel map any consumer could mount.
      expect(error.measured).toBeUndefined();
    }
  });

  it("covers the leaf's derived fan-out, not only the channel it names", () => {
    // The one reason the check is probed off the emitter instead of restated:
    // this leaf writes six channels, and the five per-size radii carried the
    // same cycle into the button skin.
    expect([...chromeLeafChannels("controls.buttonGeometry.radius")].sort()).toEqual(
      [...BUTTON_CHANNELS].sort()
    );
  });

  it("refuses the same cycle authored inside a mode overlay, at its own path", () => {
    const error = refusal(() =>
      compileThemeIntent(
        draftPreviewThemeIntent({
          vertical: VERTICAL,
          slug: SLUG,
          draft: {
            id: SLUG,
            name: "Reference cycles",
            modes: {
              dark: {
                chrome: {
                  controls: {
                    buttonGeometry: { radius: "var(--ds-radius-button)" },
                  },
                },
              },
            },
          } as never,
        })
      )
    );
    expect(error.issues[0].path).toBe(
      "$.modes.dark.chrome.controls.buttonGeometry.radius"
    );
  });

  it("still resolves a legitimate cross-reference into all six channels", () => {
    const variables = painted(v2("var(--ds-radius-md)"));
    for (const channel of BUTTON_CHANNELS) {
      expect(variables[channel]).toBe("var(--ds-radius-md)");
    }
  });

  it("preserves the accepted and refused radius vocabulary either side of it", () => {
    for (const value of ["0px", "7px", "9px", "32px", "50%", "0.5rem"]) {
      const variables = painted(v2(value));
      expect(variables["--ds-radius-button"]).toContain(value);
    }
    for (const value of ["9999px", "calc(7px + 1px)", "-1px"]) {
      const error = refusal(() => painted(v2(value)));
      expect(error.issues[0]).toMatchObject({
        code: "unsafe_value",
        path: LEAF_PATH,
        message: `Invalid or unsafe visual-value ${JSON.stringify(value)}`,
      });
    }
    expect(issuesOf(() => painted(v2("7px", "standard")))[0].message).toContain(
      "sanctioned overrides are tier pro"
    );
  });
});

describe("the emitted reading closes the class the authored one cannot see", () => {
  it("refuses a raw token override that resolves to itself", () => {
    const document = v1TokenOverrides({
      "--ds-shadow-md": "var(--ds-shadow-md)",
    });
    for (const door of [
      () =>
        compileThemeIntent(
          documentThemeIntent({ vertical: VERTICAL, slug: SLUG, document })
        ),
      () => publishV1(document),
    ]) {
      expect(issuesOf(door)).toContainEqual({
        code: "unsafe_value",
        path: '$.variables["--ds-shadow-md"]',
        message:
          "Appearance compiler emitted a reference cycle: --ds-shadow-md -> --ds-shadow-md",
      });
    }
  });

  it("refuses a cycle that closes over two hops", () => {
    const error = refusal(() =>
      compileThemeIntent(
        documentThemeIntent({
          vertical: VERTICAL,
          slug: SLUG,
          document: v1TokenOverrides({
            "--ds-shadow-md": "var(--ds-shadow-lg)",
            "--ds-shadow-lg": "var(--ds-shadow-md)",
          }),
        })
      )
    );
    expect(
      error.issues.some((issue) =>
        issue.message.includes(
          "--ds-shadow-lg -> --ds-shadow-md -> --ds-shadow-lg"
        )
      )
    ).toBe(true);
  });

  it("admits a reference out of the tenant's own delta", () => {
    // The documented boundary: `--ds-shadow-xl` is not a channel this tenant
    // moved, so the reference terminates in the vertical's own compiled
    // baseline instead of closing a circle.
    const compiled = compileThemeIntent(
      documentThemeIntent({
        vertical: VERTICAL,
        slug: SLUG,
        document: v1TokenOverrides({ "--ds-shadow-md": "var(--ds-shadow-xl)" }),
      })
    ).compiled.cssVariables as Record<string, string>;
    expect(compiled["--ds-shadow-md"]).toBe("var(--ds-shadow-xl)");
  });
});
