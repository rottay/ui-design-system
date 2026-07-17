import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const PERSONALITY_CSS = readFileSync(
  resolve(TEST_DIR, '..', 'css/runtime/personality.css'),
  'utf8',
);
const KEYFRAMES_CSS = readFileSync(
  resolve(TEST_DIR, '..', 'css/foundation/animations/keyframes.css'),
  'utf8',
);

describe('reduced-motion CSS fail-safe', () => {
  it('suppresses opted-in primitive choreography without replacing consumer visual styles', () => {
    expect(PERSONALITY_CSS).toContain('@media (prefers-reduced-motion: reduce)');
    expect(PERSONALITY_CSS).toContain(
      "[data-ds-motion-primitive][data-ds-motion-state='entrance']",
    );
    expect(PERSONALITY_CSS).toContain('animation: none !important');
    expect(PERSONALITY_CSS).toContain('transition: none !important');
    expect(PERSONALITY_CSS).not.toContain('opacity: 1 !important');
    expect(PERSONALITY_CSS).not.toContain('transform: none !important');
  });

  it('keeps one global duration fail-safe plus the provider-owned CSS seam', () => {
    expect(PERSONALITY_CSS).toContain('animation-duration: 0.01ms !important');
    expect(KEYFRAMES_CSS).not.toContain('animation-duration: 0.01s !important');
    expect(PERSONALITY_CSS).toContain("html[data-ds-motion='reduced']");
    expect(PERSONALITY_CSS).toContain(
      "html[data-ds-motion='reduced'] [data-ds-motion-primitive][data-ds-motion-state='entrance']",
    );
  });

  it('does not erase legitimate final opacity or transforms on static primitives', () => {
    expect(PERSONALITY_CSS).not.toMatch(
      /(?:^|\n)\s*\[data-ds-motion-primitive\](?:,|\s*\{)/,
    );
    expect(PERSONALITY_CSS).not.toMatch(
      /html\[data-ds-motion='reduced'\]\s+\[data-ds-motion-primitive\](?:,|\s*\{)/,
    );
  });
});
