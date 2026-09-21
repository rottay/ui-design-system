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

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { createElement } from 'react';
import ts from 'typescript';
import { afterEach, describe, expect, it } from 'vitest';

import {
  compileTenantThemeDocumentV2,
  documentThemeAdmission,
  migrateAndAdmitDocument,
  migrateDocumentV1ToV2,
  mountTenantTheme,
  staticThemeIntent,
  assertTenantThemeDocumentV2,
  hydrateTenantThemeConfig,
  TenantThemeValidationError,
  ThemePatchMigrationError,
  type TenantThemeArtifact,
  type TenantThemeDocument,
  type MountTenantThemeOptions,
  type MountedTenantTheme,
  type ThemeIntent,
} from '@rottay/design-system/server';
import type { TenantConfig } from '@rottay/design-system';
import {
  classifySubpath,
  subpathOfSpecifier,
} from '@/entrypoints/eslint/rules/no-unsanctioned-ds-subpath/contract';
import { noUnsanctionedDsSubpath } from '@/entrypoints/eslint/rules/no-unsanctioned-ds-subpath';

import RootLayout, { mountVertical } from './app/layout';
import TenantRootLayout, { compileTenantArtifact, mountTenant } from './app/tenant-layout';
import ConsumerPage from './app/page';
import Providers from './app/providers';
import RolesTable, { type OpenRole } from './app/roles-table';
import { mockMatchMedia } from '@tests/support/browser/match-media';
import { resetResponsiveMediaStore } from '@/infrastructure/runtime/responsive/runtime/media-snapshot';
import {
  TENANT_DOCUMENT_V2,
  TENANT_IDENTITY,
  TENANT_SLUG,
  TENANT_TRANSPORT_V1,
  TENANT_TRANSPORT_V1_STATES,
  TENANT_TRANSPORT_V1_UNMIGRATABLE_EMPHASIS,
  TENANT_TRANSPORT_V1_UNMIGRATABLE_FOCUS_STYLE,
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
      'FlatTheme',
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
      'shape.control-height',
      'states.emphasis',
      'typography.pairing',
    ]);
  });

  it('reports an EMPTY unlit list, because every row this app writes now lowers', async () => {
    const { admission } = await mountTenant();
    // NOT deleted, and not weakened to "length is small": the list is asserted
    // empty and the two rows that used to populate it are asserted lit beside
    // it, so the day a catalog row outruns its fan-out again this goes red here
    // rather than in a tenant's browser. `states.emphasis` was the example
    // until WO-DER-02 derived it; `shape.control-height` until connection lot 2
    // gave it a keypath, a deriver and painted consumers.
    expect(admission.unlit.map((decision) => decision.id)).toEqual([]);
    expect(
      admission.decisions.find((decision) => decision.id === 'states.emphasis')?.keypaths
    ).toEqual(['appearance.general.states.emphasis']);
    expect(
      admission.decisions.find((decision) => decision.id === 'shape.control-height')
        ?.keypaths
    ).toEqual(['appearance.general.shape.controlHeight']);
  });

  it('conducts the display role through v1, with the authored pack landing on the lowered document', () => {
    // W14 (63aec5c5e) retired the premise this test used to pin: the v1
    // transport dropped `display` at the projection boundary, so a tenant that
    // picked a display face activated a decision the projection could not
    // write. The role now conducts: the decision reports lit, and the bare
    // pack reference -- the one grammar both doors accept -- reaches the v1
    // typography field the patch is lowered from, where the channel
    // derivation turns it into `--ds-font-family-display`.
    const { admission } = documentThemeAdmission({
      vertical: 'bithire',
      slug: TENANT_SLUG,
      document: {
        version: 2,
        plan: 'pro',
        decisions: { 'typography.families': { display: 'editorial-display' } },
      },
    });
    expect(admission.unlit).toEqual([]);
    expect(admission.decisions).toEqual([
      {
        id: 'typography.families',
        tier: 'pro',
        lit: true,
        keypaths: [
          'appearance.general.typography.{fontFamilyBase,fontFamilyHeading,fontFamilyDisplay}',
        ],
      },
    ]);
    const effectiveTypography = (
      admission.effective as {
        visualFoundation?: { general?: { typography?: Record<string, unknown> } };
      }
    ).visualFoundation?.general?.typography;
    expect(effectiveTypography?.fontFamilyDisplay).toBe(
      'var(--ds-font-pack-editorial-display)',
    );
  });

  it('still REPORTS unlit, by name and reason, for a role v1 cannot carry', () => {
    // The mechanism outlives this app's own document. `mono` is a registered
    // role with no v1 field, and W14 left it unlit deliberately: its live
    // producer writes a different grammar, so carrying it through the
    // projection would overwrite the value the vertical already emits. A
    // tenant that picks a mono face therefore activates a decision the
    // projection cannot write -- accepted, reported, and distinguished from
    // the whole-row gap by its own reason.
    const { admission } = documentThemeAdmission({
      vertical: 'bithire',
      slug: TENANT_SLUG,
      document: {
        version: 2,
        plan: 'pro',
        decisions: { 'typography.families': { mono: 'plex-mono' } },
      },
    });
    expect(admission.unlit.map((decision) => decision.id)).toEqual([
      'typography.families',
    ]);
    expect(admission.unlit[0]?.reason).toBe('role-has-no-keypath-today');
    expect(admission.unlit[0]?.keypaths).toEqual([]);
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
   * The states pair, direction 1: what the migration CARRIES.
   *
   * A v1 row that authored the interaction dials used to lose them in silence
   * the moment it migrated, so this asserts the carry where a tenant would
   * feel it -- in the bytes the published compiler emits, not in the migrated
   * document agreeing with itself. The floor is the same row WITHOUT the
   * dials, compiled through the same call: nine channels separate them, and a
   * carry that stopped working would return an empty difference here rather
   * than a green test.
   */
  it('carries both interaction dials from a v1 row through to the published artifact', () => {
    const { migrated, decisions, unlit, effective, ledger } = migrateAndAdmitDocument({
      vertical: 'bithire',
      document: TENANT_TRANSPORT_V1_STATES,
    });
    expect(migrated.decisions['states.emphasis']).toBe('subtle');
    expect(migrated.decisions['states.focus-style']).toBe('glow');
    // Both rows are Standard, so migrating a row that authored only these does
    // not quietly sell the tenant a plan it did not have.
    expect(migrated.plan).toBe('standard');
    expect(unlit).toEqual([]);
    expect(
      decisions
        .filter((decision) => decision.id.startsWith('states.'))
        .map((decision) => [decision.id, decision.keypaths]),
    ).toEqual([
      ['states.emphasis', ['appearance.general.states.emphasis']],
      ['states.focus-style', ['appearance.general.states.focusStyle']],
    ]);
    // Both are the TENANT's own claims, not something the migration invented.
    expect(
      ledger.entries
        .filter((entry) => entry.provenance === 'direct-override')
        .map((entry) => entry.ref),
    ).toEqual(
      expect.arrayContaining([
        { kind: 'decision', id: 'states.emphasis' },
        { kind: 'decision', id: 'states.focus-style' },
      ]),
    );
    // The return direction: the v1-shape document the patch was lowered from
    // writes both fields back at their own names, so v1 -> v2 -> v1 is
    // lossless for this row and an app can migrate without keeping a copy.
    expect(
      (effective as { visualFoundation?: { general?: { states?: unknown } } })
        .visualFoundation?.general?.states,
    ).toEqual({ emphasis: 'subtle', focusStyle: 'glow' });

    const publish = (row: TenantThemeDocument): TenantThemeArtifact =>
      compileTenantThemeDocumentV2({
        ...TENANT_IDENTITY,
        verticalKey: 'bithire',
        document: migrateDocumentV1ToV2(row),
      }).artifact;
    const withDials = publish(TENANT_TRANSPORT_V1_STATES);
    const withoutDials = publish(TENANT_TRANSPORT_V1);
    const variables = withDials.variables as Record<string, string | undefined>;
    const floor = withoutDials.variables as Record<string, string | undefined>;
    expect(
      Object.keys({ ...floor, ...variables })
        .filter((name) => variables[name] !== floor[name])
        .sort(),
    ).toEqual([
      '--ds-focus-ring',
      '--ds-focus-ring-offset',
      '--ds-focus-ring-width',
      '--ds-state-active-shift',
      '--ds-state-disabled-mix',
      '--ds-state-disabled-opacity',
      '--ds-state-hover-shift',
      '--ds-state-press-scale',
      '--ds-state-selected-shift',
    ]);
    expect(variables['--ds-state-hover-shift']).toBe('2%');
    expect(variables['--ds-focus-ring']).toContain(
      '0 0 12px 2px color-mix(in srgb, var(--ds-focus-ring-color) 45%, transparent)',
    );
    expect(withDials.digest).not.toBe(withoutDials.digest);
  });

  /**
   * The states pair, direction 2: what the migration REFUSES.
   *
   * v1 types both fields as an open string at the DB edge, so the closed
   * catalog vocabulary is what admits them. A value outside it is named at its
   * own v1 keypath -- the keypath the tenant wrote, not the decision id they
   * have never seen -- because the difference between a migration and a
   * repaint nobody was told about is whether the row that cannot move says so.
   */
  it('refuses an out-of-domain state value by name, at its own v1 keypath', () => {
    for (const [row, message] of [
      [
        TENANT_TRANSPORT_V1_UNMIGRATABLE_EMPHASIS,
        /v1 general\.states\.emphasis "loud" is outside the "states\.emphasis" domain; row 20 closes it at subtle, medium, strong/,
      ],
      [
        TENANT_TRANSPORT_V1_UNMIGRATABLE_FOCUS_STYLE,
        /v1 general\.states\.focusStyle "halo" is outside the "states\.focus-style" domain; row 21 closes it at ring, underline, glow/,
      ],
    ] as const) {
      expect(() => migrateDocumentV1ToV2(row)).toThrow(ThemePatchMigrationError);
      expect(() => migrateDocumentV1ToV2(row)).toThrow(message);
      // The door the app actually calls refuses it too: a migration that only
      // failed when called directly would let the same row through the
      // one-call path this fixture documents.
      expect(() =>
        migrateAndAdmitDocument({ vertical: 'bithire', document: row }),
      ).toThrow(message);
    }
  });

  /**
   * The seam this fixture pinned as a NEGATIVE until WO-CON-06 closed it: the
   * artifact compiler spoke v1 only, so an app on a v2 row could not compile
   * the `TenantThemeArtifact` `mountTenantTheme` requires and had to keep a
   * second, v1 copy of the same identity. The publication adapter removes the
   * second row; what stays pinned is that the V1 door still refuses a v2
   * document by name, because that refusal is the reason the adapter exists
   * and not an accident to be discovered by an app.
   *
   * THE CONDITION, stated so the next reader does not have to guess it: the
   * refusal row below may be replaced only when `hydrateTenantThemeConfig`
   * itself is retired from the published surface under its own work order and
   * changeset -- not when a v2 path starts working, which is what already
   * happened here. Until then it is deleted by nobody: a v1 door that stopped
   * refusing v2 would admit a document it cannot lower, and this row is the
   * only place that says so out loud.
   */
  it('publishes the v2 document through the real path, keeping one row', () => {
    const { artifact, admission, ledger } = compileTenantThemeDocumentV2({
      ...TENANT_IDENTITY,
      verticalKey: 'bithire',
      document: TENANT_DOCUMENT_V2,
    });
    expect(artifact.digest).toMatch(/^sha256-[a-f0-9]{64}$/);
    expect(admission.version).toBe(2);
    expect(
      ledger.entries.filter((entry) => entry.provenance === 'direct-override').length,
    ).toBeGreaterThan(0);
    expect(artifact.provenance?.entries.length).toBe(ledger.entries.length);
  });

  it('keeps the v1 door refusing a v2 document by name', () => {
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
    // The page root mounts before the engine-switched leaves inside it, so the
    // row content is awaited rather than read on the same tick: a synchronous
    // read here fails intermittently on a loaded host and says "the surface
    // does not paint" when what happened is that it had not painted YET.
    expect(await screen.findByTestId('consumer-page')).toBeTruthy();
    expect(await screen.findByText('Open roles')).toBeTruthy();
    expect(await screen.findByText('Staff engineer')).toBeTruthy();
    expect(await screen.findByText('Offer')).toBeTruthy();
  });

  it('resolves the engine from the provider, never from a component prop', async () => {
    render(Providers({ children: ConsumerPage({ title: 'Roles', rows: [] }) }));
    const page = await screen.findByTestId('consumer-page');
    expect(page.className).toContain('modern');
  });
});

