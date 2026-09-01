import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ModernButton from '../engines/modern';
import RusticButton from '../engines/rustic';
import { MotionProvider } from '@/infrastructure/runtime/motion';

describe('Button feedback.press motion recipe', () => {
  it.each([
    ['modern', ModernButton],
    ['rustic', RusticButton],
  ] as const)('%s engine stamps the animated recipe contract on its root', (_engine, Engine) => {
    render(<Engine>Press me</Engine>);
    const button = screen.getByRole('button', { name: 'Press me' });

    expect(button).toHaveAttribute('data-recipe', 'feedback.press');
    expect(button).toHaveAttribute('data-recipe-state', 'animated');
    expect(button.style.getPropertyValue('--ds-recipe-enter')).not.toBe('0ms');
    expect(button.style.getPropertyValue('--ds-recipe-enter')).toMatch(/ms$/);
    expect(Number(button.style.getPropertyValue('--ds-recipe-scale-from'))).toBeLessThan(1);
  });

  it.each([
    ['modern', ModernButton],
    ['rustic', RusticButton],
  ] as const)('%s engine renders the settled final state under reduced motion', (_engine, Engine) => {
    render(
      <MotionProvider reducedMotion>
        <Engine>Press me</Engine>
      </MotionProvider>
    );
    const button = screen.getByRole('button', { name: 'Press me' });

    // final-state contract: the skin's [data-recipe-state='final'] rule drops
    // the transition and the settled variables paint no press displacement
    expect(button).toHaveAttribute('data-recipe-state', 'final');
    expect(button.style.getPropertyValue('--ds-recipe-enter')).toBe('0ms');
    expect(button.style.getPropertyValue('--ds-recipe-scale-from')).toBe('1');
  });

  it('keeps caller inline style precedence over the recipe variables', () => {
    render(<ModernButton style={{ opacity: 0.5 }}>Styled</ModernButton>);
    const button = screen.getByRole('button', { name: 'Styled' });
    expect(button.style.opacity).toBe('0.5');
    expect(button.style.getPropertyValue('--ds-recipe-enter')).toMatch(/ms$/);
  });
});
