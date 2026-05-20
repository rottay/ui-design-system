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
      data-title={title}
    >
      {children}
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
});
