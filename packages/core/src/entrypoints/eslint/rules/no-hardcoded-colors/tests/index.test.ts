import { describe, expect, it } from 'vitest';

import { noHardcodedColors } from '..';

function visitors() {
  const reports: Array<{ messageId?: string }> = [];
  const created = noHardcodedColors.create({
    filename: '/app/src/components/card/index.tsx',
    options: [],
    report: (descriptor) => reports.push(descriptor),
  });
  return { created, reports };
}

describe('no-hardcoded-colors', () => {
  it('blocks literal colors in style props', () => {
    const { created, reports } = visitors();
    created.JSXAttribute?.({
      name: { name: 'style' },
      value: {
        type: 'JSXExpressionContainer',
        expression: {
          type: 'ObjectExpression',
          properties: [{
            type: 'Property',
            key: { type: 'Identifier', name: 'color' },
            value: { type: 'Literal', value: '#fff' },
          }],
        },
      },
    });
    expect(reports).toHaveLength(1);
    expect(reports[0]?.messageId).toBe('hardcodedStyle');
  });

  it('allows design-token variables', () => {
    const { created, reports } = visitors();
    created.JSXAttribute?.({
      name: { name: 'style' },
      value: {
        type: 'JSXExpressionContainer',
        expression: {
          type: 'ObjectExpression',
          properties: [{
            type: 'Property',
            key: { type: 'Identifier', name: 'color' },
            value: { type: 'Literal', value: 'var(--ds-color-text)' },
          }],
        },
      },
    });
    expect(reports).toEqual([]);
  });
});
