/**
 * Message modern skin -- overlay-tier material commitment.
 *
 * Message was the one announcement family with no material facet at all; it
 * now carries the same OVERLAY texture channel as Toast and Notification and
 * routes its rest depth through the overlay shadow role as a whole value.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const HERE = dirname(fileURLToPath(import.meta.url));
const SKIN = readFileSync(
  resolve(HERE, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/message.css'),
  'utf8',
);

describe('Message modern skin overlay material', () => {
  it('carries the overlay texture channel above the accent wash', () => {
    expect(SKIN).toContain('var(--ds-material-overlay-texture, none),');
    expect(SKIN).not.toMatch(/var\(--ds-material-card-texture/);
  });

  it('routes rest depth through the overlay shadow role as a whole value', () => {
    expect(SKIN).toContain(
      'box-shadow: var(--ds-material-overlay-shadow, var(--ds-elevation-3));',
    );
  });
});
