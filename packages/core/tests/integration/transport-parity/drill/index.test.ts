/**
 * The planted mutants for `tests/integration/transport-parity`.
 *
 * The sibling suite asserts that four doors agree. Agreement is the easiest
 * thing in the world to assert vacuously: if the arms were accidentally reading
 * the same compiled object, every comparison would pass and nothing would be
 * proven. So each mutant below breaks ONE transport and the suite's own
 * comparison must see it.
 *
 *   MUTANT 1  `preview` stops counting as tenant-authored. That is a
 *             one-predicate change, it is exactly the "preview is a cheaper
 *             path with fewer laws on it" defect, and because the static arm
 *             also travels under a `preview` origin it must move laws 1 AND 2
 *             at once.
 *   MUTANT 2  the published artifact loses one variable. Law 3 asserts a SET
 *             equality against the moved delta precisely so a silently
 *             shortened artifact cannot pass.
 */
import { afterEach, describe, expect, it, vi } from "vitest";

import type { TenantThemeDocumentV2 } from "@/contracts/theme/presentation/document";

const VERTICAL = "bithire" as const;
const SLUG = "transport-parity-drill";
const INTENT_CONTRACT = "@/foundation/contracts/composition/tenants/themes/intent";
const ARTIFACT_ASSEMBLY = "@/infrastructure/compilers/composition/tenant-theme";

const DOCUMENT = {
  version: 2,
  plan: "pro",
  decisions: { "states.emphasis": "strong" },
} as TenantThemeDocumentV2;

afterEach(() => {
  vi.resetModules();
  vi.doUnmock(INTENT_CONTRACT);
  vi.doUnmock(ARTIFACT_ASSEMBLY);
});

async function arms(): Promise<{
  db: Record<string, string>;
  preview: Record<string, string>;
  baseline: Record<string, string>;
  dbAuthored: boolean;
  previewAuthored: boolean;
  dbDelta: unknown;
  previewDelta: unknown;
}> {
  const { compileThemeIntent } = await import("@/infrastructure/compilers/runtime/theme");
  const { documentThemeIntent, previewThemeIntent, staticThemeIntent } = await import(
    "@/infrastructure/compilers/runtime/theme/runtime/ingress"
  );
  const db = compileThemeIntent(
    documentThemeIntent({ vertical: VERTICAL, slug: SLUG, document: DOCUMENT })
  );
  const preview = compileThemeIntent(
    previewThemeIntent({ vertical: VERTICAL, slug: SLUG, document: DOCUMENT })
  );
  return {
    db: db.compiled.cssVariables,
    preview: preview.compiled.cssVariables,
    baseline: compileThemeIntent(staticThemeIntent(VERTICAL, SLUG)).compiled.cssVariables,
    dbAuthored: db.resolution.provenance.tenantAuthored,
    previewAuthored: preview.resolution.provenance.tenantAuthored,
    dbDelta: db.delta,
    previewDelta: preview.delta,
  };
}

const disagreements = (a: Record<string, string>, b: Record<string, string>): string[] =>
  [...new Set([...Object.keys(a), ...Object.keys(b)])].filter((key) => a[key] !== b[key]);

describe("transport-parity DRILL — each transport is measured separately", () => {
  it("CONTROL: preview and document agree on the map, the authorship and the delta", async () => {
    vi.resetModules();
    const { db, preview, baseline, dbAuthored, previewAuthored, dbDelta, previewDelta } = await arms();
    expect(disagreements(db, preview)).toEqual([]);
    expect(disagreements(db, baseline).length, "the fixture must move something").toBeGreaterThan(0);
    expect(previewAuthored).toBe(dbAuthored);
    expect(previewDelta).toEqual(dbDelta);
  });

  it("MUTANT 1: with `preview` no longer tenant-authored, the preview arm diverges", async () => {
    vi.resetModules();
    vi.doMock(INTENT_CONTRACT, async (importOriginal) => {
      const original = await importOriginal<typeof import(
        "@/foundation/contracts/composition/tenants/themes/intent"
      )>();
      return {
        ...original,
        isTenantAuthoredOrigin: (origin: string) => origin === "tenant-document",
      };
    });

    const { db, preview, dbAuthored, previewAuthored, dbDelta, previewDelta } = await arms();
    // MEASURED, and the reason law 2 is stated on three things rather than one:
    // the variable map is a function of (baseline, patch) and does NOT move
    // under this mutation. Authorship and the delta both do.
    expect(disagreements(db, preview)).toEqual([]);
    expect(previewAuthored, "the mutation must actually land").toBe(false);
    expect(dbAuthored).toBe(true);
    expect(
      previewDelta,
      "law 2b compares the delta precisely because the map cannot see this mutation"
    ).not.toEqual(dbDelta);
  });

  it("MUTANT 2: an artifact that quietly loses a variable breaks the delta set equality", async () => {
    vi.resetModules();
    vi.doMock(ARTIFACT_ASSEMBLY, async (importOriginal) => {
      const original = await importOriginal<typeof import(
        "@/infrastructure/compilers/composition/tenant-theme"
      )>();
      return {
        ...original,
        assembleTenantThemeArtifact: (
          input: Parameters<typeof original.assembleTenantThemeArtifact>[0]
        ) => {
          // The real signature returns `{ artifact }`, not the artifact. An
          // earlier revision of this mutant spread the WRAPPER and set a stray
          // `variables` beside it: the mock ran, the artifact was untouched,
          // and the drill reported a passing gate. That is the exact shape of
          // false green this suite exists against, so it is written down.
          //
          // The victim is a channel the fixture MOVES, not the first key of
          // the full map: deleting an unmoved channel leaves the published
          // delta untouched and the mutant would prove nothing.
          const result = original.assembleTenantThemeArtifact(input);
          const variables = { ...(result.artifact.variables as Record<string, string>) };
          const victim = Object.keys(variables).find((name) => name.startsWith("--ds-state-"));
          if (victim) delete variables[victim];
          return { ...result, artifact: { ...result.artifact, variables } };
        },
      };
    });

    const { compileTenantThemeDocumentV2 } = await import(
      "@/infrastructure/compilers/composition/tenant-theme/document-v2"
    );
    const { db, baseline } = await arms();
    const moved = Object.keys(db).filter((channel) => db[channel] !== baseline[channel]);
    const published = compileTenantThemeDocumentV2({
      document: DOCUMENT,
      tenantId: "tenant_transport_drill",
      slug: SLUG,
      verticalKey: VERTICAL,
      rowVersion: 1,
    }).artifact.variables as Record<string, string>;

    expect(
      [...Object.keys(published)].sort(),
      "law 3 compares SETS so a shortened artifact cannot pass"
    ).not.toEqual([...moved].sort());
  });

  it("the mutations are the ONLY difference: unmocked, the arms agree again", async () => {
    vi.resetModules();
    vi.doUnmock(INTENT_CONTRACT);
    vi.doUnmock(ARTIFACT_ASSEMBLY);
    const { db, preview, dbAuthored, previewAuthored, dbDelta, previewDelta } = await arms();
    expect(disagreements(db, preview)).toEqual([]);
    expect(previewAuthored).toBe(dbAuthored);
    expect(previewDelta).toEqual(dbDelta);
  });
});
