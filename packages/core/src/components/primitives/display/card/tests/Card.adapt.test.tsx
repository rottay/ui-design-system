/**
 * The card's adapt slot: the resting cover position and padding are the
 * base, the posture in force is stamped, and only the delta declared for that
 * posture moves the stamped anatomy.
 */
import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ModernCard from '../engines/modern';

type Posture = 'phone' | 'tablet' | 'desktop';

const renderCard = (props: React.ComponentProps<typeof ModernCard>) =>
  render(
    <ModernCard cover="/c.jpg" coverPosition="start" {...props}>
      Body
    </ModernCard>,
  ).container.querySelector('.ds-card--modern[data-part="root"]') as HTMLElement;

const postureInForce = (): Posture => renderCard({}).getAttribute('data-posture')!.split(' ')[0] as Posture;

describe('the card adapt slot', () => {
  it('keeps the declared cover position and padding and stamps the postures in force when nothing is adapted', () => {
    const card = renderCard({ padding: 'sm' });
    expect(card).toHaveAttribute('data-cover-position', 'start');
    expect(card).toHaveAttribute('data-padding', 'sm');
    expect(card.getAttribute('data-posture')).toMatch(/^(phone|tablet|desktop)( (compact|regular|expanded))?$/);
  });

  it('applies the delta declared for the posture in force and ignores the others', () => {
    const posture = postureInForce();
    const others = (['phone', 'tablet', 'desktop'] as const).filter((name) => name !== posture);
    const adapted = renderCard({ adapt: { [posture]: { coverPosition: 'top', padding: 'lg' } } });
    expect(adapted).toHaveAttribute('data-cover-position', 'top');
    expect(adapted).toHaveAttribute('data-padding', 'lg');
    const ignored = renderCard({ adapt: Object.fromEntries(others.map((name) => [name, { coverPosition: 'top', padding: 'lg' }])) });
    expect(ignored).toHaveAttribute('data-cover-position', 'start');
    expect(ignored).toHaveAttribute('data-padding', 'md');
  });

  it('moves the cover to the adapted side of the body', () => {
    const posture = postureInForce();
    const card = renderCard({ adapt: { [posture]: { coverPosition: 'bottom' } } });
    expect(card.lastElementChild).toHaveAttribute('data-part', 'cover');
    expect(card.firstElementChild).toHaveAttribute('data-part', 'body');
  });
});
