/** Generalises the R5 chain repair from four named tokens to the whole defect class: inside Modern
 *  and shared skin, no var() chain may end on a --ds-* nobody declares. */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const CORE = join(__dirname, "../../..");
const CSS_ROOT = join(__dirname, "../css");

function walk(dir: string, exts: string[], acc: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "dist") continue;
      walk(full, exts, acc);
    } else if (exts.some((x) => entry.name.endsWith(x))) acc.push(full);
  }
  return acc;
}

/** Comments are blanked, not deleted, so a commented-out token can neither declare nor read. */
const blankComments = (src: string): string =>
  src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));

const CSS_FILES = walk(CSS_ROOT, [".css"]);
const TS_FILES = walk(CORE, [".ts", ".tsx"]);

/** A custom property is not a valid TS key, so components stamp it as a computed key carrying a
 *  type assertion (`['--ds-x' as any]:`); a pattern that stops at the quote reports it as dead. */
const DECL_IN_TS = /["'`](--ds-[a-z0-9-]+)["'`]\s*(?:as\s+\w+\s*)?\]?\s*\??\s*[:=]/g;

/** A property is declared by CSS *or* by a component stamping it at runtime. Missing the runtime
 *  half is what makes a naive scan report live channels as dead. */
function declaredNames(): Set<string> {
  const declared = new Set<string>();
  for (const file of CSS_FILES) {
    const css = blankComments(readFileSync(file, "utf8"));
    for (const d of css.matchAll(/(^|[\s;{])(--ds-[a-z0-9-]+)\s*:/g)) declared.add(d[2]);
  }
  for (const file of TS_FILES) {
    const src = blankComments(readFileSync(file, "utf8"));
    /* object-literal key, optional-property key, and bracket assignment onto a style object */
    for (const d of src.matchAll(DECL_IN_TS)) declared.add(d[1]);
    for (const d of src.matchAll(/setProperty\(\s*["'`](--ds-[a-z0-9-]+)["'`]/g)) declared.add(d[1]);
  }
  return declared;
}

/** Names a chain can actually terminate on: `var(--a)` with no comma has nothing to fall back to. */
function terminalReads(css: string): string[] {
  const out: string[] = [];
  for (const m of css.matchAll(/var\(\s*(--ds-[a-z0-9-]+)\s*(,)?/g)) if (!m[2]) out.push(m[1]);
  return out;
}

/* Classic and Rustic are read-only this programme; the repaired scope is Modern plus shared skin. */
const IN_SCOPE = CSS_FILES.filter(
  (f) => f.includes("/engines/modern/") || f.includes("/presentation/components/"),
);

describe("R5 canon -- no Modern or shared chain terminates on an undeclared --ds-*", () => {
  const declared = declaredNames();

  it("indexes a real corpus, so a pass cannot come from scanning nothing", () => {
    expect(IN_SCOPE.length).toBeGreaterThan(100);
    expect(declared.size).toBeGreaterThan(1000);
  });

  it("finds no terminal read of an undeclared property", () => {
    const offenders: string[] = [];
    for (const file of IN_SCOPE) {
      const css = blankComments(readFileSync(file, "utf8"));
      for (const name of new Set(terminalReads(css))) {
        if (!declared.has(name)) offenders.push(`${file.slice(CSS_ROOT.length + 1)} -> ${name}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("still sees terminal reads in scope, so the sweep is not matching an empty set", () => {
    const total = IN_SCOPE.reduce(
      (n, f) => n + terminalReads(blankComments(readFileSync(f, "utf8"))).length,
      0,
    );
    expect(total).toBeGreaterThan(0);
  });
});

/** Tenant artifacts are override layers scoped to `html[data-tenant=...]`, never replacements, so a
 *  token only they declare resolves for that tenant and for nobody else. */
function declaredOutsideTenantScope(): Set<string> {
  const general = new Set<string>();
  for (const file of CSS_FILES) {
    const isArtifact = file.includes("/facade/artifacts/");
    const css = blankComments(readFileSync(file, "utf8"));
    for (const rule of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      if (isArtifact || /\[data-tenant/.test(rule[1])) continue;
      for (const d of rule[2].matchAll(/(^|[\s;])(--ds-[a-z0-9-]+)\s*:/g)) general.add(d[2]);
    }
  }
  for (const file of TS_FILES) {
    const src = blankComments(readFileSync(file, "utf8"));
    for (const d of src.matchAll(DECL_IN_TS)) general.add(d[1]);
    for (const d of src.matchAll(/setProperty\(\s*["'`](--ds-[a-z0-9-]+)["'`]/g)) general.add(d[1]);
  }
  return general;
}

describe("R5 canon -- no Modern or shared chain terminates on a tenant-only property", () => {
  it("finds no terminal read that only one tenant artifact can satisfy", () => {
    const general = declaredOutsideTenantScope();
    const offenders: string[] = [];
    for (const file of IN_SCOPE) {
      const css = blankComments(readFileSync(file, "utf8"));
      for (const name of new Set(terminalReads(css))) {
        if (!general.has(name)) offenders.push(`${file.slice(CSS_ROOT.length + 1)} -> ${name}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
