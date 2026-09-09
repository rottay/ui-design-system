import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import test from 'node:test';

import {
  ARCHITECTURE_TIERS,
  CLASSIFIED_SUPPORT_ROOTS,
  LOCAL_LAYER_RANKS,
  SCOPED_OWNER_RANKS,
  UI_COMPONENT_BRANCH_RANKS,
  UI_LAYER_RANKS,
  auditCoreStructure,
  compareStructureBaseline,
  createStructureBaseline,
  isBarrelSource,
  parseCliArguments,
} from './index.mjs';
import { packageRoot as findPackageRoot } from '../../../../libraries/repo-root/index.mjs';

function write(path, source) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, source);
}

function fixture() {
  const packageRoot = mkdtempSync(resolve(tmpdir(), 'rottay-core-structure-'));
  const sourceRoot = resolve(packageRoot, 'src');
  write(resolve(packageRoot, 'package.json'), JSON.stringify({
    releaseSync: { sourceEntrypoints: { './public': 'public-entry.ts' } },
  }));
  write(resolve(sourceRoot, 'index.ts'), "export * from './feature';\n");
  write(resolve(sourceRoot, 'public-entry.ts'), "export * from './feature';\n");
  write(resolve(sourceRoot, 'feature/index.ts'), "export * from './Widget';\n");
  write(resolve(sourceRoot, 'feature/Widget.tsx'), 'export function Widget() { return <div />; }\n');
  write(resolve(sourceRoot, 'feature/columns.ts'), '/** Builds auto-generated headers for a table. */\nexport const columns = [];\n');
  write(resolve(sourceRoot, 'feature/timing.test.ts'), "import { Widget } from './Widget';\nvoid Widget;\n");
  write(resolve(sourceRoot, 'feature/engines/classic.tsx'), "import { shared } from './shared';\nexport const Classic = shared;\n");
  write(resolve(sourceRoot, 'feature/engines/modern.tsx'), 'export const Modern = () => <div />;\n');
  write(resolve(sourceRoot, 'feature/engines/shared.ts'), 'export const shared = () => null;\n');
  write(resolve(sourceRoot, 'feature/base/index.ts'), 'export const base = true;\n');
  write(resolve(sourceRoot, 'feature/derived/index.ts'), "import { base } from '../base';\nexport const derived = base;\n");
  write(resolve(sourceRoot, 'generated/GeneratedWidget.tsx'), '// @generated\nexport const GeneratedWidget = 1;\n');
  write(resolve(sourceRoot, 'feature/tests/nested.test.ts'), 'export {};\n');
  return { packageRoot, sourceRoot };
}

const TEST_TIERS = {
  foundation: ['base', 'derived'],
  fixture: ['feature', 'generated', 'layered'],
};

/**
 * A scoped-rank fixture only proves what it claims when every planted import
 * actually resolves. An unresolved specifier is silently dropped before the
 * peer rules run, so a typo would read as "no finding" — the same shape as a
 * granted permission.
 */
function assertEveryImportResolved(result) {
  assert.deepEqual(
    result.findings
      .filter(({ rule }) => rule === 'unresolved-local-import')
      .map(({ id }) => id),
    [],
  );
}

test('barrel classifier distinguishes aggregators from index implementations', () => {
  assert.equal(isBarrelSource("'use client';\nexport { Widget } from './Widget';\n"), true);
  assert.equal(isBarrelSource('export const Widget = () => null;\n'), false);
});

test('the CLI explicitly recognises the --check mode used by lint:folders', () => {
  assert.equal(parseCliArguments(['--check']).mode, 'check');
});

test('default macro roots match the governed graphics and UI taxonomy', () => {
  assert.deepEqual(Object.keys(ARCHITECTURE_TIERS), [
    'foundation',
    'contracts',
    'kernel',
    'tokens',
    'compilers',
    'infrastructure',
    'runtime',
    'graphics',
    'components',
  ]);
  assert.deepEqual(ARCHITECTURE_TIERS.foundation, [
    'behavior',
    'i18n',
    'presets',
  ]);
  assert.deepEqual(ARCHITECTURE_TIERS.graphics, [
    'icons',
    'marks',
    'motion',
    'pictograms',
  ]);
  assert.deepEqual(ARCHITECTURE_TIERS.components, [
    'primitives',
    'patterns',
    'structures',
    'surfaces',
  ]);
  assert.equal(Object.hasOwn(ARCHITECTURE_TIERS, 'composition'), false);
  assert.equal(Object.hasOwn(ARCHITECTURE_TIERS, 'entrypoints'), false);
  assert.deepEqual(CLASSIFIED_SUPPORT_ROOTS, ['entrypoints']);
  // D-21 (b): the first-level roots are admitted BY NAME, and the legacy
  // aggregate roots no longer claim them as flat destinations.
  for (const root of ['contracts', 'kernel', 'tokens', 'compilers', 'runtime']) {
    assert.equal(Object.hasOwn(ARCHITECTURE_TIERS, root), true);
    assert.equal(ARCHITECTURE_TIERS.foundation.includes(root), false);
    assert.equal(ARCHITECTURE_TIERS.infrastructure.includes(root), false);
  }
  assert.deepEqual(UI_LAYER_RANKS, {
    primitives: 0,
    patterns: 1,
    structures: 2,
    surfaces: 3,
  });
  // Mirrored in source order. Every entry here is proved load-bearing by a
  // causal test below; this literal only keeps the table reviewable in one
  // place, so it must stay complete rather than track the entries someone
  // happened to touch.
  assert.deepEqual(SCOPED_OWNER_RANKS, {
    'foundation/contracts': {
      ambient: 0,
      kernel: 0,
      runtime: 1,
      composition: 2,
    },
    'foundation/contracts/composition/tenants/themes': {
      iso: 0,
      provenance: 1,
      'tenant-theme': 2,
      intent: 3,
      resolved: 4,
      compiled: 5,
      emission: 6,
      'engine-adapter': 7,
    },
    foundation: { contracts: 0, presets: 1 },
    'foundation/i18n/runtime': { catalog: 0, resolution: 1 },
    'foundation/kernel': { color: 0, accessibility: 1 },
    'foundation/kernel/color': { contrast: 0, oklch: 1 },
    infrastructure: { compilers: 0, runtime: 1 },
    'infrastructure/compilers/runtime': { theme: 0, 'tenant-css': 1 },
    'graphics/icons': { glyphs: 0, semantic: 1 },
    'graphics/icons/glyphs': {
      foundation: 0,
      runtime: 1,
      presentation: 2,
    },
    'graphics/icons/semantic': {
      sources: 0,
      generated: 0,
      foundation: 1,
      runtime: 2,
      presentation: 3,
    },
    'graphics/icons/semantic/foundation': {
      registry: 0,
      contracts: 1,
      policy: 1,
      provenance: 1,
    },
    'infrastructure/runtime/foundation/root-attributes': {
      registry: 0,
      presentation: 1,
    },
    'infrastructure/compilers/runtime/theme/runtime/lowering/foundation': {
      contract: 0,
      ground: 0,
      shape: 0,
      intake: 0,
      materials: 0,
      palette: 0,
      tint: 0,
      'type-ramp': 0,
      'mode-overlay': 0,
      sidebar: 0,
      seeds: 0,
      expressive: 1,
      dial: 1,
      ramps: 1,
      typography: 1,
      chrome: 2,
      floors: 2,
      personality: 2,
      motion: 3,
    },
    'infrastructure/compilers/runtime/theme/runtime/lowering/runtime': {
      derivation: 0,
      pipeline: 1,
      'mode-blocks': 2,
    },
    'infrastructure/compilers/kernel/foundation/css/color-math': {
      'palette-derivations': 0,
      'readable-ink': 0,
      'interaction-floor': 1,
    },
    'entrypoints/eslint': { contracts: 0, rules: 1, plugin: 2 },
    'components/primitives/runtime/overlay': {
      'top-layer-host': 0,
      foundation: 0,
      'dialog-attributes': 0,
      'focus-management': 0,
      backdrop: 0,
      portal: 1,
      'portal-scope': 1,
      positioning: 1,
      'layer-stack': 1,
      'field-overlay': 2,
    },
    'components/primitives/feedback/toast/runtime/state': {
      'method-registry': 0,
      provider: 1,
    },
    'components/structures': { shell: 0, headers: 1 },
    'components/structures/shell': { 'surface-chrome': 0, navigation: 1 },
    'components/structures/workspace': {
      'connected-command-palette': 0,
      'search-command-bar': 1,
    },
    'components/structures/feedback/surface-lifecycle': {
      states: 0,
      'use-surface-state': 1,
    },
  });
  assert.deepEqual(UI_COMPONENT_BRANCH_RANKS, {
    foundation: 0,
    contracts: 0,
    runtime: 1,
    engines: 2,
    presentation: 3,
    compound: 4,
  });
  assert.equal(Object.hasOwn(LOCAL_LAYER_RANKS, 'engines'), false);
  assert.equal(Object.hasOwn(LOCAL_LAYER_RANKS, 'compound'), false);
});

