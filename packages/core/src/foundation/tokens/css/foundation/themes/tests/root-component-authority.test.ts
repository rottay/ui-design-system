/**
 * Root custom-property authority contract.
 *
 * `foundation/themes/default.css` owns foundation channels and tenant-neutral
 * fallbacks. A component family owns its root defaults in exactly one
 * `presentation/components/<family>.css` file. Re-authoring the same public
 * channel in both layers makes cascade order, rather than the contract, the
 * authority.
 *
 * This test intentionally parses source, not generated bundles. It also carries
 * adversarial drills: each detector must prove that a planted violation turns
 * the property red before a green result is meaningful.
 */
import { readFileSync, readdirSync } from "node:fs";
import { basename, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const CSS_ROOT = resolve(process.cwd(), "src/foundation/tokens/css");
const DEFAULT_PATH = resolve(CSS_ROOT, "foundation/themes/default.css");
const COMPONENTS_DIR = resolve(CSS_ROOT, "presentation/components");
const LEDGER_PATH = resolve(
  CSS_ROOT,
  "foundation/themes/tests/root-component-authority-ledger.json",
);
const ENTRYPOINTS = [
  resolve(CSS_ROOT, "facade/entrypoints/base.css"),
  resolve(CSS_ROOT, "facade/entrypoints/styles.css"),
] as const;

const FOUNDATION_CHANNEL = /^--ds-(?:color|spacing|radius|shadow|font|motion|z-index)-/;

interface OwnerRows {
  same: string[];
  different: string[];
}

interface AuthorityLedger {
  measurement: {
    sourceBeforeThisDrain: {
      shared: number;
      different: number;
      same: number;
    };
    sourceAfterThisDrain: {
      shared: number;
      different: number;
      same: number;
    };
  };
  owners: Record<string, OwnerRows>;
}

const read = (path: string): string => readFileSync(path, "utf8");
const withoutComments = (css: string): string =>
  css.replace(/\/\*[\s\S]*?\*\//g, "");

/**
 * Extract only selectors that are exactly `:root`. Attribute-qualified theme
 * scopes and nested component selectors are deliberately outside this law.
 */
function exactRootBodies(css: string): string[] {
  const source = withoutComments(css);
  const bodies: string[] = [];
  const selector = /(^|})\s*:root\s*\{/g;

  for (const match of source.matchAll(selector)) {
    const open = match.index! + match[0].lastIndexOf("{");
    let depth = 1;
    let cursor = open + 1;
    while (cursor < source.length && depth > 0) {
      if (source[cursor] === "{") depth += 1;
      if (source[cursor] === "}") depth -= 1;
      cursor += 1;
    }
    if (depth !== 0) throw new Error("Unbalanced :root block");
    bodies.push(source.slice(open + 1, cursor - 1));
  }

  return bodies;
}

function rootChannels(css: string): Set<string> {
  const channels = new Set<string>();
  for (const body of exactRootBodies(css)) {
    for (const match of body.matchAll(/(--[a-z0-9-_]+)\s*:/gi)) {
      channels.add(match[1]);
    }
  }
  return channels;
}

function componentSources(
  override: Readonly<Record<string, string>> = {},
): Map<string, string> {
  const sources = new Map<string, string>();
  for (const filename of readdirSync(COMPONENTS_DIR).sort()) {
    if (!filename.endsWith(".css") || filename === "index.css") continue;
    sources.set(
      filename,
      override[filename] ?? read(resolve(COMPONENTS_DIR, filename)),
    );
  }
  return sources;
}

function componentOwners(
  sources: ReadonlyMap<string, string> = componentSources(),
): Map<string, string[]> {
  const owners = new Map<string, string[]>();
  for (const [filename, css] of sources) {
    for (const channel of rootChannels(css)) {
      owners.set(channel, [...(owners.get(channel) ?? []), filename]);
    }
  }
  return owners;
}

function overlaps(
  defaultCss: string,
  sources: ReadonlyMap<string, string> = componentSources(),
): string[] {
  const foundation = rootChannels(defaultCss);
  return [...componentOwners(sources).keys()]
    .filter((channel) => foundation.has(channel))
    .sort();
}

function componentFoundationChannels(
  sources: ReadonlyMap<string, string> = componentSources(),
): string[] {
  return [...componentOwners(sources).keys()]
    .filter((channel) => FOUNDATION_CHANNEL.test(channel))
    .sort();
}

const ledger = JSON.parse(read(LEDGER_PATH)) as AuthorityLedger;
const defaultCss = read(DEFAULT_PATH);
const ownerRows = Object.entries(ledger.owners).flatMap(
  ([filename, rows]) =>
    [...rows.same, ...rows.different].map((channel) => ({
      channel,
      filename,
    })),
);

describe("root component-token authority", () => {
  it("has exactly one root author across foundation and component families", () => {
    expect(overlaps(defaultCss)).toEqual([]);
    expect(ledger.measurement.sourceAfterThisDrain).toEqual({
      shared: 0,
      different: 0,
      same: 0,
    });
  });

  it("keeps every drained channel in its declared component owner", () => {
    expect(ownerRows).toHaveLength(
      ledger.measurement.sourceBeforeThisDrain.shared,
    );
    expect(new Set(ownerRows.map(({ channel }) => channel)).size).toBe(
      ownerRows.length,
    );

    const liveOwners = componentOwners();
    for (const { channel, filename } of ownerRows) {
      expect(liveOwners.get(channel), channel).toEqual([filename]);
    }
  });

  it("ships every declared owner after the default foundation in both facades", () => {
    for (const entrypoint of ENTRYPOINTS) {
      const source = read(entrypoint);
      const defaultIndex = source.indexOf(
        '@import "../../foundation/themes/default.css"',
      );
      expect(defaultIndex, basename(entrypoint)).toBeGreaterThan(-1);

      for (const filename of Object.keys(ledger.owners)) {
        const ownerIndex = source.indexOf(
          `@import "../../presentation/components/${filename}"`,
        );
        expect(ownerIndex, `${basename(entrypoint)} -> ${filename}`).toBeGreaterThan(
          defaultIndex,
        );
      }
    }
  });

  it("keeps foundation-prefixed channels out of component-family roots", () => {
    expect(componentFoundationChannels()).toEqual([]);
  });
});

describe("root authority negative drills", () => {
  it("turns red when foundation reintroduces a component channel", () => {
    const planted = defaultCss.replace(
      ":root {",
      `:root {\n  ${ownerRows[0].channel}: hotpink;`,
    );
    expect(overlaps(planted)).toContain(ownerRows[0].channel);
  });

  it("turns red when a component family authors a foundation channel", () => {
    const rootOwner = [...componentSources()].find(([, css]) =>
      css.includes(":root {"),
    );
    expect(rootOwner, "negative drill requires a component :root owner").toBeDefined();
    const [filename, css] = rootOwner!;
    const planted = css.replace(
      ":root {",
      ":root {\n  --ds-color-authority-negative-drill: hotpink;",
    );
    expect(planted).not.toBe(css);
    expect(
      componentFoundationChannels(
        componentSources({ [filename]: planted }),
      ),
    ).toContain("--ds-color-authority-negative-drill");
  });
});
