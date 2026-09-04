/**
 * The canonical Theme leaf schema is EXACTLY what the contracts declare.
 *
 * `THEME_LEAF_KINDS` and `THEME_LEAF_OPTIONS` are the schema
 * `mergeThemePatches` refuses against, so a leaf missing from either silently
 * inherits the open default, and a leaf listed wrongly refuses a legal
 * document. Neither is visible in a diff, so both maps are re-derived here from
 * the TypeScript declarations of `Theme` and compared exactly. A new non-string
 * leaf, or a renamed option, turns this red on the commit that introduces it.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

import ts from "typescript";
import { describe, expect, it } from "vitest";

import {
  THEME_ANY_LEAF_PATTERNS,
  THEME_DEFAULT_LEAF_KINDS,
  THEME_LEAF_KINDS,
  THEME_LEAF_OPTIONS,
  normalizeThemeLeafPath,
  themeLeafKinds,
  themeLeafOptions,
} from "../schema";

const CONTRACTS_ROOT = resolve(__dirname, "../../../../..");
const ROOTS = ["composition/tenants", "kernel", "runtime"].map((relative) =>
  join(CONTRACTS_ROOT, relative)
);
const EXCLUDED_DIRS = new Set(["tests", "__tests__", "fixtures", "_fixtures"]);

function contractSources(): string[] {
  const files: string[] = [];
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        if (!EXCLUDED_DIRS.has(entry)) walk(full);
      } else if (entry.endsWith(".ts") && !entry.endsWith(".test.ts")) {
        files.push(full);
      }
    }
  };
  for (const root of ROOTS) walk(root);
  return files.sort();
}

type Declaration = {
  members: readonly ts.TypeElement[] | null;
  type: ts.TypeNode | null;
  heritage: readonly ts.ExpressionWithTypeArguments[];
};

/** `as const` string arrays, the form a closed vocabulary is authored in. */
const CONST_STRING_ARRAYS = new Map<string, readonly string[]>();

function asConstStringMembers(
  declaration: ts.VariableDeclaration
): readonly string[] | null {
  const initializer = declaration.initializer;
  if (!initializer || !ts.isAsExpression(initializer)) return null;
  const asType = initializer.type;
  if (
    !ts.isTypeReferenceNode(asType) ||
    !ts.isIdentifier(asType.typeName) ||
    asType.typeName.text !== "const"
  ) {
    return null;
  }
  if (!ts.isArrayLiteralExpression(initializer.expression)) return null;
  const members = initializer.expression.elements.map((element) =>
    ts.isStringLiteral(element) ? element.text : null
  );
  return members.every((member): member is string => member !== null) ? members : null;
}

const REGISTRY = ((): Map<string, Declaration> => {
  const registry = new Map<string, Declaration>();
  for (const file of contractSources()) {
    const source = ts.createSourceFile(
      file,
      readFileSync(file, "utf8"),
      ts.ScriptTarget.Latest,
      true
    );
    for (const statement of source.statements) {
      if (ts.isInterfaceDeclaration(statement)) {
        if (registry.has(statement.name.text)) continue;
        registry.set(statement.name.text, {
          members: statement.members,
          type: null,
          heritage: (statement.heritageClauses ?? []).flatMap((clause) => clause.types),
        });
      } else if (ts.isTypeAliasDeclaration(statement)) {
        if (registry.has(statement.name.text)) continue;
        registry.set(statement.name.text, {
          members: null,
          type: statement.type,
          heritage: [],
        });
      } else if (ts.isVariableStatement(statement)) {
        for (const declaration of statement.declarationList.declarations) {
          if (!ts.isIdentifier(declaration.name)) continue;
          if (CONST_STRING_ARRAYS.has(declaration.name.text)) continue;
          const members = asConstStringMembers(declaration);
          if (members) CONST_STRING_ARRAYS.set(declaration.name.text, members);
        }
      }
    }
  }
  return registry;
})();

const WRAPPERS = new Set(["Partial", "Readonly", "Required", "DeepPartial", "NonNullable"]);

