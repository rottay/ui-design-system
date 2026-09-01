/**
 * The touch-target contract — ONE suite over ONE authority.
 *
 * Assertions COME FROM mechanical discovery applied to the real modern skin
 * directory and the real production TSX tree, never from a curated list. A
 * new interactive selector or a new `<div onClick>` fails here until it is
 * floored or carries a written adjudication; an adjudication whose target
 * disappears fails as stale.
 *
 * The retired per-FILE census (`auditTouchTargetFloors` +
 * `TOUCH_TARGET_EXEMPTIONS`) is gone with its describe block. It could absolve
 * a whole skin because one control in it was floored, and its exemptions
 * silently covered controls added long afterwards.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  auditTouchTargetsMechanical,
  discoverSharedFloors,
  discoverTouchSurface,
  discoverTsxTouchTargets,
  expandSelectorBranches,
  proveCoverage,
  proveTsxCoverage,
  resolveSkinFilesForTsx,
  type SourceFile,
  type TouchAdjudication,
} from '..';

const SKIN_DIR = resolve(
  process.cwd(),
  'src/foundation/tokens/css/runtime/engines/modern/skin'
);

const UI_DIR = resolve(process.cwd(), 'src/components');

function loadSkins(): SourceFile[] {
  return walkCss(SKIN_DIR).map((path) => ({
      name: path.slice(SKIN_DIR.length + 1),
      content: readFileSync(path, 'utf8'),
    }));
}

function walkCss(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) walkCss(path, out);
    else if (entry.endsWith('.css')) out.push(path);
  }
  return out;
}

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) walk(path, out);
    else if (
      entry.endsWith('.tsx') &&
      !entry.includes('.test.') &&
      !entry.includes('.stories.')
    ) {
      out.push(path);
    }
  }
  return out;
}

/** Modern engine implementations plus every structure and surface. */
function loadTsxSources(): SourceFile[] {
  const root = process.cwd();
  return walk(UI_DIR)
    .filter(
      (path) =>
        path.includes(`${join('engines', 'modern')}${'/'}`) ||
        path.includes(join('src', 'components', 'structures')) ||
        path.includes(join('src', 'components', 'surfaces'))
    )
    .map((path) => ({
      name: path.slice(root.length + 1),
      content: readFileSync(path, 'utf8'),
    }));
}

/**
 * The OTHER half of the 44px law: one unlayered coarse block in base.css that
 * floors every button/anchor/select/summary and six roles at once. Reading
 * only the skins would file false debt against controls it already floors.
 */
function loadSharedFloorSources(): SourceFile[] {
  const name = 'src/foundation/tokens/css/facade/entrypoints/base/index.css';
  return [{ name, content: readFileSync(resolve(process.cwd(), name), 'utf8') }];
}

function loadAdjudications(): TouchAdjudication[] {
  return JSON.parse(
    readFileSync(
      resolve(process.cwd(), 'scripts/check/touch-targets/adjudications/index.json'),
      'utf8'
    )
  ).rows;
}

const SUBSTANTIVE = 'a written reason long enough to count as an adjudication';