test('every scoped owner and ranked child resolves to a real directory', () => {
  const sourceRoot = resolve(findPackageRoot(import.meta.dirname), 'src');
  const owners = Object.keys(SCOPED_OWNER_RANKS);
  const rankedChildren = owners.flatMap((owner) => (
    Object.keys(SCOPED_OWNER_RANKS[owner]).map((child) => `${owner}/${child}`)
  ));

  // Pinned before the loop: an entry silently deleted from the table would
  // otherwise leave a passing loop over whatever survived.
  assert.equal(owners.length, 23);
  assert.equal(rankedChildren.length, 88);

  for (const path of [...owners, ...rankedChildren]) {
    assert.equal(
      statSync(resolve(sourceRoot, path), { throwIfNoEntry: false })?.isDirectory(),
      true,
      `SCOPED_OWNER_RANKS declares "${path}", which is not a directory under src/.`,
    );
  }
});

test('icon capability ranks keep glyph and semantic layers directional', () => {
  const { packageRoot, sourceRoot } = fixture();
  try {
    write(
      resolve(sourceRoot, 'graphics/icons/glyphs/foundation/index.ts'),
      'export const glyphContract = true;\n',
    );
    write(
      resolve(sourceRoot, 'graphics/icons/glyphs/runtime/index.ts'),
      "import { glyphContract } from '../foundation';\nexport const glyphRuntime = glyphContract;\n",
    );
    write(
      resolve(sourceRoot, 'graphics/icons/glyphs/presentation/index.ts'),
      "import { glyphRuntime } from '../runtime';\nexport const glyph = glyphRuntime;\n",
    );
    write(
      resolve(sourceRoot, 'graphics/icons/semantic/sources/index.ts'),
      'export const sourceManifest = true;\n',
    );
    write(
      resolve(sourceRoot, 'graphics/icons/semantic/generated/role.ts'),
      '// @generated\nexport const generatedRole = true;\n',
    );
    write(
      resolve(sourceRoot, 'graphics/icons/semantic/foundation/registry/index.ts'),
      'export const iconRegistry = true;\n',
    );
    write(
      resolve(sourceRoot, 'graphics/icons/semantic/foundation/contracts/index.ts'),
      "import { iconRegistry } from '../registry';\nexport const iconContract = iconRegistry;\n",
    );
    write(
      resolve(sourceRoot, 'graphics/icons/semantic/foundation/policy/index.ts'),
      "import { iconRegistry } from '../registry';\nexport const iconPolicy = iconRegistry;\n",
    );
    write(
      resolve(sourceRoot, 'graphics/icons/semantic/foundation/provenance/index.ts'),
      'export const iconProvenance = true;\n',
    );
    write(
      resolve(sourceRoot, 'graphics/icons/semantic/runtime/index.ts'),
      "import { iconContract } from '../foundation/contracts';\nexport const iconRuntime = iconContract;\n",
    );
    write(
      resolve(sourceRoot, 'graphics/icons/semantic/presentation/index.ts'),
      "import { iconRuntime } from '../runtime';\nexport const icon = iconRuntime;\n",
    );

    const result = auditCoreStructure({ packageRoot, sourceRoot });
    const ids = new Set(result.findings.map(({ id }) => id));

    assert(!ids.has('mixed-layer-and-capability-peers:graphics/icons/semantic'));
    assert(!ids.has('sibling-owner-dependency:graphics/icons/glyphs/runtime/index.ts->graphics/icons/glyphs/foundation/index.ts'));
    assert(!ids.has('sibling-owner-dependency:graphics/icons/semantic/foundation/contracts/index.ts->graphics/icons/semantic/foundation/registry/index.ts'));
    assert(!ids.has('sibling-owner-dependency:graphics/icons/semantic/foundation/policy/index.ts->graphics/icons/semantic/foundation/registry/index.ts'));
    assert(!ids.has('local-layer-inversion:graphics/icons/semantic/runtime/index.ts->graphics/icons/semantic/foundation/contracts/index.ts'));
    assert(!ids.has('local-layer-inversion:graphics/icons/semantic/presentation/index.ts->graphics/icons/semantic/runtime/index.ts'));
  } finally {
    rmSync(packageRoot, { recursive: true, force: true });
  }
});

test('the colour floor outranks nothing: equal-rank seeds stay peers under the interaction floor', () => {
  const { packageRoot, sourceRoot } = fixture();
  try {
    const owner = 'infrastructure/compilers/kernel/foundation/css/color-math';
    write(
      resolve(sourceRoot, `${owner}/readable-ink/index.ts`),
      'export const ink = true;\n',
    );
    write(
      resolve(sourceRoot, `${owner}/interaction-floor/index.ts`),
      "import { seeds } from '../palette-derivations';\nimport { ink } from '../readable-ink';\nexport const floor = seeds && ink;\n",
    );
    // Both an inversion and a same-rank control leave this one file: the floor
    // is rank 1 above it, readable-ink is rank 0 beside it.
    write(
      resolve(sourceRoot, `${owner}/palette-derivations/index.ts`),
      "import { floor } from '../interaction-floor';\nimport { ink } from '../readable-ink';\nexport const seeds = floor && ink;\n",
    );

    const result = auditCoreStructure({ packageRoot, sourceRoot });
    assertEveryImportResolved(result);
    const ids = new Set(result.findings.map(({ id }) => id));

    for (const edge of [
      `${owner}/interaction-floor/index.ts->${owner}/palette-derivations/index.ts`,
      `${owner}/interaction-floor/index.ts->${owner}/readable-ink/index.ts`,
    ]) {
      assert(!ids.has(`sibling-owner-dependency:${edge}`));
      assert(!ids.has(`local-layer-inversion:${edge}`));
    }
    assert(ids.has(
      `local-layer-inversion:${owner}/palette-derivations/index.ts->${owner}/interaction-floor/index.ts`,
    ));
    // Equal rank is not permission. Two rank-0 peers remain sibling debt.
    assert(ids.has(
      `sibling-owner-dependency:${owner}/palette-derivations/index.ts->${owner}/readable-ink/index.ts`,
    ));
  } finally {
    rmSync(packageRoot, { recursive: true, force: true });
  }
});

