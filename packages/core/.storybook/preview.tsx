import type { Preview } from '@storybook/react-vite'
import { ThemeProvider } from '../src/providers/ThemeProvider';
import type { TemplateName } from '../src/themes/types';
import React, { useEffect } from 'react';

const preview: Preview = {
  // Global types para el toolbar
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Template del design system',
      defaultValue: 'base',
      toolbar: {
        icon: 'paintbrush',
        items: [
          { value: 'base', title: 'Base', icon: 'circle' },
          { value: 'spotify', title: 'Spotify', icon: 'graphline' },
          { value: 'stripe', title: 'Stripe', icon: 'lightning' },
          { value: 'airbnb', title: 'Airbnb', icon: 'home' },
          { value: 'slack', title: 'Slack', icon: 'comment' },
          { value: 'notion', title: 'Notion', icon: 'document' },
          { value: 'linear', title: 'Linear', icon: 'dashboard' },
          { value: 'vercel', title: 'Vercel', icon: 'contrast' },
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
          'General',
          ['Button', '*'],
          'Inputs',
          ['Input', 'Select', 'Form', '*'],
          'Display',
          ['Badge', 'Tag', 'Avatar', '*'],
          'Feedback',
          ['Alert', 'Modal', 'Message', '*'],
          'Navigation',
          ['Menu', 'Tabs', '*'],
          'Overlay',
          ['Tooltip', 'Popover', 'Drawer', '*'],
        ],
      },
    },
  },

  decorators: [
    (Story, context) => {
      const theme = context.globals.theme as TemplateName || 'base';

      // El key fuerza re-mount cuando cambia el tema
      return (
        <ThemeProvider key={theme} defaultTemplate={theme}>
          <div style={{ padding: '20px' }}>
            <Story />
          </div>
        </ThemeProvider>
      );
    },
  ],
};

export default preview;