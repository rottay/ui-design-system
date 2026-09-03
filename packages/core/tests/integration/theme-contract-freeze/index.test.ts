/**
 * Cross-unit freeze for the theme contract chain.
 *
 * Per fixture and per field the new chain equals the compiler it wraps; the
 * diagnostic slug moves no channel value; the deliberate `ON_TONE_ROLES`
 * duplication is fenced by equality; the theme owners emit no `--ds-*` name;
 * and the two transitional re-exports have exact consumer sets.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

import type {
  Theme,
  ThemePatch,
} from "@/foundation/contracts/composition/tenants/themes/iso";
import {
  resolveTheme as isoResolveTheme,
  themeToBrandTheme,
} from "@/foundation/contracts/composition/tenants/themes/iso";
import type { TenantThemeDocument } from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import type { BrandCompilerProvenanceInput } from "@/foundation/contracts/composition/tenants/themes/resolved";
import {
  RESOLVED_TONE_ROLES,
  tenantProvenance,
} from "@/foundation/contracts/composition/tenants/themes/resolved";
import { ON_TONE_ROLES } from "@/infrastructure/compilers/kernel/foundation/css/color-math/readable-ink";
import { compileBrandTheme } from "@/infrastructure/compilers/kernel/runtime/brand-theme";
import { migrateV1 } from "@/infrastructure/compilers/composition/tenant-theme/migrate-v1";
import { FIRST_PARTY_THEMES } from "@/foundation/tokens/ts/presentation/brand-themes";
import {
  compileTheme,
  emitThemeCss,
  firstPartyScope,
  resolveAdapter,
  resolveTheme,
} from "@/infrastructure/compilers/runtime/theme";
import {
  DIVERGENCE_EDITORIAL_DOCUMENT,
  DIVERGENCE_EDITORIAL_IDENTITY,
} from "@tests/fixtures/brand-themes/divergence-editorial";
import {
  DIVERGENCE_SOBER_DOCUMENT,
  DIVERGENCE_SOBER_IDENTITY,
} from "@tests/fixtures/brand-themes/divergence-sober";

const PACKAGE_ROOT = resolve(__dirname, "../../..");
const SRC_ROOT = join(PACKAGE_ROOT, "src");
const modern = resolveAdapter("modern");

/**
 * The three first-party `Theme` values, plus a zero-mode variant of two.
 *
 * The `torture` and `themanagementmiami` fixtures are deliberately absent: they
 * are plain `BrandTheme` literals with no `capabilities` catalog, so they are
 * not `FirstPartyBrandTheme` and cannot honestly become a `Theme`.
 */
const FIXTURES: readonly [string, Theme][] = [
  ["rottay", FIRST_PARTY_THEMES.rottay],
  ["bithire", FIRST_PARTY_THEMES.bithire],
  ["evnto", FIRST_PARTY_THEMES.evnto],
  ["rottay-no-modes", { ...FIRST_PARTY_THEMES.rottay, modes: undefined } as unknown as Theme],
  ["evnto-no-modes", { ...FIRST_PARTY_THEMES.evnto, modes: undefined } as unknown as Theme],
];

/** The real DB ingress: a v1 document migrated to the patch the door lowers. */
const tenantPatchOf = (document: unknown, identity: unknown): ThemePatch =>
  migrateV1(
    { ...(document as object), ...(identity as object) } as TenantThemeDocument,
    FIRST_PARTY_THEMES.bithire.appearance.defaultMode ?? "light"
  ).patch;

const TENANT_FIXTURES: readonly [string, Theme, ThemePatch][] = [
  [
    "divergence-editorial over bithire",
    FIRST_PARTY_THEMES.bithire,
    tenantPatchOf(DIVERGENCE_EDITORIAL_DOCUMENT, DIVERGENCE_EDITORIAL_IDENTITY),
  ],
  [
    "divergence-sober over bithire",
    FIRST_PARTY_THEMES.bithire,
    tenantPatchOf(DIVERGENCE_SOBER_DOCUMENT, DIVERGENCE_SOBER_IDENTITY),
  ],
];

/* -------------------------------------------------------------------------- */
/* the new chain reproduces the compiler it wraps                             */
/* -------------------------------------------------------------------------- */

