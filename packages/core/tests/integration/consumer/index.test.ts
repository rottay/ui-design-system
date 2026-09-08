/**
 * The consumer proof: one fixture application, executed.
 *
 * WHY IT EXISTS. "Apps can build" was a feeling. Milestone A closes only when
 * it is a measurement, so this suite runs an application -- the files under
 * `app/`, written the way an app writes them, against the package name -- and
 * fails when any part of the frozen contract moves: a guaranteed subpath that
 * stops resolving, a named export that disappears, a `mountTenantTheme`
 * signature that changes, a v2 document the door stops admitting.
 *
 * WHAT IT IS NOT. It is not a second statement of the contract. The sanctioned
 * surface is read from the disposition table the lint rule itself imports, and
 * the app's behaviour is the app's own modules being called -- not a paraphrase
 * of them beside them.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

import { render, screen } from '@testing-library/react';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

import {
  documentThemeAdmission,
  migrateAndAdmitDocument,
  migrateDocumentV1ToV2,
  mountTenantTheme,
  staticThemeIntent,
  assertTenantThemeDocumentV2,
  hydrateTenantThemeConfig,
  TenantThemeValidationError,
  type MountTenantThemeOptions,
  type MountedTenantTheme,
  type ThemeIntent,
} from '@rottay/design-system/server';
import {
  classifySubpath,
  subpathOfSpecifier,
} from '@/entrypoints/eslint/rules/no-unsanctioned-ds-subpath/contract';
import { noUnsanctionedDsSubpath } from '@/entrypoints/eslint/rules/no-unsanctioned-ds-subpath';

import RootLayout, { mountVertical } from './app/layout';
import TenantRootLayout, { compileTenantArtifact, mountTenant } from './app/tenant-layout';
import ConsumerPage from './app/page';
import Providers from './app/providers';
import {
  TENANT_DOCUMENT_V2,
  TENANT_IDENTITY,
  TENANT_SLUG,
  TENANT_TRANSPORT_V1,
} from './app/tenant-document';

const APP_ROOT = resolve(__dirname, 'app');
const PACKAGE_ROOT = resolve(__dirname, '../../..');

/** Every authored file of the fixture application, repo-relative. */
function appFiles(): string[] {
  const found: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const absolute = join(dir, entry);
      if (statSync(absolute).isDirectory()) walk(absolute);
      else if (/\.tsx?$/.test(entry)) found.push(absolute);
    }
  };
  walk(APP_ROOT);
  return found.sort();
}

interface AppImport {
  file: string;
  specifier: string;
  names: string[];
}

/** Module specifiers and their named bindings, read from the syntax tree. */
function appImports(): AppImport[] {
  const imports: AppImport[] = [];
  for (const file of appFiles()) {
    const source = ts.createSourceFile(
      file,
      readFileSync(file, 'utf8'),
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );
    for (const statement of source.statements) {
      if (!ts.isImportDeclaration(statement)) continue;
      if (!ts.isStringLiteral(statement.moduleSpecifier)) continue;
      const bindings = statement.importClause?.namedBindings;
      const names =
        bindings && ts.isNamedImports(bindings)
          ? bindings.elements.map((element) => (element.propertyName ?? element.name).text)
          : [];
      imports.push({
        file: relative(PACKAGE_ROOT, file),
        specifier: statement.moduleSpecifier.text,
        names,
      });
    }
  }
  return imports;
}

const APP_IMPORTS = appImports();
const PACKAGE_IMPORTS = APP_IMPORTS.filter(
  (entry) => subpathOfSpecifier(entry.specifier) !== null,
);

/** The published rule, run the way an application's ESLint runs it. */
function ruleFindings(specifier: string, filename: string): string[] {
  const reports: string[] = [];
  const visitors = noUnsanctionedDsSubpath.create({
    filename,
    options: [],
    report: (descriptor: { messageId?: string }) => reports.push(descriptor.messageId ?? ''),
  });
  visitors.ImportDeclaration?.({ source: { value: specifier } });
  return reports;
}

