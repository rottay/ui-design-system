import type { TemplateConfig } from './types';

/**
 * Template Base - Ant Design Default (solo Button para MVP)
 */
export const baseTemplate: TemplateConfig = {
  token: {
    colorPrimary: '#1890ff', // Azul Ant Design
  },
  components: {
    Button: {
      controlHeight: 32,
      borderRadius: 6,
    },
  },
};