test('the structures shell is declared substrate for headers only, not for every structure group', () => {
  const { packageRoot, sourceRoot } = fixture();
  try {
    write(resolve(sourceRoot, 'components/structures/shell/page-shell-surface/index.ts'), 'export const pageShell = true;\n');
    write(resolve(sourceRoot, 'components/structures/shell/surface-chrome/index.ts'), 'export const surfaceChrome = true;\n');
    write(
      resolve(sourceRoot, 'components/structures/headers/header-surface/index.ts'),
      "import { pageShell } from '../../shell/page-shell-surface';\nimport { surfaceChrome } from '../../shell/surface-chrome';\nexport const headerSurface = pageShell && surfaceChrome;\n",
    );
    write(
      resolve(sourceRoot, 'components/structures/shell/navigation/sidebar-surface/index.ts'),
      "import { surfaceChrome } from '../../surface-chrome';\nexport const sidebarSurface = surfaceChrome;\n",
    );
    write(resolve(sourceRoot, 'components/structures/workspace/connected-command-palette/index.ts'), 'export const palette = true;\n');
    write(
      resolve(sourceRoot, 'components/structures/workspace/search-command-bar/index.ts'),
      "import { palette } from '../connected-command-palette';\nexport const searchBar = palette;\n",
    );
    write(resolve(sourceRoot, 'components/structures/feedback/surface-lifecycle/states/index.ts'), 'export const states = true;\n');
    write(
      resolve(sourceRoot, 'components/structures/feedback/surface-lifecycle/use-surface-state/index.ts'),
      "import { states } from '../states';\nexport const useSurfaceState = states;\n",
    );

    // The substrate never reaches back up into the group it carries.
    write(
      resolve(sourceRoot, 'components/structures/shell/app-shell/index.ts'),
      "import { headerSurface } from '../../headers/header-surface';\nexport const appShell = headerSurface;\n",
    );
    // Control A: two unranked groups under the same ranked owner stay peers,
    // so the `components/structures` entry did not make the whole tier permissive.
    write(resolve(sourceRoot, 'components/structures/dashboard/stats-header/index.ts'), 'export const statsHeader = true;\n');
    write(
      resolve(sourceRoot, 'components/structures/record/record-panel/index.ts'),
      "import { statsHeader } from '../../dashboard/stats-header';\nexport const recordPanel = statsHeader;\n",
    );
    // Control B: the shell is substrate for `headers`. The first workspace,
    // record, dashboard or feedback caller is still reported.
    write(
      resolve(sourceRoot, 'components/structures/workspace/table-toolbar/index.ts'),
      "import { surfaceChrome } from '../../shell/surface-chrome';\nexport const tableToolbar = surfaceChrome;\n",
    );

    const result = auditCoreStructure({ packageRoot, sourceRoot });
    assertEveryImportResolved(result);
    const ids = new Set(result.findings.map(({ id }) => id));

    for (const edge of [
      'components/structures/headers/header-surface/index.ts->components/structures/shell/page-shell-surface/index.ts',
      'components/structures/headers/header-surface/index.ts->components/structures/shell/surface-chrome/index.ts',
      'components/structures/shell/navigation/sidebar-surface/index.ts->components/structures/shell/surface-chrome/index.ts',
      'components/structures/workspace/search-command-bar/index.ts->components/structures/workspace/connected-command-palette/index.ts',
      'components/structures/feedback/surface-lifecycle/use-surface-state/index.ts->components/structures/feedback/surface-lifecycle/states/index.ts',
    ]) {
      assert(!ids.has(`sibling-owner-dependency:${edge}`));
      assert(!ids.has(`local-layer-inversion:${edge}`));
    }
    assert(ids.has(
      'local-layer-inversion:components/structures/shell/app-shell/index.ts->components/structures/headers/header-surface/index.ts',
    ));
    assert(ids.has(
      'sibling-owner-dependency:components/structures/record/record-panel/index.ts->components/structures/dashboard/stats-header/index.ts',
    ));
    assert(ids.has(
      'sibling-owner-dependency:components/structures/workspace/table-toolbar/index.ts->components/structures/shell/surface-chrome/index.ts',
    ));
  } finally {
    rmSync(packageRoot, { recursive: true, force: true });
  }
});

test('rendered components may read foundations while foundations may not read rendered components', () => {
  const { packageRoot, sourceRoot } = fixture();
  try {
    write(resolve(sourceRoot, 'foundation/contracts/probe/index.ts'), 'export const probeContract = true;\n');
    write(
      resolve(sourceRoot, 'components/primitives/probe-consumer/index.ts'),
      "import { probeContract } from '../../../foundation/contracts/probe';\nexport const probeConsumer = probeContract;\n",
    );
    write(
      resolve(sourceRoot, 'foundation/contracts/invalid-consumer/index.ts'),
      "import { probeConsumer } from '../../../components/primitives/probe-consumer';\nexport const invalidConsumer = probeConsumer;\n",
    );

    const result = auditCoreStructure({ packageRoot, sourceRoot });
    assertEveryImportResolved(result);
    const ids = new Set(result.findings.map(({ id }) => id));

    assert(ids.has(
      'architecture-layer-inversion:foundation/contracts/invalid-consumer/index.ts->components/primitives/probe-consumer/index.ts',
    ));
    for (const rule of [
      'architecture-layer-inversion',
      'same-tier-domain-dependency',
      'sibling-owner-dependency',
      'local-layer-inversion',
    ]) {
      assert(!ids.has(
        `${rule}:components/primitives/probe-consumer/index.ts->foundation/contracts/probe/index.ts`,
      ));
    }
  } finally {
    rmSync(packageRoot, { recursive: true, force: true });
  }
});

test('infrastructure runtime may consume compilers but compilers cannot consume runtime state', () => {
  const { packageRoot, sourceRoot } = fixture();
  try {
    write(
      resolve(sourceRoot, 'infrastructure/compilers/theme/index.ts'),
      "import { tenant } from '../../runtime/tenant';\nexport const invalidCompiler = tenant;\n",
    );
    write(
      resolve(sourceRoot, 'infrastructure/runtime/tenant/index.ts'),
      "import { compile } from '../../compilers/css';\nimport { warn } from '../foundation/diagnostics';\nexport const tenant = compile && warn;\n",
    );
    write(
      resolve(sourceRoot, 'infrastructure/runtime/foundation/diagnostics/index.ts'),
      'export const warn = true;\n',
    );
    write(
      resolve(sourceRoot, 'infrastructure/compilers/css/index.ts'),
      'export const compile = true;\n',
    );

    const result = auditCoreStructure({ packageRoot, sourceRoot });
    const ids = new Set(result.findings.map(({ id }) => id));

    assert(ids.has(
      'local-layer-inversion:infrastructure/compilers/theme/index.ts->infrastructure/runtime/tenant/index.ts',
    ));
    assert(!ids.has(
      'sibling-owner-dependency:infrastructure/runtime/tenant/index.ts->infrastructure/compilers/css/index.ts',
    ));
    assert(!ids.has(
      'sibling-owner-dependency:infrastructure/runtime/tenant/index.ts->infrastructure/runtime/foundation/diagnostics/index.ts',
    ));
    assert(!ids.has('mixed-layer-and-capability-peers:infrastructure/runtime'));
  } finally {
    rmSync(packageRoot, { recursive: true, force: true });
  }
});

test('Toast provider consumes its method registry without making UI peers globally permissive', () => {
  const { packageRoot, sourceRoot } = fixture();
  try {
    const owner = 'components/primitives/feedback/toast/runtime/state';
    write(
      resolve(sourceRoot, `${owner}/provider/index.ts`),
      "import { registry } from '../method-registry';\nexport const provider = registry;\n",
    );
    write(
      resolve(sourceRoot, `${owner}/method-registry/index.ts`),
      "import { provider } from '../provider';\nexport const registry = provider;\n",
    );

    const result = auditCoreStructure({ packageRoot, sourceRoot });
    const ids = new Set(result.findings.map(({ id }) => id));

    assert(!ids.has(
      `sibling-owner-dependency:${owner}/provider/index.ts->${owner}/method-registry/index.ts`,
    ));
    assert(ids.has(
      `local-layer-inversion:${owner}/method-registry/index.ts->${owner}/provider/index.ts`,
    ));
  } finally {
    rmSync(packageRoot, { recursive: true, force: true });
  }
});

test('the overlay contract composes its substrate without making UI peers globally permissive', () => {
  const { packageRoot, sourceRoot } = fixture();
  try {
    const owner = 'components/primitives/runtime/overlay';
    write(
      resolve(sourceRoot, `${owner}/field-overlay/index.ts`),
      [
        "import { layer } from '../layer-stack';",
        "import { portal } from '../portal';",
        "import { scope } from '../portal-scope';",
        "import { position } from '../positioning';",
        'export const contract = [layer, portal, scope, position];',
      ].join('\n') + '\n',
    );
    for (const mechanism of ['layer-stack', 'portal', 'portal-scope', 'positioning']) {
      write(
        resolve(sourceRoot, `${owner}/${mechanism}/index.ts`),
        "import { contract } from '../field-overlay';\nexport const mechanism = contract;\n",
      );
    }
    write(
      resolve(sourceRoot, `${owner}/top-layer-host/index.ts`),
      "import { portal } from '../portal';\nexport const host = portal;\n",
    );

    const result = auditCoreStructure({ packageRoot, sourceRoot });
    const ids = new Set(result.findings.map(({ id }) => id));

    // Downstream -> upstream is the declared ladder, not sibling debt.
    for (const mechanism of ['layer-stack', 'portal', 'portal-scope', 'positioning']) {
      assert(!ids.has(
        `sibling-owner-dependency:${owner}/field-overlay/index.ts->${owner}/${mechanism}/index.ts`,
      ));
      assert(ids.has(
        `local-layer-inversion:${owner}/${mechanism}/index.ts->${owner}/field-overlay/index.ts`,
      ));
    }
    // The substrate floor stays below the mechanisms that consume it.
    assert(ids.has(
      `local-layer-inversion:${owner}/top-layer-host/index.ts->${owner}/portal/index.ts`,
    ));
  } finally {
    rmSync(packageRoot, { recursive: true, force: true });
  }
});

