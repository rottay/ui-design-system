/**
 * @rottay/no-layout-property-animation
 *
 * Forbid animating a layout property. A `transition` or `animation` whose first
 * token in any comma segment is a layout property -- or is `all`, which contains
 * every layout property by definition -- costs a layout and a paint on every
 * frame, on the main thread. Compositor-only motion is `transform`, `opacity` and
 * `clip-path`; a size change belongs to the layout kernel
 * (`graphics/motion/react/runtime/layout`), which is the one exempt owner.
 *
 * Subject: `src/components/**` excluding the frozen `engines/{classic,rustic}`
 * engines, plus `graphics/motion/**`. The narrower `engines/modern` subject
 * `no-motion-literals` shipped with left three real sites unlinted -- two
 * `runtime/presentation/` inline writers and one `compound/` body -- which is why
 * this rule's subject starts one level out.
 *
 * Arm B of the same law scans `foundation/tokens/css/**` (a `.css` file is not
 * lintable by ESLint); both arms read the identical token list, and the
 * property-law drill fails when the two copies diverge.
 */
import type { Rule } from '../../contracts';

/**
 * The audit's kebab list (`scripts/check/engine/tokens/audit/index.mjs`) widened
 * with the logical, grid and flex properties this tree actually animates.
 * MIRRORED in `scripts/check/motion-budget/audits/property-law/index.mjs`.
 */
export const LAYOUT_PROPERTY_TOKENS = [
  'top', 'right', 'bottom', 'left',
  'inset', 'inset-block', 'inset-block-start', 'inset-block-end',
  'inset-inline', 'inset-inline-start', 'inset-inline-end',
  'width', 'height',
  'min-width', 'max-width', 'min-height', 'max-height',
  'inline-size', 'block-size',
  'min-inline-size', 'max-inline-size', 'min-block-size', 'max-block-size',
  'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'margin-block', 'margin-block-start', 'margin-block-end',
  'margin-inline', 'margin-inline-start', 'margin-inline-end',
  'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'padding-block', 'padding-block-start', 'padding-block-end',
  'padding-inline', 'padding-inline-start', 'padding-inline-end',
  'gap', 'row-gap', 'column-gap',
  'grid-template-columns', 'grid-template-rows', 'grid-template-areas',
  'flex', 'flex-basis', 'order',
  'columns', 'column-width',
  'border-width', 'border-top-width', 'border-right-width',
  'border-bottom-width', 'border-left-width',
  'font-size', 'line-height',
];

/** Pre-composed aliases whose expansion declares a layout property. */
const LAYOUT_ALIASES = ['--ds-transition-rearrange', '--ds-transition-resize', '--ds-transition-all'];

const LAYOUT_TOKEN_SET = new Set([
  ...LAYOUT_PROPERTY_TOKENS,
  ...LAYOUT_PROPERTY_TOKENS.map((token) => token.replace(/-([a-z])/g, (_, char) => char.toUpperCase())),
]);

const MOTION_STYLE_KEY_RE = /^(?:transition|animation)(?:Property)?$/;
const CSS_TRANSITION_DECLARATION_RE = /(?:^|[\s;{])transition(?:-property)?\s*:([^;}]*)/g;
const CSS_ANIMATION_DECLARATION_RE = /(?:^|[\s;{])animation\s*:([^;}]*)/g;
/** A declaration inside a `@keyframes` step body authored as CSS text. */
const KEYFRAME_DECLARATION_RE = /([a-zA-Z-]+)\s*:[^;}]*/g;

/** The layout kernel is the only owner allowed to move a size. */
function isExemptOwner(path: string): boolean {
  return /(?:^|\/)graphics\/motion\/react\/runtime\/layout\//.test(path);
}

function isSubject(filename: string): boolean {
  const path = filename.replace(/\\/g, '/');
  if (!/\.[jt]sx?$/.test(path)) return false;
  if (/(?:^|\/)engines\/(?:classic|rustic)(?:\/|\.)/.test(path)) return false;
  if (isExemptOwner(path)) return false;
  return /(?:^|\/)src\/components\//.test(path)
    || /(?:^|\/)graphics\/motion\/.+\.[jt]sx?$/.test(path);
}

