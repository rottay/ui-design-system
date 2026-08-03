'use client';

import React from 'react';
import type { DecisionComparisonProps } from '../../contracts';
import { DecisionComparisonEngine } from '../foundation';

/**
 * Modern engine for the DecisionComparison pattern.
 *
 * The anatomy is the shared foundation engine; the modern differentiation is
 * the `ds-engine-modern` scope class that lets modern-only refinements layer
 * over the shared presentation skin without touching classic/rustic paint.
 */
export default function ModernDecisionComparison(
  props: DecisionComparisonProps
): React.ReactElement {
  const { className, ...rest } = props;
  return (
    <DecisionComparisonEngine
      {...rest}
      className={['ds-engine-modern', className].filter(Boolean).join(' ')}
    />
  );
}