test('UI capability branches flow foundation/contracts -> runtime -> engines -> presentation -> compound at any owner depth', () => {
  const { packageRoot, sourceRoot } = fixture();
  try {
    const owners = [
      'components/primitives/inputs/Button',
      'components/patterns/data/DataGrid',
      'components/structures/dashboard/StatsHeader',
      'components/surfaces/application/Workspace',
    ];
    for (const [index, owner] of owners.entries()) {
      write(
        resolve(sourceRoot, `${owner}/contracts/index.ts`),
        `import { engine${index} } from '../engines/classic';\nexport const contract${index} = engine${index};\n`,
      );
      write(
        resolve(sourceRoot, `${owner}/runtime/index.ts`),
        `import { contract${index} } from '../contracts';\nexport const behavior${index} = contract${index};\n`,
      );
      write(
        resolve(sourceRoot, `${owner}/engines/classic/index.ts`),
        `import { contract${index} } from '../../contracts';\nimport { behavior${index} } from '../../runtime';\nexport const engine${index} = contract${index} && behavior${index};\n`,
      );
      write(
        resolve(sourceRoot, `${owner}/presentation/index.ts`),
        `import { engine${index} } from '../engines/classic';\nexport const presentation${index} = engine${index};\n`,
      );
      write(
        resolve(sourceRoot, `${owner}/compound/Icon/index.ts`),
        `import { presentation${index} } from '../../presentation';\nexport const icon${index} = presentation${index};\n`,
      );
    }

    const result = auditCoreStructure({ packageRoot, sourceRoot });
    const ids = new Set(result.findings.map(({ id }) => id));

    for (const owner of owners) {
      for (const edge of [
        `${owner}/runtime/index.ts->${owner}/contracts/index.ts`,
        `${owner}/engines/classic/index.ts->${owner}/contracts/index.ts`,
        `${owner}/engines/classic/index.ts->${owner}/runtime/index.ts`,
        `${owner}/presentation/index.ts->${owner}/engines/classic/index.ts`,
        `${owner}/compound/Icon/index.ts->${owner}/presentation/index.ts`,
      ]) {
        assert(!ids.has(`sibling-owner-dependency:${edge}`));
        assert(!ids.has(`local-layer-inversion:${edge}`));
      }
      assert(ids.has(
        `local-layer-inversion:${owner}/contracts/index.ts->${owner}/engines/classic/index.ts`,
      ));
      assert(!ids.has(`mixed-layer-and-capability-peers:${owner}`));
    }
  } finally {
    rmSync(packageRoot, { recursive: true, force: true });
  }
});

test('UI component closure rejects unknown peers without making engines a global layer', () => {
  const { packageRoot, sourceRoot } = fixture();
  try {
    const uiOwner = 'components/patterns/data/DataGrid';
    write(resolve(sourceRoot, `${uiOwner}/contracts/index.ts`), 'export const contract = true;\n');
    write(resolve(sourceRoot, `${uiOwner}/runtime/index.ts`), 'export const runtime = true;\n');
    write(resolve(sourceRoot, `${uiOwner}/engines/modern/index.ts`), 'export const engine = true;\n');
    write(resolve(sourceRoot, `${uiOwner}/compound/Toolbar/index.ts`), 'export const toolbar = true;\n');
    write(resolve(sourceRoot, `${uiOwner}/adapters/index.ts`), 'export const adapter = true;\n');

    const globalOwner = 'infrastructure/runtime/scheduler';
    write(resolve(sourceRoot, `${globalOwner}/contracts/index.ts`), 'export const contract = true;\n');
    write(resolve(sourceRoot, `${globalOwner}/runtime/index.ts`), 'export const runtime = true;\n');
    write(resolve(sourceRoot, `${globalOwner}/engines/index.ts`), 'export const engine = true;\n');
    write(resolve(sourceRoot, `${globalOwner}/compound/index.ts`), 'export const compound = true;\n');

    const result = auditCoreStructure({ packageRoot, sourceRoot });
    const mixedFindings = new Map(result.findings
      .filter(({ rule }) => rule === 'mixed-layer-and-capability-peers')
      .map((entry) => [entry.path, entry]));

    assert.deepEqual(mixedFindings.get(uiOwner)?.metadata, {
      capabilityChildren: ['adapters'],
      layerChildren: ['compound', 'contracts', 'engines', 'runtime'],
    });
    assert.deepEqual(mixedFindings.get(globalOwner)?.metadata, {
      capabilityChildren: ['compound', 'engines'],
      layerChildren: ['contracts', 'runtime'],
    });
  } finally {
    rmSync(packageRoot, { recursive: true, force: true });
  }
});

test('UI hierarchy allows every downstream edge and rejects upward and same-rank owners', () => {
  const { packageRoot, sourceRoot } = fixture();
  try {
    write(resolve(sourceRoot, 'components/primitives/leaf/index.ts'), 'export const primitive = true;\n');
    write(
      resolve(sourceRoot, 'components/patterns/task/index.ts'),
      "import { primitive } from '../../primitives/leaf';\nexport const pattern = primitive;\n",
    );
    write(
      resolve(sourceRoot, 'components/structures/frame/index.ts'),
      "import { primitive } from '../../primitives/leaf';\nimport { pattern } from '../../patterns/task';\nexport const structure = primitive && pattern;\n",
    );
    write(
      resolve(sourceRoot, 'components/surfaces/page/index.ts'),
      "import { primitive } from '../../primitives/leaf';\nimport { pattern } from '../../patterns/task';\nimport { structure } from '../../structures/frame';\nexport const surface = primitive && pattern && structure;\n",
    );

    write(
      resolve(sourceRoot, 'components/primitives/upward/index.ts'),
      "import { pattern } from '../../patterns/task';\nexport const invalidPrimitive = pattern;\n",
    );
    write(
      resolve(sourceRoot, 'components/patterns/upward/index.ts'),
      "import { structure } from '../../structures/frame';\nexport const invalidPattern = structure;\n",
    );
    write(
      resolve(sourceRoot, 'components/structures/upward/index.ts'),
      "import { surface } from '../../surfaces/page';\nexport const invalidStructure = surface;\n",
    );
    write(
      resolve(sourceRoot, 'components/patterns/peer/index.ts'),
      "import { pattern } from '../task';\nexport const invalidPeer = pattern;\n",
    );
    write(
      resolve(sourceRoot, 'components/patterns/peer-b/foundation/index.ts'),
      'export const peerFoundation = true;\n',
    );
    write(
      resolve(sourceRoot, 'components/patterns/peer-a/presentation/index.ts'),
      "import { peerFoundation } from '../../peer-b/foundation';\nexport const disguisedPeer = peerFoundation;\n",
    );

    const result = auditCoreStructure({ packageRoot, sourceRoot });
    const ids = new Set(result.findings.map(({ id }) => id));

    const allowedEdges = [
      'components/patterns/task/index.ts->components/primitives/leaf/index.ts',
      'components/structures/frame/index.ts->components/primitives/leaf/index.ts',
      'components/structures/frame/index.ts->components/patterns/task/index.ts',
      'components/surfaces/page/index.ts->components/primitives/leaf/index.ts',
      'components/surfaces/page/index.ts->components/patterns/task/index.ts',
      'components/surfaces/page/index.ts->components/structures/frame/index.ts',
    ];
    for (const edge of allowedEdges) {
      assert(!ids.has(`sibling-owner-dependency:${edge}`));
      assert(!ids.has(`local-layer-inversion:${edge}`));
    }

    assert(ids.has(
      'local-layer-inversion:components/primitives/upward/index.ts->components/patterns/task/index.ts',
    ));
    assert(ids.has(
      'local-layer-inversion:components/patterns/upward/index.ts->components/structures/frame/index.ts',
    ));
    assert(ids.has(
      'local-layer-inversion:components/structures/upward/index.ts->components/surfaces/page/index.ts',
    ));
    assert(ids.has(
      'sibling-owner-dependency:components/patterns/peer/index.ts->components/patterns/task/index.ts',
    ));
    assert(ids.has(
      'sibling-owner-dependency:components/patterns/peer-a/presentation/index.ts->components/patterns/peer-b/foundation/index.ts',
    ));
  } finally {
    rmSync(packageRoot, { recursive: true, force: true });
  }
});