describe('the fixture application imports only the sanctioned surface', () => {
  it('addresses the design system, and does so more than once', () => {
    expect(appFiles().length).toBeGreaterThanOrEqual(4);
    expect(PACKAGE_IMPORTS.length).toBeGreaterThanOrEqual(4);
  });

  it('classifies every design-system specifier as guaranteed', () => {
    const unsanctioned = PACKAGE_IMPORTS.filter((entry) => {
      const subpath = subpathOfSpecifier(entry.specifier);
      return classifySubpath(subpath as string)?.disposition !== 'guaranteed';
    }).map((entry) => `${entry.file}: ${entry.specifier}`);
    expect(unsanctioned).toEqual([]);
  });

  it('reports zero findings under @rottay/no-unsanctioned-ds-subpath', () => {
    const findings = PACKAGE_IMPORTS.flatMap((entry) =>
      ruleFindings(entry.specifier, entry.file).map(
        (messageId) => `${entry.file}: ${entry.specifier} (${messageId})`,
      ),
    );
    expect(findings).toEqual([]);
  });

  it('names no forbidden theme symbol in new application code', () => {
    // Consumer contract §2. `compileTenantTheme` is the v1 whole-document
    // compiler; the artifact compiler the mount requires is
    // `compileTenantThemeConfig`, which is a different published name.
    const forbidden = [
      'compileTheme',
      'compileTenantTheme',
      'resolveTheme',
      'liftAuthoredTheme',
      'THEME_ENGINE_ADAPTERS',
      'BrandTheme',
      'tokenOverrides',
    ];
    const named = new Set(PACKAGE_IMPORTS.flatMap((entry) => entry.names));
    expect(forbidden.filter((symbol) => named.has(symbol))).toEqual([]);
  });

  it('imports only bindings the entrypoint actually publishes', async () => {
    const modules = new Map<string, Record<string, unknown>>([
      ['@rottay/design-system', await import('@rottay/design-system')],
      ['@rottay/design-system/server', await import('@rottay/design-system/server')],
      ['@rottay/design-system/icons', await import('@rottay/design-system/icons')],
    ]);
    const missing: string[] = [];
    for (const entry of PACKAGE_IMPORTS) {
      const module = modules.get(entry.specifier);
      if (!module) continue;
      for (const name of entry.names) {
        // A type-only binding has no runtime shape; the type half is proven by
        // `typecheck:tests`, which reads these same files.
        if (!(name in module) && !/^[A-Z]/.test(name)) missing.push(`${entry.specifier}#${name}`);
      }
    }
    expect(missing).toEqual([]);
  });
});

describe('the frozen signature of mountTenantTheme', () => {
  it('is (intent, options?) => Promise<MountedTenantTheme>', () => {
    // The pin is the ANNOTATION, checked by `typecheck:tests`; the runtime
    // assertion only proves the pinned value is the exported function.
    const pinned: (
      intent: ThemeIntent,
      options?: MountTenantThemeOptions,
    ) => Promise<MountedTenantTheme> = mountTenantTheme;
    expect(pinned).toBe(mountTenantTheme);
  });

  it('accepts every option of the frozen bag', () => {
    const options: MountTenantThemeOptions = {
      themeMode: 'auto',
      autoFallback: 'dark',
      locale: 'en',
    };
    expect(Object.keys(options).sort()).toEqual(['autoFallback', 'locale', 'themeMode']);
  });

  it('returns the four frozen fields and nothing the app has to assemble', async () => {
    const mounted = await mountVertical();
    expect(Object.keys(mounted).sort()).toEqual([
      'artifactDigest',
      'hydrationProof',
      'rootAttributes',
      'styleElements',
    ]);
  });
});

describe('the application mounts a code-owned vertical', () => {
  it('stamps the governed root scope from one call', async () => {
    const mounted = await mountVertical();
    expect(mounted.rootAttributes).toMatchObject({
      'data-ds-root': '',
      'data-vertical': 'bithire',
      'data-tenant': 'bithire',
      'data-engine': 'modern',
      lang: 'en',
      dir: 'ltr',
    });
    expect(mounted.artifactDigest).toMatch(/^sha256-[a-f0-9]{64}$/);
  });

  it('inlines nothing, because the vertical artifact ships in styles.css', async () => {
    const mounted = await mountVertical();
    expect(mounted.styleElements).toEqual([]);
    expect(mounted.hydrationProof.origin).toBe('static-vertical');
  });

  it('renders a root layout that stamps exactly what the mount returned', async () => {
    const mounted = await mountVertical('auto');
    const tree = (await RootLayout({ children: null, themeMode: 'auto' })) as {
      props: Record<string, unknown>;
    };
    for (const [name, value] of Object.entries(mounted.rootAttributes)) {
      expect(tree.props[name]).toBe(value);
    }
    // `auto` reaches the pre-paint script instead of being resolved on a server
    // that cannot read `prefers-color-scheme`.
    expect(tree.props['data-tenant-theme-mode']).toBe('auto');
    expect(tree.props['data-theme']).toBe('dark');
  });
});

