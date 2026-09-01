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
});
