import React from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ModernSelect from '../engines/modern';

// The chrome-none cascade gate measures this markup in Chromium; it must stay what the engine renders.
const ROSTER = JSON.parse(readFileSync(join(__dirname, '../../../../../../scripts/check/tokens/cascade/chrome-none/roster/index.json'), 'utf8'));
const select = ROSTER.owners.find((owner: { id: string }) => owner.id === 'select');
const OPTIONS = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
];

describe('chrome-none gate roster: Select fixtures', () => {
  it.each([
    ['native', <ModernSelect chrome="none" aria-label="Native" placeholder="" options={OPTIONS} value="a" />],
    ['custom', <ModernSelect chrome="none" aria-label="Custom" placeholder="" forceCustomDropdown options={OPTIONS} value="a" />],
  ])('the %s fixture is the markup the Modern engine renders', (fixture, element) => {
    const { container } = render(element);
    expect(container.innerHTML).toBe(select.fixtures[fixture]);
  });
});
