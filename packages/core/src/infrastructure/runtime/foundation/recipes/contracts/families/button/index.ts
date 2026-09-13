/**
 * Authored button recipe definition (DS-S001).
 *
 * The definition is data: axis domains and the semantic classes the modern
 * skin selects on. It lives below the UI tier because both sides need it and
 * neither may depend on the other — the engine resolves it into a recipe, the
 * public manifest states its shape. The paint those classes answer to lives in
 * `foundation/tokens/css/runtime/engines/modern/skin/button/index.css`.
 */

/**
 * The variants the modern skin paints. An unknown variant falls back to
 * `primary` for the className, the `data-variant` attribute and therefore the
 * paint, all three together.
 *
 * The paint itself lives in `foundation/tokens/css/runtime/engines/modern/skin/button/index.css`, keyed
 * on `data-variant`. This set is the contract those rules answer to; a variant
 * added here without a rule there renders unpainted, and the state matrix in
 * `packages/showroom/e2e/visual/states.spec.ts` is what says so.
 */
export const BUTTON_VARIANT_VALUES = [
  'primary',
  'secondary',
  'default',
  'outline',
  'ghost',
  'text',
  'dashed',
  'danger',
  'success',
  'warning',
  'info',
  'ai',
  'link',
] as const;

/** Authored size domain. `SIZE_MAP` in the Button contracts answers to it. */
export const BUTTON_SIZE_VALUES = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

export const BUTTON_SHAPE_VALUES = ['default', 'circle', 'round'] as const;

/** One size the button recipe accepts. */
export type ButtonRecipeSizeValue = (typeof BUTTON_SIZE_VALUES)[number];

const axisFromDomain = <const Value extends string>(values: readonly Value[]) =>
  Object.fromEntries(
    [...values].map((value) => [value, { root: `ds-button--${value}` }])
  ) as Record<Value, { root: string }>;

/**
 * DS-S001 recipe: the same semantic classes the skin has always selected on,
 * resolved through the Rottay recipe engine. Axis order mirrors the historical
 * class order exactly (variant, size, shape, then the boolean states).
 */
export const BUTTON_RECIPE_DEFINITION = {
  name: 'button',
  slots: { root: ['ds-button', 'ds-button--modern'] },
  axes: {
    variant: axisFromDomain(BUTTON_VARIANT_VALUES),
    size: axisFromDomain(BUTTON_SIZE_VALUES),
    shape: axisFromDomain(BUTTON_SHAPE_VALUES),
    block: { true: { root: 'ds-button--block' } },
    loading: { true: { root: 'ds-button--loading' } },
    pending: { true: { root: 'ds-button--pending' } },
    disabled: { true: { root: 'ds-button--disabled' } },
    shadow: { true: { root: 'ds-button--shadow' } },
    gradient: { true: { root: 'ds-button--gradient' } },
    pulse: { true: { root: 'ds-button--pulse' } },
    bordered: { true: { root: 'ds-button--bordered' } },
  },
  defaults: {},
};
