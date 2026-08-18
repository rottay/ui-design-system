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

interface RuntimeVariableReferences {
  /** `var(--x)`: nothing paints unless `--x` is declared somewhere. */
  readonly unconditional: Set<string>;
  /** `var(--x, fallback)`: well-formed CSS even when `--x` is never declared. */
  readonly guarded: Set<string>;
}

function emptyReferences(): RuntimeVariableReferences {
  return { unconditional: new Set<string>(), guarded: new Set<string>() };
}

function collectRuntimeTokenVariables(
  value: unknown,
  output: RuntimeVariableReferences = emptyReferences()
): RuntimeVariableReferences {
  if (typeof value === 'string') {
    // The two groups are the variable name and the comma that opens a
    // fallback. `var(--a, var(--b))` matches twice: `--a` guarded, `--b`
    // unconditional, which is exactly how the cascade reads it.
    for (const match of value.matchAll(/var\(\s*(--[\w-]+)\s*(,?)/g)) {
      const bucket = match[2] === ',' ? output.guarded : output.unconditional;
      bucket.add(match[1]);
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

/**
 * Channels a first-party theme references defensively. Each one is spelled
 * `var(--x, <fallback>)`, no compiler emits it and no CSS file declares it, so
 * the fallback is what paints today. They are pinned as an explicit inventory
 * instead of being waved through: a NEW undeclared reference still fails, and
 * the day one of these gains a real owner the list has to shrink.
 */
const KNOWN_FALLBACK_ONLY_REFERENCES = [
  '--ds-color-error-hover',
  '--ds-color-primary-active',
  '--ds-color-text-on-error',
  '--ds-color-text-on-info',
  '--ds-color-text-on-success',
];

describe('design token contract', () => {
  it('keeps every public token reference aligned with a real CSS custom property', () => {
    const definedCssVariables = collectDefinedCssVariables();
    const referencedRuntimeVariables = collectRuntimeTokenVariables(runtimeTokens);

    expect(referencedRuntimeVariables.unconditional.size).toBeGreaterThan(0);

    const missingVariables = [...referencedRuntimeVariables.unconditional].filter(
      (variableName) => !definedCssVariables.has(variableName)
    );

    expect(missingVariables).toEqual([]);
  });

  it('pins the references that only resolve through their fallback', () => {
    const definedCssVariables = collectDefinedCssVariables();
    const referencedRuntimeVariables = collectRuntimeTokenVariables(runtimeTokens);

    const fallbackOnly = [...referencedRuntimeVariables.guarded]
      .filter(
        (variableName) =>
          !definedCssVariables.has(variableName) &&
          !referencedRuntimeVariables.unconditional.has(variableName)
      )
      .sort();

    expect(fallbackOnly).toEqual([...KNOWN_FALLBACK_ONLY_REFERENCES].sort());
  });

  it('exposes the canonical token groups from the public tokens entry', () => {
    expect(runtimeTokens).toHaveProperty('base');
    expect(runtimeTokens).toHaveProperty('components');
    expect(runtimeTokens).toHaveProperty('tenants');
  });
});
