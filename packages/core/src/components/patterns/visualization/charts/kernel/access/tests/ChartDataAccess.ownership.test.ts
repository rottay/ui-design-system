import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const accessRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const files = [
  'ChartDataAccess.tsx',
  'ChartDataAccess.types.ts',
  'ChartDataAccess.csv.ts',
] as const;

describe('ChartDataAccess ownership boundary', () => {
  it('keeps the pilot supplier-neutral and independent from tenant or hostname identity', () => {
    for (const file of files) {
      const source = readFileSync(resolve(accessRoot, file), 'utf8');
      expect(source, `${file} imports a governed visual supplier`).not.toMatch(
        /from\s+['"](?:antd|d3|motion|framer-motion|lucide-react|@phosphor-icons\/react|@thesvg\/react|three|@react-three\/[^'"]+)['"]/u,
      );
      expect(source, `${file} branches on hostname`).not.toMatch(
        /(?:window\.)?location\.hostname|headers\(\).*host|document\.domain/u,
      );
      expect(source, `${file} reaches tenant identity`).not.toMatch(
        /\buseTenant\b|tenantSlug|tenant\.id|tenantId/u,
      );
    }
  });

  it('contains no hidden dataset carrier', () => {
    const component = readFileSync(resolve(accessRoot, 'ChartDataAccess.tsx'), 'utf8');
    expect(component).not.toMatch(/type=['"]hidden['"]|\bhidden\s*=|\.hidden\s*=|display:\s*none/u);
    expect(component).not.toMatch(/JSON\.stringify\s*\(\s*rows|data-(?:rows|dataset)=/u);
  });
});

