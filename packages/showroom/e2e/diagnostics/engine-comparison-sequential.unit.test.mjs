// Node unit test (no browser) pinning the sequential EngineComparison: one
// selector group switching the shell engine, one live frame, zero local
// provider/config. AST-based (TypeScript 5.9), not regex.
//
// Run: node --test packages/showroom/e2e/diagnostics/engine-comparison-sequential.unit.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '../..');
const componentPath = join(root, 'src/components/playground/engine-comparison/index.tsx');

const EXPECTED_CALLSITE_COUNTS = Object.freeze({
  'src/app/(docs)/playground/page.tsx': 1,
  'src/app/(docs)/surfaces/[group]/[surface]/surface-engine-preview.tsx': 1,
  'src/app/(docs)/patterns/[group]/[pattern]/pattern-engine-preview.tsx': 1,
  'src/app/(docs)/structures/[group]/[structure]/page.tsx': 1,
  'src/app/(docs)/primitives/[category]/[component]/page.tsx': 1,
});

const FORBIDDEN_IDENTIFIERS = Object.freeze([
  'DesignSystemProvider',
  'getKnownTenantConfig',
  'getShowroomProductProfileKey',
  'getShowroomVerticalKey',
  'ShowroomTheme',
  'resolvedTenantSlug',
  'resolvedTheme',
  'tenantConfig',
  'productProfile',
  'vertical',
  'forceEngine',
]);

function parse(source, fileName = 'fixture.tsx') {
  return ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
}

function collect(rootNode, predicate) {
  const out = [];
  (function visit(node) {
    if (predicate(node)) out.push(node);
    ts.forEachChild(node, visit);
  })(rootNode);
  return out;
}

function isIdentifier(node, text) {
  return ts.isIdentifier(node) && node.text === text;
}

function jsxTags(sourceFile, name) {
  return collect(sourceFile, (n) => {
    const tag = ts.isJsxSelfClosingElement(n) ? n.tagName : ts.isJsxOpeningElement(n) ? n.tagName : null;
    return tag != null && isIdentifier(tag, name);
  });
}

function jsxAttributes(element) {
  const opening = ts.isJsxSelfClosingElement(element) ? element : element;
  return (opening.attributes?.properties ?? []).filter(ts.isJsxAttribute);
}

function attrNamed(element, name) {
  return jsxAttributes(element).find((a) => isIdentifier(a.name, name));
}

function isEngineEqualsOptionId(expr) {
  return (
    ts.isBinaryExpression(expr) &&
    expr.operatorToken.kind === ts.SyntaxKind.EqualsEqualsEqualsToken &&
    isIdentifier(expr.left, 'engine') &&
    ts.isPropertyAccessExpression(expr.right) &&
    isIdentifier(expr.right.expression, 'option') &&
    isIdentifier(expr.right.name, 'id')
  );
}

function isSetEngineOptionId(stmt) {
  return (
    ts.isCallExpression(stmt) &&
    isIdentifier(stmt.expression, 'setEngine') &&
    stmt.arguments.length === 1 &&
    ts.isPropertyAccessExpression(stmt.arguments[0]) &&
    isIdentifier(stmt.arguments[0].expression, 'option') &&
    isIdentifier(stmt.arguments[0].name, 'id')
  );
}

