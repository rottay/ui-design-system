/**
 * @rottay/no-motion-literals
 *
 * Forbid raw motion literals in modern-engine style values: `cubic-bezier(...)` easing
 * literals, raw sub-second duration literals (`150ms`, `0.2s`) and the CSS easing keywords
 * (`ease`, `ease-in`, `ease-out`, `ease-in-out`, `step-start`, `step-end`, `steps()`) inside a
 * `transition`/`animation` value. Motion must reference the foundation `--ds-motion-*` canon
 * (WO-ENG-01) so cadence and easing tune centrally and follow `motion.character`.
 *
 * Scoped to the two owners that author interaction motion: every file under a
 * `engines/modern/` subtree, and the motion vocabulary itself under
 * `graphics/motion/`. Classic (Ant Design) and rustic legitimately use the legacy
 * `--transition-*`/`--duration-*` catalog and are not linted by this rule.
 * Loop/long-form durations >= 1s (shimmer, spinner) are allowed: they sit outside the
 * 120/200/320 interaction cadence. `linear` is allowed: a constant-velocity loop has no
 * curve for a character to reshape.
 */
import type { Rule } from '../../contracts';

const CUBIC_BEZIER_RE = /cubic-bezier\s*\(/;
const MS_RE = /\b\d+(?:\.\d+)?ms\b/;
/** Sub-second seconds only (>= 1s loop/shimmer tempos are allowed). */
const SUBSECOND_RE = /(?<![\w.])0?\.\d+s(?![\w])/;
/** A keyword easing; `--ds-motion-ease-out` is a token, not a keyword. */
const EASING_KEYWORD_RE = /(?<![\w-])(?:ease(?:-in-out|-in|-out)?|step-start|step-end)(?![\w-])|(?<![\w-])steps\s*\(/;
/** A motion property authored as CSS text (`<style>` blocks, CSS-in-JS strings). */
const CSS_MOTION_DECLARATION_RE = /(?:^|[\s;{])(?:transition|animation)(?:-timing-function)?\s*:([^;}]*)/g;
const MOTION_STYLE_KEY_RE = /^(?:transition|animation)(?:TimingFunction)?$/;

/**
 * The rule's subject. `engines/modern(/[^/]+)?` matched one level below the
 * engine only, so `engines/modern/cell-editor/index.tsx` was unlinted; and the
 * motion vocabulary the rule points every engine AT was itself outside the
 * subject, so the canon could hard-code the cadence it publishes (audit F-57).
 */
function isMotionAuthoringFile(filename: string): boolean {
  const path = filename.replace(/\\/g, '/');
  return /(?:^|\/)engines\/modern(?:\/.+)?\.[jt]sx?$/.test(path)
    || /(?:^|\/)graphics\/motion\/.+\.[jt]sx?$/.test(path);
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

/** True when the string is (part of) the value of a `transition`/`animation` style key. */
function isMotionStyleValue(node: any): boolean {
  let owner = node;
  while (owner?.parent && VALUE_WRAPPERS.has(owner.parent.type)) owner = owner.parent;
  const property = owner?.parent;
  if (!property || property.value !== owner) return false;
  const key = propertyKeyName(property);
  return key !== undefined && MOTION_STYLE_KEY_RE.test(key);
}

function hasKeywordEasingInCssText(value: string): boolean {
  for (const match of value.matchAll(CSS_MOTION_DECLARATION_RE)) {
    if (EASING_KEYWORD_RE.test(match[1] ?? '')) return true;
  }
  return false;
}

function classify(value: string, motionStyleValue: boolean): 'cubicBezier' | 'rawDuration' | 'keywordEasing' | null {
  if (CUBIC_BEZIER_RE.test(value)) return 'cubicBezier';
  if (MS_RE.test(value) || SUBSECOND_RE.test(value)) return 'rawDuration';
  if (motionStyleValue ? EASING_KEYWORD_RE.test(value) : hasKeywordEasingInCssText(value)) {
    return 'keywordEasing';
  }
  return null;
}

export const noMotionLiterals: Rule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow cubic-bezier, keyword easing and raw sub-second duration literals in modern-engine and graphics/motion style values; use the --ds-motion-* canon',
    },
    schema: [],
    messages: {
      cubicBezier:
        'Raw cubic-bezier() easing in a modern-engine style value. Use a --ds-motion-* easing token (e.g. var(--ds-motion-ease-out)).',
      rawDuration:
        'Raw duration literal in a modern-engine style value. Use a --ds-motion-* duration token (e.g. var(--ds-motion-fast)).',
      keywordEasing:
        'Keyword easing in a modern-engine motion value. Use a --ds-motion-* easing token (e.g. var(--ds-motion-ease-in-out)).',
    },
  },

  create(context): Record<string, (node: any) => void> {
    const filename: string = context.filename ?? context.getFilename?.() ?? '';
    if (!isMotionAuthoringFile(filename)) return {};

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
