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
import type { TemplateName, TemplateConfig } from './types';

/**
 * Mapa de templates disponibles
 */
export const templates: Record<TemplateName, TemplateConfig> = {
  base: baseTemplate,
  spotify: spotifyTemplate,
  stripe: stripeTemplate,
  airbnb: airbnbTemplate,
  slack: slackTemplate,
  notion: notionTemplate,
  linear: linearTemplate,
  vercel: vercelTemplate,
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
};
