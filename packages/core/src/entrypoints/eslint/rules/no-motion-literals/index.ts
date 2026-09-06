/**
 * @rottay/no-motion-literals
 *
 * Forbid raw motion literals in modern-engine style values: `cubic-bezier(...)` easing
 * literals and raw sub-second duration literals (`150ms`, `0.2s`). Motion must reference the
 * foundation `--ds-motion-*` canon (WO-ENG-01) so cadence and easing tune centrally.
 *
 * Scoped to the two owners that author interaction motion: every file under a
 * `engines/modern/` subtree, and the motion vocabulary itself under
 * `graphics/motion/`. Classic (Ant Design) and rustic legitimately use the legacy
 * `--transition-*`/`--duration-*` catalog and are not linted by this rule.
 * Loop/long-form durations >= 1s (shimmer, spinner) are allowed: they sit outside the
 * 120/200/320 interaction cadence.
 */
import type { Rule } from '../../contracts';

const CUBIC_BEZIER_RE = /cubic-bezier\s*\(/;
const MS_RE = /\b\d+(?:\.\d+)?ms\b/;
/** Sub-second seconds only (>= 1s loop/shimmer tempos are allowed). */
const SUBSECOND_RE = /(?<![\w.])0?\.\d+s(?![\w])/;

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
        'Disallow cubic-bezier and raw sub-second duration literals in modern-engine and graphics/motion style values; use the --ds-motion-* canon',
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
    if (!isMotionAuthoringFile(filename)) return {};

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