/** The property a comma segment of a `transition` value animates. */
function firstToken(segment: string): string {
  return segment.trim().split(/[\s(]/)[0] ?? '';
}

function aliasIn(value: string): string | undefined {
  return LAYOUT_ALIASES.find((alias) => value.includes(alias));
}

type Kind = 'layoutProperty' | 'transitionAll' | 'layoutAlias' | 'layoutKeyframe';

/** Reports the first offence in a `transition`/`transition-property` value. */
function classifyTransitionValue(value: string): Kind | null {
  const alias = aliasIn(value);
  if (alias !== undefined) return 'layoutAlias';
  for (const segment of value.split(',')) {
    const token = firstToken(segment);
    if (token === 'all') return 'transitionAll';
    if (LAYOUT_TOKEN_SET.has(token)) return 'layoutProperty';
  }
  return null;
}

/** Reports a layout property declared inside inline `@keyframes` text. */
function classifyKeyframeText(value: string): Kind | null {
  if (!/@keyframes/.test(value)) return null;
  for (const match of value.matchAll(KEYFRAME_DECLARATION_RE)) {
    if (LAYOUT_TOKEN_SET.has(match[1] ?? '')) return 'layoutKeyframe';
  }
  return null;
}

function classifyCssText(value: string): Kind | null {
  for (const match of value.matchAll(CSS_TRANSITION_DECLARATION_RE)) {
    const kind = classifyTransitionValue(match[1] ?? '');
    if (kind) return kind;
  }
  for (const match of value.matchAll(CSS_ANIMATION_DECLARATION_RE)) {
    const alias = aliasIn(match[1] ?? '');
    if (alias !== undefined) return 'layoutAlias';
  }
  return classifyKeyframeText(value);
}

function propertyKeyName(node: any): string | undefined {
  if (node?.type !== 'Property' || node.computed) return undefined;
  if (node.key?.type === 'Identifier') return node.key.name;
  if (node.key?.type === 'Literal' && typeof node.key.value === 'string') return node.key.value;
  return undefined;
}

const VALUE_WRAPPERS = new Set([
  'TemplateLiteral',
  'ConditionalExpression',
  'LogicalExpression',
  'BinaryExpression',
  'TSAsExpression',
  'TSSatisfiesExpression',
]);

/** The assigned-to member name in `style.transition = <value>`, if that is the shape. */
function assignedStyleKey(owner: any): string | undefined {
  const assignment = owner?.parent;
  if (assignment?.type !== 'AssignmentExpression' || assignment.right !== owner) return undefined;
  const target = assignment.left;
  if (target?.type !== 'MemberExpression' || target.computed) return undefined;
  return target.property?.type === 'Identifier' ? target.property.name : undefined;
}

/** True when the string is (part of) the value of a motion style key. */
function isMotionStyleValue(node: any): boolean {
  let owner = node;
  while (owner?.parent && VALUE_WRAPPERS.has(owner.parent.type)) owner = owner.parent;
  const assignedKey = assignedStyleKey(owner);
  if (assignedKey !== undefined) return MOTION_STYLE_KEY_RE.test(assignedKey);
  const property = owner?.parent;
  if (!property || property.value !== owner) return false;
  const key = propertyKeyName(property);
  return key !== undefined && MOTION_STYLE_KEY_RE.test(key);
}

function classify(value: string, motionStyleValue: boolean): Kind | null {
  // An alias is reported wherever it appears: `--ds-transition-*` exists only as
  // a transition shorthand, so no surrounding context can make it something else.
  if (aliasIn(value) !== undefined) return 'layoutAlias';
  if (motionStyleValue) return classifyTransitionValue(value);
  return classifyCssText(value);
}

export const noLayoutPropertyAnimation: Rule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow animating a layout property (transition/animation on width, height, inset, gap, grid tracks, "all", or a --ds-transition-* alias that expands to one); move transform/opacity/clip-path, and size through the layout kernel',
    },
    schema: [],
    messages: {
      layoutProperty:
        'This transition animates a layout property, which costs layout + paint every frame on the main thread. Animate transform/opacity/clip-path, or use useLayoutAnimation({ kind: "size" }).',
      transitionAll:
        '`transition: all` animates every layout property by definition. Name the compositor-only properties this element actually moves.',
      layoutAlias:
        'This --ds-transition-* alias expands to inline-size/block-size legs, which cannot animate a reflow and does animate layout. Use useLayoutAnimation({ kind: "reflow" }).',
      layoutKeyframe:
        'This @keyframes step declares a layout property. Keyframe a transform/opacity/clip-path instead.',
    },
  },

  create(context): Record<string, (node: any) => void> {
    const filename: string = context.filename ?? context.getFilename?.() ?? '';
    if (!isSubject(filename)) return {};

    return {
      Literal(node) {
        if (typeof node.value !== 'string') return;
        const kind = classify(node.value, isMotionStyleValue(node));
        if (kind) context.report({ node, messageId: kind });
      },
      TemplateElement(node) {
        const raw: string = node.value?.cooked ?? node.value?.raw ?? '';
        const kind = classify(raw, isMotionStyleValue(node));
        if (kind) context.report({ node, messageId: kind });
      },
    };
  },
};
