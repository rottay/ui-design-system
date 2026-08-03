'use client';
import React from 'react';
import type { DecisionPanoramaProps } from '../../contracts';
import { DecisionPanoramaEngine } from '../foundation';

/**
 * Modern engine for the DecisionPanorama pattern.
 *
 * The anatomy is the shared foundation engine; the `ds-engine-modern` scope
 * class mirrors the family idiom (RecordFacts/DecisionComparison) so
 * modern-only remediation can layer over the shared presentation skin
 * without touching classic/rustic paint.
 */
export default function ModernDecisionPanorama(props: DecisionPanoramaProps): React.ReactElement {
  const { className, ...rest } = props;
  return (
    <DecisionPanoramaEngine
      {...rest}
      className={['ds-engine-modern', className].filter(Boolean).join(' ')}
    />
  );
}
