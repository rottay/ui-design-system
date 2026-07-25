/**
 * TagInput modern skin -- contrast-channel guard (K2-V Pass-2 regression).
 *
 * Two measured channels keep this container AA-compliant in both governed
 * sources (values measured live on :7001, K2-V Pass-2 falsification):
 *
 * 1. The container surface reads the certified Input family's `--ds-input-bg`
 *    (TMM: #FFFEFB). The generic `--ds-color-bg-input` resolves near-black
 *    under TMM (#0f0f12) -- 1.29:1 on the inline input text, axe serious.
 * 2. The composed primary Tags' SOLID ink is scoped through the governed R0
 *    channel `--ds-tag-primary-ink` set on OUR container (never a Tag edit):
 *    TMM sets `--ds-color-text-on-primary` near-black (3.57:1 on its teal
 *    primary); the white fallback measures 5.50:1. The OUTLINED treatment
 *    reads the separate `--ds-tag-primary-outlined-ink` and is unaffected.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const HERE = dirname(fileURLToPath(import.meta.url));
const skin = readFileSync(
  resolve(HERE, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/tag-input.css'),
  'utf8',
);

describe('TagInput modern skin contrast channels', () => {
  it('reads the certified --ds-input-bg control-surface channel', () => {
    expect(skin).toContain('background: var(--ds-input-bg, var(--ds-surface-control))');
  });

  it('never reads the generic --ds-color-bg-input (near-black under TMM)', () => {
    expect(skin).not.toContain('var(--ds-color-bg-input');
  });

  it('scopes the governed --ds-tag-primary-ink channel on the container', () => {
    expect(skin).toContain('--ds-tag-primary-ink: var(--ds-color-white)');
  });

  it('does not repaint the composed Tag directly (single chip paint owner)', () => {
    // Chip paint belongs to tag.css; this file may only SET the ink channel
    // on the container, never target the Tag's own parts with color rules.
    expect(skin).not.toMatch(/\.ds-tag-input[^{]*\[data-part='content'\]/);
    expect(skin).not.toMatch(/\.ds-tag-input[^{]*\[data-part='close'\]/);
  });
});
