import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DecisionPanoramaEngine } from '../engines/shared';

describe('DecisionPanorama anatomy', () => {
  it('keeps context, identity, decision and actions inside one labelled instrument', () => {
    const { container } = render(
      <DecisionPanoramaEngine
        ariaLabel="Active decision panorama"
        contextLabel="Immediate context"
        contextFacts={[
          {
            key: 'location',
            icon: <span>◎</span>,
            label: 'Location',
            value: 'Buenos Aires',
            supporting: 'GMT−3',
          },
          {
            key: 'availability',
            label: 'Availability',
            value: 'Within 30 days',
          },
        ]}
        identityEyebrow="Verified record"
        identityVisual={<span>portrait</span>}
        title="Alex Morgan"
        subtitle="Product systems lead"
        badges={<span>Available</span>}
        decisionLabel="Active decision"
        decisionTitle="Advance"
        decisionScore="92"
        decisionSummary="Five of six signals are verified."
        decisionProgress={<span>Four of five stages</span>}
        decisionMeta={<span>Next milestone tomorrow</span>}
        actions={<button type="button">Prepare review</button>}
      />
    );

    const root = screen.getByRole('region', { name: 'Active decision panorama' });
    expect(root).toHaveAttribute('data-part', 'root');
    expect(root).toHaveAttribute('data-loading', 'false');
    expect(container.querySelectorAll('[data-part="fact"]')).toHaveLength(2);
    expect(within(root).getByText('Alex Morgan')).toBeInTheDocument();
    expect(within(root).getByText('92')).toBeInTheDocument();
    expect(within(root).getByRole('button', { name: 'Prepare review' })).toBeInTheDocument();

    const grid = container.querySelector('[data-part="grid"]');
    expect(grid?.children[0]).toHaveAttribute('data-part', 'context');
    expect(grid?.children[1]).toHaveAttribute('data-part', 'identity');
    expect(grid?.children[2]).toHaveAttribute('data-part', 'decision');
    expect(container.querySelector('[data-part="actions"]')).toBeInTheDocument();
  });

  it('preserves loading, class and caller style contracts', () => {
    render(
      <DecisionPanoramaEngine
        title="Record"
        loading
        className="consumer-class"
        style={{ minHeight: 320 }}
      />
    );

    const root = document.querySelector('.ds-pattern-decision-panorama');
    expect(root).toHaveClass('consumer-class');
    expect(root).toHaveAttribute('data-loading', 'true');
    expect(root).toHaveStyle({ minHeight: '320px' });
  });
});
