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
 * The `minRefs` threshold is intentionally strict for flagship families. A
 * token existing in BrandTheme is not useful white-label capability until the
 * rendering engine and its skin consume it across anatomy, state and motion.
 * Small primitives keep a lower floor; premium families must retain a broad
 * customization surface or this gate fails before an app starts repainting.
 */
const FIDELITY_MATRIX = [
  {
    component: 'Statistic',
    file: 'components/primitives/display/statistic/engines/modern/index.tsx',
    prefix: '--ds-statistic-',
    minRefs: 5,
  },
  {
    component: 'Card',
    file: 'components/primitives/display/card/engines/modern/index.tsx',
    skin: 'foundation/tokens/css/runtime/engines/modern/skin/card/index.css',
    prefix: '--ds-card-',
    minRefs: 80,
  },
  {
    component: 'Avatar',
    file: 'components/primitives/display/avatar/engines/modern/index.tsx',
    skin: 'foundation/tokens/css/runtime/engines/modern/skin/avatar/index.css',
    prefix: '--ds-avatar-',
    minRefs: 5,
  },
  {
    component: 'Badge',
    file: 'components/primitives/display/badge/engines/modern/index.tsx',
    prefix: '--ds-badge-',
    minRefs: 3,
  },
  {
    component: 'Toggle',
    file: 'components/primitives/inputs/toggle/engines/modern/index.tsx',
    skin: 'foundation/tokens/css/runtime/engines/modern/skin/toggle/index.css',
    prefix: '--ds-toggle-',
    minRefs: 3,
  },
  {
    component: 'Spinner',
    file: 'components/primitives/feedback/spinner/engines/modern/index.tsx',
    skin: 'foundation/tokens/css/runtime/engines/modern/skin/spinner/index.css',
    prefix: '--ds-spinner-',
    minRefs: 3,
  },
  {
    component: 'Checkbox',
    file: 'components/primitives/inputs/checkbox/engines/modern/index.tsx',
    skin: 'foundation/tokens/css/runtime/engines/modern/skin/checkbox/index.css',
    prefix: '--ds-checkbox-',
    minRefs: 3,
  },
  {
    component: 'Rate',
    file: 'components/primitives/feedback/rate/engines/modern/index.tsx',
    prefix: '--ds-rate-',
    minRefs: 3,
  },
  {
    component: 'Button',
    file: 'components/primitives/inputs/button/engines/modern/index.tsx',
    skin: 'foundation/tokens/css/runtime/engines/modern/skin/button/index.css',
    prefix: '--ds-button-',
    minRefs: 120,
  },
  {
    component: 'Typography',
    file: 'components/primitives/display/typography/engines/modern/index.tsx',
    skin: 'foundation/tokens/css/runtime/engines/modern/skin/typography/index.css',
    prefix: '--ds-type-',
    minRefs: 12,
  },
  {
    component: 'Tabs',
    file: 'components/primitives/navigation/tabs/engines/modern/index.tsx',
    skin: 'foundation/tokens/css/runtime/engines/modern/skin/tabs/index.css',
    prefix: '--ds-tabs-',
    minRefs: 80,
  },
  {
    component: 'Tooltip',
    file: 'components/primitives/display/tooltip/engines/modern/index.tsx',
    skin: 'foundation/tokens/css/runtime/engines/modern/skin/tooltip/index.css',
    prefix: '--ds-tooltip-',
    minRefs: 80,
  },
  {
    component: 'Popover',
    file: 'components/primitives/overlay/popover/engines/modern/index.tsx',
    skin: 'foundation/tokens/css/runtime/engines/modern/skin/popover/index.css',
    prefix: '--ds-popover-',
    minRefs: 60,
  },
  {
    component: 'DataTable',
    file: 'components/patterns/data/data-table/engines/modern/index.tsx',
    skin: 'foundation/tokens/css/runtime/engines/modern/skin/data-table/index.css',
    prefix: '--ds-table-',
    minRefs: 80,
  },
  {
    component: 'DecisionComparison',
    file: 'components/patterns/data/decision-comparison/engines/modern/index.tsx',
    skin: 'foundation/tokens/css/presentation/components/skin/decision-comparison/index.css',
    prefix: '--ds-decision-comparison-',
    minRefs: 50,
  },
];

/**
 * A modern engine is its component AND its skin stylesheet, when it has one.
 * WO-ARC-07 moves a component's paint out of an inline `style={}` object and
 * into `foundation/tokens/css/runtime/engines/modern/skin/<name>.css`, where the same engine
 * consumes the same tokens. Counting only the `.tsx` would report zero
 * consumption for a component that consumes every token it defines.
 *
 * The identical rule lives in `scripts/check/architecture/audits/integration/index.mjs`
 * (`token-consumption-ratio`). The two run in different runtimes and must be
 * changed together; a rule honoured in one emitter and ignored in its twin is
 * the defect this design system has found more times than any other.
 */
describe('token fidelity', () => {
  it.each(FIDELITY_MATRIX)(
    '$component modern engine references >= $minRefs $prefix tokens',
    ({ file, skin, prefix, minRefs }) => {
      const countIn = (relativePath: string): number => {
        const contents = readFileSync(join(SRC_ROOT, relativePath), 'utf-8');
        return contents.match(new RegExp(prefix, 'g'))?.length ?? 0;
      };
      const refs = countIn(file) + (skin ? countIn(skin) : 0);
      expect(refs).toBeGreaterThanOrEqual(minRefs);
    },
  );
});