test('UI aggregate support flows to capabilities without adding a vague shared wrapper', () => {
  const { packageRoot, sourceRoot } = fixture();
  try {
    write(
      resolve(sourceRoot, 'components/patterns/foundation/recipes/index.ts'),
      'export const recipe = true;\n',
    );
    write(
      resolve(sourceRoot, 'components/patterns/data/table/index.ts'),
      "import { recipe } from '../../foundation/recipes';\nexport const table = recipe;\n",
    );
    write(
      resolve(sourceRoot, 'components/patterns/runtime/registry/index.ts'),
      "import { table } from '../../data/table';\nexport const invalidRegistry = table;\n",
    );
    write(
      resolve(sourceRoot, 'components/patterns/visualization/charts/families/line/index.ts'),
      "import { recipe } from '../../../../foundation/recipes';\nexport const line = recipe;\n",
    );
    write(
      resolve(sourceRoot, 'components/patterns/visualization/charts/contracts/index.ts'),
      'export interface Point { value: number }\n',
    );

    const result = auditCoreStructure({ packageRoot, sourceRoot });
    const ids = new Set(result.findings.map(({ id }) => id));

    assert(!ids.has(
      'sibling-owner-dependency:components/patterns/data/table/index.ts->components/patterns/foundation/recipes/index.ts',
    ));
    assert(ids.has(
      'local-layer-inversion:components/patterns/runtime/registry/index.ts->components/patterns/data/table/index.ts',
    ));
    assert(!ids.has('mixed-layer-and-capability-peers:components/patterns'));
    assert(!ids.has('mixed-layer-and-capability-peers:components/patterns/visualization/charts'));
  } finally {
    rmSync(packageRoot, { recursive: true, force: true });
  }
});

test('@ui resolves to the canonical UI root', () => {
  const { packageRoot, sourceRoot } = fixture();
  try {
    write(resolve(sourceRoot, 'components/primitives/target/index.ts'), 'export const target = true;\n');
    write(
      resolve(sourceRoot, 'components/primitives/source/index.ts'),
      "import { target } from '@ui/primitives/target';\nexport const source = target;\n",
    );

    const result = auditCoreStructure({ packageRoot, sourceRoot });
    assert(result.findings.some(({ id }) => (
      id === 'sibling-owner-dependency:components/primitives/source/index.ts->components/primitives/target/index.ts'
    )));
  } finally {
    rmSync(packageRoot, { recursive: true, force: true });
  }
});

test('a UI sibling may consume only a leaf directly re-exported by a governed public wrapper', () => {
  const { packageRoot, sourceRoot } = fixture();
  try {
    write(resolve(packageRoot, 'contracts/package/entrypoints/index.json'), JSON.stringify({
      entries: {
        './primitives/target': {
          source: 'src/entrypoints/public/primitives/target/index.ts',
        },
      },
    }));
    write(
      resolve(sourceRoot, 'entrypoints/public/primitives/target/index.ts'),
      "export { target } from '../../../../components/primitives/target';\n",
    );
    write(resolve(sourceRoot, 'components/primitives/target/index.ts'), 'export const target = true;\n');
    write(resolve(sourceRoot, 'components/primitives/ungoverned/index.ts'), 'export const ungoverned = true;\n');
    write(
      resolve(sourceRoot, 'components/primitives/source/index.ts'),
      "import { target } from '@ui/primitives/target';\nimport { ungoverned } from '@ui/primitives/ungoverned';\nexport const source = target && ungoverned;\n",
    );

    const result = auditCoreStructure({ packageRoot, sourceRoot });
    const ids = new Set(result.findings.map(({ id }) => id));

    assert(!ids.has(
      'sibling-owner-dependency:components/primitives/source/index.ts->components/primitives/target/index.ts',
    ));
    assert(ids.has(
      'sibling-owner-dependency:components/primitives/source/index.ts->components/primitives/ungoverned/index.ts',
    ));
  } finally {
    rmSync(packageRoot, { recursive: true, force: true });
  }
});

test('local import gate includes tests and distinguishes missing modules from real assets', () => {
  const { packageRoot, sourceRoot } = fixture();
  try {
    write(resolve(sourceRoot, 'feature/assets/theme.css'), ':root { color: black; }\n');
    write(resolve(packageRoot, '.storybook/components/index.ts'), 'export const component = true;\n');
    write(
      resolve(sourceRoot, 'feature/tests/stale.test.ts'),
      "import '../assets/theme.css?raw';\nimport { missing } from '../retired-owner';\nvoid missing;\n",
    );
    write(
      resolve(sourceRoot, 'components/primitives/Button/Button.stories.tsx'),
      "import { component } from '../../../../.storybook/components';\nvoid component;\n",
    );

    const result = auditCoreStructure({ packageRoot, sourceRoot, architectureTiers: TEST_TIERS });
    const unresolved = result.findings.filter(({ rule }) => rule === 'unresolved-local-import');

    assert.deepEqual(unresolved.map(({ id }) => id), [
      'unresolved-local-import:feature/tests/stale.test.ts->../retired-owner',
    ]);
  } finally {
    rmSync(packageRoot, { recursive: true, force: true });
  }
});

test('source root permits discovered entrypoints but rejects loose modules and declarations', () => {
  const { packageRoot, sourceRoot } = fixture();
  try {
    write(resolve(sourceRoot, 'i18n.ts'), 'export const i18n = true;\n');
    write(resolve(sourceRoot, 'tokens.ts'), 'export const tokens = true;\n');
    write(resolve(sourceRoot, 'css.d.ts'), "declare module '*.css';\n");

    const result = auditCoreStructure({ packageRoot, sourceRoot });
    const ids = new Set(result.findings.map(({ id }) => id));

    assert(![...ids].some((id) => id.includes('public-entry.ts')));
    assert(result.inventory.rootEntrypoints.includes('public-entry.ts'));
    assert(!result.inventory.rootEntrypoints.includes('i18n.ts'));
    assert(!result.inventory.rootEntrypoints.includes('tokens.ts'));
    assert(ids.has('flat-authored-module:i18n.ts'));
    assert(ids.has('flat-authored-module:tokens.ts'));
    assert(ids.has('root-declaration-file:css.d.ts'));
  } finally {
    rmSync(packageRoot, { recursive: true, force: true });
  }
});

test('entrypoint support root permits only registered capability folder/index boundaries', () => {
  const { packageRoot, sourceRoot } = fixture();
  try {
    write(resolve(packageRoot, 'package.json'), JSON.stringify({
      releaseSync: {
        sourceEntrypoints: {
          './public': 'entrypoints/public/index.ts',
        },
      },
    }));
    write(resolve(packageRoot, 'contracts/package/entrypoints/index.json'), JSON.stringify({
      entries: {
        './contracts/example': {
          source: 'src/entrypoints/public/contracts/example/index.ts',
        },
        './runtime/example': {
          source: 'src/entrypoints/public/runtime/example/index.ts',
        },
        './primitives/example': {
          source: 'src/entrypoints/public/primitives/example/index.ts',
        },
      },
    }));
    write(
      resolve(sourceRoot, 'entrypoints/public/index.ts'),
      "export * from '../../feature';\n",
    );
    write(
      resolve(sourceRoot, 'entrypoints/public/helper.ts'),
      'export const misplacedHelper = true;\n',
    );
    write(
      resolve(sourceRoot, 'entrypoints/public/contracts/example/index.ts'),
      'export interface ExampleContract {}\n',
    );
    write(
      resolve(sourceRoot, 'entrypoints/public/runtime/example/index.ts'),
      'export const exampleRuntime = true;\n',
    );
    write(
      resolve(sourceRoot, 'entrypoints/public/primitives/example/index.ts'),
      'export const examplePrimitive = true;\n',
    );
    write(
      resolve(sourceRoot, 'entrypoints/hidden/index.ts'),
      'export const hiddenBoundary = true;\n',
    );

    const result = auditCoreStructure({ packageRoot, sourceRoot });
    const ids = new Set(result.findings.map(({ id }) => id));

    assert(result.inventory.rootEntrypoints.includes('entrypoints/public/index.ts'));
    assert.equal(result.inventory.ignoredByKind.entrypoint, 5);
    assert(!ids.has('unclassified-root-domain:entrypoints'));
    assert(![...ids].some((id) => id.includes('entrypoints/public/index.ts')));
    assert(![...ids].some((id) => (
      id.startsWith('mixed-layer-and-capability-peers:entrypoints/')
    )));
    assert(ids.has(
      'invalid-entrypoint-support-module:entrypoints/public/helper.ts',
    ));
    assert(ids.has(
      'unregistered-entrypoint-support-module:entrypoints/hidden/index.ts',
    ));
  } finally {
    rmSync(packageRoot, { recursive: true, force: true });
  }
});

