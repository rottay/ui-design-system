import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';
import { waitFor } from '@testing-library/react';

import { renderWithEngine } from '../../../../../tooling/testing/helpers/engine';
import { LoadingOverlay } from '..';

const ENGINES = ['modern', 'rustic'] as const;
const SOURCE = readFileSync(
  'src/ui/structures/feedback/loading-overlay/index.tsx',
  'utf8',
);
const SKIN = readFileSync(
  'src/foundation/tokens/css/presentation/components/skin/loading-overlay.css',
  'utf8',
);

describe('LoadingOverlay skin contract', () => {
  it('moves the five static paints and both complete keyframes out of runtime markup', () => {
    expect(SOURCE).not.toContain("background: 'var(--ds-color-bg-primary, rgba(15,23,42,0.85))'");
    expect(SOURCE).not.toContain("backdropFilter: 'blur(2px)'");
    expect(SOURCE).not.toContain("borderRadius: 'inherit'");
    expect(SOURCE).not.toContain("color: 'var(--ds-color-text-muted)'");
    expect(SOURCE).not.toContain('@keyframes lo-');
    expect(SOURCE).toContain('ds-loading-overlay-pulse 1.8s ease-in-out infinite');
    expect(SOURCE).toContain('ds-loading-overlay-dots 1.4s ease-in-out');

    expect(SKIN).toContain('background: var(--ds-color-bg-primary, rgba(15,23,42,0.85));');
    expect(SKIN).toContain('backdrop-filter: blur(2px);');
    expect(SKIN).toContain('border-radius: inherit;');
    expect(SKIN.match(/color: var\(--ds-color-text-muted\);/g)).toHaveLength(1);
    expect(SKIN).toContain('@keyframes ds-loading-overlay-pulse');
    expect(SKIN).toContain('0%, 100% { opacity: 0.4; transform: scale(1); }');
    expect(SKIN).toContain('50% { opacity: 1; transform: scale(1.08); }');
    expect(SKIN).toContain('@keyframes ds-loading-overlay-dots');
  });

  it.each(ENGINES)('renders nothing when hidden (%s)', (engine) => {
    const { container } = renderWithEngine(
      <LoadingOverlay visible={false} message="Syncing records" />,
      engine,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it.each(['modern'] as const)('pins anatomy and every current paint channel (%s)', async (engine) => {
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

    expect(container.querySelector('style')).toBeNull();
  });
});
