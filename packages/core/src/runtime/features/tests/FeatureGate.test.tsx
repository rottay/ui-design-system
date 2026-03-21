import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { FeatureProvider } from '../FeatureProvider';
import { FeatureGate } from '../FeatureGate';

describe('FeatureGate', () => {
  it('renders children when any requested feature is enabled by default', () => {
    render(
      <FeatureProvider features={['analytics', 'reports']}>
        <FeatureGate feature={['analytics', 'billing']}>
          <div>Enabled content</div>
        </FeatureGate>
      </FeatureProvider>
    );

    expect(screen.getByText('Enabled content')).toBeInTheDocument();
  });

  it('requires all features when mode is all and falls back otherwise', () => {
    render(
      <FeatureProvider features={['analytics']}>
        <FeatureGate feature={['analytics', 'billing']} mode="all" fallback={<div>Upgrade</div>}>
          <div>Premium content</div>
        </FeatureGate>
      </FeatureProvider>
    );

    expect(screen.queryByText('Premium content')).not.toBeInTheDocument();
    expect(screen.getByText('Upgrade')).toBeInTheDocument();
  });
});
