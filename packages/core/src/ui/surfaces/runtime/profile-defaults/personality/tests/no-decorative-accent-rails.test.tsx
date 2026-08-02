import React from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import type { ResolvedSurfaceProfileDefaults } from '../..';
import { SurfaceAccentBar, SurfaceAccentBarWrapper } from '..';

const SURFACE_DEFAULTS: ResolvedSurfaceProfileDefaults = {
  density: 'comfortable',
  listView: 'table',
  schedulerView: 'month',
  tabsType: 'line',
  listCompact: false,
  listCardMinWidth: 280,
  compareCompact: false,
  cardVariant: 'outlined',
  sectionSpacing: 'md',
  headerWeight: 'normal',
  animateEntrance: false,
  badgeShape: 'rounded',
  labelStyle: 'sentence',
  entranceStyle: 'none',
  entranceDuration: 0,
  staggerDelay: 0,
  countUpEnabled: false,
  pulseSpeed: 'none',
  // Deliberately the LOUDEST rail this contract can describe: the prohibition
  // under test is that no rail paints for ANY accent configuration, so a
  // 'none'/0 fixture would pass vacuously. These mirror the `left`/`gradient`
  // row of the case table below.
  accentPosition: 'left',
  accentBarThickness: 24,
  accentBarStyle: 'gradient',
};

const ACCENT_BAR_SKIN = readFileSync(
  join(
    __dirname,
    '../../../../../../foundation/tokens/css/presentation/components/skin/surface-accent-bar.css',
  ),
  'utf8',
);

describe('decorative accent-rail prohibition', () => {
  it.each([
    ['top', 'solid'],
    ['left', 'gradient'],
    ['left', 'animated'],
  ] as const)('renders no rail for position=%s and style=%s', (position, barStyle) => {
    const { container } = render(
      <SurfaceAccentBar position={position} thickness={24} barStyle={barStyle} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('keeps the compatibility wrapper transparent', () => {
    const { container, getByTestId } = render(
      <SurfaceAccentBarWrapper defaults={SURFACE_DEFAULTS}>
        <section data-testid="content">Content</section>
      </SurfaceAccentBarWrapper>,
    );

    expect(getByTestId('content')).toBe(container.firstElementChild);
    expect(container.children).toHaveLength(1);
    expect(container.querySelector('.ds-accent-bar')).toBeNull();
  });

  it('keeps the legacy skin inert and free of decorative paint', () => {
    const declarations = ACCENT_BAR_SKIN.replace(/\/\*[\s\S]*?\*\//g, '');

    expect(declarations).toMatch(/\.ds-surface\.ds-accent-bar\[data-part='bar'\]\s*\{\s*display:\s*none;/);
    expect(declarations).not.toMatch(/\b(?:background|border|animation|box-shadow)\s*:/);
    expect(declarations).not.toMatch(/--ds-color-|linear-gradient|radial-gradient/);
  });
});
