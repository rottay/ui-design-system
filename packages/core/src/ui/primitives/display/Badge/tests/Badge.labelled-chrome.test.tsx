/**
 * @fileoverview Regression coverage for WO-ENG-13.
 * A Badge given `children` and no separate `content`/`count`/`dot` has no
 * indicator value to position over an anchor -- children is the badge's own
 * label and must paint the same chrome as each engine's standalone/tag path.
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import ModernBadge from '../engines/modern';
import { Badge } from '..';
import { renderWithEngine, STABLE_ENGINES } from '../../../../../tooling/testing/helpers/engine';

const LONG_LABEL = 'A very long status label that must never wrap or overflow its container';

function paintedBadge(node: HTMLElement, engine: string): HTMLElement {
  return engine === 'modern'
    ? (node.closest('.rottay-badge') as HTMLElement)
    : node;
}

describe('Badge labelled children paint chrome on every engine (WO-ENG-13)', () => {
  it.each(STABLE_ENGINES)('%s engine paints a background for children with no content/count', async (engine) => {
    const { findByText } = renderWithEngine(<Badge variant="success">Ready</Badge>, engine);
    const label = await findByText('Ready');
    const el = paintedBadge(label, engine);

    // modern/rustic paint the chrome from engines/*/skin/badge.css, keyed on the
    // stamps; the engine's job there is to RESOLVE the treatment and say so in the
    // DOM. classic is the Ant Design wrapper -- unmigrated, still inline.
    if (engine === 'classic') {
      expect(el.style.backgroundColor).not.toBe('');
      expect(el.style.backgroundColor).not.toBe('transparent');
    } else if (engine === 'rustic') {
      // rustic threads its fill through the `--ds-badge-bg` hatch.
      expect(el.style.getPropertyValue('--ds-badge-soft-bg')).not.toBe('');
      expect(el.getAttribute('data-badge-style')).toBe('soft');
    } else {
      expect(el.getAttribute('data-variant')).toBe('success');
      expect(el.getAttribute('data-badge-style')).toBe('soft');
      expect(el.className).toContain('rottay-badge');
    }
  });

  it.each(STABLE_ENGINES)('%s engine clips a long label with the ENG-09 guard', async (engine) => {
    const { findByText } = renderWithEngine(<Badge variant="info">{LONG_LABEL}</Badge>, engine);
    const label = await findByText(LONG_LABEL);
    const el = paintedBadge(label, engine);

    if (engine === 'modern') {
      expect(el).toHaveAttribute('data-truncate', 'true');
      expect(label).toHaveAttribute('data-part', 'label');
    } else {
      expect(el.style.overflow).toBe('hidden');
      expect(el.style.textOverflow).toBe('ellipsis');
      expect(el.style.whiteSpace).toBe('nowrap');
      expect(el.style.maxWidth).toBe('100%');
    }
  });

  it.each(STABLE_ENGINES)('%s engine renders through a single labelled span, not a bare wrapper div', async (engine) => {
    const { findByText, container } = renderWithEngine(<Badge variant="success">Ready</Badge>, engine);
    await findByText('Ready');

    // Every engine's labelled-badge path is a single inline element (span);
    // none of them should leave a chrome-less wrapper div around the label.
    const bareDivs = Array.from(container.querySelectorAll('div')).filter(
      (div) => div.textContent === 'Ready'
    );
    expect(bareDivs).toHaveLength(0);
  });
});

describe('Badge numeric and indicator semantics stay untouched on every engine (WO-ENG-13)', () => {
  it.each(STABLE_ENGINES)('%s engine hides count=0 unless showZero, with children present', async (engine) => {
    const { findByText, queryByText } = renderWithEngine(
      <Badge count={0}>
        <span>Inbox</span>
      </Badge>,
      engine
    );

    await findByText('Inbox');
    expect(queryByText('0')).not.toBeInTheDocument();
  });

  it.each(STABLE_ENGINES)('%s engine shows count=0 when showZero is set, with children present', async (engine) => {
    const { findByText } = renderWithEngine(
      <Badge count={0} showZero>
        <span>Inbox</span>
      </Badge>,
      engine
    );

    await findByText('0');
    await findByText('Inbox');
  });

  it.each(STABLE_ENGINES)('%s engine still positions dot over a real anchor child, unaffected by the label fix', async (engine) => {
    const { findByText, queryByText } = renderWithEngine(
      <Badge dot variant="warning">
        <span>Anchor</span>
      </Badge>,
      engine
    );

    await findByText('Anchor');
    expect(queryByText('Ready')).not.toBeInTheDocument();
  });

  it.each(STABLE_ENGINES)('%s engine shows a non-empty string content positioned over a real anchor child', async (engine) => {
    const { findByText } = renderWithEngine(
      <Badge content="Beta">
        <span>Anchor</span>
      </Badge>,
      engine
    );

    await findByText('Beta');
    await findByText('Anchor');
  });
});

