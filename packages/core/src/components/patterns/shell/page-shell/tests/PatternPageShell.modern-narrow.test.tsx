import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernPageShell from '../engines/modern';
import type { PageShellProps } from '../contracts';
import skinStyles from '../../../../../foundation/tokens/css/runtime/engines/modern/skin/page-shell/index.css?raw';

/** The ≤640px container posture, isolated from the rest of the skin. */
const NARROW_BLOCK = skinStyles.slice(
  skinStyles.indexOf('@container ds-page (max-width: 640px)'),
  skinStyles.indexOf('@media (hover: none), (pointer: coarse)'),
);

function buildProps(overrides: Partial<PageShellProps> = {}): PageShellProps {
  return {
    title: 'Launchpad',
    subtitle: 'Ready for launch',
    metadata: <span>12 items</span>,
    actions: <button type="button">Create</button>,
    children: <div>Fallback content</div>,
    back: { onClick: vi.fn() },
    ...overrides,
  };
}

describe('PatternPageShell modern — narrow posture and composed back control', () => {
  it('needs no second narrow posture for the wait, because the wait is the header', () => {
    const { container } = render(<ModernPageShell {...buildProps({ loading: true })} />);

    // The stand-in is the loaded header itself, under the shared renderer, so
    // the ≤640px reorder below applies to it unchanged.
    const source = container.querySelector('[data-part="source"]') as HTMLElement;
    expect(source.querySelector('[data-part="title"]')).not.toBeNull();
    expect(source.querySelector('[data-part="subtitle"]')).not.toBeNull();
    expect(source.querySelector('[data-part="caption"]')).not.toBeNull();
    expect(source.querySelector('[data-part="actions"]')).not.toBeNull();

    // Before: a hand-made skeleton tree with its OWN ≤640px reorder rules,
    // which is the drift the shared renderer exists to make impossible.
    const rules = skinStyles.replace(/\/\*[\s\S]*?\*\//g, '');
    expect(NARROW_BLOCK).not.toContain("[data-part='skeleton");
    expect(rules).not.toContain("[data-part='skeleton");
  });

  it('retires the register seam once the title column dissolves', () => {
    // The seam is authored for the title column only...
    expect(skinStyles).toContain(
      "[data-part='caption'] {\n  border-top: var(--ds-edge-hairline-width, 1px) solid",
    );
    // ...so at the width where `titles` becomes display: contents it must not
    // survive as a full-header rule beneath the actions cluster.
    expect(NARROW_BLOCK).toContain("[data-part='caption'] {\n    padding-block-start: 0;");
    expect(NARROW_BLOCK).toContain('border-block-start-width: 0;');
  });

  it('lets the composed ghost Button own every back-control state', () => {
    const { container } = render(<ModernPageShell {...buildProps()} />);
    const back = container.querySelector('[data-part="back"] > .ds-button');

    expect(back).not.toBeNull();
    expect(back).toHaveAttribute('data-variant', 'ghost');

    // Before: the shell repainted rest/hover/focus at (0,4,0)/(0,5,0) from the
    // raw neutral ramp, so `--ds-button-ghost-*` was inert on this one control
    // and the unqualified `:focus` left the treatment stuck after a click.
    expect(skinStyles).not.toContain("[data-part='back'] > .ds-button:hover");
    expect(skinStyles).not.toContain("[data-part='back'] > .ds-button:focus");
    expect(skinStyles).toContain(
      "[data-part='back'] > .ds-button {\n  flex-shrink: 0;\n}",
    );
  });
});
