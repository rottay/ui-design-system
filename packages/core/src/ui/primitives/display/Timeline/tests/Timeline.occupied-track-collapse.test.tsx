import React from 'react';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import ModernTimeline, { Item as ModernTimelineItem } from '../engines/modern';

// The item grid is `1fr | dot | 1fr`, so a single-sided timeline must collapse the
// unoccupied track instead of paying for an empty half-measure column.

const SKIN = readFileSync(
  join(
    dirname(fileURLToPath(import.meta.url)),
    '../../../../../foundation/tokens/css/runtime/engines/modern/skin/timeline.css'
  ),
  'utf8'
);

function root(container: HTMLElement): HTMLElement {
  return container.querySelector('[data-part="root"]') as HTMLElement;
}

describe('Timeline modern — occupied-track collapse', () => {
  it('publishes a single occupied side for the left default and for right mode', () => {
    const { container, rerender } = render(
      <ModernTimeline>
        <ModernTimelineItem>One</ModernTimelineItem>
        <ModernTimelineItem>Two</ModernTimelineItem>
      </ModernTimeline>
    );
    expect(root(container)).toHaveAttribute('data-sides', 'start');

    rerender(
      <ModernTimeline mode="right">
        <ModernTimelineItem>One</ModernTimelineItem>
        <ModernTimelineItem>Two</ModernTimelineItem>
      </ModernTimeline>
    );
    expect(root(container)).toHaveAttribute('data-sides', 'end');
  });

  it('keeps both tracks live when alternate mode or a position override occupies them', () => {
    const { container, rerender } = render(
      <ModernTimeline mode="alternate">
        <ModernTimelineItem>One</ModernTimelineItem>
        <ModernTimelineItem>Two</ModernTimelineItem>
      </ModernTimeline>
    );
    expect(root(container)).toHaveAttribute('data-sides', 'both');

    // A single override inside an otherwise single-sided timeline is enough to
    // make the opposite track load-bearing: the collapse must stand down.
    rerender(
      <ModernTimeline mode="left">
        <ModernTimelineItem>One</ModernTimelineItem>
        <ModernTimelineItem position="right">Two</ModernTimelineItem>
      </ModernTimeline>
    );
    expect(root(container)).toHaveAttribute('data-sides', 'both');
  });

  it('reads the sides from the items prop as well as from children', () => {
    const { container } = render(
      <ModernTimeline
        mode="alternate"
        items={[{ children: 'One' }, { children: 'Two', position: 'left' }]}
      />
    );
    // alternate would place index 1 on `end`; the override pulls it back to
    // `start`, so only one track is occupied.
    expect(root(container)).toHaveAttribute('data-sides', 'start');
  });

  it('places the pending row on the mode’s next side and counts it as occupied', () => {
    const { container, rerender } = render(
      <ModernTimeline mode="right" pending="Deploying…">
        <ModernTimelineItem>One</ModernTimelineItem>
      </ModernTimeline>
    );
    const pending = container.querySelector('[data-part="item"][data-pending="true"]');
    expect(pending).toHaveAttribute('data-side', 'end');
    expect(pending?.querySelector('[data-part="content"]')).toHaveAttribute('data-side', 'end');
    expect(root(container)).toHaveAttribute('data-sides', 'end');

    // In alternate mode the pending row continues the alternation instead of
    // resetting it: one real row (start) hands the live edge to `end`.
    rerender(
      <ModernTimeline mode="alternate" pending="Deploying…">
        <ModernTimelineItem>One</ModernTimelineItem>
      </ModernTimeline>
    );
    expect(
      container.querySelector('[data-part="item"][data-pending="true"]')
    ).toHaveAttribute('data-side', 'end');

    // A lone pending row in `left` mode is the only occupant of the start track.
    rerender(<ModernTimeline pending="Deploying…" />);
    expect(root(container)).toHaveAttribute('data-sides', 'start');
  });

  it('closes the rail seam between the last row and the pending row', () => {
    const { container } = render(
      <ModernTimeline pending="Deploying…">
        <ModernTimelineItem>One</ModernTimelineItem>
        <ModernTimelineItem>Two</ModernTimelineItem>
      </ModernTimeline>
    );
    const rows = container.querySelectorAll('[data-part="item"]:not([data-pending])');
    // The live edge is a seam like any other: the last real row keeps its
    // trailing half-rail so the line does not break above the pending node.
    expect(rows[1].querySelector('[data-part="connector"][data-edge="trailing"]')).not.toBeNull();
  });

  it('collapses the dead track in the skin and folds two-sided rows in a narrow container', () => {
    expect(SKIN).toMatch(
      /\[data-part='root'\]\[data-sides='start'\][^{]*\{\s*grid-template-columns:\s*minmax\(0,\s*1fr\)\s+auto\s+0;/
    );
    expect(SKIN).toMatch(
      /\[data-part='root'\]\[data-sides='end'\][^{]*\{\s*grid-template-columns:\s*0\s+auto\s+minmax\(0,\s*1fr\);/
    );
    // The fold measures the family's own box, so a narrow rail folds on desktop.
    expect(SKIN).toMatch(/\[data-part='root'\]\s*\{[^}]*container-type:\s*inline-size/);
    expect(SKIN).toMatch(/@container \(max-width: 30rem\)/);
    const fold = SKIN.slice(SKIN.indexOf('@container (max-width: 30rem)'));
    expect(fold).toMatch(
      /\[data-sides='both'\][^{]*\[data-part='item'\]\s*\{\s*grid-template-columns:\s*0\s+auto\s+minmax\(0,\s*1fr\);/
    );
    expect(fold).toMatch(
      /\[data-sides='both'\][^{]*\[data-side='start'\]\s*\{[^}]*grid-area:\s*1\s*\/\s*3\s*\/\s*4\s*\/\s*4;[^}]*text-align:\s*start/
    );
  });
});