describe("the new chain reproduces the old chain, field by field", () => {
  for (const [label, theme] of FIXTURES) {
    it(`${label} compiles identically through both doors`, () => {
      const before = compileBrandTheme({
        brandTheme: themeToBrandTheme(theme),
        tenantSlug: theme.id,
      });
      const after = compileTheme(resolveTheme(theme), modern);

      expect(after.cssVariables).toEqual(before.cssVariables);
      expect(after.modeBlocks).toEqual(before.modeBlocks ?? []);
      expect(after.colorScheme).toBe(before.colorScheme);
      expect(after.runtime.personality).toEqual(before.personality);
      expect(after.runtime.tokenOverrides).toEqual(before.tokenOverrides);
      expect(after.runtime.recipeProfile).toBe(before.recipeProfile);
      expect(after.runtime.experienceProfile).toBe(before.experienceProfile);
      expect(after.projection).toEqual({ seeds: {}, tokenOverrides: {}, modes: [] });
      expect(after.engine).toBe("modern");
    });
  }

  for (const [label, baseline, patch] of TENANT_FIXTURES) {
    it(`reproduces the tenant branch for ${label}`, () => {
      const resolution = resolveTheme(baseline, {
        origin: "tenant-document",
        patch,
      });
      expect(resolution.provenance.tenantAuthored).toBe(true);
      expect(resolution.provenance.authoredPaths.size).toBeGreaterThan(0);

      const after = compileTheme(resolution, modern);
      // A typed const, never an inline literal: the three provenance fields
      // live on the widened input type, not on `BrandCompilerInput`.
      const input: BrandCompilerProvenanceInput = {
        brandTheme: themeToBrandTheme(resolution.theme),
        tenantSlug: resolution.theme.id,
        tenantAuthoredPaths: resolution.provenance.authoredPaths,
        tenantPatch: resolution.provenance.floors,
        tenantStatusSeedAuthorship: resolution.provenance.statusSeedAuthorship,
      };
      const before = compileBrandTheme(input);
      expect(after.cssVariables).toEqual(before.cssVariables);
      expect(after.modeBlocks).toEqual(before.modeBlocks ?? []);
      expect(after.runtime.personality).toEqual(before.personality);
      expect(after.runtime.tokenOverrides).toEqual(before.tokenOverrides);
    });

    it(`${label} really diverges from the untouched baseline`, () => {
      const tenant = compileTheme(
        resolveTheme(baseline, { origin: "tenant-document", patch }),
        modern
      );
      const plain = compileTheme(resolveTheme(baseline), modern);
      expect(tenant.cssVariables).not.toEqual(plain.cssVariables);
    });
  }

  it("emission still reproduces cssString for every first-party fixture", () => {
    for (const slug of ["rottay", "bithire", "evnto"] as const) {
      const theme = FIRST_PARTY_THEMES[slug];
      const before = compileBrandTheme({
        brandTheme: themeToBrandTheme(theme),
        tenantSlug: theme.id,
      });
      const after = compileTheme(resolveTheme(theme), modern);
      expect(emitThemeCss(after, firstPartyScope(slug))).toBe(before.cssString);
    }
  });
});

/* -------------------------------------------------------------------------- */
/* no channel value depends on the diagnostic slug                            */
/* -------------------------------------------------------------------------- */

describe("the slug is a diagnostic label, not a visual input", () => {
  it("compiling the same theme under two ids yields identical channels", () => {
    const theme = FIRST_PARTY_THEMES.evnto;
    const renamed = { ...theme, id: "rottay" } as Theme;
    const a = compileTheme(resolveTheme(theme), modern);
    const b = compileTheme(resolveTheme(renamed), modern);

    expect(b.cssVariables).toEqual(a.cssVariables);
    expect(b.modeBlocks).toEqual(a.modeBlocks);
    expect(b.colorScheme).toBe(a.colorScheme);
    expect(b.runtime).toEqual(a.runtime);
  });

  it("only the emitted SELECTOR moves with the slug", () => {
    const theme = FIRST_PARTY_THEMES.evnto;
    const compiled = compileTheme(resolveTheme(theme), modern);
    expect(emitThemeCss(compiled, firstPartyScope("evnto"))).not.toBe(
      emitThemeCss(compiled, firstPartyScope("rottay"))
    );
  });
});

