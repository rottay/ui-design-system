/**
 * The engine a first-party vertical lowers with is its ROSTER ROW's, and there
 * is no engine at all without a vertical.
 *
 * This adapter and `tenant-css/artifact-renderer` are two doors onto the same
 * compile, so the fixtures below give the roster rows engines that differ from
 * each other AND from the primary — the one arrangement under which a
 * `PRIMARY_ENGINE` reader cannot pass. The harness REFUSES to serve the
 * engine-identity contract at all, so a reintroduced default cannot even load.
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { brandThemeLoweringAdapter, UnknownVerticalError } from '../index.mjs';

const ROSTER = {
  rottay: { engine: 'classic' },
  bithire: { engine: 'rustic' },
};

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
    // The engine-identity contract is NOT served: the adapter has no default
    // engine to fall back to any more, so an import of it is a regression this
    // harness fails on rather than feeds.
    if (absolutePath.includes('engine-identity')) {
      throw new Error('the adapter must not load the engine-identity contract');
    }
    if (absolutePath.includes('brand-themes')) {
      return { getFirstPartyVertical: (slug) => ROSTER[slug] };
    }
    // WO-CAT-03: the lowering and the lift are internal owners now, reached by
    // absolute dist path instead of off the closed public entry point.
    if (absolutePath.includes('runtime/lowering')) {
      return { compileTheme: module.compileTheme };
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

  compile({ vertical: 'rottay', tenantSlug: 'rottay' });
  compile({ vertical: 'bithire', tenantSlug: 'bithire' });
  assert.deepEqual(compiledWith, ['classic', 'rustic']);
  assert.deepEqual(resolvedEngines, ['classic', 'rustic']);
});

/* F-27, in the form the DT adjudicated post-CAN-06.
 *
 * The fiche's literal criterion was "a slug without a roster row throws". It
 * assumed slug ≡ vertical. Under the admission law a CUSTOMER tenant has no
 * roster row by construction — the DB door refuses first-party slugs, so a
 * cross-door parity drill can only compile under `probe-tenant-<vertical>` —
 * and fail-closing on the slug refuses every legitimate reader while the real
 * defect goes untouched. The strengthened criterion is the one below: no engine
 * resolution ANYWHERE without a valid vertical. The default branch is deleted,
 * not made unobservable. */

test('F-27 (DT-adjudicated form, post-CAN-06): an unknown vertical is refused, with no default engine', async () => {
  const { module, importModule, resolvedEngines, compiledWith } = harness();
  const compile = await brandThemeLoweringAdapter({
    module,
    coreRoot: '/core',
    importModule,
  });

  assert.throws(
    () => compile({ vertical: 'acme-labs', tenantSlug: 'acme-labs' }),
    (error) =>
      error instanceof UnknownVerticalError &&
      /no first-party vertical declares an engine for "acme-labs"/.test(error.message),
  );
  assert.deepEqual(compiledWith, [], 'nothing was compiled');
  assert.deepEqual(resolvedEngines, [], 'and no adapter was resolved');
});

test('F-27 (DT-adjudicated form, post-CAN-06): a MISSING vertical is refused too', async () => {
  const { module, importModule, resolvedEngines } = harness();
  const compile = await brandThemeLoweringAdapter({
    module,
    coreRoot: '/core',
    importModule,
  });

  // The shape every caller used before this change: a slug and nothing else.
  assert.throws(() => compile({ tenantSlug: 'rottay' }), UnknownVerticalError);
  assert.throws(() => compile({}), UnknownVerticalError);
  assert.deepEqual(resolvedEngines, []);
});

test('F-27 (DT-adjudicated form, post-CAN-06): a rosterless CUSTOMER slug WITH a valid vertical resolves', async () => {
  // The reader the fiche's literal form would have broken: `chromeDoors` in the
  // ingress probe compiles the same chrome entry through both doors, and the DB
  // door refuses a reserved first-party slug. So the static half must compile
  // for `probe-tenant-rottay`, which no roster row claims — and it must still
  // get ROTTAY's engine, because the vertical is what answers that question.
  const { module, importModule, resolvedEngines, compiledWith } = harness();
  const compile = await brandThemeLoweringAdapter({
    module,
    coreRoot: '/core',
    importModule,
  });

  compile({ vertical: 'rottay', tenantSlug: 'probe-tenant-rottay' });
  compile({ vertical: 'bithire', tenantSlug: 'probe-tenant-bithire' });
  assert.deepEqual(compiledWith, ['classic', 'rustic']);
  assert.deepEqual(resolvedEngines, ['classic', 'rustic']);
});

