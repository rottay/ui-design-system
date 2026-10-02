/**
 * The positive twin of the retired-references suite: a public scale step a
 * tenant may cite is admitted on every door, and the compiled output carries
 * the reference unchanged. The channel-liveness capability acceptance cites
 * this suite as its door leg (B4); its titles are part of that citation.
 */

import { describe, expect, it } from "vitest";

import type { TenantThemeDocumentV2 } from "@/contracts/theme/presentation/document";
import {
  TENANT_THEME_REFERENCE_TOKENS,
  type TenantThemeDocument,
} from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import { getTenantThemeVerticalEnvelope } from "@/contracts/theme/runtime/envelopes";
import {
  compileTenantThemeConfig,
  hydrateTenantThemeConfig,
} from "@/infrastructure/compilers/composition/tenant-theme";
import { compileTenantThemeDocumentV2 } from "@/infrastructure/compilers/composition/tenant-theme/document-v2";
import {
  compileThemeIntent,
  documentThemeIntent,
  previewThemeIntent,
} from "@/infrastructure/compilers/runtime/theme";

const VERTICAL = "rottay" as const;
const SLUG = "scale-step-references";
const CAPABILITY_STEPS = [
  "--ds-color-info-300",
  "--ds-tint-error-16",
  "--ds-tint-error-24",
  "--ds-tint-info-16",
  "--ds-tint-info-24",
  "--ds-tint-success-16",
  "--ds-tint-success-24",
  "--ds-tint-warning-16",
  "--ds-tint-warning-24",
] as const;

const v2 = (radius: string): TenantThemeDocumentV2 =>
  ({
    version: 2,
    plan: "pro",
    decisions: {},
    overrides: { chrome: { controls: { buttonGeometry: { radius } } } },
  }) as unknown as TenantThemeDocumentV2;

const identity = { tenantId: SLUG, slug: SLUG, verticalKey: VERTICAL, rowVersion: 1 } as never;

describe("the capability scale steps are admitted on every door", () => {
  it("lists every capability step as referenceable", () => {
    for (const channel of CAPABILITY_STEPS) {
      expect(TENANT_THEME_REFERENCE_TOKENS).toContain(channel);
    }
  });

  it("admits a chrome override citing each capability step on preview, document and publication, and carries the reference unchanged", () => {
    for (const channel of CAPABILITY_STEPS) {
      const reference = `var(${channel})`;
      const document = v2(reference);
      const preview = compileThemeIntent(previewThemeIntent({ vertical: VERTICAL, slug: SLUG, document }));
      const stored = compileThemeIntent(documentThemeIntent({ vertical: VERTICAL, slug: SLUG, document }));
      const published = compileTenantThemeDocumentV2({ document, ...(identity as object) } as never);
      expect(preview.compiled.cssVariables["--ds-radius-button"], `${channel} preview`).toBe(reference);
      expect(stored.compiled.cssVariables["--ds-radius-button"], `${channel} document`).toBe(reference);
      expect(published.artifact.variables["--ds-radius-button"], `${channel} publication`).toBe(reference);
    }
  });

  it("admits a v1 token override value citing each capability step", () => {
    for (const channel of CAPABILITY_STEPS) {
      const reference = `var(${channel})`;
      const document = {
        schemaVersion: 1,
        mode: "advanced",
        visualFoundation: { advanced: { tokenOverrides: { "--ds-shadow-md": reference } } },
      } as unknown as TenantThemeDocument;
      const compiled = compileTenantThemeConfig(hydrateTenantThemeConfig(document, identity), {
        verticalEnvelope: getTenantThemeVerticalEnvelope(VERTICAL),
      });
      expect(compiled.variables["--ds-shadow-md"], channel).toBe(reference);
    }
  });
});
