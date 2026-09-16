/**
 * The `table-rows` mode: a loading state that lives inside a `tbody`, where a
 * wrapper element is not valid HTML. The rows ARE the skeleton.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { AnatomySkeleton } from '../../../index';

function rows(node: React.ReactElement): HTMLElement {
  const { container } = render(
    <table>
      <tbody data-testid="body">{node}</tbody>
    </table>,
  );
  return container.querySelector('[data-testid="body"]') as HTMLElement;
}

describe('AnatomySkeleton table-rows mode', () => {
  it('renders tr/td/span rows that a tbody admits, never a wrapper element', () => {
    const body = rows(<AnatomySkeleton mode="table-rows" rowCount={3} cells={[{}, {}]} />);
    expect(body.querySelectorAll(':scope > div')).toHaveLength(0);
    const placeholders = body.querySelectorAll('tr[data-part="skeleton-row"]');
    expect(placeholders).toHaveLength(3);
    for (const row of placeholders) {
      expect(row.querySelectorAll('td[data-part="skeleton-cell"]')).toHaveLength(2);
      expect(row.querySelectorAll('span[data-part="skeleton-bar"]')).toHaveLength(2);
    }
  });

  it('stamps the three anatomy parts the table family pins', () => {
    const body = rows(<AnatomySkeleton mode="table-rows" rowCount={1} cells={[{ kind: 'control' }, {}]} />);
    expect(body.querySelector('[data-part="skeleton-row"]')).not.toBeNull();
    expect(body.querySelector('[data-part="skeleton-cell"]')).not.toBeNull();
    expect(body.querySelector('[data-part="skeleton-bar"]')).not.toBeNull();
    // A control well says so, so the skin can draw it square.
    expect(body.querySelector('[data-part="skeleton-cell"][data-kind="control"]')).not.toBeNull();
  });

  it('announces no aria-busy of its own: the host owns the single one', () => {
    const markup = renderToStaticMarkup(
      <table>
        <tbody aria-busy="true">
          <AnatomySkeleton mode="table-rows" rowCount={2} cells={[{}]} />
        </tbody>
      </table>,
    );
    expect(markup.match(/aria-busy/gu)).toHaveLength(1);
  });

  it('hides every placeholder row, so the row count is never read as data', () => {
    const body = rows(<AnatomySkeleton mode="table-rows" rowCount={4} cells={[{}]} />);
    for (const row of body.querySelectorAll('tr')) {
      expect(row).toHaveAttribute('aria-hidden', 'true');
    }
    expect(screen.queryAllByRole('row')).toHaveLength(0);
  });

  it('carries the shared motion vocabulary, so reduced motion is handled once', () => {
    const body = rows(<AnatomySkeleton mode="table-rows" rowCount={1} cells={[{}]} />);
    const row = body.querySelector('tr[data-part="skeleton-row"]')!;
    expect(row.className).toContain('ds-skeleton-anatomy-rows');
    expect(row).toHaveAttribute('data-loading', 'true');
    expect(row).toHaveAttribute('data-animation');
  });

  it('holds a static surface when the animation is switched off', () => {
    const body = rows(<AnatomySkeleton mode="table-rows" rowCount={1} cells={[{}]} animation={false} />);
    const row = body.querySelector('tr[data-part="skeleton-row"]')!;
    expect(row.getAttribute('data-animation')).toBeNull();
  });

  it('settles: loading=false stops the loop the skin gates on', () => {
    const body = rows(<AnatomySkeleton mode="table-rows" rowCount={1} cells={[{}]} loading={false} />);
    expect(body.querySelector('tr[data-part="skeleton-row"]')).toHaveAttribute('data-loading', 'false');
  });

  it('defaults to one cell and four rows when the host states neither', () => {
    const body = rows(<AnatomySkeleton mode="table-rows" />);
    expect(body.querySelectorAll('tr[data-part="skeleton-row"]')).toHaveLength(4);
    expect(body.querySelectorAll('td[data-part="skeleton-cell"]')).toHaveLength(4);
  });
});
