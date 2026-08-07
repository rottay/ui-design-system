import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernPageShell from '../engines/modern';
import type { PageShellProps } from '../contracts';
import skinStyles from '../../../../../foundation/tokens/css/runtime/engines/modern/skin/page-shell.css?raw';

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
  it('reflows the loading skeleton into the loaded narrow order instead of shrinking it', () => {
    const { container } = render(<ModernPageShell {...buildProps({ loading: true })} />);

    // The skeleton mirrors the requested anatomy in both postures.
    expect(container.querySelector('[data-part="skeleton-title-copy"]')).not.toBeNull();
    expect(container.querySelector('[data-part="skeleton-action-row"]')).not.toBeNull();
    expect(container.querySelector('[data-part="skeleton"][data-block="metadata"]')).not.toBeNull();

    // Before: the ≤640px block never mentioned the skeleton, so the desktop
    // two-column row survived — the title bar shrank to a stub beside the
    // action blocks and the reserved actions sat a row above the loaded ones.
    expect(NARROW_BLOCK).toContain("[data-part='skeleton-title-row']");
    expect(NARROW_BLOCK).toContain("[data-part='skeleton-title-copy'] {\n    display: contents;");
    expect(NARROW_BLOCK).toContain("[data-part='skeleton-action-row'] {\n    order: 3;");
    expect(NARROW_BLOCK).toContain("[data-part='skeleton'][data-block='metadata'] {\n    order: 4;");
  });

  it('retires the register seam once the title column dissolves', () => {
    // The seam is authored for the title column only...
    expect(skinStyles).toContain(
      "[data-part='metadata'] {\n  border-top: var(--ds-edge-hairline-width, 1px) solid",
    );
    // ...so at the width where `titles` becomes display: contents it must not
    // survive as a full-header rule beneath the actions cluster.
    expect(NARROW_BLOCK).toContain("[data-part='metadata'] {\n    padding-block-start: 0;");
    expect(NARROW_BLOCK).toContain('border-block-start-width: 0;');
  });

  it('lets the composed ghost Button own every back-control state', () => {
    const { container } = render(<ModernPageShell {...buildProps()} />);
    const back = container.querySelector('[data-part="back"] > .rottay-button');

    expect(back).not.toBeNull();
    expect(back).toHaveAttribute('data-variant', 'ghost');

    // Before: the shell repainted rest/hover/focus at (0,4,0)/(0,5,0) from the
    // raw neutral ramp, so `--ds-button-ghost-*` was inert on this one control
    // and the unqualified `:focus` left the treatment stuck after a click.
    expect(skinStyles).not.toContain("[data-part='back'] > .rottay-button:hover");
    expect(skinStyles).not.toContain("[data-part='back'] > .rottay-button:focus");
    expect(skinStyles).toContain(
      "[data-part='back'] > .rottay-button {\n  flex-shrink: 0;\n}",
    );
  });
});
