/// <reference types="vite/client" />
/**
 * CollectionWorkspace split parity contract.
 *
 * Pins the surface's observable contract: P1 runtime exports, P2 raw DOM per
 * scene, P2-ID useId order + ARIA relations, P2-HOOK whole-tree hook ledger, P3
 * callbacks/races, P4 node/focus/key identity and the shared Popover anchor.
 * Pins are literal; W7A_CAPTURE optionally writes the run's capture for comparison.
 */
import { describe, expect, it, vi } from 'vitest';
import React from 'react';
import { act, cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import ts from 'typescript';

import { renderSurface, RESOLVED_PHONE_TEST_CONTEXT } from '@/components/surfaces/foundation/common/test-utils';
import type { ResponsiveContextValue } from '@/infrastructure/runtime/responsive';
import { I18nProvider } from '@/infrastructure/runtime/i18n';
import type { ColumnDef, FilterDef } from '@/foundation/contracts/runtime/components/patterns/core';

const probe = vi.hoisted(() => ({
  hooksOn: false,
  hooks: [] as string[],
  scopes: [] as string[],
  dispatch: null as null | Record<string, unknown>,
}));

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  const DEPS: Record<string, number> = {
    useMemo: 1, useCallback: 1, useEffect: 1, useLayoutEffect: 1, useInsertionEffect: 1, useImperativeHandle: 2,
  };
  const wrapped: Record<string, unknown> = {};
  for (const name of Object.keys(actual)) {
    if (!/^use[A-Z]/.test(name)) continue;
    const real = (actual as unknown as Record<string, (...args: unknown[]) => unknown>)[name];
    wrapped[name] = (...args: unknown[]) => {
      if (probe.hooksOn) {
        const deps = name in DEPS ? args[DEPS[name]] : undefined;
        probe.hooks.push(`${name}:${Array.isArray(deps) ? deps.length : '-'}`);
      }
      return real(...args);
    };
  }
  return { ...actual, ...wrapped, default: actual };
});

vi.mock('@/graphics/motion/react/runtime', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  const real = actual.tabPanelTransitionName as (scope: string) => string;
  return { ...actual, tabPanelTransitionName: (scope: string) => { probe.scopes.push(scope); return real(scope); } };
});

vi.mock(
  '../render-dispatch/index.tsx',
  async (importOriginal) => {
    const actual = await importOriginal<Record<string, unknown>>();
    const { createElement } = await import('react');
    const Real = actual.CollectionRenderDispatch as React.ComponentType<Record<string, unknown>>;
    function CollectionRenderDispatch(props: Record<string, unknown>) {
      probe.dispatch = props;
      return createElement(Real, props);
    }
    return { ...actual, CollectionRenderDispatch };
  },
);

// Every engine implementation sits behind React.lazy. A cold chunk keeps the first
// mount suspended for a load-time-dependent number of attempts, each consuming
// useId counters, so the fixture evaluates every engine module before any render.
const ENGINE_MODULES = import.meta.glob('/src/components/**/engines/{modern,rustic}/index.tsx');
await Promise.all(Object.keys(ENGINE_MODULES).sort().map((key) => ENGINE_MODULES[key]()));

const surface = await import('../index.tsx');
const RENDERER_SOURCES = import.meta.glob<string>(
  ['../render-dispatch/index.tsx', '../render-dispatch/*/index.{ts,tsx}'],
  { query: '?raw', import: 'default', eager: true },
);
const OWNER_SOURCES = import.meta.glob<string>(
  ['../**/index.{ts,tsx}', '!../render-dispatch/**', '!../tests/**'],
  { query: '?raw', import: 'default', eager: true },
);
const { CollectionWorkspaceSurface } = surface as typeof import('@/components/surfaces/presentation/pages/workspace/collection-workspace');

