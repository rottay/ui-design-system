/** Pins the R5 chain repairs: the names they retired stay retired, and every canon role they
 *  now lean on is really declared. */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const CSS_ROOT = join(__dirname, "../css");
const DEFAULT_THEME = join(CSS_ROOT, "foundation/themes/default/index.css");

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (entry.name.endsWith(".css")) acc.push(full);
  }
  return acc;
}

const ALL_CSS = walk(CSS_ROOT);
/* Classic and Rustic are read-only this programme, so the repair scope is Modern plus shared. */
const IN_SCOPE = ALL_CSS.filter(
  (f) => f.includes("/engines/modern/") || f.includes("/components/"),
);
const stripComments = (css: string): string => css.replace(/\/\*[\s\S]*?\*\//g, "");

/** A read is only safe when the whole var() chain ends somewhere declared. */
function bareReads(css: string, name: string): number {
  return (stripComments(css).match(new RegExp(`var\\(\\s*${name}\\s*\\)`, "g")) ?? []).length;
}

describe("R5 chain repair -- retired names stay retired", () => {
  const RETIRED = [
    "--ds-color-bg-base",
    "--ds-color-border-hover",
    "--ds-color-border-disabled",
    "--ds-font-family-body",
  ];

  it.each(RETIRED)("%s is never the terminal fallback of a Modern or shared chain", (name) => {
    const offenders = IN_SCOPE.filter((f) => bareReads(readFileSync(f, "utf8"), name) > 0).map((f) =>
      f.slice(CSS_ROOT.length + 1),
    );
    expect(offenders).toEqual([]);
  });

  it("keeps the popover and tooltip inverse ink on a declared role", () => {
    const popover = readFileSync(join(CSS_ROOT, "runtime/engines/modern/skin/popover/index.css"), "utf8");
    const tooltip = readFileSync(join(CSS_ROOT, "runtime/engines/modern/skin/tooltip/index.css"), "utf8");
    expect(popover).toMatch(/--ds-popover-ink:\s*var\(\s*--ds-popover-inverse-foreground,\s*var\(--ds-color-text-inverse\)/);
    expect(tooltip).toMatch(/var\(--ds-color-text-inverse,\s*var\(--ds-tooltip-color\)\)/);
  });

  it("keeps the avatar-group ring on a tenant-causal role instead of dropping the border", () => {
    const avatar = readFileSync(
      join(CSS_ROOT, "presentation/components/skin/avatar-compounds/index.css"),
      "utf8",
    );
    expect(avatar).toMatch(/border: 2px solid var\(--ds-avatar-group-border, var\(--ds-color-bg\)\)/);
  });
});

describe("R5 chain repair -- every canon role leaned on is declared", () => {
  const REQUIRED = ["--ds-color-text-inverse", "--ds-color-bg", "--ds-color-border", "--ds-font-family-base"];
  const theme = readFileSync(DEFAULT_THEME, "utf8");

  it.each(REQUIRED)("%s is declared in the default theme, so every tenant resolves it", (name) => {
    expect(theme).toMatch(new RegExp(`(^|[\\s;{])${name}\\s*:`, "m"));
  });

  it("keeps --ds-color-bg tenant-causal across all three first-party artifacts", () => {
    const artifacts = ["bithire", "evnto", "rottay"];
    for (const tenant of artifacts) {
      const css = readFileSync(join(CSS_ROOT, `facade/artifacts/${tenant}/index.css`), "utf8");
      expect(css).toMatch(/(^|[\s;{])--ds-color-bg\s*:/m);
    }
  });
});
