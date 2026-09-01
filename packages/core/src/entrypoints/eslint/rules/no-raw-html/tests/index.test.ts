import { describe, expect, it } from 'vitest';

import { noRawHtml } from '..';

function visitors() {
  const reports: Array<{ messageId?: string }> = [];
  const created = noRawHtml.create({
    filename: '/app/src/components/card/index.tsx',
    options: [],
    report: (descriptor) => reports.push(descriptor),
  });
  return { created, reports };
}

describe('no-raw-html', () => {
  it('blocks raw elements with design-system replacements', () => {
    const { created, reports } = visitors();
    created.JSXOpeningElement?.({ name: { type: 'JSXIdentifier', name: 'button' } });
    expect(reports).toHaveLength(1);
    expect(reports[0]?.messageId).toBe('useDS');
  });

  it('allows custom components', () => {
    const { created, reports } = visitors();
    created.JSXOpeningElement?.({ name: { type: 'JSXIdentifier', name: 'Button' } });
    expect(reports).toEqual([]);
  });
});
