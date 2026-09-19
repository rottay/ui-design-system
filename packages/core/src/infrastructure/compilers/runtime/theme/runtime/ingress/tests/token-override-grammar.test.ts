/**
 * S19-A01: the value grammar of a raw token override binds at EVERY public
 * producer, not only at publication.
 *
 * An unregistered font-pack reference and a line height of `99` previewed, and
 * compiled from persisted intent, and were then refused at publish. The rule
 * that refuses them is one rule now -- the publication schema's own per-token
 * table, read below both producers -- so the three routes name the same code,
 * the same path and the same message for the same document.
 */

import { describe, expect, it } from "vitest";

import type { TenantThemeDocument } from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import type { TenantThemeValidationIssue } from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import { FIRST_PARTY_VERTICAL_SLUGS } from "@/foundation/contracts/kernel/verticals";
import { getTenantThemeVerticalEnvelope } from "@/contracts/theme/runtime/envelopes";
import {
  TenantThemeValidationError,
  compileTenantThemeConfig,
  hydrateTenantThemeConfig,
} from "@/infrastructure/compilers/composition/tenant-theme";

import { compileThemeIntent } from "../../../facade/runtime/compile";
import { ThemePatchMigrationError } from "../foundation/document-patch";
import { documentThemeIntent, previewThemeIntent } from "..";

const SLUG = "token-grammar-acceptance";

/** The two inputs the audit reproduced, and the valid case each one shadows. */
const REFUSED = [
  [
    "--ds-type-body-font-family",
    "var(--ds-font-pack-unregistered)",
    "unsafe_value",
    "Invalid or unsafe visual-value",
  ],
  [
    "--ds-line-height-body",
    99,
    "invalid_value",
    "Number must be between 0.5 and 3",
  ],
] as const;

const ADMITTED = [
  ["--ds-type-body-font-family", "Inter, sans-serif"],
  ["--ds-line-height-body", 1.6],
] as const;

const documentOf = (
  token: string,
  value: string | number
): TenantThemeDocument =>
  ({
    schemaVersion: 1,
    mode: "advanced",
    visualFoundation: { advanced: { tokenOverrides: { [token]: value } } },
  }) as unknown as TenantThemeDocument;

const pathOf = (token: string) =>
  `$.visualFoundation.advanced.tokenOverrides[${JSON.stringify(token)}]`;

function publish(document: TenantThemeDocument, vertical: string): unknown {
  return compileTenantThemeConfig(
    hydrateTenantThemeConfig(document, {
      tenantId: "token-grammar",
      slug: SLUG,
      verticalKey: vertical,
      rowVersion: 1,
    } as never),
    { verticalEnvelope: getTenantThemeVerticalEnvelope(vertical as never) }
  );
}

function issuesOf(run: () => unknown, path: string): TenantThemeValidationIssue[] {
  try {
    run();
  } catch (error) {
    if (
      error instanceof ThemePatchMigrationError ||
      error instanceof TenantThemeValidationError
    ) {
      return error.issues.filter((issue) => issue.path === path);
    }
    throw error;
  }
  throw new Error(`the producer admitted a value publication refuses: ${path}`);
}

describe("raw token-override values answer to one grammar at every producer", () => {
  it("refuses the two reproduced inputs at preview, document intent and publication, by the same name", () => {
    const outcomes: string[] = [];
    for (const vertical of FIRST_PARTY_VERTICAL_SLUGS) {
      for (const [token, value, code, message] of REFUSED) {
        const document = documentOf(token, value);
        const path = pathOf(token);
        const named = [{ code, path, message }];
        for (const produce of [previewThemeIntent, documentThemeIntent]) {
          expect(
            issuesOf(() => produce({ vertical, slug: SLUG, document }), path)
          ).toEqual(named);
        }
        expect(issuesOf(() => publish(document, vertical), path)).toEqual(named);
        outcomes.push(`${vertical}/${token}`);
      }
    }
    expect(outcomes).toHaveLength(FIRST_PARTY_VERTICAL_SLUGS.length * 2);
  });

  it("still admits the valid spelling of the same two channels, and paints it", () => {
    for (const vertical of FIRST_PARTY_VERTICAL_SLUGS) {
      for (const [token, value] of ADMITTED) {
        const document = documentOf(token, value);
        for (const produce of [previewThemeIntent, documentThemeIntent]) {
          const compiled = compileThemeIntent(
            produce({ vertical, slug: SLUG, document })
          );
          expect(compiled.compiled.cssVariables[token]).toBe(String(value));
        }
        expect(() => publish(document, vertical)).not.toThrow();
      }
    }
  });
});
