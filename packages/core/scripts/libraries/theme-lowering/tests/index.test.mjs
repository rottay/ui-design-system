/**
 * The engine a first-party vertical lowers with is its ROSTER ROW's.
 *
 * This adapter and `tenant-css/artifact-renderer` are two doors onto the same
 * compile, so the fixtures below give the roster rows engines that differ from
 * each other AND from the primary — the one arrangement under which a
 * `PRIMARY_ENGINE` reader cannot pass.
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { brandThemeLoweringAdapter } from '../index.mjs';

const ROSTER = {
  rottay: { engine: 'classic' },
  bithire: { engine: 'rustic' },
};
const PRIMARY_ENGINE = 'modern';

function harness() {
  const resolvedEngines = [];
  const compiledWith = [];
  const module = {
    compileTheme: (_resolution, adapter) => (compiledWith.push(adapter.id), {
      cssVariables: {},
      modeBlocks: [],
      colorScheme: 'light',
      runtime: {
        personality: {},
        tokenOverrides: {},
        recipeProfile: undefined,
        experienceProfile: undefined,
      },
    }),
    liftAuthoredTheme: (theme) => theme,
    resolveAdapter: (engine) => {
      resolvedEngines.push(engine);
      return { id: engine };
    },
    emitThemeCss: () => '',
    containerScope: (selector) => selector,
    brandTenantSelector: (slug) => `[data-tenant="${slug}"]`,
    // The productive law, verbatim: the roster row's engine or a refusal. The
    // adapter must CALL it rather than re-read the row, so a stub that throws
    // for an unclaimed slug is the only shape a re-reader could not pass.
    verticalEngine: (slug) => {
      const row = ROSTER[slug];
      if (!row) throw new Error(`verticalEngine: no first-party vertical for "${slug}"`);
      return row.engine;
    },
  };

  const importModule = async (absolutePath) => {
    if (absolutePath.includes('themes/resolved')) {
      return {
        EMPTY_PROVENANCE: {},
        deriveTenantStatusSeedAuthorship: () => ({}),
      };
    }
    if (absolutePath.includes('engine-identity')) return { PRIMARY_ENGINE };
    if (absolutePath.includes('brand-themes')) {
      return { getFirstPartyVertical: (slug) => ROSTER[slug] };
    }
    throw new Error(`unexpected import: ${absolutePath}`);
  };

  return { module, importModule, resolvedEngines, compiledWith };
}

test('lowers each first-party vertical with its own roster engine', async () => {
  const { module, importModule, resolvedEngines, compiledWith } = harness();
  const compile = await brandThemeLoweringAdapter({
    module,
    coreRoot: '/core',
    importModule,
  });

  compile({ tenantSlug: 'rottay' });
  compile({ tenantSlug: 'bithire' });
  assert.deepEqual(compiledWith, ['classic', 'rustic']);
  assert.deepEqual(resolvedEngines, ['classic', 'rustic']);
});

test('resolves `PRIMARY_ENGINE` for a slug no roster row claims', async () => {
  const { module, importModule, resolvedEngines, compiledWith } = harness();
  const compile = await brandThemeLoweringAdapter({
    module,
    coreRoot: '/core',
    importModule,
  });

  compile({ tenantSlug: 'acme-labs' });
  assert.deepEqual(compiledWith, [PRIMARY_ENGINE]);
  assert.deepEqual(resolvedEngines, [PRIMARY_ENGINE]);
});

test('resolves one adapter per engine, not one per compile', async () => {
  const { module, importModule, resolvedEngines } = harness();
  const compile = await brandThemeLoweringAdapter({
    module,
    coreRoot: '/core',
    importModule,
  });

  compile({ tenantSlug: 'rottay' });
  compile({ tenantSlug: 'rottay' });
  compile({ tenantSlug: 'bithire' });
  assert.deepEqual(resolvedEngines, ['classic', 'rustic']);
});

test('asks `verticalEngine` for the answer instead of re-reading the row', async () => {
  const { module, importModule, compiledWith } = harness();
  const asked = [];
  const compile = await brandThemeLoweringAdapter({
    module: {
      ...module,
      verticalEngine: (slug) => {
        asked.push(slug);
        return module.verticalEngine(slug);
      },
    },
    coreRoot: '/core',
    importModule,
  });

  compile({ tenantSlug: 'rottay' });
  compile({ tenantSlug: 'acme-labs' });
  assert.deepEqual(asked, ['rottay']);
  assert.deepEqual(compiledWith, ['classic', PRIMARY_ENGINE]);
});

test('refuses a published module that exports no verticalEngine', async () => {
  const { module, importModule } = harness();
  const { verticalEngine: _absent, ...withoutLaw } = module;
  await assert.rejects(
    brandThemeLoweringAdapter({ module: withoutLaw, coreRoot: '/core', importModule }),
    /exports no verticalEngine/,
  );
});

test('refuses a roster module that cannot answer for a vertical', async () => {
  const { module } = harness();
  await assert.rejects(
    brandThemeLoweringAdapter({
      module,
      coreRoot: '/core',
      importModule: async (absolutePath) => {
        if (absolutePath.includes('themes/resolved')) {
          return { EMPTY_PROVENANCE: {}, deriveTenantStatusSeedAuthorship: () => ({}) };
        }
        if (absolutePath.includes('engine-identity')) return { PRIMARY_ENGINE };
        return {};
      },
    }),
    /exports no getFirstPartyVertical/,
  );
});
