/**
 * The kernel's source-level invariants, stated executably.
 *
 * "No product semantics" cannot be a grep for English words -- `move`,
 * `before`, `inside` and `text/plain` are protocol literals the kernel must
 * contain. It is three assertions over the module's own AST instead: what it
 * may import from the i18n authority, what it may never name, and the closed
 * vocabulary every string literal it carries has to belong to.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import ts from 'typescript';
import { describe, expect, it } from 'vitest';

import { SORTABLE_PROTOCOL_VOCABULARY } from '../index';

const KERNEL = resolve(import.meta.dirname, '../index.ts');
const text = readFileSync(KERNEL, 'utf8');
const source = ts.createSourceFile(KERNEL, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

const walk = (visit: (node: ts.Node) => void) => {
  const step = (node: ts.Node) => {
    visit(node);
    ts.forEachChild(node, step);
  };
  ts.forEachChild(source, step);
};

/** A literal that is a module specifier, a literal TYPE or a directive. */
function isExcludedByConstruction(node: ts.StringLiteralLike): boolean {
  const parent = node.parent;
  if (ts.isLiteralTypeNode(parent)) return true;
  if (ts.isImportDeclaration(parent) || ts.isExportDeclaration(parent)) return true;
  if (ts.isImportTypeNode(parent) || ts.isExternalModuleReference(parent)) return true;
  return ts.isExpressionStatement(parent) && ts.isSourceFile(parent.parent);
}

function expressionLiterals(): { value: string; line: number }[] {
  const out: { value: string; line: number }[] = [];
  walk((node) => {
    if (!ts.isStringLiteral(node) && !ts.isNoSubstitutionTemplateLiteral(node)) return;
    if (isExcludedByConstruction(node)) return;
    out.push({
      value: node.text,
      line: source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1,
    });
  });
  return out;
}

function importedBindings(moduleMatcher: RegExp): string[] {
  const out: string[] = [];
  walk((node) => {
    if (!ts.isImportDeclaration(node)) return;
    if (!ts.isStringLiteral(node.moduleSpecifier)) return;
    if (!moduleMatcher.test(node.moduleSpecifier.text)) return;
    const bindings = node.importClause?.namedBindings;
    if (node.importClause?.name) out.push(node.importClause.name.text);
    if (bindings && ts.isNamedImports(bindings)) {
      for (const element of bindings.elements) out.push(element.name.text);
    }
    if (bindings && ts.isNamespaceImport(bindings)) out.push(bindings.name.text);
  });
  return out;
}

function namesUsed(): Set<string> {
  const names = new Set<string>();
  walk((node) => {
    if (ts.isIdentifier(node)) names.add(node.text);
    if (ts.isPropertyAccessExpression(node)) names.add(node.name.text);
    if (ts.isPropertyAssignment(node) || ts.isPropertySignature(node)) {
      const name = node.name;
      if (ts.isIdentifier(name) || ts.isStringLiteral(name)) names.add(name.text);
    }
  });
  return names;
}

describe('sortable kernel invariants: one authority per law', () => {
  it('the kernel imports no i18n binding but the direction authority', () => {
    expect(importedBindings(/i18n/u)).toEqual(['useReadingDirectionIsRtl']);
  });

  it('the kernel formats no string', () => {
    const forbidden = ['t', 'tOr', 'translateOr', 'interpolateTranslation', 'useTranslation'];
    const used = namesUsed();

    expect(forbidden.filter((name) => used.has(name))).toEqual([]);
  });

  it('the reading direction is not a second option on the same question', () => {
    const used = namesUsed();

    expect(used.has('rtl')).toBe(true);
    expect(text.includes('readonly rtl')).toBe(false);
  });
});

describe('sortable kernel invariants: no visual values, no stamps, no product semantics', () => {
  it('the kernel names no role, label, class, style or attribute write', () => {
    const used = namesUsed();
    const forbidden = ['className', 'setAttribute', 'style', 'role', 'cssText'];

    expect(forbidden.filter((name) => used.has(name))).toEqual([]);
    expect([...used].filter((name) => name.startsWith('aria-'))).toEqual([]);
    expect([...used].filter((name) => name.startsWith('data-'))).toEqual([]);
  });

  it('the kernel contains no literal outside SORTABLE_PROTOCOL_VOCABULARY', () => {
    const vocabulary = new Set<string>(SORTABLE_PROTOCOL_VOCABULARY);
    const foreign = expressionLiterals().filter((literal) => !vocabulary.has(literal.value));

    expect(foreign).toEqual([]);
  });

  it('the vocabulary is frozen, so widening it is an edit and not an accident', () => {
    expect(Object.isFrozen(SORTABLE_PROTOCOL_VOCABULARY)).toBe(true);
    expect(SORTABLE_PROTOCOL_VOCABULARY).toContain('text/plain');
    expect(SORTABLE_PROTOCOL_VOCABULARY).toContain('move');
  });

  it('the literal scan sees expression literals and ignores types and specifiers', () => {
    // The control for the assertion above: a scan that saw nothing, or that
    // counted literal TYPES, would be green on an added product string.
    const literals = expressionLiterals().map((literal) => literal.value);

    expect(literals).toContain('text/plain');
    expect(literals).toContain('no-destination');
    expect(literals).not.toContain('react');
    expect(literals).not.toContain('use client');
  });
});
