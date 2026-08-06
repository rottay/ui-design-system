/**
 * Notification modern skin -- overlay-tier material commitment.
 *
 * Same law as Toast: a notification card is a floating transient layer and
 * must ride the OVERLAY material channels, not the card facet, so a tenant
 * that moves the overlay tier moves every floating surface together.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const HERE = dirname(fileURLToPath(import.meta.url));
const SKIN = readFileSync(
  resolve(HERE, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/notification.css'),
  'utf8',
);

describe('Notification modern skin overlay material', () => {
  it('reads the overlay texture channel, never the card one', () => {
    expect(SKIN).toContain('var(--ds-material-overlay-texture, none),');
    expect(SKIN).not.toMatch(/var\(--ds-material-card-texture/);
  });

  it('routes rest depth through the overlay shadow role as a whole value', () => {
    expect(SKIN).toContain(
      'box-shadow: var(--ds-material-overlay-shadow, var(--ds-elevation-3));',
    );
  });
});
