export * from './types';
export type { TemplateConfig, TemplateName } from './types';

import { baseTemplate } from './base';
import { spotifyTemplate } from './spotify';
import { stripeTemplate } from './stripe';
import { airbnbTemplate } from './airbnb';
import { slackTemplate } from './slack';
import { notionTemplate } from './notion';
import { linearTemplate } from './linear';
import { vercelTemplate } from './vercel';
import {
  daisyuiLightTemplate,
  daisyuiDarkTemplate,
  daisyuiCupcakeTemplate,
  daisyuiBumblebeeTemplate,
  daisyuiEmeraldTemplate,
  daisyuiCorporateTemplate,
  daisyuiSynthwaveTemplate,
  daisyuiRetroTemplate,
  daisyuiCyberpunkTemplate,
  daisyuiValentineTemplate,
  daisyuiHalloweenTemplate,
  daisyuiGardenTemplate,
  daisyuiForestTemplate,
  daisyuiAquaTemplate,
  daisyuiLofiTemplate,
  daisyuiPastelTemplate,
  daisyuiFantasyTemplate,
  daisyuiWireframeTemplate,
  daisyuiBlackTemplate,
  daisyuiLuxuryTemplate,
  daisyuiDraculaTemplate,
  daisyuiCmykTemplate,
  daisyuiAutumnTemplate,
  daisyuiBusinessTemplate,
  daisyuiAcidTemplate,
  daisyuiLemonadeTemplate,
  daisyuiNightTemplate,
  daisyuiCoffeeTemplate,
  daisyuiWinterTemplate,
} from './daisyui-themes';
import type { TemplateName, TemplateConfig } from './types';

/**
 * Mapa de templates disponibles
 * 8 Ant Design themes + 29 DaisyUI themes = 37 total
 */
export const templates: Record<TemplateName, TemplateConfig> = {
  // Ant Design Themes
  base: baseTemplate,
  spotify: spotifyTemplate,
  stripe: stripeTemplate,
  airbnb: airbnbTemplate,
  slack: slackTemplate,
  notion: notionTemplate,
  linear: linearTemplate,
  vercel: vercelTemplate,
  // DaisyUI Themes
  'daisyui-light': daisyuiLightTemplate,
  'daisyui-dark': daisyuiDarkTemplate,
  'daisyui-cupcake': daisyuiCupcakeTemplate,
  'daisyui-bumblebee': daisyuiBumblebeeTemplate,
  'daisyui-emerald': daisyuiEmeraldTemplate,
  'daisyui-corporate': daisyuiCorporateTemplate,
  'daisyui-synthwave': daisyuiSynthwaveTemplate,
  'daisyui-retro': daisyuiRetroTemplate,
  'daisyui-cyberpunk': daisyuiCyberpunkTemplate,
  'daisyui-valentine': daisyuiValentineTemplate,
  'daisyui-halloween': daisyuiHalloweenTemplate,
  'daisyui-garden': daisyuiGardenTemplate,
  'daisyui-forest': daisyuiForestTemplate,
  'daisyui-aqua': daisyuiAquaTemplate,
  'daisyui-lofi': daisyuiLofiTemplate,
  'daisyui-pastel': daisyuiPastelTemplate,
  'daisyui-fantasy': daisyuiFantasyTemplate,
  'daisyui-wireframe': daisyuiWireframeTemplate,
  'daisyui-black': daisyuiBlackTemplate,
  'daisyui-luxury': daisyuiLuxuryTemplate,
  'daisyui-dracula': daisyuiDraculaTemplate,
  'daisyui-cmyk': daisyuiCmykTemplate,
  'daisyui-autumn': daisyuiAutumnTemplate,
  'daisyui-business': daisyuiBusinessTemplate,
  'daisyui-acid': daisyuiAcidTemplate,
  'daisyui-lemonade': daisyuiLemonadeTemplate,
  'daisyui-night': daisyuiNightTemplate,
  'daisyui-coffee': daisyuiCoffeeTemplate,
  'daisyui-winter': daisyuiWinterTemplate,
};

export {
  baseTemplate,
  spotifyTemplate,
  stripeTemplate,
  airbnbTemplate,
  slackTemplate,
  notionTemplate,
  linearTemplate,
  vercelTemplate,
  daisyuiLightTemplate,
  daisyuiDarkTemplate,
  daisyuiCupcakeTemplate,
  daisyuiBumblebeeTemplate,
  daisyuiEmeraldTemplate,
  daisyuiCorporateTemplate,
  daisyuiSynthwaveTemplate,
  daisyuiRetroTemplate,
  daisyuiCyberpunkTemplate,
  daisyuiValentineTemplate,
  daisyuiHalloweenTemplate,
  daisyuiGardenTemplate,
  daisyuiForestTemplate,
  daisyuiAquaTemplate,
  daisyuiLofiTemplate,
  daisyuiPastelTemplate,
  daisyuiFantasyTemplate,
  daisyuiWireframeTemplate,
  daisyuiBlackTemplate,
  daisyuiLuxuryTemplate,
  daisyuiDraculaTemplate,
  daisyuiCmykTemplate,
  daisyuiAutumnTemplate,
  daisyuiBusinessTemplate,
  daisyuiAcidTemplate,
  daisyuiLemonadeTemplate,
  daisyuiNightTemplate,
  daisyuiCoffeeTemplate,
  daisyuiWinterTemplate,
};
