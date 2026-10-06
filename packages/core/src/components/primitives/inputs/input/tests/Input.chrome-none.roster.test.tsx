import React from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ModernInput from '../engines/modern';

// The chrome-none cascade gate measures this markup in Chromium; it must stay what the engine renders.
const ROSTER = JSON.parse(readFileSync(join(__dirname, '../../../../../../scripts/check/tokens/cascade/chrome-none/roster/index.json'), 'utf8'));
const input = ROSTER.owners.find((owner: { id: string }) => owner.id === 'input');

describe('chrome-none gate roster: Input fixtures', () => {
  it.each([
    ['plain', <ModernInput chrome="none" aria-label="Plain" />],
    ['affix', <ModernInput chrome="none" aria-label="Affix" prefix={<span>@</span>} />],
  ])('the %s fixture is the markup the Modern engine renders', (fixture, element) => {
    const { container } = render(element);
    for (const node of container.querySelectorAll('[id]')) node.removeAttribute('id');
    expect(container.innerHTML).toBe(input.fixtures[fixture]);
  });
});