const CAPTURE_PATH = process.env.W7A_CAPTURE;
// p2 re-captured 2026-10-12 through W7A_CAPTURE. Landed by WO-RET-04 W7a (383368e13); moved by the
// ARC-12 step-2 P-88 closures, where the engine's own data-part replaces the caller literal:
// E2 3c466551f (input "input" -> "root": shell, rtl), E9 28e169406 (button "icon-button" |
// "utility-icon-toggle" | "control" | "fallback-open-link" -> "trigger": every scene but shell, rtl)
// and E8-a 2d9e75af1 (phone title gains class ds-collection-render-dispatch__title). E3 4d8559be9
// measured inert here. Attribute-only delta: tag sequence and text nodes are byte-identical.
const PINS: Record<string, unknown> = {
  "p1": {
    "keys": [
      "CollectionWorkspace",
      "CollectionWorkspaceSurface"
    ],
    "alias": true
  },
  "p2": {
    "legacy": "d780653d4409b3a10257e8e70ba497f9a1648250c7b4f3e6ded5ae2f1adea49f",
    "headerless": "cb088608ed03c0f75e01d1cff4ea2002b13d6f18fd5527e22c6f668dcd4d1b93",
    "shell": "09669eb42148136d5a68ad2c357d6fdecf9bcc605051cb6e4e54b096c46ff1d7",
    "dropdown": "267859fefba1a4f74136f5508e7773097f60838de14b33634cea8da4559ea27a",
    "frozen": "d90d8491cb581f8cfc9a253772e9d17afd2d7b0fb6fb10761fd8cea3baa25ba2",
    "phone": "a0798aebf64d52141f4dd83cc89146a5c791c8860ce0eed69457fe44df239f10",
    "accordion": "86a79fc265f3c420df597611c93212006b1a02a8c6e89241fa92443e33bab764",
    "rtl": "731bcc94b43f3f076cbad00d70650fab69488ada4053ac0b7143c7f8890eb601"
  },
  "p2id": {
    "phone": {
      "scope": "_r_9r_",
      "filterId": "ds-collection-filter-_r_9s_",
      "actionsId": "ds-collection-actions-_r_9t_",
      "previewId": "ds-collection-preview-_r_9u_"
    },
    "accordion": {
      "scope": "_r_c8_",
      "trigger": "ds-collection-preview-_r_cb_-trigger"
    }
  },
  // Engine router: +1 useSyncExternalStore +2 useRef per render, insert-only vs the raw W7A_LEDGER_DIR dumps
  // (N = 66 legacy / 143 phone: 3303 + 198, 3658 + 429). A router hook added later re-derives these from the dumps.
  "p2hook": {
    "legacy": {
      "count": 3501,
      "sha256": "f06d276d253ef69ff36d2a5026509c527cdb4505de35bd41c9a0f1269d8fa6dd"
    },
    "phone": {
      "count": 4087,
      "sha256": "d88bf56aa18702226c93f6d52e981970307a771689982ca4450be803a0170444"
    }
  },
  "p3a": {
    "calls": 1,
    "before": false,
    "after": true,
    "cleared": true
  },
  "p3b": [
    "open:Probe detailssheet:sheet:Bob",
    "open:Probe detailsLoading details…",
    "closed",
    "closed",
    "closed"
  ],
  "p3c": [
    "headerless:separator:Resize detail panel:380",
    "width:404",
    "width:380",
    "rtl:separator:تغيير حجم لوحة التفاصيل:380",
    "width:356",
    "width:380",
    "view:table",
    "view:cards",
    "sort:Alice,Bob,Cleo",
    "sort:Alice,Bob,Cleo",
    "sort:Cleo,Bob,Alice",
    "filter:Advanced filters (1):false",
    "compact:closed",
    "focus:1",
    "compact:open",
    "columns:name,status|name,status"
  ],
  "p4": {
    "premiumSame": {
      "utilities": true,
      "views": true,
      "context": true,
      "smartA": true,
      "rail": true
    },
    "premiumFocus": true,
    "smartKeyFollows": true,
    "smartOrder": "Set b,Set a,Set clear",
    "utilitiesAnchor": true,
    "legacySame": true,
    "legacyAnchor": true,
    "dockSame": true,
    "sheetContentSame": true,
    "actionKeyFollows": true
  },
  "ownerSources": [
    "../column-settings/index.ts",
    "../compact-preview/index.ts",
    "../filter-disclosure/index.ts",
    "../foundation/index.ts",
    "../index.tsx",
    "../legacy/index.tsx",
    "../overlays/index.tsx",
    "../premium/index.tsx",
    "../preview-rail/index.tsx",
    "../resolution/index.tsx",
    "../row-activation/index.ts",
    "../rows/index.ts",
    "../toolbar-utilities/index.tsx"
  ],
  "p0control": {
    "count": 257,
    "sortedKeysSha256": "cd243bc63029958a561c39e2b28e4a9af8e3eca637647601014c0b46f591d1d4"
  }
};
const capture: Record<string, unknown> = {};
function record(key: string, value: unknown) {
  capture[key] = value;
  if (CAPTURE_PATH) writeFileSync(CAPTURE_PATH, `${JSON.stringify(capture, null, 1)}\n`);
}
function pinned(key: string, value: unknown) {
  record(key, value);
  expect(value).toEqual(PINS[key]);
}

