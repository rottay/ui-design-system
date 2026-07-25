/**
 * InputNumber modern skin -- contrast-channel guard (K2-V Pass-2 regression).
 *
 * The control surface must read the certified Input family's `--ds-input-bg`
 * channel. The generic `--ds-color-bg-input` resolves near-black (#0f0f12)
 * under the TMM DB appearance (dark-text theme) -- 1.29:1 on the input text,
 * axe color-contrast serious, reproduced live on :7001. `--ds-input-bg`
 * resolves to TMM's light control surface (#FFFEFB) and to #fff under
 * BitHire, so it is hue-faithful in both governed sources.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const HERE = dirname(fileURLToPath(import.meta.url));
const skin = readFileSync(
  resolve(HERE, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/input-number.css'),
  'utf8',
);

describe('InputNumber modern skin contrast channel', () => {
  it('reads the certified --ds-input-bg control-surface channel', () => {
    expect(skin).toContain('background: var(--ds-input-bg, var(--ds-surface-control))');
  });

  it('never reads the generic --ds-color-bg-input (near-black under TMM)', () => {
    expect(skin).not.toContain('var(--ds-color-bg-input');
  });
});