type Resolved =
  | { k: "scalar"; kind: string; options?: readonly string[] }
  | { k: "array"; element: ts.TypeNode | undefined }
  | { k: "record"; value: ts.TypeNode | undefined }
  | { k: "governed"; value: ts.TypeNode | undefined }
  | { k: "object"; node?: ts.TypeNode; name?: string };

const scalar = (kind: string, options?: readonly string[]): Resolved => ({
  k: "scalar",
  kind,
  options,
});

function literalKind(literal: ts.LiteralTypeNode["literal"]): string {
  if (ts.isStringLiteral(literal)) return "string";
  if (ts.isNumericLiteral(literal)) return "number";
  if (
    literal.kind === ts.SyntaxKind.TrueKeyword ||
    literal.kind === ts.SyntaxKind.FalseKeyword
  ) {
    return "boolean";
  }
  return "unknown";
}

function resolveNode(node: ts.TypeNode | undefined, seen: ReadonlySet<string>): Resolved {
  if (!node) return scalar("unknown");
  if (ts.isParenthesizedTypeNode(node)) return resolveNode(node.type, seen);
  if (node.kind === ts.SyntaxKind.StringKeyword) return scalar("string");
  if (node.kind === ts.SyntaxKind.NumberKeyword) return scalar("number");
  if (node.kind === ts.SyntaxKind.BooleanKeyword) return scalar("boolean");
  if (node.kind === ts.SyntaxKind.UnknownKeyword || node.kind === ts.SyntaxKind.AnyKeyword) {
    return scalar("any");
  }
  if (ts.isLiteralTypeNode(node)) {
    const kind = literalKind(node.literal);
    return kind === "string" && ts.isStringLiteral(node.literal)
      ? scalar(kind, [node.literal.text])
      : scalar(kind);
  }
  if (ts.isTypeOperatorNode(node) && node.operator === ts.SyntaxKind.ReadonlyKeyword) {
    return resolveNode(node.type, seen);
  }
  if (ts.isArrayTypeNode(node)) return { k: "array", element: node.elementType };
  if (ts.isTypeLiteralNode(node)) return { k: "object", node };
  if (ts.isIntersectionTypeNode(node)) return { k: "object", node };
  if (ts.isUnionTypeNode(node)) {
    const parts = node.types.filter(
      (type) =>
        type.kind !== ts.SyntaxKind.UndefinedKeyword &&
        type.kind !== ts.SyntaxKind.NullKeyword
    );
    const kinds = parts.map((type) => resolveNode(type, seen));
    // A union of object branches is ONE shape whose leaves are the union of
    // every branch's leaves. Taking the first branch is how a discriminated
    // union (`{status:"active"} | {status:"disabled"; reason; note}`) reports a
    // one-value domain for its own discriminant and hides the other branches'
    // members entirely.
    if (parts.length > 0 && kinds.every((kind) => kind.k === "object")) {
      return { k: "object", node };
    }
    const container = kinds.find((kind) => kind.k === "object" || kind.k === "array");
    if (container) return container;
    const primitives = [
      ...new Set(kinds.map((kind) => (kind.k === "scalar" ? kind.kind : kind.k))),
    ].filter((kind) => kind !== "unknown");
    if (primitives.length === 0) return scalar("unknown");
    // A domain survives only when EVERY admitted member is a string literal.
    // One bare `string` member -- or a `number` beside the literals -- is the
    // contract saying the option set is open, and an open leaf must not be
    // refused against the literals that happen to be spelled beside it.
    const closed = kinds.every((kind) => kind.k === "scalar" && kind.options);
    const options = closed
      ? [
          ...new Set(
            kinds.flatMap((kind) => (kind.k === "scalar" ? [...(kind.options ?? [])] : []))
          ),
        ]
      : undefined;
    return scalar(primitives.sort().join("|"), options);
  }
  if (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName)) {
    const name = node.typeName.text;
    if (name === "ReadonlyArray" || name === "Array") {
      return { k: "array", element: node.typeArguments?.[0] };
    }
    if (WRAPPERS.has(name)) return resolveNode(node.typeArguments?.[0], seen);
    if (name === "Record") return { k: "record", value: node.typeArguments?.[1] };
    if (name === "Governed") return { k: "governed", value: node.typeArguments?.[0] };
    if (name === "Omit" || name === "Pick") return { k: "object", node };
    if (seen.has(name)) return scalar("unknown");
    const declaration = REGISTRY.get(name);
    if (declaration?.members) return { k: "object", name };
    if (declaration?.type) return resolveNode(declaration.type, new Set(seen).add(name));
  }
  if (ts.isIndexedAccessTypeNode(node)) {
    // `(typeof CLOSED_LIST)[number]`: a vocabulary authored as a runtime array
    // so the validator can see it, with the union derived from it rather than
    // restated. The domain is the array's own members.
    const objectType = ts.isParenthesizedTypeNode(node.objectType)
      ? node.objectType.type
      : node.objectType;
    if (
      ts.isTypeQueryNode(objectType) &&
      ts.isIdentifier(objectType.exprName) &&
      node.indexType.kind === ts.SyntaxKind.NumberKeyword
    ) {
      const members = CONST_STRING_ARRAYS.get(objectType.exprName.text);
      if (members) return scalar("string", members);
    }
    const owner =
      ts.isTypeReferenceNode(node.objectType) && ts.isIdentifier(node.objectType.typeName)
        ? node.objectType.typeName.text
        : null;
    const key =
      ts.isLiteralTypeNode(node.indexType) && ts.isStringLiteral(node.indexType.literal)
        ? node.indexType.literal.text
        : null;
    if (owner && key && !seen.has(`${owner}#${key}`)) {
      for (const member of membersOfName(owner, new Set())) {
        if (!ts.isPropertySignature(member) || !member.name) continue;
        const memberName = ts.isIdentifier(member.name) || ts.isStringLiteral(member.name)
          ? member.name.text
          : null;
        if (memberName === key) {
          return resolveNode(member.type, new Set(seen).add(`${owner}#${key}`));
        }
      }
    }
  }
  return scalar("unknown");
}