/* -------------------------------------------------------------------------- */
/* the deliberate duplication is fenced                                       */
/* -------------------------------------------------------------------------- */

describe("RESOLVED_TONE_ROLES restates ON_TONE_ROLES because foundation cannot import infrastructure", () => {
  it("is equal in value and in order", () => {
    expect([...RESOLVED_TONE_ROLES]).toEqual([...ON_TONE_ROLES]);
  });

  it("the contract owner declares the literals and imports nothing from infrastructure", () => {
    const source = readFileSync(
      join(SRC_ROOT, "foundation/contracts/composition/tenants/themes/resolved/index.ts"),
      "utf8"
    );
    expect(source).toMatch(/export const RESOLVED_TONE_ROLES = \[/);
    for (const statement of source.match(/(?:^|\n)\s*import[^;]*?;/gs) ?? []) {
      expect(statement).not.toMatch(/infrastructure/);
    }
  });
});

/* -------------------------------------------------------------------------- */
/* the theme owners mint no channel name                                      */
/* -------------------------------------------------------------------------- */

describe("the theme owners emit no --ds-* name, so CHROME_EMITTERS needs no row", () => {
  const THEME_CHAIN_OWNERS = [
    "foundation/contracts/composition/tenants/themes/intent",
    "foundation/contracts/composition/tenants/themes/resolved",
    "foundation/contracts/composition/tenants/themes/compiled",
    "foundation/contracts/composition/tenants/themes/emission",
    "foundation/contracts/composition/tenants/themes/engine-adapter",
    "foundation/contracts/kernel/tokens/engine-tokens",
    "infrastructure/compilers/runtime/theme",
  ];

  const productionSources = (relative: string): string[] => {
    const out: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) {
          if (entry !== "tests") walk(full);
        } else if (entry.endsWith(".ts") && !entry.endsWith(".test.ts")) {
          out.push(full);
        }
      }
    };
    walk(join(SRC_ROOT, relative));
    return out;
  };

  it("writes no vars['--ds-*'] anywhere in the new owners", () => {
    for (const owner of THEME_CHAIN_OWNERS) {
      for (const file of productionSources(owner)) {
        expect(readFileSync(file, "utf8")).not.toMatch(/vars\['--ds-[a-z0-9-]+'\]/);
      }
    }
  });

  const withoutComments = (source: string): string =>
    source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/[^\n]*/g, "$1");

  it("names a --ds-* channel in CODE in exactly one owner, and only to READ it", () => {
    const naming = THEME_CHAIN_OWNERS.flatMap((owner) =>
      productionSources(owner).filter((file) =>
        /--ds-[a-z0-9-]+/.test(withoutComments(readFileSync(file, "utf8")))
      )
    );
    expect(naming).toHaveLength(1);
    expect(naming[0]?.endsWith("presentation/adapters/classic/index.ts")).toBe(true);

    // The classic adapter resolves antd seeds from compiled channels: every
    // channel name is a quoted VALUE in a lookup table, never a key it writes.
    const code = withoutComments(readFileSync(naming[0] as string, "utf8"));
    expect(code).toContain("CLASSIC_SEED_CHANNELS");
    expect(code).toContain("CLASSIC_RADIUS_CHANNELS");
    expect(code.match(/--ds-[a-z0-9-]+/g) ?? []).toHaveLength(
      (code.match(/:\s*"--ds-[a-z0-9-]+"/g) ?? []).length
    );
  });

  it("every other --ds-* mention in the theme owners is prose, not code", () => {
    const mentions = THEME_CHAIN_OWNERS.flatMap((owner) =>
      productionSources(owner).filter((file) =>
        /--ds-[a-z0-9-]+/.test(readFileSync(file, "utf8"))
      )
    );
    // engine-adapter's EngineProjection docblock and rustic's posture comments
    // cite channel names to explain a verdict; neither reaches runtime.
    expect(mentions.length).toBeGreaterThan(1);
    for (const file of mentions) {
      if (file.endsWith("presentation/adapters/classic/index.ts")) continue;
      expect(withoutComments(readFileSync(file, "utf8"))).not.toMatch(/--ds-/);
    }
  });

  it("produces no CSS text outside the emission owner", () => {
    for (const owner of THEME_CHAIN_OWNERS) {
      for (const file of productionSources(owner)) {
        if (file.includes("runtime/emission")) continue;
        expect(readFileSync(file, "utf8")).not.toMatch(/color-scheme:/);
      }
    }
  });
});

