// Node unit test (no browser) ensuring the deferred showcase does NOT mount a
// second DesignSystemProvider. The route shell in app/(docs) already provides
// the canonical tenant/engine/productProfile/vertical context; duplicating it
// here creates conflicting claims and duplicated effects.
//
// The recognizer uses TypeScript 5.9 AST, not regex, so it survives formatting
// changes and catches aliased/namespace reintroductions.
//
// Run: node --test packages/showroom/e2e/diagnostics/docs-live-showcase-provider.unit.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '../..');
const targetPath = join(
  root,
  'src/app/(docs)/primitives/live-component-showcase-deferred.tsx',
);
const pagePath = join(root, 'src/app/(docs)/primitives/page.tsx');

const CANONICAL = `'use client';

import dynamic from 'next/dynamic';
import { Box, Card, Stack, Text } from '@/components/showroom-ui';
import {
  SHOWROOM_SURFACES,
  mixWithCanvas,
} from '@/components/playground/surface-tokens';

const LiveComponentShowcase = dynamic(
  () =>
    import('@/components/live-component-showcase').then(
      (module) => module.LiveComponentShowcase,
    ),
  {
    ssr: false,
    loading: () => (
      <Card
        style={{
          padding: 18,
          border: \`1px solid \${SHOWROOM_SURFACES.border}\`,
          background: \`linear-gradient(180deg, \${SHOWROOM_SURFACES.subtle} 0%, \${SHOWROOM_SURFACES.surface} 100%)\`,
        }}
      >
        <Stack spacing="sm" fullWidth>
          <Text size="sm" weight="semibold">
            Preparing live DS runtime
          </Text>
          <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)' }}>
            The provider-backed component shelf loads after the route shell so the page stays responsive.
          </Text>
          <Box
            style={{
              width: '100%',
              height: 144,
              borderRadius: 18,
              background: \`linear-gradient(180deg, \${mixWithCanvas(
                'var(--ds-color-primary, #60a5fa)',
                6,
              )} 0%, \${SHOWROOM_SURFACES.surface} 100%)\`,
            }}
          />
        </Stack>
      </Card>
    ),
  },
);

export function LiveComponentShowcaseDeferred() {
  return <LiveComponentShowcase mode="compact" showIntro={false} />;
}
`;

const LOADING_COPY_MINIMAL = `const LiveComponentShowcase = dynamic(
  () => import('@/components/live-component-showcase').then((module) => module.LiveComponentShowcase),
  { ssr: false, loading: () => <div>loading</div> },
);
`;

function parse(source, fileName = 'fixture.tsx') {
  return ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
}