function assertSequentialComponent(sourceFile, { path }) {
  const errors = [];

  // Props: exactly children (required), title?, description?. No tenantSlug.
  const propsDecl = collect(
    sourceFile,
    (n) => ts.isInterfaceDeclaration(n) && isIdentifier(n.name, 'EngineComparisonProps'),
  );
  if (propsDecl.length !== 1) {
    errors.push(`expected exactly 1 EngineComparisonProps interface, got ${propsDecl.length}`);
  } else {
    const members = propsDecl[0].members.map((m) => ({
      name: m.name && ts.isIdentifier(m.name) ? m.name.text : null,
      optional: !!m.questionToken,
    }));
    const expected = [
      { name: 'children', optional: false },
      { name: 'title', optional: true },
      { name: 'description', optional: true },
    ];
    if (JSON.stringify(members) !== JSON.stringify(expected)) {
      errors.push(`EngineComparisonProps must be exactly {children, title?, description?}, got ${JSON.stringify(members)}`);
    }
  }

  // Hook: exactly one useShowroom call destructuring exactly { engine, setEngine }.
  const hookCalls = collect(
    sourceFile,
    (n) => ts.isCallExpression(n) && isIdentifier(n.expression, 'useShowroom'),
  );
  if (hookCalls.length !== 1) {
    errors.push(`expected exactly 1 useShowroom call, got ${hookCalls.length}`);
  } else {
    const decl = hookCalls[0].parent;
    const pattern =
      ts.isVariableDeclaration(decl) && decl.initializer === hookCalls[0] && ts.isObjectBindingPattern(decl.name)
        ? decl.name
        : null;
    const names = pattern
      ? pattern.elements.map((el) => ({
          name: ts.isIdentifier(el.name) ? el.name.text : null,
          renamed: !!el.propertyName,
          hasDefault: !!el.initializer,
          isRest: !!el.dotDotDotToken,
        }))
      : null;
    const ok =
      names &&
      names.length === 2 &&
      names.every((b) => !b.renamed && !b.hasDefault && !b.isRest) &&
      names[0].name === 'engine' &&
      names[1].name === 'setEngine';
    if (!ok) {
      errors.push(`useShowroom must destructure exactly const { engine, setEngine }, got ${JSON.stringify(names)}`);
    }
  }

  // Zero provider/config identifiers.
  for (const name of FORBIDDEN_IDENTIFIERS) {
    const hits = collect(sourceFile, (n) => isIdentifier(n, name));
    if (hits.length !== 0) errors.push(`forbidden identifier ${name} appears ${hits.length} time(s)`);
  }

  // ENGINES: exactly classic/modern/rustic, in order.
  const enginesDecl = collect(
    sourceFile,
    (n) => ts.isVariableDeclaration(n) && isIdentifier(n.name, 'ENGINES') && n.initializer && ts.isArrayLiteralExpression(n.initializer),
  );
  const ids =
    enginesDecl.length === 1
      ? enginesDecl[0].initializer.elements.map((el) => {
          if (!ts.isObjectLiteralExpression(el)) return null;
          const idProp = el.properties.find(
            (p) => ts.isPropertyAssignment(p) && isIdentifier(p.name, 'id'),
          );
          return idProp && ts.isStringLiteral(idProp.initializer) ? idProp.initializer.text : null;
        })
      : [];
  if (JSON.stringify(ids) !== JSON.stringify(['classic', 'modern', 'rustic'])) {
    errors.push(`ENGINES ids must be exactly [classic, modern, rustic] in order, got ${JSON.stringify(ids)}`);
  }

  // One role="group"; one map over ENGINES producing the single button control.
  const roleGroups = collect(
    sourceFile,
    (n) =>
      ts.isJsxAttribute(n) &&
      isIdentifier(n.name, 'role') &&
      n.initializer &&
      ts.isStringLiteral(n.initializer) &&
      n.initializer.text === 'group',
  );
  if (roleGroups.length !== 1) errors.push(`expected exactly 1 role="group", got ${roleGroups.length}`);

  const mapCalls = collect(
    sourceFile,
    (n) =>
      ts.isCallExpression(n) &&
      ts.isPropertyAccessExpression(n.expression) &&
      isIdentifier(n.expression.name, 'map'),
  );
  if (mapCalls.length !== 1 || !isIdentifier(mapCalls[0].expression.expression, 'ENGINES')) {
    errors.push('expected exactly 1 map call, over ENGINES');
  }

  // Button wiring: the single <button> inside the map callback.
  const buttons = collect(sourceFile, (n) => ts.isJsxSelfClosingElement(n) && isIdentifier(n.tagName, 'button'))
    .concat(
      collect(sourceFile, (n) => ts.isJsxOpeningElement(n) && isIdentifier(n.tagName, 'button')),
    );
  if (buttons.length !== 1) {
    errors.push(`expected exactly 1 button control template, got ${buttons.length}`);
  } else {
    const button = buttons[0];
    const inMap =
      mapCalls.length === 1 &&
      (function inside(node, stop) {
        let cur = node.parent;
        while (cur) {
          if (cur === stop) return true;
          cur = cur.parent;
        }
        return false;
      })(button, mapCalls[0]);
    if (!inMap) errors.push('the button control must be rendered by the ENGINES map');

    const typeAttr = attrNamed(button, 'type');
    if (!typeAttr || !ts.isStringLiteral(typeAttr.initializer) || typeAttr.initializer.text !== 'button') {
      errors.push('button must have type="button"');
    }
    const pressed = attrNamed(button, 'aria-pressed');
    if (
      !pressed ||
      !pressed.initializer ||
      !ts.isJsxExpression(pressed.initializer) ||
      !pressed.initializer.expression ||
      !isEngineEqualsOptionId(pressed.initializer.expression)
    ) {
      errors.push('aria-pressed must be exactly {engine === option.id}');
    }
    const onClick = attrNamed(button, 'onClick');
    const onClickExpr = onClick && onClick.initializer && ts.isJsxExpression(onClick.initializer)
      ? onClick.initializer.expression
      : null;
    if (
      !onClickExpr ||
      !ts.isArrowFunction(onClickExpr) ||
      !isSetEngineOptionId(onClickExpr.body)
    ) {
      errors.push('onClick must be exactly () => setEngine(option.id)');
    }
  }

  // children exactly once, as a JSX child expression, outside any callback/map.
  const childrenRefs = collect(sourceFile, (n) => {
    if (!isIdentifier(n, 'children')) return false;
    const parent = n.parent;
    if (ts.isPropertySignature(parent) || ts.isBindingElement(parent) || ts.isPropertyAccessExpression(parent)) return false;
    return ts.isJsxExpression(parent);
  });
  const liveChildren = childrenRefs.filter((n) => {
    let cur = n.parent;
    while (cur) {
      if (
        (ts.isArrowFunction(cur) || ts.isFunctionExpression(cur) || ts.isFunctionDeclaration(cur)) &&
        cur.parent &&
        ts.isCallExpression(cur.parent)
      ) {
        return false;
      }
      cur = cur.parent;
    }
    return true;
  });
  if (childrenRefs.length !== 1 || liveChildren.length !== 1) {
    errors.push('children must appear exactly once, live, outside any map/callback');
  }

  if (errors.length > 0) {
    throw new Error(`engine-comparison-sequential violations for ${path}:\n${errors.map((e) => `  - ${e}`).join('\n')}`);
  }
}

