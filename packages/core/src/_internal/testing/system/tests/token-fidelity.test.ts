/**
 * @fileoverview Token fidelity guardrails.
 * Static analysis tests that verify Modern engine source files actually
 * reference their canonical `--ds-{component}-*` CSS custom properties.
 *
 * If a modern engine has zero or very few references to its token family,
 * the component is visually "untethered" from the token system and tenant
 * themes cannot customize it.
 *
 * This test reads source files on disk -- no rendering, no DOM.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

const SRC_ROOT = join(process.cwd(), 'src');

/**
 * Fidelity matrix: each entry maps a component's modern engine file to the
 * token prefix it must reference, with a minimum reference count.
 *
 * The `minRefs` threshold is intentionally conservative -- it represents the
 * floor below which the engine is clearly not consuming its token family.
 * Increase thresholds as engines mature.
 */
const FIDELITY_MATRIX = [
  {
    component: 'Statistic',
    file: 'components/primitives/display/Statistic/engines/modern.tsx',
    prefix: '--ds-statistic-',
    minRefs: 5,
  },
  {
    component: 'Card',
    file: 'components/primitives/display/Card/engines/modern.tsx',
    prefix: '--ds-card-',
    minRefs: 10,
  },
  {
    component: 'Avatar',
    file: 'components/primitives/display/Avatar/engines/modern.tsx',
    prefix: '--ds-avatar-',
    minRefs: 5,
  },
  {
    component: 'Badge',
    file: 'components/primitives/display/Badge/engines/modern.tsx',
    prefix: '--ds-badge-',
    minRefs: 3,
  },
  {
    component: 'Toggle',
    file: 'components/primitives/inputs/Toggle/engines/modern.tsx',
    prefix: '--ds-toggle-',
    minRefs: 3,
  },
  {
    component: 'Spinner',
    file: 'components/primitives/feedback/Spinner/engines/modern.tsx',
    prefix: '--ds-spinner-',
    minRefs: 3,
  },
  {
    component: 'Checkbox',
    file: 'components/primitives/inputs/Checkbox/engines/modern.tsx',
    prefix: '--ds-checkbox-',
    minRefs: 3,
  },
  {
    component: 'Rate',
    file: 'components/primitives/feedback/Rate/engines/modern.tsx',
    prefix: '--ds-rate-',
    minRefs: 3,
  },
  {
    component: 'Button',
    file: 'components/primitives/inputs/Button/engines/modern.tsx',
    prefix: '--ds-button-',
    minRefs: 3,
  },
];

describe('token fidelity', () => {
  it.each(FIDELITY_MATRIX)(
    '$component modern engine references >= $minRefs $prefix tokens',
    ({ file, prefix, minRefs }) => {
      const absolutePath = join(SRC_ROOT, file);
      const src = readFileSync(absolutePath, 'utf-8');
      const matches = src.match(new RegExp(prefix, 'g'));
      expect(matches?.length ?? 0).toBeGreaterThanOrEqual(minRefs);
    },
  );
});
