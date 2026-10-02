/**
 * The consumer side of the shell and dock class canon (WO-FAM-11).
 *
 * WHY IT EXISTS. The `ds-` spelling of the AppShell and ActionDock anatomy is
 * validated here, in a consumer the DS owns, rather than in the apps after a
 * bump. `app/shell-page.tsx` renders the three chrome components through the
 * guaranteed root barrel and `app/shell-overrides.css` carries the four
 * selectors the apps author against that anatomy, rewritten to `ds-`.
 *
 * TWO ARMS, ONE SET OF ASSERTIONS. The source arm reads the package name the
 * way the rest of this fixture does. The packed arm installs the `npm pack`
 * tarball through the consumer-proof gate's own installer and repoints the
 * package name at the tarball's export-map entry, so the same page renders
 * from the artifact a registry would receive.
 *
 * THE WINDOW IS A PIN, NOT A HOPE. While the dual-class window is open both
 * spellings exist, and `CLASS_WINDOW` records exactly what the old spelling
 * still reaches. The retirement lot empties it; every assertion below then
 * becomes the proof that no superseded class is stamped or selected.
 */

import { execFileSync } from 'node:child_process';
import { readFileSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import postcss, { type Rule } from 'postcss';
import { createElement, type ComponentType, type ReactNode } from 'react';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { mockMatchMedia } from '@tests/support/browser/match-media';

const PACKAGE_ROOT = resolve(__dirname, '../../..');
const OVERRIDES = resolve(__dirname, 'app/shell-overrides.css');
const temporary: string[] = [];
const CONSUMER_PROOF_GATE = resolve(PACKAGE_ROOT, 'scripts/check/consumer-proof/index.mjs');
/** A superseded class name, and every one of them inside a stylesheet. */
const SUPERSEDED_NAME = /^rottay-(?:app-shell|action-dock)(?:$|__|--)/;
const SUPERSEDED_IN_TEXT = /\brottay-(?:app-shell|action-dock)[\w-]*/g;

/**
 * The dual-class window is RETIRED (WO-FAM-11 L2, 2026-10-02): no superseded
 * spelling is stamped, selected or dock-only. These three lists stay as the
 * standing proof — a legacy class returning to the corpus reds this suite.
 */
const CLASS_WINDOW = {
  /** Superseded classes still stamped beside their `ds-` twin. */
  emitted: [] as readonly string[],
  /** Superseded classes the packed `styles.css` still selects. */
  selected: [] as readonly string[],
  /**
   * Docks stamped with the superseded spelling ONLY. StepWizard's sticky dock
   * hand-builds the dock anatomy without the `ds-` twin, so no canonical app
   * selector reaches it until the retirement lot migrates it.
   */
  legacyOnlyDocks: [] as readonly string[],
} as const;

/** The classes the Modern skins select by name; every other anatomy hook is read by `data-part`. */
const PAINTED_BY_CLASS = [
  'ds-action-dock',
  'ds-action-dock__action',
  'ds-action-dock__actions',
  'ds-action-dock__overflow',
  'ds-action-dock__overflow-trigger',
  'ds-app-shell',
  'ds-app-shell__navigation-drawer',
  'ds-app-shell__navigation-drawer-body',
  'ds-app-shell__navigation-drawer-logo',
] as const;

interface Placement {
  readonly canonical: string;
  readonly where: string;
  readonly holds: (element: Element) => boolean;
}

const part = (...names: string[]) => (element: Element) =>
  names.includes(element.getAttribute('data-part') ?? '');

/** The substitute contract: every canonical class and the node it must land on. */
const PLACEMENTS: readonly Placement[] = [
  { canonical: 'ds-app-shell', where: 'data-part=root', holds: part('root') },
  { canonical: 'ds-app-shell__skip-link', where: 'data-part=skip-link', holds: part('skip-link') },
  { canonical: 'ds-app-shell__navigation-sidebar', where: 'data-part=navigation-sidebar', holds: part('navigation-sidebar') },
  { canonical: 'ds-app-shell__navigation-logo', where: 'data-part=navigation-logo', holds: part('navigation-logo') },
  { canonical: 'ds-app-shell__navigation-body', where: 'data-part=navigation-body', holds: part('navigation-body') },
  { canonical: 'ds-app-shell__navigation-footer', where: 'data-part=navigation-footer', holds: part('navigation-footer') },
  {
    canonical: 'ds-app-shell__navigation-drawer',
    where: 'the drawer dialog surface',
    holds: (element) => part('surface')(element) && element.getAttribute('role') === 'dialog',
  },
  {
    canonical: 'ds-app-shell__navigation-drawer-body',
    where: 'the drawer body, inside the drawer',
    holds: (element) =>
      part('body')(element) && element.closest('.ds-app-shell__navigation-drawer') !== null,
  },
  { canonical: 'ds-app-shell__navigation-drawer-header', where: 'data-part=navigation-drawer-header', holds: part('navigation-drawer-header') },
  {
    canonical: 'ds-app-shell__navigation-drawer-logo',
    where: 'the first child of the drawer header',
    holds: (element) => part('navigation-drawer-header')(element.parentElement as Element),
  },
  { canonical: 'ds-app-shell__navigation-close', where: 'data-part=navigation-close', holds: part('navigation-close') },
  { canonical: 'ds-app-shell__navigation-trigger', where: 'data-part=navigation-trigger', holds: part('navigation-trigger') },
  { canonical: 'ds-app-shell__main', where: 'data-part=main-area', holds: part('main-area') },
  { canonical: 'ds-app-shell__header', where: 'data-part=header', holds: part('header') },
  { canonical: 'ds-app-shell__header-slot', where: 'data-part=header-left|center|right', holds: part('header-left', 'header-center', 'header-right') },
  { canonical: 'ds-app-shell__header-slot--center', where: 'data-part=header-center', holds: part('header-center') },
  { canonical: 'ds-app-shell__header-slot--right', where: 'data-part=header-right', holds: part('header-right') },
  { canonical: 'ds-app-shell__content', where: 'data-part=content', holds: part('content') },
  { canonical: 'ds-app-shell__footer', where: 'data-part=footer', holds: part('footer') },
  {
    canonical: 'ds-action-dock',
    where: 'a dock toolbar root',
    holds: (element) => part('root')(element) && element.getAttribute('role') === 'toolbar',
  },
  {
    canonical: 'ds-action-dock__actions',
    where: 'the child row of a canonical dock',
    holds: (element) => element.parentElement?.classList.contains('ds-action-dock') === true,
  },
  {
    canonical: 'ds-action-dock__action',
    where: 'a button in the actions row',
    holds: (element) => element.tagName === 'BUTTON' && element.closest('.ds-action-dock__actions') !== null,
  },
  {
    canonical: 'ds-action-dock__overflow',
    where: 'the row item holding the overflow trigger',
    holds: (element) => element.querySelector('.ds-action-dock__overflow-trigger') !== null,
  },
  {
    canonical: 'ds-action-dock__overflow-trigger',
    where: 'the more-actions button',
    holds: (element) =>
      element.tagName === 'BUTTON' &&
      element.getAttribute('data-testid') === 'record-dock-overflow' &&
      element.closest('.ds-action-dock__overflow') !== null,
  },
];

// ── reading the app stylesheet ─────────────────────────────────────────────

function overrideSelectors(): string[] {
  const selectors: string[] = [];
  postcss.parse(readFileSync(OVERRIDES, 'utf8')).walkRules((rule: Rule) => {
    selectors.push(...rule.selectors.map((selector) => selector.replace(/\s+/g, ' ').trim()));
  });
  return selectors;
}

/** The selector the app authored before migrating: the same text in the old spelling. */
function supersededTwin(selector: string): string {
  return selector.replace(/\.ds-(app-shell|action-dock)/g, '.rottay-$1');
}

function splitTop(list: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const char of list) {
    if (char === '(') depth += 1;
    if (char === ')') depth -= 1;
    if (char === ',' && depth === 0) {
      parts.push(current.trim());
      current = '';
    } else current += char;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

/** [ids, classes|attributes|pseudo-classes, types] for the selector forms an app writes. */
function specificity(selector: string): [number, number, number] {
  const total: [number, number, number] = [0, 0, 0];
  let rest = selector;
  for (;;) {
    const match = /:(is|not|has|where)\(/.exec(rest);
    if (!match) break;
    let depth = 1;
    let end = match.index + match[0].length;
    while (depth > 0 && end < rest.length) {
      if (rest[end] === '(') depth += 1;
      if (rest[end] === ')') depth -= 1;
      end += 1;
    }
    const inner = rest.slice(match.index + match[0].length, end - 1);
    if (match[1] !== 'where') {
      const widest = splitTop(inner)
        .map(specificity)
        .sort((a, b) => b[0] - a[0] || b[1] - a[1] || b[2] - a[2])[0];
      for (const index of [0, 1, 2] as const) total[index] += widest[index];
    }
    rest = `${rest.slice(0, match.index)} ${rest.slice(end)}`;
  }
  rest = rest.replace(/\[[^\]]*\]/g, () => {
    total[1] += 1;
    return ' ';
  });
  total[0] += (rest.match(/#[\w-]+/g) ?? []).length;
  total[1] += (rest.match(/\.[\w-]+/g) ?? []).length;
  total[1] += (rest.match(/(?<!:):[\w-]+/g) ?? []).length;
  total[2] += (rest.match(/::[\w-]+/g) ?? []).length;
  total[2] += (rest.replace(/[.#:][\w-]+/g, ' ').match(/(?:^|[\s>+~])([a-z][\w-]*)/gi) ?? []).length;
  return total;
}

function canonicalClassesOf(selector: string): string[] {
  return [...new Set([...selector.matchAll(/\.(ds-(?:app-shell|action-dock)[\w-]*)/g)].map((m) => m[1]))];
}

// ── rendering the page from one arm ────────────────────────────────────────

interface Arm {
  readonly name: 'source' | 'packed';
  /** The URL the package name resolves to; null keeps the fixture's own alias. */
  entry: string | null;
  styles: string | null;
  /** The `AppShell` binding the page resolved, to prove which artifact rendered. */
  appShell?: unknown;
}

const ARMS: Arm[] = [
  { name: 'source', entry: null, styles: null },
  { name: 'packed', entry: null, styles: null },
];

async function loadPage(arm: Arm) {
  vi.resetModules();
  vi.doUnmock('@rottay/design-system');
  if (arm.entry) {
    const entry = arm.entry;
    vi.doMock('@rottay/design-system', () => import(/* @vite-ignore */ entry));
  }
  // Sequential on purpose: a module mocked mid-import can bind one importer to
  // the mock and its sibling to the original.
  const designSystem = await import('@rottay/design-system');
  const { default: ShellPage } = await import('./app/shell-page');
  const { default: Providers } = await import('./app/providers');
  arm.appShell = designSystem.AppShell;
  return { ShellPage, Providers: Providers as ComponentType<{ children: ReactNode }> };
}

interface Observation {
  readonly classes: Set<string>;
  readonly misplaced: string[];
  readonly legacyOnlyDocks: Set<string>;
  /** Per rewritten selector: the canonical classes its matched subjects carry. */
  readonly carried: Map<string, Set<string>>;
  readonly twinFindings: string[];
}

function observe(observation: Observation, width: number) {
  for (const element of document.body.querySelectorAll('*')) {
    for (const name of element.classList) observation.classes.add(name);
  }
  for (const dock of document.querySelectorAll('[role="toolbar"][data-part="root"]')) {
    if (dock.classList.contains('rottay-action-dock') && !dock.classList.contains('ds-action-dock')) {
      observation.legacyOnlyDocks.add(dock.getAttribute('data-testid') ?? '<unnamed>');
    }
  }
  for (const placement of PLACEMENTS) {
    for (const element of document.querySelectorAll(`.${placement.canonical}`)) {
      if (!placement.holds(element)) {
        observation.misplaced.push(`${width}px: .${placement.canonical} is not on ${placement.where}`);
      }
    }
  }
  for (const selector of overrideSelectors()) {
    const matched = [...document.querySelectorAll(selector)];
    const carried = observation.carried.get(selector) ?? new Set<string>();
    observation.carried.set(selector, carried);
    for (const node of matched) {
      for (const name of canonicalClassesOf(selector)) if (node.classList.contains(name)) carried.add(name);
    }
    // The old spelling reaches exactly the new one's nodes while its names are
    // pinned, and nothing once they leave the pin. The twin inherits the
    // selector's non-DS arms (the fixture's own classes), so the measurement is
    // the nodes carrying a superseded CLASS, not the selector's whole reach.
    const twin = supersededTwin(selector);
    const twinMatched = [...document.querySelectorAll(twin)].filter((node) =>
      /\brottay-(?:app-shell|action-dock)/.test(node.className),
    );
    const twinEmitted = canonicalClassesOf(selector).every((name) =>
      (CLASS_WINDOW.emitted as readonly string[]).includes(name.replace(/^ds-/, 'rottay-')),
    );
    const expected = twinEmitted ? matched : [];
    if (twinMatched.length !== expected.length || twinMatched.some((node, index) => node !== expected[index])) {
      observation.twinFindings.push(
        `${width}px: ${twin} reaches ${twinMatched.length} nodes, expected ${expected.length}`,
      );
    }
  }
}

/** Desktop mounts the sidebar; a phone mounts the trigger, the open drawer and the overflow. */
async function renderPage(arm: Arm): Promise<Observation> {
  const observation: Observation = {
    classes: new Set(),
    misplaced: [],
    legacyOnlyDocks: new Set(),
    carried: new Map(),
    twinFindings: [],
  };
  for (const width of [1440, 390]) {
    mockMatchMedia(width);
    const { ShellPage, Providers } = await loadPage(arm);
    render(createElement(Providers, null, createElement(ShellPage)));
    await waitFor(() => {
      expect(document.querySelector('[data-testid="step-wizard-action-dock"]')).not.toBeNull();
      expect(document.querySelector('[data-testid="record-dock"]')).not.toBeNull();
    });
    if (width < 640) {
      const trigger = await waitFor(() => {
        const found = document.querySelector('[data-part="navigation-trigger"]');
        expect(found).not.toBeNull();
        return found as HTMLElement;
      });
      fireEvent.click(trigger);
      await waitFor(() => {
        expect(document.querySelector('[role="dialog"]')).not.toBeNull();
        expect(document.querySelector('[data-testid="record-dock-overflow"]')).not.toBeNull();
      });
    }
    observe(observation, width);
    cleanup();
  }
  return observation;
}

beforeAll(async () => {
  document.documentElement.setAttribute('data-anatomy-sidebar', 'panel');
  // The gate's shebang is not transformable, so its installer runs in a child
  // Node; the child drops its exit cleanup and afterAll removes both roots.
  const installed = JSON.parse(
    execFileSync(
      process.execPath,
      [
        '--input-type=module',
        '-e',
        [
          `const gate = await import(${JSON.stringify(pathToFileURL(CONSUMER_PROOF_GATE).href)});`,
          `const root = ${JSON.stringify(PACKAGE_ROOT)};`,
          'const tarball = gate.packPackage(root);',
          'const { workspace, packedRoot } = gate.installPackedConsumer({ packageRoot: root, tarball });',
          "process.removeAllListeners('exit');",
          'console.log(JSON.stringify({ tarball, workspace, packedRoot }));',
        ].join('\n'),
      ],
      { cwd: PACKAGE_ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
    )
      .trim()
      .split('\n')
      .pop() as string,
  ) as { tarball: string; workspace: string; packedRoot: string };
  temporary.push(dirname(installed.tarball), installed.workspace);
  const { packedRoot } = installed;
  const manifest = JSON.parse(readFileSync(join(packedRoot, 'package.json'), 'utf8')) as {
    exports: Record<string, { import?: string }>;
  };
  const packed = ARMS[1];
  packed.entry = pathToFileURL(join(packedRoot, manifest.exports['.'].import as string)).href;
  packed.styles = readFileSync(join(packedRoot, 'dist/styles.css'), 'utf8');
}, 180_000);

afterEach(() => {
  cleanup();
});

afterAll(() => {
  for (const directory of temporary) rmSync(directory, { recursive: true, force: true });
});

describe('the app stylesheet is the substitute contract', () => {
  it('rewrites exactly four selectors, each at the specificity of the spelling it replaces', () => {
    const selectors = overrideSelectors();
    expect(selectors).toHaveLength(4);
    for (const selector of selectors) {
      expect(selector).not.toMatch(SUPERSEDED_IN_TEXT);
      expect(canonicalClassesOf(selector).length).toBeGreaterThan(0);
      expect({ selector, specificity: specificity(selector) }).toEqual({
        selector,
        specificity: specificity(supersededTwin(selector)),
      });
    }
  });

  it('computes specificity the way the cascade does for these forms', () => {
    expect(specificity(':is(.a, .b)')).toEqual([0, 1, 0]);
    expect(specificity('[data-x="y"] :is(.a, .b)')).toEqual([0, 2, 0]);
    expect(specificity('.a.b[data-part="root"][data-mode="fixed"]')).toEqual([0, 4, 0]);
    expect(specificity(':where(.a) .b')).toEqual([0, 1, 0]);
  });
});

describe.each(ARMS)('the $name design system under the consumer page', (arm) => {
  let observation: Observation;

  beforeAll(async () => {
    observation = await renderPage(arm);
  }, 120_000);

  it('renders from its own artifact', () => {
    expect(arm.appShell).toBeTypeOf('function');
    if (arm.name === 'packed') expect(arm.appShell).not.toBe(ARMS[0].appShell);
  });

  it('lands every canonical class, and only on the node the contract names', () => {
    expect(
      PLACEMENTS.map((placement) => placement.canonical).filter((name) => !observation.classes.has(name)),
    ).toEqual([]);
    expect(observation.misplaced).toEqual([]);
  });

  it('reaches, with every rewritten selector, a node carrying each canonical class it names', () => {
    const unreached = overrideSelectors().flatMap((selector) =>
      canonicalClassesOf(selector)
        .filter((name) => !observation.carried.get(selector)?.has(name))
        .map((name) => `${selector} never reaches .${name}`),
    );
    expect(unreached).toEqual([]);
  });

  it('stamps the superseded spelling only within the window pin', () => {
    expect([...observation.classes].filter((name) => SUPERSEDED_NAME.test(name)).sort()).toEqual(
      [...CLASS_WINDOW.emitted].sort(),
    );
    expect([...observation.legacyOnlyDocks].sort()).toEqual([...CLASS_WINDOW.legacyOnlyDocks]);
    expect(observation.twinFindings).toEqual([]);
  });
});

describe('the packed stylesheet', () => {
  it('selects the canonical spelling of every class the DS paints by class, and the superseded one only within the pin', () => {
    const styles = ARMS[1].styles as string;
    const canonical = new Set(
      [...styles.matchAll(/\.(ds-(?:app-shell|action-dock)[\w-]*)/g)].map((match) => match[1]),
    );
    expect(PAINTED_BY_CLASS.filter((name) => !canonical.has(name))).toEqual([]);
    expect([...new Set(styles.match(SUPERSEDED_IN_TEXT) ?? [])].sort()).toEqual(
      [...CLASS_WINDOW.selected].sort(),
    );
    expect(
      CLASS_WINDOW.selected.filter(
        (name) => !(PAINTED_BY_CLASS as readonly string[]).includes(name.replace(/^rottay-/, 'ds-')),
      ),
    ).toEqual([]);
  });
});
