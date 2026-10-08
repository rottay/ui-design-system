import { existsSync, statSync } from 'node:fs';
import { relative, resolve, sep } from 'node:path';
import { argumentValue } from '../arguments/index.mjs';
import { componentsDir } from '../paths/index.mjs';

/**
 * Drill seam for the HARD-2 counters (`tests/hardcodes`): a planted file is
 * read by the production classifiers and its counts land on a real anchor
 * key -- a rostered skin, a non-rostered component -- so a drill reds exactly
 * as the same edit in the tree would. Normal runs pass none.
 */
const HARDCODE_FIXTURE_FLAGS = {
  skin: '--hardcode-fixture-skin',
  source: '--hardcode-fixture-source',
  foundation: '--hardcode-fixture-foundation',
};
const FIXTURE_SKIN_ANCHOR = 'runtime/engines/modern/skin/button/index.css';
const FIXTURE_SOURCE_ANCHOR = 'patterns/customization/token-inspector/index.tsx';
const hardcodeFixtures = Object.fromEntries(
  Object.entries(HARDCODE_FIXTURE_FLAGS).map(([kind, flag]) => {
    const value = argumentValue(flag);
    if (value === undefined) return [kind, null];
    const path = resolve(value);
    if (!existsSync(path) || !statSync(path).isFile()) throw new Error(`${flag} fixture does not exist: ${path}`);
    return [kind, path];
  }),
);
const hardcodeFixtureActive = Object.values(hardcodeFixtures).some(Boolean);

function componentRelOf(file) {
  return file === hardcodeFixtures.source
    ? FIXTURE_SOURCE_ANCHOR
    : relative(componentsDir, file).split(sep).join('/');
}

function withSourceFixture(sourceFiles) {
  return hardcodeFixtures.source ? [...sourceFiles, hardcodeFixtures.source] : sourceFiles;
}

export {
  FIXTURE_SKIN_ANCHOR,
  FIXTURE_SOURCE_ANCHOR,
  hardcodeFixtures,
  hardcodeFixtureActive,
  componentRelOf,
  withSourceFixture,
};
