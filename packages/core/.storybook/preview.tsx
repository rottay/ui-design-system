import type { Preview } from '@storybook/react-vite'
import { ThemeProvider } from '../src/providers/ThemeProvider';
import type { TemplateName } from '../src/themes/types';
import React from 'react';

const preview: Preview = {
  // Global types para el toolbar
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
    theme: {
      name: 'Theme',
      description: 'Design system theme (affects ALL components)',
      defaultValue: 'base',
      toolbar: {
        icon: 'paintbrush',
        items: [
          // Ant Design Themes (8)
          { value: 'base', title: 'Base', icon: 'circle' },
          { value: 'spotify', title: 'Spotify', icon: 'graphline' },
          { value: 'stripe', title: 'Stripe', icon: 'lightning' },
          { value: 'airbnb', title: 'Airbnb', icon: 'home' },
          { value: 'slack', title: 'Slack', icon: 'comment' },
          { value: 'notion', title: 'Notion', icon: 'document' },
          { value: 'linear', title: 'Linear', icon: 'dashboard' },
          { value: 'vercel', title: 'Vercel', icon: 'contrast' },
          // DaisyUI Themes (30)
          { value: 'daisyui-light', title: 'DaisyUI: Light', icon: 'sun' },
          { value: 'daisyui-dark', title: 'DaisyUI: Dark', icon: 'moon' },
          { value: 'daisyui-cupcake', title: 'DaisyUI: Cupcake', icon: 'heart' },
          { value: 'daisyui-bumblebee', title: 'DaisyUI: Bumblebee', icon: 'star' },
          { value: 'daisyui-emerald', title: 'DaisyUI: Emerald', icon: 'circle' },
          { value: 'daisyui-corporate', title: 'DaisyUI: Corporate', icon: 'bookmark' },
          { value: 'daisyui-synthwave', title: 'DaisyUI: Synthwave', icon: 'lightning' },
          { value: 'daisyui-retro', title: 'DaisyUI: Retro', icon: 'camera' },
          { value: 'daisyui-cyberpunk', title: 'DaisyUI: Cyberpunk', icon: 'eye' },
          { value: 'daisyui-valentine', title: 'DaisyUI: Valentine', icon: 'hearthollow' },
          { value: 'daisyui-halloween', title: 'DaisyUI: Halloween', icon: 'beaker' },
          { value: 'daisyui-garden', title: 'DaisyUI: Garden', icon: 'grow' },
          { value: 'daisyui-forest', title: 'DaisyUI: Forest', icon: 'component' },
          { value: 'daisyui-aqua', title: 'DaisyUI: Aqua', icon: 'drop' },
          { value: 'daisyui-lofi', title: 'DaisyUI: Lofi', icon: 'calendar' },
          { value: 'daisyui-pastel', title: 'DaisyUI: Pastel', icon: 'paintbrush' },
          { value: 'daisyui-fantasy', title: 'DaisyUI: Fantasy', icon: 'starhollow' },
          { value: 'daisyui-wireframe', title: 'DaisyUI: Wireframe', icon: 'outline' },
          { value: 'daisyui-black', title: 'DaisyUI: Black', icon: 'circlehollow' },
          { value: 'daisyui-luxury', title: 'DaisyUI: Luxury', icon: 'diamond' },
          { value: 'daisyui-dracula', title: 'DaisyUI: Dracula', icon: 'bookmark' },
          { value: 'daisyui-cmyk', title: 'DaisyUI: CMYK', icon: 'photo' },
          { value: 'daisyui-autumn', title: 'DaisyUI: Autumn', icon: 'book' },
          { value: 'daisyui-business', title: 'DaisyUI: Business', icon: 'graphbar' },
          { value: 'daisyui-acid', title: 'DaisyUI: Acid', icon: 'lightning' },
          { value: 'daisyui-lemonade', title: 'DaisyUI: Lemonade', icon: 'contrast' },
          { value: 'daisyui-night', title: 'DaisyUI: Night', icon: 'moon' },
          { value: 'daisyui-coffee', title: 'DaisyUI: Coffee', icon: 'contrast' },
          { value: 'daisyui-winter', title: 'DaisyUI: Winter', icon: 'snowflake' },
        ],
        showName: true,
        dynamicTitle: true,
      },
    },
  },

  parameters: {
    // 1. Controls mejorados
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
      expanded: true, // Expandir todos los controles por defecto
      sort: 'requiredFirst', // Mostrar props requeridas primero
    },

    // 2. Actions - auto-detectar callbacks
    actions: {
      argTypesRegex: '^on[A-Z].*', // onClick, onChange, onSubmit, etc.
    },

    // Accesibilidad (a11y)
    a11y: {
      config: {
        rules: [
          {
            // Deshabilita la regla de región para componentes aislados
            id: 'region',
            enabled: false,
          },
        ],
      },
      options: {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21aa'], // Estándares WCAG
        },
      },
    },

    // 3. Backgrounds personalizados
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff',
        },
        {
          name: 'dark',
          value: '#1f1f1f',
        },
        {
          name: 'gray',
          value: '#f5f5f5',
        },
        {
          name: 'spotify-dark',
          value: '#121212',
        },
      ],
    },

    // 4. Viewport responsive
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: {
            width: '375px',
            height: '667px',
          },
        },
        tablet: {
          name: 'Tablet',
          styles: {
            width: '768px',
            height: '1024px',
          },
        },
        desktop: {
          name: 'Desktop',
          styles: {
            width: '1440px',
            height: '900px',
          },
        },
        wide: {
          name: 'Wide Screen',
          styles: {
            width: '1920px',
            height: '1080px',
          },
        },
      },
    },

    // 5. Docs mejoradas
    docs: {
      toc: true, // Tabla de contenidos automática
    },

    // 6. Layout y opciones
    layout: 'padded', // 'centered' | 'fullscreen' | 'padded'

    // Ordenamiento de stories
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
      const selectedTheme = (context.globals.theme || 'base') as TemplateName;

      // Extract DaisyUI theme name from template
      // If theme is "daisyui-light", daisyTheme becomes "light"
      // If theme is "spotify", daisyTheme becomes "light" (default)
      const daisyTheme = selectedTheme.startsWith('daisyui-')
        ? selectedTheme.replace('daisyui-', '')
        : 'light';

      return (
        <ThemeProvider defaultTemplate={selectedTheme}>
          <div data-theme={daisyTheme} style={{ padding: '20px' }}>
            <Story />
          </div>
        </ThemeProvider>
      );
    },
  ],
};

export default preview;
