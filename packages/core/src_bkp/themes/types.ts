import type { ThemeConfig } from 'antd';

/**
 * Nombres de templates disponibles
 */
export type TemplateName =
  // Ant Design Themes
  | 'base'
  | 'spotify'
  | 'stripe'
  | 'airbnb'
  | 'slack'
  | 'notion'
  | 'linear'
  | 'vercel'
  // DaisyUI Themes (29 themes)
  | 'daisyui-light'
  | 'daisyui-dark'
  | 'daisyui-cupcake'
  | 'daisyui-bumblebee'
  | 'daisyui-emerald'
  | 'daisyui-corporate'
  | 'daisyui-synthwave'
  | 'daisyui-retro'
  | 'daisyui-cyberpunk'
  | 'daisyui-valentine'
  | 'daisyui-halloween'
  | 'daisyui-garden'
  | 'daisyui-forest'
  | 'daisyui-aqua'
  | 'daisyui-lofi'
  | 'daisyui-pastel'
  | 'daisyui-fantasy'
  | 'daisyui-wireframe'
  | 'daisyui-black'
  | 'daisyui-luxury'
  | 'daisyui-dracula'
  | 'daisyui-cmyk'
  | 'daisyui-autumn'
  | 'daisyui-business'
  | 'daisyui-acid'
  | 'daisyui-lemonade'
  | 'daisyui-night'
  | 'daisyui-coffee'
  | 'daisyui-winter';

/**
 * Configuración de template (alias de ThemeConfig de Ant Design)
 */
export type TemplateConfig = ThemeConfig;
