import assert from 'node:assert/strict';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  buildSurfaceCapabilityCensus,
  serializeSurfaceCapabilityCensus,
  SURFACE_CAPABILITY_KINDS,
} from './lib/surface-capability-census.mjs';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const designSystemRoot = path.resolve(scriptDirectory, '../../..');
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
    const first = await buildSurfaceCapabilityCensus(root);
    const second = await buildSurfaceCapabilityCensus(root);
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

test('committed fleet capability registries equal the productive app sources', async () => {
  for (const app of ['app-bithire', 'app-evnto', 'app-platform']) {
    const census = await buildSurfaceCapabilityCensus(path.join(workspaceRoot, app));
    const artifact = await readFile(
      path.join(designSystemRoot, 'test-artifacts/architecture/arc-11', `${app}.surface-capabilities.generated.json`),
      'utf8',
    );

    assert.equal(artifact, serializeSurfaceCapabilityCensus(census), `${app} census is stale`);
    for (const kind of SURFACE_CAPABILITY_KINDS) {
      assert.ok(census.counts[kind] > 0, `${app} must register at least one ${kind}`);
    }
  }
});
