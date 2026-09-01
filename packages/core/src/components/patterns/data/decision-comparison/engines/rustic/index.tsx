'use client';

import React from 'react';
import type { DecisionComparisonProps } from '../../contracts';
import { DecisionComparisonEngine } from '../foundation';

export default function RusticDecisionComparison(
  props: DecisionComparisonProps
): React.ReactElement {
  return <DecisionComparisonEngine {...props} />;
}
