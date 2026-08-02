import React, { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';

import {
  ActionAddIcon,
  ActionEditIcon,
  FoundationIcon,
  NavigationForwardIcon,
  StatusSuccessIcon,
} from '@/graphics/icons/presentation/semantic/generated/packs/foundation';
import { BithireIcon } from '@/graphics/icons/presentation/semantic/generated/packs/bithire';
import { IdentityIcon } from '@/graphics/icons/presentation/semantic/generated/packs/identity';
import { IntelligenceIcon } from '@/graphics/icons/presentation/semantic/generated/packs/intelligence';
import { OperationsIcon } from '@/graphics/icons/presentation/semantic/generated/packs/operations';

/**
 * A generated icon reached through hostile runtime input.
 *
 * `SemanticIconProps` is discriminated so exactly one of `label` /
 * `decorative` is required, and each generated pack narrows `name` to its own
 * corpus. The cases below deliberately supply shapes the contract forbids --
 * neither a11y mode, both modes, a name from another pack -- because the
 * assertion IS that the icon fails closed for the JavaScript callers who can
 * still produce them. The cast is the assertion, not a way around the contract.
 */
const unsafeIcon = (Component: unknown) =>
  Component as React.ComponentType<Record<string, unknown>>;

describe('generated semantic icon runtime', () => {
  it('server-renders named and decorative roles through the same explicit a11y contract', () => {
    const named = renderToStaticMarkup(<ActionAddIcon label=" Add item " />);
    const decorative = renderToStaticMarkup(<ActionAddIcon decorative />);

    expect(named).toContain('role="img"');
    expect(named).toContain('aria-label="Add item"');
    expect(named).toContain('<title>Add item</title>');
    expect(named).toContain('data-icon-name="action.add"');
    expect(named).not.toContain('aria-hidden="true"');

    expect(decorative).toContain('aria-hidden="true"');
    expect(decorative).not.toContain('aria-label=');
    expect(decorative).not.toContain('<title>');
  });

  it('fails closed when hostile runtime input supplies neither or both a11y modes', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    expect(renderToStaticMarkup(React.createElement(unsafeIcon(ActionEditIcon), {}))).toBe('');
    expect(renderToStaticMarkup(React.createElement(unsafeIcon(ActionEditIcon), {
      label: 'Edit',
      decorative: true,
    }))).toBe('');
    expect(warning).toHaveBeenCalledTimes(2);

    warning.mockRestore();
  });

  it('applies authored defaults and bounded role, tone, state, size, and data overrides', () => {
    const ref = createRef<SVGSVGElement>();
    const { rerender } = render(
      <StatusSuccessIcon ref={ref} data-testid="semantic" decorative />,
    );

    const initial = screen.getByTestId('semantic');
    expect(ref.current).toBeInstanceOf(SVGSVGElement);
    expect(initial).toHaveAttribute('data-icon-role', 'status');
    expect(initial).toHaveAttribute('data-icon-state', 'idle');
    expect(initial).toHaveAttribute('data-icon-tone', 'success');
    expect(initial).toHaveAttribute('data-icon-weight', 'duotone');
    expect(initial).toHaveAttribute('width', 'var(--ds-icon-md-size, 1.25rem)');

    rerender(
      <StatusSuccessIcon
        role="feature"
        state="active"
        tone="primary"
        size="xl"
        data-testid="semantic"
        decorative
      />,
    );
    const overridden = screen.getByTestId('semantic');
    expect(overridden).toHaveAttribute('data-icon-role', 'feature');
    expect(overridden).toHaveAttribute('data-icon-state', 'active');
    expect(overridden).toHaveAttribute('data-icon-tone', 'primary');
    expect(overridden).toHaveAttribute('data-icon-weight', 'fill');
    expect(overridden).toHaveAttribute('width', 'var(--ds-icon-xl-size, 2rem)');
  });

  it('preserves logical RTL metadata and explicit physical mirroring', () => {
    const { rerender } = render(
      <NavigationForwardIcon data-testid="direction" decorative />,
    );

    expect(screen.getByTestId('direction')).toHaveAttribute('data-icon-mirrored', 'auto');
    expect(screen.getByTestId('direction')).not.toHaveAttribute('transform');

    rerender(<NavigationForwardIcon mirrored data-testid="direction" decorative />);
    expect(screen.getByTestId('direction')).toHaveAttribute('data-icon-mirrored', 'true');
    expect(screen.getByTestId('direction')).toHaveAttribute('transform', 'scale(-1, 1)');
  });

  it('renders through bounded dynamic pack components and rejects cross-pack names', () => {
    const foundation = renderToStaticMarkup(
      <FoundationIcon name="action.add" label="Add" />,
    );
    const bithire = renderToStaticMarkup(
      <BithireIcon name="bithire.candidate" label="Candidate" />,
    );
    const identity = renderToStaticMarkup(
      <IdentityIcon name="security.alert" label="Security alert" />,
    );
    const intelligence = renderToStaticMarkup(
      <IntelligenceIcon name="ai.agent" label="AI agent" />,
    );
    const operations = renderToStaticMarkup(
      <OperationsIcon name="workflow.branch" label="Workflow branch" />,
    );
    const unknown = renderToStaticMarkup(
      React.createElement(unsafeIcon(FoundationIcon), {
        name: 'bithire.candidate',
        decorative: true,
      }),
    );

    expect(foundation).toContain('data-icon-name="action.add"');
    expect(bithire).toContain('data-icon-name="bithire.candidate"');
    expect(identity).toContain('data-icon-name="security.alert"');
    expect(intelligence).toContain('data-icon-name="ai.agent"');
    expect(operations).toContain('data-icon-name="workflow.branch"');
    expect(unknown).toBe('');
  });
});