test('path gate rejects repeated owners, the generic composition root and generic owner segments', () => {
  const { packageRoot, sourceRoot } = fixture();
  try {
    write(
      resolve(sourceRoot, 'components/structures/record/record/index.ts'),
      'export const duplicatedOwner = true;\n',
    );
    write(
      resolve(sourceRoot, 'composition/design-system/index.ts'),
      'export const genericOwner = true;\n',
    );
    for (const segment of ['_internal', 'hooks', 'internal', 'misc', 'shared', 'utils']) {
      write(
        resolve(sourceRoot, `feature/${segment}/capability/index.ts`),
        `export const ${segment.replace(/[^a-z]/gu, '')}Capability = true;\n`,
      );
    }

    // These are intentionally similar strings that are not directory-owner
    // violations: a repeated filename, an exact filename, a nested local
    // layer, and source content mentioning both forbidden shapes.
    write(resolve(sourceRoot, 'components/structures/card/card.ts'), 'export const card = true;\n');
    write(resolve(sourceRoot, 'components/structures/composition.ts'), 'export const compositionFile = true;\n');
    write(resolve(sourceRoot, 'components/structures/composition/index.ts'), 'export const localComposition = true;\n');
    write(resolve(sourceRoot, 'feature/hooks.ts'), 'export const hooksFilename = true;\n');
    write(
      resolve(sourceRoot, 'components/structures/content/index.ts'),
      "export const prose = 'composition hooks misc components/structures/record/record';\n",
    );
    write(resolve(sourceRoot, 'composition.ts'), 'export const rootFilenameOnly = true;\n');

    const result = auditCoreStructure({ packageRoot, sourceRoot });
    const pathFindingIds = result.findings
      .filter(({ rule }) => rule === 'repeated-path-segment' || rule === 'generic-owner-segment')
      .map(({ id }) => id);

    assert.deepEqual(new Set(pathFindingIds), new Set([
      'generic-owner-segment:composition',
      'generic-owner-segment:feature/_internal',
      'generic-owner-segment:feature/hooks',
      'generic-owner-segment:feature/internal',
      'generic-owner-segment:feature/misc',
      'generic-owner-segment:feature/shared',
      'generic-owner-segment:feature/utils',
      'repeated-path-segment:components/structures/record/record',
    ]));
  } finally {
    rmSync(packageRoot, { recursive: true, force: true });
  }
});

test('a target barrel remains a real owner dependency while a source barrel stays an aggregator', () => {
  const { packageRoot, sourceRoot } = fixture();
  try {
    write(resolve(sourceRoot, 'feature/base/index.ts'), "export { base } from './value';\n");
    write(resolve(sourceRoot, 'feature/base/value.ts'), 'export const base = true;\n');
    const result = auditCoreStructure({ packageRoot, sourceRoot, architectureTiers: TEST_TIERS });
    assert(result.findings.some(({ id }) => (
      id === 'sibling-owner-dependency:feature/derived/index.ts->feature/base/index.ts'
    )));
    assert(!result.findings.some(({ id }) => id.startsWith(
      'sibling-owner-dependency:feature/index.ts->',
    )));
  } finally {
    rmSync(packageRoot, { recursive: true, force: true });
  }
});

test('negative fixture exposes every owner tree law without charging entrypoints or generated code', () => {
  const { packageRoot, sourceRoot } = fixture();
  try {
    const result = auditCoreStructure({
      packageRoot,
      sourceRoot,
      architectureTiers: TEST_TIERS,
    });
    const ids = new Set(result.findings.map(({ id }) => id));
    assert(ids.has('co-located-test-file:feature/timing.test.ts'));
    assert(ids.has('flat-authored-module:feature/Widget.tsx'));
    assert(ids.has('flat-authored-module:feature/columns.ts'));
    assert(ids.has('missing-folder-index:feature/engines'));
    assert(ids.has('barrel-with-authored-peers:feature'));
    assert(ids.has('flat-module-family:feature/engines'));
    assert(ids.has('same-level-module-dependency:feature/engines/classic.tsx->feature/engines/shared.ts'));
    assert(ids.has('sibling-owner-dependency:feature/derived/index.ts->feature/base/index.ts'));
    assert(![...ids].some((id) => id.includes('public-entry.ts')));
    assert(![...ids].some((id) => id.includes('GeneratedWidget.tsx')));
    assert(![...ids].some((id) => id.includes('nested.test.ts')));
    assert.equal(result.inventory.ignoredByKind.generated, 1);
    assert.equal(result.inventory.ignoredByKind.entrypoint, 2);
  } finally {
    rmSync(packageRoot, { recursive: true, force: true });
  }
});

test('test containers distinguish aggregate owners from orphan sibling families', () => {
  const { packageRoot, sourceRoot } = fixture();
  try {
    // Positive: the parent index makes this a real aggregate unit, so its tests
    // may verify the public owner even though two child units live below it.
    write(resolve(sourceRoot, 'feature/owned-suite/index.ts'), "export * from './alpha';\nexport * from './beta';\n");
    write(resolve(sourceRoot, 'feature/owned-suite/alpha/index.ts'), 'export const alpha = true;\n');
    write(resolve(sourceRoot, 'feature/owned-suite/beta/index.ts'), 'export const beta = true;\n');
    write(resolve(sourceRoot, 'feature/owned-suite/tests/aggregate.test.ts'), "import * as suite from '..';\nvoid suite;\n");
    write(resolve(sourceRoot, 'feature/owned-suite/tests/public-contract/index.test.ts'), "import * as suite from '../..';\nvoid suite;\n");

    // Positive: a semantic test-only suite has no productive siblings to make
    // its ownership ambiguous; requiring a fake production index would lie.
    write(resolve(sourceRoot, 'feature/system-suite/tests/system.test.ts'), 'export {};\n');

    // Negative: tests/ is a peer of two productive units and the parent exposes
    // no aggregate index. Its stable identity is the ambiguous container path.
    write(resolve(sourceRoot, 'feature/orphan-suite/alpha/index.ts'), 'export const alpha = true;\n');
    write(resolve(sourceRoot, 'feature/orphan-suite/beta/index.ts'), 'export const beta = true;\n');
    write(resolve(sourceRoot, 'feature/orphan-suite/tests/family.test.ts'), 'export {};\n');

    const result = auditCoreStructure({ packageRoot, sourceRoot, architectureTiers: TEST_TIERS });
    const orphanFindings = result.findings.filter(({ rule }) => rule === 'orphan-test-container');
    assert(!result.findings.some(({ id }) => (
      id === 'co-located-test-file:feature/owned-suite/tests/public-contract/index.test.ts'
    )));

    assert.deepEqual(
      orphanFindings.map(({ id }) => id),
      ['orphan-test-container:feature/orphan-suite/tests'],
    );
    assert.deepEqual(orphanFindings[0].metadata.productiveOwners, ['alpha', 'beta']);
  } finally {
    rmSync(packageRoot, { recursive: true, force: true });
  }
});

test('identity baseline is a strict subset ratchet: reductions pass and new paths fail', () => {
  const { packageRoot, sourceRoot } = fixture();
  try {
    const initial = auditCoreStructure({ packageRoot, sourceRoot, architectureTiers: TEST_TIERS });
    const baseline = createStructureBaseline(initial);

    rmSync(resolve(sourceRoot, 'feature/timing.test.ts'));
    const reduced = auditCoreStructure({ packageRoot, sourceRoot, architectureTiers: TEST_TIERS });
    const reducedComparison = compareStructureBaseline(reduced, baseline);
    assert.equal(reducedComparison.passed, true);
    assert(reducedComparison.resolved.includes('co-located-test-file:feature/timing.test.ts'));

    write(resolve(sourceRoot, 'feature/NewPeer.ts'), 'export const newPeer = true;\n');
    const increased = auditCoreStructure({ packageRoot, sourceRoot, architectureTiers: TEST_TIERS });
    const increasedComparison = compareStructureBaseline(increased, baseline);
    assert.equal(increasedComparison.passed, false);
    assert(increasedComparison.added.includes('flat-authored-module:feature/NewPeer.ts'));
  } finally {
    rmSync(packageRoot, { recursive: true, force: true });
  }
});