describe('touch-target authority (mechanical discovery, single table)', () => {
  it('discovers a real corpus in BOTH sources (positive control)', () => {
    const skins = loadSkins();
    const tsx = loadTsxSources();
    // An empty census would mean a path rotted, not that the engine stopped
    // being interactive. Assert the inputs before trusting any zero below.
    expect(skins.length).toBeGreaterThanOrEqual(100);
    expect(tsx.length).toBeGreaterThanOrEqual(200);
    const { targets, floors } = discoverTouchSurface(skins);
    expect(targets.length).toBeGreaterThanOrEqual(200);
    expect(floors.length).toBeGreaterThanOrEqual(150);
    expect(discoverTsxTouchTargets(tsx).length).toBeGreaterThanOrEqual(200);
    // The shared half of the law is really being read, not silently empty.
    const shared = discoverSharedFloors(loadSharedFloorSources());
    expect(shared).toContain('button');
    expect(shared).toContain('summary');
    expect(shared.length).toBeGreaterThanOrEqual(10);
    // ...and it deliberately does NOT claim the indicator/virtualized roles,
    // which stay component-owned. If it ever did, this census would stop
    // holding sliders and switches to their own skins.
    for (const role of ['checkbox', 'radio', 'switch', 'slider', 'option', 'row']) {
      expect(shared, role).not.toContain(`[role="${role}"]`);
    }
  });

  it('every discovered target is proven floored or adjudicated; zero violations', () => {
    const result = auditTouchTargetsMechanical(
      loadSkins(),
      loadAdjudications(),
      loadTsxSources(),
      loadSharedFloorSources()
    );
    expect(result.violations).toEqual([]);
    expect(result.targets).toBeGreaterThanOrEqual(200);
    expect(result.proven).toBeGreaterThanOrEqual(140);
    expect(result.tsxTargets).toBeGreaterThanOrEqual(200);
    // The TSX prover is not vacuous: it really matches skins to elements.
    expect(result.tsxProven).toBeGreaterThanOrEqual(50);
    // Every class of interactivity is represented, so no discovery arm is dead.
    for (const key of [
      'css-native',
      'css-role',
      'css-pointer',
      'tsx-native',
      'tsx-role',
      'tsx-handler',
    ] as const) {
      expect(result.byClass[key], key).toBeGreaterThan(0);
    }
    // `ancestor` is absent by construction — a floored container is not proof.
    expect(Object.keys(result.byRelation).sort()).toEqual([
      'after-idiom',
      'equal',
      'shared-base',
      'structural',
    ]);
  });

  it('declares the single canonical channel exactly once in the default theme', () => {
    const theme = readFileSync(
      resolve(process.cwd(), 'src/foundation/tokens/css/foundation/themes/default/index.css'),
      'utf8'
    );
    expect(theme.match(/--ds-touch-target-min:\s*44px/g) ?? []).toHaveLength(1);
  });

  it('component touch hooks inherit the canonical floor', () => {
    for (const [skin, hook] of [
      ['filter-builder', '--ds-filter-builder-touch-target-min'],
      ['environment-toggle', '--ds-environment-toggle-touch-target'],
    ] as const) {
      const css = readFileSync(join(SKIN_DIR, skin, 'index.css'), 'utf8');
      expect(css).toContain(`${hook},\n      var(--ds-touch-target-min, 44px)`);
    }
  });

  it('the real table is well formed on every row', () => {
    for (const row of loadAdjudications()) {
      expect(['exempt', 'debt'], row.key).toContain(row.kind);
      expect(row.reason.trim().length, row.key).toBeGreaterThanOrEqual(20);
      if (row.kind === 'debt') expect(row.owner, row.key).toBeTruthy();
    }
  });
});

