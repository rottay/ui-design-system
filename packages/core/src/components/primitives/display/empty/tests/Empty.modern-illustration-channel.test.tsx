import React from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import ModernEmpty from '../engines/modern';
import { renderWithEngine } from '@tests/support/engine';

const modernSkinPath = join(
  __dirname,
  '../../../../../foundation/tokens/css/runtime/engines/modern/skin/empty/index.css',
);

describe('Empty modern illustration sizing channel', () => {
  it('stamps the part the skin sizes the preset illustration from', () => {
    const skin = readFileSync(modernSkinPath, 'utf-8');
    const { container } = renderWithEngine(<ModernEmpty image="default" />, 'modern');

    expect(skin).toContain(".rottay-empty__illustration[data-part='icon']");
    expect(
      container.querySelector(".rottay-empty__illustration[data-part='icon']"),
    ).not.toBeNull();
  });

  it('sizes the simple preset from the same governed selector', () => {
    const skin = readFileSync(modernSkinPath, 'utf-8');
    const { container } = renderWithEngine(<ModernEmpty image="simple" />, 'modern');

    expect(skin).toContain(
      ".rottay-empty--modern[data-image='simple'] .rottay-empty__illustration[data-part='icon']",
    );
    expect(
      container.querySelector(
        "[data-image='simple'] .rottay-empty__illustration[data-part='icon']",
      ),
    ).not.toBeNull();
  });

  it('does not stamp the preset part on a caller-supplied ReactNode image', () => {
    const { container } = renderWithEngine(
      <ModernEmpty image={<span data-testid="own-visual">x</span>} />,
      'modern',
    );

    expect(container.querySelector("[data-part='icon']")).toBeNull();
  });
});
