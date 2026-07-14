import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';

import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { OAuthTransitionScreen } from '../index';
import type { OAuthProvider } from '../types';

const EXPECTED_CSS_LENGTH = 53_076;
const EXPECTED_CSS_LINE_COUNT = 2_226;
const EXPECTED_CSS_SHA256 = '9af44d8087a899dc9434b06f6c2970328204b16f55d718c83a86e0d64deea697';
const coreRoot = basename(process.cwd()) === 'core' ? process.cwd() : resolve(process.cwd(), 'packages/core');
const oauthTransitionCss = readFileSync(
  resolve(coreRoot, 'src/tokens/css/components/skin/oauth-transition.css'),
  'utf8',
);

const EXPECTED_KEYFRAMES = [
  'rottay-transition-travel',
  'rottay-transition-axis-travel',
  'rottay-transition-sweep',
  'rottay-transition-grid-drift',
  'rottay-transition-float',
  'rottay-transition-beam',
  'rottay-transition-pulse',
  'rottay-progress-scan',
  'rottay-progress-panel-drift',
  'rottay-progress-breathe',
  'rottay-progress-orbit',
  'rottay-flow-forward',
  'rottay-flow-backward',
  'rottay-phase-trace-forward',
  'rottay-phase-trace-celebrate',
  'rottay-transition-step-glow',
  'rottay-transition-rotate',
  'rottay-transition-stack-scan',
  'rottay-transition-stack-pulse',
  'rottay-transition-watermark',
] as const;

const CRITICAL_SELECTORS = [
  '.rottay-transition-root {',
  '.rottay-transition-root[data-compact="true"] {',
  '.rottay-transition-root[data-transition="exiting"] {',
  '.rottay-transition-root[data-phase="redirect"] .rottay-transition-card::after {',
  '.rottay-transition-root[data-phase="return"] .rottay-transition-card::after {',
  '.rottay-progress--quiet {',
  '.rottay-progress--watchtower {',
  '.rottay-progress--signal {',
  '.rottay-progress--halo {',
  '.rottay-transition-quiet-shell {',
  '.rottay-transition-watch-shell {',
  '.rottay-transition-signal-shell {',
  '.rottay-transition-stack-shell {',
  '.rottay-transition-root[data-phase="return"][data-compact="true"] .rottay-transition-quiet-node.is-origin {',
] as const;

const EXPECTED_INLINE_PALETTE_PROPERTIES = [
  '--rh-accent',
  '--rh-accent-soft',
  '--rh-bg',
  '--rh-bg-alt',
  '--rh-glow',
  '--rh-glow-soft',
  '--rh-ink',
  '--rh-line',
  '--rh-line-strong',
  '--rh-muted',
  '--rh-panel',
  '--rh-panel-soft',
  '--rh-shadow',
] as const;

function getRoot(container: HTMLElement): HTMLElement {
  const root = container.querySelector<HTMLElement>('.rottay-transition-root');
  expect(root).not.toBeNull();
  return root as HTMLElement;
}

function getTopProviderSvg(container: HTMLElement): SVGElement {
  const icon = container.querySelector<SVGElement>('.rottay-transition-provider-icon svg');
  expect(icon).not.toBeNull();
  return icon as SVGElement;
}

function expectInlinePaletteContract(root: HTMLElement): void {
  const inlinePaletteProperties = Array.from({ length: root.style.length }, (_, index) => root.style.item(index))
    .filter((property) => property.startsWith('--rh-'))
    .sort();

  expect(inlinePaletteProperties).toEqual(EXPECTED_INLINE_PALETTE_PROPERTIES);
}

afterEach(() => cleanup());

