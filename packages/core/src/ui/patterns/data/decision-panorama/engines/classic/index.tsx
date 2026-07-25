'use client';
import React from 'react';
import type { DecisionPanoramaProps } from '../../contracts';
import { DecisionPanoramaEngine } from '../shared';
export default function ClassicDecisionPanorama(props: DecisionPanoramaProps): React.ReactElement {
  return <DecisionPanoramaEngine {...props} />;
}
