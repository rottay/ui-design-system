import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import preserveDirectives from 'rollup-plugin-preserve-directives';
import { resolve } from 'path';

const isWatchMode = process.argv.includes('--watch');

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['src/**/*'],
      insertTypesEntry: true,
      copyDtsFiles: false,
    }),
    /**
     * We only want directive preservation on library source modules.
     *
     * Storybook's Vite preview also runs through this config, and its HTML
     * entry (`iframe.html`) makes `rollup-plugin-preserve-directives` try to
     * parse non-JS input. Restricting the plugin to actual source modules keeps
     * library output correct without breaking Storybook builds.
     */
    preserveDirectives({
      suppressPreserveModulesWarning: true,
      include: ['src/**/*.{ts,tsx,js,jsx}'],
      exclude: ['**/*.html'],
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@types': resolve(__dirname, 'src/foundation/contracts'),
      '@ui': resolve(__dirname, 'src/ui'),
    },
  },
  build: {
    // In local watch mode the DS CSS bundles are generated separately into
    // `dist/*.css`. Avoid wiping them on every JS rebuild. Production builds
    // still clean `dist/` normally.
    emptyOutDir: !isWatchMode,
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        server: resolve(__dirname, 'src/entrypoints/server/index.ts'),
        icons: resolve(__dirname, 'src/entrypoints/icons/index.ts'),
        'icons-full': resolve(__dirname, 'src/entrypoints/icons/full/index.ts'),
        'icons-preset-bithire': resolve(__dirname, 'src/entrypoints/icons/presets/bithire/index.ts'),
        'icons-corpus': resolve(__dirname, 'src/entrypoints/icons/corpus/index.ts'),
        'icons-foundation': resolve(__dirname, 'src/entrypoints/icons/foundation/index.ts'),
        'icons-bithire': resolve(__dirname, 'src/entrypoints/icons/bithire/index.ts'),
        'icons-identity': resolve(__dirname, 'src/entrypoints/icons/identity/index.ts'),
        'icons-intelligence': resolve(__dirname, 'src/entrypoints/icons/intelligence/index.ts'),
        'icons-operations': resolve(__dirname, 'src/entrypoints/icons/operations/index.ts'),
        marks: resolve(__dirname, 'src/entrypoints/graphics/marks/index.ts'),
        'marks-brand': resolve(__dirname, 'src/entrypoints/graphics/marks/brand/index.ts'),
        'marks-cloud': resolve(__dirname, 'src/entrypoints/graphics/marks/cloud/index.ts'),
        pictograms: resolve(__dirname, 'src/entrypoints/graphics/pictograms/index.ts'),
        charts: resolve(__dirname, 'src/entrypoints/charts/index.ts'),
        'chart-spec': resolve(__dirname, 'src/entrypoints/charts/spec/index.ts'),
        'chart-access': resolve(__dirname, 'src/entrypoints/charts/access/index.ts'),
        'chart-renderers': resolve(__dirname, 'src/entrypoints/charts/renderers/index.ts'),
        motion: resolve(__dirname, 'src/entrypoints/graphics/motion/index.ts'),
        effects: resolve(__dirname, 'src/entrypoints/graphics/effects/index.ts'),
        spatial: resolve(__dirname, 'src/entrypoints/graphics/spatial/index.ts'),
        'spatial-spec': resolve(__dirname, 'src/entrypoints/graphics/spatial/spec/index.ts'),
        eslint: resolve(__dirname, 'src/entrypoints/eslint/index.ts'),
        commercial: resolve(__dirname, 'src/entrypoints/commercial/index.ts'),
        // Only real package.json exports are listed as entries.
        // Component code is included via the root barrel and
        // preserveModules handles per-file output automatically.
      },
      name: 'DesignSystem',
    },
    rollupOptions: {
      // External dependencies for tree-shaking
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'd3',
        /^d3\/.*/,
        'antd',
        '@ant-design/icons',
        '@thesvg/react',
        'motion',
        'dayjs',
        // @rottay domain modules (provided by consuming app)
        /^@rottay\/.*/,
        // Externalize submodules for better tree-shaking
        /^antd\/.*/,
        /^@ant-design\/icons\/.*/,
        /^@thesvg\/react\/.*/,
        // Phosphor is intentionally NOT externalized. 2.1.10 advertises a
        // CommonJS condition that points at a `.js` file inside a
        // `type: module` package, which breaks packed CJS consumers; vendoring
        // it locally avoids exposing that upstream packaging defect.
        //
        // Do not describe the embedded surface with a specific glyph count in
        // this comment -- that claim went stale (it once said "~50-glyph")
        // and nothing here re-derives it. Two systems import Phosphor SSR
        // modules directly and both grow independently of each other: the
        // generated semantic corpus (one file per role under
        // src/graphics/icons/presentation/semantic/generated/roles, sized by
        // src/graphics/icons/foundation/semantic/corpus/manifest.json) and the
        // historical vendor-named compatibility catalog
        // (src/graphics/icons/presentation/catalog). Every entry above shares
        // one Rollup module graph with `preserveModules: true`, so any SSR
        // module reachable from ANY entry -- not just `icons`/`icons-full` --
        // is vendored into dist/node_modules once. That includes the root
        // `index` entry: several first-party ui/** primitives, patterns and
        // structures (Button's compound Icon, data-table, workspace chrome,
        // record headers...) import catalog names directly through the
        // `graphics/icons` barrel, which re-exports the whole compatibility
        // catalog, so the root entry is not supplier-free either.
        //
        // The actual post-build count is enforced, not narrated: run
        // `node scripts/icon-embed-inventory-gate.mjs` after `vite build` to
        // measure what shipped, checked against the reviewed, decrease-only
        // ceiling in scripts/icon-embed-inventory-gate.baseline.json.
        /^d3-.*/,
        /^motion\/.*/,
        /^dayjs\/.*/,
      ],
      output: [
        {
          // ESM output
          format: 'es',
          preserveModules: true,
          preserveModulesRoot: 'src',
          entryFileNames: '[name].js',
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
            'react/jsx-runtime': 'jsxRuntime',
          },
        },
        {
          // CJS output
          format: 'cjs',
          preserveModules: true,
          preserveModulesRoot: 'src',
          entryFileNames: '[name].cjs',
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
            'react/jsx-runtime': 'jsxRuntime',
          },
        },
      ],
    },
    sourcemap: false,
    minify: 'esbuild',
    // Optimize for tree-shaking
    target: 'esnext',
  },
  // Ensure proper ESM output
  esbuild: {
    treeShaking: true,
    minifyIdentifiers: true,
    minifySyntax: true,
  },
});