describe('OAuthTransition byte-exact skin migration contract', () => {
  it('pins the complete external skin byte-for-byte and names its critical mechanisms', () => {
    const digest = createHash('sha256').update(oauthTransitionCss).digest('hex');
    const keyframes = Array.from(oauthTransitionCss.matchAll(/@keyframes\s+([\w-]+)/g), (match) => match[1]);
    const mediaQueries = Array.from(oauthTransitionCss.matchAll(/@media\s*([^\{]+)/g), (match) => match[1].trim());

    expect(oauthTransitionCss).toHaveLength(EXPECTED_CSS_LENGTH);
    expect(oauthTransitionCss.split('\n')).toHaveLength(EXPECTED_CSS_LINE_COUNT);
    expect(digest).toBe(EXPECTED_CSS_SHA256);
    expect(keyframes).toEqual(EXPECTED_KEYFRAMES);
    expect(mediaQueries).toEqual(['(max-width: 720px)', '(prefers-reduced-motion: reduce)']);

    for (const selector of CRITICAL_SELECTORS) {
      expect(oauthTransitionCss, `missing critical selector ${selector}`).toContain(selector);
    }
  });

  it('renders the light redirect contract without a style block and preserves palette, progress and Google marks', () => {
    const { container } = render(
      <OAuthTransitionScreen
        appId="bithire"
        provider="google"
        variantId="quiet-beam-light"
        phase="redirect"
        activeStep={1}
      />,
    );

    const root = getRoot(container);
    expect(root).toHaveAttribute('data-compact', 'false');
    expect(root).toHaveAttribute('data-family', 'quiet-beam');
    expect(root).toHaveAttribute('data-phase', 'redirect');
    expect(root).toHaveAttribute('data-tone', 'light');
    expect(root).toHaveAttribute('data-transition', 'idle');
    expect(root).toHaveAttribute('data-variant', 'quiet-beam-light');
    expect(root.style.getPropertyValue('--rh-bg')).toBe('#ece6dc');
    expect(root.style.getPropertyValue('--rh-ink')).toBe('#12100d');
    expect(root.style.getPropertyValue('--rh-shadow')).toBe('0 40px 90px rgba(28, 24, 18, 0.18)');
    expectInlinePaletteContract(root);

    expect(root.querySelectorAll('style')).toHaveLength(0);
    expect(root.querySelector('.rottay-transition-title')).toHaveTextContent('Redirecting to Google for Bithire.');
    expect(root.querySelector('.rottay-transition-provider-copy strong')).toHaveTextContent('Google');
    expect(root.querySelector('.rottay-transition-provider-copy span')).toHaveTextContent('Redirect in progress');
    expect(root.querySelector('.rottay-transition-flow-tag')).toHaveTextContent('Protected redirect');
    expect(root.querySelector('.rottay-transition-scene--quiet')).not.toBeNull();

    const progressSteps = root.querySelectorAll('.rottay-progress-quiet-step');
    expect(progressSteps).toHaveLength(3);
    expect(Array.from(progressSteps, (step) => step.getAttribute('data-step-state'))).toEqual([
      'complete',
      'active',
      'pending',
    ]);

    const googleSvg = getTopProviderSvg(container);
    expect(googleSvg).toHaveAttribute('viewBox', '0 0 24 24');
    expect(Array.from(googleSvg.querySelectorAll('path'), (path) => path.getAttribute('fill'))).toEqual([
      '#4285F4',
      '#34A853',
      '#FBBC05',
      '#EA4335',
    ]);
  });

  it('renders the compact dark return contract without a style block and preserves copy, palette and Microsoft marks', () => {
    const { container } = render(
      <OAuthTransitionScreen
        appId="platform"
        provider="microsoft"
        variantId="watchtower-sweep-dark"
        phase="return"
        activeStep={2}
        compact
      />,
    );

    const root = getRoot(container);
    expect(root).toHaveAttribute('data-compact', 'true');
    expect(root).toHaveAttribute('data-family', 'watchtower-sweep');
    expect(root).toHaveAttribute('data-phase', 'return');
    expect(root).toHaveAttribute('data-tone', 'dark');
    expect(root).toHaveAttribute('data-variant', 'watchtower-sweep-dark');
    expect(root.style.getPropertyValue('--rh-bg')).toBe('#040404');
    expect(root.style.getPropertyValue('--rh-ink')).toBe('#f4efe8');
    expect(root.style.getPropertyValue('--rh-shadow')).toBe('0 40px 100px rgba(0, 0, 0, 0.58)');
    expectInlinePaletteContract(root);

    expect(root.querySelectorAll('style')).toHaveLength(0);
    expect(root.querySelector('.rottay-transition-title')).toHaveTextContent('Back to Rottay Platform.');
    expect(root.querySelector('.rottay-transition-provider-copy strong')).toHaveTextContent('Microsoft');
    expect(root.querySelector('.rottay-transition-provider-copy span')).toHaveTextContent('Return confirmed');
    expect(root.querySelector('.rottay-transition-flow-tag')).toHaveTextContent('Protected return');
    expect(root.querySelector('.rottay-transition-scene--watchtower')).not.toBeNull();

    const progressSteps = root.querySelectorAll('.rottay-progress-watch-step');
    expect(progressSteps).toHaveLength(3);
    expect(Array.from(progressSteps, (step) => step.getAttribute('data-step-state'))).toEqual([
      'complete',
      'complete',
      'active',
    ]);

    const microsoftSvg = getTopProviderSvg(container);
    expect(microsoftSvg).toHaveAttribute('viewBox', '0 0 24 24');
    expect(Array.from(microsoftSvg.querySelectorAll('path'), (path) => path.getAttribute('fill'))).toEqual([
      '#F25022',
      '#7FBA00',
      '#00A4EF',
      '#FFB900',
    ]);
  });

  it.each<{
    provider: OAuthProvider;
    svgFill: string | null;
    pathFills: Array<string | null>;
  }>([
    {
      provider: 'google',
      svgFill: null,
      pathFills: ['#4285F4', '#34A853', '#FBBC05', '#EA4335'],
    },
    { provider: 'github', svgFill: 'currentColor', pathFills: [null] },
    { provider: 'linkedin', svgFill: null, pathFills: ['#0A66C2'] },
    {
      provider: 'azure-ad',
      svgFill: null,
      pathFills: ['#F25022', '#7FBA00', '#00A4EF', '#FFB900'],
    },
    {
      provider: 'microsoft',
      svgFill: null,
      pathFills: ['#F25022', '#7FBA00', '#00A4EF', '#FFB900'],
    },
  ])('preserves the $provider provider-icon paint contract', ({ provider, svgFill, pathFills }) => {
    const { container } = render(
      <OAuthTransitionScreen
        appId="bithire"
        provider={provider}
        variantId="quiet-beam-light"
        phase="redirect"
      />,
    );

    const svg = getTopProviderSvg(container);
    expect(svg.getAttribute('fill')).toBe(svgFill);
    expect(Array.from(svg.querySelectorAll('path'), (path) => path.getAttribute('fill'))).toEqual(pathFills);
  });
});
