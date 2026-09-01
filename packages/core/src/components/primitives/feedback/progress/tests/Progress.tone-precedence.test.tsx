/**
 * Progress `tone` precedence -- real-engine coverage (design 2.8, TAX-SIZE-TONE).
 *
 * Renders the actual classic/modern/rustic engines directly (no factory mock,
 * unlike Progress.test.tsx) so the assertions exercise the real
 * `tone ? TONE_TO_PROGRESS_STATUS[tone] : status` resolution inside each
 * engine. Per-engine DOM targets:
 * - classic: forwards the resolved status to AntD's `status` prop (`'error'`
 *   renders as AntD's own `'exception'` terminology), which produces the
 *   stable `ant-progress-status-{status}` class AntD has used across major
 *   versions for exactly this kind of external CSS/test targeting.
 * - modern/rustic: the DS stamps `data-status` on the root directly (no
 *   third-party class-name dependency).
 */
import React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import ClassicProgress from '../engines/classic';
import ModernProgress from '../engines/modern';
import RusticProgress from '../engines/rustic';

describe('Progress tone precedence (real engines)', () => {
  it('classic: tone alone resolves to the mapped AntD status class', () => {
    const { container } = render(<ClassicProgress percent={50} tone="danger" />);
    expect(container.querySelector('.ant-progress-status-exception')).not.toBeNull();
  });

  it('classic: tone overrides status\'s color implication when both are given', () => {
    const { container } = render(<ClassicProgress percent={50} tone="danger" status="success" />);
    expect(container.querySelector('.ant-progress-status-exception')).not.toBeNull();
    expect(container.querySelector('.ant-progress-status-success')).toBeNull();
  });

  it('classic: falls back to status when tone is not given', () => {
    const { container } = render(<ClassicProgress percent={50} status="success" />);
    expect(container.querySelector('.ant-progress-status-success')).not.toBeNull();
  });

  it('modern: tone alone resolves via data-status', () => {
    const { container } = render(<ModernProgress percent={50} tone="danger" />);
    expect(container.querySelector('[data-status="error"]')).not.toBeNull();
  });

  it('modern: tone overrides status\'s color implication when both are given', () => {
    const { container } = render(<ModernProgress percent={50} tone="danger" status="success" />);
    expect(container.querySelector('[data-status="error"]')).not.toBeNull();
  });

  it('modern: falls back to status when tone is not given', () => {
    const { container } = render(<ModernProgress percent={50} status="success" />);
    expect(container.querySelector('[data-status="success"]')).not.toBeNull();
  });

  it('rustic: tone alone resolves via data-status', () => {
    const { container } = render(<RusticProgress percent={50} tone="danger" />);
    expect(container.querySelector('[data-status="error"]')).not.toBeNull();
  });

  it('rustic: tone overrides status\'s color implication when both are given', () => {
    const { container } = render(<RusticProgress percent={50} tone="danger" status="success" />);
    expect(container.querySelector('[data-status="error"]')).not.toBeNull();
  });

  it('rustic: falls back to status when tone is not given', () => {
    const { container } = render(<RusticProgress percent={50} status="success" />);
    expect(container.querySelector('[data-status="success"]')).not.toBeNull();
  });

  it('rustic circle: carries a localized accessible name including the percent', () => {
    const { container } = render(<RusticProgress percent={65} type="circle" />);
    const root = container.querySelector('[role="progressbar"]');
    // Same catalog contract as the modern engine (components.progress.*).
    expect(root?.getAttribute('aria-label')).toBe('65% complete');
  });
});
