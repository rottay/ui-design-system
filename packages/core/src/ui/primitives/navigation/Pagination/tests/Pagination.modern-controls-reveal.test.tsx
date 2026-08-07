import React from 'react';
import { act, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import ModernPagination from '../engines/modern';
import { renderWithEngine } from '../../../../../tooling/testing/helpers/engine';

/**
 * The joined controls row is an inline-axis scrollport (`overflow-x: auto` in
 * the modern skin), so a page change has to bring the current page button back
 * inside it. The engine used to do that with `scrollIntoView({ block:
 * 'nearest', inline: 'nearest' })`, which walks the WHOLE ancestor chain:
 * `'nearest'` minimises each individual scroll but does not confine the
 * operation to one element, so paging inside a scrolling page moved the page.
 *
 * jsdom implements neither layout nor `scrollIntoView`, so both are modelled
 * explicitly: rects come from a stubbed `getBoundingClientRect`, and
 * `scrollIntoView` is installed as a spy that also mutates an ancestor the way
 * a real one would.
 */

const PAGE_ROW_LEFT = 0;
const PAGE_ROW_RIGHT = 200;
/** The current page button sits 60px past the row's inline end. */
const CURRENT_BUTTON_LEFT = 240;
const CURRENT_BUTTON_RIGHT = 260;

const realScrollIntoView = Element.prototype.scrollIntoView;
const realGetBoundingClientRect = Element.prototype.getBoundingClientRect;

/** Records the page offset a real `scrollIntoView` would have produced. */
let ancestorScrollTop = 0;

function rect(left: number, right: number): DOMRect {
  return {
    left,
    right,
    top: 0,
    bottom: 32,
    width: right - left,
    height: 32,
    x: left,
    y: 0,
    toJSON: () => ({}),
  } as DOMRect;
}

beforeEach(() => {
  ancestorScrollTop = 0;
  Element.prototype.scrollIntoView = vi.fn(function scrollIntoView(this: Element) {
    // Model the platform: a real scrollIntoView scrolls scrollable ANCESTORS
    // and the document, not just the element's own scrollport.
    ancestorScrollTop = 512;
  }) as Element['scrollIntoView'];

  Element.prototype.getBoundingClientRect = function stubbed(this: Element): DOMRect {
    if (this.getAttribute?.('data-part') === 'pagination-controls') {
      return rect(PAGE_ROW_LEFT, PAGE_ROW_RIGHT);
    }
    if (this.getAttribute?.('data-current') === 'true') {
      return rect(CURRENT_BUTTON_LEFT, CURRENT_BUTTON_RIGHT);
    }
    return rect(0, 0);
  };
});

afterEach(() => {
  if (realScrollIntoView === undefined) {
    delete (Element.prototype as Partial<Element>).scrollIntoView;
  } else {
    Element.prototype.scrollIntoView = realScrollIntoView;
  }
  Element.prototype.getBoundingClientRect = realGetBoundingClientRect;
  vi.restoreAllMocks();
});

const Controlled = ({ start }: { start: number }) => {
  const [page, setPage] = React.useState(start);
  return (
    <ModernPagination current={page} total={200} pageSize={10} onChange={(next) => setPage(next)} />
  );
};

describe('Modern Pagination current-page reveal', () => {
  it('never calls scrollIntoView, so no ancestor or document offset moves', async () => {
    await act(async () => {
      renderWithEngine(<Controlled start={12} />, 'modern');
    });

    const next = screen.getByRole('button', { name: 'Next' });
    await act(async () => {
      next.click();
    });

    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
    expect(ancestorScrollTop).toBe(0);
  });

  it('reveals the off-edge current page by writing only the controls row scrollLeft', async () => {
    await act(async () => {
      renderWithEngine(<Controlled start={12} />, 'modern');
    });

    const row = document.querySelector<HTMLElement>('[data-part="pagination-controls"]');
    expect(row).not.toBeNull();
    row!.scrollLeft = 0;

    const next = screen.getByRole('button', { name: 'Next' });
    await act(async () => {
      next.click();
    });

    // The button ends 60px past the row's visible inline end, so the row and
    // only the row absorbs exactly that delta.
    expect(row!.scrollLeft).toBe(CURRENT_BUTTON_RIGHT - PAGE_ROW_RIGHT);
    // The block axis is not a scrollport this control offers the user, and a
    // clipped box is still programmatically scrollable — it must stay put.
    expect(row!.scrollTop).toBe(0);
  });
});
