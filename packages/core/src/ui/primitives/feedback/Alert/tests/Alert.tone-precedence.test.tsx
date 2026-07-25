/**
 * Alert `tone` precedence -- real-engine coverage (design 2.8, TAX-SIZE-TONE).
 *
 * Renders the actual classic/modern/rustic engines directly (no factory mock,
 * unlike Alert.test.tsx) so the assertions exercise the real
 * `tone ? TONE_TO_ALERT_TYPE[tone] : type` resolution inside each engine, not
 * a synthetic stand-in. Per-engine DOM targets:
 * - classic: forwards the resolved type straight to AntD's `type` prop,
 *   which renders the stable `ant-alert-{type}` class AntD has used across
 *   major versions for exactly this kind of external CSS/test targeting.
 * - modern/rustic: the DS stamps `data-tone` on the root directly (no
 *   third-party class-name dependency).
 */
import React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import ClassicAlert from '../engines/classic';
import ModernAlert from '../engines/modern';
import RusticAlert from '../engines/rustic';
import { renderWithEngine } from '@/tooling/testing/helpers/engine';

describe('Alert tone precedence (real engines)', () => {
  it('classic: tone alone resolves to the mapped AntD type class', () => {
    const { container } = render(<ClassicAlert message="m" tone="danger" />);
    expect(container.querySelector('.ant-alert-error')).not.toBeNull();
  });

  it('classic: tone overrides the deprecated type prop when both are given', () => {
    const { container } = render(<ClassicAlert message="m" tone="danger" type="info" />);
    expect(container.querySelector('.ant-alert-error')).not.toBeNull();
    expect(container.querySelector('.ant-alert-info')).toBeNull();
  });

  it('classic: falls back to type when tone is not given', () => {
    const { container } = render(<ClassicAlert message="m" type="warning" />);
    expect(container.querySelector('.ant-alert-warning')).not.toBeNull();
  });

  it('modern: tone alone resolves via data-tone', () => {
    const { container } = renderWithEngine(<ModernAlert message="m" tone="danger" />, 'modern');
    expect(container.querySelector('[data-tone="error"]')).not.toBeNull();
  });

  it('modern: tone overrides the deprecated type prop when both are given', () => {
    const { container } = renderWithEngine(
      <ModernAlert message="m" tone="danger" type="info" />,
      'modern',
    );
    expect(container.querySelector('[data-tone="error"]')).not.toBeNull();
  });

  it('modern: falls back to type when tone is not given', () => {
    const { container } = renderWithEngine(<ModernAlert message="m" type="warning" />, 'modern');
    expect(container.querySelector('[data-tone="warning"]')).not.toBeNull();
  });

  it('modern: exposes premium anatomy, semantic icons, and localized close control', () => {
    const { container } = renderWithEngine(
      <ModernAlert message="Decision ready" description="Evidence is complete" closable />,
      'modern',
    );

    const root = container.querySelector('[data-part="root"]');
    expect(root).toHaveAttribute('role', 'alert');
    expect(root).toHaveAttribute('data-has-icon', 'true');
    expect(root).toHaveAttribute('data-has-description', 'true');
    expect(root).toHaveAttribute('data-closable', 'true');
    expect(container.querySelector('[data-icon-name="status.info"]')).not.toBeNull();
    expect(container.querySelector('[data-part="content"]')).not.toBeNull();
    expect(container.querySelector('[data-icon-name="action.close"]')).not.toBeNull();
    expect(container.querySelector('button[type="button"]')).not.toBeNull();
  });

  it('rustic: tone alone resolves via data-tone', () => {
    const { container } = render(<RusticAlert message="m" tone="danger" />);
    expect(container.querySelector('[data-tone="error"]')).not.toBeNull();
  });

  it('rustic: tone overrides the deprecated type prop when both are given', () => {
    const { container } = render(<RusticAlert message="m" tone="danger" type="info" />);
    expect(container.querySelector('[data-tone="error"]')).not.toBeNull();
  });

  it('rustic: falls back to type when tone is not given', () => {
    const { container } = render(<RusticAlert message="m" type="warning" />);
    expect(container.querySelector('[data-tone="warning"]')).not.toBeNull();
  });
});
