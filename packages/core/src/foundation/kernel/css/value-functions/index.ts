/**
 * @fileoverview The CSS value functions the theme pipeline may legitimately
 * emit, as one table.
 *
 * WHY IT LIVES HERE. Three owners ask the same question of a value -- the
 * emission grammar (`compilers/kernel/foundation/css/value-safety`), the
 * publication schema's `visual-value` rule
 * (`compilers/kernel/foundation/schemas/tenant-theme`), and the chrome
 * derivations that assemble CSS text. The first two are SIBLING owners under
 * `compilers/kernel/foundation`, so neither may read the other; a shared table
 * therefore has to sit below both, and `foundation/kernel` is the lowest root
 * every one of them already reads. Two copies drifted twice before, and a name
 * admitted upstream but refused downstream is a channel dropped in silence.
 *
 * This owner is deliberately dependency-free: it states a vocabulary, it does
 * not judge a value. `repeating-conic-gradient` is left out on purpose -- no
 * emitter produces it.
 *
 * @module Foundation/Kernel/Css/ValueFunctions
 * @category Foundation
 * @package @rottay/design-system
 */

/** CSS value functions the theme pipeline may legitimately emit. */
export const ALLOWED_VALUE_FUNCTIONS: ReadonlySet<string> = new Set([
  'rgb',
  'rgba',
  'hsl',
  'hsla',
  'oklch',
  'lab',
  'lch',
  'light-dark',
  'color-mix',
  'linear-gradient',
  'radial-gradient',
  'conic-gradient',
  'repeating-linear-gradient',
  'repeating-radial-gradient',
  'var',
  'calc',
  'min',
  'max',
  'clamp',
  'blur',
  'saturate',
  'drop-shadow',
  'cubic-bezier',
  /** The CSS easing function, emitted by the governed spring recipes. */
  'linear',
  'translate',
  'translatex',
  'translatey',
  'scale',
  'scalex',
  'scaley',
  'rotate',
  'repeat',
  'minmax',
  'fit-content',
]);