function membersOfName(name: string, seen: ReadonlySet<string>): ts.TypeElement[] {
  if (seen.has(name)) return [];
  const declaration = REGISTRY.get(name);
  if (!declaration) return [];
  const next = new Set(seen).add(name);
  const inherited = declaration.heritage.flatMap((clause) =>
    ts.isIdentifier(clause.expression) ? membersOfName(clause.expression.text, next) : []
  );
  if (declaration.members) return [...inherited, ...declaration.members];
  if (declaration.type) return membersOfNode(declaration.type, next);
  return inherited;
}

function literalNames(node: ts.TypeNode | undefined): Set<string> {
  const types = node ? (ts.isUnionTypeNode(node) ? node.types : [node]) : [];
  return new Set(
    types
      .map((type) =>
        ts.isLiteralTypeNode(type) && ts.isStringLiteral(type.literal)
          ? type.literal.text
          : null
      )
      .filter((name): name is string => name !== null)
  );
}

function membersOfNode(node: ts.TypeNode | undefined, seen: ReadonlySet<string>): ts.TypeElement[] {
  if (!node) return [];
  if (ts.isParenthesizedTypeNode(node)) return membersOfNode(node.type, seen);
  if (ts.isTypeLiteralNode(node)) return [...node.members];
  if (ts.isIntersectionTypeNode(node) || ts.isUnionTypeNode(node)) {
    return node.types.flatMap((type) => membersOfNode(type, seen));
  }
  if (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName)) {
    const name = node.typeName.text;
    if (WRAPPERS.has(name)) return membersOfNode(node.typeArguments?.[0], seen);
    const keyOf = (member: ts.TypeElement): string =>
      member.name && (ts.isIdentifier(member.name) || ts.isStringLiteral(member.name))
        ? member.name.text
        : "";
    if (name === "Omit") {
      const omitted = literalNames(node.typeArguments?.[1]);
      return membersOfNode(node.typeArguments?.[0], seen).filter(
        (member) => !omitted.has(keyOf(member))
      );
    }
    if (name === "Pick") {
      const kept = literalNames(node.typeArguments?.[1]);
      return membersOfNode(node.typeArguments?.[0], seen).filter((member) =>
        kept.has(keyOf(member))
      );
    }
    return membersOfName(name, seen);
  }
  return [];
}

