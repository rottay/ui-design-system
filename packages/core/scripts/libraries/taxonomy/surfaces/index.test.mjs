import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  buildPinnedSurfaceCapabilityCensus,
  buildSurfaceCapabilityCensus,
  resolveSurfaceCapabilityRepository,
  serializeSurfaceCapabilityCensus,
  SURFACE_CAPABILITY_KINDS,
  SURFACE_CAPABILITY_PINS,
} from './index.mjs';
import { repoRoot as findRepoRoot } from '../../repo-root/index.mjs';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const designSystemRoot = findRepoRoot(scriptDirectory);
const workspaceRoot = path.dirname(designSystemRoot);

test('surface capability census derives deterministic productive registrations', async () => {
  const root = path.join(tmpdir(), `rottay-arc11-census-${process.pid}`);
  await rm(root, { recursive: true, force: true });
  await mkdir(path.join(root, 'src/app'), { recursive: true });
  await mkdir(path.join(root, 'src/app/(shell)/people'), { recursive: true });
  await mkdir(path.join(root, 'src/features/people'), { recursive: true });
  await mkdir(path.join(root, 'src/features/people/__tests__'), { recursive: true });
  await writeFile(path.join(root, 'src/app/page.tsx'), 'export default function Home() { return null; }\n');
  await writeFile(path.join(root, 'src/app/(shell)/people/page.tsx'), 'export default function Page() { return null; }\n');
  await writeFile(path.join(root, 'src/features/people/index.tsx'), `
    const columns = [{ fieldId: 'person.name', key: 'name' }];
    const config = {
      fields: [{ fieldId: 'person.email', name: 'email' }],
      tabs: [{ permissionId: 'person.audit', key: 'audit' }],
      actions: [{ id: 'person.edit' }],
      capabilityRegistry: [{ kind: 'action', id: 'person.archive' }],
    };
    void columns; void config;
  `);
  await writeFile(path.join(root, 'src/features/people/__tests__/ignored.test.ts'), `
    const actions = [{ id: 'test.only' }]; void actions;
  `);

  try {
    const first = await buildSurfaceCapabilityCensus(root, { app: 'app-fixture' });
    const second = await buildSurfaceCapabilityCensus(root, { app: 'app-fixture' });
    assert.equal(first.app, 'app-fixture');
    assert.equal(Object.hasOwn(first, 'provenance'), false);
    assert.equal(serializeSurfaceCapabilityCensus(first), serializeSurfaceCapabilityCensus(second));
    assert.deepEqual(first.counts, { route: 2, field: 1, column: 1, tab: 1, action: 2 });
    assert.equal(first.entries.some((entry) => entry.id === 'test.only'), false);
    assert.deepEqual(
      first.entries.filter((entry) => entry.kind === 'route').map((entry) => entry.id),
      ['/', '/people'],
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('surface capability census refuses to infer the app name', async () => {
  await assert.rejects(buildSurfaceCapabilityCensus(tmpdir()), /explicit app name/);
});

test('pinned census materializes the pinned commit and names the app explicitly', async () => {
  const repository = path.join(tmpdir(), `rottay-arc11-pin-${process.pid}`, 'app-bithire-pin');
  await rm(path.dirname(repository), { recursive: true, force: true });
  await mkdir(path.join(repository, 'src/app'), { recursive: true });
  const run = (...args) => execFileSync('git', ['-C', repository, ...args], { encoding: 'utf8' }).trim();

  try {
    run('init', '-q');
    await writeFile(path.join(repository, 'src/app/page.tsx'), 'export default function Home() { return null; }\n');
    run('add', '-A');
    run('-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-qm', 'pinned');
    const pinned = run('rev-parse', 'HEAD');
    await writeFile(path.join(repository, 'src/app/drift.tsx'), 'const actions = [{ id: \'drift.only\' }]; void actions;\n');
    const pins = { 'app-bithire': pinned };

    const census = await buildPinnedSurfaceCapabilityCensus({ app: 'app-bithire', repository, pins });
    assert.equal(census.app, 'app-bithire');
    assert.deepEqual(census.provenance, { commit: pinned, materialization: 'git-archive:src' });
    assert.deepEqual(census.counts, { route: 1, field: 0, column: 0, tab: 0, action: 0 });

    await assert.rejects(
      buildPinnedSurfaceCapabilityCensus({ app: 'app-bithire-pin', repository, pins }),
      /no pinned commit for app-bithire-pin/,
    );
    await assert.rejects(
      buildPinnedSurfaceCapabilityCensus({ app: 'app-bithire', repository, pins: { 'app-bithire': pinned.slice(0, 9) } }),
      /full 40-hex commit/,
    );
    await assert.rejects(
      buildPinnedSurfaceCapabilityCensus({ app: 'app-bithire', repository, pins: { 'app-bithire': '0'.repeat(40) } }),
      /is not a commit/,
    );
    await assert.rejects(
      buildPinnedSurfaceCapabilityCensus({ app: 'app-bithire', repository: path.join(repository, 'missing'), pins }),
      /is not a commit/,
    );
  } finally {
    await rm(path.dirname(repository), { recursive: true, force: true });
  }
});

test('an explicit repository override never falls back to the sibling', () => {
  const workspace = '/workspace';
  assert.equal(resolveSurfaceCapabilityRepository('app-evnto', { env: {}, workspaceRoot: workspace }), '/workspace/app-evnto');
  assert.equal(
    resolveSurfaceCapabilityRepository('app-evnto', { env: { APP_EVNTO_ROOT: '/pins/evnto' }, workspaceRoot: workspace }),
    '/pins/evnto',
  );
  assert.throws(
    () => resolveSurfaceCapabilityRepository('app-evnto', { env: { APP_EVNTO_ROOT: ' ' }, workspaceRoot: workspace }),
    /APP_EVNTO_ROOT is set but blank/,
  );
});

test('committed fleet capability registries equal the pinned productive app sources', async () => {
  for (const app of Object.keys(SURFACE_CAPABILITY_PINS)) {
    const census = await buildPinnedSurfaceCapabilityCensus({
      app,
      repository: resolveSurfaceCapabilityRepository(app, { env: process.env, workspaceRoot }),
    });
    const artifact = await readFile(
      path.join(
        designSystemRoot,
        'packages/core/artifacts/quality/architecture/surface-capabilities',
        app.replace(/^app-/, ''),
        'index.json',
      ),
      'utf8',
    );

    assert.equal(JSON.parse(artifact).provenance?.commit, SURFACE_CAPABILITY_PINS[app], `${app} artifact provenance is not the pin`);
    assert.equal(artifact, serializeSurfaceCapabilityCensus(census), `${app} census is stale`);
    for (const kind of SURFACE_CAPABILITY_KINDS) {
      assert.ok(census.counts[kind] > 0, `${app} must register at least one ${kind}`);
    }
  }
});