test('D-21 (b): the shipped tier map admits contracts/ and still refuses an undeclared root', () => {
  const { packageRoot, sourceRoot } = fixture();
  try {
    write(resolve(sourceRoot, 'contracts/theme/catalog/index.ts'), 'export const catalog = [];\n');
    write(resolve(sourceRoot, 'undeclared/index.ts'), 'export const undeclared = true;\n');
    // The SHIPPED map, not TEST_TIERS: this is the drill for the amendment.
    const result = auditCoreStructure({ packageRoot, sourceRoot });
    const ids = new Set(result.findings.map(({ id }) => id));
    assert.equal(ids.has('unclassified-root-domain:contracts'), false);
    assert.equal(ids.has('flat-architecture-domain:contracts'), false);
    assert.equal(ids.has('unclassified-root-domain:undeclared'), true);
  } finally {
    rmSync(packageRoot, { recursive: true, force: true });
  }
});

test('an unknown root owner fails closed instead of becoming an anonymous peer', () => {
  const { packageRoot, sourceRoot } = fixture();
  try {
    write(resolve(sourceRoot, 'surprise/index.ts'), 'export const surprise = true;\n');
    const result = auditCoreStructure({ packageRoot, sourceRoot, architectureTiers: TEST_TIERS });
    assert(result.findings.some(({ id }) => id === 'unclassified-root-domain:surprise'));
  } finally {
    rmSync(packageRoot, { recursive: true, force: true });
  }
});

test('a declared tier name is a governed physical root, not another flat domain', () => {
  const { packageRoot, sourceRoot } = fixture();
  try {
    write(resolve(sourceRoot, 'foundation/index.ts'), 'export const physicalTier = true;\n');
    const result = auditCoreStructure({ packageRoot, sourceRoot, architectureTiers: TEST_TIERS });
    assert(!result.findings.some(({ id }) => id === 'unclassified-root-domain:foundation'));
    assert(!result.findings.some(({ id }) => id === 'flat-architecture-domain:foundation'));
  } finally {
    rmSync(packageRoot, { recursive: true, force: true });
  }
});

test('a legacy domain stays visible until it reaches its physical tier root', () => {
  const { packageRoot, sourceRoot } = fixture();
  try {
    const result = auditCoreStructure({ packageRoot, sourceRoot, architectureTiers: TEST_TIERS });
    assert(result.findings.some(({ id }) => id === 'flat-architecture-domain:feature'));
  } finally {
    rmSync(packageRoot, { recursive: true, force: true });
  }
});

test('tier audit distinguishes same-tier peerage from an upward dependency', () => {
  const { packageRoot, sourceRoot } = fixture();
  try {
    write(resolve(sourceRoot, 'base/index.ts'), "import { derived } from '../derived';\nexport const base = derived;\n");
    write(resolve(sourceRoot, 'derived/index.ts'), "import { Widget } from '../feature/Widget';\nexport const derived = Widget;\n");
    const result = auditCoreStructure({ packageRoot, sourceRoot, architectureTiers: TEST_TIERS });
    assert(result.findings.some(({ id }) => (
      id === 'same-tier-domain-dependency:base/index.ts->derived/index.ts'
    )));
    assert(result.findings.some(({ id }) => (
      id === 'architecture-layer-inversion:derived/index.ts->feature/Widget.tsx'
    )));
  } finally {
    rmSync(packageRoot, { recursive: true, force: true });
  }
});

test('local layers allow downstream-to-foundation edges but reject inversions and same-rank peers', () => {
  const { packageRoot, sourceRoot } = fixture();
  try {
    write(resolve(sourceRoot, 'layered/foundation/index.ts'), "import { runtimeValue } from '../runtime';\nexport const foundationValue = runtimeValue;\n");
    write(resolve(sourceRoot, 'layered/kernel/index.ts'), 'export const kernelValue = true;\n');
    write(resolve(sourceRoot, 'layered/policy/index.ts'), 'export const policyValue = true;\n');
    write(resolve(sourceRoot, 'layered/runtime/index.ts'), "import { foundationValue } from '../foundation';\nexport const runtimeValue = foundationValue;\n");
    write(resolve(sourceRoot, 'layered/public/index.ts'), "import { runtimeValue } from '../runtime';\nexport const publicValue = runtimeValue;\n");
    write(resolve(sourceRoot, 'layered/react/index.ts'), "import { kernelValue } from '../kernel';\nimport { policyValue } from '../policy';\nimport { presentationValue } from '../presentation';\nexport const reactValue = kernelValue && policyValue && presentationValue;\n");
    write(resolve(sourceRoot, 'layered/semantic/generated/role.ts'), '// @generated\nexport const generatedRole = true;\n');
    write(resolve(sourceRoot, 'layered/presentation/index.ts'), "import { foundationValue } from '../foundation';\nimport { runtimeValue } from '../runtime';\nimport { reactValue } from '../react';\nexport const presentationValue = foundationValue && runtimeValue && reactValue;\n");
    write(resolve(sourceRoot, 'layered/kernel/spec/index.ts'), 'export const nestedSpec = true;\n');
    write(resolve(sourceRoot, 'layered/kernel/renderers/presentation/bar/index.ts'), "import { nestedSpec } from '../../../spec';\nexport const nestedPresentation = nestedSpec;\n");
    const result = auditCoreStructure({ packageRoot, sourceRoot, architectureTiers: TEST_TIERS });
    const ids = new Set(result.findings.map(({ id }) => id));

    assert(!ids.has('sibling-owner-dependency:layered/runtime/index.ts->layered/foundation/index.ts'));
    assert(!ids.has('sibling-owner-dependency:layered/react/index.ts->layered/kernel/index.ts'));
    assert(!ids.has('sibling-owner-dependency:layered/react/index.ts->layered/policy/index.ts'));
    assert(!ids.has('sibling-owner-dependency:layered/presentation/index.ts->layered/foundation/index.ts'));
    assert(!ids.has('sibling-owner-dependency:layered/presentation/index.ts->layered/runtime/index.ts'));
    assert(!ids.has('sibling-owner-dependency:layered/public/index.ts->layered/runtime/index.ts'));
    assert(!ids.has('sibling-owner-dependency:layered/kernel/renderers/presentation/bar/index.ts->layered/kernel/spec/index.ts'));
    assert(ids.has('mixed-layer-and-capability-peers:layered'));
    assert(ids.has('local-layer-inversion:layered/foundation/index.ts->layered/runtime/index.ts'));
    assert(!ids.has('sibling-owner-dependency:layered/presentation/index.ts->layered/react/index.ts'));
    assert(ids.has('local-layer-inversion:layered/react/index.ts->layered/presentation/index.ts'));
  } finally {
    rmSync(packageRoot, { recursive: true, force: true });
  }
});

test('outer layer taxonomy wins across nested component families', () => {
  const { packageRoot, sourceRoot } = fixture();
  try {
    write(resolve(sourceRoot, 'layered/runtime/patterns/index.ts'), 'export const pattern = true;\n');
    write(
      resolve(sourceRoot, 'layered/public/surfaces/runtime/widget/index.ts'),
      "import { pattern } from '../../../../runtime/patterns';\nexport const widget = pattern;\n",
    );
    write(
      resolve(sourceRoot, 'layered/public/surfaces/foundation/contracts/index.ts'),
      "import { widget } from '../../runtime/widget';\nexport const contract = widget;\n",
    );

    const result = auditCoreStructure({ packageRoot, sourceRoot, architectureTiers: TEST_TIERS });
    const ids = new Set(result.findings.map(({ id }) => id));

    assert(!ids.has(
      'sibling-owner-dependency:layered/public/surfaces/runtime/widget/index.ts->layered/runtime/patterns/index.ts',
    ));
    assert(!ids.has(
      'local-layer-inversion:layered/public/surfaces/runtime/widget/index.ts->layered/runtime/patterns/index.ts',
    ));
    assert(ids.has(
      'local-layer-inversion:layered/public/surfaces/foundation/contracts/index.ts->layered/public/surfaces/runtime/widget/index.ts',
    ));
  } finally {
    rmSync(packageRoot, { recursive: true, force: true });
  }
});

