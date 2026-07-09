/**
 * @rottay/no-motion-literals
 *
 * Forbid raw motion literals in modern-engine style values: `cubic-bezier(...)` easing
 * literals and raw sub-second duration literals (`150ms`, `0.2s`). Motion must reference the
 * foundation `--ds-motion-*` canon (WO-ENG-01) so cadence and easing tune centrally.
 *
 * Scoped to `**\/engines/modern*` files only — classic (Ant Design) and rustic legitimately
 * use the legacy `--transition-*`/`--duration-*` catalog and are not linted by this rule.
 * Loop/long-form durations >= 1s (shimmer, spinner) are allowed: they sit outside the
 * 120/200/320 interaction cadence.
 */
import type { Rule } from '../types';

const CUBIC_BEZIER_RE = /cubic-bezier\s*\(/;
const MS_RE = /\b\d+(?:\.\d+)?ms\b/;
/** Sub-second seconds only (>= 1s loop/shimmer tempos are allowed). */
const SUBSECOND_RE = /(?<![\w.])0?\.\d+s(?![\w])/;

function isModernEngineFile(filename: string): boolean {
  return /engines\/modern(\/[^/]+)?\.[jt]sx?$/.test(filename.replace(/\\/g, '/'));
}

function classify(value: string): 'cubicBezier' | 'rawDuration' | null {
  if (CUBIC_BEZIER_RE.test(value)) return 'cubicBezier';
  if (MS_RE.test(value) || SUBSECOND_RE.test(value)) return 'rawDuration';
  return null;
}

export const noMotionLiterals: Rule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow cubic-bezier and raw sub-second duration literals in modern-engine style values; use the --ds-motion-* canon',
    },
    schema: [],
    messages: {
      cubicBezier:
        'Raw cubic-bezier() easing in a modern-engine style value. Use a --ds-motion-* easing token (e.g. var(--ds-motion-ease-out)).',
      rawDuration:
        'Raw duration literal in a modern-engine style value. Use a --ds-motion-* duration token (e.g. var(--ds-motion-fast)).',
    },
  },

  create(context): Record<string, (node: any) => void> {
    const filename: string = context.filename ?? context.getFilename?.() ?? '';
    if (!isModernEngineFile(filename)) return {};

    return {
      Literal(node) {
        if (typeof node.value !== 'string') return;
        const kind = classify(node.value);
        if (kind) context.report({ node, messageId: kind });
      },
      TemplateElement(node) {
        const raw: string = node.value?.cooked ?? node.value?.raw ?? '';
        const kind = classify(raw);
        if (kind) context.report({ node, messageId: kind });
      },
    };
  },
};
