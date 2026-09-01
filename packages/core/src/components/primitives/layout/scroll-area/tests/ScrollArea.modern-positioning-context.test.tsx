import React from 'react';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import postcss from 'postcss';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ModernScrollArea from '../engines/modern';
import ClassicScrollArea from '../engines/classic';
import RusticScrollArea from '../engines/rustic';

const MODERN_ROOT = ".rottay-scroll-area.rottay-scroll-area--modern[data-part='root']";

const modernSkin = readFileSync(
  resolve(
    dirname(fileURLToPath(import.meta.url)),
    '../../../../../foundation/tokens/css/runtime/engines/modern/skin/scroll-area/index.css'
  ),
  'utf8'
);

/** Every value the skin declares for `property` on the unqualified root rule. */
function rootDeclarations(property: string): string[] {
  const values: string[] = [];
  postcss.parse(modernSkin).walkRules((rule) => {
    if (rule.parent?.type !== 'root') return;
    if (!rule.selectors.some((selector) => selector.replace(/\s+/g, ' ').trim() === MODERN_ROOT)) return;
    rule.walkDecls(property, (declaration) => {
      values.push(declaration.value.trim());
    });
  });
  return values;
}

describe('ScrollArea cross-engine witness: the scroll root is a containing block', () => {
  it('classic establishes the positioning context inline', () => {
    render(<ClassicScrollArea data-testid="sa">body</ClassicScrollArea>);
    expect(screen.getByTestId('sa').style.position).toBe('relative');
  });

  it('rustic establishes the positioning context inline', () => {
    render(<RusticScrollArea data-testid="sa">body</RusticScrollArea>);
    expect(screen.getByTestId('sa').style.position).toBe('relative');
  });
});

describe('ScrollArea modern contract: the skin owns the positioning context', () => {
  it('the engine keeps no inline position (the skin is the only owner)', () => {
    render(<ModernScrollArea data-testid="sa">body</ModernScrollArea>);
    expect(screen.getByTestId('sa').style.position).toBe('');
  });

  it('the modern skin declares position: relative on the scroll root', () => {
    expect(rootDeclarations('position')).toEqual(['relative']);
  });

  it('a consumer inline position still wins over the skin', () => {
    render(
      <ModernScrollArea data-testid="sa" style={{ position: 'absolute' }}>
        body
      </ModernScrollArea>
    );
    expect(screen.getByTestId('sa').style.position).toBe('absolute');
  });
});
