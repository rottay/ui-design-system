import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';
import { waitFor } from '@testing-library/react';

import { renderWithEngine } from '../../../../../_internal/testing/helpers/engine-test-utils';
import { LoadingOverlay } from '..';

const ENGINES = ['modern', 'rustic'] as const;
const SOURCE = readFileSync(
  'src/components/structures/feedback/loading-overlay/index.tsx',
  'utf8',
);

describe('LoadingOverlay inert pre-step contract', () => {
  it('pins the five inline paints and both embedded transform declarations', () => {
    expect(SOURCE).toContain("background: 'var(--ds-color-bg-primary, rgba(15,23,42,0.85))'");
    expect(SOURCE).toContain("backdropFilter: 'blur(2px)'");
    expect(SOURCE).toContain("borderRadius: 'inherit'");
    expect(SOURCE.match(/color: 'var\(--ds-color-text-muted\)'/g)).toHaveLength(2);
    expect(SOURCE).toContain('0%, 100% { opacity: 0.4; transform: scale(1); }');
    expect(SOURCE).toContain('50% { opacity: 1; transform: scale(1.08); }');
  });

  it.each(ENGINES)('renders nothing when hidden (%s)', (engine) => {
    const { container } = renderWithEngine(
      <LoadingOverlay visible={false} message="Syncing records" />,
      engine,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it.each(ENGINES)('pins anatomy and every current paint channel (%s)', async (engine) => {
    const { container } = renderWithEngine(
      <LoadingOverlay
        visible
        message="Syncing records"
        logo={<span data-testid="consumer-logo">RT</span>}
      />,
      engine,
    );

    await waitFor(() => {
      expect(container.querySelector('[data-part="root"]')).not.toBeNull();
    });
    const root = container.querySelector<HTMLElement>('[data-part="root"]');
    expect(root).not.toBeNull();
    expect(root).toHaveClass('ds-loading-overlay');

    const logo = container.querySelector<HTMLElement>('[data-part="logo"]');
    expect(logo).not.toBeNull();
    expect(logo).toContainElement(container.querySelector('[data-testid="consumer-logo"]'));

    const message = container.querySelector<HTMLElement>('[data-part="message"]');
    expect(message).toHaveTextContent('Syncing records');

    const dots = container.querySelectorAll<HTMLElement>('[data-part="dot"]');
    expect(dots).toHaveLength(3);

    const style = container.querySelector('style');
    expect(style).not.toBeNull();
    expect(style?.textContent).toContain('@keyframes lo-pulse');
    expect(style?.textContent).toContain('transform: scale(1.08)');
    expect(style?.textContent).toContain('@keyframes lo-dots');
  });
});
