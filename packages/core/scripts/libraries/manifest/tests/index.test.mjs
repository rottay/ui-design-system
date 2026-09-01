import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import {
  pathForManifestId,
  readManifestRecords,
  reanchorFolderIndexCssLocators,
} from '../index.mjs';

test('manifest ids map to declarative paths without changing identity', () => {
  assert.equal(pathForManifestId('palette.status-seeds'), 'palette/status-seeds');
  assert.equal(pathForManifestId('recipe-profile'), 'recipes/profile');
  assert.equal(pathForManifestId('token-overrides'), 'tokens/overrides');
});

test('manifest records are recursive, unique and path-bound', () => {
  const root = mkdtempSync(join(tmpdir(), 'manifest-records-'));
  try {
    mkdirSync(join(root, 'palette/status-seeds'), { recursive: true });
    writeFileSync(
      join(root, 'palette/status-seeds/index.json'),
      '{"controlId":"palette.status-seeds"}\n',
    );
    assert.equal(readManifestRecords(root, 'controlId').length, 1);

    mkdirSync(join(root, 'wrong'), { recursive: true });
    writeFileSync(join(root, 'wrong/index.json'), '{"controlId":"spacing.rhythm"}\n');
    assert.throws(() => readManifestRecords(root, 'controlId'), /must live at spacing\/rhythm/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('CSS locators recursively follow folder/index moves without changing suffixes or prose', () => {
  const root = mkdtempSync(join(tmpdir(), 'manifest-css-locators-'));
  try {
    const packageRoot = join(root, 'packages/core');
    mkdirSync(join(packageRoot, 'src/foundation/button'), { recursive: true });
    writeFileSync(join(packageRoot, 'src/foundation/button/index.css'), '.button {}\n');
    const value = {
      site: 'packages/core/src/foundation/button.css:12',
      nested: ['See src/foundation/button.css#--ds-button-bg for the authority.'],
      untouched: 'packages/core/src/foundation/missing.css:2',
    };

    assert.deepEqual(
      reanchorFolderIndexCssLocators(value, {
        repositoryRoot: root,
        packageRoot,
      }),
      {
        site: 'packages/core/src/foundation/button/index.css:12',
        nested: ['See src/foundation/button/index.css#--ds-button-bg for the authority.'],
        untouched: 'packages/core/src/foundation/missing.css:2',
      },
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
