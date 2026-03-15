import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-docs",
    "@storybook/addon-a11y"
  ],
  "framework": {
    "name": "@storybook/react-vite",
    "options": {}
  },
  "viteFinal": async (config) => {
    return {
      ...config,
      esbuild: {
        ...config.esbuild,
        loader: 'tsx',
        include: /\.tsx?$/,
      },
      build: {
        ...config.build,
        // Storybook's preview bundle intentionally pulls heavy vendor graphs
        // (notably Ant Design and Storybook's own mocker entry). Raising the
        // warning threshold keeps CI noise focused on actionable regressions.
        chunkSizeWarningLimit: 2200,
        rollupOptions: {
          ...config.build?.rollupOptions,
          output: {
            ...config.build?.rollupOptions?.output,
            manualChunks: (id: string) => {
              if (id.includes('node_modules/react') || id.includes('/react-dom/')) {
                return 'vendor-react';
              }

              if (id.includes('/antd/') || id.includes('@ant-design')) {
                return 'vendor-antd';
              }

              if (id.includes('/d3-') || id.includes('/d3/')) {
                return 'vendor-d3';
              }

              if (id.includes('storybook')) {
                return 'vendor-storybook';
              }

              return undefined;
            },
          },
        },
      },
    };
  }
};
export default config;
