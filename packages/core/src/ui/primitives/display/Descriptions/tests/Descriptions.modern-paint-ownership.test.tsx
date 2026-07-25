import React from 'react';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

// ---------------------------------------------------------------------------
// K3-A Pass 2 — modern Descriptions CONTRAST LAW pin.
//
// Axe (serious, BOTH governed sources): the DS-default label channel #737373
// fails AA on the tinted row surfaces (~4.3-4.4:1 on bithire #F1F5F8 and TMM
// #F8F1E4). The skin deepens the resolved ink 30% toward the source's own
// primary text ink (measured worst source: TMM 70% = 5.26:1), keeping a raw
// tenant escape hatch (`--ds-descriptions-label-ink`). Pinned here so the mix
// cannot silently regress to the failing raw channel.
// ---------------------------------------------------------------------------

const SKIN = readFileSync(
  join(
    dirname(fileURLToPath(import.meta.url)),
    '../../../../../foundation/tokens/css/runtime/engines/modern/skin/descriptions.css'
  ),
  'utf8'
);

describe('Descriptions modern — CONTRAST LAW label ink (axe AA, K3-A Pass 2)', () => {
  it('pins the measured 70/30 mix + the raw tenant escape hatch', () => {
    expect(SKIN).toMatch(/--ds-descriptions-label-ink/);
    expect(SKIN).toMatch(
      /\[data-part='label'\][^{]*\{[^}]*color-mix\(\s*in srgb,\s*var\(--ds-descriptions-label-color,\s*var\(--ds-color-text-secondary\)\)\s*70%,\s*var\(--ds-color-text-primary\)\s*30%\s*\)/
    );
  });
});
