import React, { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';

import {
  ActionAddIcon,
  ActionEditIcon,
  FoundationIcon,
  NavigationForwardIcon,
  StatusSuccessIcon,
} from '../../generated/packs/foundation';
import { BithireIcon } from '../../generated/packs/bithire';

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

    expect(renderToStaticMarkup(React.createElement(ActionEditIcon, {}))).toBe('');
    expect(renderToStaticMarkup(React.createElement(ActionEditIcon, {
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

  it('renders through bounded foundation and BitHire dynamic components and rejects unknown names', () => {
    const foundation = renderToStaticMarkup(
      <FoundationIcon name="action.add" label="Add" />,
    );
    const bithire = renderToStaticMarkup(
      <BithireIcon name="bithire.candidate" label="Candidate" />,
    );
    const unknown = renderToStaticMarkup(
      React.createElement(FoundationIcon, { name: 'bithire.candidate', decorative: true }),
    );

    expect(foundation).toContain('data-icon-name="action.add"');
    expect(bithire).toContain('data-icon-name="bithire.candidate"');
    expect(unknown).toBe('');
  });
});
