import { baseTemplate } from './base';
import { spotifyTemplate } from './spotify';
import { stripeTemplate } from './stripe';
import { airbnbTemplate } from './airbnb';
import { slackTemplate } from './slack';
import { notionTemplate } from './notion';
import { linearTemplate } from './linear';
import { vercelTemplate } from './vercel';
import { TemplateName, TemplateConfig } from './types';
export * from './types';
export type { TemplateConfig, TemplateName } from './types';
/**
 * Mapa de templates disponibles
 */
export declare const templates: Record<TemplateName, TemplateConfig>;
export { baseTemplate, spotifyTemplate, stripeTemplate, airbnbTemplate, slackTemplate, notionTemplate, linearTemplate, vercelTemplate, };
//# sourceMappingURL=index.d.ts.map