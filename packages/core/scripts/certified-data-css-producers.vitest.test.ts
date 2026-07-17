import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import { generateResponsiveGridCSS } from '../src/ui/primitives/layout/Grid/runtime/responsive';
import { generateResponsiveCSS } from '../src/infrastructure/runtime/responsive/runtime/style-properties';
import type { TenantConfig } from '../src/foundation/contracts';
import { generateTenantCss } from '../src/infrastructure/compilers/runtime/tenant-css/visual-config';
import { isEmbeddedCssPaintProperty } from './lib/embedded-css-paint-counter.mjs';
import { collectSourceFiles } from './runtime-svg-paint-census.mjs';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const componentsDir = resolve(packageRoot, 'src/ui');

function collectResponsivePropertyMap(): string[] {
  const properties: string[] = [];
  for (const file of collectSourceFiles(componentsDir, { productionOnly: true })) {
    const source = ts.createSourceFile(
      file,
      readFileSync(file, 'utf8'),
      ts.ScriptTarget.Latest,
      true,
      file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    );
    function visit(node: ts.Node): void {
      if (
        ts.isPropertyAssignment(node) &&
        ((ts.isIdentifier(node.name) && node.name.text === 'cssProperty') ||
          (ts.isStringLiteralLike(node.name) && node.name.text === 'cssProperty'))
      ) {
        expect(
          ts.isStringLiteralLike(node.initializer),
          `${file}: responsive cssProperty must stay statically auditable`,
        ).toBe(true);
        if (ts.isStringLiteralLike(node.initializer)) properties.push(node.initializer.text);
      }
      ts.forEachChild(node, visit);
    }
    visit(source);
  }
  return properties;
}

function declarationProperties(css: string): string[] {
  const properties: string[] = [];
  postcss.parse(css).walkDecls((declaration) => properties.push(declaration.prop));
  return properties;
}

describe('embedded CSS certified data producers', () => {
  it('executes the complete production responsive property map without paint declarations', () => {
    const propertyMap = collectResponsivePropertyMap();
    expect(propertyMap).toHaveLength(81);
    expect(propertyMap.every((property) => !isEmbeddedCssPaintProperty(property))).toBe(true);

    const uniqueProperties = [...new Set(propertyMap)].sort();
    const { css } = generateResponsiveCSS(
      'embedded-css-contract',
      uniqueProperties.map((cssProperty) => ({
        cssProperty,
        value: { xs: '1px', md: '2px' },
      })),
    );
    const emitted = declarationProperties(css);
    expect([...new Set(emitted)].sort()).toEqual(uniqueProperties);
    expect(emitted.every((property) => !isEmbeddedCssPaintProperty(property))).toBe(true);
  });

  it('executes the Grid generator and proves its output is layout-only', () => {
    const css = generateResponsiveGridCSS(
      'embedded-css-grid-contract',
      (value) => (value === undefined ? undefined : String(value)),
      { xs: 2, md: 3 },
      { xs: 'auto', lg: '1fr 1fr' },
    );
    const emitted = declarationProperties(css);
    expect([...new Set(emitted)].sort()).toEqual([
      'grid-template-columns',
      'grid-template-rows',
    ]);
    expect(emitted.every((property) => !isEmbeddedCssPaintProperty(property))).toBe(true);
  });

  it('executes the tenant generator and proves every output declaration is a custom property', () => {
    const tenant: TenantConfig = {
      slug: 'embedded-css-contract',
      name: 'Embedded CSS Contract',
      engine: 'modern',
      theme: 'base',
      locale: 'en',
      fallbackLocale: 'en',
      plan: 'enterprise',
      features: [],
      branding: {
        companyName: 'Embedded CSS Contract',
        primaryColor: '#336699',
      },
    };
    const emitted = declarationProperties(generateTenantCss(tenant));
    expect(emitted.length).toBeGreaterThan(100);
    expect(emitted.every((property) => property.startsWith('--'))).toBe(true);
    expect(emitted.every((property) => !isEmbeddedCssPaintProperty(property))).toBe(true);
  });
});
