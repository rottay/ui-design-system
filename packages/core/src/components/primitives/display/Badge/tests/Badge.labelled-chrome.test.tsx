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
import { Badge } from '../';
import { renderWithEngine, STABLE_ENGINES } from '../../../../../_internal/testing/helpers/engine-test-utils';

const LONG_LABEL = 'A very long status label that must never wrap or overflow its container';

describe('Badge labelled children paint chrome on every engine (WO-ENG-13)', () => {
  it.each(STABLE_ENGINES)('%s engine paints a background for children with no content/count', async (engine) => {
    const { findByText } = renderWithEngine(<Badge variant="success">Ready</Badge>, engine);
    const el = await findByText('Ready');

    expect(el.style.backgroundColor).not.toBe('');
    expect(el.style.backgroundColor).not.toBe('transparent');
  });

  it.each(STABLE_ENGINES)('%s engine clips a long label with the ENG-09 guard', async (engine) => {
    const { findByText } = renderWithEngine(<Badge variant="info">{LONG_LABEL}</Badge>, engine);
    const el = await findByText(LONG_LABEL);

    expect(el.style.overflow).toBe('hidden');
    expect(el.style.textOverflow).toBe('ellipsis');
    expect(el.style.whiteSpace).toBe('nowrap');
    expect(el.style.maxWidth).toBe('100%');
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
    const el = screen.getByText('Ready');

    expect(el.tagName).toBe('SPAN');
    expect(el.className).toContain('rottay-badge--modern');
    expect(container.querySelector('div')).toBeNull();
  });
});
