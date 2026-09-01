import React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import ModernSkeleton from '../engines/modern';

const lines = (container: HTMLElement) =>
  container.querySelectorAll('[data-part="line"]');

describe('Skeleton modern engine -- paragraph row count', () => {
  it('renders no lines when paragraph declares zero rows', () => {
    const { container } = render(<ModernSkeleton paragraph={{ rows: 0 }} />);

    expect(lines(container)).toHaveLength(0);
  });

  it('renders the explicit row count a paragraph object declares', () => {
    const { container } = render(<ModernSkeleton paragraph={{ rows: 5 }} />);

    expect(lines(container)).toHaveLength(5);
  });

  it('falls back to the rows prop when the paragraph object omits rows', () => {
    const { container } = render(<ModernSkeleton paragraph={{}} rows={4} />);

    expect(lines(container)).toHaveLength(4);
  });
});