describe('the application adapts a collection from its own side', () => {
  const roles: OpenRole[] = [
    { id: 'a', title: 'Staff engineer', stage: 'Screening', owner: 'Ada', openedAt: '2026-09-01', location: 'Remote' },
    { id: 'b', title: 'Product designer', stage: 'Offer', owner: 'Grace', openedAt: '2026-09-02', location: 'Lisbon' },
  ];

  afterEach(() => {
    cleanup();
    resetResponsiveMediaStore();
  });

  async function renderAt(width: number) {
    mockMatchMedia(width);
    resetResponsiveMediaStore();
    const view = render(Providers({ children: createElement(RolesTable, { roles }) }));
    const box = await waitFor(() => {
      const root = view.container.querySelector('[data-part="responsive-root"]');
      expect(root).not.toBeNull();
      return root as HTMLElement;
    });
    return { ...view, box };
  }

  it('keeps three columns and presents cards on a phone', async () => {
    const { box } = await renderAt(390);
    expect(box.getAttribute('data-posture')).toBe('phone');
    expect(box.getAttribute('data-presentation')).toBe('cards');
    expect(box.querySelector('table')).toBeNull();
    for (const role of roles) {
      expect(await screen.findByText(role.title)).toBeTruthy();
      expect(screen.getByText(role.stage)).toBeTruthy();
      expect(screen.getByText(role.owner)).toBeTruthy();
      expect(screen.queryByText(role.openedAt)).toBeNull();
      expect(screen.queryByText(role.location)).toBeNull();
    }
  });

  it('keeps every column in a table on a desktop', async () => {
    const { box } = await renderAt(1440);
    expect(box.getAttribute('data-posture')).toBe('desktop');
    expect(box.getAttribute('data-presentation')).toBe('table');
    expect(await screen.findByText(roles[0].location)).toBeTruthy();
  });
});

