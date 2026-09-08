/**
 * Cross-unit freeze for the theme contract chain.
 *
 * Per fixture and per field the new chain equals the compiler it wraps; the
 * diagnostic slug moves no channel value; the deliberate `ON_TONE_ROLES`
 * duplication is fenced by equality; the theme owners emit no `--ds-*` name;
 * and the two transitional re-exports have exact consumer sets.
 */

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

import type {
  Theme,
  ThemeLayerPatch,
} from "@/foundation/contracts/composition/tenants/themes/iso";
import { mergeThemePatches } from "@/foundation/contracts/composition/tenants/themes/iso";
import type { TenantThemeDocument } from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import type { ThemeIntentOrigin } from "@/foundation/contracts/composition/tenants/themes/intent";
import type { ThemeResolution } from "@/foundation/contracts/composition/tenants/themes/resolved";
import {
  EMPTY_PROVENANCE,
  RESOLVED_TONE_ROLES,
  tenantProvenance,
} from "@/foundation/contracts/composition/tenants/themes/resolved";
import type { FirstPartyVerticalId } from "@/foundation/contracts/kernel/verticals";
import { ON_TONE_ROLES } from "@/infrastructure/compilers/kernel/foundation/css/color-math/readable-ink";
import {
  documentThemePatch,
  migrateV1,
} from "@/infrastructure/compilers/runtime/theme/runtime/ingress";
import { FIRST_PARTY_THEMES } from "@/foundation/tokens/ts/presentation/brand-themes";
import {
  containerScope,
  emitThemeCss,
  firstPartyScope,
  resolveAdapter,
  staticThemeIntent,
} from "@/infrastructure/compilers/runtime/theme";
// The lowering and the resolver left the barrel with WO-CAT-03: the root
// package entrypoint re-exports it, so publishing them there kept the second
// route open on `@rottay/design-system` after `/server` was closed (F-24).
import { compileTheme } from "@/infrastructure/compilers/runtime/theme/runtime/lowering";
import { resolveTheme } from "@/infrastructure/compilers/runtime/theme/runtime/resolution";
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
const noModes = (vertical: FirstPartyVerticalId): ThemeResolution => ({
  // A family removed from a roster theme is not a roster theme, so no intent
  // can name it. The resolution is the door's own no-tenant shape.
  theme: { ...FIRST_PARTY_THEMES[vertical], modes: undefined } as unknown as Theme,
  provenance: EMPTY_PROVENANCE,
});

const FIXTURES: readonly [string, ThemeResolution][] = [
  ["rottay", resolveTheme(staticThemeIntent("rottay"))],
  ["bithire", resolveTheme(staticThemeIntent("bithire"))],
  ["evnto", resolveTheme(staticThemeIntent("evnto"))],
  ["rottay-no-modes", noModes("rottay")],
  ["evnto-no-modes", noModes("evnto")],
];

/**
 * The real DB ingress: a v1 document migrated to the patch the door lowers.
 *
 * Through `documentThemePatch`, so the default mode is the baseline's own and
 * not a literal this file chose -- the exact divergence that made the preview
 * sandbox and the publish path disagree on a dark-default vertical.
 */
const tenantPatchOf = (
  vertical: FirstPartyVerticalId,
  document: unknown,
  identity: unknown
): ThemeLayerPatch =>
  documentThemePatch({
    vertical,
    document: {
      ...(document as object),
      ...(identity as object),
    } as TenantThemeDocument,
  });

const TENANT_FIXTURES: readonly [string, FirstPartyVerticalId, ThemeLayerPatch][] = [
  [
    "divergence-editorial over bithire",
    "bithire",
    tenantPatchOf("bithire", DIVERGENCE_EDITORIAL_DOCUMENT, DIVERGENCE_EDITORIAL_IDENTITY),
  ],
  [
    "divergence-sober over bithire",
    "bithire",
    tenantPatchOf("bithire", DIVERGENCE_SOBER_DOCUMENT, DIVERGENCE_SOBER_IDENTITY),
  ],
];

/* -------------------------------------------------------------------------- */
/* the new chain reproduces the compiler it wraps                             */
/* -------------------------------------------------------------------------- */

describe("the single chain produces a total, engine-projected compilation", () => {
  // Compiled BYTES are pinned against the committed first-party artifacts in
  // `lowering/tests/artifact-oracle.test.ts`; this block fences the product shape.
  for (const [label, resolution] of FIXTURES) {
    it(`${label} compiles to the total product shape`, () => {
      const compiled = compileTheme(resolution, modern);

      expect(Object.keys(compiled.cssVariables).length).toBeGreaterThan(0);
      expect(Array.isArray(compiled.modeBlocks)).toBe(true);
      expect(compiled.runtime.personality).toBeTruthy();
      expect(compiled.runtime.tokenOverrides).toBeTruthy();
      expect(compiled.projection).toEqual({ seeds: {}, modes: [] });
      expect(compiled.engine).toBe("modern");
      // Scope is emission's, so the product carries neither CSS text nor slug.
      const asRecord = compiled as unknown as Record<string, unknown>;
      expect(asRecord.cssString).toBeUndefined();
      expect(asRecord.tenantSlug).toBeUndefined();
    });
  }

  for (const [label, vertical, patch] of TENANT_FIXTURES) {
    it(`${label} resolves to tenant-authored provenance`, () => {
      const resolution = resolveTheme({
        vertical,
        slug: vertical,
        origin: "tenant-document",
        patch,
      });
      expect(resolution.provenance.tenantAuthored).toBe(true);
      expect(resolution.provenance.authoredPaths.size).toBeGreaterThan(0);
    });

    it(`${label} really diverges from the untouched baseline`, () => {
      const tenant = compileTheme(
        resolveTheme({ vertical, slug: vertical, origin: "tenant-document", patch }),
        modern
      );
      const plain = compileTheme(resolveTheme(staticThemeIntent(vertical)), modern);
      expect(tenant.cssVariables).not.toEqual(plain.cssVariables);
    });
  }

  it("emission scopes one compile to three different roots without recompiling", () => {
    for (const slug of ["rottay", "bithire", "evnto"] as const) {
      const compiled = compileTheme(resolveTheme(staticThemeIntent(slug)), modern);
      const root = emitThemeCss(compiled, firstPartyScope(slug));
      const container = emitThemeCss(compiled, containerScope(".preview"));
      expect(root).toContain(`html[data-tenant='${slug}'] {`);
      expect(container).toContain(".preview {");
      // Same declarations, different scope: the count of emitted custom
      // properties cannot change with the selector.
      const count = (css: string) => css.split("\n").filter((l) => /^\s+--/u.test(l)).length;
      expect(count(container)).toBe(count(root));
    }
  });
});

