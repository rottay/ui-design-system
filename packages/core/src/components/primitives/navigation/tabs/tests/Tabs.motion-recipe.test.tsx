import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ModernTabs from '../engines/modern';
import RusticTabs from '../engines/rustic';
import { MotionProvider } from '@/infrastructure/runtime/motion';

const items = [
  { key: 'a', label: 'Alpha', children: <div>alpha body</div> },
  { key: 'b', label: 'Beta', children: <div>beta body</div> },
];

function rootOf(container: HTMLElement, engine: 'modern' | 'rustic'): HTMLElement {
  const root = container.querySelector(`.rottay-tabs--${engine}`);
  expect(root).not.toBeNull();
  return root as HTMLElement;
}

describe('Tabs state.change motion recipe', () => {
  it('modern stamps motion preference independently from its visual recipe', () => {
    const { container } = render(<ModernTabs items={items} />);
    const root = rootOf(container, 'modern');

    expect(root).toHaveAttribute('data-recipe', 'underline');
    expect(root).toHaveAttribute('data-recipe-state', 'animated');
    expect(root).not.toHaveAttribute('data-motion-final');
    expect(root.style.getPropertyValue('--ds-recipe-enter')).not.toBe('0ms');

    const panel = container.querySelector('[data-part="tab-panel"]') as HTMLElement;
    // Static animation belongs to the Tabs skin, not per-instance inline paint.
    expect(panel.style.animation).toBe('');
  });

  it('rustic stamps the animated recipe contract on its root', () => {
    const { container } = render(<RusticTabs items={items} />);
    const root = rootOf(container, 'rustic');

    expect(root).toHaveAttribute('data-recipe', 'state.change');
    expect(root).toHaveAttribute('data-recipe-state', 'animated');
    expect(root.style.getPropertyValue('--ds-recipe-enter')).not.toBe('0ms');

    const panel = container.querySelector('[data-part="tab-panel"]') as HTMLElement;
    expect(panel.style.animation).toContain('ds-tabs-fade-in');
    expect(panel.style.animation).toContain('var(--ds-recipe-enter');
  });

  it.each([
    ['modern', ModernTabs],
    ['rustic', RusticTabs],
  ] as const)('%s engine declares NO panel animation under reduced motion', (engine, Engine) => {
    const { container } = render(
      <MotionProvider reducedMotion>
        <Engine items={items} />
      </MotionProvider>
    );
    const root = rootOf(container, engine);

    expect(root).toHaveAttribute('data-recipe-state', 'final');
    expect(root.style.getPropertyValue('--ds-recipe-enter')).toBe('0ms');
    if (engine === 'modern') {
      expect(root).toHaveAttribute('data-motion-final', 'true');
    }

    const panel = container.querySelector('[data-part="tab-panel"]') as HTMLElement;
    expect(panel.style.animation).toBe('');
  });
});