describe('Modern Badge - implementation-level routing detail (WO-ENG-13)', () => {
  it('renders through the standalone tag markup, not a bare anchor-only div', () => {
    const { container } = render(<ModernBadge variant="success">Ready</ModernBadge>);
    const label = screen.getByText('Ready');
    const el = label.closest('.rottay-badge') as HTMLElement;

    expect(el.tagName).toBe('SPAN');
    expect(el.className).toContain('rottay-badge--modern');
    expect(container.querySelector('div')).toBeNull();
  });
});

describe('Badge defaults to soft; the count/dot indicator stays solid (WO-ENG-15)', () => {
  it.each(STABLE_ENGINES)('%s engine defaults a labelled badge to the soft (tinted) treatment', async (engine) => {
    const { findByText } = renderWithEngine(<Badge variant="success">Ready</Badge>, engine);
    const label = await findByText('Ready');
    const el = paintedBadge(label, engine);

    // The soft tint lives in engines/*/skin/badge.css, keyed on this pair; what the
    // ENGINE decides -- and what this test exists to pin -- is that a LABELLED badge
    // resolves to `soft` while an indicator stays `solid`. classic is unmigrated.
    if (engine === 'classic') {
      expect(el.style.backgroundColor).toBe('var(--ds-color-alpha-success-10)');
    } else if (engine === 'rustic') {
      expect(el.style.getPropertyValue('--ds-badge-soft-bg')).toBe('var(--ds-color-alpha-success-10)');
    } else {
      expect(el.getAttribute('data-badge-style')).toBe('soft');
      expect(el.getAttribute('data-variant')).toBe('success');
    }
    // The soft text color is the darker -700 shade (matching the modern engine's
    // softColor token), not the solid fill color -- the solid token is tuned for
    // white text on top of it at full opacity, not for use as small text on its
    // own low-opacity tint.
    if (engine === 'classic') {
      expect(el.style.color).toBe('var(--ds-color-success-700)');
    }
  });

  it.each(STABLE_ENGINES)('%s engine still produces the saturated solid fill when badgeStyle="solid" is explicit', async (engine) => {
    const { findByText } = renderWithEngine(
      <Badge variant="success" badgeStyle="solid">Ready</Badge>,
      engine
    );
    const label = await findByText('Ready');
    const el = paintedBadge(label, engine);

    // An EXPLICIT badgeStyle always wins over the labelled default. classic paints
    // it inline; modern/rustic stamp the resolved treatment and the skin fills it.
    if (engine === 'classic') {
      expect(el.style.backgroundColor).not.toBe('');
      expect(el.style.backgroundColor).not.toBe('transparent');
    } else {
      expect(el.getAttribute('data-badge-style')).toBe('solid');
      expect(el.getAttribute('data-variant')).toBe('success');
    }
    expect(el.style.backgroundColor).not.toBe('var(--ds-color-alpha-success-10)');
  });

  it.each(STABLE_ENGINES)('%s engine keeps an indicator positioned over a real anchor solid by default, unaffected by the label soft default', async (engine) => {
    const { findByText } = renderWithEngine(
      <Badge content="Beta" variant="success">
        <span>Anchor</span>
      </Badge>,
      engine
    );
    const indicator = await findByText('Beta');

    expect(indicator.style.backgroundColor).not.toBe('var(--ds-color-alpha-success-10)');
  });

  it('modern engine keeps a count indicator solid by default at the implementation level', () => {
    render(
      <ModernBadge count={5} variant="success">
        <span>Anchor</span>
      </ModernBadge>
    );
    const indicator = screen.getByText('5');

    // The indicator's solid fill is the skin's, keyed on the treatment the engine
    // resolves: an INDICATOR stays solid even though a LABELLED badge defaults soft.
    expect(indicator.getAttribute('data-badge-style')).toBe('solid');
    expect(indicator.getAttribute('data-variant')).toBe('success');
    expect(indicator.style.backgroundColor).not.toBe('var(--ds-color-alpha-success-10)');
  });
});
