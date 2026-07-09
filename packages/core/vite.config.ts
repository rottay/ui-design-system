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
      '@types': resolve(__dirname, 'src/contracts'),
      '@components': resolve(__dirname, 'src/components'),
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
        server: resolve(__dirname, 'src/server.ts'),
        icons: resolve(__dirname, 'src/icons.ts'),
        eslint: resolve(__dirname, 'src/eslint.ts'),
        commercial: resolve(__dirname, 'src/commercial.ts'),
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
        '@heroui/react',
        'framer-motion',
        'lucide-react',
        'd3',
        'geist',
        'dayjs',
        // @rottay domain modules (provided by consuming app)
        /^@rottay\/.*/,
        // Externalize submodules for better tree-shaking
        /^antd\/.*/,
        /^@ant-design\/icons\/.*/,
        /^@heroui\/.*/,
        /^lucide-react\/.*/,
        /^d3-.*/,
        /^geist\/.*/,
        /^framer-motion\/.*/,
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