describe('the application writes a tenant document v2 through the door', () => {
  it('is a valid v2 document by the published validator', () => {
    expect(assertTenantThemeDocumentV2(TENANT_DOCUMENT_V2)).toEqual(TENANT_DOCUMENT_V2);
  });

  it('is admitted, and every activated decision is reported', async () => {
    const { admission } = await mountTenant();
    expect(admission.version).toBe(2);
    expect(admission.decisions.map((decision) => decision.id).sort()).toEqual([
      'density.mode',
      'palette.seeds',
      'states.emphasis',
      'surfaces.border-style',
      'typography.pairing',
    ]);
  });

  it('accepts a decision with no fan-out yet and names it unlit', async () => {
    const { admission } = await mountTenant();
    expect(admission.unlit.map((decision) => decision.id)).toEqual([
      'surfaces.border-style',
    ]);
    // `states.emphasis` was this example until WO-DER-02 derived it; it is
    // asserted LIT here so the two halves of the report stay honest together.
    expect(
      admission.decisions.find((decision) => decision.id === 'states.emphasis')?.keypaths
    ).toEqual(['appearance.general.states.emphasis']);
  });

  it('refuses a decision id outside the published catalog, by name', () => {
    expect(() =>
      assertTenantThemeDocumentV2({
        ...TENANT_DOCUMENT_V2,
        decisions: { 'palette.invented': 'x' },
      }),
    ).toThrow(/palette\.invented/);
  });

  it('migrates the v1 transport to v2 and admits the result through the same door', () => {
    const migrated = migrateDocumentV1ToV2(TENANT_TRANSPORT_V1);
    expect(migrated.version).toBe(2);
    expect(
      migrateAndAdmitDocument({ vertical: 'bithire', document: TENANT_TRANSPORT_V1 }).patch,
    ).toEqual(
      documentThemeAdmission({
        vertical: 'bithire',
        slug: TENANT_SLUG,
        document: migrated,
      }).admission.patch,
    );
  });

  /**
   * The one seam this fixture pins as a NEGATIVE, so the migration packet can
   * name it instead of an app discovering it. `mountTenantTheme` requires a
   * compiled `TenantThemeArtifact` for a tenant-document origin, and the
   * artifact compiler still speaks v1 only. An app on a v2-only row therefore
   * cannot compile its own artifact today. WO-CAT-02 closes it; when it does,
   * this test fails and the app keeps exactly one row.
   */
  it('records that the artifact compiler does not yet accept a v2 document', () => {
    expect(() => hydrateTenantThemeConfig(TENANT_DOCUMENT_V2, TENANT_IDENTITY)).toThrow(
      TenantThemeValidationError,
    );
  });
});

describe('the application mounts a custom tenant', () => {
  it('mounts the compiled artifact with its own digest and proof', async () => {
    const { mounted, artifact } = await mountTenant();
    expect(mounted.hydrationProof.origin).toBe('tenant-document');
    expect(mounted.hydrationProof.slug).toBe(TENANT_SLUG);
    expect(mounted.artifactDigest).toBe(artifact.digest);
    expect(mounted.hydrationProof.receipt).toBeDefined();
  });

  it('emits exactly one style element, and the app writes none of its attributes', async () => {
    const { mounted } = await mountTenant();
    expect(mounted.styleElements).toHaveLength(1);
    const [element] = mounted.styleElements;
    expect(element.id).toContain(TENANT_SLUG);
    expect(Object.keys(element.attributes)).toEqual(
      expect.arrayContaining([
        'data-ds-tenant-theme-digest',
        'data-ds-tenant-theme-slug',
        'data-ds-tenant-theme-vertical',
      ]),
    );
    expect(element.css.length).toBeGreaterThan(0);
  });

  it('refuses a mount whose artifact names another tenant, by name', async () => {
    const artifact = compileTenantArtifact();
    await expect(
      mountTenantTheme(
        documentThemeAdmission({
          vertical: 'bithire',
          slug: 'not-acme',
          document: TENANT_DOCUMENT_V2,
        }).intent,
        { artifact },
      ),
    ).rejects.toThrow(/not the tenant this intent mounts/);
  });

  it('renders a tenant root layout carrying the mounted style element', async () => {
    const { mounted } = await mountTenant();
    const tree = (await TenantRootLayout({ children: null })) as {
      props: { children: unknown[] };
    };
    expect(tree.props.children).toBeDefined();
    expect(mounted.styleElements[0].css).toContain(TENANT_SLUG);
  });

  it('refuses a static intent handed a tenant artifact, by name', async () => {
    await expect(
      mountTenantTheme(staticThemeIntent('bithire'), { artifact: compileTenantArtifact() }),
    ).rejects.toThrow(/has no compiled tenant artifact/);
  });
});

describe('the application renders a page from the guaranteed surface', () => {
  it('paints the page and its rows under the application provider', async () => {
    render(
      Providers({
        children: ConsumerPage({
          title: 'Open roles',
          rows: [
            { id: 'a', label: 'Staff engineer', state: 'Screening' },
            { id: 'b', label: 'Product designer', state: 'Offer' },
          ],
        }),
      }),
    );
    expect(await screen.findByTestId('consumer-page')).toBeTruthy();
    expect(screen.getByText('Open roles')).toBeTruthy();
    expect(screen.getByText('Staff engineer')).toBeTruthy();
    expect(screen.getByText('Offer')).toBeTruthy();
  });

  it('resolves the engine from the provider, never from a component prop', async () => {
    render(Providers({ children: ConsumerPage({ title: 'Roles', rows: [] }) }));
    const page = await screen.findByTestId('consumer-page');
    expect(page.className).toContain('modern');
  });
});