/* -------------------------------------------------------------------------- */
/* the two transitional re-exports and their exact consumer sets              */
/* -------------------------------------------------------------------------- */

describe("the two transitional re-exports are consumer-exact", () => {
  const allSources = (): string[] => {
    const out: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) walk(full);
        else if (/\.tsx?$/.test(entry)) out.push(full);
      }
    };
    walk(SRC_ROOT);
    walk(join(PACKAGE_ROOT, "tests"));
    return out;
  };

  /**
   * Every file that imports `name`, whatever specifier style it uses, resolved
   * to the owner directory it actually names. A consumer that switches from
   * `@/...` to a relative path is the same consumer, and a pin that only sees
   * one spelling is a pin that can be evaded by reformatting.
   */
  const importersOf = (name: string, ownerDir: string): string[] =>
    allSources()
      .filter((file) => {
        const source = readFileSync(file, "utf8");
        const statements = source.match(/import[^;]*?from\s*["'][^"']+["']/gs) ?? [];
        return statements.some((statement) => {
          if (!new RegExp(`\\b${name}\\b`).test(statement)) return false;
          const specifier = statement.match(/from\s*["']([^"']+)["']/)?.[1];
          if (!specifier) return false;
          const target = specifier.startsWith("@/")
            ? join(SRC_ROOT, specifier.slice(2))
            : specifier.startsWith(".")
              ? resolve(file, "..", specifier)
              : null;
          return target === ownerDir;
        });
      })
      .map((file) => file.slice(PACKAGE_ROOT.length + 1))
      .sort();

  it("brand-theme re-exports TenantStatusSeedAuthorship for exactly one consumer", () => {
    const brandTheme = readFileSync(
      join(SRC_ROOT, "infrastructure/compilers/kernel/runtime/brand-theme/index.ts"),
      "utf8"
    );
    expect(brandTheme).toContain("export type { TenantStatusSeedAuthorship };");
    expect(
      importersOf(
        "TenantStatusSeedAuthorship",
        join(SRC_ROOT, "infrastructure/compilers/kernel/runtime/brand-theme")
      )
    ).toEqual(["src/infrastructure/compilers/composition/tenant-theme/index.ts"]);
  });

  it("does NOT re-export BrandCompilerProvenanceInput: that would publish a new type", () => {
    const brandTheme = readFileSync(
      join(SRC_ROOT, "infrastructure/compilers/kernel/runtime/brand-theme/index.ts"),
      "utf8"
    );
    expect(brandTheme).not.toMatch(/export\s+type\s*\{[^}]*BrandCompilerProvenanceInput/);
    expect(brandTheme).toMatch(/import type \{\s*\n\s*BrandCompilerProvenanceInput,/);
  });

  it("tenant-theme re-exports tenantPostureFloors for exactly two consumers", () => {
    const tenantTheme = readFileSync(
      join(SRC_ROOT, "infrastructure/compilers/composition/tenant-theme/index.ts"),
      "utf8"
    );
    expect(tenantTheme).toContain("export { tenantPostureFloors };");
    expect(
      importersOf(
        "tenantPostureFloors",
        join(SRC_ROOT, "infrastructure/compilers/composition/tenant-theme")
      )
    ).toEqual([
      "src/infrastructure/compilers/composition/tenant-theme/tests/provenance-acceptance.test.ts",
      "src/infrastructure/compilers/kernel/runtime/brand-theme/tests/e2-composed-pairing.test.ts",
    ]);
  });

  it("both relocated definitions now live in the contract owner", () => {
    const resolved = readFileSync(
      join(SRC_ROOT, "foundation/contracts/composition/tenants/themes/resolved/index.ts"),
      "utf8"
    );
    expect(resolved).toContain("export function tenantPostureFloors");
    expect(resolved).toContain("export function deriveTenantStatusSeedAuthorship");
    expect(resolved).toContain("export interface TenantStatusSeedAuthorship");
    expect(resolved).toContain("export type BrandCompilerProvenanceInput");
  });
});

