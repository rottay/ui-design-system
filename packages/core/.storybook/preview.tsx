import type { Preview } from '@storybook/react-vite'
import { ThemeProvider, EngineProvider } from '../src/core/providers';
import type { EngineName } from '../src/core/types/engine';
import React from 'react';

// Import tenant CSS files
import '../src/theme/tokens/css/themes/default.css';
import '../src/theme/tokens/css/tenants/rottay/index.css';
import '../src/theme/tokens/css/tenants/bithire/index.css';

// Storybook preview styles
import './preview-styles.css';

const preview: Preview = {
  globalTypes: {
    engine: {
      name: 'Engine',
      description: 'Rendering engine for components',
      defaultValue: 'titan',
      toolbar: {
        icon: 'wrench',
        items: [
          { value: 'titan', title: 'Titan (Ant Design)' },
          { value: 'hermes', title: 'Hermes (DaisyUI)' },
          { value: 'apollo', title: 'Apollo (Vanilla)' },
        ],
        showName: true,
        dynamicTitle: true,
      },
    },
    tenant: {
      name: 'Tenant',
      description: 'Visual theme tenant',
      defaultValue: 'rottay',
      toolbar: {
        icon: 'paintbrush',
        items: [
          { value: 'rottay', title: 'Rottay (Default)' },
          { value: 'bithire', title: 'BitHire' },
        ],
        showName: true,
        dynamicTitle: true,
      },
    },
  },

  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
      expanded: true,
      sort: 'requiredFirst',
    },

    actions: {
      argTypesRegex: '^on[A-Z].*',
    },

    a11y: {
      config: {
        rules: [
          {
            id: 'region',
            enabled: false,
          },
        ],
      },
      options: {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21aa'],
        },
      },
    },

    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#1f1f1f' },
        { name: 'gray', value: '#f5f5f5' },
      ],
    },

    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: { width: '375px', height: '667px' },
        },
        tablet: {
          name: 'Tablet',
          styles: { width: '768px', height: '1024px' },
        },
        desktop: {
          name: 'Desktop',
          styles: { width: '1440px', height: '900px' },
        },
        wide: {
          name: 'Wide Screen',
          styles: { width: '1920px', height: '1080px' },
        },
      },
    },

    docs: {
      toc: true,
    },

    layout: 'padded',

    options: {
      storySort: {
        order: [
          'Introduction',
          'System',
          'Primitives',
          ['Display', 'Inputs', 'Feedback', 'Layout', 'Navigation', 'Overlay'],
          'Custom',
        ],
      },
    },
  },

  decorators: [
    (Story, context) => {
      const selectedTenant = (context.globals.tenant || 'rottay') as string;
      const selectedEngine = (context.globals.engine || 'titan') as EngineName;

      return (
        <EngineProvider defaultEngine={selectedEngine}>
          <ThemeProvider>
            <div
              data-tenant={selectedTenant}
              style={{ padding: '20px', minHeight: '100%' }}
            >
              <Story />
            </div>
          </ThemeProvider>
        </EngineProvider>
      );
    },
  ],
};

export default preview;
