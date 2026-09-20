/**
 * Authored section-card recipe definition (DS-S001).
 *
 * The governed section-card anatomy exposed through the public recipe
 * manifest and rendered by the surfaces section-card helper.
 */

/**
 * The tenant-ownable custom-property namespace this recipe publishes. The
 * manifest states it, so it is public API: a tenant that reads
 * `buildRecipeManifest()` is told to address the section card through it.
 */
export const SECTION_CARD_CHANNEL_PREFIX = '--ds-section-card-';

/**
 * The channels the design system itself states inside that published
 * namespace, and the reason `surface-chrome` produces under the recipe's
 * spelling rather than under its own family id.
 *
 * The prefix is published; membership in it is not open. The list is what the
 * family-namespace law admits, so a name that no owner declared is still a
 * stray even when it carries the published prefix.
 */
export const SECTION_CARD_PUBLISHED_CHANNELS = [
  '--ds-section-card-eyebrow-tracking',
  '--ds-section-card-header-min-height',
  '--ds-section-card-icon-size',
  '--ds-section-card-tab-label-gap',
] as const;

export const SECTION_CARD_RECIPE_DEFINITION = {
  name: 'sectionCard',
  slots: {
    root: ['ds-surface', 'ds-section-card'],
    body: 'ds-section-card__body',
    header: 'ds-section-card__header',
    content: 'ds-section-card__content',
  },
  axes: {
    variant: {
      elevated: { root: 'ds-section-card--elevated' },
      outlined: { root: 'ds-section-card--outlined' },
      filled: { root: 'ds-section-card--filled' },
      ghost: { root: 'ds-section-card--ghost' },
    },
  },
  defaults: {},
};