/* -------------------------------------------------------------------------- */
/* the intent's origin decides authorship, and provenance is a snapshot        */
/* -------------------------------------------------------------------------- */

describe("origin decides authorship at the compiler", () => {
  const baseline = FIRST_PARTY_THEMES.bithire;
  const patchOf = () =>
    tenantPatchOf(DIVERGENCE_EDITORIAL_DOCUMENT, DIVERGENCE_EDITORIAL_IDENTITY);

  it("a static-vertical intent compiles as the merged theme with no tenant at all", () => {
    const patch = patchOf();
    const merged = isoResolveTheme(baseline, patch);
    const viaIntent = compileTheme(
      resolveTheme(baseline, { origin: "static-vertical", patch }),
      modern
    );
    const asPlainTheme = compileTheme(resolveTheme(merged), modern);

    expect(viaIntent.cssVariables).toEqual(asPlainTheme.cssVariables);
    expect(viaIntent.modeBlocks).toEqual(asPlainTheme.modeBlocks);
  });

  it("the same patch as a static layer and as a tenant document are not the same compile", () => {
    const patch = patchOf();
    const asStatic = compileTheme(
      resolveTheme(baseline, { origin: "static-vertical", patch }),
      modern
    );
    const asTenant = compileTheme(
      resolveTheme(baseline, { origin: "tenant-document", patch }),
      modern
    );
    expect(asTenant.cssVariables).not.toEqual(asStatic.cssVariables);
  });

  it("a preview compiles exactly as the persisted tenant document", () => {
    const patch = patchOf();
    const preview = compileTheme(
      resolveTheme(baseline, { origin: "preview", patch }),
      modern
    );
    const persisted = compileTheme(
      resolveTheme(baseline, { origin: "tenant-document", patch }),
      modern
    );
    expect(preview.cssVariables).toEqual(persisted.cssVariables);
    expect(preview.modeBlocks).toEqual(persisted.modeBlocks);
  });
});

describe("provenance is a snapshot the caller cannot reach back into", () => {
  const baseline = FIRST_PARTY_THEMES.bithire;

  it("mutating the patch afterwards moves no compiled channel", () => {
    const patch = tenantPatchOf(
      DIVERGENCE_EDITORIAL_DOCUMENT,
      DIVERGENCE_EDITORIAL_IDENTITY
    );
    const { provenance } = resolveTheme(baseline, { origin: "tenant-document", patch });
    const before = compileTheme({ theme: baseline, provenance }, modern);

    const raw = patch as unknown as Record<string, Record<string, unknown>>;
    raw.surfaces = { ...raw.surfaces, radiusScale: 0.75, density: "spacious" };
    raw.typography = { ...raw.typography, scale: 2 };

    const after = compileTheme({ theme: baseline, provenance }, modern);
    expect(after.cssVariables).toEqual(before.cssVariables);

    // The mutation was material: rebuilding provenance from the mutated patch
    // does move channels, so the invariance above is a snapshot, not a no-op.
    const rebuilt = compileTheme(
      { theme: baseline, provenance: tenantProvenance(patch) },
      modern
    );
    expect(rebuilt.cssVariables).not.toEqual(before.cssVariables);
  });

  it("mutation attempted through the returned provenance throws and changes nothing", () => {
    const patch = tenantPatchOf(DIVERGENCE_SOBER_DOCUMENT, DIVERGENCE_SOBER_IDENTITY);
    const { provenance } = resolveTheme(baseline, { origin: "tenant-document", patch });
    const before = compileTheme({ theme: baseline, provenance }, modern);

    const reach = (value: unknown) => value as Record<string, unknown>;
    expect(() => {
      reach(provenance).tenantAuthored = false;
    }).toThrow(TypeError);
    expect(() => {
      reach(provenance.floors.surfaces).radiusScale = 0.75;
    }).toThrow(TypeError);
    expect(() => {
      reach(provenance.statusSeedAuthorship.base).success = true;
    }).toThrow(TypeError);
    expect(
      (provenance.authoredPaths as unknown as Record<string, unknown>).add
    ).toBeUndefined();

    const after = compileTheme({ theme: baseline, provenance }, modern);
    expect(after.cssVariables).toEqual(before.cssVariables);
    expect(after.modeBlocks).toEqual(before.modeBlocks);
  });
});
