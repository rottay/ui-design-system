import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const surfaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const files = [
  { label: 'presentation/access/index.tsx', path: resolve(surfaceRoot, 'index.tsx') },
  { label: 'foundation/access/index.ts', path: resolve(surfaceRoot, '../../../foundation/access/index.ts') },
  { label: 'foundation/access/csv/index.ts', path: resolve(surfaceRoot, '../../../foundation/access/csv/index.ts') },
] as const;

describe('ChartDataAccess ownership boundary', () => {
  it('keeps the pilot supplier-neutral and independent from tenant or hostname identity', () => {
    for (const file of files) {
      const source = readFileSync(file.path, 'utf8');
      expect(source, `${file.label} imports a governed visual supplier`).not.toMatch(
        /from\s+['"](?:antd|d3|motion|framer-motion|lucide-react|@phosphor-icons\/react|@thesvg\/react|three|@react-three\/[^'"]+)['"]/u,
      );
      expect(source, `${file.label} branches on hostname`).not.toMatch(
        /(?:window\.)?location\.hostname|headers\(\).*host|document\.domain/u,
      );
      expect(source, `${file.label} reaches tenant identity`).not.toMatch(
        /\buseTenant\b|tenantSlug|tenant\.id|tenantId/u,
      );
    }
  });

  it('contains no hidden dataset carrier', () => {
    const component = readFileSync(resolve(surfaceRoot, 'index.tsx'), 'utf8');
    expect(component).not.toMatch(/type=['"]hidden['"]|\bhidden\s*=|\.hidden\s*=|display:\s*none/u);
    expect(component).not.toMatch(/JSON\.stringify\s*\(\s*rows|data-(?:rows|dataset)=/u);
  });
});
