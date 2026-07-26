/**
 * Authored section-card recipe definition (DS-S001).
 *
 * The governed section-card anatomy exposed through the public recipe
 * manifest and rendered by the surfaces section-card helper.
 */

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
