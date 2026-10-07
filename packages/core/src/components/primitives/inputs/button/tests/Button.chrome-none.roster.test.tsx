import React from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ModernButton from '../engines/modern';
import { ButtonGroup } from '../compound';

// The chrome-none cascade gate measures this markup in Chromium; it must stay what the engine renders.
const ROSTER = JSON.parse(readFileSync(join(__dirname, '../../../../../../scripts/check/tokens/cascade/chrome-none/roster/index.json'), 'utf8'));
const button = ROSTER.owners.find((owner: { id: string }) => owner.id === 'button');

describe('chrome-none gate roster: Button fixtures', () => {
  it.each([
    ['plain', <ModernButton chrome="none">Save</ModernButton>],
    ['group-h', <ButtonGroup connected orientation="horizontal"><ModernButton chrome="none">A</ModernButton><ModernButton chrome="none">B</ModernButton></ButtonGroup>],
    ['group-v', <ButtonGroup connected orientation="vertical"><ModernButton chrome="none">A</ModernButton><ModernButton chrome="none">B</ModernButton></ButtonGroup>],
  ])('the %s fixture is the markup the Modern engine renders', (fixture, element) => {
    const { container } = render(element);
    expect(container.innerHTML).toBe(button.fixtures[fixture]);
  });
});