test('the theme contract chain is a directed ladder, and the reversed edge still inverts', () => {
  const { packageRoot, sourceRoot } = fixture();
  try {
    const owner = 'foundation/contracts/composition/tenants/themes';

    // The rank entry is a DIRECTED law, not an exemption: iso is the floor and
    // every later owner may read downward, but nothing may read back up.
    assert.deepEqual(SCOPED_OWNER_RANKS[owner], {
      iso: 0,
      provenance: 1,
      'tenant-theme': 2,
      intent: 3,
      resolved: 4,
      compiled: 5,
      emission: 6,
      'engine-adapter': 7,
    });

    write(resolve(sourceRoot, `${owner}/iso/index.ts`), 'export const theme = true;\n');
    // The ledger vocabulary imports nothing: its decision domain is injected by
    // the resolution boundary, which is what keeps it below every carrier.
    write(
      resolve(sourceRoot, `${owner}/provenance/index.ts`),
      'export type Ledger = { readonly entries: readonly string[] };\n',
    );
    write(
      resolve(sourceRoot, `${owner}/tenant-theme/index.ts`),
      "import type { Ledger } from '../provenance';\nexport type Document = { readonly ledger?: Ledger };\n",
    );
    write(
      resolve(sourceRoot, `${owner}/intent/index.ts`),
      "import { theme } from '../iso';\nimport type { Ledger } from '../provenance';\nexport const intent = theme;\nexport type Intent = { readonly ledger?: Ledger };\n",
    );
    write(
      resolve(sourceRoot, `${owner}/resolved/index.ts`),
      "import { intent } from '../intent';\nimport { theme } from '../iso';\nimport type { Ledger } from '../provenance';\nexport const resolved = intent && theme;\nexport type Resolved = { readonly ledger?: Ledger };\n",
    );
    write(
      resolve(sourceRoot, `${owner}/compiled/index.ts`),
      "import { resolved } from '../resolved';\nexport const compiled = resolved;\n",
    );
    write(
      resolve(sourceRoot, `${owner}/engine-adapter/index.ts`),
      "import { compiled } from '../compiled';\nexport const adapter = compiled;\n",
    );

    const downward = auditCoreStructure({ packageRoot, sourceRoot });
    assertEveryImportResolved(downward);
    const downwardIds = new Set(downward.findings.map(({ id }) => id));
    for (const edge of [
      `${owner}/intent/index.ts->${owner}/iso/index.ts`,
      `${owner}/resolved/index.ts->${owner}/intent/index.ts`,
      `${owner}/resolved/index.ts->${owner}/iso/index.ts`,
      `${owner}/engine-adapter/index.ts->${owner}/compiled/index.ts`,
      // A carrier reading the ledger it transports is downward, and a type-only
      // edge is still an edge: these three are exactly what rank 1 admits.
      `${owner}/tenant-theme/index.ts->${owner}/provenance/index.ts`,
      `${owner}/intent/index.ts->${owner}/provenance/index.ts`,
      `${owner}/resolved/index.ts->${owner}/provenance/index.ts`,
    ]) {
      assert(!downwardIds.has(`sibling-owner-dependency:${edge}`), `downward edge must be legal: ${edge}`);
      assert(!downwardIds.has(`local-layer-inversion:${edge}`), `downward edge must be legal: ${edge}`);
    }

    // The ledger reading a carrier is the inversion rank 1 exists to refuse,
    // including as `import type`: the reason the catalog is injected instead.
    for (const carrier of ['tenant-theme', 'intent', 'resolved']) {
      write(
        resolve(sourceRoot, `${owner}/provenance/index.ts`),
        `import type { Ledger } from '../${carrier}';\nexport type Echo = Ledger;\n`,
      );
      const upwardIds = new Set(auditCoreStructure({ packageRoot, sourceRoot }).findings.map(({ id }) => id));
      assert(
        upwardIds.has(
          `local-layer-inversion:${owner}/provenance/index.ts->${owner}/${carrier}/index.ts`,
        ),
        `provenance -> ${carrier} must stay an inversion`,
      );
    }

    // And the ledger reading the decision catalog is the tier inversion the
    // injected catalog replaces: `contracts` is a higher tier than `foundation`.
    write(
      resolve(sourceRoot, 'contracts/theme/foundation/decisions/index.ts'),
      "export type DecisionId = 'typography.pairing';\n",
    );
    write(
      resolve(sourceRoot, `${owner}/provenance/index.ts`),
      "import type { DecisionId } from '@/contracts/theme/foundation/decisions';\nexport type Ledger = { readonly id: DecisionId };\n",
    );
    const catalogEdge = auditCoreStructure({ packageRoot, sourceRoot });
    assert(
      new Set(catalogEdge.findings.map(({ id }) => id)).has(
        `architecture-layer-inversion:${owner}/provenance/index.ts`
        + '->contracts/theme/foundation/decisions/index.ts',
      ),
      'provenance -> the decision catalog must stay a tier inversion',
    );

    // Reverse one edge: iso reading its own consumer is an inversion, so the
    // entry can never be read as a blanket exemption for the whole group.
    write(
      resolve(sourceRoot, `${owner}/provenance/index.ts`),
      'export type Ledger = { readonly entries: readonly string[] };\n',
    );
    write(
      resolve(sourceRoot, `${owner}/iso/index.ts`),
      "import { resolved } from '../resolved';\nexport const theme = resolved;\n",
    );
    const reversed = auditCoreStructure({ packageRoot, sourceRoot });
    assert(
      reversed.findings.some(
        ({ rule, id }) =>
          rule === 'local-layer-inversion' && id.includes(`${owner}/iso/index.ts`),
      ),
      'iso -> resolved must stay an inversion',
    );
  } finally {
    rmSync(packageRoot, { recursive: true, force: true });
  }
});

test('the theme compiler owner is layer-closed downward, and an unlayered peer under compilers still fails', () => {
  const { packageRoot, sourceRoot } = fixture();
  try {
    const owner = 'infrastructure/compilers/runtime/theme';

    // Runtime may not name a type declared under presentation. This is why the
    // adapter CONTRACT lives in foundation/contracts and there is no
    // `presentation/adapters/contract/` owner.
    write(resolve(sourceRoot, `${owner}/presentation/adapters/index.ts`), 'export const adapters = true;\n');
    write(
      resolve(sourceRoot, `${owner}/runtime/lowering/index.ts`),
      "import { adapters } from '../../presentation/adapters';\nexport const lowering = adapters;\n",
    );

    const inverted = auditCoreStructure({ packageRoot, sourceRoot });
    assert(
      inverted.findings.some(
        ({ rule, id }) =>
          rule === 'local-layer-inversion' && id.includes(`${owner}/runtime/lowering/index.ts`),
      ),
      'runtime -> presentation under the theme owner must be an inversion',
    );

    write(resolve(sourceRoot, `${owner}/runtime/lowering/index.ts`), 'export const lowering = true;\n');
    assert(
      !auditCoreStructure({ packageRoot, sourceRoot }).findings.some(
        ({ rule }) => rule === 'local-layer-inversion',
      ),
      'removing the upward edge must clear the inversion',
    );

    // `infrastructure/compilers` declares four local layers, so it is
    // layer-closed. A fifth, unlayered capability child is the exact shape a
    // capability owner placed at `infrastructure/compilers/theme/` would take.
    write(
      resolve(sourceRoot, 'infrastructure/compilers/composition/index.ts'),
      'export const composition = true;\n',
    );
    write(resolve(sourceRoot, 'infrastructure/compilers/facade/index.ts'), 'export const facade = true;\n');
    write(resolve(sourceRoot, 'infrastructure/compilers/kernel/index.ts'), 'export const kernel = true;\n');
    write(resolve(sourceRoot, 'infrastructure/compilers/theme/index.ts'), 'export const misplaced = true;\n');

    const closed = auditCoreStructure({ packageRoot, sourceRoot });
    assert(
      closed.findings.some(
        ({ id }) => id === 'mixed-layer-and-capability-peers:infrastructure/compilers',
      ),
      'an unlayered capability peer under infrastructure/compilers must fail',
    );
  } finally {
    rmSync(packageRoot, { recursive: true, force: true });
  }
});
