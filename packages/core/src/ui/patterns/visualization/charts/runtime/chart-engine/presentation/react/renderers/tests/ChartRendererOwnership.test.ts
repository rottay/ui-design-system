import { readdirSync, readFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const rendererRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const kernelRoot = resolve(rendererRoot, '../../..');

function productSourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      return entry.name === 'tests' ? [] : productSourceFiles(path);
    }
    return /\.(?:ts|tsx)$/.test(entry.name) ? [path] : [];
  });
}

const geometryPath = 'foundation/renderers/geometry/index.ts';
const geometryFile = resolve(kernelRoot, geometryPath);
const sourceFiles = [geometryFile, ...productSourceFiles(rendererRoot)].sort();

describe('Chart renderer ownership boundary', () => {
  it('keeps D3 inside immutable geometry and forbids imperative DOM ownership', () => {
    expect(sourceFiles.map((file) => relative(kernelRoot, file))).toContain(geometryPath);

    for (const file of sourceFiles) {
      const sourcePath = relative(kernelRoot, file);
      const source = readFileSync(file, 'utf8');
      if (sourcePath !== geometryPath) {
        expect(source, `${sourcePath} imports D3 outside the geometry boundary`)
          .not.toMatch(/from ['"]d3['"]/);
      }
      expect(source, `${sourcePath} selects DOM imperatively`).not.toMatch(/\bselect(?:All)?\s*\(/);
      expect(source, `${sourcePath} appends DOM imperatively`).not.toMatch(/\.append\s*\(/);
      expect(source, `${sourcePath} removes DOM imperatively`).not.toMatch(/\.remove\s*\(/);
      expect(source, `${sourcePath} starts a D3 transition`).not.toMatch(/\.transition\s*\(/);
      expect(source, `${sourcePath} interrupts D3 imperatively`).not.toMatch(/\.interrupt\s*\(/);
      expect(source, `${sourcePath} writes D3 attributes imperatively`).not.toMatch(/\.attr\s*\(/);
      expect(source, `${sourcePath} binds D3 events imperatively`).not.toMatch(/\.on\s*\(/);
      expect(source, `${sourcePath} imports a D3 DOM axis`).not.toMatch(/\baxis(?:Top|Right|Bottom|Left)\b/);
    }
  });
});
