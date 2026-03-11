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
    preserveDirectives(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@types': resolve(__dirname, 'src/core/types'),
      '@components': resolve(__dirname, 'src/components'),
      '@core': resolve(__dirname, 'src/core'),
    },
  },
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        icons: resolve(__dirname, 'src/icons.ts'),
      },
      name: 'DesignSystem',
    },
    rollupOptions: {
      // External dependencies for tree-shaking
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        '@heroui/react',
        'framer-motion',
        'lucide-react',
        'dayjs',
        // @rottay domain modules (provided by consuming app)
        /^@rottay\/.*/,
        // Externalize submodules for better tree-shaking
        /^@heroui\/.*/,
        /^lucide-react\/.*/,
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
