'use client';
import React from 'react';
import type { DecisionPanoramaProps } from '../../contracts';
import { DecisionPanoramaEngine } from '../foundation';
export default function RusticDecisionPanorama(props: DecisionPanoramaProps): React.ReactElement {
  return <DecisionPanoramaEngine {...props} />;
}