function assertCallsitesClean(tagsByPath) {
  const actual = Object.keys(tagsByPath).sort();
  const expected = Object.keys(EXPECTED_CALLSITE_COUNTS).sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`EngineComparison callsite roster mismatch: expected [${expected}], got [${actual}]`);
  }
  for (const [path, tags] of Object.entries(tagsByPath)) {
    if (tags.length !== EXPECTED_CALLSITE_COUNTS[path]) {
      throw new Error(`${path} must render EngineComparison exactly once, got ${tags.length}`);
    }
    for (const tag of tags) {
      if (attrNamed(tag, 'tenantSlug')) {
        throw new Error(`${path} passes tenantSlug to EngineComparison`);
      }
    }
  }
}

test('component source satisfies the sequential contract', () => {
  assertSequentialComponent(parse(readFileSync(componentPath, 'utf8'), componentPath), { path: componentPath });
});

test('callsite roster is exactly 5 files, count 1 each, zero tenantSlug', () => {
  const tagsByPath = {};
  (function walk(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.tsx')) {
        const sf = parse(readFileSync(full, 'utf8'), full);
        const tags = jsxTags(sf, 'EngineComparison');
        if (tags.length > 0) tagsByPath[relative(root, full)] = tags;
      }
    }
  })(join(root, 'src'));
  assertCallsitesClean(tagsByPath);
});

