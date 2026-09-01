import { describe, expect, it } from 'vitest';

import { noDbInComponents } from '..';

function visitors(filename = '/app/src/components/card/index.tsx') {
  const reports: Array<{ messageId?: string }> = [];
  const created = noDbInComponents.create({
    filename,
    options: [],
    report: (descriptor) => reports.push(descriptor),
  });
  return { created, reports };
}

describe('no-db-in-components', () => {
  it('blocks database imports in component files', () => {
    const { created, reports } = visitors();
    created.ImportDeclaration?.({ source: { value: 'drizzle-orm' } });
    expect(reports).toHaveLength(1);
    expect(reports[0]?.messageId).toBe('noDb');
  });

  it('allows non-database imports', () => {
    const { created, reports } = visitors();
    created.ImportDeclaration?.({ source: { value: 'react' } });
    expect(reports).toEqual([]);
  });
});
