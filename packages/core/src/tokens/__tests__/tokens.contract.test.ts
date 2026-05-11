import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { tokens as runtimeTokens } from '../index';

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const CSS_ROOT = join(TEST_DIR, '..', 'css');

function walkFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = join(dir, entry.name);
    return entry.isDirectory() ? walkFiles(fullPath) : [fullPath];
  });
}

function collectDefinedCssVariables(): Set<string> {
  const cssFiles = walkFiles(CSS_ROOT).filter((filePath) => filePath.endsWith('.css'));
  const definitions = new Set<string>();

  cssFiles.forEach((filePath) => {
    const source = readFileSync(filePath, 'utf8');

    for (const match of source.matchAll(/(--[\w-]+)\s*:/g)) {
      definitions.add(match[1]);
    }
  });

  return definitions;
}

function collectRuntimeTokenVariables(value: unknown, output = new Set<string>()): Set<string> {
  if (typeof value === 'string') {
    for (const match of value.matchAll(/var\((--[\w-]+)/g)) {
      output.add(match[1]);
    }

    return output;
  }

  if (Array.isArray(value)) {
    value.forEach((entry) => collectRuntimeTokenVariables(entry, output));
    return output;
  }

  if (value && typeof value === 'object') {
    Object.values(value).forEach((entry) => collectRuntimeTokenVariables(entry, output));
  }

  return output;
}

describe('design token contract', () => {
  it('keeps every public token reference aligned with a real CSS custom property', () => {
    const definedCssVariables = collectDefinedCssVariables();
    const referencedRuntimeVariables = collectRuntimeTokenVariables(runtimeTokens);

    expect(referencedRuntimeVariables.size).toBeGreaterThan(0);

    const missingVariables = [...referencedRuntimeVariables].filter(
      (variableName) => !definedCssVariables.has(variableName)
    );

    expect(missingVariables).toEqual([]);
  });

  it('exposes the canonical token groups from the public tokens entry', () => {
    expect(runtimeTokens).toHaveProperty('base');
    expect(runtimeTokens).toHaveProperty('components');
    expect(runtimeTokens).toHaveProperty('tenants');
  });
});
