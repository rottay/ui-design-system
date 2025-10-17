import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-docs"
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
    };
  }
};
export default config;