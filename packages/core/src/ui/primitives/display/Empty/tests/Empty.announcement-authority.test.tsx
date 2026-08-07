/**
 * The announcement contract is a DEFAULT, not a stamp.
 *
 * `role` and `aria-live` used to be written after the caller passthrough
 * spread, so a placeholder rendered inside a container that already announces
 * its own "no results" summary announced twice with no way to opt out.
 */

import React from 'react';
import { describe, expect, it } from 'vitest';

import ModernEmpty from '../engines/modern';
import { renderWithEngine } from '@/tooling/testing/helpers/engine';

const rootOf = (container: HTMLElement) =>
  container.querySelector<HTMLElement>('.rottay-empty--modern')!;

describe('Empty announcement authority', () => {
  it('announces politely by default', () => {
    const { container } = renderWithEngine(<ModernEmpty />, 'modern');
    const root = rootOf(container);

    expect(root).toHaveAttribute('role', 'status');
    expect(root).toHaveAttribute('aria-live', 'polite');
  });

  it('lets a caller silence the region with aria-live while keeping the role', () => {
    const { container } = renderWithEngine(<ModernEmpty aria-live="off" />, 'modern');
    const root = rootOf(container);

    expect(root).toHaveAttribute('aria-live', 'off');
    // An explicit `off` overrides the politeness `role="status"` only implies,
    // so the semantic role survives without announcing.
    expect(root).toHaveAttribute('role', 'status');
  });

  it('drops the implied politeness when the caller re-roles the region', () => {
    const { container } = renderWithEngine(
      <ModernEmpty role="presentation" />,
      'modern',
    );
    const root = rootOf(container);

    expect(root).toHaveAttribute('role', 'presentation');
    // The whole point: re-roling must actually silence it. Keeping `polite`
    // here would leave it a live region regardless of the role.
    expect(root).not.toHaveAttribute('aria-live');
  });

  it('never contradicts an assertive role with polite politeness', () => {
    const { container } = renderWithEngine(<ModernEmpty role="alert" />, 'modern');
    const root = rootOf(container);

    expect(root).toHaveAttribute('role', 'alert');
    expect(root).not.toHaveAttribute('aria-live', 'polite');
  });

  it('honours both together when the caller supplies both', () => {
    const { container } = renderWithEngine(
      <ModernEmpty role="region" aria-live="assertive" aria-label="Results" />,
      'modern',
    );
    const root = rootOf(container);

    expect(root).toHaveAttribute('role', 'region');
    expect(root).toHaveAttribute('aria-live', 'assertive');
    expect(root).toHaveAttribute('aria-label', 'Results');
  });

  it('keeps the skin contract winning over the passthrough', () => {
    // Pass-through is for caller semantics, not for the anatomy the skin
    // selects on: `data-image` stays engine-owned while `data-part` is the one
    // documented override.
    const { container } = renderWithEngine(
      <ModernEmpty
        image="simple"
        role="presentation"
        data-part="placeholder"
        {...({ 'data-image': 'hijacked' } as Record<string, string>)}
      />,
      'modern',
    );
    const root = rootOf(container);

    expect(root).toHaveAttribute('data-part', 'placeholder');
    expect(root).toHaveAttribute('data-image', 'simple');
  });
});
