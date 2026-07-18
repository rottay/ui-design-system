#!/usr/bin/env node
/**
 * Copies the opt-in font packs into dist/fonts/ so the package.json
 * `./fonts/<id>.css` subpath exports resolve after publish.
 *
 * Layout contract: each pack directory under
 * src/foundation/tokens/css/foundation/typography/font-packs/<id>/ holds an
 * index.css plus its woff2 files, and every @font-face references its woff2
 * as a sibling-relative url. The copy therefore FLATTENS: <id>/index.css
 * becomes dist/fonts/<id>.css and every woff2 lands beside it in dist/fonts/,
 * which preserves the relative url resolution. Woff2 basenames must stay
 * unique across packs; the copy fails closed on a collision.
 */
import { copyFileSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const packsRoot = join(
  packageRoot,
  'src/foundation/tokens/css/foundation/typography/font-packs'
);
const outDir = join(packageRoot, 'dist/fonts');

const NON_PACK_DIRS = new Set(['manifest', 'tests']);

export function buildFontPacks() {
  mkdirSync(outDir, { recursive: true });
  const seenAssets = new Map();
  const copied = [];
  for (const entry of readdirSync(packsRoot).sort()) {
    const packDir = join(packsRoot, entry);
    if (NON_PACK_DIRS.has(entry) || !statSync(packDir).isDirectory()) continue;
    const files = readdirSync(packDir).sort();
    if (!files.includes('index.css')) {
      throw new Error(`font pack ${entry} has no index.css`);
    }
    copyFileSync(join(packDir, 'index.css'), join(outDir, `${entry}.css`));
    copied.push(`${entry}.css`);
    for (const file of files) {
      if (!file.endsWith('.woff2')) continue;
      const collision = seenAssets.get(file);
      if (collision) {
        throw new Error(
          `woff2 basename collision: ${file} in both ${collision} and ${entry}`
        );
      }
      seenAssets.set(file, entry);
      copyFileSync(join(packDir, file), join(outDir, file));
      copied.push(file);
    }
  }
  return copied;
}

const copied = buildFontPacks();
process.stdout.write(`build-font-packs: ${copied.length} files -> dist/fonts\n`);
