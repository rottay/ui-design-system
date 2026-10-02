/**
 * The one declaration of what a skin literal census does NOT count (owner
 * ruling 7, hardcode-census §5): every TEC (technical constant) and FLOOR
 * (policy floor) exclusion for every `skinLiterals.*` class lives here, each
 * with its reason. The classifier in `../index.mjs` holds no exclusion of its
 * own; widening a class's blind spot means editing this file in review.
 *
 * DEF (a `var(--x, literal)` fallback) is never counted as a literal here: the
 * classifier removes every `var()` and `env()` call before it reads a value
 * (a zero length is never a literal either), and the
 * fallback-parity counters own DEF. GEN (compiled artifacts) is outside the
 * skin corpus by construction.
 */

/** At-rule contexts whose declarations are a policy floor, not a hardcode. */
export const FLOOR_CONTEXTS = Object.freeze([
  {
    atRule: 'media',
    params: /prefers-reduced-motion/,
    reason: 'reduced-motion overrides (0.01ms / none / !important) are the accessibility floor',
  },
  {
    atRule: 'media',
    params: /forced-colors/,
    reason: 'forced-colors blocks must name system colours and may force them',
  },
]);

/** Contexts that are TEC for every class except `color`. */
export const TEC_CONTEXTS = Object.freeze([
  {
    atRule: 'keyframes',
    reason: 'keyframe stops are choreography geometry, not a tenant decision; colour still counts',
    exceptClasses: ['color'],
  },
]);

/**
 * Per-class exclusions. `tec` / `floor` entries are literal tokens (as they
 * appear after `var()` removal, lower-cased) excused for the listed
 * properties, or for every property of the class when `properties` is absent.
 */
export const SKIN_LITERAL_EXCLUSIONS = Object.freeze({
  fontWeight: { tec: [], floor: [] },
  lineHeight: {
    tec: [
      { token: '0', reason: 'collapsed line box' },
      { token: '1', reason: 'unleaded glyph box (icons, single-line controls)' },
    ],
    floor: [],
  },
  letterSpacing: { tec: [{ token: '0', reason: 'tracking reset' }], floor: [] },
  fontFamily: {
    tec: [
      {
        token: 'generic-family-after-token',
        reason: 'a generic family closing a token-led stack is the platform fallback',
      },
    ],
    floor: [],
  },
  spacing: {
    tec: [
      {
        token: '1px',
        properties: /^(?:margin|inset|top|right|bottom|left)/,
        reason: 'hairline overlap compensation',
      },
      {
        token: '-1px',
        properties: /^(?:margin|inset|top|right|bottom|left)/,
        reason: 'hairline overlap compensation',
      },
    ],
    floor: [],
  },
  size: {
    tec: [{ token: '1px', reason: 'hairline rules and visually-hidden boxes' }],
    floor: [
      {
        token: '44px',
        properties: /^min-(?:width|height|inline-size|block-size)$/,
        reason: 'touch-target minimum (--ds-touch-target-min, tested)',
      },
    ],
  },
  radius: { tec: [], floor: [] },
  opacity: {
    tec: [
      { token: '0', reason: 'fully hidden state' },
      { token: '1', reason: 'fully shown state' },
      { token: '0%', reason: 'fully hidden state' },
      { token: '100%', reason: 'fully shown state' },
    ],
    floor: [],
  },
  shadow: { tec: [{ token: '1px', reason: 'hairline ring / inset rule' }], floor: [] },
  color: {
    tec: [
      { token: 'mask', properties: /^(?:-webkit-)?mask/, reason: 'mask luminance, not paint' },
    ],
    floor: [],
  },
  duration: {
    tec: [
      { token: '0s', reason: 'no transition' },
      { token: '0ms', reason: 'no transition' },
      { token: '>=1s', reason: 'loop / shimmer / spinner tempo, outside the interaction canon' },
    ],
    floor: [],
  },
  easing: {
    tec: [
      { token: 'linear', reason: 'constant-rate loop' },
      { token: 'step-start', reason: 'discrete toggle' },
      { token: 'step-end', reason: 'discrete toggle' },
    ],
    floor: [],
  },
  zIndex: {
    tec: [
      { token: '0', reason: 'local stacking reset (mirrors content.magicZIndex)' },
      { token: '-1', reason: 'behind-parent decoration (mirrors content.magicZIndex)' },
    ],
    floor: [],
  },
  containerQuery: { tec: [], floor: [] },
  important: { tec: [], floor: [] },
  dataTenant: { tec: [], floor: [] },
  channelLiteral: {
    tec: [],
    floor: [
      {
        token: '44px',
        properties: /-(?:floor|touch-target)(?:-|$)/,
        reason: 'touch-target minimum carried by a named floor channel',
      },
    ],
  },
});

/** True when `token` on `property` is excused for `klass` by a TEC or FLOOR entry. */
export function isExcluded(klass, token, property) {
  const entry = SKIN_LITERAL_EXCLUSIONS[klass];
  if (!entry) throw new Error(`skin literal class has no exclusion entry: ${klass}`);
  return [...entry.tec, ...entry.floor].some(
    (rule) => rule.token === token && (!rule.properties || rule.properties.test(property)),
  );
}

/**
 * Root-scope tokens two foundation files both declare, pinned by name with the
 * owner that must keep the value (`scale.duplicateRootDeclarations`). A token
 * that joins or leaves this set without this list changing is roster drift.
 */
export const KNOWN_DUPLICATE_ROOT_DECLARATIONS = Object.freeze({
  '--ds-shadow-inner': {
    owner: 'foundation/themes/default',
    alsoDeclaredBy: ['foundation/base/shadows'],
    reason: 'themes/default is imported last and wins; base/shadows is a dead second authority',
  },
  '--ds-shadow-focus-ring': {
    owner: 'foundation/themes/default',
    alsoDeclaredBy: ['foundation/base/shadows'],
    reason: 'themes/default is imported last and wins; base/shadows is a dead second authority',
  },
  '--ds-shadow-focus-ring-error': {
    owner: 'foundation/themes/default',
    alsoDeclaredBy: ['foundation/base/shadows'],
    reason: 'the two values differ (2px vs 3px spread); themes/default wins by import order',
  },
});
