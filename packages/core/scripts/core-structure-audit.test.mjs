import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
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
} from './core-structure-audit.mjs';

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

test('barrel classifier distinguishes aggregators from index implementations', () => {
  assert.equal(isBarrelSource("'use client';\nexport { Widget } from './Widget';\n"), true);
  assert.equal(isBarrelSource('export const Widget = () => null;\n'), false);
});

test('default macro roots match the governed graphics and UI taxonomy', () => {
  assert.deepEqual(Object.keys(ARCHITECTURE_TIERS), [
    'foundation',
    'infrastructure',
    'graphics',
    'ui',
    'tooling',
  ]);
  assert.deepEqual(ARCHITECTURE_TIERS.foundation, [
    'behavior',
    'contracts',
    'i18n',
    'kernel',
    'presets',
    'tokens',
  ]);
  assert.deepEqual(ARCHITECTURE_TIERS.graphics, [
    'icons',
    'brand-marks',
    'motion',
    'pictograms',
  ]);
  assert.deepEqual(ARCHITECTURE_TIERS.ui, [
    'primitives',
    'patterns',
    'structures',
    'surfaces',
  ]);
  assert.equal(Object.hasOwn(ARCHITECTURE_TIERS, 'composition'), false);
  assert.equal(Object.hasOwn(ARCHITECTURE_TIERS, 'entrypoints'), false);
  assert.deepEqual(CLASSIFIED_SUPPORT_ROOTS, ['entrypoints']);
  assert.deepEqual(UI_LAYER_RANKS, {
    primitives: 0,
    patterns: 1,
    structures: 2,
    surfaces: 3,
  });
  assert.deepEqual(SCOPED_OWNER_RANKS, {
    foundation: { contracts: 0, presets: 1 },
    'foundation/kernel': { color: 0, accessibility: 1 },
    'foundation/kernel/color': { contrast: 0, oklch: 1 },
    infrastructure: { compilers: 0, runtime: 1 },
    'ui/primitives/feedback/Toast/runtime/state': {
      'method-registry': 0,
      provider: 1,
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
    const owner = 'ui/primitives/feedback/Toast/runtime/state';
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

test('UI capability branches flow foundation/contracts -> runtime -> engines -> presentation -> compound at any owner depth', () => {
  const { packageRoot, sourceRoot } = fixture();
  try {
    const owners = [
      'ui/primitives/inputs/Button',
      'ui/patterns/data/DataGrid',
      'ui/structures/dashboard/StatsHeader',
      'ui/surfaces/application/Workspace',
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
    const uiOwner = 'ui/patterns/data/DataGrid';
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
    write(resolve(sourceRoot, 'ui/primitives/leaf/index.ts'), 'export const primitive = true;\n');
    write(
      resolve(sourceRoot, 'ui/patterns/task/index.ts'),
      "import { primitive } from '../../primitives/leaf';\nexport const pattern = primitive;\n",
    );
    write(
      resolve(sourceRoot, 'ui/structures/frame/index.ts'),
      "import { primitive } from '../../primitives/leaf';\nimport { pattern } from '../../patterns/task';\nexport const structure = primitive && pattern;\n",
    );
    write(
      resolve(sourceRoot, 'ui/surfaces/page/index.ts'),
      "import { primitive } from '../../primitives/leaf';\nimport { pattern } from '../../patterns/task';\nimport { structure } from '../../structures/frame';\nexport const surface = primitive && pattern && structure;\n",
    );

    write(
      resolve(sourceRoot, 'ui/primitives/upward/index.ts'),
      "import { pattern } from '../../patterns/task';\nexport const invalidPrimitive = pattern;\n",
    );
    write(
      resolve(sourceRoot, 'ui/patterns/upward/index.ts'),
      "import { structure } from '../../structures/frame';\nexport const invalidPattern = structure;\n",
    );
    write(
      resolve(sourceRoot, 'ui/structures/upward/index.ts'),
      "import { surface } from '../../surfaces/page';\nexport const invalidStructure = surface;\n",
    );
    write(
      resolve(sourceRoot, 'ui/patterns/peer/index.ts'),
      "import { pattern } from '../task';\nexport const invalidPeer = pattern;\n",
    );
    write(
      resolve(sourceRoot, 'ui/patterns/peer-b/foundation/index.ts'),
      'export const peerFoundation = true;\n',
    );
    write(
      resolve(sourceRoot, 'ui/patterns/peer-a/presentation/index.ts'),
      "import { peerFoundation } from '../../peer-b/foundation';\nexport const disguisedPeer = peerFoundation;\n",
    );

    const result = auditCoreStructure({ packageRoot, sourceRoot });
    const ids = new Set(result.findings.map(({ id }) => id));

    const allowedEdges = [
      'ui/patterns/task/index.ts->ui/primitives/leaf/index.ts',
      'ui/structures/frame/index.ts->ui/primitives/leaf/index.ts',
      'ui/structures/frame/index.ts->ui/patterns/task/index.ts',
      'ui/surfaces/page/index.ts->ui/primitives/leaf/index.ts',
      'ui/surfaces/page/index.ts->ui/patterns/task/index.ts',
      'ui/surfaces/page/index.ts->ui/structures/frame/index.ts',
    ];
    for (const edge of allowedEdges) {
      assert(!ids.has(`sibling-owner-dependency:${edge}`));
      assert(!ids.has(`local-layer-inversion:${edge}`));
    }

    assert(ids.has(
      'local-layer-inversion:ui/primitives/upward/index.ts->ui/patterns/task/index.ts',
    ));
    assert(ids.has(
      'local-layer-inversion:ui/patterns/upward/index.ts->ui/structures/frame/index.ts',
    ));
    assert(ids.has(
      'local-layer-inversion:ui/structures/upward/index.ts->ui/surfaces/page/index.ts',
    ));
    assert(ids.has(
      'sibling-owner-dependency:ui/patterns/peer/index.ts->ui/patterns/task/index.ts',
    ));
    assert(ids.has(
      'sibling-owner-dependency:ui/patterns/peer-a/presentation/index.ts->ui/patterns/peer-b/foundation/index.ts',
    ));
  } finally {
    rmSync(packageRoot, { recursive: true, force: true });
  }
});

test('UI aggregate support flows to capabilities without adding a vague shared wrapper', () => {
  const { packageRoot, sourceRoot } = fixture();
  try {
    write(
      resolve(sourceRoot, 'ui/patterns/foundation/recipes/index.ts'),
      'export const recipe = true;\n',
    );
    write(
      resolve(sourceRoot, 'ui/patterns/data/table/index.ts'),
      "import { recipe } from '../../foundation/recipes';\nexport const table = recipe;\n",
    );
    write(
      resolve(sourceRoot, 'ui/patterns/runtime/registry/index.ts'),
      "import { table } from '../../data/table';\nexport const invalidRegistry = table;\n",
    );
    write(
      resolve(sourceRoot, 'ui/patterns/visualization/charts/families/line/index.ts'),
      "import { recipe } from '../../../../foundation/recipes';\nexport const line = recipe;\n",
    );
    write(
      resolve(sourceRoot, 'ui/patterns/visualization/charts/contracts/index.ts'),
      'export interface Point { value: number }\n',
    );

    const result = auditCoreStructure({ packageRoot, sourceRoot });
    const ids = new Set(result.findings.map(({ id }) => id));

    assert(!ids.has(
      'sibling-owner-dependency:ui/patterns/data/table/index.ts->ui/patterns/foundation/recipes/index.ts',
    ));
    assert(ids.has(
      'local-layer-inversion:ui/patterns/runtime/registry/index.ts->ui/patterns/data/table/index.ts',
    ));
    assert(!ids.has('mixed-layer-and-capability-peers:ui/patterns'));
    assert(!ids.has('mixed-layer-and-capability-peers:ui/patterns/visualization/charts'));
  } finally {
    rmSync(packageRoot, { recursive: true, force: true });
  }
});

test('@ui resolves to the canonical UI root', () => {
  const { packageRoot, sourceRoot } = fixture();
  try {
    write(resolve(sourceRoot, 'ui/primitives/target/index.ts'), 'export const target = true;\n');
    write(
      resolve(sourceRoot, 'ui/primitives/source/index.ts'),
      "import { target } from '@ui/primitives/target';\nexport const source = target;\n",
    );

    const result = auditCoreStructure({ packageRoot, sourceRoot });
    assert(result.findings.some(({ id }) => (
      id === 'sibling-owner-dependency:ui/primitives/source/index.ts->ui/primitives/target/index.ts'
    )));
  } finally {
    rmSync(packageRoot, { recursive: true, force: true });
  }
});

test('local import gate includes tests and distinguishes missing modules from real assets', () => {
  const { packageRoot, sourceRoot } = fixture();
  try {
    write(resolve(sourceRoot, 'feature/assets/theme.css'), ':root { color: black; }\n');
    write(resolve(packageRoot, '.storybook/helpers/index.ts'), 'export const helper = true;\n');
    write(
      resolve(sourceRoot, 'feature/tests/stale.test.ts'),
      "import '../assets/theme.css?raw';\nimport { missing } from '../retired-owner';\nvoid missing;\n",
    );
    write(
      resolve(sourceRoot, 'ui/primitives/Button/Button.stories.tsx'),
      "import { helper } from '../../../../.storybook/helpers';\nvoid helper;\n",
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
    write(
      resolve(sourceRoot, 'entrypoints/public/index.ts'),
      "export * from '../../feature';\n",
    );
    write(
      resolve(sourceRoot, 'entrypoints/public/helper.ts'),
      'export const misplacedHelper = true;\n',
    );
    write(
      resolve(sourceRoot, 'entrypoints/hidden/index.ts'),
      'export const hiddenBoundary = true;\n',
    );

    const result = auditCoreStructure({ packageRoot, sourceRoot });
    const ids = new Set(result.findings.map(({ id }) => id));

    assert(result.inventory.rootEntrypoints.includes('entrypoints/public/index.ts'));
    assert.equal(result.inventory.ignoredByKind.entrypoint, 2);
    assert(!ids.has('unclassified-root-domain:entrypoints'));
    assert(![...ids].some((id) => id.includes('entrypoints/public/index.ts')));
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
      resolve(sourceRoot, 'ui/structures/record/record/index.ts'),
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
    write(resolve(sourceRoot, 'ui/structures/card/card.ts'), 'export const card = true;\n');
    write(resolve(sourceRoot, 'ui/structures/composition.ts'), 'export const compositionFile = true;\n');
    write(resolve(sourceRoot, 'ui/structures/composition/index.ts'), 'export const localComposition = true;\n');
    write(resolve(sourceRoot, 'feature/hooks.ts'), 'export const hooksFilename = true;\n');
    write(
      resolve(sourceRoot, 'ui/structures/content/index.ts'),
      "export const prose = 'composition hooks misc ui/structures/record/record';\n",
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
      'repeated-path-segment:ui/structures/record/record',
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
