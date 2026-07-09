import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('antd', () => ({
  Tooltip: ({ children, classNames, styles, title }: any) => (
    <div
      data-body-max-width={String(styles?.body?.maxWidth)}
      data-body-overflow-wrap={styles?.body?.overflowWrap}
      data-body-white-space={styles?.body?.whiteSpace}
      data-root-class={classNames?.root}
      data-root-style-color={styles?.root?.color}
      data-title={typeof title === 'string' ? title : undefined}
    >
      {children}
      {/* title can be a composite element (see `shortcut` prop) -- render it
          for real so tests can query its content, not just a string attribute. */}
      <div data-testid="antd-title-slot">{title}</div>
    </div>
  ),
}));

import ClassicTooltip from '../engines/classic';

describe('ClassicTooltip', () => {
  it('applies maxWidth and wrapping styles to the AntD tooltip body', () => {
    render(
      <ClassicTooltip
        className="custom-tooltip"
        content="Open this row to inspect the complete operational context before making a decision."
        maxWidth={260}
        style={{ color: 'red' }}
      >
        <button>Action</button>
      </ClassicTooltip>,
    );

    const wrapper = screen.getByText('Action').parentElement;
    expect(wrapper).toHaveAttribute('data-body-max-width', '260');
    expect(wrapper).toHaveAttribute('data-body-white-space', 'normal');
    expect(wrapper).toHaveAttribute('data-body-overflow-wrap', 'anywhere');
    expect(wrapper).toHaveAttribute('data-root-class', 'custom-tooltip');
    expect(wrapper).toHaveAttribute('data-root-style-color', 'red');
  });

  it('uses the shared tooltip default maxWidth', () => {
    render(
      <ClassicTooltip content="Default width">
        <button>Default action</button>
      </ClassicTooltip>,
    );

    const wrapper = screen.getByText('Default action').parentElement;
    expect(wrapper).toHaveAttribute('data-body-max-width', '300');
  });

  it('renders formatted key chips alongside content when shortcut is set', () => {
    render(
      <ClassicTooltip content="Open command palette" shortcut="ctrl+k">
        <button>Open</button>
      </ClassicTooltip>,
    );

    const slot = screen.getByTestId('antd-title-slot');
    expect(slot).toHaveTextContent('Open command palette');
    // formatShortcutKey renders platform-appropriate symbols (Ctrl or the
    // Mac control glyph) plus the letter -- assert on the letter segment,
    // which is stable across platforms.
    expect(slot).toHaveTextContent('K');
  });

  it('renders content alone (no chip markup) when shortcut is omitted', () => {
    render(
      <ClassicTooltip content="Plain tooltip">
        <button>Action</button>
      </ClassicTooltip>,
    );

    const slot = screen.getByTestId('antd-title-slot');
    expect(slot.querySelector('kbd')).toBeNull();
  });
});
