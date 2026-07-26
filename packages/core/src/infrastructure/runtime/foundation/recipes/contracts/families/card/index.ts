/**
 * Authored card recipe definition (DS-S001).
 *
 * The exact semantic classes the modern Card has always emitted. The always-on
 * `modern` axis sits between `interactive` and `tone` so the historical class
 * order is preserved byte for byte.
 */

export const CARD_RECIPE_DEFINITION = {
  name: 'card',
  slots: { root: 'ds-card' },
  axes: {
    variant: {
      elevated: { root: 'ds-card--elevated' },
      outlined: { root: 'ds-card--outlined' },
      filled: { root: 'ds-card--filled' },
      ghost: { root: 'ds-card--ghost' },
    },
    interactive: { true: { root: 'ds-card--interactive' } },
    modern: { true: { root: 'ds-card--modern' } },
    tone: {
      primary: { root: 'ds-card--tone-primary' },
      success: { root: 'ds-card--tone-success' },
      warning: { root: 'ds-card--tone-warning' },
      error: { root: 'ds-card--tone-error' },
      info: { root: 'ds-card--tone-info' },
    },
  },
  defaults: { modern: true },
};
