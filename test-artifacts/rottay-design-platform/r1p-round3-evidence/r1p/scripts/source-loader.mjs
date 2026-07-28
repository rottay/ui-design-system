/**
 * Load @rottay/design-system core modules from SOURCE (not dist).
 *
 * dist/ is frozen for this wave (AD-9 / no package build), so every W1 script
 * that must see the edited compiler resolves TypeScript through vite's SSR
 * pipeline with the package's own alias config. Vite itself is resolved from
 * the package because these scripts live outside its node_modules tree.
 */
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

export const CORE_ROOT = '/Users/daniel/Developer/Rottay/ui-design-system/packages/core';

const requireFromCore = createRequire(`${CORE_ROOT}/package.json`);

export async function loadSource(specifiers) {
  const viteNamespace = await import(
    pathToFileURL(requireFromCore.resolve('vite')).href
  );
  const vite = viteNamespace.createServer ? viteNamespace : viteNamespace.default;
  const server = await vite.createServer({
    root: CORE_ROOT,
    configFile: false,
    logLevel: 'error',
    resolve: { alias: { '@': `${CORE_ROOT}/src` } },
    server: { middlewareMode: true, hmr: false, watch: null },
    optimizeDeps: { noDiscovery: true, include: [] },
  });
  try {
    const loaded = {};
    for (const [key, path] of Object.entries(specifiers)) {
      loaded[key] = await server.ssrLoadModule(path);
    }
    return loaded;
  } finally {
    await server.close();
  }
}

export const CORE_SPECIFIERS = {
  compiler: '/src/infrastructure/compilers/kernel/runtime/brand-theme/index.ts',
  renderer: '/src/infrastructure/compilers/runtime/tenant-css/artifact-renderer/index.ts',
  apca: '/src/foundation/kernel/accessibility/branding-contrast/index.ts',
  bithire: '/src/foundation/tokens/ts/presentation/brand-themes/bithire/index.ts',
  evnto: '/src/foundation/tokens/ts/presentation/brand-themes/evnto/index.ts',
  platform: '/src/foundation/tokens/ts/presentation/brand-themes/platform/index.ts',
};
