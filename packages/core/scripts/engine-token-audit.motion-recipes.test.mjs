/**
 * WO-CRA-15 adoption floor: the motion recipe canon must keep >= 3 distinct
 * component consumers. Guards both the counting method (call-shaped signal,
 * per-component de-duplication) and the LIVE tree against regressing to the
 * zero-functional-consumer state audit MOT-02 found.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, readdirSync, statSync } from 'node:fs';

import {
  MOTION_RECIPE_CONSUMER_RE,
  componentOwnerOf,
  countMotionRecipeConsumers,
} from './lib/motion-recipe-consumer-counter.mjs';
import { ENGINE_TOKEN_MINIMUM } from './lib/engine-token-governance.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const componentsDir = resolve(here, '../src/ui');

test('consumer signal matches calls only, not mentions or re-exports', () => {
  assert.ok(MOTION_RECIPE_CONSUMER_RE.test("const m = useMotionRecipe('feedback.press');"));
  assert.ok(MOTION_RECIPE_CONSUMER_RE.test("useMotionRecipePresentation('overlay.modal', {})"));
  assert.ok(!MOTION_RECIPE_CONSUMER_RE.test("export { useMotionRecipe } from './recipe';"));
  assert.ok(!MOTION_RECIPE_CONSUMER_RE.test('// docs mention useMotionRecipe somewhere'));
  assert.ok(!MOTION_RECIPE_CONSUMER_RE.test("useMotionRecipeX('nope')"));
});

test('several engine files of one component count as ONE consumer', () => {
  const dir = mkdtempSync(join(tmpdir(), 'recipe-consumers-'));
  try {
    const componentA = join(dir, 'primitives/inputs/Button/engines/modern');
    const componentA2 = join(dir, 'primitives/inputs/Button/engines/rustic');
    const componentB = join(dir, 'primitives/overlay/Modal/engines/modern');
    for (const d of [componentA, componentA2, componentB]) mkdirSync(d, { recursive: true });

    const files = [
      join(componentA, 'index.tsx'),
      join(componentA2, 'index.tsx'),
      join(componentB, 'index.tsx'),
    ];
    writeFileSync(files[0], "useMotionRecipePresentation('feedback.press')");
    writeFileSync(files[1], "useMotionRecipePresentation('feedback.press')");
    writeFileSync(files[2], "useMotionRecipe('overlay.modal')");

    assert.equal(
      countMotionRecipeConsumers({ sourceFiles: files, componentsDir: dir }),
      2,
    );
    assert.equal(
      componentOwnerOf(files[0], dir),
      componentOwnerOf(files[1], dir),
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('governance declares the >=3 minimum floor for motion.recipeConsumers', () => {
  assert.equal(ENGINE_TOKEN_MINIMUM['motion.recipeConsumers'], 3);
});

test('LIVE tree: at least 3 distinct components consume the recipe canon', () => {
  const sourceFiles = [];
  const walk = (dir) => {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        walk(full);
        continue;
      }
      if (!/\.tsx?$/.test(full)) continue;
      if (/__tests__|\.(test|spec|stories)\./.test(full)) continue;
      sourceFiles.push(full);
    }
  };
  walk(componentsDir);

  const count = countMotionRecipeConsumers({ sourceFiles, componentsDir });
  assert.ok(
    count >= ENGINE_TOKEN_MINIMUM['motion.recipeConsumers'],
    `motion.recipeConsumers=${count} below floor ${ENGINE_TOKEN_MINIMUM['motion.recipeConsumers']}`,
  );
});
