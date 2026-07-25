/**
 * Rate modern skin -- forced-colors channel guard (K2-V sweep regression).
 *
 * Sighted on the :7001 sweep (captures/pass1 forced-colors cell): with
 * `forced-color-adjust: auto` every star is forced to ButtonText, so a 3.5
 * value read as five identical filled stars. The media rule opts the empty
 * stars and the half-star background track out of the adjustment and renders
 * the system GrayText, keeping the value perceivable.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const HERE = dirname(fileURLToPath(import.meta.url));
const skin = readFileSync(
  resolve(HERE, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/rate.css'),
  'utf8',
);

describe('Rate modern skin forced-colors value legibility (K2-V sweep)', () => {
  it('renders empty stars and the half-star track in system GrayText under forced colors', () => {
    expect(skin).toContain('@media (forced-colors: active)');
    expect(skin).toContain("[data-part='star'][data-state='empty']");
    expect(skin).toContain('.rottay-rate-star-track');
    expect(skin).toContain('forced-color-adjust: none;');
    expect(skin).toContain('color: GrayText;');
  });
});
