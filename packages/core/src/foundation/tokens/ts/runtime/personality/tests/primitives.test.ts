/**
 * @fileoverview resolvePersonalityCssVariables tests - Rottay Design System
 * @description Regression coverage for WO-ENG-19. `resolvePersonalityCssVariables`
 * is the single source SystemCssVariablesBridge writes to `:root`; a tenant's
 * BrandTheme/generated chrome CSS (infrastructure/compilers/kernel/runtime/brand-theme/index.ts) can
 * independently declare some of the same variable names. Cross-referencing
 * every name this function emits against every `--ds-*` name the brand-theme
 * and appearance compilers emit (WO-ENG-19 step 3) found exactly nine exact
 * collisions, all in the --ds-card-* family (marked inline below); no other
 * family (badge, divider, button motion, modal timing, toast/message/
 * notification, skeleton, typography) collides. The exhaustive key list below
 * is the audit fence: adding or removing a key here without updating this
 * list breaks the test, forcing a conscious check of whether the new channel
 * collides with a tenant-declarable chrome field.
 */

import { describe, it, expect } from 'vitest';

import { resolvePersonalityCssVariables } from '..';
import { DEFAULT_PERSONALITY } from '@/infrastructure/runtime/personality/foundation/defaults';
import type { DesignTokens, PersonalityTokens } from '@/foundation/contracts';

function buildTokens(personality: PersonalityTokens = DEFAULT_PERSONALITY): DesignTokens {
  return {
    colors: { primary: '#4f46e5' },
    personality,
    transitions: {
      fast: '150ms',
      normal: '250ms',
      slow: '400ms',
      spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    },
  } as unknown as DesignTokens;
}

// Every CSS custom property resolvePersonalityCssVariables emits, as of
// WO-ENG-19. Channels also declarable by a tenant's BrandTheme-generated
// chrome CSS (infrastructure/compilers/kernel/runtime/brand-theme) are marked -- those are exactly the
// variables whose correctness depends on SystemCssVariablesBridge staying at
// `:root` specificity so a tenant declaration always wins.
const EXPECTED_KEYS = [
  '--ds-personality-animation-intensity',
  '--ds-personality-animation-stagger-delay',
  '--ds-personality-animation-stagger-max',
  '--ds-personality-animation-entrance',
  '--ds-personality-animation-entrance-duration',
  '--ds-personality-animation-offset-distance',
  '--ds-personality-animation-hover-lift',
  '--ds-personality-animation-hover-scale',
  '--ds-personality-animation-spring-tension',
  '--ds-personality-animation-spring-friction',
  '--ds-personality-animation-pulse-speed',
  '--ds-personality-animation-skeleton-style',
  '--ds-personality-animation-count-up-enabled',
  '--ds-personality-chart-mount-duration',
  '--ds-personality-chart-line-style',
  '--ds-personality-chart-tooltip-style',
  '--ds-personality-card-padding-density',
  '--ds-personality-card-default-elevation',
  '--ds-personality-card-hover-elevation',
  '--ds-personality-card-show-border',
  '--ds-personality-card-hover-tint',
  '--ds-personality-accent-bar-position',
  '--ds-personality-accent-bar-style',
  '--ds-personality-accent-bar-thickness',
  '--ds-personality-accent-badge-shape',
  '--ds-personality-accent-icon-shape',
  '--ds-personality-accent-divider-style',
  '--ds-personality-typography-heading-letter-spacing',
  '--ds-personality-typography-heading-weight-bias',
  '--ds-personality-typography-label-style',
  '--ds-card-shadow', // tenant-declarable: chrome.cardComponent.shadow (infrastructure/compilers/kernel/runtime/brand-theme/index.ts:815)
  '--ds-card-shadow-hover', // tenant-declarable: chrome.cardComponent.shadow.hover (:816)
  '--ds-card-border', // tenant-declarable: chrome.cardComponent.border (:804 -- the WO-ENG-19 probe hit)
  '--ds-card-border-hover', // tenant-declarable: chrome.cardComponent.border.hover (:807)
  '--ds-card-header-padding', // tenant-declarable: chrome.cardComponent.headerPadding (:825)
  '--ds-card-body-padding', // tenant-declarable: chrome.cardComponent.bodyPadding (:831)
  '--ds-card-footer-padding', // tenant-declarable: chrome.cardComponent.footerPadding (:837)
  '--ds-card-bg-hover', // tenant-declarable: chrome.cardComponent.bgHover (:801)
  '--ds-card-hover-transform', // tenant-declarable: chrome.cardComponent.hoverTransform (:819)
  '--ds-badge-radius',
  '--ds-badge-hover-transform',
  '--ds-divider-style',
  '--ds-divider-color',
  '--ds-skeleton-animation-duration',
  '--ds-typography-heading-letter-spacing',
  '--ds-typography-heading-font-weight',
  '--ds-typography-label-transform',
  '--ds-button-transition',
  '--ds-button-hover-transform',
  '--ds-button-active-transform',
  '--ds-toast-enter-duration',
  '--ds-toast-exit-duration',
  '--ds-toast-enter-easing',
  '--ds-toast-exit-easing',
  '--ds-message-enter-duration',
  '--ds-message-exit-duration',
  '--ds-message-enter-easing',
  '--ds-message-exit-easing',
  '--ds-notification-enter-duration',
  '--ds-notification-exit-duration',
  '--ds-notification-enter-easing',
  '--ds-notification-exit-easing',
  '--ds-modal-animation-duration', // no collision: chrome.modal only declares color/bg/border/overlay names, never timing
  '--ds-modal-animation-timing', // no collision: same as above
  '--ds-duration-fast',
  '--ds-duration-normal',
  '--ds-duration-slow',
].sort();

describe('resolvePersonalityCssVariables', () => {
  it('emits exactly the audited set of CSS variable names', () => {
    const keys = Object.keys(resolvePersonalityCssVariables(buildTokens())).sort();
    expect(keys).toEqual(EXPECTED_KEYS);
  });

  it('derives --ds-card-border from personality.card.showBorder', () => {
    const withBorder = resolvePersonalityCssVariables(
      buildTokens({ ...DEFAULT_PERSONALITY, card: { ...DEFAULT_PERSONALITY.card, showBorder: true } })
    );
    const withoutBorder = resolvePersonalityCssVariables(
      buildTokens({ ...DEFAULT_PERSONALITY, card: { ...DEFAULT_PERSONALITY.card, showBorder: false } })
    );

    expect(withBorder['--ds-card-border']).toBe('var(--ds-color-border-primary)');
    expect(withoutBorder['--ds-card-border']).toBe('transparent');
    expect(withBorder['--ds-card-border-hover']).toBe('var(--ds-color-border-secondary)');
    expect(withoutBorder['--ds-card-border-hover']).toBe('transparent');
  });
});
