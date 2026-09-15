/**
 * @fileoverview Wave I0 — Inventory And Test Net
 *
 * Protects current outputs before any physical moves or contract changes.
 * 1. Public CSS export surface — driven from real package.json exports
 * 2. First-party artifact integrity — tenant CSS files with richness checks
 *
 * The per-vertical contract sections that graded the authored BrandTheme
 * sources left with that authority: a first-party vertical is the neutral
 * foundation plus its preset document, and its artifact is the compile.
 */

import { describe, it, expect } from "vitest";
import { createHash } from "crypto";
import { existsSync, readdirSync, readFileSync } from "fs";
import { resolve } from "path";



const DIST = resolve(process.cwd(), "dist");
const CSS_SRC = resolve(process.cwd(), "src/foundation/tokens/css");

/**
 * Resolve what a channel actually computes to in one mode.
 *
 * A compiled mode block carries ONLY the channels that mode changes, so
 * "is this declaration inside the dark block" stopped being a meaningful
 * question the moment BrandTheme.modes replaced the hand-written blocks — a
 * channel absent from the block is inherited from the base block, which is the
 * whole point. These assertions ask what renders instead of where it is
 * written, which is also what they were trying to prove all along.
 */
function modeEffective(artifact: string, mode: "light" | "dark") {
  const section = (marker: string): Record<string, string> => {
    const start = artifact.indexOf(marker);
    if (start < 0) return {};
    const open = artifact.indexOf("{", start);
    const close = artifact.indexOf("\n}", open);
    const out: Record<string, string> = {};
    for (const line of artifact.slice(open + 1, close).split("\n")) {
      const match = /^\s*(--[\w-]+):\s*(.+);\s*$/.exec(line);
      if (match) out[match[1]] = match[2];
    }
    return out;
  };
  const base = section("=== Compiled from the authored Theme via compileTheme");
  const overlay = section(`=== Compiled from Theme.modes.${mode}`);
  return (channel: string): string | undefined => overlay[channel] ?? base[channel];
}
const PKG_JSON = JSON.parse(
  readFileSync(resolve(process.cwd(), "package.json"), "utf-8")
);

describe("public CSS export surface (from package.json)", () => {
  // Parse every style subpath from the real package.json exports field
  const styleExports: Array<{
    subpath: string;
    style?: string;
    import_?: string;
    default_?: string;
  }> = [];
  for (const [subpath, value] of Object.entries(PKG_JSON.exports ?? {})) {
    if (!subpath.startsWith("./styles")) continue;
    if (typeof value === "string") {
      styleExports.push({ subpath, style: value, default_: value });
    } else if (value && typeof value === "object") {
      styleExports.push({
        subpath,
        style: (value as any).style,
        import_: (value as any).import,
        default_: (value as any).default,
      });
    }
  }

  it("package.json has exactly 7 style subpath exports", () => {
    expect(styleExports.length).toBe(7);
  });

  // Validate every condition key resolves to a real dist file
  it.each(styleExports)(
    "$subpath — all condition keys resolve to existing dist file",
    ({ subpath, style, import_, default_ }) => {
      const targets = new Set([style, import_, default_].filter(Boolean));
      expect(
        targets.size,
        `${subpath} should have at least one target`
      ).toBeGreaterThan(0);
      for (const target of targets) {
        const path = resolve(process.cwd(), target!.replace("./", ""));
        expect(existsSync(path), `${subpath} -> ${target} must exist`).toBe(
          true
        );
        const content = readFileSync(path, "utf-8");
        expect(content.length).toBeGreaterThan(1000);
      }
    }
  );

  it("./styles and ./styles.css both resolve to dist/styles.css", () => {
    const styles = styleExports.find((e) => e.subpath === "./styles");
    const stylesCss = styleExports.find((e) => e.subpath === "./styles.css");
    expect(styles?.style).toBe("./dist/styles.css");
    expect(stylesCss?.style).toBe("./dist/styles.css");
  });

  it("publishes no retired style alias or retired bundle name", () => {
    const retiredIdentity = ["plat", "form"].join("");
    const retiredStyleEntry = `./styles/${retiredIdentity}`;

    // The alias is gone rather than deprecated. `./styles/rottay` is the
    // vertical bundle; `./styles/default` is the neutral-baseline name for
    // consumers that do not want to spell a vertical at all. Both resolve to
    // dist/rottay.css, which is ONE file, not two names for two files.
    expect(
      styleExports.find((e) => e.subpath === retiredStyleEntry),
    ).toBeUndefined();

    for (const exp of styleExports) {
      expect(
        exp.style,
        `${exp.subpath} still points at the retired bundle name`,
      ).not.toContain(retiredIdentity);
    }

    const rottay = styleExports.find((e) => e.subpath === "./styles/rottay");
    const neutral = styleExports.find((e) => e.subpath === "./styles/default");
    expect(rottay?.style).toBe("./dist/rottay.css");
    expect(neutral?.style).toBe("./dist/rottay.css");
  });

  it("each style export has style + import + default condition keys", () => {
    for (const exp of styleExports) {
      expect(exp.style, `${exp.subpath} missing style key`).toBeTruthy();
      expect(exp.import_, `${exp.subpath} missing import key`).toBeTruthy();
      expect(exp.default_, `${exp.subpath} missing default key`).toBeTruthy();
    }
  });
});

