import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['src/**/*'],
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'DesignSystem',
      formats: ['es', 'cjs'],
      fileName: (format) => {
        const ext = format === 'es' ? 'js' : 'cjs';
        return `index.${ext}`;
      },
    },
    rollupOptions: {
      // External dependencies for tree-shaking
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'antd',
        '@heroui/react',
        'framer-motion',
        'lucide-react',
        // Externalize antd submodules for better tree-shaking
        /^antd\/.*/,
        /^@heroui\/.*/,
        /^lucide-react\/.*/,
      ],
      output: {
        // Preserve module structure for tree-shaking
        preserveModules: true,
        preserveModulesRoot: 'src',
        // Use ESM entry points for better tree-shaking
        entryFileNames: '[name].js',
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
          antd: 'antd',
        },
      },
    },
    sourcemap: true,
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