/* -------------------------------------------------------------------------- */
/* no channel value depends on the diagnostic slug                            */
/* -------------------------------------------------------------------------- */

describe("the slug is a diagnostic label, not a visual input", () => {
  it("compiling the same theme under two ids yields identical channels", () => {
    const a = compileTheme(resolveTheme(staticThemeIntent("evnto")), modern);
    const b = compileTheme(
      resolveTheme(staticThemeIntent("evnto", "rottay")),
      modern
    );

    expect(b.cssVariables).toEqual(a.cssVariables);
    expect(b.modeBlocks).toEqual(a.modeBlocks);
    expect(b.colorScheme).toBe(a.colorScheme);
    expect(b.runtime).toEqual(a.runtime);
  });

  it("only the emitted SELECTOR moves with the slug", () => {
    const compiled = compileTheme(resolveTheme(staticThemeIntent("evnto")), modern);
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

describe("channel minting and CSS text have declared owners", () => {
  /**
   * Who may mint a `--ds-*` channel name, and who may write CSS text:
   *
   *   - CONTRACTS may not mint. A type that names a channel makes the contract a
   *     second authority on what gets painted.
   *   - ADAPTERS may not mint. An adapter projects a compiled theme onto an
   *     engine's own seeds; a `--ds-*` key it writes would be a channel no
   *     census attributes to the compiler.
   *   - The DECLARED LOWERING OWNERS may mint. That is their job, and the list
   *     is exact: a new minting owner must be added here deliberately.
   *   - CLASSIC may READ channel names, never write them.
   *   - EMISSION alone owns CSS text.
   */
  const CONTRACT_OWNERS = [
    "foundation/contracts/composition/tenants/themes/intent",
    "foundation/contracts/composition/tenants/themes/resolved",
    "foundation/contracts/composition/tenants/themes/compiled",
    "foundation/contracts/composition/tenants/themes/emission",
    "foundation/contracts/composition/tenants/themes/engine-adapter",
    "foundation/contracts/kernel/tokens/engine-tokens",
  ];
  const LOWERING_ROOT = "infrastructure/compilers/runtime/theme/runtime/lowering";
  const PIPELINE_ROOT = "infrastructure/compilers/runtime/theme";
  const EMISSION_OWNER = "infrastructure/compilers/runtime/theme/runtime/emission";
  const ADAPTER_ROOT =
    "infrastructure/compilers/runtime/theme/presentation/adapters/presentation";
  const CLASSIC_ADAPTER = `${ADAPTER_ROOT}/classic/index.ts`;
  const ENGINE_ADAPTERS = ["classic", "modern", "rustic"].map(
    (engine) => `${ADAPTER_ROOT}/${engine}/index.ts`,
  );
  // The v1 override-token allowlist maps channel NAMES to theme keypaths as a
  // lookup table; it reads channels as data and mints none.
  const INGRESS_DOCUMENT_PATCH =
    "infrastructure/compilers/runtime/theme/runtime/ingress/foundation/document-patch/index.ts";
  // The v1 -> v2 migration carries the same shape for the opposite direction:
  // `TOKEN_TO_SEED` maps a retired raw token NAME to the decision that now owns
  // it, so a published tenant is migrated instead of silently repainted. Data,
  // like the allowlist above, and it mints nothing.
  const INGRESS_DOCUMENT_MIGRATE =
    "infrastructure/compilers/runtime/theme/runtime/ingress/runtime/document-v2/foundation/migrate/index.ts";
  // WO-CAT-03 moved the APCA floor, the categorical chart floor, the value
  // grammar and the payload ceilings out of `compileTenantTheme` and into the
  // single admission at the door. They arrived NAMING channels because that is
  // what those rules measure -- the chart surfaces a mark must clear, the
  // sidebar pair a tenant can author, the two compiler-generated profile
  // channels the value parser exempts -- and every one of those names is a
  // table entry, an anchored matcher or a string, never an identifier the owner
  // computes with. The second half of this test is what holds them to that.
  const ADMISSION_CONTRAST =
    "infrastructure/compilers/runtime/theme/facade/foundation/admission/runtime/contrast/index.ts";
  const ADMISSION_LIMITS =
    "infrastructure/compilers/runtime/theme/facade/foundation/admission/runtime/limits/index.ts";

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

  const withoutComments = (source: string): string =>
    source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/[^\n]*/g, "$1");

  /** Blank every string literal, so what remains is code rather than data. */
  const withoutStrings = (source: string): string =>
    source
      .replace(/"(?:[^"\\]|\\.)*"/g, '""')
      .replace(/'(?:[^'\\]|\\.)*'/g, "''")
      .replace(/`(?:[^`\\]|\\.)*`/g, "``");

  /**
   * Blank a regex literal anchored on a channel name, e.g.
   * `/^--ds-radius-(sm|md|lg|xl)$/`. Such a literal MATCHES an incoming token
   * name, so the name is data exactly as a table key is; a matcher can read a
   * channel but never mint one. Anchored on the literal opening `/^--ds-` and
   * stopped at the closing `/`, so it can never swallow surrounding code.
   */
  const withoutChannelMatchers = (source: string): string =>
    source
      .replace(/\/\^--ds-[^/\n]*\/[dgimsuvy]*/g, "/ /")
      // The same rule for the same reason, in the one other shape a matcher
      // takes: `/^var\(\s*(--ds-[a-z0-9-]+)...\)$/` reads an incoming `var()`
      // REFERENCE out of a compiled value. It matches a token name exactly as
      // the form above does -- it can read a channel, never mint one -- and it
      // only became visible to this sweep when WO-CAT-03 moved the contrast
      // admission under the pipeline root. Anchored on the literal opening
      // `/^var\(` and stopped at the closing `/`, so it cannot swallow code.
      .replace(/\/\^var\\\([^/\n]*\/[dgimsuvy]*/g, "/ /");

  const MINTS = /vars\[["']--ds-[a-z0-9-]+["']\]|cssVariables\[["']--ds-[a-z0-9-]+["']\]/;
  const rel = (file: string) => file.slice(SRC_ROOT.length + 1);

  it("no contract owner mints a channel", () => {
    const minting = CONTRACT_OWNERS.flatMap((owner) =>
      productionSources(owner).filter((file) => MINTS.test(withoutComments(readFileSync(file, "utf8")))),
    ).map(rel);
    expect(minting).toEqual([]);
  });

  it("no adapter mints a channel", () => {
    const minting = productionSources(`${PIPELINE_ROOT}/presentation/adapters`)
      .filter((file) => MINTS.test(withoutComments(readFileSync(file, "utf8"))))
      .map(rel);
    expect(minting).toEqual([]);
  });

  it("every channel minted under the pipeline belongs to a declared lowering owner", () => {
    const minting = productionSources(PIPELINE_ROOT)
      .filter((file) => MINTS.test(withoutComments(readFileSync(file, "utf8"))))
      .map(rel);
    expect(minting.length).toBeGreaterThan(0);
    for (const file of minting) {
      expect(file.startsWith(LOWERING_ROOT), `${file} mints outside the lowering`).toBe(true);
    }
    // Exact, not "at least": a new minting owner is a deliberate addition. The
    // channel assembly that used to mint most of this list is one deriver per
    // family now, so the minting owners are the families themselves.
    expect(minting.sort()).toEqual([
      `${LOWERING_ROOT}/foundation/materials/index.ts`,
      `${LOWERING_ROOT}/foundation/motion/index.ts`,
      `${LOWERING_ROOT}/foundation/palette/index.ts`,
      `${LOWERING_ROOT}/foundation/type-ramp/index.ts`,
      `${LOWERING_ROOT}/runtime/derivation/axes/index.ts`,
      `${LOWERING_ROOT}/runtime/derivation/charts/index.ts`,
      `${LOWERING_ROOT}/runtime/derivation/chrome/index.ts`,
      `${LOWERING_ROOT}/runtime/derivation/materials/index.ts`,
      `${LOWERING_ROOT}/runtime/derivation/palette/index.ts`,
      `${LOWERING_ROOT}/runtime/derivation/recipes/index.ts`,
      `${LOWERING_ROOT}/runtime/derivation/states/index.ts`,
      `${LOWERING_ROOT}/runtime/derivation/surfaces/index.ts`,
      `${LOWERING_ROOT}/runtime/derivation/tenant/index.ts`,
      `${LOWERING_ROOT}/runtime/derivation/typography/index.ts`,
    ]);
  });

  it("outside the lowering, only the engine adapters NAME a channel, and only as data", () => {
    const naming = productionSources(PIPELINE_ROOT)
      .filter((file) => !rel(file).startsWith(LOWERING_ROOT))
      .filter((file) => /--ds-[a-z0-9-]+/.test(withoutComments(readFileSync(file, "utf8"))))
      .map(rel);
    // Exact, not "at least": an adapter states the channels its posture cites
    // and the values its baseline carries, and the document-patch ingress
    // states the override tokens it accepts; any other owner naming one is new.
    expect(naming.sort()).toEqual(
      [
        ...ENGINE_ADAPTERS,
        INGRESS_DOCUMENT_PATCH,
        INGRESS_DOCUMENT_MIGRATE,
        ADMISSION_CONTRAST,
        ADMISSION_LIMITS,
      ].sort(),
    );

    // A channel name is DATA — a table entry, a name matcher, an evidence
    // string or a value — never an identifier the owner computes with.
    for (const file of naming) {
      const code = withoutChannelMatchers(
        withoutStrings(withoutComments(readFileSync(join(SRC_ROOT, file), "utf8"))),
      );
      expect(code, `${file} names a channel outside a literal`).not.toMatch(/--ds-/);
    }

    const classic = withoutComments(readFileSync(join(SRC_ROOT, CLASSIC_ADAPTER), "utf8"));
    expect(classic).toContain("CLASSIC_SEED_CHANNELS");
    expect(classic).toContain("CLASSIC_RADIUS_CHANNELS");
  });

  it("emission alone produces CSS text", () => {
    const emitting = productionSources(PIPELINE_ROOT)
      .filter((file) => /color-scheme:/.test(readFileSync(file, "utf8")))
      .map(rel);
    expect(emitting.length).toBeGreaterThan(0);
    for (const file of emitting) {
      expect(file.startsWith(EMISSION_OWNER), `${file} writes CSS text`).toBe(true);
    }
  });

  /* ---- fail-closed: each rule is shown refusing a planted violation ------- */

  it("MUTANT: a contract that mints is caught", () => {
    const planted = `export const t = 1;\nvars["--ds-planted"] = "red";\n`;
    expect(MINTS.test(withoutComments(planted))).toBe(true);
  });

  it("MUTANT: an adapter that mints is caught", () => {
    const planted = `export const a = { project() { cssVariables["--ds-planted"] = "x"; } };\n`;
    expect(MINTS.test(withoutComments(planted))).toBe(true);
  });

  it("MUTANT: a channel name hidden in a comment is NOT a minting finding", () => {
    const planted = `// vars['--ds-planted'] = 'red';\n/* cssVariables["--ds-x"] = "y" */\n`;
    expect(MINTS.test(withoutComments(planted))).toBe(false);
  });

  it("MUTANT: the var() matcher blanking does not swallow surrounding code", () => {
    // The widening above must remove a MATCHER and nothing else. A channel
    // reached through anything but that exact literal opening stays a finding.
    const matcher = `const m = /^var\\(\\s*(--ds-[a-z0-9-]+)\\)$/i.exec(v);\n`;
    expect(withoutChannelMatchers(matcher)).not.toMatch(/--ds-/u);
    for (const planted of [
      `const t = notVar(/^var2\\(--ds-radius-md\\)/);\n`,
      `const t = --ds-radius-md;\n`,
    ]) {
      expect(
        withoutChannelMatchers(withoutStrings(planted)),
        planted
      ).toMatch(/--ds-/u);
    }
  });

  it("MUTANT: a channel named outside an anchored matcher is still caught", () => {
    // Only a literal opening `/^--ds-` is a declared name matcher. A channel
    // reached any other way stays a finding.
    for (const planted of [
      `const t = /prefix--ds-radius-(sm|md)/.exec(k);\n`,
      `const t = /^ --ds-radius-(sm|md)$/.exec(k);\n`,
      `<div style={{ width: var(--ds-space-4) }} />;\n`,
    ]) {
      const code = withoutChannelMatchers(withoutStrings(withoutComments(planted)));
      expect(code, planted).toMatch(/--ds-/);
    }
  });

  it("MUTANT: the channel matcher strip blanks only the matcher, not its neighbours", () => {
    const planted = `const t = /^--ds-radius-(sm|md)$/.exec(k);\nvars["--ds-planted"] = y;\n`;
    expect(withoutChannelMatchers(planted)).toContain('vars["--ds-planted"] = y;');
    expect(withoutChannelMatchers(planted)).not.toContain("radius-(sm|md)");
    expect(MINTS.test(withoutComments(withoutChannelMatchers(planted)))).toBe(true);
  });

  it("MUTANT: classic writing a channel instead of reading one is caught", () => {
    const planted = `const seeds = {};\nseeds["--ds-color-primary"] = x;\n`;
    const names = planted.match(/--ds-[a-z0-9-]+/g) ?? [];
    const quotedValues = planted.match(/:\s*"--ds-[a-z0-9-]+"/g) ?? [];
    expect(names.length).not.toBe(quotedValues.length);
  });

  /** The single owner of the declaration/rule grammar, under `src/`. */
  const EMISSION_ASSEMBLY_OWNER = `${EMISSION_OWNER}/index.ts`;

  /** The one grammar that decides whether a value may become CSS text. */
  const VALUE_AUTHORITY = "infrastructure/compilers/kernel/foundation/css/value-safety";

  /** The only owner allowed to re-export that grammar under another name. */
  const AUTHORITY_REEXPORT = "infrastructure/runtime/tenant/runtime/preview-scope";

  /**
   * A template that assembles a CSS declaration from two interpolations.
   *
   * Every gap is optional whitespace and nothing after the `;` is required: a
   * member, a call, an index, an unindented template and a trailing newline are
   * the same assembler, so all of them are findings.
   */
  const DECLARATION_ASSEMBLY = /`\s*\$\{[^{}]+\}\s*:\s*\$\{[^{}]+\}\s*;/;

  /** The same pair with its `;` supplied outside the template. */
  const PAIR_TEMPLATE = /`\s*\$\{[^{}]+\}\s*:\s*\$\{[^{}]+\}\s*`/;
  const EXTERNAL_TERMINATOR = /\.join\(\s*["'];|\+\s*["'];["']/;

  /** The same declaration built by concatenation instead of interpolation. */
  const CONCATENATED_DECLARATION = /\+\s*["']\s*:\s*["']\s*\+/;

  /**
   * A file that can put text into a stylesheet. The two shape-only detectors
   * are scoped to it, so a `:`-join in an error message is not a finding.
   */
  const CSS_TEXT_SINK = /__html|<style|insertRule\(|\.textContent|\.cssText|emitRule\(/;

  /**
   * Every productive assembler of a CSS declaration, and the authority symbol
   * it routes through. The value grammar is the repository's, not emission's
   * private policy: an emitter that assembles declaration text without
   * consulting it is a hole whatever layer it lives in.
   */
  const ASSEMBLERS: readonly { file: string; symbol: string }[] = [
    {
      file: "components/patterns/customization/tenant-preview/runtime/preview-css/index.ts",
      symbol: "isSafePreviewCssValue",
    },
    { file: EMISSION_ASSEMBLY_OWNER, symbol: "admitCssVariables" },
    {
      file: "infrastructure/runtime/responsive/runtime/style-properties/index.ts",
      symbol: "isSafeCssValue",
    },
  ];

  /**
   * The shapes that count as assembling a declaration, each with the exact set
   * of productive files it may report. A file any of them matches has to be a
   * declared `ASSEMBLERS` entry and satisfy the imports-and-calls rule below.
   */
  const ASSEMBLER_DETECTORS: readonly {
    id: string;
    matches: (source: string) => boolean;
    findings: readonly string[];
  }[] = [
    {
      id: "interpolated template",
      matches: (source) => DECLARATION_ASSEMBLY.test(source),
      findings: ASSEMBLERS.map((entry) => entry.file),
    },
    {
      id: "pair template terminated outside it",
      matches: (source) =>
        CSS_TEXT_SINK.test(source) &&
        PAIR_TEMPLATE.test(source) &&
        EXTERNAL_TERMINATOR.test(source),
      findings: [],
    },
    {
      id: "concatenated declaration",
      matches: (source) =>
        CSS_TEXT_SINK.test(source) && CONCATENATED_DECLARATION.test(source),
      findings: [],
    },
  ];

  /** True when any declared detector would report the source as an assembler. */
  const detectsAssembly = (source: string): boolean =>
    ASSEMBLER_DETECTORS.some(({ matches }) => matches(source));

  /** Wraps a planted body in the style sink a productive assembler would feed. */
  const feedingASink = (body: string): string =>
    `${body}\nreturn <style dangerouslySetInnerHTML={{ __html: css }} />;\n`;

  const walkSources = (dir: string, out: string[] = []): string[] => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        if (entry !== "tests" && entry !== "__tests__") walkSources(full, out);
      } else if (/\.tsx?$/.test(entry) && !/\.test\.tsx?$/.test(entry)) {
        out.push(full);
      }
    }
    return out;
  };

  /**
   * True when the source imports the authority, directly or through its single
   * re-export, whatever specifier style it uses.
   *
   * Resolved rather than pattern-matched, for the reason the re-export census
   * below already states: a consumer that switches from `@/...` to a relative
   * path is the same consumer, and a pin that sees only one spelling is a pin
   * that can be evaded by reformatting.
   */
  const reachesAuthority = (source: string, fromFile: string): boolean => {
    const statements = source.match(/(?:import|export)[^;]*?from\s*["'][^"']+["']/gs) ?? [];
    return statements.some((statement) => {
      const specifier = statement.match(/from\s*["']([^"']+)["']/)?.[1];
      if (!specifier) return false;
      const target = specifier.startsWith("@/")
        ? join(SRC_ROOT, specifier.slice(2))
        : specifier.startsWith(".")
          ? resolve(fromFile, "..", specifier)
          : null;
      return (
        target !== null &&
        [VALUE_AUTHORITY, AUTHORITY_REEXPORT].some((dir) => target === join(SRC_ROOT, dir))
      );
    });
  };

  it("every productive assembler of a CSS declaration is declared, repo-wide", () => {
    // EXACT per shape, not "at least": a new assembler is a deliberate addition
    // that has to arrive with its guard.
    const sources = walkSources(SRC_ROOT).map(
      (file) => [rel(file), readFileSync(file, "utf8")] as const
    );
    expect(sources.length).toBeGreaterThan(2000);
    for (const { id, matches, findings } of ASSEMBLER_DETECTORS) {
      const found = sources
        .filter(([, source]) => matches(source))
        .map(([file]) => file)
        .sort();
      expect(found, `${id} findings`).toEqual([...findings].sort());
    }
  });

  it("every declared assembler imports the authority and calls it", () => {
    for (const { file, symbol } of ASSEMBLERS) {
      const source = readFileSync(join(SRC_ROOT, file), "utf8");
      expect(
        reachesAuthority(source, join(SRC_ROOT, file)),
        `${file} does not import the value authority`
      ).toBe(true);
      expect(
        new RegExp(`\\b${symbol}\\s*\\(`).test(withoutComments(source)),
        `${file} imports the authority but never calls it`
      ).toBe(true);
    }
  });

  it("the responsive assembler routes its projected values through the authority", () => {
    // Named on its own: its dimension props are typed as free strings and its
    // output reaches a `<style dangerouslySetInnerHTML>` sink in every primitive.
    const file = "infrastructure/runtime/responsive/runtime/style-properties/index.ts";
    const source = readFileSync(join(SRC_ROOT, file), "utf8");
    expect(source).toContain(`from '@/${VALUE_AUTHORITY}'`);
    expect(source).toMatch(/isSafeCssValue\(/);
    expect(DECLARATION_ASSEMBLY.test(source)).toBe(true);
  });

  it("the re-export is a forward, not a second grammar", () => {
    const source = readFileSync(join(SRC_ROOT, AUTHORITY_REEXPORT, "index.ts"), "utf8");
    expect(source).toMatch(
      new RegExp(`export\\s*\\{[^}]*isSafeCssValue[^}]*\\}\\s*from\\s*["']@/${VALUE_AUTHORITY}["']`)
    );
    // No local grammar: the owner states the names it forwards, nothing else.
    expect(withoutComments(source)).not.toMatch(/function isSafe(Preview)?CssValue/);
  });

  it("MUTANT: a fourth assembler is caught", () => {
    const PLANTED: readonly [string, string][] = [
      ["indented template", "const line = `  ${key}: ${value};`;"],
      ["member and call", "const line = `  ${entry.cssProperty}: ${resolve(raw)};`;"],
      ["index", "out.push(`  ${declaration[1]}: ${declaration[2]};`);"],
      ["unindented template", "const line = `${e.p}: ${e.v};`;"],
      ["no space after the colon", "const line = `${e.p}:${e.v};`;"],
      ["newline inside the template", "const line = `  ${e.p}: ${e.v};\\n`;"],
      [
        "terminator supplied by join",
        feedingASink('const css = rows.map((e) => `  ${e.p}: ${e.v}`).join(";\\n") + ";";'),
      ],
      [
        "concatenation",
        feedingASink("const css = rows.map((e) => '  ' + e.p + ': ' + e.v + ';').join('\\n');"),
      ],
    ];
    for (const [shape, planted] of PLANTED) {
      expect(detectsAssembly(planted), shape).toBe(true);
    }
    // and a rule built from the emission owner is not a finding
    expect(detectsAssembly("emitRule(selector, emitDeclarations(vars))")).toBe(false);
  });

  it("MUTANT: an assembler that skips the authority is caught", () => {
    const unguarded =
      "export function emit(entries) {\n" +
      "  return entries.map((e) => `  ${e.cssProperty}: ${String(e.value)};`);\n}\n";
    const planted = join(SRC_ROOT, "components/planted/index.ts");
    expect(DECLARATION_ASSEMBLY.test(unguarded)).toBe(true);
    expect(reachesAuthority(unguarded, planted)).toBe(false);

    // and an assembler that imports the authority but never calls it is caught
    const importedOnly =
      `import { isSafeCssValue } from '@/${VALUE_AUTHORITY}';\n` + unguarded;
    expect(reachesAuthority(importedOnly, planted)).toBe(true);
    expect(/\bisSafeCssValue\s*\(/.test(withoutComments(importedOnly))).toBe(false);
  });

  /** A `<style>` element whose CSS arrives as text through an identifier. */
  const HTML_STYLE_SINK =
    /<style\b[^>]*?dangerouslySetInnerHTML=\{\{\s*__html:\s*([^}]+?)\s*\}\}/gs;

  /** A `<style>` element whose CSS arrives as a JSX child. */
  const CHILD_STYLE_SINK = /<style\b[^>]*>\s*\{[\s\S]*?\}\s*<\/style>/;

  /**
   * Every productive `<style>` text sink, pinned as file -> the identifier that
   * feeds it. Lines move; a new sink file or a new feeder is a new way into a
   * stylesheet and has to arrive declared with its producer.
   */
  const HTML_STYLE_SINKS: Readonly<Record<string, readonly string[]>> = {
    "components/patterns/customization/brand-studio/index.tsx": ["preview.css", "scopedCss"],
    "components/patterns/customization/branding-preview-sandbox/index.tsx": ["scopedCss"],
    "components/patterns/customization/tenant-preview/engines/classic/index.tsx": ["preview.css"],
    "components/patterns/customization/tenant-preview/engines/modern/index.tsx": ["preview.css"],
    "components/patterns/customization/tenant-preview/engines/rustic/index.tsx": ["preview.css"],
    "components/primitives/display/badge/engines/classic/index.tsx": ["responsive.css"],
    "components/primitives/display/badge/engines/modern/index.tsx": ["responsive.css"],
    "components/primitives/display/badge/engines/rustic/index.tsx": ["responsive.css"],
    "components/primitives/display/card/engines/classic/index.tsx": ["responsive.css"],
    "components/primitives/display/card/engines/modern/index.tsx": ["responsive.css"],
    "components/primitives/display/card/engines/rustic/index.tsx": ["responsive.css"],
    "components/primitives/display/typography/engines/classic/index.tsx": ["responsive.css"],
    "components/primitives/display/typography/engines/modern/index.tsx": ["responsive.css"],
    "components/primitives/display/typography/engines/rustic/index.tsx": ["responsive.css"],
    "components/primitives/feedback/alert/engines/classic/index.tsx": ["responsive.css"],
    "components/primitives/feedback/alert/engines/modern/index.tsx": ["responsive.css"],
    "components/primitives/feedback/alert/engines/rustic/index.tsx": ["responsive.css"],
    "components/primitives/feedback/toast/compound/animated-check/index.tsx": ["keyframes"],
    "components/primitives/inputs/button/engines/classic/index.tsx": ["responsive.css"],
    "components/primitives/inputs/button/engines/modern/index.tsx": ["responsive.css"],
    "components/primitives/inputs/button/engines/rustic/index.tsx": ["responsive.css"],
    "components/primitives/inputs/input/compound/text-area/index.tsx": ["responsive.css"],
    "components/primitives/inputs/input/engines/classic/index.tsx": ["responsive.css"],
    "components/primitives/inputs/input/engines/modern/index.tsx": ["responsive.css"],
    "components/primitives/inputs/input/engines/rustic/index.tsx": ["responsive.css"],
    "components/primitives/inputs/select/engines/classic/index.tsx": ["responsive.css"],
    "components/primitives/inputs/select/engines/modern/index.tsx": ["responsiveCSS.css"],
    "components/primitives/inputs/select/engines/rustic/index.tsx": ["responsiveCSS.css"],
    "components/primitives/layout/box/engines/classic/index.tsx": ["responsive.css"],
    "components/primitives/layout/box/engines/modern/index.tsx": ["responsive.css"],
    "components/primitives/layout/box/engines/rustic/index.tsx": ["responsive.css"],
    "components/primitives/layout/collapse/engines/modern/index.tsx": ["COLLAPSE_STYLES"],
    "components/primitives/layout/collapse/engines/rustic/index.tsx": ["RUSTIC_REDUCED_MOTION_STYLES"],
    "components/primitives/layout/flex/engines/classic/index.tsx": ["responsive.css"],
    "components/primitives/layout/flex/engines/modern/index.tsx": ["responsive.css"],
    "components/primitives/layout/flex/engines/rustic/index.tsx": ["responsive.css"],
    "components/primitives/layout/responsive/runtime/visibility/index.tsx": ["css"],
    "components/primitives/layout/stack/engines/classic/index.tsx": ["responsive.css"],
    "components/primitives/layout/stack/engines/modern/index.tsx": ["responsive.css"],
    "components/primitives/layout/stack/engines/rustic/index.tsx": ["responsive.css"],
    "components/primitives/navigation/tabs/engines/classic/index.tsx": ["responsive.css"],
    "components/primitives/navigation/tabs/engines/modern/index.tsx": ["responsive.css"],
    "components/primitives/navigation/tabs/engines/rustic/index.tsx": ["responsive.css"],
  };

  /** The productive files whose `<style>` carries its CSS as a child. */
  const CHILD_STYLE_SINKS: readonly string[] = [
    "components/patterns/visualization/charts/runtime/chart-engine/presentation/react/renderers/sparkline/index.tsx",
    "components/patterns/visualization/tree-view/engines/rustic/index.tsx",
    "components/primitives/layout/box/Box.stories.tsx",
    "graphics/motion/react/presentation/effects/aurora/index.tsx",
    "graphics/motion/react/presentation/effects/grid-pattern/index.tsx",
    "graphics/motion/react/presentation/effects/shimmer-text/index.tsx",
  ];

  it("every productive <style> text sink is declared with the identifier feeding it", () => {
    const census = new Map<string, Set<string>>();
    let occurrences = 0;
    for (const file of walkSources(SRC_ROOT)) {
      const source = readFileSync(file, "utf8");
      for (const match of source.matchAll(HTML_STYLE_SINK)) {
        occurrences += 1;
        const feeders = census.get(rel(file)) ?? new Set<string>();
        feeders.add(match[1].trim());
        census.set(rel(file), feeders);
      }
    }
    const declared: Record<string, string[]> = {};
    for (const [file, feeders] of census) declared[file] = [...feeders].sort();
    expect(declared).toEqual(HTML_STYLE_SINKS);
    expect(occurrences).toBe(57);
  });

  it("every productive <style> that carries its CSS as a child is declared", () => {
    const found = walkSources(SRC_ROOT)
      .filter((file) => CHILD_STYLE_SINK.test(readFileSync(file, "utf8")))
      .map(rel)
      .sort();
    expect(found).toEqual([...CHILD_STYLE_SINKS].sort());
  });

  it("MUTANT: a new sink file, and a new feeder in a declared file, are caught", () => {
    const planted = "<style dangerouslySetInnerHTML={{ __html: plantedCss }} />";
    expect([...planted.matchAll(HTML_STYLE_SINK)].map((match) => match[1].trim())).toEqual([
      "plantedCss",
    ]);
    expect(Object.values(HTML_STYLE_SINKS).flat()).not.toContain("plantedCss");
    expect(CHILD_STYLE_SINK.test("<style>{`body { display: none }`}</style>")).toBe(true);
    expect(CHILD_STYLE_SINKS).not.toContain("components/planted/index.tsx");
  });

  it("emission is the ONLY productive composer of a tenant artifact", () => {
    // One owner composes the WHOLE document -- banner, unlayered base rule,
    // mode rules, `auto` media copy. Two spellings of one format is a drift
    // that surfaces as a mounted artifact the resolver refuses for no reason.
    const ARTIFACT_BANNER = /TenantThemeArtifact v1 \| \$\{/;
    const PREFERS_DARK_COMPOSITION = /@media \(prefers-color-scheme: dark\) \{/;
    // RAW source: the banner IS a CSS comment, so a comment stripper deletes
    // the very marker this rule is about.
    const composers = productionSources("")
      .filter((file) => {
        const source = readFileSync(file, "utf8");
        return ARTIFACT_BANNER.test(source) && PREFERS_DARK_COMPOSITION.test(source);
      })
      .map(rel)
      .sort();
    expect(composers).toEqual([EMISSION_ASSEMBLY_OWNER]);
  });

  it("MUTANT: a second artifact composer is caught", () => {
    const ARTIFACT_BANNER = /TenantThemeArtifact v1 \| \$\{/;
    const PREFERS_DARK_COMPOSITION = /@media \(prefers-color-scheme: dark\) \{/;
    const planted =
      "const css = [`/* TenantThemeArtifact v1 | ${version} | ${digest} */`," +
      "`@media (prefers-color-scheme: dark) {`].join('');";
    expect(ARTIFACT_BANNER.test(planted)).toBe(true);
    expect(PREFERS_DARK_COMPOSITION.test(planted)).toBe(true);
    // and prose about the format is not a finding: BOTH markers are required,
    // and a sentence naming the banner interpolates nothing.
    const prose = "// the artifact banner is TenantThemeArtifact v1 | version | digest";
    expect(ARTIFACT_BANNER.test(prose)).toBe(false);
  });

  it("the retired kernel grammar owner is physically gone", () => {
    // The CSS text of a theme belongs to the owner the contract names for it,
    // and a forwarding file is how a second owner comes back one import later.
    expect(
      existsSync(
        join(SRC_ROOT, "infrastructure/compilers/kernel/foundation/css/rule-grammar")
      )
    ).toBe(false);
    expect(existsSync(join(SRC_ROOT, `${EMISSION_ASSEMBLY_OWNER}`))).toBe(true);
  });

  it("MUTANT: an alternate emitter anywhere in the tree is caught", () => {
    const DECLARATION_ASSEMBLY =
      /`\s+\$\{[A-Za-z_$][\w$]*\}:\s*\$\{[A-Za-z_$][\w$]*\};`/;
    expect(
      DECLARATION_ASSEMBLY.test("const line = `  ${key}: ${value};`;"),
    ).toBe(true);
    expect(
      DECLARATION_ASSEMBLY.test("const line = `  ${name}: ${v};`;"),
    ).toBe(true);
    // and a rule built from the emission owner is not a finding
    expect(
      DECLARATION_ASSEMBLY.test("emitRule(selector, emitDeclarations(vars))"),
    ).toBe(false);
  });

  it("MUTANT: CSS text outside emission is caught", () => {
    const planted = `const css = \`  color-scheme: dark;\`;\n`;
    expect(/color-scheme:/.test(planted)).toBe(true);
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

  it("the retired compiler owner is gone, with no forwarding file left behind", () => {
    expect(
      existsSync(join(SRC_ROOT, "infrastructure/compilers/kernel/runtime/brand-theme"))
    ).toBe(false);
    expect(existsSync(join(SRC_ROOT, "infrastructure/compilers/facade"))).toBe(false);
  });

  it("TenantStatusSeedAuthorship is imported from the contract owner, never re-exported", () => {
    // The consumer names the contract owner directly, which is what keeps the
    // re-export removable rather than load-bearing.
    expect(
      importersOf(
        "TenantStatusSeedAuthorship",
        join(SRC_ROOT, "foundation/contracts/composition/tenants/themes/resolved")
      )
    ).toContain("src/infrastructure/compilers/composition/tenant-theme/index.ts");
  });

  it("both relocated definitions now live in the contract owner", () => {
    const resolved = readFileSync(
      join(SRC_ROOT, "foundation/contracts/composition/tenants/themes/resolved/index.ts"),
      "utf8"
    );
    expect(resolved).toContain("export function tenantPostureFloors");
    expect(resolved).toContain("export function deriveTenantStatusSeedAuthorship");
    expect(resolved).toContain("export interface TenantStatusSeedAuthorship");
    // The compile envelope is `ThemeResolution`, not a widened BrandTheme input.
    expect(resolved).toContain("export interface ThemeResolution");
    expect(resolved).not.toContain("BrandCompilerProvenanceInput");
  });

  it("the retired compiler contracts are gone, and the canonical ones own the shapes", () => {
    // The shapes did not disappear with the retired owner: they belong to the
    // contracts that describe the pipeline that actually exists.
    const themes = readFileSync(
      join(SRC_ROOT, "foundation/contracts/composition/tenants/themes/index.ts"),
      "utf8"
    );
    for (const retired of [
      "export interface BrandCompilerInput",
      "export interface CompiledBrand",
      "export interface CompiledBrandModeBlock",
      "export type CompileBrandTheme",
    ]) {
      expect(themes).not.toContain(retired);
    }
    const compiled = readFileSync(
      join(SRC_ROOT, "foundation/contracts/composition/tenants/themes/compiled/index.ts"),
      "utf8"
    );
    expect(compiled).toContain("export interface ThemeCompilation");
    expect(compiled).toContain("export interface ThemeCompilationModeBlock");
    const adapter = readFileSync(
      join(SRC_ROOT, "foundation/contracts/composition/tenants/themes/engine-adapter/index.ts"),
      "utf8"
    );
    expect(adapter).toContain("export interface EngineThemeCompilation");
  });
});

/* -------------------------------------------------------------------------- */
/* the intent's origin decides authorship, and provenance is a snapshot        */
/* -------------------------------------------------------------------------- */

describe("origin decides authorship at the compiler", () => {
  const baseline = FIRST_PARTY_THEMES.bithire;
  const patchOf = () =>
    tenantPatchOf("bithire", DIVERGENCE_EDITORIAL_DOCUMENT, DIVERGENCE_EDITORIAL_IDENTITY);
  const withOrigin = (origin: ThemeIntentOrigin, patch: ThemeLayerPatch) =>
    compileTheme(
      resolveTheme({ vertical: "bithire", slug: "bithire", origin, patch }),
      modern
    );

  it("a static-vertical intent compiles as the baseline itself, with no tenant at all", () => {
    const viaIntent = withOrigin("static-vertical", {});
    const asPlainTheme = compileTheme(
      { theme: baseline, provenance: EMPTY_PROVENANCE },
      modern
    );

    expect(viaIntent.cssVariables).toEqual(asPlainTheme.cssVariables);
    expect(viaIntent.modeBlocks).toEqual(asPlainTheme.modeBlocks);
  });

  it("a static-vertical intent cannot carry a patch at all (WO-CAT-02)", () => {
    // The stronger law replaces the comparison that used to live here. There is
    // no static compile of a tenant patch to compare against a tenant compile:
    // the combination is refused, so a second authoring surface for vertical
    // identity is unrepresentable rather than merely discouraged.
    expect(() => withOrigin("static-vertical", patchOf())).toThrow(
      /static-vertical intent carries an empty patch/u
    );
  });

  it("the same patch is a tenant compile through either tenant origin, and never a baseline", () => {
    const patch = patchOf();
    const asTenant = withOrigin("tenant-document", patch);
    expect(asTenant.cssVariables).not.toEqual(withOrigin("static-vertical", {}).cssVariables);
    expect(mergeThemePatches(baseline, patch)).not.toEqual(baseline);
  });

  it("a preview compiles exactly as the persisted tenant document", () => {
    const patch = patchOf();
    const preview = withOrigin("preview", patch);
    const persisted = withOrigin("tenant-document", patch);
    expect(preview.cssVariables).toEqual(persisted.cssVariables);
    expect(preview.modeBlocks).toEqual(persisted.modeBlocks);
  });
});

describe("provenance is a snapshot the caller cannot reach back into", () => {
  const baseline = FIRST_PARTY_THEMES.bithire;

  it("mutating the patch afterwards moves no compiled channel", () => {
    const patch = tenantPatchOf(
      "bithire",
      DIVERGENCE_EDITORIAL_DOCUMENT,
      DIVERGENCE_EDITORIAL_IDENTITY
    );
    const { provenance } = resolveTheme({
      vertical: "bithire",
      slug: "bithire",
      origin: "tenant-document",
      patch,
    });
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
    const patch = tenantPatchOf(
      "bithire",
      DIVERGENCE_SOBER_DOCUMENT,
      DIVERGENCE_SOBER_IDENTITY
    );
    const { provenance } = resolveTheme({
      vertical: "bithire",
      slug: "bithire",
      origin: "tenant-document",
      patch,
    });
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
