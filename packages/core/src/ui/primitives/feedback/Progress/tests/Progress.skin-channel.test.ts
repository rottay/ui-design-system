/**
 * Progress modern skin -- forced-colors channel guard (K2-V sweep pin).
 *
 * The K2-V sweep found Upload's text-list progress bar invisible under
 * forced-colors: the native `<progress>` parts rode token backgrounds that
 * the HC adjustment washes out. The skin now maps track -> ButtonFace with
 * a ButtonText edge and value/indeterminate -> Highlight, so the fill stays
 * visible on any HC theme. Upload renders the Progress primitive, so the
 * family-level rule covers every consumer.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const HERE = dirname(fileURLToPath(import.meta.url));
const skin = readFileSync(
  resolve(
    HERE,
    '../../../../../foundation/tokens/css/runtime/engines/modern/skin/progress.css',
  ),
  'utf8',
);

describe('Progress modern skin forced-colors channel (K2-V sweep)', () => {
  it('maps the progress parts to system colors under forced-colors', () => {
    expect(skin).toContain('@media (forced-colors: active)');
    expect(skin).toContain("[data-part='fill'] {\n    background: ButtonFace;");
    expect(skin).toContain('border: 1px solid ButtonText;');
    expect(skin).toContain("[data-part='fill']::-webkit-progress-value {\n    background: Highlight;");
    expect(skin).toContain("[data-part='fill']::-moz-progress-bar {\n    background: Highlight;");
  });

  it('gives the indeterminate sliding bar the same Highlight ink', () => {
    expect(skin).toContain(
      "[data-part='indeterminate'][data-part='indeterminate'] {\n    background: Highlight;",
    );
  });
});
