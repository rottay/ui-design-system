/**
 * Adapter resolution and control admission are two jobs, and only one of them
 * needs the tenant capability registry.
 *
 * `useTokens` reaches `resolveAdapter(engine).tokenBaseline` on every client
 * mount. When the same module also owned `controlsActivatedBy` /
 * `assertEngineSupportsActivatedControls`, it evaluated
 * `TENANT_CAPABILITY_REGISTRY.map(...)` at module top level, so the whole ~53 KB
 * capability registry entered the `./runtime/provider` graph for a code path
 * that never calls admission. Splitting the owners is only real if the import
 * closure actually changed, so this measures the closure from source instead of
 * asserting the file list.
 *
 * The four facts below are separable: a re-merge fails (1), a re-import of the
 * registry into the resolution owner fails (2), a split that dropped
 * admission's own dependency — leaving it unable to do its job — fails (3),
 * and routing the token hook back through the barrel — which re-exports
 * admission, so ESM evaluates it whatever the importer binds — fails (4).
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { describe, expect, it } from "vitest";

import * as adapters from "..";

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC_ROOT = resolve(HERE, "../../../../../../..");

function moduleFor(specifier: string, importer: string): string | null {
  let base: string;
  if (specifier.startsWith("@/")) base = resolve(SRC_ROOT, specifier.slice(2));
  else if (specifier.startsWith(".")) base = resolve(dirname(importer), specifier);
  else return null;
  const candidates = [`${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`];
  return candidates.find((candidate) => existsSync(candidate)) ?? null;
}

/**
 * Every module reachable through a VALUE import or a value `export ... from`,
 * transitively: ESM evaluates a re-exported module whatever the importer binds.
 */
function valueClosure(entry: string): Set<string> {
  const seen = new Set<string>();
  const queue = [entry];
  while (queue.length) {
    const file = queue.shift()!;
    if (seen.has(file)) continue;
    seen.add(file);
    let text: string;
    try {
      text = readFileSync(file, "utf8");
    } catch {
      continue;
    }
    const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
    for (const statement of source.statements) {
      let specifier: ts.Expression | undefined;
      if (ts.isImportDeclaration(statement)) {
        if (statement.importClause?.isTypeOnly) continue;
        specifier = statement.moduleSpecifier;
      } else if (ts.isExportDeclaration(statement)) {
        if (statement.isTypeOnly || !statement.moduleSpecifier) continue;
        specifier = statement.moduleSpecifier;
      } else {
        continue;
      }
      if (!ts.isStringLiteral(specifier)) continue;
      const next = moduleFor(specifier.text, file);
      if (next) queue.push(next);
    }
  }
  return seen;
}

const OWNERS = resolve(HERE, "..");
const REGISTRY = resolve(OWNERS, "facade/registry/index.ts");
const ADMISSION = resolve(OWNERS, "facade/admission/index.ts");
const CAPABILITIES = resolve(
  SRC_ROOT,
  "foundation/contracts/composition/tenants/capabilities/index.ts",
);
const PROVIDER_TOKENS = resolve(
  SRC_ROOT,
  "infrastructure/runtime/theming/composition/react/tokens/index.ts",
);

describe("control admission is a sibling of the adapter registry, not part of it", () => {
  it("keeps both halves on the barrel, so no consumer needs a deeper import", () => {
    expect(typeof adapters.resolveAdapter).toBe("function");
    expect(typeof adapters.registerEngineAdapter).toBe("function");
    expect(typeof adapters.clearRegisteredEngineAdapters).toBe("function");
    expect(adapters.THEME_ENGINE_ADAPTERS).toBeDefined();
    expect(typeof adapters.controlsActivatedBy).toBe("function");
    expect(typeof adapters.assertEngineSupportsActivatedControls).toBe("function");
    expect(typeof adapters.EngineControlUnsupportedError).toBe("function");
  });

  it("resolves an adapter without pulling the tenant capability registry", () => {
    const closure = valueClosure(REGISTRY);
    expect(closure.has(REGISTRY)).toBe(true);
    expect(closure.has(CAPABILITIES)).toBe(false);
    expect(closure.has(ADMISSION)).toBe(false);
    expect(readFileSync(REGISTRY, "utf8")).not.toContain("TENANT_CAPABILITY_REGISTRY");
  });

  it("still lets admission read the registry it decides from", () => {
    const closure = valueClosure(ADMISSION);
    expect(closure.has(CAPABILITIES)).toBe(true);
    // Admission decides about an adapter; it must not own one.
    expect(closure.has(REGISTRY)).toBe(false);
  });

  it("keeps admission and the capability registry out of the provider token path", () => {
    // `useTokens` is the module the `./runtime/provider` subpath reaches on
    // every client mount, so the split is only real when measured from here.
    const closure = valueClosure(PROVIDER_TOKENS);
    expect(closure.has(REGISTRY)).toBe(true);
    expect(closure.has(ADMISSION)).toBe(false);
    expect(closure.has(CAPABILITIES)).toBe(false);
  });
});