const sha = (text: string) => createHash('sha256').update(text).digest('hex');
function domHash(): string {
  const extra = [...document.documentElement.children]
    .filter((node) => node !== document.head && node !== document.body)
    .map((node) => node.outerHTML);
  return sha([document.body.innerHTML, ...extra].join('\n<!--portal-root-->\n'));
}
async function settle() {
  for (let i = 0; i < 6; i += 1) {
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 0)); });
  }
}

interface Row { id: string; name: string; status: string }
const ROWS: Row[] = [
  { id: '1', name: 'Alice', status: 'active' },
  { id: '2', name: 'Bob', status: 'paused' },
  { id: '3', name: 'Cleo', status: 'active' },
];
const COLUMNS: ColumnDef<Row>[] = [
  { key: 'name', header: 'Name', accessorKey: 'name', sortable: true },
  { key: 'status', header: 'Status', accessorKey: 'status' },
];
const FILTERS: FilterDef[] = [{ key: 'name', label: 'Name contains', type: 'text' }];
const DESKTOP: ResponsiveContextValue = {
  ...RESOLVED_PHONE_TEST_CONTEXT, deviceClass: 'desktop', activeBreakpoint: 'lg', isPhone: false, isDesktop: true,
  pointer: 'fine', orientation: 'landscape', isPhoneOrTablet: false, isTabletOrDesktop: true, isTouchDevice: false,
};
const TABLET: ResponsiveContextValue = {
  ...RESOLVED_PHONE_TEST_CONTEXT, deviceClass: 'tablet', activeBreakpoint: 'md', isPhone: false, isTablet: true,
  isTabletOrDesktop: true,
};
const PHONE = RESOLVED_PHONE_TEST_CONTEXT;
const noop = () => {};
const preview = (pane: string) => ({
  enabled: true,
  render: (item: Row, ctx: { pane: string }) => <div data-probe="preview">{`${pane}:${ctx.pane}:${item.name}`}</div>,
});

type Props = Record<string, unknown>;
const SCENES: Record<string, { ctx: ResponsiveContextValue; engine?: 'modern' | 'rustic'; rtl?: boolean; props: () => Props }> = {
  legacy: {
    ctx: DESKTOP,
    props: () => ({
      controls: { viewMode: { enabled: true }, search: { enabled: true, placeholder: 'Search rows' }, filters: FILTERS },
      adaptive: { desktop: { filters: 'dropdown' } },
    }),
  },
  headerless: {
    ctx: DESKTOP,
    props: () => ({
      presentation: { enhancedInteractions: true },
      controls: {
        columnSettings: { enabled: true, onColumnsChange: noop },
        export: { enabled: true, onExport: noop },
        density: { enabled: true, value: 'comfortable', onChange: noop },
        filters: FILTERS,
      },
      behavior: {
        selection: { enabled: false, onModeChange: noop },
        pagination: { current: 1, pageSize: 10, total: 3, pageSizeOptions: [10, 20], onChange: noop },
        focus: { enabled: true, focusedKey: '2', onFocusChange: noop },
        previewRail: { ...preview('rail'), width: 380, minWidth: 280, maxWidth: 720, onWidthChange: noop },
      },
    }),
  },
  shell: {
    ctx: DESKTOP,
    props: () => ({
      presentation: { shell: { variant: 'ai-field' } },
      header: {
        eyebrow: 'Ops', title: 'Ledger', layoutVariant: 'editorial-tech',
        shortcuts: [{ key: 'k1', label: 'Press /' }, { key: 'k2', label: 'Press K' }],
      },
      command: { placeholder: 'Find', value: '', onSearch: noop },
      contextSlot: <div>Context slot</div>,
      statsSlot: <div>Stats slot</div>,
    }),
  },
  dropdown: {
    ctx: TABLET,
    props: () => ({ header: { title: 'Filtered' }, controls: { filters: FILTERS }, adaptive: { tablet: { filters: 'dropdown' } } }),
  },
  frozen: {
    ctx: TABLET,
    engine: 'rustic',
    props: () => ({ header: { title: 'Frozen' }, controls: { filters: FILTERS }, adaptive: { tablet: { filters: 'dropdown' } } }),
  },
  phone: {
    ctx: PHONE,
    props: () => ({
      header: {
        title: 'Phone',
        quickActions: [
          { key: 'add', label: 'Add row', onClick: noop, variant: 'primary' },
          { key: 'matching', label: 'Run matching', onClick: noop },
          { key: 'export', label: 'Export rows', onClick: noop },
        ],
      },
      primaryAction: { key: 'add', label: 'Add row', onClick: noop },
      controls: { filters: FILTERS },
      density: 'compact',
      adaptive: {
        phone: { compactHeader: true, actionBar: 'sticky-bottom', filters: 'sheet', pane: 'sheet', collection: 'cards' },
      },
      behavior: { selection: { enabled: true, selectedKeys: ['1'] }, previewRail: preview('sheet') },
    }),
  },
  accordion: {
    ctx: DESKTOP,
    props: () => ({
      presentation: { enhancedInteractions: true },
      adaptive: { desktop: { pane: 'accordion' } },
      behavior: {
        focus: { enabled: true, focusedKey: '2', onFocusChange: noop },
        selection: { enabled: true, selectedKeys: ['1'], onModeChange: noop },
        smartSelection: [
          { key: 'a', label: 'Set A', onClick: noop },
          { key: 'b', label: 'Set B', onClick: noop },
          { key: 'clear', label: 'Clear set', onClick: noop },
        ],
        previewRail: preview('accordion'),
      },
    }),
  },
  rtl: {
    ctx: DESKTOP,
    rtl: true,
    props: () => ({
      surfaceMode: 'embed',
      controls: { search: { enabled: true, placeholder: 'Search embedded' } },
      behavior: {
        focus: { enabled: true, focusedKey: '1', onFocusChange: noop },
        previewRail: { ...preview('rail'), width: 380, minWidth: 280, maxWidth: 720, onWidthChange: noop },
      },
    }),
  },
};