test('the tenant slug feeds the emission selector and decides nothing else', async () => {
  const { module, importModule, compiledWith } = harness();
  const selectors = [];
  const compile = await brandThemeLoweringAdapter({
    module: { ...module, brandTenantSelector: (slug) => (selectors.push(slug), `[t="${slug}"]`) },
    coreRoot: '/core',
    importModule,
  });

  // One vertical, two slugs: same engine, different selector.
  compile({ vertical: 'rottay', tenantSlug: 'rottay' });
  compile({ vertical: 'rottay', tenantSlug: 'probe-tenant-rottay' });
  assert.deepEqual(compiledWith, ['classic', 'classic']);
  assert.deepEqual(selectors, ['rottay', 'probe-tenant-rottay']);
});

test('resolves one adapter per engine, not one per compile', async () => {
  const { module, importModule, resolvedEngines } = harness();
  const compile = await brandThemeLoweringAdapter({
    module,
    coreRoot: '/core',
    importModule,
  });

  compile({ vertical: 'rottay', tenantSlug: 'rottay' });
  compile({ vertical: 'rottay', tenantSlug: 'probe-tenant-rottay' });
  compile({ vertical: 'bithire', tenantSlug: 'bithire' });
  assert.deepEqual(resolvedEngines, ['classic', 'rustic']);
});

test('asks `verticalEngine` for the answer instead of re-reading the row', async () => {
  const { module, importModule, compiledWith } = harness();
  const asked = [];
  const compile = await brandThemeLoweringAdapter({
    module: {
      ...module,
      verticalEngine: (vertical) => {
        asked.push(vertical);
        return module.verticalEngine(vertical);
      },
    },
    coreRoot: '/core',
    importModule,
  });

  // The VERTICAL is what the law is asked about — never the tenant slug, which
  // is what the two questions being one value used to hide.
  compile({ vertical: 'rottay', tenantSlug: 'probe-tenant-rottay' });
  compile({ vertical: 'bithire', tenantSlug: 'probe-tenant-bithire' });
  assert.deepEqual(asked, ['rottay', 'bithire']);
  assert.deepEqual(compiledWith, ['classic', 'rustic']);
});

test('refuses a published module that exports no verticalEngine', async () => {
  const { module, importModule } = harness();
  const { verticalEngine: _absent, ...withoutLaw } = module;
  await assert.rejects(
    brandThemeLoweringAdapter({ module: withoutLaw, coreRoot: '/core', importModule }),
    /exports no verticalEngine/,
  );
});

test('refuses an internal lowering owner that exports no compileTheme', async () => {
  const { module, importModule } = harness();
  await assert.rejects(
    brandThemeLoweringAdapter({
      module,
      coreRoot: '/core',
      importModule: async (absolutePath) =>
        absolutePath.includes('runtime/lowering') ? {} : importModule(absolutePath),
    }),
    /internal lowering owner exports no compileTheme/,
  );
});

test('does not read the lowering or the lift off the public entry point', async () => {
  // F-24: `dist/server.js` publishing `compileTheme` + `liftAuthoredTheme` was
  // a complete route around the admission. The adapter must survive their
  // absence from the published module, because they are absent from it now.
  const { module, importModule, compiledWith } = harness();
  const { compileTheme: _lowering, liftAuthoredTheme: _lift, ...closedDoor } = module;
  assert.equal(closedDoor.liftAuthoredTheme, undefined);
  const compile = await brandThemeLoweringAdapter({
    module: closedDoor,
    coreRoot: '/core',
    importModule,
  });
  compile({ vertical: 'rottay', tenantSlug: 'rottay' });
  assert.deepEqual(compiledWith, ['classic']);
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
        return {};
      },
    }),
    /exports no getFirstPartyVertical/,
  );
});
