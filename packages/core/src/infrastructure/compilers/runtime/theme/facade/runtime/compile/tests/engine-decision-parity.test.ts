/**
 * ONE ENGINE DECISION, FOUR TRANSPORTS.
 *
 * `static-vertical`, `tenant-document`, `preview` and publish must render a
 * given vertical with the same engine. The regression this pins is a preview
 * that paints with an engine the publish would refuse: before the single door,
 * four preview and tooling sites spelled
 * `getFirstPartyVertical(slug)?.engine ?? PRIMARY_ENGINE` while the DB terminal
 * refused an unrostered vertical outright.
 */

import { describe, expect, it } from "vitest";

import {
  FIRST_PARTY_VERTICAL_SLUGS,
  type FirstPartyVerticalId,
} from "@/foundation/contracts/kernel/verticals";
import {
  ADMITTED_ENGINE_NAMES,
  FROZEN_ENGINE_NAMES,
} from "@/foundation/contracts/kernel/engine-identity";
import type { TenantThemeDocument } from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import {
  compileThemeIntent,
  documentThemeIntent,
  previewThemeIntent,
  staticThemeIntent,
  verticalEngine,
} from "@/infrastructure/compilers/runtime/theme";
import { compileTenantThemeConfig } from "@/infrastructure/compilers/composition/tenant-theme";
import { EngineNotAdmittedForCompileError } from "../../../../presentation/adapters";

/** A minimal published document: one tenant-authored seed, nothing else. */
function published(): TenantThemeDocument {
  return {
    schemaVersion: 1,
    mode: "simple",
    appearance: { palette: { primary: "#2F6B9A" } },
  } as unknown as TenantThemeDocument;
}

/** The same document as the DB terminal takes it: identity travels outside. */
function publishedConfig(vertical: FirstPartyVerticalId, slug: string) {
  return {
    ...published(),
    tenantId: `tenant_${slug.replace(/-/g, "_")}`,
    slug,
    verticalKey: vertical,
    rowVersion: 1,
  };
}

describe("the engine decision is the roster row's, on every transport", () => {
  for (const vertical of FIRST_PARTY_VERTICAL_SLUGS) {
    it(`${vertical}: static, document and preview compile with one engine`, () => {
      const slug = `${vertical}-parity-tenant`;
      const document = published();

      const staticCompile = compileThemeIntent(staticThemeIntent(vertical, slug));
      const documentCompile = compileThemeIntent(
        documentThemeIntent({ vertical, slug, document })
      );
      const previewCompile = compileThemeIntent(
        previewThemeIntent({ vertical, slug, document })
      );

      const declared = verticalEngine(vertical);
      expect(staticCompile.compiled.engine).toBe(declared);
      expect(documentCompile.compiled.engine).toBe(declared);
      expect(previewCompile.compiled.engine).toBe(declared);
    });

    it(`${vertical}: publish compiles through the same door as preview`, () => {
      const slug = `${vertical}-parity-tenant`;
      // The DB terminal calls `compileThemeIntent(documentThemeIntent(...))`
      // itself, so a successful publish IS that compile. Proving the artifact
      // exists proves the vertical's engine admitted it; the engine equality is
      // asserted on the door above, which is the only place it is decided.
      const artifact = compileTenantThemeConfig(publishedConfig(vertical, slug));
      expect(artifact).toBeTruthy();
      expect(verticalEngine(vertical)).toBe(
        compileThemeIntent(previewThemeIntent({ vertical, slug, document: published() }))
          .compiled.engine
      );
    });

    it(`${vertical}: the declared engine is admitted`, () => {
      expect(ADMITTED_ENGINE_NAMES).toContain(verticalEngine(vertical));
    });
  }
});

describe("a frozen engine is refused by name at the compile door", () => {
  const [vertical] = FIRST_PARTY_VERTICAL_SLUGS;
  const slug = `${vertical}-refusal-tenant`;

  for (const frozen of FROZEN_ENGINE_NAMES) {
    it(`document origin refuses ${frozen}`, () => {
      expect(() =>
        compileThemeIntent(
          documentThemeIntent({ vertical, slug, document: published() }),
          { engine: frozen }
        )
      ).toThrow(EngineNotAdmittedForCompileError);
    });

    it(`preview origin refuses ${frozen}, so a preview cannot show a refused publish`, () => {
      expect(() =>
        compileThemeIntent(
          previewThemeIntent({ vertical, slug, document: published() }),
          { engine: frozen }
        )
      ).toThrow(EngineNotAdmittedForCompileError);
    });

    it(`static-vertical still compiles ${frozen}, which is the comparison seam`, () => {
      expect(() =>
        compileThemeIntent(staticThemeIntent(vertical, slug), { engine: frozen })
      ).not.toThrow();
    });
  }
});
