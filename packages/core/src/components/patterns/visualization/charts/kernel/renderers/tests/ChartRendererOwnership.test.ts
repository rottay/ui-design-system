import { readdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const rendererRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceFiles = readdirSync(rendererRoot)
  .filter((file) => /\.(?:ts|tsx)$/.test(file))
  .sort();

describe('Chart renderer ownership boundary', () => {
  it('keeps D3 inside immutable geometry and forbids imperative DOM ownership', () => {
    expect(sourceFiles).toContain('ChartGeometry.ts');

    for (const file of sourceFiles) {
      const source = readFileSync(resolve(rendererRoot, file), 'utf8');
      if (file !== 'ChartGeometry.ts') {
        expect(source, `${file} imports D3 outside the geometry boundary`)
          .not.toMatch(/from ['"]d3['"]/);
      }
      expect(source, `${file} selects DOM imperatively`).not.toMatch(/\bselect(?:All)?\s*\(/);
      expect(source, `${file} appends DOM imperatively`).not.toMatch(/\.append\s*\(/);
      expect(source, `${file} removes DOM imperatively`).not.toMatch(/\.remove\s*\(/);
      expect(source, `${file} starts a D3 transition`).not.toMatch(/\.transition\s*\(/);
      expect(source, `${file} interrupts D3 imperatively`).not.toMatch(/\.interrupt\s*\(/);
      expect(source, `${file} writes D3 attributes imperatively`).not.toMatch(/\.attr\s*\(/);
      expect(source, `${file} binds D3 events imperatively`).not.toMatch(/\.on\s*\(/);
      expect(source, `${file} imports a D3 DOM axis`).not.toMatch(/\baxis(?:Top|Right|Bottom|Left)\b/);
    }
  });
});
