/**
 * The bootstrap compiler stage of the vertical-artifact generator.
 *
 * The generator lowers each first-party theme with the package's own compiler
 * and writes two outputs from that one compile: the artifact CSS and the
 * runtime module under `src/`. That module is itself an input of the final
 * package bundle, so the generator cannot read the compiler from `dist/` — a
 * `dist/` the generator can read is a bundle that already consumed the module
 * it is about to rewrite.
 *
 * This stage therefore compiles ONLY the modules the generator imports, with
 * the package's own Vite configuration (same aliases, transforms and output
 * format), into a private directory. It is not the package build: it emits no
 * declarations, no public entry points and nothing that ships, and the
 * directory is deleted when the generator is done with it.
 */

import { existsSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

import { build, loadConfigFromFile } from 'vite';

/** Where the bootstrap compile lives while the generator runs. Never shipped. */
export const BOOTSTRAP_DIRECTORY = '.compiler-bootstrap';

/**
 * Every module the generator imports, keyed by its output path. The keys are
 * the same paths the final bundle emits under `dist/`, so the generator reads
 * one layout whichever compile it is handed.
 */
export const COMPILER_MODULES = Object.freeze({
  ground: 'infrastructure/compilers/runtime/theme/runtime/lowering/foundation/ground/index',
  brandingContrast: 'foundation/kernel/accessibility/branding-contrast/index',
  artifactRenderer: 'infrastructure/compilers/runtime/tenant-css/artifact-renderer/index',
  brandThemes: 'foundation/tokens/ts/presentation/brand-themes/index',
  roster: 'foundation/presets/verticals/roster/index',
  artifactRuntime: 'infrastructure/compilers/runtime/tenant-css/artifact-runtime/index',
});

/** The modules the bootstrap compiles: everything but the generated output. */
const BOOTSTRAP_MODULES = Object.entries(COMPILER_MODULES)
  .filter(([key]) => key !== 'artifactRuntime')
  .map(([, path]) => path);

function flattenPlugins(plugins) {
  return (plugins ?? []).flat(Infinity).filter(Boolean);
}

/**
 * Compile the generator's compiler modules from `src/` into a private
 * directory under `dist/`, run `task(compilerRoot)`, and remove the directory.
 *
 * @template T
 * @param {string} packageRoot
 * @param {(compilerRoot: string) => Promise<T>} task
 * @returns {Promise<T>}
 */
export async function withBootstrapCompiler(packageRoot, task) {
  const outDir = resolve(packageRoot, 'dist', BOOTSTRAP_DIRECTORY);
  const loaded = await loadConfigFromFile(
    { command: 'build', mode: 'production' },
    resolve(packageRoot, 'vite.config.ts'),
    packageRoot,
    'warn',
  );
  if (!loaded) throw new Error('compiler-bootstrap: vite.config.ts could not be loaded.');
  const { config } = loaded;
  const esmOutput = [config.build?.rollupOptions?.output].flat().find((output) => output?.format === 'es');
  if (!esmOutput) throw new Error('compiler-bootstrap: vite.config.ts declares no ES module output.');

  console.log(`compiler-bootstrap: compiling ${BOOTSTRAP_MODULES.length} generator modules into dist/${BOOTSTRAP_DIRECTORY} (not the package build).`);
  try {
    await build({
      ...config,
      configFile: false,
      root: packageRoot,
      logLevel: 'warn',
      // Declarations belong to the package build; the bootstrap ships nothing.
      plugins: flattenPlugins(config.plugins).filter((plugin) => plugin.name !== 'vite:dts'),
      build: {
        ...config.build,
        outDir,
        emptyOutDir: true,
        copyPublicDir: false,
        lib: {
          ...config.build.lib,
          formats: ['es'],
          entry: Object.fromEntries(
            BOOTSTRAP_MODULES.map((path) => [path, resolve(packageRoot, 'src', `${path}.ts`)]),
          ),
        },
        rollupOptions: {
          ...config.build.rollupOptions,
          output: [esmOutput],
        },
      },
    });
    return await task(outDir);
  } finally {
    if (existsSync(outDir)) rmSync(outDir, { recursive: true, force: true });
  }
}