/** What one derived leaf carries: its kind, plus its option domain when closed. */
type DerivedLeaf = { kind: string; options?: readonly string[] };

/** Every leaf of `Theme`, keyed the way the schema keys them. */
function deriveLeafKinds(): Map<string, DerivedLeaf> {
  const leaves = new Map<string, DerivedLeaf>();
  // One keypath can be reached through several branches of an object union.
  // The leaf it declares is their union: every kind either branch admits, and
  // an option domain only while EVERY branch that reaches the path closes it.
  const record = (prefix: string, leaf: DerivedLeaf): void => {
    const existing = leaves.get(prefix);
    if (!existing) {
      leaves.set(prefix, leaf);
      return;
    }
    const kind = [
      ...new Set([...existing.kind.split("|"), ...leaf.kind.split("|")]),
    ]
      .sort()
      .join("|");
    const options =
      existing.options && leaf.options
        ? [...new Set([...existing.options, ...leaf.options])]
        : undefined;
    leaves.set(prefix, { kind, options });
  };
  const visit = (
    node: ts.TypeNode | undefined,
    prefix: string,
    depth: number,
    seen: ReadonlySet<string>
  ): void => {
    if (depth > 12) return;
    const resolved = resolveNode(node, seen);
    if (resolved.k === "governed") {
      visit(resolved.value, prefix, depth + 1, seen);
      return;
    }
    if (resolved.k === "record") {
      visit(resolved.value, prefix ? `${prefix}.*` : "*", depth + 1, seen);
      return;
    }
    if (resolved.k === "array") {
      visit(resolved.element, `${prefix}[]`, depth + 1, seen);
      return;
    }
    if (resolved.k === "object") {
      const members = resolved.name
        ? membersOfName(resolved.name, seen)
        : membersOfNode(resolved.node ?? node, seen);
      const next = resolved.name ? new Set(seen).add(resolved.name) : seen;
      let any = false;
      for (const member of members) {
        if (ts.isIndexSignatureDeclaration(member)) {
          any = true;
          visit(member.type, prefix ? `${prefix}.*` : "*", depth + 1, next);
          continue;
        }
        if (!ts.isPropertySignature(member) || !member.name) continue;
        const key =
          ts.isIdentifier(member.name) || ts.isStringLiteral(member.name)
            ? member.name.text
            : null;
        if (!key) continue;
        any = true;
        visit(member.type, prefix ? `${prefix}.${key}` : key, depth + 1, next);
      }
      if (!any) record(prefix, { kind: "any" });
      return;
    }
    record(prefix, { kind: resolved.kind, options: resolved.options });
  };
  const themeReference = ts.factory.createTypeReferenceNode("Theme");
  visit(themeReference, "", 0, new Set());
  return leaves;
}

const DERIVED = deriveLeafKinds();