function element(scene: string, overrides: Props = {}) {
  const def = SCENES[scene];
  const ui = (
    <CollectionWorkspaceSurface
      title="Probe"
      data={ROWS}
      columns={COLUMNS}
      rowKey="id"
      {...(def.props() as object)}
      {...(overrides as object)}
    />
  );
  return def.rtl ? <I18nProvider locale="ar" fallbackLocale="en">{ui}</I18nProvider> : ui;
}
async function mount(scene: string, overrides: Props = {}) {
  const def = SCENES[scene];
  const result = renderSurface(element(scene, overrides), { engine: def.engine ?? 'modern', responsiveContext: def.ctx });
  if (scene === 'legacy') {
    await waitFor(() => expect(document.querySelector('.ds-pattern-list-toolbar')).not.toBeNull());
  }
  await settle();
  return result;
}
const q = <E extends Element = HTMLElement>(selector: string) => document.querySelector<E & HTMLElement>(selector);
const RID = /_r_([0-9a-v]+)_/;
/** Member hook calls through any binding of the `react` module; the named-import ledger cannot see them. */
function reactMemberHookCalls(fileName: string, text: string): string[] {
  const source = ts.createSourceFile(fileName, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const bindings = new Set<string>(['React']);
  for (const statement of source.statements) {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
    if (statement.moduleSpecifier.text !== 'react' || !statement.importClause) continue;
    const { name, namedBindings } = statement.importClause;
    if (name) bindings.add(name.text);
    if (namedBindings && ts.isNamespaceImport(namedBindings)) bindings.add(namedBindings.name.text);
    if (namedBindings && ts.isNamedImports(namedBindings)) {
      for (const element of namedBindings.elements) {
        if ((element.propertyName ?? element.name).text === 'default') bindings.add(element.name.text);
      }
    }
  }
  let grew = true;
  while (grew) {
    grew = false;
    const alias = (node: ts.Node): void => {
      if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer
        && ts.isIdentifier(node.initializer) && bindings.has(node.initializer.text) && !bindings.has(node.name.text)) {
        bindings.add(node.name.text);
        grew = true;
      }
      ts.forEachChild(node, alias);
    };
    alias(source);
  }
  const hits: string[] = [];
  const visit = (node: ts.Node): void => {
    if (ts.isCallExpression(node)) {
      let callee: ts.Expression = node.expression;
      while (ts.isParenthesizedExpression(callee) || ts.isNonNullExpression(callee)) callee = callee.expression;
      if (ts.isPropertyAccessExpression(callee) && ts.isIdentifier(callee.expression)
        && bindings.has(callee.expression.text) && /^use[A-Z]/.test(callee.name.text)) {
        hits.push(`${fileName}:${source.getLineAndCharacterOfPosition(node.getStart()).line + 1}:${callee.name.text}`);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return hits;
}
const counter = (value: string | null | undefined) => {
  const match = value ? RID.exec(value) : null;
  return match ? parseInt(match[1], 32) : NaN;
};
function filterToggle(): HTMLElement {
  return screen.getAllByRole('button').find((node) => /^Advanced filters/.test(node.getAttribute('aria-label') ?? ''))!;
}

describe('CollectionWorkspace split parity', () => {
  it('P0 engine modules evaluated before the first render', () => {
    record('p0', { engineModules: Object.keys(ENGINE_MODULES).length });
    expect(Object.keys(ENGINE_MODULES).length).toBeGreaterThan(100);
  });

  it('P0 control: the prewarmed engine key set is pinned by count and sorted-key hash', () => {
    const keys = Object.keys(ENGINE_MODULES).sort();
    pinned('p0control', { count: keys.length, sortedKeysSha256: sha(keys.join('\n')) });
  });

  it('React.useX guard: no member hook call in the owner sources escapes the named-import ledger', () => {
    const drills: Array<[string, string, number]> = [
      ['plain.tsx', "import React from 'react';\nexport const a = () => React.useMemo(() => 1, []);\n", 1],
      ['generic.tsx', "import React from 'react';\nexport const a = () => React.useMemo<number>(() => 1, []);\n", 1],
      ['aliased-default.tsx', "import R from 'react';\nexport const a = () => R.useState(0);\n", 1],
      ['multiline-mixed.tsx', "import Re, {\n  useMemo,\n  useState as useLocalState,\n} from 'react';\nexport const a = () => { Re.useRef(null); useLocalState(0); return useMemo(() => 1, []); };\n", 1],
      ['namespace.tsx', "import * as NS from 'react';\nexport const a = () => NS.useEffect(() => {}, []);\n", 1],
      ['default-specifier.tsx', "import { default as D } from 'react';\nexport const a = () => D.useId();\n", 1],
      ['local-alias.tsx', "import React from 'react';\nconst Alias = React;\nexport const a = () => Alias.useContext(Ctx);\n", 1],
      ['innocent.tsx', "import React from 'react';\nconst store = { useState: () => 0 };\nexport const a = () => [React.createElement('i'), React.Children.count(null), store.useState(), React.user?.(), 'React.useMemo('];\n", 0],
    ];
    expect(drills.map(([file, text]) => [file, reactMemberHookCalls(file, text).length]))
      .toEqual(drills.map(([file, , expected]) => [file, expected]));
    const files = Object.entries(OWNER_SOURCES).sort(([a], [b]) => (a < b ? -1 : 1));
    pinned('ownerSources', files.map(([file]) => file));
    const calls = files.flatMap(([file, text]) => reactMemberHookCalls(file, text));
    const frozenRenderer = Object.entries(RENDERER_SOURCES).flatMap(([file, text]) => reactMemberHookCalls(file, text)).length;
    record('reactMemberGuard', { files: files.map(([file]) => file), memberHookCalls: calls.length, frozenRendererMemberHookCalls: frozenRenderer });
    expect(calls).toEqual([]);
  });

  it('P1 exact runtime exports and canonical alias identity', () => {
    const keys = Object.keys(surface).sort();
    pinned('p1', { keys, alias: surface.CollectionWorkspace === surface.CollectionWorkspaceSurface });
    expect(keys).toEqual(['CollectionWorkspace', 'CollectionWorkspaceSurface']);
    expect(surface.CollectionWorkspace).toBe(surface.CollectionWorkspaceSurface);
  });

  it('P2 DOM: raw body + portal-root hash for the 8 fixed scenes', async () => {
    const hashes: Record<string, string> = {};
    for (const scene of ['legacy', 'headerless', 'shell', 'dropdown', 'frozen', 'phone', 'accordion', 'rtl']) {
      await mount(scene);
      if (scene === 'dropdown') {
        fireEvent.click(filterToggle());
        await screen.findByRole('dialog', { name: 'Advanced filters' });
        await settle();
      }
      if (scene === 'phone') await screen.findByRole('dialog', { name: 'Probe details' });
      hashes[scene] = domHash();
      if (process.env.W7A_DOM_DIR) writeFileSync(`${process.env.W7A_DOM_DIR}/${scene}.html`, document.documentElement.outerHTML);
      cleanup();
      await settle();
    }
    pinned('p2', hashes);
  });

  it('P2-ID consecutive useId counters and resolved ARIA relations', async () => {
    probe.scopes.length = 0;
    await mount('phone');
    const scope = probe.scopes[probe.scopes.length - 1];
    const toggle = filterToggle();
    const filterId = toggle.getAttribute('aria-controls');
    const more = screen.getByRole('button', { name: 'More actions' });
    const actionsId = more.getAttribute('aria-controls');
    const previewDialog = await screen.findByRole('dialog', { name: 'Probe details' });
    const previewId = previewDialog.getAttribute('id');
    const phone = [scope, filterId, actionsId, previewId].map(counter);
    expect(phone.every(Number.isFinite)).toBe(true);
    expect([phone[1] - phone[0], phone[2] - phone[1], phone[3] - phone[2]]).toEqual([1, 1, 1]);
    fireEvent.click(within(previewDialog).getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Probe details' })).toBeNull());
    fireEvent.click(toggle);
    const sheet = await screen.findByRole('dialog', { name: 'Advanced filters' });
    const filterRelation = sheet.getAttribute('id') === filterId;
    fireEvent.click(within(sheet).getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Advanced filters' })).toBeNull());
    fireEvent.click(more);
    const actions = await screen.findByRole('dialog', { name: 'More actions' });
    const actionsRelation = actions.getAttribute('id') === actionsId;
    cleanup();
    await settle();

    probe.scopes.length = 0;
    await mount('accordion');
    const accordionScope = probe.scopes[probe.scopes.length - 1];
    const trigger = q('[data-part="preview-accordion"] button[aria-controls]')!;
    const region = document.getElementById(trigger.getAttribute('aria-controls')!);
    const accordionRelation = Boolean(region)
      && region!.getAttribute('aria-labelledby') === trigger.id
      && trigger.getAttribute('aria-expanded') === 'true';
    const accordion = [accordionScope, trigger.id].map(counter);
    expect(accordion[1] - accordion[0]).toBe(3);
    expect({ filterRelation, actionsRelation, accordionRelation }).toEqual({
      filterRelation: true, actionsRelation: true, accordionRelation: true,
    });
    pinned('p2id', {
      phone: { scope, filterId, actionsId, previewId },
      accordion: { scope: accordionScope, trigger: trigger.id },
    });
  });

  it('P2-HOOK whole-tree named-hook ledger across mount + equal-props rerender', async () => {
    const ledgers: Record<string, { count: number; sha256: string }> = {};
    for (const scene of ['legacy', 'phone']) {
      await mount(scene);
      cleanup();
      await settle();
      probe.hooks.length = 0;
      probe.hooksOn = true;
      const view = await mount(scene);
      view.rerender(element(scene));
      await settle();
      probe.hooksOn = false;
      ledgers[scene] = { count: probe.hooks.length, sha256: sha(probe.hooks.join('\n')) };
      if (process.env.W7A_LEDGER_DIR) {
        writeFileSync(`${process.env.W7A_LEDGER_DIR}/${scene}.ledger.txt`, `${probe.hooks.join('\n')}\n`);
      }
      cleanup();
      await settle();
    }
    expect(ledgers.legacy.count).toBeGreaterThan(74);
    pinned('p2hook', ledgers);
  });

  it('P3a awaited inline edit: draft absent before resolve, present after, cleared on data change', async () => {
    let release: () => void = noop;
    const onCellEdit = vi.fn(() => new Promise<void>((resolve) => { release = resolve; }));
    const behavior = { cellEditing: { enabled: true, onCellEdit } };
    const view = await mount('headerless', { behavior });
    const cell = () => within(q('[data-part="collection"]')!).queryByText('Zed') !== null;
    const edit = probe.dispatch!.onCellEdit as (row: Row, key: string, next: unknown, prev: unknown) => Promise<void>;
    let pending: Promise<void> = Promise.resolve();
    await act(async () => { pending = edit(ROWS[0], 'name', 'Zed', 'Alice'); });
    await settle();
    const before = cell();
    await act(async () => { release(); await pending; });
    await settle();
    const after = cell();
    view.rerender(element('headerless', { behavior, data: ROWS.map((row) => ({ ...row })) }));
    await settle();
    const cleared = !cell();
    const log = { calls: onCellEdit.mock.calls.length, before, after, cleared };
    expect(log).toEqual({ calls: 1, before: false, after: true, cleared: true });
    pinned('p3a', log);
  });

  it('P3b compact preview survives loading, closes on a settled miss, stays closed on reselect', async () => {
    const focus = { enabled: true, focusedKey: '2', onFocusChange: noop };
    const phone = (data: Row[], loading: boolean) => element('phone', {
      data, loading, behavior: { focus, previewRail: preview('sheet') },
    });
    const state = () => {
      const dialog = screen.queryByRole('dialog', { name: 'Probe details' });
      return dialog ? `open:${dialog.textContent?.replace(/\s+/g, ' ').trim()}` : 'closed';
    };
    const view = await mount('phone', { behavior: { focus, previewRail: preview('sheet') } });
    const steps: string[] = [state()];
    const without = ROWS.filter((row) => row.id !== '2');
    view.rerender(phone(without, true)); await settle(); steps.push(state());
    view.rerender(phone(without, false)); await settle(); steps.push(state());
    view.rerender(phone([...without], false)); await settle(); steps.push(state());
    view.rerender(phone(ROWS, false)); await settle(); steps.push(state());
    expect(steps[0]).toContain('sheet:sheet:Bob');
    expect(steps[1]).toContain('Loading details');
    expect(steps[2]).toBe('closed');
    expect(steps[3]).toBe('closed');
    pinned('p3b', steps);
  });

  it('P3c rail keyboard signs (LTR/RTL), view switch, sort, filter apply, focus click, column reset', async () => {
    const log: string[] = [];
    const widths = vi.fn((width: number) => log.push(`width:${width}`));
    const rail = () => ({
      behavior: {
        focus: { enabled: true, focusedKey: '1', onFocusChange: noop },
        previewRail: { ...preview('rail'), width: 380, minWidth: 280, maxWidth: 720, onWidthChange: widths },
      },
    });
    for (const scene of ['headerless', 'rtl']) {
      await mount(scene, rail());
      const separator = q('[data-part="preview-rail-resize"]')!;
      log.push(`${scene}:${separator.getAttribute('role')}:${separator.getAttribute('aria-label')}:${separator.getAttribute('aria-valuenow')}`);
      fireEvent.keyDown(separator, { key: 'ArrowLeft' });
      fireEvent.keyDown(separator, { key: 'ArrowRight' });
      cleanup();
      await settle();
    }

    await mount('legacy');
    const toolbar = q('.ds-pattern-list-toolbar')!;
    const cards = [...toolbar.querySelectorAll<HTMLElement>('[aria-label]')]
      .find((node) => /card/i.test(node.getAttribute('aria-label') ?? '') && node.tagName !== 'DIV');
    log.push(`view:${q('[data-part="root"]')?.getAttribute('data-view-mode')}`);
    if (cards) fireEvent.click(cards);
    await settle();
    log.push(`view:${q('[data-part="root"]')?.getAttribute('data-view-mode')}`);
    cleanup();
    await settle();

    await mount('headerless', { behavior: {} });
    const names = () => [...document.querySelectorAll('[data-part="collection"] tbody tr')]
      .map((row) => row.textContent?.match(/Alice|Bob|Cleo/)?.[0]).join(',');
    log.push(`sort:${names()}`);
    const header = screen.getAllByRole('columnheader').find((node) => /Name/.test(node.textContent ?? ''))!;
    fireEvent.click(header.querySelector('button') ?? header);
    await settle();
    log.push(`sort:${names()}`);
    fireEvent.click(header.querySelector('button') ?? header);
    await settle();
    log.push(`sort:${names()}`);
    cleanup();
    await settle();

    await mount('dropdown');
    fireEvent.click(filterToggle());
    const dialog = await screen.findByRole('dialog', { name: 'Advanced filters' });
    const input = within(dialog).getAllByRole('textbox')[0];
    fireEvent.change(input, { target: { value: 'Bo' } });
    await settle();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Apply filters' }));
    await settle();
    log.push(`filter:${filterToggle().getAttribute('aria-label')}:${filterToggle().getAttribute('aria-expanded')}`);
    cleanup();
    await settle();

    const onFocusChange = vi.fn((key: string | null) => log.push(`focus:${key}`));
    await mount('phone', {
      behavior: { focus: { enabled: true, focusedKey: null, onFocusChange }, previewRail: preview('sheet') },
    });
    log.push(`compact:${screen.queryByRole('dialog', { name: 'Probe details' }) ? 'open' : 'closed'}`);
    const card = within(q('[data-part="collection"]')!).getAllByText('Alice')[0];
    fireEvent.click(card);
    await settle();
    log.push(`compact:${screen.queryByRole('dialog', { name: 'Probe details' }) ? 'open' : 'closed'}`);
    cleanup();
    await settle();

    const onColumnsChange = vi.fn((visible: string[], ordered: string[]) => log.push(`columns:${visible}|${ordered}`));
    await mount('headerless', {
      controls: { columnSettings: { enabled: true, onColumnsChange } },
    });
    fireEvent.click(screen.getByRole('button', { name: /^Columns:/ }));
    const reset = await screen.findByRole('button', { name: 'Reset' });
    fireEvent.click(reset);
    await settle();
    expect(log).toContain('width:404');
    expect(log).toContain('width:356');
    pinned('p3c', log);
  });

  it('P4 node/focus/key identity across equal-props rerender, keyed reorder and the shared Popover anchor', async () => {
    const result: Record<string, unknown> = {};
    const premium = {
      contextSlot: <div>Context slot</div>,
      header: { title: 'Identity' },
      controls: {
        filters: FILTERS,
        scopes: { enabled: true, scopes: [{ key: 'all', label: 'All' }, { key: 'mine', label: 'Mine' }], activeScope: 'all', onScopeChange: noop },
      },
      adaptive: { desktop: { filters: 'dropdown' } },
    };
    const sets = (order: string[]) => order.map((key) => ({ key, label: `Set ${key}`, onClick: noop }));
    const identity = (order: string[]) => ({
      ...premium,
      behavior: {
        focus: { enabled: true, focusedKey: '2', onFocusChange: noop },
        selection: { enabled: true, selectedKeys: ['1'], onModeChange: noop },
        smartSelection: sets(order),
        previewRail: preview('rail'),
      },
    });
    const view = await mount('headerless', identity(['a', 'b', 'clear']));
    const grab = () => ({
      utilities: filterToggle(),
      views: q('[data-part="views-strip"]'),
      context: q('[data-part="context-slot"]'),
      smartA: screen.getByRole('button', { name: 'Set a' }),
      rail: q('[data-part="preview-rail"]'),
    });
    const first = grab();
    first.utilities.focus();
    view.rerender(element('headerless', identity(['a', 'b', 'clear'])));
    await settle();
    const second = grab();
    result.premiumSame = Object.fromEntries(Object.keys(first).map((k) => [k, (first as Record<string, unknown>)[k] === (second as Record<string, unknown>)[k]]));
    result.premiumFocus = document.activeElement === first.utilities;
    expect(result.premiumSame).toEqual({ utilities: true, views: true, context: true, smartA: true, rail: true });
    expect(result.premiumFocus).toBe(true);
    view.rerender(element('headerless', identity(['b', 'a', 'clear'])));
    await settle();
    result.smartKeyFollows = screen.getByRole('button', { name: 'Set a' }) === first.smartA;
    result.smartOrder = [...document.querySelectorAll('[data-part="smart-selection"] button')].map((n) => n.textContent).join(',');

    fireEvent.click(first.utilities);
    const popover = await screen.findByRole('dialog', { name: 'Advanced filters' });
    within(popover).getByRole('button', { name: 'Apply filters' }).focus();
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Advanced filters' })).toBeNull());
    await settle();
    result.utilitiesAnchor = document.activeElement === first.utilities;
    cleanup();
    await settle();

    const legacy = await mount('legacy');
    const legacyButton = screen.getByRole('button', { name: 'Advanced filters' });
    legacy.rerender(element('legacy'));
    await settle();
    result.legacySame = screen.getByRole('button', { name: 'Advanced filters' }) === legacyButton;
    fireEvent.click(legacyButton);
    const legacyPopover = await screen.findByRole('dialog', { name: 'Advanced filters' });
    within(legacyPopover).getByRole('button', { name: 'Apply filters' }).focus();
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Advanced filters' })).toBeNull());
    await settle();
    result.legacyAnchor = document.activeElement === legacyButton;
    cleanup();
    await settle();

    const actions = (order: string[]) => ({
      header: {
        title: 'Phone',
        quickActions: order.map((key) => ({ key, label: `Action ${key}`, onClick: noop })),
      },
    });
    const phone = await mount('phone', actions(['add', 'matching', 'export']));
    const dock = screen.getByRole('button', { name: 'More actions' });
    const sheetContent = q('[data-part="preview-sheet-content"]');
    fireEvent.click(dock);
    const sheet = await screen.findByRole('dialog', { name: 'More actions' });
    const matching = within(sheet).getByRole('button', { name: 'Action matching' });
    phone.rerender(element('phone', actions(['add', 'export', 'matching'])));
    await settle();
    result.dockSame = screen.getByRole('button', { name: 'More actions' }) === dock;
    result.sheetContentSame = q('[data-part="preview-sheet-content"]') === sheetContent;
    result.actionKeyFollows = within(screen.getByRole('dialog', { name: 'More actions' })).getByRole('button', { name: 'Action matching' }) === matching;

    expect(result).toEqual({
      premiumSame: { utilities: true, views: true, context: true, smartA: true, rail: true },
      premiumFocus: true,
      smartKeyFollows: true,
      smartOrder: 'Set b,Set a,Set clear',
      utilitiesAnchor: true,
      legacySame: true,
      legacyAnchor: true,
      dockSame: true,
      sheetContentSame: true,
      actionKeyFollows: true,
    });
    pinned('p4', result);
  });
});