test('shell wiring: DocsRuntimeInner passes engine={engine} to DocsProviderShell', () => {
  const sf = parse(readFileSync(join(root, 'src/components/layout/docs/runtime/index.tsx'), 'utf8'), 'layout/docs/runtime/index.tsx');
  const tags = jsxTags(sf, 'DocsProviderShell');
  assert.equal(tags.length, 1, 'expected exactly 1 DocsProviderShell in the runtime shell');
  const attr = attrNamed(tags[0], 'engine');
  assert.ok(
    attr && attr.initializer && ts.isJsxExpression(attr.initializer) && isIdentifier(attr.initializer.expression, 'engine'),
    'DocsProviderShell must receive engine={engine}',
  );
});

test('shell wiring: DocsProviderShell passes forceEngine={engine} to the provider', () => {
  const sf = parse(readFileSync(join(root, 'src/components/layout/docs/provider/index.tsx'), 'utf8'), 'layout/docs/provider/index.tsx');
  const tags = jsxTags(sf, 'DesignSystemProvider');
  assert.equal(tags.length, 1, 'expected exactly 1 DesignSystemProvider in DocsProviderShell');
  const attr = attrNamed(tags[0], 'forceEngine');
  assert.ok(
    attr && attr.initializer && ts.isJsxExpression(attr.initializer) && isIdentifier(attr.initializer.expression, 'engine'),
    'DesignSystemProvider must receive forceEngine={engine}',
  );
});

// Negative fixtures: one causal fault each.

const CANONICAL = `
import { Badge, Box, Flex, Stack, Text } from '@rottay/design-system';
import { useShowroom, type ShowroomEngine } from '@/components/showroom-context';

export interface EngineComparisonProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

const ENGINES: Array<{ id: ShowroomEngine; label: string }> = [
  { id: 'classic', label: 'Classic' },
  { id: 'modern', label: 'Modern' },
  { id: 'rustic', label: 'Rustic' },
];

export function EngineComparison({ children, title, description }: EngineComparisonProps) {
  const { engine, setEngine } = useShowroom();
  return (
    <Box>
      <Flex role="group" aria-label="Engine selector">
        {ENGINES.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={engine === option.id}
            onClick={() => setEngine(option.id)}
          >
            {option.label}
          </button>
        ))}
      </Flex>
      <Box>{children}</Box>
    </Box>
  );
}
`;

test('canonical fixture is clean', () => {
  assertSequentialComponent(parse(CANONICAL, 'canonical.tsx'), { path: 'canonical.tsx' });
});

test('rejects children rendered inside the controls map', () => {
  const fixture = CANONICAL.replace(
    '{option.label}\n          </button>',
    '{option.label}{children}\n          </button>',
  ).replace('      <Box>{children}</Box>\n', '');
  assert.throws(
    () => assertSequentialComponent(parse(fixture, 'children-in-map.tsx'), { path: 'children-in-map.tsx' }),
    /children must appear exactly once, live, outside any map\/callback/,
  );
});

test('rejects a fourth engine id', () => {
  const fixture = CANONICAL.replace(
    "  { id: 'rustic', label: 'Rustic' },",
    "  { id: 'rustic', label: 'Rustic' },\n  { id: 'brutalist', label: 'Brutalist' },",
  );
  assert.throws(
    () => assertSequentialComponent(parse(fixture, 'fourth-id.tsx'), { path: 'fourth-id.tsx' }),
    /ENGINES ids must be exactly \[classic, modern, rustic\]/,
  );
});