describe("the canonical Theme leaf schema", () => {
  it("the derivation is non-vacuous and total", () => {
    expect(DERIVED.size).toBeGreaterThan(4000);
    const kinds = [...DERIVED.values()].map((leaf) => leaf.kind);
    for (const kind of ["string", "number", "boolean", "number|string", "any"]) {
      expect(kinds.includes(kind), `no leaf resolves to ${kind}`).toBe(true);
    }
    expect(kinds.filter((kind) => kind === "unknown")).toEqual([]);
  });

  it("every non-string leaf is declared, and nothing else is", () => {
    // A mode overlay mirrors the root families, so the schema keys the root
    // spelling once and `normalizeThemeLeafPath` folds `modes.<mode>.` onto it.
    const derived = new Map<string, string>();
    for (const [path, leaf] of DERIVED) {
      if (leaf.kind === "string") continue;
      const key = normalizeThemeLeafPath(path);
      if (leaf.kind === "any") continue;
      derived.set(key, leaf.kind);
    }
    const declared = new Map(
      Object.entries(THEME_LEAF_KINDS).map(([path, kinds]) => [path, [...kinds].sort().join("|")])
    );
    expect(Object.fromEntries([...derived].sort())).toEqual(
      Object.fromEntries([...declared].sort())
    );
  });

  it("the opaque patterns are exactly the leaves declared `unknown`", () => {
    const opaque = [...DERIVED]
      .filter(([, leaf]) => leaf.kind === "any")
      .map(([path]) => normalizeThemeLeafPath(path))
      .sort();
    expect(opaque).toEqual([...THEME_ANY_LEAF_PATTERNS].sort());
  });

  it("every closed option domain is declared, exactly, and nothing else is", () => {
    const derived = new Map<string, string>();
    for (const [path, leaf] of DERIVED) {
      if (!leaf.options) continue;
      derived.set(normalizeThemeLeafPath(path), [...leaf.options].sort().join("|"));
    }
    const declared = new Map(
      Object.entries(THEME_LEAF_OPTIONS).map(([path, options]) => [
        path,
        [...options].sort().join("|"),
      ])
    );
    expect(Object.fromEntries([...derived].sort())).toEqual(
      Object.fromEntries([...declared].sort())
    );
  });

  it("declares a domain only where the contract closes one", () => {
    // The two failure directions the exact comparison above cannot name on its
    // own: an OPEN leaf must carry no domain, and the closed ones must not have
    // quietly collapsed to a handful.
    expect(themeLeafOptions("$.palette.primaryColor")).toBeNull();
    expect(themeLeafOptions("$.typography.fontFamilyBase")).toBeNull();
    expect(themeLeafOptions("$.chrome.sidebar.groupFontWeight")).toBeNull();
    expect(themeLeafOptions("$.engineBridge.value.modern.anything")).toBeNull();
    expect(Object.keys(THEME_LEAF_OPTIONS).length).toBeGreaterThan(25);
  });

  it("resolves a domain through the same normalizations the kinds use", () => {
    expect(themeLeafOptions("$.appearance.defaultMode")).toEqual(["dark", "light"]);
    expect(themeLeafOptions("$.surfaces.buttonStyle")).toEqual(["pill", "sharp", "soft"]);
    expect(themeLeafOptions("$.motion.value.entrance")).toEqual(
      themeLeafOptions("$.motion.entrance")
    );
    expect(themeLeafOptions("$.typography.roles.body.textTransform")).toEqual([
      "capitalize",
      "lowercase",
      "none",
      "uppercase",
    ]);
    // A wildcard domain reached through a real capability id.
    expect(themeLeafOptions("$.capabilities.motion.status")).toEqual([
      "active",
      "disabled",
      "unassigned",
    ]);
  });

  it("resolves a keypath through every normalization the merge produces", () => {
    expect(themeLeafKinds("$.palette.primaryColor")).toEqual(THEME_DEFAULT_LEAF_KINDS);
    expect(themeLeafKinds("$.chrome.card.hoverTint")).toEqual(["boolean"]);
    expect(themeLeafKinds("$.modes.dark.chrome.card.hoverTint")).toEqual(["boolean"]);
    expect(themeLeafKinds("$.motion.intensity")).toEqual(["number"]);
    expect(themeLeafKinds("$.motion.value.intensity")).toEqual(["number"]);
    expect(themeLeafKinds("$.chrome.sidebar.groupFontWeight")).toEqual(["number", "string"]);
    expect(themeLeafKinds("$.typography.roles.body.fontWeight")).toEqual(["number", "string"]);
    expect(themeLeafKinds("$.charts.value.categoryColors[0]")).toEqual(
      THEME_DEFAULT_LEAF_KINDS
    );
    expect(themeLeafKinds("$.engineBridge.value.modern.anything")).toBeNull();
  });
});
