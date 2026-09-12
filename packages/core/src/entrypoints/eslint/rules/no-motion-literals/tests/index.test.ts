import { describe, expect, it } from 'vitest';

import { noMotionLiterals } from '..';

function visitors(filename = '/repo/src/components/button/engines/modern/index.tsx') {
  const reports: Array<{ messageId?: string }> = [];
  const created = noMotionLiterals.create({
    filename,
    options: [],
    report: (descriptor) => reports.push(descriptor),
  });
  return { created, reports };
}

/** A string literal as the value of `key: <value>`, optionally behind a conditional. */
function styleValue(key: string, value: string, conditional = false) {
  const property: any = { type: 'Property', computed: false, key: { type: 'Identifier', name: key } };
  const literal: any = { type: 'Literal', value };
  if (conditional) {
    const test: any = { type: 'ConditionalExpression', consequent: { type: 'Literal', value: 'none' }, alternate: literal };
    literal.parent = test;
    test.parent = property;
    property.value = test;
  } else {
    literal.parent = property;
    property.value = literal;
  }
  return literal;
}

/** A template element inside `key: \`...\``. */
function styleTemplate(key: string, cooked: string) {
  const property: any = { type: 'Property', computed: false, key: { type: 'Identifier', name: key } };
  const template: any = { type: 'TemplateLiteral', parent: property };
  property.value = template;
  return { type: 'TemplateElement', value: { cooked, raw: cooked }, parent: template };
}

describe('no-motion-literals', () => {
  it('blocks raw interaction motion in modern engines', () => {
    const { created, reports } = visitors();
    created.Literal?.({ value: '150ms cubic-bezier(0.2, 0, 0, 1)' });
    expect(reports).toHaveLength(1);
    expect(reports[0]?.messageId).toBe('cubicBezier');
  });

  it('does not run outside modern engines', () => {
    const { created, reports } = visitors('/repo/src/components/button/engines/rustic/index.tsx');
    expect(Object.keys(created)).toEqual([]);
    expect(reports).toEqual([]);
  });

  it('blocks keyword easing in a transition or animation value, including behind a conditional', () => {
    const { created, reports } = visitors('/repo/src/graphics/motion/react/presentation/effects/aurora/index.tsx');
    created.Literal?.(styleValue('transition', 'opacity var(--ds-motion-fast) ease-out'));
    created.Literal?.(styleValue('animationTimingFunction', 'ease-in-out'));
    created.Literal?.(styleValue('animation', 'ds-spin 2s steps(8) infinite', true));
    created.TemplateElement?.(styleTemplate('animation', 'ds-grid-fade 3s ease infinite'));
    expect(reports.map((report) => report.messageId)).toEqual([
      'keywordEasing',
      'keywordEasing',
      'keywordEasing',
      'keywordEasing',
    ]);
  });

  it('blocks keyword easing authored as CSS text', () => {
    const { created, reports } = visitors();
    created.TemplateElement?.({ value: { cooked: '.x { transition: transform var(--ds-motion-slow) ease-in; }' } });
    expect(reports.map((report) => report.messageId)).toEqual(['keywordEasing']);
  });

  it('accepts the motion canon, constant-velocity loops and non-motion strings', () => {
    const { created, reports } = visitors();
    created.Literal?.(styleValue('transition', 'opacity var(--ds-motion-fast) var(--ds-motion-ease-out)'));
    created.Literal?.(styleValue('animation', 'ds-foundation-spin var(--ds-motion-glacial) linear infinite'));
    created.Literal?.(styleValue('content', 'ease-in-out'));
    created.Literal?.({ value: 'ease-out' });
    expect(reports).toEqual([]);
  });
});
