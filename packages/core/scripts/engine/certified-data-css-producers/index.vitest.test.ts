import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import { generateResponsiveGridCSS } from '../../../src/ui/primitives/layout/Grid/runtime/responsive';
import { generateResponsiveCSS } from '../../../src/infrastructure/runtime/responsive/runtime/style-properties';
import {
  FIRST_PARTY_ARTIFACT_SPECS,
  renderFirstPartyArtifact,
} from '../../../src/infrastructure/compilers/runtime/tenant-css';
import { bithireBrandTheme } from '../../../src/foundation/tokens/ts/presentation/brand-themes';
import {
  compileTenantThemeConfig,
  hydrateTenantThemeConfig,
} from '../../../src/infrastructure/compilers/composition/tenant-theme';
import type {
  TenantThemeConfigIdentity,
  TenantThemeDocument,
} from '../../../src/foundation/contracts/composition/tenants/themes/tenant-theme';
import { isEmbeddedCssPaintProperty } from '../../lib/embedded-css-paint-counter.mjs';
import { collectSourceFiles } from '../runtime-svg-paint-census/index.mjs';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const componentsDir = resolve(packageRoot, 'src/ui');
const RESPONSIVE_PROPERTY_SITE_FLOOR = 81;

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
    // This is a non-vacuity floor, not a product-shape pin. New responsive
    // consumers may legitimately grow the map; the behavioral assertions
    // below prove every discovered property remains layout-only and is
    // faithfully emitted by the production generator.
    expect(propertyMap.length).toBeGreaterThanOrEqual(RESPONSIVE_PROPERTY_SITE_FLOOR);
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

  it('executes the first-party static compiler and proves its generated block is custom-property-only', () => {
    // FIRST-PARTY STATIC producer: compileBrandTheme -> renderFirstPartyArtifact.
    // `compiled.cssVariables` / `compiled.modeBlocks[].cssVariables` are the
    // GENERATED portion of the artifact -- the certified data channel. There is
    // no longer a hand-authored source merged in alongside it: the artifact has
    // exactly one author, so the generated portion and the artifact's own
    // declarations no longer need separating (see the module header above).
    const spec = FIRST_PARTY_ARTIFACT_SPECS.find((entry) => entry.slug === 'bithire');
    if (!spec) throw new Error('no first-party artifact spec for slug "bithire"');
    const { compiled } = renderFirstPartyArtifact({ spec, brandTheme: bithireBrandTheme });

    const generatedBlocks = [
      compiled.cssVariables,
      ...(compiled.modeBlocks ?? []).map((block) => block.cssVariables),
    ];
    expect(generatedBlocks.length).toBeGreaterThan(0);
    for (const variables of generatedBlocks) {
      const declared = Object.keys(variables);
      expect(declared.length).toBeGreaterThan(0);
      expect(declared.every((property) => property.startsWith('--'))).toBe(true);
      expect(declared.every((property) => !isEmbeddedCssPaintProperty(property))).toBe(true);
    }
  });

  it('executes the tenant/DB compiler and proves every artifact declaration is a custom property', () => {
    // TENANT/DB producer: TenantThemeDocument -> compileTenantThemeConfig.
    // `artifact.css` is rendered solely from `artifact.variables` (see
    // renderArtifactCss in composition/tenant-theme), so -- exactly like the
    // first-party artifact above -- the whole rendered block is generated
    // data with no hand-authored source merged in.
    const identity: TenantThemeConfigIdentity = {
      tenantId: 'embedded-css-contract',
      slug: 'embedded-css-contract',
      verticalKey: 'bithire',
      rowVersion: 1,
    };
    const document: TenantThemeDocument = {
      schemaVersion: 1,
      mode: 'simple',
      appearance: {
        palette: { primary: '#336699', secondary: '#336699', accent: '#336699' },
        typography: {
          fontFamilyBase: "Optima, Candara, 'Noto Sans', sans-serif",
          fontFamilyHeading: "'Fraunces', Georgia, 'Times New Roman', serif",
        },
        density: 'normal',
        motion: { intensity: 0.62, durationScale: 1.15, ambient: 'subtle' },
        shape: { buttonStyle: 'soft' },
        surfaces: { elevation: 'elevated' },
        navigation: { sidebarTone: 'subtle' },
      },
    };
    const artifact = compileTenantThemeConfig(hydrateTenantThemeConfig(document, identity));
    const emitted = declarationProperties(artifact.css);
    // A "simple" mode document compiles a much smaller variable set than the
    // retired generator's full tenant CSS (that produced 100+ declarations
    // from a TenantConfig covering every channel). 20 mirrors the floor an
    // equivalent simple-mode fixture already asserts elsewhere (see
    // "emits variables in deterministic UTF-16 code-unit order" in
    // composition/tenant-theme/tests/tenant-theme-artifact-stability.test.ts);
    // this is a non-vacuity floor, not a product-shape pin.
    expect(emitted.length).toBeGreaterThan(20);
    expect(emitted.every((property) => property.startsWith('--'))).toBe(true);
    expect(emitted.every((property) => !isEmbeddedCssPaintProperty(property))).toBe(true);
  });
});
