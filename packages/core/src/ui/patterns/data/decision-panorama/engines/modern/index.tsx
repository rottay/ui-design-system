'use client';
import React from 'react';
import type { DecisionPanoramaProps } from '../../contracts';
import { DecisionPanoramaEngine } from '../foundation';
export default function ModernDecisionPanorama(props: DecisionPanoramaProps): React.ReactElement {
  return <DecisionPanoramaEngine {...props} />;
}