test('rejects a missing engine id', () => {
  const fixture = CANONICAL.replace("  { id: 'rustic', label: 'Rustic' },\n", '');
  assert.throws(
    () => assertSequentialComponent(parse(fixture, 'missing-id.tsx'), { path: 'missing-id.tsx' }),
    /ENGINES ids must be exactly \[classic, modern, rustic\]/,
  );
});

test('rejects swapped engine ids', () => {
  const fixture = CANONICAL.replace(
    "  { id: 'classic', label: 'Classic' },\n  { id: 'modern', label: 'Modern' },",
    "  { id: 'modern', label: 'Modern' },\n  { id: 'classic', label: 'Classic' },",
  );
  assert.throws(
    () => assertSequentialComponent(parse(fixture, 'swapped-id.tsx'), { path: 'swapped-id.tsx' }),
    /ENGINES ids must be exactly \[classic, modern, rustic\]/,
  );
});

test('rejects an aliased DesignSystemProvider import (DSP as P)', () => {
  const fixture = CANONICAL.replace(
    "import { Badge, Box, Flex, Stack, Text } from '@rottay/design-system';",
    "import { Badge, Box, DesignSystemProvider as P, Flex, Stack, Text } from '@rottay/design-system';",
  ).replace('      <Box>{children}</Box>', '      <P>{children}</P>');
  assert.throws(
    () => assertSequentialComponent(parse(fixture, 'dsp-alias.tsx'), { path: 'dsp-alias.tsx' }),
    /forbidden identifier DesignSystemProvider/,
  );
});

test('rejects a tenantSlug prop on a callsite tag', () => {
  const tagOf = (jsx) =>
    collect(parse(`const x = ${jsx};`, 'callsite.tsx'), (n) =>
      ts.isJsxOpeningElement(n) && isIdentifier(n.tagName, 'EngineComparison'),
    )[0];
  const cleanTag = tagOf('<EngineComparison><R /></EngineComparison>');
  assert.throws(
    () =>
      assertCallsitesClean({
        'src/app/(docs)/playground/page.tsx': [tagOf('<EngineComparison tenantSlug={tenantSlug}><R /></EngineComparison>')],
        'src/app/(docs)/surfaces/[group]/[surface]/surface-engine-preview.tsx': [cleanTag],
        'src/app/(docs)/patterns/[group]/[pattern]/pattern-engine-preview.tsx': [cleanTag],
        'src/app/(docs)/structures/[group]/[structure]/page.tsx': [cleanTag],
        'src/app/(docs)/primitives/[category]/[component]/page.tsx': [cleanTag],
      }),
    /passes tenantSlug to EngineComparison/,
  );
});

test('rejects a missing onClick wiring', () => {
  const fixture = CANONICAL.replace('            onClick={() => setEngine(option.id)}\n', '');
  assert.throws(
    () => assertSequentialComponent(parse(fixture, 'no-onclick.tsx'), { path: 'no-onclick.tsx' }),
    /onClick must be exactly \(\) => setEngine\(option\.id\)/,
  );
});

test('rejects a hardcoded onClick engine', () => {
  const fixture = CANONICAL.replace('onClick={() => setEngine(option.id)}', "onClick={() => setEngine('modern')}");
  assert.throws(
    () => assertSequentialComponent(parse(fixture, 'hardcoded-onclick.tsx'), { path: 'hardcoded-onclick.tsx' }),
    /onClick must be exactly \(\) => setEngine\(option\.id\)/,
  );
});

test('rejects an inert selector (aria-pressed hardcoded)', () => {
  const fixture = CANONICAL.replace('aria-pressed={engine === option.id}', 'aria-pressed={false}');
  assert.throws(
    () => assertSequentialComponent(parse(fixture, 'inert-selector.tsx'), { path: 'inert-selector.tsx' }),
    /aria-pressed must be exactly \{engine === option\.id\}/,
  );
});