// ══════════════════════════════════════════════════════════
// SECTION 2: First-Party Artifact Integrity
// ══════════════════════════════════════════════════════════

describe("first-party artifact integrity", () => {
  const TENANTS = ["rottay", "bithire", "evnto"] as const;

  it.each(TENANTS)("%s/index.css artifact exists", (tenant) => {
    expect(
      existsSync(resolve(CSS_SRC, `facade/artifacts/${tenant}/index.css`))
    ).toBe(true);
  });

  it("rottay artifact is richest (400+ unique --ds-* vars)", () => {
    const css = readFileSync(
      resolve(CSS_SRC, "facade/artifacts/rottay/index.css"),
      "utf-8"
    );
    expect(new Set(css.match(/--ds-[\w-]+/g)).size).toBeGreaterThan(400);
  });

  it("bithire artifact has substantial coverage (80+)", () => {
    const css = readFileSync(
      resolve(CSS_SRC, "facade/artifacts/bithire/index.css"),
      "utf-8"
    );
    expect(new Set(css.match(/--ds-[\w-]+/g)).size).toBeGreaterThan(80);
  });

  it("evnto artifact has substantial coverage (60+)", () => {
    const css = readFileSync(
      resolve(CSS_SRC, "facade/artifacts/evnto/index.css"),
      "utf-8"
    );
    expect(new Set(css.match(/--ds-[\w-]+/g)).size).toBeGreaterThan(60);
  });

  it.each(TENANTS)("%s artifact uses canonical button color vars", (tenant) => {
    const css = readFileSync(
      resolve(CSS_SRC, `facade/artifacts/${tenant}/index.css`),
      "utf-8"
    );
    expect(css).toContain("--ds-button-primary-color");
    expect(css).toContain("--ds-button-secondary-color");
    expect(css).not.toMatch(/--ds-button-[\w-]+-text\s*:/);
  });

  it("DB-owned tenants have no legacy CSS authority", () => {
    expect(
      existsSync(resolve(CSS_SRC, "facade/legacy/themanagementmiami/index.css"))
    ).toBe(false);
  });

  it("facade/entrypoints/ holds exactly one authored entrypoint", () => {
    // This assertion used to require four MORE entrypoints to exist. They were
    // a second authored copy of the same import graph that no build read, and
    // requiring them is what kept the divergence alive. Every `./styles/*`
    // package export is built from `base` plus one compiled tenant artifact.
    expect(existsSync(resolve(CSS_SRC, "facade/entrypoints/base/index.css"))).toBe(true);

    const authored = readdirSync(resolve(CSS_SRC, "facade/entrypoints"), {
      withFileTypes: true,
    })
      .filter((entry) => entry.isDirectory() && entry.name !== "tests")
      .map((entry) => entry.name);

    expect(authored).toEqual(["base"]);
  });

  it.each(TENANTS)("%s ships the compiled artifact the build mounts", (tenant) => {
    expect(
      existsSync(resolve(CSS_SRC, `facade/artifacts/${tenant}/index.css`)),
      `facade/artifacts/${tenant}/index.css must exist`
    ).toBe(true);
  });
});
