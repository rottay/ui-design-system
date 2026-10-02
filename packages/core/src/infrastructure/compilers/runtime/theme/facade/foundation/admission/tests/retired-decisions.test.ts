/**
 * A retired decision is refused by name, with what replaces it.
 *
 * The catalog keeps `token-overrides` and `chrome.families` named so a writer
 * hears the retirement and its replacement, not the generic unknown-id error
 * a typo earns.
 */

import { describe, expect, it } from "vitest";

import type { TenantThemeDocumentV2 } from "@/contracts/theme/presentation/document";
import { THEME_CATALOG_RETIRED } from "@/contracts/theme/runtime/catalog";
import { compileTenantThemeDocumentV2 } from "@/infrastructure/compilers/composition/tenant-theme/document-v2";
import {
  compileThemeIntent,
  documentThemeIntent,
  previewThemeIntent,
} from "@/infrastructure/compilers/runtime/theme";

const VERTICAL = "bithire" as const;
const SLUG = "retired-decisions";

const doors = (document: TenantThemeDocumentV2) => [
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

function messageOf(run: () => unknown): string {
  try {
    run();
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
  throw new Error("the door admitted a retired decision");
}

describe("retired decisions refuse by name on preview, document and publication", () => {
  for (const plan of ["standard", "pro"] as const) {
    for (const entry of THEME_CATALOG_RETIRED) {
      it(`refuses "${entry.id}" under the ${plan} plan with its retirement text`, () => {
        const document = {
          version: 2,
          plan,
          decisions: { [entry.id]: {} },
        } as unknown as TenantThemeDocumentV2;
        for (const door of doors(document)) {
          const message = messageOf(door);
          expect(message).toBe(
            `TenantThemeDocument v2: unsupported decision "${entry.id}": retired; ${entry.replacedBy}`
          );
          expect(message).not.toMatch(/the catalog is closed/u);
        }
      });
    }
  }

  it("names D-03 when token-overrides is refused, whatever map it carries", () => {
    const document = {
      version: 2,
      plan: "pro",
      decisions: { "token-overrides": { "--ds-color-error": "#ff0000" } },
    } as unknown as TenantThemeDocumentV2;
    for (const door of doors(document)) {
      expect(messageOf(door)).toMatch(
        /unsupported decision "token-overrides": retired; raw --ds-\* authorship is retired by D-03; use overrides\.chrome\.<family>\.<channel>/u
      );
    }
  });

  it("keeps the generic refusal for an id the catalog never had", () => {
    const document = {
      version: 2,
      plan: "pro",
      decisions: { "nope.never": {} },
    } as unknown as TenantThemeDocumentV2;
    for (const door of doors(document)) {
      expect(messageOf(door)).toMatch(
        /unsupported decision "nope\.never"; the catalog is closed at \d+ ids/u
      );
    }
  });
});
