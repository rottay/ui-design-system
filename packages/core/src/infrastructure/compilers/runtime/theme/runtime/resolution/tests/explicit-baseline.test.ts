import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import ts from "typescript";
import { describe, expect, it } from "vitest";

import { staticThemeIntent } from "../../ingress";
import { NEUTRAL_THEME } from "@/foundation/presets/neutral-theme";

import { baselineFor, resolveTheme } from "..";

const RESOLUTION_OWNER = resolve(dirname(fileURLToPath(import.meta.url)), "../index.ts");

describe("resolveTheme over a baseline the caller supplies", () => {
  it("validates the intent before the baseline: an unknown vertical throws the intent's error", () => {
    // The retired shape returned before the intent was checked whenever a
    // baseline was supplied. A valid neutral baseline beside an invalid intent
    // must therefore fail on the INTENT, never resolve and never fail on the
    // baseline.
    const supplied = { ...NEUTRAL_THEME, id: "acme" };
    const intent = { ...staticThemeIntent("rottay", "acme"), vertical: "platform" as never };
    expect(() => resolveTheme(intent, { baseline: supplied })).toThrow(
      /unknown intent vertical "platform"/u
    );
  });

  it("asserts the intent as its first statement, before any baseline is read", () => {
    // An early return ahead of `assertThemeIntent` is the exact historical
    // regression, so the order is pinned on the resolver's own AST.
    const source = readFileSync(RESOLUTION_OWNER, "utf8");
    const parsed = ts.createSourceFile("index.ts", source, ts.ScriptTarget.Latest, true);
    const resolver = parsed.statements.find(
      (statement): statement is ts.FunctionDeclaration =>
        ts.isFunctionDeclaration(statement) && statement.name?.text === "resolveTheme"
    );
    const first = resolver?.body?.statements[0];
    const callee =
      first && ts.isExpressionStatement(first) && ts.isCallExpression(first.expression) &&
      ts.isIdentifier(first.expression.expression)
        ? first.expression.expression.text
        : undefined;
    expect(callee).toBe("assertThemeIntent");
  });

  it("labels the supplied baseline with the intent's slug and never shares its graph", () => {
    const supplied = { ...NEUTRAL_THEME, id: "neutral" };
    const resolution = resolveTheme(staticThemeIntent("rottay", "acme"), { baseline: supplied });
    expect(resolution.theme.id).toBe("acme");
    expect(resolution.theme.palette).not.toBe(supplied.palette);
    expect(resolution.theme.palette).toEqual(supplied.palette);
  });

  it("keeps the authored baseline when none is supplied", () => {
    const resolution = resolveTheme(staticThemeIntent("bithire", "acme"));
    expect(resolution.theme).toEqual(baselineFor("bithire", "acme"));
  });

  it("refuses a supplied baseline that is not a Theme", () => {
    expect(() =>
      resolveTheme(staticThemeIntent("rottay", "acme"), { baseline: { id: "x" } as never })
    ).toThrow(/baseline declares no visual family/u);
  });
});