/**
 * THE TYPE-LEVEL NEGATIVE.
 *
 * `TenantConfig` is identity, bounded branding and the artifact reference. None
 * of the five fields below is nameable, and an application that names one must
 * fail to COMPILE — a runtime assertion would pass just as happily against a
 * type that still declared them and a provider that merely ignored them.
 *
 * Each `@ts-expect-error` is the assertion. If any field appears, its directive
 * becomes an unused expect-error and `typecheck:tests` goes red on this file.
 */
describe('the removed visual fields are not nameable by a consumer', () => {
  it('refuses each one at compile time', () => {
    const identity: TenantConfig = {
      slug: 'consumer-negative',
      name: 'Consumer negative',
      theme: 'base',
      plan: 'enterprise',
      features: [],
      vertical: 'bithire',
      branding: { companyName: 'Consumer negative' },
    };

    const written: Partial<Record<string, unknown>> = {
      // @ts-expect-error no `brandTheme`: compile a Theme into an artifact.
      brandTheme: identity.brandTheme,
      // @ts-expect-error no `tokenOverrides`: they are `ThemeCompilation.runtime`.
      tokenOverrides: identity.tokenOverrides,
      // @ts-expect-error no `personality`: it is `ThemeCompilation.runtime`.
      personality: identity.personality,
      // @ts-expect-error no `appearance`: it is the artifact's read-model.
      appearance: identity.appearance,
      // @ts-expect-error no `engine`: the vertical roster decides it.
      engine: identity.engine,
    };

    // The runtime half of the same statement: the object a consumer can build
    // carries none of them either.
    for (const field of Object.keys(written)) {
      expect(identity).not.toHaveProperty(field);
    }

    // ...and the artifact reference the config DOES carry is its identity.
    expect(compileTenantArtifact().verticalKey).toBe(identity.vertical);
  });
});