function collect(sourceFile, predicate) {
  const out = [];
  function visit(node) {
    if (predicate(node)) out.push(node);
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return out;
}

function isIdentifier(node, text) {
  return ts.isIdentifier(node) && node.text === text;
}

function importDeclarationsFrom(sourceFile, moduleName) {
  return collect(
    sourceFile,
    (n) =>
      ts.isImportDeclaration(n) &&
      n.moduleSpecifier &&
      ts.isStringLiteral(n.moduleSpecifier) &&
      n.moduleSpecifier.text === moduleName,
  );
}

function functionDeclarationsNamed(sourceFile, name) {
  return collect(
    sourceFile,
    (n) => ts.isFunctionDeclaration(n) && n.name && isIdentifier(n.name, name),
  );
}

function variableDeclarationsNamed(sourceFile, name) {
  return collect(
    sourceFile,
    (n) =>
      ts.isVariableDeclaration(n) &&
      n.name &&
      ts.isIdentifier(n.name) &&
      isIdentifier(n.name, name),
  );
}

function callExpressionsNamed(sourceFile, name) {
  return collect(
    sourceFile,
    (n) => ts.isCallExpression(n) && isIdentifier(n.expression, name),
  );
}

function identifierCount(sourceFile, name) {
  return collect(sourceFile, (n) => isIdentifier(n, name)).length;
}

function jsxTagCount(sourceFile, name) {
  return collect(sourceFile, (n) => {
    const tagName = ts.isJsxSelfClosingElement(n)
      ? n.tagName
      : ts.isJsxOpeningElement(n)
        ? n.tagName
        : null;
    return tagName && ts.isIdentifier(tagName) && isIdentifier(tagName, name);
  }).length;
}

function assertClean(sourceFile, { path }) {
  const errors = [];

  // Parse guard: exactly one exported FunctionDeclaration LiveComponentShowcaseDeferred.
  const funcs = functionDeclarationsNamed(
    sourceFile,
    'LiveComponentShowcaseDeferred',
  );
  if (funcs.length !== 1) {
    errors.push(
      `expected exactly 1 exported LiveComponentShowcaseDeferred function declaration, got ${funcs.length}`,
    );
  } else {
    const exported =
      funcs[0].modifiers?.some(
        (m) => m.kind === ts.SyntaxKind.ExportKeyword,
      ) ?? false;
    if (!exported) {
      errors.push('LiveComponentShowcaseDeferred must be exported');
    }
  }

  // Parse guard: exactly one VariableDeclaration LiveComponentShowcase initialized by dynamic().
  const dynamicVars = variableDeclarationsNamed(sourceFile, 'LiveComponentShowcase').filter(
    (v) =>
      v.initializer &&
      ts.isCallExpression(v.initializer) &&
      isIdentifier(v.initializer.expression, 'dynamic'),
  );
  if (dynamicVars.length !== 1) {
    errors.push(
      `expected exactly 1 LiveComponentShowcase variable initialized by dynamic(), got ${dynamicVars.length}`,
    );
  }

  // 0 imports from @rottay/design-system (catches named imports, aliases and namespaces).
  const dsImports = importDeclarationsFrom(sourceFile, '@rottay/design-system');
  if (dsImports.length !== 0) {
    errors.push(
      `expected 0 ImportDeclaration from @rottay/design-system, got ${dsImports.length}`,
    );
  }

  // 0 Identifier/PropertyAccess/JSX tag DesignSystemProvider anywhere in the file.
  if (identifierCount(sourceFile, 'DesignSystemProvider') !== 0) {
    errors.push('DesignSystemProvider identifier must not appear in the file');
  }

  // 0 imports from @/components/showroom-context (catches named aliases,
  // namespaces and any other binding shape that would let helpers leak back in).
  const scImports = importDeclarationsFrom(sourceFile, '@/components/showroom-context');
  if (scImports.length !== 0) {
    errors.push(
      `expected 0 ImportDeclaration from @/components/showroom-context, got ${scImports.length}`,
    );
  }

  // 0 calls to showroom-context derivation helpers (defense-in-depth on top of
  // the module-level import prohibition).
  const forbiddenCalls = [
    'useShowroom',
    'getKnownTenantConfig',
    'getShowroomProductProfileKey',
    'getShowroomVerticalKey',
  ];
  for (const name of forbiddenCalls) {
    const calls = callExpressionsNamed(sourceFile, name);
    if (calls.length !== 0) {
      errors.push(`expected 0 calls to ${name}, got ${calls.length}`);
    }
  }

  // Body: exactly one ReturnStatement whose expression is directly
  // <LiveComponentShowcase mode="compact" showIntro={false} />.
  if (funcs.length === 1 && funcs[0].body) {
    const returns = collect(funcs[0].body, (n) => ts.isReturnStatement(n));
    if (returns.length !== 1) {
      errors.push(
        `expected exactly 1 ReturnStatement in function body, got ${returns.length}`,
      );
    } else {
      const expr = returns[0].expression;
      if (!expr || !ts.isJsxSelfClosingElement(expr)) {
        errors.push(
          'ReturnStatement must directly contain a JSX self-closing element',
        );
      } else if (
        !ts.isIdentifier(expr.tagName) ||
        !isIdentifier(expr.tagName, 'LiveComponentShowcase')
      ) {
        errors.push(
          `ReturnStatement must directly return <LiveComponentShowcase />, got <${ts.isIdentifier(expr.tagName) ? expr.tagName.text : '...'}>`,
        );
      } else {
        const props = expr.attributes.properties;
        if (props.length !== 2) {
          errors.push(`expected exactly 2 JSX props, got ${props.length}`);
        }
        if (props.some((p) => ts.isJsxSpreadAttribute(p))) {
          errors.push('JSX props must not contain a spread attribute');
        }

        const modeAttr = props.find(
          (p) =>
            ts.isJsxAttribute(p) &&
            ts.isIdentifier(p.name) &&
            p.name.text === 'mode',
        );
        if (!modeAttr) {
          errors.push('missing mode prop');
        } else if (
          !ts.isStringLiteral(modeAttr.initializer) ||
          modeAttr.initializer.text !== 'compact'
        ) {
          errors.push('mode prop must be the string literal "compact"');
        }

        const showIntroAttr = props.find(
          (p) =>
            ts.isJsxAttribute(p) &&
            ts.isIdentifier(p.name) &&
            p.name.text === 'showIntro',
        );
        if (!showIntroAttr) {
          errors.push('missing showIntro prop');
        } else if (
          !ts.isJsxExpression(showIntroAttr.initializer) ||
          !showIntroAttr.initializer.expression ||
          showIntroAttr.initializer.expression.kind !== ts.SyntaxKind.FalseKeyword
        ) {
          errors.push('showIntro prop must be the JSX expression {false}');
        }
      }
    }
  }

  // LiveComponentShowcase JSX element must appear exactly once in the file.
  const showcaseCount = jsxTagCount(sourceFile, 'LiveComponentShowcase');
  if (showcaseCount !== 1) {
    errors.push(
      `expected exactly 1 <LiveComponentShowcase /> JSX element, got ${showcaseCount}`,
    );
  }

  if (errors.length > 0) {
    const bullet = errors.map((e) => `- ${e}`).join('\n');
    throw new Error(
      `LiveComponentShowcaseDeferred invariant violations for ${path}:\n${bullet}`,
    );
  }
}

test('canonical inline fixture is clean', () => {
  assertClean(parse(CANONICAL, 'canonical.tsx'), {
    path: 'canonical.tsx',
  });
});

test('actual source file is clean', () => {
  const source = readFileSync(targetPath, 'utf8');
  assertClean(parse(source, targetPath), { path: targetPath });
});

test('boundary canary: page.tsx renders exactly one LiveComponentShowcaseDeferred', () => {
  const source = readFileSync(pagePath, 'utf8');
  const sf = parse(source, pagePath);
  const count = jsxTagCount(sf, 'LiveComponentShowcaseDeferred');
  assert.equal(
    count,
    1,
    `expected exactly 1 <LiveComponentShowcaseDeferred /> in page.tsx, got ${count}`,
  );
});

// Negative fixtures: each reintroduces exactly one fault so the diagnostic
// message points at the causal invariant.

test('rejects aliased DesignSystemProvider import (DSP as P + <P>)', () => {
  const fixture = `
import dynamic from 'next/dynamic';
import { DesignSystemProvider as P } from '@rottay/design-system';
${LOADING_COPY_MINIMAL}
export function LiveComponentShowcaseDeferred() {
  return <P><LiveComponentShowcase mode="compact" showIntro={false} /></P>;
}
`;
  assert.throws(
    () => assertClean(parse(fixture, 'alias.tsx'), { path: 'alias.tsx' }),
    /expected 0 ImportDeclaration from @rottay\/design-system/,
  );
});

test('rejects namespace DesignSystemProvider import (DS + <DS.DesignSystemProvider>)', () => {
  const fixture = `
import dynamic from 'next/dynamic';
import * as DS from '@rottay/design-system';
${LOADING_COPY_MINIMAL}
export function LiveComponentShowcaseDeferred() {
  return <DS.DesignSystemProvider><LiveComponentShowcase mode="compact" showIntro={false} /></DS.DesignSystemProvider>;
}
`;
  assert.throws(
    () => assertClean(parse(fixture, 'namespace.tsx'), { path: 'namespace.tsx' }),
    /expected 0 ImportDeclaration from @rottay\/design-system/,
  );
});

test('rejects aliased showroom-context import (useShowroom as ctx + ctx())', () => {
  const fixture = `
import dynamic from 'next/dynamic';
import { useShowroom as ctx } from '@/components/showroom-context';
${LOADING_COPY_MINIMAL}
export function LiveComponentShowcaseDeferred() {
  ctx();
  return <LiveComponentShowcase mode="compact" showIntro={false} />;
}
`;
  assert.throws(
    () => assertClean(parse(fixture, 'sc-alias.tsx'), { path: 'sc-alias.tsx' }),
    /expected 0 ImportDeclaration from @\/components\/showroom-context/,
  );
});

test('rejects namespace showroom-context import (SC + SC.useShowroom())', () => {
  const fixture = `
import dynamic from 'next/dynamic';
import * as SC from '@/components/showroom-context';
${LOADING_COPY_MINIMAL}
export function LiveComponentShowcaseDeferred() {
  SC.useShowroom();
  return <LiveComponentShowcase mode="compact" showIntro={false} />;
}
`;
  assert.throws(
    () => assertClean(parse(fixture, 'sc-namespace.tsx'), { path: 'sc-namespace.tsx' }),
    /expected 0 ImportDeclaration from @\/components\/showroom-context/,
  );
});

test('rejects wrapper around the showcase', () => {
  const fixture = `
import dynamic from 'next/dynamic';
${LOADING_COPY_MINIMAL}
export function LiveComponentShowcaseDeferred() {
  return <div><LiveComponentShowcase mode="compact" showIntro={false} /></div>;
}
`;
  assert.throws(
    () => assertClean(parse(fixture, 'wrapper.tsx'), { path: 'wrapper.tsx' }),
    /ReturnStatement must directly contain a JSX self-closing element/,
  );
});

test('rejects missing showcase', () => {
  const fixture = `
import dynamic from 'next/dynamic';
${LOADING_COPY_MINIMAL}
export function LiveComponentShowcaseDeferred() {
  return null;
}
`;
  assert.throws(
    () => assertClean(parse(fixture, 'missing.tsx'), { path: 'missing.tsx' }),
    /ReturnStatement must directly contain a JSX self-closing element/,
  );
});

test('rejects duplicated showcase', () => {
  const fixture = `
import dynamic from 'next/dynamic';
${LOADING_COPY_MINIMAL}
export function LiveComponentShowcaseDeferred() {
  return <><LiveComponentShowcase mode="compact" showIntro={false} /><LiveComponentShowcase mode="compact" showIntro={false} /></>;
}
`;
  assert.throws(
    () => assertClean(parse(fixture, 'duplicate.tsx'), { path: 'duplicate.tsx' }),
    /expected exactly 1 <LiveComponentShowcase \/> JSX element/,
  );
});

test('rejects mode="full"', () => {
  const fixture = `
import dynamic from 'next/dynamic';
${LOADING_COPY_MINIMAL}
export function LiveComponentShowcaseDeferred() {
  return <LiveComponentShowcase mode="full" showIntro={false} />;
}
`;
  assert.throws(
    () => assertClean(parse(fixture, 'mode-full.tsx'), { path: 'mode-full.tsx' }),
    /mode prop must be the string literal "compact"/,
  );
});

test('rejects showIntro={true}', () => {
  const fixture = `
import dynamic from 'next/dynamic';
${LOADING_COPY_MINIMAL}
export function LiveComponentShowcaseDeferred() {
  return <LiveComponentShowcase mode="compact" showIntro={true} />;
}
`;
  assert.throws(
    () => assertClean(parse(fixture, 'showintro-true.tsx'), { path: 'showintro-true.tsx' }),
    /showIntro prop must be the JSX expression \{false\}/,
  );
});

test('rejects props spread', () => {
  const fixture = `
import dynamic from 'next/dynamic';
${LOADING_COPY_MINIMAL}
export function LiveComponentShowcaseDeferred() {
  const props = { mode: 'compact', showIntro: false };
  return <LiveComponentShowcase {...props} />;
}
`;
  assert.throws(
    () => assertClean(parse(fixture, 'spread.tsx'), { path: 'spread.tsx' }),
    /JSX props must not contain a spread attribute/,
  );
});
