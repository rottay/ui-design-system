import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import preserveDirectives from 'rollup-plugin-preserve-directives';
import { resolve } from 'path';

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
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        server: resolve(__dirname, 'src/server.ts'),
        icons: resolve(__dirname, 'src/icons.ts'),
        i18n: resolve(__dirname, 'src/i18n.ts'),
        tokens: resolve(__dirname, 'src/tokens.ts'),
        'components/index': resolve(__dirname, 'src/components/index.ts'),
        'components/patterns/index': resolve(__dirname, 'src/components/patterns/index.ts'),
        'components/primitives/index': resolve(__dirname, 'src/components/primitives/index.ts'),
        'components/structures/index': resolve(__dirname, 'src/components/structures/index.ts'),
        'components/surfaces/index': resolve(__dirname, 'src/components/surfaces/index.ts'),
        'components/patterns/data/data-table/index': resolve(
          __dirname,
          'src/components/patterns/data/data-table/index.ts'
        ),
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
