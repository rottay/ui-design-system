/**
 * Design Tokens
 * Exportable design tokens for all themes
 * Use these tokens to build custom components that match the theme
 */

export * from './types';
export { spotifyTokens } from './spotify';
export { stripeTokens } from './stripe';
export { airbnbTokens } from './airbnb';
export { slackTokens } from './slack';
export { notionTokens } from './notion';
export { linearTokens } from './linear';
export { vercelTokens } from './vercel';
export { baseTokens } from './base';

/**
 * All tokens by theme name
 * Useful for programmatic access
 */
import { spotifyTokens } from './spotify';
import { stripeTokens } from './stripe';
import { airbnbTokens } from './airbnb';
import { slackTokens } from './slack';
import { notionTokens } from './notion';
import { linearTokens } from './linear';
import { vercelTokens } from './vercel';
import { baseTokens } from './base';

export const tokens = {
  spotify: spotifyTokens,
  stripe: stripeTokens,
  airbnb: airbnbTokens,
  slack: slackTokens,
  notion: notionTokens,
  linear: linearTokens,
  vercel: vercelTokens,
  base: baseTokens,
} as const;

export type TokenThemeName = keyof typeof tokens;