describe('touch-target negative drills (each fails for a NAMED cause)', () => {
  it('resolves folder-index skins without weakening ambiguous affix matching', () => {
    const file = 'src/components/primitives/inputs/qr-code/engines/modern/index.tsx';
    expect(resolveSkinFilesForTsx(file, ['qrcode/index.css'])).toEqual([
      'qrcode/index.css',
    ]);

    const modal = 'src/components/primitives/overlay/modal/engines/modern/index.tsx';
    expect(resolveSkinFilesForTsx(modal, ['overlay-modal/index.css'])).toEqual([
      'overlay-modal/index.css',
    ]);
    expect(
      resolveSkinFilesForTsx(modal, [
        'overlay-modal/index.css',
        'fullscreen-modal/index.css',
      ])
    ).toEqual([]);
  });

  it('drill i: a native `button` rule with no floor fails as css-native', () => {
    const skin = [{ name: 'f.css', content: '.f--modern button { color: red; }' }];
    const result = auditTouchTargetsMechanical(skin, []);
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0]).toContain('interactive target WITHOUT proof');
    expect(result.violations[0]).toContain('[css-native]');

    // The shared floor is a SCOPED proof, not a blanket amnesty: it clears the
    // button it names, and only because it names it.
    const shared = [
      {
        name: 'base.css',
        content:
          '@media (pointer: coarse) { button { min-height: var(--ds-touch-target-min); } }',
      },
    ];
    expect(auditTouchTargetsMechanical(skin, [], [], shared).violations).toEqual([]);
    expect(
      auditTouchTargetsMechanical(
        [{ name: 'f.css', content: ".f--modern [data-part='x'] { cursor: pointer; }" }],
        [],
        [],
        shared
      ).violations
    ).toHaveLength(1);
  });

  it("drill ii: a [role='button'] rule with no floor fails as css-role", () => {
    const result = auditTouchTargetsMechanical(
      [{ name: 'f.css', content: ".f--modern [role='button'] { color: red; }" }],
      []
    );
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0]).toContain('interactive target WITHOUT proof');
    expect(result.violations[0]).toContain('[css-role]');
  });

  it('drill iii: a TSX div with onClick and no adjudication fails', () => {
    const result = auditTouchTargetsMechanical([], [], [
      {
        name: 'src/components/structures/workspace/ghost/index.tsx',
        content:
          "export const G = () => <div data-part='fake-button' onClick={() => {}}>x</div>;",
      },
    ]);
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0]).toContain('TSX interactive element WITHOUT floor proof');
    expect(result.violations[0]).toContain('[tsx-handler]');
    expect(result.violations[0]).toContain("[data-part='fake-button']");
  });

  it('keyboard routers are not targets, but focusable fake buttons remain targets', () => {
    const [
      router,
      focusable,
      negativeTabIndex,
      conditionalNegativeTabIndex,
      conditionalFocusable,
      pointer,
      role,
    ] = [
      "<div data-part='router' onKeyDown={() => {}}>x</div>",
      "<div data-part='focusable' tabIndex={0} onKeyDown={() => {}}>x</div>",
      "<div data-part='programmatic' tabIndex={-1} onKeyDown={() => {}}>x</div>",
      "<div data-part='conditional-programmatic' tabIndex={interactive ? -1 : undefined} onKeyDown={() => {}}>x</div>",
      "<div data-part='conditional-focusable' tabIndex={enabled ? 0 : -1} onKeyDown={() => {}}>x</div>",
      "<div data-part='pointer' onClick={() => {}}>x</div>",
      "<div data-part='role' role='button' onKeyDown={() => {}}>x</div>",
    ];
    const rows = discoverTsxTouchTargets([
      {
        name: 'src/components/structures/workspace/ghost/index.tsx',
        content: `export const G = () => <>${router}${focusable}${negativeTabIndex}${conditionalNegativeTabIndex}${conditionalFocusable}${pointer}${role}</>;`,
      },
    ]);
    expect(rows.map((row) => row.discriminator).sort()).toEqual([
      "[data-part='conditional-focusable']",
      "[data-part='focusable']",
      "[data-part='pointer']",
      "[data-part='role']",
    ]);
    expect(rows.find((row) => row.discriminator.includes('focusable'))?.interaction).toBe(
      'tsx-handler'
    );
    expect(rows.find((row) => row.discriminator.includes('pointer'))?.interaction).toBe(
      'tsx-handler'
    );
    expect(rows.find((row) => row.discriminator.includes('role'))?.interaction).toBe(
      'tsx-role'
    );
  });

  it('a :where descendant floor cannot prove the container itself', () => {
    const css = `
      .tooltip[data-part='bubble'] { cursor: pointer; }
      @media (pointer: coarse) {
        .tooltip[data-part='bubble'] :where(button, [role='button']) {
          min-block-size: var(--ds-touch-target-min, 44px);
        }
      }`;
    expect(
      expandSelectorBranches(
        ".tooltip[data-part='bubble'] :where(button, [role='button'])"
      )
    ).toEqual([
      ".tooltip[data-part='bubble'] button",
      ".tooltip[data-part='bubble'] [role='button']",
    ]);
    expect(expandSelectorBranches('.text:is(a, button):where(:hover, :focus-visible)')).toEqual([
      'a.text:hover',
      'a.text:focus-visible',
      'button.text:hover',
      'button.text:focus-visible',
    ]);
    const result = auditTouchTargetsMechanical([{ name: 'tooltip/index.css', content: css }], []);
    expect(result.proven).toBe(2);
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0]).toContain(".tooltip[data-part='bubble'] [css-pointer]");
  });

  it('ancestor focus state does not promote a styled descendant to a target', () => {
    const rows = discoverTouchSurface([
      {
        name: 'f.css',
        content:
          ".table [data-part='row']:focus-visible :is([data-part='cell'], [data-part='actions']) { color: red; }",
      },
    ]).targets;
    expect(rows).toEqual([]);
  });

  it('drill iv: a floor on a SIBLING part does not cover its neighbour', () => {
    const css = `
      .f--modern [data-part='a'] { cursor: pointer; }
      .f--modern [data-part='b'] { cursor: pointer; }
      @media (pointer: coarse) {
        .f--modern [data-part='a'] { min-block-size: var(--ds-touch-target-min, 44px); }
      }`;
    const result = auditTouchTargetsMechanical([{ name: 'f.css', content: css }], []);
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0]).toContain("[data-part='b']");
    expect(result.proven).toBe(1);
  });

  it('drill v: a floor on an ANCESTOR does not cover the child hitbox', () => {
    const css = `
      .f--modern [data-part='row'] > [data-part='toggle'] { cursor: pointer; }
      @media (pointer: coarse) {
        .f--modern [data-part='row'] { min-block-size: var(--ds-touch-target-min, 44px); }
      }`;
    const result = auditTouchTargetsMechanical([{ name: 'f.css', content: css }], []);
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0]).toContain("[data-part='toggle']");
    // The relation is gone from the prover, not merely unreported.
    expect(
      proveCoverage(
        { file: 'f.css', selector: ".f--modern [data-part='row'] > [data-part='toggle']" },
        [{ file: 'f.css', selector: ".f--modern [data-part='row']", media: '(pointer: coarse)' }]
      )
    ).toBeNull();
  });

  it('drill vi: a floor inside a width media query proves nothing', () => {
    const css = `
      .f--modern [data-part='x'] { cursor: pointer; }
      @media (min-width: 640px) { .f--modern [data-part='x'] { min-block-size: 44px; } }`;
    const result = auditTouchTargetsMechanical([{ name: 'f.css', content: css }], []);
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0]).toContain("[data-part='x']");
  });

  it('drill vii: an adjudication whose target is gone fails as stale', () => {
    const result = auditTouchTargetsMechanical(
      [{ name: 'f.css', content: '.f { color: red; }' }],
      [{ key: 'f.css :: .f :: [data-part=\'gone\']', kind: 'exempt', reason: SUBSTANTIVE }]
    );
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0]).toContain('stale adjudication');
  });

  it('drill viii: a debt row without an owner fails, and a thin reason fails', () => {
    const css =
      ".f--modern [data-part='x'] { cursor: pointer; } .f--modern [data-part='y'] { cursor: pointer; }";
    const result = auditTouchTargetsMechanical(
      [{ name: 'f.css', content: css }],
      [
        { key: "f.css :: .f--modern :: [data-part='x']", kind: 'exempt', reason: 'nope' },
        { key: "f.css :: .f--modern :: [data-part='y']", kind: 'debt', reason: SUBSTANTIVE },
      ]
    );
    expect(result.violations.some((v) => v.includes('DEBT without owner'))).toBe(true);
    expect(result.violations.some((v) => v.includes('without substantive reason'))).toBe(true);
  });

  it('positive control: the same drills pass once the floor is on the RIGHT box', () => {
    const css = `
      .f--modern [data-part='toggle'] { cursor: pointer; }
      @media (pointer: coarse) {
        .f--modern [data-part='toggle'] { min-block-size: var(--ds-touch-target-min, 44px); }
      }`;
    const result = auditTouchTargetsMechanical([{ name: 'f.css', content: css }], []);
    expect(result.violations).toEqual([]);
    expect(result.proven).toBe(1);
    // ...and a TSX element is covered by its OWN skin's floor.
    const { floors } = discoverTouchSurface([{ name: 'f.css', content: css }]);
    expect(
      proveTsxCoverage(
        {
          file: 'src/components/primitives/inputs/F/engines/modern/index.tsx',
          element: 'button',
          discriminator: "[data-part='toggle']",
          interaction: 'tsx-native',
        },
        floors,
        ['f.css']
      )
    ).not.toBeNull();
  });
});
